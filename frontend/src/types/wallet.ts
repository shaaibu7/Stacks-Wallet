/**
 * Wallet-related TypeScript types and interfaces
 */

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: WalletError | null;
}

export interface WalletError {
  code: string;
  message: string;
  details?: unknown;
}

export interface UseWalletReturn {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: WalletError | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

export type WalletConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

