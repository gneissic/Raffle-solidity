/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
 const ETHERSCAN_API_KEY  = process.env.ETHERSCAN_API_KEY

// Your API key for Etherscan, obtain one at https://etherscan.io/



module.exports = {
  solidity: "0.8.7",
  networks: {
    hardhat: {
      chainId: 31337,
  },
  localhost: {
      chainId: 31337,
  },
  sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      //   accounts: {
      //     mnemonic: MNEMONIC,
      //   },
      saveDeployments: true,
      chainId: 11155111,
  },
},
gasReporter: {
  enabled: false,
  currency: "USD",
  outputFile: "gas-report.txt",
  noColors: true,
  // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
},
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
        default: 1,
    },
},
etherscan: {
  // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
  apiKey: {
      sepolia: ETHERSCAN_API_KEY,
  },
  customChains: [
      {
          network: "goerli",
          chainId: 5,
          urls: {
              apiURL: "https://api-goerli.etherscan.io/api",
              browserURL: "https://goerli.etherscan.io",
          },
      },
  ],
},
  
};
