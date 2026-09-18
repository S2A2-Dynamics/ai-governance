# PRD — S2A2Dynamics AI Governance Framework v0.1

> Filosofía del proyecto: **"De la intención a la evidencia"**. No es una plataforma de
> certificación — es un sistema de inventario y gobernanza de sistemas de IA que traduce
> intenciones de cumplimiento (ISO/IEC 42001, EU AI Act, buenas prácticas internas) en
> evidencia verificable y trazable.

## 0. Perfil del cliente

Proyecto interno de S2A2 Dynamics — no hay cliente externo en v0.1. Uso inicial:
inventariar y gobernar los sistemas de IA que S2A2 ya opera en producción para sus
propios clientes (C21V, Zomy, CRMWhapi, Jucar Supremo, Whapi, MIOS, signal-radar, etc.),
todos ellos con componentes Gemini/Vertex AI. Posible oferta a terceros en versiones
futuras (fuera de alcance v0.1).

## 1. Problema

S2A2 opera ~10 sistemas de IA en producción (chatbots, agentes, scoring, clasificación)
sin un inventario centralizado de: qué modelo usa cada uno, qué riesgos tiene, qué
controles mitigan esos riesgos, qué evidencia respalda que el control funciona, y qué
incidentes han ocurrido. Hoy ese conocimiento vive disperso en memorias de Claude Code,
BITACORA.md por proyecto y la cabeza de Aníbal. No hay forma de responder rápido a
"¿qué sistemas de IA tenemos, qué riesgo tiene cada uno y qué evidencia lo prueba?" —
pregunta que EU AI Act y clientes enterprise ya empiezan a exigir.

## 2. Objetivo

Una frase: **Centralizar en un solo sistema el inventario de IA, sus riesgos, controles,
evidencia e incidentes, con un dashboard de madurez en las 9 áreas de control del Anexo A
de ISO/IEC 42001 (A.2–A.10).**

Métrica de éxito v0.1: los ~10 sistemas de IA activos de S2A2 quedan registrados en el
inventario con al menos 1 riesgo, 1 control y 1 evidencia asociada cada uno, y el
dashboard de madurez renderiza un score por dominio sin datos inventados (0 si no hay
evidencia cargada).

## 3. Usuarios

- **Admin/Owner (Aníbal)**: acceso completo, carga y valida evidencia, aprueba controles.
- Un solo tenant (`organizationId` fijo = S2A2 Dynamics) en v0.1, pero todo el modelo de
  datos es multi-tenant-ready para no rehacer el schema si se abre a terceros después.
- Sin roles adicionales en v0.1 (no hay auditor externo ni cliente con acceso de solo
  lectura todavía — ver §10 Fuera de alcance).

## 4. User Stories (v0.1)

**Must Have**
- US-01: Como admin, puedo dar de alta un sistema de IA (AISystem) con nombre, propósito,
  modelo/proveedor (Gemini, Vertex AI, etc.), proyecto GCP asociado y estado (activo/pausado).
- US-02: Como admin, puedo asociar uno o más riesgos (Risk) a un AISystem, con severidad
  y categoría (sesgo, privacidad, seguridad, transparencia, robustez...).
- US-03: Como admin, puedo definir controles (Control) que mitigan un riesgo, con estado
  (planificado/implementado/verificado).
- US-04: Como admin, puedo adjuntar evidencia (Evidence) a un control — texto, enlace o
  archivo — con fecha y quién la registró.
- US-05: Como admin, puedo registrar incidentes (Incident) vinculados a un AISystem.
- US-06: Como admin, veo un dashboard con score de madurez por cada una de las 9 áreas de
  control del Anexo A de ISO/IEC 42001, calculado a partir de cobertura real de
  controles+evidencia (no manual).
- US-07: Como admin, veo un listado/detalle de cada AISystem con sus riesgos, controles,
  evidencia e incidentes agregados en una sola vista.

**Should Have**
- US-08: Exportar el inventario completo a JSON/CSV para auditoría externa.
- US-09: Filtrar el inventario por severidad de riesgo o dominio ISO.

**Won't Have (v0.1)**
- Multi-tenant real con varios clientes (schema lo soporta, feature no se construye).
- Roles/permisos granulares (RBAC) más allá de admin único.
- Integración automática con TokenPulse u otro "AI Control Plane" (ver §7-bis / ROADMAP.md
  — queda como diseño conceptual, no como integración v0.1).
- Certificación formal o generación de informe de auditoría firmado.
- Ingesta automática de telemetría de uso de IA (tokens, coste) desde los proyectos —
  v0.1 es carga manual/curada de evidencia.

## 5. Stack decidido

- **Frontend**: React + TypeScript, Tailwind, Recharts (dashboard de madurez).
- **Backend**: Node.js + TypeScript, REST.
- **ORM/DB**: Prisma + **SQLite** como motor de desarrollo local (cero infraestructura
  nueva, sin Docker), con schema diseñado para ser compatible con PostgreSQL desde el
  día 1 — migración futura solo cambia el `provider` del datasource.
- **Validación**: Zod en los límites de la API (request/response).
- Todas las entidades incluyen `organizationId` (multi-tenant-ready, un solo org en v0.1).

**Justificación (no reabrir en desarrollo)**: se evaluó explícitamente Firestore (patrón
usado en el resto del workspace) y se descartó — el dominio es fuertemente relacional con
agregaciones cruzadas (Risk↔AISystem↔Controls↔Evidence↔Incidents, dashboard de 12
dominios), y Firestore maneja mal ese patrón sin desnormalizar mucho. Detalle completo en
memoria `projects/ai_governance_framework.md`.

