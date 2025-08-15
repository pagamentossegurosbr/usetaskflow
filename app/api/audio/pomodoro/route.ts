import { NextRequest, NextResponse } from 'next/server'

// ATENÇÃO: Em produção, mova as credenciais para variáveis de ambiente.
const FREESOUND_CLIENT_ID = 'aBVNtUOlOVt1s2yGFv6p'
const FREESOUND_CLIENT_SECRET = 'Iu0VbSRVd7WTXQ3WuaPG2MB5SLjlqClqy9nvVC9u'

let cachedToken: { access_token: string; expires_at: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expires_at > now + 10_000) {
    return cachedToken.access_token
  }
  const form = new URLSearchParams()
  form.set('grant_type', 'client_credentials')
  form.set('client_id', FREESOUND_CLIENT_ID)
  form.set('client_secret', FREESOUND_CLIENT_SECRET)

  const res = await fetch('https://freesound.org/apiv2/oauth2/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  if (!res.ok) throw new Error('Freesound auth failed')
  const data = await res.json()
  // token lifetime unknown -> assumir 3600s
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600_000),
  }
  return cachedToken.access_token
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'complete'
    const q = type === 'start' ? 'ui start beep' : type === 'pause' ? 'ui pause' : 'notification bell chime'

    const token = await getAccessToken()
    const searchUrl = new URL('https://freesound.org/apiv2/search/text/')
    searchUrl.searchParams.set('query', q)
    searchUrl.searchParams.set('filter', 'duration:[0.1 TO 3]')
    searchUrl.searchParams.set('sort', 'rating_desc')
    searchUrl.searchParams.set('page_size', '1')

    const res = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Freesound search failed')
    const data = await res.json()
    const item = data?.results?.[0]
    if (!item) return NextResponse.json({ url: null })

    const previews = item.previews || {}
    const url = previews['preview-hq-mp3'] || previews['preview-lq-mp3'] || previews['preview-lq-ogg'] || null
    return NextResponse.json({ url, id: item.id, name: item.name })
  } catch (e) {
    return NextResponse.json({ url: null }, { status: 200 })
  }
}


