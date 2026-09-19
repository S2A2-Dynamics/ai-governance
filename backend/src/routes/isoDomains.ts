import { Router } from "express";
import { ORGANIZATION_ID, prisma } from "../prisma.js";

export const isoDomainsRouter = Router();

// GET /api/iso-domains — catálogo de dominios ISO/IEC 42001 (Anexo A) para poblar
// selects del frontend (p.ej. alta de Control). Listado liviano, sin score ni evidence.
isoDomainsRouter.get("/", async (_request, response) => {
  const domains = await prisma.isoDomain.findMany({
    where: { organizationId: ORGANIZATION_ID },
    orderBy: { sortOrder: "asc" },
    select: { id: true, code: true, name: true },
  });

  response.json(domains);
});
