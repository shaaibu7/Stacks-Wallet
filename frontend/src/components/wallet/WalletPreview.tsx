import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { useWalletConnection } from '../../hooks/useWalletConnection'

interface WalletPreviewProps {
    walletName: string
    initialFunding: string
    description?: string
}

export function WalletPreview({ walletName, initialFunding, description }: WalletPreviewProps) {
    const { stacksWallet } = useWalletConnection()

    const formatSTXAmount = (amount: string) => {
        const num = parseFloat(amount)
        if (isNaN(num)) return '0.000000'
        return num.toLocaleString('en-US', { 
            minimumFractionDigits: 6, 
            maximumFractionDigits: 6 
        })
    }

    const calculateUSDValue = (stxAmount: string) => {
        // Mock STX price - in a real app, you'd fetch this from an API
        const stxPrice = 0.65 // $0.65 per STX
        const num = parseFloat(stxAmount)
        if (isNaN(num)) return '0.00'
        return (num * stxPrice).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })
    }

    return (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Wallet Preview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Wallet Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Wallet Name</label>
                    <div className="p-3 bg-white border border-gray-200 rounded-md">
                        <p className="font-medium text-gray-900">
                            {walletName || 'Untitled Wallet'}
                        </p>
                    </div>
                </div>

                {/* Admin Address */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Admin Address</label>
                    <div className="p-3 bg-white border border-gray-200 rounded-md">
                        <p className="font-mono text-sm text-gray-700 break-all">
                            {stacksWallet.address ? 
                                stacksWallet.address : 
                                'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
                            }
                        </p>
                    </div>
                </div>

                {/* Initial Funding */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Initial Funding</label>
                    <div className="p-3 bg-white border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">
                                    {formatSTXAmount(initialFunding)} STX
                                </p>
                                <p className="text-sm text-gray-500">
                                    ≈ ${calculateUSDValue(initialFunding)} USD
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <div className="p-3 bg-white border border-gray-200 rounded-md">
                            <p className="text-gray-700 text-sm">
                                {description}
                            </p>
                        </div>
                    </div>
                )}

                {/* Wallet Configuration */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Configuration</label>
                    <div className="p-3 bg-white border border-gray-200 rounded-md space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Wallet Type:</span>
                            <span className="font-medium text-gray-900">Multi-Signature</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Network:</span>
                            <span className="font-medium text-gray-900">Stacks Testnet</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Initial Members:</span>
                            <span className="font-medium text-gray-900">1 (Admin)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Required Signatures:</span>
                            <span className="font-medium text-gray-900">1 of 1</span>
                        </div>
                    </div>
                </div>

                {/* Security Features */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Security Features</label>
                    <div className="p-3 bg-white border border-gray-200 rounded-md">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Non-custodial wallet</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Multi-signature security</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Complete transaction history</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">Member management controls</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">After Creation</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                        <p>• Add team members to your wallet</p>
                        <p>• Set individual spending limits</p>
                        <p>• Configure approval requirements</p>
                        <p>• Start managing your digital assets</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}