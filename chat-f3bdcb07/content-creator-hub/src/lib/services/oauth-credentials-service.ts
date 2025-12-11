/**
 * OAuth Credentials Service
 *
 * Handles storing and retrieving OAuth credentials in the database.
 * All credentials are encrypted before storage using xApiService.
 *
 * Security:
 * - Credentials are encrypted using AES-256
 * - Service role bypasses RLS for cron job access
 * - Credentials never exposed in API responses
 */

import { supabaseAdmin } from '@/lib/supabase/supabase-admin';
import { xApiService, XCredentials } from '@/lib/x-api-service';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface SaveOAuthCredentialsParams {
  userId: string;
  provider: 'twitter' | 'google' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'tiktok';
  credentials: XCredentials;
  providerUserId: string;
  providerUsername?: string;
  providerEmail?: string;
  providerDisplayName?: string;
  scopes?: string[];
  providerData?: Record<string, any>;
}

export interface OAuthConnectionInfo {
  id: string;
  provider: string;
  providerUsername?: string;
  providerDisplayName?: string;
  providerEmail?: string;
  providerData?: Record<string, any>;
  isActive: boolean;
  connectedAt: string;
  lastSyncedAt?: string;
}

// ============================================================
// SAVE OAUTH CREDENTIALS
// ============================================================

/**
 * Save OAuth credentials to database
 * Encrypts credentials before storage
 * Handles both new connections and updates to existing connections
 */
