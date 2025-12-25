// Refund with retry mechanism
import { refundPurchase } from './refund';

/**
 * Refunds a purchase with automatic retry mechanism
 * This is a wrapper around refundPurchase that adds retry logic
 * 
 * @param userId - User ID to refund
 * @param amount - Amount to refund
 * @param orderId - Order ID (optional, for tracking)
 * @param reason - Reason for refund
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 */
export async function refundPurchaseWithRetry(
  userId: string,
  amount: number,
  orderId?: string,
  reason?: string,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await refundPurchase(userId, amount, orderId, reason);
      return; // Success, exit function
    } catch (error: any) {
      lastError = error;
      console.error(`Refund attempt ${attempt}/${maxRetries} failed:`, error);

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  throw new Error(
    `Refund failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

