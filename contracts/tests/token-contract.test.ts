import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Token Contract - Basic Functionality", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("should return correct token name", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-name",
      [],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBe("Clarity Coin");
  });

  it("should return correct token symbol", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-symbol",
      [],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBe("CC");
  });

  it("should return correct token decimals", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-decimals",
      [],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBeUint(6);
  });

  it("should return token URI", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-token-uri",
      [],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBeSome();
  });

  it("should return initial total supply of 0", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBeUint(0);
  });
});

describe("Token Contract - Minting", () => {
  it("should allow owner to mint tokens", () => {
    const amount = 1000000;
    const { result } = simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.tupleCV({ amount: simnet.uintCV(amount), recipient: simnet.principalCV(wallet1) })],
      deployer
    );
    expect(result).toBeOk();
  });

  it("should increase balance after minting", () => {
    const amount = 5000000;
    simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(amount), simnet.principalCV(wallet1)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet1)],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBeUint(amount);
  });

  it("should increase total supply after minting", () => {
    const amount = 2000000;
    simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(amount), simnet.principalCV(wallet1)],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-total-supply",
      [],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBeUint(amount);
  });

  it("should not allow non-owner to mint tokens", () => {
    const amount = 1000000;
    const { result } = simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(amount), simnet.principalCV(wallet2)],
      wallet1
    );
    expect(result).toBeErr();
    expect(result.value).toBeUint(100); // ERR_OWNER_ONLY
  });

  it("should handle multiple mint operations", () => {
    const amount1 = 1000000;
    const amount2 = 2000000;

    simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(amount1), simnet.principalCV(wallet1)],
      deployer
    );

    simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(amount2), simnet.principalCV(wallet2)],
      deployer
    );

    const { result: balance1 } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet1)],
      deployer
    );

    const { result: balance2 } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet2)],
      deployer
    );

    expect(balance1.value).toBeUint(amount1);
    expect(balance2.value).toBeUint(amount2);
  });
});

describe("Token Contract - Transfers", () => {
  beforeEach(() => {
    // Mint tokens to wallet1 before each transfer test
    simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(10000000), simnet.principalCV(wallet1)],
      deployer
    );
  });

  it("should allow token transfer between accounts", () => {
    const amount = 1000000;
    const { result } = simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount),
        simnet.principalCV(wallet1),
        simnet.principalCV(wallet2),
        simnet.noneCV(),
      ],
      wallet1
    );
    expect(result).toBeOk();
  });

  it("should decrease sender balance after transfer", () => {
    const amount = 2000000;
    const initialBalance = 10000000;

    simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount),
        simnet.principalCV(wallet1),
        simnet.principalCV(wallet2),
        simnet.noneCV(),
      ],
      wallet1
    );

    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet1)],
      deployer
    );
    expect(result.value).toBeUint(initialBalance - amount);
  });

  it("should increase recipient balance after transfer", () => {
    const amount = 3000000;

    simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount),
        simnet.principalCV(wallet1),
        simnet.principalCV(wallet2),
        simnet.noneCV(),
      ],
      wallet1
    );

    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet2)],
      deployer
    );
    expect(result.value).toBeUint(amount);
  });

  it("should not allow transfer of more than balance", () => {
    const amount = 20000000; // More than minted
    const { result } = simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount),
        simnet.principalCV(wallet1),
        simnet.principalCV(wallet2),
        simnet.noneCV(),
      ],
      wallet1
    );
    expect(result).toBeErr();
  });

  it("should not allow transfer from account without tokens", () => {
    const amount = 1000000;
    const { result } = simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount),
        simnet.principalCV(wallet3),
        simnet.principalCV(wallet2),
        simnet.noneCV(),
      ],
      wallet3
    );
    expect(result).toBeErr();
  });

  it("should not allow unauthorized transfer", () => {
    const amount = 1000000;
    const { result } = simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount),
        simnet.principalCV(wallet1),
        simnet.principalCV(wallet2),
        simnet.noneCV(),
      ],
      wallet3 // Not the sender
    );
    expect(result).toBeErr();
    expect(result.value).toBeUint(101); // ERR_NOT_TOKEN_OWNER
  });

  it("should handle transfer with memo", () => {
    const amount = 1000000;
    const memo = simnet.bufferCV(Buffer.from("Payment for services"));

    const { result } = simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount),
        simnet.principalCV(wallet1),
        simnet.principalCV(wallet2),
        simnet.someCV(memo),
      ],
      wallet1
    );
    expect(result).toBeOk();
  });

  it("should handle multiple sequential transfers", () => {
    const amount1 = 1000000;
    const amount2 = 2000000;

    simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount1),
        simnet.principalCV(wallet1),
        simnet.principalCV(wallet2),
        simnet.noneCV(),
      ],
      wallet1
    );

    simnet.callPublicFn(
      "token-contract",
      "transfer",
      [
        simnet.uintCV(amount2),
        simnet.principalCV(wallet1),
        simnet.principalCV(wallet3),
        simnet.noneCV(),
      ],
      wallet1
    );

    const { result: balance1 } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet1)],
      deployer
    );

    const { result: balance2 } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet2)],
      deployer
    );

    const { result: balance3 } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet3)],
      deployer
    );

    expect(balance1.value).toBeUint(10000000 - amount1 - amount2);
    expect(balance2.value).toBeUint(amount1);
    expect(balance3.value).toBeUint(amount2);
  });
});

