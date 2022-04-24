const {
  fetchGasPriceLegacy,
  fetchGasPriceEIP1559,
} = require("../utils/fetchData")

const handleSendTx = async ({
  signer,
  txType,
  receiverAddress,
  amount,
  nonce,
}) => {
  try {
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

      // Type 1 (legacy) transaction payload object for MATIC transfer
      const txPayload = {
        type: 1,
        to: receiverAddress,
        value: amount,
        nonce: nonce,
        gasLimit: 21000, // default gaslimit for MATIC transfer
        gasPrice: maxFee,
      }

      // Sign the transaction and send it to the network with its payload object
      const tx = await signer.sendTransaction(txPayload)

      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI.`
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

      // Type 2 (EIP-1559) transaction payload object for MATIC transfer
      const txPayload = {
        type: 2,
        to: receiverAddress,
        value: amount,
        nonce: nonce,
        gasLimit: 21000, // default gaslimit for MATIC transfer
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      }

      // Sign the transaction and send it to the network with its payload object
      const tx = await signer.sendTransaction(txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI.`
      )

      // Return the transaction hash, it will be used to get the transaction Receipt data later
      return tx.hash
    }
  } catch (error) {
    console.log(`Error in handleSendTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleSendTx
