'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DetailPengajuan() {
  const { id } = useParams()
  const router = useRouter()
  
  const [data, setData] = useState<any>(null)
  const [status, setStatus] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      // Narik detail pengajuan sekaligus data pemohonnya
      const { data: detail, error } = await supabase
        .from('pengajuan')
        .select(`*, pemohon(*)`)
        .eq('id', id)
        .single()
      
      if (error) throw error
      setData(detail)
      setStatus(detail.status)

      // Kalau dia tadi ada upload file, kita bikin link sementara (60 menit) buat lihat filenya
      if (detail.dokumen && detail.dokumen.length > 0) {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('dokumen-perizinan')
          .createSignedUrl(detail.dokumen[0], 3600) 
        
        if (fileData) setFileUrl(fileData.signedUrl)
      }

    } catch (error: any) {
      alert('Gagal ambil data: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    try {
      const { error } = await supabase
        .from('pengajuan')
        .update({ status: status })
        .eq('id', id)
      
      if (error) throw error
      alert(`Mantap! Status berhasil diubah menjadi: ${status}`)
      router.push('/pengajuan')
    } catch (error: any) {
      alert('Gagal update status: ' + error.message)
    }
  }

  if (isLoading) return <div className="p-8 text-center mt-20 font-bold text-xl">Loading data...</div>
  if (!data) return <div className="p-8 text-center mt-20 font-bold text-xl">Data tidak ditemukan.</div>

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h1 className="text-2xl font-bold text-slate-800">Detail Pengajuan: {data.no_pendaftaran}</h1>
          <Link href="/pengajuan" className="text-slate-500 hover:text-slate-700 font-semibold">
            &larr; Kembali
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">DATA PEMOHON</h3>
            <p className="font-semibold text-slate-800">{data.pemohon.nama}</p>
            <p className="text-sm text-slate-600">NIK: {data.pemohon.nik}</p>
            <p className="text-sm text-slate-600">Alamat: {data.pemohon.alamat}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">DATA BANGUNAN</h3>
            <p className="font-semibold text-slate-800">{data.jenis_bangunan}</p>
            <p className="text-sm text-slate-600">Izin: {data.jenis_izin}</p>
            <p className="text-sm text-slate-600">Lokasi: {data.alamat_bangunan}</p>
          </div>
        </div>

        {/* Bagian Dokumen Lampiran */}
        <div className="mb-8 p-4 bg-slate-50 border rounded-lg">
          <h3 className="font-semibold text-slate-700 mb-2">Dokumen Lampiran</h3>
          {fileUrl ? (
            <a href={fileUrl} target="_blank" className="text-blue-600 hover:underline font-semibold bg-blue-50 px-3 py-2 rounded inline-block">
              📄 Lihat Dokumen yang Diupload
            </a>
          ) : (
            <p className="text-sm text-slate-500 italic">Tidak ada dokumen yang dilampirkan.</p>
          )}
        </div>

        {/* Bagian Update Status */}
        <div className="p-4 border-2 border-blue-100 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Update Status Pengajuan</h3>
          <div className="flex gap-4">
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              className="flex-1 p-2 border border-blue-200 rounded font-semibold text-slate-700"
            >
              <option value="Draft">Draft</option>
              <option value="Masuk">Masuk</option>
              <option value="Verifikasi">Verifikasi (Pengecekan Lapangan)</option>
              <option value="Terbit">Terbit (Izin Selesai)</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <button 
              onClick={handleUpdateStatus}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Simpan Status
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}