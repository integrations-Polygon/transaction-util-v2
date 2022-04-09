const isConfirmed = async (provider, txHash, blocks) => {
    try {
        // Returns the transaction's hash
        const tx = await provider.getTransaction(txHash)

        if (!tx || !tx.blockNumber) {
            return false
        }

        // Returns the most recently mined blockNumber
        const lastestBlockNumber = await provider.getBlockNumber()

        // Display the number of confirmed blocks
        console.log(
            `${lastestBlockNumber - tx.blockNumber} Block Confirmations `
        )

        // Check if the block confirmation is more than or equal to 12 blocks
        if (lastestBlockNumber - tx.blockNumber >= blocks) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log("error in isConfirmed", error)
        return false
    }
}

module.exports = isConfirmed
