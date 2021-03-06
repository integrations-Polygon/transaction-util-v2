# Transaction-Util-V2

Transaction-util is a utility for sending transactions to the Polygon network in a robust manner.

## Getting started
- Clone this repository
```sh
git clone https://github.com/integrations-Polygon/transaction-util-v2.git
```
- Navigate to `transaction-util-v2`
```sh
cd transaction-util-v2
```
- Install dependencies
```sh
npm install
```
- Create `.env` file
```sh
cp .example.env .env
```
- Configure environment variables in `.env`
```
NETWORK = your_network_name // matic for polygon mainnet
PROJECT_ID = your_provider_project_id
RPC_PROVIDER = your_provider_rpc_url
SIGNER_PRIVATE_KEY = your_private_key
PUBLIC_KEY = your_public_key
EXPLORER_API_KEY = your_explorer_api_key
```

## Usage
Start the Main script by running this command
```javascript
npx hardhat run ./scripts/startTransaction.js

```
After that you will be presented with 3 options to choose from:

### Option 1: Deploy your smart contract
First, you will be asked to enter the Transaction type you would like to proceed with:  
- Select 1 for legacy  
- Select 2 for EIP-1559
Second, you will have to enter the contract's artifact generated by hardhat, here's an example:  
```javascript
.\artifacts\contracts\Demo.sol\Demo.json    

```
If the contract has an arguments in its constructor, you wil be asked to enter them.  
  
After that, the script will fetch the gas price from polygon gas station and deploy the contract and wait for 64 block comfirmation.
Then a receipt of the Transaction will be saved in  a JSON file and in Redis Database.

Finally you can Verify the deployed smart contract by running this command:
```javascript
npx hardhat verify txReceipt.contractAddress,...arrayOfArgs

```

### Option 2: Call a function of deployed smart contract
First, you will be asked to enter the Transaction type you would like to proceed with:  
- Select 1 for legacy  
- Select 2 for EIP-1559

Second, you will have to enter the address of the already deployed and verified smart contract, here's an example:  
```javascript
0xCCFD7490d9F4a44d3664CDCF5E2721863C507e81   

```
Then you will be asked to enter the name of the function you want to call, for example:  
```javascript
myFunction   

```
After that you will have to enter the arguments of the function.

Finally the script will fetch the ABI from the blockchain, initialize all the interfaces, sign the transaction and send it to the network which will result in a receipt that wil be stored in a JSON file and in redis Database after waiting for 64 block confirmation.


### Option 3: Send MATIC tokens to a receiving account address
First, you will be asked to enter the Transaction type you would like to proceed with:  
- Select 1 for legacy  
- Select 2 for EIP-1559

Second, you will have to enter the address of the receiver, here's an example:  
```javascript
0x248072cdAd067B95ed80E55a5c7a46Cf50b18e64   
```
After that you will have to enter the amount of MATIC to be sent.
Then you will enter "Y" to confirm that you want to proceed with the transfer or type "N" to exit.

Finally, the script will fetch the gas price from polygon gas station, send the MATIC tokens and waiting for 64 block comfirmation.
Then a receipt of the Transaction will be saved in  a JSON file and in Redis Database.
