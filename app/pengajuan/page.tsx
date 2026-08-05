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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Daftar Pengajuan Masuk</h1>
          <Link href="/pengajuan/new" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
            + Tambah Baru
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-3 text-slate-600 font-semibold">No Pendaftaran</th>
                <th className="p-3 text-slate-600 font-semibold">Nama Pemohon</th>
                <th className="p-3 text-slate-600 font-semibold">Jenis Izin</th>
                <th className="p-3 text-slate-600 font-semibold">Status</th>
                <th className="p-3 text-slate-600 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : dataPengajuan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">Belum ada data pengajuan.</td>
                </tr>
              ) : (
                dataPengajuan.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{item.no_pendaftaran}</td>
                    <td className="p-3 text-slate-700">{item.pemohon?.nama || '-'}</td>
                    <td className="p-3 text-slate-700">{item.jenis_izin}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {/* Tombol ke halaman detail */}
                      <Link href={`/pengajuan/${item.id}`} className="text-blue-600 hover:underline text-sm font-semibold">
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            &larr; Kembali ke Dashboard
          </Link>
        </div>
        
      </div>
    </div>
  )
}