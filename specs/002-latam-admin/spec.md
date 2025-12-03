# Feature Specification: LatAm Content Admin & AI Design Assistant

**Feature Branch**: `002-latam-admin`  
**Created**: 2024-12-03  
**Status**: Draft  
**Input**: Admin console for OndaCoreana to publish LatAm-relevant content with AI design support

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Access Control (Priority: P1)

Admins can unlock the console with a shared access code and persist the session.

**Why this priority**: Blocks all other stories; prevents unauthorized edits.

**Independent Test**: Access code prompt rejects invalid codes, accepts valid, remembers session, supports logout.

**Acceptance Scenarios**:

1. **Given** no session, **When** an invalid code is submitted, **Then** the admin view is denied with an error state.
2. **Given** no session, **When** a valid code is submitted, **Then** the user is redirected to `/admin/features` and the session persists on refresh.
3. **Given** an active session, **When** logout is clicked, **Then** the session clears and gate reappears.

---

### User Story 2 - Feature Composer (Priority: P1)

Admins can create/edit Spanish-first feature pages targeted to LatAm audiences with live preview and export.

**Why this priority**: Core value—publishing new content.

**Independent Test**: Form validates required fields, preview updates live, and export produces valid MDX.

**Acceptance Scenarios**:

1. **Given** an empty form, **When** required fields are missing, **Then** validation errors appear and export is disabled.
2. **Given** a complete form, **When** preview is viewed, **Then** content renders with hero image, category, tags, and LatAm hooks.
3. **Given** a completed feature, **When** export is clicked, **Then** an MDX file with frontmatter and body downloads/prints for commit.

---

### User Story 3 - AI Design Assistant (Priority: P2)

Admins can ask an AI agent to suggest layout, palette, and localized copy; previews apply suggestions safely.

**Why this priority**: Speeds production and improves quality.

**Independent Test**: AI call is made with form data, returns design tokens/copy, preview updates; failures fall back to defaults.

**Acceptance Scenarios**:

1. **Given** a filled form, **When** “Generate with AI” is clicked, **Then** an API request is sent and tokens apply to preview on success.
2. **Given** an API error/timeout, **When** AI is invoked, **Then** the user sees an error and the preview reverts to default styling.

---

### User Story 4 - LatAm Relevance Guidance (Priority: P2)

Admins receive prompts and presets to ensure content resonates with LatAm readers.

**Why this priority**: Ensures cultural relevance and engagement.

**Independent Test**: Form enforces/encourages LatAm hooks; preview shows localized CTA and “Para la audiencia latinoamericana” section.

**Acceptance Scenarios**:

1. **Given** a selected country (e.g., MX/CO/CL/AR), **When** guidance is shown, **Then** suggested hooks and examples reflect that country.
2. **Given** no LatAm hook selected, **When** saving/exporting, **Then** the UI requires at least one hook or warns explicitly.

---

### User Story 5 - Publish & SEO (Priority: P3)

Exported features build under `/features/<slug>` with canonical/OG metadata in Spanish.

**Why this priority**: Enables public publication and discovery.

**Independent Test**: Exported MDX builds without errors, renders hero/meta, and list page indexes entries.

**Acceptance Scenarios**:

1. **Given** an exported MDX, **When** `pnpm build` runs, **Then** the page generates at `/features/<slug>.html` with canonical/OG tags and language=es.
2. **Given** multiple features, **When** visiting `/features`, **Then** items can be filtered by country and category.

### Edge Cases

- Invalid or missing access code must not leak admin UI.
- AI endpoint unavailable must not block manual editing/export.
- Hero image missing should show a placeholder without breaking layout.
- Empty LatAm hooks should block publish/export with a clear message.
- Duplicate slugs should be prevented or flagged before export.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admin gate MUST validate `PUBLIC_ADMIN_ACCESS_CODE` and persist session state.
- **FR-002**: Admin MUST create/edit feature content in Spanish with required fields (title, descriptionEs, category, countries[], latamHook[], heroImage).
- **FR-003**: System MUST provide live preview of feature content using site styling.
- **FR-004**: System MUST export feature content as MDX with frontmatter and body compatible with `src/content/features/`.
- **FR-005**: System SHOULD support AI-assisted design/copy with safe fallbacks when AI fails.
- **FR-006**: System MUST enforce LatAm relevance by requiring at least one LatAm hook and showing localized CTA/guidance.
- **FR-007**: System MUST generate SEO metadata (title/description/canonical/OG) for exported features.
- **FR-008**: System MUST route features under `/features/<slug>` and list them at `/features`.

### Key Entities

- **Feature**: slug, title, descriptionEs, category, countries[], latamHook[], heroImage, heroImageAlt, publishDate, author, tags[], blocks, seoMeta.
- **AI Design Suggestion**: palette, typography scale, layout hints, copy suggestions (headline/CTA/hooks), timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin gate rejects 100% invalid codes and accepts valid code within 1 attempt.
- **SC-002**: Feature export produces valid MDX that passes `pnpm build` with zero errors.
- **SC-003**: AI call latency under 3s p95 with graceful fallback on timeout.
- **SC-004**: At least one LatAm hook present in 100% exported features; export blocked otherwise.
- **SC-005**: SEO checks on `/features/*` meet existing SEO E2E assertions (titles, canonicals, OG).
