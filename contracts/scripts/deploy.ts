import { makeContractDeploy, broadcastTransaction, AnchorMode, ClarityVersion } from '@stacks/transactions';
import { readFileSync } from 'fs';
import path from 'path';
import { loadNetworkConfig, getExplorerTxUrl } from './config';

// Load configuration from environment
const networkConfig = loadNetworkConfig();

async function deployContract(contractFileName: string, contractName: string) {
    const network = networkConfig.network;
    const networkName = networkConfig.networkName;

    // Read contract source code
    const contractPath = path.join(process.cwd(), 'contracts', contractFileName);
    const contractSource = readFileSync(contractPath, 'utf-8');

    console.log(`📄 Contract: ${contractName}`);
    console.log(`📍 Network: ${networkName}`);
    console.log(`📖 Reading from: ${contractPath}\n`);

    const txOptions = {
        contractName,
        codeBody: contractSource,
        senderKey: networkConfig.privateKey,
        network,
        anchorMode: AnchorMode.Any,
        clarityVersion: ClarityVersion.Clarity3,
        fee: 150000,
        postConditionMode: 0x01,
    };

    try {
        console.log("⏳ Creating transaction...");
        const transaction = await makeContractDeploy(txOptions);
        
        console.log("📤 Broadcasting to network...");
        const broadcastResponse = await broadcastTransaction({ transaction, network });

        if ('error' in broadcastResponse) {
            console.error('❌ Deployment failed:', broadcastResponse.error);
            throw new Error(broadcastResponse.error);
        } else {
            console.log('\n✅ Contract deployed successfully!');
            console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
            console.log(`🔗 Explorer: ${getExplorerTxUrl(broadcastResponse.txid, networkConfig.networkEnv)}`);
            return broadcastResponse.txid;
        }
    } catch (error) {
        console.error('❌ Error deploying contract:', error);
        throw error;
    }
}

async function deployAll() {
    console.log(`🚀 Deploying contracts to ${networkConfig.networkName}...`);
    console.log(`📦 Using Clarity 3\n`);

    try {
        // Deploy trait first
        console.log("1️⃣ Deploying SIP-010 trait...");
        const traitTxId = await deployContract('sip-010-trait.clar', 'sip-010-trait');
        
        console.log("\n⏳ Waiting 30 seconds for trait deployment to confirm...");
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Deploy token contract
        console.log("\n2️⃣ Deploying token contract...");
        const timestamp = Date.now();
        const tokenContractName = `token-contract-${timestamp}`;
        const tokenTxId = await deployContract('token-contract.clar', tokenContractName);
        
        console.log(`\n🎉 All contracts deployed successfully!`);
        console.log(`📝 Trait Contract: sip-010-trait`);
        console.log(`📝 Token Contract: ${tokenContractName}`);
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Wait for transaction confirmations (~10 minutes)`);
        console.log(`   2. Share your contract addresses on GitHub`);
        console.log(`   3. Generate activity by calling contract functions`);
        console.log(`   4. Check leaderboard at https://stacks.org/builder-challenge`);
        
    } catch (error) {
        console.error('❌ Deployment process failed:', error);
        process.exit(1);
    }
}

deployAll();