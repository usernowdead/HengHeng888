"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Users, Search, Edit, Shield, UserX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface User {
    id: string
    username: string
    email: string
    role: number
    balance?: number
    time: string
}

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editRole, setEditRole] = useState<number>(0)
    const [editBalance, setEditBalance] = useState<string>('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch('/api/v1/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()
            if (data.success) {
                setUsers(data.users)
            } else {
                toast.error(data.message || 'ไม่สามารถโหลดข้อมูลได้')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const handleEditUser = (user: User) => {
        setSelectedUser(user)
        setEditRole(user.role)
        setEditBalance(user.balance?.toString() || '0')
        setEditDialogOpen(true)
    }

    const handleSaveUser = async () => {
        if (!selectedUser) return

        try {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch('/api/v1/admin/users', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    role: editRole,
                    balance: editBalance ? parseFloat(editBalance) : undefined
                })
            })

            const data = await response.json()
            if (data.success) {
                toast.success('อัปเดตข้อมูลผู้ใช้สำเร็จ')
                setEditDialogOpen(false)
                fetchUsers()
            } else {
                toast.error(data.message || 'ไม่สามารถอัปเดตข้อมูลได้')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
        }
    }

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
            <div>
                <h1 className='text-2xl font-semibold text-gray-900'>ผู้ใช้</h1>
                <p className='text-sm text-gray-500 mt-1'>
                    ทั้งหมด {users.length} คน
                </p>
            </div>

            {/* Search */}
            <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                    placeholder='ค้นหาชื่อผู้ใช้หรืออีเมล...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                />
            </div>

            {/* Users List */}
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                {filteredUsers.length === 0 ? (
                    <div className='text-center py-12 text-gray-500'>
                        <UserX className='h-12 w-12 mx-auto mb-2 opacity-50' />
                        <p>ไม่พบผู้ใช้</p>
                    </div>
                ) : (
                    <div className='divide-y divide-gray-200'>
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className='p-4 hover:bg-gray-50 transition-colors'
                            >
                            <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <h3 className='font-medium'>{user.username}</h3>
                                        <Badge variant={user.role === 1 ? 'default' : 'secondary'} className='text-xs'>
                                            {user.role === 1 ? 'Admin' : 'User'}
                                        </Badge>
                                    </div>
                                    <p className='text-xs text-gray-600 mb-1'>{user.email}</p>
                                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                                        <span>ยอดเงิน: ฿{(user.balance || 0).toLocaleString()}</span>
                                        <span suppressHydrationWarning>
                                            สมัคร: {new Date(user.time).toLocaleDateString('th-TH')}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handleEditUser(user)}
                                    className='flex-shrink-0'
                                >
                                    <Edit className='h-4 w-4' />
                                </Button>
                            </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className='max-w-[calc(100vw-2rem)] sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label>ชื่อผู้ใช้</Label>
                            <Input value={selectedUser?.username || ''} disabled />
                        </div>
                        <div>
                            <Label>อีเมล</Label>
                            <Input value={selectedUser?.email || ''} disabled />
                        </div>
                        <div>
                            <Label>ระดับผู้ใช้</Label>
                            <Select value={editRole.toString()} onValueChange={(value) => setEditRole(parseInt(value))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='0'>ผู้ใช้ทั่วไป</SelectItem>
                                    <SelectItem value='1'>ผู้ดูแลระบบ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>ยอดเงิน (฿)</Label>
                            <Input
                                type='number'
                                value={editBalance}
                                onChange={(e) => setEditBalance(e.target.value)}
                                placeholder='0'
                            />
                        </div>
                        <div className='flex gap-2 pt-2'>
                            <Button
                                variant='outline'
                                onClick={() => setEditDialogOpen(false)}
                                className='flex-1'
                            >
                                ยกเลิก
                            </Button>
                            <Button onClick={handleSaveUser} className='flex-1'>
                                บันทึก
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

