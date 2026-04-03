import { defineChain } from "viem";

export const citrea = defineChain({
  id: 4114,
  name: "Citrea",
  nativeCurrency: {
    name: "Citrea BTC",
    symbol: "cBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.citreascan.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "CitreaScan",
      url: "https://citreascan.com",
    },
  },
});
