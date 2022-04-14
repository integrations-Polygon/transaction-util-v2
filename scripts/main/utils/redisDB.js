const Redis = require("redis")
const redisClient = Redis.createClient()

const redisDB = async (mappedReceipt) => {
    try {
        await redisClient.connect()
        if (mappedReceipt.to === null) {
            await redisClient.HSET(mappedReceipt.transactionHash, {
                status: mappedReceipt.status,
                type: mappedReceipt.type,
                from: mappedReceipt.from,
                contractAddress: mappedReceipt.contractAddress,
                blockHash: mappedReceipt.blockHash,
                blockNumber: mappedReceipt.blockNumber,
                cumulativeGasUsed: mappedReceipt.cumulativeGasUsed,
                effectiveGasUsed: mappedReceipt.effectiveGasPrice,
                gasUsed: mappedReceipt.gasUsed,
            })
            return
        }
        await redisClient.HSET(mappedReceipt.transactionHash, {
            status: mappedReceipt.status,
            type: mappedReceipt.type,
            from: mappedReceipt.from,
            to: mappedReceipt.to,
            blockHash: mappedReceipt.blockHash,
            blockNumber: mappedReceipt.blockNumber,
            cumulativeGasUsed: mappedReceipt.cumulativeGasUsed,
            effectiveGasUsed: mappedReceipt.effectiveGasPrice,
            gasUsed: mappedReceipt.gasUsed,
        })
    } catch (error) {
        console.error(error)
    }
}

module.exports = redisDB
