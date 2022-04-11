const sleep = require("./sleep")
const isConfirmed = require("./isConfirmed")

/*  
    - Total wait time is 5mins (15000ms  * 20)
    - Every 15 seconds check for the 12 block confirmations status
    - If the tx hash gets confirmed by 12 blocks within 5 mins then return the tx receipt
    - Else return null 
*/

const waitForConfirmation = async (provider, txHash) => {
    try {
        let i = 0
        while (i < 20) {
            if (await isConfirmed(provider, txHash, 12)) {
                console.log("\n")
                console.log(txHash, "was confirmed by 12 blocks")
                const txReceipt = await provider.getTransactionReceipt(txHash)
                if (txReceipt != null) return txReceipt
            }
            i += 1
            await sleep(15000)
        }
        return null
    } catch (error) {
        console.log("error in waitForConfirmation", error)
        return null
    }
}

module.exports = waitForConfirmation
