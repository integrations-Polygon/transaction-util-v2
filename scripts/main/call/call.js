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
  arrayOfArgs,
}) => {
  try {
    let txHash
    let retry = 0
    let txReceipt = null
    const provider = new ethers.providers.InfuraProvider(network, projectID)
    const signer = new ethers.Wallet(pKey, provider)
    const abiData = await fetchAbiData(contractAddress)
    const abi = abiData.result
    // Retry sending transaction utill success, 5 retries max
    while (txReceipt === null && retry < 5) {
      const nonce = await provider.getTransactionCount(walletAddress)
      const userTxData = {
        signer,
        txType,
        contractAddress,
        arrayOfArgs,
        abi,
        nonce,
      }
      txHash = await handleCallTx(userTxData)
      console.log("\nYour transaction is being mined...")
      console.log(`The generated transaction hash is ${txHash}\n`)
      console.log("You can check your transaction at:")
      console.log(`https://polygonscan.com/tx/${txHash}\n`)
      console.log("Waiting for 64 Block Confirmations\n")
      // Wait for confirmation and get the txReceipt or null
      txReceipt = await waitForConfirmation(provider, txHash)
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
  let arrayOfArgs = []
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
  const totalArgs = prompt("Enter the total number of argument: ")
  if (!totalArgs) return console.log("Total number of argument cannot be null")
  if (isNumeric(totalArgs) === false) return console.log("Invalid input")
  if (totalArgs !== 0) {
    for (i = 0; i < totalArgs; i++)
      arrayOfArgs[i] = prompt(`Enter your argument [${i + 1}]: `)
  }
  console.log("\nFetching all the necessary data to start mining\n")
  const userInputData = { txType, contractAddress, arrayOfArgs }
  const txReceipt = await contractFunctionCall(userInputData)
  return txReceipt
}

module.exports = call
