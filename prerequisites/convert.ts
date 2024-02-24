import bs58 from 'bs58'
import prompt from 'prompt-sync'

// const base58_to_wallet = async () => {
//     try {
//         const promptSync = prompt();
//     const base58 = promptSync('Enter your PK');
//     const wallet = bs58.decode(base58).toString();
//     console.log(wallet);
//     } catch (error) {
//         console.error(error)
//     }
// }

const wallet_to_base58 = async () => {
    try {
        const wallet: number[] = [];
        const base58 = bs58.encode(Buffer.from(wallet)).toString();
        
        console.log(base58);
    
    } catch (error) {
        console.error(error)
    }
}


//base58_to_wallet();

wallet_to_base58();
