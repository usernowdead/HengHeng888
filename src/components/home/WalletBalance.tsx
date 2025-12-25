"use client"

import React, { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function WalletBalance() {
  const { user, isAuth } = useAuth()
  const [balance, setBalance] = useState<string>('0.00')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuth && user) {
      // Try to use balance from user object first
      if (user.balance !== undefined) {
        setBalance(parseFloat(user.balance.toString()).toFixed(2))
        setLoading(false)
      } else {
        fetchBalance()
      }
      // Refresh balance every 30 seconds
      const interval = setInterval(fetchBalance, 30000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [isAuth, user])

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/user/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies
      })

      // Check if response is ok
      if (!response.ok) {
        console.error('Balance API error:', response.status, response.statusText)
        return
      }

      // Parse JSON with error handling
      let data;
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse balance response:', parseError)
        return
      }

      if (data.success && data.balance !== undefined) {
        setBalance(parseFloat(data.balance.toString()).toFixed(2))
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
      // Don't update balance on error, keep current value
    } finally {
      setLoading(false)
    }
  }

  // Don't show if user is not logged in
  if (!isAuth || !user) {
    return null
  }

  return (
    <section className='border-b bg-white py-2'>
      <div className='w-full px-3'>
        {/* Wallet Display - Compact Design */}
        <div className='bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-md p-2.5 border border-gray-200/60'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 min-w-0 flex-shrink-0'>
              <div className='w-6 h-6 rounded-md bg-white/80 flex items-center justify-center shadow-sm flex-shrink-0'>
                <Wallet className='h-3 w-3 text-gray-700' />
              </div>
              <p className='text-[11px] font-medium text-gray-600 whitespace-nowrap'>กระเป๋าเงินสด</p>
            </div>
            
            <div className='text-right flex-shrink-0'>
              {loading ? (
                <div className='h-4 w-20 bg-gray-200/60 rounded animate-pulse'></div>
              ) : (
                <p className='text-sm font-semibold text-gray-900 tracking-tight whitespace-nowrap'>
                  {parseFloat(balance).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className='text-[10px] text-gray-500 font-normal ml-0.5'>บาท</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

