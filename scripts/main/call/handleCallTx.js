const {
  fetchGasPriceLegacy,
  fetchGasPriceEIP1559,
} = require("../utils/fetchData");

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
  let gasLimit;
  try {
    if (txType === "1") {
      const gasData = await fetchGasPriceLegacy();
      maxFeeInGWEI = gasData.fastest;
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9);
      // Get the estimated gas limit for this tx payload
      gasLimit = await provider.estimateGas({
        type: 1,
        to: contractAddress,
        data: iface.encodeFunctionData(functionName.toString(), [
          arrayOfArgs.toString(),
        ]),
        nonce: nonce,
        gasLimit: 14_999_999,
        gasPrice: maxFee,
      });
      // Send actual tx payload with estimated gas limit
      const txPayload = {
        type: 1,
        to: contractAddress,
        data: iface.encodeFunctionData(functionName.toString(), [
          arrayOfArgs.toString(),
        ]),
        nonce: nonce,
        gasLimit: gasLimit,
        gasPrice: maxFee,
      };
      const tx = await signer.sendTransaction(txPayload);
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      );
      return tx.hash;
    }
    if (txType === "2") {
      const gasData = await fetchGasPriceEIP1559();
      maxFeeInGWEI = gasData.fast.maxFee;
      maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee;
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9);
      maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9);
      // Get the estimated gas limit for this tx payload
      gasLimit = await provider.estimateGas({
        type: 2,
        to: contractAddress,
        data: iface.encodeFunctionData(functionName.toString(), [
          arrayOfArgs.toString(),
        ]),
        nonce: nonce,
        gasLimit: 14_999_999,
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      });
      // Send actual tx payload with estimated gas limit
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
      };
      const tx = await signer.sendTransaction(txPayload);
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      );
      return tx.hash;
    }
  } catch (error) {
    console.log(`Error in handleCallTx: ${error}`);
    process.exit(1);
  }
};

module.exports = handleCallTx;
