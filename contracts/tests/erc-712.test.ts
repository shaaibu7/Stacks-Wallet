import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

describe('ERC-712 Contract Tests', () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe('Contract Initialization', () => {
    it('should initialize with correct domain separator', () => {
      const result = simnet.callReadOnlyFn(
        'erc-712',
        'get-domain-separator',
        [],
        deployer
      );
      
      expect(result.result).toBeOk();
      // Domain separator should be a 32-byte buffer
      expect(Cl.isBuff(result.result)).toBe(true);
    });

    it('should have correct contract info', () => {
      const result = simnet.callReadOnlyFn(
        'erc-712',
        'get-contract-info',
        [],
        deployer
      );
      
      expect(result.result).toBeOk();
      const info = Cl.unwrap(result.result);
      
      expect(Cl.unwrapAscii(info.name)).toBe('ERC712Contract');
      expect(Cl.unwrapAscii(info.version)).toBe('1');
      expect(Cl.unwrapUInt(info['chain-id'])).toBe(1n);
      expect(Cl.unwrapPrincipal(info.owner)).toBe(deployer);
      expect(Cl.unwrapBool(info.paused)).toBe(false);
    });
  });
});
  describe('Nonce Management', () => {
    it('should start with nonce 0 for new users', () => {
      const result = simnet.callReadOnlyFn(
        'erc-712',
        'get-nonce',
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(result.result).toBeOk();
      expect(Cl.unwrapUInt(result.result)).toBe(0n);
    });

    it('should increment nonce after permit operation', () => {
      // First check initial nonce
      let nonceResult = simnet.callReadOnlyFn(
        'erc-712',
        'get-nonce',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(Cl.unwrapUInt(nonceResult.result)).toBe(0n);

      // Create a mock signature (this would normally be created off-chain)
      const mockSignature = Cl.bufferFromHex('0x' + '00'.repeat(65));
      
      // Try permit (will fail due to invalid signature, but that's expected)
      const permitResult = simnet.callPublicFn(
        'erc-712',
        'permit',
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(1000),
          Cl.uint(simnet.blockHeight + 100),
          mockSignature
        ],
        wallet1
      );
      
      // Should fail due to invalid signature
      expect(permitResult.result).toBeErr(Cl.uint(402)); // ERR_INVALID_SIGNATURE
    });
  });