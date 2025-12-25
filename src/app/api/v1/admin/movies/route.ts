import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/security/auth-utils';
import {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    updateMovieOrder
} from '@/lib/movie-service';
import { invalidateCache } from '@/lib/cache';
import { withCSRFSecurity } from '@/lib/security/middleware';

// GET - Get all movies
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

        const movies = await getAllMovies();

        return NextResponse.json({
            success: true,
            movies: movies
        });
    } catch (error) {
        console.error('Admin movies GET error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        }, { status: 500 });
    }
}

// POST - Create a new movie
async function handleMoviesPOST(request: NextRequest) {
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

        const { title, imageUrl, type, platform, order } = await request.json();

        if (!title || !imageUrl) {
            return NextResponse.json({
                success: false,
                message: 'กรุณากรอกชื่อหนังและลิงค์รูปภาพ'
            }, { status: 400 });
        }

        const movie = await createMovie({
            title: title.trim(),
            imageUrl: imageUrl.trim(),
            type: (type === 'series' ? 'series' : 'movie') as 'movie' | 'series',
            platform: platform?.trim() || null,
            order: order ?? 0
        });

        // Invalidate cache after creating movie
        await invalidateCache('movies:*');

        return NextResponse.json({
            success: true,
            movie: movie,
            message: 'เพิ่มหนังสำเร็จ'
        });
    } catch (error) {
        console.error('Admin movies POST error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเพิ่มหนัง'
        }, { status: 500 });
    }
}

// PUT - Update a movie
async function handleMoviesPUT(request: NextRequest) {
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

        const { id, title, imageUrl, type, platform, order } = await request.json();

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ ID ของหนัง'
            }, { status: 400 });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title.trim();
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
        if (type !== undefined) updateData.type = (type === 'series' ? 'series' : 'movie') as 'movie' | 'series';
        if (platform !== undefined) updateData.platform = platform?.trim() || null;
        if (order !== undefined) updateData.order = order;

        const movie = await updateMovie(id, updateData);

        if (!movie) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบหนังที่ต้องการแก้ไข'
            }, { status: 404 });
        }

        // Invalidate cache after updating movie
        await invalidateCache('movies:*');

        return NextResponse.json({
            success: true,
            movie: movie,
            message: 'แก้ไขหนังสำเร็จ'
        });
    } catch (error) {
        console.error('Admin movies PUT error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการแก้ไขหนัง'
        }, { status: 500 });
    }
}

// DELETE - Delete a movie
async function handleMoviesDELETE(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'กรุณาระบุ ID ของหนัง'
            }, { status: 400 });
        }

        const deleted = await deleteMovie(id);

        if (!deleted) {
            return NextResponse.json({
                success: false,
                message: 'ไม่พบหนังที่ต้องการลบ'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'ลบหนังสำเร็จ'
        });
    } catch (error) {
        console.error('Admin movies DELETE error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบหนัง'
        }, { status: 500 });
    }
}

// PATCH - Update movie order
async function handleMoviesPATCH(request: NextRequest) {
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

        const { movies } = await request.json();

        if (!Array.isArray(movies)) {
            return NextResponse.json({
                success: false,
                message: 'รูปแบบข้อมูลไม่ถูกต้อง'
            }, { status: 400 });
        }

        await updateMovieOrder(movies);

        return NextResponse.json({
            success: true,
            message: 'อัปเดตลำดับหนังสำเร็จ'
        });
    } catch (error) {
        console.error('Admin movies PATCH error:', error);
        return NextResponse.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตลำดับ'
        }, { status: 500 });
    }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleMoviesPOST);
export const PUT = withCSRFSecurity(handleMoviesPUT);
export const DELETE = withCSRFSecurity(handleMoviesDELETE);
export const PATCH = withCSRFSecurity(handleMoviesPATCH);

