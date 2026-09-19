import { Router } from "express";
import { ORGANIZATION_ID, prisma } from "../prisma.js";
import { createControlSchema } from "../schemas/control.js";

export const controlsRouter = Router();

// POST /api/risks/:id/controls — contrato SDD PRD §15: NUNCA existe un Control huérfano.
// Rechaza con 404 si el Risk no existe (aunque el body sea válido).
controlsRouter.post("/risks/:id/controls", async (request, response) => {
  const risk = await prisma.risk.findFirst({
    where: { id: request.params.id, organizationId: ORGANIZATION_ID },
  });
  if (!risk) {
    response.status(404).json({ error: "Risk not found" });
    return;
  }

  const parsed = createControlSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const isoDomain = await prisma.isoDomain.findFirst({
    where: { id: parsed.data.isoDomainId, organizationId: ORGANIZATION_ID },
  });
  if (!isoDomain) {
    response.status(400).json({ error: "isoDomainId not found" });
    return;
  }

  const created = await prisma.control.create({
    data: {
      organizationId: ORGANIZATION_ID,
      riskId: risk.id,
      name: parsed.data.name,
      status: parsed.data.status,
      isoDomainId: isoDomain.id,
    },
  });
  response.status(201).json(created);
});
