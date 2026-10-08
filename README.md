# S2A2 AI Governance

Aplicación interna para inventariar sistemas de IA, sus riesgos, controles, evidencias e incidentes.

## Requisitos

- Node.js 22.12 o posterior
- npm 11 o posterior

## Arranque local

En una terminal:

```bash
cd backend
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000`. El endpoint de humo es `GET /health`.

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará la URL local del frontend, normalmente `http://localhost:5173`.

## Base de datos

El desarrollo local usa SQLite mediante Prisma. Antes de trabajar con el modelo de datos:

```bash
cd backend
cp .env.example .env
npm run prisma:generate
```

Para crear o actualizar la base local y cargar la organización junto con las 9 áreas de
control del Anexo A de ISO/IEC 42001:

```bash
cd backend
npm run db:migrate -- --name init
npm run db:seed
```

## Verificación

```bash
cd backend && npm run lint && npm run typecheck
cd frontend && npm run lint && npm run typecheck && npm run build
```

## Importar fichas RGPD de agentes

Cada proyecto S2A2 con LLM tiene una «Ficha RGPD del agente» (skill `99-config/skills/rgpd-agentes`)
en `docs/ficha-rgpd.json`. Con la API arrancada:

```bash
cd backend
npx tsx scripts/import-ficha-rgpd.ts ../../CRMWhapi/docs/ficha-rgpd.json --dry-run   # valida, no escribe
npx tsx scripts/import-ficha-rgpd.ts ../../CRMWhapi/docs/ficha-rgpd.json             # importa
```

Cada comprobación se convierte en Risk + Control (dominio ISO 42001 del Anexo A). Solo las que
cumplen (`pass`) llevan Evidence, así que el dashboard de madurez no se infla con hallazgos.
Re-importar no duplica, pero tampoco actualiza riesgos existentes (la API v0.1 no tiene PATCH).
