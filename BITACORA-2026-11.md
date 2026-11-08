# Bitácora — ai-governance — Noviembre 2026

## 2026-11-08 — Módulo de Transparencia y Conformidad EU AI Act (Art. 50) + Ingesta de 4 Sistemas

**Estado al inicio**: v0.1 con importador RGPD operativo, sin soporte nativo para el Reglamento Europeo de IA (AI Act).

### Qué se hizo
- Implementado el esquema de validación Zod `aiAct.ts` con clasificación de riesgo (mínimo, específico de transparencia, alto riesgo), contratos de evidencia PRD §15 y 6 comprobaciones normativas del Artículo 50 (`AIA-50.1` a `AIA-50.5` y `AIA-GRD`).
- Creado el importador REST idempotente `fichaAiAct.ts` con prefijo `[AI-ACT AIA-*]` mapeado a dominios ISO/IEC 42001 (A.8, A.5, A.9, A.10). 3 tests nuevos con Node native test runner (11/11 tests PASS).
- Desarrollado el generador de documentos `aiActDocument.ts` (exportación dual a Markdown y HTML print-ready corporativo para clientes B2B / desplegadores) y CLI `scripts/import-ficha-ai-act.ts`.
- Generadas las Fichas de Transparencia y Conformidad oficiales (JSON, Markdown y HTML) para los 4 productos de S2A2 Dynamics: KlientIQ, Trelivo OS / Xanadú, S2A2Bot y Centurion C21V.
- Ingestadas las 4 fichas en la base de datos de producción local `dev.db` mediante el script `scripts/import-all-ai-act.ts` con verificación de idempotencia.
- Creado el Skill #125 (`ai-act-transparency`) en `99-config/skills/ai-act-transparency/SKILL.md` con argumentario de venta consultiva B2B.

### Decisiones tomadas
- **Contrato de Transparencia B2B**: Distinguir claramente el rol de Proveedor (S2A2) frente al Desplegador (Cliente corporativo), entregando una guía operativa que blinda legalmente al cliente ante la AEPD y el AI Office.
- **Idempotencia Estricta**: Los riesgos y controles se deduplican por prefijo `[AI-ACT AIA-*]`, evitando inflar métricas de madurez en re-importaciones.

### Pendiente / Próximos pasos
- [ ] Incorporar pestaña de visualización de Fichas AI Act en el dashboard del frontend Vite/React.
