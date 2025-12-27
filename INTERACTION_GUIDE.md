# Interaction Guide

## Overview

This guide explains how to interact with deployed contracts using CLI scripts.

## Token Contract Interactions

### Get Token Information

```bash
npm run interact info
```

Output:
```
📊 Fetching token information...
🪙 Token Information:
   Name: Clarity Coin
   Symbol: CC
   Decimals: 6
   Total Supply: 1000000000
   Token URI: https://hiro.so
```

### Check Balance

```bash
npm run interact balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

Output:
```
💰 Fetching balance for ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM...
Balance: 1000000 tokens
```

### Transfer Tokens

```bash
# Basic transfer
npm run interact transfer 1000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Transfer with memo
npm run interact transfer 1000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM "Payment for services"
```

### Mint Tokens (Owner Only)

```bash
npm run interact mint 5000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

### Update Token URI (Owner Only)

```bash
npm run interact set-uri "https://example.com/token-metadata.json"
```

## Wallet-X Interactions

### Register Wallet (Admin)

```bash
npm run interact-wallet register-wallet "My Company Wallet" 1000000
```

### Onboard Member (Admin)

```bash
npm run interact-wallet onboard-member \
  ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM \
  "John Doe" \
  100000 \
  1
```

### Member Withdrawal

```bash
npm run interact-wallet withdraw 50000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

### Freeze Member (Admin)

```bash
npm run interact-wallet freeze-member ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

### Unfreeze Member (Admin)

```bash
npm run interact-wallet unfreeze-member ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

### Remove Member (Admin)

```bash
npm run interact-wallet remove-member ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

### Get Wallet Info

```bash
npm run interact-wallet wallet-info ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

### Get Members List

```bash
npm run interact-wallet members ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

### Get Member Info

```bash
npm run interact-wallet member-info ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

## Multi-Token NFT Interactions

### Create Token

```bash
npm run interact-multi create-token \
  1000000 \
  "https://example.com/token-1.json" \
  "My Token" \
  "Token Description" \
  500
```

### Mint Tokens

```bash
npm run interact-multi mint \
  ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM \
  1 \
  100000
```

### Transfer Tokens

```bash
npm run interact-multi transfer \
  ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM \
  ST1ABC...XYZ \
  1 \
  50000
```

### Check Balance

```bash
npm run interact-multi balance \
  ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM \
  1
```

### Get Total Supply

```bash
npm run interact-multi supply 1
```

### Burn Tokens

```bash
npm run interact-multi burn \
  ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM \
  1 \
  10000
```

## Common Workflows

### Workflow 1: Create and Distribute Tokens

```bash
# 1. Get token info
npm run interact info

# 2. Mint tokens
npm run interact mint 1000000 ST1ABC...XYZ

# 3. Check balance
npm run interact balance ST1ABC...XYZ

# 4. Transfer tokens
npm run interact transfer 100000 ST1DEF...UVW
```

### Workflow 2: Setup Wallet with Members

```bash
# 1. Register wallet
npm run interact-wallet register-wallet "Company Wallet" 5000000

# 2. Onboard member 1
npm run interact-wallet onboard-member ST1ABC...XYZ "Alice" 500000 1

# 3. Onboard member 2
npm run interact-wallet onboard-member ST1DEF...UVW "Bob" 500000 2

# 4. Check members
npm run interact-wallet members ST1ADMIN...XYZ

# 5. Member withdrawal
npm run interact-wallet withdraw 100000 ST1RECEIVER...XYZ
```

### Workflow 3: Create Multi-Token Collection

```bash
# 1. Create token 1
npm run interact-multi create-token 1000000 "https://example.com/token-1.json" "Token 1" "First token" 500

# 2. Create token 2
npm run interact-multi create-token 500000 "https://example.com/token-2.json" "Token 2" "Second token" 1000

# 3. Mint tokens
npm run interact-multi mint ST1ABC...XYZ 1 100000
npm run interact-multi mint ST1ABC...XYZ 2 50000

# 4. Check balances
npm run interact-multi balance ST1ABC...XYZ 1
npm run interact-multi balance ST1ABC...XYZ 2

# 5. Transfer tokens
npm run interact-multi transfer ST1ABC...XYZ ST1DEF...UVW 1 50000
```

## Important Notes

### Token Amounts

Amounts are specified in the smallest unit based on decimals:
- Token decimals: 6
- 1 token = 1,000,000 base units
- Example: 1000000 = 1 token

### Transaction Fees

- Testnet: 150,000 microSTX (~0.15 STX)
- Mainnet: 300,000 microSTX (~0.30 STX)

### Owner-Only Functions

- `mint` - Only contract owner
- `set-uri` - Only contract owner
- `set-contract-paused` - Only contract owner

### Admin-Only Functions (Wallet-X)

- `register-wallet` - Only admin
- `onboard-member` - Only admin
- `freeze-member` - Only admin
- `remove-member` - Only admin

## Troubleshooting

### "Contract not found"
- Verify CONTRACT_ADDRESS in .env
- Check contract is deployed
- Verify network setting

### "Insufficient balance"
- Check account balance
- Ensure enough STX for fees
- Get STX from faucet (testnet)

### "Unauthorized"
- Verify you're the owner/admin
- Check caller address
- Verify permissions

### "Transaction failed"
- Check error message
- Verify input parameters
- Check contract state

## Support

For interaction issues:
- Check .env configuration
- Review error messages
- Check contract state
- Verify transaction on explorer
