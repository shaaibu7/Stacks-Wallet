import React from 'react';
import { useWallet } from '../components/WalletConnect';
import { formatAddress } from '../utils/wallet.utils';

const AllowancePage: React.FC = () => {
  const { address, isConnected, isConnecting, error: walletError, connect, disconnect, clearError } = useWallet();

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Token Allowances</p>
          <h1>Manage Token Allowances</h1>
          <p className="lede">
            View and manage token allowances for your wallet. Grant permission to other addresses 
            to spend tokens on your behalf.
          </p>
        </div>
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {isConnected ? (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.875rem", color: "#fff", fontFamily: "monospace" }}>
                {address ? formatAddress(address) : ""}
              </span>
              <button 
                onClick={disconnect} 
                style={{ padding: "0.5rem 1rem" }}
                disabled={isConnecting}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connect} 
              disabled={isConnecting}
              style={{ padding: "0.5rem 1rem" }}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
          {walletError && (
            <div style={{ 
              padding: "0.5rem", 
              backgroundColor: "rgba(255, 0, 0, 0.1)", 
              border: "1px solid rgba(255, 0, 0, 0.3)",
              borderRadius: "4px",
              fontSize: "0.875rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span style={{ color: "#ff6b6b" }}>{walletError.message}</span>
              <button 
                onClick={clearError}
                style={{ 
                  padding: "0.25rem 0.5rem", 
                  fontSize: "0.75rem",
                  background: "transparent",
                  border: "none",
                  color: "#ff6b6b",
                  cursor: "pointer"
                }}
                title="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </header>

      {!isConnected && (
        <section className="panel">
          <h2>Connect Your Wallet</h2>
          <p className="muted">
            Please connect your wallet to manage token allowances. You need a connected wallet to 
            approve allowances and check existing permissions.
          </p>
        </section>
      )}
    </div>
  );
};

export default AllowancePage;