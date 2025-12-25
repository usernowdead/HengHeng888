import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { secrets } from "@/lib/secrets";
import { requireAuth } from '@/lib/security/auth-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

const API_KEY_GAFIW = secrets.API_KEY_GAFIW;
const API_URL_GAFIW = "https://gafiwshop.xyz/api";

async function handleOtpBuy(request: NextRequest) {
  try {
    // Verify authentication (supports both cookies and Authorization header)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const { product, location } = await request.json();

    if (!product || !location) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาเลือกสินค้าและประเทศ",
        },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${API_URL_GAFIW}/otp_buy`,
      {
        keyapi: API_KEY_GAFIW,
        product,
        location,
      },
      {
        timeout: 15000,
      }
    );

    const data = response.data;

    if (data && data.status === "success") {
      return NextResponse.json({
        success: true,
        message: data.msg || "สั่งซื้อสำเร็จ",
        order: data.order,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: data?.msg || "สั่งซื้อไม่สำเร็จ",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error buying OTP:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการสั่งซื้อ OTP",
      },
      { status: 500 }
    );
  }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleOtpBuy);


