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
        .select(`*, pemohon (*)`)
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
      fetchDetail()
    } catch (error: any) {
      alert('Gagal update status: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p className="animate-pulse">Memuat data...</p></div>
  if (!data) return <div className="min-h-screen flex items-center justify-center"><p>Data tidak ditemukan.</p></div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
        
        {/* Header Card */}
        <div className="bg-slate-800 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:bg-white print:text-black print:border-b-2 print:border-slate-800 print:p-0 print:pb-4 print:mb-6">
          <div>
            <h1 className="text-2xl font-bold">Detail Pengajuan Izin</h1>
            <p className="text-slate-300 text-sm mt-1 print:text-slate-600">No. Registrasi: <span className="font-bold">{data.no_pendaftaran}</span></p>
          </div>
          <div className="flex gap-3 items-center print:hidden">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm
              ${data.status === 'Selesai' ? 'bg-green-500' : 
                data.status === 'Ditolak' ? 'bg-red-500' : 
                'bg-yellow-400 text-yellow-900'}`}>
              {data.status}
            </span>
            <button 
              onClick={handlePrint}
              className="bg-white text-slate-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-slate-100 transition flex items-center gap-2"
            >
              🖨️ Cetak PDF
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 print:p-0">
          {/* Grid Informasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Data Pemohon */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 print:border-black">Data Pemohon</h2>
              <div className="space-y-4">
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Nama Lengkap</p><p className="text-slate-800 font-medium mt-1">{data.pemohon?.nama}</p></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">NIK</p><p className="text-slate-800 font-medium mt-1">{data.pemohon?.nik}</p></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Kontak</p><p className="text-slate-800 font-medium mt-1">{data.pemohon?.kontak}</p></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Alamat Sesuai KTP</p><p className="text-slate-800 mt-1">{data.pemohon?.alamat}</p></div>
              </div>
            </div>

            {/* Data Izin */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 print:border-black">Detail Perizinan</h2>
              <div className="space-y-4">
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Jenis Izin</p><p className="text-slate-800 font-medium mt-1">{data.jenis_izin}</p></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Fungsi Bangunan</p><p className="text-slate-800 font-medium mt-1">{data.jenis_bangunan}</p></div>
                
                {/* INI TAMBAHANNYA: Lokasi Proyek */}
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Lokasi Proyek / Bangunan</p><p className="text-slate-800 font-medium mt-1">{data.alamat_bangunan}</p></div>
                
                <div className="print:hidden">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Dokumen Lampiran</p>
                  <div className="mt-2">
                    {data.file_url ? (
                      <a href={data.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 border border-blue-200">
                        📄 Lihat/Unduh
                      </a>
                    ) : <span className="text-slate-400 italic text-sm">Tidak ada dokumen</span>}
                  </div>
                </div>
                <div className="hidden print:block">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Status Pengajuan</p>
                  <p className="text-slate-800 font-bold mt-1 text-xl">{data.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Update Status - Disembunyikan saat di Print */}
          <div className="mt-10 p-6 bg-slate-50 rounded-xl border border-slate-200 print:hidden">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Tindakan Petugas</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                className="flex-1 p-3 border border-slate-300 rounded-lg bg-white text-slate-800 outline-none"
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
              >
                <option value="Menunggu">Menunggu (Diproses)</option>
                <option value="Selesai">Selesai (Disetujui)</option>
                <option value="Ditolak">Ditolak (Berkas Tidak Lengkap)</option>
              </select>
              <button onClick={handleUpdateStatus} disabled={isUpdating} className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                {isUpdating ? 'Menyimpan...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Area TTD untuk Print saja */}
          <div className="hidden print:flex justify-end mt-20 pt-10">
            <div className="text-center">
              <p className="mb-20">Petugas Verifikasi,</p>
              <p className="font-bold underline">(.......................................)</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 print:hidden">
            <Link href="/pengajuan" className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 w-fit">
              <span>&larr;</span> Kembali
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  )
}