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

// Simulation configuration
const SIMULATION_CONFIG = {
  privateKey: process.env.PRIVATE_KEY!,
  network: process.env.STACKS_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET,
  networkName: process.env.STACKS_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet',
  
  // Parse contracts from .env
  walletContract: process.env.WALLET_CONTRACT!,
  tokenContract: process.env.CONTRACT_ADDRESS!,
  
  // Default values from .env
  defaultWalletName: process.env.DEFAULT_WALLET_NAME || 'My Company Wallet',
  defaultInitialFunding: process.env.DEFAULT_INITIAL_FUNDING || '1000000',
  defaultMemberName: process.env.DEFAULT_MEMBER_NAME || 'John Doe',
  defaultMemberAddress: process.env.DEFAULT_MEMBER_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  defaultMemberFunding: process.env.DEFAULT_MEMBER_FUNDING || '100000',
  defaultMemberId: process.env.DEFAULT_MEMBER_ID || '1',
  adminAddress: process.env.ADMIN_ADDRESS!,
  
  // Simulation settings
  transactionsPerCommand: 30,
  delayBetweenTx: 3000, // 3 seconds between transactions
  delayBetweenCommands: 10000, // 10 seconds between different commands
  
  // Transaction fee
  defaultTxFee: parseInt(process.env.DEFAULT_TX_FEE || '200000'),
};

class WalletXSimulation {
  private contractAddress: string;
  private contractName: string;
  private tokenContractAddress: string;
  private tokenContractName: string;

  constructor() {
    // Parse wallet contract
    if (SIMULATION_CONFIG.walletContract.includes('.')) {
      [this.contractAddress, this.contractName] = SIMULATION_CONFIG.walletContract.split('.');
    } else {
      throw new Error('WALLET_CONTRACT must be in format ADDRESS.CONTRACT_NAME');
    }
    
    // Parse token contract
    if (SIMULATION_CONFIG.tokenContract.includes('.')) {
      [this.tokenContractAddress, this.tokenContractName] = SIMULATION_CONFIG.tokenContract.split('.');
    } else {
      throw new Error('CONTRACT_ADDRESS must be in format ADDRESS.CONTRACT_NAME');
    }
  }

