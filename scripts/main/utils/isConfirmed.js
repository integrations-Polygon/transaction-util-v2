/*
  - If the tx or tx block number is null then return false
  - Get the latest block number and subract it with the current
    transaction block number to get the block confirmation number
  - If the result of subtraction is equal to 12 return true
  - Else return false 
*/

const isConfirmed = async (provider, txHash, blocks) => {
  try {
    const tx = await provider.getTransaction(txHash)
    if (!tx || !tx.blockNumber) return false
    const lastestBlockNumber = await provider.getBlockNumber()
    if (lastestBlockNumber - tx.blockNumber >= blocks) return true
    return false
  } catch (error) {
    console.log(`Error in isConfirmed: ${error}`)
    return false
  }
}

module.exports = isConfirmed
