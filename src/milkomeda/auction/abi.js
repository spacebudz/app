export const abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "nftIndex",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "NewBid",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "nftIndex",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "receivingAddress",
				"type": "string"
			}
		],
		"name": "bid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "deadline",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "nftIndex",
				"type": "uint256"
			}
		],
		"name": "getAuction",
		"outputs": [
			{
				"internalType": "string",
				"name": "receivingAddress",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "bidAmount",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "hasStarted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "numberOfDays",
				"type": "uint256"
			}
		],
		"name": "start",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]