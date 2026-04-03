import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { citrea } from "./chains";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [citrea],
    transports: {
      [citrea.id]: http("https://rpc.citreascan.com"),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    appName: "Shade Protocol",
    appDescription: "Private cBTC transactions on Citrea",
    appUrl: "https://shade-protocol.com",
  }),
);
