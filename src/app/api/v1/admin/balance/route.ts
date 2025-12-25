import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { transactionService } from '@/lib/db-service';
import { prisma } from '@/lib/db';
import { validateNonNegativeNumber } from '@/lib/security/transaction-safety';
import { Prisma } from '@prisma/client';
import { withCSRFSecurity } from '@/lib/security/middleware';

// POST - Add or subtract balance
async function handleAdminBalance(request: NextRequest) {
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

        const { userId, amount, action, note } = await request.json();

        if (!userId || amount === undefined || !action) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ userId, amount และ action'
            }, { status: 400 });
        }

        if (!['add', 'subtract', 'set'].includes(action)) {
            return NextResponse.json({
                success: false,
                message: 'action ต้องเป็น add, subtract หรือ set'
            }, { status: 400 });
        }

        // Validate amount
        let amountNum: number;
        try {
            amountNum = validateNonNegativeNumber(amount, 'Amount');
        } catch (error: any) {
            return NextResponse.json({
                success: false,
                message: error.message || 'amount ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0'
            }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            }, { status: 404 });
        }

        const currentBalance = user.balance.toNumber();

        // Use database transaction for balance update (prevents race conditions)
        const result = await prisma.$transaction(async (tx) => {
            // Lock user row to prevent race conditions
            const lockedUser = await tx.$queryRaw<Array<{ id: string; balance: any }>>`
                SELECT id, balance 
                FROM users 
                WHERE id = ${userId} 
                FOR UPDATE
            `;

            if (!lockedUser || lockedUser.length === 0) {
                throw new Error('User not found');
            }

            const currentBalanceDecimal = new Prisma.Decimal(lockedUser[0].balance);
            let newBalance: Prisma.Decimal;

            switch (action) {
                case 'add':
                    newBalance = currentBalanceDecimal.plus(amountNum);
                    break;
                case 'subtract':
                    newBalance = currentBalanceDecimal.minus(amountNum);
                    // Prevent negative balance
                    if (newBalance.lessThan(0)) {
                        throw new Error('Cannot subtract: balance would become negative');
                    }
                    break;
                case 'set':
                    newBalance = new Prisma.Decimal(amountNum);
                    // Prevent negative balance
                    if (newBalance.lessThan(0)) {
                        throw new Error('Cannot set balance to negative value');
                    }
                    break;
                default:
                    throw new Error('Invalid action');
            }

            // Update balance
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { balance: newBalance },
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

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId,
                    type: action === 'add' ? 'topup' : 'adjustment',
                    amount: amountNum,
                    balanceBefore: currentBalanceDecimal,
                    balanceAfter: newBalance,
                    description: `Admin ${action} balance`,
                    note: note || null
                }
            });

            return {
                user: updatedUser,
                newBalance: newBalance.toNumber()
            };
        });

        const updatedUser = result.user;
        const newBalance = result.newBalance;

        return NextResponse.json({
            success: true,
            message: 'อัปเดตยอดเงินสำเร็จ',
            data: {
                userId,
                previousBalance: currentBalance,
                newBalance,
                action,
                amount: amountNum,
                note: note || null
            }
        });

    } catch (error: any) {
        console.error('Admin balance POST error:', error);
        
        if (error.message === 'User not found' || error.message?.includes('not found')) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            }, { status: 404 });
        }
        
        if (error.message?.includes('negative')) {
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 400 });
        }
        
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตยอดเงิน'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleAdminBalance);
