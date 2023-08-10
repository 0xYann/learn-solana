import web3 = require('@solana/web3.js')

async function main() {
    const newKeypair = web3.Keypair.generate()
    console.log(newKeypair.secretKey.toString())
}

main().then(() => {
    console.log("Finished successfully")
}).catch((error) => {
    console.error(error)
})