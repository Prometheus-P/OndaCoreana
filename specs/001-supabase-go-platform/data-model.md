# Data Model: Supabase G.O Platform

**Branch**: `001-supabase-go-platform` | **Date**: 2024-12-21

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│   auth.users    │       │      profiles       │
│   (Supabase)    │       │                     │
├─────────────────┤       ├─────────────────────┤
│ id (UUID) PK    │──1:1──│ id (UUID) PK/FK     │
│ email           │       │ username            │
│ created_at      │       │ display_name        │
│ ...             │       │ country             │
└─────────────────┘       │ locale              │
                          │ trust_score         │
                          │ verified_at         │
                          │ created_at          │
                          │ updated_at          │
                          └─────────────────────┘
                                    │
                                    │ 1:N (organizer)
                                    ▼
                          ┌─────────────────────┐
                          │    group_orders     │
                          ├─────────────────────┤
                          │ id (UUID) PK        │
                          │ organizer_id FK     │──────┐
                          │ title               │      │
                          │ description         │      │
                          │ product_url         │      │
                          │ product_image       │      │
                          │ unit_price_krw      │      │
                          │ shipping_per_unit   │      │
                          │ platform_fee_%      │      │
                          │ min_quantity        │      │
                          │ max_quantity        │      │
                          │ current_quantity    │      │
                          │ destination_countries│     │
                          │ status              │      │
                          │ deadline            │      │
                          │ estimated_delivery  │      │
                          │ created_at          │      │
                          │ updated_at          │      │
                          └─────────────────────┘      │
                                    │                  │
                    ┌───────────────┼───────────────┐  │
                    │               │               │  │
                    ▼ N:1           ▼ N:1           ▼  │
          ┌─────────────────┐ ┌─────────────┐         │
          │  participations │ │   reviews   │         │
          ├─────────────────┤ ├─────────────┤         │
          │ id (UUID) PK    │ │ id (UUID) PK│         │
          │ group_order_id  │ │ group_order │         │
          │ user_id FK      │◄│ reviewer_id │◄────────┘
          │ quantity        │ │ rating (1-5)│   (profiles)
          │ shipping_address│ │ comment     │
          │ payment_status  │ │ created_at  │
          │ payment_id      │ └─────────────┘
          │ amount_paid_usd │
          │ status          │
          │ created_at      │
          └─────────────────┘
                    ▲
                    │ (user_id)
                    │
          ┌─────────────────┐
          │  notifications  │
          ├─────────────────┤
          │ id (UUID) PK    │
          │ user_id FK      │
          │ type            │
          │ title           │
          │ body            │
          │ data (JSONB)    │
          │ read_at         │
          │ created_at      │
          └─────────────────┘
```

---

## Entity Definitions

### 1. profiles

User identity and trust information, linked 1:1 with Supabase auth.users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | User identifier |
| username | TEXT | UNIQUE, nullable | Public username |
| display_name | TEXT | nullable | Display name |
| country | TEXT | nullable, ISO 3166-1 | User's country (MX, AR, CL, BR, etc.) |
| locale | TEXT | DEFAULT 'es', CHECK (es, pt) | Preferred language |
| trust_score | INTEGER | DEFAULT 0, >= 0 | Incremented per completed group order |
| verified_at | TIMESTAMPTZ | nullable | When user was verified |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Triggers:**
- `on_auth_user_created`: Auto-create profile when user signs up
- `on_profiles_updated`: Auto-update `updated_at`

**Validation Rules:**
- Username uniqueness validated in real-time during profile editing
- Country required for group order participation
- display_name required for group order participation

---

### 2. group_orders

A collective purchase organized by a user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Order identifier |
| organizer_id | UUID | FK → profiles, NOT NULL | Order organizer |
| title | TEXT | NOT NULL, length >= 3 | Product/order title |
| description | TEXT | nullable | Detailed description |
| product_url | TEXT | nullable | Link to product |
| product_image | TEXT | nullable | Product image URL |
| unit_price_krw | INTEGER | NOT NULL, > 0 | Unit price in KRW |
| shipping_per_unit_krw | INTEGER | DEFAULT 0, >= 0 | Shipping cost per unit |
| platform_fee_percent | DECIMAL(4,2) | DEFAULT 5.00, 0-100 | Platform fee percentage |
| min_quantity | INTEGER | NOT NULL, > 0 | Minimum order quantity |
| max_quantity | INTEGER | nullable, >= min_quantity | Maximum order quantity |
| current_quantity | INTEGER | DEFAULT 0, >= 0 | Current participant quantity |
| destination_countries | TEXT[] | DEFAULT [MX,AR,CL,BR,CO,PE] | Allowed shipping countries |
| status | TEXT | NOT NULL, CHECK enum | Order status |
| deadline | TIMESTAMPTZ | NOT NULL | Order deadline |
| estimated_delivery | DATE | nullable | Expected delivery date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Status Enum:**
```
draft → open → filled → purchasing → shipping → completed
                  ↓                        ↓
              cancelled                cancelled
