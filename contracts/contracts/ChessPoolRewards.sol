// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IChessArena {
    function getTopPlayers(uint256 count) external view returns (address[] memory);
}

contract ChessPoolRewards is Ownable, ReentrancyGuard {
    IChessArena public chessArena;
    IERC20 public rewardToken;

    uint256 public constant DISTRIBUTION_INTERVAL = 1 weeks;
    uint256 public constant DISTRIBUTION_HOUR = 13; // 1 PM
    uint256 public lastDistributionTime;

    // Prize distribution percentages (in basis points, 1% = 100)
    uint256 public constant FIRST_PLACE_PERCENTAGE = 5000;  // 50%
    uint256 public constant SECOND_PLACE_PERCENTAGE = 3000; // 30%
    uint256 public constant THIRD_PLACE_PERCENTAGE = 2000;  // 20%

    event RewardDistributed(address indexed player, uint256 amount);
    event PoolContribution(address indexed contributor, uint256 amount);

    constructor(address _chessArena, address _rewardToken) {
        chessArena = IChessArena(_chessArena);
        rewardToken = IERC20(_rewardToken);
        lastDistributionTime = block.timestamp;
    }

    function contributeToPool(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(
            rewardToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        emit PoolContribution(msg.sender, amount);
    }

    function distributeRewards() external {
        require(
            block.timestamp >= lastDistributionTime + DISTRIBUTION_INTERVAL,
            "Too early to distribute"
        );
        require(
            block.timestamp % 1 days / 1 hours == DISTRIBUTION_HOUR,
            "Can only distribute at 1 PM"
        );

        uint256 totalPool = rewardToken.balanceOf(address(this));
        require(totalPool > 0, "No rewards to distribute");

        address[] memory topPlayers = chessArena.getTopPlayers(3);
        require(topPlayers.length == 3, "Not enough players");

        // Calculate rewards
        uint256 firstPlaceReward = (totalPool * FIRST_PLACE_PERCENTAGE) / 10000;
        uint256 secondPlaceReward = (totalPool * SECOND_PLACE_PERCENTAGE) / 10000;
        uint256 thirdPlaceReward = (totalPool * THIRD_PLACE_PERCENTAGE) / 10000;

        // Distribute rewards
        if (topPlayers[0] != address(0)) {
            rewardToken.transfer(topPlayers[0], firstPlaceReward);
            emit RewardDistributed(topPlayers[0], firstPlaceReward);
        }
        if (topPlayers[1] != address(0)) {
            rewardToken.transfer(topPlayers[1], secondPlaceReward);
            emit RewardDistributed(topPlayers[1], secondPlaceReward);
        }
        if (topPlayers[2] != address(0)) {
            rewardToken.transfer(topPlayers[2], thirdPlaceReward);
            emit RewardDistributed(topPlayers[2], thirdPlaceReward);
        }

        lastDistributionTime = block.timestamp;
    }

    function getPoolBalance() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function getTimeUntilNextDistribution() external view returns (uint256) {
        uint256 nextDistribution = lastDistributionTime + DISTRIBUTION_INTERVAL;
        if (block.timestamp >= nextDistribution) {
            return 0;
        }
        return nextDistribution - block.timestamp;
    }
} 