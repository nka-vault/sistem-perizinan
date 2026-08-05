'use client'
export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Atas */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Sistem Perizinan</h1>
            <button 
              onClick={handleLogout}
              className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Konten Utama */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 mt-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang, Petugas!</h2>
          <p className="text-slate-500 mb-8">Pilih menu di bawah ini untuk mengelola data perizinan warga.</p>

          {/* Grid Menu - Responsif (1 kolom di HP, 2 kolom di Laptop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Kartu 1 */}
            <Link href="/pengajuan" className="group block p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
                  📋
                </div>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-700">Daftar Pengajuan</h3>
              </div>
              <p className="text-sm text-slate-600">Lihat, periksa, dan update status seluruh dokumen pengajuan perizinan masuk.</p>
            </Link>

            {/* Kartu 2 */}
            <Link href="/pengajuan/new" className="group block p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl font-bold">
                  ➕
                </div>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-green-700">Tambah Pengajuan Baru</h3>
              </div>
              <p className="text-sm text-slate-600">Input data permohonan izin baru secara manual ke dalam sistem database.</p>
            </Link>

          </div>
        </div>
      </main>
    </div>
  )
}