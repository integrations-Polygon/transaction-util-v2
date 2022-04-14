const {
    fetchGasPriceLegacy,
    fetchGasPriceEIP1559,
} = require("../utils/fetchData")

const handleSendTx = async (signer, txType, receiverAddress, amount, nonce) => {
    if (txType === "1") {
        const gasData = await fetchGasPriceLegacy()
        let maxFeeInGWEI = gasData.fastest
        const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
        const txPayload = {
            type: 1,
            to: receiverAddress,
            value: amount,
            nonce: nonce,
            gasLimit: 21000,
            gasPrice: maxFee,
        }
        const tx = await signer.sendTransaction(txPayload)
        console.log(
            `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI.`
        )
        return tx.hash
    }
    if (txType === "2") {
        const gasData = await fetchGasPriceEIP1559()
        let maxFeeInGWEI = gasData.fast.maxFee
        let maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee
        const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
        const maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9)
        const txPayload = {
            type: 2,
            to: receiverAddress,
            value: amount,
            nonce: nonce,
            gasLimit: 21000,
            maxPriorityFeePerGas: maxPriorityFee,
            maxFeePerGas: maxFee,
        }
        const tx = await signer.sendTransaction(txPayload)
        console.log(
            `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI.`
        )
        return tx.hash
    }
    console.log(`Unsupported transaction type ${txType}.`)
}

module.exports = handleSendTx
