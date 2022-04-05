require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const { POLYGON_MUMBAI_RPC_PROVIDER, SIGNER_PRIVATE_KEY, POLYGONSCAN_API_KEY } = process.env; 

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "mumbai",
  networks: {
    hardhat: {
    },
    polygon_mumbai: {
      url: POLYGON_MUMBAI_RPC_PROVIDER,
      accounts: [`0x${SIGNER_PRIVATE_KEY}`]
  
    },
  },
};
