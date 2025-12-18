
import { describe, expect, it } from "vitest";
import { standardPrincipalCV, uintCV } from "@stacks/transactions";

// Clarinet's simnet environment is provided globally by vitest-environment-clarinet
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

/*
  To learn more, read the testing documentation here:
  https://docs.hiro.so/stacks/clarinet-js-sdk
*/

describe("token-contract read-only functions", () => {
  it("simnet is initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("get-name returns the expected token name", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-name",
      [],
      deployer
    );

    // ResponseOkCV<StringUtf8CV> -> inner string is in result.value.value
    expect(result.value.value).toBe("Clarity Coin");
  });

  it("get-total-supply returns 0 before any minting", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",      // contract name from Clarinet.toml
      "get-total-supply",
      [],
      deployer
    );

    // ResponseOkCV<UIntCV> -> result.value.value is a bigint
    expect(result.value.value).toBe(0n);
  });

  it("get-balance returns 0 for a fresh account", () => {
    const { result } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [standardPrincipalCV(wallet1)],
      wallet1
    );

    // ResponseOkCV<UIntCV> -> result.value.value is a bigint
    expect(result.value.value).toBe(0n);
  });

  it("owner can mint within max supply and balances update", () => {
    // mint 100 units to wallet1
    const { result: mintResult } = simnet.callPublicFn(
      "token-contract",
      "mint",
      [uintCV(100n), standardPrincipalCV(wallet1)],
      deployer,
    );
    // ResponseOkCV<bool> -> result.type === "ok"
    expect(mintResult.type).toBe("ok");

    // total supply should now be 100
    const { result: supplyResult } = simnet.callReadOnlyFn(
      "token-contract",
      "get-total-supply",
      [],
      deployer,
    );
    expect(supplyResult.value.value).toBe(100n);

    // wallet1 balance should be 100
    const { result: balanceResult } = simnet.callReadOnlyFn(
      "token-contract",
      "get-balance",
      [standardPrincipalCV(wallet1)],
      wallet1,
    );
    expect(balanceResult.value.value).toBe(100n);
  });
});

