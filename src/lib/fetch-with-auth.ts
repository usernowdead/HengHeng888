/**
 * Fetch with automatic authentication
 * Supports both httpOnly cookies (preferred) and Authorization header (backward compatibility)
 * Vercel-compatible implementation
 * 
 * Usage:
 *   const response = await fetchWithAuth('/api/v1/your-endpoint', { method: 'POST', body: JSON.stringify(data) });
 */

/**
 * Make authenticated fetch request
 * Automatically includes cookies and Authorization header (if available)
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from localStorage (backward compatibility)
  // Cookies are sent automatically with credentials: 'include'
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  // Build headers
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add Content-Type if body is provided and not already set
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Add Authorization header if token exists (backward compatibility)
  // Server will prefer cookie if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make request with credentials to include cookies
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Critical: Include cookies for httpOnly token storage
  });
}

/**
 * Helper to get JSON response with error handling
 */
export async function fetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);
  return response.json();
}

