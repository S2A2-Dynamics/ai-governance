import type {
  AISystem,
  AISystemDetail,
  ApiFieldErrors,
  Control,
  CreateAISystemInput,
  CreateControlInput,
  CreateEvidenceInput,
  CreateIncidentInput,
  CreateRiskInput,
  Evidence,
  Incident,
  IsoDomain,
  MaturityDomain,
  Risk,
} from "./types";

export class ApiError extends Error {
  status: number;
  fieldErrors?: ApiFieldErrors;

  constructor(status: number, message: string, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function fetchAISystems(): Promise<AISystem[]> {
  const response = await fetch("/api/ai-systems");
  if (!response.ok) {
    throw new ApiError(response.status, "No se pudo cargar el inventario de sistemas de IA");
  }
  return (await response.json()) as AISystem[];
}

export async function createAISystem(input: CreateAISystemInput): Promise<AISystem> {
  const response = await fetch("/api/ai-systems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.status === 409) {
    throw new ApiError(409, "Ya existe un sistema de IA con ese nombre");
  }
  if (response.status === 400) {
    const body = (await response.json()) as { error: ApiFieldErrors };
    throw new ApiError(400, "Datos inválidos", body.error);
  }
  if (!response.ok) {
    throw new ApiError(response.status, "No se pudo crear el sistema de IA");
  }

  return (await response.json()) as AISystem;
}

export async function fetchAISystemDetail(id: string): Promise<AISystemDetail> {
  const response = await fetch(`/api/ai-systems/${id}`);
  if (!response.ok) {
    throw new ApiError(response.status, "No se pudo cargar el detalle del sistema de IA");
  }
  return (await response.json()) as AISystemDetail;
}

export async function fetchIsoDomains(): Promise<IsoDomain[]> {
  const response = await fetch("/api/iso-domains");
  if (!response.ok) {
    throw new ApiError(response.status, "No se pudo cargar el catálogo de dominios ISO");
  }
  return (await response.json()) as IsoDomain[];
}

export async function fetchMaturity(): Promise<MaturityDomain[]> {
  const response = await fetch("/api/dashboard/maturity");
  if (!response.ok) {
    throw new ApiError(response.status, "No se pudo cargar el dashboard de madurez");
  }
  return (await response.json()) as MaturityDomain[];
}

async function post400or404<T>(url: string, input: unknown, notFoundMessage: string, invalidMessage: string): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.status === 404) {
    throw new ApiError(404, notFoundMessage);
  }
  if (response.status === 400) {
    const body = (await response.json()) as { error: ApiFieldErrors | string };
    // controls.ts responde con { error: "isoDomainId not found" } (string plano)
    // en vez del shape de Zod flatten() que usan el resto de rutas.
    if (typeof body.error === "string") {
      throw new ApiError(400, body.error, { fieldErrors: { isoDomainId: [body.error] } });
    }
    throw new ApiError(400, invalidMessage, body.error);
  }
  if (!response.ok) {
    throw new ApiError(response.status, invalidMessage);
  }

  return (await response.json()) as T;
}

export function createRisk(aiSystemId: string, input: CreateRiskInput): Promise<Risk> {
  return post400or404<Risk>(
    `/api/ai-systems/${aiSystemId}/risks`,
    input,
    "El sistema de IA no existe",
    "Datos inválidos",
  );
}

export function createControl(riskId: string, input: CreateControlInput): Promise<Control> {
  return post400or404<Control>(`/api/risks/${riskId}/controls`, input, "El riesgo no existe", "Datos inválidos");
}

export function createEvidence(controlId: string, input: CreateEvidenceInput): Promise<Evidence> {
  return post400or404<Evidence>(
    `/api/controls/${controlId}/evidence`,
    input,
    "El control no existe",
    "Datos inválidos",
  );
}

export function createIncident(aiSystemId: string, input: CreateIncidentInput): Promise<Incident> {
  return post400or404<Incident>(
    `/api/ai-systems/${aiSystemId}/incidents`,
    input,
    "El sistema de IA no existe",
    "Datos inválidos",
  );
}
