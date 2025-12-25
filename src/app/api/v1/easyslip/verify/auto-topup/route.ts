import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/security/auth-utils';
import { userService } from '@/lib/db-service';
import { withCSRFSecurity } from '@/lib/security/middleware';

/**
 * Auto top-up after slip verification
 * This endpoint is called when a slip is verified and matches a pending transaction
 */
async function handleAutoTopup(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user, decoded } = authResult;

        // Parse request body
        const { transactionId, verificationData } = await request.json();

        if (!transactionId) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ transactionId'
            }, { status: 400 });
        }

        if (!verificationData || !verificationData.amount) {
            return NextResponse.json({
                success: false,
                message: 'ข้อมูลการตรวจสอบไม่ครบถ้วน'
            }, { status: 400 });
        }

        // Find transaction by internalTransactionId or id
        // transactionId could be either internal transaction ID or external transaction ID
        let transaction = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId: decoded.id,
                type: 'topup'
            }
        });

        // If not found by ID, try to find by external transactionId in data field
        if (!transaction) {
            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: decoded.id,
                    type: 'topup'
                }
            });

            // Search in data field for transactionId
            for (const tx of transactions) {
                try {
                    const txData = typeof tx.data === 'string' ? JSON.parse(tx.data) : tx.data;
                    if (txData?.transactionId === transactionId || txData?.data?.transactionId === transactionId) {
                        transaction = tx;
                        break;
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }

        if (!transaction) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบรายการเติมเงิน'
            }, { status: 404 });
        }

        // Parse transaction data
        let transactionData: any = {};
        try {
            if (transaction.data) {
                transactionData = typeof transaction.data === 'string' 
                    ? JSON.parse(transaction.data) 
                    : transaction.data;
            }
        } catch (e) {
            // Ignore parse errors
        }

        // Check if already completed
        if (transactionData.status === 'completed') {
            return NextResponse.json({
                success: true,
                message: 'รายการนี้ได้รับการเติมเงินแล้ว',
                alreadyCompleted: true
            });
        }

        // Get verified amount
        const verifiedAmount = typeof verificationData.amount === 'object' 
            ? verificationData.amount.amount 
            : parseFloat(verificationData.amount);

        const expectedAmount = parseFloat(transaction.amount.toString());

        // Verify amount matches (allow small difference for rounding)
        if (Math.abs(verifiedAmount - expectedAmount) > 0.01) {
            return NextResponse.json({
                success: false,
                message: `จำนวนเงินไม่ตรงกัน (ตรวจสอบ: ${verifiedAmount}, คาดหวัง: ${expectedAmount})`
            }, { status: 400 });
        }

        // Update user balance
        await prisma.$transaction(async (tx) => {
            // Lock user row
            const lockedUser = await tx.user.findUnique({
                where: { id: decoded.id },
                select: { balance: true }
            });

            if (!lockedUser) {
                throw new Error('User not found');
            }

            const currentBalance = lockedUser.balance;
            const newBalance = currentBalance.plus(verifiedAmount);

            // Update user balance
            await tx.user.update({
                where: { id: decoded.id },
                data: { balance: newBalance }
            });

            // Update transaction
            await tx.transaction.update({
                where: { id: transaction.id },
                data: {
                    data: {
                        ...transactionData,
                        status: 'completed',
                        verifiedAt: new Date().toISOString(),
                        verificationData: verificationData,
                        verifiedBy: 'easyslip'
                    }
                }
            });

            // Create balance transaction record
            await tx.transaction.create({
                data: {
                    userId: decoded.id,
                    type: 'topup',
                    amount: verifiedAmount,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    description: `Topup verified by EasySlip: ฿${verifiedAmount.toLocaleString()}`,
                    data: {
                        sourceTransactionId: transaction.id,
                        verificationMethod: 'easyslip',
                        verificationData: verificationData
                    }
                }
            });
        });

        // Refresh user data
        const updatedUser = await userService.findById(decoded.id);

        return NextResponse.json({
            success: true,
            message: 'เติมเงินสำเร็จ',
            data: {
                amount: verifiedAmount,
                newBalance: updatedUser?.balance.toString() || '0',
                transactionId: transaction.id
            }
        });

    } catch (error: any) {
        console.error('EasySlip auto-topup error:', error);
        
        return NextResponse.json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการเติมเงิน'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleAutoTopup);

