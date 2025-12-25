import { NextRequest, NextResponse } from 'next/server';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "1x00000000000000000000AA";

export async function POST(request: NextRequest) {
    try {
        // Check if secret key is configured
        if (!TURNSTILE_SECRET_KEY) {
            console.error('TURNSTILE_SECRET_KEY not configured');
            return NextResponse.json({
                success: false,
                message: 'Turnstile verification not configured'
            }, { status: 500 });
        }

        // Get token from request body
        const { token, ip } = await request.json();

        if (!token) {
            return NextResponse.json({
                success: false,
                message: 'Token is required'
            }, { status: 400 });
        }

        // Get client IP for additional verification
        const clientIP = ip ||
            request.headers.get('CF-Connecting-IP') ||
            request.headers.get('X-Forwarded-For') ||
            request.headers.get('X-Real-IP') ||
            '127.0.0.1';

        // Skip verification for test keys in development
        if (TURNSTILE_SECRET_KEY === '1x00000000000000000000AA') {
            console.log('Using test Turnstile keys - skipping verification');
            return NextResponse.json({
                success: true,
                message: 'Verification successful (test mode)',
                data: {
                    challenge_ts: new Date().toISOString(),
                    hostname: 'localhost',
                    'error-codes': []
                }
            });
        }

        // Verify token with Cloudflare
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secret: TURNSTILE_SECRET_KEY,
                response: token,
                remoteip: clientIP,
            }),
        });

        const result = await response.json();

        console.log('Turnstile verification result:', result);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Verification successful',
                data: {
                    challenge_ts: result['challenge_ts'],
                    hostname: result.hostname,
                    'error-codes': result['error-codes']
                }
            });
        } else {
            console.warn('Turnstile verification failed:', result['error-codes']);
            return NextResponse.json({
                success: false,
                message: 'Verification failed',
                'error-codes': result['error-codes']
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Turnstile verification error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}