## 6. Restricciones

- Repo nuevo bajo `S2A2-Dynamics` en GitHub, público, con submódulo en
  `00-active/ai-governance/` (convención uniforme del monorepo, igual que C21V/Zomy/CRMWhapi).
- No hay LLM embebido en el producto en v0.1 (es un sistema de registro y scoring, no un
  chatbot ni un agente) → no aplica gate FinOps de Gemini ni estimación de coste LLM.
- No hay envío de email en v0.1 → no aplica buzón sender/Migadu.
- SQLite es de un solo escritor concurrente — aceptable para v0.1 (un solo admin), pero
  es una restricción a documentar antes de cualquier acceso multiusuario concurrente real.
- Balance de agencia: no aplica — este proyecto no automatiza una interacción que antes
  tocara a una persona; es tooling interno de registro.

## 7. Arquitectura (flujo textual)

```
Admin (browser)
   │
   ▼
React SPA (Vite) ──REST/JSON──▶ Node.js API (Express) ──Prisma──▶ SQLite (dev) / Postgres (futuro)
   │                                   │
   │                                   ├─ Zod valida request/response
   │                                   └─ Cálculo de score de madurez (9 áreas del Anexo A)
   ▼
Dashboard (Recharts): score por dominio, listado AISystems, detalle con
riesgos/controles/evidencia/incidentes agregados
```

Sin agentes IA ni pipeline asíncrono en v0.1 → no aplica §7-bis (Arquitectura de agentes).

## 8. Estructura de datos (entidades principales)

- **Organization** (`id`, `name`) — 1 fila fija en v0.1.
- **AISystem** (`id`, `organizationId`, `name`, `purpose`, `provider`, `gcpProject`,
  `status`, `createdAt`).
- **Risk** (`id`, `organizationId`, `aiSystemId`, `category`, `severity`, `description`).
- **Control** (`id`, `organizationId`, `riskId`, `name`, `status`, `isoDomain`).
- **Evidence** (`id`, `organizationId`, `controlId`, `type` [texto/enlace/archivo],
  `content`, `registeredBy`, `registeredAt`).
- **Incident** (`id`, `organizationId`, `aiSystemId`, `description`, `severity`,
  `occurredAt`, `resolvedAt`).
- **IsoDomain** (9 áreas de control A.2–A.10, seed data — catálogo, no editable en v0.1).

Relaciones: AISystem 1—N Risk 1—N Control 1—N Evidence. AISystem 1—N Incident.
Control N—1 IsoDomain (para el cálculo de score por dominio).

## 9. APIs / Endpoints (contrato v0.1)

```
GET    /api/ai-systems              lista con conteo agregado de riesgos/controles/incidentes
POST   /api/ai-systems
GET    /api/ai-systems/:id          detalle con riesgos→controles→evidencia + incidentes
PATCH  /api/ai-systems/:id
POST   /api/ai-systems/:id/risks
POST   /api/risks/:id/controls
POST   /api/controls/:id/evidence
POST   /api/ai-systems/:id/incidents
GET    /api/dashboard/maturity      score 0-100 por cada una de las 9 áreas del Anexo A
GET    /api/export                  JSON/CSV del inventario completo (Should Have)
```

## 10. Fuera de alcance (v0.1)

- Multi-cliente/multi-tenant real, RBAC, certificación formal, ingesta automática de
  telemetría, integración con TokenPulse (queda documentada como diseño conceptual en
  `docs/ROADMAP.md`, no como código).

## 11. Dependencias manuales

- Repo GitHub público `S2A2-Dynamics/ai-governance` y submódulo en
  `00-active/ai-governance/` — completados en T-01 tras confirmación explícita.
- Carga manual inicial de los ~10 sistemas de IA existentes de S2A2 (no hay importación
  automática en v0.1).

## 12. Referencias

- Repo: `github.com/S2A2-Dynamics/ai-governance`.
- Memoria del proyecto: `memory/projects/ai_governance_framework.md`.
- Estándar de referencia: [ISO/IEC 42001:2023](https://www.iso.org/standard/42001.html),
  EU AI Act (Reglamento (UE) 2024/1689).

## 13. Consola de admin

Nivel: **mínima en v0.1** — un único usuario admin (Aníbal), sin login separado (auth
básica o ninguna, a decidir en desarrollo — sin datos de clientes reales expuestos
públicamente, es tooling interno). Métricas admin: las del propio dashboard de madurez.
No hay vista de cliente en v0.1.

## 14. Modelo económico

No aplica — proyecto interno sin cliente externo en v0.1.

## 15. Contratos de comportamiento (SDD)

- CG-21 aplica a las dependencias de tooling añadidas en T-03: versiones exactas fijadas
  en los dos `package.json` y sus lockfiles.
- Contratos específicos del proyecto:
  - SI se calcula el score de madurez de un dominio ISO → ENTONCES se basa únicamente en
    controles con evidencia registrada | NUNCA se muestra un score >0 para un dominio sin
    evidencia real cargada (evitar "datos inventados", lección aprendida de
    `bitacora_sesion_previa_puede_contener_datos_inventados`).
  - SI se crea un Control sin Risk asociado → ENTONCES la API rechaza la creación |
    NUNCA existe un Control huérfano en el modelo de datos.
  - SI se migra el datasource de Prisma a Postgres → ENTONCES solo cambia `provider` y
    `url` en `schema.prisma` | NUNCA se usan tipos/features nativos de un solo motor
    (`@db.*` de un proveedor, arrays nativos de Postgres) en el schema v0.1.
