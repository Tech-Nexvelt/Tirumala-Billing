import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // 1. API routes handle their own auth internally. Bypass early.
  if (pathname.startsWith('/api')) {
    return supabaseResponse
  }

  // IMPORTANT: do not run code between createServerClient and auth.getUser()
  let user = null
  try {
    // Only attempt fetch if environment is configured properly
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }
  } catch (err) {
    console.error('Middleware Auth Error:', err)
  }

  // Public routes that don't require auth
  const publicRoutes = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/register',
    '/manifest.json',
    '/scanner',
  ]
  const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r))

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isPublicRoute && pathname !== '/register' && !pathname.startsWith('/scanner')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
}
