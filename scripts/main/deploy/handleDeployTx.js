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
  try {
    const factory = new ethers.ContractFactory(
      metadata.abi,
      metadata.bytecode,
      signer
    )
    const deployTransactionData = await factory.getDeployTransaction(
      ...arrayOfArgs
    ).data

    // For type 1 transaction
    if (txType === "1") {

      // Fetch the latest gas price data from the polygon v1 gas station API
      const gasData = await fetchGasPriceLegacy()

      // Store the fastest gas data fetched
      maxFeeInGWEI = gasData.fastest

      /* Convert the fetched GWEI gas price to WEI after converting ignore the decimal value
       * as the transaction payload only accepts whole number
       */
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)

      // Get the estimated gas limit for this tx payload
      const gasLimit = await provider.estimateGas({
        type: 1,
        nonce: nonce,
        gasPrice: maxFee,
        gasLimit: 14_999_999, // polygon transaction limit
        data: deployTransactionData,
      })
      // Transaction payload object with your encoded estimated gas limit
      const txPayload = {
        type: 1,
        nonce: nonce,
        gasPrice: maxFee,
        gasLimit: gasLimit,
      }
      // Deploy the contract with the arguments passed by the user
      const contract = await factory.deploy(...arrayOfArgs, txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )
      // Get transaction receipt
      await contract.deployed()
      console.log(`Generated contract address: ${contract.address}\n`)
      
      // Return the transaction hash, it will be used to get the transaction Receipt data later
      return (txHash = await contract.deployTransaction.hash)
    }

    // For type 2 transaction
    if (txType === "2") {
      // Fetch the latest gas price data from the polygon v2 gas station API
      const gasData = await fetchGasPriceEIP1559()

      // Get the maxFee and maxPriorityFee for fast
      maxFeeInGWEI = gasData.fast.maxFee
      maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee

      /* Convert the fetched GWEI gas price to WEI after converting ignore the decimal value
       * as the transaction payload only accepts whole number
       */
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
      // Transaction payload object with your encoded estimated gas limit
      const txPayload = {
        type: 2,
        nonce: nonce,
        gasLimit: gasLimit,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: maxPriorityFee,
      }
  
      // Deploy the contract with the arguments passed by the user
      const contract = await factory.deploy(...arrayOfArgs, txPayload)

      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )

      // Get transaction receipt
      await contract.deployed()
      console.log(`Generated contract address: ${contract.address}\n`)
      
      // Return the transaction hash, it will be used to get the transaction Receipt data later
      return (txHash = await contract.deployTransaction.hash)
    }
  } catch (error) {
    console.log(`Error in handleDeployTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleDeployTx
