import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'gargindia-admin-secret-change-in-production'
)

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
}
