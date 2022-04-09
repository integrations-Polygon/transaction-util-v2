const sleep = require("./sleep")
const isConfirmed = require("./isConfirmed")

const waitForConfirmation = async (provider, txHash) => {
    try {
        let i = 0
        while (i < 20) {
            if (await isConfirmed(provider, txHash, 12)) {
                console.log("\n")
                console.log(txHash, "was confirmed by 12 blocks")

                // Returns the transaction receipt for the txHash
                const txReceipt = await provider.getTransactionReceipt(txHash)

                if (txReceipt != null) return txReceipt
            }
            // Increment i
            i += 1

            // Wait for 15000 ms each run and check if the transaction gets 12 block confirmation on the next run
            // Total wait time is 5mins (if the transaction is dropped) until retry
            await sleep(15000)
        }
        return null
    } catch (error) {
        console.log("error in waitForConfirmation", error)
        return null
    }
}

module.exports = waitForConfirmation
