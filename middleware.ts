import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Bikin response standar Next.js
  const res = NextResponse.next()
  
  // Sambungin Supabase Auth dengan Middleware Next.js
  const supabase = createMiddlewareClient({ req, res })

  // Cek apakah user sedang login saat ini (dapat sesi token)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Ambil URL yang sedang berusaha diakses orang tersebut
  const currentPath = req.nextUrl.pathname

  // DAFTAR HALAMAN YANG DILARANG MASUK TANPA LOGIN
  // Halaman '/dashboard', '/pengajuan' dan seluruh sub-halamannya (termasuk detail dan form baru)
  const isProtectedPath = currentPath.startsWith('/dashboard') || currentPath.startsWith('/pengajuan')

  // ATURAN 1: Kalau dia maksa buka halaman terlarang TAPI BELUM LOGIN
  if (isProtectedPath && !session) {
    // Tendang balik ke halaman Login
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // ATURAN 2: Kalau dia udah login TAPI malah buka halaman '/login'
  if (currentPath === '/login' && session) {
    // Tendang langsung ke Dashboard (nggak usah login dua kali)
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Kalau aturannya aman-aman aja, silakan masuk ke halaman tujuan
  return res
}

// Konfigurasi agar Middleware ini JANGAN jalan di file gambar, font, atau file internal Next.js
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}