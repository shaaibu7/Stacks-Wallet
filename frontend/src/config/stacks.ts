
// Basic Stacks network configuration for use with @stacks/connect
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export const stacksNetworks = {
    testnet: STACKS_TESTNET,
    mainnet: STACKS_MAINNET,
};

export const activeStacksNetwork = stacksNetworks.testnet;
