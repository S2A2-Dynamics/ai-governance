# Roadmap — AI Governance Framework

> Este documento recoge ideas y diseños de arquitectura que están **fuera de alcance de
> v0.1** (ver PRD §10) pero que se documentan para no perderlas. Nada de esta sección es
> código ni compromiso de implementación — es diseño conceptual a validar cuando exista
> la pieza real con la que integrar.

## TokenPulse como "AI Control Plane" (conceptual, no implementado)

**Estado**: idea de arquitectura futura. No existe hoy código ni API de TokenPulse en
este workspace (`s2a2-projects`) contra la cual integrar — por eso v0.1 no incluye
ninguna integración real, solo este diseño.

**Idea**: si TokenPulse (proyecto de monitoreo de coste/uso de LLM en los sistemas de
S2A2, ver `feedback/gemini_cost_thinking_levers.md` y memorias de FinOps) llega a exponer
una API de telemetría por llamada (modelo, tokens, coste, proyecto GCP origen), el AI
Governance Framework podría consumirla como fuente de **Evidence** automática:

```
TokenPulse (fuente de telemetría real de uso LLM)
      │  API/export (a definir cuando exista)
      ▼
AI Governance Framework
      │
      ├─ cada llamada LLM con coste/tokens → candidata a Evidence de un Control de
      │  "monitoreo de uso" (dominio ISO: Recursos / Operación)
      └─ picos anómalos de uso → candidatos a Incident automático (revisión humana
         antes de confirmarlo, nunca auto-creado sin HITL)
```

**Por qué queda solo como diseño y no como ticket**: construir contra un contrato de API
que no existe todavía sería adivinar la interfaz — alto riesgo de rehacer el trabajo
cuando TokenPulse defina su contrato real. Regla del workspace: no escribir código sin
≥95% de certeza sobre la solución (CLAUDE.md, Estándares de Calidad).

**Cuándo revisitar**: cuando TokenPulse tenga un endpoint o export estable, escribir un
PRD/ticket específico de "Integración TokenPulse → Evidence automática" con el contrato
real de esa API, no con esta especulación.

## Otras ideas futuras (backlog, sin priorizar)

- RBAC multi-usuario y multi-tenant real (abrir a clientes externos).
- Exportación de informe de auditoría formateado (PDF) para EU AI Act.
- Ingesta semi-automática del inventario inicial desde las memorias/BITACORA de cada
  proyecto S2A2 (parseo asistido, siempre con validación humana antes de persistir).
