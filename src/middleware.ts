/**
 * Auth Middleware
 *
 * Handles authentication for all requests:
 * 1. Creates Supabase client with session from cookies
 * 2. Refreshes session tokens on each request
 * 3. Protects routes that require authentication
 * 4. Populates Astro.locals with user and supabase client
 */

import { defineMiddleware } from 'astro:middleware';
import { createServerSupabaseClient } from './lib/supabase';

/**
 * Routes that require authentication.
 * If user is not authenticated, they will be redirected to login.
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/go', // Future: Group order pages
];

/**
 * Auth-only routes (login, callback, etc.)
 * If user IS authenticated, redirect them to dashboard.
 */
const AUTH_ROUTES = ['/auth/login'];

/**
 * Routes that need Supabase client (SSR routes).
 * Static routes don't need Supabase during prerendering.
 */
const SSR_ROUTES = [
  '/auth',
  '/dashboard',
  '/go',
  '/api',
];

/**
 * Check if a path matches any of the protected routes.
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path is an auth-only route.
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}

/**
 * Check if a path needs Supabase (SSR routes).
 */
function needsSupabase(pathname: string): boolean {
  return SSR_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, request, redirect, url, locals } = context;
  const pathname = url.pathname;

  // Skip Supabase for static routes (build-time prerendering)
  // This prevents errors when PUBLIC_SUPABASE_URL is not set during build
  if (!needsSupabase(pathname)) {
    locals.user = null;
    return next();
  }

  // Create Supabase client for this request
  const supabase = createServerSupabaseClient(cookies, request.headers);

  // Get current user (this also refreshes the session if needed)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Populate locals for use in pages
  locals.supabase = supabase;
  locals.user = user;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && user) {
    return redirect('/dashboard');
  }

  // Protect routes that require authentication
  if (isProtectedRoute(pathname) && !user) {
    // Build return URL for post-login redirect
    const returnUrl = encodeURIComponent(pathname + url.search);
    return redirect(`/auth/login?next=${returnUrl}`);
  }

  return next();
});
