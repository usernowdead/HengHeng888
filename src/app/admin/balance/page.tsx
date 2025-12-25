"use client"

import React, { useState, useEffect } from 'react'
import { Wallet, Plus, Minus, DollarSign, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface User {
    id: string
    username: string
    email: string
    balance?: number
}

export default function AdminBalancePage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [action, setAction] = useState<'add' | 'subtract' | 'set'>('add')
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')

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

    const handleManageBalance = (user: User) => {
        setSelectedUser(user)
        setAction('add')
        setAmount('')
        setNote('')
        setDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!selectedUser || !amount) {
            toast.error('กรุณากรอกจำนวนเงิน')
            return
        }

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum < 0) {
            toast.error('จำนวนเงินต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0')
            return
        }

        try {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const response = await fetch('/api/v1/admin/balance', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    amount: amountNum,
                    action,
                    note
                })
            })

            const data = await response.json()
            if (data.success) {
                toast.success('อัปเดตยอดเงินสำเร็จ')
                setDialogOpen(false)
                fetchUsers()
            } else {
                toast.error(data.message || 'ไม่สามารถอัปเดตยอดเงินได้')
            }
        } catch (error) {
            console.error('Error updating balance:', error)
            toast.error('เกิดข้อผิดพลาดในการอัปเดตยอดเงิน')
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
                <h1 className='text-2xl font-semibold text-gray-900'>เติมเงิน</h1>
                <p className='text-sm text-gray-500 mt-1'>
                    จัดการยอดเงินของผู้ใช้ทั้งหมด
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
                        <Wallet className='h-12 w-12 mx-auto mb-2 opacity-50' />
                        <p>ไม่พบผู้ใช้</p>
                    </div>
                ) : (
                    <div className='divide-y divide-gray-200'>
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className='p-4 hover:bg-gray-50 transition-colors'
                            >
                            <div className='flex items-center justify-between'>
                                <div className='flex-1'>
                                    <h3 className='font-medium mb-1'>{user.username}</h3>
                                    <p className='text-xs text-gray-600 mb-2'>{user.email}</p>
                                    <div className='flex items-center gap-2'>
                                        <DollarSign className='h-4 w-4 text-green-600' />
                                        <span className='text-lg font-semibold text-green-600'>
                                            ฿{(user.balance || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handleManageBalance(user)}
                                    className='flex-shrink-0'
                                >
                                    <Wallet className='h-4 w-4' />
                                </Button>
                            </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Manage Balance Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className='max-w-[calc(100vw-2rem)] sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>จัดการยอดเงิน</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label>ผู้ใช้</Label>
                            <Input value={selectedUser?.username || ''} disabled />
                        </div>
                        <div>
                            <Label>ยอดเงินปัจจุบัน</Label>
                            <Input value={`฿${(selectedUser?.balance || 0).toLocaleString()}`} disabled />
                        </div>
                        <div>
                            <Label>การดำเนินการ</Label>
                            <Select value={action} onValueChange={(value: any) => setAction(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='add'>
                                        <div className='flex items-center gap-2'>
                                            <Plus className='h-4 w-4' />
                                            เพิ่มยอดเงิน
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='subtract'>
                                        <div className='flex items-center gap-2'>
                                            <Minus className='h-4 w-4' />
                                            ลดยอดเงิน
                                        </div>
                                    </SelectItem>
                                    <SelectItem value='set'>
                                        <div className='flex items-center gap-2'>
                                            <DollarSign className='h-4 w-4' />
                                            ตั้งยอดเงิน
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>จำนวนเงิน (฿)</Label>
                            <Input
                                type='number'
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder='0'
                                min='0'
                                step='0.01'
                            />
                        </div>
                        <div>
                            <Label>หมายเหตุ (ไม่บังคับ)</Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder='ระบุเหตุผล...'
                                rows={3}
                            />
                        </div>
                        {selectedUser && amount && (
                            <div className='p-3 bg-blue-50 rounded-lg'>
                                <p className='text-xs text-gray-600 mb-1'>ยอดเงินหลังการดำเนินการ:</p>
                                <p className='text-lg font-semibold text-blue-600'>
                                    ฿{(() => {
                                        const current = selectedUser.balance || 0
                                        const amountNum = parseFloat(amount) || 0
                                        let newBalance = 0
                                        if (action === 'add') newBalance = current + amountNum
                                        else if (action === 'subtract') newBalance = Math.max(0, current - amountNum)
                                        else if (action === 'set') newBalance = amountNum
                                        return newBalance.toLocaleString()
                                    })()}
                                </p>
                            </div>
                        )}
                        <div className='flex gap-2 pt-2'>
                            <Button
                                variant='outline'
                                onClick={() => setDialogOpen(false)}
                                className='flex-1'
                            >
                                ยกเลิก
                            </Button>
                            <Button onClick={handleSubmit} className='flex-1'>
                                ยืนยัน
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

