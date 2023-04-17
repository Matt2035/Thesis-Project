const contract = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_message",
        type: "string",
      },
    ],
    name: "message",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "Message",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_proxy",
        type: "address",
      },
    ],
    name: "setProxy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "myMessage",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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

// const PUBLIC_KEY = "0x42A028e9d8f0Bd6858a782AECC90C56B04365a01";
// const PRIVATE_KEY =
//   "7ad639bfac365c97034f349a42836fd61f4b5ea95f5839090b1e93711dc425f5";

const Web3 = require("web3");
const rpcURL =
  "https://polygon-mumbai.infura.io/v3/d855c3d2acb54bf5a5a967e04e39c730";
const web3 = new Web3(rpcURL);

const contractAddress = "0x2B2B078F96cf1cbFF3ee3688C4185d15Cfea5C36";
const helloWorldContract = new web3.eth.Contract(contract, contractAddress);

async function checkMessage() {
  var msg = await helloWorldContract.methods.myMessage.call().call();
  console.log(msg);
}

checkMessage();
