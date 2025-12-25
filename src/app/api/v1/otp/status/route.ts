import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { secrets } from "@/lib/secrets";
import { requireAuth } from '@/lib/security/auth-utils';
import { withCSRFSecurity } from '@/lib/security/middleware';

const API_KEY_GAFIW = secrets.API_KEY_GAFIW;
const API_URL_GAFIW = "https://gafiwshop.xyz/api";

async function handleOtpStatus(request: NextRequest) {
  try {
    // Verify authentication (supports both cookies and Authorization header)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Error response
    }

    const { order } = await request.json();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่พบเลขออเดอร์",
        },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${API_URL_GAFIW}/otp_his`,
      {
        order,
      },
      {
        timeout: 10000,
      }
    );

    const data = response.data;

    if (data && data.status === "success") {
      return NextResponse.json({
        success: true,
        statusSms: data.statussms,
        sms: data.sms,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: data?.msg || "ไม่สามารถตรวจสอบสถานะ OTP ได้",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting OTP status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะ OTP",
      },
      { status: 500 }
    );
  }
}

// Export with CSRF protection and rate limiting
export const POST = withCSRFSecurity(handleOtpStatus);


