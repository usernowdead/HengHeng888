import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/security/auth-utils';
import { prisma } from '@/lib/db';
import { validatePassword, sanitizeString } from '@/lib/security/validation';
import { withCSRFSecurity } from '@/lib/security/middleware';

async function handleChangePassword(request: NextRequest) {
    try {
        // Verify authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        const user = authResult.user;

        const { currentPassword, newPassword } = await request.json();

        // Sanitize inputs
        const sanitizedCurrentPassword = sanitizeString(currentPassword, 128);
        const sanitizedNewPassword = sanitizeString(newPassword, 128);

        // Validate new password
        const passwordValidation = validatePassword(sanitizedNewPassword);
        if (!passwordValidation.valid) {
            return NextResponse.json({
                success: false,
                message: passwordValidation.errors[0] || 'รหัสผ่านใหม่ไม่ตรงตามข้อกำหนด'
            }, { status: 400 });
        }

        // Get user with password from database
        const userWithPassword = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, password: true }
        });

        if (!userWithPassword) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบข้อมูลผู้ใช้'
            }, { status: 404 });
        }

        // Check current password
        if (!userWithPassword.password) {
            return NextResponse.json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน'
            }, { status: 500 });
        }

        const isCurrentPasswordValid = await bcrypt.compare(sanitizedCurrentPassword, userWithPassword.password);
        if (!isCurrentPasswordValid) {
            return NextResponse.json({
                success: false,
                message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
            }, { status: 400 });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(sanitizedNewPassword, 12);

        // Update password in database
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json({
            success: true,
            message: 'เปลี่ยนรหัสผ่านสำเร็จ'
        });

    } catch (error) {
        console.error('Change password error:', error);

        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleChangePassword);
