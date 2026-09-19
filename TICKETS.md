# TICKETS — AI Governance Framework v0.1

> Fase 2 de METODOLOGIA_FASES.md. Fuente local del desglose para el repo
> `S2A2-Dynamics/ai-governance` (equipo < 3 personas); los tickets se migrarán 1:1 a GitHub
> Issues con las mismas etiquetas de Epic cuando se inicie su ejecución operativa.

## Epic: Infraestructura / DevOps

### T-01 — Crear repo GitHub y registrar submódulo
**Contexto**: PRD §11, dependencia manual bloqueante para todo lo demás.
**Criterios de aceptación**
- [x] Repo `S2A2-Dynamics/ai-governance` creado (público), con `.gitignore` Node estándar
- [x] Submódulo registrado en `00-active/ai-governance/` del repo padre, puntero commiteado
- [x] `.gitignore` del padre ya tiene la excepción (`!00-active/ai-governance`) — verificado tras el primer push real
**Restricciones**: acción sobre recurso compartido — requiere confirmación explícita del usuario antes de ejecutar `gh repo create` (CLAUDE.md). NO crear rama para esto, es setup inicial en `main`.
**Estimación**: XS

### T-02 — Scaffold del monorepo interno (backend + frontend)
**Contexto**: base de carpetas para que T-03+ tengan dónde vivir.
**Criterios de aceptación**
- [x] `backend/` con `package.json`, `tsconfig.json`, Express + TS arrancando en `npm run dev`
- [x] `frontend/` con Vite + React + TS arrancando en `npm run dev`
- [x] `prisma/schema.prisma` en `backend/` con datasource `sqlite` (dev)
- [x] README raíz con instrucciones de arranque local
**Estimación**: S

### T-03 — CI mínimo (lint + typecheck)
**Contexto**: proteger `main` de romper build en repo nuevo.
**Criterios de aceptación**
- [x] GitHub Action que corre `tsc --noEmit` y lint en backend y frontend en cada push
**Estimación**: XS

## Epic: Backend

### T-04 — Schema Prisma completo (PRD §8)
**Contexto**: Organization, AISystem, Risk, Control, Evidence, Incident, IsoDomain + relaciones.
**Criterios de aceptación**
- [x] Todas las entidades de PRD §8 modeladas con `organizationId` en cada una
- [x] Sin tipos nativos de un solo motor (`@db.*`, arrays Postgres) — contrato SDD PRD §15
- [x] Migración inicial aplicada; tablas operativas vacías y catálogos visibles en `npx prisma studio`
- [x] Seed de las 9 áreas de control A.2–A.10 de ISO/IEC 42001 (`IsoDomain`)
**Restricciones / Notas técnicas**: contrato SDD — "SI se migra a Postgres → ENTONCES solo cambia provider/url".
**Estimación**: M

### T-05 — Endpoints AISystem (US-01)
**Criterios de aceptación**
- [x] `POST /api/ai-systems` valida con Zod, crea con `organizationId` fijo
- [x] `GET /api/ai-systems` lista con conteo agregado de riesgos/controles/incidentes
- [x] `GET /api/ai-systems/:id` detalle con riesgos→controles→evidencia + incidentes anidado
- [x] `PATCH /api/ai-systems/:id`
**Estimación**: M

### T-06 — Endpoints Risk + Control con contrato anti-huérfano (US-02, US-03)
**Criterios de aceptación**
- [x] `POST /api/ai-systems/:id/risks` con categoría/severidad validadas por Zod (enum cerrado)
- [x] `POST /api/risks/:id/controls` — **rechaza si no existe el `riskId`** (contrato SDD PRD §15: "NUNCA existe un Control huérfano")
- [x] Test que verifica el rechazo 4xx al intentar crear Control sin Risk válido
**Restricciones**: Skill relevante: `sdd-spec-review`.
**Estimación**: S

### T-07 — Endpoints Evidence + Incident (US-04, US-05)
**Criterios de aceptación**
- [x] `POST /api/controls/:id/evidence` con `type` enum (texto/enlace/archivo), `registeredBy`, `registeredAt` automático
- [x] `POST /api/ai-systems/:id/incidents` con severidad y fechas ocurrencia/resolución
**Estimación**: S

### T-08 — Cálculo de score de madurez (US-06)
**Contexto**: contrato SDD más sensible del proyecto — evitar datos inventados (lección
`bitacora_sesion_previa_puede_contener_datos_inventados`).
**Criterios de aceptación**
- [x] `GET /api/dashboard/maturity` devuelve score 0-100 por cada una de las 9 áreas del Anexo A
- [x] Un dominio sin ningún Control con Evidence registrada devuelve **0**, nunca un valor sintético
- [x] Fórmula documentada en código (comentario corto) : cobertura = controles-con-evidencia / total-controles-del-dominio
- [x] Test unitario: dominio vacío → 0; dominio con 1 control sin evidencia → 0; con evidencia → >0
**Estimación**: M

