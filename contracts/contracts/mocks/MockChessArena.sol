// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockChessArena {
    address[] private topPlayers;

    function setTopPlayers(address[] memory _players) external {
        topPlayers = _players;
    }

    function getTopPlayers(uint256 count) external view returns (address[] memory) {
        require(count <= topPlayers.length, "Not enough players");
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = topPlayers[i];
        }
        return result;
    }
} 