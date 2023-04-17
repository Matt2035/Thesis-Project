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
];

var msg = process.argv.slice(2)[0];

const PUBLIC_KEY = "0x58a631b8Aac9C60bB8FbD33CCB9C323B5D2b968E";
const PRIVATE_KEY =
  "8204d80d3b9e503e0ef5306332fdda48a23d9a1401c8347518eeea9cbd4fcacc";

const Web3 = require("web3");
const rpcURL = "https://sepolia.infura.io/v3/d855c3d2acb54bf5a5a967e04e39c730";
const web3 = new Web3(rpcURL);

const contractAddress = "0xE2D8b8A028Fa1bEB7A158d7d2D620df829c5B1c6"; /////////////

const helloWorldContract = new web3.eth.Contract(contract, contractAddress);

async function updateMessage(newMessage) {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest"); // get latest nonce
  const gasEstimate = await helloWorldContract.methods
    .message(newMessage)
    .estimateGas(); // estimate gas
  // Create the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: gasEstimate,
    data: helloWorldContract.methods.message(newMessage).encodeABI(),
  };

  // Sign the transaction
  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log("The hash of your transaction is: ", hash);
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

updateMessage(msg);
