
import { Link } from 'react-router-dom'
import { ConnectButton } from '../ConnectButton'

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                            Stacks Wallet
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <ConnectButton />
                </div>
            </div>
        </header>
    )
}
