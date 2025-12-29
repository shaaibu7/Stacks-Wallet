interface TestimonialProps {
    quote: string
    author: string
    role: string
    company: string
    avatar: string
    rating: number
}

function TestimonialCard({ quote, author, role, company, avatar, rating }: TestimonialProps) {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            {/* Rating stars */}
            <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>

            {/* Quote */}
            <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                "{quote}"
            </blockquote>

            {/* Author info */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {avatar}
                </div>
                <div>
                    <div className="font-semibold text-gray-900">{author}</div>
                    <div className="text-sm text-gray-600">{role} at {company}</div>
                </div>
            </div>
        </div>
    )
}

export default function TestimonialsSection() {
    const testimonials = [
        {
            quote: "WalletX has revolutionized how we manage our DAO treasury. The multi-signature functionality gives us the security we need while maintaining operational efficiency.",
            author: "Sarah Chen",
            role: "Treasury Manager",
            company: "DeFi Protocol",
            avatar: "SC",
            rating: 5
        },
        {
            quote: "The team management features are incredible. We can set spending limits, freeze accounts instantly, and have complete visibility into all transactions. It's exactly what we needed.",
            author: "Marcus Rodriguez",
            role: "CFO",
            company: "Crypto Ventures",
            avatar: "MR",
            rating: 5
        },
        {
            quote: "Security was our top priority when choosing a wallet solution. WalletX's non-custodial approach and audit trail give us complete peace of mind.",
            author: "Emily Watson",
            role: "Security Lead",
            company: "Blockchain Startup",
            avatar: "EW",
            rating: 5
        },
        {
            quote: "The user experience is outstanding. Even our non-technical team members can easily navigate and use the platform. The onboarding process was seamless.",
            author: "David Kim",
            role: "Operations Director",
            company: "NFT Marketplace",
            avatar: "DK",
            rating: 5
        },
        {
            quote: "We've been using WalletX for over a year now. The reliability and uptime have been exceptional. Our team can focus on building instead of worrying about wallet management.",
            author: "Lisa Thompson",
            role: "CTO",
            company: "Web3 Gaming",
            avatar: "LT",
            rating: 5
        },
        {
            quote: "The transaction history and reporting features have made our accounting process so much easier. Everything is transparent and auditable.",
            author: "James Park",
            role: "Finance Manager",
            company: "DeFi Exchange",
            avatar: "JP",
            rating: 5
        }
    ]

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="max-w-3xl mx-auto text-xl text-gray-600">
                        Don't just take our word for it. Here's what our customers have to say about their experience with WalletX.
                    </p>
                </div>

                {/* Testimonials grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            quote={testimonial.quote}
                            author={testimonial.author}
                            role={testimonial.role}
                            company={testimonial.company}
                            avatar={testimonial.avatar}
                            rating={testimonial.rating}
                        />
                    ))}
                </div>

                {/* Bottom stats */}
                <div className="mt-20 text-center">
                    <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
                            <div className="text-gray-600">Average Rating</div>
                            <div className="flex justify-center gap-1 mt-2">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                            <div className="text-gray-600">Happy Customers</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
                            <div className="text-gray-600">Would Recommend</div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <p className="text-lg text-gray-600 mb-6">
                        Join our satisfied customers and secure your digital assets today
                    </p>
                    <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Start Your Free Trial
                        <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    )
}