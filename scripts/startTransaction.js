const call = require("./main/call/call")
const deploy = require("./main/deploy/deploy")
const send = require("./main/send/send")
const saveReceipt = require("./utils/saveReceipt")
const dataMapping = require("./utils/dataMapping")
const redisDB = require("./utils/redisDB")



async function startTransaction(){
    console.log("1. Send MATIC to a receiving address.")
    console.log("2. Deploy & verify your smart contract.")
    console.log("3. Call a function/method from your deployed smart contract.")
    const choice = prompt(
        "Select a transaction to proceed:-\n"
    )
    if(choice !== "1" && choice !== "2" && choice !== "3") 
        return console.log(`Transaction ${choice} is unsupported`)
    
    if(choice === "1") 
        txReceipt = send()
        mappedReceipt = await dataMapping(txReceipt)
        await saveReceipt(mappedReceipt)
        await redisDB(mappedReceipt)

    if(choice === "2") 
        txReceipt = deploy()
        const mappedReceipt = await dataMapping(txReceipt)
        await saveReceipt(mappedReceipt)
        await redisDB(mappedReceipt)
        
    if(choice === "3")
        txReceipt = call()
        mappedReceipt = await dataMapping(txReceipt)
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
