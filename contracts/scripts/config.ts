import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface NetworkConfig {
  privateKey: string;
  network: any;
  networkName: string;
  networkEnv: 'testnet' | 'mainnet';
  explorerUrl: string;
}

export interface ContractConfig extends NetworkConfig {
  contractAddress: string;
  contractName: string;
}

export interface TokenContractConfig extends ContractConfig {
  tokenContractAddress?: string;
  tokenContractName?: string;
}

/**
 * Load and validate network configuration from environment variables
 * Supports both testnet and mainnet
 */
export function loadNetworkConfig(): NetworkConfig {
  const privateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_KEY;
  const networkEnv = (process.env.STACKS_NETWORK || 'testnet').toLowerCase() as 'testnet' | 'mainnet';

  if (!privateKey) {
    console.error('❌ Error: PRIVATE_KEY or DEPLOYER_KEY environment variable is required.');
    process.exit(1);
  }

  const network = networkEnv === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
  const networkName = networkEnv === 'mainnet' ? 'Mainnet' : 'Testnet';
  const explorerUrl = networkEnv === 'mainnet' 
    ? 'https://explorer.hiro.so'
    : 'https://testnet.explorer.hiro.so';

  return {
    privateKey,
    network,
    networkName,
    networkEnv,
    explorerUrl
  };
}

/**
 * Parse contract reference from environment variable
 * Supports formats: "ADDRESS.CONTRACT_NAME" or just "ADDRESS"
 */
export function parseContractRef(contractRef: string | undefined, fallbackName: string): { address: string; name: string } {
  if (!contractRef) {
    throw new Error(`Contract reference is required`);
  }

  if (contractRef.includes('.')) {
    const [address, name] = contractRef.split('.');
    return { address, name };
  }

  return { address: contractRef, name: fallbackName };
}

/**
 * Load contract configuration from environment variables
 * CONTRACT_ADDRESS format: "ADDRESS.CONTRACT_NAME"
 */
export function loadContractConfig(contractEnvVar: string = 'CONTRACT_ADDRESS', contractNameFallback: string = 'token-contract'): ContractConfig {
  const networkConfig = loadNetworkConfig();
  const contractRef = process.env[contractEnvVar];

  if (!contractRef) {
    console.error(`❌ Error: ${contractEnvVar} environment variable is required.`);
    console.error(`   Format: ADDRESS.CONTRACT_NAME (e.g., ST1ABC...XYZ.token-contract)`);
    process.exit(1);
  }

  const { address, name } = parseContractRef(contractRef, contractNameFallback);

  return {
    ...networkConfig,
    contractAddress: address,
    contractName: name
  };
}

/**
 * Load token contract configuration
 * Supports separate token contract from main contract
 */
export function loadTokenContractConfig(
  mainContractEnvVar: string = 'CONTRACT_ADDRESS',
  tokenContractEnvVar: string = 'TOKEN_CONTRACT_ADDRESS',
  mainContractNameFallback: string = 'token-contract',
  tokenContractNameFallback: string = 'token-contract'
): TokenContractConfig {
  const mainConfig = loadContractConfig(mainContractEnvVar, mainContractNameFallback);
  
  // Try to load separate token contract, fallback to main contract
  const tokenContractRef = process.env[tokenContractEnvVar];
  let tokenContractAddress = mainConfig.contractAddress;
  let tokenContractName = mainConfig.contractName;

  if (tokenContractRef) {
    const { address, name } = parseContractRef(tokenContractRef, tokenContractNameFallback);
    tokenContractAddress = address;
    tokenContractName = name;
  }

  return {
    ...mainConfig,
    tokenContractAddress,
    tokenContractName
  };
}

/**
 * Generate explorer URL for a transaction
 */
export function getExplorerTxUrl(txid: string, networkEnv: 'testnet' | 'mainnet'): string {
  const baseUrl = networkEnv === 'mainnet' 
    ? 'https://explorer.hiro.so'
    : 'https://testnet.explorer.hiro.so';
  return `${baseUrl}/txid/${txid}?chain=${networkEnv}`;
}

/**
 * Generate explorer URL for a contract
 */
export function getExplorerContractUrl(address: string, contractName: string, networkEnv: 'testnet' | 'mainnet'): string {
  const baseUrl = networkEnv === 'mainnet' 
    ? 'https://explorer.hiro.so'
    : 'https://testnet.explorer.hiro.so';
  return `${baseUrl}/address/${address}?chain=${networkEnv}`;
}

/**
 * Display network and contract information
 */
export function displayNetworkInfo(config: ContractConfig): void {
  console.log(`📍 Network: ${config.networkName}`);
  console.log(`📄 Contract: ${config.contractAddress}.${config.contractName}`);
  console.log(`🔗 Explorer: ${getExplorerContractUrl(config.contractAddress, config.contractName, config.networkEnv)}\n`);
}

/**
 * Display token contract information
 */
export function displayTokenContractInfo(config: TokenContractConfig): void {
  console.log(`📍 Network: ${config.networkName}`);
  console.log(`📄 Main Contract: ${config.contractAddress}.${config.contractName}`);
  if (config.tokenContractAddress && config.tokenContractName) {
    console.log(`💰 Token Contract: ${config.tokenContractAddress}.${config.tokenContractName}`);
  }
  console.log(`🔗 Explorer: ${getExplorerContractUrl(config.contractAddress, config.contractName, config.networkEnv)}\n`);
}
