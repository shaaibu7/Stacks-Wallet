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

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      const accounts = await appKit.getAccount();
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0].address);
        setIsConnected(true);
      }
    };
    checkConnection();

    // Listen for connection events
    const unsubscribe = appKit.subscribe((state) => {
      const accounts = state.accounts;
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0].address);
        setIsConnected(true);
        setIsConnecting(false);
      } else {
        setAddress(null);
        setIsConnected(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const connect = async () => {
    try {
      setIsConnecting(true);
      await appKit.open();
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await appKit.disconnect();
      setAddress(null);
      setIsConnected(false);
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  };

  return {
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect,
  };
}
