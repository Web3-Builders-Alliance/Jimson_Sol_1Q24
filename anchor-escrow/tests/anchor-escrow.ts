import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorEscrow } from "../target/types/anchor_escrow";


import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";


import { before } from "mocha";
import { min } from "bn.js";
import { randomBytes } from "crypto";

describe("escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.Escrow as Program<AnchorEscrow>;
  const maker = Keypair.generate();
  const taker = Keypair.generate();
  const connection = program.provider.connection;
  const amountX = new anchor.BN(100 * LAMPORTS_PER_SOL);
  const amountY = new anchor.BN(100 * LAMPORTS_PER_SOL);

  let seed = new anchor.BN(randomBytes(8));
  let escrow = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      maker.publicKey.toBuffer(),
      seed.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  )[0];

  let mintX = Keypair.generate();
  let mintY = Keypair.generate();
  const makerAtaX = getAssociatedTokenAddressSync(
    mintX.publicKey,
    maker.publicKey
  );
  const makerAtaY = getAssociatedTokenAddressSync(
    mintY.publicKey,
    maker.publicKey
  );
  const takerAtaX = getAssociatedTokenAddressSync(
    mintX.publicKey,
    taker.publicKey
  );
  const takerAtaY = getAssociatedTokenAddressSync(
    mintY.publicKey,
    taker.publicKey
  );
  let escrowAtaX = getAssociatedTokenAddressSync(mintX.publicKey, escrow, true);

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  it("Airdrop", async () => {
    await Promise.all([
      await connection
        .requestAirdrop(maker.publicKey, LAMPORTS_PER_SOL * 10)
        .then(confirm),
      await connection
        .requestAirdrop(taker.publicKey, LAMPORTS_PER_SOL * 10)
        .then(confirm),
    ]);
  });

  it("Setup mint", async () => {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    let tx = new Transaction();
    tx.instructions = [
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: provider.publicKey,
        newAccountPubkey: mintX.publicKey,
        lamports,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: provider.publicKey,
        newAccountPubkey: mintY.publicKey,
        lamports,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mintX.publicKey,
        6,
        maker.publicKey,
        null
      ),
      createInitializeMint2Instruction(
        mintY.publicKey,
        6,
        taker.publicKey,
        null
      ),
      createAssociatedTokenAccountIdempotentInstruction(
        provider.publicKey,
        makerAtaX,
        maker.publicKey,
        mintX.publicKey
      ),
      createAssociatedTokenAccountIdempotentInstruction(
        provider.publicKey,
        takerAtaY,
        taker.publicKey,
        mintY.publicKey
      ),
      createMintToInstruction(
        mintX.publicKey,
        makerAtaX,
        maker.publicKey,
        1000e9
      ),
      createMintToInstruction(
        mintY.publicKey,
        takerAtaY,
        taker.publicKey,
        1000e9
      ),
    ];

    try {
      await provider.sendAndConfirm(tx, [mintX, mintY, maker, taker]).then(log);
    } catch (error) {
      console.log(error);
    }
  });

  it("make", async () => {
    await program.methods
      .make(seed, amountX, amountX)
      .accounts({
        maker: maker.publicKey,
        escrow,
        mint_x: mintX.publicKey,
        mint_y: mintY.publicKey,
      escrowAtaX,
      maker_ata_x: makerAtaX,
      maker_ata_y: makerAtaY,
      associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
      token_program: TOKEN_PROGRAM_ID,
      system_program: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(log);
  });

  it("take", async () => {
    await program.methods
      .take()
      .accounts({
        taker: taker.publicKey,
        maker: maker.publicKey,
        escrow,
        mint_x: mintX.publicKey,
        mint_y: mintY.publicKey,
       escrowAtaX,
       taker_ata_x: takerAtaX,
       taker_ata_y: takerAtaY,
       maker_ata_y: makerAtaY,
       associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
       token_program: TOKEN_PROGRAM_ID,
       system_program: anchor.web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc()
      .then(confirm)
      .then(log);
  });

  it("refund", async () => {
    seed = new anchor.BN(randomBytes(8));
    escrow = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        maker.publicKey.toBuffer(),
        seed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];
    escrowAtaX = getAssociatedTokenAddressSync(mintX.publicKey, escrow, true);

    await program.methods
      .make(seed, amountX, amountY)
      .accounts({
        maker: maker.publicKey,
        escrow,
        mint_x: mintX.publicKey,
        mint_y: mintY.publicKey,
        escrowAtaX,
        maker_ata_x: makerAtaX,
        maker_ata_y: makerAtaY,
        associated_token_program: ASSOCIATED_TOKEN_PROGRAM_ID,
        token_program: TOKEN_PROGRAM_ID,
        system_program: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);

    await program.methods
      .refund()
      .accounts({
        maker: maker.publicKey,
        mint_x: mintX.publicKey,
        mint_y: mintY.publicKey,
       escrowAtaX,
       escrow,
       maker_ata_x: makerAtaX,
      //  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        token_program: TOKEN_PROGRAM_ID,
        //systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log);
  });
});