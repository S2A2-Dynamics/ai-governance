import { z } from "zod";
import { createAISystemSchema } from "./aiSystem.js";
import { riskCategory, riskSeverity } from "./risk.js";

// Clasificación de Riesgo según el Reglamento (UE) 2024/1689 (EU AI Act)
export const aiActRiskClassification = z.enum([
  "minimo", // Sistemas de riesgo mínimo o nulo (videojuegos, filtros de spam estándar)
  "especifico_transparencia", // Sistemas con riesgo específico de transparencia (Art. 50: chatbots, síntesis de voz, generación de texto)
  "alto_riesgo", // Sistemas de alto riesgo (Anexos I y III: infraestructuras críticas, recursos humanos, solvencia crediticia)
  "inadmisible", // Prácticas prohibidas de IA (Art. 5: manipulación subliminal, puntuación social)
]);

export const checkStatus = z.enum(["pass", "partial", "fail", "unknown", "na"]);

export const aiActCheckId = z.enum([
  "AIA-50.1", // Deber de informar al usuario sobre la interacción con una IA
  "AIA-50.2", // Marcado y detectabilidad de contenidos sintéticos (audio, texto, imagen)
  "AIA-50.3", // Exclusión de biometría e inferencia emocional no autorizada
  "AIA-50.4", // Exclusión de deepfakes y contenidos engañosos
  "AIA-50.5", // Instrucciones de uso para el desplegador y supervisión humana (HITL)
  "AIA-GRD",  // Guardrails técnicos y robustez (ISO 27090, anti-inyección, PII guard)
]);

export const aiActCheckSchema = z.object({
  id: aiActCheckId,
  article: z.string().trim().min(1),
  title: z.string().trim().min(1),
  status: checkStatus,
  category: riskCategory,
  severity: riskSeverity,
  finding: z.string().trim().min(1),
  action: z.string().default(""),
  isoDomainCode: z.string().trim().min(1), // Mapeo a ISO/IEC 42001 (A.8, A.5, A.9, A.10)
  evidence: z
    .array(
      z.object({
        type: z.enum(["texto", "enlace", "archivo"]),
        content: z.string().trim().min(1),
      })
    )
    .default([]),
});

export const deployerSchema = z.object({
  name: z.string().trim().min(1),
  sector: z.string().trim().min(1),
  contactEmail: z.string().email().optional(),
  jurisdiction: z.string().default("España / Unión Europea"),
});

export const foundationModelSchema = z.object({
  provider: z.string().trim().min(1), // ej. "Google Cloud (Vertex AI)"
  modelName: z.string().trim().min(1), // ej. "gemini-2.5-flash"
  hostingRegion: z.string().trim().min(1), // ej. "europe-west1 (Bélgica / UE)"
  dataRetentionPolicy: z.string().trim().min(1), // ej. "No-train: los datos no se utilizan para reentrenar modelos públicos"
});

export const fichaAiActSchema = z
  .object({
    formatVersion: z.literal(1),
    auditedAt: z.string().trim().min(1),
    commit: z.string().trim().min(1),
    system: createAISystemSchema,
    deployer: deployerSchema,
    classification: aiActRiskClassification,
    foundationModel: foundationModelSchema,
    checks: z.array(aiActCheckSchema).min(1),
  })
  .superRefine((ficha, ctx) => {
    ficha.checks.forEach((check, index) => {
      // Contrato PRD §15: un pass sin evidencia no es admisible; fail o unknown no pueden llevar evidencia de cumplimiento.
      if (check.status === "pass" && check.evidence.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["checks", index, "evidence"],
          message: `${check.id}: pass sin evidencia`,
        });
      }
      if ((check.status === "fail" || check.status === "unknown") && check.evidence.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["checks", index, "evidence"],
          message: `${check.id}: ${check.status} no admite evidencia`,
        });
      }
    });

    const ids = ficha.checks.map((c) => c.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        path: ["checks"],
        message: "IDs de comprobación AI Act duplicados",
      });
    }
  });

export type FichaAiAct = z.infer<typeof fichaAiActSchema>;
export type AiActCheck = FichaAiAct["checks"][number];
