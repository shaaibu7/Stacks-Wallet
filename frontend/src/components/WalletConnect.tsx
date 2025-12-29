/**
 * Reown AppKit Wallet Connection Component
 * 
 * Provides a React hook for connecting to Stacks wallets via Reown AppKit (WalletConnect).
 * Handles connection state, error management, and provides a clean API for wallet operations.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseWalletReturn, WalletError } from "../types/wallet";
import { validateProjectId } from "../config/wallet.config";
import { createWalletError, extractErrorMessage, isUserRejection } from "../utils/wallet.utils";
import { appKit } from "../lib/appkit.instance";
import { useWalletConnection } from "../hooks/useWalletConnection";
import { saveLastConnectedAddress, getLastConnectedAddress } from "../lib/wallet.storage";

// Validate project ID on module load
if (typeof window !== "undefined") {
  validateProjectId();
}

/**
 * Custom hook for wallet connection management
 * 
 * @returns {UseWalletReturn} Wallet state and connection methods
 * 
 * @example
 * ```tsx
 * const { address, isConnected, connect, disconnect } = useWallet();
 * 
 * return (
 *   <button onClick={connect} disabled={isConnecting}>
 *     {isConnected ? `Connected: ${address}` : "Connect Wallet"}
 *   </button>
 * );
 * ```
 */
export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WalletError | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use connection persistence hook
  useWalletConnection();

  // Initialize wallet state and subscribe to changes
  useEffect(() => {
    isMountedRef.current = true;

    // Get initial state synchronously
    try {
      const initialState = appKit.getState();
      const initialAddress = initialState.accounts?.[0]?.address || null;
      if (isMountedRef.current && initialAddress) {
        setAddress(initialAddress);
        saveLastConnectedAddress(initialAddress);
      } else {
        // Try to restore from storage if no active connection
        const lastAddress = getLastConnectedAddress();
        if (lastAddress && isMountedRef.current) {
          // Address stored but not connected - will be handled by AppKit
          console.log("Previous wallet address found in storage:", lastAddress);
        }
      }
    } catch (err) {
      console.error("Failed to get initial wallet state:", err);
    }

    // Subscribe to state changes
    try {
      const unsubscribe = appKit.subscribe((state) => {
        if (!isMountedRef.current) return;

        const accountAddress = state.accounts?.[0]?.address || null;
        const wasConnected = address !== null;
        const isNowConnected = accountAddress !== null;

        // Update address
        setAddress(accountAddress);

        // Save connected address to storage
        if (accountAddress) {
          saveLastConnectedAddress(accountAddress);
        }

        // Reset connecting state when connection status changes
        if (wasConnected !== isNowConnected) {
          setIsConnecting(false);
          setError(null); // Clear errors on successful state change
        }
      });

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    } catch (err) {
      console.error("Failed to subscribe to wallet state:", err);
      setError(
        createWalletError(
          "SUBSCRIPTION_ERROR",
          "Failed to subscribe to wallet state changes",
          err
        )
      );
    }
  }, [address]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    };
  }, []);

  /**
   * Connect to a wallet via Reown AppKit
   */
  const connect = useCallback(async (): Promise<void> => {
    if (isConnecting) {
      console.warn("Wallet connection already in progress");
      return;
    }

    if (address) {
      console.warn("Wallet already connected");
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Set connection timeout (30 seconds)
    connectionTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && isConnecting) {
        setIsConnecting(false);
        setError(
          createWalletError(
            "CONNECTION_TIMEOUT",
            "Wallet connection timed out. Please try again.",
            null
          )
        );
      }
    }, 30000);

    try {
      await appKit.open();
      // Clear timeout on success
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      // State will be updated via subscription
    } catch (err) {
      if (!isMountedRef.current) return;

      // Clear timeout on error
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      const errorMessage = extractErrorMessage(err);
      const isRejection = isUserRejection(err);

      // Don't show error for user rejections (they're expected)
      if (!isRejection) {
        setError(
          createWalletError(
            "CONNECTION_ERROR",
            `Failed to connect wallet: ${errorMessage}`,
            err
          )
        );
        console.error("Wallet connection error:", err);
      }

      setIsConnecting(false);
    }
  }, [isConnecting, address]);

  /**
   * Disconnect from the current wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    if (!address) {
      console.warn("No wallet connected to disconnect");
      return;
    }

    try {
      await appKit.disconnect();
      // State will be updated via subscription
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;

      const errorMessage = extractErrorMessage(err);
      setError(
        createWalletError(
          "DISCONNECTION_ERROR",
          `Failed to disconnect wallet: ${errorMessage}`,
          err
        )
      );
      console.error("Wallet disconnection error:", err);
    }
  }, [address]);

  /**
   * Clear any wallet errors
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    address,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    clearError,
  };
}
