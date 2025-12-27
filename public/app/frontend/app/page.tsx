import Header from '@/components/Header/Header'
import Hero from '@/components/Hero/Hero'
import BannerSlider from '@/components/Banner/BannerSlider'
import ProductSection from '@/components/Products/ProductSection'
import Testimonials from '@/components/Testimonials/Testimonials'
import Footer from '@/components/Footer/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-[480px] mx-auto px-4">
        <Hero />
        
        {/* Advertisement Banner Section */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">โปรโมชั่นพิเศษ</h2>
            <p className="text-gray-600 text-sm">อัพเดทโปรโมชั่นและข่าวสารล่าสุด</p>
          </div>
          <BannerSlider />
        </section>

        {/* Product Section */}
        <ProductSection />

        {/* Testimonials */}
        <Testimonials />
      </main>

      <Footer />
    </div>
  )
}
