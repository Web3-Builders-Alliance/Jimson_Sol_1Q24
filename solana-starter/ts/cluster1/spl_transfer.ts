import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "./wallet/wba-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("EGzQXUVVb2zM8LXDxuUW1oxijShRZPvMHRw3r1S4DCbL");

// Recipient address
const to = new PublicKey("8kAcgG1GNJpdg72NK8cJAHHqWSpkJPXpkUrYQ5biANsD");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const ataFrom = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey)

        // Get the token account of the toWallet address, and if it does not exist, create it
        const ataTo = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, to)


        // Transfer the new token to the "toTokenAccount" we just created
        const txid = await transfer(
            connection,
            keypair,
            ataFrom.address,
            ataTo.address,
            keypair.publicKey,
            1_000_000n
        )
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();