import { Router } from "express";
import { ORGANIZATION_ID, prisma } from "../prisma.js";

export const exportRouter = Router();

type ExportRow = {
  recordType: "evidence" | "incident";
  aiSystemId: string;
  aiSystemName: string;
  riskId: string | null;
  riskCategory: string | null;
  riskSeverity: string | null;
  controlId: string | null;
  controlName: string | null;
  controlStatus: string | null;
  isoDomainCode: string | null;
  evidenceId: string | null;
  evidenceType: string | null;
  evidenceContent: string | null;
  registeredBy: string | null;
  registeredAt: string | null;
  incidentId: string | null;
  incidentDescription: string | null;
  incidentSeverity: string | null;
  occurredAt: string | null;
  resolvedAt: string | null;
};

const CSV_COLUMNS: (keyof ExportRow)[] = [
  "recordType",
  "aiSystemId",
  "aiSystemName",
  "riskId",
  "riskCategory",
  "riskSeverity",
  "controlId",
  "controlName",
  "controlStatus",
  "isoDomainCode",
  "evidenceId",
  "evidenceType",
  "evidenceContent",
  "registeredBy",
  "registeredAt",
  "incidentId",
  "incidentDescription",
  "incidentSeverity",
  "occurredAt",
  "resolvedAt",
];

// Escapa un valor para CSV (RFC 4180): entrecomilla si contiene coma, comilla o salto de línea.
function escapeCsvValue(value: string | null): string {
  if (value === null) return "";
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(rows: ExportRow[]): string {
  const header = CSV_COLUMNS.join(",");
  const lines = rows.map((row) => CSV_COLUMNS.map((column) => escapeCsvValue(row[column])).join(","));
  return [header, ...lines].join("\n");
}

// GET /api/export?format=json|csv — inventario completo aplanado para auditoría externa (US-08).
// Una fila por Evidence (trazabilidad control→evidencia) + una fila por Incident, unidas por
// aiSystemId. `format` inválido o ausente → JSON por defecto.
exportRouter.get("/export", async (request, response) => {
  const format = request.query.format === "csv" ? "csv" : "json";

  const aiSystems = await prisma.aISystem.findMany({
    where: { organizationId: ORGANIZATION_ID },
    include: {
      risks: {
        include: {
          controls: {
            include: { evidence: true, isoDomain: true },
          },
        },
      },
      incidents: true,
    },
  });

  const rows: ExportRow[] = [];

  for (const aiSystem of aiSystems) {
    for (const risk of aiSystem.risks) {
      for (const control of risk.controls) {
        for (const evidence of control.evidence) {
          rows.push({
            recordType: "evidence",
            aiSystemId: aiSystem.id,
            aiSystemName: aiSystem.name,
            riskId: risk.id,
            riskCategory: risk.category,
            riskSeverity: risk.severity,
            controlId: control.id,
            controlName: control.name,
            controlStatus: control.status,
            isoDomainCode: control.isoDomain.code,
            evidenceId: evidence.id,
            evidenceType: evidence.type,
            evidenceContent: evidence.content,
            registeredBy: evidence.registeredBy,
            registeredAt: evidence.registeredAt.toISOString(),
            incidentId: null,
            incidentDescription: null,
            incidentSeverity: null,
            occurredAt: null,
            resolvedAt: null,
          });
        }
      }
    }

    for (const incident of aiSystem.incidents) {
      rows.push({
        recordType: "incident",
        aiSystemId: aiSystem.id,
        aiSystemName: aiSystem.name,
        riskId: null,
        riskCategory: null,
        riskSeverity: null,
        controlId: null,
        controlName: null,
        controlStatus: null,
        isoDomainCode: null,
        evidenceId: null,
        evidenceType: null,
        evidenceContent: null,
        registeredBy: null,
        registeredAt: null,
        incidentId: incident.id,
        incidentDescription: incident.description,
        incidentSeverity: incident.severity,
        occurredAt: incident.occurredAt.toISOString(),
        resolvedAt: incident.resolvedAt ? incident.resolvedAt.toISOString() : null,
      });
    }
  }

  if (format === "csv") {
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", 'attachment; filename="ai-governance-export.csv"');
    response.send(toCsv(rows));
    return;
  }

  response.json(rows);
});
