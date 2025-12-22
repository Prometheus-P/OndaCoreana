# Feature Specification: Supabase G.O Platform Integration

**Feature Branch**: `001-supabase-go-platform`
**Created**: 2024-12-21
**Status**: Draft
**Input**: User description: "Supabase 백엔드 도입 및 G.O(공구) 플랫폼 스키마 구축: K-Culture 공동구매 중개 플랫폼으로 전환"

## Clarifications

### Session 2024-12-21

- Q: 사용자 세션의 지속 시간(만료 기간)은? → A: 7일 (일주일간 유지, 균형 잡힌 보안/편의성)
- Q: trust_score는 어떻게 계산되는가? → A: 공구 완료 횟수 기준 (성공적으로 완료한 공동구매 수)
- Q: Magic Link 요청 rate limiting은? → A: 5분에 1회 (균형 잡힌 보안)
- Q: Username 중복 시 처리 방식은? → A: 실시간 검증 (입력 중 즉시 중복 확인 표시)
- Q: 프로필 완성 시점은? → A: 참여 시 필수 (공구 참여할 때만 필수 필드 요구)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Passwordless Authentication (Priority: P1)

A new visitor discovers OndaCoreana and wants to participate in a group order. They need a simple, secure way to create an account without remembering another password.

**Why this priority**: Authentication is the foundation for all platform features. Without user accounts, no group orders, participations, or trust systems can function. Magic Link provides security without friction.

**Independent Test**: Can be fully tested by entering an email, receiving the magic link, clicking it, and verifying session is established. Delivers immediate access to the platform.

**Acceptance Scenarios**:

1. **Given** a visitor on the login page, **When** they enter a valid email and submit, **Then** the system sends a magic link email within 30 seconds
2. **Given** a user who received a magic link, **When** they click the link within 1 hour, **Then** they are authenticated and redirected to the dashboard
3. **Given** an authenticated user, **When** they click logout, **Then** their session is terminated and they are redirected to the homepage
4. **Given** a user with an expired magic link (>1 hour), **When** they click the link, **Then** they see an error message and are prompted to request a new link

---

### User Story 2 - User Dashboard Access (Priority: P1)

An authenticated user wants to view their profile, see their organized group orders, and check their participations in one central location.

**Why this priority**: The dashboard is the command center for all user interactions. It provides the foundation for managing group orders and participations.

**Independent Test**: Can be tested by logging in and verifying the dashboard displays user profile info, organized orders list, and participations list. Delivers visibility into user's platform activity.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they navigate to `/dashboard`, **Then** they see their display name and profile summary
2. **Given** a user who has organized group orders, **When** they view the dashboard, **Then** they see a list of their orders with status indicators
3. **Given** a user participating in group orders, **When** they view the dashboard, **Then** they see their participations with order status and quantity
4. **Given** an unauthenticated visitor, **When** they try to access `/dashboard`, **Then** they are redirected to the login page

---

### User Story 3 - Database Schema Deployment (Priority: P1)

The platform needs a robust database structure to store users, group orders, participations, reviews, and notifications with proper security policies.

**Why this priority**: Without the database schema, no data can be persisted. This is the foundation layer that enables all other features.

**Independent Test**: Can be tested by running the SQL migration and verifying all tables are created with proper constraints, indexes, and RLS policies.

**Acceptance Scenarios**:

1. **Given** the Supabase project, **When** the migration is applied, **Then** all 5 tables (profiles, group_orders, participations, reviews, notifications) are created
2. **Given** a new user signup in auth.users, **When** the trigger fires, **Then** a corresponding profile row is automatically created
3. **Given** RLS is enabled, **When** a user queries group_orders, **Then** they only see non-draft orders or their own drafts
4. **Given** a participation is added, **When** saved, **Then** the group_order.current_quantity is automatically updated

---

### User Story 4 - Astro Hybrid Mode Configuration (Priority: P2)

The development team needs Astro configured in hybrid mode to support server-rendered dashboard pages while keeping existing content pages static for optimal performance.

**Why this priority**: Enables the technical capability for SSR pages without degrading existing static site performance. Required for auth and dynamic features.

**Independent Test**: Can be tested by building the site and verifying static pages generate HTML files while dynamic pages (dashboard, auth) are server-rendered.

**Acceptance Scenarios**:

