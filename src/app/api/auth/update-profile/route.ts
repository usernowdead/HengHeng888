import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import { withCSRFSecurity } from '@/lib/security/middleware';

async function handleUpdateProfile(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;

        const { username, profile } = await request.json();

        // Validate username
        if (!username || username.trim().length === 0) {
            return NextResponse.json({
                success: false,
                message: 'กรุณากรอกชื่อผู้ใช้งาน'
            }, { status: 400 });
        }

        if (username.length < 3) {
            return NextResponse.json({
                success: false,
                message: 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร'
            }, { status: 400 });
        }

        if (username.length > 30) {
            return NextResponse.json({
                success: false,
                message: 'ชื่อผู้ใช้งานต้องไม่เกิน 30 ตัวอักษร'
            }, { status: 400 });
        }

        // Check if username is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                username: username.trim(),
                id: { not: user.id }
            }
        });
        if (existingUser) {
            return NextResponse.json({
                success: false,
                message: 'ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว'
            }, { status: 400 });
        }

        // Validate profile URL if provided
        if (profile && profile.trim()) {
            try {
                const url = new URL(profile.trim());
                if (!['http:', 'https:'].includes(url.protocol)) {
                    return NextResponse.json({
                        success: false,
                        message: 'URL รูปโปรไฟล์ต้องเป็น HTTP หรือ HTTPS'
                    }, { status: 400 });
                }
            } catch {
                return NextResponse.json({
                    success: false,
                    message: 'URL รูปโปรไฟล์ไม่ถูกต้อง'
                }, { status: 400 });
            }
        }

        // Update user data
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                username: username.trim(),
                profile: profile && profile.trim() ? profile.trim() : null
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
                updatedAt: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ',
            data: {
                user: {
                    ...updatedUser,
                    balance: updatedUser.balance.toNumber()
                }
            }
        });

    } catch (error: any) {
        console.error('Update profile error:', error);
        
        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                message: 'ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลส่วนตัว'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleUpdateProfile);

