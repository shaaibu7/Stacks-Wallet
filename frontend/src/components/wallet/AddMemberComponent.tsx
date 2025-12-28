import { useState, useEffect } from 'react'
import { WalletInfoDisplay } from './WalletInfoDisplay'
import { MemberListComponent } from './MemberListComponent'
import { AddMemberForm } from './AddMemberForm'
import { WalletService, MemberInfo, AddMemberParams } from '../../services/walletService'

interface AddMemberComponentProps {
    walletAddress: string
    onMemberAdded?: (member: AddMemberParams) => void
    onError?: (error: string) => void
    className?: string
}

interface WalletData {
    balance: number
    memberCount: number
    walletName: string
    members: MemberInfo[]
}

export function AddMemberComponent({ 
    walletAddress, 
    onMemberAdded, 
    onError,
    className = '' 
}: AddMemberComponentProps) {
    const [walletData, setWalletData] = useState<WalletData>({
        balance: 0,
        memberCount: 0,
        walletName: 'My Wallet',
        members: []
    })
    const [isLoading, setIsLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // Fetch wallet data and members
    useEffect(() => {
        const fetchWalletData = async () => {
            setIsLoading(true)
            try {
                // Fetch wallet info and members in parallel
                const [walletInfo, members] = await Promise.all([
                    WalletService.getWalletInfo(walletAddress),
                    WalletService.getWalletMembers(walletAddress)
                ])

                if (walletInfo) {
                    setWalletData({
                        balance: walletInfo.balance,
                        memberCount: members.length,
                        walletName: walletInfo.walletName,
                        members: members
                    })
                } else {
                    // Fallback data if wallet info fetch fails
                    setWalletData(prev => ({
                        ...prev,
                        members: members,
                        memberCount: members.length
                    }))
                }
            } catch (error) {
                console.error('Error fetching wallet data:', error)
                onError?.('Failed to load wallet information')
            } finally {
                setIsLoading(false)
            }
        }

        fetchWalletData()
    }, [walletAddress, refreshTrigger, onError])

    const handleMemberAdded = (member: AddMemberParams) => {
        // Refresh wallet data to show updated member count and balance
        setRefreshTrigger(prev => prev + 1)
        
        // Call parent callback
        onMemberAdded?.(member)
    }

    const handleError = (error: string) => {
        // Format contract errors to be more user-friendly
        let formattedError = error

        if (error.includes('ERR_INSUFFICIENT_FUNDS')) {
            formattedError = 'Insufficient wallet balance to onboard member with this spend limit'
        } else if (error.includes('ERR_NOT_ADMIN')) {
            formattedError = 'Your wallet is not active or you don\'t have admin permissions'
        } else if (error.includes('ERR_WALLET_EXISTS')) {
            formattedError = 'A member with this identifier already exists in your organization'
        } else if (error.includes('network') || error.includes('connection')) {
            formattedError = 'Transaction failed due to network issues. Please try again.'
        }

        onError?.(formattedError)
    }

    return (
        <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
            {/* Wallet Information Display */}
            <WalletInfoDisplay
                walletAddress={walletAddress}
                balance={walletData.balance}
                memberCount={walletData.memberCount}
                isLoading={isLoading}
                walletName={walletData.walletName}
            />

            {/* Add Member Form */}
            <AddMemberForm
                walletAddress={walletAddress}
                walletBalance={walletData.balance}
                existingMembers={walletData.members}
                onMemberAdded={handleMemberAdded}
                onError={handleError}
            />

            {/* Current Members List */}
            <MemberListComponent
                walletAddress={walletAddress}
                members={walletData.members}
                isLoading={isLoading}
            />
        </div>
    )
}