const {
  fetchGasPriceLegacy,
  fetchGasPriceEIP1559,
} = require("../utils/fetchData")

const handleCallTx = async ({
  signer,
  txType,
  contractAddress,
  functionName,
  arrayOfArgs,
  iface,
  nonce,
  provider,
}) => {
  let gasLimit
  try {
    /* Encoding the function data retreived from the user, the parameters
     * has to be converted to strings if you are manually inputting the data
     * for it to pass the encoding process here my parameters are already string
     * but for the sake of the demo calling toString() on the function data
     */
    const encodedFunctionData = iface.encodeFunctionData(
      functionName.toString(),
      [...arrayOfArgs]
    )

    // For type 1 transaction
    if (txType === "1") {
      // Fetch the latest gas price data from the polygon v1 gas station API
      const gasData = await fetchGasPriceLegacy()

      // Store the fastest gas data fetched
      let maxFeeInGWEI = gasData.fastest

      /* Convert the fetched GWEI gas price to WEI after converting ignore the decimal value
       * as the transaction payload only accepts whole number
       */
      const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)

      // Get the estimated gas limit for this transaction payload
      gasLimit = await provider.estimateGas({
        type: 1,
        to: contractAddress,
        data: encodedFunctionData,
        nonce: nonce,
        gasLimit: 14_999_999, // polygon transaction limit
        gasPrice: maxFee,
      })

      // Transaction payload object with your encoded function data & estimated gas limit
      const txPayload = {
        type: 1,
        to: contractAddress,
        data: encodedFunctionData,
        nonce: nonce,
        gasLimit: gasLimit,
        gasPrice: maxFee,
      }

      // Sign the transaction and send it to the network with its payload object
      const tx = await signer.sendTransaction(txPayload)

      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )

      // Return the transaction hash, it will be used to get the transaction Receipt data later
      return tx.hash
    }

    // For type 2 transaction
    if (txType === "2") {
      // Fetch the latest gas price data from the polygon v2 gas station API
      const gasData = await fetchGasPriceEIP1559()

      // Get the maxFee and maxPriorityFee for fast
      let maxFeeInGWEI = gasData.fast.maxFee
      let maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee

      /* Convert the fetched GWEI gas price to WEI after converting ignore the decimal value
       * as the transaction payload only accepts whole number
       */
      const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
      const maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9)

      // Get the estimated gas limit for this transaction payload
      gasLimit = await provider.estimateGas({
        type: 2,
        to: contractAddress,
        data: iface.encodeFunctionData(functionName.toString(), [
          arrayOfArgs.toString(),
        ]),
        nonce: nonce,
        gasLimit: 14_999_999, // polygon transaction limit
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      })

      // Transaction payload object with your encoded function data & estimated gas limit
      const txPayload = {
        type: 2,
        to: contractAddress,
        data: iface.encodeFunctionData(functionName.toString(), [
          arrayOfArgs.toString(),
        ]),
        nonce: nonce,
        gasLimit: gasLimit,
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      }

      // Sign the transaction and send it to the network with its payload object
      const tx = await signer.sendTransaction(txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )

      // Return the transaction hash, it will be used to get the transaction Receipt data later
      return tx.hash
    }
  } catch (error) {
    console.log(`Error in handleCallTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleCallTx
