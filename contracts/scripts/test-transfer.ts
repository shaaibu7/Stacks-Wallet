#!/usr/bin/env tsx

import { standardPrincipalCV } from '@stacks/transactions';
import dotenv from 'dotenv';

dotenv.config();

// Test the address validation
const testAddresses = [
  'SP000000000000000000002Q6VF78', // Burn address
  'SP2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', // Invalid
  'SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS', // Valid mainnet address
];

console.log('Testing address validation...\n');

testAddresses.forEach((address, index) => {
  try {
    const cv = standardPrincipalCV(address);
    console.log(`✅ Address ${index + 1}: ${address} - VALID`);
  } catch (error) {
    console.log(`❌ Address ${index + 1}: ${address} - INVALID`);
    console.log(`   Error: ${error.message}\n`);
  }
});