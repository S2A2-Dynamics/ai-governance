export type AISystemStatus = "activo" | "pausado";

export type AISystem = {
  id: string;
  organizationId: string;
  name: string;
  purpose: string;
  provider: string;
  gcpProject: string | null;
  status: AISystemStatus;
  createdAt: string;
  riskCount: number;
  controlCount: number;
  incidentCount: number;
};

export type CreateAISystemInput = {
  name: string;
  purpose: string;
  provider: string;
  gcpProject?: string;
  status: AISystemStatus;
};

export type ApiFieldErrors = {
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

export type RiskCategory = "sesgo" | "privacidad" | "seguridad" | "transparencia" | "robustez" | "otro";
export type RiskSeverity = "bajo" | "medio" | "alto" | "critico";
export type ControlStatus = "planificado" | "implementado" | "verificado";
export type EvidenceType = "texto" | "enlace" | "archivo";

export type IsoDomain = {
  id: string;
  code: string;
  name: string;
};

export type MaturityDomain = {
  id: string;
  code: string;
  name: string;
  score: number;
  totalControls: number;
};

export type Evidence = {
  id: string;
  controlId: string;
  type: EvidenceType;
  content: string;
  registeredBy: string;
  registeredAt: string;
};

export type Control = {
  id: string;
  riskId: string;
  name: string;
  status: ControlStatus;
  isoDomainId: string;
  isoDomain: IsoDomain;
  evidence: Evidence[];
};

export type Risk = {
  id: string;
  aiSystemId: string;
  category: RiskCategory;
  severity: RiskSeverity;
  description: string;
  controls: Control[];
};

export type Incident = {
  id: string;
  aiSystemId: string;
  description: string;
  severity: RiskSeverity;
  occurredAt: string;
  resolvedAt: string | null;
};

export type AISystemDetail = AISystem & {
  risks: Risk[];
  incidents: Incident[];
};

export type CreateRiskInput = {
  category: RiskCategory;
  severity: RiskSeverity;
  description: string;
};

export type CreateControlInput = {
  name: string;
  status: ControlStatus;
  isoDomainId: string;
};

export type CreateEvidenceInput = {
  type: EvidenceType;
  content: string;
  registeredBy: string;
};

export type CreateIncidentInput = {
  description: string;
  severity: RiskSeverity;
  occurredAt: string;
  resolvedAt?: string;
};
