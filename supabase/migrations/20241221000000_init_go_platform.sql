-- ===========================================================================
-- G.O Platform Database Schema
-- OndaCoreana Group Order (공동구매) Platform
-- ===========================================================================
-- This migration creates the complete database schema for the G.O platform:
-- - profiles: User identity linked to auth.users
-- - group_orders: Collective purchase orders
-- - participations: User commitments to orders
-- - reviews: Order feedback with ratings
-- - notifications: System messages to users
-- ===========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================================================
-- ENUM TYPES
-- ===========================================================================

-- Group order status lifecycle
CREATE TYPE group_order_status AS ENUM (
  'draft',
  'open',
  'filled',
  'purchasing',
  'shipping',
  'completed',
  'cancelled'
);

-- Payment status for participations
CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'refunded',
  'failed'
);

-- Participation status
CREATE TYPE participation_status AS ENUM (
  'active',
  'cancelled',
  'fulfilled'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'order_update',
  'payment_received',
  'shipping_update',
  'order_filled',
  'order_deadline'
);

-- ===========================================================================
-- TABLE: profiles
-- ===========================================================================
-- User identity and trust information, linked 1:1 with auth.users

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  country TEXT, -- ISO 3166-1 alpha-2
  locale TEXT NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'pt')),
  trust_score INTEGER NOT NULL DEFAULT 0 CHECK (trust_score >= 0),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for username lookups
CREATE INDEX idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- ===========================================================================
-- TABLE: group_orders
-- ===========================================================================
-- A collective purchase organized by a user

CREATE TABLE group_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 3),
  description TEXT,
  product_url TEXT,
  product_image TEXT,
  unit_price_krw INTEGER NOT NULL CHECK (unit_price_krw > 0),
  shipping_per_unit_krw INTEGER NOT NULL DEFAULT 0 CHECK (shipping_per_unit_krw >= 0),
  platform_fee_percent DECIMAL(4,2) NOT NULL DEFAULT 5.00 CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 100),
  min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
  max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity >= min_quantity),
  current_quantity INTEGER NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
  destination_countries TEXT[] NOT NULL DEFAULT ARRAY['MX', 'AR', 'CL', 'BR', 'CO', 'PE'],
  status group_order_status NOT NULL DEFAULT 'draft',
  deadline TIMESTAMPTZ NOT NULL,
  estimated_delivery DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_group_orders_organizer ON group_orders(organizer_id);
CREATE INDEX idx_group_orders_status ON group_orders(status);
CREATE INDEX idx_group_orders_deadline_open ON group_orders(deadline) WHERE status = 'open';

-- ===========================================================================
-- TABLE: participations
-- ===========================================================================
-- A user's commitment to a group order

CREATE TABLE participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  shipping_address JSONB,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  amount_paid_usd DECIMAL(10,2),
  status participation_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One participation per user per order
  UNIQUE(group_order_id, user_id)
);

-- Indexes for common queries
CREATE INDEX idx_participations_user ON participations(user_id);
CREATE INDEX idx_participations_order ON participations(group_order_id);

-- ===========================================================================
-- TABLE: reviews
-- ===========================================================================
-- User feedback for completed orders

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One review per user per order
  UNIQUE(group_order_id, reviewer_id)
);

-- Index for order reviews lookup
CREATE INDEX idx_reviews_order ON reviews(group_order_id);

-- ===========================================================================
-- TABLE: notifications
-- ===========================================================================
-- System messages to users

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for unread notifications (most common query)
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

-- ===========================================================================
-- TRIGGER FUNCTIONS
-- ===========================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, locale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'es')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update current_quantity when participation changes
CREATE OR REPLACE FUNCTION update_order_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_orders
    SET current_quantity = current_quantity + NEW.quantity
    WHERE id = NEW.group_order_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE group_orders
    SET current_quantity = current_quantity - OLD.quantity + NEW.quantity
    WHERE id = NEW.group_order_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_orders
    SET current_quantity = current_quantity - OLD.quantity
    WHERE id = OLD.group_order_id;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment trust_score when order completes
