# WalletX Simulation Guide

This guide explains how to run the comprehensive simulation that tests 30 transactions for each specified command.

## 🚀 Quick Start

### Run Full Simulation (All Commands)
```bash
npm run wallet-simulate
```

This will run 30 transactions for each of these commands:
1. **register-wallet** - 30 wallet registrations
2. **wallet-info** - 30 wallet info queries  
3. **onboard-member** - 30 member onboarding transactions
4. **member-info** - 30 member info queries

**Total: 120 operations**

### Run Individual Command Simulations
```bash
# Test only register-wallet (30 transactions)
npm run wallet-simulate register-wallet

# Test only wallet-info (30 queries)
npm run wallet-simulate wallet-info

# Test only onboard-member (30 transactions)
npm run wallet-simulate onboard-member

# Test only member-info (30 queries)
npm run wallet-simulate member-info
```

## 📊 What the Simulation Does

### 1. Register Wallet (30 transactions)
- Creates 30 unique wallets with names like "My Company Wallet #1", "My Company Wallet #2", etc.
- Each uses the default funding amount from your .env file
- Tests the `register-wallet` contract function

### 2. Wallet Info (30 queries)
- Queries wallet information 30 times for your admin address
- Tests the `get-wallet-admin` read-only function
- Shows wallet balance, name, status, etc.

### 3. Onboard Member (30 transactions)
- Onboards 30 members with names like "John Doe #1", "John Doe #2", etc.
- Each gets a unique member ID (1, 2, 3, ...)
- Uses default member address and funding from .env
- Tests the `onboard-member` contract function

### 4. Member Info (30 queries)
- Queries member information 30 times for the default member address
- Tests the `get-member` read-only function
- Shows member spend limit, status, organization, etc.

## ⚙️ Configuration

The simulation uses your `.env` file configuration:

```bash
# Your contracts (automatically used)
WALLET_CONTRACT=ST8DAC2FHJFX599JR491PEAEM0CAXP95JXZ00MBD.wallet-x-1765958506578
CONTRACT_ADDRESS=ST8DAC2FHJFX599JR491PEAEM0CAXP95JXZ00MBD.token-contract-1765800894281

# Default values (used in simulation)
DEFAULT_WALLET_NAME=My Company Wallet
DEFAULT_INITIAL_FUNDING=1000000
DEFAULT_MEMBER_NAME=John Doe
DEFAULT_MEMBER_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
DEFAULT_MEMBER_FUNDING=100000
ADMIN_ADDRESS=ST8DAC2FHJFX599JR491PEAEM0CAXP95JXZ00MBD
```

## 📈 Expected Output

### Transaction Operations
For each transaction, you'll see:
```
📦 Transaction 1/30: Registering "My Company Wallet #1" with 1000000 tokens
⏳ Creating transaction for register-wallet (Tx 1)...
📤 Broadcasting to network...
✅ Transaction broadcast successfully! (Tx 1)
📋 Transaction ID: 0x1234567890abcdef...
🔗 Explorer: https://explorer.hiro.so/txid/0x1234567890abcdef...?chain=testnet
⏳ Waiting 3s before next transaction...
```

### Query Operations
For each query, you'll see:
```
📦 Query 1/30: Fetching wallet info for ST8DAC2FHJFX599JR491PEAEM0CAXP95JXZ00MBD
✅ Query 1 successful - Wallet found:
   Name: My Company Wallet
   Balance: 1000000
   Active: true
⏳ Waiting 3s before next query...
```

### Final Results
At the end of each command simulation:
```
📊 Register Wallet Results:
✅ Successful: 28/30
❌ Failed: 2/30
📈 Success Rate: 93.3%
```

## ⏱️ Timing

- **3 seconds** between individual transactions/queries
- **10 seconds** between different command phases
- **Total estimated time**: ~25-30 minutes for full simulation

## 🔍 Monitoring

### Transaction Explorer
Each transaction provides an explorer link:
```
🔗 Explorer: https://explorer.hiro.so/txid/0x1234...?chain=testnet
```

### Real-time Status
The simulation shows:
- Current transaction/query number
- Success/failure status
- Transaction IDs
- Error messages (if any)
- Progress through each phase

## 🛠️ Troubleshooting

### Common Issues

1. **"Wallet already exists" errors**
   - Expected for register-wallet after the first successful registration
   - The simulation continues with other transactions

2. **Network timeouts**
   - Testnet can be slow
   - The simulation includes delays to prevent rate limiting

3. **Insufficient funds**
   - May occur if wallet balance is depleted
   - Check wallet balance before running large simulations

### Adjusting Configuration

You can modify the simulation by editing `contracts/scripts/wallet-x-simulation.ts`:

```typescript
// Change number of transactions per command
transactionsPerCommand: 30,  // Change this number

// Adjust delays
delayBetweenTx: 3000,        // 3 seconds between transactions
delayBetweenCommands: 10000, // 10 seconds between commands
```

## 📋 Summary

This simulation provides comprehensive testing of:
- ✅ Contract deployment verification
- ✅ Transaction broadcasting
- ✅ Read-only function calls
- ✅ Error handling
- ✅ Network performance
- ✅ Gas fee estimation
- ✅ Success rate analysis

Perfect for testing your WalletX contract under load and verifying all functions work correctly with your deployed contracts!