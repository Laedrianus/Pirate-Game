let web3;
let contract;
let userAccount;

// --- YENI: Liderlik Sözleşmesi Bilgileri ---
// Güncellenmiş sözleşme adresi: 0x1f124e276e4b503e9d6852e0f4489cfdbb1b412c
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

// --- YENI: Liderlik sözleşmesi nesnesi ---
let leaderboardContract;
// --- YENI SON ---

// RPC URL'sindeki boşluk karakterlerini temizledim
const PHAROS_RPC_URL = "https://api.zan.top/node/v1/pharos/testnet/b89512a57f014c6ca7f8d791bc8f8471";

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
            // --- YENI: Liderlik sözleşmesini başlat ---
            leaderboardContract = new web3.eth.Contract(LEADERBOARD_CONTRACT_ABI, LEADERBOARD_CONTRACT_ADDRESS);
            // --- YENI SON ---
            return { success: true, account: userAccount };
        } else {
            web3 = new Web3(new Web3.providers.HttpProvider(PHAROS_RPC_URL));
            contract = new web3.eth.Contract(ORIGINAL_CONTRACT_ABI, ORIGINAL_CONTRACT_ADDRESS);
            // --- YENI: Liderlik sözleşmesini başlat ---
            leaderboardContract = new web3.eth.Contract(LEADERBOARD_CONTRACT_ABI, LEADERBOARD_CONTRACT_ADDRESS);
            // --- YENI SON ---
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
            // --- YENI: Liderlik sözleşmesini başlat ---
            leaderboardContract = new web3.eth.Contract(LEADERBOARD_CONTRACT_ABI, LEADERBOARD_CONTRACT_ADDRESS);
            // --- YENI SON ---
        } catch (err) {
            console.error('Init error:', err);
        }
    }
}

// --- DEĞİŞTİRİLDİ: Skor gönderme fonksiyonu artık yeni liderlik sözleşmesini kullanacak ---
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

// --- GUNCELLENMIS FONKSIYON: Liderlik tablosunu çek (Hata ayıklama eklenmiş) ---
async function getLeaderboardFromBlockchain(limit = 50) {
    try {
        if (!web3 || !leaderboardContract) {
            console.log("Initializing web3/contract...");
            initReadOnlyWeb3();
        }
        if (!leaderboardContract) {
            console.error("ERROR: Leaderboard contract is still not initialized!");
            throw new Error("Leaderboard contract not initialized");
        }

        console.log("DEBUG: About to call getTop50 on contract:", LEADERBOARD_CONTRACT_ADDRESS);
        
        // getTop50 fonksiyonunu çağır - Cache engelleme eklendi
        const result = await leaderboardContract.methods.getTop50().call({ cache: 'no-store' });
        
        console.log("DEBUG: Raw result received from getTop50:", result);
        console.log("DEBUG: Type of result:", typeof result);
        console.log("DEBUG: Is result an array?", Array.isArray(result));
        
        // Web3.js bazen sonuçları farklı şekilde döndürebilir
        let addrsArray, scoresArray;
        if (Array.isArray(result)) {
            // Eski Web3.js sürümleri bazen array olarak döndürebilir
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
            // Yeni Web3.js sürümleri genellikle isimlendirilmiş obje olarak döndürür
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
        // Hatanın yığın izini (stack trace) de alalım
        if (error.stack) {
            console.error("Error stack:", error.stack);
        }
        return { success: false, error: error.message || "Could not fetch leaderboard" };
    }
}
// --- GUNCELLENMIS FONKSIYON SON ---

// Globala aç
window.connectToWeb3Interactive = connectToWeb3Interactive;
window.submitScoreToBlockchain = submitScoreToBlockchain;
// --- YENI: getLeaderboardFromBlockchain global olarak açıldı ---
window.getLeaderboardFromBlockchain = getLeaderboardFromBlockchain;
// --- YENI SON ---
window.initReadOnlyWeb3 = initReadOnlyWeb3;

// Sayfa yüklendiğinde readonly başlat
window.addEventListener('load', initReadOnlyWeb3);
