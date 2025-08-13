// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Basit ve gaz-dostu on-chain leaderboard.
 * - Kullanıcının en iyi skorunu saklar (bestScore).
 * - Top 10 tablosunu kontrat içinde tutar (insert-sort ile güncellenir).
 * - getTop10() ile (adresler, skorlar) döner.
 */
contract PirateParrotLeaderboard {
    mapping(address => uint256) public bestScore;

    address[10] public topAddresses;
    uint256[10] public topScores;

    event ScoreSubmitted(address indexed player, uint256 submitted, uint256 best);

    function submitScore(uint256 score) external {
        uint256 best = bestScore[msg.sender];
        // sadece daha iyiyse güncelle
        if (score > best) {
            bestScore[msg.sender] = score;
            best = score;
            _updateTop(msg.sender, score);
        }
        emit ScoreSubmitted(msg.sender, score, best);
    }

    function getPlayerScore(address player) external view returns (uint256) {
        return bestScore[player];
    }

    function getTop10() external view returns (address[10] memory addrs, uint256[10] memory scores) {
        return (topAddresses, topScores);
    }

    // --- internal helpers ---

    function _updateTop(address player, uint256 score) internal {
        // Zaten listede varsa ve yeni skor daha düşük/aynı ise çık
        for (uint256 i = 0; i < 10; i++) {
            if (topAddresses[i] == player) {
                if (score <= topScores[i]) return;

                // Eski pozisyonu boşalt (sağa kaydır)
                for (uint256 j = i; j < 9; j++) {
                    topAddresses[j] = topAddresses[j + 1];
                    topScores[j] = topScores[j + 1];
                }
                topAddresses[9] = address(0);
                topScores[9] = 0;
                break;
            }
        }

        // Doğru pozisyona yerleştir (büyükten küçüğe)
        for (uint256 i = 0; i < 10; i++) {
            if (score > topScores[i]) {
                for (uint256 j = 9; j > i; j--) {
                    topAddresses[j] = topAddresses[j - 1];
                    topScores[j] = topScores[j - 1];
                }
                topAddresses[i] = player;
                topScores[i] = score;
                break;
            }
        }
    }
}
