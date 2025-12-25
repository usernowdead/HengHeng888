import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    const results = {
      users: 0,
      orders: 0,
      qrSessions: 0,
      adminCreated: false
    }

    // Migrate Users
    console.log('📦 Migrating users...')
    const usersPath = path.join(process.cwd(), 'data', 'users.json')
    const users = fs.existsSync(usersPath) ? JSON.parse(fs.readFileSync(usersPath, 'utf8')) : []
    
    for (const user of users) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            username: user.username,
            email: user.email,
            role: user.role || 0,
            profile: user.profile || null,
            balance: user.balance || 0,
            twoFactorEnabled: user.twoFactorEnabled || false,
            twoFactorSecret: user.twoFactorSecret || null,
          },
          create: {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password, // Already hashed
            role: user.role || 0,
            profile: user.profile || null,
            balance: user.balance || 0,
            twoFactorEnabled: user.twoFactorEnabled || false,
            twoFactorSecret: user.twoFactorSecret || null,
            createdAt: user.time ? new Date(user.time) : new Date(),
          }
        })
        results.users++
      } catch (error: any) {
        console.error(`Error migrating user ${user.id}:`, error.message)
      }
    }

    // Migrate Orders
    console.log('📦 Migrating orders...')
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json')
    const orders = fs.existsSync(ordersPath) ? JSON.parse(fs.readFileSync(ordersPath, 'utf8')) : []
    
    for (const order of orders) {
      try {
        await prisma.order.upsert({
          where: { id: order.id },
          update: {
            state: order.state || 'pending',
            transactionId: order.transactionId || null,
            data: order.data || null,
            productMetadata: order.productMetadata || null,
          },
          create: {
            id: order.id,
            userId: order.userId,
            productId: order.productId,
            type: order.type,
            reference: order.reference || null,
            transactionId: order.transactionId || null,
            state: order.state || 'pending',
            price: order.price || 0,
            data: order.data || null,
            productMetadata: order.productMetadata || null,
            createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
            updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
          }
        })
        results.orders++
      } catch (error: any) {
        console.error(`Error migrating order ${order.id}:`, error.message)
      }
    }

    // Migrate QR Sessions
    console.log('📦 Migrating QR sessions...')
    const qrSessionsPath = path.join(process.cwd(), 'data', 'qr_sessions.json')
    const qrSessions = fs.existsSync(qrSessionsPath) ? JSON.parse(fs.readFileSync(qrSessionsPath, 'utf8')) : []
    
    for (const session of qrSessions) {
      try {
        await prisma.qRSession.upsert({
          where: { sessionId: session.sessionId },
          update: {
            userId: session.userId || null,
            status: session.status || 'pending',
            expiresAt: session.expiresAt ? new Date(session.expiresAt) : new Date(),
          },
          create: {
            id: session.id || session.sessionId,
            sessionId: session.sessionId,
            userId: session.userId || null,
            status: session.status || 'pending',
            expiresAt: session.expiresAt ? new Date(session.expiresAt) : new Date(),
            createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
            updatedAt: session.updatedAt ? new Date(session.updatedAt) : new Date(),
          }
        })
        results.qrSessions++
      } catch (error: any) {
        console.error(`Error migrating QR session ${session.sessionId}:`, error.message)
      }
    }

    // Create admin if doesn't exist
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 1 }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123456', 12)
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@oho568.com',
          password: hashedPassword,
          role: 1,
          profile: null,
          balance: 0,
        }
      })
      results.adminCreated = true
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      results
    })

  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

