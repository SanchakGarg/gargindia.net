'use client'

import { useActionState } from 'react'
import { changePassword } from '@/app/actions'
import { CheckCircle } from 'lucide-react'

const initial = { error: '', success: false }

export default function SettingsForm() {
  const [state, formAction, pending] = useActionState(changePassword, initial)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-gray-900 mb-1">Change Access Code</h2>
        <p className="text-sm text-gray-500">Update the password used to access this admin panel.</p>
      </div>

      {state.success && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-sm">
          <CheckCircle size={15} />
          Password updated successfully
        </div>
      )}

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Code</label>
          <input
            name="current"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Code</label>
          <input
            name="new"
            type="password"
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Code</label>
          <input
            name="confirm"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60"
          style={{ backgroundColor: '#dc2626' }}
        >
          {pending ? 'Saving…' : 'Update Code'}
        </button>
      </form>
    </div>
  )
}
