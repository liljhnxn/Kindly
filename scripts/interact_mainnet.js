require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  const rpcUrl = process.env.BOTCHAIN_RPC_URL || 'https://rpc.botchain.ai';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const contractAddress = process.env.NEXT_PUBLIC_KINDLY_CONTRACT_ADDRESS || '0xf4d84d1977Dc4421b2E32C42Dd95e0844f277D0d';
  const artifactPath = path.join(__dirname, '../artifacts/contracts/Kindly.sol/Kindly.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  const pk1 = process.env.PRIVATE_KEY;
  const pk2 = process.env.PRIVATE_KEY_2;
  const pk3 = process.env.PRIVATE_KEY_3;

  if (!pk1 || !pk2 || !pk3) {
    throw new Error('Please configure PRIVATE_KEY, PRIVATE_KEY_2, and PRIVATE_KEY_3 in .env');
  }

  const wallet1 = new ethers.Wallet(pk1, provider);
  const wallet2 = new ethers.Wallet(pk2, provider);
  const wallet3 = new ethers.Wallet(pk3, provider);

  const contract1 = new ethers.Contract(contractAddress, artifact.abi, wallet1);
  const contract2 = new ethers.Contract(contractAddress, artifact.abi, wallet2);
  const contract3 = new ethers.Contract(contractAddress, artifact.abi, wallet3);

  console.log('=== Checking Balances ===');
  const b1 = await provider.getBalance(wallet1.address);
  const b2 = await provider.getBalance(wallet2.address);
  const b3 = await provider.getBalance(wallet3.address);
  console.log(`Wallet 1 (${wallet1.address}): ${ethers.formatEther(b1)} BOT`);
  console.log(`Wallet 2 (${wallet2.address}): ${ethers.formatEther(b2)} BOT`);
  console.log(`Wallet 3 (${wallet3.address}): ${ethers.formatEther(b3)} BOT`);

  const initialRequests = await contract1.getTotalRequests();
  console.log(`Initial total requests: ${initialRequests.toString()}`);

  const results = [];
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

  // Interaction 1: Wallet 1 creates Request #1
  console.log('\n--- Interaction 1 (Wallet 1): createRequest #1 ---');
  const tx1 = await contract1.createRequest(
    'Help moving a 2-seater couch',
    'Need a neighbor to help carry a small couch to the 2nd floor elevator',
    'Community Assistance',
    { gasPrice }
  );
  console.log(`Tx1 sent: ${tx1.hash}`);
  const receipt1 = await tx1.wait();
  console.log(`Tx1 confirmed in block ${receipt1.blockNumber} (Gas used: ${receipt1.gasUsed.toString()})`);
  const reqId1 = (await contract1.getTotalRequests()).toString();
  results.push({
    interaction: 1,
    action: 'createRequest',
    wallet: wallet1.address,
    txHash: tx1.hash,
    blockNumber: receipt1.blockNumber,
    gasUsed: receipt1.gasUsed.toString(),
    details: `Request #${reqId1}: Help moving a 2-seater couch`
  });

  // Interaction 2: Wallet 2 volunteers for Request #1
  console.log('\n--- Interaction 2 (Wallet 2): volunteer for Request #1 ---');
  const tx2 = await contract2.volunteer(reqId1, { gasPrice });
  console.log(`Tx2 sent: ${tx2.hash}`);
  const receipt2 = await tx2.wait();
  console.log(`Tx2 confirmed in block ${receipt2.blockNumber} (Gas used: ${receipt2.gasUsed.toString()})`);
  results.push({
    interaction: 2,
    action: 'volunteer',
    wallet: wallet2.address,
    txHash: tx2.hash,
    blockNumber: receipt2.blockNumber,
    gasUsed: receipt2.gasUsed.toString(),
    details: `Volunteered for Request #${reqId1}`
  });

  // Interaction 3: Wallet 1 completes Request #1
  console.log('\n--- Interaction 3 (Wallet 1): completeRequest #1 ---');
  const tx3 = await contract1.completeRequest(reqId1, { gasPrice });
  console.log(`Tx3 sent: ${tx3.hash}`);
  const receipt3 = await tx3.wait();
  console.log(`Tx3 confirmed in block ${receipt3.blockNumber} (Gas used: ${receipt3.gasUsed.toString()})`);
  results.push({
    interaction: 3,
    action: 'completeRequest',
    wallet: wallet1.address,
    txHash: tx3.hash,
    blockNumber: receipt3.blockNumber,
    gasUsed: receipt3.gasUsed.toString(),
    details: `Completed Request #${reqId1}`
  });

  // Interaction 4: Wallet 2 creates Request #2
  console.log('\n--- Interaction 4 (Wallet 2): createRequest #2 ---');
  const tx4 = await contract2.createRequest(
    'High School Math Tutoring',
    'Seeking assistance with quadratic algebra homework for 45 minutes',
    'Education',
    { gasPrice }
  );
  console.log(`Tx4 sent: ${tx4.hash}`);
  const receipt4 = await tx4.wait();
  console.log(`Tx4 confirmed in block ${receipt4.blockNumber} (Gas used: ${receipt4.gasUsed.toString()})`);
  const reqId2 = (await contract2.getTotalRequests()).toString();
  results.push({
    interaction: 4,
    action: 'createRequest',
    wallet: wallet2.address,
    txHash: tx4.hash,
    blockNumber: receipt4.blockNumber,
    gasUsed: receipt4.gasUsed.toString(),
    details: `Request #${reqId2}: High School Math Tutoring`
  });

  // Interaction 5: Wallet 3 volunteers for Request #2
  console.log('\n--- Interaction 5 (Wallet 3): volunteer for Request #2 ---');
  const tx5 = await contract3.volunteer(reqId2, { gasPrice });
  console.log(`Tx5 sent: ${tx5.hash}`);
  const receipt5 = await tx5.wait();
  console.log(`Tx5 confirmed in block ${receipt5.blockNumber} (Gas used: ${receipt5.gasUsed.toString()})`);
  results.push({
    interaction: 5,
    action: 'volunteer',
    wallet: wallet3.address,
    txHash: tx5.hash,
    blockNumber: receipt5.blockNumber,
    gasUsed: receipt5.gasUsed.toString(),
    details: `Volunteered for Request #${reqId2}`
  });

  console.log('\n=== Summary of Interactions ===');
  console.log(JSON.stringify(results, null, 2));

  const totalReqs = await contract1.getTotalRequests();
  const completedReqs = await contract1.getCompletedRequestsCount();
  console.log('\n=== Final Kindly Stats ===');
  console.log(`Total Requests: ${totalReqs.toString()}`);
  console.log(`Completed Requests: ${completedReqs.toString()}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
