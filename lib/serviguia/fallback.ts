import { detectEmergency } from "../chatEngine";
import { filterProviders } from "./filterProviders";
import type { DiagnosticoResponse, Emergency, NivelUrgencia } from "@/types";

interface EmergencyMapping {
  urgencia: NivelUrgencia;
  categoria: string | null;
  numero_emergencia: string | null;
}

const EMERGENCY_MAP: Record<string, EmergencyMapping> = {
  gas_leak: { urgencia: "CRÍTICO", categoria: null, numero_emergencia: "911" },
  fire: { urgencia: "CRÍTICO", categoria: null, numero_emergencia: "911" },
  chemical_smell: { urgencia: "CRÍTICO", categoria: null, numero_emergencia: "911" },
  flood: { urgencia: "CRÍTICO", categoria: null, numero_emergencia: "911" },
  water_leak: { urgencia: "MODERADO", categoria: "plomeria.fugas_menores", numero_emergencia: null },
  power_outage: { urgencia: "MODERADO", categoria: "electricidad", numero_emergencia: null },
  appliance_fail: { urgencia: "NORMAL", categoria: "reparaciones", numero_emergencia: null },
  locked_out: { urgencia: "NORMAL", categoria: "seguridad", numero_emergencia: null },
};

function emergencyToDiagnostico(e: Emergency): DiagnosticoResponse {
  const mapping = EMERGENCY_MAP[e.id] ?? {
    urgencia: "NORMAL" as NivelUrgencia,
    categoria: null,
    numero_emergencia: null,
  };

  const esEmergencia = mapping.urgencia === "CRÍTICO";
  const providers = esEmergencia ? [] : filterProviders(mapping.categoria);

  return {
    nivel_urgencia: mapping.urgencia,
    es_emergencia: esEmergencia,
    accion_inmediata: mapping.urgencia === "NORMAL" ? null : e.initialMessage,
    categoria_detectada: mapping.categoria,
    pregunta_seguimiento: null,
    resumen_diagnostico: e.initialMessage.split("\n")[0].slice(0, 200),
    proveedores_sugeridos: providers.map((p) => p.id),
    numero_emergencia: mapping.numero_emergencia,
    source: "fallback",
  };
}

function genericFallback(): DiagnosticoResponse {
  return {
    nivel_urgencia: "NORMAL",
    es_emergencia: false,
    accion_inmediata: null,
    categoria_detectada: null,
    pregunta_seguimiento:
      "No logré identificar bien el problema. ¿Puedes describirme con más detalle qué está pasando? (por ejemplo: dónde está, si hay agua, luz o gas involucrado)",
    resumen_diagnostico:
      "Necesito un poco más de información para ayudarte mejor.",
    proveedores_sugeridos: [],
    numero_emergencia: null,
    source: "fallback",
  };
}

export function fallbackDiagnostico(text: string): DiagnosticoResponse {
  const detected = detectEmergency(text);
  if (detected) return emergencyToDiagnostico(detected);
  return genericFallback();
}
