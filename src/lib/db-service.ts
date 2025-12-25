import { prisma } from './db'
import bcrypt from 'bcryptjs'
import type { Prisma } from '../generated/prisma/client'

// User Service
export const userService = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: true,
        balance: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        profile: true,
        balance: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  },

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        profile: true,
        balance: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  },

  async create(data: {
    username: string
    email: string
    password: string
    role?: number
    profile?: string | null
    balance?: number
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 12)
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: data.role ?? 0,
        profile: data.profile ?? null,
        balance: data.balance ?? 0,
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
    })
  },

  async update(id: string, data: {
    username?: string
    email?: string
    password?: string
    role?: number
    profile?: string | null
    balance?: number
    twoFactorEnabled?: boolean
    twoFactorSecret?: string | null
  }) {
    const updateData: any = { ...data }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12)
    }
    if (data.balance !== undefined) {
      updateData.balance = new Prisma.Decimal(data.balance)
    }
    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: true,
        balance: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  },

  async updateBalance(id: string, amount: number, type: 'add' | 'subtract' | 'set') {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new Error('User not found')

    let newBalance: Prisma.Decimal
    const currentBalance = user.balance.toNumber()

    switch (type) {
      case 'add':
        newBalance = new Prisma.Decimal(currentBalance + amount)
        break
      case 'subtract':
        newBalance = new Prisma.Decimal(Math.max(0, currentBalance - amount))
        break
      case 'set':
        newBalance = new Prisma.Decimal(amount)
        break
      default:
        throw new Error('Invalid balance operation type')
    }

    return prisma.user.update({
      where: { id },
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
    })
  },

  async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}

// Order Service
export const orderService = {
  async create(data: {
    userId: string
    productId: string
    type: 'premium' | 'topup_game' | 'social'
    reference?: string
    transactionId?: string
    state?: string
    price: number
    data?: string
    productMetadata?: any
  }) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        type: data.type,
        reference: data.reference,
        transactionId: data.transactionId,
        state: data.state || 'pending',
            price: new Prisma.Decimal(data.price),
        data: data.data,
        productMetadata: data.productMetadata,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })
  },

  async findByUserId(userId: string, type?: string) {
    return prisma.order.findMany({
      where: {
        userId,
        ...(type && { type })
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
      orderBy: { createdAt: 'desc' }
    })
  },

  async getAll(filters?: {
    type?: string
    state?: string
    limit?: number
    offset?: number
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
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    })
  },

  async update(id: string, data: {
    state?: string
    transactionId?: string
    data?: string
    productMetadata?: any
  }) {
    return prisma.order.update({
      where: { id },
      data: {
        ...data,
        ...(data.productMetadata && { productMetadata: data.productMetadata }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })
  },

  async getStats() {
    const [total, pending, completed, failed, processing] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { state: 'pending' } }),
      prisma.order.count({ where: { state: 'completed' } }),
      prisma.order.count({ where: { state: 'failed' } }),
      prisma.order.count({ where: { state: 'processing' } }),
    ])

    const [premium, topup, social] = await Promise.all([
      prisma.order.count({ where: { type: 'premium' } }),
      prisma.order.count({ where: { type: 'topup_game' } }),
      prisma.order.count({ where: { type: 'social' } }),
    ])

    const revenueResult = await prisma.order.aggregate({
      where: { state: 'completed' },
      _sum: { price: true }
    })

    const totalRevenue = revenueResult._sum.price?.toNumber() || 0

    return {
      total,
      pending,
      completed,
      failed,
      processing,
      byType: { premium, topup, social },
      totalRevenue,
    }
  }
}

// Transaction Service (for balance operations with transaction safety)
export const transactionService = {
  async createTransaction(data: {
    userId: string
    orderId?: string
    type: 'purchase' | 'topup' | 'refund' | 'adjustment'
    amount: number
    description?: string
    note?: string
  }) {
    return prisma.$transaction(async (tx) => {
      // Get current user balance
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { balance: true }
      })

      if (!user) throw new Error('User not found')

      const balanceBefore = user.balance.toNumber()
      let balanceAfter: number

      switch (data.type) {
        case 'purchase':
        case 'topup':
          balanceAfter = balanceBefore - data.amount
          if (balanceAfter < 0) throw new Error('Insufficient balance')
          break
        case 'refund':
        case 'adjustment':
          balanceAfter = balanceBefore + data.amount
          break
        default:
          throw new Error('Invalid transaction type')
      }

      // Update user balance
      await tx.user.update({
        where: { id: data.userId },
        data: { balance: new Prisma.Decimal(balanceAfter) }
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          orderId: data.orderId,
          type: data.type,
          amount: new Prisma.Decimal(data.amount),
          balanceBefore: new Prisma.Decimal(balanceBefore),
          balanceAfter: new Prisma.Decimal(balanceAfter),
          description: data.description,
          note: data.note,
        }
      })

      return transaction
    })
  },

  async getByUserId(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
  }
}

