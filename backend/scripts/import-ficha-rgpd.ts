// Uso: npx tsx scripts/import-ficha-rgpd.ts <ruta/ficha-rgpd.json> [--dry-run] [--api http://localhost:3000]
// Importa una «Ficha RGPD del agente» (skill rgpd-agentes) contra la API del framework.
import { readFile } from "node:fs/promises";
import { fichaSchema, importFicha } from "../src/import/fichaRgpd.js";

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith("--") && args[args.indexOf(arg) - 1] !== "--api");
const dryRun = args.includes("--dry-run");
const apiIndex = args.indexOf("--api");
const baseUrl = apiIndex >= 0 ? args[apiIndex + 1] : (process.env.AIGF_API ?? "http://localhost:3000");

if (!file) {
  console.error("Uso: npx tsx scripts/import-ficha-rgpd.ts <ficha-rgpd.json> [--dry-run] [--api URL]");
  process.exit(2);
}

const parsed = fichaSchema.safeParse(JSON.parse(await readFile(file, "utf8")));
if (!parsed.success) {
  console.error(`Ficha inválida (${file}):`);
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

const report = await importFicha(baseUrl, parsed.data, { dryRun });
const verb = dryRun ? "Se crearían" : "Creados";
console.log(`${parsed.data.system.name}${report.createdSystem ? " (AISystem nuevo)" : ""}`);
console.log(`  ${verb}: ${report.created.join(", ") || "—"}`);
console.log(`  Ya existían (no se tocan): ${report.skippedExisting.join(", ") || "—"}`);
