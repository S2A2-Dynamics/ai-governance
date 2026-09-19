import express, { type ErrorRequestHandler } from "express";
import { aiSystemsRouter } from "./routes/aiSystems.js";
import { risksRouter } from "./routes/risks.js";
import { controlsRouter } from "./routes/controls.js";
import { evidenceRouter } from "./routes/evidence.js";
import { incidentsRouter } from "./routes/incidents.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { exportRouter } from "./routes/export.js";
import { isoDomainsRouter } from "./routes/isoDomains.js";

export const app = express();

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "ai-governance-api" });
});

app.use("/api/ai-systems", aiSystemsRouter);
app.use("/api/ai-systems/:id/risks", risksRouter);
app.use("/api", controlsRouter);
app.use("/api", evidenceRouter);
app.use("/api/ai-systems/:id/incidents", incidentsRouter);
app.use("/api", dashboardRouter);
app.use("/api", exportRouter);
app.use("/api/iso-domains", isoDomainsRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
};
app.use(errorHandler);
