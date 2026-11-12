const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const isMainnet = chainId === 677;

  const currencySymbol = isMainnet ? "BOT" : "BOHR";
  const explorerBase = isMainnet ? "https://scan.botchain.ai" : "https://scan.bohr.life";
  const networkName = isMainnet ? "Botchain Mainnet" : "Botchain Testnet";

  console.log("==================================================");
  console.log(`Deploying Kindly contract to ${networkName}...`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Deployer Address: ${deployer ? deployer.address : "N/A"}`);

  if (!deployer) {
    throw new Error("No deployer account configured. Check PRIVATE_KEY in .env");
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(balance)} ${currencySymbol}`);

  // Fetch optimal gas price without overpaying
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || hre.ethers.parseUnits("20", "gwei");
  console.log(`Using Standard Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} Gwei`);
  console.log("==================================================");

  const Kindly = await hre.ethers.getContractFactory("Kindly");
  
  // Deploy with exact optimal gasPrice
  const kindly = await Kindly.deploy({
    gasPrice: gasPrice,
  });

  console.log("Transaction submitted. Waiting for confirmation...");
  await kindly.waitForDeployment();

  const contractAddress = await kindly.getAddress();
  const deployTx = kindly.deploymentTransaction();
  const receipt = await deployTx.wait();

  const gasUsed = receipt.gasUsed;
  const totalCost = gasUsed * gasPrice;

  console.log("==================================================");
  console.log(`Kindly contract deployed successfully!`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Gas Used: ${gasUsed.toString()} units`);
  console.log(`Total Deployment Fee: ${hre.ethers.formatEther(totalCost)} ${currencySymbol}`);
  console.log(`Explorer Link: ${explorerBase}/address/${contractAddress}`);
  console.log("==================================================");

  // Save deployment info
  const deploymentDir = path.join(__dirname, "../config");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentData = {
    address: contractAddress,
    chainId: chainId,
    networkName: networkName,
    explorer: `${explorerBase}/address/${contractAddress}`,
    gasUsed: gasUsed.toString(),
    deploymentCost: hre.ethers.formatEther(totalCost),
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(deploymentDir, "deployedAddress.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Update .env file
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update contract address
    if (envContent.includes("NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    // Update chain ID
    if (envContent.includes("NEXT_PUBLIC_CHAIN_ID=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CHAIN_ID=.*/,
        `NEXT_PUBLIC_CHAIN_ID=${chainId}`
      );
    }

    // Update RPC URLs
    const rpcUrl = isMainnet ? "https://rpc.botchain.ai" : "https://rpc.bohr.life";
    if (envContent.includes("NEXT_PUBLIC_RPC_URL=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_RPC_URL=.*/,
        `NEXT_PUBLIC_RPC_URL=${rpcUrl}`
      );
    }
    if (envContent.includes("BOTCHAIN_RPC_URL=")) {
      envContent = envContent.replace(
        /BOTCHAIN_RPC_URL=.*/,
        `BOTCHAIN_RPC_URL=${rpcUrl}`
      );
    }

    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(`Updated NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS and network configs in .env`);
  }

  console.log(`Deployment info saved to config/deployedAddress.json`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
