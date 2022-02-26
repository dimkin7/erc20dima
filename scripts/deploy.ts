import { ethers } from "hardhat";

async function main() {
  //деплой
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());


  const factoryERC20 = await ethers.getContractFactory("ERC20Dima");
  const erc20 = await factoryERC20.deploy(1000);
  await erc20.deployed();
  console.log("ERC20Dima deployed to:", erc20.address);

}

//запуск
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});








