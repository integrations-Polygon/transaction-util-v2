const ethers = require('ethers');
const fs = require('fs');
const hre = require("hardhat");
require('dotenv').config()
const fetch = require('node-fetch');



//env variables 
const privateKey = process.env.SIGNER_PRIVATE_KEY
const networkPRC = process.env.RINKEBY_RPC_PROVIDER

async function fetchGasPrice() {
    return (await fetch("https://ethgasstation.info/api/ethgasAPI.json")).json();
}

async function main() {

  // Configuring the connection to a rinkeby node
  //later we can change this to mumbai
  const provider = ethers.providers.getDefaultProvider('rinkeby')

  // Use your wallet's private key to deploy the contract
  const wallet = new ethers.Wallet(privateKey, provider)

  // Read the contract artifact, which was generated by Hardhat
  const metadata = JSON.parse(fs.readFileSync('Demo.json').toString())

  // fetch the gas fee estimation from the Polygon Gas Station V2 Endpoint
  const gasData = await fetchGasPrice()
  const gasLimit = 21000;  
  const gasPrice = gasData.fastest * 10**9;

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