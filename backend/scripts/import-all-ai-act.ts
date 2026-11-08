import http from "node:http";
import { readFile } from "node:fs/promises";
import { app } from "../src/app.js";
import { fichaAiActSchema } from "../src/schemas/aiAct.js";
import { importFichaAiAct } from "../src/import/fichaAiAct.js";

const files = [
  "../../CRMWhapi/docs/ficha-ai-act.json",
  "../../xanadu/xanadu-repo/docs/ficha-ai-act.json",
  "../../wa-kb-bot/docs/ficha-ai-act.json",
  "../../C21V/docs/ficha-ai-act.json",
];

const server = http.createServer(app);
await new Promise<void>((resolve) => server.listen(0, resolve));
const { port } = server.address() as { port: number };
const baseUrl = `http://127.0.0.1:${port}`;

console.log(`=== Ingesta de Fichas AI Act (Art. 50) en AI Governance Framework ===`);
console.log(`API temporal activa en: ${baseUrl}`);

try {
  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const parsed = fichaAiActSchema.parse(JSON.parse(raw));
    const report = await importFichaAiAct(baseUrl, parsed, { dryRun: false });
    console.log(`\n• ${parsed.system.name}${report.createdSystem ? " [AISystem creado]" : " [AISystem existente]"}:`);
    console.log(`  - Nuevos controles AI Act creados: ${report.created.length > 0 ? report.created.join(", ") : "0"}`);
    console.log(`  - Controles existentes omitidos: ${report.skippedExisting.length > 0 ? report.skippedExisting.join(", ") : "0"}`);
  }
} finally {
  server.close();
}
console.log(`\n✓ Ingesta completada con éxito.`);
