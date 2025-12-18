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
  contractPrincipalCV
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
  tokenContractAddress: string;
  tokenContractName: string;
  // Default values from .env
  defaultWalletName: string;
  defaultInitialFunding: string;
  defaultMemberName: string;
  defaultMemberAddress: string;
  defaultMemberFunding: string;
  defaultMemberId: string;
  defaultReimburseAmount: string;
  defaultWithdrawAmount: string;
  defaultReceiverAddress: string;
  defaultTxFee: number;
  adminAddress: string;
}

class WalletXInteractionScript {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    const privateKey = process.env.PRIVATE_KEY;
    const networkEnv = process.env.STACKS_NETWORK || 'testnet';
    
    // Parse wallet contract from WALLET_CONTRACT env var (format: ADDRESS.CONTRACT_NAME)
    const walletContract = process.env.WALLET_CONTRACT;
    let contractAddress: string;
    let contractName: string;
    
    if (walletContract && walletContract.includes('.')) {
      [contractAddress, contractName] = walletContract.split('.');
    } else {
      // Fallback to old format
      contractAddress = process.env.CONTRACT_ADDRESS || process.env.DEPLOYER_ADDRESS || '';
      contractName = process.env.WALLET_CONTRACT_NAME || 'wallet-x';
    }
    
    // Parse token contract from CONTRACT_ADDRESS env var (format: ADDRESS.CONTRACT_NAME)
    const tokenContract = process.env.CONTRACT_ADDRESS;
    let tokenContractAddress: string;
    let tokenContractName: string;
    
    if (tokenContract && tokenContract.includes('.')) {
      [tokenContractAddress, tokenContractName] = tokenContract.split('.');
    } else {
      // Fallback
      tokenContractAddress = contractAddress;
      tokenContractName = 'token-contract';
    }

    if (!privateKey) {
      console.error('❌ Error: PRIVATE_KEY environment variable is required.');
      process.exit(1);
    }

    if (!contractAddress) {
      console.error('❌ Error: WALLET_CONTRACT environment variable is required.');
      console.error('   Format: ADDRESS.CONTRACT_NAME (e.g., ST1ABC...XYZ.wallet-x)');
      process.exit(1);
    }

    const network = networkEnv === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const networkName = networkEnv === 'mainnet' ? 'Mainnet' : 'Testnet';
    
    // For now, let's use the env var but we know there's an address mismatch issue

    // Load default values from .env
    const defaultWalletName = process.env.DEFAULT_WALLET_NAME || 'My Company Wallet';
    const defaultInitialFunding = process.env.DEFAULT_INITIAL_FUNDING || '1000000';
    const defaultMemberName = process.env.DEFAULT_MEMBER_NAME || 'John Doe';
    const defaultMemberAddress = process.env.DEFAULT_MEMBER_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const defaultMemberFunding = process.env.DEFAULT_MEMBER_FUNDING || '100000';
    const defaultMemberId = process.env.DEFAULT_MEMBER_ID || '1';
    const defaultReimburseAmount = process.env.DEFAULT_REIMBURSE_AMOUNT || '50000';
    const defaultWithdrawAmount = process.env.DEFAULT_WITHDRAW_AMOUNT || '25000';
    const defaultReceiverAddress = process.env.DEFAULT_RECEIVER_ADDRESS || 'ST000000000000000000002AMW42H';
    const defaultTxFee = parseInt(process.env.DEFAULT_TX_FEE || '200000');
    const adminAddress = process.env.ADMIN_ADDRESS || contractAddress;

