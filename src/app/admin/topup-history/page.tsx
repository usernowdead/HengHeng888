"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wallet, Search, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/spinner'

interface TopupTransaction {
  id: string
  userId: string
  username: string
  amount: number
  type: string
  description: string
  createdAt: string
}

export default function TopupHistoryPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<TopupTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalRows, setTotalRows] = useState(0)

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, rowsPerPage, searchTerm])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      })
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/v1/admin/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setTransactions(data.data.transactions || [])
        setTotalRows(data.data.total || 0)
      } else {
        console.error('Error fetching transactions:', data.message)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const startRow = (currentPage - 1) * rowsPerPage + 1
  const endRow = Math.min(currentPage * rowsPerPage, totalRows)

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold text-gray-900 flex items-center gap-2'>
            <Wallet className='h-6 w-6' />
            ประวัติการเติมเงิน
          </h2>
        </div>
        <Button variant='outline'>
          ข้อมูลคำสั่งซื้อทั้งหมด
        </Button>
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
            placeholder='ค้นหาด้วย username, email...'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className='max-w-md'
          />
        </div>
      </div>

      {/* Table */}
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
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>ประเภท</th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>รายละเอียด</th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>วันที่</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='px-4 py-8 text-center text-gray-500'>
                        ไม่พบข้อมูล
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-sm text-gray-900'>{transaction.id}</td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          <a href={`/admin/users?search=${transaction.username}`} className='text-blue-600 hover:underline'>
                            {transaction.username}
                          </a>
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>฿{transaction.amount.toFixed(2)}</td>
                        <td className='px-4 py-3 text-sm text-gray-900'>{transaction.type}</td>
                        <td className='px-4 py-3 text-sm text-gray-600'>{transaction.description}</td>
                        <td className='px-4 py-3 text-sm text-gray-600 flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {new Date(transaction.createdAt).toLocaleString('th-TH')}
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

