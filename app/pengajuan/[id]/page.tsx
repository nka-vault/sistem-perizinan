'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DetailPengajuan({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusInput, setStatusInput] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchDetail()
  }, [resolvedParams.id])

  const fetchDetail = async () => {
    try {
      const { data: detailData, error } = await supabase
        .from('pengajuan')
        .select(`
          *,
          pemohon (*)
        `)
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error
      if (detailData) {
        setData(detailData)
        setStatusInput(detailData.status)
      }
    } catch (error: any) {
      alert('Gagal narik data: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('pengajuan')
        .update({ status: statusInput })
        .eq('id', resolvedParams.id)

      if (error) throw error
      alert('Status berhasil diupdate!')
      fetchDetail() // Refresh data
    } catch (error: any) {
      alert('Gagal update status: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium animate-pulse">Memuat data detail...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-500 font-medium">Data tidak ditemukan.</p>
        <Link href="/pengajuan" className="text-blue-600 hover:underline">&larr; Kembali</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header Card */}
        <div className="bg-slate-800 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Detail Pengajuan Izin</h1>
            <p className="text-slate-300 text-sm mt-1">No. {data.no_pendaftaran}</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm
            ${data.status === 'Selesai' ? 'bg-green-500 text-white' : 
              data.status === 'Ditolak' ? 'bg-red-500 text-white' : 
              'bg-yellow-400 text-yellow-900'}`}>
            Status: {data.status}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {/* Grid Informasi - 1 Kolom HP, 2 Kolom Laptop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Bagian Data Pemohon */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Data Pemohon</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Lengkap</p>
                  <p className="text-slate-800 font-medium mt-1">{data.pemohon?.nama}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NIK</p>
                  <p className="text-slate-800 font-medium mt-1">{data.pemohon?.nik}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kontak (HP/Email)</p>
                  <p className="text-slate-800 font-medium mt-1">{data.pemohon?.kontak}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat Lengkap</p>
                  <p className="text-slate-800 mt-1">{data.pemohon?.alamat}</p>
                </div>
              </div>
            </div>

            {/* Bagian Data Izin */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Detail Perizinan</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenis Izin</p>
                  <p className="text-slate-800 font-medium mt-1">{data.jenis_izin}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fungsi Bangunan</p>
                  <p className="text-slate-800 font-medium mt-1">{data.jenis_bangunan}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokumen Lampiran</p>
                  <div className="mt-2">
                    {data.file_url ? (
                      <a 
                        href={data.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition border border-blue-200"
                      >
                        📄 Lihat/Unduh Dokumen
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-sm">Tidak ada dokumen terlampir</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Update Status */}
          <div className="mt-10 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Tindakan Petugas</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                className="flex-1 p-3 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
              >
                <option value="Menunggu">Menunggu (Diproses)</option>
                <option value="Selesai">Selesai (Disetujui)</option>
                <option value="Ditolak">Ditolak (Berkas Tidak Lengkap)</option>
              </select>
              <button 
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400 shadow-sm"
              >
                {isUpdating ? 'Menyimpan...' : 'Update Status'}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link href="/pengajuan" className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 w-fit">
              <span>&larr;</span> Kembali ke Daftar Pengajuan
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  )
}