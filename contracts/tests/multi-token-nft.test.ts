import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Multi-Token NFT Contract", () => {
  beforeEach(() => {
    // Reset simnet state before each test
  });

  describe("Token Creation", () => {
    it("should create a new token type", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("should increment token ID for each new token", () => {
      // Create first token
      simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );

      // Create second token
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(50), Cl.stringUtf8("https://example.com/token/2")],
        deployer
      );

      expect(result).toBeOk(Cl.uint(2));
    });

    it("should fail to create token with zero supply", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(0), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR_INVALID_AMOUNT
    });
  });

  describe("Balance Queries", () => {
    beforeEach(() => {
      // Create a token for testing
      simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );
    });

    it("should return correct balance for token owner", () => {
      const { result } = simnet.callReadOnlyFn(
        "multi-token-nft",
        "balance-of",
        [Cl.principal(deployer), Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(100));
    });

    it("should return zero balance for non-owner", () => {
      const { result } = simnet.callReadOnlyFn(
        "multi-token-nft",
        "balance-of",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(0));
    });

    it("should return correct total supply", () => {
      const { result } = simnet.callReadOnlyFn(
        "multi-token-nft",
        "total-supply",
        [Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(100));
    });
  });

  describe("Transfers", () => {
    beforeEach(() => {
      // Create a token for testing
      simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );
    });

    it("should transfer tokens successfully", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "safe-transfer-from",
        [
          Cl.principal(deployer),
          Cl.principal(wallet1),
          Cl.uint(1),
          Cl.uint(50),
          Cl.none()
        ],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check balances after transfer
      const senderBalance = simnet.callReadOnlyFn(
        "multi-token-nft",
        "balance-of",
        [Cl.principal(deployer), Cl.uint(1)],
        deployer
      );
      expect(senderBalance.result).toBeOk(Cl.uint(50));

      const receiverBalance = simnet.callReadOnlyFn(
        "multi-token-nft",
        "balance-of",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );
      expect(receiverBalance.result).toBeOk(Cl.uint(50));
    });

    it("should fail transfer with insufficient balance", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "safe-transfer-from",
        [
          Cl.principal(deployer),
          Cl.principal(wallet1),
          Cl.uint(1),
          Cl.uint(150), // More than available
          Cl.none()
        ],
        deployer
      );

      expect(result).toBeErr(Cl.uint(102)); // ERR_INSUFFICIENT_BALANCE
    });

    it("should fail unauthorized transfer", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "safe-transfer-from",
        [
          Cl.principal(deployer),
          Cl.principal(wallet2),
          Cl.uint(1),
          Cl.uint(50),
          Cl.none()
        ],
        wallet1 // wallet1 trying to transfer deployer's tokens
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR_UNAUTHORIZED
    });
  });

  describe("Approvals", () => {
    beforeEach(() => {
      // Create a token for testing
      simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );
    });

    it("should set approval for all tokens", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "set-approval-for-all",
        [Cl.principal(wallet1), Cl.bool(true)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check approval status
      const approvalResult = simnet.callReadOnlyFn(
        "multi-token-nft",
        "is-approved-for-all",
        [Cl.principal(deployer), Cl.principal(wallet1)],
        deployer
      );
      expect(approvalResult.result).toBeOk(Cl.bool(true));
    });

    it("should allow approved operator to transfer", () => {
      // Set approval
      simnet.callPublicFn(
        "multi-token-nft",
        "set-approval-for-all",
        [Cl.principal(wallet1), Cl.bool(true)],
        deployer
      );

      // Transfer as approved operator
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "safe-transfer-from",
        [
          Cl.principal(deployer),
          Cl.principal(wallet2),
          Cl.uint(1),
          Cl.uint(50),
          Cl.none()
        ],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Minting", () => {
    beforeEach(() => {
      // Create a token for testing
      simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );
    });

    it("should allow creator to mint additional tokens", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "mint",
        [Cl.principal(wallet1), Cl.uint(1), Cl.uint(50)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check new balance
      const balance = simnet.callReadOnlyFn(
        "multi-token-nft",
        "balance-of",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );
      expect(balance.result).toBeOk(Cl.uint(50));

      // Check updated total supply
      const supply = simnet.callReadOnlyFn(
        "multi-token-nft",
        "total-supply",
        [Cl.uint(1)],
        deployer
      );
      expect(supply.result).toBeOk(Cl.uint(150));
    });

    it("should fail minting by non-creator", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "mint",
        [Cl.principal(wallet2), Cl.uint(1), Cl.uint(50)],
        wallet1 // Not the creator
      );

      expect(result).toBeErr(Cl.uint(105)); // ERR_UNAUTHORIZED
    });
  });

  describe("Burning", () => {
    beforeEach(() => {
      // Create a token and transfer some to wallet1
      simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );
      simnet.callPublicFn(
        "multi-token-nft",
        "safe-transfer-from",
        [
          Cl.principal(deployer),
          Cl.principal(wallet1),
          Cl.uint(1),
          Cl.uint(50),
          Cl.none()
        ],
        deployer
      );
    });

    it("should burn tokens successfully", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "burn",
        [Cl.principal(wallet1), Cl.uint(1), Cl.uint(25)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check updated balance
      const balance = simnet.callReadOnlyFn(
        "multi-token-nft",
        "balance-of",
        [Cl.principal(wallet1), Cl.uint(1)],
        deployer
      );
      expect(balance.result).toBeOk(Cl.uint(25));

      // Check updated total supply
      const supply = simnet.callReadOnlyFn(
        "multi-token-nft",
        "total-supply",
        [Cl.uint(1)],
        deployer
      );
      expect(supply.result).toBeOk(Cl.uint(75));
    });

    it("should fail burning more than balance", () => {
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "burn",
        [Cl.principal(wallet1), Cl.uint(1), Cl.uint(100)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(102)); // ERR_INSUFFICIENT_BALANCE
    });
  });

  describe("Metadata", () => {
    it("should return token URI", () => {
      // Create token with URI
      simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "multi-token-nft",
        "get-token-uri",
        [Cl.uint(1)],
        deployer
      );

      expect(result).toBeOk(Cl.some(Cl.stringUtf8("https://example.com/token/1")));
    });

    it("should allow creator to update token URI", () => {
      // Create token
      simnet.callPublicFn(
        "multi-token-nft",
        "create-token",
        [Cl.uint(100), Cl.stringUtf8("https://example.com/token/1")],
        deployer
      );

      // Update URI
      const { result } = simnet.callPublicFn(
        "multi-token-nft",
        "set-token-uri",
        [Cl.uint(1), Cl.stringUtf8("https://example.com/token/1/updated")],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check updated URI
      const uriResult = simnet.callReadOnlyFn(
        "multi-token-nft",
        "get-token-uri",
        [Cl.uint(1)],
        deployer
      );
      expect(uriResult.result).toBeOk(Cl.some(Cl.stringUtf8("https://example.com/token/1/updated")));
    });
  });
});