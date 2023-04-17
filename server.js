const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const axios = require("axios");
const { ethers } = require("ethers");
const apiKey = "ENVEWC32VWJPF7768WGR76MYCRIRMWHS1B";
const SourceCodeCheck =
  "// SPDX-License-Identifier: MIT\r\n" +
  "pragma solidity >=0.7.0 <0.9.0;\r\n" +
  "\r\n" +
  "interface Bridge {\r\n" +
  "    function message(string memory _message) external;\r\n" +
  "}\r\n" +
  "\r\n" +
  "contract Proxy {\r\n" +
  "\r\n" +
  "    Bridge public myBridge;\r\n" +
  "    address public owner;\r\n" +
  "\r\n" +
  "    constructor(address bridgeAddress) {\r\n" +
  "        owner = msg.sender;\r\n" +
  "        myBridge = Bridge(bridgeAddress);\r\n" +
  "    }\r\n" +
  "\r\n" +
  "    function transfer(address payable to, uint256 amount) public {\r\n" +
  "        require(msg.sender==owner);\r\n" +
  "        to.transfer(amount);\r\n" +
  "    }\r\n" +
  "\r\n" +
  "    function rcv() public payable {}\r\n" +
  "\r\n" +
  "    function processMessage(string memory _msg, address profitAddress) public {\r\n" +
  "        uint256 startGas = gasleft();\r\n" +
  "        myBridge.message(_msg);\r\n" +
  "        uint gasPrice = tx.gasprice;\r\n" +
  "        uint gasUsed = startGas - gasleft();\r\n" +
  "        uint cost = gasPrice * gasUsed;\r\n" +
  "        payable(msg.sender).transfer(cost*105/100);\r\n" +
  "        payable(profitAddress).transfer(cost);\r\n" +
  "    }\r\n" +
  "\r\n" +
  "}";

const profitAddress = "0x0e7A8459e51068a28F28d55C5885a7b6bc084b63";

//const contract = [
//  {
//    inputs: [
//      {
//        internalType: "string",
//        name: "_message",
//        type: "string",
//      },
//    ],
//    name: "message",
//    outputs: [],
//    stateMutability: "nonpayable",
//    type: "function",
//  },
//  {
//   anonymous: false,
//    inputs: [
//      {
//        indexed: false,
//        internalType: "string",
//        name: "message",
//        type: "string",
//      },
//    ],
//    name: "Message",
//    type: "event",
//  },
//  {
//    inputs: [],
//   name: "myMessage",
//    outputs: [
//      {
//        internalType: "string",
//        name: "",
//        type: "string",
//      },
//    ],
//    stateMutability: "view",
//    type: "function",
//  },
//];

const contract = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_msg",
        type: "string",
      },
      {
        internalType: "address",
        name: "profitAddress",
        type: "address",
      },
    ],
    name: "processMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rcv",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "bridgeAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "myBridge",
    outputs: [
      {
        internalType: "contract Bridge",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const PUBLIC_KEY = "0x42A028e9d8f0Bd6858a782AECC90C56B04365a01";
const PRIVATE_KEY =
  "7ad639bfac365c97034f349a42836fd61f4b5ea95f5839090b1e93711dc425f5";

const Web3 = require("web3");
const rpcURL =
  "https://polygon-mumbai.infura.io/v3/d855c3d2acb54bf5a5a967e04e39c730";
const web3 = new Web3(rpcURL);

//const contractAddress = "0x4a7473280Be44941f85A6Bf08380Cc7c273f95d8";
//const helloWorldContract = new web3.eth.Contract(contract, contractAddress);
async function getNonceAndUrl(data) {
  let nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest");
  const url = `https://api-testnet.polygonscan.com/api?module=contract&action=getsourcecode&address=${data}&apikey=${apiKey}`;
  const result = await axios.get(url);
  let src = result.data.result[0].SourceCode;
  return [nonce, src];
}

async function updateMessage(contractAddress, newMessage, nonce) {
  console.log("updating with nonce...." + nonce);

  const helloWorldContract = new web3.eth.Contract(contract, contractAddress);
  const gasEstimate = await helloWorldContract.methods
    .processMessage(newMessage, profitAddress)
    .estimateGas(); // estimate gas
  // Create the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: gasEstimate * 2,
    data: helloWorldContract.methods
      .processMessage(newMessage, profitAddress)
      .encodeABI(),
  };
  // Sign the transaction
  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log("The hash of transaction ", nonce, " is: ", hash);
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            );
          }
        }
      );
    })
    .catch((err) => {
      console.log("Promise failed:", err);
    });
}

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("message", (message) => {
    console.log(`Received message: ${message}`);
    socket.emit("message", "Message Received");
    const data = message.split(",");
    // break up message first by ;
    const msgs = data[1].split(";");
    getNonceAndUrl(data[0]).then((res) => {
      let nonceUsed = res[0];
      console.log(res[1]);
      if (res[1] === SourceCodeCheck) {
        for (let i = 0; i < msgs.length; i++) {
          updateMessage(data[0], msgs[i], nonceUsed);
          nonceUsed = nonceUsed + 1;
        }
      } // from if else statement
      else {
        console.log("source code did not match");
      }
    });

    //console.log(data[0], data[1]);
    socket.disconnect();
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
