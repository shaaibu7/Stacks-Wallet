# Deployment Guide

## Prerequisites

- Node.js 18+
- npm 9+
- Private key with STX balance
- Clarinet (optional)

## Environment Setup

### 1. Create .env file

```bash
cd contracts
cp .env.ensample .env
```

### 2. Configure environment variables

```env
# Your wallet private key (64 character hex string)
PRIVATE_KEY=your_64_char_hex_private_key

# Network: 'testnet' or 'mainnet'
STACKS_NETWORK=testnet

# Your deployed contract address
CONTRACT_ADDRESS=ST1ABC...XYZ.token-contract

# Optional: Token contract (if different from main)
TOKEN_CONTRACT_ADDRESS=ST1ABC...XYZ.token-contract

# Optional: Wallet contract
WALLET_CONTRACT=ST1ABC...XYZ.wallet-x
```

## Deployment Steps

### Step 1: Install Dependencies

```bash
cd contracts
npm install
```

### Step 2: Verify Configuration

```bash
# Check that .env is properly configured
cat .env
```

### Step 3: Deploy Contracts

```bash
# Deploy to testnet
STACKS_NETWORK=testnet npm run deploy

# Or deploy to mainnet
STACKS_NETWORK=mainnet npm run deploy
```

### Step 4: Wait for Confirmation

- Testnet: ~10 minutes
- Mainnet: ~10-30 minutes

### Step 5: Update Configuration

After deployment, update CONTRACT_ADDRESS in .env with the deployed contract address.

## Deployment Verification

### Check Transaction Status

```bash
npm run check-account
```

### Verify Contract Deployment

```bash
npm run interact info
```

### Check Balance

```bash
npm run interact balance <your-address>
```

## Troubleshooting

### "PRIVATE_KEY not found"
- Ensure .env file exists in contracts/ directory
- Verify PRIVATE_KEY is set correctly

### "Insufficient balance"
- Get STX from faucet (testnet)
- Ensure account has enough STX for fees

### "Contract not found"
- Wait for transaction confirmation
- Verify CONTRACT_ADDRESS is correct
- Check explorer link

## Network Configuration

### Testnet
- Network: Stacks Testnet
- Explorer: https://testnet.explorer.hiro.so
- Faucet: https://testnet.stacks.org/faucet
- Fee: 150,000 microSTX

### Mainnet
- Network: Stacks Mainnet
- Explorer: https://explorer.hiro.so
- Fee: 300,000 microSTX

## Advanced Deployment

### Deploy with Custom Fee

```bash
# Edit deploy.ts to change fee
# Then run deployment
npm run deploy
```

### Deploy Multiple Contracts

```bash
# Deploy token contract
npm run deploy

# Deploy wallet contract
npm run deploy-wallet

# Deploy multi-token contract
npm run deploy-multi-token
```

## Post-Deployment

1. Share contract addresses on GitHub
2. Generate activity by calling contract functions
3. Monitor transaction costs
4. Update documentation with contract addresses
5. Set up monitoring and alerts

## Support

For deployment issues:
- Check .env configuration
- Verify private key format
- Ensure sufficient STX balance
- Check network connectivity
- Review error messages carefully
