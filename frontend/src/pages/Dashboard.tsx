
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAppKitAccount } from '@reown/appkit/react'

export default function Dashboard() {
    const { isConnected, address } = useAppKitAccount()

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">
                            Please connect your wallet to access the dashboard and manage your assets.
                        </p>
                        <p className="text-sm text-gray-500">
                            Supported wallets: Leather, Hiro, and other WalletConnect compatible wallets
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button>New Transaction</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234.56 STX</div>
                        <p className="text-xs text-gray-500">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isConnected ? 'Connected' : 'Disconnected'}</div>
                        <p className="text-xs text-gray-500 break-all">
                            {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Connect wallet to view'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Network</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Testnet</div>
                        <p className="text-xs text-gray-500">Stacks Testnet</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500">Total transactions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="flex h-[200px] items-center justify-center text-gray-400">
                            No recent activity
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="w-full justify-start">Mint Tokens</Button>
                            <Button variant="outline" className="w-full justify-start">Transfer Funds</Button>
                            <Button variant="outline" className="w-full justify-start">Manage Members</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
