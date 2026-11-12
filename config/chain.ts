import { defineChain } from "viem";

export const botchainMainnet = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai"],
    },
    public: {
      http: ["https://rpc.botchain.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "BOT Chain Explorer",
      url: "https://scan.botchain.ai",
    },
  },
});

// Primary network
export const botchain = botchainMainnet;
