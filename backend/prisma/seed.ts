import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const organizationId = "s2a2-dynamics";

// ISO/IEC 42001:2023, Annex A control groups A.2 through A.10.
const isoDomains = [
  { code: "A.2", name: "Políticas relacionadas con IA" },
  { code: "A.3", name: "Organización interna" },
  { code: "A.4", name: "Recursos para sistemas de IA" },
  { code: "A.5", name: "Evaluación de impactos de sistemas de IA" },
  { code: "A.6", name: "Ciclo de vida de sistemas de IA" },
  { code: "A.7", name: "Datos para sistemas de IA" },
  { code: "A.8", name: "Información para partes interesadas" },
  { code: "A.9", name: "Uso de sistemas de IA" },
  { code: "A.10", name: "Relaciones con terceros y clientes" },
] as const;

async function main() {
  await prisma.organization.upsert({
    where: { id: organizationId },
    update: { name: "S2A2 Dynamics" },
    create: { id: organizationId, name: "S2A2 Dynamics" },
  });

  for (const [index, domain] of isoDomains.entries()) {
    await prisma.isoDomain.upsert({
      where: {
        organizationId_code: {
          organizationId,
          code: domain.code,
        },
      },
      update: {
        name: domain.name,
        sortOrder: index + 1,
      },
      create: {
        organizationId,
        code: domain.code,
        name: domain.name,
        sortOrder: index + 1,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
