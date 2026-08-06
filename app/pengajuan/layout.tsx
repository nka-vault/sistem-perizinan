'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const cekAkses = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Kalau nggak ada sesi (belum login), tendang ke login!
        router.push('/login')
      } else {
        // Kalau ada, persilakan masuk
        setIsAuthorized(true)
      }
    }
    cekAkses()
  }, [router])

  // Tampilkan layar loading saat proses pengecekan
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium animate-pulse">Memeriksa izin akses keamanan...</p>
      </div>
    )
  }

  return <>{children}</>
}