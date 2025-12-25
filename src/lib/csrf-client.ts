/**
 * Client-side CSRF token utilities
 * Fetches CSRF token from server and stores it in cookie
 */

/**
 * Fetch CSRF token from server
 * This should be called when the app loads or when CSRF token is missing
 */
export async function fetchCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/v1/csrf-token', {
      method: 'GET',
      credentials: 'include', // Important: Include cookies
    });

    if (!response.ok) {
      console.error('Failed to fetch CSRF token:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.token) {
      // Token is automatically set in cookie by server
      // But we also return it for immediate use
      return data.token;
    }

    return null;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}

/**
 * Check if CSRF token exists in cookie
 */
export function hasCSRFToken(): boolean {
  if (typeof window === 'undefined') return false;
  
  const cookies = document.cookie.split(';');
  return cookies.some(c => c.trim().startsWith('csrf-token='));
}

/**
 * Initialize CSRF token - fetch if missing
 * Call this when the app loads
 */
export async function initializeCSRFToken(): Promise<void> {
  // Only fetch if token doesn't exist
  if (!hasCSRFToken()) {
    await fetchCSRFToken();
  }
}

