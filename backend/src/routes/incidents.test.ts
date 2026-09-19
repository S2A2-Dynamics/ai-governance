import assert from "node:assert/strict";
import { test } from "node:test";
import http from "node:http";
import { app } from "../app.js";

// US-05: Incident nunca queda huérfano de un AISystem.
test("POST /api/ai-systems/:id/incidents rechaza con 4xx si el aiSystemId no existe", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as { port: number };

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/ai-systems/nonexistent-ai-system-id/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Incidente huérfano de prueba",
        severity: "alto",
        occurredAt: "2026-09-18T00:00:00.000Z",
      }),
    });

    assert.ok(response.status >= 400 && response.status < 500, `expected 4xx, got ${response.status}`);
    const body = (await response.json()) as { error: string };
    assert.equal(body.error, "AISystem not found");
  } finally {
    server.close();
  }
});
