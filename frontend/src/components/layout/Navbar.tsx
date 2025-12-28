
import { Link } from 'react-router-dom'
import { ConnectButton } from '../ConnectButton'
import { useWalletConnection } from '../../hooks/useWalletConnection'
import { Button } from '../ui/Button'

export default function Navbar() {
    const { isAnyWalletConnected, isBothWalletsConnected } = useWalletConnection()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex transition-all duration-300 h-16 items-center justify-between px-4">
                <div className="flex transition-all duration-300 items-center gap-6">
                    <Link to="/" className="flex transition-all duration-300 items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg flex transition-all duration-300 items-center justify-center">
                            <span className="text-white font-bold text-sm">W</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                            WalletX
                        </span>
                    </Link>
                    
                    {/* Navigation Links */}
                    <nav className="hidden md:flex transition-all duration-300 items-center gap-6">
                        <Link 
                            to="/" 
                            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/dashboard" 
                            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                        >
                            Dashboard
                        </Link>
                        {isBothWalletsConnected && (
                            <Link 
                                to="/create-wallet" 
                                className="text-orange-600 hover:text-orange-700 transition-colors font-medium flex transition-all duration-300 items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Wallet
                            </Link>
                        )}
                        <a 
                            href="#features" 
                            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                        >
                            Features
                        </a>
                        <a 
                            href="#how-it-works" 
                            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                        >
                            How it Works
                        </a>
                    </nav>
                </div>
                
                <div className="flex transition-all duration-300 items-center gap-4">
                    {/* Create Wallet Button */}
                    {isBothWalletsConnected && (
                        <Link to="/create-wallet">
                            <Button 
                                size="sm" 
                                className="hidden sm:flex transition-all duration-300 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Wallet
                            </Button>
                        </Link>
                    )}

                    {/* Connection Status Indicator */}
                    {isAnyWalletConnected && (
                        <div className="hidden sm:flex transition-all duration-300 items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                isBothWalletsConnected ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm text-gray-600">
                                {isBothWalletsConnected ? 'Fully Connected' : 'Partially Connected'}
                            </span>
                        </div>
                    )}
                    
                    <ConnectButton />
                </div>
            </div>
        </header>
    )
}
