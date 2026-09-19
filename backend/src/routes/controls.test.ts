import assert from "node:assert/strict";
import { test } from "node:test";
import http from "node:http";
import { app } from "../app.js";

// Contrato SDD PRD §15: "NUNCA existe un Control huérfano en el modelo de datos".
test("POST /api/risks/:id/controls rechaza con 4xx si el riskId no existe", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as { port: number };

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/risks/nonexistent-risk-id/controls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Control huérfano de prueba",
        status: "planificado",
        isoDomainId: "nonexistent-domain-id",
      }),
    });

    assert.ok(response.status >= 400 && response.status < 500, `expected 4xx, got ${response.status}`);
    const body = (await response.json()) as { error: string };
    assert.equal(body.error, "Risk not found");
  } finally {
    server.close();
  }
});
