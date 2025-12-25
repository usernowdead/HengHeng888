import { NextRequest, NextResponse } from 'next/server';
import { read, save } from 'soly-db';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { withCSRFSecurity } from '@/lib/security/middleware';

interface QRSession {
    id: string;
    status: 'pending' | 'scanned' | 'verified' | 'expired';
    qrCode: string;
    expiresAt: string;
    createdAt: string;
    scannedAt?: string;
    verifiedAt?: string;
}

async function handleQRGenerate(request: NextRequest) {
    try {
        // Create new QR session
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        // Generate QR code data (session ID)
        const qrData = JSON.stringify({
            type: 'login',
            sessionId: sessionId
        });

        // Generate QR code as base64 image
        const qrCodeImage = await QRCode.toDataURL(qrData, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Create session object
        const session: QRSession = {
            id: sessionId,
            status: 'pending',
            qrCode: qrCodeImage,
            expiresAt: expiresAt.toISOString(),
            createdAt: new Date().toISOString()
        };

        // Save session to database
        const sessions: QRSession[] = read('qr_sessions.json') || [];
        sessions.push(session);
        save('qr_sessions.json', sessions);

        // Clean up expired sessions
        const now = new Date();
        const activeSessions = sessions.filter(s =>
            new Date(s.expiresAt) > now
        );
        if (activeSessions.length !== sessions.length) {
            save('qr_sessions.json', activeSessions);
        }

        return NextResponse.json({
            success: true,
            sessionId: sessionId,
            qrCode: qrCodeImage,
            expiresAt: expiresAt.toISOString()
        });

    } catch (error) {
        console.error('QR generate error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้าง QR Code'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleQRGenerate);
