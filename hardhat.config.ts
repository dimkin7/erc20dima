import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";


dotenv.config();

//так можно посмотреть контракт erc20dima
//https://rinkeby.etherscan.io/address/0xa2aaE6F6cBd2D7A8F465eF194f5812d8FbF6899b
//И  токен
//https://rinkeby.etherscan.io/token/0xa2aae6f6cbd2d7a8f465ef194f5812d8fbf6899b

const contractAddr = '0xa2aaE6F6cBd2D7A8F465eF194f5812d8FbF6899b';


//Написать таски на transfer, transferFrom, approve
//npx hardhat transfer --network rinkeby --key PRIVATE_KEY --to 0x8BBc205Ec38F6AcA8dA9e82Cbfe76662A5E0B987 --value 50
task("transfer", "transfer")
  .addParam("key", "Your private key")
  .addParam("to", "To")
  .addParam("value", "Value")
  .setAction(async (taskArgs, hre) => {

    const abi = [
      "function transfer(address _to, uint256 _value) public returns (bool success)"
    ];
    const provider = new hre.ethers.providers.AlchemyProvider("rinkeby");
    const signer = new hre.ethers.Wallet(taskArgs.key, provider);
    const erc20dima = new hre.ethers.Contract(contractAddr, abi, signer);
    
    let success = await erc20dima.transfer(taskArgs.to, taskArgs.value);
    console.log('transfer: ', success);
  });


//npx hardhat transferFrom --network rinkeby --key PRIVATE_KEY --from 0x8BBc205Ec38F6AcA8dA9e82Cbfe76662A5E0B987  --to 0xa2aaE6F6cBd2D7A8F465eF194f5812d8FbF6899b  --value 50
task("transferFrom", "transferFrom")
  .addParam("key", "Your private key")
  .addParam("from", "From")
  .addParam("to", "To")
  .addParam("value", "Value")
  .setAction(async (taskArgs, hre) => {

    const abi = [
      "function transferFrom(address _from, address _to, uint256 _value ) public returns (bool success)"
    ];
    const provider = new hre.ethers.providers.AlchemyProvider("rinkeby");
    const signer = new hre.ethers.Wallet(taskArgs.key, provider);
    const erc20dima = new hre.ethers.Contract(contractAddr, abi, signer);
    
    let success = await erc20dima.transferFrom(taskArgs.from, taskArgs.to, taskArgs.value);
    console.log('transferFrom: ', success);
  });

  //npx hardhat approve --network rinkeby --key PRIVATE_KEY --spender 0x8BBc205Ec38F6AcA8dA9e82Cbfe76662A5E0B987 --value 200
  task("approve", "approve")
  .addParam("key", "Your private key")
  .addParam("spender", "Spender")
  .addParam("value", "Value")
  .setAction(async (taskArgs, hre) => {

    const abi = [
      "function approve(address _spender, uint256 _value) public returns (bool success)"
    ];
    const provider = new hre.ethers.providers.AlchemyProvider("rinkeby");
    const signer = new hre.ethers.Wallet(taskArgs.key, provider);
    const erc20dima = new hre.ethers.Contract(contractAddr, abi, signer);
    
    let success = await erc20dima.approve(taskArgs.spender, taskArgs.value);
    console.log('approve: ', success);
  });


// This is a sample Hardhat task
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {

    rinkeby: {
      url: process.env.RENKEBY_URL || '',
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },

    //обход ошибки
    /*hardhat: {
      initialBaseFeePerGas: 0
    },   */
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },

};



export default config;
