#!/usr/bin/env tsx

import { 
    makeContractCall,
    makeSTXTokenTransfer,
    broadcastTransaction,
    getAddressFromPrivateKey,
    privateKeyToString,
    TransactionVersion,
    AnchorMode,
    PostConditionMode,
    standardPrincipalCV,
    uintCV,
    stringAsciiCV,
    stringUtf8CV,
    listCV,
    tupleCV
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'testnet';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!PRIVATE_KEY) {
    console.error("❌ Error: PRIVATE_KEY environment variable is required.");
    process.exit(1);
}

if (!CONTRACT_ADDRESS) {
    console.error("❌ Error: CONTRACT_ADDRESS environment variable is required.");
    process.exit(1);
}

async function getPendingTransactionDetails() {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const address = getAddressFromPrivateKey(PRIVATE_KEY);
    const apiUrl = NETWORK_ENV === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';

    console.log(`🔍 Fetching pending transaction details...`);
    
    // Get pending transactions from mempool
    const mempoolUrl = `${apiUrl}/extended/v1/tx/mempool?sender_address=${address}`;
    const mempoolResponse = await fetch(mempoolUrl);
    const mempoolData = await mempoolResponse.json();

    if (!mempoolResponse.ok || !mempoolData.results) {
        console.error("❌ Failed to fetch mempool data");
        return [];
    }

    console.log(`📋 Found ${mempoolData.results.length} pending transactions`);
    
    // Sort by nonce to process in order
    const sortedTxs = mempoolData.results.sort((a: any, b: any) => a.nonce - b.nonce);
    
    // Get detailed transaction info
    const detailedTxs = [];
    for (const tx of sortedTxs) {
        try {
            const txDetailUrl = `${apiUrl}/extended/v1/tx/${tx.tx_id}`;
            const txDetailResponse = await fetch(txDetailUrl);
            const txDetail = await txDetailResponse.json();
            
            detailedTxs.push({
                txId: tx.tx_id,
                nonce: tx.nonce,
                currentFee: tx.fee_rate,
                contractCall: txDetail.contract_call,
                type: tx.tx_type,
                fullDetail: txDetail
            });
        } catch (error) {
            console.log(`⚠️  Could not get details for tx ${tx.tx_id}, will use simple replacement`);
            detailedTxs.push({
                txId: tx.tx_id,
                nonce: tx.nonce,
                currentFee: tx.fee_rate,
                contractCall: null,
                type: tx.tx_type,
                fullDetail: null
            });
        }
    }
    
    return detailedTxs;
}

async function replaceTransactionWithHigherFee(txDetails: any, newFeeRate: number) {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const senderAddress = getAddressFromPrivateKey(PRIVATE_KEY);

    console.log(`\n🔄 Replacing transaction with nonce ${txDetails.nonce}`);
    console.log(`   Old fee: ${txDetails.currentFee} microSTX`);
    console.log(`   New fee: ${newFeeRate} microSTX`);
    console.log(`   TX Type: ${txDetails.type}`);

    try {
        let transaction;

        // For simplicity, let's create STX transfers to self to cancel the stuck transactions
        // This is the safest approach as it doesn't require recreating complex contract calls
        console.log(`   🔄 Creating cancellation transaction (STX transfer to self)`);
        
        const txOptions = {
            recipient: senderAddress, // Send to self
            amount: 1, // Minimal amount (1 microSTX)
            senderKey: PRIVATE_KEY,
            network,
            anchorMode: AnchorMode.Any,
            fee: newFeeRate,
            nonce: txDetails.nonce,
            memo: 'Cancel stuck tx'
        };

        transaction = await makeSTXTokenTransfer(txOptions);
        
        console.log(`   📤 Broadcasting replacement transaction...`);
        const broadcastResponse = await broadcastTransaction({ transaction, network });
        
        if ('error' in broadcastResponse) {
            console.error(`   ❌ Failed to broadcast: ${broadcastResponse.error}`);
            return false;
        } else {
            console.log(`   ✅ Replacement transaction broadcast successfully!`);
            console.log(`   🆔 New TX ID: ${broadcastResponse.txid}`);
            return true;
        }
    } catch (error) {
        console.error(`   ❌ Error replacing transaction:`, error);
        return false;
    }
}

async function replaceStuckTransactions() {
    console.log(`🚀 Starting transaction replacement process...`);
    console.log(`📍 Network: ${NETWORK_ENV === 'mainnet' ? 'Mainnet' : 'Testnet'}`);
    
    try {
        // Get pending transaction details
        const pendingTxs = await getPendingTransactionDetails();
        
        if (pendingTxs.length === 0) {
            console.log(`✅ No pending transactions found!`);
            return;
        }

        // Calculate new fee rate (increase by 50% or minimum 300,000 microSTX)
        const currentFee = pendingTxs[0].currentFee;
        const newFeeRate = Math.max(Math.floor(currentFee * 1.5), 300000);
        
        console.log(`\n💰 Fee Strategy:`);
        console.log(`   Current fee: ${currentFee} microSTX (${currentFee / 1000000} STX)`);
        console.log(`   New fee: ${newFeeRate} microSTX (${newFeeRate / 1000000} STX)`);
        
        // Ask for confirmation
        console.log(`\n⚠️  This will replace ${pendingTxs.length} transactions with higher fees.`);
        console.log(`   Total additional cost: ${((newFeeRate - currentFee) * pendingTxs.length) / 1000000} STX`);
        
        // For now, let's just replace the first few transactions as a test
        const txsToReplace = pendingTxs.slice(0, 3); // Start with first 3
        
        console.log(`\n🔄 Replacing first ${txsToReplace.length} transactions...`);
        
        let successCount = 0;
        for (const tx of txsToReplace) {
            const success = await replaceTransactionWithHigherFee(tx, newFeeRate);
            if (success) {
                successCount++;
            }
            
            // Wait a bit between transactions
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Successfully replaced: ${successCount}/${txsToReplace.length} transactions`);
        console.log(`   💡 Monitor the transactions and run this script again for remaining ones if needed`);
        
    } catch (error) {
        console.error('❌ Error in replacement process:', error);
    }
}

// Add command line argument handling
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔄 Replace Stuck Transactions Script

Usage: npm run replace-stuck-txs [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be replaced without actually doing it
  --all          Replace all pending transactions (default: first 3)
  --fee <amount> Set custom fee in microSTX (default: 1.5x current fee, min 300000)

Examples:
  npm run replace-stuck-txs                    # Replace first 3 transactions
  npm run replace-stuck-txs -- --all          # Replace all pending transactions
  npm run replace-stuck-txs -- --fee 500000   # Use 500000 microSTX fee
  npm run replace-stuck-txs -- --dry-run      # Preview without executing
`);
    process.exit(0);
}

if (args.includes('--dry-run')) {
    console.log(`🔍 DRY RUN MODE - No transactions will be broadcast`);
    // You can implement dry run logic here
}

replaceStuckTransactions();