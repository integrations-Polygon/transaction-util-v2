const { ethers } = require("ethers")
const {
  fetchGasPriceLegacy,
  fetchGasPriceEIP1559,
} = require("../utils/fetchData")

const handleCallTx = async ({
  signer,
  txType,
  contractAddress,
  arrayOfArgs,
  abi,
  nonce,
}) => {
  try {
    const contract = new ethers.Contract(contractAddress, abi, signer)
    if (txType === "1") {
      const gasData = await fetchGasPriceLegacy()
      maxFeeInGWEI = gasData.fastest
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
      // Get the estimated gas limit for this tx payload
      const gasLimit = await contract.estimateGas.getName(...arrayOfArgs, {
        type: 1,
        nonce: nonce,
        gasLimit: 14_999_999,
        gasPrice: maxFee,
      })
      // Send actual tx payload with estimated gas limit
      const txPayload = {
        type: 1,
        nonce: nonce,
        gasLimit: gasLimit,
        gasPrice: maxFee,
      }
      const tx = await contract.getName(...arrayOfArgs, txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )
      return tx.hash
    }
    if (txType === "2") {
      const gasData = await fetchGasPriceEIP1559()
      maxFeeInGWEI = gasData.fast.maxFee
      maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
      maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9)
      // Get the estimated gas limit for this tx payload
      const gasLimit = await contract.estimateGas.getName(...arrayOfArgs, {
        type: 2,
        nonce: nonce,
        gasLimit: 14_999_999,
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      })
      // Send actual tx payload with estimated gas limit
      const txPayload = {
        type: 2,
        nonce: nonce,
        gasLimit: gasLimit,
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      }
      const tx = await contract.getName(...arrayOfArgs, txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )
      return tx.hash
    }
  } catch (error) {
    console.log(`Error in handleCallTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleCallTx
