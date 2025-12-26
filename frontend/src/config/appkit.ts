
import { createAppKit } from '@reown/appkit/react'
import { wagmiAdapter, projectId } from './wagmi'
import { networks } from './networks'
import { QueryClient } from '@tanstack/react-query'

// 1. Setup QueryClient
export const queryClient = new QueryClient()

// 2. Create AppKit instance
export function initializeAppKit() {
    createAppKit({
        adapters: [wagmiAdapter],
        networks,
        projectId,
        features: {
            email: true,
            socials: ['google', 'x', 'github', 'discord', 'apple'],
            emailShowWallets: true,
        },
        themeMode: 'light'
    })
}
