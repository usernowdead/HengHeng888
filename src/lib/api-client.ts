/**
 * Centralized API Client
 * Handles authentication via httpOnly cookies (preferred) or Authorization header (backward compatibility)
 * Includes CSRF protection for state-changing operations
 * Vercel-compatible implementation
 */

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
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        // Token is automatically set in cookie by server
        return data.token;
      }
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  
  return null;
}

/**
 * Make authenticated API request
 * Automatically includes cookies, Authorization header, and CSRF token (for state-changing operations)
 */
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from localStorage (backward compatibility)
  // Cookies are sent automatically with credentials: 'include'
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists (backward compatibility)
  // Server will prefer cookie if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
      console.warn('CSRF token not available. Request may fail.');
    }
  }

  // Make request with credentials to include cookies
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Critical: Include cookies for httpOnly token storage
  });
}

/**
 * Make authenticated POST request
 */
export async function apiPost(url: string, data: any, options: RequestInit = {}): Promise<Response> {
  return apiRequest(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Make authenticated GET request
 */
export async function apiGet(url: string, options: RequestInit = {}): Promise<Response> {
  return apiRequest(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * Make authenticated PUT request
 */
export async function apiPut(url: string, data: any, options: RequestInit = {}): Promise<Response> {
  return apiRequest(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Make authenticated DELETE request
 */
export async function apiDelete(url: string, options: RequestInit = {}): Promise<Response> {
  return apiRequest(url, {
    ...options,
    method: 'DELETE',
  });
}
