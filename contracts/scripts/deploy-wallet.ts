#!/usr/bin/env tsx

import { makeContractDeploy, broadcastTransaction, AnchorMode, ClarityVersion } from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'testnet';

if (!PRIVATE_KEY) {
    console.error("Error: PRIVATE_KEY or DEPLOYER_KEY environment variable is required.");
    console.error("Set your private key in .env file");
    process.exit(1);
}

const privateKey: string = PRIVATE_KEY;

async function deployContract(contractFileName: string, contractName: string) {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const networkName = NETWORK_ENV === 'mainnet' ? 'Mainnet' : 'Testnet';

    // Read contract source code
    const contractPath = path.join(process.cwd(), 'contracts', contractFileName);
    const contractSource = readFileSync(contractPath, 'utf-8');

    console.log(`📄 Contract: ${contractName}`);
    console.log(`📍 Network: ${networkName}`);
    console.log(`📖 Reading from: ${contractPath}\n`);

    const txOptions = {
        contractName,
        codeBody: contractSource,
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        clarityVersion: ClarityVersion.Clarity3,
        fee: NETWORK_ENV === 'mainnet' ? 300000 : 200000, // Reasonable fee for mainnet (0.3 STX)
        postConditionMode: 0x01,
    };

    try {
        console.log("⏳ Creating transaction...");
        const transaction = await makeContractDeploy(txOptions);
        
        console.log("📤 Broadcasting to network...");
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        if ('error' in broadcastResponse) {
            console.error('❌ Deployment failed:', broadcastResponse.error);
            console.error('💡 Common causes:');
            console.error('   - Insufficient STX balance for fees');
            console.error('   - Contract name already exists');
            console.error('   - Network connectivity issues');
            console.error('   - Invalid contract syntax');
            throw new Error(broadcastResponse.error);
        } else {
            console.log('\n✅ Contract deployed successfully!');
            console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
            console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}`);
            return broadcastResponse.txid;
        }
    } catch (error) {
        console.error('❌ Error deploying contract:', error);
        throw error;
    }
}

async function deployWalletSystem() {
    console.log(`🚀 Deploying WalletX contract to ${NETWORK_ENV}...`);
    console.log(`📦 Using Clarity 3\n`);

    try {
        // Skip SIP-010 trait deployment (assume it exists or use existing one)
        console.log("ℹ️ Skipping SIP-010 trait deployment (assuming it exists)...\n");
        
        // Deploy WalletX contract directly
        console.log("1️⃣ Deploying WalletX contract...");
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const walletContractName = `wallet-x-${timestamp}-${randomSuffix}`;
        console.log(`📝 Contract name: ${walletContractName}`);
        const walletTxId = await deployContract('wallet-x.clar', walletContractName);
        
        console.log(`\n🎉 WalletX contract deployed successfully!`);
        console.log(`📝 WalletX Contract: ${walletContractName}`);
        console.log(`📋 Transaction ID: ${walletTxId}`);
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Wait for transaction confirmations (~10 minutes)`);
        console.log(`   2. Start creating wallets with register-wallet`);
        console.log(`   3. Add members with onboard-member`);
        console.log(`   4. Use the interaction script to test functionality`);
        
    } catch (error) {
        console.error('❌ Deployment process failed:', error);
        process.exit(1);
    }
}

deployWalletSystem();