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
  bufferCV
} from '@stacks/transactions';
import { loadContractConfig, displayNetworkInfo, getExplorerTxUrl } from './config';
import type { ContractConfig } from './config';

// Load configuration from environment
const baseConfig = loadContractConfig('CONTRACT_ADDRESS', 'token-contract');

// CONFIGURATION - Loaded from .env file
const CONFIG = {
  ...baseConfig,
  
  // HARDCODED INTERACTION DATA
  testAddress: baseConfig.contractAddress, // Use your own address to check balance
  transferAmount: process.env.TRANSFER_AMOUNT || '100000', // Amount to transfer (0.1 token with 6 decimals)
  transferRecipient: process.env.TRANSFER_RECIPIENT || 'ST000000000000000000002AMW42H', // Recipient address (testnet burn address)
  transferMemo: 'Automated test transfer',
  mintAmount: process.env.MINT_AMOUNT || '1000000', // Amount to mint (1 token with 6 decimals)
  mintRecipient: baseConfig.contractAddress, // Mint to your own address
  newTokenUri: process.env.TOKEN_URI || 'https://example.com/updated-token-metadata.json',
  
  // TRANSACTION SETTINGS
  totalTransactions: parseInt(process.env.TOTAL_TRANSACTIONS || '50'), // Total number of transactions to generate
  delayBetweenTx: parseInt(process.env.DELAY_BETWEEN_TX || '3000'), // 3 seconds between transactions
};

class SimpleTokenInteraction {
  
  private async callReadOnly(functionName: string, functionArgs: any[] = []) {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONFIG.contractAddress,
        contractName: CONFIG.contractName,
        functionName,
        functionArgs,
        network: CONFIG.network,
        senderAddress: CONFIG.contractAddress
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
        contractAddress: CONFIG.contractAddress,
        contractName: CONFIG.contractName,
        functionName,
        functionArgs,
        senderKey: CONFIG.privateKey,
        network: CONFIG.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee
      };

      console.log(`⏳ Creating transaction for ${functionName}...`);
      const transaction = await makeContractCall(txOptions);
      
      console.log('📤 Broadcasting to network...');
      const broadcastResponse = await broadcastTransaction({ 
        transaction, 
        network: CONFIG.network 
      });

