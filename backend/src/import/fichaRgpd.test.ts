import assert from "node:assert/strict";
import { test } from "node:test";
import http from "node:http";
import { app } from "../app.js";
import { ORGANIZATION_ID, prisma } from "../prisma.js";
import { fichaSchema, importFicha, planImport, type Ficha } from "./fichaRgpd.js";

const baseFicha = (name: string, domainCode: string): Ficha =>
  fichaSchema.parse({
    formatVersion: 1,
    auditedAt: "2026-10-06",
    commit: "abc1234",
    system: { name, purpose: "prueba", provider: "Gemini", status: "activo" },
    checks: [
      { id: "C2", title: "Regla de 2", status: "fail", category: "seguridad", severity: "critico", finding: "tres patas", action: "romper pata 2", isoDomainCode: domainCode },
      { id: "C3", title: "Minimización", status: "partial", category: "privacidad", severity: "alto", finding: "filtra por tenant pero no por contacto", isoDomainCode: domainCode, evidence: [{ type: "enlace", content: "src/ctx.ts:10" }] },
      { id: "C7", title: "Art. 22", status: "na", category: "transparencia", severity: "medio", finding: "no decide sobre personas", isoDomainCode: domainCode },
      { id: "C12", title: "Credenciales", status: "pass", category: "seguridad", severity: "alto", finding: "Secret Manager", isoDomainCode: domainCode, evidence: [{ type: "enlace", content: "cloudbuild.yaml:42" }] },
    ],
  });

test("fichaSchema: un pass sin evidencia o un fail con evidencia se rechazan (PRD §15, sin evidencia inventada)", () => {
  const ficha = baseFicha("x", "A.5");
  const passSinEvidencia = { ...ficha, checks: [{ ...ficha.checks[3], evidence: [] }] };
  const failConEvidencia = { ...ficha, checks: [{ ...ficha.checks[0], evidence: [{ type: "enlace", content: "a.ts:1" }] }] };
  assert.equal(fichaSchema.safeParse(passSinEvidencia).success, false);
  assert.equal(fichaSchema.safeParse(failConEvidencia).success, false);
});

test("planImport: na se omite, solo pass genera control implementado con Evidence", () => {
  const plan = planImport(baseFicha("x", "A.5"));
  assert.deepEqual(plan.map((item) => item.checkId), ["C2", "C3", "C12"]);
  const byId = Object.fromEntries(plan.map((item) => [item.checkId, item]));
  assert.equal(byId.C2.control.status, "planificado");
  assert.equal(byId.C2.evidence.length, 0);
  assert.match(byId.C2.risk.description, /^\[RGPD C2\] .*→ romper pata 2$/);
  // partial: evidencia citada en el riesgo, no como Evidence (no infla la madurez)
  assert.equal(byId.C3.control.status, "planificado");
  assert.equal(byId.C3.evidence.length, 0);
  assert.match(byId.C3.risk.description, /parcial: src\/ctx\.ts:10/);
  assert.equal(byId.C12.control.status, "implementado");
  assert.equal(byId.C12.evidence[0].registeredBy, "ficha-rgpd 2026-10-06 @abc1234");
});

test("importFicha: crea AISystem→Risk→Control→Evidence vía API y re-importar no duplica", async () => {
  const suffix = Date.now();
  await prisma.organization.upsert({ where: { id: ORGANIZATION_ID }, update: {}, create: { id: ORGANIZATION_ID, name: "S2A2 Dynamics" } });
  const domain = await prisma.isoDomain.create({
    data: { organizationId: ORGANIZATION_ID, code: `TEST-RGPD-${suffix}`, name: "Dominio prueba RGPD", sortOrder: 800000 + (suffix % 90000) },
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${port}`;
  const ficha = baseFicha(`Test ficha RGPD ${suffix}`, domain.code);

  try {
    const dry = await importFicha(baseUrl, ficha, { dryRun: true });
    assert.deepEqual(dry.created, ["C2", "C3", "C12"]);
    assert.equal(await prisma.aISystem.count({ where: { name: ficha.system.name } }), 0, "dry-run no escribe");

    const first = await importFicha(baseUrl, ficha, { dryRun: false });
    assert.equal(first.createdSystem, true);
    assert.deepEqual(first.created, ["C2", "C3", "C12"]);

    const stored = await prisma.aISystem.findFirstOrThrow({
      where: { name: ficha.system.name },
      include: { risks: { include: { controls: { include: { evidence: true } } } } },
    });
    assert.equal(stored.risks.length, 3);
    const evidenceCount = stored.risks.flatMap((risk) => risk.controls).flatMap((control) => control.evidence).length;
    assert.equal(evidenceCount, 1, "solo el pass aporta Evidence");

    const second = await importFicha(baseUrl, ficha, { dryRun: false });
    assert.equal(second.createdSystem, false);
    assert.deepEqual(second.created, []);
    assert.deepEqual(second.skippedExisting, ["C2", "C3", "C12"]);
    assert.equal(await prisma.risk.count({ where: { aiSystemId: stored.id } }), 3);
  } finally {
    server.close();
    await prisma.aISystem.deleteMany({ where: { name: ficha.system.name } });
    await prisma.isoDomain.delete({ where: { id: domain.id } });
  }
});
