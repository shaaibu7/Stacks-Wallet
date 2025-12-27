
import { Link } from 'react-router-dom'
import { ConnectButton } from '../ConnectButton'
import { useWalletConnection } from '../../hooks/useWalletConnection'

export default function Navbar() {
    const { isAnyWalletConnected, isBothWalletsConnected } = useWalletConnection()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">W</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                            WalletX
                        </span>
                    </Link>
                    
                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6">
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
                
                <div className="flex items-center gap-4">
                    {/* Connection Status Indicator */}
                    {isAnyWalletConnected && (
                        <div className="hidden sm:flex items-center gap-2">
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
