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

La primera migración y el esquema completo se implementarán en T-04.

## Verificación

```bash
cd backend && npm run typecheck
cd frontend && npm run typecheck && npm run build
```
