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
- [x] Ejecutar T-05: endpoints AISystem con validación Zod.

## 2026-09-18 — T-10: tabla + alta de AISystem (frontend)

**Estado al inicio**: backend T-05/T-09 cerrados; frontend sin tabla ni formulario de alta.

### Qué se hizo
- Tabla de AISystems (nombre, propósito, provider, gcpProject, status, conteos riesgos/controles/incidentes) + formulario de alta.
- Verificado en navegador (Playwright, fallback de `chromium-cli`) con capturas de las 4 escenas: estado inicial vacío, alta OK, nombre duplicado (409), campo en blanco vía espacios (400/Zod).

### Aprendizajes / Errores
- **El backend "escuchando" no significa "funcional"**: en una sesión previa se dio por bueno que el backend arrancaba, pero no existía `backend/.env` ni la SQLite inicializada — toda petición a la API fallaba con `PrismaClientInitializationError: Environment variable not found: DATABASE_URL`. Se detectó solo al probar el flujo real en navegador (nunca confiar en "el proceso sigue vivo" como señal de éxito). Fix: `cp .env.example .env` + `npx prisma migrate dev --name init` + reiniciar. `.env` es responsabilidad del desarrollador local, está en `.gitignore` — documentar en README si otro dev clona el repo.
- El `required` nativo del HTML5 no basta como validación: un valor de solo espacios (`"   "`) lo bypassa pero Zod (`.trim().min(1)`) sí lo atrapa server-side — confirma que la validación real vive en el backend, no en el atributo del input.

### Pendiente / Próximos pasos
- [x] Ejecutar T-11: vista detalle de AISystem (riesgos→controles→evidencia anidados).

## 2026-09-19 — T-11: vista detalle de AISystem (riesgos→controles→evidencia)

**Estado al inicio**: T-10 cerrado; faltaba la vista de detalle con navegación desde la tabla.

### Qué se hizo
- `AISystemDetail.tsx`: vista anidada Risk → Control → Evidence, sección separada de Incidentes ordenada por fecha, y formularios inline para crear Risk/Control/Evidence/Incident sin salir de la vista (recarga vía `fetchAISystemDetail` tras cada creación).
- Navegación por estado local en `App.tsx` (no hay react-router): `selectedAiSystemId` + `<AISystemDetail key={selectedAiSystemId} .../>` — la `key` fuerza remount completo al cambiar de sistema, evitando estado colgado del sistema anterior.
- `api.ts`: `post400or404` normaliza el 400 de `POST /api/risks/:id/controls` cuando `isoDomainId` no existe — `controls.ts` responde `{ error: "isoDomainId not found" }` (string plano) en vez del shape `ApiFieldErrors` (Zod `flatten()`) que usan el resto de rutas; el helper detecta `typeof body.error === "string"` y lo envuelve como `{ fieldErrors: { isoDomainId: [...] } }` para que el frontend lo trate igual que cualquier otro error de campo.
- Lint/typecheck/build verificados en verde antes del test de navegador.

### Aprendizajes / Errores
- **ESLint `react-hooks/set-state-in-effect` rastrea llamadas dentro de funciones nombradas invocadas desde el efecto, no solo el cuerpo literal del `useEffect`**: tener una función `reload()` en el componente que hace `setState` sin guarda de cancelación, y llamarla desde dentro de un `useEffect` (aunque envuelta en `.catch()/.finally()`), sigue disparando el error en el punto de la llamada. La regla analiza el grafo de llamadas, no solo el efecto de forma aislada. Fix: inlinear el fetch + `setState` directamente en el cuerpo del `useEffect`, con el guard `if (cancelled) return;` colocado dentro del callback `.then()` justo antes de los `setState` — dejando `reload()` como función aparte solo para los callbacks `onCreated`/`onChanged` de los formularios (fuera de cualquier efecto, ahí sí es seguro).
- Patrón "derived value" en vez de sync-effect: el formulario de Control sincronizaba `isoDomainId` seleccionado con un `useState`+`useEffect`; se sustituyó por un valor derivado en render (`selectedIsoDomainId || (isoDomains[0]?.id ?? "")`), eliminando el efecto y su violación de lint.

### Verificación en navegador (19-sep-2026)

