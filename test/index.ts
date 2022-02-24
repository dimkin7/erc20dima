import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
//import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
//import { ERC20Dima__factory, ERC20Dima } from "../typechain";
import type { Signer } from "ethers";

describe("ERC20Dima", function () {
  //before  TODO
  
  let erc20: Contract;
  let owner: Signer;
	let addr1: Signer;
	let addr2: Signer;
	
  //beforeEach передеплой контракта
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const factoryERC20Dima = await ethers.getContractFactory("ERC20Dima") ;
    erc20 = await factoryERC20Dima.deploy(33);
    await erc20.deployed();
  });


  it("ERC20 test", async function () {

    expect(await erc20.name()).to.equal("DimaToken");
    expect(await erc20.symbol()).to.equal("DIT");

  


  });
});