```

**Triggers:**
- `on_group_orders_updated`: Auto-update `updated_at`
- `on_order_completed`: Increment trust_score for organizer and participants

**Indexes:**
- `idx_group_orders_organizer`: organizer_id
- `idx_group_orders_status`: status
- `idx_group_orders_deadline`: deadline (WHERE status = 'open')

---

### 3. participations

A user's commitment to a group order.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Participation identifier |
| group_order_id | UUID | FK → group_orders, NOT NULL | Associated order |
| user_id | UUID | FK → profiles, NOT NULL | Participant |
| quantity | INTEGER | NOT NULL, DEFAULT 1, > 0 | Quantity ordered |
| shipping_address | JSONB | nullable | Shipping address data |
| payment_status | TEXT | DEFAULT 'pending', CHECK enum | Payment state |
| payment_id | TEXT | nullable | Stripe/MercadoPago reference |
| amount_paid_usd | DECIMAL(10,2) | nullable | Amount paid |
| status | TEXT | DEFAULT 'active', CHECK enum | Participation state |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Payment Status Enum:** `pending` | `paid` | `refunded` | `failed`

**Participation Status Enum:** `active` | `cancelled` | `fulfilled`

**Constraints:**
- UNIQUE(group_order_id, user_id) - One participation per user per order

**Triggers:**
- `on_participation_changed`: Auto-update group_order.current_quantity

**Indexes:**
- `idx_participations_user`: user_id
- `idx_participations_order`: group_order_id

---

### 4. reviews

User feedback for completed orders.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Review identifier |
| group_order_id | UUID | FK → group_orders, NOT NULL | Reviewed order |
| reviewer_id | UUID | FK → profiles, NOT NULL | Review author |
| rating | INTEGER | NOT NULL, CHECK 1-5 | Star rating |
| comment | TEXT | nullable | Review text |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Constraints:**
- UNIQUE(group_order_id, reviewer_id) - One review per user per order
- Can only review completed orders where user was a participant

---

### 5. notifications

System messages to users.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Notification identifier |
| user_id | UUID | FK → profiles, NOT NULL | Recipient |
| type | TEXT | NOT NULL | Notification type |
| title | TEXT | NOT NULL | Notification title |
| body | TEXT | nullable | Notification body |
| data | JSONB | nullable | Additional data (order_id, etc.) |
| read_at | TIMESTAMPTZ | nullable | When notification was read |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Notification Types:**
- `order_update` - Status change on order user participates in
- `payment_received` - Payment confirmed
- `shipping_update` - Shipping status change
- `order_filled` - Order reached minimum quantity
- `order_deadline` - Order deadline approaching

**Indexes:**
- `idx_notifications_user_unread`: user_id, created_at DESC (WHERE read_at IS NULL)

---

## RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | All users | Auto (trigger) | Own profile only | - |
| group_orders | Non-draft OR own draft | Authenticated users | Organizer only | Organizer (draft/cancelled) |
| participations | Participant OR organizer | Authenticated (open orders) | Own only | Own (unpaid) |
| reviews | All users | Participants (completed) | - | - |
| notifications | Own only | - | Own only | - |

---

## JSONB Schemas

### shipping_address (participations.shipping_address)

```json
{
  "name": "string",
  "street": "string",
  "city": "string",
  "state": "string",
  "postal_code": "string",
  "country": "string (ISO 3166-1 alpha-2)",
  "phone": "string (optional)"
}
```

### data (notifications.data)

```json
{
  "order_id": "uuid (optional)",
  "action_url": "string (optional)",
  "metadata": "object (optional)"
}
```
