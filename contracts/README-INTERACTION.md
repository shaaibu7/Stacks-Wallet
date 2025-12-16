# Token Contract Interaction Script

A comprehensive command-line interface for interacting with your SIP-010 compliant token contract on the Stacks blockchain.

## Setup

1. **Environment Configuration**
   
   Make sure your `.env` file contains the required variables:
   ```bash
   PRIVATE_KEY=your_private_key_here
   CONTRACT_ADDRESS=your_contract_deployer_address
   CONTRACT_NAME=token-contract  # or your specific contract name
   STACKS_NETWORK=testnet        # or mainnet
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Usage

### Basic Commands

**Display Help**
```bash
npm run interact help
```

**Get Token Information**
```bash
npm run interact info
```
Displays token name, symbol, decimals, total supply, and metadata URI.

**Check Balance**
```bash
npm run interact balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```
Shows the token balance for the specified address.

### Transaction Commands

**Transfer Tokens**
```bash
# Basic transfer
npm run interact transfer 1000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

# Transfer with memo
npm run interact transfer 1000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM "Payment for services"
```

**Mint Tokens (Owner Only)**
```bash
npm run interact mint 5000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

**Update Token URI (Owner Only)**
```bash
npm run interact set-uri "https://example.com/token-metadata.json"
```

## Important Notes

### Token Amounts
- Amounts are specified in the smallest unit based on token decimals
- For a token with 6 decimals: `1000000 = 1.000000 tokens`
- Always check the token's decimal places with the `info` command

### Network Configuration
- **Testnet**: Use for development and testing
- **Mainnet**: Use for production deployments
- Set `STACKS_NETWORK=mainnet` or `STACKS_NETWORK=testnet` in your `.env` file

### Transaction Fees
- All write operations (transfer, mint, set-uri) require STX for transaction fees
- Default fee is set to 150,000 microSTX (0.15 STX)
- Ensure your account has sufficient STX balance

### Owner-Only Functions
- `mint`: Only the contract deployer can mint new tokens
- `set-uri`: Only the contract deployer can update metadata URI
- These will fail if called by non-owner addresses

## Examples

### Complete Workflow Example

1. **Check token information**
   ```bash
   npm run interact info
   ```

2. **Check your balance**
   ```bash
   npm run interact balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
   ```

3. **Mint some tokens to yourself (if you're the owner)**
   ```bash
   npm run interact mint 10000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
   ```

4. **Transfer tokens to another address**
   ```bash
   npm run interact transfer 2000000 ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG "Test transfer"
   ```

5. **Update token metadata**
   ```bash
   npm run interact set-uri "https://mytoken.com/metadata.json"
   ```

## Troubleshooting

### Common Errors

**"PRIVATE_KEY environment variable is required"**
- Add your private key to the `.env` file
- Use either `PRIVATE_KEY` or `DEPLOYER_KEY`

**"CONTRACT_ADDRESS environment variable is required"**
- Add your contract deployer address to the `.env` file
- Use either `CONTRACT_ADDRESS` or `DEPLOYER_ADDRESS`

**"Error calling function"**
- Check that the contract is deployed and accessible
- Verify the contract name matches your deployment
- Ensure network connectivity

**"Transaction failed"**
- Check that you have sufficient STX for transaction fees
- Verify you have permission for owner-only functions
- Ensure recipient addresses are valid

### Getting Help

Run the help command to see all available options:
```bash
npm run interact help
```

## Security Notes

- Never commit your private key to version control
- Use testnet for development and testing
- Double-check recipient addresses before transferring tokens
- Keep your private key secure and backed up