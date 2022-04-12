require("dotenv").config()
const ps = require("prompt-sync")
const prompt = ps()
const ethers = require("ethers")
const network = process.env.NETWORK
const projectID = process.env.PROJECT_ID
const pKey = process.env.SIGNER_PRIVATE_KEY
const walletAddress = process.env.PUBLIC_KEY
const redisDB = require("./utils/redisDB")
const isNumeric = require("./utils/isNumeric")
const saveReceipt = require("./utils/saveReceipt")
const dataMapping = require("./utils/dataMapping")
const { fetchGasPrice } = require("./utils/fetchData")
const waitForConfirmation = require("./utils/waitForComfirmation")

const accountTransfer = async (
    txType,
    receiverAddress,
    amountInETH,
    network,
    projectID
) => {
    try {
        let txHash
        let retry = 0
        let txReceipt = null

        const provider = new ethers.providers.InfuraProvider(network, projectID)
        const signer = new ethers.Wallet(pKey, provider)

        // Retry sending transaction utill success, 10 retries max
        while (txReceipt === null && retry < 10) {
            const gasData = await fetchGasPrice()
            gasInGWEI = gasData.fastest
            gasPrice = gasInGWEI * 10 ** 9

            // Convert the amount in ETH to WEI
            const amount = ethers.BigNumber.from(
                ethers.utils.parseEther(amountInETH)
            )

            const nonce = await provider.getTransactionCount(walletAddress)

            txHash = await handleTransaction(
                signer,
                txType,
                receiverAddress,
                amount,
                nonce,
                gasPrice
            )

            console.log(
                `Your transaction is being mined and the gas price being used is ${gasInGWEI} GWEI.`
            )
            console.log(`The generated transaction hash is ${txHash}\n`)
            console.log("You can check your transaction at:")
            console.log(`https://rinkeby.etherscan.io/tx/${txHash}\n`)
            console.log(
                "Waiting for 12 Block Confirmations (checks every 15 second)\n"
            )

            // Wait for confirmation and get the txReceipt or null
            txReceipt = await waitForConfirmation(provider, txHash)
            if (txReceipt === null) {
                retry += 1
                console.log("\nTransaction failed...Trying again!\n")
            }
        }
        // Return the succeed txReceipt
        if (txReceipt !== null) {
            console.log(
                "Transaction was mined successfully and confirmed by 12 blocks"
            )
            return txReceipt
        }
        console.log("Transaction failed even after 10 retries")
        // Return the failed txReceipt
        return (txReceipt = await provider.getTransactionReceipt(txHash))
    } catch (error) {
        console.log("error in accountTransfer", error)
        return "error in accountTransfer"
    }
}

const handleTransaction = async (
    signer,
    txType,
    receiverAddress,
    amount,
    nonce,
    gasPrice
) => {
    if (txType === "1") {
        const txPayload = {
            type: 1,
            to: receiverAddress,
            value: amount,
            nonce: nonce,
            gasLimit: 21000,
            gasPrice: gasPrice,
        }
        const tx = await signer.sendTransaction(txPayload)
        return tx.hash
    }

    if (txType === "2") {
        const txPayload = {
            type: 2,
            to: receiverAddress,
            value: amount,
            nonce: nonce,
            gasLimit: 21000,
            maxPriorityFeePerGas: gasPrice,
            maxFeePerGas: gasPrice,
        }
        const tx = await signer.sendTransaction(txPayload)
        return tx.hash
    }
    console.log(`Unsupported transaction type ${txType}.`)
}

async function startTransaction() {
    console.log("\nStarting the transaction process\n")

    const txType = prompt(
        "Enter the transaction type (1 for legacy || 2 for EIP-1559): "
    )
    if (!txType) return console.log("Transaction type cannot be null")
    if (txType !== "1" && txType !== "2")
        return console.log(`Transaction type ${txType} is unsupported`)

    const receiverAddress = prompt("Enter the receiver address: ")
    if (!receiverAddress) return console.log("Receiver address cannot be null")
    if (receiverAddress.length !== 42)
        return console.log(`${receiverAddress} is not a valid address`)

    const amountInETH = prompt("Enter the amount of ETH to transfer: ")
    if (!amountInETH) return console.log("Transfer amount cannot be null")
    if (isNumeric(amountInETH) === false)
        return console.log("Invalid transfer amount")

    const confirmation = prompt(
        `Are you sure you want to transfer ${amountInETH} ETH to ${receiverAddress}? (Y/N): `
    )
    if (confirmation !== "Y" && confirmation !== "y") return

    console.log("\nFetching all the necessary data to start mining\n")

    const txReceipt = await accountTransfer(
        txType,
        receiverAddress,
        amountInETH,
        network,
        projectID
    )

    const mappedReceipt = await dataMapping(txReceipt)
    await saveReceipt(mappedReceipt)
    await redisDB(mappedReceipt)
}

startTransaction()
    .then(() => {
        console.log("\nTransaction process has ended\n\n")
        process.exit(0)
    })
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
