import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js";
import wallet from "./dev-wallet.json";


//Import dev wallet keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Define the WBA public key
const WbaPublicKey = new PublicKey("7PSsqiPh7DMPacRJUSkVRUfCciUT4Sr3zGKd516Kosxn");

//Create a Solana devnet connection
const connection = new Connection("https://api.devnet.solana.com");


const transfer = async () => {
    try {

        //Get balance of dev wallet
        const balance = await connection.getBalance(keypair.publicKey);

        //Create a test  transaction to calculate fees
        const transaction = new Transaction()
        //.add(
        //     SystemProgram.transfer({
        //         fromPubkey: keypair.publicKey,
        //         toPubkey: WbaPublicKey,
        //         lamports: balance
        //     })
        // );

        // const transaction = new Transaction().add(
        //     SystemProgram.transfer({
        //         fromPubkey: keypair.publicKey,
        //         toPubkey: WbaPublicKey,
        //         lamports: LAMPORTS_PER_SOL/100,
        //     })
        // );

        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        transaction.feePayer = keypair.publicKey;


        //Calculate exact fee rate to transfer entire SOL amount out of accoutt minus fees
        const fee = (await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')).value || 0;

        transaction.instructions.pop();

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: WbaPublicKey,
                lamports: balance - fee,
            })
        )

        //Sign transaction, broadcast, and confirm
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair]
        );
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        
    } catch (error) {
        console.error(`Oops, something went wrong: ${error}`)
    }
}

transfer()