import { 
  makeContractCall,
  makeContractSTXPostCondition,
  FungibleConditionCode,
  createAssetInfo,
  makeStandardFungiblePostCondition,
  PostConditionMode,
  AnchorMode,
  broadcastTransaction,
  makeContractDeploy,
  StacksTestnet,
  StacksMainnet,
  uintCV, 
  stringUtf8CV, 
  principalCV, 
  someCV, 
  noneCV, 
  bufferCV, 
  boolCV,
  callReadOnlyFunction
} from '@stacks/transactions';
import { StacksNetwork } from '@stacks/network';
import { readFileSync } from 'fs';
import { loadContractConfig, displayNetworkInfo, getExplorerTxUrl } from './config';
import type { ContractConfig } from './config';

// Load configuration from environment
const config = loadContractConfig('CONTRACT_ADDRESS', 'multi-token-nft');

// Network configuration
const network = config.network;

// Contract details
const contractName = config.contractName;
const contractAddress = config.contractAddress;

// Example functions to interact with the multi-token NFT contract

export async function createToken(
  senderKey: string,
  initialSupply: number,
  tokenUri: string
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-token',
    functionArgs: [
      uintCV(initialSupply),
      stringUtf8CV(tokenUri)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Create Token Transaction:', broadcastResponse);
  return broadcastResponse;
}

export async function mintTokens(
  senderKey: string,
  recipient: string,
  tokenId: number,
  amount: number
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'mint',
    functionArgs: [
      principalCV(recipient),
      uintCV(tokenId),
      uintCV(amount)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Mint Tokens Transaction:', broadcastResponse);
  return broadcastResponse;
}

export async function transferTokens(
  senderKey: string,
  from: string,
  to: string,
  tokenId: number,
  amount: number,
  memo?: string
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'safe-transfer-from',
    functionArgs: [
      principalCV(from),
      principalCV(to),
      uintCV(tokenId),
      uintCV(amount),
      memo ? someCV(bufferCV(Buffer.from(memo, 'utf8'))) : noneCV()
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Transfer Tokens Transaction:', broadcastResponse);
  return broadcastResponse;
}

export async function setApprovalForAll(
  senderKey: string,
  operator: string,
  approved: boolean
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'set-approval-for-all',
    functionArgs: [
      principalCV(operator),
      boolCV(approved)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Set Approval Transaction:', broadcastResponse);
  return broadcastResponse;
}

export async function burnTokens(
  senderKey: string,
  from: string,
  tokenId: number,
  amount: number
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'burn',
    functionArgs: [
      principalCV(from),
      uintCV(tokenId),
      uintCV(amount)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log('Burn Tokens Transaction:', broadcastResponse);
  return broadcastResponse;
}

// Read-only functions
export async function getBalance(owner: string, tokenId: number) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'balance-of',
    functionArgs: [
      principalCV(owner),
      uintCV(tokenId)
    ],
    network,
    senderAddress: contractAddress,
  };

  const result = await callReadOnlyFunction(txOptions);
  console.log('Balance:', result);
  return result;
}

export async function getTotalSupply(tokenId: number) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'total-supply',
    functionArgs: [uintCV(tokenId)],
    network,
    senderAddress: contractAddress,
  };

  const result = await callReadOnlyFunction(txOptions);
  console.log('Total Supply:', result);
  return result;
}

export async function getTokenUri(tokenId: number) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'get-token-uri',
    functionArgs: [uintCV(tokenId)],
    network,
    senderAddress: contractAddress,
  };

  const result = await callReadOnlyFunction(txOptions);
  console.log('Token URI:', result);
  return result;
}

export async function isApprovedForAll(owner: string, operator: string) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'is-approved-for-all',
    functionArgs: [
      principalCV(owner),
      principalCV(operator)
    ],
    network,
    senderAddress: contractAddress,
  };

  const result = await callReadOnlyFunction(txOptions);
  console.log('Is Approved For All:', result);
  return result;
}

