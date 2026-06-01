import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  revalidatePath('/', 'layout')
  return Response.json({ revalidated: true, ts: Date.now() })
}
