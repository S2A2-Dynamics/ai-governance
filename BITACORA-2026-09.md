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
- [ ] Ejecutar T-03: CI mínimo de lint y typecheck.
