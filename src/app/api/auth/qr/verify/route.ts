import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import speakeasy from 'speakeasy';
import { secrets } from '@/lib/secrets';
import { setAuthToken } from '@/lib/security/cookie-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

const JWT_SECRET = secrets.JWT_SECRET;

async function handleQRVerify(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;

        // Get request body
        const { sessionId, twoFactorToken } = await request.json();

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                message: 'Session ID is required'
            }, { status: 400 });
        }

        // Get session from database
        const session = await prisma.qRSession.findUnique({
            where: { sessionId }
        });

        if (!session) {
            return NextResponse.json({
                success: false,
                message: 'Session not found'
            }, { status: 404 });
        }

        // Check if session belongs to the scanner
        if (session.userId !== user.id) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized access to this session'
            }, { status: 403 });
        }

        // Check if session is scanned
        if (session.status !== 'scanned') {
            return NextResponse.json({
                success: false,
                message: 'Session is not in scanned state'
            }, { status: 400 });
        }

        // Check if session is expired
        const now = new Date();
        const expiresAt = session.expiresAt;

        if (now > expiresAt) {
            await prisma.qRSession.update({
                where: { sessionId },
                data: { status: 'expired' }
            });
            return NextResponse.json({
                success: false,
                message: 'Session has expired'
            }, { status: 400 });
        }

        // Check if user has 2FA enabled
        if (user.twoFactorEnabled && user.twoFactorSecret) {
            if (!twoFactorToken) {
                return NextResponse.json({
                    success: false,
                    message: 'กรุณาป้อนรหัส 2FA',
                    requiresTwoFactor: true
                }, { status: 400 });
            }

            // Verify 2FA token
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorToken,
                window: 2 // Allow 30 seconds window
            });

            if (!verified) {
                return NextResponse.json({
                    success: false,
                    message: 'รหัส 2FA ไม่ถูกต้อง'
                }, { status: 400 });
            }
        }

        // Generate JWT token for the target device
        const jwtModule = await import('jsonwebtoken');
        const authToken = jwtModule.default.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Update session to verified
        await prisma.qRSession.update({
            where: { sessionId },
            data: {
                status: 'verified'
            }
        });

        // Format user response (without sensitive data)
        const userWithoutSensitive = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile: user.profile,
            balance: user.balance.toNumber(),
            twoFactorEnabled: user.twoFactorEnabled,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return NextResponse.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            data: {
                token: authToken,
                user: userWithoutSensitive
            }
        });

    } catch (error) {
        console.error('QR verify error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการยืนยันการเข้าสู่ระบบ'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleQRVerify);

