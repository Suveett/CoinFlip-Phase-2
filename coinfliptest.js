const Coinflip = artifacts.require("Coinflip");
const truffleAssert = require("truffle-assertions");

contract("Coinflip", async function(accounts){
  let instance;

  before(async function(){
    instance = await Coinflip.deployed();
  });

  it("The Bet shouldn't go through without sufficient balance", async function(){

    await truffleAssert.fails(instance.flipCoin({value : web3.utils.toWei("0.008", "ether"), from : accounts[1]}),truffleAssert.ErrorType.REVERT);
  });

  it("Non owner should not be able to withdraw funds", async function(){


    await truffleAssert.fails(instance.withdrawAll({from : accounts[1]}), truffleAssert.ErrorType.REVERT);
  });
  it("Owner should be able to withdraw funds", async function(){


    await truffleAssert.passes(instance.withdrawAll({from : accounts[0]}), "Owner is not able to withdraw funds from Contract");
  });
  it("Non owner not allowed to fund contract", async function(){
    await truffleAssert.fails(instance.fundContract({from : accounts[1], value: web3.utils.toWei("0.80", "ether")}), truffleAssert.ErrorType.REVERT);
  });
  it("Should allow owner to fund Contract", async function(){
    await truffleAssert.passes(instance.fundContract({from : accounts[0], value : web3.utils.toWei("0.80", "ether")}),
    "Owner not being able to fund the contract");
  });
  it("Owner balance should increase post withdrawal", async function(){

    let ownerOldBalance = parseFloat(await web3.eth.getBalance(accounts[0]));
    await instance.withdrawAll({from : accounts[0]});
    let ownerNewBalance = parseFloat(await web3.eth.getBalance(accounts[0]));
    assert(ownerNewBalance > ownerOldBalance, "Owner's Balance has not increased after Withdrawal");
  });
  it("Contract balance should go to 0 post withdrawal", async function(){
    await instance.withdrawAll({from : accounts[0]});
    let balance = await instance.contractBalance();
    let floatBalance = parseFloat(balance);
    let realBalance =  parseFloat(await web3.eth.getBalance(instance.address));
    assert(floatBalance == web3.utils.toWei("0", "ether") && floatBalance === realBalance);
  });
});
