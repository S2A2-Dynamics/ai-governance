import assert from "node:assert/strict";
import { test } from "node:test";
import http from "node:http";
import { app } from "../app.js";
import { ORGANIZATION_ID, prisma } from "../prisma.js";
import { fichaAiActSchema, FichaAiAct } from "../schemas/aiAct.js";
import { importFichaAiAct, planImportAiAct } from "./fichaAiAct.js";

const baseFichaAiAct = (name: string, domainCode: string): FichaAiAct =>
  fichaAiActSchema.parse({
    formatVersion: 1,
    auditedAt: "2026-11-08",
    commit: "7a38ac1",
    system: {
      name,
      purpose: "Asistente conversacional inmobiliario",
      provider: "Google Gemini",
      status: "activo",
    },
    deployer: {
      name: "Agencia Inmobiliaria Demo",
      sector: "Real Estate",
      contactEmail: "compliance@agencia-demo.es",
    },
    classification: "especifico_transparencia",
    foundationModel: {
      provider: "Google Cloud (Vertex AI)",
      modelName: "gemini-2.5-flash",
      hostingRegion: "europe-west1 (Bélgica / UE)",
      dataRetentionPolicy: "No-train: datos no utilizados para reentrenar modelos públicos",
    },
    checks: [
      {
        id: "AIA-50.1",
        article: "Art. 50.1",
        title: "Notificación de interacción con IA al usuario",
        status: "pass",
        category: "transparencia",
        severity: "alto",
        finding: "Mensaje de bienvenida avisa condición de IA",
        isoDomainCode: domainCode,
        evidence: [{ type: "enlace", content: "src/welcome.service.ts:25" }],
      },
      {
        id: "AIA-50.2",
        article: "Art. 50.2",
        title: "Marcado de contenidos sintéticos de voz y texto",
        status: "pass",
        category: "transparencia",
        severity: "medio",
        finding: "Audio Achird generado con metadatos técnicos legibles por máquina",
        isoDomainCode: domainCode,
        evidence: [{ type: "enlace", content: "packages/voice/src/achird.ts:40" }],
      },
      {
        id: "AIA-50.3",
        article: "Art. 50.3",
        title: "Ausencia de categorización biométrica o emocional",
        status: "pass",
        category: "privacidad",
        severity: "critico",
        finding: "El sistema no procesa datos biométricos ni infiere emociones",
        isoDomainCode: domainCode,
        evidence: [{ type: "texto", content: "Revisión arquitectónica: no existen modelos de visión ni biometría" }],
      },
      {
        id: "AIA-50.4",
        article: "Art. 50.4",
        title: "Prevención de deepfakes y contenidos engañosos",
        status: "na",
        category: "seguridad",
        severity: "bajo",
        finding: "El bot no genera imágenes de personas ni simula identidades reales",
        isoDomainCode: domainCode,
      },
    ],
  });

test("fichaAiActSchema: valida contratos PRD §15 (pass con evidencia, fail sin evidencia)", () => {
  const ficha = baseFichaAiAct("Sistema Test", "A.8");
  const passSinEvidencia = {
    ...ficha,
    checks: [{ ...ficha.checks[0], evidence: [] }],
  };
  const failConEvidencia = {
    ...ficha,
    checks: [
      {
        ...ficha.checks[0],
        status: "fail",
        evidence: [{ type: "enlace", content: "err.ts:1" }],
      },
    ],
  };
  assert.equal(fichaAiActSchema.safeParse(passSinEvidencia).success, false);
  assert.equal(fichaAiActSchema.safeParse(failConEvidencia).success, false);
  assert.equal(fichaAiActSchema.safeParse(ficha).success, true);
});

test("planImportAiAct: omite na y genera controles implementados para pass", () => {
  const plan = planImportAiAct(baseFichaAiAct("Sistema Test", "A.8"));
  assert.deepEqual(
    plan.map((item) => item.checkId),
    ["AIA-50.1", "AIA-50.2", "AIA-50.3"]
  );
  const c1 = plan.find((item) => item.checkId === "AIA-50.1");
  assert.equal(c1?.control.status, "implementado");
  assert.equal(c1?.evidence.length, 1);
  assert.match(c1!.risk.description, /^\[AI-ACT AIA-50.1\]/);
});

test("importFichaAiAct: crea AISystem→Risk→Control→Evidence y re-importar no duplica", async () => {
  const suffix = Date.now();
  await prisma.organization.upsert({
    where: { id: ORGANIZATION_ID },
    update: {},
    create: { id: ORGANIZATION_ID, name: "S2A2 Dynamics" },
  });
  const domain = await prisma.isoDomain.create({
    data: {
      organizationId: ORGANIZATION_ID,
      code: `TEST-AIA-${suffix}`,
      name: "Dominio prueba AI Act",
      sortOrder: 900000 + (suffix % 90000),
    },
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${port}`;
  const ficha = baseFichaAiAct(`Sistema AI Act ${suffix}`, domain.code);

  try {
    const dry = await importFichaAiAct(baseUrl, ficha, { dryRun: true });
    assert.deepEqual(dry.created, ["AIA-50.1", "AIA-50.2", "AIA-50.3"]);
    assert.equal(dry.createdSystem, true);

    const report1 = await importFichaAiAct(baseUrl, ficha, { dryRun: false });
    assert.deepEqual(report1.created, ["AIA-50.1", "AIA-50.2", "AIA-50.3"]);
    assert.equal(report1.createdSystem, true);

    // Segunda importación: debe detectar los riesgos existentes por prefijo estable y saltarlos
    const report2 = await importFichaAiAct(baseUrl, ficha, { dryRun: false });
    assert.deepEqual(report2.created, []);
    assert.deepEqual(report2.skippedExisting, ["AIA-50.1", "AIA-50.2", "AIA-50.3"]);
  } finally {
    server.close();
  }
});
