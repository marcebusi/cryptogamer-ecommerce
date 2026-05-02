import HeroSection     from '../components/home/HeroSection'
import TrustBar        from '../components/home/TrustBar'
import BentoCategories from '../components/home/BentoCategories'
import LatestArrivals  from '../components/home/LatestArrivals'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <BentoCategories />
      <LatestArrivals />
    </main>
  )
}
