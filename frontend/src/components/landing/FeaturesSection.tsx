import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'

const features = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        title: "Multi-Signature Security",
        description: "Require multiple approvals for transactions. Perfect for teams, DAOs, and organizations that need collaborative control over funds.",
        highlight: "Enterprise Security"
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: "Team Management",
        description: "Add team members, set spending limits, and manage permissions with granular control. Freeze or remove members instantly when needed.",
        highlight: "Role-Based Access"
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: "Non-Custodial",
        description: "Your private keys remain under your control. We never have access to your funds or personal information. True self-custody.",
        highlight: "Your Keys, Your Crypto"
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: "Stacks Native",
        description: "Built specifically for the Stacks ecosystem. Seamlessly interact with Bitcoin DeFi, NFTs, and smart contracts on Stacks.",
        highlight: "Bitcoin DeFi Ready"
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        title: "Transaction History",
        description: "Complete audit trail of all transactions with detailed logs. Export reports for accounting and compliance purposes.",
        highlight: "Full Transparency"
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: "Advanced Controls",
        description: "Set spending limits, configure approval thresholds, and customize wallet behavior to match your organization's needs.",
        highlight: "Fully Customizable"
    }
]

export default function FeaturesSection() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Enterprise-Grade Features
                    </h2>
                    <p className="max-w-3xl mx-auto text-xl text-gray-600">
                        Everything you need to manage digital assets securely and efficiently. 
                        Built for teams that demand the highest standards of security and control.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Card 
                            key={index} 
                            className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white group hover:-translate-y-1"
                        >
                            {/* Gradient border effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute inset-[1px] bg-white rounded-lg"></div>
                            
                            <CardHeader className="relative z-10">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-gradient-to-r from-orange-100 to-purple-100 rounded-lg text-orange-600 group-hover:from-orange-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                        {feature.highlight}
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800">
                                    {feature.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <CardDescription className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <p className="text-lg text-gray-600 mb-6">
                        Ready to secure your organization's digital assets?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                            Start Free Trial
                        </button>
                        <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                            Schedule Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}