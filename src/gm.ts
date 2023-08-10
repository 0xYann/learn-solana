import web3 = require("@solana/web3.js")
import Dotenv from "dotenv"
import { connect } from "http2"
Dotenv.config()

const programId = new web3.PublicKey("MQ84D7RkiiBL6HD7TX4tSVbupYQYpwkXAzhEVhdMHEU")

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const payer = initializeKeypair()

    await gm(connection, payer)
}

function initializeKeypair(): web3.Keypair {
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
    return keypairFromSecretKey
}

async function gm(
    connection: web3.Connection,
    payer: web3.Keypair
) {
    const tx = new web3.Transaction()

    const instruction = new web3.TransactionInstruction({
        keys: [],
        programId
    })

    tx.add(instruction)

    const txSignature = await web3.sendAndConfirmTransaction(
        connection,
        tx,
        [payer]
    )

    console.log(`Gm tx: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`)
}

main().then(() => {
    console.log("Finished successfully")
}).catch((error) => {
    console.error(error);
})