/**
 * Supabase Admin Client Configuration
 *
 * ⚠️ SERVER-SIDE ONLY ⚠️
 * This file exports the admin client with service role key.
 * NEVER import this file in client components or browser code!
 *
 * The admin client bypasses Row Level Security (RLS) policies.
 * Only use in API routes and server-side code where authentication
 * has already been verified.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

// Validate service role key exists (fail-closed security)
// This validation only runs when this file is imported (server-side only)
if (!supabaseServiceRoleKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is required for admin operations. ' +
    'This environment variable must be set in .env.local or your deployment platform. ' +
    'NEVER import this file in browser/frontend code.'
  );
}

/**
 * Server-side Supabase client with service role key
 * Bypasses RLS policies - use with caution!
 * NEVER expose this client to the frontend
 * Only use in API routes or server-side code
 *
 * PRODUCTION NOTE:
 * - Supabase automatically provides connection pooling through PostgREST
 * - For optimal serverless performance, ensure NEXT_PUBLIC_SUPABASE_URL uses the pooling endpoint
 * - Connection pooling is handled at the PostgREST layer (no additional config needed here)
 * - Each Vercel serverless invocation will reuse HTTP connections via keep-alive
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'content-creator-hub-admin',
      },
    },
    // Reuse HTTP connections for better performance in serverless
    // This is automatically handled by fetch API's keep-alive
  }
);
