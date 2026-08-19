import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { applySecurityHeaders } from '@/lib/security/headers'

export async function middleware(request: NextRequest) {
  // Buat response dasar
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase SSR client dengan cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies di response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session jika ada — ini memperpanjang JWT yang kedaluwarsa
  // Perubahan cookies akan otomatis di-apply ke response via setAll di atas
  await supabase.auth.getUser()

  // Tambahkan centralized security headers & CSP ke response
  applySecurityHeaders(response.headers)

  return response
}

// Matcher: middleware berjalan di semua route kecuali static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
