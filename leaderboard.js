// Leaderboard element references
const connectWalletButton = document.getElementById('connectWalletButton');
const walletStatusLB = document.getElementById('walletStatus');
const loadingMessage = document.getElementById('loadingMessage');
const leaderboardTable = document.getElementById('leaderboardTable');
const leaderboardBody = document.getElementById('leaderboardBody');

// Buraya bilinen oyuncu adreslerini ekle
// İstersen kontrattan getAllPlayers() fonksiyonu ile çekebilirsin
const KNOWN_PLAYERS = [
    "0xAa0EA4048fb7Ab4847a35cD9d9889198F1e7128e",
    "0x1234567890123456789012345678901234567890",
    "0x0987654321098765432109876543210987654321",
    "0x7777777777777777777777777777777777777777"
];

connectWalletButton.addEventListener('click', async () => {
    if (typeof connectToWeb3Interactive === 'function') {
        connectWalletButton.disabled = true;
        walletStatusLB.textContent = 'Connecting...';
        const res = await connectToWeb3Interactive();
        if (res.success) {
            walletStatusLB.textContent = `Connected: ${res.account.substring(0, 10)}...${res.account.slice(-6)}`;
            connectWalletButton.textContent = 'Connected';
            await loadLeaderboard();
        } else {
            walletStatusLB.textContent = `Error: ${res.error}`;
            connectWalletButton.disabled = false;
        }
    } else {
        walletStatusLB.textContent = 'Wallet integration not available';
    }
});

async function loadLeaderboard() {
    try {
        if (!contract) {
            loadingMessage.textContent = 'Blockchain connection not ready.';
            return;
        }

        loadingMessage.textContent = 'Loading leaderboard from blockchain...';
        const leaderboardData = [];

        for (const player of KNOWN_PLAYERS) {
            try {
                const score = await contract.methods.getPlayerScore(player).call();
                leaderboardData.push({ player, score: parseInt(score) });
            } catch (err) {
                console.warn(`Error fetching score for ${player}`, err);
            }
        }

        leaderboardData.sort((a, b) => b.score - a.score);

        // İlk 10 oyuncu
        displayLeaderboard(leaderboardData.slice(0, 10));

    } catch (error) {
        loadingMessage.textContent = `Error loading leaderboard: ${error.message}`;
        loadingMessage.className = 'error';
    }
}

function displayLeaderboard(data) {
    loadingMessage.classList.add('hidden');
    leaderboardTable.classList.remove('hidden');
    leaderboardBody.innerHTML = '';

    data.forEach((entry, index) => {
        const row = document.createElement('tr');

        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;

        const playerCell = document.createElement('td');
        playerCell.textContent = `${entry.player.substring(0, 6)}...${entry.player.slice(-4)}`;

        const scoreCell = document.createElement('td');
        scoreCell.textContent = entry.score;

        row.appendChild(rankCell);
        row.appendChild(playerCell);
        row.appendChild(scoreCell);

        leaderboardBody.appendChild(row);
    });
}

window.addEventListener('load', () => {
    // Game Over ekranında çağırmak için:
    // loadLeaderboard();
});
