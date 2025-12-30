/**
 * Hook for querying token information (read-only)
 */

import { useState, useCallback } from "react";
import { cvToJSON, fetchCallReadOnlyFunction, standardPrincipalCV } from "@stacks/transactions";
import type { NetworkKey } from "../types/wallet";
import { extractOk, formatUint, formatString } from "../utils/clarity.utils";

export interface UseTokenInfoReturn {
  tokenName: string | null;
  totalSupply: bigint | null;
  balance: bigint | null;
  loading: boolean;
  error: string | null;
  loadTokenInfo: () => Promise<void>;
  loadBalance: (principal: string) => Promise<void>;
  clearResults: () => void;
}

export function useTokenInfo(
  contractAddress: string,
  contractName: string,
  network: NetworkKey,
  stacksNetwork: ReturnType<typeof import("@stacks/network").createNetwork>
): UseTokenInfoReturn {
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureContract = useCallback(() => {
    if (!contractAddress || !contractName) {
      throw new Error("Contract address and name are required");
    }
  }, [contractAddress, contractName]);

