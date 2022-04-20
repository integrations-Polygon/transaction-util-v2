const ps = require("prompt-sync")
const prompt = ps()
const send = require("./main/send/send")
const call = require("./main/call/call")
const deploy = require("./main/deploy/deploy")
const redisDB = require("./main/utils/redisDB")
const saveReceipt = require("./main/utils/saveReceipt")
const dataMapping = require("./main/utils/dataMapping")

async function startTransaction() {
  let txReceipt
  console.log("\nStarting the transaction process\n")
  console.log("Select a transaction to proceed:-")
  console.log("1. Deploy your smart contract.")
  console.log("2. Call a function of deployed smart contract.")
  console.log("3. Send MATIC tokens to a receiving account address.\n")
  const choice = prompt("Enter your choice: ")
  console.log("\n")
  if (!choice) return console.log("Choice cannot be null")
  if (choice !== "1" && choice !== "2" && choice !== "3")
    return console.log(`Transaction ${choice} is unsupported`)

  try {
    if (choice === "1") txReceipt = await deploy()
    if (choice === "2") txReceipt = await call()
    if (choice === "3") txReceipt = await send()

    if (txReceipt !== null && txReceipt !== undefined) {
      const mappedReceipt = await dataMapping(txReceipt)
      await saveReceipt(mappedReceipt)
      await redisDB(mappedReceipt)
    }
    return
  } catch (error) {
    console.log(`Error at startTransaction: ${error}`)
  }
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
