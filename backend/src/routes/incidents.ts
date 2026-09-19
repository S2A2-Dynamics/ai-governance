import { Router } from "express";
import { ORGANIZATION_ID, prisma } from "../prisma.js";
import { createIncidentSchema } from "../schemas/incident.js";

export const incidentsRouter = Router({ mergeParams: true });

// POST /api/ai-systems/:id/incidents — rechaza si el AISystem no existe (US-05).
incidentsRouter.post<{ id: string }>("/", async (request, response) => {
  const aiSystem = await prisma.aISystem.findFirst({
    where: { id: request.params.id, organizationId: ORGANIZATION_ID },
  });
  if (!aiSystem) {
    response.status(404).json({ error: "AISystem not found" });
    return;
  }

  const parsed = createIncidentSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const created = await prisma.incident.create({
    data: { organizationId: ORGANIZATION_ID, aiSystemId: aiSystem.id, ...parsed.data },
  });
  response.status(201).json(created);
});
