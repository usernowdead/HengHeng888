import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import { userService } from '@/lib/db-service';
import { withCSRFSecurity } from '@/lib/security/middleware';

// GET - Get all users
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        // Check if user is admin
        if (authResult.user.role !== 1) {
            return NextResponse.json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึง'
            }, { status: 403 });
        }

        // Get all users
        const users = await userService.getAll();

        // Format response
        const formattedUsers = users.map(user => ({
            ...user,
            balance: user.balance.toNumber(),
            time: user.createdAt.toISOString()
        }));

        return NextResponse.json({
            success: true,
            users: formattedUsers,
            count: formattedUsers.length
        });

    } catch (error) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}

// PUT - Update user (role, balance, etc)
async function handleUsersPUT(request: NextRequest) {
    try {
        // Verify admin authentication (supports both cookies and Authorization header)
        const authResult = await requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult; // Error response
        }

        // Check if user is admin
        if (authResult.user.role !== 1) {
            return NextResponse.json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึง'
            }, { status: 403 });
        }

        const { userId, role, balance } = await request.json();

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ userId'
            }, { status: 400 });
        }

        // Find user to update
        const userToUpdate = await userService.findById(userId);
        if (!userToUpdate) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            }, { status: 404 });
        }

        // Prevent admin from changing their own role
        if (userId === authResult.user.id && role !== undefined && role !== authResult.user.role) {
            return NextResponse.json({
                success: false,
                message: 'ไม่สามารถเปลี่ยน role ของตัวเองได้'
            }, { status: 400 });
        }

        // Update user
        const updateData: any = {};
        if (role !== undefined) {
            updateData.role = role;
        }
        if (balance !== undefined) {
            updateData.balance = parseFloat(balance);
        }

        const updatedUser = await userService.update(userId, updateData);

        return NextResponse.json({
            success: true,
            message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
            user: {
                ...updatedUser,
                balance: updatedUser.balance.toNumber(),
                time: updatedUser.createdAt.toISOString()
            }
        });

    } catch (error) {
        console.error('Admin users PUT error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const PUT = withCSRFSecurity(handleUsersPUT);

