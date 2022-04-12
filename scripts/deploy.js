const ps = require("prompt-sync")
const prompt = ps()
const fs = require('fs')
require('dotenv').config()
const hre = require("hardhat")
const ethers = require('ethers')
const redisDB = require("./utils/redisDB")
const dataMapping = require("./utils/dataMapping")
const {fetchGasPrice} = require("./utils/fetchData")
const waitForConfirmation = require("./utils/waitForComfirmation")


// env variables 
const privateKey = process.env.SIGNER_PRIVATE_KEY
const projectID = process.env.PROJECT_ID
const network = process.env.NETWORK


const Deployment = async (network, projectID) => {
  try{

    // Set initial txReceipt and gas price and gasIncrement
		let gasPrice = 0
		let txReceipt = null

    // later we can change this to mumbai
    // Configuring the connection to an Rinkeby node
    const provider = new ethers.providers.InfuraProvider(
    network,
    projectID
    );

    // Use your wallet's private key to deploy the contract
    const wallet = new ethers.Wallet(privateKey, provider)

	// Read the contract artifact, which was generated by Hardhat
    const dir = prompt(
        "Enter the smart contract artifact file directory: "
    )
	if(!dir) return console.log("Contract path cannot be null")
	const metadata = JSON.parse(fs.readFileSync(dir))
		
    while(txReceipt == null) {

      // Fetch the gas fee estimation from the Polygon Gas Station V2 Endpoint
      const gasData = fetchGasPrice()
      const gasLimit = 200000;
      const gasInGWEI = gasData.fastest 
      gasPrice = gasInGWEI * 10**9

      // Set gas limit and gas price
      const options = {gasLimit: gasLimit, gasPrice: gasPrice}

      // Deploy the contract
      const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, wallet)
      const contract = await factory.deploy(options)
      
      // Get the transaction hash after the deployment
      const txHash = await contract.deployTransaction.hash

      console.log("The contract is being mined...\n")
	    console.log(`The gas price being used is ${gasInGWEI} GWEI.`)
	    console.log(`The generated transaction hash is ${txHash}.\n`)
	    console.log('While your contract is being mined, you can check your transaction at:');
      console.log(`https://rinkeby.etherscan.io/tx/${txHash}\n`)
      
      // Wait for confirmation and get the txReceipt
      txReceipt = await waitForConfirmation(provider, txHash)

      if(txReceipt == null) {
			console.log("\nTransaction failed...Trying again!\n");
		}
    }

    // Wait for the contract to get mined
    await contract.deployed()
    console.log(`Deployment successful! Contract Address: ${contract.address}`)

    // Return the success receipt
    return txReceipt

  } catch (error) {
		console.log("error in Deployment", error)
		return "error in Deployment"
	}
}


async function startDeployment() {
	console.log("\nStarting the transaction process.\n")
	console.log("Fetching all the necessary data to start mining.\n")
	let txReceipt = await Deployment(network, projectID)

	// Store the success txReceipt in Redis DB & JSON file
	const mappedReceipt = await dataMapping(txReceipt)
	await saveReceipt(mappedReceipt)
	await redisDB(mappedReceipt)
}

startDeployment()
	.then(() => {
		console.log("Deployment was successful and confirmed by 12 blocks.\n")
		process.exit(0)
	})
	.catch((error) => {
		console.error(error)
		process.exit(1)
	}
)    
