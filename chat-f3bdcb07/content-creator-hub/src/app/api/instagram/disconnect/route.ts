import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/server-auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Instagram Disconnect Route
 *
 * Deactivates the user's Instagram OAuth connection.
 * The connection remains in the database but is marked as inactive.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔌 [Instagram Disconnect] Starting Instagram disconnection');

    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      console.error('❌ [Instagram Disconnect] No authenticated user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ [Instagram Disconnect] Authenticated user:', user.id);

    // Deactivate Instagram connection
    const supabase = createClient();
    const { error } = await supabase
      .from('oauth_connections')
      .update({
        is_active: false,
        disconnected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('provider', 'instagram')
      .eq('is_active', true);

    if (error) {
      console.error('❌ [Instagram Disconnect] Error disconnecting Instagram:', error);
      return NextResponse.json(
        { error: 'Failed to disconnect Instagram account' },
        { status: 500 }
      );
    }

    console.log('✅ [Instagram Disconnect] Instagram disconnected successfully');

    return NextResponse.json(
      { success: true, message: 'Instagram account disconnected successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ [Instagram Disconnect] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram account' },
      { status: 500 }
    );
  }
}