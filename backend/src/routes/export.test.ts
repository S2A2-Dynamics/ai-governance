import assert from "node:assert/strict";
import { test } from "node:test";
import http from "node:http";
import { app } from "../app.js";
import { ORGANIZATION_ID, prisma } from "../prisma.js";

// US-08: el export es un reflejo aplanado del inventario real, no una reimplementación de datos.
test("GET /api/export: JSON y CSV incluyen filas de evidencia e incidente del inventario", async () => {
  const suffix = Date.now();
  const sortOrder = 950000 + (suffix % 40000);

  await prisma.organization.upsert({
    where: { id: ORGANIZATION_ID },
    update: {},
    create: { id: ORGANIZATION_ID, name: "S2A2 Dynamics" },
  });

  const domain = await prisma.isoDomain.create({
    data: {
      organizationId: ORGANIZATION_ID,
      code: `TEST-EXPORT-${suffix}`,
      name: "Dominio de prueba export",
      sortOrder,
    },
  });

  const aiSystem = await prisma.aISystem.create({
    data: {
      organizationId: ORGANIZATION_ID,
      name: `Test Export AISystem ${suffix}`,
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
      description: "Riesgo de prueba export",
    },
  });
  const control = await prisma.control.create({
    data: {
      organizationId: ORGANIZATION_ID,
      riskId: risk.id,
      isoDomainId: domain.id,
      name: "Control de prueba export",
      status: "implementado",
    },
  });
  const evidence = await prisma.evidence.create({
    data: {
      organizationId: ORGANIZATION_ID,
      controlId: control.id,
      type: "texto",
      content: "Evidencia de prueba export",
      registeredBy: "tester",
    },
  });
  const incident = await prisma.incident.create({
    data: {
      organizationId: ORGANIZATION_ID,
      aiSystemId: aiSystem.id,
      description: "Incidente de prueba export",
      severity: "alto",
      occurredAt: new Date(),
    },
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as { port: number };

  try {
    const jsonResponse = await fetch(`http://127.0.0.1:${port}/api/export?format=json`);
    assert.equal(jsonResponse.status, 200);
    const rows = (await jsonResponse.json()) as Array<Record<string, unknown>>;

    const evidenceRow = rows.find((row) => row.evidenceId === evidence.id);
    assert.ok(evidenceRow, "debe existir una fila con la evidencia creada");
    assert.equal(evidenceRow?.recordType, "evidence");
    assert.equal(evidenceRow?.aiSystemId, aiSystem.id);
    assert.equal(evidenceRow?.controlId, control.id);
    assert.equal(evidenceRow?.isoDomainCode, domain.code);

    const incidentRow = rows.find((row) => row.incidentId === incident.id);
    assert.ok(incidentRow, "debe existir una fila con el incidente creado");
    assert.equal(incidentRow?.recordType, "incident");
    assert.equal(incidentRow?.aiSystemId, aiSystem.id);

    const csvResponse = await fetch(`http://127.0.0.1:${port}/api/export?format=csv`);
    assert.equal(csvResponse.status, 200);
    assert.match(csvResponse.headers.get("content-type") ?? "", /text\/csv/);
    const csvBody = await csvResponse.text();
    assert.match(csvBody, /recordType,aiSystemId/);
    assert.ok(csvBody.includes(evidence.id));
    assert.ok(csvBody.includes(incident.id));
  } finally {
    server.close();
    await prisma.aISystem.delete({ where: { id: aiSystem.id } });
    await prisma.isoDomain.delete({ where: { id: domain.id } });
  }
});
