import { useEffect, useState } from "react";
import { createAppKit } from "@reown/appkit/react";
import { createAppKitNetwork } from "@reown/appkit/networks";

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

const appKit = createAppKit({
  adapters: ["stacks"],
  networks: [stacksMainnet, stacksTestnet],
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID || "demo-project-id",
  metadata: {
    name: "Stacks Wallet",
    description: "SIP-010 Token Wallet",
    url: window.location.origin,
  },
});

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = appKit.subscribe((state) => {
      setAddress(state.accounts?.[0]?.address || null);
    });
    return unsubscribe;
  }, []);

  return {
    address,
    isConnected: !!address,
    connect: () => appKit.open(),
    disconnect: () => appKit.disconnect(),
  };
}
