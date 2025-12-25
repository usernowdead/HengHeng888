import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Find user transactions (topup type only)
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: user.id,
                type: 'topup',
                // Only get transactions that have payment gateway data
                data: {
                    path: ['paymentGateway'],
                    not: null
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        // Get total count
        const total = await prisma.transaction.count({
            where: {
                userId: decoded.id,
                type: 'topup',
                data: {
                    path: ['paymentGateway'],
                    not: null
                }
            }
        });

        // Format transactions
        const formattedTransactions = transactions.map(tx => {
            const data = tx.data as any || {};
            return {
                id: tx.id,
                transactionId: data.transactionId || '',
                paymentMethod: data.paymentMethod || 'unknown',
                paymentGateway: data.paymentGateway || '',
                amount: parseFloat(tx.amount.toString()),
                status: tx.status || 'pending',
                createdAt: tx.createdAt.toISOString(),
                updatedAt: tx.updatedAt.toISOString(),
                expiresAt: data.expiresAt ? new Date(data.expiresAt * 1000).toISOString() : null,
                qrUrl: data.qrUrl || null,
                voucherUrl: data.voucherUrl || null,
                voucherCode: data.voucherCode || null
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                transactions: formattedTransactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error: any) {
        console.error('Topup history error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการเติมเงิน'
        }, { status: 500 });
    }
}

