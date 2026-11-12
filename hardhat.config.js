require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const rawKey = process.env.PRIVATE_KEY?.trim();
const privateKey = rawKey ? (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`) : undefined;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchainMainnet: {
      url: process.env.BOTCHAIN_MAINNET_RPC_URL || "https://rpc.botchain.ai",
      chainId: 677,
      accounts: privateKey ? [privateKey] : [],
    },
    botchain: {
      url: process.env.BOTCHAIN_MAINNET_RPC_URL || "https://rpc.botchain.ai",
      chainId: 677,
      accounts: privateKey ? [privateKey] : [],
    },
  },
  etherscan: {
    apiKey: {
      botchainMainnet: "empty",
      botchain: "empty",
    },
    customChains: [
      {
        network: "botchainMainnet",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
      {
        network: "botchain",
        chainId: 677,
        urls: {
          apiURL: "https://scan.botchain.ai/api",
          browserURL: "https://scan.botchain.ai",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
