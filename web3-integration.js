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

const PHAROS_TESTNET_CONFIG = {
    chainId: '0x' + (688688).toString(16),
    chainName: 'Pharos Testnet',
    nativeCurrency: {
        name: 'PHAR',
        symbol: 'PHAR',
        decimals: 18
    },
    rpcUrls: ['https://testnet.dplabs-internal.com'],
    blockExplorerUrls: ['https://testnet.pharosscan.xyz/'],
    iconUrls: []
};

async function switchOrAddPharosNetwork() {
    if (!window.ethereum) {
        alert("MetaMask not installed!");
        return false;
    }

    const chainIdHex = PHAROS_TESTNET_CONFIG.chainId;

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdHex }]
        });
        console.log("Already connected to Pharos Testnet network.");
        return true;
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [PHAROS_TESTNET_CONFIG]
                });
                console.log("Pharos Testnet network successfully added.");
                return true;
            } catch (addError) {
                console.error("Error adding network:", addError);
                alert("Could not add network. Please add it manually.");
                return false;
            }
        } else {
            console.error("Could not switch network:", switchError);
            alert("Could not switch network. Please change it manually.");
            return false;
        }
    }
}

async function connectToWeb3Interactive() {
    try {
        if (window.ethereum) {
            const networkAdded = await switchOrAddPharosNetwork();
            if (!networkAdded) {
                return { success: false, error: 'Network configuration failed.' };
            }

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
    if (web3) {
        console.log("Web3 already initialized. Reinitializing.");
    }
    
    try {
        web3 = new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
        contract = new web3.eth.Contract(ORIGINAL_CONTRACT_ABI, ORIGINAL_CONTRACT_ADDRESS);
        leaderboardContract = new web3.eth.Contract(LEADERBOARD_CONTRACT_ABI, LEADERBOARD_CONTRACT_ADDRESS);
        console.log("Read-only Web3 initialized. RPC:", PHAROS_RPC_URL);
    } catch (err) {
        console.error('Init error:', err);
    }
}

async function submitScoreToBlockchain(score) {
    try {
        if (!web3 || !leaderboardContract) initReadOnlyWeb3();

        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
            return { success: false, error: 'Wallet not connected' };
        }
        userAccount = accounts[0];

        let gas = 200000;
        try {
            gas = await leaderboardContract.methods.submitScore(score).estimateGas({ from: userAccount });
        } catch (e) {
            console.warn("Gas estimate failed, using fallback");
        }

        const tx = await leaderboardContract.methods.submitScore(score).send({
            from: userAccount,
            gas: Math.min(gas + 10000, 500000)
        });

        return { success: true, txHash: tx.transactionHash };
    } catch (error) {
        // Check if the user rejected the transaction
        if (error.code === 4001 || (error.message && error.message.includes("User denied transaction signature"))) {
            // User rejected the transaction, show simple alert
            alert("User cancelled the transaction");
            return { success: false, error: "User cancelled the transaction" };
        }
        
        // For other errors, return error message without logging to console
        return { success: false, error: error.message || "Transaction failed" };
    }
}

async function getLeaderboardFromBlockchain(limit = 50) {
    let localWeb3 = null;
    let localLeaderboardContract = null;
    try {
        localWeb3 = new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
        localLeaderboardContract = new localWeb3.eth.Contract(LEADERBOARD_CONTRACT_ABI, LEADERBOARD_CONTRACT_ADDRESS);

        console.log("DEBUG: About to call getTop50 on contract:", LEADERBOARD_CONTRACT_ADDRESS, "via RPC:", PHAROS_RPC_URL);
        
        const result = await localLeaderboardContract.methods.getTop50().call({ cache: 'no-store' });
        
        console.log("DEBUG: Raw result received from getTop50:", result);
        console.log("DEBUG: Type of result:", typeof result);
        console.log("DEBUG: Is result an array?", Array.isArray(result));
        
        let addrsArray, scoresArray;
        if (Array.isArray(result)) {
            console.log("DEBUG: Result is an array. Length:", result.length);
            if (result.length === 2) {
                addrsArray = result[0];
                scoresArray = result[1];
                console.log("DEBUG: Parsed from array - addrs:", addrsArray, "scores:", scoresArray);
            } else {
                console.error("ERROR: Unexpected array format from getTop50");
                throw new Error("Unexpected result format from contract");
            }
        } else if (result && typeof result === 'object' && result.addrs !== undefined && result.scores !== undefined) {
            addrsArray = result.addrs;
            scoresArray = result.scores;
            console.log("DEBUG: Parsed from object - addrs:", addrsArray, "scores:", scoresArray);
        } else {
            console.error("ERROR: Unknown result format from getTop50:", result);
            throw new Error("Unknown result format from contract");
        }

        console.log("DEBUG: Type of addrsArray:", typeof addrsArray, "Is Array?", Array.isArray(addrsArray));
        console.log("DEBUG: Type of scoresArray:", typeof scoresArray, "Is Array?", Array.isArray(scoresArray));

        if (!Array.isArray(addrsArray) || !Array.isArray(scoresArray)) {
            console.error("ERROR: addrs or scores is not an array!");
            throw new Error("Contract returned invalid data structure");
        }

        console.log("DEBUG: addrsArray length:", addrsArray.length);
        console.log("DEBUG: scoresArray length:", scoresArray.length);

        const rows = [];
        const loopLimit = Math.min(addrsArray.length, scoresArray.length, limit);
        console.log("DEBUG: Processing up to", loopLimit, "entries");

        for (let i = 0; i < loopLimit; i++) {
            const addr = addrsArray[i];
            const score = scoresArray[i];
            console.log("DEBUG: Processing entry", i, "Address:", addr, "Score:", score);
            
            if (addr && addr !== "0x0000000000000000000000000000000000000000") {
                const parsedScore = parseInt(score, 10);
                console.log("DEBUG: Adding valid entry - Address:", addr, "Parsed Score:", parsedScore);
                rows.push({
                    player: addr,
                    score: parsedScore
                });
            } else {
                console.log("DEBUG: Skipping entry", i, "- Address is zero or invalid");
            }
        }

        console.log("DEBUG: Final leaderboard rows:", rows);
        return { success: true, rows: rows };
    } catch (error) {
        console.error("!!! FAILED to fetch leaderboard !!!");
        console.error("Error object:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error reason:", error.reason);
        if (error.stack) {
            console.error("Error stack:", error.stack);
        }
        return { success: false, error: error.message || "Could not fetch leaderboard" };
    } finally {
        if (localWeb3) {
        }
    }
}

window.connectToWeb3Interactive = connectToWeb3Interactive;
window.submitScoreToBlockchain = submitScoreToBlockchain;
window.getLeaderboardFromBlockchain = getLeaderboardFromBlockchain;
window.initReadOnlyWeb3 = initReadOnlyWeb3;
window.switchOrAddPharosNetwork = switchOrAddPharosNetwork;

window.addEventListener('load', initReadOnlyWeb3);
