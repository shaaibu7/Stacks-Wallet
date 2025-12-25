#!/usr/bin/env tsx

import { getAddressFromPrivateKey } from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'testnet';

if (!PRIVATE_KEY) {
    console.error("❌ Error: PRIVATE_KEY environment variable is required.");
    process.exit(1);
}

async function checkPendingTransactions() {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const networkName = NETWORK_ENV === 'mainnet' ? 'Mainnet' : 'Testnet';
    
    // Get address from private key
    const address = getAddressFromPrivateKey(PRIVATE_KEY);

    console.log(`🔍 Checking Pending Transactions`);
    console.log(`📍 Network: ${networkName}`);
    console.log(`📧 Address: ${address}`);

    try {
        const apiUrl = NETWORK_ENV === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';
        
        // Get nonce information
        const nonceUrl = `${apiUrl}/extended/v1/address/${address}/nonces`;
        const nonceResponse = await fetch(nonceUrl);
        const nonceData = await nonceResponse.json();
        
        if (!nonceResponse.ok) {
            console.error(`❌ Failed to fetch nonce:`, nonceData);
            return;
        }

        const currentNonce = nonceData.possible_next_nonce;
        const lastExecutedNonce = nonceData.last_executed_tx_nonce || -1;
        
        console.log(`\n📊 Nonce Status:`);
        console.log(`   Current Nonce: ${currentNonce}`);
        console.log(`   Last Executed: ${lastExecutedNonce}`);
        
        const pendingCount = currentNonce - lastExecutedNonce - 1;
        console.log(`   Potential Pending: ${pendingCount}`);

        // Check for pending transactions in mempool
        const mempoolUrl = `${apiUrl}/extended/v1/tx/mempool?sender_address=${address}`;
        console.log(`\n🔄 Checking mempool: ${mempoolUrl}`);
        
        const mempoolResponse = await fetch(mempoolUrl);
        const mempoolData = await mempoolResponse.json();
        
        if (mempoolResponse.ok && mempoolData.results) {
            console.log(`\n⏳ Pending Transactions in Mempool (${mempoolData.results.length}):`);
            
            if (mempoolData.results.length === 0) {
                console.log(`   ✅ No pending transactions in mempool`);
            } else {
                mempoolData.results.forEach((tx: any, index: number) => {
                    console.log(`   ${index + 1}. ${tx.tx_id}`);
                    console.log(`      Type: ${tx.tx_type}`);
                    console.log(`      Nonce: ${tx.nonce}`);
                    console.log(`      Fee: ${tx.fee_rate} microSTX`);
                    console.log(`      Status: ${tx.tx_status}`);
                    if (tx.receipt_time_iso) {
                        console.log(`      Submitted: ${tx.receipt_time_iso}`);
                    }
                    console.log('');
                });
            }
        } else {
            console.log(`ℹ️  Could not fetch mempool data`);
        }

        // Check recent transactions with more details
        const txUrl = `${apiUrl}/extended/v1/address/${address}/transactions?limit=20`;
        console.log(`📋 Checking recent transactions for status...`);
        
        const txResponse = await fetch(txUrl);
        const txData = await txResponse.json();
        
        if (txResponse.ok && txData.results) {
            const pendingTxs = txData.results.filter((tx: any) => 
                tx.tx_status === 'pending' || tx.tx_status === 'abort_by_response'
            );
            
            if (pendingTxs.length > 0) {
                console.log(`\n⚠️  Found ${pendingTxs.length} pending/failed transactions:`);
                pendingTxs.forEach((tx: any, index: number) => {
                    console.log(`   ${index + 1}. ${tx.tx_id}`);
                    console.log(`      Status: ${tx.tx_status}`);
                    console.log(`      Type: ${tx.tx_type}`);
                    console.log(`      Nonce: ${tx.nonce}`);
                    if (tx.burn_block_time_iso) {
                        console.log(`      Time: ${tx.burn_block_time_iso}`);
                    }
                    console.log('');
                });
            } else {
                console.log(`\n✅ No pending transactions found in recent history`);
            }
        }

        // Summary
        console.log(`\n📝 Summary:`);
        if (pendingCount > 0) {
            console.log(`   ⚠️  There may be ${pendingCount} transactions with nonces ${lastExecutedNonce + 1} to ${currentNonce - 1}`);
            console.log(`   💡 These could be stuck transactions that need to be replaced or cancelled`);
        } else {
            console.log(`   ✅ No nonce gap detected - all transactions appear to be processed`);
        }

    } catch (error) {
        console.error('❌ Error checking pending transactions:', error);
    }
}

checkPendingTransactions();