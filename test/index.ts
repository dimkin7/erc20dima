import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
//import { ERC20Dima__factory, ERC20Dima } from "../typechain";
//import type { Signer } from "ethers";

//по мотивам
//https://yuichiroaoki.medium.com/testing-erc20-smart-contracts-in-typescript-hardhat-9ad20eb40502

describe("ERC20Dima", function () {
  let erc20: Contract;
  let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress;
	const addrZero = "0x0000000000000000000000000000000000000000";


  //beforeEach передеплой контракта
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const factoryERC20Dima = await ethers.getContractFactory("ERC20Dima") ;
    erc20 = await factoryERC20Dima.deploy(1000);
    await erc20.deployed();
  });


  it("ERC20 names", async function () {

    expect(await erc20.name()).to.equal("DimaToken");
    expect(await erc20.symbol()).to.equal("DIT");
    expect(await erc20.decimals()).to.equal(18);
  });

  it("ERC20 balance", async function () {
    expect( await erc20.balanceOf(owner.address) ).to.equal(1000);

    //увеличим баланс
    await erc20.mint(owner.address, 1000);
    expect( await erc20.balanceOf(owner.address) ).to.equal(2000);
    //уменьшим
    await erc20.burn(owner.address, 500);
    expect( await erc20.balanceOf(owner.address) ).to.equal(1500);
    //итого
    expect( await erc20.totalSupply() ).to.equal(1500);
  });

  //передача
  it("ERC20 transfer", async function () {
    await erc20.transfer(addr1.address, 200);
    expect( await erc20.balanceOf(addr1.address) ).to.equal(200); //получатель
    expect( await erc20.balanceOf(owner.address) ).to.equal(800); //я
    expect( await erc20.totalSupply() ).to.equal(1000); //итого
  });

  //разрешение
  it("ERC20 approve", async function () {
    //console.log("owner:" + owner.address); 
    //console.log("addr1:" + addr1.address); 
    //console.log("addr2:" + addr2.address); 
    
    expect( await erc20.allowance(owner.address, addr1.address) ).to.equal(0);  //разрешено 0
    await erc20.approve(addr1.address, 200);
    await erc20.approve(addr2.address, 20); //для тестирования if
    expect( await erc20.allowance(owner.address, addr1.address) ).to.equal(200);  //разрешено 200
    expect( await erc20.allowance(owner.address, addr2.address) ).to.equal(20);  //второму разрешено 20

    // We use .connect(signer) to send a transaction from another account
    await erc20.connect(addr1).transferFrom(owner.address, addr2.address, 50); //передает 50
    
    expect(  erc20.connect(addr1).transferFrom(owner.address, addr2.address, 160)).to.be.revertedWith("Not enough allowance."); //пытаемся 160


    expect( await erc20.balanceOf(owner.address) ).to.equal(950);  //я
    expect( await erc20.balanceOf(addr2.address) ).to.equal(50); //2-й
    expect( await erc20.allowance(owner.address, addr1.address) ).to.equal(150);  //разрешено 150

    await erc20.approve(addr1.address, 10); //сбрасываем на 10
    expect( await erc20.allowance(owner.address, addr1.address) ).to.equal(10);  //разрешено 10

    await erc20.increaseAllowance(addr1.address, 20); //добавляем 20
    expect( await erc20.allowance(owner.address, addr1.address) ).to.equal(30);  //разрешено 30

    await erc20.decreaseAllowance(addr1.address, 5); //убавляем 5
    expect( await erc20.allowance(owner.address, addr1.address) ).to.equal(25);  //разрешено 25

    await erc20.increaseAllowance(addr2.address, 20); //второму добавляем 20 - для тестирования if
    expect( await erc20.allowance(owner.address, addr2.address) ).to.equal(40);  //разрешено 40

  });

  //тест исключительных ситуаций
  it("revert 1", async function () {
    await erc20.approve(addr1.address, 2000); //можно разрешить 2000, даже если на балансе 1000, вдруг позже появятся
    expect(  erc20.connect(addr1).transferFrom(owner.address, addr2.address, 2000)).to.be.revertedWith("Not enough tokens."); //пытаемся 2000, на балансе 1000
    expect(  erc20.connect(addr1).transferFrom(owner.address, addrZero, 200)).to.be.revertedWith("Receiver cannot be 0."); //адрес 0
    expect(  erc20.connect(addr1).transferFrom(addrZero, addr2.address, 200)).to.be.revertedWith("Sender cannot be 0."); //адрес 0
  });

  it("revert 2", async function () {
    //создавать mint / уничтожать burn  только владелец
    expect(  erc20.connect(addr1).mint(owner.address, 10)).to.be.revertedWith("Only for contract owner."); 
    expect(  erc20.connect(addr1).burn(owner.address, 10)).to.be.revertedWith("Only for contract owner."); 

    expect(  erc20.mint(addrZero, 10)).to.be.revertedWith("Account cannot be 0."); 
    expect(  erc20.burn(addrZero, 10)).to.be.revertedWith("Account cannot be 0."); 
    expect(  erc20.burn(owner.address, 2000)).to.be.revertedWith("Not enough tokens."); 

    expect(  erc20.increaseAllowance(addrZero, 10)).to.be.revertedWith("Spender cannot be 0."); 

    expect(  erc20.approve(addrZero, 2000)).to.be.revertedWith("Spender cannot be 0."); //адрес 0
  });


  it("allowance 2", async function () {
    //сначала нужно approve
    await erc20.increaseAllowance(addr2.address, 20); //добавляем 20
    expect( await erc20.allowance(owner.address, addr2.address) ).to.equal(0);  
  });
    

});

