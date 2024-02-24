import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

import wallet from "./dev-wallet.json";

//Import keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a solana devnet connection to devnet SOL tokens
const connection = new Connection("https://api.devnet.solana.com");

const fnn = async () => {
    try {
        //Claiming 2 devnet SOL tokens
        const txhash = await connection.requestAirdrop(keypair.publicKey, 2 * LAMPORTS_PER_SOL);
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
        
    } catch (error) {
        console.error(`Oops, something went wrong: ${error}`)
    }
}
fnn()