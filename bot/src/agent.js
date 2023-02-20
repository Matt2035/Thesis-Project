const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");


// This bot is not built for scale. Only returns info/warning about the first pinned transaction in the array.
// If multiple occur in the same block it will only print info on the first one. This is good enough for a simple
// demonstration with only one transaction at a time
function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = "";
  for (var i = 0; i < hex.length; i += 2)
    if (!(String.fromCharCode(parseInt(hex.substr(i, 2), 16)) == "\00")) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
  return str.trim();
}

async function main(message) {

	const socketio = require('socket.io-client');

	const socket = socketio.connect('http://localhost:3000');

	socket.on('connect', () => {
  		console.log('Connected to server');
 		socket.emit('message', message);
	});

	socket.on('message', (message) => {
  		console.log(`Received message: ${message}`);
	});

	socket.on('disconnect', () => {
  		console.log('Disconnected from server');
	});

  	console.log("Main complete");
}

let findingsCache = [];
let isScanningGoerli = false;
let currentGoerliBlockNumber = -1;
// const RINKEBY_RPC_URL =
//   "https://rinkeby.infura.io/v3/d855c3d2acb54bf5a5a967e04e39c730";
const Goerli_RPC_URL =
  "https://goerli.infura.io/v3/d855c3d2acb54bf5a5a967e04e39c730";
const goerliProvider = new ethers.providers.JsonRpcProvider(Goerli_RPC_URL);

let findingsCount = 0;

async function initialize() {
  currentGoerliBlockNumber = await goerliProvider.getBlockNumber();
}

async function scanGoerliBlocks() {
  isScanningGoerli = true;

  const latestGoerliBlockNumber = await goerliProvider.getBlockNumber();
  while (currentGoerliBlockNumber <= latestGoerliBlockNumber) {
    // fetch Goerli block
    const goerliBlock = await goerliProvider.getBlock(currentGoerliBlockNumber);

    console.log("goerli block", currentGoerliBlockNumber);
    goerliProvider
      .getLogs({
        address: "0xE2D8b8A028Fa1bEB7A158d7d2D620df829c5B1c6",
        fromBlock: currentGoerliBlockNumber,
        toBlock: currentGoerliBlockNumber,
        // fromBlock: 8353331,
        // toBlock: 8353331,
 //        topics: [
        //   // the 0x508... hexidecimal represents keccak256(TokensLocked(address,bytes32,uint256,uint256))
        //   // '0x508bc5d33807c46db43ce875d48dca24de9d41f9fcb35ce6e51daed771fafe59',
        //   // the 0xddf... hexidecimal represents keccak256(Transfer(address,address,uint256)
        //   //"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

        //   // THESE TOPICS ARE FOR EVENTS, NOT FUNCTIONS!

   //        "0x51a7f65c6325882f237d4aeb43228179cfad48b868511d508e24b4437a819137",
     //    ],
      })
      .then((res) => {
        // let value = parseInt(res[0]["data"] * 10 ** -18);
        // console.log(res);
        if (Object.keys(res).length !== 0) {
          console.log("found");
          dataObject = hex_to_ascii(res[0]["data"]);
          console.log(dataObject);
          main(dataObject);
          findingsCache.push(
            Finding.fromObject({
              name: "Message Received",
              description: `Message Received`,
              alertId: "RINK-1",
              severity: FindingSeverity.Info,
              type: FindingType.Info,
              metadata: {
                //txHash: res[0]["transactionHash"],
                data: dataObject,
              },
            })
          );
        }
      });

    currentGoerliBlockNumber++;
  }

  isScanningGoerli = false;
}

async function handleBlock(blockEvent) {
  let findings = [];

  // check if we have any findings cached
  if (findingsCache.length > 0) {
    findings = findingsCache;
    findingsCache = [];
  }

  // make sure only one task is running at a time
  if (!isScanningGoerli) {
    scanGoerliBlocks();
  }

  return findings;
}

module.exports = {
  initialize,
  handleBlock,
};

