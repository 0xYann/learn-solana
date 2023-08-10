import web3 = require('@solana/web3.js')
import * as token from '@solana/spl-token'
import Dotenv from 'dotenv'
Dotenv.config()

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'))
    const payer = initializeKeypair()

    const mint = await createNewMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        18
    )

    const mintInfo = await token.getMint(connection, mint)

    const tokenAccount = await createTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
    )

    await mintTokens(
        connection,
        payer,
        mint,
        tokenAccount.address,
        payer.publicKey,
        42 * 10 ** mintInfo.decimals
    )

    const receiver = web3.Keypair.generate()
    const receiverTokenAccount = await createTokenAccount(
        connection,
        payer,
        mint,
        receiver.publicKey
    )
    
    await transferTokens(
        connection,
        payer,
        tokenAccount.address,
        receiverTokenAccount.address,
        payer.publicKey,
        21 * 10 ** mintInfo.decimals
    )
}

function initializeKeypair(): web3.Keypair {
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
    return keypairFromSecretKey
}

async function createNewMint(
    connection: web3.Connection,
    payer: web3.Keypair,
    mintAuthority: web3.PublicKey,
    freezeAuthority: web3.PublicKey,
    decimals: number
): Promise<web3.PublicKey> {
    
    const tokenMint = await token.createMint(
        connection,
        payer,
        mintAuthority,
        freezeAuthority,
        decimals
    )

    console.log(`Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`)

    return tokenMint
}

async function createTokenAccount(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    owner: web3.PublicKey
): Promise<token.Account> {

    const associatedToken = token.getAssociatedTokenAddressSync(
        mint,
        owner,
        false,
        new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        new web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    );

    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    let account: token.Account;
    try {
        account = await token.getAccount(connection, associatedToken, 'processed', new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'));
    } catch (error: unknown) {
        // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
        // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
        // TokenInvalidAccountOwnerError in this code path.
        if (error instanceof token.TokenAccountNotFoundError || error instanceof token.TokenInvalidAccountOwnerError) {
            // As this isn't atomic, it's possible others can create associated accounts meanwhile.
            try {
                const transaction = new web3.Transaction().add(
                    token.createAssociatedTokenAccountInstruction(
                        payer.publicKey,
                        associatedToken,
                        owner,
                        mint,
                        new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                        new web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
                    )
                );

                await web3.sendAndConfirmTransaction(connection, transaction, [payer]);
            } catch (error: unknown) {
                // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
                // instruction error if the associated account exists already.
            }

            // Now this should always succeed
            account = await token.getAccount(connection, associatedToken, 'processed', new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'));
        } else {
            throw error;
        }
    }

    if (!account.mint.equals(mint)) throw new token.TokenInvalidMintError();
    if (!account.owner.equals(owner)) throw new token.TokenInvalidOwnerError();

    return account;
}

async function mintTokens(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    destination: web3.PublicKey,
    authority: web3.PublicKey,
    amount: number
) {
    const transactionSignature = await token.mintTo(
        connection,
        payer,
        mint,
        destination,
        authority,
        amount
    )

    console.log(`Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`)
}

async function transferTokens(
    connection: web3.Connection,
    payer: web3.Keypair,
    sender: web3.PublicKey,
    receiver: web3.PublicKey,
    owner: web3.PublicKey,
    amount: number
) {
    const transactionSignature = await token.transfer(
        connection,
        payer,
        sender,
        receiver,
        owner,
        amount
    )

    console.log(`Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`)
}

main().then(() => {
    console.log("Finished successfully")
}).catch((error) => {
    console.error(error);
})