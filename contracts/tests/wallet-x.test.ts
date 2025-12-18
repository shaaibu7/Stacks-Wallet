import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("WalletX Contract Tests", () => {
  it("should register a new wallet", () => {
    const { result } = simnet.callPublicFn(
      "wallet-x",
      "register-wallet",
      [
        Cl.stringUtf8("Test Organization"),
        Cl.uint(1000000),
        Cl.contractPrincipal(simnet.deployer, "token-contract")
      ],
      address1
    );
    
    expect(result).toBeOk(Cl.uint(1));
  });

  it("should get wallet admin info", () => {
    // First register a wallet
    simnet.callPublicFn(
      "wallet-x",
      "register-wallet",
      [
        Cl.stringUtf8("Test Organization"),
        Cl.uint(1000000),
        Cl.contractPrincipal(simnet.deployer, "token-contract")
      ],
      address1
    );

    const { result } = simnet.callReadOnlyFn(
      "wallet-x",
      "get-wallet-admin",
      [Cl.principal(address1)],
      address1
    );
    
    expect(result).toBeSome();
  });

  it("should onboard a member", () => {
    // First register a wallet
    simnet.callPublicFn(
      "wallet-x",
      "register-wallet",
      [
        Cl.stringUtf8("Test Organization"),
        Cl.uint(1000000),
        Cl.contractPrincipal(simnet.deployer, "token-contract")
      ],
      address1
    );

    const { result } = simnet.callPublicFn(
      "wallet-x",
      "onboard-member",
      [
        Cl.principal(address2),
        Cl.stringUtf8("Test Member"),
        Cl.uint(500000),
        Cl.uint(1)
      ],
      address1
    );
    
    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get member info", () => {
    // Register wallet and onboard member
    simnet.callPublicFn(
      "wallet-x",
      "register-wallet",
      [
        Cl.stringUtf8("Test Organization"),
        Cl.uint(1000000),
        Cl.contractPrincipal(simnet.deployer, "token-contract")
      ],
      address1
    );

    simnet.callPublicFn(
      "wallet-x",
      "onboard-member",
      [
        Cl.principal(address2),
        Cl.stringUtf8("Test Member"),
        Cl.uint(500000),
        Cl.uint(1)
      ],
      address1
    );

    const { result } = simnet.callReadOnlyFn(
      "wallet-x",
      "get-member",
      [Cl.principal(address2)],
      address1
    );
    
    expect(result).toBeSome();
  });
});