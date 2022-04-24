/* Basic function to map the necessary data from the
 * transaction receipt generated and return the newly mapped data .
 *
 * txReceipt.to is 0x0000 or null only when we are trying to deploy a smartcontract
 * so we map for contract address, else we dont map for contract address
 */

const dataMapping = async (txReceipt) => {
  try {
    if (txReceipt.to === null) {
      const mappedReceipt = {
        status: txReceipt.status,
        type: txReceipt.type,
        from: txReceipt.from,
        to: txReceipt.to,
        contractAddress: txReceipt.contractAddress,
        blockHash: txReceipt.blockHash,
        blockNumber: txReceipt.blockNumber,
        transactionHash: txReceipt.transactionHash,
        cumulativeGasUsed: txReceipt.cumulativeGasUsed.toString(),
        effectiveGasPrice: txReceipt.effectiveGasPrice.toString(),
        gasUsed: txReceipt.gasUsed.toString(),
      }
      return mappedReceipt
    }
    const mappedReceipt = {
      status: txReceipt.status,
      type: txReceipt.type,
      from: txReceipt.from,
      to: txReceipt.to,
      blockHash: txReceipt.blockHash,
      blockNumber: txReceipt.blockNumber,
      transactionHash: txReceipt.transactionHash,
      cumulativeGasUsed: txReceipt.cumulativeGasUsed.toString(),
      effectiveGasPrice: txReceipt.effectiveGasPrice.toString(),
      gasUsed: txReceipt.gasUsed.toString(),
    }
    return mappedReceipt
  } catch (error) {
    console.log(`Error while mapping data of transaction receipt: ${error}`)
    process.exit(1)
  }
}

module.exports = dataMapping
