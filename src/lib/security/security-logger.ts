/**
 * Security Event Logger
 * Logs security-related events for monitoring and auditing
 */

interface SecurityEvent {
  type: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'RATE_LIMIT' | 'CSRF_FAILURE' | 'INVALID_INPUT' | 'SUSPICIOUS_ACTIVITY' | 'ADMIN_ACTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Log security event
 */
export function logSecurityEvent(
  type: SecurityEvent['type'],
  severity: SecurityEvent['severity'],
  message: string,
  options: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  } = {}
): void {
  const event: SecurityEvent = {
    type,
    severity,
    message,
    userId: options.userId,
    ip: options.ip,
    userAgent: options.userAgent,
    metadata: options.metadata,
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = getSeverityEmoji(severity);
    console.log(`${emoji} [SECURITY] ${type}: ${message}`, {
      severity,
      ...options,
    });
  }

  // In production, you should send to:
  // - Log aggregation service (ELK, Datadog, etc.)
  // - Security monitoring system (SIEM)
  // - Alerting system for critical events
  
  // For now, we'll use structured JSON logging
  // This can be picked up by log aggregation tools
  console.log(JSON.stringify({
    level: 'security',
    ...event,
  }));
}

/**
 * Get emoji for severity level (for console output)
 */
function getSeverityEmoji(severity: SecurityEvent['severity']): string {
  switch (severity) {
    case 'CRITICAL':
      return '🔴';
    case 'HIGH':
      return '🟠';
    case 'MEDIUM':
      return '🟡';
    case 'LOW':
      return '🟢';
    default:
      return '⚪';
  }
}

/**
 * Extract IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (behind proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to connection remote address
  return request.ip || 'unknown';
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Helper functions for common security events
 */
export const SecurityLogger = {
  authSuccess: (userId: string, ip: string, userAgent: string) => {
    logSecurityEvent('AUTH_SUCCESS', 'LOW', `User ${userId} logged in successfully`, {
      userId,
      ip,
      userAgent,
    });
  },

  authFailure: (identifier: string, reason: string, ip: string, userAgent: string) => {
    logSecurityEvent('AUTH_FAILURE', 'MEDIUM', `Failed login attempt for ${identifier}: ${reason}`, {
      ip,
      userAgent,
      metadata: { identifier, reason },
    });
  },

  rateLimit: (ip: string, endpoint: string, userAgent: string) => {
    logSecurityEvent('RATE_LIMIT', 'MEDIUM', `Rate limit exceeded for ${endpoint}`, {
      ip,
      userAgent,
      metadata: { endpoint },
    });
  },

  csrfFailure: (ip: string, endpoint: string, userAgent: string) => {
    logSecurityEvent('CSRF_FAILURE', 'HIGH', `CSRF token verification failed for ${endpoint}`, {
      ip,
      userAgent,
      metadata: { endpoint },
    });
  },

  invalidInput: (endpoint: string, reason: string, ip: string, userAgent: string, userId?: string) => {
    logSecurityEvent('INVALID_INPUT', 'MEDIUM', `Invalid input on ${endpoint}: ${reason}`, {
      userId,
      ip,
      userAgent,
      metadata: { endpoint, reason },
    });
  },

  suspiciousActivity: (message: string, ip: string, userAgent: string, userId?: string, metadata?: Record<string, any>) => {
    logSecurityEvent('SUSPICIOUS_ACTIVITY', 'HIGH', message, {
      userId,
      ip,
      userAgent,
      metadata,
    });
  },

  adminAction: (userId: string, action: string, ip: string, userAgent: string, metadata?: Record<string, any>) => {
    logSecurityEvent('ADMIN_ACTION', 'MEDIUM', `Admin ${userId} performed action: ${action}`, {
      userId,
      ip,
      userAgent,
      metadata: { action, ...metadata },
    });
  },
};

// Import NextRequest for type
import { NextRequest } from 'next/server';

