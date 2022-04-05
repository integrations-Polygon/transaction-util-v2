const hre = require("hardhat");
require('dotenv').config()
const ethers = require("ethers");
const fs = require("fs");

// fetch the ABI
const { abi } = JSON.parse(fs.readFileSync("./artifacts/contracts/Demo.sol/Demo.json"));

const fetch = require('node-fetch');
async function fetchGasPrice() {
    return (await fetch("https://gasstation-mumbai.matic.today/v2")).json();
}

async function main() {

  // Configuring the connection to an Ethereum node
  const wallet = process.env.SIGNER_PRIVATE_KEY
  const provider = ethers.getDefaultProvider(
      process.env.POLYGON_MUMBAI_RPC_PROVIDER
  );
  
  // fetch the gas fee estimation from the Polygon Gas Station V2 Endpoint
  const gasData = await fetchGasPrice()
  const gasLimit = 50000;  
  const nonce = await hre.ethers.provider.getTransactionCount(process.env.PUBLIC_KEY)
  // Using the signing account to deploy the contract
  const signer = new ethers.Wallet(wallet, provider);

  // Create a contract interface
  const iface = new ethers.utils.Interface(abi);
  
  // Create transaction request
  const tx = {
    // Address of the contract we want to call
    to: process.env.CONTRACT_ADDRESS,
    // Encoded data payload representing the contract method calla
    data: iface.encodeFunctionData("echo",[`Hello world at ${Date.now()}!`]),
    nonce: nonce,
    gasLimit: ethers.utils.hexlify(gasLimit), // 50000
    gasPrice: gasData.fast.maxFee
  }

  // Generate Hash of the transaction to sign
  const txnHashToSign = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
        ["address","bytes","uint","uint","unit"],
        [tx.to, tx.data, tx.nonce, tx.gasLimit, tx.gasPrice]
    )
  );

  // Sign the transaction hash
  const signedTxnHash = await signer.signMessage(
    ethers.utils.arrayify(txnHashToSign)
  );

  // Send the Transaction
  const transactionHash = await provider.sendTransaction(signedTxnHash);
  console.log("Mining transaction...");
  console.log("transactionHash is ",transactionHash);

  console.log(`https://mumbai.polygonscan.com/tx/${contract.deployTransaction.hash}`);

  // Waiting for the transaction to be mined
  await contract.deployed();
  // The contract is now deployed on chain!
  console.log(`Contract deployed at ${contract.address}`);
  console.log(data);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
