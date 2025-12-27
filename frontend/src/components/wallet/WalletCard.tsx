import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Link } from 'react-router-dom'

interface WalletInfo {
    id: string
    name: string
    balance: number
    memberCount: number
    transactionCount: number
    isActive: boolean
    createdAt: string
    adminAddress: string
}

interface WalletCardProps {
    wallet: WalletInfo
    onManage?: (walletId: string) => void
    onFreeze?: (walletId: string) => void
    onUnfreeze?: (walletId: string) => void
}

export function WalletCard({ wallet, onManage, onFreeze, onUnfreeze }: WalletCardProps) {
    const formatSTX = (amount: number) => {
        return (amount / 1000000).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 6 
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <Card className={`transition-all duration-200 hover:shadow-lg ${
            wallet.isActive ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
        }`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            {wallet.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                wallet.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`text-sm font-medium ${
                                wallet.isActive ? 'text-green-700' : 'text-red-700'
                            }`}>
                                {wallet.isActive ? 'Active' : 'Frozen'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                            {formatSTX(wallet.balance)}
                        </p>
                        <p className="text-sm text-gray-500">STX</p>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Wallet Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-lg font-semibold text-gray-900">{wallet.memberCount}</p>
                        <p className="text-xs text-gray-500">Members</p>
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-900">{wallet.transactionCount}</p>
                        <p className="text-xs text-gray-500">Transactions</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-700">Created</p>
                        <p className="text-xs text-gray-500">{formatDate(wallet.createdAt)}</p>
                    </div>
                </div>

                {/* Admin Address */}
                <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Admin Address</p>
                    <p className="text-xs font-mono text-gray-600 break-all">
                        {wallet.adminAddress}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => onManage?.(wallet.id)}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage
                    </Button>
                    
                    {wallet.isActive ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onFreeze?.(wallet.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-2.121-2.121m0 0L12 15l-2.121-2.121M15 12l-2.121-2.121M12 15l.707.707M9 12l2.121-2.121M12 15l-2.121 2.121M15 12l2.121 2.121" />
                            </svg>
                            Freeze
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUnfreeze?.(wallet.id)}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Unfreeze
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Empty state component for when no wallets exist
export function EmptyWalletState() {
    return (
        <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wallets Created</h3>
                <p className="text-gray-600 mb-6 max-w-sm">
                    Create your first multi-signature wallet to start managing digital assets with your team.
                </p>
                <Link to="/create-wallet">
                    <Button className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Your First Wallet
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}