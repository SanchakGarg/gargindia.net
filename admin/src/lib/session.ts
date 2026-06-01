import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'gargindia-admin-secret-change-in-production'
)

export async function signSession() {
  return new SignJWT({ loggedIn: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return !!payload.loggedIn
  } catch {
    return false
  }
}

export async function getSessionToken() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value ?? null
}

export async function isAuthenticated() {
  const token = await getSessionToken()
  if (!token) return false
  return verifySession(token)
}
