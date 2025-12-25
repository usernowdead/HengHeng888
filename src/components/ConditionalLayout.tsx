"use client"

import { usePathname } from 'next/navigation'
import NavBarComponents from '@/components/NavBarComponents'
import Footer from '@/components/Footer'
import NotifyMessage from '@/components/home/NotifyMessage'
import { useWebsiteSettings } from '@/context/WebsiteSettingsContext'

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isAdminPage = pathname?.startsWith('/admin')
    const { settings } = useWebsiteSettings()

    // Admin pages don't need Navbar, Footer, or 480px constraint
    if (isAdminPage) {
        return <>{children}</>
    }

    // Regular pages with Navbar, Footer, and 480px constraint
    return (
        <div className="w-full min-h-screen flex flex-col">
            <NavBarComponents />
            <NotifyMessage />
            <div 
                className="w-full max-w-[480px] mx-auto flex-1"
                style={{
                    '--primary-color': settings?.primaryColor || '#3b82f6',
                    '--secondary-color': settings?.secondaryColor || '#8b5cf6',
                } as React.CSSProperties}
            >
                {children}
                <Footer />
            </div>
        </div>
    )
}



