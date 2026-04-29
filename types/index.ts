export type Severity = "alta" | "media" | "info";

export type Role = "bot" | "user";

export type NivelUrgencia = "CRÍTICO" | "MODERADO" | "NORMAL";

export interface Trabajador {
  id: string;
  nombre: string;
  categorias: string[];
  calificacion_global: number;
  insignias: string[];
  disponible: boolean;
  precio_desde: number;
  precio_hasta: number;
  total_reviews: number;
  score?: number;
  bayesian_score?: number;
  insignias_score?: number;
}

export interface DiagnosticoResponse {
  nivel_urgencia: NivelUrgencia;
  es_emergencia: boolean;
  accion_inmediata: string | null;
  categoria_detectada: string | null;
  pregunta_seguimiento: string | null;
  resumen_diagnostico: string;
  proveedores_sugeridos: string[];
  numero_emergencia: string | null;
  source?: "llm" | "fallback";
}

export interface DiagnosticoRequest {
  text: string;
  image?: string;
  history?: Array<{ role: Role; content: string }>;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  severity?: Severity;
  quickReplies?: string[];
  imageDataUrl?: string;
  providers?: Trabajador[];
  urgencia?: NivelUrgencia;
  numeroEmergencia?: string | null;
}

export interface FlowNode {
  response: string;
  severity?: Severity;
  quickReplies?: string[];
  flow?: Record<string, FlowNode>;
}

export interface Emergency {
  id: string;
  title: string;
  icon: string;
  severity: Severity;
  keywords: string[];
  initialMessage: string;
  quickReplies: string[];
  flow: Record<string, FlowNode>;
}
