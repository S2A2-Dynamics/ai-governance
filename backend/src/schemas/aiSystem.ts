import { z } from "zod";

// PRD §4 US-01: alta con nombre, propósito, modelo/proveedor, proyecto GCP y estado.
export const aiSystemStatus = z.enum(["activo", "pausado"]);

export const createAISystemSchema = z.object({
  name: z.string().trim().min(1),
  purpose: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  gcpProject: z.string().trim().min(1).optional(),
  status: aiSystemStatus,
});

export const updateAISystemSchema = createAISystemSchema.partial();

export type CreateAISystemInput = z.infer<typeof createAISystemSchema>;
export type UpdateAISystemInput = z.infer<typeof updateAISystemSchema>;
