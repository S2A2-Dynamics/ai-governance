# BITACORA — AI Governance Framework — 2026-09

## 2026-09-18 — Arranque del proyecto

- Stack decidido: Prisma + SQLite (dev), compatible con futura migración a Postgres.
- Repo público definido como `S2A2-Dynamics/ai-governance`, submódulo del workspace.
- PRD v0.1 y `docs/ROADMAP.md` creados; TokenPulse queda conceptual hasta disponer de contrato real.
- Pendiente inicial: crear el remoto y ejecutar T-01/T-02 tras autorización explícita.

## 2026-09-18 — Repositorio público y scaffold T-01/T-02

**Estado al inicio**: remoto y submódulo creados; TICKETS sin seguimiento y scaffold pendiente.

### Qué se hizo
- Se completaron T-01/T-02: Express+TS, React+Vite+TS, Prisma SQLite, README y `.gitignore`.
- Smokes PASS: `/health`, typechecks, build, schema Prisma, auditorías npm y QA desktop/móvil.

### Decisiones tomadas
- **Prisma 6.12.0**: versión fijada para evitar la vulnerabilidad transitiva presente en 6.19.3.

### Pendiente / Próximos pasos
- [x] Ejecutar T-03: CI mínimo de lint y typecheck.

## 2026-09-18 — CI y modelo relacional T-03/T-04

**Estado al inicio**: T-01/T-02 publicados; CI y modelo de datos pendientes.

### Qué se hizo
- CI con lint, typecheck, build y validación Prisma; schema, migración y seed reproducibles.
- QA PASS: 9 áreas A.2–A.10, tablas operativas vacías, auditorías npm y frontend responsive.

### Decisiones tomadas
- **Taxonomía normativa**: se corrigió “12 dominios” a las 9 áreas reales del Anexo A.

### Aprendizajes / Errores
- Prisma 6.12 necesitó un SQLite vacío precreado en este volumen local; migrar/deploy funciona después.

### Pendiente / Próximos pasos
- [ ] Ejecutar T-05: endpoints AISystem con validación Zod.