      if ('error' in broadcastResponse) {
        console.error('❌ Transaction failed:', broadcastResponse.error);
        throw new Error(broadcastResponse.error);
      } else {
        console.log('✅ Transaction broadcast successfully!');
        console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
        console.log(`🔗 Explorer: ${getExplorerTxUrl(broadcastResponse.txid, CONFIG.networkEnv)}`);
        return broadcastResponse.txid;
      }
    } catch (error) {
      console.error(`❌ Error executing ${functionName}:`, error);
      throw error;
    }
  }

  async runAllInteractions() {
    console.log('🚀 Starting automated token contract interactions...\n');
    displayNetworkInfo(CONFIG);
    console.log(`🎯 Target: ${CONFIG.totalTransactions} transactions\n`);

    let successfulTx = 0;
    let failedTx = 0;

    try {
      // 1. Get initial token information
      console.log('1️⃣ Fetching initial token information...');
      await this.getTokenInfo();
      
      // 2. Check initial balance
      console.log('2️⃣ Checking initial balance...');
      await this.getBalance();
      
      console.log(`\n🔄 Starting ${CONFIG.totalTransactions} transaction loop...\n`);
      
      // 3. Generate multiple transactions
      for (let i = 1; i <= CONFIG.totalTransactions; i++) {
        console.log(`📦 Transaction ${i}/${CONFIG.totalTransactions}`);
        
        try {
          // Only mint tokens for now (transfers are being rejected)
          console.log(`🏭 Minting ${CONFIG.mintAmount} tokens (Tx ${i})...`);
          await this.mintTokens(i);
          successfulTx++;
          
          // Wait between transactions to avoid rate limiting
          if (i < CONFIG.totalTransactions) {
            console.log(`⏳ Waiting ${CONFIG.delayBetweenTx/1000}s before next transaction...\n`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenTx));
          }
          
        } catch (error) {
          console.error(`❌ Transaction ${i} failed:`, error instanceof Error ? error.message : String(error));
          failedTx++;
          
          // Continue with next transaction after a short delay
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // 4. Final balance check
      console.log('\n📊 Final Results:');
      console.log(`✅ Successful transactions: ${successfulTx}`);
      console.log(`❌ Failed transactions: ${failedTx}`);
      console.log(`📈 Success rate: ${((successfulTx / CONFIG.totalTransactions) * 100).toFixed(1)}%\n`);
      
      console.log('5️⃣ Checking final balance...');
      await this.getBalance();
      
      console.log('🎉 All interactions completed!');
      
    } catch (error) {
      console.error('❌ Interaction sequence failed:', error);
    }
  }

  async getTokenInfo() {
    try {
      const [name, symbol, decimals, totalSupply, tokenUri] = await Promise.all([
        this.callReadOnly('get-name'),
        this.callReadOnly('get-symbol'),
        this.callReadOnly('get-decimals'),
        this.callReadOnly('get-total-supply'),
        this.callReadOnly('get-token-uri')
      ]);

      console.log('🪙 Token Information:');
      console.log(`   Name: ${name.value.value || name.value}`);
      console.log(`   Symbol: ${symbol.value.value || symbol.value}`);
      console.log(`   Decimals: ${decimals.value.value || decimals.value}`);
      console.log(`   Total Supply: ${totalSupply.value.value || totalSupply.value}`);
      console.log(`   Token URI: ${tokenUri.value?.value?.value || tokenUri.value?.value || 'Not set'}\n`);
    } catch (error) {
      console.error('❌ Failed to fetch token information:', error);
      console.log('');
    }
  }

  async getBalance() {
    try {
      const balance = await this.callReadOnly('get-balance', [
        standardPrincipalCV(CONFIG.testAddress)
      ]);

      console.log(`💰 Balance for ${CONFIG.testAddress}: ${balance.value.value || balance.value} tokens\n`);
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
      console.log('');
    }
  }

  async transferTokens(txNumber?: number) {
    try {
      const memo = txNumber ? `Transfer #${txNumber} - ${CONFIG.transferMemo}` : CONFIG.transferMemo;
      const functionArgs = [
        uintCV(CONFIG.transferAmount),
        standardPrincipalCV(CONFIG.senderAddress), // sender (must match tx-sender)
        standardPrincipalCV(CONFIG.transferRecipient),
        someCV(bufferCV(Buffer.from(memo, 'utf8')))
      ];

      const txId = await this.broadcastContractCall('transfer', functionArgs);
      if (txNumber) {
        console.log(`✅ Transfer ${txNumber} completed: ${txId}\n`);
      }
    } catch (error) {
      console.error('❌ Transfer failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async mintTokens(txNumber?: number) {
    try {
      const functionArgs = [
        uintCV(CONFIG.mintAmount),
        standardPrincipalCV(CONFIG.mintRecipient)
      ];

      const txId = await this.broadcastContractCall('mint', functionArgs);
      if (txNumber) {
        console.log(`✅ Mint ${txNumber} completed: ${txId}`);
        console.log(`🔗 Explorer: ${getExplorerTxUrl(txId, CONFIG.networkEnv)}\n`);
      }
    } catch (error) {
      console.error('❌ Mint failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async updateTokenUri() {
    try {
      const functionArgs = [
        stringUtf8CV(CONFIG.newTokenUri)
      ];

      console.log(`🔗 Setting token URI to: ${CONFIG.newTokenUri}...`);
      await this.broadcastContractCall('set-token-uri', functionArgs);
      console.log('');
    } catch (error) {
      console.error('❌ Set token URI failed:', error);
      console.log('');
    }
  }
}

// Run all interactions automatically
async function main() {
  console.log('🪙 Automated Token Contract Interaction Script');
  console.log('==============================================\n');

  const script = new SimpleTokenInteraction();
  await script.runAllInteractions();
}

// Run the script
main().catch(console.error);