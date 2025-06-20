const hre = require("hardhat");

async function main() {
  console.log("Deploying ChessRewardToken contract...");

  const ChessRewardToken = await hre.ethers.getContractFactory("ChessRewardToken");
  const token = await ChessRewardToken.deploy();

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log(`ChessRewardToken deployed to: ${address}`);

  // Verify contract on block explorer (if not on local network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await token.deploymentTransaction().wait(6); // Wait for 6 block confirmations

    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Error verifying contract:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 