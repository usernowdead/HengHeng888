import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/db-service';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/security/auth-utils';

export async function GET(request: NextRequest) {
    try {
        console.log('📊 [Admin Stats] Starting to fetch stats...')
        
        // Verify authentication (supports both cookie and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            console.error('❌ [Admin Stats] Authentication failed')
            return authResult; // Error response
        }

        const { user } = authResult;
        console.log('✅ [Admin Stats] User authenticated:', user.username, 'role:', user.role)
        
        // Check if user is admin
        if (user.role !== 1) {
            console.error('❌ [Admin Stats] User is not admin (role:', user.role, ')')
            return NextResponse.json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึง'
            }, { status: 403 });
        }

        // Get statistics using database queries
        const [totalUsers, orderStats, allUsers] = await Promise.all([
            prisma.user.count(),
            orderService.getStats(),
            prisma.user.aggregate({
                _sum: { balance: true }
            })
        ]);

        // Recent orders (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const [recentOrdersCount, recentRevenueResult] = await Promise.all([
            prisma.order.count({
                where: {
                    createdAt: { gte: sevenDaysAgo }
                }
            }),
            prisma.order.aggregate({
                where: {
                    state: 'completed',
                    createdAt: { gte: sevenDaysAgo }
                },
                _sum: { price: true }
            })
        ]);

        const recentOrders = recentOrdersCount;
        const recentRevenue = recentRevenueResult._sum.price?.toNumber() || 0;
        const totalBalance = allUsers._sum.balance?.toNumber() || 0;

        const statsData = {
            overview: {
                totalUsers,
                totalOrders: orderStats.total,
                totalRevenue: orderStats.totalRevenue.toFixed(2),
                totalBalance: totalBalance.toFixed(2),
            },
            orders: {
                total: orderStats.total,
                pending: orderStats.pending,
                completed: orderStats.completed,
                failed: orderStats.failed,
                processing: orderStats.processing,
            },
            ordersByType: {
                premium: orderStats.byType.premium,
                topup: orderStats.byType.topup,
                social: orderStats.byType.social,
            },
            recent: {
                orders: recentOrders,
                revenue: recentRevenue.toFixed(2),
            }
        };

        console.log('✅ [Admin Stats] Stats calculated successfully:', {
            totalUsers,
            totalOrders: orderStats.total,
            totalRevenue: orderStats.totalRevenue.toFixed(2)
        })

        return NextResponse.json({
            success: true,
            data: statsData
        });

    } catch (error) {
        console.error('❌ [Admin Stats] Error:', error);
        console.error('❌ [Admin Stats] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        }, { status: 500 });
    }
}

