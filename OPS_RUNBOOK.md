# OPS RUNBOOK: RSS Ingest Drafts

## Cómo ejecutar el ingest
- Asegúrate de tener las dependencias instaladas (`pnpm install`).
- Ejecuta el pipeline manualmente con:
  - `pnpm ingest:rss`
- El comando usa `fetch` y `jsdom` para procesar RSS. Si un feed está caído, el proceso registra una advertencia y continúa con las demás fuentes.

## Dónde aparecen los borradores
- Los borradores se guardan en `data/drafts/YYYY-MM-DD/` como archivos `.json` individuales.
- Cada archivo contiene un `DraftItem` con campos normalizados (`id`, `title`, `summary`, `source.itemUrl`, `category`, `publishedAt`, etc.).

## Checklist operativo diario
- [ ] Ejecutar `pnpm ingest:rss` una vez al día (idealmente en la mañana, horario local).
- [ ] Confirmar que se crean nuevos archivos en `data/drafts/<hoy>/` y que los títulos y URLs se ven correctos.
- [ ] Revisar advertencias en la salida: si un feed falla, anotarlo y volver a intentar más tarde.
- [ ] Validar que no se generen duplicados obvios (mismo título o URL) en la carpeta del día.
- [ ] Si un feed cambia de URL o formato, actualiza `scripts/ingest/sources.ts` y repite la ejecución.
