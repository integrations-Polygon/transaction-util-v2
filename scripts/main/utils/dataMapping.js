const dataMapping = async (txReceipt) => {
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
}

module.exports = dataMapping
