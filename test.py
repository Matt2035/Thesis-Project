import threading
from web3 import Web3, HTTPProvider
from eth_account import Account

# Replace with your own values
original_address = '0x58a631b8Aac9C60bB8FbD33CCB9C323B5D2b968E'
private_key = '8204d80d3b9e503e0ef5306332fdda48a23d9a1401c8347518eeea9cbd4fcacc'

# contract_address = '0xE2D8b8A028Fa1bEB7A158d7d2D620df829c5B1c6' # this is for Goerli
contract_address = '0xB3137189275a07eb82E34D679bcb6E0C14F36f62'
contract_abi = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_message",
        "type": "string",
      },
    ],
    "name": "message",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "anonymous": "false",
    "inputs": [
      {
        "indexed": "false",
        "internalType": "string",
        "name": "message",
        "type": "string",
      },
    ],
    "name": "Message",
    "type": "event",
  },
  {
    "inputs": [],
    "name": "myMessage",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
]

# Initialize web3

web3 = Web3(HTTPProvider('https://sepolia.infura.io/v3/d855c3d2acb54bf5a5a967e04e39c730')) # Replace with your own Infura project ID

# web3.eth.accounts.wallet.add(private_key)
gas_price = web3.eth.gas_price
gas_limit = 200000

# # Create 100 new accounts

new_accounts = []
nonce = web3.eth.getTransactionCount(original_address)

for i in range(48):
    account = web3.eth.account.create()
    new_accounts.append([account.address, account.privateKey])
    gas_price = web3.eth.gas_price
    
    #build a transaction in a dictionary
    tx = {
        'nonce': nonce,
        'to': account.address,
        'value': web3.toWei(5000000, 'gwei'),
        'gasPrice': gas_price, # times 2 is sometimes needed here
        'gas': gas_limit
    }

    #sign the transaction
    signed_tx = web3.eth.account.sign_transaction(tx, private_key)

    #send transaction
    tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)
    print(web3.toHex(tx_hash))
    nonce = nonce + 1


for element in new_accounts:
    print(f"{element[0]} - {element[1].hex()}")

while web3.eth.getBalance(new_accounts[-1][0]) == 0:
    continue



# # Define function to call smart contract function and record transaction hash
def call_contract(msg, account, pk):
    print('calling contract')
    contract = web3.eth.contract(address=contract_address, abi=contract_abi)
    gas_price = web3.eth.gas_price
    print(gas_price)
    function_name = 'message'
    function_args = [msg]
    transaction = contract.functions[function_name](*function_args).buildTransaction({
        'nonce': web3.eth.getTransactionCount(account),
        'gasPrice': gas_price,
        'gas': 50000
    })

    # Sign the transaction using the private key of the account
    signed_txn = Account.sign_transaction(transaction, pk)

    # Send the raw transaction to the Ethereum network
    txn_hash = web3.eth.sendRawTransaction(signed_txn.rawTransaction)
    print(f"Transaction hash for {account}: {txn_hash.hex()}")

# # # Call smart contract function for each new account using threading
threads = []
for i in range(len(new_accounts)):
    thread = threading.Thread(target=call_contract, args=(str(i),new_accounts[i][0],new_accounts[i][1]))
    thread.start()
    threads.append(thread)

# # # # Wait for all threads to complete
for thread in threads:
    thread.join()