describe("Token Contract - Token URI Management", () => {
  it("should allow owner to set token URI", () => {
    const newUri = simnet.bufferCV(Buffer.from("https://example.com/metadata.json"));
    const { result } = simnet.callPublicFn(
      "token-contract",
      "set-token-uri",
      [newUri],
      deployer
    );
    expect(result).toBeOk();
  });

  it("should not allow non-owner to set token URI", () => {
    const newUri = simnet.bufferCV(Buffer.from("https://example.com/metadata.json"));
    const { result } = simnet.callPublicFn(
      "token-contract",
      "set-token-uri",
      [newUri],
      wallet1
    );
    expect(result).toBeErr();
    expect(result.value).toBeUint(100); // ERR_OWNER_ONLY
  });

  it("should update token URI correctly", () => {
    const newUri = simnet.bufferCV(Buffer.from("https://newuri.com/metadata.json"));
    simnet.callPublicFn(
      "token-contract",
      "set-token-uri",
      [newUri],
      deployer
    );

    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-token-uri",
      [],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBeSome();
  });
});

describe("Token Contract - Edge Cases", () => {
  it("should handle zero balance query", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet1)],
      deployer
    );
    expect(result).toBeOk();
    expect(result.value).toBeUint(0);
  });

  it("should handle large token amounts", () => {
    const largeAmount = 999999999999; // Large but valid amount
    const { result } = simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(largeAmount), simnet.principalCV(wallet1)],
      deployer
    );
    expect(result).toBeOk();
  });

  it("should maintain total supply consistency", () => {
    const amount1 = 1000000;
    const amount2 = 2000000;

    simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(amount1), simnet.principalCV(wallet1)],
      deployer
    );

    simnet.callPublicFn(
      "token-contract",
      "mint",
      [simnet.uintCV(amount2), simnet.principalCV(wallet2)],
      deployer
    );

    const { result: supply } = simnet.callReadOnlyFn(
      "token-contract",
      "get-total-supply",
      [],
      deployer
    );

    const { result: balance1 } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet1)],
      deployer
    );

    const { result: balance2 } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [simnet.principalCV(wallet2)],
      deployer
    );

    expect(supply.value).toBeUint(amount1 + amount2);
    expect(balance1.value).toBeUint(amount1);
    expect(balance2.value).toBeUint(amount2);
  });
});
