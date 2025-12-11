# Quickstart: Astro MVP Polish

**Feature**: 004-astro-mvp-polish
**Date**: 2025-12-12

## Prerequisites

- Node.js 20.x
- pnpm 9.x
- Git

## Setup

```bash
# 1. Checkout feature branch
git checkout 004-astro-mvp-polish

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev

# 4. Open browser
open http://localhost:4321
```

## Files to Modify

### P1: Brand Consistency

| File | Action | Changes |
|------|--------|---------|
| `src/layouts/BaseLayout.astro` | MODIFY | Replace "HallyuLatino" → "OndaCoreana" (Header + Footer) |
| `src/components/seo/JsonLd.astro` | MODIFY | Update Organization name |

### P2: Legal Pages

| File | Action | Changes |
|------|--------|---------|
| `src/pages/privacidad.astro` | CREATE | Privacy Policy page |
| `src/pages/terminos.astro` | CREATE | Terms of Use page |

### P3: Newsletter Form

| File | Action | Changes |
|------|--------|---------|
| `src/pages/index.astro` | MODIFY | Add form submission handler |

## Verification Steps

### After P1 Changes

```bash
# Build and check for errors
pnpm build

# Verify brand in output
grep -r "OndaCoreana" dist/index.html
grep -r "HallyuLatino" dist/  # Should return nothing
```

### After P2 Changes

```bash
# Verify pages exist
curl -I http://localhost:4321/privacidad  # Should return 200
curl -I http://localhost:4321/terminos    # Should return 200

# Check sitemap includes new pages
grep "privacidad" dist/sitemap-index.xml
grep "terminos" dist/sitemap-index.xml
```

### After P3 Changes

1. Open http://localhost:4321
2. Scroll to newsletter section
3. Enter email and click "Suscribirse"
4. Verify success message appears
5. Verify form resets on page reload

## Testing

```bash
# Run E2E tests
pnpm test:e2e

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Common Issues

### Issue: "HallyuLatino" still appears
**Solution**: Check both Header and Footer sections in BaseLayout.astro. Also check JsonLd.astro for Organization schema.

### Issue: Legal pages return 404
**Solution**: Ensure files are named exactly `privacidad.astro` and `terminos.astro` in `src/pages/`.

### Issue: Newsletter form submits to server
**Solution**: Ensure `event.preventDefault()` is called in the form submit handler.

## Deployment

After all changes are complete:

```bash
# Commit changes
git add .
git commit -m "feat: brand consistency, legal pages, newsletter UX"

# Push to trigger CI
git push origin 004-astro-mvp-polish

# Create PR
gh pr create --title "feat: Astro MVP Polish" --body "..."
```
