import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import StatsSection from './StatsSection'
import HowItWorksSection from './HowItWorksSection'
import TestimonialsSection from './TestimonialsSection'
import FAQSection from './FAQSection'

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <FeaturesSection />
            <StatsSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <FAQSection />
        </div>
    )
}