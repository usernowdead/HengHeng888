"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface GameInfo {
    name: string
    key: string
    hasImage: boolean
}

interface CheckResult {
    total: number
    hasImages: number
    missingImages: number
    missingGames: Array<{ name: string; key: string }>
    allGames: GameInfo[]
}

export default function MissingGameImagesPage() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<CheckResult | null>(null)

    const checkMissingImages = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/v1/admin/check-missing-game-images')
            const result = await response.json()

            if (result.success) {
                setData(result.data)
                toast.success('ตรวจสอบข้อมูลสำเร็จ')
            } else {
                toast.error(result.message || 'เกิดข้อผิดพลาด')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('เกิดข้อผิดพลาดในการตรวจสอบ')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkMissingImages()
    }, [])

    return (
        <div className='container mx-auto p-6 max-w-6xl'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold mb-2'>ตรวจสอบเกมที่ยังไม่มีรูป</h1>
                <p className='text-gray-600'>ตรวจสอบว่าเกมไหนยังไม่มีรูปเป็นของตัวเอง</p>
            </div>

            <div className='mb-4'>
                <Button onClick={checkMissingImages} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    รีเฟรชข้อมูล
                </Button>
            </div>

            {data && (
                <>
                    {/* Summary Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-sm font-medium'>เกมทั้งหมด</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-3xl font-bold'>{data.total}</p>
                            </CardContent>
                        </Card>

                        <Card className='border-green-200 bg-green-50'>
                            <CardHeader>
                                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                                    <CheckCircle className='h-4 w-4 text-green-600' />
                                    มีรูปแล้ว
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-3xl font-bold text-green-600'>{data.hasImages}</p>
                            </CardContent>
                        </Card>

                        <Card className='border-orange-200 bg-orange-50'>
                            <CardHeader>
                                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                                    <AlertCircle className='h-4 w-4 text-orange-600' />
                                    ยังไม่มีรูป
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-3xl font-bold text-orange-600'>{data.missingImages}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Missing Games List */}
                    {data.missingGames.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-lg'>เกมที่ยังไม่มีรูป ({data.missingGames.length} เกม)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-2'>
                                    {data.missingGames.map((game, index) => (
                                        <div key={index} className='p-3 border rounded-lg bg-orange-50 border-orange-200'>
                                            <p className='font-semibold'>{game.name}</p>
                                            <p className='text-sm text-gray-600'>Key: {game.key}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* All Games List */}
                    <Card className='mt-6'>
                        <CardHeader>
                            <CardTitle className='text-lg'>รายการเกมทั้งหมด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-2 max-h-96 overflow-y-auto'>
                                {data.allGames.map((game, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-3 border rounded-lg ${
                                            game.hasImage 
                                                ? 'bg-green-50 border-green-200' 
                                                : 'bg-orange-50 border-orange-200'
                                        }`}
                                    >
                                        <div className='flex items-center justify-between'>
                                            <div>
                                                <p className='font-semibold'>{game.name}</p>
                                                <p className='text-sm text-gray-600'>Key: {game.key}</p>
                                            </div>
                                            {game.hasImage ? (
                                                <CheckCircle className='h-5 w-5 text-green-600' />
                                            ) : (
                                                <AlertCircle className='h-5 w-5 text-orange-600' />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {loading && !data && (
                <Card>
                    <CardContent className='p-6 text-center'>
                        <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4 text-gray-400' />
                        <p className='text-gray-600'>กำลังตรวจสอบข้อมูล...</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

