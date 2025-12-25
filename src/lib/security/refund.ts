// Refund utilities for handling failed external API calls
import { prisma } from '@/lib/db';
import { userService } from '@/lib/db-service';

/**
 * Refunds a purchase by adding balance back to user
 * Used when external API call fails after balance deduction
 * 
 * @param userId - User ID to refund
 * @param amount - Amount to refund
 * @param orderId - Order ID (optional, for tracking)
 * @param reason - Reason for refund
 */
export async function refundPurchase(
  userId: string,
  amount: number,
  orderId?: string,
  reason?: string
): Promise<void> {
  try {
    // BUSINESS LOGIC SECURITY: Use transaction with row locking to prevent race conditions
    await prisma.$transaction(async (tx) => {
      // Lock user row to prevent concurrent refunds
      const user = await tx.$queryRaw<Array<{ id: string; balance: any }>>`
        SELECT id, balance 
        FROM users 
        WHERE id = ${userId} 
        FOR UPDATE
      `;

      if (!user || user.length === 0) {
        throw new Error(`User ${userId} not found`);
      }

      // Add balance back
      const currentBalance = new (await import('@prisma/client')).Prisma.Decimal(user[0].balance);
      const newBalance = currentBalance.plus(amount);

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance }
      });

      // Create transaction record for refund
      await tx.transaction.create({
        data: {
          userId: userId,
          orderId: orderId || null,
          type: 'refund',
          amount: amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: reason || `Refund for order ${orderId || 'unknown'}`,
        }
      });

      // Update order state if orderId is provided
      if (orderId) {
        await tx.order.update({
          where: { id: orderId },
          data: { 
            state: 'refunded',
            data: {
              refunded: true,
              refundAmount: amount,
              refundReason: reason,
              refundedAt: new Date().toISOString()
            }
          }
        }).catch(() => {
          // Order might not exist, ignore error
        });
      }
    });

    console.log(`Refund successful: User ${userId}, Amount: ${amount}, Order: ${orderId || 'N/A'}`);
  } catch (error) {
    console.error('Refund error:', error);
    throw error;
  }
}
