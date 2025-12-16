
import { describe, expect, it } from "vitest";
import { standardPrincipalCV } from "@stacks/transactions";

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
});

