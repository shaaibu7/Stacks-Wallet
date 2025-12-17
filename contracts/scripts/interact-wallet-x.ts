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
import { loadTokenContractConfig, displayTokenContractInfo, getExplorerTxUrl } from './config';
import type { TokenContractConfig } from './config';

interface WalletXConfig extends TokenContractConfig {
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
  private config: WalletXConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): WalletXConfig {
    const baseConfig = loadTokenContractConfig('WALLET_CONTRACT', 'TOKEN_CONTRACT_ADDRESS', 'wallet-x', 'token-contract');

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
    const adminAddress = process.env.ADMIN_ADDRESS || baseConfig.contractAddress;

    return {
      ...baseConfig,
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

  private async broadcastContractCall(functionName: string, functionArgs: any[] = [], fee?: number) {
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
        console.error('❌ Transaction failed:', broadcastResponse.error);
        throw new Error(broadcastResponse.error);
      } else {
        console.log('✅ Transaction broadcast successfully!');
        console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
        console.log(`🔗 Explorer: ${getExplorerTxUrl(broadcastResponse.txid, this.config.networkEnv)}`);
        return broadcastResponse.txid;
      }
    } catch (error) {
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
      const functionArgs = [
        stringUtf8CV(name),
        uintCV(amount),
        contractPrincipalCV(this.config.tokenContractAddress, this.config.tokenContractName)
      ];

      await this.broadcastContractCall('register-wallet', functionArgs);
    } catch (error) {
      console.error('❌ Wallet registration failed');
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

      await this.broadcastContractCall('onboard-member', functionArgs);
    } catch (error) {
      console.error('❌ Member onboarding failed');
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
  reimburse-wallet [amount]                 - Add funds to admin wallet (uses .env default if no amount)
  reimburse-member [member-id] [amount]     - Add funds to member's spend limit (uses .env defaults if no args)
  remove-member [address]                   - Remove a member (uses .env default address if no arg)
  freeze-member [address]                   - Freeze a member (uses .env default address if no arg)
  unfreeze-member [address]                 - Unfreeze a member (uses .env default address if no arg)

Member Commands:
  withdraw [amount] [receiver]              - Withdraw funds (uses .env defaults if no args)

Query Commands:
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
  npm run interact-wallet wallet-info       - Check your wallet info
  npm run interact-wallet member-info       - Check default member info

Examples:
  tsx scripts/interact-wallet-x.ts register-wallet "My Company Wallet" 1000000
  tsx scripts/interact-wallet-x.ts onboard-member ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM "John Doe" 50000 1
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
  
  const script = new WalletXInteractionScript();
  
  if (args.length === 0) {
    script.displayHelp();
    return;
  }

  const command = args[0].toLowerCase();
  
  console.log('🏦 WalletX Contract Interaction\n');
  displayTokenContractInfo(script['config']);

  try {
    switch (command) {
      case 'register-wallet':
        await script.registerWallet(args[1], args[2]);
        break;

      case 'onboard-member':
        await script.onboardMember(args[1], args[2], args[3], args[4]);
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