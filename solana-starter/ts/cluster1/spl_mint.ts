import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "./wallet/wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("EGzQXUVVb2zM8LXDxuUW1oxijShRZPvMHRw3r1S4DCbL");

const fnn = async () => {
    try {
        // Create an ATA
         const ata = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey, false)
        console.log(`Your ata is: ${ata.address.toBase58()}`);

        let amount = 10n * token_decimals
        // Mint to ATA
        const mintTx = await mintTo(connection, keypair, mint, ata.address, keypair.publicKey, amount)
         console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
}

fnn()
