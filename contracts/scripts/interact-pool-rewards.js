const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Interacting with account:", signer.address);

  // Load deployed contract addresses from environment
  const poolRewardsAddress = process.env.POOL_REWARDS_ADDRESS;
  const rewardTokenAddress = process.env.REWARD_TOKEN_ADDRESS;

  if (!poolRewardsAddress || !rewardTokenAddress) {
    throw new Error("Please set POOL_REWARDS_ADDRESS and REWARD_TOKEN_ADDRESS in .env");
  }

  // Get contract instances
  const poolRewards = await hre.ethers.getContractAt("ChessPoolRewards", poolRewardsAddress);
  const rewardToken = await hre.ethers.getContractAt("IERC20", rewardTokenAddress);

  // Get current pool information
  const poolBalance = await poolRewards.getPoolBalance();
  console.log("\nCurrent Pool Information:");
  console.log("------------------------");
  console.log("Pool Balance:", hre.ethers.utils.formatEther(poolBalance), "tokens");

  // Get time until next distribution
  const timeUntilNextDistribution = await poolRewards.getTimeUntilNextDistribution();
  const daysUntilDistribution = Math.floor(timeUntilNextDistribution / (24 * 60 * 60));
  const hoursUntilDistribution = Math.floor((timeUntilNextDistribution % (24 * 60 * 60)) / (60 * 60));
  console.log("\nTime until next distribution:");
  console.log(`${daysUntilDistribution} days and ${hoursUntilDistribution} hours`);

  // Check if user has approved tokens
  const allowance = await rewardToken.allowance(signer.address, poolRewardsAddress);
  console.log("\nToken Allowance:", hre.ethers.utils.formatEther(allowance), "tokens");

  // Example of contributing to pool
  if (process.argv.includes("--contribute")) {
    const amount = process.argv[process.argv.indexOf("--contribute") + 1];
    if (!amount) {
      console.error("Please specify amount to contribute");
      process.exit(1);
    }

    const contributionAmount = hre.ethers.utils.parseEther(amount);
    
    // Check if approval is needed
    if (allowance.lt(contributionAmount)) {
      console.log("\nApproving tokens...");
      const approveTx = await rewardToken.approve(poolRewardsAddress, contributionAmount);
      await approveTx.wait();
      console.log("✓ Tokens approved");
    }

    console.log("\nContributing to pool...");
    const contributeTx = await poolRewards.contributeToPool(contributionAmount);
    await contributeTx.wait();
    console.log("✓ Contribution successful");
  }

  // Example of checking if distribution is possible
  if (process.argv.includes("--check-distribution")) {
    try {
      const canDistribute = await poolRewards.callStatic.distributeRewards();
      console.log("\nDistribution check:");
      console.log("✓ Distribution is possible");
    } catch (error) {
      console.log("\nDistribution check:");
      console.log("✗ Distribution is not possible yet");
      console.log("Error:", error.message);
    }
  }

  // Example of triggering distribution
  if (process.argv.includes("--distribute")) {
    console.log("\nAttempting to distribute rewards...");
    try {
      const distributeTx = await poolRewards.distributeRewards();
      await distributeTx.wait();
      console.log("✓ Rewards distributed successfully");
    } catch (error) {
      console.log("✗ Distribution failed");
      console.log("Error:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 