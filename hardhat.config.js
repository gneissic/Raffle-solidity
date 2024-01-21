
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_URL = process.env.SEPOLIA_URL
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY

module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  networks: {
    hardhat:{
      chainId:31337,
      blockConfirmations: 1,
    },
    sepolia:{
      chainId:11155111,
      blockConfirmations:6,
      url:SEPOLIA_URL,
      accounts:[SEPOLIA_PRIVATE_KEY]
    }
  },
  namedAccounts:{
    deployer: {
      default: 0,
    },
    player:{
      default: 1,
    }
  }
};
