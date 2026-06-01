'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSupabaseAdmin } from '@/lib/supabase'
import { signSession, isAuthenticated } from '@/lib/session'
import type { Category, Image } from '@/lib/types'

async function requireAuth() {
  const authed = await isAuthenticated()
  if (!authed) redirect('/')
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(prevState: { error: string }, formData: FormData) {
  const password = formData.get('password') as string
  const admin = createSupabaseAdmin()

  const { data: settingsData } = await admin
    .from('settings')
    .select('value')
    .eq('key', 'admin_password')
    .single()

  const data = settingsData as { value: string } | null

  if (!data || data.value !== password) {
    return { error: 'Incorrect password' }
  }

  const token = await signSession()
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/')
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function createCategory(prevState: { error: string }, formData: FormData) {
  await requireAuth()
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Category name is required' }

  const admin = createSupabaseAdmin()
  const { data: existingData } = await admin.from('categories').select('id').eq('name', name).single()
  const existing = existingData as { id: string } | null
  if (existing) return { error: 'Category already exists' }

  const { data: maxData } = await admin.from('categories').select('display_order').order('display_order', { ascending: false }).limit(1).single()
  const max = maxData as { display_order: number } | null
  const nextOrder = (max?.display_order ?? -1) + 1

  const { error } = await admin.from('categories').insert({ name, display_order: nextOrder })
  if (error) return { error: error.message }
  return { error: '' }
}

export async function renameCategory(prevState: { error: string }, formData: FormData) {
  await requireAuth()
  const id = formData.get('id') as string
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name required' }

  const admin = createSupabaseAdmin()
  const { error } = await admin.from('categories').update({ name }).eq('id', id)
  if (error) return { error: error.message }
  return { error: '' }
}

export async function deleteCategory(id: string) {
  await requireAuth()
  const admin = createSupabaseAdmin()

  const { data: imagesData } = await admin.from('images').select('storage_path').eq('category_id', id)
  const images = imagesData as { storage_path: string }[] | null
  if (images && images.length > 0) {
    await admin.storage.from('catalogue').remove(images.map((i) => i.storage_path))
    await admin.from('images').delete().eq('category_id', id)
  }

  await admin.from('categories').delete().eq('id', id)
}

// ── Images ────────────────────────────────────────────────────────────────────

export async function uploadImages(formData: FormData) {
  await requireAuth()
  const admin = createSupabaseAdmin()

  const categoryId = (formData.get('categoryId') as string) || null
  const newCategoryName = (formData.get('newCategoryName') as string)?.trim() || null

  let finalCategoryId: string | null = categoryId

  if (newCategoryName) {
    const { data: maxData } = await admin.from('categories').select('display_order').order('display_order', { ascending: false }).limit(1).single()
    const max = maxData as { display_order: number } | null
    const nextOrder = (max?.display_order ?? -1) + 1
    const { data: newCat } = await admin.from('categories').insert({ name: newCategoryName, display_order: nextOrder }).select('id').single()
    finalCategoryId = (newCat as { id: string } | null)?.id ?? null
  }

  const files = formData.getAll('files') as File[]
  const widths = formData.getAll('widths') as string[]
  const heights = formData.getAll('heights') as string[]
  const folder = finalCategoryId ?? 'uncategorized'

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = file.name.split('.').pop() ?? 'jpg'
    const id = crypto.randomUUID()
    const path = `${folder}/${id}.${ext}`

    const { error: uploadError } = await admin.storage.from('catalogue').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

    const { data: urlData } = admin.storage.from('catalogue').getPublicUrl(path)

    await admin.from('images').insert({
      category_id: finalCategoryId,
      filename: file.name,
      storage_path: path,
      url: urlData.publicUrl,
      width: widths[i] ? parseInt(widths[i]) : null,
      height: heights[i] ? parseInt(heights[i]) : null,
    })
  }
}

export async function deleteImage(id: string, storagePath: string) {
  await requireAuth()
  const admin = createSupabaseAdmin()
  await admin.storage.from('catalogue').remove([storagePath])
  await admin.from('images').delete().eq('id', id)
}

export async function moveImage(imageId: string, newCategoryId: string | null) {
  await requireAuth()
  const admin = createSupabaseAdmin()
  await admin.from('images').update({ category_id: newCategoryId }).eq('id', imageId)
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function changePassword(prevState: { error: string; success: boolean }, formData: FormData) {
  await requireAuth()
  const current = formData.get('current') as string
  const next = formData.get('new') as string
  const confirm = formData.get('confirm') as string

  if (!next || next.length < 6) return { error: 'New password must be at least 6 characters', success: false }
  if (next !== confirm) return { error: 'Passwords do not match', success: false }

  const admin = createSupabaseAdmin()
  const { data: pwData } = await admin.from('settings').select('value').eq('key', 'admin_password').single()
  const pwRow = pwData as { value: string } | null
  if (!pwRow || pwRow.value !== current) return { error: 'Current password is incorrect', success: false }

  await admin.from('settings').update({ value: next, updated_at: new Date().toISOString() }).eq('key', 'admin_password')
  return { error: '', success: true }
}
