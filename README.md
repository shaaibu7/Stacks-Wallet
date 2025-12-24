## Stacks Wallet – SIP-010 Fungible Token Contracts

This repository contains a minimal Stacks smart-contract project that implements a SIP‑010–compatible fungible token (“Clarity Coin”) plus a simple TypeScript test + deployment toolchain.

The contracts are written in Clarity and managed with Clarinet; tests and deployment utilities are written in TypeScript and use `vitest` and the `@stacks/*` libraries.

---

## Project structure

- **`contracts/Clarinet.toml`**: Clarinet project config for the smart contracts.
- **`contracts/contracts/sip-010-trait.clar`**: Local copy of the SIP‑010 fungible token trait.
- **`contracts/contracts/token-contract.clar`**: Implementation of the SIP‑010 token:
  - Defines the `clarity-coin` fungible token.
  - Owner-only `mint` and `set-token-uri` functions.
  - Read-only helpers like `get-balance`, `get-total-supply`, `get-name`, `get-symbol`, `get-decimals`, and `get-token-uri`.
- **`contracts/tests/token-contract.test.ts`**: Example `vitest` test using the Clarinet JS environment.
- **`contracts/scripts/deploy.ts`**: Node/TypeScript script to deploy the trait and token contracts to Testnet or Mainnet.
- **`contracts/package.json`**: NPM scripts and dependencies for testing and deployment.

---

## Prerequisites

- **Node.js**: v18+ recommended.
- **npm**: v9+ recommended.
- **Clarinet** (optional but recommended for local simulation):
  - Install via the official docs: `https://docs.hiro.so/clarinet`.
- A **Stacks private key** (for the deployer wallet) with enough STX balance on the chosen network.

---

## Installation

From the project root:

```bash
cd contracts
npm install
```

This installs testing and deployment dependencies (`vitest`, `vitest-environment-clarinet`, `@stacks/transactions`, `@stacks/clarinet-sdk`, etc.).

---

## Environment configuration

Deployment is driven by environment variables read from a `.env` file in the `contracts/` directory.

Create `contracts/.env`:

```bash
cd contracts
cat > .env << 'EOF'
# Private key of the deployer (Mainnet or Testnet)
PRIVATE_KEY=replace-with-your-private-key

# or, alternatively:
# DEPLOYER_KEY=replace-with-your-private-key

# Target network: "mainnet" or "testnet"
STACKS_NETWORK=testnet
EOF
```

Notes:

- **`PRIVATE_KEY`** or **`DEPLOYER_KEY`** must be set; if both are provided, `PRIVATE_KEY` takes precedence.
- **`STACKS_NETWORK`** defaults to `mainnet` if not set.

Never commit real private keys to version control.

---

## Running tests

All test commands are run from the `contracts/` directory.

- **Single test run (no watch):**

```bash
cd contracts
npm test
```

- **With coverage and costs (as configured in `package.json`):**

```bash
cd contracts
npm run test:report
```

- **Watch mode (re-runs when `.clar` or test files change):**

```bash
cd contracts
npm run test:watch
```

The sample test in `token-contract.test.ts` demonstrates how to access the Clarinet `simnet` environment and accounts. Extend this file with additional tests for your contract behavior (minting, transfers, etc.).

---

## Deploying contracts

The deployment flow is scripted in `contracts/scripts/deploy.ts` and is exposed via an NPM script.

From the `contracts/` directory:

```bash
cd contracts
npm run deploy
```

What this does:

- Loads environment variables from `.env`.
- Determines the target network based on `STACKS_NETWORK` (`mainnet` or `testnet`).
- Deploys, in order:
  1. **`sip-010-trait.clar`** as the trait contract.
  2. **`token-contract.clar`** as the fungible token implementation, with a **unique name per deployment**:
     - Contract name format: `token-contract-<timestamp>`.
- Logs:
  - The network being targeted.
  - The transaction IDs for each deployment.
  - Explorer links (via `https://explorer.hiro.so`) for quick verification.

If deployment fails (e.g., missing env vars, insufficient balance, invalid key), the script prints an error and exits with a non‑zero code.

---

## Contract overview

The main token contract (`token-contract.clar`) implements:

- **Token definition**
  - `define-fungible-token clarity-coin`
  - Name: **"Clarity Coin"**
  - Symbol: **"CC"**
  - Decimals: **6** (i.e., 1 token = 1_000_000 base units)

- **Read-only SIP‑010 interfaces**
  - `get-balance (who principal)` → current balance of `who`.
  - `get-total-supply ()` → total supply of `clarity-coin`.
  - `get-name ()`, `get-symbol ()`, `get-decimals ()` → token metadata.
  - `get-token-uri ()` → optional metadata URI.

- **Admin / owner-only operations**
  - `set-token-uri (value (string-utf8 256))`
    - Only callable by the contract owner.
    - Updates the `token-uri` data-var.
    - Emits a metadata update notification (SIP‑019 style).
  - `mint (amount uint) (recipient principal)`
    - Only callable by the contract owner.
    - Mints new tokens to `recipient`.

- **Transfers**
  - `transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))`
    - Enforces that `sender` matches `tx-sender` or `contract-caller`.
    - Calls `ft-transfer?` internally.
    - Optionally logs the `memo` buffer.

---

## Local development tips

- **Clarinet console** (if Clarinet is installed):
  - From `contracts/`, you can open a REPL and interact with contracts:

    ```bash
    clarinet console
    ```

  - Use it to call contract functions, inspect state, and prototype interactions.

- **Extending tests**:
  - Use `simnet.callPublicFn`, `simnet.callReadOnlyFn`, and `simnet.mineBlock` (see Clarinet JS docs) to simulate transactions and blocks.
  - Add assertions around balances, minting limits, and access control.

---

## Scripts reference

All scripts live in `contracts/package.json`:

- **`npm test`**: Run unit tests once using `vitest`.
- **`npm run test:report`**: Run tests with coverage and cost reporting.
- **`npm run test:watch`**: Watch `.clar` and test files, re-running `test:report` on changes.
- **`npm run deploy`**: Deploy SIP‑010 trait and token contracts to the configured Stacks network.

---

## Frontend (React + Vite)

A lightweight UI is available under `frontend/` to query your deployed SIP‑010 token (read-only: name, total supply, balances).

Setup and run:

```bash
cd frontend
npm install          # already done once after scaffolding
npm run dev          # start Vite dev server
```

Configure via environment variables (copy `frontend/env.example` to `frontend/.env`):

- `VITE_STACKS_NETWORK` – `testnet` (default) or `mainnet`
- `VITE_STACKS_API_URL` – optional Hiro API URL override (defaults to testnet/mainnet)
- `VITE_CONTRACT_ADDRESS` – your deployed contract address (e.g., deployer STx…)
- `VITE_CONTRACT_NAME` – deployed contract name (e.g., `token-contract` or timestamped variant)

The UI lets you:
- Load token metadata (`get-name`) and total supply (`get-total-supply`).
- Query balances (`get-balance`) for a provided principal.

No private keys are required; calls are read-only.

---

## License

This project is licensed under the terms specified in `LICENSE`.
