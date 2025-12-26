
// Basic Stacks network configuration for use with @stacks/connect
import { StacksTestnet, StacksMainnet } from '@stacks/network';

export const stacksNetworks = {
    testnet: new StacksTestnet(),
    mainnet: new StacksMainnet(),
};

export const activeStacksNetwork = stacksNetworks.testnet;
