const axios = require("axios").default
const explorerApiKey = process.env.EXPLORER_API_KEY

async function fetchGasPriceLegacy() {
    return (await axios.get("https://gasstation-mumbai.matic.today/v1")).data
}

async function fetchGasPriceEIP1559() {
    return (await axios.get("https://gasstation-mumbai.matic.today/v2")).data
}

async function fetchAbiData(contractAddress) {
    return (
        await axios.get(
            `https://api-mumbai.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${explorerApiKey}`
        )
    ).data
}

module.exports = {
    fetchGasPriceLegacy,
    fetchGasPriceEIP1559,
    fetchAbiData,
}
