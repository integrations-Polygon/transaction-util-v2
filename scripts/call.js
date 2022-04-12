const ps = require("prompt-sync")
const prompt = ps()
require("dotenv").config()
const ethers = require("ethers")
const redisDB = require("./utils/redisDB")
const saveReceipt = require("./utils/saveReceipt")
const dataMapping = require("./utils/dataMapping")
const waitForConfirmation = require("./utils/waitForComfirmation")
const { fetchAbiData, fetchGasPrice } = require("./utils/fetchData")

const network = process.env.NETWORK
const projectID = process.env.PROJECT_ID
const pKey = process.env.SIGNER_PRIVATE_KEY
const walletAddress = process.env.PUBLIC_KEY

const contractFunctionCall = async (
    txType,
    contractAddress,
    functionName,
    arrayOfArgs,
    network,
    projectID
) => {
    try {
        let txHash
        let retry = 0
        let txReceipt = null

        const provider = new ethers.providers.InfuraProvider(network, projectID)
        const signer = new ethers.Wallet(pKey, provider)
        const abiData = await fetchAbiData(contractAddress)
        const abi = abiData.result
        const iface = new ethers.utils.Interface(abi)

        // Retry sending transaction utill success, 10 retries max
        while (txReceipt === null && retry < 10) {
            const gasData = await fetchGasPrice()
            gasInGWEI = gasData.fastest
            gasPrice = gasInGWEI * 10 ** 9

            const nonce = await provider.getTransactionCount(walletAddress)

            txHash = await handleTransaction(
                signer,
                txType,
                contractAddress,
                functionName,
                arrayOfArgs,
                iface,
                nonce,
                gasPrice
            )

            console.log(
                `Your transaction is being mined and the gas price being used is ${gasInGWEI} GWEI`
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
        // Return the success txReceipt
        if (txReceipt != null) {
            console.log(
                "Transaction was mined successfully and confirmed by 12 blocks"
            )
            return txReceipt
        }
        console.log("Transaction failed even after 10 retries")
        // Return the failed txReceipt
        return (txReceipt = await provider.getTransactionReceipt(txHash))
    } catch (error) {
        console.log("error in contractFunctionCall", error)
        return "error in contractFunctionCall"
    }
}

const handleTransaction = async (
    signer,
    txType,
    contractAddress,
    functionName,
    arrayOfArgs,
    iface,
    nonce,
    gasPrice
) => {
    if (txType === "1") {
        const txPayload = {
            type: 1,
            to: contractAddress,
            data: iface.encodeFunctionData(functionName.toString(), [
                arrayOfArgs.toString(),
            ]),
            nonce: nonce,
            gasLimit: 100000,
            gasPrice: gasPrice,
        }
        const tx = await signer.sendTransaction(txPayload)
        return tx.hash
    }

    if (txType === "2") {
        const txPayload = {
            type: 2,
            to: contractAddress,
            data: iface.encodeFunctionData(functionName.toString(), [
                arrayOfArgs.toString(),
            ]),
            nonce: nonce,
            gasLimit: 100000,
            maxPriorityFeePerGas: gasPrice,
            maxFeePerGas: gasPrice,
        }
        const tx = await signer.sendTransaction(txPayload)
        return tx.hash
    }
    console.log(`Unsupported transaction type ${txType}`)
}

async function startTransaction() {
    let arrayOfArgs = []

    console.log("\nStarting the transaction process\n")

    const txType = prompt(
        "Enter the transaction type (1 for legacy || 2 for EIP-1559): "
    )
    if (!txType) return console.log("Transaction type cannot be null")
    if (txType !== "1" && txType !== "2")
        return console.log(`Transaction type ${txType} is unsupported`)

    const contractAddress = prompt(
        "Enter the deployed & verified smart contract address: "
    )
    if (!contractAddress) return console.log("Contract address cannot be null")
    if (contractAddress.length !== 42)
        return console.log(`${contractAddress} is not a valid address`)

    const functionName = prompt("Enter the name of the function to call: ")
    if (!functionName) return console.log("Function name cannot be null")

    const totalArgs = prompt("Enter the total number of argument: ")
    if (!totalArgs)
        return console.log("Total number of argument cannot be null")
    if (totalArgs !== 0) {
        for (i = 0; i < totalArgs; i++)
            arrayOfArgs[i] = prompt(`Enter your argument [${i + 1}]: `)
    }

    console.log("\nFetching all the necessary data to start mining\n")

    const txReceipt = await contractFunctionCall(
        txType,
        contractAddress,
        functionName,
        arrayOfArgs,
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
