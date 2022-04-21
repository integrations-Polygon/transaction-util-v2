require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")

const { RPC_PROVIDER, SIGNER_PRIVATE_KEY, EXPLORER_API_KEY } = process.env

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "matic",
  networks: {
    hardhat: {},
    matic: {
      url: RPC_PROVIDER,
      accounts: [SIGNER_PRIVATE_KEY],
    },
    mumbai: {
      url: RPC_PROVIDER,
      accounts: [SIGNER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: EXPLORER_API_KEY,
  },
}
