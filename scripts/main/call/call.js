const walletAddress = process.env.PUBLIC_KEY
const pKey = process.env.SIGNER_PRIVATE_KEY
const projectID = process.env.PROJECT_ID
const network = process.env.NETWORK
const ps = require("prompt-sync")
const prompt = ps()
require("dotenv").config()
const ethers = require("ethers")
const handleCallTx = require("./handleCallTx")
const isNumeric = require("../utils/isNumeric")
const { fetchAbiData } = require("../utils/fetchData")
const waitForConfirmation = require("../utils/waitForComfirmation")

const contractFunctionCall = async ({
  txType,
  contractAddress,
  functionName,
  arrayOfArgs,
}) => {
  try {
    // Initial non constant variables
    let txHash
    let retry = 0
    let txReceipt = null

    // Using Infura provider to connect to the blockchain
    const provider = new ethers.providers.InfuraProvider(network, projectID)

    // Initialize your wallet account address as your signer
    // pKey here is your metamask account private key
    const signer = new ethers.Wallet(pKey, provider)

    // Fetch your smart contract ABI data from the blockchain
    // Your smart contract must be deployed and verified
    const abiData = await fetchAbiData(contractAddress)
    const abi = abiData.result

    // Initialize your interface
    // The Interface abstracts the encoding and decoding
    // required to interact with your contracts on the blockchain.
    const iface = new ethers.utils.Interface(abi)

    // Retry sending transaction utill success, 5 retries max
    while (txReceipt === null && retry < 5) {
      // Get your nonce value for your wallet address
      const nonce = await provider.getTransactionCount(walletAddress)

      // Object consisting all the required data of the user transaction
      // To start the transaction process
      const userTxData = {
        signer,
        txType,
        contractAddress,
        functionName,
        arrayOfArgs,
        iface,
        nonce,
        provider,
      }

      // Passing the user transaction data to begin transaction process
      // and get the transaction hash
      txHash = await handleCallTx(userTxData)

      console.log("\nYour transaction is being mined...")
      console.log(`The generated transaction hash is ${txHash}\n`)
      console.log("You can check your transaction at:")
      console.log(`https://polygonscan.com/tx/${txHash}\n`)
      console.log("Waiting for 64 Block Confirmations\n")

      // Wait for confirmation and get the txReceipt or null
      txReceipt = await waitForConfirmation(provider, txHash)

      // if the txReceipt generated is null then try resending the transaction
      // max retries 5 untill declared transaction failed and end process
      if (txReceipt === null) {
        retry += 1
        console.log("\nTransaction failed...Trying again!\n")
      }
    }

    // Return the success txReceipt
    if (txReceipt != null) return txReceipt
    console.log("Transaction failed even after 5 retries")

    // Return the failed txReceipt
    return (txReceipt = await provider.getTransactionReceipt(txHash))
  } catch (error) {
    console.log("Error in contractFunctionCall", error)
    process.exit(1)
  }
}

async function call() {
  // Empty array to store user input arguments
  let arrayOfArgs = []

  // Basic user input and input checks
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
  if (!totalArgs) return console.log("Total number of argument cannot be null")
  if (isNumeric(totalArgs) === false) return console.log("Invalid input")
  if (totalArgs !== 0) {
    for (i = 0; i < totalArgs; i++)
      arrayOfArgs[i] = prompt(`Enter your argument [${i + 1}]: `)
  }
  console.log("\nFetching all the necessary data to start mining\n")

  // Stores all the user input data in an object
  const userInputData = {
    txType,
    contractAddress,
    functionName,
    arrayOfArgs,
  }

  // Pass the user input data object to start the transaction process
  const txReceipt = await contractFunctionCall(userInputData)

  return txReceipt
}

module.exports = call
