/**
 * Logout Endpoint
 *
 * Handles user logout by:
 * 1. Signing out from Supabase (invalidates session)
 * 2. Redirecting to homepage
 *
 * Supports both GET and POST methods for flexibility:
 * - GET: Direct link logout (e.g., <a href="/auth/logout">)
 * - POST: Form-based logout (for CSRF protection in sensitive apps)
 */

import type { APIRoute } from 'astro';

export const prerender = false;

async function handleLogout(context: Parameters<APIRoute>[0]): Promise<Response> {
  const { locals, redirect } = context;

  // Sign out from Supabase (clears session server-side)
  await locals.supabase.auth.signOut();

  // Redirect to homepage
  return redirect('/');
}

// Support GET for simple link-based logout
export const GET: APIRoute = handleLogout;

// Support POST for form-based logout
export const POST: APIRoute = handleLogout;
