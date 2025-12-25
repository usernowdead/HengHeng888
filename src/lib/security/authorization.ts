// Authorization utilities for preventing IDOR (Insecure Direct Object Reference)
import { prisma } from '@/lib/db';

/**
 * Checks if a user owns an order
 * Prevents IDOR attacks
 * Admin can access any order
 * 
 * @param userId - User ID from JWT token
 * @param orderId - Order ID to check
 * @returns true if user owns the order or is admin, false otherwise
 */
export async function verifyOrderOwnership(userId: string, orderId: string): Promise<boolean> {
  // Check if user is admin first (admin bypass)
  const userIsAdmin = await isAdmin(userId);
  if (userIsAdmin) {
    return true; // Admin can access any order
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true }
  });

  if (!order) {
    return false;
  }

  return order.userId === userId;
}

/**
 * Gets an order and verifies ownership
 * Admin can access any order (bypass for support purposes)
 * Throws error if order doesn't exist or user doesn't own it (and is not admin)
 * 
 * @param userId - User ID from JWT token
 * @param orderId - Order ID to retrieve
 * @param request - NextRequest for audit logging (optional)
 * @returns Order if user owns it or is admin
 * @throws Error if order not found or user doesn't own it (and is not admin)
 */
export async function getOrderWithOwnershipCheck(
  userId: string, 
  orderId: string,
  request?: Request
) {
  // Check if user is admin first (admin bypass)
  const userIsAdmin = await isAdmin(userId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        }
      }
    }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Admin can access any order, regular users can only access their own
  if (!userIsAdmin && order.userId !== userId) {
    throw new Error('Access denied: You do not own this order');
  }

  // Log admin access (non-blocking)
  if (userIsAdmin && order.userId !== userId && request) {
    const { logAdminAccess, getClientIp, getUserAgent } = await import('./audit-log');
    logAdminAccess({
      adminId: userId,
      targetResource: 'order',
      resourceId: orderId,
      action: 'bypass_access',
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      metadata: {
        orderUserId: order.userId,
        orderType: order.type,
        orderState: order.state,
        orderPrice: order.price.toString(),
      }
    });
  }

  return order;
}

/**
 * Checks if user is admin
 * 
 * @param userId - User ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  return user?.role === 1;
}



/**
 * Checks if a user owns an order
 * Prevents IDOR attacks
 * Admin can access any order
 * 
 * @param userId - User ID from JWT token
 * @param orderId - Order ID to check
 * @returns true if user owns the order or is admin, false otherwise
 */
export async function verifyOrderOwnership(userId: string, orderId: string): Promise<boolean> {
  // Check if user is admin first (admin bypass)
  const userIsAdmin = await isAdmin(userId);
  if (userIsAdmin) {
    return true; // Admin can access any order
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true }
  });

  if (!order) {
    return false;
  }

  return order.userId === userId;
}

/**
 * Gets an order and verifies ownership
 * Admin can access any order (bypass for support purposes)
 * Throws error if order doesn't exist or user doesn't own it (and is not admin)
 * 
 * @param userId - User ID from JWT token
 * @param orderId - Order ID to retrieve
 * @param request - NextRequest for audit logging (optional)
 * @returns Order if user owns it or is admin
 * @throws Error if order not found or user doesn't own it (and is not admin)
 */
export async function getOrderWithOwnershipCheck(
  userId: string, 
  orderId: string,
  request?: Request
) {
  // Check if user is admin first (admin bypass)
  const userIsAdmin = await isAdmin(userId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        }
      }
    }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Admin can access any order, regular users can only access their own
  if (!userIsAdmin && order.userId !== userId) {
    throw new Error('Access denied: You do not own this order');
  }

  // Log admin access (non-blocking)
  if (userIsAdmin && order.userId !== userId && request) {
    const { logAdminAccess, getClientIp, getUserAgent } = await import('./audit-log');
    logAdminAccess({
      adminId: userId,
      targetResource: 'order',
      resourceId: orderId,
      action: 'bypass_access',
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      metadata: {
        orderUserId: order.userId,
        orderType: order.type,
        orderState: order.state,
        orderPrice: order.price.toString(),
      }
    });
  }

  return order;
}

/**
 * Checks if user is admin
 * 
 * @param userId - User ID to check
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  return user?.role === 1;
}

