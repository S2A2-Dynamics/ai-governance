import { useEffect, useState, type FormEvent } from "react";
import {
  ApiError,
  createControl,
  createEvidence,
  createIncident,
  createRisk,
  fetchAISystemDetail,
  fetchIsoDomains,
} from "../api";
import type {
  AISystemDetail as AISystemDetailType,
  Control,
  ControlStatus,
  EvidenceType,
  IsoDomain,
  Risk,
  RiskCategory,
  RiskSeverity,
} from "../types";

type Props = {
  aiSystemId: string;
  onBack: () => void;
};

// Extrae los mensajes de error de campo de un ApiError, siguiendo el mismo
// patrón que AISystemForm.
function flattenFieldErrors(error: ApiError): Record<string, string> {
  const flattened: Record<string, string> = {};
  if (error.fieldErrors?.fieldErrors) {
    for (const [field, messages] of Object.entries(error.fieldErrors.fieldErrors)) {
      if (messages && messages.length > 0) {
        flattened[field] = messages[0];
      }
    }
  }
  return flattened;
}

export function AISystemDetail({ aiSystemId, onBack }: Props) {
  const [detail, setDetail] = useState<AISystemDetailType | null>(null);
  const [isoDomains, setIsoDomains] = useState<IsoDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | "todas">("todas");
  const [domainFilter, setDomainFilter] = useState<string>("todos");

  async function reload() {
    const [nextDetail, nextIsoDomains] = await Promise.all([
      fetchAISystemDetail(aiSystemId),
      fetchIsoDomains(),
    ]);
    setDetail(nextDetail);
    setIsoDomains(nextIsoDomains);
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchAISystemDetail(aiSystemId), fetchIsoDomains()])
      .then(([nextDetail, nextIsoDomains]) => {
        if (cancelled) return;
        setDetail(nextDetail);
        setIsoDomains(nextIsoDomains);
      })
      .catch(() => {
        if (!cancelled) setLoadError("No se pudo cargar el detalle del sistema de IA");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [aiSystemId]);

  if (loading) {
    return <p className="table-empty">Cargando detalle…</p>;
  }

  if (loadError || !detail) {
    return <p className="form-error">{loadError ?? "Sistema de IA no encontrado"}</p>;
  }

  const filteredRisks =
    severityFilter === "todas" ? detail.risks : detail.risks.filter((risk) => risk.severity === severityFilter);

  return (
    <div className="ai-system-detail">
      <button type="button" className="back-link" onClick={onBack}>
        ← Volver al inventario
      </button>

      <header className="detail-header">
        <h2>{detail.name}</h2>
        <span className={`status-pill status-pill--${detail.status}`}>{detail.status}</span>
      </header>
      <p className="ai-system-purpose">{detail.purpose}</p>
      <p className="detail-meta">
        Provider: {detail.provider} · GCP Project: {detail.gcpProject ?? "—"}
      </p>

      <section className="panel">
        <h3>Riesgos, controles y evidencia</h3>
        <div className="inline-form">
          <label className="form-field">
            Severidad
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as RiskSeverity | "todas")}>
              <option value="todas">Todas</option>
              {RISK_SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Dominio ISO
            <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
              <option value="todos">Todos</option>
              {isoDomains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.code} — {domain.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {detail.risks.length === 0 && <p className="table-empty">Todavía no hay riesgos registrados.</p>}
        {filteredRisks.length === 0 && detail.risks.length > 0 && (
          <p className="table-empty">Ningún riesgo coincide con los filtros seleccionados.</p>
        )}
        {filteredRisks.map((risk) => (
          <RiskCard key={risk.id} risk={risk} isoDomains={isoDomains} domainFilter={domainFilter} onChanged={reload} />
        ))}
        <RiskForm aiSystemId={aiSystemId} onCreated={reload} />
      </section>

      <section className="panel">
        <h3>Incidentes</h3>
        {detail.incidents.length === 0 && <p className="table-empty">No se han registrado incidentes.</p>}
        {detail.incidents.length > 0 && (
          <ul className="incident-list">
            {detail.incidents.map((incident) => (
              <li key={incident.id} className="incident-item">
                <span className={`severity-pill severity-pill--${incident.severity}`}>{incident.severity}</span>
                <span className="incident-description">{incident.description}</span>
                <span className="incident-dates">
                  Ocurrido: {new Date(incident.occurredAt).toLocaleDateString()}
                  {incident.resolvedAt && ` · Resuelto: ${new Date(incident.resolvedAt).toLocaleDateString()}`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <IncidentForm aiSystemId={aiSystemId} onCreated={reload} />
      </section>
    </div>
  );
}

const RISK_CATEGORIES: RiskCategory[] = ["sesgo", "privacidad", "seguridad", "transparencia", "robustez", "otro"];
const RISK_SEVERITIES: RiskSeverity[] = ["bajo", "medio", "alto", "critico"];
const CONTROL_STATUSES: ControlStatus[] = ["planificado", "implementado", "verificado"];
const EVIDENCE_TYPES: EvidenceType[] = ["texto", "enlace", "archivo"];

function RiskCard({
  risk,
  isoDomains,
  domainFilter,
  onChanged,
}: {
  risk: Risk;
  isoDomains: IsoDomain[];
  domainFilter: string;
  onChanged: () => Promise<void>;
}) {
  const filteredControls =
    domainFilter === "todos" ? risk.controls : risk.controls.filter((control) => control.isoDomain.id === domainFilter);

  return (
    <div className="risk-card">
      <div className="risk-header">
        <span className={`severity-pill severity-pill--${risk.severity}`}>{risk.severity}</span>
        <span className="risk-category">{risk.category}</span>
        <span className="risk-description">{risk.description}</span>
      </div>

      <div className="controls-list">
        {filteredControls.length === 0 && risk.controls.length > 0 && (
          <p className="table-empty">Ningún control coincide con el dominio seleccionado.</p>
        )}
        {filteredControls.map((control) => (
          <ControlCard key={control.id} control={control} onChanged={onChanged} />
        ))}
      </div>

      <ControlForm riskId={risk.id} isoDomains={isoDomains} onCreated={onChanged} />
    </div>
  );
}

function ControlCard({ control, onChanged }: { control: Control; onChanged: () => Promise<void> }) {
  return (
    <div className="control-card">
      <div className="control-header">
        <span className={`control-status-pill control-status-pill--${control.status}`}>{control.status}</span>
        <span className="control-name">{control.name}</span>
        <span className="control-domain">{control.isoDomain.code} — {control.isoDomain.name}</span>
      </div>

      {control.evidence.length > 0 && (
        <ul className="evidence-list">
          {control.evidence.map((evidence) => (
            <li key={evidence.id} className="evidence-item">
              <span className="evidence-type">{evidence.type}</span>
              <span className="evidence-content">{evidence.content}</span>
              <span className="evidence-meta">
                {evidence.registeredBy} · {new Date(evidence.registeredAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      <EvidenceForm controlId={control.id} onCreated={onChanged} />
    </div>
  );
}

function RiskForm({ aiSystemId, onCreated }: { aiSystemId: string; onCreated: () => Promise<void> }) {
  const [category, setCategory] = useState<RiskCategory>("otro");
  const [severity, setSeverity] = useState<RiskSeverity>("bajo");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      await createRisk(aiSystemId, { category, severity, description: description.trim() });
      setDescription("");
      await onCreated();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(flattenFieldErrors(error));
        setFormError(error.message);
      } else {
        setFormError("Error inesperado al crear el riesgo");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <p className="inline-form-title">Añadir riesgo</p>
      <div className="form-field">
        <label htmlFor={`risk-category-${aiSystemId}`}>Categoría</label>
        <select
          id={`risk-category-${aiSystemId}`}
          value={category}
          onChange={(event) => setCategory(event.target.value as RiskCategory)}
        >
          {RISK_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor={`risk-severity-${aiSystemId}`}>Severidad</label>
        <select
          id={`risk-severity-${aiSystemId}`}
          value={severity}
          onChange={(event) => setSeverity(event.target.value as RiskSeverity)}
        >
          {RISK_SEVERITIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor={`risk-description-${aiSystemId}`}>Descripción</label>
        <input
          id={`risk-description-${aiSystemId}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
        {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Creando…" : "Añadir riesgo"}
      </button>
    </form>
  );
}

function ControlForm({
  riskId,
  isoDomains,
  onCreated,
}: {
  riskId: string;
  isoDomains: IsoDomain[];
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<ControlStatus>("planificado");
  const [selectedIsoDomainId, setSelectedIsoDomainId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Valor derivado: si el usuario aún no eligió dominio, usar el primero disponible
  // una vez que isoDomains cargó (evita sincronizar estado con un efecto).
  const isoDomainId = selectedIsoDomainId || (isoDomains[0]?.id ?? "");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      await createControl(riskId, { name: name.trim(), status, isoDomainId });
      setName("");
      await onCreated();
    } catch (error) {
      if (error instanceof ApiError) {
        // controls.ts responde con { error: "isoDomainId not found" } (string plano)
        // cuando el dominio ISO no existe, distinto del shape Zod de flatten().
        setFieldErrors(flattenFieldErrors(error));
        setFormError(error.message);
      } else {
        setFormError("Error inesperado al crear el control");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <p className="inline-form-title">Añadir control</p>
      <div className="form-field">
        <label htmlFor={`control-name-${riskId}`}>Nombre</label>
        <input
          id={`control-name-${riskId}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor={`control-status-${riskId}`}>Estado</label>
        <select
          id={`control-status-${riskId}`}
          value={status}
          onChange={(event) => setStatus(event.target.value as ControlStatus)}
        >
          {CONTROL_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor={`control-domain-${riskId}`}>Dominio ISO</label>
        <select
          id={`control-domain-${riskId}`}
          value={isoDomainId}
          onChange={(event) => setSelectedIsoDomainId(event.target.value)}
        >
          {isoDomains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.code} — {domain.name}
            </option>
          ))}
        </select>
        {fieldErrors.isoDomainId && <span className="field-error">{fieldErrors.isoDomainId}</span>}
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <button type="submit" disabled={submitting || isoDomains.length === 0}>
        {submitting ? "Creando…" : "Añadir control"}
      </button>
    </form>
  );
}

function EvidenceForm({ controlId, onCreated }: { controlId: string; onCreated: () => Promise<void> }) {
  const [type, setType] = useState<EvidenceType>("texto");
  const [content, setContent] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      await createEvidence(controlId, { type, content: content.trim(), registeredBy: registeredBy.trim() });
      setContent("");
      setRegisteredBy("");
      await onCreated();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(flattenFieldErrors(error));
        setFormError(error.message);
      } else {
        setFormError("Error inesperado al registrar la evidencia");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inline-form inline-form--compact" onSubmit={handleSubmit}>
      <p className="inline-form-title">Añadir evidencia</p>
      <div className="form-field">
        <label htmlFor={`evidence-type-${controlId}`}>Tipo</label>
        <select
          id={`evidence-type-${controlId}`}
          value={type}
          onChange={(event) => setType(event.target.value as EvidenceType)}
        >
          {EVIDENCE_TYPES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor={`evidence-content-${controlId}`}>Contenido</label>
        <input
          id={`evidence-content-${controlId}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
        />
        {fieldErrors.content && <span className="field-error">{fieldErrors.content}</span>}
      </div>

      <div className="form-field">
        <label htmlFor={`evidence-registered-by-${controlId}`}>Registrado por</label>
        <input
          id={`evidence-registered-by-${controlId}`}
          value={registeredBy}
          onChange={(event) => setRegisteredBy(event.target.value)}
          required
        />
        {fieldErrors.registeredBy && <span className="field-error">{fieldErrors.registeredBy}</span>}
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Guardando…" : "Añadir evidencia"}
      </button>
    </form>
  );
}

function IncidentForm({ aiSystemId, onCreated }: { aiSystemId: string; onCreated: () => Promise<void> }) {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<RiskSeverity>("bajo");
  const [occurredAt, setOccurredAt] = useState("");
  const [resolvedAt, setResolvedAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      await createIncident(aiSystemId, {
        description: description.trim(),
        severity,
        occurredAt,
        resolvedAt: resolvedAt || undefined,
      });
      setDescription("");
      setOccurredAt("");
      setResolvedAt("");
      await onCreated();
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(flattenFieldErrors(error));
        setFormError(error.message);
      } else {
        setFormError("Error inesperado al registrar el incidente");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <p className="inline-form-title">Añadir incidente</p>
      <div className="form-field">
        <label htmlFor={`incident-description-${aiSystemId}`}>Descripción</label>
        <input
          id={`incident-description-${aiSystemId}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
        {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
      </div>

      <div className="form-field">
        <label htmlFor={`incident-severity-${aiSystemId}`}>Severidad</label>
        <select
          id={`incident-severity-${aiSystemId}`}
          value={severity}
          onChange={(event) => setSeverity(event.target.value as RiskSeverity)}
        >
          {RISK_SEVERITIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor={`incident-occurred-${aiSystemId}`}>Fecha de ocurrencia</label>
        <input
          id={`incident-occurred-${aiSystemId}`}
          type="date"
          value={occurredAt}
          onChange={(event) => setOccurredAt(event.target.value)}
          required
        />
        {fieldErrors.occurredAt && <span className="field-error">{fieldErrors.occurredAt}</span>}
      </div>

      <div className="form-field">
        <label htmlFor={`incident-resolved-${aiSystemId}`}>Fecha de resolución (opcional)</label>
        <input
          id={`incident-resolved-${aiSystemId}`}
          type="date"
          value={resolvedAt}
          onChange={(event) => setResolvedAt(event.target.value)}
        />
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Guardando…" : "Añadir incidente"}
      </button>
    </form>
  );
}
