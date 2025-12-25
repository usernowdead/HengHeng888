"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Wallet, Search, Clock, CheckCircle2, XCircle, ClockIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

interface BankTopupTransaction {
    id: string
    userId: string
    username: string
    amount: number
    bankName: string
    accountNumber: string
    accountName: string
    slipImage?: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    approvedAt?: string
    approvedBy?: string
}

export default function BankTopupHistoryPage() {
    const [transactions, setTransactions] = useState<BankTopupTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [totalRows, setTotalRows] = useState(0)

    useEffect(() => {
        fetchTransactions()
    }, [currentPage, rowsPerPage, searchQuery])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            if (!token) return

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: rowsPerPage.toString(),
            })
            if (searchQuery) params.append('search', searchQuery)

            // TODO: Replace with actual API endpoint
            // For now, use mock data
            const mockTransactions: BankTopupTransaction[] = []
            setTransactions(mockTransactions)
            setTotalRows(0)
        } catch (error) {
            console.error('Error fetching transactions:', error)
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            // TODO: Replace with actual API endpoint
            toast.success('อนุมัติการเติมเงินสำเร็จ')
            fetchTransactions()
        } catch (error) {
            console.error('Error approving transaction:', error)
            toast.error('เกิดข้อผิดพลาดในการอนุมัติ')
        }
    }

    const handleReject = async (id: string) => {
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) return

            // TODO: Replace with actual API endpoint
            toast.success('ปฏิเสธการเติมเงินสำเร็จ')
            fetchTransactions()
        } catch (error) {
            console.error('Error rejecting transaction:', error)
            toast.error('เกิดข้อผิดพลาดในการปฏิเสธ')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant='default' className='bg-green-100 text-green-800'>
                        <CheckCircle2 className='h-3 w-3 mr-1' />
                        อนุมัติแล้ว
                    </Badge>
                )
            case 'rejected':
                return (
                    <Badge variant='secondary' className='bg-red-100 text-red-800'>
                        <XCircle className='h-3 w-3 mr-1' />
                        ปฏิเสธ
                    </Badge>
                )
            case 'pending':
            default:
                return (
                    <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
                        <ClockIcon className='h-3 w-3 mr-1' />
                        รออนุมัติ
                    </Badge>
                )
        }
    }

    const totalPages = Math.ceil(totalRows / rowsPerPage)
    const startRow = (currentPage - 1) * rowsPerPage + 1
    const endRow = Math.min(currentPage * rowsPerPage, totalRows)

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
                        <Wallet className='h-6 w-6' />
                        ประวัติเติมเงินธนาคาร
                    </h2>
                    <p className='text-sm text-gray-500 mt-1'>
                        จัดการการเติมเงินผ่านธนาคารและอนุมัติการโอนเงิน
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-700'>แสดง</span>
                    <select
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                        }}
                        className='border border-gray-300 rounded-md px-2 py-1 text-sm'
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className='text-sm text-gray-700'>แถว</span>
                </div>
                <div className='flex-1 flex items-center gap-2'>
                    <span className='text-sm text-gray-700'>ค้นหา:</span>
                    <Input
                        type='text'
                        placeholder='ค้นหาด้วย username, email, transaction ID...'
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        className='max-w-md'
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardContent className='p-0'>
                    {loading ? (
                        <div className='flex items-center justify-center py-12'>
                            <Spinner />
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead className='bg-gray-50 border-b'>
                                    <tr>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ID</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ชื่อผู้ใช้</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>จำนวนเงิน</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ธนาคาร</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>เลขบัญชี</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ชื่อบัญชี</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>สถานะ</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>วันที่</th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className='px-4 py-8 text-center text-gray-500'>
                                                ไม่พบข้อมูล
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((transaction) => (
                                            <tr key={transaction.id} className='hover:bg-gray-50'>
                                                <td className='px-4 py-3 text-sm text-gray-900'>{transaction.id}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>
                                                    <a
                                                        href={`/admin/users?search=${transaction.username}`}
                                                        className='text-blue-600 hover:underline'
                                                    >
                                                        {transaction.username}
                                                    </a>
                                                </td>
                                                <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                                                    ฿{transaction.amount.toFixed(2)}
                                                </td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>{transaction.bankName}</td>
                                                <td className='px-4 py-3 text-sm font-mono text-gray-900'>{transaction.accountNumber}</td>
                                                <td className='px-4 py-3 text-sm text-gray-900'>{transaction.accountName}</td>
                                                <td className='px-4 py-3'>{getStatusBadge(transaction.status)}</td>
                                                <td className='px-4 py-3 text-sm text-gray-600 flex items-center gap-1'>
                                                    <Clock className='h-3 w-3' />
                                                    {new Date(transaction.createdAt).toLocaleString('th-TH')}
                                                </td>
                                                <td className='px-4 py-3'>
                                                    {transaction.status === 'pending' && (
                                                        <div className='flex gap-2'>
                                                            <Button
                                                                variant='outline'
                                                                size='sm'
                                                                onClick={() => handleApprove(transaction.id)}
                                                                className='text-green-600 hover:text-green-700'
                                                            >
                                                                อนุมัติ
                                                            </Button>
                                                            <Button
                                                                variant='outline'
                                                                size='sm'
                                                                onClick={() => handleReject(transaction.id)}
                                                                className='text-red-600 hover:text-red-700'
                                                            >
                                                                ปฏิเสธ
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {!loading && totalRows > 0 && (
                <div className='flex items-center justify-between'>
                    <div className='text-sm text-gray-700'>
                        แสดง {startRow} ถึง {endRow} จาก {totalRows} แถว
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ก่อนหน้า
                        </Button>
                        <span className='text-sm text-gray-700'>
                            หน้า {currentPage}/{totalPages}
                        </span>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            ถัดไป
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

