"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Camera, CameraOff, XCircle } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
    onScanSuccess?: (data: string) => void;
    onClose: () => void;
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            setErrorMsg(null);

            // Request camera access with optimal constraints for smooth video
            const constraints: MediaStreamConstraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: "environment", // Use back camera if available
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraOn(true);
                toast.success("เปิดกล้องสำเร็จ");
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            let errorMessage = "ไม่สามารถเข้าถึงกล้องได้";

            if (error instanceof Error) {
                if (error.name === "NotAllowedError") {
                    errorMessage = "กรุณาอนุญาตการเข้าถึงกล้อง";
                } else if (error.name === "NotFoundError") {
                    errorMessage = "ไม่พบกล้องในอุปกรณ์นี้";
                } else if (error.name === "NotReadableError") {
                    errorMessage = "กล้องถูกใช้งานโดยแอปพลิเคชันอื่น";
                }
            }

            setErrorMsg(errorMessage);
            toast.error(errorMessage);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsCameraOn(false);
        setErrorMsg(null);
        toast.success("ปิดกล้องแล้ว");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);
    return (
        <div className="space-y-4 w-full mx-auto">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5" /> สแกน QR Code
            </h2>

            {/* ERROR MESSAGE */}
            {errorMsg && (
                <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm flex gap-2 items-center">
                    <XCircle className="w-4 h-4" />
                    {errorMsg}
                </div>
            )}

            {/* VIDEO PREVIEW */}
            {isCameraOn ? (
                <div className="space-y-3">
                    <div className="relative">
                        <video
                            ref={videoRef}
                            className="w-full h-64 bg-black rounded-lg object-cover"
                            autoPlay
                            playsInline
                            muted
                        />
                    </div>

                    <Button onClick={stopCamera} className="w-full" variant="outline">
                        <CameraOff className="w-4 h-4 mr-2" />
                        ปิดกล้อง
                    </Button>
                </div>
            ) : (
                <Button onClick={startCamera} className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    เปิดกล้อง
                </Button>
            )}

            <Button onClick={onClose} variant="outline" className="w-full">
                ปิดหน้าต่าง
            </Button>
        </div>
    );
}