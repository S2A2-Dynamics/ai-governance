import { z } from "zod";
import { createAISystemSchema } from "../schemas/aiSystem.js";
import { riskCategory, riskSeverity } from "../schemas/risk.js";

// Importa una «Ficha RGPD del agente» (skill 99-config/skills/rgpd-agentes) a través
// de la API REST pública, sin tocar Prisma: así hereda las mismas validaciones Zod y
// el contrato PRD §15 (nunca Control sin Risk, nunca evidencia inventada).

const checkStatus = z.enum(["pass", "partial", "fail", "unknown", "na"]);

const fichaCheckSchema = z.object({
  id: z.string().regex(/^C\d{1,2}$/),
  title: z.string().trim().min(1),
  status: checkStatus,
  category: riskCategory,
  severity: riskSeverity,
  finding: z.string().trim().min(1),
  action: z.string().default(""),
  isoDomainCode: z.string().trim().min(1),
  evidence: z
    .array(z.object({ type: z.enum(["texto", "enlace", "archivo"]), content: z.string().trim().min(1) }))
    .default([]),
});

export const fichaSchema = z
  .object({
    formatVersion: z.literal(1),
    auditedAt: z.string().trim().min(1),
    commit: z.string().trim().min(1),
    system: createAISystemSchema,
    checks: z.array(fichaCheckSchema).min(1),
  })
  .superRefine((ficha, ctx) => {
    ficha.checks.forEach((check, index) => {
      // Contrato PRD §15: un ✅ sin ruta no es evidencia; un ❌/❓ no puede llevarla.
      if (check.status === "pass" && check.evidence.length === 0) {
        ctx.addIssue({ code: "custom", path: ["checks", index, "evidence"], message: `${check.id}: pass sin evidencia` });
      }
      if ((check.status === "fail" || check.status === "unknown") && check.evidence.length > 0) {
        ctx.addIssue({ code: "custom", path: ["checks", index, "evidence"], message: `${check.id}: ${check.status} no admite evidencia` });
      }
    });
    const ids = ficha.checks.map((check) => check.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", path: ["checks"], message: "ids de comprobación duplicados" });
    }
  });

export type Ficha = z.infer<typeof fichaSchema>;
type FichaCheck = Ficha["checks"][number];

export type PlannedControl = {
  checkId: string;
  risk: { category: FichaCheck["category"]; severity: FichaCheck["severity"]; description: string };
  control: { name: string; status: "planificado" | "implementado"; isoDomainCode: string };
  evidence: { type: "texto" | "enlace" | "archivo"; content: string; registeredBy: string }[];
};

// Prefijo estable por comprobación: permite re-importar sin duplicar riesgos.
export const riskPrefix = (checkId: string) => `[RGPD ${checkId}]`;

export function planImport(ficha: Ficha): PlannedControl[] {
  const registeredBy = `ficha-rgpd ${ficha.auditedAt} @${ficha.commit}`;
  return ficha.checks
    .filter((check) => check.status !== "na")
    .map((check) => {
      const mitigated = check.status === "pass";
      const actionSuffix = !mitigated && check.action ? ` → ${check.action}` : "";
      // partial: lo que sí existe se cita en el riesgo, NO como Evidence — el dashboard
      // puntúa cualquier control con evidencia y un parcial no debe subir la madurez.
      const partialSuffix =
        check.status === "partial" && check.evidence.length > 0
          ? ` (parcial: ${check.evidence.map((item) => item.content).join("; ")})`
          : "";
      return {
        checkId: check.id,
        risk: {
          category: check.category,
          severity: check.severity,
          description: `${riskPrefix(check.id)} ${check.title}: ${check.finding}${partialSuffix}${actionSuffix}`,
        },
        control: {
          name: `${check.id} — ${check.title}`,
          // «verificado» exige test/smoke: no se infiere de una lectura de código.
          status: mitigated ? "implementado" : "planificado",
          isoDomainCode: check.isoDomainCode,
        },
        evidence: mitigated ? check.evidence.map((item) => ({ ...item, registeredBy })) : [],
      };
    });
}

export type ImportReport = {
  aiSystemId: string | null;
  createdSystem: boolean;
  created: string[];
  skippedExisting: string[];
};

type AISystemDetail = { id: string; risks: { description: string }[] };

async function api<T>(baseUrl: string, path: string, init?: { method: string; body: unknown }): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: init?.method ?? "GET",
    headers: init ? { "Content-Type": "application/json" } : undefined,
    body: init ? JSON.stringify(init.body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} → ${response.status} ${await response.text()}`);
  }
  return (await response.json()) as T;
}

export async function importFicha(baseUrl: string, ficha: Ficha, options: { dryRun: boolean }): Promise<ImportReport> {
  const plan = planImport(ficha);
  const domains = await api<{ id: string; code: string }[]>(baseUrl, "/api/iso-domains");
  const domainIdByCode = new Map(domains.map((domain) => [domain.code, domain.id]));
  const missing = [...new Set(plan.map((item) => item.control.isoDomainCode))].filter((code) => !domainIdByCode.has(code));
  if (missing.length > 0) {
    throw new Error(`Dominios ISO inexistentes en la API: ${missing.join(", ")} (¿falta npm run db:seed?)`);
  }

  const systems = await api<{ id: string; name: string }[]>(baseUrl, "/api/ai-systems");
  const existing = systems.find((system) => system.name === ficha.system.name);
  const existingDescriptions = existing
    ? (await api<AISystemDetail>(baseUrl, `/api/ai-systems/${existing.id}`)).risks.map((risk) => risk.description)
    : [];

  const report: ImportReport = { aiSystemId: existing?.id ?? null, createdSystem: false, created: [], skippedExisting: [] };
  const pending = plan.filter((item) => {
    const already = existingDescriptions.some((description) => description.startsWith(riskPrefix(item.checkId)));
    if (already) report.skippedExisting.push(item.checkId);
    return !already;
  });

  if (options.dryRun) {
    report.created = pending.map((item) => item.checkId);
    report.createdSystem = !existing;
    return report;
  }

  let aiSystemId = existing?.id;
  if (!aiSystemId) {
    aiSystemId = (await api<{ id: string }>(baseUrl, "/api/ai-systems", { method: "POST", body: ficha.system })).id;
    report.createdSystem = true;
    report.aiSystemId = aiSystemId;
  }

  for (const item of pending) {
    const risk = await api<{ id: string }>(baseUrl, `/api/ai-systems/${aiSystemId}/risks`, { method: "POST", body: item.risk });
    const control = await api<{ id: string }>(baseUrl, `/api/risks/${risk.id}/controls`, {
      method: "POST",
      body: { name: item.control.name, status: item.control.status, isoDomainId: domainIdByCode.get(item.control.isoDomainCode) },
    });
    for (const evidence of item.evidence) {
      await api(baseUrl, `/api/controls/${control.id}/evidence`, { method: "POST", body: evidence });
    }
    report.created.push(item.checkId);
  }
  return report;
}
