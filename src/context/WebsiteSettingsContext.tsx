"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebsiteSettingsData } from '@/lib/website-settings';

interface WebsiteSettingsContextType {
    settings: WebsiteSettingsData | null;
    loading: boolean;
    error: string | null;
    refreshSettings: () => Promise<void>;
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType | undefined>(undefined);

export const useWebsiteSettings = () => {
    const context = useContext(WebsiteSettingsContext);
    if (context === undefined) {
        throw new Error('useWebsiteSettings must be used within a WebsiteSettingsProvider');
    }
    return context;
};

interface WebsiteSettingsProviderProps {
    children: ReactNode;
}

export const WebsiteSettingsProvider: React.FC<WebsiteSettingsProviderProps> = ({ children }) => {
    // Initialize with default to prevent hydration mismatch
    const [settings, setSettings] = useState<WebsiteSettingsData | null>({
        websiteName: 'Payplearn',
        logoUrl: '',
        announcement: '',
        shopDescription: '',
        slide1: '/bannerginlystore2.png',
        slide2: '/bannerginlystore2.png',
        slide3: '/bannerginlystore2.png',
        slide4: '/bannerginlystore2.png',
        movieSectionTitle: 'แนะนำหนังน่าดู',
        movieSectionSubtitle: 'หนังใหม่ที่น่าสนใจ',
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/v1/website-settings', {
                cache: 'no-store', // Force fresh data
            });
            
            // Check if response is OK
            if (!response.ok) {
                console.error('❌ [WebsiteSettings] API response not OK:', response.status, response.statusText);
                // Keep default settings, don't set error
                setLoading(false);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ [WebsiteSettings] Response is not JSON:', text.substring(0, 200));
                // Keep default settings, don't set error
                setLoading(false);
                return;
            }
            
            const data = await response.json();

            if (data.success) {
                // API returns { success: true, settings: {...} }
                setSettings(data.settings || data.data);
            } else {
                // Keep default settings, don't set error to prevent UI issues
                console.warn('⚠️ [WebsiteSettings] API returned success=false');
            }
        } catch (err) {
            console.error('❌ [WebsiteSettings] Error fetching website settings:', err);
            // Keep default settings, don't set error to prevent UI issues
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = async () => {
        await fetchSettings();
    };

    const value: WebsiteSettingsContextType = {
        settings,
        loading,
        error,
        refreshSettings,
    };

    return (
        <WebsiteSettingsContext.Provider value={value}>
            {children}
        </WebsiteSettingsContext.Provider>
    );
};
