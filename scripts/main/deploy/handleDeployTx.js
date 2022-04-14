const {
    fetchGasPriceLegacy,
    fetchGasPriceEIP1559,
  } = require("../utils/fetchData")

  const handleDeployTx = async (
    signer,
    txType,
    nonce,
    metadata,
    provider
  ) => {
    if (txType === "1") {
      const gasData = await fetchGasPriceLegacy()
      maxFeeInGWEI = gasData.fastest
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
      // Get the estimated gas limit for this tx payload
      gasLimit = await provider.estimateGas({
        type: 1,
        nonce: nonce,
        data: '0x' + metadata.bytecode,
        gasLimit: 14_999_999,
        gasPrice: maxFee,
      })
      // Send transaction payload with the estimated gas limit
      const txPayload = {
        type: 1,
        nonce: nonce,
        data: '0x' + metadata.bytecode,
        gasLimit: gasLimit,
        gasPrice: maxFee,
      }
      const tx = await signer.sendTransaction(txPayload)
      return tx.hash
    }
  
    if (txType === "2") {
      const gasData = await fetchGasPriceEIP1559()
      maxFeeInGWEI = gasData.fast.maxFee
      maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
      maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9)
      // Get the estimated gas limit for this tx payload
      gasLimit = await provider.estimateGas({
        type: 2,
        data: '0x' + metadata.bytecode,
        nonce: nonce,
        gasLimit: 14_999_999,
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      })
      // Send transaction payload with the estimated gas limit
      const txPayload = {
        type: 2,
        nonce: nonce,
        data: '0x' + metadata.bytecode,
        gasLimit: gasLimit,
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      }
      const tx = await signer.sendTransaction(txPayload)
      return tx.hash
    }
    console.log(`Unsupported transaction type ${txType}`)
  }

module.exports = handleDeployTx