import { useAppKitAccount, useAppKit } from '@reown/appkit/react'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useEffect, useState } from 'react'
import { connectStacksWallet, isStacksWalletConnected, getStacksUserData, disconnectStacksWallet } from '../config/stacks'

export function ConnectButton() {
    const { open } = useAppKit()
    const { isConnected, address } = useAppKitAccount()
    const [stacksConnected, setStacksConnected] = useState(false)
    const [stacksAddress, setStacksAddress] = useState<string | null>(null)

    useEffect(() => {
        const checkStacksConnection = () => {
            const connected = isStacksWalletConnected()
            setStacksConnected(connected)
            
            if (connected) {
                const userData = getStacksUserData()
                setStacksAddress(userData?.profile?.stxAddress?.testnet || null)
            }
        }

        checkStacksConnection()
        // Check connection status on component mount and when window gains focus
        window.addEventListener('focus', checkStacksConnection)
        
        return () => window.removeEventListener('focus', checkStacksConnection)
    }, [])

    const handleStacksConnect = () => {
        connectStacksWallet()
    }

    const handleStacksDisconnect = () => {
        disconnectStacksWallet()
    }

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Ethereum/EVM Wallet Connection */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Ethereum Wallet</label>
                {isConnected ? (
                    <button
                        onClick={() => open()}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200 hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                        {formatAddress(address || '')}
                    </button>
                ) : (
                    <button
                        onClick={() => open()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        Connect Ethereum
                    </button>
                )}
            </div>

            {/* Stacks Wallet Connection */}
            <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Stacks Wallet</label>
                {stacksConnected ? (
                    <button
                        onClick={handleStacksDisconnect}
                        className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-200 hover:bg-orange-200 transition-colors text-sm font-medium"
                    >
                        {stacksAddress ? formatAddress(stacksAddress) : 'Connected'}
                    </button>
                ) : (
                    <button
                        onClick={handleStacksConnect}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
                    >
                        Connect Stacks
                    </button>
                )}
            </div>
        </div>
    )
}
