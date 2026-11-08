import { FichaAiAct, AiActCheck } from "../schemas/aiAct.js";

// Importa una «Ficha de Transparencia y Conformidad AI Act (Art. 50)»
// a través de la API REST pública, garantizando el contrato PRD §15.

export type PlannedControlAiAct = {
  checkId: string;
  risk: { category: AiActCheck["category"]; severity: AiActCheck["severity"]; description: string };
  control: { name: string; status: "planificado" | "implementado"; isoDomainCode: string };
  evidence: { type: "texto" | "enlace" | "archivo"; content: string; registeredBy: string }[];
};

export const riskPrefixAiAct = (checkId: string) => `[AI-ACT ${checkId}]`;

export function planImportAiAct(ficha: FichaAiAct): PlannedControlAiAct[] {
  const registeredBy = `import-ai-act@${ficha.commit}`;
  return ficha.checks
    .filter((check) => check.status !== "na")
    .map((check) => {
      const mitigated = check.status === "pass";
      const actionText = check.action ? ` Medida correctiva: ${check.action}` : "";
      return {
        checkId: check.id,
        risk: {
          category: check.category,
          severity: check.severity,
          description: `${riskPrefixAiAct(check.id)} ${check.article}: ${check.title}. Hallazgo: ${check.finding}.${actionText}`,
        },
        control: {
          name: `${check.id} (${check.article}) — ${check.title}`,
          status: mitigated ? "implementado" : "planificado",
          isoDomainCode: check.isoDomainCode,
        },
        evidence: mitigated ? check.evidence.map((item) => ({ ...item, registeredBy })) : [],
      };
    });
}

export type ImportReportAiAct = {
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

export async function importFichaAiAct(
  baseUrl: string,
  ficha: FichaAiAct,
  options: { dryRun: boolean }
): Promise<ImportReportAiAct> {
  const plan = planImportAiAct(ficha);
  const domains = await api<{ id: string; code: string }[]>(baseUrl, "/api/iso-domains");
  const domainIdByCode = new Map(domains.map((d) => [d.code, d.id]));
  const missing = [...new Set(plan.map((item) => item.control.isoDomainCode))].filter(
    (code) => !domainIdByCode.has(code)
  );
  if (missing.length > 0) {
    throw new Error(`Dominios ISO inexistentes en la API: ${missing.join(", ")} (¿falta db seed?)`);
  }

  const systems = await api<{ id: string; name: string }[]>(baseUrl, "/api/ai-systems");
  const existing = systems.find((s) => s.name === ficha.system.name);
  const existingDescriptions = existing
    ? (await api<AISystemDetail>(baseUrl, `/api/ai-systems/${existing.id}`)).risks.map((r) => r.description)
    : [];

  const report: ImportReportAiAct = {
    aiSystemId: existing?.id ?? null,
    createdSystem: false,
    created: [],
    skippedExisting: [],
  };

  const pending = plan.filter((item) => {
    const already = existingDescriptions.some((desc) => desc.startsWith(riskPrefixAiAct(item.checkId)));
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
    aiSystemId = (
      await api<{ id: string }>(baseUrl, "/api/ai-systems", {
        method: "POST",
        body: ficha.system,
      })
    ).id;
    report.createdSystem = true;
    report.aiSystemId = aiSystemId;
  }

  for (const item of pending) {
    const risk = await api<{ id: string }>(baseUrl, `/api/ai-systems/${aiSystemId}/risks`, {
      method: "POST",
      body: item.risk,
    });
    const control = await api<{ id: string }>(baseUrl, `/api/risks/${risk.id}/controls`, {
      method: "POST",
      body: {
        name: item.control.name,
        status: item.control.status,
        isoDomainId: domainIdByCode.get(item.control.isoDomainCode),
      },
    });
    for (const evidence of item.evidence) {
      await api(baseUrl, `/api/controls/${control.id}/evidence`, {
        method: "POST",
        body: evidence,
      });
    }
    report.created.push(item.checkId);
  }
  return report;
}
