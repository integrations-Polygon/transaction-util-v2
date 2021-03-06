const walletAddress = process.env.PUBLIC_KEY
const pKey = process.env.SIGNER_PRIVATE_KEY
const projectID = process.env.PROJECT_ID
const network = process.env.NETWORK
const ps = require("prompt-sync")
const prompt = ps()
require("dotenv").config()
const ethers = require("ethers")
const handleSendTx = require("./handleSendTx")
const isNumeric = require("../utils/isNumeric")
const waitForConfirmation = require("../utils/waitForComfirmation")

const accountTransfer = async ({ txType, receiverAddress, amountInMATIC }) => {
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

    // Retry sending transaction utill success, 5 retries max
    while (txReceipt === null && retry < 5) {
      // Parsee the string representation of ETH into
      // Big number instance of the amount in WEI
      const amount = ethers.BigNumber.from(
        ethers.utils.parseEther(amountInMATIC)
      )

      // Get your nonce value for your wallet address
      const nonce = await provider.getTransactionCount(walletAddress)

      // Object consisting all the required data of the user
      // To start the transaction process
      const userTxData = { signer, txType, receiverAddress, amount, nonce }

      // Passing the user transaction data to begin transaction process
      // and get the transaction hash
      txHash = await handleSendTx(userTxData)

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
    // Return the succeed txReceipt
    if (txReceipt !== null) return txReceipt
    console.log("Transaction failed even after 5 retries")

    // Return the failed txReceipt
    return (txReceipt = await provider.getTransactionReceipt(txHash))
  } catch (error) {
    console.log("Error in accountTransfer", error)
    process.exit(1)
  }
}

async function send() {
  // Basic user input and input checks
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

  // Stores all the user input data in an object
  const userInputData = {
    txType,
    receiverAddress,
    amountInMATIC,
  }

  // Pass the user input data object to start the transaction process
  const txReceipt = await accountTransfer(userInputData)

  return txReceipt
}

module.exports = send
