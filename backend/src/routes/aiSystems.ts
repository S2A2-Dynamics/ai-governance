import { Prisma } from "@prisma/client";
import { Router } from "express";
import { ORGANIZATION_ID, prisma } from "../prisma.js";
import { createAISystemSchema, updateAISystemSchema } from "../schemas/aiSystem.js";

export const aiSystemsRouter = Router();

// GET /api/ai-systems — lista con conteo agregado de riesgos/controles/incidentes (PRD §9).
aiSystemsRouter.get("/", async (_request, response) => {
  const aiSystems = await prisma.aISystem.findMany({
    where: { organizationId: ORGANIZATION_ID },
    include: {
      risks: { select: { _count: { select: { controls: true } } } },
      _count: { select: { risks: true, incidents: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = aiSystems.map(({ risks, _count, ...system }) => ({
    ...system,
    riskCount: _count.risks,
    controlCount: risks.reduce((sum, risk) => sum + risk._count.controls, 0),
    incidentCount: _count.incidents,
  }));

  response.json(result);
});

// GET /api/ai-systems/:id — detalle con riesgos→controles→evidencia + incidentes (PRD §9).
aiSystemsRouter.get("/:id", async (request, response) => {
  const aiSystem = await prisma.aISystem.findFirst({
    where: { id: request.params.id, organizationId: ORGANIZATION_ID },
    include: {
      risks: {
        include: {
          controls: {
            include: { evidence: true, isoDomain: true },
          },
        },
      },
      incidents: { orderBy: { occurredAt: "desc" } },
    },
  });

  if (!aiSystem) {
    response.status(404).json({ error: "AISystem not found" });
    return;
  }

  response.json(aiSystem);
});

// POST /api/ai-systems — crea con organizationId fijo, validado con Zod (US-01).
aiSystemsRouter.post("/", async (request, response) => {
  const parsed = createAISystemSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const created = await prisma.aISystem.create({
      data: { organizationId: ORGANIZATION_ID, ...parsed.data },
    });
    response.status(201).json(created);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      response.status(409).json({ error: "AISystem with this name already exists" });
      return;
    }
    throw error;
  }
});

// PATCH /api/ai-systems/:id
aiSystemsRouter.patch("/:id", async (request, response) => {
  const parsed = updateAISystemSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.aISystem.findFirst({
    where: { id: request.params.id, organizationId: ORGANIZATION_ID },
  });
  if (!existing) {
    response.status(404).json({ error: "AISystem not found" });
    return;
  }

  try {
    const updated = await prisma.aISystem.update({
      where: { id: existing.id },
      data: parsed.data,
    });
    response.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      response.status(409).json({ error: "AISystem with this name already exists" });
      return;
    }
    throw error;
  }
});
