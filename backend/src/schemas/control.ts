import { z } from "zod";

// PRD §4 US-03: estado del control (planificado/implementado/verificado).
export const controlStatus = z.enum(["planificado", "implementado", "verificado"]);

export const createControlSchema = z.object({
  name: z.string().trim().min(1),
  status: controlStatus,
  isoDomainId: z.string().trim().min(1),
});

export type CreateControlInput = z.infer<typeof createControlSchema>;
