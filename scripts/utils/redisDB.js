const Redis = require("redis")
const redisClient = Redis.createClient()

const redisDB = async (mappedReceipt) => {
    try {
        await redisClient.connect()
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "status",
            mappedReceipt.status
        )
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "type",
            mappedReceipt.type
        )
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "from",
            mappedReceipt.from
        )
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "to",
            mappedReceipt.to
        )
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "blockHash",
            mappedReceipt.blockHash
        )
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "blockNumber",
            mappedReceipt.blockNumber
        )
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "cumulativeGasUsed",
            mappedReceipt.cumulativeGasUsed
        )
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "effectiveGasUsed",
            mappedReceipt.effectiveGasPrice
        )
        await redisClient.HSET(
            mappedReceipt.transactionHash,
            "gasUsed",
            mappedReceipt.gasUsed
        )
        await redisClient.quit()
    } catch (error) {
        console.error(error)
    }
}

module.exports = redisDB
