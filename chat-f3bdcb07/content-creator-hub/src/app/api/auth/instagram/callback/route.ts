import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server-auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Instagram OAuth 2.0 Callback Route (WORKING VERSION)
 *
 * Handles OAuth callback from Facebook for Instagram Business/Creator accounts.
 * Exchanges authorization code for access token using Facebook Graph API.
 *
 * Based on successful implementations like:
 * - https://github.com/orif1n/sokapost/blob/main/lib/api/instagram.ts
 * - https://github.com/superglue-ai/superglue/blob/main/packages/shared/templates.ts
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [Instagram Callback] Processing OAuth callback');

    // 🔥 CRITICAL: Check for authenticated user first
    const user = await getServerUser();
    if (!user) {
      console.error('❌ [Instagram Callback] No authenticated user found');
      return NextResponse.redirect(
        new URL('/settings?error=Authentication required', request.url)
      );
    }

    console.log('✅ [Instagram Callback] Authenticated user:', user.id);

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');

    // Handle OAuth errors
    if (error) {
      console.error('❌ [Instagram Callback] OAuth error:', { error, errorReason });
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(error || 'Authorization failed')}`, request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('❌ [Instagram Callback] Missing authorization code');
      return NextResponse.redirect(
        new URL('/settings?error=Missing authorization code', request.url)
      );
    }

    // Validate state parameter (CSRF protection)
    const storedState = request.cookies.get('instagram_oauth_state')?.value;
    if (!state || state !== storedState) {
      console.error('❌ [Instagram Callback] Invalid state parameter');
      return NextResponse.redirect(
        new URL('/settings?error=Invalid state parameter', request.url)
      );
    }

    // Check environment variables
    if (!process.env.INSTAGRAM_CLIENT_ID || !process.env.INSTAGRAM_CLIENT_SECRET) {
      console.error('❌ [Instagram Callback] Missing Instagram OAuth credentials');
      return NextResponse.redirect(
        new URL('/settings?error=Server configuration error', request.url)
      );
    }

    console.log('🔄 [Instagram Callback] Exchanging authorization code for access token');

    // ✅ WORKING: Exchange code for access token using Facebook Graph API
    // Based on successful GitHub implementations
    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        code,
        redirect_uri: `${request.nextUrl.origin}/api/auth/instagram/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ [Instagram Callback] Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData
      });
      return NextResponse.redirect(
        new URL('/settings?error=Failed to exchange authorization code', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ [Instagram Callback] Access token obtained successfully');

    // Get user's Instagram profile information
    console.log('🔄 [Instagram Callback] Fetching user profile information');

    const profileUrl = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokenData.access_token}`;
    const profileResponse = await fetch(profileUrl);

    if (!profileResponse.ok) {
      console.error('❌ [Instagram Callback] Failed to fetch user profile');
      return NextResponse.redirect(
        new URL('/settings?error=Failed to fetch user profile', request.url)
      );
    }

    const profileData = await profileResponse.json();
    console.log('✅ [Instagram Callback] User profile fetched:', profileData);

    // Store Instagram connection in database
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from('user_social_accounts')
      .upsert({
        user_id: user.id,
        platform: 'instagram',
        platform_user_id: profileData.id,
        username: profileData.username,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null,
        account_type: profileData.account_type,
        media_count: profileData.media_count,
        raw_response: {
          token: tokenData,
          profile: profileData,
        },
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform',
        ignoreDuplicates: false,
      });

    if (dbError) {
      console.error('❌ [Instagram Callback] Database error:', dbError);
      return NextResponse.redirect(
        new URL('/settings?error=Failed to save connection', request.url)
      );
    }

    console.log('✅ [Instagram Callback] Instagram connection saved successfully');

    // Clear state cookie
    const response = NextResponse.redirect(
      new URL('/settings?success=Instagram connected successfully', request.url)
    );
    response.cookies.delete('instagram_oauth_state');

    // ✅ WORKING: Handle popup window detection and close
    const userAgent = request.headers.get('user-agent') || '';
    const isPopup = userAgent.includes('Popup') || request.headers.get('referer')?.includes('popup');

    if (isPopup) {
      // For popup flow, return HTML that will close the popup and notify parent
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Instagram Connected</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .subtitle {
              font-size: 16px;
              opacity: 0.9;
              margin-bottom: 24px;
            }
          </style>
        </head>
        <body>
          <div class="success-icon">✅</div>
          <div class="title">Instagram Connected Successfully!</div>
          <div class="subtitle">This window will close automatically...</div>
          <script>
            // Notify parent window of success
            if (window.opener) {
              window.opener.postMessage({
                type: 'instagram_oauth_success',
                data: {
                  platform: 'instagram',
                  username: '${profileData.username}',
                  accountId: '${profileData.id}'
                }
              }, '*');
            }

            // Close popup after a short delay
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
        </html>
      `;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return response;

  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ [Instagram Callback] Unexpected error:', error);

    // Handle popup error case
    const userAgent = request.headers.get('user-agent') || '';
    const isPopup = userAgent.includes('Popup') || request.headers.get('referer')?.includes('popup');

    if (isPopup) {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Connection Failed</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              background: #ff4757;
              color: white;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .error-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="error-icon">❌</div>
          <div class="title">Connection Failed</div>
          <div class="subtitle">Please try again</div>
          <script>
            // Notify parent window of error
            if (window.opener) {
              window.opener.postMessage({
                type: 'instagram_oauth_error',
                data: {
                  error: '${err.message}'
                }
              }, '*');
            }

            // Close popup after a short delay
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
        </html>
      `;

      return new Response(errorHtml, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent('Connection failed')}`, request.url)
    );
  }
}