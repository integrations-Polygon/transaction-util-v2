const ethers = require('ethers');
const fs = require('fs');
const hre = require("hardhat");
require('dotenv').config()
const fetch = require('node-fetch');



async function fetchGasPrice() {
    return (await fetch("https://gasstation-mumbai.matic.today/v2")).json();
}


async function main() {

  // Configuring the connection to a mumbai node
  const wallet = process.env.SIGNER_PRIVATE_KEY
  const provider = ethers.getDefaultProvider(process.env.POLYGON_MUMBAI_RPC_PROVIDER)

  // Use your wallet's private key to deploy the contract
  const privateKey = process.env.PRIVATE_KEY
  const signer = new ethers.Wallet(privateKey, provider)

  // Read the contract artifact, which was generated by Hardhat
  const metadata = JSON.parse(fs.readFileSync('Demo.json').toString())

  // fetch the gas fee estimation from the Polygon Gas Station V2 Endpoint
  const gasData = await fetchGasPrice()
  const gasLimit = 50000;  
  const gasPrice = gasData.fast.maxPriorityFee * 10**9;

  // Set gas limit and gas price
  const options = {gasLimit: gasLimit, gasPrice: gasPrice}

  // Deploy the contract
  const factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, wallet)
  const contract = await factory.deploy(options)
  await contract.deployed()
  console.log(`Deployment successful! Contract Address: ${contract.address}`)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });