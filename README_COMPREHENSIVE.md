# Stacks Wallet - Comprehensive Blockchain Wallet System

> A production-ready multi-contract blockchain wallet system built on Stacks (Bitcoin Layer 2) with advanced token management, multi-signature wallet capabilities, and NFT support.

## 🎯 Project Overview

**Stacks-Wallet** is a complete blockchain wallet solution featuring:

- **SIP-010 Fungible Token** - Full-featured token with allowances, burning, and metadata
- **Multi-Signature Wallet** - Admin/member role-based wallet with spend limits
- **Multi-Token NFT System** - ERC1155-like contract supporting batch operations
- **TypeScript Deployment Layer** - Easy contract deployment and interaction
- **React Frontend** - Modern UI for wallet management
- **Comprehensive Test Suite** - 100+ test cases with full coverage

### Key Statistics
- **3 Smart Contracts** in Clarity 4
- **100+ Test Cases** with Vitest
- **5 Deployment Scripts** for different scenarios
- **Full TypeScript Support** for type safety
- **React 19 Frontend** with Tailwind CSS

---

## 🏗️ Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        STACKS BLOCKCHAIN                         │
│                      (Bitcoin Layer 2)                           │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────┐ ┌──────▼──────┐ ┌───▼──────────┐
        │   Token    │ │  Wallet-X   │ │ Multi-Token  │
        │ Contract   │ │  Contract   │ │ NFT Contract │
        │ (SIP-010)  │ │ (Multi-Sig) │ │ (ERC1155)    │
        └────────────┘ └─────────────┘ └──────────────┘
                              ▲
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼─────┐         ┌─────▼──────┐      ┌──────▼────┐
   │ TypeScript│         │  Vitest    │      │  Clarinet  │
   │ Scripts   │         │  Tests     │      │  SDK       │
   │ (Deploy & │         │ (100+)     │      │ (Simnet)   │
   │ Interact) │         │            │      │            │
   └────┬─────┘         └─────┬──────┘      └──────┬────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼────────┐
                    │  React Frontend  │
                    │  (Vite + React19)│
                    │  (Tailwind CSS)  │
                    └──────────────────┘
```

### Contract Interaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│  (CLI Scripts / React Frontend / Direct Calls)              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              TYPESCRIPT LAYER (scripts/)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   deploy.ts │  │ interact.ts  │  │ config.ts    │        │
│  └─────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│         STACKS TRANSACTIONS (@stacks/transactions)           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Create Transaction → Sign → Broadcast → Confirm       │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│           STACKS BLOCKCHAIN (Testnet/Mainnet)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Token        │  │ Wallet-X     │  │ Multi-Token  │      │
│  │ Contract     │  │ Contract     │  │ NFT Contract │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    EVENTS & LOGS                             │
│  (Printed via Clarity print statements)                      │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  .env (PRIVATE_KEY, STACKS_NETWORK)                        │
│    │                                                        │
│    ▼                                                        │
│  deploy.ts                                                 │
│    │                                                        │
│    ├─► Read contract source (.clar)                        │
│    │                                                        │
│    ├─► Create deployment transaction                       │
│    │                                                        │
│    ├─► Sign with private key                               │
│    │                                                        │
│    ├─► Broadcast to Stacks network                         │
│    │                                                        │
│    └─► Return txid + explorer link                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  INTERACTION FLOW                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Input (CLI / Frontend)                               │
│    │                                                        │
│    ▼                                                        │
│  TypeScript Script (interact.ts)                           │
│    │                                                        │
│    ├─► Load contract config                                │
│    │                                                        │
│    ├─► Create contract call transaction                    │
│    │                                                        │
│    ├─► Sign with private key                               │
│    │                                                        │
│    ├─► Broadcast to network                                │
│    │                                                        │
│    └─► Return result + explorer link                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   TESTING FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Test File (.test.ts)                                      │
│    │                                                        │
│    ▼                                                        │
│  Vitest + Clarinet Environment                             │
│    │                                                        │
│    ├─► Initialize simnet                                   │
│    │                                                        │
│    ├─► Execute test cases                                  │
│    │                                                        │
│    ├─► Call contract functions                             │
│    │                                                        │
│    ├─► Assert results                                      │
│    │                                                        │
│    └─► Generate coverage report                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
stacks-wallet/
│
├── contracts/                          # Smart contracts & deployment
│   ├── contracts/
│   │   ├── sip-010-trait.clar         # SIP-010 standard trait
│   │   ├── token-contract.clar        # Fungible token implementation
│   │   ├── wallet-x.clar              # Multi-sig wallet system
│   │   └── multi-token-nft.clar       # ERC1155-like multi-token
│   │
│   ├── scripts/
│   │   ├── deploy.ts                  # Contract deployment
│   │   ├── interact.ts                # Token interactions
│   │   ├── interact-wallet-x.ts       # Wallet interactions
│   │   ├── interact-multi-token.ts    # Multi-token interactions
│   │   └── config.ts                  # Configuration management
│   │
│   ├── tests/
│   │   ├── helpers.ts                 # Test utilities
│   │   ├── token-contract.test.ts     # Token tests (40+ cases)
│   │   ├── wallet-x.test.ts           # Wallet tests (35+ cases)
│   │   └── multi-token-nft.test.ts    # NFT tests (40+ cases)
│   │
│   ├── Clarinet.toml                  # Project configuration
│   ├── vitest.config.ts               # Test configuration
│   ├── tsconfig.json                  # TypeScript config
│   └── package.json                   # Dependencies
│
├── frontend/                           # React UI
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── hooks/                     # Custom hooks
│   │   ├── pages/                     # Page components
│   │   ├── services/                  # API services
│   │   ├── config/                    # Configuration
│   │   └── App.tsx                    # Main app
│   │
│   ├── public/                        # Static assets
│   ├── vite.config.ts                 # Vite configuration
│   ├── tsconfig.json                  # TypeScript config
│   └── package.json                   # Dependencies
│
├── CODEBASE_STUDY.md                  # Detailed codebase analysis
├── README_COMPREHENSIVE.md            # This file
└── README.md                          # Quick start guide
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Clarinet (optional, for local simulation)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/stacks-wallet.git
cd stacks-wallet

# Install dependencies
cd contracts
npm install

cd ../frontend
npm install
```

### Environment Setup

```bash
# Create .env file in contracts/
cd contracts
cp .env.ensample .env

# Edit .env with your values
PRIVATE_KEY=your_64_char_hex_private_key
STACKS_NETWORK=testnet
CONTRACT_ADDRESS=ST1ABC...XYZ.token-contract
```

### Running Tests

```bash
cd contracts

# Run all tests
npm test

# Run with coverage
npm run test:report

# Watch mode
npm run test:watch
```

### Deployment

```bash
cd contracts

# Deploy to testnet
STACKS_NETWORK=testnet npm run deploy

# Deploy to mainnet
STACKS_NETWORK=mainnet npm run deploy
```

### Interaction

```bash
cd contracts

# Get token info
npm run interact info

# Check balance
npm run interact balance ST1ABC...XYZ

# Transfer tokens
npm run interact transfer 1000000 ST1ABC...XYZ

# Mint tokens (owner only)
npm run interact mint 5000000 ST1ABC...XYZ

# Wallet operations
npm run interact-wallet register-wallet "My Wallet" 1000000
npm run interact-wallet onboard-member ST1ABC...XYZ "John Doe" 100000 1
```

### Frontend Development

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📋 Smart Contracts

### 1. Token Contract (SIP-010)

**Features:**
- ✅ Minting (owner only)
- ✅ Transfers with memo
- ✅ Allowance system
- ✅ Burning
- ✅ Pause mechanism
- ✅ Event logging

**Token Details:**
- Name: Clarity Coin
- Symbol: CC
- Decimals: 6
- Max Supply: Unlimited

**Key Functions:**
```clarity
(mint (amount uint) (recipient principal)) -> response(bool, uint)
(transfer (amount uint) (sender principal) (recipient principal) (memo optional)) -> response(bool, uint)
(approve (spender principal) (amount uint)) -> response(bool, uint)
(transfer-from (owner principal) (recipient principal) (amount uint) (memo optional)) -> response(bool, uint)
(burn (amount uint)) -> response(bool, uint)
```

### 2. Wallet-X Contract (Multi-Sig)

**Features:**
- ✅ Wallet registration
- ✅ Member onboarding
- ✅ Spend limits
- ✅ Freeze/unfreeze
- ✅ Transaction history
- ✅ Fund recovery

**Key Functions:**
```clarity
(register-wallet (wallet-name string-utf8-256) (fund-amount uint) (token <sip-010-trait>)) -> response(uint, uint)
(onboard-member (member-address principal) (member-name string-utf8-256) (fund-amount uint) (member-identifier uint)) -> response(bool, uint)
(member-withdrawal (amount uint) (receiver principal) (token <sip-010-trait>)) -> response(bool, uint)
(freeze-member (member-address principal)) -> response(bool, uint)
(remove-member (member-address principal)) -> response(uint, uint)
```

