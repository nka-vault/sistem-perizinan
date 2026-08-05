'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DaftarPengajuan() {
  const [dataPengajuan, setDataPengajuan] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('pengajuan')
        .select(`
          id,
          no_pendaftaran,
          jenis_izin,
          jenis_bangunan,
          status,
          pemohon ( nama )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setDataPengajuan(data)
    } catch (error: any) {
      alert('Gagal narik data: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-slate-200">
        
        {/* Header Section - Responsif (Susun bawah di HP, sejajar di Laptop) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Daftar Pengajuan</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola semua data perizinan masuk</p>
          </div>
          <Link 
            href="/pengajuan/new" 
            className="w-full sm:w-auto text-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            + Tambah Baru
          </Link>
        </div>

        {/* Tabel Section - Bisa di-scroll horizontal di HP */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <div className="overflow-hidden border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">No. Daftar</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Pemohon</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Jenis Izin</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 uppercase tracking-wider text-xs">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Memuat data...</td>
                    </tr>
                  ) : dataPengajuan.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Belum ada data pengajuan.</td>
                    </tr>
                  ) : (
                    dataPengajuan.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-800">{item.no_pendaftaran}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-700">{item.pemohon?.nama || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-700">{item.jenis_izin}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${item.status === 'Selesai' ? 'bg-green-100 text-green-800' : 
                              item.status === 'Ditolak' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/pengajuan/${item.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 text-sm flex items-center gap-2">
            <span>&larr;</span> Kembali ke Dashboard
          </Link>
        </div>
        
      </div>
    </div>
  )
}