import { FichaAiAct } from "../schemas/aiAct.js";

/**
 * Genera la representación en Markdown de la Ficha Técnica de Transparencia (Art. 50 AI Act).
 */
export function generateAiActMarkdown(ficha: FichaAiAct): string {
  const statusBadge = (s: string) => {
    switch (s) {
      case "pass":
        return "✅ CUMPLE";
      case "partial":
        return "⚠️ PARCIAL";
      case "fail":
        return "❌ NO CUMPLE";
      case "na":
        return "⚪ N/A";
      default:
        return "❓ POR VERIFICAR";
    }
  };

  const rows = ficha.checks
    .map(
      (c) =>
        `| **${c.id}** (${c.article}) | ${c.title} | ${statusBadge(c.status)} | ${c.finding} | ${
          c.action || "—"
        } | ${c.evidence.map((e) => `\`${e.content}\``).join("<br>") || "—"} |`
    )
    .join("\n");

  return `# Ficha Técnica de Transparencia y Conformidad — Art. 50 EU AI Act
> **Reglamento (UE) 2024/1689 sobre Inteligencia Artificial**
> Fecha de Auditoría: ${ficha.auditedAt} · Commit: \`${ficha.commit}\` · Formato v${ficha.formatVersion}

---

## 1. Identificación del Sistema y Agentes Responsables

| Parámetro | Detalle |
|---|---|
| **Sistema de IA** | **${ficha.system.name}** (${ficha.system.status}) |
| **Finalidad Operativa** | ${ficha.system.purpose} |
| **Proveedor Tecnológico** | ${ficha.system.provider} (Desarrollo y Arquitectura por S2A2 Dynamics) |
| **Desplegador ("Deployer")** | **${ficha.deployer.name}** (${ficha.deployer.sector}) |
| **Contacto Desplegador** | ${ficha.deployer.contactEmail || "No especificado"} |
| **Jurisdicción de Aplicación** | ${ficha.deployer.jurisdiction} |
| **Clasificación AI Act** | **Riesgo Específico de Transparencia (Artículo 50)** |

---

## 2. Pila Tecnológica del Modelo Fundacional

| Componente | Especificación |
|---|---|
| **Proveedor de Infraestructura** | ${ficha.foundationModel.provider} |
| **Modelo Base Subyacente** | \`${ficha.foundationModel.modelName}\` |
| **Región de Procesamiento** | ${ficha.foundationModel.hostingRegion} |
| **Política de Retención y Reentrenamiento** | ${ficha.foundationModel.dataRetentionPolicy} |

---

## 3. Matriz de Cumplimiento Normativo (Artículo 50)

| Código | Requisito Legal | Estado | Hallazgo Técnico | Medida Correctiva | Evidencia (\`archivo:línea\`) |
|---|---|---|---|---|---|
${rows}

---

## 4. Instrucciones Obligatorias para el Desplegador ("Deployer Guidelines")

En virtud del **Artículo 50 del Reglamento (UE) 2024/1689**, el cliente corporativo (Desplegador) debe garantizar operativamente:
1. **Conservación del Aviso al Usuario**: No eliminar, alterar ni enmascarar los mensajes iniciales del sistema que informan al usuario que está interactuando con un asistente de inteligencia artificial.
2. **Supervisión Humana Activa (HITL)**: Mantener un protocolo de relevo inmediato a un agente o asesor humano en caso de que el interlocutor solicite asistencia personal, reporte inconformidad o requiera tramitaciones legales formales.
3. **Custodia Documental**: Conservar esta Ficha Técnica en el Registro de Actividades de Tratamiento (RAT) y a disposición de la Agencia Española de Protección de Datos (AEPD) o la autoridad de supervisión competente.
`;
}

/**
 * Genera el documento HTML ejecutivo imprimible (Print-ready / PDF) para el cliente corporativo.
 */
