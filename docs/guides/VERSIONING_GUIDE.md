---
title: OndaCorea - Versioning Guide
version: 1.0.0
status: Approved
owner: "@OndaCorea-team"
created: 2024-11-28
updated: 2024-11-28
---

# Versioning Guide

## Documento Info

| Campo | Valor |
|-------|-------|
| Versión | 1.0.0 |
| Última actualización | 2024-11-28 |
| Autor | OndaCorea Team |
| Estado | Activo |

---

## 1. Semantic Versioning

OndaCorea sigue [Semantic Versioning 2.0.0](https://semver.org/lang/es/) para gestionar versiones del proyecto.

### 1.1 Formato de Versión

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

| Componente | Descripción | Ejemplo |
|------------|-------------|---------|
| **MAJOR** | Cambios incompatibles con versiones anteriores | `2.0.0` |
| **MINOR** | Nueva funcionalidad compatible hacia atrás | `1.1.0` |
| **PATCH** | Correcciones de bugs compatibles | `1.0.1` |
| **PRERELEASE** | Versión de pre-lanzamiento | `1.0.0-alpha.1` |
| **BUILD** | Metadata de build (opcional) | `1.0.0+20241128` |

### 1.2 Cuándo Incrementar

#### MAJOR (X.0.0)
- Cambios en la estructura de URLs que rompen enlaces existentes
- Cambios en el schema de Content Collections que invalidan contenido existente
- Migración a una versión mayor de Astro con breaking changes
- Rediseño completo del sitio

#### MINOR (0.X.0)
- Nueva colección de contenido
- Nuevos componentes o páginas
- Nueva funcionalidad de SEO
- Integración de nuevas herramientas (analytics, ads)
- Mejoras significativas de rendimiento

#### PATCH (0.0.X)
- Corrección de bugs
- Actualizaciones de dependencias menores
- Correcciones de typos en código
- Ajustes de estilos CSS
- Mejoras menores de accesibilidad

### 1.3 Pre-release Tags

| Tag | Uso | Ejemplo |
|-----|-----|---------|
| `alpha` | Desarrollo inicial, inestable | `1.0.0-alpha.1` |
| `beta` | Feature complete, en testing | `1.0.0-beta.1` |
| `rc` | Release candidate, casi listo | `1.0.0-rc.1` |

---

## 2. Git Tags

### 2.1 Convención de Nombres

```bash
# Versiones de release
v1.0.0
v1.1.0
v2.0.0

# Pre-releases
v1.0.0-alpha.1
v1.0.0-beta.2
v1.0.0-rc.1

# Hotfixes (después del release)
v1.0.1
v1.0.2
```

### 2.2 Crear Tags

```bash
# Tag anotado (recomendado para releases)
git tag -a v1.0.0 -m "Release v1.0.0 - Descripción breve"

# Ver tags existentes
git tag -l "v1.*"

# Push de un tag específico
git push origin v1.0.0

# Push de todos los tags
git push origin --tags
```

### 2.3 Eliminar Tags (Solo en Emergencias)

```bash
# Eliminar tag local
git tag -d v1.0.0

# Eliminar tag remoto
git push origin --delete v1.0.0
```

---

## 3. Release Process

### 3.1 Flujo de Release

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Develop   │────▶│   Release   │────▶│    Main     │
│   Branch    │     │   Branch    │     │   (Prod)    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                    │
       │                   ▼                    │
       │            ┌─────────────┐             │
       │            │  QA/Testing │             │
       │            └─────────────┘             │
       │                   │                    │
       │                   ▼                    │
       │            ┌─────────────┐             │
       │            │   Hotfix    │◀────────────┘
       │            └─────────────┘
       │                   │
       └───────────────────┘
```

### 3.2 Checklist de Release

#### Pre-Release

- [ ] Todos los PRs del milestone están mergeados
- [ ] Todas las pruebas pasan (`pnpm build`)
- [ ] CHANGELOG.md actualizado
- [ ] Versión actualizada en `package.json`
- [ ] Documentación actualizada si es necesario
- [ ] Review de SEO (meta tags, sitemap)
- [ ] Lighthouse score > 90 en todas las categorías

#### Durante Release

- [ ] Crear branch de release: `release/vX.Y.Z`
- [ ] Última revisión de cambios
- [ ] Merge a main
- [ ] Crear tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
- [ ] Push tag: `git push origin vX.Y.Z`
- [ ] Verificar deploy en Cloudflare Pages

#### Post-Release

- [ ] Verificar sitio en producción
- [ ] Crear GitHub Release con notas
- [ ] Anunciar release (si es significativo)
- [ ] Merge release branch de vuelta a develop
- [ ] Eliminar branch de release

### 3.3 Comandos de Release

```bash
# 1. Asegurar que main está actualizado
git checkout main
git pull origin main

# 2. Crear branch de release
git checkout -b release/v1.1.0

# 3. Actualizar versión en package.json
# (editar manualmente o usar npm version)

# 4. Actualizar CHANGELOG.md
# (agregar entrada para la nueva versión)

# 5. Commit de release
git add package.json CHANGELOG.md
git commit -m "chore(release): prepare v1.1.0"

# 6. Merge a main
git checkout main
git merge release/v1.1.0 --no-ff -m "chore(release): v1.1.0"

# 7. Crear tag
git tag -a v1.1.0 -m "Release v1.1.0

- Nueva funcionalidad X
- Mejora en Y
- Corrección de bug Z"

# 8. Push
git push origin main
git push origin v1.1.0

# 9. Cleanup
git branch -d release/v1.1.0
```

---

## 4. CHANGELOG Management

### 4.1 Formato del CHANGELOG

Seguimos el formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/):

```markdown
# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Added
- Nueva funcionalidad pendiente de release

## [1.1.0] - 2024-12-15

### Added
- Componente de compartir en redes sociales
- Página de búsqueda

### Changed
- Diseño del header mejorado

### Fixed
- Error en el cálculo de tiempo de lectura

## [1.0.0] - 2024-11-28

### Added
- Lanzamiento inicial
- Content Collections para dramas, kpop, noticias, guías
- Sistema de SEO completo
- Layouts base y de artículo
```

### 4.2 Categorías de Cambios

| Categoría | Descripción | Icono sugerido |
|-----------|-------------|----------------|
| **Added** | Nuevas funcionalidades | :sparkles: |
| **Changed** | Cambios en funcionalidad existente | :recycle: |
| **Deprecated** | Funcionalidad que será removida | :warning: |
| **Removed** | Funcionalidad eliminada | :fire: |
| **Fixed** | Correcciones de bugs | :bug: |
| **Security** | Correcciones de vulnerabilidades | :lock: |

### 4.3 Buenas Prácticas

1. **Mantener [Unreleased]** siempre arriba
2. **Escribir para humanos**, no para máquinas
3. **Una entrada por cambio significativo**
4. **Incluir links a PRs/Issues** cuando sea relevante
5. **Usar verbos en pasado**: "Added", "Fixed", "Changed"
6. **Agrupar cambios** por categoría, luego por área

---

## 5. Branch Strategy para Releases

### 5.1 Branches Principales

| Branch | Propósito | Protección |
|--------|-----------|------------|
| `main` | Producción | Protected, require PR |
| `develop` | Desarrollo activo | Protected, require PR |

### 5.2 Branches de Soporte

| Patrón | Propósito | Ejemplo |
|--------|-----------|---------|
| `release/vX.Y.Z` | Preparación de release | `release/v1.1.0` |
| `hotfix/descripcion` | Correcciones urgentes | `hotfix/seo-canonical` |

### 5.3 Flujo de Hotfix

```bash
# 1. Crear branch desde main
git checkout main
git checkout -b hotfix/fix-critical-bug

# 2. Hacer el fix
# ... editar archivos ...

# 3. Commit
git commit -m "fix(seo): correct canonical URL generation"

# 4. Actualizar version (patch)
# Editar package.json: 1.0.0 -> 1.0.1

# 5. Commit de versión
git commit -m "chore(release): bump to v1.0.1"

# 6. Merge a main
git checkout main
git merge hotfix/fix-critical-bug --no-ff

# 7. Tag
git tag -a v1.0.1 -m "Hotfix v1.0.1 - Fix canonical URL"

# 8. Push
git push origin main
git push origin v1.0.1

# 9. Merge a develop también
git checkout develop
git merge main

# 10. Cleanup
git branch -d hotfix/fix-critical-bug
```

---

## 6. Versionado de Contenido

### 6.1 Contenido No Sigue SemVer

El contenido (artículos MDX) no sigue versionado semántico. En su lugar:

- Cada artículo tiene `pubDate` y opcionalmente `updatedDate`
- Los cambios de contenido se trackean mediante commits regulares
- No se crean tags específicos para cambios de contenido

### 6.2 Versionado del Schema

Cambios en `src/content/config.ts` SÍ afectan el versionado:

| Cambio | Impacto |
|--------|---------|
| Agregar campo opcional | MINOR |
| Agregar campo requerido | MAJOR |
| Cambiar tipo de campo | MAJOR |
| Agregar nueva colección | MINOR |
| Eliminar colección | MAJOR |

---

## 7. GitHub Releases

### 7.1 Crear Release en GitHub

1. Ir a Releases en el repositorio
2. Click "Draft a new release"
3. Seleccionar el tag creado
4. Título: `v1.1.0 - Nombre descriptivo`
5. Descripción: Copiar del CHANGELOG
6. Marcar como pre-release si aplica
7. Publish release

### 7.2 Template de Release Notes

```markdown
## Highlights

Breve descripción de los cambios más importantes de este release.

## What's Changed

### New Features
- Feature 1 (#PR)
- Feature 2 (#PR)

### Improvements
- Improvement 1 (#PR)

### Bug Fixes
- Fix 1 (#PR)

## Breaking Changes

Ninguno en este release.

## Upgrade Notes

Instrucciones especiales para actualizar (si aplica).

## Full Changelog

https://github.com/Prometheus-P/ondacorea/compare/v1.0.0...v1.1.0
```

---

## 8. Automatización (Futuro)

### 8.1 GitHub Actions para Releases

```yaml
# .github/workflows/release.yml (ejemplo futuro)
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

### 8.2 Changelog Automático

Herramientas a considerar:
- **conventional-changelog**: Genera CHANGELOG desde commits
- **semantic-release**: Automatiza versionado completo
- **release-please**: Alternativa de Google

---

## 9. Versiones Históricas

### 9.1 Historial de Versiones Mayores

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| v1.0.0 | 2024-11-28 | Release inicial - Astro SSG migration |
| v0.4.0 | Legacy | Última versión FastAPI/Next.js (branch: legacy-fastapi-v0.4.0) |

### 9.2 Deprecation Policy

1. Funcionalidades se marcan `Deprecated` en un release MINOR
2. Se mantienen por al menos 1 release MINOR adicional
3. Se eliminan en el siguiente release MAJOR
4. Siempre documentar alternativas en el CHANGELOG

---

## 10. Troubleshooting

### 10.1 Tag Creado en Commit Incorrecto

```bash
# Eliminar tag local
git tag -d v1.0.0

# Eliminar tag remoto
git push origin --delete v1.0.0

# Crear tag en commit correcto
git tag -a v1.0.0 <commit-hash> -m "Release v1.0.0"

# Push del nuevo tag
git push origin v1.0.0
```

### 10.2 Olvidé Actualizar package.json

```bash
# Si ya se creó el tag, mejor dejarlo y corregir en siguiente release
# O, si es inmediato:
git tag -d v1.0.0
git push origin --delete v1.0.0

# Hacer el fix
npm version patch --no-git-tag-version  # Si es patch
git commit -am "chore: fix version in package.json"

# Recrear tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags
```

### 10.3 Conflicto en Merge de Release

```bash
# Resolver conflictos manualmente
git checkout main
git merge release/v1.0.0

# Si hay conflictos
# 1. Resolver en los archivos
# 2. git add <archivos>
# 3. git commit

# Continuar con el proceso de release
```

---

## Quick Reference

### Comandos Frecuentes

```bash
# Ver versión actual
cat package.json | grep version

# Ver todos los tags
git tag -l

# Ver tags con mensaje
git tag -n

# Crear release rápido (después de merge a main)
git tag -a v1.0.0 -m "Release v1.0.0" && git push origin v1.0.0

# Ver diferencias entre versiones
git diff v1.0.0..v1.1.0

# Ver commits entre versiones
git log v1.0.0..v1.1.0 --oneline
```

### Checklist Rápido de Release

```
[ ] Tests pasan (pnpm build)
[ ] CHANGELOG actualizado
[ ] package.json version actualizada
[ ] PR mergeado a main
[ ] Tag creado y pusheado
[ ] GitHub Release creado
[ ] Sitio verificado en producción
```

---

## Referencias

- [Semantic Versioning 2.0.0](https://semver.org/lang/es/)
- [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)
- [Git Tagging Basics](https://git-scm.com/book/en/v2/Git-Basics-Tagging)

---

*Documento mantenido por el equipo de OndaCorea.*
