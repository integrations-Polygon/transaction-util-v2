const ethers = require("ethers")
const {
  fetchGasPriceLegacy,
  fetchGasPriceEIP1559,
} = require("../utils/fetchData")

const handleDeployTx = async ({
  signer,
  txType,
  nonce,
  metadata,
  arrayOfArgs,
  provider,
}) => {
  const factory = new ethers.ContractFactory(
    metadata.abi,
    metadata.bytecode,
    signer
  )
  const deployTransactionData = await factory.getDeployTransaction(
    ...arrayOfArgs
  ).data
  try {
    if (txType === "1") {
      const gasData = await fetchGasPriceLegacy()
      maxFeeInGWEI = gasData.fastest
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
      // Get the estimated gas limit for this tx payload
      const gasLimit = await provider.estimateGas({
        type: 1,
        nonce: nonce,
        gasPrice: maxFee,
        gasLimit: 14_999_999,
        data: deployTransactionData,
      })
      // Send transaction payload with the estimated gas limit
      const txPayload = {
        type: 1,
        nonce: nonce,
        gasPrice: maxFee,
        gasLimit: gasLimit,
      }
      const contract = await factory.deploy(...arrayOfArgs, txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )
      // Get transaction receipt
      await contract.deployed()
      console.log(`Generated contract address: ${contract.address}\n`)
      return (txHash = await contract.deployTransaction.hash)
    }
    if (txType === "2") {
      const gasData = await fetchGasPriceEIP1559()
      maxFeeInGWEI = gasData.fast.maxFee
      maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
      maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9)
      // Get the estimated gas limit for this tx payload
      const gasLimit = await provider.estimateGas({
        type: 2,
        nonce: nonce,
        gasLimit: 14_999_999,
        maxFeePerGas: maxFee,
        data: deployTransactionData,
        maxPriorityFeePerGas: maxPriorityFee,
      })
      // Send transaction payload with the estimated gas limit
      const txPayload = {
        type: 2,
        nonce: nonce,
        gasLimit: gasLimit,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: maxPriorityFee,
      }
      const contract = await factory.deploy(...arrayOfArgs, txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )
      // Get transaction receipt
      await contract.deployed()
      console.log(`Generated contract address: ${contract.address}\n`)
      return (txHash = await contract.deployTransaction.hash)
    }
  } catch (error) {
    console.log(`Error in handleDeployTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleDeployTx
