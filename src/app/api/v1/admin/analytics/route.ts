import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        // Check if user is admin
        if (authResult.user.role !== 1) {
            return NextResponse.json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึง'
            }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get orders from database
        const ordersInRange = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });

        // Daily revenue for the period
        const dailyRevenue: { [key: string]: number } = {};
        const dailyOrders: { [key: string]: number } = {};

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dailyRevenue[dateStr] = 0;
            dailyOrders[dateStr] = 0;
        }

        ordersInRange.forEach((order) => {
            if (order.state === 'completed') {
                const dateStr = order.createdAt.toISOString().split('T')[0];
                const price = order.price.toNumber();
                dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + price;
                dailyOrders[dateStr] = (dailyOrders[dateStr] || 0) + 1;
            }
        });

        // Revenue by type
        const revenueByType = {
            premium: ordersInRange
                .filter((o) => o.type === 'premium' && o.state === 'completed')
                .reduce((sum, o) => sum + o.price.toNumber(), 0),
            topup_game: ordersInRange
                .filter((o) => o.type === 'topup_game' && o.state === 'completed')
                .reduce((sum, o) => sum + o.price.toNumber(), 0),
            social: ordersInRange
                .filter((o) => o.type === 'social' && o.state === 'completed')
                .reduce((sum, o) => sum + o.price.toNumber(), 0),
        };

        // Orders by state
        const ordersByState = {
            pending: ordersInRange.filter((o) => o.state === 'pending').length,
            completed: ordersInRange.filter((o) => o.state === 'completed').length,
            failed: ordersInRange.filter((o) => o.state === 'failed').length,
            processing: ordersInRange.filter((o) => o.state === 'processing').length,
        };

        // Top users by orders
        const userOrderCounts: { [key: string]: number } = {};
        ordersInRange.forEach((order) => {
            userOrderCounts[order.userId] = (userOrderCounts[order.userId] || 0) + 1;
        });

        const topUsers = Object.entries(userOrderCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([userId, count]) => {
                const order = ordersInRange.find((o) => o.userId === userId);
                return {
                    userId,
                    username: order?.user?.username || 'Unknown',
                    email: order?.user?.email || 'Unknown',
                    orderCount: count
                };
            });

        // Total revenue in range
        const totalRevenue = ordersInRange
            .filter((o) => o.state === 'completed')
            .reduce((sum, o) => sum + o.price.toNumber(), 0);

        // Total orders in range
        const totalOrders = ordersInRange.length;

        return NextResponse.json({
            success: true,
            data: {
                period: {
                    days,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
                summary: {
                    totalRevenue: totalRevenue.toFixed(2),
                    totalOrders,
                    averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00',
                },
                dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
                    date,
                    revenue: revenue.toFixed(2)
                })),
                dailyOrders: Object.entries(dailyOrders).map(([date, count]) => ({
                    date,
                    count
                })),
                revenueByType,
                ordersByState,
                topUsers,
            }
        });

    } catch (error) {
        console.error('Admin analytics error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}
