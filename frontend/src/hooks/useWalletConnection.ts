import { useCallback, useEffect, useState } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { connectStacksWallet, disconnectStacksWallet, isStacksWalletConnected } from '../config/stacks'
import { useWallet } from '../context/WalletContext'

export function useWalletConnection() {
    const { open: openAppKit } = useAppKit()
    const wallet = useWallet()
    const [isConnecting, setIsConnecting] = useState(false)

    // Connect EVM wallet
    const connectEVM = useCallback(async () => {
        setIsConnecting(true)
        try {
            await openAppKit()
        } catch (error) {
            console.error('Failed to connect EVM wallet:', error)
        } finally {
            setIsConnecting(false)
        }
    }, [openAppKit])

    // Connect Stacks wallet
    const connectStacks = useCallback(async () => {
        setIsConnecting(true)
        try {
            connectStacksWallet()
        } catch (error) {
            console.error('Failed to connect Stacks wallet:', error)
            setIsConnecting(false)
        }
    }, [])

    // Disconnect Stacks wallet
    const disconnectStacks = useCallback(() => {
        disconnectStacksWallet()
        wallet.refreshWalletStatus()
    }, [wallet])

    // Connect both wallets
    const connectBothWallets = useCallback(async () => {
        setIsConnecting(true)
        try {
            // Connect EVM first
            if (!wallet.evmWallet.isConnected) {
                await openAppKit()
            }
            
            // Then connect Stacks
            if (!wallet.stacksWallet.isConnected) {
                connectStacksWallet()
            }
        } catch (error) {
            console.error('Failed to connect wallets:', error)
        } finally {
            setIsConnecting(false)
        }
    }, [wallet, openAppKit])

    // Check if user has the required wallets installed
    const [hasStacksWallet, setHasStacksWallet] = useState(false)

    useEffect(() => {
        // Check if Stacks wallet is available
        const checkStacksWallet = () => {
            setHasStacksWallet(typeof window !== 'undefined' && 'StacksProvider' in window)
        }
        
        checkStacksWallet()
        
        // Recheck when window loads
        if (document.readyState === 'loading') {
            window.addEventListener('load', checkStacksWallet)
            return () => window.removeEventListener('load', checkStacksWallet)
        }
    }, [])

    return {
        // Connection methods
        connectEVM,
        connectStacks,
        disconnectStacks,
        connectBothWallets,
        
        // Status
        isConnecting,
        hasStacksWallet,
        
        // Wallet info (from context)
        ...wallet
    }
}