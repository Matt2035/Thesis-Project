// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Bridge {

    address public owner;
    address private proxy;
    string public myMessage;
    event Message(string message);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setProxy(address _proxy) public onlyOwner {
        proxy=_proxy;
    }
    

    function message(string memory _message) public {
        require(msg.sender == proxy);
        myMessage = _message;
        emit Message(_message);
    }

}


contract Proxy {

    Bridge public myBridge;
    address public owner;

    constructor(address bridgeAddress) {
        owner = msg.sender;
        myBridge = Bridge(bridgeAddress);
    }

    function transfer(address payable to, uint256 amount) public {
        require(msg.sender==owner);
        to.transfer(amount);
    }

    function rcv() public payable {}

    function processMessage(string memory _msg, address profitAddress) public {
        uint256 startGas = gasleft();
        myBridge.message(_msg);
        uint gasPrice = tx.gasprice;
        uint gasUsed = startGas - gasleft();
        uint cost = gasPrice * gasUsed;
        payable(msg.sender).transfer(cost*105/100);
        payable(profitAddress).transfer(cost);
    }

}
