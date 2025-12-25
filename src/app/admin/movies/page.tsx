"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Film, Plus, Edit, Trash2, GripVertical, X, Save, Tv } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface Movie {
    id: string
    title: string
    imageUrl: string
    type?: 'movie' | 'series'
    platform?: string | null
    order: number
    createdAt?: string
    updatedAt?: string
    isDefault?: boolean
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
    const [selectedType, setSelectedType] = useState<'movie' | 'series'>('movie')
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        type: 'movie' as 'movie' | 'series',
        platform: '',
        order: 0
    })

    useEffect(() => {
        fetchMovies()
    }, [selectedType])

    const fetchMovies = async () => {
        try {
            setLoading(true)
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            // ดึงข้อมูลหนัง/ซีรีย์จริงที่แสดงบนหน้าเว็บ (รวม default)
            const response = await fetch(`/api/v1/admin/movies/display?type=${selectedType}`, 
                createAuthFetchOptions({}, token)
            )

            const data = await response.json()
            if (data.success) {
                setMovies(data.movies || [])
            } else {
                toast.error(data.message || 'ไม่สามารถโหลดข้อมูลได้')
            }
        } catch (error) {
            console.error('Error fetching movies:', error)
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMovies()
    }, [selectedType])

    const handleOpenDialog = (movie?: Movie) => {
        if (movie) {
            setEditingMovie(movie)
            setFormData({
                title: movie.title,
                imageUrl: movie.imageUrl,
                type: movie.type || selectedType,
                platform: movie.platform || '',
                order: movie.order
            })
        } else {
            setEditingMovie(null)
        setFormData({
            title: '',
            imageUrl: '',
            type: selectedType,
            platform: '',
            order: movies.length
        })
        }
        setShowDialog(true)
    }

    const handleCloseDialog = () => {
        setShowDialog(false)
        setEditingMovie(null)
        setFormData({
            title: '',
            imageUrl: '',
            type: selectedType,
            order: 0
        })
    }

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.imageUrl.trim()) {
            toast.error('กรุณากรอกชื่อหนังและลิงค์รูปภาพ')
            return
        }

        try {
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            if (editingMovie) {
                // ถ้าเป็น default movie ให้สร้างใหม่แทนการแก้ไข
                if (editingMovie.isDefault) {
                    const fetchOptions = await createAuthFetchOptions({
                        method: 'POST',
                        body: JSON.stringify(formData)
                    }, token)
                    const response = await fetch('/api/v1/admin/movies', fetchOptions)

                    const data = await response.json()
                    if (data.success) {
                        toast.success('เพิ่มหนังใหม่สำเร็จ (แทนที่ default movie)')
                        handleCloseDialog()
                        fetchMovies()
                    } else {
                        toast.error(data.message || 'ไม่สามารถเพิ่มหนังได้')
                    }
                } else {
                    // Update หนังที่มีอยู่แล้ว
                    const fetchOptions = await createAuthFetchOptions({
                        method: 'PUT',
                        body: JSON.stringify({
                            id: editingMovie.id,
                            ...formData
                        })
                    }, token)
                    const response = await fetch('/api/v1/admin/movies', fetchOptions)

                    const data = await response.json()
                    if (data.success) {
                        toast.success('แก้ไขหนังสำเร็จ')
                        handleCloseDialog()
                        fetchMovies()
                    } else {
                        toast.error(data.message || 'ไม่สามารถแก้ไขหนังได้')
                    }
                }
            } else {
                // Create หนังใหม่
                const fetchOptions = await createAuthFetchOptions({
                    method: 'POST',
                    body: JSON.stringify(formData)
                }, token)
                const response = await fetch('/api/v1/admin/movies', fetchOptions)

                const data = await response.json()
                if (data.success) {
                    toast.success('เพิ่มหนังสำเร็จ')
                    handleCloseDialog()
                    fetchMovies()
                } else {
                    toast.error(data.message || 'ไม่สามารถเพิ่มหนังได้')
                }
            }
        } catch (error) {
            console.error('Error saving movie:', error)
            toast.error('เกิดข้อผิดพลาดในการบันทึก')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหนังนี้?')) {
            return
        }

        try {
            const { createAuthFetchOptions } = await import('@/lib/api-helpers')
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

            const fetchOptions = await createAuthFetchOptions({
                method: 'DELETE'
            }, token)
            const response = await fetch(`/api/v1/admin/movies?id=${id}`, fetchOptions)

            const data = await response.json()
            if (data.success) {
                toast.success('ลบหนังสำเร็จ')
                fetchMovies()
            } else {
                toast.error(data.message || 'ไม่สามารถลบหนังได้')
            }
        } catch (error) {
            console.error('Error deleting movie:', error)
            toast.error('เกิดข้อผิดพลาดในการลบ')
        }
    }

    const renderImagePreview = (url: string) => {
        if (!url) return null
        return (
            <div className='mt-2 p-2 border rounded-md bg-gray-50'>
                <p className='text-xs text-gray-600 mb-1'>Preview:</p>
                <img 
                    src={url} 
                    alt="Preview" 
                    className='max-w-full h-auto rounded-sm object-contain max-h-32'
                    onError={(e) => {
                        e.currentTarget.style.display = 'none'
                    }}
                />
            </div>
        )
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[60vh]'>
                <Spinner />
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-semibold text-gray-900 flex items-center gap-2'>
                        {selectedType === 'movie' ? <Film className='h-6 w-6' /> : <Tv className='h-6 w-6' />}
                        {selectedType === 'movie' ? 'จัดการหนังแนะนำ' : 'จัดการซีรีย์แนะนำ'}
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        {selectedType === 'movie' 
                            ? 'หนังที่แสดงในส่วน "แนะนำหนังน่าดู" บนหน้าแรก'
                            : 'ซีรีย์ที่แสดงในส่วน "แนะนำซีรีย์น่าดู" บนหน้าแรก'}
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className='bg-blue-600 hover:bg-blue-700'>
                    <Plus className='h-4 w-4 mr-2' />
                    เพิ่ม{selectedType === 'movie' ? 'หนัง' : 'ซีรีย์'}ใหม่
                </Button>
            </div>

            {/* Type Tabs */}
            <div className='flex gap-2 border-b'>
                <Button
                    variant={selectedType === 'movie' ? 'default' : 'ghost'}
                    onClick={() => setSelectedType('movie')}
                    className='rounded-b-none'
                >
                    <Film className='h-4 w-4 mr-2' />
                    หนัง
                </Button>
                <Button
                    variant={selectedType === 'series' ? 'default' : 'ghost'}
                    onClick={() => setSelectedType('series')}
                    className='rounded-b-none'
                >
                    <Tv className='h-4 w-4 mr-2' />
                    ซีรีย์
                </Button>
            </div>

            {/* Movies List */}
            {movies.length === 0 ? (
                <Card>
                    <CardContent className='py-12 text-center'>
                        <Film className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                        <p className='text-gray-500 mb-4'>ยังไม่มี{selectedType === 'movie' ? 'หนัง' : 'ซีรีย์'}ในระบบ</p>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className='h-4 w-4 mr-2' />
                            เพิ่ม{selectedType === 'movie' ? 'หนัง' : 'ซีรีย์'}ใหม่
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {movies.map((movie) => (
                        <Card key={movie.id} className='overflow-hidden'>
                            <div className='aspect-[2/3] relative overflow-hidden bg-gray-100'>
                                <img
                                    src={movie.imageUrl}
                                    alt={movie.title}
                                    className='w-full h-full object-cover'
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = '/image-product-app-p.png'
                                    }}
                                />
                            </div>
                            <CardContent className='p-4'>
                                <div className='flex items-start justify-between gap-2 mb-3'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <h3 className='font-semibold text-sm line-clamp-2'>{movie.title}</h3>
                                            {movie.isDefault && (
                                                <Badge variant='secondary' className='text-xs bg-blue-100 text-blue-700'>
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8'
                                            onClick={() => handleOpenDialog(movie)}
                                            title={movie.isDefault ? 'แก้ไข (จะสร้างเป็นข้อมูลใหม่ใน database)' : 'แก้ไข'}
                                        >
                                            <Edit className='h-4 w-4' />
                                        </Button>
                                        {!movie.isDefault && (
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50'
                                                onClick={() => handleDelete(movie.id)}
                                            >
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className='text-xs text-gray-500 space-y-1'>
                                    <p>ลำดับ: {movie.order}</p>
                                    {movie.isDefault ? (
                                        <p className='text-blue-600 font-medium'>หนังเริ่มต้น - แสดงเมื่อไม่มีข้อมูลใน database</p>
                                    ) : (
                                        movie.updatedAt && (
                                            <p>อัปเดต: {new Date(movie.updatedAt).toLocaleDateString('th-TH')}</p>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
                <DialogContent className='max-w-md'>
                    <DialogHeader>
                        <DialogTitle>
                            {editingMovie 
                                ? editingMovie.isDefault 
                                    ? `แก้ไข${selectedType === 'movie' ? 'หนัง' : 'ซีรีย์'} (จะสร้างเป็นข้อมูลใหม่ใน database)` 
                                    : `แก้ไข${selectedType === 'movie' ? 'หนัง' : 'ซีรีย์'}`
                                : `เพิ่ม${selectedType === 'movie' ? 'หนัง' : 'ซีรีย์'}ใหม่`}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMovie 
                                ? `แก้ไขข้อมูล${selectedType === 'movie' ? 'หนัง' : 'ซีรีย์'} ${editingMovie.title}`
                                : `เพิ่ม${selectedType === 'movie' ? 'หนัง' : 'ซีรีย์'}ใหม่เข้าสู่ระบบ`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        {!editingMovie && (
                            <div>
                                <Label htmlFor='type'>
                                    ประเภท <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex gap-2 mt-1'>
                                    <Button
                                        type='button'
                                        variant={formData.type === 'movie' ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, type: 'movie' })}
                                        className='flex-1'
                                    >
                                        <Film className='h-4 w-4 mr-2' />
                                        หนัง
                                    </Button>
                                    <Button
                                        type='button'
                                        variant={formData.type === 'series' ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, type: 'series' })}
                                        className='flex-1'
                                    >
                                        <Tv className='h-4 w-4 mr-2' />
                                        ซีรีย์
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div>
                            <Label htmlFor='title'>
                                ชื่อ{formData.type === 'movie' ? 'หนัง' : 'ซีรีย์'} <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='title'
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={formData.type === 'movie' ? 'เช่น FURIOSA: A MAD MAX SAGA' : 'เช่น SQUID GAME'}
                                className='mt-1'
                            />
                        </div>

                        <div>
                            <Label htmlFor='imageUrl'>
                                ลิงค์รูปภาพ <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='imageUrl'
                                type='url'
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder='https://example.com/movie-poster.jpg'
                                className='mt-1'
                            />
                            {renderImagePreview(formData.imageUrl)}
                            <p className='text-xs text-gray-500 mt-1'>
                                ใช้ลิงค์รูปภาพจากภายนอก (เช่น img.shibuya24.com)
                            </p>
                        </div>

                        <div>
                            <Label htmlFor='platform'>
                                แพลตฟอร์มสตรีมมิ่ง (เช่น HBO, Netflix, Disney+)
                            </Label>
                            <Input
                                id='platform'
                                value={formData.platform}
                                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                placeholder='เช่น HBO, Netflix, Disney+'
                                className='mt-1'
                            />
                            <p className='text-xs text-gray-500 mt-1'>
                                แสดงใต้ชื่อหนังเพื่อบอกว่าดูได้จากแพลตฟอร์มไหน (ไม่บังคับ)
                            </p>
                        </div>

                        <div>
                            <Label htmlFor='order'>
                                ลำดับการแสดงผล
                            </Label>
                            <Input
                                id='order'
                                type='number'
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                className='mt-1'
                                min='0'
                            />
                            <p className='text-xs text-gray-500 mt-1'>
                                ตัวเลขน้อยกว่า = แสดงก่อน (0 = แสดงแรกสุด)
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={handleCloseDialog}>
                            ยกเลิก
                        </Button>
                        <Button onClick={handleSubmit}>
                            <Save className='h-4 w-4 mr-2' />
                            {editingMovie ? 'บันทึกการแก้ไข' : `เพิ่ม${formData.type === 'movie' ? 'หนัง' : 'ซีรีย์'}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

