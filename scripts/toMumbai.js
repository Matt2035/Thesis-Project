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

const PUBLIC_KEY = "0x42A028e9d8f0Bd6858a782AECC90C56B04365a01";
const PRIVATE_KEY =
  "7ad639bfac365c97034f349a42836fd61f4b5ea95f5839090b1e93711dc425f5";

const Web3 = require("web3");
const rpcURL = "https://goerli.infura.io/v3/d855c3d2acb54bf5a5a967e04e39c730";
const web3 = new Web3(rpcURL);

const contractAddress = "0xE2D8b8A028Fa1bEB7A158d7d2D620df829c5B1c6";
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
