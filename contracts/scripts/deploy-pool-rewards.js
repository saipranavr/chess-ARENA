const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the deployed ChessArena contract address
  const chessArenaAddress = process.env.CHESS_ARENA_ADDRESS;
  if (!chessArenaAddress) {
    throw new Error("CHESS_ARENA_ADDRESS environment variable is not set");
  }

  // Get the reward token address
  const rewardTokenAddress = process.env.REWARD_TOKEN_ADDRESS;
  if (!rewardTokenAddress) {
    throw new Error("REWARD_TOKEN_ADDRESS environment variable is not set");
  }

  // Deploy ChessPoolRewards
  const ChessPoolRewards = await hre.ethers.getContractFactory("ChessPoolRewards");
  const poolRewards = await ChessPoolRewards.deploy(
    chessArenaAddress,
    rewardTokenAddress
  );

  await poolRewards.deployed();

  console.log("ChessPoolRewards deployed to:", poolRewards.address);

  // Wait for a few block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await poolRewards.deployTransaction.wait(5);

  // Verify the contract on Snowtrace
  if (process.env.SNOWTRACE_API_KEY) {
    console.log("Verifying contract on Snowtrace...");
    try {
      await hre.run("verify:verify", {
        address: poolRewards.address,
        constructorArguments: [chessArenaAddress, rewardTokenAddress],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }

  // Log deployment information
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("ChessPoolRewards:", poolRewards.address);
  console.log("ChessArena:", chessArenaAddress);
  console.log("Reward Token:", rewardTokenAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 