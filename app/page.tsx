import Header from '@/components/Header'
import HeroBanner from '@/components/HeroBanner'
import PromotionalBanners from '@/components/PromotionalBanners'
import WinnersSection from '@/components/WinnersSection'
import Footer from '@/components/Footer'
import ScrollBanner from '@/components/ScrollBanner'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <ScrollBanner />
      <HeroBanner />
      <PromotionalBanners />
      <WinnersSection />
      <Footer />
    </main>
  )
}

