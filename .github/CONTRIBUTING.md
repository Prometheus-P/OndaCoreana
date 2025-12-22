# Contributing to Onda Coreana

Thank you for your interest in contributing to Onda Coreana!

## Before You Start

This is a proprietary project. Please contact **parkdavid31@gmail.com** before making any contributions.

## Development Guidelines

### Branch Strategy

- `main` - Production branch (protected)
- `staging` - Pre-production testing
- `feat/*` - Feature branches
- `fix/*` - Bug fix branches

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass locally (`pnpm test`)
4. Run type checking (`pnpm check`)
5. Build the project (`pnpm build`)
6. Open a PR against `main`
7. Wait for review and CI checks to pass

### Code Standards

- Use TypeScript for all new code
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features

### Commit Message Format

```
type: subject

body (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Testing

```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run type checking
pnpm check
```

## Contact

For questions or licensing inquiries: **parkdavid31@gmail.com**
