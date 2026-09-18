# BITACORA — AI Governance Framework

## 2026-09-18 — Arranque del proyecto

- Decisión de stack y modelo de datos tomada y documentada en
  `memory/projects/ai_governance_framework.md`: Prisma + SQLite (dev) → Postgres-ready,
  descartando Firestore por el perfil relacional/agregado del dominio.
- Decisión de repo: nuevo repo GitHub `S2A2-Dynamics/ai-governance`, **público**, como
  submódulo de `s2a2-projects` en `00-active/ai-governance/` (misma convención que
  C21V, Zomy, CRMWhapi).
- PRD v0.1 escrito completo (`PRD.md`) con las 15 secciones de METODOLOGIA Fase 1.
- `docs/ROADMAP.md` creado con el diseño conceptual de TokenPulse como "AI Control
  Plane" — deliberadamente **no implementado**: no existe hoy código/API de TokenPulse
  en el workspace contra la cual integrar, y construir contra un contrato inventado
  violaría el umbral de certeza ≥95% de CLAUDE.md. Se documenta como idea de arquitectura
  a revisitar cuando TokenPulse exponga un contrato real.
- **Pendiente**: creación efectiva del repo GitHub — bloqueada por el clasificador de
  auto-mode ("Create Public Surface"), requiere que el usuario ejecute el comando o
  apruebe explícitamente el permiso. Comando preparado:
  `gh repo create S2A2-Dynamics/ai-governance --public --description "..."`.
