const sleep = require("./sleep")
const isConfirmed = require("./isConfirmed")

/*  
    - Total wait time is 15mins (10000ms  * 90)
    - Every 10 seconds check for the 64 block confirmations status
    - If the tx hash gets confirmed by 64 blocks within 15 mins then return the tx receipt
    - Else return null 
*/

const waitForConfirmation = async (provider, txHash) => {
    try {
        let i = 0
        while (i < 90) {
            if (await isConfirmed(provider, txHash, 64)) {
                console.log("\n")
                console.log(
                    txHash,
                    "was mined successfully & confirmed by 64 blocks"
                )
                const txReceipt = await provider.getTransactionReceipt(txHash)
                if (txReceipt !== null) return txReceipt
            }
            i += 1
            await sleep(10000)
        }
        return null
    } catch (error) {
        console.log("error in waitForConfirmation", error)
        return null
    }
}

module.exports = waitForConfirmation
