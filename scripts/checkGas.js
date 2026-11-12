const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("--------------------------------------------------");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer Address: ${deployer ? deployer.address : "N/A"}`);

  if (!deployer) {
    console.error("No deployer found. Check PRIVATE_KEY in .env");
    return;
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(balance)} BOT`);

  const feeData = await hre.ethers.provider.getFeeData();
  console.log(`Current Gas Price: ${hre.ethers.formatUnits(feeData.gasPrice || 0n, "gwei")} Gwei (${feeData.gasPrice} wei)`);

  const Kindly = await hre.ethers.getContractFactory("Kindly");
  const deployTx = await Kindly.getDeployTransaction();
  const estimatedGas = await hre.ethers.provider.estimateGas(deployTx);
  console.log(`Estimated Deployment Gas Units: ${estimatedGas.toString()}`);

  const totalCostWei = estimatedGas * (feeData.gasPrice || 0n);
  console.log(`Estimated Total Deployment Cost: ${hre.ethers.formatEther(totalCostWei)} BOT`);
  console.log("--------------------------------------------------");
}

main().catch((err) => {
  console.error("Error inspecting gas / balance:", err);
  process.exitCode = 1;
});
