"use client";

import React from 'react';
import Link from 'next/link';
import { useWebsiteSettings } from '@/context/WebsiteSettingsContext';

export default function ContactUs() {
    const { settings } = useWebsiteSettings();
    
    return (
        <section className='border-b'>
            <div className='w-full'>
                <div className='px-3 pt-3 pb-2 border-b'>
                    <h3 className='text-base font-medium'>
                        ติดต่อเรา
                    </h3>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                        ติดต่อแอดมิน และฝ่ายบริการ
                    </p>
                </div>

                <div className='px-3 py-3'>
                    <Link
                        href='https://line.me/ti/p/~Payplearn'
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group">
                            <div className="flex-shrink-0 flex items-center justify-center">
                                <img
                                    src="https://hengdee888.com/images/gif/line.gif"
                                    alt="LINE"
                                    className="h-8 w-8 object-contain select-none"
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
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-1">
                                    Payplearn
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    ช่องทางการติดต่อคอลเซ็นเตอร์
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}

