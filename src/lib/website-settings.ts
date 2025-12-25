// Website Settings Service
// Manages website configuration stored in database
import { prisma } from './db'
import { getCached, invalidateCache, CACHE_TTL } from './cache';
import { sanitizeString } from '@/lib/security/validation';

export interface WebsiteSettingsData {
  // Basic Information
  websiteName: string;
  logoUrl: string;
  announcement: string;
  shopDescription: string;
  
  // Homepage Slideshow
  slide1: string;
  slide2: string;
  slide3: string;
  slide4: string;
  
  // Movie Recommendations Section
  movieSectionTitle: string;
  movieSectionSubtitle: string;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
}

const DEFAULT_SETTINGS: WebsiteSettingsData = {
  websiteName: 'Oho568',
  logoUrl: '',
  announcement: '',
  shopDescription: 'บริการเว็บไซต์ OTP แอฟพรีเมี่ยม อีเมล์ต่างๆ บริการดีไว้ใจได้100%% บริการOTP ออโต้ระบบรวดเร็ว ยืนยันแอปต่างๆ ซื้อเน็ตฟิกราคาถูกรายเดือน, Netflixรายเดือนถูกๆ, บริการ OTP ราคาถูก, OTPเบอร์ถูก, OTP24HR,เบอร์ OTP เติมเงิน มือถือ,เติมเกมส์ออนไลน์',
  slide1: '/bannerginlystore2.png',
  slide2: '/bannerginlystore2.png',
  slide3: '/bannerginlystore2.png',
  slide4: '/bannerginlystore2.png',
  movieSectionTitle: 'แนะนำหนังน่าดู',
  movieSectionSubtitle: 'หนังใหม่ที่น่าสนใจ',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
};

/**
 * Get all website settings
 * Returns default values if not set
 * SECURITY: Uses Prisma ORM to prevent SQL injection
 * PERFORMANCE: Uses caching to reduce database queries
 */
export async function getWebsiteSettings(): Promise<Record<string, any>> {
  try {
    // Use cache for website settings (rarely changes)
    return await getCached(
      'website-settings:all',
      async () => {
        console.log('📖 [WebsiteSettings] Fetching settings from database...')
        
        // Use Prisma ORM instead of raw SQL
        const settings = await prisma.websiteSetting.findMany().catch(() => []);

    console.log(`📖 [WebsiteSettings] Found ${settings.length} settings in database`)

    if (settings.length === 0) {
      console.log('📖 [WebsiteSettings] No settings found, returning defaults')
      return DEFAULT_SETTINGS as Record<string, any>;
    }

    // Convert array to object - include ALL settings (not just WebsiteSettingsData)
    const settingsMap: Record<string, any> = {};
    settings.forEach(setting => {
      // For boolean-like strings, keep as string for consistency
      // For other values, try to parse as JSON
      if (setting.value === 'true' || setting.value === 'false') {
        settingsMap[setting.key] = setting.value; // Keep as string 'true' or 'false'
        console.log(`📖 [WebsiteSettings] Loaded: ${setting.key} = ${setting.value} (as string boolean)`)
      } else {
        try {
          // Try to parse as JSON, fallback to string
          settingsMap[setting.key] = JSON.parse(setting.value);
          console.log(`📖 [WebsiteSettings] Loaded: ${setting.key} = ${setting.value} (parsed as JSON)`)
        } catch {
          settingsMap[setting.key] = setting.value;
          console.log(`📖 [WebsiteSettings] Loaded: ${setting.key} = ${setting.value} (as string)`)
        }
      }
    });

    // Filter payment method settings for debugging
    const paymentMethodSettings = Object.keys(settingsMap).filter(k => k.includes('payment_method'))
    console.log('📖 [WebsiteSettings] Payment method settings found:', paymentMethodSettings.map(k => ({
      key: k,
      value: settingsMap[k]
    })))

    // Merge with defaults
    const result = {
      ...DEFAULT_SETTINGS,
      ...settingsMap,
    };
    
        console.log('📖 [WebsiteSettings] Returning merged settings (total keys:', Object.keys(result).length, ')')
        return result;
      },
      CACHE_TTL.LONG // Cache for 1 hour (settings rarely change)
    );
  } catch (error) {
    console.error('❌ [WebsiteSettings] Error fetching website settings:', error);
    return DEFAULT_SETTINGS as Record<string, any>;
  }
}

/**
 * Save website settings
 * SECURITY: Uses Prisma ORM and input sanitization to prevent SQL injection
 */
export async function saveWebsiteSettings(
  settings: Partial<WebsiteSettingsData>,
  updatedBy?: string
): Promise<void> {
  try {
    console.log('💾 [WebsiteSettings] Saving settings:', Object.keys(settings))
    
    // Sanitize updatedBy if provided
    const sanitizedUpdatedBy = updatedBy ? sanitizeString(updatedBy, 100) : null;

    // Save each setting using Prisma ORM
    for (const [key, value] of Object.entries(settings)) {
      // Sanitize key
      const sanitizedKey = sanitizeString(key, 100);
      if (!sanitizedKey) {
        console.warn(`⚠️ [WebsiteSettings] Skipping invalid setting key: ${key}`);
        continue;
      }

      // Always save as string for consistency (boolean -> string)
      let valueStr: string;
      if (typeof value === 'boolean') {
        valueStr = value ? 'true' : 'false';
      } else if (typeof value === 'string') {
        valueStr = sanitizeString(value, 10000);
      } else {
        valueStr = JSON.stringify(value);
      }
      const category = getCategoryForKey(sanitizedKey);
      
      console.log(`💾 [WebsiteSettings] Saving: ${sanitizedKey} = ${valueStr} (original type: ${typeof value}, category: ${category})`)
      
      // Use Prisma ORM upsert instead of raw SQL
      const result = await prisma.websiteSetting.upsert({
        where: { key: sanitizedKey },
        update: {
          value: valueStr,
          category: category,
          updatedBy: sanitizedUpdatedBy,
        },
        create: {
          key: sanitizedKey,
          value: valueStr,
          category: category,
          updatedBy: sanitizedUpdatedBy,
        }
      });
      
      console.log(`✅ [WebsiteSettings] Saved: ${sanitizedKey} = ${result.value}`)
    }
    
    // Invalidate cache after saving
    await invalidateCache('website-settings:*');
    
    console.log('✅ [WebsiteSettings] All settings saved successfully')
  } catch (error) {
    console.error('❌ [WebsiteSettings] Error saving website settings:', error);
    throw error;
  }
}

/**
 * Create website_settings table if it doesn't exist
 * NOTE: This should be handled by Prisma migrations, but kept for backward compatibility
 * SECURITY: Table creation is safe as it doesn't use user input
 */
async function createWebsiteSettingsTable(): Promise<void> {
  try {
    // Use Prisma migrations instead of raw SQL
    // This function is kept for backward compatibility but should be removed
    // Run: npx prisma migrate dev
  } catch (error) {
    console.error('Error creating website_settings table:', error);
  }
}

/**
 * Get category for a setting key
 */
function getCategoryForKey(key: string): string {
  if (['websiteName', 'logoUrl', 'announcement', 'shopDescription', 'movieSectionTitle', 'movieSectionSubtitle'].includes(key)) {
    return 'general';
  }
  if (['slide1', 'slide2', 'slide3', 'slide4', 'primaryColor', 'secondaryColor'].includes(key)) {
    return 'appearance';
  }
  return 'general';
}