    return {
      privateKey,
      network,
      networkName,
      contractAddress,
      contractName,
      tokenContractAddress,
      tokenContractName,
      defaultWalletName,
      defaultInitialFunding,
      defaultMemberName,
      defaultMemberAddress,
      defaultMemberFunding,
      defaultMemberId,
      defaultReimburseAmount,
      defaultWithdrawAmount,
      defaultReceiverAddress,
      defaultTxFee,
      adminAddress
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

  private async broadcastContractCall(functionName: string, functionArgs: any[] = [], fee?: number, retryCount: number = 0): Promise<string> {
    const maxRetries = 2;
    
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
        fee: fee || this.config.defaultTxFee
      };

      console.log(`⏳ Creating transaction for ${functionName}...`);
      const transaction = await makeContractCall(txOptions);
      
      console.log('📤 Broadcasting to network...');
      const broadcastResponse = await broadcastTransaction({ 
        transaction, 
        network: this.config.network 
      });

      if ('error' in broadcastResponse) {
        // Check if it's a nonce error and we can retry
        if (broadcastResponse.reason === 'BadNonce' && retryCount < maxRetries) {
          console.log(`⚠️  Nonce error detected. Retrying in 10 seconds... (attempt ${retryCount + 1}/${maxRetries + 1})`);
          await this.sleep(10000);
          return await this.broadcastContractCall(functionName, functionArgs, fee, retryCount + 1);
        }
        
        console.error('❌ Transaction failed:', broadcastResponse.error);
        console.error('❌ Full response:', JSON.stringify(broadcastResponse, null, 2));
        throw new Error(broadcastResponse.error);
      } else {
        console.log('✅ Transaction broadcast successfully!');
        console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
        console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${this.config.networkName.toLowerCase()}`);
        return broadcastResponse.txid;
      }
    } catch (error) {
      // Check if it's a nonce-related error and we can retry
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('BadNonce') && retryCount < maxRetries) {
        console.log(`⚠️  Nonce error in catch block. Retrying in 10 seconds... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        await this.sleep(10000);
        return await this.broadcastContractCall(functionName, functionArgs, fee, retryCount + 1);
      }
      
      console.error(`❌ Error executing ${functionName}:`, error);
      throw error;
    }
  }

  // Admin Functions

  async registerWallet(walletName?: string, fundAmount?: string) {
    const name = walletName || this.config.defaultWalletName;
    const amount = fundAmount || this.config.defaultInitialFunding;
    console.log(`🏦 Registering wallet "${name}" with ${amount} tokens...\n`);
    
    try {
      // Use a well-known testnet token contract or deploy our own
      // For now, let's try with the configured token contract
      const functionArgs = [
        stringUtf8CV(name),
        uintCV(amount),
        contractPrincipalCV(this.config.tokenContractAddress, this.config.tokenContractName)
      ];

      return await this.broadcastContractCall('register-wallet', functionArgs);
    } catch (error) {
      console.error('❌ Wallet registration failed');
      throw error;
    }
  }

  async onboardMember(memberAddress?: string, memberName?: string, fundAmount?: string, memberIdentifier?: string) {
    const address = memberAddress || this.config.defaultMemberAddress;
    const name = memberName || this.config.defaultMemberName;
    const amount = fundAmount || this.config.defaultMemberFunding;
    const id = memberIdentifier || this.config.defaultMemberId;
    console.log(`👤 Onboarding member "${name}" (${address}) with ${amount} tokens...\n`);
    
    try {
      const functionArgs = [
        standardPrincipalCV(address),
        stringUtf8CV(name),
        uintCV(amount),
        uintCV(id)
      ];

      return await this.broadcastContractCall('onboard-member', functionArgs);
    } catch (error) {
      console.error('❌ Member onboarding failed');
      throw error;
    }
  }

  async reimburseWallet(amount?: string) {
    const reimburseAmount = amount || this.config.defaultReimburseAmount;
    console.log(`💰 Reimbursing wallet with ${reimburseAmount} tokens...\n`);
    
    try {
      const functionArgs = [
        uintCV(reimburseAmount),
        contractPrincipalCV(this.config.tokenContractAddress, this.config.tokenContractName)
      ];

      await this.broadcastContractCall('reimburse-wallet', functionArgs);
    } catch (error) {
      console.error('❌ Wallet reimbursement failed');
    }
  }

  async reimburseMember(memberIdentifier?: string, amount?: string) {
    const id = memberIdentifier || this.config.defaultMemberId;
    const reimburseAmount = amount || this.config.defaultReimburseAmount;
    console.log(`💳 Reimbursing member ${id} with ${reimburseAmount} tokens...\n`);
    
    try {
      const functionArgs = [
        uintCV(id),
        uintCV(reimburseAmount)
      ];

      await this.broadcastContractCall('reimburse-member', functionArgs);
    } catch (error) {
      console.error('❌ Member reimbursement failed');
    }
  }

  async removeMember(memberAddress?: string) {
    const address = memberAddress || this.config.defaultMemberAddress;
    console.log(`🗑️ Removing member ${address}...\n`);
    
    try {
      const functionArgs = [
        standardPrincipalCV(address)
      ];

      await this.broadcastContractCall('remove-member', functionArgs);
    } catch (error) {
      console.error('❌ Member removal failed');
    }
  }

  async freezeMember(memberAddress?: string) {
    const address = memberAddress || this.config.defaultMemberAddress;
    console.log(`🧊 Freezing member ${address}...\n`);
    
    try {
      const functionArgs = [
        standardPrincipalCV(address)
      ];

      await this.broadcastContractCall('freeze-member', functionArgs);
    } catch (error) {
      console.error('❌ Member freeze failed');
    }
  }

  async unfreezeMember(memberAddress?: string) {
    const address = memberAddress || this.config.defaultMemberAddress;
    console.log(`🔥 Unfreezing member ${address}...\n`);
    
    try {
      const functionArgs = [
        standardPrincipalCV(address)
      ];

      await this.broadcastContractCall('unfreeze-member', functionArgs);
    } catch (error) {
      console.error('❌ Member unfreeze failed');
    }
  }

  // Member Functions

  async memberWithdrawal(amount?: string, receiver?: string) {
    const withdrawAmount = amount || this.config.defaultWithdrawAmount;
    const receiverAddress = receiver || this.config.defaultReceiverAddress;
    console.log(`💸 Member withdrawing ${withdrawAmount} tokens to ${receiverAddress}...\n`);
    
    try {
      const functionArgs = [
        uintCV(withdrawAmount),
        standardPrincipalCV(receiverAddress),
        contractPrincipalCV(this.config.tokenContractAddress, this.config.tokenContractName)
      ];

      await this.broadcastContractCall('member-withdrawal', functionArgs);
    } catch (error) {
      console.error('❌ Member withdrawal failed');
    }
  }

  // Test function to debug contract issues
  async testContractConnection() {
    console.log('🔍 Testing contract connection and configuration...\n');
    
    try {
      // Test read-only function first
      console.log('📋 Contract Configuration:');
      console.log(`   Contract Address: ${this.config.contractAddress}`);
      console.log(`   Contract Name: ${this.config.contractName}`);
      console.log(`   Token Contract: ${this.config.tokenContractAddress}.${this.config.tokenContractName}`);
      console.log(`   Network: ${this.config.networkName}`);
      console.log(`   Admin Address: ${this.config.adminAddress}\n`);
      
      // Try to get wallet info (this should work even if no wallet exists)
      console.log('🔍 Testing read-only function...');
      const walletInfo = await this.getWalletAdmin();
      
      if (walletInfo && walletInfo.value) {
        console.log('✅ Wallet already exists! Details:');
        console.log(`   Wallet Name: ${walletInfo.value['wallet-name'].value}`);
        console.log(`   Balance: ${walletInfo.value['wallet-balance'].value}`);
        console.log(`   Active: ${walletInfo.value.active.value}\n`);
        return { hasWallet: true, walletInfo };
      } else {
        console.log('ℹ️  No wallet found - ready to register new wallet\n');
        return { hasWallet: false, walletInfo: null };
      }
      
    } catch (error) {
      console.error('❌ Contract connection test failed:', error);
      throw error;
    }
  }

  // Bulk Wallet Registration Operations
  async runBulkWalletRegistrations(count: number = 80) {
    console.log(`🚀 Starting bulk wallet registrations: ${count} wallet registration attempts...\n`);
    console.log(`⚠️  Note: Each admin address can only register ONE wallet. This will attempt ${count} registrations.`);
    console.log(`⚠️  Only the first registration will succeed, others will fail with 'wallet exists' error.\n`);
    
    const results = {
      walletRegistrations: 0,
      failures: 0,
      txids: [] as string[]
    };

    try {
      for (let i = 1; i <= count; i++) {
        console.log(`\n📋 Wallet Registration Attempt ${i}/${count}`);
        console.log('=' .repeat(50));
        
        try {
          const walletName = `Wallet ${i}`;
          const fundAmount = (1000000 + (i * 10000)).toString(); // Varying amounts
          
          console.log(`🏦 Attempting to register wallet "${walletName}" with ${fundAmount} tokens...`);
          const txid = await this.registerWallet(walletName, fundAmount);
          
          if (txid) {
            results.walletRegistrations++;
            results.txids.push(txid);
            console.log('✅ Wallet registration successful!');
          }
          
          // Wait between transactions to avoid nonce conflicts
          console.log('⏳ Waiting 10 seconds before next transaction...');
          await this.sleep(10000);
          
        } catch (error) {
          console.error(`❌ Wallet registration ${i} failed:`, error);
          results.failures++;
          
          // Continue with next transaction after a longer wait
          console.log('⏳ Waiting 15 seconds after failure...');
          await this.sleep(15000);
        }
      }
      
    } catch (error) {
      console.error('❌ Bulk wallet registration failed:', error);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BULK WALLET REGISTRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful Wallet Registrations: ${results.walletRegistrations}`);
    console.log(`❌ Failures: ${results.failures}`);
    console.log(`📋 Total Transactions: ${results.txids.length}`);
    console.log(`🎯 Success Rate: ${((results.txids.length / count) * 100).toFixed(1)}%`);
    
    if (results.txids.length > 0) {
      console.log('\n🔗 Transaction IDs:');
      results.txids.forEach((txid, index) => {
        console.log(`   ${index + 1}. ${txid}`);
      });
    }
    
    console.log('\n✨ Bulk wallet registration completed!');
    console.log('\n⚠️  Expected: Only 1 success, 79 failures due to contract constraint (one wallet per admin)');
    return results;
  }

  // Bulk Operations (Original - Wallet + Members)

  async runBulkTransactions(count: number = 50) {
    console.log(`🚀 Starting bulk operations: ${count} transactions for wallet registration and member onboarding...\n`);
    
    const results = {
      walletRegistrations: 0,
      memberOnboardings: 0,
      failures: 0,
      txids: [] as string[]
    };

    try {
      // First, test contract connection and check if wallet exists
      const testResult = await this.testContractConnection();
      
      if (!testResult.hasWallet) {
        // Register a single wallet (each admin can only have one wallet)
        console.log(`📋 Initial Wallet Registration`);
        console.log('=' .repeat(50));
        
        try {
          const walletName = `Bulk Operations Wallet`;
          const fundAmount = (5000000).toString(); // Large initial funding for all members
          
          console.log(`🏦 Registering wallet "${walletName}" with ${fundAmount} tokens...`);
          const walletTxid = await this.registerWallet(walletName, fundAmount);
          
          if (walletTxid) {
            results.walletRegistrations++;
            results.txids.push(walletTxid);
            console.log('✅ Wallet registration successful!');
          }
          
          // Wait before starting member onboarding
          console.log('⏳ Waiting 5 seconds before starting member onboarding...');
          await this.sleep(5000);
          
        } catch (error) {
          console.error('❌ Initial wallet registration failed:', error);
          console.log('⚠️  This might be a contract or configuration issue. Stopping bulk operation.');
          return results;
        }
      } else {
        console.log('✅ Using existing wallet for member onboarding...\n');
      }

      // Now onboard members
      for (let i = 1; i <= count; i++) {
        console.log(`\n📋 Member Onboarding ${i}/${count}`);
        console.log('=' .repeat(50));
        
        try {
          const memberName = `Member ${i}`;
          const memberAddress = this.generateTestAddress(i);
          const fundAmount = (50000 + (i * 1000)).toString(); // Varying amounts
          const memberId = i.toString();
          
          console.log(`👤 Onboarding member "${memberName}" (${memberAddress}) with ${fundAmount} tokens...`);
          const txid = await this.onboardMember(memberAddress, memberName, fundAmount, memberId);
          
          if (txid) {
            results.memberOnboardings++;
            results.txids.push(txid);
          }
          
          // Wait between transactions to avoid nonce conflicts
          console.log('⏳ Waiting 10 seconds before next transaction...');
          await this.sleep(10000);
          
        } catch (error) {
          console.error(`❌ Member onboarding ${i} failed:`, error);
          results.failures++;
          
          // Continue with next transaction after a longer wait
          console.log('⏳ Waiting 15 seconds after failure...');
          await this.sleep(15000);
        }
      }
      
    } catch (error) {
      console.error('❌ Bulk operation failed:', error);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BULK OPERATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Wallet Registrations: ${results.walletRegistrations}`);
    console.log(`✅ Member Onboardings: ${results.memberOnboardings}`);
    console.log(`❌ Failures: ${results.failures}`);
    console.log(`📋 Total Transactions: ${results.txids.length}`);
    console.log(`🎯 Success Rate: ${((results.txids.length / (count + 1)) * 100).toFixed(1)}%`);
    
    if (results.txids.length > 0) {
      console.log('\n🔗 Transaction IDs:');
      results.txids.forEach((txid, index) => {
        console.log(`   ${index + 1}. ${txid}`);
      });
    }
    
    console.log('\n✨ Bulk operation completed!');
    return results;
  }

  private generateTestAddress(seed: number): string {
    // Use only verified valid testnet addresses (from successful transactions in previous run)
    const validTestAddresses = [
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
      'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
      'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
      'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
      'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0',
      'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ',
      'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP',
      'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6',
      'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
      'ST11NJTTKGVT6D1HY4NJRVQWMQM7TVAR091EJ8P2Y',
      'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRV',
      'ST000000000000000000002AMW42H',
      // Duplicate the working addresses to ensure we have enough for 50+ members
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
      'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
      'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
      'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
      'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0',
      'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ',
      'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP',
      'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6',
      'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
      'ST11NJTTKGVT6D1HY4NJRVQWMQM7TVAR091EJ8P2Y',
      'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRV',
      'ST000000000000000000002AMW42H',
      // Third repetition to ensure coverage for 50+ members
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
      'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
      'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
      'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
      'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0',
      'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ',
      'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP',
      'STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6',
      'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
      'ST11NJTTKGVT6D1HY4NJRVQWMQM7TVAR091EJ8P2Y',
      'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRV',
      'ST000000000000000000002AMW42H',
      // Fourth repetition for extra coverage
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
      'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
      'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
      'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
      'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
      'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0',
      'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ'
    ];
    
    // Cycle through the valid addresses based on the seed
    return validTestAddresses[seed % validTestAddresses.length];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Read-only Functions

  async getWalletAdmin(adminAddress?: string) {
    const address = adminAddress || this.config.adminAddress;
    console.log(`🔍 Fetching wallet admin info for ${address}...\n`);
    
    try {
      const walletInfo = await this.callReadOnly('get-wallet-admin', [
        standardPrincipalCV(address)
      ]);

      if (walletInfo.value) {
        console.log('🏦 Wallet Admin Information:');
        console.log(`   Admin Address: ${walletInfo.value['admin-address'].value}`);
        console.log(`   Wallet Name: ${walletInfo.value['wallet-name'].value}`);
        console.log(`   Active: ${walletInfo.value.active.value}`);
        console.log(`   Wallet ID: ${walletInfo.value['wallet-id'].value}`);
        console.log(`   Wallet Balance: ${walletInfo.value['wallet-balance'].value}`);
        console.log(`   Role: ${walletInfo.value.role.value}\n`);
      } else {
        console.log('❌ No wallet found for this admin address\n');
      }
      
      return walletInfo;
    } catch (error) {
      console.error('❌ Failed to fetch wallet admin info');
      return null;
    }
  }

  async getAdminRole(userAddress?: string) {
    const address = userAddress || this.config.adminAddress;
    console.log(`👑 Checking admin role for ${address}...\n`);
    
    try {
      const role = await this.callReadOnly('get-admin-role', [
        standardPrincipalCV(address)
      ]);

      if (role.value) {
        console.log(`Role: ${role.value.value}\n`);
      } else {
        console.log('❌ No admin role found for this address\n');
      }
      
      return role;
    } catch (error) {
      console.error('❌ Failed to fetch admin role');
      return null;
    }
  }

  async getMembers(adminAddress?: string) {
    const address = adminAddress || this.config.adminAddress;
    console.log(`👥 Fetching members for admin ${address}...\n`);
    
    try {
      const members = await this.callReadOnly('get-members', [
        standardPrincipalCV(address)
      ]);

      if (members.value && members.value.length > 0) {
        console.log('👥 Organization Members:');
        members.value.forEach((member: any, index: number) => {
          console.log(`   ${index + 1}. ${member.value}`);
        });
        console.log('');
      } else {
        console.log('❌ No members found for this admin\n');
      }
      
      return members;
    } catch (error) {
      console.error('❌ Failed to fetch members');
      return null;
    }
  }

  async getMember(memberAddress?: string) {
    const address = memberAddress || this.config.defaultMemberAddress;
    console.log(`👤 Fetching member info for ${address}...\n`);
    
    try {
      const memberInfo = await this.callReadOnly('get-member', [
        standardPrincipalCV(address)
      ]);

      if (memberInfo.value) {
        console.log('👤 Member Information:');
        console.log(`   Member Address: ${memberInfo.value['member-address'].value}`);
        console.log(`   Admin Address: ${memberInfo.value['admin-address'].value}`);
        console.log(`   Organization Name: ${memberInfo.value['organization-name'].value}`);
        console.log(`   Name: ${memberInfo.value.name.value}`);
        console.log(`   Active: ${memberInfo.value.active.value}`);
        console.log(`   Frozen: ${memberInfo.value.frozen.value}`);
        console.log(`   Spend Limit: ${memberInfo.value['spend-limit'].value}`);
        console.log(`   Member Identifier: ${memberInfo.value['member-identifier'].value}`);
        console.log(`   Role: ${memberInfo.value.role.value}\n`);
      } else {
        console.log('❌ No member found for this address\n');
      }
      
      return memberInfo;
    } catch (error) {
      console.error('❌ Failed to fetch member info');
      return null;
    }
  }

  async getMemberTransactions(memberAddress?: string) {
    const address = memberAddress || this.config.defaultMemberAddress;
    console.log(`📊 Fetching transaction history for ${address}...\n`);
    
    try {
      const transactions = await this.callReadOnly('get-member-transactions', [
        standardPrincipalCV(address)
      ]);

      if (transactions.value && transactions.value.length > 0) {
        console.log('📊 Transaction History:');
        transactions.value.forEach((tx: any, index: number) => {
          console.log(`   ${index + 1}. Amount: ${tx.value.amount.value}, Receiver: ${tx.value.receiver.value}`);
        });
        console.log('');
      } else {
        console.log('❌ No transactions found for this member\n');
      }
      
      return transactions;
    } catch (error) {
      console.error('❌ Failed to fetch member transactions');
      return null;
    }
  }

  async getActiveMembers(adminAddress?: string) {
    const address = adminAddress || this.config.adminAddress;
    console.log(`✅ Fetching active members for admin ${address}...\n`);
    
    try {
      const activeMembers = await this.callReadOnly('get-active-members', [
        standardPrincipalCV(address)
      ]);

      if (activeMembers.value && activeMembers.value.length > 0) {
        console.log('✅ Active Members:');
        activeMembers.value.forEach((member: any, index: number) => {
          console.log(`   ${index + 1}. ${member.value}`);
        });
        console.log('');
      } else {
        console.log('❌ No active members found for this admin\n');
      }
      
      return activeMembers;
    } catch (error) {
      console.error('❌ Failed to fetch active members');
      return null;
    }
  }

  displayHelp() {
    console.log(`
🏦 WalletX Contract Interaction Script
=====================================

Usage: tsx scripts/interact-wallet-x.ts <command> [arguments]

Admin Commands:
  register-wallet [name] [amount]           - Register a new wallet (uses .env defaults if no args)
  onboard-member [address] [name] [amount] [id] - Add a new member (uses .env defaults if no args)
  bulk-wallets [count]                      - Attempt multiple wallet registrations (default: 80, only 1 will succeed)
  bulk-transactions [count]                 - Register one wallet and onboard multiple members (default: 50 members)
  reimburse-wallet [amount]                 - Add funds to admin wallet (uses .env default if no amount)
  reimburse-member [member-id] [amount]     - Add funds to member's spend limit (uses .env defaults if no args)
  remove-member [address]                   - Remove a member (uses .env default address if no arg)
  freeze-member [address]                   - Freeze a member (uses .env default address if no arg)
  unfreeze-member [address]                 - Unfreeze a member (uses .env default address if no arg)

Member Commands:
  withdraw [amount] [receiver]              - Withdraw funds (uses .env defaults if no args)

Query Commands:
  test-connection                           - Test contract connection and configuration
  wallet-info [admin-address]               - Get wallet admin information (uses .env admin if no arg)
  admin-role [address]                      - Check if address has admin role (uses .env admin if no arg)
  members [admin-address]                   - List all members for an admin (uses .env admin if no arg)
  member-info [member-address]              - Get detailed member information (uses .env default member if no arg)
  member-transactions [member-address]      - Get member's transaction history (uses .env default member if no arg)
  active-members [admin-address]            - List only active members for an admin (uses .env admin if no arg)
  help                                      - Show this help message

Quick Commands (using .env defaults):
  npm run interact-wallet register-wallet   - Register wallet with default name and funding
  npm run interact-wallet onboard-member    - Onboard default member
  npm run interact-wallet bulk-wallets      - Attempt 80 wallet registrations (only 1 will succeed)
  npm run interact-wallet bulk-transactions - Register wallet and onboard 50 members
  npm run interact-wallet wallet-info       - Check your wallet info
  npm run interact-wallet member-info       - Check default member info

Examples:
  tsx scripts/interact-wallet-x.ts register-wallet "My Company Wallet" 1000000
  tsx scripts/interact-wallet-x.ts onboard-member ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM "John Doe" 50000 1
  tsx scripts/interact-wallet-x.ts bulk-wallets 80
  tsx scripts/interact-wallet-x.ts bulk-transactions 50
  tsx scripts/interact-wallet-x.ts withdraw 10000 ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
  tsx scripts/interact-wallet-x.ts wallet-info ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
  tsx scripts/interact-wallet-x.ts member-info ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

Environment Variables:
  PRIVATE_KEY                              - Your private key for signing transactions
  WALLET_CONTRACT                          - Wallet contract in format ADDRESS.CONTRACT_NAME
  CONTRACT_ADDRESS                         - Token contract in format ADDRESS.CONTRACT_NAME
  STACKS_NETWORK                          - Network: mainnet or testnet (default: testnet)

Example .env file:
  PRIVATE_KEY=your_64_char_hex_private_key
  WALLET_CONTRACT=ST1ABC...XYZ.wallet-x-123456789
  CONTRACT_ADDRESS=ST1ABC...XYZ.token-contract-123456789
  STACKS_NETWORK=testnet

Note: 
- Only admins can perform admin commands
- Members can only withdraw up to their spend limit
- Amounts should be specified in the smallest unit (e.g., 1000000 = 1 token with 6 decimals)
- Member IDs should be unique integers for each organization
`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    const script = new WalletXInteractionScript();
    script.displayHelp();
    return;
  }

  const command = args[0].toLowerCase();
  const script = new WalletXInteractionScript();

  try {
    switch (command) {
      case 'register-wallet':
        await script.registerWallet(args[1], args[2]);
        break;

      case 'onboard-member':
        await script.onboardMember(args[1], args[2], args[3], args[4]);
        break;

      case 'test-connection':
        await script.testContractConnection();
        break;

      case 'bulk-wallets':
        const walletCount = args[1] ? parseInt(args[1]) : 80;
        if (isNaN(walletCount) || walletCount <= 0) {
          console.error('❌ Invalid count. Please provide a positive number.');
          process.exit(1);
        }
        await script.runBulkWalletRegistrations(walletCount);
        break;

      case 'bulk-transactions':
        const count = args[1] ? parseInt(args[1]) : 50;
        if (isNaN(count) || count <= 0) {
          console.error('❌ Invalid count. Please provide a positive number.');
          process.exit(1);
        }
        await script.runBulkTransactions(count);
        break;

      case 'reimburse-wallet':
        await script.reimburseWallet(args[1]);
        break;

      case 'reimburse-member':
        await script.reimburseMember(args[1], args[2]);
        break;

      case 'remove-member':
        await script.removeMember(args[1]);
        break;

      case 'freeze-member':
        await script.freezeMember(args[1]);
        break;

      case 'unfreeze-member':
        await script.unfreezeMember(args[1]);
        break;

      case 'withdraw':
        await script.memberWithdrawal(args[1], args[2]);
        break;

      case 'wallet-info':
        await script.getWalletAdmin(args[1]);
        break;

      case 'admin-role':
        await script.getAdminRole(args[1]);
        break;

      case 'members':
        await script.getMembers(args[1]);
        break;

      case 'member-info':
        await script.getMember(args[1]);
        break;

      case 'member-transactions':
        await script.getMemberTransactions(args[1]);
        break;

      case 'active-members':
        await script.getActiveMembers(args[1]);
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