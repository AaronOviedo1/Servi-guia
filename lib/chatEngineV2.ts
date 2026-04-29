import { getTrabajadoresByIds } from "./serviguia/filterProviders";
import type {
  DiagnosticoRequest,
  DiagnosticoResponse,
  Message,
  Severity,
  Trabajador,
} from "@/types";

export function nivelToSeverity(
  nivel: DiagnosticoResponse["nivel_urgencia"]
): Severity {
  if (nivel === "CRÍTICO") return "alta";
  if (nivel === "MODERADO") return "media";
  return "info";
}

export function diagnosticoToBotMessage(
  d: DiagnosticoResponse
): {
  content: string;
  severity: Severity;
  providers: Trabajador[];
  urgencia: DiagnosticoResponse["nivel_urgencia"];
  numeroEmergencia: string | null;
  preguntaSeguimiento: string | null;
} {
  const parts: string[] = [];

  if (d.accion_inmediata) {
    if (d.nivel_urgencia === "CRÍTICO") {
      parts.push("⚠️ EMERGENCIA — actúa ahora:");
    } else if (d.nivel_urgencia === "MODERADO") {
      parts.push("⚠️ Atención — esto puede empeorar:");
    }
    parts.push(d.accion_inmediata);
  } else {
    parts.push(d.resumen_diagnostico);
  }

  if (d.numero_emergencia) {
    parts.push(`\n📞 Llama al ${d.numero_emergencia} desde afuera.`);
  }

  if (d.pregunta_seguimiento) {
    parts.push(`\n${d.pregunta_seguimiento}`);
  }

  const providers = getTrabajadoresByIds(d.proveedores_sugeridos);

  const analisisClaro =
    d.nivel_urgencia !== "CRÍTICO" &&
    !d.pregunta_seguimiento &&
    d.categoria_detectada !== null;

  if (analisisClaro && providers.length === 0) {
    parts.push("\nNo tenemos un proveedor apto para la situación.");
  }

  return {
    content: parts.join("\n"),
    severity: nivelToSeverity(d.nivel_urgencia),
    providers,
    urgencia: d.nivel_urgencia,
    numeroEmergencia: d.numero_emergencia,
    preguntaSeguimiento: d.pregunta_seguimiento,
  };
}

export async function postDiagnostico(
  req: DiagnosticoRequest
): Promise<DiagnosticoResponse> {
  const res = await fetch("/api/diagnostico", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const errPayload = await res.json().catch(() => ({}));
    throw new Error(
      (errPayload as { error?: string }).error ?? `HTTP ${res.status}`
    );
  }
  return (await res.json()) as DiagnosticoResponse;
}

export function messagesToHistory(
  messages: Message[]
): Array<{ role: "bot" | "user"; content: string }> {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}
