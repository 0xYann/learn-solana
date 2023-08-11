import web3 from "@solana/web3.js"
import * as borsh from '@project-serum/borsh'
import Dotenv from "dotenv"
Dotenv.config()

const programId = new web3.PublicKey("FXfopKZYWeYmEiG4vr4Eat93SWoC6cwFmfL6WUjJqpyE")

const ticketInstructionLayout = borsh.struct([
    borsh.u8('selector'),
    borsh.u8('id'),
    borsh.publicKey('owner'),
    borsh.str('event'),
    borsh.str('place')
])

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const payer = initializeKeypair()

    await createTicket(connection, payer)
}

function initializeKeypair(): web3.Keypair {
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
    return keypairFromSecretKey
}

async function showTicket(
    connection: web3.Connection,
    payer: web3.Keypair
) {
    let buffer = Buffer.alloc(1000)
    ticketInstructionLayout.encode(
        {
            selector: 0,
            id: 0,
            owner: payer.publicKey,
            event: "Muse openair",
            place: "Sion"
        },
        buffer
    )
    buffer = buffer.subarray(0, ticketInstructionLayout.getSpan(buffer))

    const [pda] = await web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Uint8Array.of(0), Buffer.from("Muse openair")],
        programId
    )

    const tx = new web3.Transaction()
    const instruction = new web3.TransactionInstruction({
        programId: programId,
        data: buffer,
        keys: [
            {
                pubkey: pda,
                isSigner: false,
                isWritable: true
            }
        ]
    })
    tx.add(instruction)
    const txSignature = await web3.sendAndConfirmTransaction(
        connection,
        tx,
        [payer]
    )

    console.log(`Show ticket tx: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`)
}

async function createTicket(
    connection: web3.Connection,
    payer: web3.Keypair
) {
    let buffer = Buffer.alloc(1000)
    ticketInstructionLayout.encode(
        {
            selector: 1,
            id: 1,
            owner: payer.publicKey,
            event: "Muse openair",
            place: "Sion"
        },
        buffer
    )
    buffer = buffer.subarray(0, ticketInstructionLayout.getSpan(buffer))

    const [pda] = await web3.PublicKey.findProgramAddressSync(
        [payer.publicKey.toBuffer(), Uint8Array.of(1), Buffer.from("Muse openair")],
        programId
    )

    const tx = new web3.Transaction()
    const instruction = new web3.TransactionInstruction({
        programId: programId,
        data: buffer,
        keys: [
            {
                pubkey: payer.publicKey,
                isSigner: true,
                isWritable: false
            },
            {
                pubkey: pda,
                isSigner: false,
                isWritable: true
            },
            {
                pubkey: web3.SystemProgram.programId,
                isSigner: false,
                isWritable: false
            }
        ]
    })
    tx.add(instruction)
    const txSignature = await web3.sendAndConfirmTransaction(
        connection,
        tx,
        [payer]
    )

    console.log(`New ticket tx: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`)
}

main().then(() => {
    console.log("Finished successfully")
}).catch((error) => {
    console.error(error);
})