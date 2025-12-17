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

async function checkAccount() {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const networkName = NETWORK_ENV === 'mainnet' ? 'Mainnet' : 'Testnet';
    
    // Get address from private key
    const address = getAddressFromPrivateKey(PRIVATE_KEY);

    console.log(`🔍 Account Information`);
    console.log(`📍 Network: ${networkName}`);
    console.log(`📧 Address: ${address}`);
    console.log(`🔑 Private Key: ${PRIVATE_KEY.substring(0, 8)}...${PRIVATE_KEY.substring(PRIVATE_KEY.length - 8)}`);

    try {
        // Check account balance
        const apiUrl = NETWORK_ENV === 'mainnet' ? 'https://api.hiro.so' : 'https://api.testnet.hiro.so';
        const balanceUrl = `${apiUrl}/extended/v1/address/${address}/balances`;
        console.log(`\n💰 Fetching balance from: ${balanceUrl}`);
        
        const balanceResponse = await fetch(balanceUrl);
        const balanceData = await balanceResponse.json();
        
        if (balanceResponse.ok) {
            const stxBalance = parseInt(balanceData.stx.balance) / 1000000; // Convert microSTX to STX
            const lockedBalance = parseInt(balanceData.stx.locked) / 1000000;
            
            console.log(`✅ STX Balance: ${stxBalance} STX`);
            console.log(`🔒 Locked Balance: ${lockedBalance} STX`);
            console.log(`💸 Available for fees: ${stxBalance - lockedBalance} STX`);
            
            if (stxBalance < 1) {
                console.log(`\n⚠️  Warning: Low STX balance!`);
                if (NETWORK_ENV === 'testnet') {
                    console.log(`💡 Get testnet STX from: https://explorer.hiro.so/sandbox/faucet?chain=testnet`);
                } else {
                    console.log(`💡 You need to buy STX for mainnet deployment`);
                }
            }
        } else {
            console.error(`❌ Failed to fetch balance:`, balanceData);
        }

        // Check account nonce
        const nonceUrl = `${apiUrl}/extended/v1/address/${address}/nonces`;
        console.log(`\n🔢 Fetching nonce from: ${nonceUrl}`);
        
        const nonceResponse = await fetch(nonceUrl);
        const nonceData = await nonceResponse.json();
        
        if (nonceResponse.ok) {
            console.log(`✅ Current Nonce: ${nonceData.possible_next_nonce}`);
            console.log(`📊 Last Executed Nonce: ${nonceData.last_executed_tx_nonce || 'None'}`);
        } else {
            console.error(`❌ Failed to fetch nonce:`, nonceData);
        }

        // Check recent transactions
        const txUrl = `${apiUrl}/extended/v1/address/${address}/transactions?limit=5`;
        console.log(`\n📋 Fetching recent transactions from: ${txUrl}`);
        
        const txResponse = await fetch(txUrl);
        const txData = await txResponse.json();
        
        if (txResponse.ok && txData.results) {
            console.log(`✅ Recent Transactions (${txData.results.length}):`);
            txData.results.forEach((tx: any, index: number) => {
                console.log(`   ${index + 1}. ${tx.tx_id} - ${tx.tx_status} (${tx.tx_type})`);
            });
        } else {
            console.log(`ℹ️  No recent transactions found`);
        }

    } catch (error) {
        console.error('❌ Error checking account:', error);
    }
}

checkAccount();