const hre = require("hardhat");
const { expect } = require("chai");

async function main() {
  const [deployer, player1, player2, player3] = await hre.ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // Deploy a mock ChessArena contract for testing
  const MockChessArena = await hre.ethers.getContractFactory("MockChessArena");
  const mockChessArena = await MockChessArena.deploy();
  await mockChessArena.deployed();
  console.log("MockChessArena deployed to:", mockChessArena.address);

  // Deploy a mock ERC20 token for testing
  const MockToken = await hre.ethers.getContractFactory("MockERC20");
  const mockToken = await MockToken.deploy("Mock Token", "MTK");
  await mockToken.deployed();
  console.log("MockToken deployed to:", mockToken.address);

  // Deploy ChessPoolRewards
  const ChessPoolRewards = await hre.ethers.getContractFactory("ChessPoolRewards");
  const poolRewards = await ChessPoolRewards.deploy(
    mockChessArena.address,
    mockToken.address
  );
  await poolRewards.deployed();
  console.log("ChessPoolRewards deployed to:", poolRewards.address);

  // Test 1: Initial state
  console.log("\nTest 1: Checking initial state");
  const initialBalance = await mockToken.balanceOf(poolRewards.address);
  expect(initialBalance).to.equal(0);
  console.log("✓ Initial pool balance is 0");

  // Test 2: Contributing to pool
  console.log("\nTest 2: Testing pool contribution");
  const contributionAmount = hre.ethers.utils.parseEther("100");
  await mockToken.mint(deployer.address, contributionAmount);
  await mockToken.approve(poolRewards.address, contributionAmount);
  await poolRewards.contributeToPool(contributionAmount);
  
  const poolBalance = await poolRewards.getPoolBalance();
  expect(poolBalance).to.equal(contributionAmount);
  console.log("✓ Pool contribution successful");

  // Test 3: Setting up mock leaderboard
  console.log("\nTest 3: Setting up mock leaderboard");
  await mockChessArena.setTopPlayers([player1.address, player2.address, player3.address]);
  console.log("✓ Mock leaderboard set up");

  // Test 4: Testing reward distribution
  console.log("\nTest 4: Testing reward distribution");
  // Fast forward time to next distribution
  await hre.network.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // 1 week
  await hre.network.provider.send("evm_mine");

  await poolRewards.distributeRewards();

  // Check balances after distribution
  const player1Balance = await mockToken.balanceOf(player1.address);
  const player2Balance = await mockToken.balanceOf(player2.address);
  const player3Balance = await mockToken.balanceOf(player3.address);

  expect(player1Balance).to.equal(contributionAmount.mul(50).div(100)); // 50%
  expect(player2Balance).to.equal(contributionAmount.mul(30).div(100)); // 30%
  expect(player3Balance).to.equal(contributionAmount.mul(20).div(100)); // 20%

  console.log("✓ Rewards distributed correctly");
  console.log("  Player 1 (1st place):", hre.ethers.utils.formatEther(player1Balance), "tokens");
  console.log("  Player 2 (2nd place):", hre.ethers.utils.formatEther(player2Balance), "tokens");
  console.log("  Player 3 (3rd place):", hre.ethers.utils.formatEther(player3Balance), "tokens");

  console.log("\nAll tests passed successfully! 🎉");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 