### 3. Multi-Token NFT Contract (ERC1155)

**Features:**
- ✅ Token creation with metadata
- ✅ Royalty support
- ✅ Batch transfers
- ✅ Operator approvals
- ✅ Burning
- ✅ Emergency recovery

**Key Functions:**
```clarity
(create-token-with-royalty (initial-supply uint) (uri string-utf8-256) (name string-utf8-64) (description string-utf8-512) (royalty-percentage uint)) -> response(uint, uint)
(mint (to principal) (token-id uint) (amount uint)) -> response(bool, uint)
(safe-transfer-from (from principal) (to principal) (token-id uint) (amount uint) (memo optional)) -> response(bool, uint)
(safe-batch-transfer-from (from principal) (to principal) (token-ids list) (amounts list) (memo optional)) -> response(bool, uint)
(burn (from principal) (token-id uint) (amount uint)) -> response(bool, uint)
```

---

## 🧪 Testing

### Test Coverage

- **Token Contract**: 40+ test cases
  - Metadata queries
  - Minting operations
  - Transfer operations
  - Balance queries
  - Allowance system
  - Error conditions

- **Wallet-X Contract**: 35+ test cases
  - Wallet registration
  - Member management
  - Withdrawal operations
  - Freeze/unfreeze
  - Authorization checks
  - Read-only functions

- **Multi-Token NFT**: 40+ test cases
  - Token creation
  - Minting
  - Single transfers
  - Batch transfers
  - Approvals
  - Burning
  - Emergency recovery

### Running Tests

```bash
# All tests
npm test

# With coverage report
npm run test:report

# Watch mode
npm run test:watch

# Specific test file
npm test token-contract.test.ts
```

---

## 🔐 Security Features

### Authorization
- Owner-only functions
- Role-based access control (admin/member)
- Caller verification

### Input Validation
- Amount validation (> 0)
- Principal validation
- String length limits
- Royalty percentage bounds (0-10000 basis points)

### Overflow/Underflow Protection
- Allowance overflow checks
- Supply limit validation
- Balance validation before transfers

### Pause Mechanism
- Contract pause/unpause
- All state-changing functions check pause status
- Emergency recovery functions

### Error Handling
- Consistent error codes (100-149 ranges)
- Descriptive error messages
- Validation before state changes

---

## 📊 Performance Characteristics

### Gas Efficiency
- Batch operations reduce transaction count
- Optimized map lookups
- Minimal state changes

### Storage
- Maps for flexible storage
- Lists with size limits (100-1000 items)
- Efficient key structures

### Scalability
- Supports unlimited tokens (multi-token)
- Supports unlimited members (wallet-x)
- Batch operations for efficiency

---

## 🌐 Network Support

### Testnet
- Network: Stacks Testnet
- Explorer: https://testnet.explorer.hiro.so
- Faucet: https://testnet.stacks.org/faucet

### Mainnet
- Network: Stacks Mainnet
- Explorer: https://explorer.hiro.so
- Production ready

---

## 📚 Documentation

- **CODEBASE_STUDY.md** - Detailed codebase analysis
- **README_COMPREHENSIVE.md** - This file
- **contracts/README-INTERACTION.md** - Interaction guide
- **contracts/QUICK_START.md** - Quick start guide

---

## 🛠️ Development

### Adding New Features

1. **Create contract function** in `.clar` file
2. **Add tests** in corresponding `.test.ts` file
3. **Update interaction script** if needed
4. **Update documentation**
5. **Run tests** to verify

### Code Style

- **Clarity**: Follow SIP-010 standards
- **TypeScript**: Use strict mode
- **Tests**: Use descriptive names
- **Comments**: Document complex logic

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the ISC License - see LICENSE file for details.

---

## 🔗 Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language](https://docs.stacks.co/clarity)
- [SIP-010 Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Stacks.js Documentation](https://docs.stacks.co/stacks-js)
- [Clarinet SDK](https://docs.hiro.so/clarinet)

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review test cases for examples

---

## 🎉 Acknowledgments

Built with:
- [Stacks Blockchain](https://www.stacks.co)
- [Clarity Language](https://clarity-lang.org)
- [Stacks.js](https://github.com/hirosystems/stacks.js)
- [Vitest](https://vitest.dev)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Status**: Production Ready ✅
