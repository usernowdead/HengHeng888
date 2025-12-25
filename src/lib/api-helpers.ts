/**
 * API Helper Functions
 * Centralized utilities for making authenticated API calls
 * 
 * SECURITY: Uses httpOnly cookies (preferred) with fallback to Authorization header
 * Compatible with Vercel deployment
 */

/**
 * Get authentication token from localStorage (for backward compatibility)
 * Prefers cookies (set by server) but falls back to localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Get CSRF token from cookie
 */
function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith('csrf-token='));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
}

/**
 * Fetch CSRF token from server if not available
 */
async function ensureCSRFToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Check if token already exists
  const existingToken = getCSRFToken();
  if (existingToken) {
    return existingToken;
  }
  
  // Fetch token from server
  try {
    const response = await fetch('/api/v1/csrf-token', {
      method: 'GET',
      credentials: 'include', // Important: Include cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        // Token is automatically set in cookie by server
        // Wait a bit for cookie to be set, then check again
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Verify token is now in cookie
        const tokenFromCookie = getCSRFToken();
        if (tokenFromCookie) {
          return tokenFromCookie;
        }
        
        // If not in cookie yet, return the token from response (will be sent in header)
        return data.token;
      }
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  
  return null;
}

/**
 * Create fetch options for authenticated requests
 * Automatically includes cookies, Authorization header, and CSRF token (for state-changing operations)
 * 
 * NOTE: For state-changing operations (POST, PUT, DELETE, PATCH), this function will
 * automatically fetch CSRF token if not available. However, for better UX, it's recommended
 * to call initializeCSRFToken() when the app loads.
 */
export async function createAuthFetchOptions(
  options: RequestInit = {},
  token?: string | null
): Promise<RequestInit> {
  const authToken = token || getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers as HeadersInit,
  };

  // Add Authorization header if token exists (backward compatibility)
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Add CSRF token for state-changing operations (POST, PUT, DELETE, PATCH)
  const method = options.method || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    // Try to get existing token first
    let csrfToken = getCSRFToken();
    
    // If no token, fetch it from server
    if (!csrfToken) {
      csrfToken = await ensureCSRFToken();
    }
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    } else {
      // For Brave browser or privacy-focused browsers that block cookies
      // Try to fetch token one more time and use it directly from response
      console.warn('CSRF token not available in cookie. Attempting to fetch...');
      const freshToken = await ensureCSRFToken();
      if (freshToken) {
        headers['X-CSRF-Token'] = freshToken;
      } else {
        console.error('CSRF token not available. Request may fail. If using Brave browser, please allow cookies for localhost.');
      }
    }
  }

  return {
    ...options,
    credentials: 'include', // Always include cookies (required for httpOnly cookies)
    headers,
  };
}

/**
 * Make authenticated API call
 * Automatically handles cookies and Authorization header
 */
export async function authApiCall<T = any>(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const fetchOptions = await createAuthFetchOptions(options, token);
  const response = await fetch(url, fetchOptions);
  return response.json();
}

