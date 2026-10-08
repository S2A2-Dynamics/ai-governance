# Bitácora — ai-governance — Octubre 2026

## 2026-10-06/08 — Importador de «Ficha RGPD del agente» + carga de 8 sistemas

**Estado al inicio**: v0.1 completa (T-01..T-13), sin fuente automática de riesgos.

### Qué se hizo
- `backend/src/import/fichaRgpd.ts` (Zod + `planImport` + `importFicha` vía API REST, sin Prisma) y CLI `backend/scripts/import-ficha-rgpd.ts` (`--dry-run`, `--api`); 3 tests (8/8 suite), typecheck y lint limpios. README §Importar fichas.
- Importadas en `dev.db` local las fichas de 8 proyectos (7 AISystem existentes enlazados por nombre + Xanadu nuevo): 101 riesgos `[RGPD Cn]`, 49 evidencias; re-importación idempotente.
- 2026-10-08: control C4 de Jucar → `verificado` con 3 evidencias (IDOR corregido y desplegado).

### Decisiones tomadas
- **Solo `pass` genera Evidence** (un `partial` cita sus rutas en el riesgo): el dashboard puntúa cualquier control con evidencia y no debe inflarse (contrato PRD §15).
- **`verificado` nunca lo pone el importador**: exige test/smoke.

### Pendiente / Próximos pasos
- [ ] PATCH de Risk/Control en la API (hoy re-importar no actualiza; C4 se cambió con sqlite a mano)
