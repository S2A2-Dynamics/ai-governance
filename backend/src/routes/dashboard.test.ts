import assert from "node:assert/strict";
import { test } from "node:test";
import http from "node:http";
import { app } from "../app.js";
import { ORGANIZATION_ID, prisma } from "../prisma.js";

// US-06: score de madurez nunca es inventado — solo refleja cobertura real de evidencia.
test("GET /api/dashboard/maturity: dominio vacío → 0, sin evidencia → 0, con evidencia → >0", async () => {
  const suffix = Date.now();
  const baseSortOrder = 900000 + (suffix % 90000);

  await prisma.organization.upsert({
    where: { id: ORGANIZATION_ID },
    update: {},
    create: { id: ORGANIZATION_ID, name: "S2A2 Dynamics" },
  });

  const domainEmpty = await prisma.isoDomain.create({
    data: {
      organizationId: ORGANIZATION_ID,
      code: `TEST-EMPTY-${suffix}`,
      name: "Dominio de prueba sin controles",
      sortOrder: baseSortOrder,
    },
  });
  const domainNoEvidence = await prisma.isoDomain.create({
    data: {
      organizationId: ORGANIZATION_ID,
      code: `TEST-NOEV-${suffix}`,
      name: "Dominio de prueba con control sin evidencia",
      sortOrder: baseSortOrder + 1,
    },
  });
  const domainWithEvidence = await prisma.isoDomain.create({
    data: {
      organizationId: ORGANIZATION_ID,
      code: `TEST-EV-${suffix}`,
      name: "Dominio de prueba con evidencia",
      sortOrder: baseSortOrder + 2,
    },
  });

  const aiSystem = await prisma.aISystem.create({
    data: {
      organizationId: ORGANIZATION_ID,
      name: `Test AISystem ${suffix}`,
      purpose: "prueba",
      provider: "interno",
      status: "activo",
    },
  });
  const risk = await prisma.risk.create({
    data: {
      organizationId: ORGANIZATION_ID,
      aiSystemId: aiSystem.id,
      category: "prueba",
      severity: "bajo",
      description: "Riesgo de prueba",
    },
  });
  await prisma.control.create({
    data: {
      organizationId: ORGANIZATION_ID,
      riskId: risk.id,
      isoDomainId: domainNoEvidence.id,
      name: "Control sin evidencia",
      status: "planificado",
    },
  });
  const controlWithEvidence = await prisma.control.create({
    data: {
      organizationId: ORGANIZATION_ID,
      riskId: risk.id,
      isoDomainId: domainWithEvidence.id,
      name: "Control con evidencia",
      status: "implementado",
    },
  });
  await prisma.evidence.create({
    data: {
      organizationId: ORGANIZATION_ID,
      controlId: controlWithEvidence.id,
      type: "texto",
      content: "Evidencia de prueba",
      registeredBy: "tester",
    },
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as { port: number };

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/dashboard/maturity`);
    assert.equal(response.status, 200);
    const body = (await response.json()) as Array<{ id: string; score: number; totalControls: number }>;

    const byId = new Map(body.map((entry) => [entry.id, entry]));
    assert.equal(byId.get(domainEmpty.id)?.score, 0);
    assert.equal(byId.get(domainEmpty.id)?.totalControls, 0);
    assert.equal(byId.get(domainNoEvidence.id)?.score, 0);
    assert.equal(byId.get(domainNoEvidence.id)?.totalControls, 1);
    assert.equal(byId.get(domainWithEvidence.id)?.score, 100);
    assert.equal(byId.get(domainWithEvidence.id)?.totalControls, 1);
  } finally {
    server.close();
    await prisma.aISystem.delete({ where: { id: aiSystem.id } });
    await prisma.isoDomain.delete({ where: { id: domainEmpty.id } });
    await prisma.isoDomain.delete({ where: { id: domainNoEvidence.id } });
    await prisma.isoDomain.delete({ where: { id: domainWithEvidence.id } });
  }
});