CREATE OR REPLACE FUNCTION increment_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Increment organizer's trust_score
    UPDATE profiles
    SET trust_score = trust_score + 1
    WHERE id = NEW.organizer_id;

    -- Increment participants' trust_score
    UPDATE profiles
    SET trust_score = trust_score + 1
    WHERE id IN (
      SELECT user_id FROM participations
      WHERE group_order_id = NEW.id AND status = 'fulfilled'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
-- TRIGGERS
-- ===========================================================================

-- updated_at triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER group_orders_updated_at
  BEFORE UPDATE ON group_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update order quantity on participation change
CREATE TRIGGER on_participation_changed
  AFTER INSERT OR UPDATE OR DELETE ON participations
  FOR EACH ROW
  EXECUTE FUNCTION update_order_quantity();

-- Increment trust_score on order completion
CREATE TRIGGER on_order_completed
  AFTER UPDATE ON group_orders
  FOR EACH ROW
  EXECUTE FUNCTION increment_trust_score();

-- ===========================================================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- PROFILES POLICIES
-- ---------------------------------------------------------------------------

-- Anyone can view profiles (for displaying organizer info, etc.)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- GROUP_ORDERS POLICIES
-- ---------------------------------------------------------------------------

-- Anyone can view non-draft orders; organizers can view their own drafts
CREATE POLICY "Non-draft orders are viewable by everyone"
  ON group_orders FOR SELECT
  USING (status != 'draft' OR organizer_id = auth.uid());

-- Authenticated users can create orders
CREATE POLICY "Authenticated users can create orders"
  ON group_orders FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Only organizer can update their order
CREATE POLICY "Organizers can update own orders"
  ON group_orders FOR UPDATE
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Organizers can delete draft or cancelled orders
CREATE POLICY "Organizers can delete draft or cancelled orders"
  ON group_orders FOR DELETE
  USING (organizer_id = auth.uid() AND status IN ('draft', 'cancelled'));

-- ---------------------------------------------------------------------------
-- PARTICIPATIONS POLICIES
-- ---------------------------------------------------------------------------

-- Participants and organizers can view participations
CREATE POLICY "Participations viewable by participant or organizer"
  ON participations FOR SELECT
  USING (
    user_id = auth.uid() OR
    group_order_id IN (
      SELECT id FROM group_orders WHERE organizer_id = auth.uid()
    )
  );

-- Authenticated users can participate in open orders
CREATE POLICY "Users can participate in open orders"
  ON participations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    group_order_id IN (
      SELECT id FROM group_orders WHERE status = 'open'
    )
  );

-- Users can update only their own participation
CREATE POLICY "Users can update own participation"
  ON participations FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete unpaid participations
CREATE POLICY "Users can delete unpaid participations"
  ON participations FOR DELETE
  USING (user_id = auth.uid() AND payment_status = 'pending');

-- ---------------------------------------------------------------------------
-- REVIEWS POLICIES
-- ---------------------------------------------------------------------------

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Only participants of completed orders can create reviews
CREATE POLICY "Participants can review completed orders"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    group_order_id IN (
      SELECT go.id FROM group_orders go
      JOIN participations p ON p.group_order_id = go.id
      WHERE go.status = 'completed' AND p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ---------------------------------------------------------------------------

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ===========================================================================
-- COMMENTS
-- ===========================================================================

COMMENT ON TABLE profiles IS 'User identity and trust information, linked 1:1 with auth.users';
COMMENT ON TABLE group_orders IS 'Collective purchase orders organized by users';
COMMENT ON TABLE participations IS 'User commitments to group orders';
COMMENT ON TABLE reviews IS 'User feedback and ratings for completed orders';
COMMENT ON TABLE notifications IS 'System messages and alerts for users';

COMMENT ON COLUMN profiles.trust_score IS 'Incremented each time user completes a group order (as organizer or participant)';
COMMENT ON COLUMN group_orders.destination_countries IS 'ISO 3166-1 alpha-2 country codes for allowed shipping destinations';
COMMENT ON COLUMN participations.shipping_address IS 'JSONB with: name, street, city, state, postal_code, country, phone';
COMMENT ON COLUMN notifications.data IS 'JSONB with optional: order_id, action_url, metadata';
