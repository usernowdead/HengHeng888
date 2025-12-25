"use client"

import React from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { useWebsiteSettings } from '@/context/WebsiteSettingsContext'

export default function ImageSlider() {
    const { settings } = useWebsiteSettings()
    
    // Get slides from settings or use defaults
    const slides = [
        settings?.slide1 || '/bannerginlystore2.png',
        settings?.slide2 || '/bannerginlystore2.png',
        settings?.slide3 || '/bannerginlystore2.png',
        settings?.slide4 || '/bannerginlystore2.png',
    ].filter(slide => slide) // Remove empty slides

    // Fallback to default if no slides
    const displaySlides = slides.length > 0 ? slides : ['/bannerginlystore2.png', '/bannerginlystore2.png', '/bannerginlystore2.png']

    return (
        <section className='border-b'>
            <div className='w-full px-3 py-2.5'>
                <Carousel className='relative'>
                    <CarouselContent>
                        {displaySlides.map((slide, index) => (
                            <CarouselItem key={index}>
                                <div>
                                    <img 
                                        src={slide} 
                                        className='w-full rounded-md select-none' 
                                        alt={`Slide ${index + 1}`}
                                        draggable={false}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            return false;
                                        }}
                                        onDragStart={(e) => {
                                            e.preventDefault();
                                            return false;
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.src = '/bannerginlystore2.png'
                                        }}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className='hidden md:block'>
                        <CarouselPrevious className='!left-1 !h-6 !w-6 !p-0 !bg-white/80 hover:!bg-white' />
                        <CarouselNext className='!right-1 !h-6 !w-6 !p-0 !bg-white/80 hover:!bg-white' />
                    </div>
                </Carousel>
            </div>
        </section>
    )
}