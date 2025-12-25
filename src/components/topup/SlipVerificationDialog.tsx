"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Upload, Image as ImageIcon, CheckCircle, XCircle, AlertCircle, Copy, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { createAuthFetchOptions } from '@/lib/api-helpers';

interface SlipVerificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerified?: (data: any) => void; // Callback when slip is verified
    transactionId?: string; // Optional: Link verification to a transaction
    amount?: number; // Optional: Expected amount
}

type VerificationMethod = 'image' | 'truewallet';

export function SlipVerificationDialog({
    open,
    onOpenChange,
    onVerified,
    transactionId,
    amount
}: SlipVerificationDialogProps) {
    const [method, setMethod] = useState<VerificationMethod>('image');
    const [file, setFile] = useState<File | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Always check for duplicate slips (security feature)
    const checkDuplicate = true;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.type.startsWith('image/')) {
                toast.error('กรุณาเลือกไฟล์ภาพ');
                return;
            }
            // Validate file size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error('ขนาดไฟล์ไม่ควรเกิน 10MB');
                return;
            }
            setFile(selectedFile);
        }
    };


    const handleAutoTopup = async (verificationData: any) => {
        if (!transactionId) return;

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const response = await fetch('/api/v1/easyslip/verify/auto-topup',
                createAuthFetchOptions({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        transactionId: transactionId,
                        verificationData: verificationData
                    })
                }, token)
            );

            const data = await response.json();

            if (data.success) {
                toast.success('เติมเงินสำเร็จ!');
                if (onVerified) {
                    onVerified(verificationData);
                }
                // Refresh page to update balance
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            } else {
                toast.error(data.message || 'ไม่สามารถเติมเงินได้');
            }
        } catch (error) {
            console.error('Error auto-topup:', error);
            toast.error('เกิดข้อผิดพลาดในการเติมเงิน');
        }
    };

    const handleVerificationSuccess = async (verificationData: any) => {
        if (!transactionId || !amount || !verificationData.amount) return;

        const verifiedAmount = typeof verificationData.amount === 'object' 
            ? verificationData.amount.amount 
            : parseFloat(verificationData.amount);
        const expectedAmount = parseFloat(amount.toString());
        
        if (Math.abs(verifiedAmount - expectedAmount) < 0.01) {
            // Amount matches, offer auto-topup
            setTimeout(() => {
                if (confirm(`จำนวนเงินตรงกัน (${verifiedAmount.toLocaleString()} บาท) ต้องการเติมเงินอัตโนมัติหรือไม่?`)) {
                    handleAutoTopup(verificationData);
                }
            }, 500);
        }
    };

    const handleVerifyImage = async () => {
        if (!file) {
            toast.error('กรุณาเลือกไฟล์ภาพ');
            return;
        }

        setVerifying(true);
        setVerificationResult(null);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const formData = new FormData();
            formData.append('file', file);
            if (checkDuplicate) {
                formData.append('checkDuplicate', 'true');
            }

            const response = await fetch('/api/v1/easyslip/verify/image',
                createAuthFetchOptions({
                    method: 'POST',
                    body: formData
                }, token)
            );

            const data = await response.json();

            if (data.success && data.data) {
                setVerificationResult(data.data);
                toast.success('ยืนยันการโอนเงินสำเร็จ');
                
                // Check if we should offer auto-topup
                await handleVerificationSuccess(data.data);
                
                if (onVerified) {
                    onVerified(data.data);
                }
            } else {
                toast.error(data.message || 'ไม่สามารถยืนยันการโอนเงินได้');
                setVerificationResult({ error: data.message || data.error });
            }
        } catch (error) {
            console.error('Error verifying slip:', error);
            toast.error('เกิดข้อผิดพลาดในการยืนยันการโอนเงิน');
        } finally {
            setVerifying(false);
        }
    };


    const handleVerifyTrueWallet = async () => {
        if (!file) {
            toast.error('กรุณาเลือกไฟล์ภาพสลิป TrueWallet');
            return;
        }

        setVerifying(true);
        setVerificationResult(null);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const formData = new FormData();
            formData.append('file', file);
            if (checkDuplicate) {
                formData.append('checkDuplicate', 'true');
            }

            const response = await fetch('/api/v1/easyslip/verify/truewallet',
                createAuthFetchOptions({
                    method: 'POST',
                    body: formData
                }, token)
            );

            const data = await response.json();

            if (data.success && data.data) {
                setVerificationResult(data.data);
                toast.success('ยืนยันการโอนเงินสำเร็จ');
                
                // Check if we should offer auto-topup
                await handleVerificationSuccess(data.data);
                
                if (onVerified) {
                    onVerified(data.data);
                }
            } else {
                toast.error(data.message || 'ไม่สามารถตรวจสอบสลิปได้');
                setVerificationResult({ error: data.message || data.error });
            }
        } catch (error) {
            console.error('Error verifying TrueWallet slip:', error);
            toast.error('เกิดข้อผิดพลาดในการตรวจสอบสลิป');
        } finally {
            setVerifying(false);
        }
    };

    const handleVerify = () => {
        switch (method) {
            case 'image':
                handleVerifyImage();
                break;
            case 'truewallet':
                handleVerifyTrueWallet();
                break;
        }
    };

    const handleClose = () => {
        setFile(null);
        setVerificationResult(null);
        setMethod('image');
        onOpenChange(false);
    };

    const formatAmount = (amt: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB'
        }).format(amt);
    };

    const handleCopyAccountNumber = () => {
        navigator.clipboard.writeText('8822403987');
        toast.success('คัดลอกเลขบัญชีแล้ว');
    };

    const handleCopyTrueWalletNumber = () => {
        navigator.clipboard.writeText('0657604969');
        toast.success('คัดลอกเบอร์ TrueWallet แล้ว');
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        ระบบเติมเงินด้วยสลิปโอนเงิน
                    </DialogTitle>
                    <DialogDescription>
                        กรุณาทำการโอนเงินมายังบัญชีดังกล่าว จากนั้นอัปโหลดสลิปเพื่อยืนยันการโอนเงิน
                    </DialogDescription>
                </DialogHeader>

                {/* Bank Account Information */}
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900">
                                    ชื่อบัญชี: <span className="font-semibold">ชนาธิป จุ้ยเจิม</span>
                                </p>
                                <p className="text-sm text-gray-700">
                                    ธนาคารไทยพาณิชย์ (SCB)
                                </p>
                                <p className="text-sm text-gray-700">
                                    เลขที่บัญชี: <span className="font-mono font-semibold">8822403987</span>
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyAccountNumber}
                                className="border-green-300 hover:bg-green-100"
                            >
                                <Copy className="h-4 w-4 mr-1" />
                                คัดลอกเลขบัญชี
                            </Button>
                        </div>
                    </div>
                </div>

                <Tabs value={method} onValueChange={(value) => setMethod(value as VerificationMethod)} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="image">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            ภาพสลิปธนาคาร
                        </TabsTrigger>
                        <TabsTrigger value="truewallet">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            สลิป TrueWallet
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="image" className="space-y-4 mt-4">
                        <div>
                            <Label>อัปโหลดภาพสลิป</Label>
                            <div className="mt-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {file ? file.name : 'เลือกไฟล์ภาพ'}
                                </Button>
                                {file && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="truewallet" className="space-y-4 mt-4">
                        {/* TrueWallet Account Information */}
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            ชื่อบัญชี: <span className="font-semibold">ชนาธิป จุ้ยเจิม</span>
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            เบอร์: <span className="font-mono font-semibold">0657604969</span>
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyTrueWalletNumber}
                                        className="border-orange-300 hover:bg-orange-100"
                                    >
                                        <Copy className="h-4 w-4 mr-1" />
                                        คัดลอกเบอร์
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>อัปโหลดภาพสลิป TrueWallet</Label>
                            <div className="mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="truewallet-file-input"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('truewallet-file-input')?.click()}
                                    className="w-full"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {file ? file.name : 'เลือกไฟล์ภาพ'}
                                </Button>
                                {file && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {transactionId && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                        <p>Transaction ID: {transactionId}</p>
                        {amount && <p>จำนวนเงินที่คาดหวัง: {formatAmount(amount)}</p>}
                    </div>
                )}

                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={handleVerify}
                        disabled={verifying || !file}
                        className="flex-1"
                    >
                        {verifying ? (
                            <>
                                <Spinner className="h-4 w-4 mr-2" />
                                กำลังยืนยัน...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                ยืนยันการโอนเงิน
                            </>
                        )}
                    </Button>
                    <Button variant="outline" onClick={handleClose}>
                        ยกเลิก
                    </Button>
                </div>

                {verificationResult && (
                    <div className="mt-4 p-4 border rounded-lg">
                        {verificationResult.error ? (
                            <div className="flex items-start gap-2 text-red-600">
                                <XCircle className="h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="font-medium">เกิดข้อผิดพลาด</p>
                                    <p className="text-sm">{verificationResult.error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium">ยืนยันสำเร็จ</p>
                                    </div>
                                </div>
                                
                                {verificationResult.amount && (
                                    <div className="space-y-1 text-sm">
                                        <p><strong>จำนวนเงิน:</strong> {formatAmount(verificationResult.amount.amount || verificationResult.amount)}</p>
                                        {verificationResult.transRef && (
                                            <p><strong>Transaction Ref:</strong> {verificationResult.transRef}</p>
                                        )}
                                        {verificationResult.transactionId && (
                                            <p><strong>Transaction ID:</strong> {verificationResult.transactionId}</p>
                                        )}
                                        {verificationResult.date && (
                                            <p><strong>วันที่:</strong> {new Date(verificationResult.date).toLocaleString('th-TH')}</p>
                                        )}
                                        {verificationResult.receiver && (
                                            <div className="mt-2">
                                                <p><strong>ผู้รับ:</strong></p>
                                                {verificationResult.receiver.bank && (
                                                    <p className="ml-4">ธนาคาร: {verificationResult.receiver.bank.name || verificationResult.receiver.bank.short}</p>
                                                )}
                                                {verificationResult.receiver.account?.name?.th && (
                                                    <p className="ml-4">ชื่อ: {verificationResult.receiver.account.name.th}</p>
                                                )}
                                            </div>
                                        )}
                                        {verificationResult.sender && (
                                            <div className="mt-2">
                                                <p><strong>ผู้ส่ง:</strong></p>
                                                {verificationResult.sender.bank && (
                                                    <p className="ml-4">ธนาคาร: {verificationResult.sender.bank.name || verificationResult.sender.bank.short}</p>
                                                )}
                                                {verificationResult.sender.account?.name?.th && (
                                                    <p className="ml-4">ชื่อ: {verificationResult.sender.account.name.th}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

