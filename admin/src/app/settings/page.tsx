import AdminNav from '@/components/AdminNav'
import SettingsForm from '@/components/SettingsForm'

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <AdminNav />
      <main className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>
        <SettingsForm />
      </main>
    </div>
  )
}
