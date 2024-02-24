import wallet from "./wallet/wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import base58 from "bs58";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Define our Mint address
const mint = publicKey("EGzQXUVVb2zM8LXDxuUW1oxijShRZPvMHRw3r1S4DCbL")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
    //     // Start here
    //     let accounts: CreateMetadataAccountV3InstructionAccounts = {
    //        mint: mint,
    //        mintAuthority: signer
    //  }

    //     let data: DataV2Args = {
    //         name: "WBA token-Jimson",
    //         symbol: "WBA",
    //         uri: "https://www.jimson.io",
    //         sellerFeeBasisPoints: 500,
    //         creators: null,
    //         collection: null,
    //         uses: null
    //     }

    //     let args: CreateMetadataAccountV3InstructionArgs = {
    //         data,
    //         isMutable: true,
    //         collectionDetails: null
    //     }

    //     let tx = createMetadataAccountV3(
    //         umi,
    //         {
    //             ...accounts,
    //             ...args
    //         }
    //     )

    //     let result = await tx.sendAndConfirm(umi).then(r => r.signature.toString());
    //     console.log(result);
        const encoded = bs58.encode([196,30,46,15,116,104,19,215,98,20,44,193,116,0,118,206,157,197,170,13,156,153,197,41,56,157,82,157,31,29,40,248,106,27,98,253,232,124,242,250,29,98,234,241,235,196,239,209,230,212,96,29,83,102,68,199,109,178,165,195,20,18,201,11]);
        console.log(encoded);
        
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();