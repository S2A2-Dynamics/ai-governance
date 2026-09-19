import { useState, type FormEvent } from "react";
import { ApiError, createAISystem } from "../api";
import type { AISystem, AISystemStatus } from "../types";

type Props = {
  onCreated: (system: AISystem) => void;
};

const EMPTY_FORM = {
  name: "",
  purpose: "",
  provider: "",
  gcpProject: "",
  status: "activo" as AISystemStatus,
};

export function AISystemForm({ onCreated }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const created = await createAISystem({
        name: form.name.trim(),
        purpose: form.purpose.trim(),
        provider: form.provider.trim(),
        gcpProject: form.gcpProject.trim() || undefined,
        status: form.status,
      });
      onCreated(created);
      setForm(EMPTY_FORM);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors?.fieldErrors) {
          const flattened: Record<string, string> = {};
          for (const [field, messages] of Object.entries(error.fieldErrors.fieldErrors)) {
            if (messages && messages.length > 0) {
              flattened[field] = messages[0];
            }
          }
          setFieldErrors(flattened);
        }
        setFormError(error.message);
      } else {
        setFormError("Error inesperado al crear el sistema de IA");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="ai-system-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="purpose">Propósito</label>
        <input
          id="purpose"
          value={form.purpose}
          onChange={(event) => setForm({ ...form, purpose: event.target.value })}
          required
        />
        {fieldErrors.purpose && <span className="field-error">{fieldErrors.purpose}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="provider">Provider</label>
        <input
          id="provider"
          value={form.provider}
          onChange={(event) => setForm({ ...form, provider: event.target.value })}
          required
        />
        {fieldErrors.provider && <span className="field-error">{fieldErrors.provider}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="gcpProject">GCP Project (opcional)</label>
        <input
          id="gcpProject"
          value={form.gcpProject}
          onChange={(event) => setForm({ ...form, gcpProject: event.target.value })}
        />
      </div>

      <div className="form-field">
        <label htmlFor="status">Estado</label>
        <select
          id="status"
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value as AISystemStatus })}
        >
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
        </select>
      </div>

      {formError && <p className="form-error">{formError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Creando…" : "Añadir sistema de IA"}
      </button>
    </form>
  );
}
