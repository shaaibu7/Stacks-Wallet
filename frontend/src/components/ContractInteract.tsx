/**
 * Contract Interaction Component
 * 
 * Provides UI for calling public contract functions (mint, transfer, etc.)
 * using the connected wallet via Reown AppKit.
 */

import { useState, useCallback } from "react";
import { useContractCall } from "../hooks/useContractCall";
import { useWallet } from "./WalletConnect";
import { uintCV, standardPrincipalCV, boolCV } from "@stacks/transactions";
import type { NetworkKey } from "../types/wallet";

interface ContractInteractProps {
  contractAddress: string;
  contractName: string;
  network: NetworkKey;
}

export function ContractInteract({ contractAddress, contractName, network }: ContractInteractProps) {
  const { isConnected, address } = useWallet();
  const { call, isCalling, error, clearError, lastTxId } = useContractCall();

  // Mint state
  const [mintAmount, setMintAmount] = useState("");
  const [mintRecipient, setMintRecipient] = useState("");

  // Transfer state
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");

  // Pause state
  const [mintingPaused, setMintingPaused] = useState<boolean | null>(null);

  const handleMint = useCallback(async () => {
    if (!mintAmount || !mintRecipient) {
      alert("Please enter amount and recipient");
      return;
    }

    const amount = Number.parseInt(mintAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    await call({
      contractAddress,
      contractName,
      functionName: "mint",
      functionArgs: [uintCV(amount), standardPrincipalCV(mintRecipient)],
      network,
    });
  }, [mintAmount, mintRecipient, contractAddress, contractName, network, call]);

  const handleTransfer = useCallback(async () => {
    if (!transferAmount || !transferRecipient || !address) {
      alert("Please enter amount, recipient, and ensure wallet is connected");
      return;
    }

    const amount = Number.parseInt(transferAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    await call({
      contractAddress,
      contractName,
      functionName: "transfer",
      functionArgs: [
        uintCV(amount),
        standardPrincipalCV(address),
        standardPrincipalCV(transferRecipient),
      ],
      network,
    });
  }, [transferAmount, transferRecipient, address, contractAddress, contractName, network, call]);

  const handleSetMintingPaused = useCallback(async (paused: boolean) => {
    await call({
      contractAddress,
      contractName,
      functionName: "set-minting-paused",
      functionArgs: [boolCV(paused)],
      network,
    });
  }, [contractAddress, contractName, network, call]);

  if (!isConnected) {
    return (
      <div className="section">
        <h2>Interact with Contract</h2>
        <p>Please connect your wallet to call contract functions.</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>Interact with Contract</h2>
      <p>Call public functions on {contractName} using your connected wallet.</p>

      {/* Mint Section */}
      <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "4px" }}>
        <h3>Mint Tokens</h3>
        <p style={{ fontSize: "0.875rem", color: "#666" }}>
          Mint new tokens (contract owner only)
        </p>

        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label>
            <strong>Amount (micro-units):</strong>
            <input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="1000000"
              disabled={isCalling}
              style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem" }}
            />
          </label>

          <label>
            <strong>Recipient:</strong>
            <input
              type="text"
              value={mintRecipient}
              onChange={(e) => setMintRecipient(e.target.value)}
              placeholder={address || "ST..."}
              disabled={isCalling}
              style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem" }}
            />
          </label>

          <button
            onClick={handleMint}
            disabled={isCalling || !mintAmount || !mintRecipient}
            style={{ marginTop: "0.5rem", padding: "0.75rem 1.5rem" }}
          >
            {isCalling ? "Minting..." : "Mint Tokens"}
          </button>
        </div>
      </div>

      {error && (
        <div className="error" style={{ marginTop: "1rem" }}>
          <strong>Error:</strong> {error.message}
          <button onClick={clearError} style={{ marginLeft: "1rem" }}>Dismiss</button>
        </div>
      )}

      {lastTxId && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#e8f5e9",
          borderRadius: "4px"
        }}>
          <strong>✅ Transaction successful!</strong>
          <p>Transaction ID: <code>{lastTxId}</code></p>
          <p>
            <a
              href={`https://explorer.hiro.so/txid/${lastTxId}?chain=${network}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Explorer →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

