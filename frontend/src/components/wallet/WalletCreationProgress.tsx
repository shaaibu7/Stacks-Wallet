import { useEffect, useState } from 'react'

export type CreationStep = 'preparing' | 'validating' | 'broadcasting' | 'confirming' | 'completed' | 'failed'

interface ProgressStep {
    id: CreationStep
    label: string
    description: string
    icon: React.ReactNode
}

interface WalletCreationProgressProps {
    currentStep: CreationStep
    transactionId?: string
    error?: string
    onRetry?: () => void
}

export function WalletCreationProgress({ 
    currentStep, 
    transactionId, 
    error, 
    onRetry 
}: WalletCreationProgressProps) {
    const [progress, setProgress] = useState(0)

    const steps: ProgressStep[] = [
        {
            id: 'preparing',
            label: 'Preparing Transaction',
            description: 'Setting up wallet parameters and validating inputs',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            id: 'validating',
            label: 'Validating Wallet',
            description: 'Checking wallet configuration and permissions',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'broadcasting',
            label: 'Broadcasting to Network',
            description: 'Submitting transaction to the Stacks blockchain',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
            )
        },
        {
            id: 'confirming',
            label: 'Awaiting Confirmation',
            description: 'Waiting for blockchain confirmation',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'completed',
            label: 'Wallet Created',
            description: 'Your multi-signature wallet has been successfully created',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        }
    ]

    useEffect(() => {
        const stepIndex = steps.findIndex(step => step.id === currentStep)
        if (stepIndex !== -1) {
            setProgress(((stepIndex + 1) / steps.length) * 100)
        }
    }, [currentStep, steps.length])

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.id === currentStep)
    }

    const getStepStatus = (stepId: CreationStep) => {
        const currentIndex = getCurrentStepIndex()
        const stepIndex = steps.findIndex(step => step.id === stepId)
        
        if (currentStep === 'failed') {
            return stepIndex <= currentIndex ? 'error' : 'pending'
        }
        
        if (stepIndex < currentIndex) return 'completed'
        if (stepIndex === currentIndex) return 'active'
        return 'pending'
    }

    if (currentStep === 'failed') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-800">Wallet Creation Failed</h3>
                        <p className="text-red-700">There was an error creating your wallet</p>
                    </div>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-800 font-mono">{error}</p>
                    </div>
                )}
                
                <div className="flex gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Creation Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.id)
                    const isActive = status === 'active'
                    const isCompleted = status === 'completed'
                    const isError = status === 'error'
                    
                    return (
                        <div key={step.id} className="flex items-start gap-4">
                            {/* Step Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isCompleted 
                                    ? 'bg-green-100 border-green-500 text-green-600' 
                                    : isActive 
                                        ? 'bg-orange-100 border-orange-500 text-orange-600 animate-pulse' 
                                        : isError
                                            ? 'bg-red-100 border-red-500 text-red-600'
                                            : 'bg-gray-100 border-gray-300 text-gray-400'
                            }`}>
                                {isActive ? (
                                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : isCompleted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.icon
                                )}
                            </div>

                            {/* Step Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-medium ${
                                    isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                    {step.label}
                                </h4>
                                <p className={`text-sm ${
                                    isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                    {step.description}
                                </p>
                                
                                {/* Transaction ID for completed state */}
                                {isCompleted && step.id === 'broadcasting' && transactionId && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                                        <p className="text-xs text-gray-600 mb-1">Transaction ID:</p>
                                        <p className="text-xs font-mono text-gray-800 break-all">{transactionId}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Completion Message */}
            {currentStep === 'completed' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Wallet created successfully!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                        You can now add team members and start managing your digital assets.
                    </p>
                </div>
            )}
        </div>
    )
}