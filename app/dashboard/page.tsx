'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [totalPengajuan, setTotalPengajuan] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // useEffect ini gunanya untuk otomatis jalanin fungsi fetchTotal saat halaman dibuka
  useEffect(() => {
    fetchTotal()
  }, [])

  const fetchTotal = async () => {
    try {
      // Perintah ke Supabase buat ngitung ada berapa baris di tabel 'pengajuan'
      const { count, error } = await supabase
        .from('pengajuan')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      if (count !== null) {
        setTotalPengajuan(count)
      }
    } catch (error: any) {
      console.error('Gagal narik data:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Petugas</h1>
            <p className="mt-2 text-slate-600">Selamat datang di Sistem Pendataan Perizinan.</p>
          </div>
          
          {/* Tombol Jalan Pintas ke Form Baru */}
          <Link href="/pengajuan/new" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
            + Tambah Pengajuan
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800">Total Pengajuan</h3>
            {/* Di sini angka 0 diganti jadi variabel totalPengajuan */}
            <Link href="/pengajuan">
              <p className="text-3xl font-bold text-blue-900 mt-2 hover:underline cursor-pointer">
                {isLoading ? '...' : totalPengajuan}
              </p>
            </Link>           
          </div>
        </div>
        
      </div>
    </div>
  )
}