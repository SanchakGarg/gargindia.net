'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions'

const initialState = { error: '' }

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
          Access Code
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Enter access code"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ '--tw-ring-color': '#dc2626' } as React.CSSProperties}
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity disabled:opacity-60"
        style={{ backgroundColor: '#dc2626' }}
      >
        {pending ? 'Verifying…' : 'Enter Admin'}
      </button>
    </form>
  )
}
