#!/usr/bin/env tsx

import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  someCV,
  bufferCV
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  privateKey: process.env.PRIVATE_KEY!,
  network: STACKS_TESTNET,
  contractAddress: process.env.CONTRACT_ADDRESS!.split('.')[0],
  contractName: process.env.CONTRACT_ADDRESS!.split('.')[1],
  transferAmount: '100000',
  transferRecipient: 'ST000000000000000000002AMW42H', // Valid testnet burn address
};

async function testTransfer() {
  console.log('🧪 Testing single transfer...\n');
  console.log(`From: ${CONFIG.contractAddress}`);
  console.log(`To: ${CONFIG.transferRecipient}`);
  console.log(`Amount: ${CONFIG.transferAmount}\n`);

  try {
    const functionArgs = [
      uintCV(CONFIG.transferAmount),
      standardPrincipalCV(CONFIG.contractAddress), // sender (must be tx-sender)
      standardPrincipalCV(CONFIG.transferRecipient),
      someCV(bufferCV(Buffer.from('Test transfer', 'utf8')))
    ];

    const txOptions = {
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: 'transfer',
      functionArgs,
      senderKey: CONFIG.privateKey,
      network: CONFIG.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 150000
    };

    console.log('⏳ Creating transfer transaction...');
    const transaction = await makeContractCall(txOptions);
    
    console.log('📤 Broadcasting to network...');
    const broadcastResponse = await broadcastTransaction({ 
      transaction, 
      network: CONFIG.network 
    });

    if ('error' in broadcastResponse) {
      console.error('❌ Transfer failed:', broadcastResponse.error);
      console.error('❌ Reason:', broadcastResponse.reason);
      console.error('❌ Reason data:', broadcastResponse.reason_data);
    } else {
      console.log('✅ Transfer successful!');
      console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
      console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testTransfer();