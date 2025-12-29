import { useState } from 'react'

interface FAQItemProps {
    question: string
    answer: string
    isOpen: boolean
    onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                onClick={onToggle}
            >
                <span className="font-semibold text-gray-900 pr-4">{question}</span>
                <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{answer}</p>
                </div>
            </div>
        </div>
    )
}

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        {
            question: "What is a multi-signature wallet?",
            answer: "A multi-signature (multisig) wallet is a digital wallet that requires multiple private keys to authorize a transaction. Instead of relying on a single signature, multisig wallets require a predetermined number of signatures from a group of authorized users. For example, a 2-of-3 multisig wallet requires at least 2 out of 3 authorized users to sign a transaction before it can be executed."
        },
        {
            question: "How secure is WalletX?",
            answer: "WalletX employs industry-leading security measures including end-to-end encryption, non-custodial architecture, and regular security audits. Your private keys are never stored on our servers and remain under your complete control. All smart contracts have been audited by leading security firms, and we maintain SOC 2 compliance for operational security."
        },
        {
            question: "Can I recover my wallet if I lose access?",
            answer: "Yes, WalletX provides multiple recovery options. During setup, you'll create a recovery phrase (seed phrase) that can restore your wallet. Additionally, since it's a multi-signature wallet, other authorized members can help recover access. We also offer social recovery options where trusted contacts can help you regain access to your wallet."
        },
        {
            question: "What cryptocurrencies does WalletX support?",
            answer: "WalletX is built specifically for the Stacks ecosystem and supports STX tokens and all SIP-010 compliant tokens. This includes popular tokens like ALEX, DIKO, and many others. We also support Bitcoin transactions through the Stacks layer, enabling you to interact with Bitcoin DeFi applications."
        },
        {
            question: "How much does WalletX cost?",
            answer: "WalletX offers a free tier for individual users and small teams (up to 3 members). For larger organizations, we have paid plans starting at $29/month that include advanced features like unlimited members, enhanced reporting, priority support, and custom integrations. Enterprise plans are available for large organizations with specific requirements."
        },
        {
            question: "Can I integrate WalletX with my existing systems?",
            answer: "Yes, WalletX provides comprehensive APIs and webhooks for integration with existing systems. We support popular accounting software, treasury management tools, and custom integrations. Our developer documentation includes SDKs for popular programming languages and detailed integration guides."
        },
        {
            question: "What happens if WalletX goes offline?",
            answer: "Since WalletX is non-custodial, you always retain control of your funds even if our service goes offline. You can recover your wallet using your seed phrase and interact with the Stacks blockchain directly. Additionally, our infrastructure is designed for 99.9% uptime with redundant systems and automatic failover capabilities."
        },
        {
            question: "How do I set up spending limits for team members?",
            answer: "Setting up spending limits is easy through the WalletX dashboard. As an admin, you can assign individual spending limits to each team member, set daily/monthly limits, and configure approval thresholds. You can also freeze or modify limits instantly if needed. All spending limit changes are logged and require admin approval."
        },
        {
            question: "Is there customer support available?",
            answer: "Yes, we provide comprehensive customer support through multiple channels. Free tier users have access to our knowledge base and community forums. Paid plan users get email support with 24-hour response times. Enterprise customers receive priority support with dedicated account managers and phone support."
        },
        {
            question: "Can I export transaction history for accounting?",
            answer: "Absolutely! WalletX provides detailed transaction history with export capabilities in multiple formats (CSV, PDF, JSON). You can filter transactions by date, member, amount, or transaction type. We also provide pre-formatted reports for popular accounting software like QuickBooks and Xero."
        }
    ]

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600">
                        Got questions? We've got answers. If you can't find what you're looking for, 
                        feel free to reach out to our support team.
                    </p>
                </div>

                {/* FAQ items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Still have questions?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Our support team is here to help. Get in touch and we'll get back to you as soon as possible.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-300">
                                Contact Support
                            </button>
                            <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                                View Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}