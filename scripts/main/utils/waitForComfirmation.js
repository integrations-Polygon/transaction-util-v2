const sleep = require("./sleep")
const isConfirmed = require("./isConfirmed")

/*  
    - Total wait time is 5.3 mins (5000ms  * 64)
    - Every 5 seconds check for the block confirmations status
    - If the tx hash gets confirmed by 64 blocks within 5.3 mins then return the tx receipt
    - Else return null and retry
*/

const waitForConfirmation = async (provider, txHash) => {
    try {
        let i = 0
        while (i < 64) {
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
            await sleep(5000)
        }
        return null
    } catch (error) {
        console.log("error in waitForConfirmation", error)
        return null
    }
}

module.exports = waitForConfirmation
