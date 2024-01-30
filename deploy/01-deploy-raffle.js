const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../hardhat-helperConfig")
const { verify } = require("../utils/verify")

const FUNDS_AMOUNT = ethers.utils.parseEther("1")

module.exports = async ({getNamedAccounts, deployments})=>{

  const {deployer} =  await getNamedAccounts()
  const {log, deploy} = deployments
  const chainId = network.config.chainId
  let vrfCoordinatorV2MockAddress, subscriptionId
  const entranceFee  = networkConfig[chainId]["entranceFee"]
  const gasLane  = networkConfig[chainId]["gasLane"]
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
  const interval = networkConfig[chainId]["interval"]
  const waitBlockConfirmations = developmentChains.includes(network.name)
  ? 1
  : 6
  
  if (chainId === 31337) {
    const vrfCoordinatorV2Mock  = await ethers.getContract("VRFCoordinatorV2Mock")
     vrfCoordinatorV2MockAddress = vrfCoordinatorV2Mock.address;
     const transactionResponse  = await vrfCoordinatorV2Mock.createSubscription()
     const transactionReciept = await transactionResponse.wait()
     subscriptionId = transactionReciept.events[0].args.subId
     await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUNDS_AMOUNT)
    
  }else{
    vrfCoordinatorV2MockAddress = networkConfig[chainId]["vrfCoordinatorV2"]
    subscriptionId = networkConfig[chainId]["subscriptionId"]
  }
  const args  = [vrfCoordinatorV2MockAddress, entranceFee, gasLane,subscriptionId, callbackGasLimit, interval]
    
   const raffle  = await deploy("Raffle", {from:deployer, args:args, log:true, waitConfirmations:waitBlockConfirmations })
   if (!developmentChains.includes(network.name) && process.env .ETHERSCAN_API_KEY) {
    console.log("verifying....");
     await verify(raffle.address, args)
   }
   console.log("__________________________________");
}
module.exports.tags = ["all", "raffle"]