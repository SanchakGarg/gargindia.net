import { isAuthenticated } from '@/lib/session'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  const authed = await isAuthenticated()
  if (authed) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
            style={{ backgroundColor: '#dc2626' }}
          >
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">GARG ELECTRICAL AND ENGINEERING WORKS</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
