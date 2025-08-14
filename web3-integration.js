let web3;
let contract;
let userAccount;

const LEADERBOARD_CONTRACT_ADDRESS = "0x1f124e276e4b503e9d6852e0f4489cfdbb1b412c";
const LEADERBOARD_CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "submitted",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "best",
				"type": "uint256"
			}
		],
		"name": "ScoreSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "score",
				"type": "uint256"
			}
		],
		"name": "submitScore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "bestScore",
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
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getPlayerScore",
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
		"inputs": [],
		"name": "getTop50",
		"outputs": [
			{
				"internalType": "address[50]",
				"name": "addrs",
				"type": "address[50]"
			},
			{
				"internalType": "uint256[50]",
				"name": "scores",
				"type": "uint256[50]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "topAddresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "topScores",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
// --- YENI SON ---

const ORIGINAL_CONTRACT_ADDRESS = "0x15A96966a7003bfc63B58ee9658418DB72D3974D";
const ORIGINAL_CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "score", "type": "uint256"}],
        "name": "submitScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "player", "type": "address"},
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "latestRoundData",
        "outputs": [
            {"internalType": "uint80", "name": "roundId", "type": "uint80"},
            {"internalType": "int256", "name": "answer", "type": "int256"},
            {"internalType": "uint256", "name": "startedAt", "type": "uint256"},
            {"internalType": "uint256", "name": "updatedAt", "type": "uint256"},
            {"internalType": "uint80", "name": "answeredInRound", "type": "uint80"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
        "name": "getPlayerScore",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

let leaderboardContract;

const PHAROS_RPC_URL = "https://testnet.dplabs-internal.com";

async function connectToWeb3Interactive() {
    try {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned');
            }
            userAccount = accounts[0];
            contract = new web3.eth.Contract(ORIGINAL_CONTRACT_ABI, ORIGINAL_CONTRACT_ADDRESS);
            
            leaderboardContract = new web3.eth.Contract(LEADERBOARD_CONTRACT_ABI, LEADERBOARD_CONTRACT_ADDRESS);
       
            return { success: true, account: userAccount };
        } else {
            web3 = new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
            contract = new web3.eth.Contract(ORIGINAL_CONTRACT_ABI, ORIGINAL_CONTRACT_ADDRESS);
            
            leaderboardContract = new web3.eth.Contract(LEADERBOARD_CONTRACT_ABI, LEADERBOARD_CONTRACT_ADDRESS);
          
            return { success: false, error: 'MetaMask not detected' };
        }
    } catch (err) {
        console.error('Connection error:', err);
        return { success: false, error: err.message || String(err) };
    }
}

function initReadOnlyWeb3() {
    if (!web3) {
        try {
            web3 = window.ethereum
                ? new Web3(window.ethereum)
                : new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
            contract = new web3.eth.Contract(ORIGINAL_CONTRACT_ABI, ORIGINAL_CONTRACT_ADDRESS);
        
            leaderboardContract = new web3.eth.Contract(LEADERBOARD_CONTRACT_ABI, LEADERBOARD_CONTRACT_ADDRESS);
     
        } catch (err) {
            console.error('Init error:', err);
        }
    }
}


async function submitScoreToBlockchain(score) {
    try {
        if (!web3 || !leaderboardContract) initReadOnlyWeb3(); // <-- leaderboardContract kullan

        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
            return { success: false, error: 'Wallet not connected' };
        }
        userAccount = accounts[0];

        let gas = 200000;
        try {
            // <-- leaderboardContract.methods kullan
            gas = await leaderboardContract.methods.submitScore(score).estimateGas({ from: userAccount });
        } catch (e) {
            console.warn("Gas estimate failed, using fallback");
        }

        // <-- leaderboardContract.methods.send kullan
        const tx = await leaderboardContract.methods.submitScore(score).send({
            from: userAccount,
            gas: Math.min(gas + 10000, 500000)
        });

        return { success: true, txHash: tx.transactionHash };
    } catch (error) {
        console.error('Submit error:', error);
        return { success: false, error: error.message || "Transaction failed" };
    }
}


async function getLeaderboardFromBlockchain(limit = 50) {
    try {
        if (!web3 || !leaderboardContract) {
            initReadOnlyWeb3();
        }
        if (!leaderboardContract) {
            throw new Error("Leaderboard contract not initialized");
        }

        // getTop50 fonksiyonunu çağır
        const result = await leaderboardContract.methods.getTop50().call();
        
        const rows = [];
        for (let i = 0; i < result.addrs.length; i++) {
            if (result.addrs[i] !== "0x0000000000000000000000000000000000000000") {
                rows.push({
                    player: result.addrs[i],
                    score: parseInt(result.scores[i], 10)
                });
            }
        }

        return { success: true, rows: rows.slice(0, limit) };
    } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        return { success: false, error: error.message || "Could not fetch leaderboard" };
    }
}

// Globala aç
window.connectToWeb3Interactive = connectToWeb3Interactive;
window.submitScoreToBlockchain = submitScoreToBlockchain;

window.getLeaderboardFromBlockchain = getLeaderboardFromBlockchain;

window.initReadOnlyWeb3 = initReadOnlyWeb3;


window.addEventListener('load', initReadOnlyWeb3);
