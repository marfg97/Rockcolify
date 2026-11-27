import { NextResponse } from 'next/server'
import { createClient } from '@/lib/superbase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const { user, provider_token, provider_refresh_token, expires_at } = data.session

      if (provider_token && provider_refresh_token) {
        const expiresAt = expires_at
          ? new Date(expires_at * 1000).toISOString()
          : new Date(Date.now() + 3600 * 1000).toISOString()

        const spotifyUserId =
          user.user_metadata?.provider_id ||
          user.user_metadata?.sub ||
          user.id

        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          'Anfitrión'

        const { error: dbError } = await supabase.from('hosts').upsert({
          id: user.id,
          spotify_user_id: spotifyUserId,
          display_name: displayName,
          access_token: provider_token,
          refresh_token: provider_refresh_token,
          token_expires_at: expiresAt,
        })

        if (dbError) {
          console.error('Error guardando tokens en tabla hosts:', dbError)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