// Example usage
async function example() {
  const senderKey = process.env.PRIVATE_KEY;
  if (!senderKey) {
    console.error('Please set PRIVATE_KEY in your .env file');
    return;
  }

  try {
    // Create a new token type
    console.log('Creating new token...');
    await createToken(senderKey, 1000, 'https://api.example.com/metadata/1');

    // Wait a bit for the transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Check balance
    const ownerAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Replace with actual address
    await getBalance(ownerAddress, 1);

    // Transfer some tokens
    const recipientAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'; // Replace with actual address
    console.log('Transferring tokens...');
    await transferTokens(senderKey, ownerAddress, recipientAddress, 1, 100);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run the example
// example();

// CLI interface for easy interaction
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🎨 Multi-Token NFT Contract Interaction\n');
  displayNetworkInfo(config);

  try {
    switch (command) {
      case 'create-token':
        if (args.length < 3) {
          console.log('Usage: npm run interact-multi create-token <supply> <uri>');
          console.log('Example: npm run interact-multi create-token 1000 "https://api.example.com/metadata/1"');
          process.exit(1);
        }
        await createToken(senderKey, parseInt(args[1]), args[2]);
        break;

      case 'mint':
        if (args.length < 4) {
          console.log('Usage: npm run interact-multi mint <recipient> <token-id> <amount>');
          console.log('Example: npm run interact-multi mint ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM 1 100');
          process.exit(1);
        }
        await mintTokens(senderKey, args[1], parseInt(args[2]), parseInt(args[3]));
        break;

      case 'transfer':
        if (args.length < 5) {
          console.log('Usage: npm run interact-multi transfer <from> <to> <token-id> <amount> [memo]');
          console.log('Example: npm run interact-multi transfer ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG 1 50');
          process.exit(1);
        }
        await transferTokens(senderKey, args[1], args[2], parseInt(args[3]), parseInt(args[4]), args[5]);
        break;

      case 'approve':
        if (args.length < 3) {
          console.log('Usage: npm run interact-multi approve <operator> <approved>');
          console.log('Example: npm run interact-multi approve ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM true');
          process.exit(1);
        }
        await setApprovalForAll(senderKey, args[1], args[2] === 'true');
        break;

      case 'burn':
        if (args.length < 4) {
          console.log('Usage: npm run interact-multi burn <from> <token-id> <amount>');
          console.log('Example: npm run interact-multi burn ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM 1 25');
          process.exit(1);
        }
        await burnTokens(senderKey, args[1], parseInt(args[2]), parseInt(args[3]));
        break;

      case 'balance':
        if (args.length < 3) {
          console.log('Usage: npm run interact-multi balance <owner> <token-id>');
          console.log('Example: npm run interact-multi balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM 1');
          process.exit(1);
        }
        await getBalance(args[1], parseInt(args[2]));
        break;

      case 'supply':
        if (args.length < 2) {
          console.log('Usage: npm run interact-multi supply <token-id>');
          console.log('Example: npm run interact-multi supply 1');
          process.exit(1);
        }
        await getTotalSupply(parseInt(args[1]));
        break;

      case 'uri':
        if (args.length < 2) {
          console.log('Usage: npm run interact-multi uri <token-id>');
          console.log('Example: npm run interact-multi uri 1');
          process.exit(1);
        }
        await getTokenUri(parseInt(args[1]));
        break;

      case 'is-approved':
        if (args.length < 3) {
          console.log('Usage: npm run interact-multi is-approved <owner> <operator>');
          console.log('Example: npm run interact-multi is-approved ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
          process.exit(1);
        }
        await isApprovedForAll(args[1], args[2]);
        break;

      case 'help':
      default:
        console.log('Multi-Token NFT Contract Interaction Commands:');
        console.log('');
        console.log('Write Operations (require transactions):');
        console.log('  create-token <supply> <uri>                    - Create a new token type');
        console.log('  mint <recipient> <token-id> <amount>           - Mint tokens (creator only)');
        console.log('  transfer <from> <to> <token-id> <amount>       - Transfer tokens');
        console.log('  approve <operator> <approved>                  - Set approval for all tokens');
        console.log('  burn <from> <token-id> <amount>                - Burn tokens');
        console.log('');
        console.log('Read Operations (no transaction required):');
        console.log('  balance <owner> <token-id>                     - Get token balance');
        console.log('  supply <token-id>                              - Get total supply');
        console.log('  uri <token-id>                                 - Get token URI');
        console.log('  is-approved <owner> <operator>                 - Check approval status');
        console.log('');
        console.log('Examples:');
        console.log('  npm run interact-multi create-token 1000 "https://api.example.com/metadata/1"');
        console.log('  npm run interact-multi balance ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM 1');
        console.log('  npm run interact-multi transfer ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG 1 50');
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}