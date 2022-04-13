const ps = require("prompt-sync")
const prompt = ps()
require("dotenv").config()
const ethers = require("ethers")
const redisDB = require("./utils/redisDB")
const isNumeric = require("./utils/isNumeric")
const saveReceipt = require("./utils/saveReceipt")
const dataMapping = require("./utils/dataMapping")
const waitForConfirmation = require("./utils/waitForComfirmation")

const {
    fetchGasPriceLegacy,
    fetchGasPriceEIP1559,
} = require("./utils/fetchData")

const network = process.env.NETWORK
const projectID = process.env.PROJECT_ID
const pKey = process.env.SIGNER_PRIVATE_KEY
const walletAddress = process.env.PUBLIC_KEY

const accountTransfer = async (
    txType,
    receiverAddress,
    amountInMATIC,
    network,
    projectID
) => {
    try {
        let txHash
        let retry = 0
        let txReceipt = null

        const provider = new ethers.providers.InfuraProvider(network, projectID)
        const signer = new ethers.Wallet(pKey, provider)

        // Retry sending transaction utill success, 5 retries max
        while (txReceipt === null && retry < 5) {
            // Convert the amount in MATIC to WEI
            const amount = ethers.BigNumber.from(
                ethers.utils.parseEther(amountInMATIC)
            )

            const nonce = await provider.getTransactionCount(walletAddress)

            txHash = await handleTransaction(
                signer,
                txType,
                receiverAddress,
                amount,
                nonce
            )

            console.log(`The generated transaction hash is ${txHash}\n`)
            console.log("You can check your transaction at:")
            console.log(`https://mumbai.polygonscan.com/tx/${txHash}\n`)
            console.log("Waiting for 64 Block Confirmations\n")

            // Wait for confirmation and get the txReceipt or null
            txReceipt = await waitForConfirmation(provider, txHash, txType)
            if (txReceipt === null) {
                retry += 1
                console.log("\nTransaction failed...Trying again!\n")
            }
        }
        // Return the succeed txReceipt
        if (txReceipt !== null) return txReceipt

        console.log("Transaction failed even after 5 retries")
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
    nonce
) => {
    if (txType === "1") {
        const gasData = await fetchGasPriceLegacy()
        let maxFeeInGWEI = gasData.fastest
        const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
        const txPayload = {
            type: 1,
            to: receiverAddress,
            value: amount,
            nonce: nonce,
            gasLimit: 21000,
            gasPrice: maxFee,
        }
        const tx = await signer.sendTransaction(txPayload)
        console.log(
            `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI.`
        )
        return tx.hash
    }

    if (txType === "2") {
        const gasData = await fetchGasPriceEIP1559()
        let maxFeeInGWEI = gasData.fast.maxFee
        let maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee
        const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
        const maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9)
        const txPayload = {
            type: 2,
            to: receiverAddress,
            value: amount,
            nonce: nonce,
            gasLimit: 21000,
            maxPriorityFeePerGas: maxPriorityFee,
            maxFeePerGas: maxFee,
        }
        const tx = await signer.sendTransaction(txPayload)
        console.log(
            `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI.`
        )
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

    const amountInMATIC = prompt("Enter the amount of MATIC to transfer: ")
    if (!amountInMATIC) return console.log("Transfer amount cannot be null")
    if (isNumeric(amountInMATIC) === false)
        return console.log("Invalid transfer amount")

    const confirmation = prompt(
        `Are you sure you want to transfer ${amountInMATIC} MATIC to ${receiverAddress}? (Y/N): `
    )
    if (confirmation !== "Y" && confirmation !== "y") return

    console.log("\nFetching all the necessary data to start mining\n")

    const txReceipt = await accountTransfer(
        txType,
        receiverAddress,
        amountInMATIC,
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