export async function saveOAuthCredentials(
  params: SaveOAuthCredentialsParams
): Promise<{ success: boolean; error?: string; connectionId?: string }> {
  try {
    console.log(`💾 [OAuth Service] Saving credentials for user ${params.userId} (${params.provider})`);

    // Encrypt credentials
    const encryptedAccessToken = xApiService.encryptCredentials(params.credentials);

    // For OAuth 1.0a (Twitter), we don't have a separate refresh token
    // The access token and secret are permanent until revoked
    const encryptedRefreshToken = params.credentials.accessTokenSecret
      ? xApiService.encryptCredentials({
          accessToken: params.credentials.accessTokenSecret,
          accessTokenSecret: '', // Not used for storage, but required by type
        })
      : null;

    // Check if connection already exists
    const { data: existingConnection } = await supabaseAdmin
      .from('oauth_connections')
      .select('id, is_active')
      .eq('user_id', params.userId)
      .eq('provider', params.provider)
      .single();

    let connectionId: string;

    if (existingConnection) {
      // Update existing connection
      console.log(`🔄 [OAuth Service] Updating existing connection ${existingConnection.id}`);

      const { data: updatedConnection, error: updateError } = await supabaseAdmin
        .from('oauth_connections')
        .update({
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken,
          provider_user_id: params.providerUserId,
          provider_username: params.providerUsername || null,
          provider_email: params.providerEmail || null,
          provider_display_name: params.providerDisplayName || null,
          scopes: params.scopes || [],
          provider_data: params.providerData || {},
          is_active: true,
          is_primary: true, // Make this the primary connection
          last_synced_at: new Date().toISOString(),
          error_count: 0, // Reset error count on successful reconnection
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConnection.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('❌ [OAuth Service] Error updating connection:', updateError);
        return { success: false, error: updateError.message };
      }

      connectionId = updatedConnection!.id;
    } else {
      // Create new connection
      console.log(`➕ [OAuth Service] Creating new connection for ${params.provider}`);

      const { data: newConnection, error: insertError } = await supabaseAdmin
        .from('oauth_connections')
        .insert({
          user_id: params.userId,
          provider: params.provider,
          provider_user_id: params.providerUserId,
          provider_username: params.providerUsername || null,
          provider_email: params.providerEmail || null,
          provider_display_name: params.providerDisplayName || null,
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken,
          scopes: params.scopes || [],
          provider_data: params.providerData || {},
          is_active: true,
          is_primary: true,
          connected_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('❌ [OAuth Service] Error creating connection:', insertError);
        return { success: false, error: insertError.message };
      }

      connectionId = newConnection!.id;
    }

    console.log(`✅ [OAuth Service] Credentials saved successfully (connection ID: ${connectionId})`);

    return { success: true, connectionId };
  } catch (error) {
    console.error('❌ [OAuth Service] Failed to save credentials:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// GET OAUTH CREDENTIALS
// ============================================================

/**
 * Get decrypted OAuth credentials for a user and provider
 * Used internally by services (not exposed to client)
 */
export async function getOAuthCredentials(
  userId: string,
  provider: 'twitter' | 'google' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'tiktok'
): Promise<{ success: boolean; credentials?: XCredentials; error?: string }> {
  try {
    console.log(`🔍 [OAuth Service] Getting credentials for user ${userId} (${provider})`);

    const { data: connection, error } = await supabaseAdmin
      .from('oauth_connections')
      .select('access_token_encrypted, refresh_token_encrypted, is_active')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error || !connection) {
      console.error(`❌ [OAuth Service] No active connection found:`, error);
      return { success: false, error: 'No active OAuth connection found' };
    }

    if (!connection.is_active) {
      return { success: false, error: 'OAuth connection is inactive' };
    }

    // Decrypt credentials
    try {
      const credentials = xApiService.decryptCredentials(connection.access_token_encrypted);

      // For OAuth 1.0a, the refresh token field contains the access token secret
      if (connection.refresh_token_encrypted) {
        const secretData = xApiService.decryptCredentials(connection.refresh_token_encrypted);
        credentials.accessTokenSecret = secretData.accessToken; // Extract the secret
      }

      console.log(`✅ [OAuth Service] Credentials retrieved successfully`);

      return { success: true, credentials };
    } catch (decryptError) {
      console.error(`❌ [OAuth Service] Failed to decrypt credentials:`, decryptError);
      return { success: false, error: 'Failed to decrypt credentials' };
    }
  } catch (error) {
    console.error('❌ [OAuth Service] Error getting credentials:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// GET USER OAUTH CONNECTIONS
// ============================================================

/**
 * Get list of user's OAuth connections (without sensitive credentials)
 * Safe to expose to client
 */
export async function getUserOAuthConnections(
  userId: string
): Promise<{ success: boolean; connections?: OAuthConnectionInfo[]; error?: string }> {
  try {
    const { data: connections, error } = await supabaseAdmin
      .from('oauth_connections')
      .select('id, provider, provider_username, provider_display_name, provider_email, provider_data, is_active, connected_at, last_synced_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('connected_at', { ascending: false });

    if (error) {
      console.error('❌ [OAuth Service] Error getting connections:', error);
      return { success: false, error: error.message };
    }

    const connectionInfo: OAuthConnectionInfo[] = (connections || []).map(conn => ({
      id: conn.id,
      provider: conn.provider,
      providerUsername: conn.provider_username || undefined,
      providerDisplayName: conn.provider_display_name || undefined,
      providerEmail: conn.provider_email || undefined,
      providerData: conn.provider_data || undefined,
      isActive: conn.is_active,
      connectedAt: conn.connected_at,
      lastSyncedAt: conn.last_synced_at || undefined,
    }));

    return { success: true, connections: connectionInfo };
  } catch (error) {
    console.error('❌ [OAuth Service] Error getting connections:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// DISCONNECT OAUTH
// ============================================================

/**
 * Disconnect (deactivate) an OAuth connection
 * Credentials remain in database but are marked inactive
 */
export async function disconnectOAuthConnection(
  userId: string,
  provider: 'twitter' | 'google' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'tiktok'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔌 [OAuth Service] Disconnecting ${provider} for user ${userId}`);

    const { error } = await supabaseAdmin
      .from('oauth_connections')
      .update({
        is_active: false,
        disconnected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true);

    if (error) {
      console.error('❌ [OAuth Service] Error disconnecting:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ [OAuth Service] ${provider} disconnected successfully`);

    return { success: true };
  } catch (error) {
    console.error('❌ [OAuth Service] Error disconnecting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// CHECK OAUTH CONNECTION
// ============================================================

/**
 * Check if user has an active OAuth connection for a provider
 */
export async function hasOAuthConnection(
  userId: string,
  provider: 'twitter' | 'google' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'tiktok'
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('oauth_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    return !!data && !error;
  } catch (error) {
    console.error('❌ [OAuth Service] Error checking connection:', error);
    return false;
  }
}
