const hre = require("hardhat");
require('dotenv').config()
const ethers = require("ethers");
const fs = require("fs");

// environment variables
const network = process.env.NETWORK;
const projectID = process.env.PROJECT_ID;
const walletAddress = process.env.PUBLIC_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;
const explorerApiKey = process.env.EXPLORER_API_KEY;
const pKey = process.env.SIGNER_PRIVATE_KEY;

async function fetchAbiData() {
	return (await fetch(`https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${explorerApiKey}`)).json();
}

const fetch = require('node-fetch');
async function fetchGasPrice() {
	// return (await fetch("https://gasstation-mumbai.matic.today/v2")).json();
	return (await fetch("https://ethgasstation.info/api/ethgasAPI.json")).json();
}    

async function main() {

	// Configuring the connection to an Ethereum node
	const provider = new ethers.providers.InfuraProvider(
		network,
		projectID
	);

	// fetch the gas fee estimation from the Polygon Gas Station V2 Endpoint
	const gasData = await fetchGasPrice();
	const gasPrice = gasData.fastest * 10**9;  

	// Get the nonce for the transaction
	const nonce = await provider.getTransactionCount(walletAddress)

	// Create a signing account from a private key
	const signer = new ethers.Wallet(pKey, provider);

	// Fetch the ABI from rinkeby API
	const abiData = await fetchAbiData();
	const abi = abiData.result;

	// Create a contract interface
	const iface = new ethers.utils.Interface(abi);
	
	// Create transaction request
	const txParams = {
	  to: contractAddress,
	  data: iface.encodeFunctionData("echo",[`Hello world at ${Date.now()}!`]),
	  nonce: nonce,
	  gasLimit: 100000,
	  gasPrice: gasPrice
	}

	// Send the Transaction
	await signer.sendTransaction(txParams)
		.then(async (error,txReceipt) => {
			if(!error) { 
				console.log(txReceipt.result)
			}
			else {
				console.log(error)
			}	
	})		
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	}
);
