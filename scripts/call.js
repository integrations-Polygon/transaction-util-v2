const ps = require("prompt-sync")
const prompt = ps()
require("dotenv").config()
const ethers = require("ethers")
const network = process.env.NETWORK
const projectID = process.env.PROJECT_ID
const pKey = process.env.SIGNER_PRIVATE_KEY
const walletAddress = process.env.PUBLIC_KEY
const saveReceipt = require("./utils/saveReceipt")
const dataMapping = require("./utils/dataMapping")
const waitForConfirmation = require("./utils/waitForComfirmation")
const { fetchAbiData, fetchGasPrice } = require("./utils/fetchData")

const contractFunctionCall = async (contractAddress, network, projectID) => {
    try {
        // Set initial txReceipt and gas price
        let gasPrice = 0
        let txReceipt = null

        // Configuring the connection to an Ethereum node
        const provider = new ethers.providers.InfuraProvider(network, projectID)

        // Create a signing account from your private key
        const signer = new ethers.Wallet(pKey, provider)

        // Fetch the ABI from rinkeby API
        const abiData = await fetchAbiData(contractAddress)
        const abi = abiData.result

        // Create a contract interface
        const iface = new ethers.utils.Interface(abi)

        // Retry sending transaction utill success
        while (txReceipt === null) {
            // fetch the gas fee estimation from the Polygon Gas Station V2 Endpoint
            const gasData = await fetchGasPrice()
            gasInGWEI = gasData.fastest
            gasPrice = gasInGWEI * 10 ** 9

            // Get the nonce for the transaction
            const nonce = await provider.getTransactionCount(walletAddress)

            // Handle the transaction and send it to the network
            const txHash = await handleTransaction(
                signer,
                contractAddress,
                iface,
                nonce,
                gasPrice
            )

            console.log(
                `Your transaction is being mined and the gas price being used is ${gasInGWEI} GWEI.`
            )
            console.log(`The generated transaction hash is ${txHash}.\n`)
            console.log("You can check your transaction at:")
            console.log(`https://rinkeby.etherscan.io/tx/${txHash}\n`)
            console.log(
                "Waiting for 12 Block Confirmations (checks every 15 second)\n"
            )

            // Wait for confirmation and get the txReceipt
            txReceipt = await waitForConfirmation(provider, txHash)

            if (txReceipt === null) {
                console.log("\nTransaction failed...Trying again!\n")
            }
        }
        // Return the succeed txReceipt
        return txReceipt
    } catch (error) {
        console.log("error in contractFunctionCall", error)
        return "error in contractFunctionCall"
    }
}

const handleTransaction = async (
    signer,
    contractAddress,
    iface,
    nonce,
    gasPrice
) => {
    // Create transaction request object
    const txParams = {
        to: contractAddress,
        data: iface.encodeFunctionData("echo", [
            `Hello world at ${Date.now()}!`,
        ]),
        nonce: nonce,
        gasLimit: 100000,
        gasPrice: gasPrice,
    }

    // Send the Transaction
    const tx = await signer.sendTransaction(txParams)
    return tx.hash
}

async function startTransaction() {
    console.log("\nStarting the transaction process.\n")

    const contractAddress = prompt(
        "Input the deployed and verified smart contract address: "
    )
    console.log("Fetching all the necessary data to start mining.\n")

    const txReceipt = await contractFunctionCall(
        contractAddress,
        network,
        projectID
    )
    console.log(
        "Transaction was mined successfully and confirmed by 12 blocks.\n"
    )

    const mappedReceipt = await dataMapping(txReceipt)
    // Store the success mappedReceipt in JSON file
    saveReceipt(mappedReceipt)
}

startTransaction()
    .then(() => {
        console.log("Transaction process completed.\n\n")
        process.exit(0)
    })
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
