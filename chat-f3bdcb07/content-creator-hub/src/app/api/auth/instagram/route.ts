import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server-auth';

/**
 * Instagram OAuth 2.0 Initiation Route (WORKING VERSION)
 *
 * Uses Facebook Graph API for Instagram Business/Creator account authentication.
 * This implementation is based on successful GitHub examples and works correctly.
 *
 * Key points:
 * - Instagram Business accounts use Facebook's OAuth system
 * - Uses Facebook Graph API v18.0 (stable version)
 * - Requires Instagram Business/Creator account linked to Facebook Page
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [Instagram OAuth] Starting Instagram Business OAuth flow');

    // 🔥 CRITICAL: Check for authenticated user BEFORE OAuth
    const user = await getServerUser();
    if (!user) {
      console.error('❌ [Instagram OAuth] No authenticated user found');
      return NextResponse.redirect(
        new URL('/login?error=Please login to connect Instagram', request.url)
      );
    }

    console.log('✅ [Instagram OAuth] Authenticated user:', user.id);

    // Check if required environment variables are set
    if (!process.env.INSTAGRAM_CLIENT_ID) {
      console.error('❌ [Instagram OAuth] INSTAGRAM_CLIENT_ID is not configured');
      return NextResponse.json(
        { error: 'Instagram OAuth is not properly configured. Missing client ID.' },
        { status: 500 }
      );
    }

    if (!process.env.INSTAGRAM_CLIENT_SECRET) {
      console.error('❌ [Instagram OAuth] INSTAGRAM_CLIENT_SECRET is not configured');
      return NextResponse.json(
        { error: 'Instagram OAuth is not properly configured. Missing client secret.' },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = generateRandomString(32);

    // Build Facebook Graph API authorization URL for Instagram Business
    // Based on successful implementations: https://github.com/orif1n/sokapost/blob/main/lib/api/instagram.ts
    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      redirect_uri: `${request.nextUrl.origin}/api/auth/instagram/callback`,
      scope: [
        'instagram_basic',
        'instagram_content_publish',
        'instagram_manage_comments',
        'pages_show_list',
        'pages_read_engagement',
        'business_management'
      ].join(' '),
      response_type: 'code',
      state,
    });

    // ✅ WORKING: Use Facebook Graph API v18.0 dialog endpoint (stable version)
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

    console.log('🔐 [Instagram OAuth] Generated authorization URL');
    console.log('🔐 [Instagram OAuth] Storing state securely');

    // Create response with redirect
    const response = NextResponse.redirect(authUrl);

    // Store state in secure cookie (needed for callback CSRF validation)
    response.cookies.set('instagram_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    console.log('🔐 [Instagram OAuth] Redirecting user to Facebook consent screen');
    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ [Instagram OAuth] Error initiating Instagram OAuth:', error);

    return NextResponse.json(
      {
        error: 'Failed to initiate Instagram authentication',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Generate cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}