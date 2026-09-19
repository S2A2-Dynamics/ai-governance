import { z } from "zod";
import { riskSeverity } from "./risk.js";

export const createIncidentSchema = z.object({
  description: z.string().trim().min(1),
  severity: riskSeverity,
  occurredAt: z.coerce.date(),
  resolvedAt: z.coerce.date().optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
