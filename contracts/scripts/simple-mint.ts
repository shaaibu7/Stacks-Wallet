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
const NETWORK_ENV = process.env.STACKS_NETWORK || 'mainnet';
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

async function mintTokens(amount: number, recipient: string) {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const senderAddress = getAddressFromPrivateKey(privateKey);
    
    console.log(`🪙 Minting ${amount / 1000000} CC tokens to ${recipient}`);
    console.log(`📍 Network: ${NETWORK_ENV}`);
    console.log(`📄 Contract: ${contractAddress}`);
    console.log(`📧 Sender: ${senderAddress}`);
    
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
        console.log(`\n⏳ Creating mint transaction...`);
        const transaction = await makeContractCall(txOptions);
        
        console.log(`📤 Broadcasting to ${NETWORK_ENV}...`);
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        if ('error' in broadcastResponse) {
            console.error(`❌ Mint failed: ${broadcastResponse.error}`);
            if (broadcastResponse.reason) {
                console.error(`📝 Reason: ${broadcastResponse.reason}`);
            }
            return false;
        } else {
            console.log(`✅ Mint successful!`);
            console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
            console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}`);
            console.log(`\n💡 Wait ~10 minutes for confirmation, then check balance.`);
            return true;
        }
    } catch (error) {
        console.error(`❌ Error minting tokens:`, error);
        return false;
    }
}

// Main execution
async function main() {
    console.log(`🚀 Batch Token Mint Script - 10 Transactions`);
    console.log(`=============================================\n`);
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`Usage: npm run simple-mint [amount] [recipient] [--interval=seconds]
        
Examples:
  npm run simple-mint                           # Mint 1 CC x10 to your address (3s intervals)
  npm run simple-mint 5000000                  # Mint 5 CC x10 to your address (3s intervals)
  npm run simple-mint 2000000 SP1ABC...        # Mint 2 CC x10 to specific address
  npm run simple-mint 1000000 SP1ABC... --interval=5  # Mint 1 CC x10 with 5s intervals
  
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
    const recipient = args[1] || getAddressFromPrivateKey(privateKey); // Default: your address
    
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
    console.log(`   Amount per mint: ${amount} micro-tokens (${amount / 1000000} CC)`);
    console.log(`   Total mints: 10`);
    console.log(`   Total tokens: ${(amount * 10) / 1000000} CC`);
    console.log(`   Recipient: ${recipient}`);
    console.log(`   Interval: ${interval} seconds`);
    console.log(`   Fee per tx: 0.3 STX`);
    console.log(`   Total fees: 3.0 STX\n`);
    
    // Execute batch mints
    let successCount = 0;
    
    for (let i = 1; i <= 10; i++) {
        console.log(`🔄 Mint ${i}/10:`);
        
        const success = await mintTokens(amount, recipient);
        
        if (success) {
            successCount++;
        }
        
        // Wait between transactions (except after the last one)
        if (i < 10) {
            console.log(`⏳ Waiting ${interval} seconds before next mint...\n`);
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
        }
    }
    
    // Summary
    console.log(`\n📊 Batch Mint Summary:`);
    console.log(`   ✅ Successful mints: ${successCount}/10`);
    console.log(`   💰 Total cost: ${successCount * 0.3} STX`);
    console.log(`   🪙 Total tokens minted: ${(successCount * amount) / 1000000} CC`);
    
    if (successCount > 0) {
        console.log(`\n🎉 Batch mint completed!`);
        console.log(`\n📋 Next steps:`);
        console.log(`   1. Wait for transaction confirmations (~10 minutes each)`);
        console.log(`   2. Check balance: npm run check-balance`);
        console.log(`   3. Monitor transactions on Stacks Explorer`);
        
        if (successCount < 10) {
            console.log(`\n⚠️  ${10 - successCount} transactions failed. You can run the script again.`);
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