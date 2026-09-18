import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "ai-governance-api" });
});

app.listen(port, () => {
  console.log(`AI Governance API listening on http://localhost:${port}`);
});
