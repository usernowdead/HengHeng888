import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { secrets } from '@/lib/secrets';
import { withAuthSecurity } from '@/lib/security/middleware';
import { validateEmail, validateUsername, sanitizeString } from '@/lib/security/validation';
import { SecurityLogger, getClientIP, getUserAgent } from '@/lib/security/security-logger';
import { setAuthToken, setRefreshToken, generateRefreshToken } from '@/lib/security/cookie-utils';
import { generateCSRFToken, setCSRFToken } from '@/lib/security/csrf';
import { randomBytes } from 'crypto';

const JWT_SECRET = secrets.JWT_SECRET;

async function handleLogin(request: NextRequest) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json({
                success: false,
                message: 'Invalid JSON in request body'
            }, { status: 400 });
        }
        
        const { identifier, password } = body;

        // Validation
        if (!identifier || !password) {
            return NextResponse.json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            }, { status: 400 });
        }

        // Sanitize input
        const sanitizedIdentifier = sanitizeString(identifier, 254);
        const sanitizedPassword = sanitizeString(password, 128);

        // Validate identifier (email or username)
        const isEmail = identifier.includes('@');
        if (isEmail) {
            const emailValidation = validateEmail(sanitizedIdentifier);
            if (!emailValidation.valid) {
                return NextResponse.json({
                    success: false,
                    message: 'รูปแบบอีเมลไม่ถูกต้อง'
                }, { status: 400 });
            }
        } else {
            const usernameValidation = validateUsername(sanitizedIdentifier);
            if (!usernameValidation.valid) {
                return NextResponse.json({
                    success: false,
                    message: 'รูปแบบชื่อผู้ใช้งานไม่ถูกต้อง'
                }, { status: 400 });
            }
        }

        // Validate password format (basic check)
        if (sanitizedPassword.length < 8 || sanitizedPassword.length > 128) {
            return NextResponse.json({
                success: false,
                message: 'รหัสผ่านต้องมีความยาวระหว่าง 8-128 ตัวอักษร'
            }, { status: 400 });
        }

        // Find user by email or username - use direct Prisma query
        let user = null;
        try {
            // Try email first
            user = await prisma.user.findFirst({
                where: { email: sanitizedIdentifier },
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
            });
            
            // If not found, try username
            if (!user) {
                user = await prisma.user.findFirst({
                    where: { username: sanitizedIdentifier },
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
                });
            }
        } catch (dbError: any) {
            console.error('Database error:', dbError);
            console.error('Database error code:', dbError.code);
            console.error('Database error message:', dbError.message);
            
            // Handle database connection errors
            if (dbError.code === 'P1001' || dbError.code === 'P1002' || dbError.message?.includes('Can\'t reach database server')) {
                return NextResponse.json({
                    success: false,
                    message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
                }, { status: 503 });
            }
            
            throw new Error(`Database query failed: ${dbError.message}`);
        }

        // Only log in development (never log sensitive data)
        if (process.env.NODE_ENV === 'development') {
            console.log('Login attempt:', { identifierType: isEmail ? 'email' : 'username', userFound: !!user });
        }

        if (!user) {
            // Log failed login attempt
            SecurityLogger.authFailure(
                sanitizedIdentifier,
                'User not found',
                getClientIP(request),
                getUserAgent(request)
            );
            
            return NextResponse.json({
                success: false,
                message: 'ชื่อผู้ใช้งานหรืออีเมลไม่ถูกต้อง'
            }, { status: 401 });
        }

        // Don't log sensitive information
        if (process.env.NODE_ENV === 'development') {
            console.log('User found:', { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                hasPassword: !!user.password
            });
        }

        // Check password
        if (!user.password) {
            console.error('User password is missing!');
            return NextResponse.json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
            }, { status: 500 });
        }

        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(sanitizedPassword, user.password);
            // Don't log password validation results in production
            if (process.env.NODE_ENV === 'development') {
                console.log('Password validation:', { isValid: isPasswordValid });
            }
        } catch (pwdError: any) {
            console.error('Password comparison error:', pwdError);
            return NextResponse.json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน'
            }, { status: 500 });
        }
        if (!isPasswordValid) {
            // Log failed login attempt (wrong password)
            SecurityLogger.authFailure(
                sanitizedIdentifier,
                'Invalid password',
                getClientIP(request),
                getUserAgent(request)
            );
            
            return NextResponse.json({
                success: false,
                message: 'รหัสผ่านไม่ถูกต้อง'
            }, { status: 401 });
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled && user.twoFactorSecret) {
            return NextResponse.json({
                success: true,
                message: 'กรุณาป้อนรหัส 2FA',
                data: {
                    requiresTwoFactor: true,
                    userId: user.id
                }
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Generate refresh token (for token rotation)
        const refreshToken = generateRefreshToken();

        // Format user response
        let balanceValue = 0;
        try {
            if (user.balance && typeof user.balance === 'object' && 'toNumber' in user.balance) {
                balanceValue = (user.balance as any).toNumber();
            } else {
                balanceValue = Number(user.balance) || 0;
            }
        } catch (e) {
            console.error('Error converting balance:', e);
            balanceValue = 0;
        }

        let createdAtISO = '';
        try {
            if (user.createdAt instanceof Date) {
                createdAtISO = user.createdAt.toISOString();
            } else {
                createdAtISO = new Date(user.createdAt as any).toISOString();
            }
        } catch (e) {
            console.error('Error converting createdAt:', e);
            createdAtISO = new Date().toISOString();
        }

        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile: user.profile,
            balance: balanceValue,
            twoFactorEnabled: user.twoFactorEnabled,
            time: createdAtISO
        };

        // Log successful login
        SecurityLogger.authSuccess(
            user.id,
            getClientIP(request),
            getUserAgent(request)
        );

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            data: {
                user: userResponse,
                // Still return token in response for backward compatibility
                // Frontend can use cookie (preferred) or token from response
                token,
                requiresTwoFactor: false
            }
        });

        // Set tokens in httpOnly cookies (more secure) - Vercel compatible
        setAuthToken(response, token);
        setRefreshToken(response, refreshToken);
        
        // Generate and set CSRF token for Double Submit Cookie pattern
        const csrfToken = generateCSRFToken();
        setCSRFToken(response, csrfToken);

        return response;

    } catch (error: any) {
        console.error('Login error:', error);
        console.error('Error code:', error.code);
        console.error('Error name:', error.name);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        
        // Handle Prisma initialization errors
        if (error.message?.includes('DATABASE_URL') || error.message?.includes('environment variable')) {
            console.error('❌ Database configuration error:', error.message);
            return NextResponse.json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล กรุณาติดต่อผู้ดูแลระบบ'
            }, { status: 500 });
        }
        
        // Handle database connection errors
        if (error.code === 'P1001' || error.code === 'P1002' || 
            error.code === 'P1000' || error.message?.includes('Can\'t reach database server') ||
            error.message?.includes('Connection') || error.message?.includes('timeout')) {
            console.error('❌ Database connection error:', error.message);
            return NextResponse.json({
                success: false,
                message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
            }, { status: 503 });
        }
        
        // Handle Prisma query errors
        if (error.code?.startsWith('P')) {
            console.error('❌ Prisma error:', error.code, error.message);
            return NextResponse.json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการเข้าถึงฐานข้อมูล กรุณาลองใหม่อีกครั้ง'
            }, { status: 500 });
        }
        
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            stack: undefined // Never expose stack traces in production
        }, { status: 500 });
    }
}

// Export with security middleware
export const POST = withAuthSecurity(handleLogin);
