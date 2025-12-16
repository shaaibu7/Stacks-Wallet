#!/usr/bin/env tsx

import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  fetchCallReadOnlyFunction,
  cvToJSON,
  standardPrincipalCV,
  uintCV,
  stringUtf8CV,
  someCV,
  noneCV,
  bufferCV
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  privateKey: string;
  network: any;
  networkName: string;
  contractAddress: string;
  contractName: string;
}

class TokenInteractionScript {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
    const networkEnv = process.env.STACKS_NETWORK || 'testnet';
    const contractAddress = process.env.CONTRACT_ADDRESS || process.env.DEPLOYER_ADDRESS;
    const contractName = process.env.CONTRACT_NAME || 'token-contract';

    if (!privateKey) {
      console.error('❌ Error: PRIVATE_KEY or DEPLOYER_KEY environment variable is required.');
      process.exit(1);
    }

    if (!contractAddress) {
      console.error('❌ Error: CONTRACT_ADDRESS or DEPLOYER_ADDRESS environment variable is required.');
      process.exit(1);
    }

    const network = networkEnv === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const networkName = networkEnv === 'mainnet' ? 'Mainnet' : 'Testnet';

    return {
      privateKey,
      network,
      networkName,
      contractAddress,
      contractName
    };
  }

  private async callReadOnly(functionName: string, functionArgs: any[] = []) {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.config.contractAddress,
        contractName: this.config.contractName,
        functionName,
        functionArgs,
        network: this.config.network,
        senderAddress: this.config.contractAddress
      });

      return cvToJSON(result);
    } catch (error) {
      console.error(`❌ Error calling ${functionName}:`, error);
      throw error;
    }
  }

  private async broadcastContractCall(functionName: string, functionArgs: any[] = [], fee: number = 150000) {
    try {
      const txOptions = {
        contractAddress: this.config.contractAddress,
        contractName: this.config.contractName,
        functionName,
        functionArgs,
        senderKey: this.config.privateKey,
        network: this.config.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee
      };

      console.log(`⏳ Creating transaction for ${functionName}...`);
      const transaction = await makeContractCall(txOptions);
      
      console.log('📤 Broadcasting to network...');
      const broadcastResponse = await broadcastTransaction({ 
        transaction, 
        network: this.config.network 
      });

      if ('error' in broadcastResponse) {
        console.error('❌ Transaction failed:', broadcastResponse.error);
        throw new Error(broadcastResponse.error);
      } else {
        console.log('✅ Transaction broadcast successfully!');
        console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
        console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${this.config.networkName.toLowerCase()}`);
        return broadcastResponse.txid;
      }
    } catch (error) {
      console.error(`❌ Error executing ${functionName}:`, error);
      throw error;
    }
  }

  async getTokenInfo() {
    console.log('📊 Fetching token information...\n');
    
    try {
      const [name, symbol, decimals, totalSupply, tokenUri] = await Promise.all([
        this.callReadOnly('get-name'),
        this.callReadOnly('get-symbol'),
        this.callReadOnly('get-decimals'),
        this.callReadOnly('get-total-supply'),
        this.callReadOnly('get-token-uri')
      ]);

      console.log('🪙 Token Information:');
      console.log(`   Name: ${name.value}`);
      console.log(`   Symbol: ${symbol.value}`);
      console.log(`   Decimals: ${decimals.value}`);
      console.log(`   Total Supply: ${totalSupply.value}`);
      console.log(`   Token URI: ${tokenUri.value?.value || 'Not set'}`);
      console.log(`   Contract: ${this.config.contractAddress}.${this.config.contractName}`);
      console.log(`   Network: ${this.config.networkName}\n`);
    } catch (error) {
      console.error('❌ Failed to fetch token information');
    }
  }

  async getBalance(address: string) {
    console.log(`💰 Fetching balance for ${address}...\n`);
    
    try {
      const balance = await this.callReadOnly('get-balance', [
        standardPrincipalCV(address)
      ]);

      console.log(`Balance: ${balance.value} tokens\n`);
      return balance.value;
    } catch (error) {
      console.error('❌ Failed to fetch balance');
      return null;
    }
  }

  async transfer(amount: string, recipient: string, memo?: string) {
    console.log(`💸 Transferring ${amount} tokens to ${recipient}...\n`);
    
    try {
      const functionArgs = [
        uintCV(amount),
        standardPrincipalCV(this.config.contractAddress), // sender (must be tx-sender)
        standardPrincipalCV(recipient),
        memo ? someCV(bufferCV(Buffer.from(memo, 'utf8'))) : noneCV()
      ];

      await this.broadcastContractCall('transfer', functionArgs);
    } catch (error) {
      console.error('❌ Transfer failed');
    }
  }

  async mint(amount: string, recipient: string) {
    console.log(`🏭 Minting ${amount} tokens to ${recipient}...\n`);
    
    try {
      const functionArgs = [
        uintCV(amount),
        standardPrincipalCV(recipient)
      ];

      await this.broadcastContractCall('mint', functionArgs);
    } catch (error) {
      console.error('❌ Mint failed');
    }
  }

  async setTokenUri(newUri: string) {
    console.log(`🔗 Setting token URI to: ${newUri}...\n`);
    
    try {
      const functionArgs = [
        stringUtf8CV(newUri)
      ];

      await this.broadcastContractCall('set-token-uri', functionArgs);
    } catch (error) {
      console.error('❌ Set token URI failed');
    }
  }

  displayHelp() {
    console.log(`
🪙 Token Contract Interaction Script
=====================================

Usage: tsx scripts/interact.ts <command> [arguments]

Commands:
  info                           - Display token information
  balance <address>              - Get token balance for address
  transfer <amount> <recipient> [memo] - Transfer tokens to recipient
  mint <amount> <recipient>      - Mint new tokens (owner only)
  set-uri <uri>                  - Update token metadata URI (owner only)
  help                           - Show this help message

Examples:
  tsx scripts/interact.ts info
  tsx scripts/interact.ts balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
  tsx scripts/interact.ts transfer 1000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM "Payment for services"
  tsx scripts/interact.ts mint 5000000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
  tsx scripts/interact.ts set-uri "https://example.com/token-metadata.json"

Environment Variables:
  PRIVATE_KEY or DEPLOYER_KEY    - Your private key for signing transactions
  CONTRACT_ADDRESS or DEPLOYER_ADDRESS - The contract deployer address
  CONTRACT_NAME                  - Contract name (default: token-contract)
  STACKS_NETWORK                 - Network: mainnet or testnet (default: testnet)

Note: Amounts should be specified in the smallest unit (e.g., 1000000 = 1 token with 6 decimals)
`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    const script = new TokenInteractionScript();
    script.displayHelp();
    return;
  }

  const command = args[0].toLowerCase();
  const script = new TokenInteractionScript();

  try {
    switch (command) {
      case 'info':
        await script.getTokenInfo();
        break;

      case 'balance':
        if (args.length < 2) {
          console.error('❌ Error: Address required for balance command');
          console.log('Usage: tsx scripts/interact.ts balance <address>');
          process.exit(1);
        }
        await script.getBalance(args[1]);
        break;

      case 'transfer':
        if (args.length < 3) {
          console.error('❌ Error: Amount and recipient required for transfer command');
          console.log('Usage: tsx scripts/interact.ts transfer <amount> <recipient> [memo]');
          process.exit(1);
        }
        await script.transfer(args[1], args[2], args[3]);
        break;

      case 'mint':
        if (args.length < 3) {
          console.error('❌ Error: Amount and recipient required for mint command');
          console.log('Usage: tsx scripts/interact.ts mint <amount> <recipient>');
          process.exit(1);
        }
        await script.mint(args[1], args[2]);
        break;

      case 'set-uri':
        if (args.length < 2) {
          console.error('❌ Error: URI required for set-uri command');
          console.log('Usage: tsx scripts/interact.ts set-uri <uri>');
          process.exit(1);
        }
        await script.setTokenUri(args[1]);
        break;

      case 'help':
      case '--help':
      case '-h':
        script.displayHelp();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        script.displayHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);