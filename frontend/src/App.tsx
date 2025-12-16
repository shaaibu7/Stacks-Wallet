import { useMemo, useState } from "react";
import "./App.css";
import { cvToJSON, fetchCallReadOnlyFunction, standardPrincipalCV } from "@stacks/transactions";
import { STACKS_MAINNET, STACKS_TESTNET, createNetwork } from "@stacks/network";

type NetworkKey = "mainnet" | "testnet";

const DEFAULT_NETWORK: NetworkKey =
  (import.meta.env.VITE_STACKS_NETWORK as NetworkKey) === "mainnet" ? "mainnet" : "testnet";
const DEFAULT_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? "";
const DEFAULT_CONTRACT_NAME = import.meta.env.VITE_CONTRACT_NAME ?? "token-contract";

function buildNetwork(network: NetworkKey) {
  const overrideUrl = import.meta.env.VITE_STACKS_API_URL as string | undefined;
  const base = network === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET;
  return createNetwork({
    network: base,
    client: { baseUrl: overrideUrl ?? base.client.baseUrl },
  });
}

function extractOk(value: any) {
  if (value?.type === "response" && value.success) {
    return value.value;
  }
  if (value?.type === "response") {
    throw new Error(`Contract error: ${JSON.stringify(value.value)}`);
  }
  return value;
}

function formatUint(cv: any): bigint {
  if (cv?.type === "uint" && cv.value !== undefined) return BigInt(cv.value);
  throw new Error("Unexpected uint value");
}

function formatString(cv: any): string {
  if ((cv?.type === "string-ascii" || cv?.type === "string-utf8") && cv.value !== undefined) {
    return String(cv.value);
  }
  throw new Error("Unexpected string value");
}

function App() {
  const [network, setNetwork] = useState<NetworkKey>(DEFAULT_NETWORK);
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [contractName, setContractName] = useState(DEFAULT_CONTRACT_NAME);
  const [principal, setPrincipal] = useState("");

  const [tokenName, setTokenName] = useState<string | null>(null);
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stacksNetwork = useMemo(() => buildNetwork(network), [network]);
  const apiBaseUrl = stacksNetwork.client.baseUrl;

  const ensureContract = () => {
    if (!contractAddress || !contractName) {
      throw new Error("Contract address and name are required");
    }
  };

  const readTokenName = async () => {
    ensureContract();
    const clarityValue = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-name",
      functionArgs: [],
      senderAddress: contractAddress,
      network: stacksNetwork,
    });
    const json = cvToJSON(clarityValue) as any;
    const ok = extractOk(json);
    setTokenName(formatString(ok));
  };

  const readTotalSupply = async () => {
    ensureContract();
    const clarityValue = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-total-supply",
      functionArgs: [],
      senderAddress: contractAddress,
      network: stacksNetwork,
    });
    const json = cvToJSON(clarityValue) as any;
    const ok = extractOk(json);
    setTotalSupply(formatUint(ok));
  };

  const readBalance = async () => {
    ensureContract();
    if (!principal) throw new Error("Enter a principal to query its balance");
    const clarityValue = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-balance",
      functionArgs: [standardPrincipalCV(principal)],
      senderAddress: contractAddress,
      network: stacksNetwork,
    });
    const json = cvToJSON(clarityValue) as any;
    const ok = extractOk(json);
    setBalance(formatUint(ok));
  };

  const loadTokenInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([readTokenName(), readTotalSupply()]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to load token info");
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      await readBalance();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to load balance");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTokenName(null);
    setTotalSupply(null);
    setBalance(null);
    setError(null);
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Stacks Wallet UI</p>
          <h1>Interact with the SIP-010 token</h1>
          <p className="lede">
            Configure your deployed contract, pick a network, and query token metadata, supply,
            and balances. This UI uses read-only calls (no private keys required).
          </p>
        </div>
      </header>

      <section className="panel">
        <h2>Configuration</h2>
        <div className="grid two">
          <label className="field">
            <span>Network</span>
            <select value={network} onChange={(e) => setNetwork(e.target.value as NetworkKey)}>
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </label>
          <label className="field">
            <span>Contract address</span>
            <input
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="ST... contract deployer address"
            />
          </label>
          <label className="field">
            <span>Contract name</span>
            <input
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="token-contract"
            />
          </label>
          <label className="field">
            <span>Principal to check balance</span>
            <input
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="ST... or contract principal"
            />
          </label>
        </div>
        <div className="actions">
          <button onClick={loadTokenInfo} disabled={loading}>
            {loading ? "Loading..." : "Load token info"}
          </button>
          <button onClick={loadBalance} disabled={loading}>
            {loading ? "Loading..." : "Get balance"}
          </button>
          <button onClick={clearResults} disabled={loading}>
            Clear results
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </section>

      <section className="panel results">
        <h2>Results</h2>
        <div className="grid three">
          <div className="stat">
            <p className="label">Token name</p>
            <p className="value">{tokenName ?? "—"}</p>
          </div>
          <div className="stat">
            <p className="label">Total supply</p>
            <p className="value">{totalSupply !== null ? totalSupply.toString() : "—"}</p>
          </div>
          <div className="stat">
            <p className="label">Balance</p>
            <p className="value">{balance !== null ? balance.toString() : "—"}</p>
          </div>
          <div className="stat">
            <p className="label">Network / API</p>
            <p className="value small">
              {network} · {apiBaseUrl}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
