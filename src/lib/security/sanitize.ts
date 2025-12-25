/**
 * Security utilities for sanitizing user input
 * Prevents XSS attacks and other security vulnerabilities
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Use DOMPurify to sanitize HTML
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'id'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  });
}

/**
 * Sanitize string for use in SQL queries (legacy - prefer Prisma ORM)
 * @param str String to sanitize
 * @returns Sanitized string
 * @deprecated Use Prisma ORM instead of raw SQL
 */
export function sanitizeForSQL(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  // Remove null bytes and control characters
  let sanitized = str.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Escape single quotes (PostgreSQL)
  sanitized = sanitized.replace(/'/g, "''");
  
  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
}

/**
 * Validate and sanitize ID parameter
 * @param id ID string to validate
 * @returns Sanitized ID or null if invalid
 */
export function sanitizeId(id: string | null | undefined): string | null {
  if (!id || typeof id !== 'string') {
    return null;
  }

  // Only allow alphanumeric, hyphens, and underscores
  const sanitized = id.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    return null;
  }

  // Limit length
  if (sanitized.length > 100) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize URL to prevent XSS and malicious redirects
 * @param url URL string to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  // Only allow http, https, and relative URLs
  if (!/^(https?:\/\/|\/)/.test(trimmed)) {
    return '';
  }

  // Limit length
  if (trimmed.length > 2048) {
    return '';
  }

  return trimmed;
}

