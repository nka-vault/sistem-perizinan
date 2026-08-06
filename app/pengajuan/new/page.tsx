'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FormPengajuan() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // State Pemohon
  const [nama, setNama] = useState('')
  const [nik, setNik] = useState('')
  const [kontak, setKontak] = useState('')
  const [alamat, setAlamat] = useState('')

  // State Izin
  const [jenisIzin, setJenisIzin] = useState('PBG')
  const [jenisBangunan, setJenisBangunan] = useState('Rumah Tinggal')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // --- VALIDASI UKURAN FILE (Maks 15 MB) ---
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 15) { 
        alert(`Waduh, ukuran file terlalu besar (${fileSizeInMB.toFixed(2)} MB). Maksimal 15 MB ya bro!`);
        return; 
      }
    }
    // ----------------------------------------

    setIsLoading(true) 
    
    try {
      // 1. Cek & Simpan Data Pemohon (Anti Duplikat NIK)
      let { data: pemohonData, error: cekError } = await supabase
        .from('pemohon')
        .select()
        .eq('nik', nik)
        .maybeSingle() 

      if (cekError) throw cekError

      if (!pemohonData) {
        const { data: newPemohon, error: pemohonError } = await supabase
          .from('pemohon')
          .insert([{ nama, nik, kontak, alamat }])
          .select()
          .single()

        if (pemohonError) throw pemohonError
        pemohonData = newPemohon
      } else {
        const { data: updatedPemohon, error: updateError } = await supabase
          .from('pemohon')
          .update({ nama, kontak, alamat })
          .eq('id', pemohonData.id)
          .select()
          .single()
          
        if (updateError) throw updateError
        pemohonData = updatedPemohon
      }

      // 2. Upload Dokumen
      let fileUrl = ''
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `berkas/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('dokumen') 
          .upload(filePath, file)

        if (uploadError) {
            console.log("Upload error, pastikan bucket 'dokumen' sudah dibuat dan disetting public.", uploadError)
        } else {
            const { data: publicUrlData } = supabase.storage
              .from('dokumen')
              .getPublicUrl(filePath)
            
            fileUrl = publicUrlData.publicUrl
        }
      }

      // 3. Simpan Data Pengajuan Izin
      const noPendaftaran = `REG-${Math.floor(Math.random() * 100000)}`
      
      const { error: pengajuanError } = await supabase
        .from('pengajuan')
        .insert([{
          pemohon_id: pemohonData.id,
          no_pendaftaran: noPendaftaran,
          jenis_izin: jenisIzin,
          jenis_bangunan: jenisBangunan,
          status: 'Menunggu',
          file_url: fileUrl
        }])

      if (pengajuanError) throw pengajuanError

      alert('Mantap! Data pengajuan berhasil disimpan.')
      router.push('/pengajuan')
    } catch (error: any) {
      alert('Waduh, ada error: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header Form */}
        <div className="bg-blue-600 p-6 sm:p-8 text-white">
          <h1 className="text-2xl font-bold">Input Pengajuan Baru</h1>
          <p className="text-blue-100 text-sm mt-1">Masukkan data pemohon dan detail perizinan dengan lengkap.</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kolom Kiri: Data Pemohon */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                👤 Data Pemohon
              </h2>
              
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input 
                  type="text" required
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Cth: Budi Santoso"
                  value={nama} onChange={e => setNama(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">NIK KTP</label>
                <input 
                  type="number" required
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="16 digit NIK"
                  value={nik} onChange={e => setNik(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Nomor HP / WhatsApp</label>
                <input 
                  type="text" required
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="0812xxxx..."
                  value={kontak} onChange={e => setKontak(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                <textarea 
                  required rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Jalan, RT/RW, Kelurahan..."
                  value={alamat} onChange={e => setAlamat(e.target.value)}
                />
              </div>
            </div>

            {/* Kolom Kanan: Data Perizinan */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                📄 Detail Izin
              </h2>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Jenis Perizinan</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={jenisIzin} onChange={e => setJenisIzin(e.target.value)}
                >
                  <option value="PBG">Persetujuan Bangunan Gedung (PBG)</option>
                  <option value="SLF">Sertifikat Laik Fungsi (SLF)</option>
                  <option value="SBKBG">Surat Bukti Kepemilikan Bangunan Gedung</option>
                  <option value="KRK">Keterangan Rencana Kota (KRK)</option>
                  <option value="Amdal Lalu Lintas">Amdal Lalu Lintas (Andalalin)</option>
                  <option value="Izin Lingkungan">Izin Lingkungan (SPPL/UKL-UPL)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Fungsi / Jenis Bangunan</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={jenisBangunan} onChange={e => setJenisBangunan(e.target.value)}
                >
                  <option value="Rumah Tinggal">Rumah Tinggal</option>
                  <option value="Ruko / Tempat Usaha">Ruko / Tempat Usaha</option>
                  <option value="Gudang / Pabrik">Gudang / Pabrik</option>
                  <option value="Fasilitas Umum / Sosial">Fasilitas Umum / Sosial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Upload Dokumen Pendukung (Opsional)</label>
                <input 
                  type="file" 
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                />
                <p className="text-xs text-slate-500 mt-2">Format PDF/JPG/PNG. Maks 15MB.</p>
              </div>
            </div>
          </div>

          {/* Area Tombol Bawah */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 font-medium">
              Batalkan
            </Link>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Menyimpan Data...' : 'Simpan Pengajuan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}