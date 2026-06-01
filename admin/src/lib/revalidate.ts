export async function revalidateMainSite() {
  const url = process.env.MAIN_SITE_URL
  const secret = process.env.REVALIDATE_SECRET
  if (!url || !secret) return
  try {
    await fetch(`${url}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
      cache: 'no-store',
    })
  } catch {
    // non-fatal — ISR fallback will catch it within 2 minutes
  }
}
