/// <reference path="../.astro/types.d.ts" />

import type { SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

declare global {
  namespace App {
    interface Locals {
      /**
       * Supabase client instance, configured with session from cookies.
       * Available in middleware, pages, and API routes.
       */
      supabase: SupabaseClientType<Database>;

      /**
       * Currently authenticated user, or null if not authenticated.
       * Populated by the auth middleware after session validation.
       */
      user: User | null;
    }
  }
}

export {};