- [x] Probado en navegador el flujo completo T-11 — criterios de aceptación cerrados `[x]` en `TICKETS.md`.
- Herramienta real usada: `chromium-cli` (recomendado por el skill `run`) confirmado ausente en esta máquina; se usó un script Node propio (`t11_test.mjs`) con `playwright-core` importado directamente. El paquete no está instalado ni en el proyecto ni globalmente, solo dentro de la caché interna de `npx` (`~/.npm/_npx/<hash>/node_modules/playwright-core`), fuera del path de resolución por defecto de Node. Fix: variable de entorno `NODE_PATH` apuntando a esa carpeta de caché al invocar `node`, sin instalar nada nuevo ni tocar el proyecto.
- Flujo probado end-to-end con capturas (8 pantallas): navegación tabla→detalle por click de fila, Riesgos anidados con Controles y Evidencia, Incidentes en sección separada, alta inline de Risk/Control/Evidence/Incident con refresco de la vista sin salir del detalle, caso de error con `isoDomainId` inexistente (400 mostrado inline, único error de consola esperado), y vuelta al inventario con el botón "Volver". Resultado: `TEST_RESULT: PASS`.

### Pendiente / Próximos pasos
- [ ] Continuar con T-12 (dashboard de madurez con Recharts).

## 2026-09-19 — T-12: hallazgo de contrato antes de escribir código

**Estado al inicio**: T-11 cerrado; empezando SDD de T-12 (dashboard madurez, US-06).

### Hallazgo: `GET /api/dashboard/maturity` no distingue "sin datos" de "score bajo real"

Al leer `backend/src/routes/dashboard.ts` (contrato exacto que T-12 debe consumir), el endpoint
calcula `totalControls` y `controlsWithEvidence` por dominio pero **solo devuelve `score`**
(`{ id, code, name, score }`). El segundo criterio de aceptación de T-12 exige que un dominio en
0 se muestre "visualmente distinto a 'sin datos' vs 'score bajo real'" — pero con el shape actual
el frontend no tiene forma de saber si un `score: 0` es "dominio sin ningún Control" (sin datos)
o "dominio con Controles pero 0% de cobertura de evidencia" (también, en espíritu, sin datos
real medible aún). Ambos casos son indistinguibles hoy desde el cliente.

**Decisión**: esto es un cambio de alcance menor de T-12 (de frontend-only a frontend+backend
aditivo) — evaluado contra el criterio de CLAUDE.md ("si un hallazgo cambia el alcance, parar y
preguntar"), pero el fix es de bajo riesgo: añadir `totalControls` (campo nuevo, aditivo, no
rompe el shape existente ni los tests actuales de `dashboard.test.ts`) para que el frontend pueda
derivar `hasData = totalControls > 0`. Se procede sin pausa por ser aditivo, no destructivo, y
estar directamente exigido por el criterio de aceptación ya aprobado en `TICKETS.md`.

**Cómo aplicar**: extender la respuesta de `/api/dashboard/maturity` con `totalControls`;
extender (no reescribir) los tests existentes para cubrir el campo nuevo; el frontend usa
`totalControls === 0` para renderizar el dominio con un estilo/etiqueta distinta ("sin datos")
en vez de una barra de score bajo.

### Pendiente / Próximos pasos
- [x] Añadir `totalControls` a `dashboard.ts` + test. Verificado: suite completa del backend en verde (5/5 tests).
- [x] Instalar Recharts (`frontend/package.json` no lo tiene todavía) y construir `MaturityDashboard.tsx`.

## 2026-09-19 — T-12: bug de barras invisibles en score 0 (Recharts) + cierre

### Hallazgo: Recharts renderiza una barra de score 0 con 0px de alto, sea cual sea el `fill` del `Cell`

Al construir `MaturityDashboard.tsx` y probarlo en navegador con Playwright, el conteo de
`.recharts-bar-rectangle` daba **1** en vez de **9** (solo el dominio A.3 con score real 100 se
veía). Causa raíz: la altura de un `<Bar>` en Recharts es proporcional al valor numérico de
`dataKey` — un `score: 0` produce una barra de 0px de alto, indistinguible de "no hay barra",
sin importar el color asignado por `Cell fill`. Esto rompía directamente el segundo criterio de
aceptación de T-12 (un dominio en 0 debe verse "sin datos", no como una barra invisible/ausente).

