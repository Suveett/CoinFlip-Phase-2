var web3 = new Web3(Web3.givenProvider);
var contractInstance;
const contractAddress = "0xD447a5774877126474A903F5947A5Ffd756a5251";

$(document).ready(async function(){
  contractInstance = new web3.eth.Contract(abi,contractAddress);
  await connectMetamask();

    console.log(contractInstance);
    console.log(`Use Contract address: ${contractInstance._address}`)



    $("#flip_button").click(flipCoin);
    $("#get_balance").click(fetchAndDisplay);
    $("#fund_contract_button").click(fundContract);
    $("#withdraw_funds").click(withdrawAll);



});

//EVENT LISTENERS

contractInstance.once('LogNewProvableQuery',
{
  filter: { player: await getPlayerAddress() },
  fromBlock: 'latest'
}, (error, event) => {
  if(error) throw("Error fetching events");
  jQuery("#events").text(`User ${event.returnValues.player} is waiting for the flip result`);
});

contractInstance.once('FlipResult',
{
  filter: { player : await getPlayerAddress() },
  fromBlock: 'latest'
}, (error, event) => {
  if(error) throw("Error fetching events");
  jQuery("#events").text(`User ${event.returnValues.player} won: ${event.returnValues.amountWon}`);
});
});


async function connectMetamask() {
  if (typeof window.ethereum !== undefined) {
    const accounts = await web3.eth.requestAccounts();
    let p = await getPlayerAddress();
    jQuery("#playerAddress").text(p);
  }
}

async function getPlayerAddress() {
  const playerAddr = await web3.eth.getAccounts();
  if(playerAddr[0] !== undefined) {
    return web3.utils.toChecksumAddress(playerAddr[0]);
  }
}






  async function flipCoin(){
        var bet = $("#bet_input").val();
        var config = {
            value: web3.utils.toWei(bet,"ether")
        }
        contractInstance.methods.flipCoin().send(config, {from : await getPlayerAddress()})
        .on("transactionHash", function(hash){
            console.log(hash);
        })
        .on("confirmation", function(confirmationNr){
            console.log(confirmationNr);
        })
        .on("receipt", function(receipt){
            console.log(receipt);
            if(receipt.events.betPlaced.returnValues[2] === false){
                alert("You lost " + bet + " Ether!");
            }
            else if(receipt.events.betPlaced.returnValues[2] === true){
                alert("You won " + bet + " Ether!");
            }
        })

      };


      async function fetchAndDisplay(){
          contractInstance.methods.getBalance().call({from : await getPlayerAddress()}).then(function(res){
            $("#jackpot_output").text("The Contract has : " + web3.utils.fromWei(res[1], "ether") + "Ether");

          })
      };


      async function fundContract(){
        var fund = $("#fund_contract").val();
        var config = {
          value : web3.utils.toWei(fund, "ether")
        }
        contractInstance.methods.fundContract().send(config, {from : await getPlayerAddress()})
        .on("transactionHash", function(hash){
          console.log(hash);
        })
        .on("confirmation", function(confirmationNr){
          console.log(confirmationNr);
        })
        .on("receipt", function(receipt){
          contractInstance.methods.getBalance().call().then(function(res){
          $("#jackpot_output").text("The Contract has : " + web3.utils.fromWei(res[1], "ether") + "Ether");
        })
      };


      async function withdrawAll(){
        contractInstance.methods.withdrawAll().send({from : await getPlayerAddress()});
      };
