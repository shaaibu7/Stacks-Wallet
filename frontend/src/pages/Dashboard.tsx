
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { WalletStatus } from '../components/WalletStatus'
import { useWalletConnection } from '../hooks/useWalletConnection'

export default function Dashboard() {
    const { evmWallet, stacksWallet, isAnyWalletConnected, isBothWalletsConnected } = useWalletConnection()

    if (!isAnyWalletConnected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Connect Your Wallets</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">
                            Connect your Ethereum and Stacks wallets to access the WalletX dashboard.
                        </p>
                        <WalletStatus />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-gray-600">
                        {isBothWalletsConnected 
                            ? 'All wallets connected - Full functionality available' 
                            : 'Partial connection - Some features may be limited'
                        }
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button disabled={!isBothWalletsConnected}>
                        New Transaction
                    </Button>
                </div>
            </div>

            {/* Wallet Status Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Wallet Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <WalletStatus />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">STX Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stacksWallet.isConnected ? '1,234.56 STX' : '-- STX'}
                        </div>
                        <p className="text-xs text-gray-500">
                            {stacksWallet.isConnected ? '+20.1% from last month' : 'Connect Stacks wallet'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ETH Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {evmWallet.isConnected ? '2.45 ETH' : '-- ETH'}
                        </div>
                        <p className="text-xs text-gray-500">
                            {evmWallet.isConnected ? '+5.2% from last month' : 'Connect Ethereum wallet'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-gray-500">2 pending invitations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-gray-500">This month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="space-y-4">
                            {isBothWalletsConnected ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">Member Added</p>
                                                <p className="text-sm text-gray-600">John Doe joined the wallet</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">2 hours ago</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">Transaction Approved</p>
                                                <p className="text-sm text-gray-600">500 STX transfer approved</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">1 day ago</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-[200px] items-center justify-center text-gray-400">
                                    Connect both wallets to view activity
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                disabled={!stacksWallet.isConnected}
                            >
                                Mint Tokens
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                disabled={!isBothWalletsConnected}
                            >
                                Transfer Funds
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                disabled={!isBothWalletsConnected}
                            >
                                Manage Members
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                disabled={!stacksWallet.isConnected}
                            >
                                View Contracts
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
