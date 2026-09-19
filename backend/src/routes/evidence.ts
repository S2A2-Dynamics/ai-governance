import { Router } from "express";
import { ORGANIZATION_ID, prisma } from "../prisma.js";
import { createEvidenceSchema } from "../schemas/evidence.js";

export const evidenceRouter = Router();

// POST /api/controls/:id/evidence — rechaza si el Control no existe (US-04).
evidenceRouter.post("/controls/:id/evidence", async (request, response) => {
  const control = await prisma.control.findFirst({
    where: { id: request.params.id, organizationId: ORGANIZATION_ID },
  });
  if (!control) {
    response.status(404).json({ error: "Control not found" });
    return;
  }

  const parsed = createEvidenceSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const created = await prisma.evidence.create({
    data: {
      organizationId: ORGANIZATION_ID,
      controlId: control.id,
      type: parsed.data.type,
      content: parsed.data.content,
      registeredBy: parsed.data.registeredBy,
    },
  });
  response.status(201).json(created);
});
