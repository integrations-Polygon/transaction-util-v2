const axios = require("axios").default
const explorerApiKey = process.env.EXPLORER_API_KEY

async function fetchGasPriceLegacy() {
  try {
    return (await axios.get("https://gasstation-mainnet.matic.network/v1")).data
  } catch (error) {
    console.log(`Error in fetchGasPriceLegacy: ${error}`)
    process.exit(1)
  }
}

async function fetchGasPriceEIP1559() {
  try {
    return (await axios.get("https://gasstation-mainnet.matic.network/v2")).data
  } catch (error) {
    console.log(`Error in fetchGasPriceEIP1559: ${error}`)
    process.exit(1)
  }
}

async function fetchAbiData(contractAddress) {
  try {
    return (
      await axios.get(
        `https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${explorerApiKey}`
      )
    ).data
  } catch (error) {
    console.log(`Error in fetchAbiData: ${error}`)
    process.exit(1)
  }
}

module.exports = {
  fetchGasPriceLegacy,
  fetchGasPriceEIP1559,
  fetchAbiData,
}