**Fix aplicado** (`MaturityDashboard.tsx`): se desacopló un campo `displayScore` por dominio,
usado **solo** para la altura de la barra — `domain.totalControls === 0 ? PLACEHOLDER_HEIGHT_SIN_DATOS (4) : domain.score`
— mientras que el `Tooltip formatter` sigue leyendo el `totalControls` real para mostrar el
texto "Sin datos" en vez de un porcentaje. El `Cell fill` colorea gris (`#d1d5db`) los dominios
sin datos y azul (`#2563eb`) los que tienen score real. Se añadió también una leyenda
(`.maturity-legend`) explicando ambos colores.

**Patrón reutilizable** (no específico de este proyecto): en cualquier gráfico de barras donde
`0` es un valor legítimo pero "0 por falta de datos" debe distinguirse visualmente de "0 real",
desacoplar el campo que determina la altura/tamaño visual del campo que determina el
color/etiqueta — nunca confiar en que un `Cell`/color por sí solo compense una barra de altura
cero.

### Verificación en navegador (19-sep-2026)

- `tsc --noEmit`, `npm run build` y `npm run lint` del frontend: limpios.
- Playwright (`t12_test.mjs`, mismo patrón de T-11: `playwright-core` de la caché de `npx` vía
  `NODE_PATH`): conteo de `.recharts-bar-rectangle` pasó de **1 a 9** tras el fix.
- Captura de pantalla completa (`t12_dashboard.png`) revisada visualmente: 9 barras, 8 grises
  ("sin datos", dominios A.2 y A.4–A.10, todos con `totalControls: 0`) a altura mínima uniforme
  cerca del eje X, y 1 azul (A.3, score 100) a altura completa. Leyenda visible y correcta.
  Resto de la página (tabla de Sistemas de IA, formulario de alta) sin regresiones.
- `TEST_RESULT: PASS` — ambos criterios de aceptación de T-12 cerrados `[x]` en `TICKETS.md`.

### Pendiente / Próximos pasos
- [x] Continuar con T-13 (filtros por severidad/dominio, US-09, Should Have).

## 2026-09-19 — T-13: filtros por severidad/dominio (US-09) — cierre

**Estado al inicio**: T-12 cerrado. T-13 en `TICKETS.md` no tiene checklist de criterios de
aceptación (solo título + estimación XS) — su cierre se documenta aquí, sin marcar checkboxes
en `TICKETS.md` porque no existen.

### Qué se hizo
- `AISystemDetail.tsx`: dos selects controlados por estado local, ambos valor derivado en
  render (sin `useEffect`+`useState` de sincronización, mismo patrón que la lección de T-11).
  - `severityFilter` (`RiskSeverity | "todas"`, default `"todas"`): filtra `detail.risks` por
    `risk.severity` — un riesgo que no coincide se oculta por completo (la tarjeta entera).
  - `domainFilter` (`string`, default `"todos"`): dentro de cada `RiskCard`, filtra
    `risk.controls` por `control.isoDomain.id` — un control que no coincide se oculta, pero la
    tarjeta del riesgo padre permanece visible aunque su lista filtrada de controles quede
    vacía (muestra "Ningún control coincide con el dominio seleccionado." en su lugar).
  - Ambos filtros aplican con lógica AND independiente (severidad sobre riesgos, dominio sobre
    controles dentro de los riesgos ya visibles).
- Se enriqueció el dataset de prueba vía llamadas reales a la API (no inserts directos en
  SQLite): AISystem "Detector de Fraude" con un segundo Risk de severidad "bajo" sin controles,
  para poder ejercitar ambos valores del filtro de severidad.

### Verificación en navegador (19-sep-2026)
- `tsc --noEmit`, `npm run build` y `npm run lint` del frontend: limpios (lint confirmado en
  esta misma sesión tras la verificación de navegador, exit 0 sin warnings).
- Playwright (`t13_test.mjs`, mismo patrón de T-11/T-12: `playwright-core` de la caché de
  `npx` vía `NODE_PATH`) contra "Detector de Fraude" (2 risks: "alto" con 2 controles en
  dominios A.3/A.7, "bajo" sin controles):
  - Sin filtros: 2 risk cards visibles.
  - `severidad=alto`: 1 risk card ("Sesgo en decisiones de scoring crediticio").
  - `severidad=todas` (reset): 2 risk cards de nuevo.
  - `severidad=bajo`: 1 risk card ("Riesgo de prueba T-13 para filtro de severidad").
  - `dominio=A.7` (severidad en "todas"): 2 risk cards (el dominio no oculta riesgos), 1
    control card visible (solo el de A.7, el de A.3 oculto), 0 mensajes de "ningún control
    coincide" (correcto: el riesgo "bajo" no tiene controles en absoluto, así que no dispara
    ese mensaje — solo se dispara cuando un riesgo tiene controles pero ninguno coincide).
  - Combinado `severidad=alto` + `dominio=A.7`: 1 risk card, 1 control card — confirma AND
    entre ambos filtros simultáneamente.
  - Reset final (ambos a default): 2 risk cards, 2 control cards.
  - `TEST_RESULT: PASS` en las 7 escenas.

