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

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'mainnet';
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!PRIVATE_KEY || !ADMIN_ADDRESS || !CONTRACT_ADDRESS) {
    console.error("❌ Missing required environment variables");
    process.exit(1);
}

const [contractAddr, contractName] = CONTRACT_ADDRESS.split('.');

async function replaceAllPending() {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    
    console.log(`🚀 Replacing ALL 20 pending mint transactions...`);
    console.log(`📍 Network: ${NETWORK_ENV}`);
    console.log(`📧 Address: ${getAddressFromPrivateKey(PRIVATE_KEY)}`);
    console.log(`📄 Contract: ${CONTRACT_ADDRESS}`);
    
    // All 20 stuck nonces from your mempool
    const stuckNonces = [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
    
    let successCount = 0;
    
    for (const nonce of stuckNonces) {
        console.log(`\n🔄 Nonce ${nonce}: Minting 1,000,000 tokens...`);
        
        // Use the correct mint function signature: (mint (amount uint) (recipient principal))
        const txOptions = {
            contractAddress: contractAddr,
            contractName: contractName,
            functionName: 'mint',
            functionArgs: [
                uintCV(1000000),           // amount: 1 token (1,000,000 micro-tokens)
                principalCV(ADMIN_ADDRESS) // recipient: your address
            ],
            senderKey: PRIVATE_KEY,
            network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            fee: 800000, // 0.8 STX - very high fee to ensure processing
            nonce: nonce
        };

        try {
            const transaction = await makeContractCall(txOptions);
            const response = await broadcastTransaction({ transaction, network });

            if ('error' in response) {
                console.error(`   ❌ ${response.error} - ${response.reason || ''}`);
            } else {
                console.log(`   ✅ Success! TX: ${response.txid}`);
                console.log(`   🔗 https://explorer.hiro.so/txid/${response.txid}?chain=${NETWORK_ENV}`);
                successCount++;
            }
        } catch (error: any) {
            console.error(`   ❌ Error: ${error.message}`);
        }
        
        // Small delay between transactions
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully replaced: ${successCount}/20 transactions`);
    console.log(`   💰 Total cost: ${(800000 * successCount) / 1000000} STX`);
    console.log(`   🪙 Total tokens minted: ${(1000000 * successCount) / 1000000} CC`);
    
    if (successCount > 0) {
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Wait 10-15 minutes for confirmations`);
        console.log(`   2. Run 'npm run check-pending' to verify all transactions cleared`);
        console.log(`   3. Check your token balance with the contract's get-balance function`);
    }
}

replaceAllPending();