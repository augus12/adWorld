<<<<<<< HEAD
# adWorld
Advertisement platform using blockchain
=======

AdWorld - Decentralized Blockchain App

Follow the steps below to download, install, and run this project.

## Dependencies
Install these prerequisites to follow along with the tutorial. 
- NPM: https://nodejs.org version: 6.14.15
- Truffle: https://github.com/trufflesuite/truffle v5.4.15 (core: 5.4.15)
- Solidity v0.5.16 (solc-js)
- Ganache: http://truffleframework.com/ganache/
- Metamask: https://metamask.io/


## Step 1. Clone the project
`git clone https://github.com/augus12/adWorld.git`

## Step 2. Install dependencies
```
$ cd adWorld
$ npm install
```
## Step 3. Start Ganache
Open the Ganache GUI client that you downloaded and installed. This will start your local blockchain instance. 

## Step 4. Compile & Deploy Advertise Smart Contract
`$ truffle migrate --reset`
You must migrate the advertise smart contract each time your restart ganache.

## Step 5. Configure Metamask
- Unlock Metamask
- Connect metamask to your local Etherum blockchain provided by Ganache.
- Import an account provided by ganache.

## Step 6. Run the Front End Application
`$ npm run dev`
Visit this URL in your browser: http://localhost:3000

>>>>>>> master
