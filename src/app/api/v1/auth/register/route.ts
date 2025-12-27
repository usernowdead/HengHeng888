import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { withAuthSecurity } from '@/lib/security/middleware';
import { validateEmail, validateUsername, validatePassword, sanitizeString } from '@/lib/security/validation';
import { setAuthToken, setRefreshToken, generateRefreshToken } from '@/lib/security/cookie-utils';

const JWT_SECRET = secrets.JWT_SECRET;

async function handleRegister(request: NextRequest) {
  try {
    const { email, username, password, confirmPassword } = await request.json();

    // Validation
    if (!email || !username || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email, 254);
    const sanitizedUsername = sanitizeString(username, 30);
    const sanitizedPassword = sanitizeString(password, 128);
    const sanitizedConfirmPassword = sanitizeString(confirmPassword, 128);

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

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'รหัสผ่านไม่ตรงกัน'
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

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPassword,
        role: 0,
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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Generate refresh token
    const refreshToken = generateRefreshToken();

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      data: {
        user: {
          ...newUser,
          balance: typeof newUser.balance === 'object' && 'toNumber' in newUser.balance
            ? (newUser.balance as any).toNumber()
            : Number(newUser.balance) || 0,
          time: newUser.createdAt instanceof Date
            ? newUser.createdAt.toISOString()
            : new Date(newUser.createdAt as any).toISOString()
        },
        // Still return token for backward compatibility
        token
      }
    });

    // Set tokens in httpOnly cookies (more secure)
    setAuthToken(response, token);
    setRefreshToken(response, refreshToken);

    return response;

  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'อีเมลหรือชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว'
      }, { status: 400 });
    }

    // Handle database connection errors
    if (error.code === 'P1001' || error.code === 'P1002' || error.message?.includes('Can\'t reach database server')) {
      console.error('Database connection error:', error);
      return NextResponse.json({
        success: false,
        message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Export with security middleware
export const POST = withAuthSecurity(handleRegister);