export function generateAiActHtml(ficha: FichaAiAct): string {
  const statusBadgeHtml = (s: string) => {
    switch (s) {
      case "pass":
        return '<span class="badge badge-pass">✓ CUMPLE</span>';
      case "partial":
        return '<span class="badge badge-partial">⚠ PARCIAL</span>';
      case "fail":
        return '<span class="badge badge-fail">✕ NO CUMPLE</span>';
      case "na":
        return '<span class="badge badge-na">N/A</span>';
      default:
        return '<span class="badge badge-unknown">? PENDIENTE</span>';
    }
  };

  const rowsHtml = ficha.checks
    .map(
      (c) => `
      <tr>
        <td class="col-id"><strong>${c.id}</strong><br><small class="text-muted">${c.article}</small></td>
        <td class="col-title"><strong>${c.title}</strong><br><span class="finding-text">${c.finding}</span></td>
        <td class="col-status">${statusBadgeHtml(c.status)}</td>
        <td class="col-action">${c.action || '<span class="text-muted">—</span>'}</td>
        <td class="col-evidence">${
          c.evidence.map((e) => `<code class="ev-code">${e.content}</code>`).join("<br>") ||
          '<span class="text-muted">—</span>'
        }</td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ficha de Transparencia AI Act — ${ficha.system.name}</title>
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-light: #eff6ff;
      --accent: #2563eb;
      --text: #0f172a;
      --text-muted: #64748b;
      --bg: #ffffff;
      --card-bg: #f8fafc;
      --border: #e2e8f0;
      --pass: #15803d;
      --pass-bg: #dcfce7;
      --warn: #b45309;
      --warn-bg: #fef3c7;
      --fail: #b91c1c;
      --fail-bg: #fee2e2;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: var(--text);
      background-color: var(--bg);
      line-height: 1.5;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      border-bottom: 2px solid var(--primary);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .logo-badge {
      font-weight: 800;
      font-size: 1.1rem;
      letter-spacing: -0.5px;
      color: var(--primary);
    }
    .reg-tag {
      background: var(--primary-light);
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 6px;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .meta-item strong {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin-bottom: 2px;
    }
    .meta-item span {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text);
    }
    section {
      margin-bottom: 35px;
    }
    h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 15px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
      margin-bottom: 20px;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: var(--card-bg);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .col-id { width: 14%; }
    .col-title { width: 40%; }
    .col-status { width: 14%; text-align: center; }
    .col-action { width: 16%; }
    .col-evidence { width: 16%; }
    .finding-text {
      font-size: 0.82rem;
      color: #334155;
      display: inline-block;
      margin-top: 3px;
    }
    .ev-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.75rem;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 3px;
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .badge-pass { background: var(--pass-bg); color: var(--pass); }
    .badge-partial { background: var(--warn-bg); color: var(--warn); }
    .badge-fail { background: var(--fail-bg); color: var(--fail); }
    .badge-na { background: #f1f5f9; color: #64748b; }
    .badge-unknown { background: #fef08a; color: #854d0e; }
    .notice-box {
      background: #f8fafc;
      border-left: 4px solid var(--accent);
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      font-size: 0.9rem;
      color: #334155;
    }
    .notice-box ol {
      margin-left: 20px;
      margin-top: 8px;
    }
    .notice-box li {
      margin-bottom: 6px;
    }
    footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    @media print {
      body { padding: 0; }
      .container { max-width: 100%; }
      .notice-box { break-inside: avoid; }
      tr { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-top">
        <div class="logo-badge">S2A2 DYNAMICS · AI GOVERNANCE</div>
        <div class="reg-tag">Reglamento (UE) 2024/1689 · Art. 50</div>
      </div>
      <h1>Ficha de Transparencia y Conformidad de IA</h1>
      <p class="subtitle">Documentación técnica obligatoria para el Desplegador ("Deployer") bajo la Ley Europea de IA</p>
    </header>

    <div class="meta-grid">
      <div class="meta-item">
        <strong>Sistema de Inteligencia Artificial</strong>
        <span>${ficha.system.name}</span>
      </div>
      <div class="meta-item">
        <strong>Desplegador Responsable</strong>
        <span>${ficha.deployer.name} (${ficha.deployer.sector})</span>
      </div>
      <div class="meta-item">
        <strong>Clasificación Regulatoria</strong>
        <span>Riesgo Específico de Transparencia (Art. 50)</span>
      </div>
      <div class="meta-item">
        <strong>Modelo Subyacente e Infraestructura</strong>
        <span>${ficha.foundationModel.modelName} · ${ficha.foundationModel.hostingRegion}</span>
      </div>
      <div class="meta-item">
        <strong>Proveedor Tecnológico</strong>
        <span>${ficha.system.provider} / S2A2 Dynamics S.L.</span>
      </div>
      <div class="meta-item">
        <strong>Fecha de Auditoría & Commit</strong>
        <span>${ficha.auditedAt} · <code>${ficha.commit}</code></span>
      </div>
    </div>

    <section>
      <h2>Evaluación de Obligaciones de Transparencia (Art. 50)</h2>
      <table>
        <thead>
          <tr>
            <th class="col-id">Artículo</th>
            <th class="col-title">Requisito & Diagnóstico</th>
            <th class="col-status">Estado</th>
            <th class="col-action">Medida</th>
            <th class="col-evidence">Evidencia</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Obligaciones Operativas para el Desplegador</h2>
      <div class="notice-box">
        <p><strong>Para mantener la plena validez de esta certificación de conformidad, el Desplegador se compromete a:</strong></p>
        <ol>
          <li><strong>Mantener el Aviso Conversacional</strong>: No desactivar ni alterar los mensajes de saludo o etiquetas que indican a los usuarios finales que están dialogando con un asistente de IA.</li>
          <li><strong>Supervisión Humana (HITL)</strong>: Asegurar que el personal de la empresa esté disponible para retomar conversaciones cuando el usuario final exprese disconformidad o solicite hablar con una persona.</li>
          <li><strong>Custodia Regulatoria</strong>: Incorporar este certificado al Registro de Actividades de Tratamiento (RAT) y mantenerlo disponible ante solicitudes de la AEPD o autoridades europeas.</li>
        </ol>
      </div>
    </section>

    <footer>
      Documento generado automáticamente por S2A2 AI Governance Framework · Certificación de Cumplimiento Normativo UE AI Act
    </footer>
  </div>
</body>
</html>
`;
}
