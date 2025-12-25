import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import { withCSRFSecurity } from '@/lib/security/middleware';

interface QRSession {
    id: string;
    status: 'pending' | 'scanned' | 'verified' | 'expired';
    qrCode: string;
    expiresAt: string;
    createdAt: string;
    scannedAt?: string;
    verifiedAt?: string;
    userId?: string;
    token?: string;
    user?: any;
}

async function handleQRScan(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;

        // Get QR data from request body
        const { qrData } = await request.json();

        if (!qrData) {
            return NextResponse.json({
                success: false,
                message: 'QR data is required'
            }, { status: 400 });
        }

        // Parse QR data
        let parsedQrData;
        try {
            parsedQrData = JSON.parse(qrData);
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: 'Invalid QR code format'
            }, { status: 400 });
        }

        if (parsedQrData.type !== 'login' || !parsedQrData.sessionId) {
            return NextResponse.json({
                success: false,
                message: 'Invalid QR code'
            }, { status: 400 });
        }

        const { sessionId } = parsedQrData;

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
                message: 'QR code has expired'
            }, { status: 400 });
        }

        // Check if session is already scanned or verified
        if (session.status !== 'pending') {
            return NextResponse.json({
                success: false,
                message: 'QR code has already been used'
            }, { status: 400 });
        }

        // Update session status to scanned
        await prisma.qRSession.update({
            where: { sessionId },
            data: {
                status: 'scanned',
                userId: user.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'QR code scanned successfully',
            sessionId: sessionId
        });

    } catch (error) {
        console.error('QR scan error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสแกน QR code'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleQRScan);

