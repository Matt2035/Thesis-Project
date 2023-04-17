/**
 *Submitted for verification at Etherscan.io on 2023-02-12
*/

// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;


contract Bridge {

    event Message(string message);

    string public myMessage;

    function message(string memory _message) public {
        myMessage = _message;
        emit Message(_message);
    }

}
