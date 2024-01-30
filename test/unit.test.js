const { deployments, ethers, network, getNamedAccounts } = require("hardhat");
const { developmentChains, networkConfig, } = require("../hardhat-helperConfig");

const { assert, expect } = require("chai");

!developmentChains ? describe.skip : describe("Raffle unit tests" ,function () {
     const chainId  = network.config.chainId
    let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
beforeEach(async function() {

    deployer  = (await getNamedAccounts()).deployer
   
    await deployments.fixture(["mocks", "raffle"])
   raffle  = await ethers.getContract("Raffle", deployer)

    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
    raffleEntranceFee = await raffle.getEntranceFee()
    interval = await raffle.getInterval()
})

describe("constructor",  function () {
    it("initializes the raffle correcly", async function () {
        const raffleState = await raffle.getRaffleState()
        assert.equal(raffleState.toString(), "0")       
        assert.equal(interval.toString(), networkConfig[chainId]["interval"]) 
    })
})
    describe("enter raffle",  function () {
        it("reverts if enough ETH is entered", async function () {
         await expect(raffle.enterRaffle() ).to.be.revertedWith("Raffle__NOTENOUGHETH")
        })
        it("records players when they enter", async function () {
           await raffle.enterRaffle({value:raffleEntranceFee})
           const contractPlayer  = await raffle.getPlayers(0)
           assert(contractPlayer, deployer)
        })
        it("emits an event on enter", async function () {
            await expect(raffle.enterRaffle({value:raffleEntranceFee})).to.emit(raffle,  "raffleEnter")
        })
       
    })
    describe("checkUpKeep", function () {
        
  it("returns false if the user does not enter any ETH", async function () {
       await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
       await network.provider.send("evm_mine", [])
       const {upkeepNeeded} = await raffle.callStatic.checkUpkeep([])
       assert(!upkeepNeeded)

  })
//   it("returns false if raffle state is not open", async function () {
//      await raffle.enterRaffle({value:raffleEntranceFee})
//      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
//      await network.provider.send("evm_mine", [])
//      await raffle.performUpkeep([])
//      const raffleState =  await raffle.getRaffleState()
//      const {upkeepNeeded} =  await raffle.callStatic.checkUpkeep([])
//      assert.equal(raffleState.toString(), "1")
//      assert.equal(upkeepNeeded, false)

//   })
it("returns false if enough time hasn't passed", async () => {
    await raffle.enterRaffle({ value: raffleEntranceFee })
    await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]) // use a higher number here if this test fails
    await network.provider.request({ method: "evm_mine", params: [] })
    const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
    assert(!upkeepNeeded)
})
it("returns true if enough time has passed, has players, eth, and is open", async () => {
    await raffle.enterRaffle({ value: raffleEntranceFee })
    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
    await network.provider.request({ method: "evm_mine", params: [] })
    const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
    assert(upkeepNeeded)
})

  
    })
    describe("performUpKeep", async function () {
        // it("can only run if checkUpKeep is true", async function () { 
        //         await raffle.enterRaffle({ value: raffleEntranceFee })
        //         await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
        //         await network.provider.send( "evm_mine", []) 
        //         const tx = await raffle.performUpkeep([])
        //         assert(!tx)
            
        // })
        it("reverts if checkUpKeep is false ", async function () {
            await expect(raffle.performUpkeep("0x")).to.be.revertedWith("Raffle_UPKEEPNOTNEEDED")
        })
        // it("makes sure the raffle state is calculating and a requestId is emitted", async function () {
        //     await raffle.enterRaffle({value:raffleEntranceFee})
        //     await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
        //     await network.provider.request({method: "evm_mine", params:[]})
        //     const perform = await raffle.performUpkeep([])
        //     console.log("hi");
        //     const waitforBlock = await perform.wait(1)
        //     const raffleState = await raffle.getRaffleState()
        //     const requestId = await waitforBlock.events[1].args.requestId
        //     assert(requestId.toNumber() > 1)
        //     assert(raffleState.toNumber() == 1)

        // })
    })
    })