/**
 * Public API endpoint for website settings
 * Includes caching for performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteSettings } from '@/lib/website-settings';
import { getCached, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Cache website settings for 5 minutes (rarely changes)
    const settings = await getCached(
      'website-settings:public',
      () => getWebsiteSettings(),
      CACHE_TTL.MEDIUM
    );

    return NextResponse.json(
      {
        success: true,
        data: settings, // Use 'data' for consistency with context
        settings, // Also include 'settings' for backward compatibility
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Website settings API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถโหลดข้อมูลการตั้งค่าได้',
        settings: {},
      },
      { status: 500 }
    );
  }
}
