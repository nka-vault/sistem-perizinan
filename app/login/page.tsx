'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Proses nyocokin password ke Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Gagal login: ' + error.message)
    } else {
      alert('Berhasil Login! Otw Dashboard...')
      // Perintah pindah halaman ke Dashboard
      router.push('/dashboard') 
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-lg w-96 border border-slate-200">
        <h1 className="text-2xl font-bold mb-2 text-center text-slate-800">Sistem Perizinan</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">Login khusus petugas</p>
        
        <input
          type="email"
          placeholder="Email Petugas"
          className="w-full mb-4 p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-semibold p-3 rounded hover:bg-blue-700 transition-colors"
        >
          Masuk
        </button>
      </form>
    </div>
  )
}