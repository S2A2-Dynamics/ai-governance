import assert from "node:assert/strict";
import { test } from "node:test";
import http from "node:http";
import { app } from "../app.js";

// US-04: Evidence nunca queda huérfana de un Control.
test("POST /api/controls/:id/evidence rechaza con 4xx si el controlId no existe", async () => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as { port: number };

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/controls/nonexistent-control-id/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "texto",
        content: "Evidencia huérfana de prueba",
        registeredBy: "tester",
      }),
    });

    assert.ok(response.status >= 400 && response.status < 500, `expected 4xx, got ${response.status}`);
    const body = (await response.json()) as { error: string };
    assert.equal(body.error, "Control not found");
  } finally {
    server.close();
  }
});
