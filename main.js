var web3 = new Web3(Web3.givenProvider);
var contractInstance;
const contractAddress = "0x1183647d5616A44db74CcAF35433E23367Fbe271";


$(document).ready(async function(){

  window.ethereum.enable().then(function(accounts){
    contractInstance = new web3.eth.Contract(abi,contractAddress, {from : accounts[0]});
    console.log(contractInstance);
    console.log(`Use Contract address: ${contractInstance._address}`);

});


        $("#flip_button").click(async function(){
          await connectMetamask();
          await flipCoin();

          //EVENT LISTENERS
          contractInstance.once('LogNewProvableQuery',
          {
            fromBlock: 'latest'
          }, (error, event) => {
            if(error) throw("Error fetching events");
            jQuery("#events").text(`User ${event.returnValues.player} is waiting for the flip result`);
          });



          contractInstance.once('FlipResult',
          {
            fromBlock: 'latest'
          }, (error, event) => {
            if(error) throw("Error fetching events");
            jQuery("#events").text(`User ${event.returnValues.player} won: ${event.returnValues.amountWon}`);
          });
        });


        $("#get_balance").click(async function() {
          await fetchAndDisplay();
        });
        $("#fund_contract_button").click(async function(){
          await connectMetamask();
          await fundContract();
        });
        $("#withdraw_funds").click(async function(){
          await connectMetamask();
          await withdrawFunds();
        });
        $("#withdraw_all_funds").click(async function(){
          await connectMetamask();
          await withdrawAll();
        });






});





  async function connectMetamask() {
    if (typeof window.ethereum !== undefined) {
      const accounts = await web3.eth.getAccounts();
      if(accounts[0] !== undefined) {
        return web3.utils.toChecksumAddress(accounts[0]);
      }
      jQuery("#playerAddress").text(accounts[0]);
    }
  }


  async function flipCoin(){
        var bet = $("#bet_input").val();
        var config = {
            value: web3.utils.toWei(bet,"ether")
        }
        await contractInstance.methods.flipCoin().send(config)
        .on("transactionHash", function(hash){
            console.log(hash);
        })
        .on("confirmation", function(confirmationNr){
            console.log(confirmationNr);
        })
        .on("receipt", function(receipt){
            console.log(receipt);
            if(receipt.events.FlipResult.returnValues.bool === false){
                alert("You lost " + bet + " Ether!");
            }
            else if(receipt.events.FlipResult.returnValues.bool === true){
                alert("You won " + bet + " Ether!");
            }
        })

      };


      async function fetchAndDisplay(){
          await contractInstance.methods.getBalance().call().then(function(res){
            $("#jackpot_output").text("The Contract has : " + web3.utils.fromWei(res[1], "ether") + "Ether");

          })
      };


      async function fundContract(){
        var fund = $("#fund_contract").val();
        var config = {
          value : web3.utils.toWei(fund, "ether")
        }
        await contractInstance.methods.fundContract().send(config)
        .on("transactionHash", function(hash){
          console.log(hash);
        })
        .on("confirmation", function(confirmationNr){
          console.log(confirmationNr);
        })
        .on("receipt", function(receipt){
          console.log(receipt);
          //contractInstance.methods.getBalance().call().then(function(res){
        //  $("#jackpot_output").text("The Contract has : " + web3.utils.fromWei(res[1], "ether") + "Ether");
        })
      };


      async function withdrawFunds(){
        await contractInstance.methods.withdrawFunds().send();
      };

      async function withdrawAll(){
        await contractInstance.methods.withdrawAll().send();
      };

