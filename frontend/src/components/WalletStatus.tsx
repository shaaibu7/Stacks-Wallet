/**
 * Wallet Status Display Component
 * Shows current wallet connection status with visual indicators
 */

import { useWallet } from "./WalletConnect";
import { formatAddress } from "../utils/wallet.utils";

interface WalletStatusProps {
  showAddress?: boolean;
  showNetwork?: boolean;
  className?: string;
}

export function WalletStatus({
  showAddress = true,
  showNetwork = false,
  className = "",
}: WalletStatusProps) {
  const { address, isConnected, isConnecting, error } = useWallet();

  if (isConnecting) {
    return (
      <div className={`wallet-status connecting ${className}`}>
        <span className="status-indicator">🔄</span>
        <span>Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`wallet-status error ${className}`}>
        <span className="status-indicator">⚠️</span>
        <span>{error.message}</span>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className={`wallet-status connected ${className}`}>
        <span className="status-indicator">✅</span>
        {showAddress && <span className="address">{formatAddress(address)}</span>}
        {showNetwork && <span className="network">Stacks</span>}
      </div>
    );
  }

  return (
    <div className={`wallet-status disconnected ${className}`}>
      <span className="status-indicator">⚪</span>
      <span>Not Connected</span>
    </div>
  );
}

