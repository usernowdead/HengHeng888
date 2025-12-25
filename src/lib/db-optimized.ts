/**
 * Optimized Database Queries
 * Prevents N+1 query problems and improves performance
 * 
 * @module db-optimized
 */

import { prisma } from './db';
import type { Prisma } from '../generated/prisma/client';

/**
 * Get orders with user data (optimized - prevents N+1)
 * Uses include to fetch user data in a single query
 */
export async function getOrdersWithUsers(filters?: {
  type?: string;
  state?: string;
  limit?: number;
  offset?: number;
}) {
  return prisma.order.findMany({
    where: {
      ...(filters?.type && { type: filters.type }),
      ...(filters?.state && { state: filters.state }),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 25,
    skip: filters?.offset || 0,
  });
}

/**
 * Get user with orders count (optimized)
 * Uses aggregation to avoid loading all orders
 */
export async function getUserWithOrderCount(userId: string) {
  const [user, orderCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      }
    }),
    prisma.order.count({
      where: { userId }
    })
  ]);

  return {
    ...user,
    orderCount,
  };
}

/**
 * Get transactions with user data (optimized)
 */
export async function getTransactionsWithUsers(filters?: {
  userId?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  return prisma.transaction.findMany({
    where: {
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.type && { type: filters.type }),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        }
      },
      order: {
        select: {
          id: true,
          productId: true,
          type: true,
          state: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 25,
    skip: filters?.offset || 0,
  });
}

/**
 * Batch get users by IDs (prevents N+1)
 */
export async function getUsersByIds(userIds: string[]) {
  return prisma.user.findMany({
    where: {
      id: { in: userIds }
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      profile: true,
      balance: true,
      createdAt: true,
      updatedAt: true,
    }
  });
}

/**
 * Get dashboard stats (optimized - single query with aggregations)
 */
export async function getDashboardStats() {
  const [
    totalUsers,
    totalOrders,
    totalRevenue,
    recentOrders,
    orderStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { state: 'completed' },
      _sum: { price: true }
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    }),
    prisma.order.groupBy({
      by: ['state'],
      _count: { state: true }
    }),
  ]);

  return {
    totalUsers,
    totalOrders,
    totalRevenue: totalRevenue._sum.price?.toNumber() || 0,
    recentOrders,
    orderStats: orderStats.reduce((acc, stat) => {
      acc[stat.state] = stat._count.state;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Get orders with pagination (optimized)
 */
export async function getOrdersPaginated(options: {
  page: number;
  limit: number;
  type?: string;
  state?: string;
  userId?: string;
}) {
  const skip = (options.page - 1) * options.limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(options.type && { type: options.type }),
        ...(options.state && { state: options.state }),
        ...(options.userId && { userId: options.userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip,
    }),
    prisma.order.count({
      where: {
        ...(options.type && { type: options.type }),
        ...(options.state && { state: options.state }),
        ...(options.userId && { userId: options.userId }),
      },
    }),
  ]);

  return {
    orders,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

