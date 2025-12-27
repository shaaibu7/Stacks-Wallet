import { useState, useEffect } from 'react'

export interface ValidationRule {
    test: (value: string) => boolean
    message: string
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

interface WalletFormValidationProps {
    value: string
    rules: ValidationRule[]
    onValidationChange?: (result: ValidationResult) => void
    showErrors?: boolean
    className?: string
}

export function WalletFormValidation({ 
    value, 
    rules, 
    onValidationChange, 
    showErrors = true,
    className = ""
}: WalletFormValidationProps) {
    const [validationResult, setValidationResult] = useState<ValidationResult>({
        isValid: true,
        errors: []
    })

    useEffect(() => {
        const errors: string[] = []
        
        rules.forEach(rule => {
            if (!rule.test(value)) {
                errors.push(rule.message)
            }
        })

        const result = {
            isValid: errors.length === 0,
            errors
        }

        setValidationResult(result)
        onValidationChange?.(result)
    }, [value, rules, onValidationChange])

    if (!showErrors || validationResult.isValid) {
        return null
    }

    return (
        <div className={`space-y-1 ${className}`}>
            {validationResult.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            ))}
        </div>
    )
}

// Predefined validation rules for wallet creation
export const walletNameRules: ValidationRule[] = [
    {
        test: (value) => value.trim().length >= 3,
        message: 'Wallet name must be at least 3 characters long'
    },
    {
        test: (value) => value.trim().length <= 50,
        message: 'Wallet name must be less than 50 characters'
    },
    {
        test: (value) => /^[a-zA-Z0-9\s\-_]+$/.test(value.trim()),
        message: 'Wallet name can only contain letters, numbers, spaces, hyphens, and underscores'
    },
    {
        test: (value) => value.trim().length > 0,
        message: 'Wallet name is required'
    }
]

export const fundingAmountRules: ValidationRule[] = [
    {
        test: (value) => value.trim().length > 0,
        message: 'Funding amount is required'
    },
    {
        test: (value) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value)),
        message: 'Please enter a valid number'
    },
    {
        test: (value) => parseFloat(value) > 0,
        message: 'Amount must be greater than 0'
    },
    {
        test: (value) => parseFloat(value) <= 1000000,
        message: 'Amount cannot exceed 1,000,000 STX'
    },
    {
        test: (value) => {
            const num = parseFloat(value)
            return num >= 0.000001 // Minimum STX amount (1 microSTX)
        },
        message: 'Minimum amount is 0.000001 STX'
    }
]

// Real-time validation hook
export function useWalletFormValidation() {
    const [walletNameValid, setWalletNameValid] = useState(false)
    const [fundingAmountValid, setFundingAmountValid] = useState(false)
    const [walletNameErrors, setWalletNameErrors] = useState<string[]>([])
    const [fundingAmountErrors, setFundingAmountErrors] = useState<string[]>([])

    const handleWalletNameValidation = (result: ValidationResult) => {
        setWalletNameValid(result.isValid)
        setWalletNameErrors(result.errors)
    }

    const handleFundingAmountValidation = (result: ValidationResult) => {
        setFundingAmountValid(result.isValid)
        setFundingAmountErrors(result.errors)
    }

    const isFormValid = walletNameValid && fundingAmountValid

    return {
        walletNameValid,
        fundingAmountValid,
        walletNameErrors,
        fundingAmountErrors,
        isFormValid,
        handleWalletNameValidation,
        handleFundingAmountValidation
    }
}