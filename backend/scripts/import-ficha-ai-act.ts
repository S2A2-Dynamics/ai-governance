// Uso: npx tsx scripts/import-ficha-ai-act.ts <ruta/ficha-ai-act.json> [--dry-run] [--api URL] [--export-html out.html] [--export-md out.md]
import { readFile, writeFile } from "node:fs/promises";
import { fichaAiActSchema } from "../src/schemas/aiAct.js";
import { importFichaAiAct } from "../src/import/fichaAiAct.js";
import { generateAiActHtml, generateAiActMarkdown } from "../src/export/aiActDocument.js";

const args = process.argv.slice(2);
const file = args.find(
  (arg, idx) =>
    !arg.startsWith("--") &&
    args[idx - 1] !== "--api" &&
    args[idx - 1] !== "--export-html" &&
    args[idx - 1] !== "--export-md"
);

const dryRun = args.includes("--dry-run");
const apiIndex = args.indexOf("--api");
const baseUrl = apiIndex >= 0 ? args[apiIndex + 1] : process.env.AIGF_API ?? "http://localhost:3000";

const htmlIndex = args.indexOf("--export-html");
const htmlPath = htmlIndex >= 0 ? args[htmlIndex + 1] : null;

const mdIndex = args.indexOf("--export-md");
const mdPath = mdIndex >= 0 ? args[mdIndex + 1] : null;

if (!file) {
  console.error(
    "Uso: npx tsx scripts/import-ficha-ai-act.ts <ficha-ai-act.json> [--dry-run] [--api URL] [--export-html out.html] [--export-md out.md]"
  );
  process.exit(2);
}

const rawContent = await readFile(file, "utf8");
const parsed = fichaAiActSchema.safeParse(JSON.parse(rawContent));
if (!parsed.success) {
  console.error(`Ficha AI Act inválida (${file}):`);
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const ficha = parsed.data;

if (htmlPath) {
  const html = generateAiActHtml(ficha);
  await writeFile(htmlPath, html, "utf8");
  console.log(`✓ HTML imprimible exportado a: ${htmlPath}`);
}

if (mdPath) {
  const md = generateAiActMarkdown(ficha);
  await writeFile(mdPath, md, "utf8");
  console.log(`✓ Markdown exportado a: ${mdPath}`);
}

// Si no se pide solo exportación de archivos sin API
if (!args.includes("--only-export")) {
  try {
    const report = await importFichaAiAct(baseUrl, ficha, { dryRun });
    const verb = dryRun ? "Se crearían" : "Creados";
    console.log(`${ficha.system.name}${report.createdSystem ? " (AISystem nuevo)" : ""}`);
    console.log(`  ${verb}: ${report.created.join(", ") || "—"}`);
    console.log(`  Ya existían (no se tocan): ${report.skippedExisting.join(", ") || "—"}`);
  } catch (err) {
    if (htmlPath || mdPath) {
      console.warn(`Aviso de importación API (${baseUrl}): ${(err as Error).message}`);
    } else {
      console.error(`Error importando a ${baseUrl}: ${(err as Error).message}`);
      process.exit(1);
    }
  }
}
