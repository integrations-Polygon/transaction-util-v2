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
