import { z } from "zod";

// PRD §4 US-02: categoría/severidad como enum cerrado (PRD §9 T-06).
export const riskCategory = z.enum([
  "sesgo",
  "privacidad",
  "seguridad",
  "transparencia",
  "robustez",
  "otro",
]);
export const riskSeverity = z.enum(["bajo", "medio", "alto", "critico"]);

export const createRiskSchema = z.object({
  category: riskCategory,
  severity: riskSeverity,
  description: z.string().trim().min(1),
});

export type CreateRiskInput = z.infer<typeof createRiskSchema>;