### Pendiente / Próximos pasos
- [x] Continuar con T-14 (seed de C21V / Centurion como primer AISystem real del inventario,
  vía API — verificar cada dato contra `memory/projects/c21v.md` antes de persistir, sin texto
  inventado).

## 2026-09-19 — T-14: Seed de C21V / Centurion (primer AISystem real, humo end-to-end)

**Estado al inicio**: T-01–T-13 cerrados; inventario solo con datos de prueba ("Detector de
Fraude"). T-14 exige cargar C21V vía API real (no insert directo en SQLite), con cada
Risk/Control/Evidence trazable a una memoria o commit real — contrato "no inventar datos" del
PRD §11, motivado por la lección `bitacora_sesion_previa_puede_contener_datos_inventados`.

### Qué se hizo
- Verificados contra `memory/projects/c21v.md` y memorias relacionadas los datos de C21V antes
  de persistir (nombre, propósito, provider, gcpProject, status).
- Creado vía `POST /api/ai-systems` (id `cmu8jd5e00005y42c8y5nq2dn`): "C21V / Centurion",
  purpose = asistente conversacional inmobiliario (WhatsApp/Whapi + web) para Century 21
  Venezuela, provider "Gemini (Vertex AI)", gcpProject `century21venezuela`, status "activo".
- 2 Risks vía `POST /api/ai-systems/:id/risks`:
  - `robustez`/`alto` (id `cmu8jfl6g...`): incidente 15-sep-2026 de p95>15s y fallos healthz por
    `?wait=true` en Cloud Scheduler + cpu-throttling + minScale:1.
  - `seguridad`/`medio` (id `cmu8jflf9...`): Firestore `century21venezuela` sin
    delete-protection ni PITR antes de la auditoría de resiliencia (cerrada 15-sep-2026).
- 2 Controls vía `POST /api/risks/:id/controls`, ambos `status: verificado`:
  - Dominio A.6 (Ciclo de vida): retry/backoff + timeout global + eliminación de `?wait=true`
    (commits `068c53d`, `01b7abd`/`1d73dd5`, revision `c21v-service-01404-h89`).
  - Dominio A.7 (Datos): activación de delete-protection + PITR en Firestore (salida de
    `gcloud firestore databases update`, cerrado 15-sep-2026).
- 2 Evidence vía `POST /api/controls/:id/evidence` (`type: texto`, `registeredBy:
  rentasparatodos@gmail.com`), cada una citando los commits/comandos exactos arriba.
- Verificado con `GET /api/ai-systems/:id` que la estructura anidada Risk→Control→Evidence y
  las asociaciones de dominio ISO son correctas.
- `npm run typecheck`, `npm run lint` y `npm test` (5/5, incluye tests anti-huérfano de T-06/T-07
  y de score de madurez de T-08) del backend: limpios, sin regresión por los nuevos datos.

### Verificación en navegador (19-sep-2026)
- Playwright (`t14_verify.mjs`, mismo patrón que T-11/T-13) contra `http://localhost:5173`:
  - Tabla de inventario: 2 filas — "C21V / Centurion" (2 riesgos, 2 controles, 0 incidentes) y
    "Detector de Fraude" intacto (2 riesgos, 2 controles, 1 incidente) — confirma que no se
    afectó el dato de prueba preexistente.
  - Detalle de "C21V / Centurion": 2 risk cards con las descripciones exactas creadas por API;
    ambos controles en estado "verificado" con su dominio ISO correcto (A.6 y A.7) y su
    evidencia de tipo texto visible.
  - Botón de volver: regresa correctamente a la tabla con las 2 filas.
  - `TEST_RESULT: PASS`.

### Decisiones tomadas
- Ningún dato inventado: cada Risk/Control/Evidence cita un incidente, commit o comando `gcloud`
  real y verificable, según exige el contrato de éxito del PRD.

### Pendiente / Próximos pasos
- [x] T-15: cargar los ~9 sistemas de IA restantes — **CERRADO 19-sep-2026**, ver sección
  siguiente.

## T-15 — Carga del resto de sistemas de IA (19-sep-2026)

Los 9 sistemas se cargaron uno a uno vía API real (`POST /api/ai-systems` →
`POST /api/ai-systems/:id/risks` → `POST /api/risks/:id/controls` →
`POST /api/controls/:id/evidence`), cada uno con ≥1 Risk/Control/Evidence citando una
memoria de proyecto real o CLAUDE.md — nunca datos inventados (lección
`bitacora_sesion_previa_puede_contener_datos_inventados`).

| Sistema | AISystem id | Fuente (memoria) | Risks/Controls |
|---|---|---|---|
| Zomy | `cmu8jnlhn000jy42cnisgbxv8` | `memory/projects/zomy.md` | 2/2 — envío en ráfaga sin throttling (control: cola drip); gap webhook estado de entrega canal WOLVRN-YZCLX |
| CRMWhapi / KlientIQ | `cmu8kgmir000xy42cteayudmk` | `memory/projects/crmwhapi.md` | 2/2 — JWT HS256 sin invalidación de sesión (control planificado); firma HMAC-SHA256 webhook Meta (implementado) |
| Jucar Supremo | `cmu8kjcsn001by42ctpa09v11` | `memory/projects/jucar_supremo.md` | 2/2 — `ALLOWED_ORIGINS` no configurado (instrumentado); cold start encadenado proxy→backend (postJsonResilient) |
| Whapi | `cmu8km1x6001py42cmom3fy5o` | `memory/projects/whapirent4all.md` | 2/2 — doc ID Firestore sin sanitizar (control verificado); try/catch silencioso en AiService (retry backoff) |
| Whapi-Dashboard | `cmu8kpgxc0023y42clox87xtf` | `memory/projects/whapirent4all.md` | 2/2 — reglas Firestore compartidas entre flujos de acceso; `fetchAsesor()` sin timeout (control planificado) |
| whapi-digest | `cmu8kveup002hy42cg7ursz4l` | `memory/projects/whapi_digest.md` | 2/2 — endpoint `/run` sin verificación OIDC (implementado); dependencia de canal Whapi personal (verificación de canal) |
| MIOS | `cmu8lamxv002vy42cvc5sh3w9` | `memory/projects/mios.md` | 2/2 — reglas Storage `auth != null` sin scoping por familia (regla sameFamily); cruce de límite de privacidad en "Invita a MÍOS" (opt-in recíproco) |
| signal-radar | `cmu8lf2900039y42cr615fpla` | `memory/projects/signal_radar.md` + `signal_radar_accuracy_baja_10sep.md` | 1/1 — accuracy 46.1% (control: revisión humana obligatoria antes de operar) |
| whapi-lead-engine | `cmu8qaq27003hy42coljn9ngv` | **excepción** — sin memoria dedicada, ver nota | 1/1 — riesgo genérico de privacidad de datos de leads WA (control: Firebase Auth) |

**Excepción documentada — whapi-lead-engine**: no existe memoria dedicada del proyecto (solo
aparece listado sin detalle en `project_repo_submodulos.md` y `mcp_reconexion_por_proyecto.md`,
ambos verificados y confirmados insuficientes). Se preguntó al usuario vía `AskUserQuestion`
y se optó por cargar solo el mínimo verificable de CLAUDE.md (tabla de proyectos activos):
provider "Gemini", stack CF Gen2 + Firebase Hosting + Firestore + Firebase Auth, status
"🟢 Listo vender". El campo `purpose` y la ausencia de `gcpProject` quedan marcados
explícitamente en el propio texto persistido como "NO verificados en memoria del proyecto",
en vez de inventar detalle de negocio. `status` se mapeó a `"pausado"` (no `"activo"`) como
interpretación conservadora de "listo vender" ≠ "confirmado en operación para un cliente".

**Verificación**:
- `GET /api/ai-systems` (19-sep-2026): 11 sistemas totales — los 9 de T-15 + "C21V / Centurion"
  (T-14) + "Detector de Fraude" (seed previo del scaffold) — todos con `riskCount≥1` y
  `controlCount≥1`.
- `GET /api/ai-systems/:id` de cada uno de los 9: confirma anidado Risk→Control→Evidence
  completo, sin huérfanos, con `isoDomainId` válido en cada Control.
- Ningún insert directo en SQLite; las 36 llamadas API (9 sistemas × 4 pasos) se ejecutaron
  todas contra el backend real en `localhost:3000`.
