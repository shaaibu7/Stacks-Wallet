# Testing Guide

## Overview

The project includes 100+ test cases covering all three smart contracts:
- Token Contract: 40+ tests
- Wallet-X Contract: 35+ tests
- Multi-Token NFT: 40+ tests

## Setup

### Install Dependencies

```bash
cd contracts
npm install
```

### Configure Vitest

Tests are configured in `vitest.config.ts` with:
- Clarinet environment
- Simnet isolation
- Coverage reporting
- Cost analysis

## Running Tests

### Run All Tests

```bash
npm test
```

### Run with Coverage Report

```bash
npm run test:report
```

### Run in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npm test token-contract.test.ts
npm test wallet-x.test.ts
npm test multi-token-nft.test.ts
```

## Test Structure

### Token Contract Tests

```typescript
describe('Token Contract - Basic Operations', () => {
  // Metadata tests
  // Minting tests
  // Transfer tests
  // Balance query tests
  // Error condition tests
})
```

### Wallet-X Contract Tests

```typescript
describe('Wallet-X Contract - Wallet Registration', () => {
  // Registration tests
  // Member management tests
  // Withdrawal tests
  // Authorization tests
})
```

### Multi-Token NFT Tests

```typescript
describe('Multi-Token NFT - Token Creation', () => {
  // Creation tests
  // Minting tests
  // Transfer tests
  // Approval tests
  // Burning tests
})
```

## Test Helpers

### Available Helpers

```typescript
import {
  principal,      // Create principal
  uint,          // Create uint
  str,           // Create string
  buffer,        // Create buffer
  some,          // Create optional
  none,          // Create none
  assertOk,      // Assert ok result
  assertErr,     // Assert error result
  getValue,      // Get value from result
  expectEqual,   // Compare values
  formatTokenAmount,  // Format with decimals
  parseTokenAmount    // Parse with decimals
} from './helpers'
```

### Example Test

```typescript
it('should mint tokens to recipient', () => {
  const mintAmount = formatTokenAmount(100);

  const result = simnet.callPublicFn(
    'token-contract',
    'mint',
    [uint(mintAmount), principal(user1)],
    deployer
  );

  expect(result.isOk()).toBe(true);

  const balanceResult = simnet.callReadOnlyFn(
    'token-contract',
    'get-balance',
    [principal(user1)],
    deployer
  );

  expectEqual(balanceResult.value, Cl.ok(uint(mintAmount)));
});
```

## Coverage Reports

### Generate Coverage

```bash
npm run test:report
```

### View Coverage

Coverage reports are generated in:
- `coverage/` directory
- HTML report: `coverage/index.html`

### Coverage Goals

- Token Contract: 95%+
- Wallet-X Contract: 90%+
- Multi-Token NFT: 90%+

## Cost Analysis

### View Transaction Costs

```bash
npm run test:report
```

Costs are reported for:
- Each test case
- Total per contract
- Aggregate costs

## Debugging Tests

### Enable Debug Output

```bash
npm test -- --reporter=verbose
```

### Run Single Test

```typescript
it.only('should mint tokens', () => {
  // This test will run alone
})
```

### Skip Test

```typescript
it.skip('should mint tokens', () => {
  // This test will be skipped
})
```

## Best Practices

1. **Test Organization**
   - Group related tests with describe()
   - Use descriptive test names
   - One assertion per test when possible

2. **Test Data**
   - Use helpers for consistency
   - Create test fixtures in beforeEach()
   - Clean up after tests

3. **Error Testing**
   - Test all error conditions
   - Verify error codes
   - Test edge cases

4. **Performance**
   - Keep tests fast
   - Avoid unnecessary operations
   - Use batch operations when possible

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Commits to main
- Manual trigger

### Local Pre-commit

```bash
# Run tests before committing
npm test
```

## Troubleshooting

### Tests Fail with "Contract not found"
- Ensure Clarinet.toml is configured
- Check contract paths
- Verify contract names

### Tests Timeout
- Increase timeout in vitest.config.ts
- Check for infinite loops
- Verify network connectivity

### Coverage Not Generated
- Ensure --coverage flag is used
- Check write permissions
- Verify coverage configuration

## Support

For testing issues:
- Check test output carefully
- Review test helpers
- Compare with existing tests
- Check Clarinet documentation
