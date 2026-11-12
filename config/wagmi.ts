import { http, createConfig, injected } from "wagmi";
import { botchainMainnet } from "./chain";

export const config = createConfig({
  chains: [botchainMainnet],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [botchainMainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai"),
  },
  ssr: true,
});
