/**
 * Wallet Context Provider
 * Provides wallet state to all child components via React Context
 */

import { createContext, useContext, ReactNode } from "react";
import { useWallet } from "../components/WalletConnect";
import type { UseWalletReturn } from "../types/wallet";

interface WalletContextValue extends UseWalletReturn {}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const wallet = useWallet();

  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext(): WalletContextValue {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
}

