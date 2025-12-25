import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validateEmail, validateUsername, validatePassword, sanitizeString } from '@/lib/security/validation';
import { withCSRFSecurity } from '@/lib/security/middleware';

/**
 * Create admin user endpoint
 * This endpoint allows creating an admin user (role = 1)
 * SECURITY: Should be protected or only accessible during initial setup
 */
async function handleCreateAdmin(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!email || !username || !password) {
      return NextResponse.json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email, 254);
    const sanitizedUsername = sanitizeString(username, 30);
    const sanitizedPassword = sanitizeString(password, 128);

    // Validate email
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.valid) {
      return NextResponse.json({
        success: false,
        message: emailValidation.error || 'รูปแบบอีเมลไม่ถูกต้อง'
      }, { status: 400 });
    }

    // Validate username
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.valid) {
      return NextResponse.json({
        success: false,
        message: usernameValidation.error || 'รูปแบบชื่อผู้ใช้งานไม่ถูกต้อง'
      }, { status: 400 });
    }

    // Validate password
    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json({
        success: false,
        message: passwordValidation.error || 'รหัสผ่านไม่ตรงตามข้อกำหนด'
      }, { status: 400 });
    }

    // Check if email or username already exists
    const existingByEmail = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    });
    const existingByUsername = await prisma.user.findUnique({
      where: { username: sanitizedUsername }
    });

    if (existingByEmail || existingByUsername) {
      return NextResponse.json({
        success: false,
        message: 'อีเมลหรือชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(sanitizedPassword, 12);

    // Create admin user (role = 1)
    const adminUser = await prisma.user.create({
      data: {
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPassword,
        role: 1, // Admin role
        profile: null,
        balance: 0
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: true,
        balance: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'สร้างผู้ดูแลระบบสำเร็จ',
      data: {
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role,
        }
      }
    });

  } catch (error: any) {
    console.error('Create admin error:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'อีเมลหรือชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างผู้ดูแลระบบ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleCreateAdmin);
