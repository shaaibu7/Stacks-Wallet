/**
 * Hook for deploying smart contracts using Reown AppKit
 * Allows users to deploy Clarity contracts directly from the frontend
 */

import { useCallback, useState } from "react";
import { 
  makeContractDeploy, 
  broadcastTransaction, 
  AnchorMode, 
  ClarityVersion,
  signTransaction 
} from "@stacks/transactions";
import { STACKS_MAINNET, STACKS_TESTNET, createNetwork } from "@stacks/network";
import { appKit } from "../lib/appkit.instance";
import type { WalletError } from "../types/wallet";
import { createWalletError, extractErrorMessage, isUserRejection } from "../utils/wallet.utils";

export interface DeployContractParams {
  contractName: string;
  contractSource: string;
  network: "mainnet" | "testnet";
  fee?: number;
  clarityVersion?: ClarityVersion;
}

export interface UseContractDeployReturn {
  deploy: (params: DeployContractParams) => Promise<string | null>;
  isDeploying: boolean;
  error: WalletError | null;
  clearError: () => void;
  lastTxId: string | null;
}

/**
 * Hook for deploying smart contracts via connected wallet
 */
export function useContractDeploy(): UseContractDeployReturn {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<WalletError | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const deploy = useCallback(async (params: DeployContractParams): Promise<string | null> => {
    const {
      contractName,
      contractSource,
      network: networkKey,
      fee = 150000, // Default 0.15 STX
      clarityVersion = ClarityVersion.Clarity4,
    } = params;

    // Check if wallet is connected
    const state = appKit.getState();
    const address = state.accounts?.[0]?.address;
    
    if (!address) {
      const err = createWalletError(
        "NOT_CONNECTED",
        "Wallet not connected. Please connect your wallet first.",
        null
      );
      setError(err);
      return null;
    }

    setIsDeploying(true);
    setError(null);
    setLastTxId(null);

    try {
      // Build network
      const baseNetwork = networkKey === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET;
      const network = createNetwork({
        network: baseNetwork,
        client: { baseUrl: baseNetwork.client.baseUrl },
      });

      // Create the contract deployment transaction (unsigned)
      const transaction = await makeContractDeploy({
        contractName,
        codeBody: contractSource,
        network,
        anchorMode: AnchorMode.Any,
        clarityVersion,
        fee,
        postConditionMode: 0x01,
        // We'll sign this with the wallet adapter
      });

      // Get the Stacks adapter from AppKit to sign the transaction
      // Note: The exact API may vary based on AppKit version
      // This will prompt the user to approve the transaction in their wallet
      const stacksAdapter = appKit.getAdapter("stacks");
      if (!stacksAdapter) {
        throw new Error("Stacks adapter not available. Please connect your wallet first.");
      }

      // Sign the transaction using the wallet adapter
      // The adapter handles the wallet interaction and user approval
      let signedTx;
      try {
        // Try the signTransaction method if available
        if (typeof stacksAdapter.signTransaction === "function") {
          signedTx = await stacksAdapter.signTransaction({
            transaction,
            network,
          });
        } else {
          // Fallback: if adapter doesn't expose signTransaction directly,
          // we may need to use a different approach
          throw new Error("Transaction signing not available through adapter. Please check AppKit version.");
        }
      } catch (signError: any) {
        const errorMsg = extractErrorMessage(signError);
        if (isUserRejection(signError)) {
          // User cancelled - don't show error
          return null;
        }
        throw new Error(`Transaction signing failed: ${errorMsg}`);
      }

      if (!signedTx) {
        throw new Error("Transaction signing was cancelled or returned no result");
      }

      // Broadcast the signed transaction
      const broadcastResponse = await broadcastTransaction({
        transaction: signedTx,
        network,
      });

      if ("error" in broadcastResponse) {
        const errorMsg = typeof broadcastResponse.error === "string"
          ? broadcastResponse.error
          : JSON.stringify(broadcastResponse.error);
        throw new Error(`Broadcast failed: ${errorMsg}`);
      }

      const txId = broadcastResponse.txid;
      setLastTxId(txId);
      setIsDeploying(false);
      
      return txId;
    } catch (err) {
      setIsDeploying(false);
      
      const errorMessage = extractErrorMessage(err);
      const isRejection = isUserRejection(err);

      if (!isRejection) {
        const deployError = createWalletError(
          "DEPLOYMENT_ERROR",
          `Contract deployment failed: ${errorMessage}`,
          err
        );
        setError(deployError);
        console.error("Contract deployment error:", err);
      }

      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deploy,
    isDeploying,
    error,
    clearError,
    lastTxId,
  };
}

