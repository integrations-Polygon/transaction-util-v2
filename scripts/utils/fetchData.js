const fetch = require("node-fetch")
const explorerApiKey = process.env.EXPLORER_API_KEY

async function fetchGasPrice() {
    // return (await fetch("https://gasstation-mumbai.matic.today/v2")).json()
    return (await fetch("https://ethgasstation.info/api/ethgasAPI.json")).json()
}

async function fetchAbiData(contractAddress) {
    return (
        await fetch(
            `https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${explorerApiKey}`
        )
    ).json()
}

module.exports = {
    fetchGasPrice,
    fetchAbiData,
}
