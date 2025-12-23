#!/usr/bin/env tsx

import { 
    makeContractCall,
    broadcastTransaction,
    getAddressFromPrivateKey,
    AnchorMode,
    PostConditionMode,
    uintCV,
    principalCV,
    stringUtf8CV
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import dotenv from 'dotenv';

// Load environment variables
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

async function createTokenAndReplaceMints() {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    
    console.log(`🚀 Creating token and replacing stuck mint transactions...`);
    console.log(`📍 Network: ${NETWORK_ENV}`);
    console.log(`📧 Address: ${getAddressFromPrivateKey(PRIVATE_KEY)}`);
    
    // First, create a token using nonce 28
    console.log(`\n1️⃣ Creating token with nonce 28...`);
    
    const createTokenOptions = {
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'create-token-with-royalty',
        functionArgs: [
            uintCV(1000000),                           // initial-supply: 1 token
            stringUtf8CV("https://example.com/token"), // uri
            stringUtf8CV("Test Token"),                // name
            stringUtf8CV("A test token"),              // description
            uintCV(500)                                // royalty-percentage: 5%
        ],
        senderKey: PRIVATE_KEY,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 600000, // 0.6 STX
        nonce: 28
    };

    try {
        const createTransaction = await makeContractCall(createTokenOptions);
        const createResponse = await broadcastTransaction({ transaction: createTransaction, network });

        if ('error' in createResponse) {
            console.error(`   ❌ Failed to create token: ${createResponse.error}`);
            console.error(`   📝 Reason: ${createResponse.reason || 'Unknown'}`);
            return;
        } else {
            console.log(`   ✅ Token creation successful! TX ID: ${createResponse.txid}`);
            console.log(`   🔗 Explorer: https://explorer.hiro.so/txid/${createResponse.txid}?chain=${NETWORK_ENV}`);
        }
    } catch (error) {
        console.error(`   ❌ Error creating token:`, error);
        return;
    }

    // Wait a bit before next transaction
    console.log(`   ⏳ Waiting 3 seconds...`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Now replace the remaining mint transactions (nonces 29-32) with mint calls for token ID 1
    console.log(`\n2️⃣ Replacing remaining mint transactions...`);
    
    const stuckNonces = [29, 30, 31, 32];
    const tokenId = 1; // The token we just created
    const amount = 1000000; // 1 token
    
    let successCount = 1; // Count the token creation as success
    
    for (const nonce of stuckNonces) {
        console.log(`🔄 Replacing mint transaction with nonce ${nonce}...`);
        
        const mintOptions = {
            contractAddress: contractAddr,
            contractName: contractName,
            functionName: 'mint',
            functionArgs: [
                principalCV(ADMIN_ADDRESS), // to
                uintCV(tokenId),           // token-id  
                uintCV(amount)             // amount
            ],
            senderKey: PRIVATE_KEY,
            network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            fee: 600000, // 0.6 STX
            nonce: nonce
        };

        try {
            const transaction = await makeContractCall(mintOptions);
            const broadcastResponse = await broadcastTransaction({ transaction, network });

            if ('error' in broadcastResponse) {
                console.error(`   ❌ Failed: ${broadcastResponse.error}`);
                console.error(`   📝 Reason: ${broadcastResponse.reason || 'Unknown'}`);
            } else {
                console.log(`   ✅ Success! TX ID: ${broadcastResponse.txid}`);
                console.log(`   🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}`);
                successCount++;
            }
        } catch (error) {
            console.error(`   ❌ Error:`, error);
        }
        
        // Wait between transactions
        if (nonce !== stuckNonces[stuckNonces.length - 1]) {
            console.log(`   ⏳ Waiting 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully replaced: ${successCount}/5 transactions`);
    console.log(`   💰 Total cost: ${(600000 * successCount) / 1000000} STX`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Wait 10-15 minutes for confirmations`);
    console.log(`   2. Run 'npm run check-pending' to verify transactions cleared`);
    console.log(`   3. Continue with remaining nonces if needed`);
}

createTokenAndReplaceMints();