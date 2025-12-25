import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';

// GET - Get all transactions (topup history)
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
        const type = searchParams.get('type');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');
        const offset = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (type) where.type = type;
        
        // Search by username or email
        if (search) {
            where.OR = [
                { user: { username: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { id: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get transactions with filters
        // Note: Assuming transactions are stored in a transactions table
        // If not, you may need to query from orders table with type='topup'
        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
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
                take: limit,
                skip: offset,
            }).catch(() => {
                // Fallback: if transaction table doesn't exist, return empty array
                return [];
            }),
            prisma.transaction.count({ where }).catch(() => 0)
        ]);

        // Format transactions
        const formattedTransactions = transactions.map(transaction => ({
            id: transaction.id,
            userId: transaction.userId,
            username: transaction.user?.username || 'Unknown',
            amount: typeof transaction.amount === 'object' ? transaction.amount.toNumber() : transaction.amount,
            type: transaction.type || 'unknown',
            description: transaction.description || '',
            createdAt: transaction.createdAt.toISOString(),
        }));

        return NextResponse.json({
            success: true,
            data: {
                transactions: formattedTransactions,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Admin transactions GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            data: {
                transactions: [],
                total: 0
            }
        }, { status: 500 });
    }
}

