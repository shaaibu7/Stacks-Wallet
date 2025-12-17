# Interaction Scripts Configuration Guide

This guide explains how to configure and use the interaction scripts for testnet and mainnet environments.

## Overview

All interaction scripts now use a centralized configuration system (`scripts/config.ts`) that supports both **testnet** and **mainnet** networks. This eliminates the need to manually switch network configurations between deployments.

## Configuration

### Environment Variables

Create a `.env` file in the `contracts` directory based on `.env.ensample`:

```bash
cp .env.ensample .env
```

### Required Variables

#### Network Configuration

```env
# Your wallet private key (64 character hex string)
PRIVATE_KEY=your_64_char_hex_private_key

# Network: 'testnet' or 'mainnet'
STACKS_NETWORK=testnet
```

#### Contract Configuration

```env
# Main contract address and name (format: ADDRESS.CONTRACT_NAME)
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract

# Optional: Token contract (if different from main contract)
TOKEN_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract

# Optional: Wallet contract (for wallet-x interactions)
WALLET_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wallet-x
```

### Optional Variables

#### Token Interaction Defaults

```env
CONTRACT_NAME=token-contract
DEPLOYER_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

#### Wallet-X Interaction Defaults

```env
DEFAULT_WALLET_NAME=My Company Wallet
DEFAULT_INITIAL_FUNDING=1000000
DEFAULT_MEMBER_NAME=John Doe
DEFAULT_MEMBER_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
DEFAULT_MEMBER_FUNDING=100000
DEFAULT_MEMBER_ID=1
DEFAULT_REIMBURSE_AMOUNT=50000
DEFAULT_WITHDRAW_AMOUNT=25000
DEFAULT_RECEIVER_ADDRESS=ST000000000000000000002AMW42H
DEFAULT_TX_FEE=200000
ADMIN_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

#### Transaction Settings

```env
TOTAL_TRANSACTIONS=50
DELAY_BETWEEN_TX=3000
```

## Switching Between Networks

To switch between testnet and mainnet, simply change the `STACKS_NETWORK` variable:

```env
# For testnet
STACKS_NETWORK=testnet

# For mainnet
STACKS_NETWORK=mainnet
```

All scripts will automatically use the correct network configuration, including:
- Network endpoints
- Explorer URLs
- Transaction confirmation settings

## Available Scripts

### Token Contract Interactions

```bash
# Display token information
npm run interact info

# Check balance
npm run interact balance <address>

# Transfer tokens
npm run interact transfer <amount> <recipient> [memo]

# Mint tokens (owner only)
npm run interact mint <amount> <recipient>

# Update token URI (owner only)
npm run interact set-uri <uri>

# Show help
npm run interact help
```

### Simple Automated Interactions

```bash
# Run automated transaction sequence
npm run interact-simple
```

This script will:
1. Fetch token information
2. Check initial balance
3. Generate 50 transactions (configurable via `TOTAL_TRANSACTIONS`)
4. Display final results

### Multi-Token NFT Interactions

```bash
# Create a new token type
npm run interact-multi create-token <supply> <uri>

# Mint tokens
npm run interact-multi mint <recipient> <token-id> <amount>

# Transfer tokens
npm run interact-multi transfer <from> <to> <token-id> <amount> [memo]

# Set approval for all
npm run interact-multi approve <operator> <approved>

# Burn tokens
npm run interact-multi burn <from> <token-id> <amount>

# Check balance
npm run interact-multi balance <owner> <token-id>

# Get total supply
npm run interact-multi supply <token-id>

# Get token URI
npm run interact-multi uri <token-id>

# Check approval status
npm run interact-multi is-approved <owner> <operator>
```

### Wallet-X Interactions

```bash
# Admin Commands
npm run interact-wallet register-wallet [name] [amount]
npm run interact-wallet onboard-member [address] [name] [amount] [id]
npm run interact-wallet reimburse-wallet [amount]
npm run interact-wallet reimburse-member [member-id] [amount]
npm run interact-wallet remove-member [address]
npm run interact-wallet freeze-member [address]
npm run interact-wallet unfreeze-member [address]

# Member Commands
npm run interact-wallet withdraw [amount] [receiver]

# Query Commands
npm run interact-wallet wallet-info [admin-address]
npm run interact-wallet admin-role [address]
npm run interact-wallet members [admin-address]
npm run interact-wallet member-info [member-address]
npm run interact-wallet member-transactions [member-address]
npm run interact-wallet active-members [admin-address]
```

### Deployment

```bash
# Deploy contracts to configured network
npm run deploy
```

