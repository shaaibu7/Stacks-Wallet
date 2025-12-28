#!/usr/bin/env tsx

import { 
    makeContractCall,
    broadcastTransaction,
    getAddressFromPrivateKey,
    AnchorMode,
    PostConditionMode,
    uintCV,
    principalCV
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'testnet';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error("❌ Missing required environment variables:");
    console.error("   - PRIVATE_KEY");
    console.error("   - CONTRACT_ADDRESS");
    process.exit(1);
}

// TypeScript assertions - we know these are defined due to the checks above
const privateKey: string = PRIVATE_KEY;
const contractAddress: string = CONTRACT_ADDRESS;

const [contractAddr, contractName] = contractAddress.split('.');

async function mintTokens(amount: number, recipient: string, mintNumber: number) {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const senderAddress = getAddressFromPrivateKey(privateKey);
    
    console.log(`🪙 Mint #${mintNumber}: Minting ${amount / 1000000} CC tokens to ${recipient}`);
    
    const txOptions = {
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'mint',
        functionArgs: [
            uintCV(amount),           // amount: in micro-tokens (1,000,000 = 1 CC)
            principalCV(recipient)    // recipient: address to receive tokens
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 300000, // 0.3 STX fee
    };

    try {
        console.log(`⏳ Creating mint transaction #${mintNumber}...`);
        const transaction = await makeContractCall(txOptions);
        
        console.log(`📤 Broadcasting to ${NETWORK_ENV}...`);
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        if ('error' in broadcastResponse) {
            console.error(`❌ Mint #${mintNumber} failed: ${broadcastResponse.error}`);
            if (broadcastResponse.reason) {
                console.error(`📝 Reason: ${broadcastResponse.reason}`);
            }
            return { success: false, txid: null, error: broadcastResponse.error };
        } else {
            console.log(`✅ Mint #${mintNumber} successful!`);
            console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
            console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}\n`);
            return { success: true, txid: broadcastResponse.txid, error: null };
        }
    } catch (error) {
        console.error(`❌ Error in mint #${mintNumber}:`, error);
        return { success: false, txid: null, error: error };
    }
}

// Main execution
async function main() {
    console.log(`🚀 Batch Token Mint Script - 30 Transactions`);
    console.log(`=============================================\n`);
    
    const senderAddress = getAddressFromPrivateKey(privateKey);
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`Usage: npm run mint-30 [amount] [recipient] [--interval=seconds]
        
Examples:
  npm run mint-30                           # Mint 1 CC x30 to your address (3s intervals)
  npm run mint-30 5000000                  # Mint 5 CC x30 to your address (3s intervals)
  npm run mint-30 2000000 ST1ABC...        # Mint 2 CC x30 to specific address
  npm run mint-30 1000000 ST1ABC... --interval=5  # Mint 1 CC x30 with 5s intervals
  
Arguments:
  amount     - Amount in micro-tokens per mint (1,000,000 = 1 CC token)
  recipient  - Recipient address (defaults to your address)
  
Options:
  --interval=N - Seconds between transactions (default: 3)
  --help, -h   - Show this help message`);
        return;
    }
    
    // Parse arguments
    const amount = args[0] ? parseInt(args[0]) : 1000000; // Default: 1 CC token
    const recipient = args[1] || senderAddress; // Default: your address
    
    // Parse interval
    let interval = 3; // Default: 3 seconds
    const intervalArg = args.find(arg => arg.startsWith('--interval='));
    if (intervalArg) {
        interval = parseInt(intervalArg.split('=')[1]) || 3;
    }
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
        console.error("❌ Invalid amount. Must be a positive number.");
        console.error("💡 Example: 1000000 = 1 CC token");
        return;
    }
    
    // Validate recipient
    if (!recipient.startsWith('SP') && !recipient.startsWith('ST')) {
        console.error("❌ Invalid recipient address format.");
        console.error("💡 Address should start with SP (mainnet) or ST (testnet)");
        return;
    }
    
    console.log(`📊 Batch Mint Details:`);
    console.log(`   Network: ${NETWORK_ENV}`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Sender: ${senderAddress}`);
    console.log(`   Amount per mint: ${amount} micro-tokens (${amount / 1000000} CC)`);
    console.log(`   Total mints: 30`);
    console.log(`   Total tokens: ${(amount * 30) / 1000000} CC`);
    console.log(`   Recipient: ${recipient}`);
    console.log(`   Interval: ${interval} seconds`);
    console.log(`   Fee per tx: 0.3 STX`);
    console.log(`   Total fees: 9.0 STX\n`);
    
    // Execute batch mints
    let successCount = 0;
    let failedCount = 0;
    const results: Array<{mintNumber: number, success: boolean, txid: string | null, error: any}> = [];
    
    for (let i = 1; i <= 30; i++) {
        console.log(`🔄 Mint ${i}/30:`);
        
        const result = await mintTokens(amount, recipient, i);
        
        results.push({
            mintNumber: i,
            success: result.success,
            txid: result.txid,
            error: result.error
        });
        
        if (result.success) {
            successCount++;
        } else {
            failedCount++;
        }
        
        // Wait between transactions (except after the last one)
        if (i < 30) {
            console.log(`⏳ Waiting ${interval} seconds before next mint...\n`);
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
        }
    }
    
    // Summary
    console.log(`\n📊 Batch Mint Summary:`);
    console.log(`   ✅ Successful mints: ${successCount}/30`);
    console.log(`   ❌ Failed mints: ${failedCount}/30`);
    console.log(`   💰 Total cost: ${successCount * 0.3} STX`);
    console.log(`   🪙 Total tokens minted: ${(successCount * amount) / 1000000} CC`);
    
    if (successCount > 0) {
        console.log(`\n🎉 Batch mint completed!`);
        
        // Show successful transaction IDs
        const successfulTxs = results.filter(r => r.success);
        if (successfulTxs.length > 0) {
            console.log(`\n📋 Successful Transaction IDs:`);
            successfulTxs.forEach(tx => {
                console.log(`   Mint #${tx.mintNumber}: ${tx.txid}`);
            });
        }
        
        console.log(`\n📋 Next steps:`);
        console.log(`   1. Wait for transaction confirmations (~10 minutes each)`);
        console.log(`   2. Check balance using get-balance function`);
        console.log(`   3. Monitor transactions on Stacks Explorer`);
        
        if (failedCount > 0) {
            console.log(`\n⚠️  ${failedCount} transactions failed. Check the error messages above.`);
            
            // Show failed transactions
            const failedTxs = results.filter(r => !r.success);
            if (failedTxs.length > 0) {
                console.log(`\n❌ Failed Transactions:`);
                failedTxs.forEach(tx => {
                    console.log(`   Mint #${tx.mintNumber}: ${tx.error}`);
                });
            }
        }
    } else {
        console.log(`\n❌ All mints failed. Check the error messages above.`);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});