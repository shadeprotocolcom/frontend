import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { citrea } from "./chains";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [citrea],
    transports: {
      [citrea.id]: http("https://rpc.citreascan.com"),
    },
    walletConnectProjectId: "ff8462473823e990f08665e225e246a6",
    appName: "Shade Protocol",
    appDescription: "Private cBTC transactions on Citrea",
    appUrl: "https://shade-protocol.com",
  }),
);
