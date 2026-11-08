# IDEAS — AI Governance Framework

Ver también `docs/ROADMAP.md` (diseño conceptual de mayor alcance, ej. TokenPulse).

## Pendientes de evaluar

- ✅ (18-sep-2026) T-03 completado: CI con lint, typecheck, build y validación Prisma.
- 🔍 (18-sep-2026) Ejecutar T-05: endpoints AISystem con validación Zod.
- (18-sep-2026) Integración TokenPulse como fuente automática de Evidence — ver
  `docs/ROADMAP.md`. Estado: conceptual, sin ticket.
- ✅ (08-nov-2026) Módulo de transparencia y exportación de Ficha Técnica de Auditoría HTML/PDF para EU AI Act (Art. 50) completado con generador y CLI.
- (18-sep-2026) Ingesta semi-automática del inventario inicial desde BITACORA/memorias de
  cada proyecto S2A2, con validación humana antes de persistir. Estado: backlog.
- ✅ (21-sep-2026) Manual de usuario HTML descargable (`docs/MANUAL_USO.html`) creado y
  verificado manualmente T-11/T-13 vía Playwright. Sin bugs encontrados.

### 💡 Visualizador y exportador interactivo de Fichas AI Act en Frontend
- **Estado**: 💡 Nueva (2026-11-08)
- **Descripción**: Permitir que el dashboard en React/Vite muestre la Ficha Técnica de Transparencia de cada sistema con vista previa interactiva y botón de descarga directa de PDF para entregar al cliente corporativo.

### 💡 PATCH de Risk/Control para re-importar fichas RGPD
- **Estado**: 💡 Nueva (2026-10-08)
- **Descripción**: `import-ficha-rgpd.ts` es idempotente pero no actualiza riesgos existentes; al corregir un hallazgo (Jucar C4) hubo que cambiar el control con sqlite. Añadir PATCH en la API y que el importador actualice estado/descripción por prefijo `[RGPD Cn]`.
