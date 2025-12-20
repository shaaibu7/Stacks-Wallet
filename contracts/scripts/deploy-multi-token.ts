import { makeContractDeploy, broadcastTransaction, AnchorMode, ClarityVersion } from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'mainnet';

if (!PRIVATE_KEY) {
    console.error("Error: PRIVATE_KEY or DEPLOYER_KEY environment variable is required.");
    console.error("Set your private key in .env file");
    process.exit(1);
}

// TypeScript assertion - we know PRIVATE_KEY is defined due to the check above
const privateKey: string = PRIVATE_KEY;

async function deployMultiTokenContract() {
    const network = NETWORK_ENV === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    const networkName = NETWORK_ENV === 'mainnet' ? 'Mainnet' : 'Testnet';

    // Read contract source code
    const contractPath = path.join(process.cwd(), 'contracts', 'multi-token-nft.clar');
    const contractSource = readFileSync(contractPath, 'utf-8');

    const timestamp = Date.now();
    const contractName = `multi-token-nft-${timestamp}`;

    console.log(`📄 Contract: ${contractName}`);
    console.log(`📍 Network: ${networkName}`);
    console.log(`📖 Reading from: ${contractPath}\n`);

    const txOptions = {
        contractName,
        codeBody: contractSource,
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        clarityVersion: ClarityVersion.Clarity4,
        fee: 200000, // Higher fee for larger contract
        postConditionMode: 0x01,
    };

    try {
        console.log("⏳ Creating transaction...");
        console.log("🔧 Transaction options:", {
            contractName: txOptions.contractName,
            network: networkName,
            clarityVersion: txOptions.clarityVersion,
            fee: txOptions.fee
        });
        const transaction = await makeContractDeploy(txOptions);
        
        console.log("📤 Broadcasting to network...");
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        if ('error' in broadcastResponse) {
            console.error('❌ Deployment failed:', broadcastResponse.error);
            console.error('❌ Full response:', JSON.stringify(broadcastResponse, null, 2));
            throw new Error(broadcastResponse.error);
        } else {
            console.log('\n✅ Multi-Token NFT Contract deployed successfully!');
            console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
            console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}`);
            console.log(`📄 Contract Address: ${contractName}`);
            console.log(`\n💡 Contract Features:`);
            console.log(`   - ERC1155-like multi-token support`);
            console.log(`   - Batch operations (up to 100 items)`);
            console.log(`   - Royalty tracking`);
            console.log(`   - Token descriptions`);
            console.log(`   - Emergency controls`);
            console.log(`   - Transaction analytics`);
            return broadcastResponse.txid;
        }
    } catch (error) {
        console.error('❌ Error deploying contract:', error);
        throw error;
    }
}

// Deploy the contract
deployMultiTokenContract().catch(error => {
    console.error('❌ Deployment process failed:', error);
    process.exit(1);
});