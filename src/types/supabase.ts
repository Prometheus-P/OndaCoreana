/**
 * Supabase Database Types
 *
 * Manual type definitions for the G.O Platform database schema.
 * These types match the schema defined in:
 * supabase/migrations/20241221000000_init_go_platform.sql
 *
 * TODO: Generate these automatically using `supabase gen types typescript`
 * once connected to the Supabase project.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =============================================================================
// ENUM TYPES
// =============================================================================

export type GroupOrderStatus =
  | 'draft'
  | 'open'
  | 'filled'
  | 'purchasing'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export type ParticipationStatus = 'active' | 'cancelled' | 'fulfilled';

export type NotificationType =
  | 'order_update'
  | 'payment_received'
  | 'shipping_update'
  | 'order_filled'
  | 'order_deadline';

export type Locale = 'es' | 'pt';

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  country: string | null;
  locale: Locale;
  trust_score: number;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupOrder {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  product_url: string | null;
  product_image: string | null;
  unit_price_krw: number;
  shipping_per_unit_krw: number;
  platform_fee_percent: number;
  min_quantity: number;
  max_quantity: number | null;
  current_quantity: number;
  destination_countries: string[];
  status: GroupOrderStatus;
  deadline: string;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface Participation {
  id: string;
  group_order_id: string;
  user_id: string;
  quantity: number;
  shipping_address: ShippingAddress | null;
  payment_status: PaymentStatus;
  payment_id: string | null;
  amount_paid_usd: number | null;
  status: ParticipationStatus;
  created_at: string;
}

export interface Review {
  id: string;
  group_order_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface NotificationData {
  order_id?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: NotificationData | null;
  read_at: string | null;
  created_at: string;
}

// =============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'trust_score'> & {
          trust_score?: number;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      group_orders: {
        Row: GroupOrder;
        Insert: Omit<
          GroupOrder,
          'id' | 'created_at' | 'updated_at' | 'current_quantity'
        > & {
          id?: string;
          current_quantity?: number;
        };
        Update: Partial<Omit<GroupOrder, 'id' | 'created_at' | 'organizer_id'>>;
      };
      participations: {
        Row: Participation;
        Insert: Omit<Participation, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Omit<Participation, 'id' | 'created_at' | 'user_id' | 'group_order_id'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: never; // Reviews cannot be updated
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Pick<Notification, 'read_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      group_order_status: GroupOrderStatus;
      payment_status: PaymentStatus;
      participation_status: ParticipationStatus;
      notification_type: NotificationType;
    };
  };
}

// =============================================================================
// HELPER TYPES
// =============================================================================

/** Profile with related group orders (as organizer) */
export interface ProfileWithOrders extends Profile {
  organized_orders?: GroupOrder[];
}

/** Group order with organizer profile */
export interface GroupOrderWithOrganizer extends GroupOrder {
  organizer?: Profile;
}

/** Participation with related group order */
export interface ParticipationWithOrder extends Participation {
  group_order?: GroupOrder;
}

/** Type-safe Supabase client */
export type SupabaseClient = import('@supabase/supabase-js').SupabaseClient<Database>;
