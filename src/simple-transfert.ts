import web3 = require('@solana/web3.js')
import Dotenv from 'dotenv'
Dotenv.config()

const PROGRAM_ADDRESS = 'ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa'
const PROGRAM_DATA_ADDRESS = 'Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod'

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const sender = initializeKeypair()
    const receiver = web3.Keypair.generate()
    const amount = web3.LAMPORTS_PER_SOL*1

    // await connection.requestAirdrop(sender.publicKey, amount)
    await printBalances(connection, sender, receiver)
    await transferSol(connection, sender, receiver, amount)
    await printBalances(connection, sender, receiver)
}

function initializeKeypair(): web3.Keypair {
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
    return keypairFromSecretKey
}

async function transferSol(connection: web3.Connection, sender: web3.Keypair, receiver: web3.Keypair, amount: number) {
    const transaction = new web3.Transaction()

    const instruction = web3.SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: receiver.publicKey,
        lamports: amount
    })

    transaction.add(instruction)

    const signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [sender]
    )

    console.log(`You can view your transaction on the Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)
}

async function printBalances(connection: web3.Connection, sender: web3.Keypair, receiver: web3.Keypair) {
    const senderBalance = await connection.getBalance(sender.publicKey)
    const receiverBalance = await connection.getBalance(receiver.publicKey)

    console.log('Sender balance:  ', senderBalance)
    console.log('Receiver balance:', receiverBalance)
}

main().then(() => {
    console.log("Finished successfully")
}).catch((error) => {
    console.error(error);
})