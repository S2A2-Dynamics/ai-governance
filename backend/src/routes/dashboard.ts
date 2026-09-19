import { Router } from "express";
import { ORGANIZATION_ID, prisma } from "../prisma.js";

export const dashboardRouter = Router();

// GET /api/dashboard/maturity — score 0-100 por cada una de las 9 áreas del Anexo A (US-06).
// Fórmula: cobertura = controles-con-evidencia / total-controles-del-dominio.
// Un dominio sin controles, o con controles pero ninguno con evidencia, siempre da 0
// (nunca un valor sintético — contrato SDD §15).
dashboardRouter.get("/dashboard/maturity", async (_request, response) => {
  const domains = await prisma.isoDomain.findMany({
    where: { organizationId: ORGANIZATION_ID },
    orderBy: { sortOrder: "asc" },
    include: { controls: { include: { evidence: true } } },
  });

  const maturity = domains.map((domain) => {
    const totalControls = domain.controls.length;
    const controlsWithEvidence = domain.controls.filter((control) => control.evidence.length > 0).length;
    const score = totalControls === 0 ? 0 : Math.round((controlsWithEvidence / totalControls) * 100);

    return {
      id: domain.id,
      code: domain.code,
      name: domain.name,
      score,
      totalControls,
    };
  });

  response.json(maturity);
});
