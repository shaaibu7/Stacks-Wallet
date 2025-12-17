# Quick Start: Testnet/Mainnet Configuration

## 1. Setup Environment

```bash
# Copy the environment template
cp .env.ensample .env

# Edit .env with your values
nano .env  # or your preferred editor
```

## 2. Configure .env

```env
# Your private key (64 hex characters)
PRIVATE_KEY=your_private_key_here

# Network: testnet or mainnet
STACKS_NETWORK=testnet

# Your deployed contract (format: ADDRESS.CONTRACT_NAME)
CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract-1234567890
```

## 3. Verify Configuration

```bash
# Check token info (verifies config is correct)
npm run interact info
```

Expected output:
```
📍 Network: Testnet
📄 Contract: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-contract-1234567890
🔗 Explorer: https://testnet.explorer.hiro.so/address/...
```

## 4. Run Interactions

```bash
# Get token balance
npm run interact balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Transfer tokens
npm run interact transfer 1000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Mint tokens (owner only)
npm run interact mint 5000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Run automated interactions
npm run interact-simple
```

## 5. Switch to Mainnet

Simply change one line in `.env`:

```env
STACKS_NETWORK=mainnet
```

All scripts will automatically use mainnet endpoints and explorer URLs.

## 6. Deploy Contracts

```bash
npm run deploy
```

The deployment script will:
1. Deploy SIP-010 trait
2. Wait for confirmation
3. Deploy token contract
4. Show contract addresses and explorer links

## Common Commands

```bash
# Token interactions
npm run interact help                    # Show all commands
npm run interact info                    # Display token info
npm run interact balance <address>       # Check balance
npm run interact transfer <amt> <addr>   # Transfer tokens
npm run interact mint <amt> <addr>       # Mint tokens
npm run interact set-uri <uri>           # Update token URI

# Wallet-X interactions
npm run interact-wallet wallet-info      # Check wallet info
npm run interact-wallet members          # List members
npm run interact-wallet member-info      # Check member info

# Multi-token NFT
npm run interact-multi balance <owner> <token-id>
npm run interact-multi transfer <from> <to> <id> <amt>

# Deployment
npm run deploy                           # Deploy contracts
```

## Troubleshooting

**"CONTRACT_ADDRESS not found"**
- Make sure `.env` has `CONTRACT_ADDRESS=ADDRESS.CONTRACT_NAME`

**"PRIVATE_KEY not found"**
- Make sure `.env` has `PRIVATE_KEY=your_64_char_hex_key`

**Wrong network being used**
- Check `STACKS_NETWORK` is set to `testnet` or `mainnet`

**Explorer links not working**
- Verify network setting matches explorer:
  - Testnet: `https://testnet.explorer.hiro.so`
  - Mainnet: `https://explorer.hiro.so`

## Full Documentation

See `INTERACTION-SCRIPTS-CONFIG.md` for complete configuration guide.
