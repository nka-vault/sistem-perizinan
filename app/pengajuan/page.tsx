'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DaftarPengajuan() {
  const [pengajuan, setPengajuan] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // State buat Data Statistik
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    selesai: 0,
    ditolak: 0
  })

  useEffect(() => {
    fetchPengajuan()
  }, [])

  // Efek ini jalan otomatis setiap kali lu ngetik di kolom pencarian
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(pengajuan)
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase()
      const filtered = pengajuan.filter(item => 
        item.no_pendaftaran?.toLowerCase().includes(lowerCaseQuery) ||
        item.pemohon?.nama?.toLowerCase().includes(lowerCaseQuery) ||
        item.pemohon?.nik?.includes(searchQuery)
      )
      setFilteredData(filtered)
    }
  }, [searchQuery, pengajuan])

  const fetchPengajuan = async () => {
    try {
      const { data, error } = await supabase
        .from('pengajuan')
        .select(`*, pemohon (*)`)
        .order('created_at', { ascending: false }) // Urutkan dari yang terbaru

      if (error) throw error
      
      if (data) {
        setPengajuan(data)
        setFilteredData(data)

        // Hitung Statistik Otomatis
        setStats({
          total: data.length,
          menunggu: data.filter(item => item.status === 'Menunggu').length,
          selesai: data.filter(item => item.status === 'Selesai').length,
          ditolak: data.filter(item => item.status === 'Ditolak').length,
        })
      }
    } catch (error: any) {
      alert('Gagal mengambil data: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Tombol Tambah */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Perizinan</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola dan pantau semua data perizinan warga.</p>
          </div>
          <Link href="/pengajuan/new" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition flex items-center gap-2">
            <span>+</span> Tambah Pengajuan
          </Link>
        </div>

        {/* 📊 KARTU STATISTIK */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Pengajuan</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-500 mb-1">⏳ Menunggu</p>
            <p className="text-3xl font-bold text-yellow-500">{stats.menunggu}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-500 mb-1">✅ Selesai</p>
            <p className="text-3xl font-bold text-green-500">{stats.selesai}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-500 mb-1">❌ Ditolak</p>
            <p className="text-3xl font-bold text-red-500">{stats.ditolak}</p>
          </div>
        </div>

        {/* 🔍 AREA PENCARIAN */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <input 
            type="text" 
            placeholder="Cari berdasarkan NIK, Nama Warga, atau No Registrasi..."
            className="w-full bg-transparent outline-none text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 📋 TABEL DATA */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-sm">
                  <th className="p-4 font-semibold whitespace-nowrap">No. Registrasi</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Data Pemohon</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Jenis Izin</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Memuat data dari database...</td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Belum ada data pengajuan.</td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-sm font-bold text-slate-800 whitespace-nowrap">{item.no_pendaftaran}</td>
                      <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{item.pemohon?.nama}</p>
                        <p className="text-xs mt-0.5">NIK: {item.pemohon?.nik}</p>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-700 whitespace-nowrap">{item.jenis_izin}</td>
                      <td className="p-4 text-sm whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border
                          ${item.status === 'Selesai' ? 'bg-green-50 text-green-700 border-green-200' : 
                            item.status === 'Ditolak' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <Link href={`/pengajuan/${item.id}`} className="inline-block text-blue-700 hover:text-white font-bold text-sm bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 px-4 py-2 rounded-lg transition-all shadow-sm">
                          Lihat Detail
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
    </div>
  )
}