// SPDX-License-Identifier: MIT
// токен стандарта ERC-20
// функции взяты из https://eips.ethereum.org/EIPS/eip-20

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ERC20Dima {
    string private mToken = "DimaToken";
    string private mSymbol = "DIT";
    uint8 private mDecimals = 18;
    address private mContractOwner;
    uint256 private mTotal;

    //хранение баланса
    mapping(address => uint256) private mBalance;

    //хранение allowance
    struct AllowanceStruc {
        address spender;
        uint256 remaining;
    }
    mapping(address => AllowanceStruc[]) private mAllowance;

    ///////////  Events
    //MUST trigger when tokens are transferred, including zero value transfers.
    //A token contract which creates new tokens SHOULD trigger a Transfer event with the _from address set to 0x0 when tokens are created.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    //MUST trigger on any successful call to approve(address _spender, uint256 _value).
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    //конструктор
    constructor(uint256 initialSupply) {
        mContractOwner = msg.sender;
        //передаем все токены владельцу контракта
        mint(msg.sender, initialSupply);
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
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return mBalance[_owner];
    }

    //Returns the total token supply.
    function totalSupply() public view returns (uint256) {
        return mTotal;
    }

    //Returns the amount which _spender is still allowed to withdraw from _owner.
    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256 remaining)
    {
        remaining = 0;

        //получаем разрешения _owner
        AllowanceStruc[] memory ownerAllowance = mAllowance[_owner];
        //ищем резрешение для _spender
        for (uint256 i = 0; i < ownerAllowance.length; i++) {
            if (ownerAllowance[i].spender == _spender) {
                //если нашли _spender - возвращаем
                remaining = ownerAllowance[i].remaining;
                return remaining;
            }
        }

        return remaining;
    }

    //Functions (non view)

    //Transfers _value amount of tokens to address _to, and MUST fire the Transfer event.
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        success = transferFrom(msg.sender, _to, _value);
    }

    //Transfers _value amount of tokens from address _from to address _to, and MUST fire the Transfer event.
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        success = false;
        //console.log("transferFrom:", _from, _to, _value);
        //console.log("msg.sender:", msg.sender);
        require(_from != address(0), "Sender cannot be 0.");
        require(_to != address(0), "Receiver cannot be 0.");

        //проверяем достаточное кол-во токенов на балансе
        require(_value <= mBalance[_from], "Not enough tokens.");

        //если не со своего счета, проверяем разрешение и уменьшаем
        if (_from != msg.sender) {
            success = decreaseAllowanceFrom(_from, msg.sender, _value);

            //The function SHOULD throw unless the _from account has deliberately authorized the sender of the message via some mechanism.
            require(success == true, "DecreaseAllowance = false");
        }

        //передача
        mBalance[_from] -= _value;
        mBalance[_to] += _value;

        //событие
        emit Transfer(_from, _to, _value);

        return true;
    }

    //Allows _spender to withdraw from your account multiple times, up to the _value amount. If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        success = false;
        require(_spender != address(0), "Spender cannot be 0.");

        //получаем разрешения msg.sender
        //AllowanceStruc[] memory ownerAllowance = mAllowance[msg.sender]; - так было изначально

        //ищем резрешение для _spender и обновляем
        for (uint256 i = 0; i < mAllowance[msg.sender].length; i++) {
            if (mAllowance[msg.sender][i].spender == _spender) {
                mAllowance[msg.sender][i].remaining = _value;

                //событие
                emit Approval(msg.sender, _spender, _value);

                return true;
            }
        }

        //если не нашли - добавляем
        AllowanceStruc memory newAllowance;
        newAllowance.spender = _spender;
        newAllowance.remaining = _value;
        mAllowance[msg.sender].push(newAllowance);

        //событие
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    //Atomically increases the allowance granted to spender by the caller.
    function increaseAllowance(address _spender, uint256 _addedValue)
        public
        returns (bool success)
    {
        success = changeAllowanceCommon(
            msg.sender,
            _spender,
            _addedValue,
            true
        );
    }

    //внутренняя - используется в decreaseAllowance и в transferFrom
    function decreaseAllowanceFrom(
        address _owner,
        address _spender,
        uint256 _subtractedValue
    ) internal returns (bool success) {
        success = false;
        //console.log(            "decreaseAllowanceFrom:",            _owner,            _spender,            _subtractedValue        );

        //проверяем достаточное кол-во токенов в разрешении
        uint256 remaining = allowance(_owner, _spender);
        require(_subtractedValue <= remaining, "Not enough allowance.");

        success = changeAllowanceCommon(
            _owner,
            _spender,
            _subtractedValue,
            false
        );
    }

    //Atomically decreases the allowance granted to spender by the caller.
    function decreaseAllowance(address _spender, uint256 _subtractedValue)
        public
        returns (bool success)
    {
        success = decreaseAllowanceFrom(msg.sender, _spender, _subtractedValue);
    }

    //для вызова из increaseAllowance / decreaseAllowance
    function changeAllowanceCommon(
        address _owner,
        address _spender,
        uint256 _changeValue,
        bool _increase
    ) internal returns (bool success) {
        success = false;

        //console.log("changeAllowanceCommon:", _owner, _spender, _changeValue);

        //spender cannot be the zero address.
        require(_spender != address(0), "Spender cannot be 0.");
        require(_owner != address(0), "Owner cannot be 0.");

        //получаем разрешения _owner
        //AllowanceStruc[] memory ownerAllowance = mAllowance[_owner]; - не получаем, а сразу используем, комментарий оставил для понимания
        //console.log("mAllowance[_owner].length:", mAllowance[_owner].length);

        //ищем резрешение для _spender
        for (uint256 i = 0; i < mAllowance[_owner].length; i++) {
            if (mAllowance[_owner][i].spender == _spender) {
                if (_increase == true) {
                    mAllowance[_owner][i].remaining += _changeValue;
                } else {
                    mAllowance[_owner][i].remaining -= _changeValue;
                }

                //Emits an Approval event indicating the updated allowance.
                emit Approval(
                    _owner,
                    _spender,
                    mAllowance[_owner][i].remaining
                );
                //console.log("changeAllowanceCommon: return true");
                return true;
            }
        }
    }

    //Добавить функции mint и burn

    //Creates amount tokens and assigns them to account, increasing the total supply.
    function mint(address _account, uint256 _amount)
        public
        returns (bool success)
    {
        success = false;
        require(msg.sender == mContractOwner, "Only for contract owner.");

        //account cannot be the zero address.
        require(_account != address(0), "Account cannot be 0.");

        mBalance[_account] += _amount;
        mTotal += _amount;
        success = true;

        //Emits a transfer event with from set to the zero address.
        emit Transfer(address(0), _account, _amount);
    }

    //Destroys amount tokens from account, reducing the total supply.
    function burn(address _account, uint256 _amount)
        public
        returns (bool success)
    {
        success = false;
        require(msg.sender == mContractOwner, "Only for contract owner.");

        //account cannot be the zero address.
        require(_account != address(0), "Account cannot be 0.");
        //account must have at least amount tokens.
        require(mBalance[_account] >= _amount, "Not enough tokens.");

        mBalance[_account] -= _amount;
        mTotal -= _amount;
        success = true;

        //Emits a transfer event with to set to the zero address.
        emit Transfer(_account, address(0), _amount);
    }
}
