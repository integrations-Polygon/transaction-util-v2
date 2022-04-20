const {
    fetchGasPriceLegacy,
    fetchGasPriceEIP1559,
  } = require("../utils/fetchData")
const { ConstructorFragment } = require("@ethersproject/abi")

  const handleDeployTx = async (
    signer,
    txType,
    nonce,
    metadata,
    provider,
    arrayOfArgs,
    iface
  ) => {
    let gasLimit
    if (txType === "1") {
      const gasData = await fetchGasPriceLegacy()
      maxFeeInGWEI = gasData.fastest
      maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
      // Get the estimated gas limit for this tx payload
      gasLimit = await provider.estimateGas({
        type: 1,
        nonce: nonce,
        data: iface.encodeFunctionData(ConstructorFragment, [
          arrayOfArgs.toString(),
      ]),
        gasLimit: 14_999_999,
        gasPrice: maxFee,
      })
      // Send transaction payload with the estimated gas limit
      const txPayload = {
        type: 1,
        nonce: nonce,
        data: iface.encodeFunctionData(ConstructorFragment, [
          arrayOfArgs.toString(),
      ]),
        gasLimit: gasLimit,
        gasPrice: maxFee,
      }

      const factory = new ContractFactory(metadata.abi, metadata.bytecode, signer)
      const contract = await factory.deploy(txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      ) 
      // Get transaction receipt
      const tx = await contract.deployed()

      console.log(`Deployment successful! Contract Address: ${contract.address}`)
      console.log(`To verify your deployed smart contract: npx hardhat verify ${contract.address}`)

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
        data: iface.encodeFunctionData(ConstructorFragment, [
          arrayOfArgs.toString(),
      ]),
        nonce: nonce,
        gasLimit: 14_999_999,
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      })
      // Send transaction payload with the estimated gas limit
      const txPayload = {
        type: 2,
        nonce: nonce,
        data: iface.encodeFunctionData(ConstructorFragment, [
          arrayOfArgs.toString(),
      ]),
        gasLimit: gasLimit,
        maxPriorityFeePerGas: maxPriorityFee,
        maxFeePerGas: maxFee,
      }
      const factory = new ContractFactory(metadata.abi, metadata.bytecode, signer)
      const contract = await factory.deploy(txPayload)
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      ) 
      // Get transaction receipt 
      tx = await contract.deployed()

      console.log(`Deployment successful! Contract Address: ${contract.address}`)
      console.log(`To verify your deployed smart contract: npx hardhat verify ${contract.address}`)

      return tx.hash
    }
    console.log(`Unsupported transaction type ${txType}`)
  }

module.exports = handleDeployTx
