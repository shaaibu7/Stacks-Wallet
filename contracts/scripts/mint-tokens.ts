import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { uintCV, principalCV } from '@stacks/transactions';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'mainnet';
const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS;
const CONTRACT_FULL_ADDRESS = process.env.CONTRACT_ADDRESS;

// Parse contract details from environment
if (!CONTRACT_FULL_ADDRESS) {
    console.error("Error: CONTRACT_ADDRESS environment variable is required.");
    console.error("Set your contract address in .env file");
    process.exit(1);
}

const [CONTRACT_ADDRESS, CONTRACT_NAME] = CONTRACT_FULL_ADDRESS.split('.');

if (!PRIVATE_KEY) {
    console.error("Error: PRIVATE_KEY environment variable is required.");
    console.error("Set your private key in .env file");
    process.exit(1);
}

if (!ADMIN_ADDRESS) {
    console.error("Error: ADMIN_ADDRESS environment variable is required.");
    console.error("Set your address in .env file");
    process.exit(1);
}

// TypeScript assertions - we know these are defined due to the checks above
const privateKey: string = PRIVATE_KEY;
const adminAddress: string = ADMIN_ADDRESS;

async function mintToken(amount: number, recipient: string, mintNumber: number) {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const networkName = NETWORK_ENV === 'mainnet' ? 'Mainnet' : 'Testnet';

    console.log(`🪙 Mint #${mintNumber}: Minting ${amount} tokens to ${recipient}`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'mint',
        functionArgs: [
            uintCV(amount),
            principalCV(recipient)
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        fee: 200000, // 0.2 STX fee
        postConditionMode: PostConditionMode.Allow,
    };

    try {
        console.log(`⏳ Creating mint transaction #${mintNumber}...`);
        const transaction = await makeContractCall(txOptions);
        
        console.log(`📤 Broadcasting mint #${mintNumber} to ${networkName}...`);
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        if ('error' in broadcastResponse) {
            console.error(`❌ Mint #${mintNumber} failed:`, broadcastResponse.error);
            throw new Error(broadcastResponse.error);
        } else {
            console.log(`✅ Mint #${mintNumber} successful!`);
            console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
            console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}\n`);
            return broadcastResponse.txid;
        }
    } catch (error) {
        console.error(`❌ Error in mint #${mintNumber}:`, error);
        throw error;
    }
}

async function mintMultipleTokens() {
    const recipient = adminAddress; // Your address from .env
    const tokensPerMint = 1000000; // 1 token (with 6 decimals = 1,000,000 micro-tokens)
    const totalMints = 60;

    console.log(`🚀 Starting batch mint process...`);
    console.log(`📍 Network: ${NETWORK_ENV}`);
    console.log(`📄 Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log(`🎯 Recipient: ${recipient}`);
    console.log(`🪙 Tokens per mint: ${tokensPerMint / 1000000} CC`);
    console.log(`🔢 Total mints: ${totalMints}`);
    console.log(`💰 Total tokens to mint: ${(tokensPerMint * totalMints) / 1000000} CC\n`);

    const txIds: string[] = [];
    let successfulMints = 0;
    let failedMints = 0;

    for (let i = 1; i <= totalMints; i++) {
        try {
            const txId = await mintToken(tokensPerMint, recipient, i);
            txIds.push(txId);
            successfulMints++;
            
            // Add a small delay between transactions to avoid overwhelming the network
            if (i < totalMints) {
                console.log(`⏸️  Waiting 2 seconds before next mint...\n`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`❌ Failed to mint token #${i}:`, error);
            failedMints++;
            
            // Continue with next mint even if one fails
            console.log(`⏭️  Continuing with next mint...\n`);
        }
    }

    console.log(`\n🎉 Batch minting completed!`);
    console.log(`✅ Successful mints: ${successfulMints}`);
    console.log(`❌ Failed mints: ${failedMints}`);
    console.log(`💰 Total tokens minted: ${(successfulMints * tokensPerMint) / 1000000} CC`);
    
    if (txIds.length > 0) {
        console.log(`\n📋 Transaction IDs:`);
        txIds.forEach((txId, index) => {
            console.log(`   ${index + 1}. ${txId}`);
        });
    }

    console.log(`\n💡 Next steps:`);
    console.log(`   1. Wait for transaction confirmations (~10 minutes each)`);
    console.log(`   2. Check your token balance using get-balance function`);
    console.log(`   3. View transactions on Stacks Explorer`);
}

// Run the minting process
mintMultipleTokens().catch(error => {
    console.error('❌ Batch minting process failed:', error);
    process.exit(1);
});