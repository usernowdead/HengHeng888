import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { secrets } from "@/lib/secrets";

const API_KEY_GAFIW = secrets.API_KEY_GAFIW;
const API_URL_GAFIW = "https://gafiwshop.xyz/api";

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get(`${API_URL_GAFIW}/otp_product`, {
      params: {
        keyapi: API_KEY_GAFIW,
      },
      timeout: 10000,
    });

    const data = response.data;

    // บางระบบ OTP ของ Gafiwshop ส่งมาเป็น Array ตรง ๆ ไม่ได้ห่อใน field product
    const list = Array.isArray(data?.product)
      ? data.product
      : Array.isArray(data)
      ? data
      : [];

    if (!Array.isArray(list) || list.length === 0) {
      return NextResponse.json(
        {
          success: false,
          products: [],
          raw: data,
          message: "ไม่สามารถดึงรายการ OTP ได้",
        },
        { status: 200 }
      );
    }

    // รวมประเทศตามชื่อโปรดักต์ เพื่อให้หน้า UI เลือกโปรดักต์ก่อนแล้วค่อยเลือกประเทศ
    const productMap = new Map<
      string,
      {
        id: string;
        name: string;
        img?: string;
        locations: {
          name: string;
          stock: number;
          price: number;
          priceVip: number;
          img?: string;
          locationImg?: string;
        }[];
      }
    >();

    for (const item of list) {
      const name = item.product || item.name;
      const location = item.location;
      if (!name || !location) continue;

      if (!productMap.has(name)) {
        productMap.set(name, {
          id: name,
          name,
          img: item.img,
          locations: [],
        });
      } else if (!productMap.get(name)!.img && item.img) {
        // กรณีโปรดักต์เดิมยังไม่มีรูป ใช้รูปจากรายการนี้
        productMap.get(name)!.img = item.img;
      }

      // Override logo สำหรับ Netflix ตามที่ผู้ใช้ต้องการ
      const lowerName = String(name).toLowerCase();
      if (lowerName.includes("netflix") || lowerName === "nf") {
        const product = productMap.get(name);
        if (product) {
          product.img = "https://playzaa.online/images/apppremium/nf.webp";
        }
      }

      const price = parseFloat(item.point) || 0;
      const priceVip = parseFloat(item.point_vip) || 0;
      const stock = parseInt(item.stock) || 0;

      productMap.get(name)!.locations.push({
        name: location,
        stock,
        price,
        priceVip,
        img: item.img,
        locationImg: item.location_img,
      });
    }

    const products = Array.from(productMap.values());

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching OTP products:", error);
    return NextResponse.json(
      {
        success: false,
        products: [],
        message: "เกิดข้อผิดพลาดในการดึงรายการ OTP",
      },
      { status: 500 }
    );
  }
}


