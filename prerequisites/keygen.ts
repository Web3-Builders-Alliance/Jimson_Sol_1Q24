import { Keypair } from "@solana/web3.js";


//Generate a new keypair
let kp = Keypair.generate()

console.log(`You've generated a new Solana wallet: PublicKey: ${kp.publicKey.toBase58()} PrivateKey: [${kp.secretKey}]`);
