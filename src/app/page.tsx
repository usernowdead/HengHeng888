import React from 'react'
import ImageSlider from '@/components/home/ImageSlider'
import WalletBalance from '@/components/home/WalletBalance'
import MovieRecommendations from '@/components/home/MovieRecommendations'
import SeriesRecommendations from '@/components/home/SeriesRecommendations'
import ServicePremium from '@/components/home/ServicePremium'
import ServicePreorder from '@/components/home/ServicePreorder'
import ServiceTopUpGame from '@/components/home/ServiceTopUpGame'
import ServicePupSocial from '@/components/home/ServicePupSocial'
import ContactUs from '@/components/home/ContactUs'

// Force dynamic rendering to prevent static generation with stale data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function page() {
  return (
    <main className='min-h-screen'>
      <ImageSlider />
      <WalletBalance />
      <MovieRecommendations />
      <SeriesRecommendations />
      <ServicePremium />
      <ServicePreorder />
      <ServiceTopUpGame />
      <ServicePupSocial />
      <ContactUs />
    </main>
  )
}