// SPDX-License-Identifier: MIT
// токен стандарта ERC-20
// функции взяты из https://eips.ethereum.org/EIPS/eip-20

//TODO использовать env


pragma solidity ^0.8.0;

contract ERC20Dima {
    string private mToken = "DimaToken";
    string private mSymbol = "DIT";
    uint8 private mDecimals = 18;

    //хранение баланса
    mapping(address => uint256) private mBalance;

    //хранение allowance
    struct AllowanceStruc{
        address spender;
        uint256 remaining;
    }
    mapping(address => AllowanceStruc[]) private mAllowance;


    //конструктор
    constructor(uint256 initialSupply) {
        _mint(msg.sender, initialSupply);
    }


    //////// View functions /////////////////

    //Returns the name of the token - e.g. "MyToken"
    function name() public view returns (string memory) {
        return mToken;
    }

    //Returns the symbol of the token. E.g. “HIX”
    function symbol() public view returns (string memory) {
        return mSymbol;
    }

    //Returns the number of decimals the token uses - e.g. 8, means to divide the token amount by 100000000 to get its user representation.
    function decimals() public view returns (uint8) {
        return mDecimals;
    }

    //Returns the account balance of another account with address _owner.
    function balanceOf(address _owner) public view returns (uint256 balance)
    {
        return mBalance[_owner];
    }

    //Returns the total token supply.
    function totalSupply() public view returns (uint256)
    {
        return 33; //TODO
    }   

    //Returns the amount which _spender is still allowed to withdraw from _owner.
    function allowance(address _owner, address _spender) public view returns (uint256 remaining)
    {
        remaining = 0;

        //получаем разрешения _owner
        AllowanceStruc[] memory ownerAllowance = mAllowance[_owner];
        //ищем резрешение для _spender
        for(uint i = 0; i < ownerAllowance.length; i++)
        {
            if (ownerAllowance[i].spender == _spender){
                //если нашли _spender - возвращаем
                remaining = ownerAllowance[i].remaining;
                return remaining;
            }
        }
        
        return remaining;
    }

    //Functions (non view)

    //transfer
    function transfer(address _to, uint256 _value) public returns (bool success){

    }
    //function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
    //function approve(address _spender, uint256 _value) public returns (bool success)

    //increaseAllowance
    //decreaseAllowance

    //event Transfer(address indexed _from, address indexed _to, uint256 _value)
    //event Approval(address indexed _owner, address indexed _spender, uint256 _value)



    //Добавить функции mint и burn TODO

    //Creates amount tokens and assigns them to account, increasing the total supply.
    function _mint(address account, uint256 amount) internal
    {

        //TODO
        //TODO   Emits a transfer event with from set to the zero address.


    }
}
