import { NextRequest, NextResponse } from 'next/server';
import { read, save } from 'soly-db';

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

export async function GET(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                message: 'Session ID is required'
            }, { status: 400 });
        }

        // Get sessions from database
        const sessions: QRSession[] = read('qr_sessions.json') || [];
        const session = sessions.find(s => s.id === sessionId);

        if (!session) {
            return NextResponse.json({
                success: false,
                message: 'Session not found'
            }, { status: 404 });
        }

        // Check if session is expired
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);

        if (now > expiresAt) {
            // Update session status to expired
            session.status = 'expired';
            save('qr_sessions.json', sessions);

            return NextResponse.json({
                success: true,
                status: 'expired'
            });
        }

        // Return current status
        const response: any = {
            success: true,
            status: session.status
        };

        // If verified, include user data and token
        if (session.status === 'verified' && session.token && session.user) {
            response.token = session.token;
            response.user = session.user;
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('QR status check error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ'
        }, { status: 500 });
    }
}
