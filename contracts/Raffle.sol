// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.7;
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

 error Raffle__NOTENOUGHETH();
 error Raffle_BALANCETRANSFERFAILED();
  error Raffle__RAFFLENOTOPEN();
  error Raffle_UPKEEPNOTNEEDED(uint256 currentBalance, uint256 players, uint256 raffleState);
  

contract Raffle is VRFConsumerBaseV2, AutomationCompatible{
   // Type declaration
    enum RaffleState {OPEN, CALCULATING }


 uint256 private  immutable i_entranceFee;
 address payable[] public s_players;
 VRFCoordinatorV2Interface public immutable i_vrfCoordinator;
 bytes32 private immutable i_gasLane;
 uint64 private immutable  i_subscriptionId;
 uint16 private constant REQUEST_CONFIRMATIONS = 3;
 uint32  private immutable i_callbackGasLimit;
 uint32 private constant NUM_WORDS =1;
 uint256 private s_lastTimeStamp;
 uint256 private immutable i_interval;
 RaffleState private s_raffleState;

 /*  events */
  event raffleEnter(address indexed player);
  event requestedRaffleWinner(uint256 indexed requestId);
  event randomWinnerPicked(address indexed theWinner);
  //state variables
  address private s_recentWinner;

 constructor  (address vrfCoordinatorV2,  uint256 entranceFee,  bytes32 gasLane, uint64 subscriptionId, uint32 callbackGasLimit, uint256 interval ) VRFConsumerBaseV2(vrfCoordinatorV2) {
    i_entranceFee = entranceFee;
    i_vrfCoordinator  = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
    i_callbackGasLimit = callbackGasLimit;
    s_raffleState = RaffleState.OPEN;
    s_lastTimeStamp = block.timestamp;
    i_interval = interval;
   

}
   function enterRaffle() public payable {
    if(msg.value < i_entranceFee){
       revert Raffle__NOTENOUGHETH(); 
    }
    if (s_raffleState != RaffleState.OPEN) {
      revert Raffle__RAFFLENOTOPEN();
    } 
    s_players.push(payable(msg.sender));
    emit raffleEnter(msg.sender);
 }
 function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen =  (RaffleState.OPEN == s_raffleState);
        bool hasPlayers  = s_players.length > 0;
        bool hasBalance  =  address (this).balance > 0 ;
        bool timeIsValid  = ((block.timestamp - s_lastTimeStamp) > i_interval );
        upkeepNeeded = (isOpen && hasPlayers && hasBalance && timeIsValid);
        return (upkeepNeeded, "0x0");
    }

  function performUpkeep(bytes calldata /* performData */) external override {
  (bool upkeepNeeded, ) = checkUpkeep("");
  if (!upkeepNeeded) {
        revert Raffle_UPKEEPNOTNEEDED(address(this).balance,
                s_players.length,
                uint256(s_raffleState));
  }
   s_raffleState = RaffleState.CALCULATING;
      uint256 requestId =   i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit requestedRaffleWinner(requestId);
        


 }
 function fulfillRandomWords(  uint256, /*_requestId*/ uint256[] memory _randomWords ) internal override{
     uint256 indexOfWinner = _randomWords[0] % s_players.length;
     address payable addressOfWinner  = s_players[indexOfWinner];
     s_recentWinner = addressOfWinner;
     s_players = new address payable[](0);
     s_raffleState = RaffleState.OPEN;
     s_lastTimeStamp =  block.timestamp;
     
       (bool success, ) = addressOfWinner.call{value: address(this).balance}("");
       if (!success) {
         revert Raffle_BALANCETRANSFERFAILED();
       } 
    emit randomWinnerPicked(addressOfWinner);
 }

 function getEntranceFee() public view returns(uint256) {
    return i_entranceFee;
 }
 function getPlayers(uint256 index) public view returns(address) {
    return s_players[index];
 }
 function getRecentWinner() public view returns (address) {
   return s_recentWinner;
 }
 function getRaffleState() public view returns (RaffleState) {
   return s_raffleState;
 }
 function getNumWords() public pure returns (uint32) {
   return NUM_WORDS;
 }
 function getNumberOfPlayers () public view returns(uint256){
   return s_players.length;
 }
 function getRequestConfirmations () public pure returns(uint256){
   return REQUEST_CONFIRMATIONS;
 }
 function getInterval () public view returns(uint256){
   return i_interval;
 }
 function getLatestTimeStamp() public view returns(uint256) {
  return s_lastTimeStamp;
 }
}