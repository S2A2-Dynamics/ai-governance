import { z } from "zod";

// PRD §8: Evidence.type ∈ [texto/enlace/archivo].
export const evidenceType = z.enum(["texto", "enlace", "archivo"]);

export const createEvidenceSchema = z.object({
  type: evidenceType,
  content: z.string().trim().min(1),
  registeredBy: z.string().trim().min(1),
});

export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>;
