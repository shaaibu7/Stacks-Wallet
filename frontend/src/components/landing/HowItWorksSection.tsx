interface StepProps {
    number: number
    title: string
    description: string
    icon: React.ReactNode
    isLast?: boolean
}

function Step({ number, title, description, icon, isLast = false }: StepProps) {
    return (
        <div className="relative flex flex-col items-center text-center">
            {/* Step number and icon */}
            <div className="relative z-10 flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full text-white font-bold text-xl shadow-lg mb-6">
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center text-gray-800">
                    {icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {number}
                </div>
            </div>

            {/* Connecting line */}
            {!isLast && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-orange-300 to-purple-300 transform translate-x-1/2 z-0"></div>
            )}

            {/* Content */}
            <div className="max-w-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    )
}

export default function HowItWorksSection() {
    const steps = [
        {
            title: "Create Your Wallet",
            description: "Set up your multi-signature wallet in minutes. Define the number of required signatures and add your team members.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )
        },
        {
            title: "Add Team Members",
            description: "Invite team members and assign roles. Set individual spending limits and permissions for each member.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            title: "Fund & Manage",
            description: "Deposit funds and start managing your digital assets. All transactions require the configured number of approvals.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            title: "Secure Transactions",
            description: "Execute transactions with confidence. Every transaction is cryptographically secured and requires multi-party approval.",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        }
    ]

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="max-w-3xl mx-auto text-xl text-gray-600">
                        Get started with WalletX in four simple steps. 
                        Our intuitive interface makes multi-signature wallet management accessible to everyone.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
                    {steps.map((step, index) => (
                        <Step
                            key={index}
                            number={index + 1}
                            title={step.title}
                            description={step.description}
                            icon={step.icon}
                            isLast={index === steps.length - 1}
                        />
                    ))}
                </div>

                {/* Bottom section */}
                <div className="mt-20 text-center">
                    <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-2xl p-8 lg:p-12">
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                            Ready to Get Started?
                        </h3>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join thousands of organizations who trust WalletX for their digital asset management. 
                            Set up your first multi-signature wallet in under 5 minutes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                                Create Wallet Now
                                <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                                Watch Demo Video
                                <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}