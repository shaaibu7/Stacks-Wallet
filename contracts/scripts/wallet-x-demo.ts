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

// Demo configuration
const DEMO_CONFIG = (() => {
  const privateKey = process.env.PRIVATE_KEY;
  const networkEnv = process.env.STACKS_NETWORK || 'testnet';
  
  // Parse wallet contract from WALLET_CONTRACT env var (format: ADDRESS.CONTRACT_NAME)
  const walletContract = process.env.WALLET_CONTRACT;
  let contractAddress: string;
  let contractName: string;
  
  if (walletContract && walletContract.includes('.')) {
    [contractAddress, contractName] = walletContract.split('.');
  } else {
    throw new Error('WALLET_CONTRACT environment variable is required in format ADDRESS.CONTRACT_NAME');
  }
  
  // Parse token contract from CONTRACT_ADDRESS env var (format: ADDRESS.CONTRACT_NAME)
  const tokenContract = process.env.CONTRACT_ADDRESS;
  let tokenContractAddress: string;
  let tokenContractName: string;
  
  if (tokenContract && tokenContract.includes('.')) {
    [tokenContractAddress, tokenContractName] = tokenContract.split('.');
  } else {
    throw new Error('CONTRACT_ADDRESS environment variable is required in format ADDRESS.CONTRACT_NAME');
  }

  return {
    privateKey,
    network: networkEnv === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET,
    networkName: networkEnv === 'mainnet' ? 'Mainnet' : 'Testnet',
    contractAddress,
    contractName,
    tokenContractAddress,
    tokenContractName,
  
  // Demo data
  walletName: 'Demo Company Wallet',
  initialFunding: '1000000', // 1 token with 6 decimals
  memberName: 'Demo Employee',
  memberFunding: '100000', // 0.1 token
  memberIdentifier: '1',
  withdrawAmount: '50000', // 0.05 token
  delayBetweenSteps: 5000, // 5 seconds
};

class WalletXDemo {
  
  private async callReadOnly(functionName: string, functionArgs: any[] = []) {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: DEMO_CONFIG.contractAddress!,
        contractName: DEMO_CONFIG.contractName,
        functionName,
        functionArgs,
        network: DEMO_CONFIG.network,
        senderAddress: DEMO_CONFIG.contractAddress!
      });

      return cvToJSON(result);
    } catch (error) {
      console.error(`❌ Error calling ${functionName}:`, error);
      throw error;
    }
  }

  private async broadcastContractCall(functionName: string, functionArgs: any[] = [], fee: number = 200000) {
    try {
      const txOptions = {
        contractAddress: DEMO_CONFIG.contractAddress!,
        contractName: DEMO_CONFIG.contractName,
        functionName,
        functionArgs,
        senderKey: DEMO_CONFIG.privateKey!,
        network: DEMO_CONFIG.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee
      };

      console.log(`⏳ Creating transaction for ${functionName}...`);
      const transaction = await makeContractCall(txOptions);
      
      console.log('📤 Broadcasting to network...');
      const broadcastResponse = await broadcastTransaction({ 
        transaction, 
        network: DEMO_CONFIG.network 
      });

      if ('error' in broadcastResponse) {
        console.error('❌ Transaction failed:', broadcastResponse.error);
        throw new Error(broadcastResponse.error);
      } else {
        console.log('✅ Transaction broadcast successfully!');
        console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
        console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${DEMO_CONFIG.networkName.toLowerCase()}`);
        return broadcastResponse.txid;
      }
    } catch (error) {
      console.error(`❌ Error executing ${functionName}:`, error);
      throw error;
    }
  }

  private async delay(ms: number) {
    console.log(`⏳ Waiting ${ms/1000} seconds...\n`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runCompleteDemo() {
    console.log('🏦 WalletX Complete Demo');
    console.log('========================\n');
    console.log(`📍 Network: ${DEMO_CONFIG.networkName}`);
    console.log(`📄 Contract: ${DEMO_CONFIG.contractAddress}.${DEMO_CONFIG.contractName}`);
    console.log(`🪙 Token Contract: ${DEMO_CONFIG.tokenContractAddress}.${DEMO_CONFIG.tokenContractName}\n`);

    try {
      // Step 1: Register a wallet
      console.log('🏦 Step 1: Registering Admin Wallet');
      console.log('=====================================');
      await this.registerWallet();
      await this.delay(DEMO_CONFIG.delayBetweenSteps);

      // Step 2: Check wallet info
      console.log('📊 Step 2: Checking Wallet Information');
      console.log('======================================');
      await this.checkWalletInfo();
      await this.delay(DEMO_CONFIG.delayBetweenSteps);

      // Step 3: Onboard a member
      console.log('👤 Step 3: Onboarding a Member');
      console.log('===============================');
      await this.onboardMember();
      await this.delay(DEMO_CONFIG.delayBetweenSteps);

      // Step 4: Check member info
      console.log('👥 Step 4: Checking Member Information');
      console.log('======================================');
      await this.checkMemberInfo();
      await this.delay(DEMO_CONFIG.delayBetweenSteps);

      // Step 5: Member withdrawal (this would need to be done with member's private key)
      console.log('💸 Step 5: Member Withdrawal');
      console.log('============================');
      console.log('⚠️  Note: In a real scenario, this would be done by the member with their own private key');
      console.log('⚠️  For demo purposes, we\'ll simulate this with the admin key (which will fail)');
      await this.attemptMemberWithdrawal();
      await this.delay(DEMO_CONFIG.delayBetweenSteps);

      // Step 6: Reimburse member
      console.log('💰 Step 6: Reimbursing Member');
      console.log('=============================');
      await this.reimburseMember();
      await this.delay(DEMO_CONFIG.delayBetweenSteps);

      // Step 7: Freeze and unfreeze member
      console.log('🧊 Step 7: Freeze/Unfreeze Member');
      console.log('=================================');
      await this.freezeUnfreezeMember();
      await this.delay(DEMO_CONFIG.delayBetweenSteps);

      // Step 8: Final status check
      console.log('📈 Step 8: Final Status Check');
      console.log('=============================');
      await this.finalStatusCheck();

      console.log('🎉 Demo completed successfully!');
      console.log('\n📝 Summary:');
      console.log('- Registered an admin wallet');
      console.log('- Onboarded a member');
      console.log('- Demonstrated member management functions');
      console.log('- Showed read-only query functions');

    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  private async registerWallet() {
    try {
      const functionArgs = [
        stringUtf8CV(DEMO_CONFIG.walletName),
        uintCV(DEMO_CONFIG.initialFunding),
        contractPrincipalCV(DEMO_CONFIG.tokenContractAddress!, DEMO_CONFIG.tokenContractName)
      ];

      console.log(`🏦 Registering wallet "${DEMO_CONFIG.walletName}" with ${DEMO_CONFIG.initialFunding} tokens...`);
      await this.broadcastContractCall('register-wallet', functionArgs);
    } catch (error) {
      console.error('❌ Wallet registration failed:', error);
    }
  }

  private async checkWalletInfo() {
    try {
      console.log(`🔍 Checking wallet info for admin: ${DEMO_CONFIG.contractAddress}`);
      const walletInfo = await this.callReadOnly('get-wallet-admin', [
        standardPrincipalCV(DEMO_CONFIG.contractAddress!)
      ]);

      if (walletInfo.value) {
        console.log('✅ Wallet found:');
        console.log(`   Name: ${walletInfo.value['wallet-name'].value}`);
        console.log(`   Balance: ${walletInfo.value['wallet-balance'].value}`);
        console.log(`   Active: ${walletInfo.value.active.value}`);
        console.log(`   Wallet ID: ${walletInfo.value['wallet-id'].value}`);
      } else {
        console.log('❌ No wallet found');
      }
    } catch (error) {
      console.error('❌ Failed to check wallet info:', error);
    }
  }

  private async onboardMember() {
    try {
      const memberAddress = DEMO_CONFIG.contractAddress!; // Using same address for demo
      const functionArgs = [
        standardPrincipalCV(memberAddress),
        stringUtf8CV(DEMO_CONFIG.memberName),
        uintCV(DEMO_CONFIG.memberFunding),
        uintCV(DEMO_CONFIG.memberIdentifier)
      ];

      console.log(`👤 Onboarding member "${DEMO_CONFIG.memberName}" with ${DEMO_CONFIG.memberFunding} tokens...`);
      await this.broadcastContractCall('onboard-member', functionArgs);
    } catch (error) {
      console.error('❌ Member onboarding failed:', error);
    }
  }

  private async checkMemberInfo() {
    try {
      const memberAddress = DEMO_CONFIG.contractAddress!;
      console.log(`🔍 Checking member info for: ${memberAddress}`);
      
      const memberInfo = await this.callReadOnly('get-member', [
        standardPrincipalCV(memberAddress)
      ]);

      if (memberInfo.value) {
        console.log('✅ Member found:');
        console.log(`   Name: ${memberInfo.value.name.value}`);
        console.log(`   Spend Limit: ${memberInfo.value['spend-limit'].value}`);
        console.log(`   Active: ${memberInfo.value.active.value}`);
        console.log(`   Frozen: ${memberInfo.value.frozen.value}`);
        console.log(`   Organization: ${memberInfo.value['organization-name'].value}`);
      } else {
        console.log('❌ No member found');
      }

      // Also check organization members
      const members = await this.callReadOnly('get-members', [
        standardPrincipalCV(DEMO_CONFIG.contractAddress!)
      ]);

      if (members.value && members.value.length > 0) {
        console.log('👥 Organization members:');
        members.value.forEach((member: any, index: number) => {
          console.log(`   ${index + 1}. ${member.value}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to check member info:', error);
    }
  }

  private async attemptMemberWithdrawal() {
    try {
      const receiverAddress = 'ST000000000000000000002AMW42H'; // Testnet burn address
      const functionArgs = [
        uintCV(DEMO_CONFIG.withdrawAmount),
        standardPrincipalCV(receiverAddress),
        contractPrincipalCV(DEMO_CONFIG.tokenContractAddress!, DEMO_CONFIG.tokenContractName)
      ];

      console.log(`💸 Attempting member withdrawal of ${DEMO_CONFIG.withdrawAmount} tokens to ${receiverAddress}...`);
      console.log('⚠️  This will likely fail because we\'re using admin key instead of member key');
      await this.broadcastContractCall('member-withdrawal', functionArgs);
    } catch (error) {
      console.log('❌ Member withdrawal failed as expected (using wrong private key)');
      console.log('💡 In a real scenario, the member would use their own private key');
    }
  }

  private async reimburseMember() {
    try {
      const functionArgs = [
        uintCV(DEMO_CONFIG.memberIdentifier),
        uintCV('25000') // Add 0.025 tokens to member's spend limit
      ];

      console.log(`💰 Reimbursing member ${DEMO_CONFIG.memberIdentifier} with 25000 tokens...`);
      await this.broadcastContractCall('reimburse-member', functionArgs);
    } catch (error) {
      console.error('❌ Member reimbursement failed:', error);
    }
  }

  private async freezeUnfreezeMember() {
    try {
      const memberAddress = DEMO_CONFIG.contractAddress!;
      
      // Freeze member
      console.log(`🧊 Freezing member: ${memberAddress}`);
      await this.broadcastContractCall('freeze-member', [
        standardPrincipalCV(memberAddress)
      ]);

      await this.delay(2000); // Short delay

      // Check member status
      const memberInfo = await this.callReadOnly('get-member', [
        standardPrincipalCV(memberAddress)
      ]);
      
      if (memberInfo.value) {
        console.log(`❄️  Member frozen status: ${memberInfo.value.frozen.value}`);
      }

      await this.delay(2000); // Short delay

      // Unfreeze member
      console.log(`🔥 Unfreezing member: ${memberAddress}`);
      await this.broadcastContractCall('unfreeze-member', [
        standardPrincipalCV(memberAddress)
      ]);

    } catch (error) {
      console.error('❌ Freeze/unfreeze operations failed:', error);
    }
  }

  private async finalStatusCheck() {
    try {
      console.log('📊 Final wallet and member status:');
      
      // Check wallet status
      const walletInfo = await this.callReadOnly('get-wallet-admin', [
        standardPrincipalCV(DEMO_CONFIG.contractAddress!)
      ]);

      if (walletInfo.value) {
        console.log(`🏦 Final wallet balance: ${walletInfo.value['wallet-balance'].value}`);
      }

      // Check member status
      const memberInfo = await this.callReadOnly('get-member', [
        standardPrincipalCV(DEMO_CONFIG.contractAddress!)
      ]);

      if (memberInfo.value) {
        console.log(`👤 Final member spend limit: ${memberInfo.value['spend-limit'].value}`);
        console.log(`👤 Member frozen status: ${memberInfo.value.frozen.value}`);
      }

      // Check active members
      const activeMembers = await this.callReadOnly('get-active-members', [
        standardPrincipalCV(DEMO_CONFIG.contractAddress!)
      ]);

      if (activeMembers.value) {
        console.log(`✅ Active members count: ${activeMembers.value.length}`);
      }

    } catch (error) {
      console.error('❌ Failed to check final status:', error);
    }
  }
}

async function main() {
  console.log('🏦 WalletX Demo Script');
  console.log('======================\n');
  
  // Validate configuration
  if (!DEMO_CONFIG.privateKey) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    process.exit(1);
  }
  
  if (!process.env.WALLET_CONTRACT) {
    console.error('❌ WALLET_CONTRACT not found in .env file');
    console.error('   Format: ADDRESS.CONTRACT_NAME (e.g., ST1ABC...XYZ.wallet-x-123456789)');
    process.exit(1);
  }

  if (!process.env.CONTRACT_ADDRESS) {
    console.error('❌ CONTRACT_ADDRESS not found in .env file');
    console.error('   Format: ADDRESS.CONTRACT_NAME (e.g., ST1ABC...XYZ.token-contract-123456789)');
    process.exit(1);
  }

  const demo = new WalletXDemo();
  await demo.runCompleteDemo();
}

// Run the demo
main().catch(console.error);