import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Único tenant en v0.1 (PRD §3) — fijo hasta que exista multi-tenant real.
export const ORGANIZATION_ID = "s2a2-dynamics";
