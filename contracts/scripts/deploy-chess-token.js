const hre = require("hardhat");

async function main() {
  console.log("Deploying ChessRewardToken...");

  const ChessRewardToken = await hre.ethers.getContractFactory("ChessRewardToken");
  const token = await ChessRewardToken.deploy();

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("ChessRewardToken deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 