The deployment script will:
1. Deploy the SIP-010 trait
2. Wait for confirmation
3. Deploy the token contract
4. Display contract addresses and explorer links

## Configuration System Architecture

### Core Module: `scripts/config.ts`

The configuration system provides:

- **`loadNetworkConfig()`** - Load and validate network configuration
- **`loadContractConfig()`** - Load contract configuration with network settings
- **`loadTokenContractConfig()`** - Load token contract configuration (supports separate token contracts)
- **`parseContractRef()`** - Parse contract references in `ADDRESS.CONTRACT_NAME` format
- **`getExplorerTxUrl()`** - Generate explorer URLs for transactions
- **`getExplorerContractUrl()`** - Generate explorer URLs for contracts
- **`displayNetworkInfo()`** - Display network and contract information
- **`displayTokenContractInfo()`** - Display token contract information

### Usage in Scripts

All interaction scripts now follow this pattern:

```typescript
import { loadContractConfig, displayNetworkInfo, getExplorerTxUrl } from './config';

// Load configuration
const config = loadContractConfig('CONTRACT_ADDRESS', 'token-contract');

// Display network info
displayNetworkInfo(config);

// Use explorer URLs
console.log(getExplorerTxUrl(txid, config.networkEnv));
```

## Examples

### Example 1: Testnet Token Interaction

```env
PRIVATE_KEY=abc123...
STACKS_NETWORK=testnet
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract-1234567890
```

```bash
npm run interact info
# Output:
# 📍 Network: Testnet
# 📄 Contract: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract-1234567890
# 🔗 Explorer: https://testnet.explorer.hiro.so/address/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM?chain=testnet
```

### Example 2: Mainnet Deployment

```env
PRIVATE_KEY=abc123...
STACKS_NETWORK=mainnet
```

```bash
npm run deploy
# Output:
# 🚀 Deploying contracts to Mainnet...
# 📦 Using Clarity 3
# 
# 1️⃣ Deploying SIP-010 trait...
# ✅ Contract deployed successfully!
# 📋 Transaction ID: 0x...
# 🔗 Explorer: https://explorer.hiro.so/txid/0x...?chain=mainnet
```

### Example 3: Wallet-X with Custom Defaults

```env
PRIVATE_KEY=abc123...
STACKS_NETWORK=testnet
WALLET_CONTRACT=ST1ABC...XYZ.wallet-x-123456789
TOKEN_CONTRACT_ADDRESS=ST1ABC...XYZ.token-contract-123456789
DEFAULT_WALLET_NAME=Acme Corp Wallet
DEFAULT_INITIAL_FUNDING=5000000
```

```bash
npm run interact-wallet register-wallet
# Uses DEFAULT_WALLET_NAME and DEFAULT_INITIAL_FUNDING from .env
```

## Troubleshooting

### "CONTRACT_ADDRESS not found in .env file"

Make sure your `.env` file includes the `CONTRACT_ADDRESS` variable in the format `ADDRESS.CONTRACT_NAME`:

```env
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract
```

### "PRIVATE_KEY or DEPLOYER_KEY environment variable is required"

Ensure your `.env` file includes your private key:

```env
PRIVATE_KEY=your_64_char_hex_private_key
```

### Wrong network being used

Check that `STACKS_NETWORK` is set correctly:

```bash
# Check current value
grep STACKS_NETWORK .env

# Should be either 'testnet' or 'mainnet'
```

### Explorer links not working

Verify the network setting matches the explorer URL:
- Testnet: `https://testnet.explorer.hiro.so`
- Mainnet: `https://explorer.hiro.so`

## Migration from Old Configuration

If you were previously using hardcoded network configurations, update your scripts:

**Before:**
```typescript
const network = STACKS_TESTNET; // Hardcoded
```

**After:**
```typescript
import { loadNetworkConfig } from './config';
const config = loadNetworkConfig();
const network = config.network; // Dynamic based on STACKS_NETWORK env var
```

## Best Practices

1. **Never commit `.env` files** - Add `.env` to `.gitignore`
2. **Use `.env.ensample`** - Keep this file updated with all available options
3. **Validate before deployment** - Always run `npm run interact info` to verify configuration
4. **Use testnet first** - Test all interactions on testnet before mainnet
5. **Keep private keys secure** - Use environment variables, never hardcode keys
6. **Document custom contracts** - Update `.env.ensample` if you add new contract types

## Support

For issues or questions about the configuration system, refer to:
- `scripts/config.ts` - Configuration module documentation
- Individual script files - Script-specific usage examples
- `.env.ensample` - All available configuration options
