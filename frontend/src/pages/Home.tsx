
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-12 md:py-24">
            <div className="flex flex-col items-center space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
                    Stacks Wallet X
                </h1>
                <p className="max-w-[700px] text-gray-500 md:text-xl">
                    Secure, non-custodial multi-signature wallet for the Stacks ecosystem.
                    Manage your assets with confidence.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Secure Storage</CardTitle>
                        <CardDescription>Industry standard security</CardDescription>
                    </CardHeader>
                    <CardContent>
                        Your private keys are encrypted and stored locally. We never have access to your funds.
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Multi-Signature</CardTitle>
                        <CardDescription>Collaborative management</CardDescription>
                    </CardHeader>
                    <CardContent>
                        Require multiple approvals for transactions. Perfect for teams and organizations.
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>DeFi Ready</CardTitle>
                        <CardDescription>Connect to dApps</CardDescription>
                    </CardHeader>
                    <CardContent>
                        Seamlessly interact with Stacks DeFi applications using WalletConnect.
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-4">
                <Link to="/dashboard">
                    <Button size="lg" className="h-12 px-8">
                        Launch App
                    </Button>
                </Link>
                <Link to="https://docs.stacks.co" target="_blank">
                    <Button variant="outline" size="lg" className="h-12 px-8">
                        Learn More
                    </Button>
                </Link>
            </div>
        </div>
    )
}