  private async callReadOnly(functionName: string, functionArgs: any[] = []) {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName,
        functionArgs,
        network: SIMULATION_CONFIG.network,
        senderAddress: this.contractAddress
      });

      return cvToJSON(result);
    } catch (error) {
      console.error(`❌ Error calling ${functionName}:`, error);
      throw error;
    }
  }

  private async broadcastContractCall(functionName: string, functionArgs: any[] = [], txNumber?: number) {
    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName,
        functionArgs,
        senderKey: SIMULATION_CONFIG.privateKey,
        network: SIMULATION_CONFIG.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: SIMULATION_CONFIG.defaultTxFee
      };

      const txLabel = txNumber ? ` (Tx ${txNumber})` : '';
      console.log(`⏳ Creating transaction for ${functionName}${txLabel}...`);
      const transaction = await makeContractCall(txOptions);
      
      console.log('📤 Broadcasting to network...');
      const broadcastResponse = await broadcastTransaction({ 
        transaction, 
        network: SIMULATION_CONFIG.network 
      });

      if ('error' in broadcastResponse) {
        console.error('❌ Transaction failed:', broadcastResponse.error);
        throw new Error(broadcastResponse.error);
      } else {
        console.log(`✅ Transaction broadcast successfully!${txLabel}`);
        console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
        console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${SIMULATION_CONFIG.networkName.toLowerCase()}`);
        return broadcastResponse.txid;
      }
    } catch (error) {
      console.error(`❌ Error executing ${functionName}:`, error);
      throw error;
    }
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulation functions for each command

  async simulateRegisterWallet(iterations: number) {
    console.log(`\n🏦 Starting Register Wallet Simulation (${iterations} transactions)`);
    console.log('================================================================\n');
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i <= iterations; i++) {
      try {
        // Generate unique wallet names for each attempt
        const walletName = `${SIMULATION_CONFIG.defaultWalletName} #${i}`;
        const fundAmount = SIMULATION_CONFIG.defaultInitialFunding;
        
        console.log(`📦 Transaction ${i}/${iterations}: Registering "${walletName}" with ${fundAmount} tokens`);
        
        const functionArgs = [
          stringUtf8CV(walletName),
          uintCV(fundAmount),
          contractPrincipalCV(this.tokenContractAddress, this.tokenContractName)
        ];

        await this.broadcastContractCall('register-wallet', functionArgs, i);
        successCount++;
        
        // Wait between transactions (except for the last one)
        if (i < iterations) {
          console.log(`⏳ Waiting ${SIMULATION_CONFIG.delayBetweenTx/1000}s before next transaction...\n`);
          await this.delay(SIMULATION_CONFIG.delayBetweenTx);
        }
        
      } catch (error) {
        console.error(`❌ Transaction ${i} failed:`, error instanceof Error ? error.message : String(error));
        failCount++;
        
        // Continue with next transaction after a short delay
        await this.delay(1000);
      }
    }

    console.log(`\n📊 Register Wallet Results:`);
    console.log(`✅ Successful: ${successCount}/${iterations}`);
    console.log(`❌ Failed: ${failCount}/${iterations}`);
    console.log(`📈 Success Rate: ${((successCount / iterations) * 100).toFixed(1)}%\n`);
  }

  async simulateWalletInfo(iterations: number) {
    console.log(`\n🔍 Starting Wallet Info Simulation (${iterations} queries)`);
    console.log('==========================================================\n');
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i <= iterations; i++) {
      try {
        console.log(`📦 Query ${i}/${iterations}: Fetching wallet info for ${SIMULATION_CONFIG.adminAddress}`);
        
        const walletInfo = await this.callReadOnly('get-wallet-admin', [
          standardPrincipalCV(SIMULATION_CONFIG.adminAddress)
        ]);

        if (walletInfo.value) {
          console.log(`✅ Query ${i} successful - Wallet found:`);
          console.log(`   Name: ${walletInfo.value['wallet-name'].value}`);
          console.log(`   Balance: ${walletInfo.value['wallet-balance'].value}`);
          console.log(`   Active: ${walletInfo.value.active.value}`);
        } else {
          console.log(`⚠️  Query ${i} - No wallet found for admin address`);
        }
        
        successCount++;
        
        // Wait between queries (except for the last one)
        if (i < iterations) {
          console.log(`⏳ Waiting ${SIMULATION_CONFIG.delayBetweenTx/1000}s before next query...\n`);
          await this.delay(SIMULATION_CONFIG.delayBetweenTx);
        }
        
      } catch (error) {
        console.error(`❌ Query ${i} failed:`, error instanceof Error ? error.message : String(error));
        failCount++;
        
        // Continue with next query after a short delay
        await this.delay(1000);
      }
    }

    console.log(`\n📊 Wallet Info Results:`);
    console.log(`✅ Successful: ${successCount}/${iterations}`);
    console.log(`❌ Failed: ${failCount}/${iterations}`);
    console.log(`📈 Success Rate: ${((successCount / iterations) * 100).toFixed(1)}%\n`);
  }

  async simulateOnboardMember(iterations: number) {
    console.log(`\n👤 Starting Onboard Member Simulation (${iterations} transactions)`);
    console.log('================================================================\n');
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i <= iterations; i++) {
      try {
        // Generate unique member details for each attempt
        const memberName = `${SIMULATION_CONFIG.defaultMemberName} #${i}`;
        const memberAddress = SIMULATION_CONFIG.defaultMemberAddress; // Using same address for simplicity
        const fundAmount = SIMULATION_CONFIG.defaultMemberFunding;
        const memberId = i.toString(); // Unique member ID
        
        console.log(`📦 Transaction ${i}/${iterations}: Onboarding "${memberName}" (ID: ${memberId}) with ${fundAmount} tokens`);
        
        const functionArgs = [
          standardPrincipalCV(memberAddress),
          stringUtf8CV(memberName),
          uintCV(fundAmount),
          uintCV(memberId)
        ];

        await this.broadcastContractCall('onboard-member', functionArgs, i);
        successCount++;
        
        // Wait between transactions (except for the last one)
        if (i < iterations) {
          console.log(`⏳ Waiting ${SIMULATION_CONFIG.delayBetweenTx/1000}s before next transaction...\n`);
          await this.delay(SIMULATION_CONFIG.delayBetweenTx);
        }
        
      } catch (error) {
        console.error(`❌ Transaction ${i} failed:`, error instanceof Error ? error.message : String(error));
        failCount++;
        
        // Continue with next transaction after a short delay
        await this.delay(1000);
      }
    }

    console.log(`\n📊 Onboard Member Results:`);
    console.log(`✅ Successful: ${successCount}/${iterations}`);
    console.log(`❌ Failed: ${failCount}/${iterations}`);
    console.log(`📈 Success Rate: ${((successCount / iterations) * 100).toFixed(1)}%\n`);
  }

  async simulateMemberInfo(iterations: number) {
    console.log(`\n👥 Starting Member Info Simulation (${iterations} queries)`);
    console.log('=========================================================\n');
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i <= iterations; i++) {
      try {
        console.log(`📦 Query ${i}/${iterations}: Fetching member info for ${SIMULATION_CONFIG.defaultMemberAddress}`);
        
        const memberInfo = await this.callReadOnly('get-member', [
          standardPrincipalCV(SIMULATION_CONFIG.defaultMemberAddress)
        ]);

        if (memberInfo.value) {
          console.log(`✅ Query ${i} successful - Member found:`);
          console.log(`   Name: ${memberInfo.value.name.value}`);
          console.log(`   Spend Limit: ${memberInfo.value['spend-limit'].value}`);
          console.log(`   Active: ${memberInfo.value.active.value}`);
          console.log(`   Frozen: ${memberInfo.value.frozen.value}`);
        } else {
          console.log(`⚠️  Query ${i} - No member found for address`);
        }
        
        successCount++;
        
        // Wait between queries (except for the last one)
        if (i < iterations) {
          console.log(`⏳ Waiting ${SIMULATION_CONFIG.delayBetweenTx/1000}s before next query...\n`);
          await this.delay(SIMULATION_CONFIG.delayBetweenTx);
        }
        
      } catch (error) {
        console.error(`❌ Query ${i} failed:`, error instanceof Error ? error.message : String(error));
        failCount++;
        
        // Continue with next query after a short delay
        await this.delay(1000);
      }
    }

    console.log(`\n📊 Member Info Results:`);
    console.log(`✅ Successful: ${successCount}/${iterations}`);
    console.log(`❌ Failed: ${failCount}/${iterations}`);
    console.log(`📈 Success Rate: ${((successCount / iterations) * 100).toFixed(1)}%\n`);
  }

  async runFullSimulation() {
    console.log('🚀 WalletX Contract Simulation');
    console.log('==============================\n');
    console.log(`📍 Network: ${SIMULATION_CONFIG.networkName}`);
    console.log(`📄 Wallet Contract: ${SIMULATION_CONFIG.walletContract}`);
    console.log(`🪙 Token Contract: ${SIMULATION_CONFIG.tokenContract}`);
    console.log(`🎯 Transactions per command: ${SIMULATION_CONFIG.transactionsPerCommand}`);
    console.log(`⏱️  Delay between transactions: ${SIMULATION_CONFIG.delayBetweenTx/1000}s`);
    console.log(`⏱️  Delay between commands: ${SIMULATION_CONFIG.delayBetweenCommands/1000}s\n`);

    const startTime = Date.now();
    let totalSuccess = 0;
    let totalFail = 0;

    try {
      // 1. Register Wallet Simulation
      console.log('🏦 Phase 1: Register Wallet Simulation');
      await this.simulateRegisterWallet(SIMULATION_CONFIG.transactionsPerCommand);
      await this.delay(SIMULATION_CONFIG.delayBetweenCommands);

      // 2. Wallet Info Simulation
      console.log('🔍 Phase 2: Wallet Info Simulation');
      await this.simulateWalletInfo(SIMULATION_CONFIG.transactionsPerCommand);
      await this.delay(SIMULATION_CONFIG.delayBetweenCommands);

      // 3. Onboard Member Simulation
      console.log('👤 Phase 3: Onboard Member Simulation');
      await this.simulateOnboardMember(SIMULATION_CONFIG.transactionsPerCommand);
      await this.delay(SIMULATION_CONFIG.delayBetweenCommands);

      // 4. Member Info Simulation
      console.log('👥 Phase 4: Member Info Simulation');
      await this.simulateMemberInfo(SIMULATION_CONFIG.transactionsPerCommand);

      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000;

      console.log('\n🎉 SIMULATION COMPLETE!');
      console.log('=======================');
      console.log(`⏱️  Total Time: ${totalTime.toFixed(1)} seconds`);
      console.log(`📊 Total Operations: ${SIMULATION_CONFIG.transactionsPerCommand * 4}`);
      console.log(`📈 Average Time per Operation: ${(totalTime / (SIMULATION_CONFIG.transactionsPerCommand * 4)).toFixed(2)}s`);
      console.log('\n📋 Summary:');
      console.log(`   • Register Wallet: ${SIMULATION_CONFIG.transactionsPerCommand} transactions`);
      console.log(`   • Wallet Info: ${SIMULATION_CONFIG.transactionsPerCommand} queries`);
      console.log(`   • Onboard Member: ${SIMULATION_CONFIG.transactionsPerCommand} transactions`);
      console.log(`   • Member Info: ${SIMULATION_CONFIG.transactionsPerCommand} queries`);

    } catch (error) {
      console.error('❌ Simulation failed:', error);
    }
  }

  async runSingleCommand(command: string) {
    console.log(`🚀 WalletX Single Command Simulation: ${command}`);
    console.log('===============================================\n');
    console.log(`📍 Network: ${SIMULATION_CONFIG.networkName}`);
    console.log(`📄 Wallet Contract: ${SIMULATION_CONFIG.walletContract}`);
    console.log(`🎯 Transactions: ${SIMULATION_CONFIG.transactionsPerCommand}\n`);

    switch (command.toLowerCase()) {
      case 'register-wallet':
        await this.simulateRegisterWallet(SIMULATION_CONFIG.transactionsPerCommand);
        break;
      case 'wallet-info':
        await this.simulateWalletInfo(SIMULATION_CONFIG.transactionsPerCommand);
        break;
      case 'onboard-member':
        await this.simulateOnboardMember(SIMULATION_CONFIG.transactionsPerCommand);
        break;
      case 'member-info':
        await this.simulateMemberInfo(SIMULATION_CONFIG.transactionsPerCommand);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Available commands: register-wallet, wallet-info, onboard-member, member-info');
        process.exit(1);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Validate configuration
  if (!SIMULATION_CONFIG.privateKey) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    process.exit(1);
  }
  
  if (!SIMULATION_CONFIG.walletContract) {
    console.error('❌ WALLET_CONTRACT not found in .env file');
    process.exit(1);
  }

  if (!SIMULATION_CONFIG.tokenContract) {
    console.error('❌ CONTRACT_ADDRESS not found in .env file');
    process.exit(1);
  }

  const simulation = new WalletXSimulation();

  if (args.length === 0) {
    // Run full simulation
    await simulation.runFullSimulation();
  } else {
    // Run single command simulation
    const command = args[0];
    await simulation.runSingleCommand(command);
  }
}

// Run the simulation
main().catch(console.error);