import { useEffect, useState } from "react";
import { createAppKit } from "@reown/appkit/react";
import { createAppKitNetwork } from "@reown/appkit/networks";

// Configure Stacks networks for AppKit
const stacksMainnet = createAppKitNetwork({
  id: 1,
  name: "Stacks Mainnet",
  network: "mainnet",
  rpcUrl: "https://api.mainnet.hiro.so",
});

const stacksTestnet = createAppKitNetwork({
  id: 2147483648,
  name: "Stacks Testnet",
  network: "testnet",
  rpcUrl: "https://api.testnet.hiro.so",
});

// Initialize AppKit
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "demo-project-id";

const appKit = createAppKit({
  adapters: ["stacks"],
  networks: [stacksMainnet, stacksTestnet],
  projectId,
  metadata: {
    name: "Stacks Wallet",
    description: "SIP-010 Token Wallet",
    url: window.location.origin,
    icons: [],
  },
});
