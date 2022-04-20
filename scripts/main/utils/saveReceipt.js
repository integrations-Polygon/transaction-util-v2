const fs = require("fs")

const saveReceipt = async (mappedReceipt) => {
  try {
    if (fs.existsSync("log/log.json", "utf-8")) {
      let existingLog = fs.readFileSync("log/log.json", "utf-8")
      let parseLog = JSON.parse(existingLog)
      parseLog.push(mappedReceipt)
      appendExistingLog = await JSON.stringify(parseLog, null, 2)
      fs.writeFileSync("log/log.json", appendExistingLog, "utf-8")
      return
    }
    fs.writeFileSync("log/log.json", "[]", "utf-8")
    let emptyArrayLog = fs.readFileSync("log/log.json", "utf-8")
    let parseLog = JSON.parse(emptyArrayLog)
    parseLog.push(mappedReceipt)
    newLog = await JSON.stringify(parseLog, null, 2)
    fs.writeFileSync("log/log.json", newLog, "utf-8")
    console.log("\nTransaction receipt has been logged successfully.\n")
  } catch (error) {
    console.log(`Error in saveReceipt: ${error}`)
  }
}

module.exports = saveReceipt
