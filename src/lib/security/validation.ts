// Input validation utilities
import { NextResponse } from 'next/server';

/**
 * Validates email format
 * @param email Email string to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'อีเมลไม่สามารถเป็นค่าว่างได้' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim();
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' };
  }
  return { valid: true };
}

/**
 * Validates username format
 * @param username Username string to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Username must be less than 30 characters' };
  }

  // Allow alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true };
}

/**
 * Validates password strength
 * @param password Password string to validate
 * @returns Object with valid boolean and optional error message
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }

  return { valid: true };
}

/**
 * Validates request body size
 * @param body Request body as string
 * @param maxSize Maximum size in bytes
 * @returns Object with valid boolean and optional errors array
 */
export function validateBodySize(body: string, maxSize: number): { valid: boolean; errors?: string[] } {
  const size = new Blob([body]).size;

  if (size > maxSize) {
    return {
      valid: false,
      errors: [`Request body too large. Maximum size is ${(maxSize / 1024).toFixed(0)}KB`],
    };
  }

  return { valid: true };
}

/**
 * Validates that a value is a positive number
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns Object with valid boolean and optional error message
 */
export function validatePositiveNumber(value: any, fieldName: string): { valid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    return { valid: false, error: `${fieldName} must be a positive number` };
  }
  return { valid: true };
}

/**
 * Validates that a value is a non-negative number
 * @param value Value to validate
 * @param fieldName Name of the field for error message
 * @returns Object with valid boolean and optional error message
 */
export function validateNonNegativeNumber(value: any, fieldName: string): { valid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return { valid: false, error: `${fieldName} must be a non-negative number` };
  }
  return { valid: true };
}

/**
 * Sanitizes a string by trimming whitespace and limiting length
 * Also removes potentially dangerous characters
 * @param str String to sanitize
 * @param maxLength Maximum length of the string
 * @returns Sanitized string
 */
export function sanitizeString(str: string, maxLength: number): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = str.trim();

  // Remove null bytes and other control characters (except newlines and tabs for passwords)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

