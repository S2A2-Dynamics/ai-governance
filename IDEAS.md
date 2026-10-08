# IDEAS — AI Governance Framework

Ver también `docs/ROADMAP.md` (diseño conceptual de mayor alcance, ej. TokenPulse).

## Pendientes de evaluar

- ✅ (18-sep-2026) T-03 completado: CI con lint, typecheck, build y validación Prisma.
- 🔍 (18-sep-2026) Ejecutar T-05: endpoints AISystem con validación Zod.
- (18-sep-2026) Integración TokenPulse como fuente automática de Evidence — ver
  `docs/ROADMAP.md`. Estado: conceptual, sin ticket.
- (18-sep-2026) Exportación de informe de auditoría en PDF para EU AI Act. Estado: backlog.
- (18-sep-2026) Ingesta semi-automática del inventario inicial desde BITACORA/memorias de
  cada proyecto S2A2, con validación humana antes de persistir. Estado: backlog.
- ✅ (21-sep-2026) Manual de usuario HTML descargable (`docs/MANUAL_USO.html`) creado y
  verificado manualmente T-11/T-13 vía Playwright. Sin bugs encontrados.

### 💡 PATCH de Risk/Control para re-importar fichas RGPD
- **Estado**: 💡 Nueva (2026-10-08)
- **Descripción**: `import-ficha-rgpd.ts` es idempotente pero no actualiza riesgos existentes; al corregir un hallazgo (Jucar C4) hubo que cambiar el control con sqlite. Añadir PATCH en la API y que el importador actualice estado/descripción por prefijo `[RGPD Cn]`.
