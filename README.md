# Transaction-Util-V2

This repository contains the Hardhat Polygon development environment for the development and testing of the Transaction util v2.

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
NETWORK = your_network_name
PROJECT_ID = your_provider_project_id
RPC_PROVIDER = your_provider_rpc_url
SIGNER_PRIVATE_KEY = your_private_key
PUBLIC_KEY = your_public_key
EXPLORER_API_KEY = your_explorer_api_key
```

### Run Scripts
```sh
npx hardhat run ./scripts/startTransaction.js
```
