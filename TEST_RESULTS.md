# TEST_RESULTS.md — ai-governance

> Registro oficial de pruebas ejecutadas.

---

## Suite: Ola tecnica real S2A2 - 2026-09-21
**Fecha**: 2026-09-21
**Ejecutado por**: Codex (automatizado)
**Entorno**: Repositorio local
**Commit**: Working tree sin commit

| ID | Tipo | Comando | Resultado real | Estado |
|----|------|---------|----------------|--------|
| T01 | meta | N/A | Proyecto sin harness de build/test/smoke configurado. | SKIP |

**Resumen**: 0 PASS / 0 FAIL / 1 SKIP / 0 TIMEOUT.

---

## Suite: Backend Unit & Integration Tests (AI Act + RGPD) - 2026-11-08
**Fecha**: 2026-11-08
**Ejecutado por**: Antigravity (pair programming)
**Entorno**: Node.js 22 + SQLite test.db + Prisma
**Comando**: `npm test` (node --test src/**/*.test.ts)

| ID | Test | Resultado | Estado |
|----|------|-----------|--------|
| T01 | fichaAiActSchema: contratos PRD §15 | PASS | ✅ |
| T02 | planImportAiAct: omite na y genera controles | PASS | ✅ |
| T03 | importFichaAiAct: crea AISystem→Risk→Control→Evidence e idempotencia | PASS | ✅ |
| T04 | fichaSchema RGPD: contratos PRD §15 | PASS | ✅ |
| T05 | planImport RGPD: omite na y genera controles | PASS | ✅ |
| T06 | importFicha RGPD: crea entidades e idempotencia | PASS | ✅ |
| T07 | POST /api/risks/:id/controls 4xx | PASS | ✅ |
| T08 | GET /api/dashboard/maturity | PASS | ✅ |
| T09 | POST /api/controls/:id/evidence 4xx | PASS | ✅ |
| T10 | GET /api/export (JSON y CSV) | PASS | ✅ |
| T11 | POST /api/ai-systems/:id/incidents 4xx | PASS | ✅ |

**Resumen**: 11 PASS / 0 FAIL / 0 SKIP / 0 TIMEOUT. Cobertura completa de esquemas e importación AI Act / RGPD.


---

## Suite: Ola tecnica real S2A2 - 2026-10-26
**Fecha**: 2026-10-26
**Ejecutado por**: Codex (automatizado)
**Entorno**: Repositorio local
**Commit**: Working tree sin commit

| ID | Tipo | Comando | Resultado real | Estado |
|----|------|---------|----------------|--------|
| T01 | meta | N/A | Proyecto sin harness de build/test/smoke configurado. | SKIP |

**Resumen**: 0 PASS / 0 FAIL / 1 SKIP / 0 TIMEOUT.

---

## Suite: Backend Unit & Integration Tests (AI Act + RGPD) - 2026-11-08
**Fecha**: 2026-11-08
**Ejecutado por**: Antigravity (pair programming)
**Entorno**: Node.js 22 + SQLite test.db + Prisma
**Comando**: `npm test` (node --test src/**/*.test.ts)

| ID | Test | Resultado | Estado |
|----|------|-----------|--------|
| T01 | fichaAiActSchema: contratos PRD §15 | PASS | ✅ |
| T02 | planImportAiAct: omite na y genera controles | PASS | ✅ |
| T03 | importFichaAiAct: crea AISystem→Risk→Control→Evidence e idempotencia | PASS | ✅ |
| T04 | fichaSchema RGPD: contratos PRD §15 | PASS | ✅ |
| T05 | planImport RGPD: omite na y genera controles | PASS | ✅ |
| T06 | importFicha RGPD: crea entidades e idempotencia | PASS | ✅ |
| T07 | POST /api/risks/:id/controls 4xx | PASS | ✅ |
| T08 | GET /api/dashboard/maturity | PASS | ✅ |
| T09 | POST /api/controls/:id/evidence 4xx | PASS | ✅ |
| T10 | GET /api/export (JSON y CSV) | PASS | ✅ |
| T11 | POST /api/ai-systems/:id/incidents 4xx | PASS | ✅ |

**Resumen**: 11 PASS / 0 FAIL / 0 SKIP / 0 TIMEOUT. Cobertura completa de esquemas e importación AI Act / RGPD.


---

## Suite: Ola tecnica real S2A2 - 2026-11-02
**Fecha**: 2026-11-02
**Ejecutado por**: Codex (automatizado)
**Entorno**: Repositorio local
**Commit**: Working tree sin commit

| ID | Tipo | Comando | Resultado real | Estado |
|----|------|---------|----------------|--------|
| T01 | meta | N/A | Proyecto sin harness de build/test/smoke configurado. | SKIP |

**Resumen**: 0 PASS / 0 FAIL / 1 SKIP / 0 TIMEOUT.

---

## Suite: Backend Unit & Integration Tests (AI Act + RGPD) - 2026-11-08
**Fecha**: 2026-11-08
**Ejecutado por**: Antigravity (pair programming)
**Entorno**: Node.js 22 + SQLite test.db + Prisma
**Comando**: `npm test` (node --test src/**/*.test.ts)

| ID | Test | Resultado | Estado |
|----|------|-----------|--------|
| T01 | fichaAiActSchema: contratos PRD §15 | PASS | ✅ |
| T02 | planImportAiAct: omite na y genera controles | PASS | ✅ |
| T03 | importFichaAiAct: crea AISystem→Risk→Control→Evidence e idempotencia | PASS | ✅ |
| T04 | fichaSchema RGPD: contratos PRD §15 | PASS | ✅ |
| T05 | planImport RGPD: omite na y genera controles | PASS | ✅ |
| T06 | importFicha RGPD: crea entidades e idempotencia | PASS | ✅ |
| T07 | POST /api/risks/:id/controls 4xx | PASS | ✅ |
| T08 | GET /api/dashboard/maturity | PASS | ✅ |
| T09 | POST /api/controls/:id/evidence 4xx | PASS | ✅ |
| T10 | GET /api/export (JSON y CSV) | PASS | ✅ |
| T11 | POST /api/ai-systems/:id/incidents 4xx | PASS | ✅ |

**Resumen**: 11 PASS / 0 FAIL / 0 SKIP / 0 TIMEOUT. Cobertura completa de esquemas e importación AI Act / RGPD.


