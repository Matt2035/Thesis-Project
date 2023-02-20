Install docker

Install Forta

Initialized Forta Directory

https://docs.forta.network/en/latest/scanner-quickstart/

For local mode 
https://docs.forta.network/en/latest/scanner-local-mode/

*****
msalern2@fortascan:/$ forta init --passphrase <passphrase>

Scanner address: 0xdE7eD38Bd02766f6e02D24336BE0F3AfD3CfBCED

Successfully initialized at /home/msalern2/.forta

- Please make sure that all of the values in config.yml are set correctly.
- Please fund your scanner address with some MATIC.
- Please enable it for the chain ID in your config by doing 'forta register --owner-address <your_owner_wallet_address>'.
*****
UTC--2023-01-09T21-14-35.831332986Z--de7ed38bd02766f6e02d24336be0f3afd3cfbced


password to encrypt keyfile in VM = password
created key 0x751f6f0ca5444bcb68331398699290aa240920b9 in /home/msalern2/.forta


$ docker build . 
to obtain local bot image

config.yml must contain MAINNET rpc and chainID
Ex. main net eth for goerli scans

$ forta run --passphrase <passphrase> 
to run SCAN NODE

config.yml must contain updated bot image reference


