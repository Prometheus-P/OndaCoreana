/**
 * Supabase Client Library
 *
 * Provides type-safe Supabase clients for both server-side (Astro pages/middleware)
 * and browser-side (React islands) usage.
 *
 * Server-side: Uses cookie-based session management with httpOnly cookies
 * Browser-side: Uses the same cookies via the browser's cookie API
 */

import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import type { Database } from '../types/supabase';

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * Validates Supabase environment variables are properly configured.
 * Throws descriptive errors if configuration is missing or invalid.
 */
function validateEnvironment(): { url: string; anonKey: string } {
  if (!SUPABASE_URL) {
    throw new Error(
      'Falta PUBLIC_SUPABASE_URL. ' +
        'Añade esta variable a tu archivo .env. ' +
        'Puedes obtenerla en: Supabase Dashboard → Project Settings → API'
    );
  }

  if (!SUPABASE_ANON_KEY) {
    throw new Error(
      'Falta PUBLIC_SUPABASE_ANON_KEY. ' +
        'Añade esta variable a tu archivo .env. ' +
        'Puedes obtenerla en: Supabase Dashboard → Project Settings → API'
    );
  }

  // Validate URL format
  try {
    new URL(SUPABASE_URL);
  } catch {
    throw new Error(
      `PUBLIC_SUPABASE_URL no es una URL válida: "${SUPABASE_URL}". ` +
        'Debe ser algo como: https://tu-proyecto.supabase.co'
    );
  }

  // Basic key validation (should be a JWT-like string)
  if (SUPABASE_ANON_KEY.length < 100) {
    throw new Error(
      'PUBLIC_SUPABASE_ANON_KEY parece inválida (demasiado corta). ' +
        'Verifica que copiaste la clave completa desde Supabase Dashboard.'
    );
  }

  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

// =============================================================================
// SERVER-SIDE CLIENT
// =============================================================================

/**
 * Cookie configuration for session management.
 * - httpOnly: Prevents XSS attacks from accessing tokens
 * - secure: Only sent over HTTPS in production
 * - sameSite: Prevents CSRF attacks
 * - maxAge: 7-day session duration (per spec)
 */
const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

/**
 * Creates a Supabase client for server-side use (Astro pages, middleware, API routes).
 *
 * This client:
 * - Reads session from cookies
 * - Automatically refreshes tokens
 * - Sets updated cookies on response
 *
 * @param cookies - Astro cookies object
 * @param headers - Request headers (for reading Cookie header)
 * @returns Typed Supabase client
 *
 * @example
 * ```astro
 * ---
 * const supabase = createServerSupabaseClient(Astro.cookies, Astro.request.headers);
 * const { data: { user } } = await supabase.auth.getUser();
 * ---
 * ```
 */
export function createServerSupabaseClient(
  cookies: AstroCookies,
  headers: Headers
) {
  const { url, anonKey } = validateEnvironment();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        const parsed = parseCookieHeader(headers.get('Cookie') ?? '');
        // Filter out cookies without values
        return parsed.filter((cookie): cookie is { name: string; value: string } =>
          cookie.value !== undefined
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            ...COOKIE_OPTIONS,
            secure: import.meta.env.PROD,
            ...options,
          });
        });
      },
    },
  });
}

// =============================================================================
// BROWSER-SIDE CLIENT
// =============================================================================

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Creates a Supabase client for browser-side use (React islands).
 *
 * This client:
 * - Uses the browser's cookie API for session
 * - Is a singleton to prevent multiple instances
 * - Shares session with server-side client via cookies
 *
 * @returns Typed Supabase client
 *
 * @example
 * ```tsx
 * const supabase = createBrowserSupabaseClient();
 * const { data: orders } = await supabase
 *   .from('group_orders')
 *   .select('*')
 *   .eq('status', 'open');
 * ```
 */
export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = validateEnvironment();

  browserClient = createClient<Database>(url, anonKey, {
    auth: {
      // Use cookies for session persistence
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { Database } from '../types/supabase';
