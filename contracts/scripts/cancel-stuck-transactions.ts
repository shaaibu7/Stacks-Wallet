#!/usr/bin/env tsx

import { 
    makeContractCall,
    broadcastTransaction,
    getAddressFromPrivateKey,
    AnchorMode,
    PostConditionMode,
    uintCV,
    principalCV,
    boolCV
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'testnet';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS;

if (!PRIVATE_KEY) {
    console.error("❌ Error: PRIVATE_KEY environment variable is required.");
    process.exit(1);
}

if (!CONTRACT_ADDRESS) {
    console.error("❌ Error: CONTRACT_ADDRESS environment variable is required.");
    process.exit(1);
}

if (!ADMIN_ADDRESS) {
    console.error("❌ Error: ADMIN_ADDRESS environment variable is required.");
    process.exit(1);
}

async function cancelStuckTransactions() {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const senderAddress = getAddressFromPrivateKey(PRIVATE_KEY);
    
    console.log(`🚀 Replacing stuck mint transactions...`);
    console.log(`📍 Network: ${NETWORK_ENV === 'mainnet' ? 'Mainnet' : 'Testnet'}`);
    console.log(`📧 Address: ${senderAddress}`);

    // Based on your pending transactions, we know nonces 28-47 are stuck
    // Let's start with the earliest ones
    const stuckNonces = [28, 29, 30, 31, 32]; // Start with first 5
    const newFeeRate = 400000; // 0.4 STX - higher than the original 0.2 STX

    console.log(`\n💰 Using fee rate: ${newFeeRate} microSTX (${newFeeRate / 1000000} STX)`);
    console.log(`🎯 Targeting nonces: ${stuckNonces.join(', ')}`);

    let successCount = 0;
    
    // Parse contract address and name
    const [contractAddress, contractName] = CONTRACT_ADDRESS.split('.');
    
    for (const nonce of stuckNonces) {
        console.log(`\n🔄 Replacing mint transaction with nonce ${nonce}...`);
        
        try {
            // Use set-approval-for-all which is a simple public function
            const txOptions = {
                contractAddress,
                contractName,
                functionName: 'set-approval-for-all',
                functionArgs: [
                    principalCV(ADMIN_ADDRESS), // operator: set approval for admin address
                    boolCV(true)                // approved: true
                ],
                senderKey: PRIVATE_KEY,
                network,
                anchorMode: AnchorMode.Any,
                postConditionMode: PostConditionMode.Allow,
                fee: newFeeRate,
                nonce: nonce
            };

            console.log(`   📤 Creating approval call (set-approval-for-all)...`);
            const transaction = await makeContractCall(txOptions);
            
            console.log(`   📡 Broadcasting transaction...`);
            const broadcastResponse = await broadcastTransaction({ transaction, network });
            
            if ('error' in broadcastResponse) {
                console.error(`   ❌ Failed: ${broadcastResponse.error}`);
                if (broadcastResponse.reason) {
                    console.error(`   📝 Reason: ${broadcastResponse.reason}`);
                }
            } else {
                console.log(`   ✅ Success! TX ID: ${broadcastResponse.txid}`);
                console.log(`   🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}`);
                successCount++;
            }
        } catch (error) {
            console.error(`   ❌ Error for nonce ${nonce}:`, error);
        }
        
        // Wait between transactions to avoid rate limiting
        if (nonce !== stuckNonces[stuckNonces.length - 1]) {
            console.log(`   ⏳ Waiting 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully replaced: ${successCount}/${stuckNonces.length} transactions`);
    console.log(`   💰 Total cost: ${(newFeeRate * successCount) / 1000000} STX`);
    
    if (successCount > 0) {
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Wait 10-15 minutes for confirmations`);
        console.log(`   2. Run 'npm run check-pending' to see remaining stuck transactions`);
        console.log(`   3. Run this script again with higher nonces if needed`);
        console.log(`   4. You can modify the 'stuckNonces' array in the script for other nonces`);
        
        console.log(`\n⚠️  Note: These replacement transactions are read-only calls.`);
        console.log(`   They will replace the stuck mint transactions without actually minting tokens.`);
    }
}

// Add command line help
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔄 Cancel Stuck Mint Transactions Script

This script replaces stuck mint transactions with new mint calls using higher fees.
The replacement transactions will actually mint tokens to your admin address.

Usage: npm run cancel-stuck-txs

The script is currently configured to replace nonces 28-32.
Edit the 'stuckNonces' array in the script to target different nonces.

Examples:
  npm run cancel-stuck-txs                    # Replace nonces 28-32
  npm run cancel-stuck-txs -- --help         # Show this help
`);
    process.exit(0);
}

cancelStuckTransactions();