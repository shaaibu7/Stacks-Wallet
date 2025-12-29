import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useWalletConnection } from '../hooks/useWalletConnection'
import { WalletService } from '../services/walletService'
import { Link, useNavigate } from 'react-router-dom'
import { WalletFormValidation, walletNameRules, fundingAmountRules, useWalletFormValidation } from '../components/wallet/WalletFormValidation'
import { WalletCreationProgress, CreationStep } from '../components/wallet/WalletCreationProgress'
import { WalletPreview } from '../components/wallet/WalletPreview'

interface WalletFormData {
    walletName: string
    initialFunding: string
    description: string
}

export default function CreateWallet() {
    const { isBothWalletsConnected, stacksWallet } = useWalletConnection()
    const navigate = useNavigate()
    const [formData, setFormData] = useState<WalletFormData>({
        walletName: '',
        initialFunding: '',
        description: ''
    })
    const [isCreating, setIsCreating] = useState(false)
    const [creationStep, setCreationStep] = useState<CreationStep>('preparing')
    const [transactionId, setTransactionId] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [showPreview, setShowPreview] = useState(false)

    const {
        isFormValid,
        handleWalletNameValidation,
        handleFundingAmountValidation
    } = useWalletFormValidation()

    const handleInputChange = (field: keyof WalletFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCreateWallet = async () => {
        if (!isFormValid) return

        setIsCreating(true)
        setError('')
        
        try {
            // Step 1: Preparing
            setCreationStep('preparing')
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Step 2: Validating
            setCreationStep('validating')
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Step 3: Broadcasting
            setCreationStep('broadcasting')
            const result = await WalletService.createWallet({
                walletName: formData.walletName,
                fundAmount: parseFloat(formData.initialFunding)
            })

            if (result.success && result.txId) {
                setTransactionId(result.txId)
                
                // Step 4: Confirming
                setCreationStep('confirming')
                await new Promise(resolve => setTimeout(resolve, 2000))

                // Step 5: Completed
                setCreationStep('completed')
                
                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    navigate('/dashboard')
                }, 3000)
            } else {
                throw new Error(result.error || 'Unknown error occurred')
            }
        } catch (error) {
            console.error('Failed to create wallet:', error)
            setError(error instanceof Error ? error.message : 'Unknown error occurred')
            setCreationStep('failed')
        } finally {
            setIsCreating(false)
        }
    }

    const handleRetry = () => {
        setCreationStep('preparing')
        setError('')
        setTransactionId('')
        handleCreateWallet()
    }

    if (!isBothWalletsConnected) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Connect Your Wallets</CardTitle>
                        <CardDescription>
                            You need to connect both Ethereum and Stacks wallets to create a WalletX multi-signature wallet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-2 text-yellow-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="font-medium">Both wallets required</span>
                            </div>
                            <p className="text-yellow-700 text-sm mt-2">
                                WalletX requires both Ethereum and Stacks wallet connections for full functionality.
                            </p>
                        </div>
                        <Link to="/">
                            <Button className="w-full">
                                Go Back to Connect Wallets
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Show creation progress when creating
    if (isCreating || creationStep !== 'preparing') {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <WalletCreationProgress
                    currentStep={creationStep}
                    transactionId={transactionId}
                    error={error}
                    onRetry={handleRetry}
                />
            </div>
        )
    }

    // Main form
    return (
        <div className="max-w-6xl mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                    Create Multi-Signature Wallet
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Set up your secure multi-signature wallet for team collaboration and enhanced security.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Main Form */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wallet Configuration</CardTitle>
                            <CardDescription>
                                Configure your multi-signature wallet settings and initial funding.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Wallet Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Wallet Name *
                                </label>
                                <Input
                                    placeholder="e.g., Company Treasury, Team Wallet"
                                    value={formData.walletName}
                                    onChange={(e) => handleInputChange('walletName', e.target.value)}
                                />
                                <WalletFormValidation
                                    value={formData.walletName}
                                    rules={walletNameRules}
                                    onValidationChange={handleWalletNameValidation}
                                />
                                <p className="text-sm text-gray-500">
                                    Choose a descriptive name for your wallet that team members will recognize.
                                </p>
                            </div>

                            {/* Initial Funding */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Initial Funding Amount (STX) *
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={formData.initialFunding}
                                        onChange={(e) => handleInputChange('initialFunding', e.target.value)}
                                        min="0"
                                        step="0.000001"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">STX</span>
                                    </div>
                                </div>
                                <WalletFormValidation
                                    value={formData.initialFunding}
                                    rules={fundingAmountRules}
                                    onValidationChange={handleFundingAmountValidation}
                                />
                                <p className="text-sm text-gray-500">
                                    Amount of STX tokens to fund the wallet initially. You can add more funds later.
                                </p>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Description (Optional)
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    rows={3}
                                    placeholder="Brief description of the wallet's purpose..."
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                                <p className="text-sm text-gray-500">
                                    Optional description to help team members understand the wallet's purpose.
                                </p>
                            </div>

                            {/* Preview Toggle */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="showPreview"
                                    checked={showPreview}
                                    onChange={(e) => setShowPreview(e.target.checked)}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="showPreview" className="text-sm text-gray-700">
                                    Show wallet preview
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Link to="/dashboard" className="flex-1">
                            <Button variant="outline" className="w-full">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            onClick={handleCreateWallet}
                            disabled={!isFormValid || isCreating}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
                        >
                            Create Wallet
                        </Button>
                    </div>
                </div>

                {/* Sidebar - Preview or Info */}
                <div className="space-y-6">
                    {showPreview && formData.walletName && formData.initialFunding ? (
                        <WalletPreview
                            walletName={formData.walletName}
                            initialFunding={formData.initialFunding}
                            description={formData.description}
                        />
                    ) : (
                        <>
                            {/* Connected Wallet Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Connected Wallet</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm font-medium">Stacks Wallet</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-mono break-all">
                                        {stacksWallet.address ? 
                                            `${stacksWallet.address.slice(0, 8)}...${stacksWallet.address.slice(-6)}` : 
                                            'Connected'
                                        }
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Security Features */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Security Features</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium">Multi-Signature Security</p>
                                            <p className="text-xs text-gray-600">Require multiple approvals for transactions</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium">Non-Custodial</p>
                                            <p className="text-xs text-gray-600">You maintain full control of your keys</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium">Audit Trail</p>
                                            <p className="text-xs text-gray-600">Complete transaction history</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Next Steps */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">After Creation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="text-sm space-y-2">
                                        <p className="flex items-center gap-2">
                                            <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                            Add team members
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                            Set spending limits
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                            Configure permissions
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                            Start managing funds
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}