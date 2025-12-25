// Transaction safety utilities for preventing race conditions
import type { Prisma } from '../../generated/prisma/client';
import { prisma } from '@/lib/db';

/**
 * Safely checks balance and deducts amount within a transaction
 * Uses SELECT FOR UPDATE to prevent race conditions
 * 
 * @param userId - User ID
 * @param amount - Amount to deduct
 * @returns Updated user with new balance
 * @throws Error if insufficient balance
 */
export async function checkAndDeductBalance(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number
): Promise<{ id: string; balance: Prisma.Decimal }> {
  // Validate amount
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (!Number.isFinite(amount)) {
    throw new Error('Amount must be a valid number');
  }

  // Use SELECT FOR UPDATE to lock the row (prevents race conditions)
  const user = await tx.$queryRaw<Array<{ id: string; balance: Prisma.Decimal }>>`
    SELECT id, balance 
    FROM users 
    WHERE id = ${userId} 
    FOR UPDATE
  `;

  if (!user || user.length === 0) {
    throw new Error('User not found');
  }

  const currentBalance = new Prisma.Decimal(user[0].balance);
  const newBalance = currentBalance.minus(amount);

  // Check if balance is sufficient
  if (newBalance.lessThan(0)) {
    throw new Error('Insufficient balance');
  }

  // Update balance atomically
  const updatedUser = await tx.user.update({
    where: { id: userId },
    data: { balance: newBalance },
    select: { id: true, balance: true }
  });

  return updatedUser;
}

/**
 * Validates that a numeric value is positive (unsigned integer-like behavior)
 * Similar to Rust's u64/u32 - rejects negative values at validation level
 */
export function validatePositiveNumber(value: any, fieldName: string = 'Amount'): number {
  if (value === undefined || value === null) {
    throw new Error(`${fieldName} is required`);
  }

  // Reject negative values immediately (like unsigned types in Rust)
  if (typeof value === 'string' && value.trim().startsWith('-')) {
    throw new Error(`${fieldName} cannot be negative`);
  }

  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  // Type-level rejection of negative values (like u64 in Rust)
  if (num < 0) {
    throw new Error(`${fieldName} cannot be negative (must be >= 0)`);
  }

  if (num <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }

  // Ensure it's a whole number for quantity-like fields (optional, can be removed for price)
  // if (num % 1 !== 0) {
  //   throw new Error(`${fieldName} must be a whole number`);
  // }

  return num;
}

/**
 * Validates that a numeric value is non-negative
 */
export function validateNonNegativeNumber(value: any, fieldName: string = 'Amount'): number {
  if (value === undefined || value === null) {
    throw new Error(`${fieldName} is required`);
  }

  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (num < 0) {
    throw new Error(`${fieldName} must be greater than or equal to 0`);
  }

  return num;
}

