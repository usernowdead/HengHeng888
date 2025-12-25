/**
 * Audit logging utility
 * Logs security-relevant events to stdout in structured format
 */

export interface AuditLogEntry {
  timestamp: string;
  event: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  success: boolean;
  error?: string;
}

/**
 * Log audit event to stdout
 * Format: JSON for easy parsing and structured logging
 */
export function auditLog(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Output as JSON to stdout (can be captured by log aggregation systems)
  console.log(JSON.stringify({
    type: 'audit',
    ...logEntry,
  }));
}

/**
 * Audit log for successful purchase
 */
export function auditPurchaseSuccess(params: {
  userId: string;
  orderId: string;
  productId: string;
  productType: string;
  price: number;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
}): void {
  auditLog({
    event: 'purchase.success',
    userId: params.userId,
    ip: params.ip,
    userAgent: params.userAgent,
    success: true,
    details: {
      orderId: params.orderId,
      productId: params.productId,
      productType: params.productType,
      price: params.price,
      ...params.details,
    },
  });
}

/**
 * Audit log for failed purchase
 */
export function auditPurchaseFailure(params: {
  userId?: string;
  orderId?: string;
  productId?: string;
  productType?: string;
  price?: number;
  error: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
}): void {
  auditLog({
    event: 'purchase.failure',
    userId: params.userId,
    ip: params.ip,
    userAgent: params.userAgent,
    success: false,
    error: params.error,
    details: {
      orderId: params.orderId,
      productId: params.productId,
      productType: params.productType,
      price: params.price,
      ...params.details,
    },
  });
}

/**
 * Audit log for exception/error
 */
export function auditException(params: {
  event: string;
  userId?: string;
  error: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
}): void {
  auditLog({
    event: params.event,
    userId: params.userId,
    ip: params.ip,
    userAgent: params.userAgent,
    success: false,
    error: params.error,
    details: params.details,
  });
}

/**
 * Extract IP and User-Agent from NextRequest
 */
export function extractRequestInfo(request: Request | { headers: Headers }): {
  ip?: string;
  userAgent?: string;
} {
  const headers = request.headers;
  
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || undefined;
  
  const userAgent = headers.get('user-agent') || undefined;
  
  return { ip, userAgent };
}

