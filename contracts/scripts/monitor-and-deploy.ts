import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS;
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_PENDING_SAFE = 40; // Deploy when pending transactions are below this

async function checkNonceStatus() {
    try {
        const response = await fetch(`https://api.hiro.so/extended/v1/address/${ADMIN_ADDRESS}/nonces`);
        const data = await response.json();
        
        const currentNonce = data.possible_next_nonce;
        const lastExecutedNonce = data.last_executed_tx_nonce || 0;
        const pendingCount = currentNonce - lastExecutedNonce - 1;
        
        console.log(`🔍 Nonce Status Check - ${new Date().toLocaleTimeString()}`);
        console.log(`   Current Nonce: ${currentNonce}`);
        console.log(`   Last Executed: ${lastExecutedNonce}`);
        console.log(`   Pending Transactions: ${pendingCount}`);
        
        return { currentNonce, lastExecutedNonce, pendingCount };
    } catch (error) {
        console.error('❌ Error checking nonce status:', error);
        return null;
    }
}

async function monitorAndDeploy() {
    console.log('🚀 Starting deployment monitor...');
    console.log(`📊 Will deploy when pending transactions < ${MAX_PENDING_SAFE}`);
    console.log(`⏰ Checking every ${CHECK_INTERVAL / 60000} minutes\n`);
    
    while (true) {
        const status = await checkNonceStatus();
        
        if (status && status.pendingCount < MAX_PENDING_SAFE) {
            console.log('\n✅ Safe to deploy! Starting deployment...\n');
            
            try {
                execSync('npm run deploy-multi-token', { stdio: 'inherit', cwd: process.cwd() });
                console.log('\n🎉 Deployment completed successfully!');
                break;
            } catch (error) {
                console.error('❌ Deployment failed:', error);
                console.log('🔄 Will continue monitoring...\n');
            }
        } else if (status) {
            const waitTime = Math.ceil(status.pendingCount * 15 / 60); // Estimate hours
            console.log(`⏳ Still ${status.pendingCount} pending transactions. Estimated wait: ~${waitTime} hours`);
        }
        
        console.log(`💤 Waiting ${CHECK_INTERVAL / 60000} minutes before next check...\n`);
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
}

monitorAndDeploy().catch(error => {
    console.error('❌ Monitor failed:', error);
    process.exit(1);
});