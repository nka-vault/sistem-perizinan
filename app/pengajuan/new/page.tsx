'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FormPengajuanBaru() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // State Data Pemohon
  const [nama, setNama] = useState('')
  const [nik, setNik] = useState('')
  const [alamat, setAlamat] = useState('')
  
  // State Data Bangunan
  const [alamatBangunan, setAlamatBangunan] = useState('')
  const [jenisBangunan, setJenisBangunan] = useState('Rumah Tinggal')
  const [jenisIzin, setJenisIzin] = useState('PBG')
  
  // State File Upload Baru
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Simpan Data Warga
      const { data: dataPemohon, error: errorPemohon } = await supabase
        .from('pemohon')
        .insert([{ nama, nik, alamat }])
        .select()
        .single()

      if (errorPemohon) throw errorPemohon

      // Bikin Nomor Pendaftaran Otomatis
      const noDaftar = `REG-${new Date().getFullYear()}${new Date().getMonth()+1}-${Math.floor(Math.random() * 1000)}`

      // 2. Proses Upload File (Kalau ada file yang dipilih)
      let uploadedFiles = []
      if (file) {
        // Nama file dibikin unik biar gak bentrok
        const fileName = `${noDaftar}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('dokumen-perizinan')
          .upload(fileName, file)

        if (uploadError) {
          throw new Error('Gagal upload dokumen: ' + uploadError.message)
        }
        
        if (uploadData) {
          uploadedFiles.push(uploadData.path) // Simpan jejak/path filenya
        }
      }

      // 3. Simpan Data Bangunan & Path File
      const { error: errorPengajuan } = await supabase
        .from('pengajuan')
        .insert([{
          pemohon_id: dataPemohon.id,
          alamat_bangunan: alamatBangunan,
          jenis_bangunan: jenisBangunan,
          jenis_izin: jenisIzin,
          no_pendaftaran: noDaftar,
          status: 'Draft',
          dokumen: uploadedFiles // Masukin array file ke database
        }])

      if (errorPengajuan) throw errorPengajuan

      alert('Berhasil! Data dan dokumen pengajuan tersimpan.')
      router.push('/dashboard')
      
    } catch (error: any) {
      alert('Waduh, ada error: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Form Pengajuan Izin Baru</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded">
            <h2 className="font-semibold text-slate-700 mb-4">Data Pemohon (Warga)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Nama Lengkap</label>
                <input type="text" required className="w-full p-2 border rounded" value={nama} onChange={e => setNama(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">NIK (KTP)</label>
                <input type="text" required className="w-full p-2 border rounded" value={nik} onChange={e => setNik(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Alamat Pemohon</label>
                <input type="text" required className="w-full p-2 border rounded" value={alamat} onChange={e => setAlamat(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded">
            <h2 className="font-semibold text-slate-700 mb-4">Data Bangunan & Dokumen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Jenis Izin</label>
                <select className="w-full p-2 border rounded" value={jenisIzin} onChange={e => setJenisIzin(e.target.value)}>
                  <option value="PBG">PBG (Persetujuan Bangunan Gedung)</option>
                  <option value="SLF">SLF (Sertifikat Laik Fungsi)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Nama / Jenis Bangunan</label>
                <input type="text" required className="w-full p-2 border rounded" value={jenisBangunan} onChange={e => setJenisBangunan(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Lokasi Bangunan</label>
                <input type="text" required className="w-full p-2 border rounded" value={alamatBangunan} onChange={e => setAlamatBangunan(e.target.value)} />
              </div>
              {/* TOMBOL UPLOAD FILE BARU */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">Upload Dokumen (KTP/Denah)</label>
                <input 
                  type="file" 
                  className="w-full p-2 border rounded bg-white" 
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)} 
                />
                <p className="text-xs text-slate-500 mt-1">*Format bebas (PDF/JPG/PNG)</p>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-semibold p-3 rounded hover:bg-blue-700 transition-colors disabled:bg-slate-400"
          >
            {isLoading ? 'Menyimpan & Upload...' : 'Simpan Pengajuan'}
          </button>
        </form>

      </div>
    </div>
  )
}