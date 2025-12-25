"use client"

import React from 'react'
import { Bell } from 'lucide-react'
import { useWebsiteSettings } from '@/context/WebsiteSettingsContext'

export default function NotifyMessage() {
    const { settings } = useWebsiteSettings()
    const text = settings?.announcement || ''
    
    // Don't show if announcement is empty
    if (!text || text.trim() === '') {
        return null
    }
    
    return (
        <section className='border-b bg-white overflow-hidden'>
            <div className='w-full px-3 py-2'>
                <div className='flex items-start gap-2'>
                    <div className='flex-shrink-0 pt-0.5'>
                        <div className='p-1 rounded-md bg-gray-100'>
                            <Bell className='size-3 text-gray-900' />
                        </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                        <p className='text-[11px] text-gray-900 leading-relaxed font-normal break-words'>
                            {text}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}