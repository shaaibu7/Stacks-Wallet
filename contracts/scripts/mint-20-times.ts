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
const NETWORK_ENV = 'testnet'; // Hardcoded as per request
const CONTRACT_ADDRESS = 'ST8DAC2FHJFX599JR491PEAEM0CAXP95JXZ00MBD.token-contract-1766645564030';
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS;

if (!PRIVATE_KEY) {
    console.error("❌ Missing PRIVATE_KEY in .env file");
    process.exit(1);
}

// TypeScript assertions
const privateKey: string = PRIVATE_KEY;
const contractAddress: string = CONTRACT_ADDRESS;

// Parse contract address
const [contractAddr, contractName] = contractAddress.split('.');

if (!contractAddr || !contractName) {
    console.error("❌ Invalid CONTRACT_ADDRESS format. Expected: SP_ADDRESS.CONTRACT_NAME");
    process.exit(1);
}

async function mintTokens(amount: number, recipient: string, mintNumber: number): Promise<boolean> {
    const network = STACKS_TESTNET;
    
    console.log(`🪙 Mint #${mintNumber}: ${amount / 1000000} CC tokens to ${recipient}`);
    
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
        fee: 300000,
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
            return false;
        } else {
            console.log(`✅ Mint #${mintNumber} successful!`);
            console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
            console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}`);
            return true;
        }
    } catch (error) {
        console.error(`❌ Error in mint #${mintNumber}:`, error);
        return false;
    }
}

async function main() {
    console.log(`🚀 Testnet Token Mint Script - 20 Transactions`);
    console.log(`============================================\n`);
    
    const senderAddress = getAddressFromPrivateKey(privateKey);
    const amount = 1000000; // 1 CC token per mint
    // If ADMIN_ADDRESS is not set, use senderAddress as recipient, or logic can be adjusted. 
    // The previous script used adminAddress as recipient. I'll stick to that if available, else sender.
    const recipient = ADMIN_ADDRESS || senderAddress; 
    
    console.log(`📊 Mint Details:`);
    console.log(`   Network: ${NETWORK_ENV}`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Sender: ${senderAddress}`);
    console.log(`   Recipient: ${recipient}`);
    console.log(`   Amount per mint: ${amount / 1000000} CC tokens`);
    console.log(`   Total mints: 20`);
    console.log(`   Total tokens: ${(amount * 20) / 1000000} CC`);
    
    // Execute 20 mint transactions
    let successCount = 0;
    
    for (let i = 1; i <= 20; i++) {
        console.log(`\n🔄 Executing mint ${i}/20:`);
        
        const success = await mintTokens(amount, recipient, i);
        
        if (success) {
            successCount++;
        }
        
        // Wait 3 seconds between transactions (except after the last one)
        if (i < 20) {
            console.log(`⏳ Waiting 3 seconds before next mint...\n`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    // Summary
    console.log(`\n📊 Final Summary:`);
    console.log(`   ✅ Successful mints: ${successCount}/20`);
    
    if (successCount === 20) {
        console.log(`\n🎉 All 20 mints completed successfully!`);
    }
}

main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
