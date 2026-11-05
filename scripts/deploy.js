const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("--------------------------------------------------");
  console.log("Deploying Kindly contract...");
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer Address: ${deployer ? deployer.address : "N/A"}`);

  if (deployer) {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Deployer Balance: ${hre.ethers.formatEther(balance)} BOHR`);
  }
  console.log("--------------------------------------------------");

  const Kindly = await hre.ethers.getContractFactory("Kindly");
  const kindly = await Kindly.deploy();
  await kindly.waitForDeployment();

  const contractAddress = await kindly.getAddress();
  console.log(`Kindly contract deployed successfully!`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Explorer Link: https://scan.bohr.life/address/${contractAddress}`);
  console.log("--------------------------------------------------");

  // Export deployment details for the frontend
  const deploymentDir = path.join(__dirname, "../config");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    chainId: Number(network.chainId),
    networkName: network.chainId === 968n ? "Botchain Testnet" : network.name,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(deploymentDir, "deployedAddress.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Update .env file with deployed address
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(`Updated NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS in .env`);
  }

  console.log(`Deployment info saved to config/deployedAddress.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
