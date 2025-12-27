import { useAppKitAccount, useAppKit } from '@reown/appkit/react'

export function ConnectButton() {
    const { open } = useAppKit()
    const { isConnected, address } = useAppKitAccount()

    const displayAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : 'Connect Wallet'

    return (
        <button
            onClick={() => open()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
            {isConnected ? (
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    {displayAddress}
                </span>
            ) : (
                displayAddress
            )}
        </button>
    )
}