### T-09 — Export JSON/CSV (US-08, Should Have)
**Criterios de aceptación**
- [x] `GET /api/export?format=json|csv` devuelve el inventario completo aplanado
**Estimación**: S

## Epic: Frontend / Cliente

### T-10 — Listado + alta de AISystem (US-01, US-07)
**Criterios de aceptación**
- [x] Tabla de AISystems con conteo de riesgos/controles/incidentes (consume T-05)
- [x] Formulario de alta (nombre, propósito, provider, gcpProject, status)
**Restricciones**: Skill relevante: `ux-ui-frontend`.
**Estimación**: M

### T-11 — Vista detalle AISystem (US-07)
**Criterios de aceptación**
- [x] Riesgos → Controles → Evidencia anidados en una sola vista
- [x] Incidentes listados aparte, ordenados por fecha
- [x] Formularios inline para añadir Risk/Control/Evidence/Incident sin salir de la vista
**Estimación**: M

### T-12 — Dashboard de madurez (US-06)
**Criterios de aceptación**
- [x] Recharts: gráfico de las 9 áreas del Anexo A con score 0-100
- [x] Dominio en 0 se muestra visualmente distinto a "sin datos" vs "score bajo real" (evitar
  que un 0 por falta de evidencia se lea como "cumplimiento pésimo" sin contexto)
**Estimación**: S

### T-13 — Filtros por severidad/dominio (US-09, Should Have)
**Estimación**: XS

## Epic: Datos — Carga inicial (PRD §11)

### T-14 — Seed de C21V como primer AISystem del inventario
**Contexto**: PRD §11 exige carga manual inicial de los ~10 sistemas de IA de S2A2; no hay
importación automática en v0.1 (US won't-have). C21V es el sistema mejor documentado en
memoria (`memory/projects/c21v.md`, ~36 memorias) — sirve de caso de referencia para validar
que el modelo de datos y el flujo de carga funcionan de punta a punta antes de repetirlo con
el resto.
**Datos conocidos de C21V a cargar (verificar contra `memory/projects/c21v.md` antes de
persistir — no inventar campos)**:
- `name`: "C21V / Centurion"
- `purpose`: asistente conversacional inmobiliario (WhatsApp vía Whapi + web) para Century 21
  Venezuela — captación, calificación de leads, matching de propiedades, integración EspoCRM
- `provider`: Gemini (Vertex AI)
- `gcpProject`: `century21venezuela`
- `status`: activo (`c21v-service`, Cloud Run, `us-central1`)
- Riesgos candidatos a registrar (mínimo 1 por contrato de éxito del PRD): sesgo en matching
  de propiedades, privacidad de datos de leads (teléfono/nombre vía WhatsApp), dependencia de
  AWS RDS MySQL externo vía VPC connector
- Controles/evidencia candidatos: alertas Telegram + healthz ya desplegados (control de
  robustez/operación con evidencia real — commits `068c53d`/`01b7abd`), auditoría de
  resiliencia con Firestore delete-protection+PITR (cerrada 15-sep, evidencia verificable)
**Criterios de aceptación**
- [x] AISystem "C21V / Centurion" creado vía API real (no insert directo en SQLite)
- [x] Al menos 1 Risk, 1 Control y 1 Evidence asociados, con contenido trazable a una memoria
  o commit real (no texto inventado — contrato de éxito del PRD)
- [x] Sirve de humo end-to-end: si esta carga falla, bloquea T-15+ hasta resolver
**Estimación**: S

### T-15 — Carga del resto de sistemas de IA (~9 restantes)
**Contexto**: Zomy, CRMWhapi, Jucar Supremo, Whapi, Whapi-Dashboard, whapi-digest, MIOS,
signal-radar, whapi-lead-engine — todos con componente Gemini/Vertex AI según CLAUDE.md.
**Criterios de aceptación**
- [x] Cada sistema con al menos 1 riesgo, 1 control, 1 evidencia (métrica de éxito PRD §2)
- [x] Datos verificados contra memoria de cada proyecto antes de persistir, no inventados
  (excepción documentada: whapi-lead-engine no tiene memoria dedicada — se cargó con el
  mínimo verificable de CLAUDE.md y purpose/gcpProject marcados explícitamente como no
  verificados, sin inventar detalle; ver BITACORA-2026-09.md)
**Estimación**: L (repetitivo, un ticket por sistema si se prefiere trocear en ejecución)

## Tickets obligatorios GCP — no aplican en v0.1

No hay proyecto GCP propio para ai-governance en v0.1 (SQLite local, sin deploy a Cloud Run
todavía — fuera de alcance PRD §10/§6). Si se decide desplegar en el futuro, reabrir esta
sección con los 6 tickets obligatorios de METODOLOGIA_FASES.md (proyecto GCP, APIs, SA/ADC,
IAM, recursos externos, smoke test).
