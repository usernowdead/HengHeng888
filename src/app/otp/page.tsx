"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, Smartphone, Globe2, MessageSquare, Copy } from "lucide-react";

interface OtpLocation {
  name: string;
  stock: number;
  price: number;
  priceVip: number;
  img?: string;
  locationImg?: string;
}

interface OtpProduct {
  id: string;
  name: string;
  img?: string;
  locations: OtpLocation[];
}

export default function OtpPage() {
  const [products, setProducts] = useState<OtpProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [phoneHint, setPhoneHint] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [buying, setBuying] = useState(false);
  const [otpStatus, setOtpStatus] = useState<{ statusSms?: string; sms?: string } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/v1/otp/products");
        const data = await res.json();

        if (data.success) {
          setProducts(data.products || []);
        } else {
          toast.error(data.message || "ไม่สามารถโหลดรายการ OTP ได้");
        }
      } catch (error) {
        console.error("Error fetching OTP products:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดรายการ OTP");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const selectedLocationDetail = useMemo(
    () =>
      selectedProduct?.locations.find((loc) => loc.name === selectedLocation) ||
      null,
    [selectedProduct, selectedLocation]
  );

  const handleBuyOtp = async () => {
    if (!selectedProductId || !selectedLocation) {
      toast.error("กรุณาเลือกสินค้าและประเทศ");
      return;
    }

    setBuying(true);
    setOtpStatus(null);

    try {
      const res = await fetch("/api/v1/otp/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: selectedProductId,
          location: selectedLocation,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "สั่งซื้อ OTP สำเร็จ");
        setOrderId(data.order || "");
        if (data.order) {
          toast.info(`เลขออเดอร์ OTP ของคุณคือ ${data.order}`, { duration: 4000 });
        }
      } else {
        toast.error(data.message || "สั่งซื้อ OTP ไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error buying OTP:", error);
      toast.error("เกิดข้อผิดพลาดในการสั่งซื้อ OTP");
    } finally {
      setBuying(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!orderId) {
      toast.error("กรุณากรอกเลขออเดอร์ก่อนตรวจสอบสถานะ");
      return;
    }

    setCheckingStatus(true);
    setOtpStatus(null);

    try {
      const res = await fetch("/api/v1/otp/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order: orderId }),
      });

      const data = await res.json();

      if (data.success) {
        setOtpStatus({
          statusSms: data.statusSms,
          sms: data.sms,
        });
      } else {
        toast.error(data.message || "ไม่สามารถตรวจสอบสถานะ OTP ได้");
      }
    } catch (error) {
      console.error("Error checking OTP status:", error);
      toast.error("เกิดข้อผิดพลาดในการตรวจสอบสถานะ OTP");
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <main className="min-h-screen">
      <section className="border-b">
        <div className="w-full">
          <div className="px-3 pt-3 pb-2 border-b">
            <h3 className="text-base font-medium">บริการ OTP</h3>
            <p className="text-xs text-muted-foreground">
              เลือกโปรดักต์และประเทศที่ต้องการเพื่อสั่งซื้อเบอร์ OTP และตรวจสอบสถานะได้ทันที
            </p>
          </div>

          <div className="px-3 py-3 space-y-4">
            <Card className="border rounded-lg shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  เลือกโปรดักต์ OTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <p className="mb-1 text-[11px] text-muted-foreground">โปรดักต์</p>
                    <Select
                      value={selectedProductId}
                      onValueChange={(value) => {
                        setSelectedProductId(value);
                        setSelectedLocation("");
                      }}
                      disabled={loadingProducts}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder={loadingProducts ? "กำลังโหลด..." : "เลือกโปรดักต์"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[260px] text-xs">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-2">
                              {product.img && (
                                <img
                                  src={product.img}
                                  alt={product.name}
                                  className="h-4 w-4 rounded-sm object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                              <span>{product.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-[11px] text-muted-foreground">ประเทศ</p>
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                      disabled={!selectedProduct || (selectedProduct?.locations || []).length === 0}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder={selectedProduct ? "เลือกประเทศ" : "เลือกโปรดักต์ก่อน"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[260px] text-xs">
                        {selectedProduct?.locations?.map((loc) => (
                          <SelectItem key={loc.name} value={loc.name}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedProduct && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Globe2 className="w-3 h-3" />
                    รองรับประเทศทั้งหมด {selectedProduct.locations.length} ประเทศ
                  </p>
                )}

                {selectedLocationDetail && (
                  <p className="text-[11px] text-muted-foreground">
                    ราคาประมาณ: เริ่มต้น{" "}
                    <span className="font-semibold">
                      {selectedLocationDetail.priceVip > 0
                        ? selectedLocationDetail.priceVip
                        : selectedLocationDetail.price}{" "}
                      บาท
                    </span>{" "}
                    / เบอร์ — คงเหลือ{" "}
                    <span className="font-semibold">
                      {selectedLocationDetail.stock}
                    </span>{" "}
                    เบอร์
                  </p>
                )}

                {phoneHint && (
                  <p className="text-[11px] text-muted-foreground">
                    แนะนำ: {phoneHint}
                  </p>
                )}

                <div className="pt-1">
                  <Button
                    className="w-full h-9 text-xs cursor-pointer"
                    disabled={!selectedProductId || !selectedLocation || buying}
                    onClick={handleBuyOtp}
                  >
                    {buying ? "กำลังสั่งซื้อ..." : "สั่งซื้อ OTP"}
                  </Button>
                </div>

                {orderId && (
                  <div className="mt-2 rounded-md bg-muted px-3 py-2 space-y-1">
                    <p className="text-[11px] text-muted-foreground">
                      เลขออเดอร์ OTP ล่าสุด (ใช้สำหรับกดขอสถานะ / ข้อความ OTP ของแอปที่คุณเลือก เช่น Disney, Netflix ฯลฯ)
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] break-all flex-1">
                        {orderId}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 cursor-pointer"
                        onClick={() => {
                          navigator.clipboard
                            .writeText(orderId)
                            .then(() => toast.success("คัดลอกเลขออเดอร์แล้ว"))
                            .catch(() => toast.error("คัดลอกไม่สำเร็จ กรุณาลองอีกครั้ง"));
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            <Card className="border rounded-lg shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  ตรวจสอบสถานะ OTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground">เลขออเดอร์ OTP</p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      className="pl-8 h-9 text-xs"
                      placeholder="กรอกเลขออเดอร์จากการสั่งซื้อ OTP เช่น 650316005"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs cursor-pointer"
                    onClick={handleCheckStatus}
                    disabled={checkingStatus}
                  >
                    {checkingStatus ? "กำลังตรวจสอบ..." : "ตรวจสอบสถานะ"}
                  </Button>
                </div>

                {otpStatus && (
                  <div className="mt-2 rounded-md bg-muted px-3 py-2 space-y-1">
                    <p className="text-[11px] font-medium">
                      สถานะ SMS: <span className="font-normal">{otpStatus.statusSms || "-"}</span>
                    </p>
                    <p className="text-[11px] break-words">
                      ข้อความ OTP: <span className="font-mono text-[11px]">{otpStatus.sms || "-"}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

