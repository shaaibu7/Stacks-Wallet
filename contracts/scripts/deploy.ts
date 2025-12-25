import { makeContractDeploy, broadcastTransaction, AnchorMode, ClarityVersion } from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { readFileSync } from 'fs';
import path from 'path';
import  dotenv  from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
const NETWORK_ENV = process.env.STACKS_NETWORK || 'mainnet'; // Default to mainnet for Builder Challenge

if (!PRIVATE_KEY) {
    console.error("Error: PRIVATE_KEY or DEPLOYER_KEY environment variable is required.");
    console.error("Set your private key in .env file");
    process.exit(1);
}

// TypeScript assertion - we know PRIVATE_KEY is defined due to the check above
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
        clarityVersion: ClarityVersion.Clarity4,
        fee: NETWORK_ENV === 'mainnet' ? 300000 : 150000, // Higher fee for mainnet
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
            console.log('\n✅ Contract deployed successfully!');
            console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
            console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=${NETWORK_ENV}`);
            console.log(`📄 Contract Address: ${process.env.ADMIN_ADDRESS}.${contractName}`);
            return broadcastResponse.txid;
        }
    } catch (error) {
        console.error('❌ Error deploying contract:', error);
        throw error;
    }
}

async function deployAll() {
    console.log(`🚀 Deploying contracts to ${NETWORK_ENV}...`);
    console.log(`📦 Using Clarity 4\n`);

    try {
        // Skip trait deployment since it already exists
        console.log("1️⃣ SIP-010 trait already exists, skipping...");
        const traitAddress = NETWORK_ENV === 'mainnet' 
            ? "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard"
            : "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard";
        console.log(`   Contract: ${traitAddress}`);
        
        // Deploy token contract
        console.log("\n2️⃣ Deploying token contract...");
        const timestamp = Date.now();
        const tokenContractName = `token-contract-${timestamp}`;
        await deployContract('token-contract.clar', tokenContractName);
        
        console.log(`\n🎉 All contracts deployed successfully!`);
        console.log(`📝 Trait Contract: ${traitAddress}`);
        console.log(`📝 Token Contract: ${process.env.ADMIN_ADDRESS}.${tokenContractName}`);
        console.log(`\n📋 Update your .env file with:`);
        console.log(`CONTRACT_ADDRESS=${process.env.ADMIN_ADDRESS}.${tokenContractName}`);
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Wait for transaction confirmations (~10 minutes)`);
        console.log(`   2. Update CONTRACT_ADDRESS in .env file`);
        console.log(`   3. Share your contract addresses on GitHub`);
        console.log(`   4. Generate activity by calling contract functions`);
        console.log(`   5. Check leaderboard at https://stacks.org/builder-challenge`);
        
    } catch (error) {
        console.error('❌ Deployment process failed:', error);
        process.exit(1);
    }
}

deployAll();