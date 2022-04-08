require('dotenv').config()
const fs = require('fs')
const ethers = require("ethers")
const fetch = require('node-fetch')
const ps = require('prompt-sync')
const prompt = ps()

// environment variables
const network = process.env.NETWORK
const projectID = process.env.PROJECT_ID
const pKey = process.env.SIGNER_PRIVATE_KEY
const walletAddress = process.env.PUBLIC_KEY
const explorerApiKey = process.env.EXPLORER_API_KEY

const contractFunctionCall = async (contractAddress, network, projectID) => {

	try {
		// Set initial txReceipt and gas price
		let gasPrice = 0
		let txReceipt = null
		
		// Configuring the connection to an Ethereum node
		const provider = new ethers.providers.InfuraProvider(
			network,
			projectID
		)
			
		// Create a signing account from your private key
		const signer = new ethers.Wallet(
			pKey,
			provider
		)

		// Fetch the ABI from rinkeby API
		const abiData = await fetchAbiData(contractAddress)
		const abi = abiData.result
		
		// Create a contract interface
		const iface = new ethers.utils.Interface(abi)
		
		// Retry sending transaction utill success
		while(txReceipt === null) {
			// fetch the gas fee estimation from the Polygon Gas Station V2 Endpoint
			const gasData = await fetchGasPrice()
			gasInGWEI = gasData.fastest
			gasPrice = gasInGWEI * 10**9
				
			// Get the nonce for the transaction
			const nonce = await provider.getTransactionCount(walletAddress)

			// Handle the transaction and send it to the network
			const txHash = await handleTransaction(
				signer,
				contractAddress, 
				iface,
				nonce,
				gasPrice
			)
			
			console.log("The transaction is being mined...\n")
			console.log(`The gas price being used is ${gasInGWEI} GWEI.`)
			console.log(`The generated transaction hash is ${txHash}.\n`)
			console.log('You can check your transaction at:')
			console.log(`https://rinkeby.etherscan.io/tx/${txHash}\n`)
			console.log('Waiting for 12 Block Confirmations (checks every 15 second)\n')
				
			// Wait for confirmation and get the txReceipt
			txReceipt = await waitForConfirmation(provider, txHash)

			if(txReceipt === null) {
				console.log("\nTransaction failed...Trying again!\n")
			}
		}
		// Return the succeed txReceipt
		return txReceipt
	} catch (error) {
		console.log("error in contractFunctionCall", error)
		return "error in contractFunctionCall"
	}
}

const handleTransaction = async (signer, contractAddress, iface, nonce, gasPrice) => {
	
	// Create transaction request object
	const txParams = {
		to: contractAddress,
		data: iface.encodeFunctionData("echo",[`Hello world at ${Date.now()}!`]),
		nonce: nonce,
		gasLimit: 100000,
		gasPrice: gasPrice
	}

	// Send the Transaction
	const tx = await signer.sendTransaction(txParams)
	return tx.hash
}

const waitForConfirmation = async (provider, txHash) => {

	try {
		let i = 0
		while(i < 20) {
			if(await isConfirmed(provider, txHash, 12)) {

				console.log("\n")
				console.log(txHash, 'was confirmed by 12 blocks')

				// Returns the transaction receipt for the txHash
				const txReceipt = await provider.getTransactionReceipt(txHash)

				// Returns the txReceipt if the txReceipt is not null
				if(txReceipt != null) return txReceipt
			}
			// Increment i
			i += 1
			
			// Wait for 15000 ms and check if the transaction gets 12 block confirmation on the next run
			await sleep(15000)
		}
		return null
	} catch (error) {
		console.log("error in waitForConfirmation", error)
		return null
	}
}

const isConfirmed = async (provider, txHash, blocks) => {
	try {
		// Returns the transaction's hash
		const tx = await provider.getTransaction(txHash)

		if(!tx || !tx.blockNumber) {
			return false
		}

		// Returns the most recently mined blockNumber
		const lastestBlockNumber = await provider.getBlockNumber()

		// Display the number of confirmed blocks
		console.log(`${lastestBlockNumber - tx.blockNumber} Block Confirmations `)
		
		// Check if the block confirmation is more than or equal to 12 blocks
		if(lastestBlockNumber - tx.blockNumber >= blocks) {
			return true
		} else {
			return false
		}
	} catch (error) {
		console.log("error in isConfirmed", error)
		return false
	}
}

const dataMapping = async (txReceipt) => {

	const mappedReceipt = {
		status 						:				txReceipt.status,
		type						:				txReceipt.type,
		from						:				txReceipt.from,
		to						:				txReceipt.to,
		blockHash					:				txReceipt.blockHash,
		blockNumber					:				txReceipt.blockNumber,
		transactionHash					:				txReceipt.transactionHash,
		cumulativeGasUsed 				:				txReceipt.cumulativeGasUsed.toString(),
		effectiveGasPrice				:				txReceipt.effectiveGasPrice.toString(),
		gasUsed						:				txReceipt.gasUsed.toString()
	}

	return mappedReceipt
}

const saveReceipt = async (mappedReceipt) => {

	try {
		if(fs.existsSync("log/call_log.json")) {
			const existingLog = fs.readFileSync("log/call_log.json")
			const parseLog = JSON.parse(existingLog)
			const jsonString = await JSON.stringify(parseLog, null, 2) // indentation by 2
			fs.writeFileSync("log/call_log.json", jsonString)
		} else {
			const jsonString = await JSON.stringify(mappedReceipt, null, 2) // indentation by 2
			fs.writeFileSync("log/call_log.json", jsonString) 
		}	
		console.log("\nTransaction receipt has been logged successfully in the log folder.\n")
	} catch(e) {
		console.error(e)
	}
}	

function sleep(ms) {
	return new Promise(resolve => setTimeout(
		resolve,
		ms
	))
}

async function fetchAbiData(contractAddress) {
	return (await fetch(
		`https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${explorerApiKey}`
	)).json()
}

async function fetchGasPrice() {
	// return (await fetch("https://gasstation-mumbai.matic.today/v2")).json()
	return (await fetch(
		"https://ethgasstation.info/api/ethgasAPI.json"
	)).json()
}

async function startTransaction() {
	console.log("\nStarting the transaction process.\n")

	const contractAddress = prompt('Input the deployed and verified smart contract address: ')
	console.log("Fetching all the necessary data to start mining.\n")

	const txReceipt = await contractFunctionCall(contractAddress, network, projectID)
	console.log("Transaction was mined successfully and confirmed by 12 blocks.\n")

	const mappedReceipt = await dataMapping(txReceipt)
	// Store the success mappedReceipt in JSON file
	saveReceipt(mappedReceipt)

}

startTransaction()
	.then(() => {
		console.log("Transaction process completed.\n\n")
		process.exit(0)
	})
	.catch((error) => {
		console.error(error)
		process.exit(1)
	}
)    