1. **Given** the hybrid configuration, **When** building the site, **Then** existing content pages remain static (HTML files generated)
2. **Given** a page with `export const prerender = false`, **When** requested, **Then** it is server-rendered on each request
3. **Given** Pagefind integration, **When** building in hybrid mode, **Then** search functionality continues to work for static pages
4. **Given** the Keystatic CMS mode, **When** `KEYSTATIC_CMS=true`, **Then** CMS admin interface remains accessible

---

### User Story 5 - Supabase Client Integration (Priority: P2)

Frontend and server-side code need properly configured Supabase clients to interact with the database securely.

**Why this priority**: The Supabase client is the bridge between frontend/backend code and the database. Required for all data operations.

**Independent Test**: Can be tested by importing the client and making a simple query to verify connection and type safety.

**Acceptance Scenarios**:

1. **Given** server-side code with AstroCookies, **When** creating a server client, **Then** session is properly managed via httpOnly cookies
2. **Given** a React component, **When** creating a browser client, **Then** session is managed via localStorage
3. **Given** missing environment variables, **When** importing the client, **Then** a clear error message is thrown at startup
4. **Given** the TypeScript types, **When** querying tables, **Then** IDE provides autocomplete for table names and columns

---

### Edge Cases

- What happens when a user's session expires mid-action? System should gracefully redirect to login with a return URL.
- How does the system handle database connection failures? Display user-friendly error message without exposing technical details.
- What if the magic link email is delayed beyond 1 hour? User can request a new link; expired tokens are rejected.
- What happens when a user tries to access a page during migration? Database connection error should show maintenance message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users via Magic Link (passwordless email login)
- **FR-002**: System MUST create a user profile automatically when a new user signs up
- **FR-003**: Users MUST be able to view their profile on the dashboard
- **FR-004**: Users MUST be able to see their organized group orders on the dashboard
- **FR-005**: Users MUST be able to see their participations in group orders on the dashboard
- **FR-006**: System MUST redirect unauthenticated users from protected routes to login
- **FR-007**: System MUST persist user sessions via secure httpOnly cookies with 7-day expiration
- **FR-008**: System MUST enforce Row Level Security on all database tables
- **FR-009**: System MUST support hybrid output mode (static content + SSR dashboard)
- **FR-010**: System MUST maintain Pagefind search functionality for static content
- **FR-011**: System MUST provide TypeScript types for all database tables
- **FR-012**: System MUST automatically update group order quantities when participations change
- **FR-013**: System MUST rate-limit Magic Link requests to 1 per 5 minutes per email address
- **FR-014**: System MUST validate username uniqueness in real-time during profile editing
- **FR-015**: System MUST require profile completion (country, display_name) only when user attempts to join a group order

### Key Entities

- **Profile**: User identity and trust information (id, username, display_name, country, locale, trust_score [incremented per completed group order], verified_at)
- **Group Order**: A collective purchase organized by a user (organizer, product details, pricing in KRW, quantity constraints, status workflow, deadline)
- **Participation**: A user's commitment to a group order (quantity, shipping address, payment status)
- **Review**: User feedback for completed orders (rating 1-5, comment)
- **Notification**: System messages to users (type, title, body, read status)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the login flow (email submission to dashboard access) in under 60 seconds after receiving the magic link
- **SC-002**: Dashboard page loads completely in under 2 seconds on standard connections
- **SC-003**: All RLS policies pass security audit (no unauthorized data access)
- **SC-004**: Existing static pages maintain Lighthouse performance score of 90+
- **SC-005**: 100% of database operations are type-safe (no TypeScript errors)
- **SC-006**: Session persistence works across browser restarts (user stays logged in)
- **SC-007**: Mobile users (375px+ viewport) can fully use all authentication and dashboard features
- **SC-008**: Build process completes successfully with 0 TypeScript errors

## Assumptions

- Supabase project is already created and URL/Anon Key are available
- Magic Link email delivery is handled by Supabase's built-in email service
- Users have access to their email to complete authentication
- Default locale is Spanish (es) with Portuguese (pt) as secondary
- Target countries for group orders are LATAM: MX, AR, CL, BR, CO, PE
- Platform fee is fixed at 5% for initial launch
- Prices are stored in KRW (Korean Won) for consistency with Korean suppliers
