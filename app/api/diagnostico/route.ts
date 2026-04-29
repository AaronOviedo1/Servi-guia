import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/serviguia/prompt";
import { filterProviders } from "@/lib/serviguia/filterProviders";
import { fallbackDiagnostico } from "@/lib/serviguia/fallback";
import { isValidCategoryId } from "@/lib/data/categorias";
import type {
  DiagnosticoRequest,
  DiagnosticoResponse,
  NivelUrgencia,
} from "@/types";

export const runtime = "nodejs";

const MODEL = "gpt-5-nano";
const MAX_HISTORY_TURNS = 6;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function isNivelUrgencia(v: unknown): v is NivelUrgencia {
  return v === "CRÍTICO" || v === "MODERADO" || v === "NORMAL";
}

function validateDiagnostico(raw: unknown): DiagnosticoResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (!isNivelUrgencia(r.nivel_urgencia)) return null;
  if (typeof r.es_emergencia !== "boolean") return null;
  if (typeof r.resumen_diagnostico !== "string") return null;

  const categoria = r.categoria_detectada;
  if (categoria !== null && typeof categoria !== "string") return null;
  if (typeof categoria === "string" && !isValidCategoryId(categoria)) return null;

  const accion = r.accion_inmediata;
  if (accion !== null && typeof accion !== "string") return null;

  const pregunta = r.pregunta_seguimiento;
  if (pregunta !== null && typeof pregunta !== "string") return null;

  const numero = r.numero_emergencia;
  if (numero !== null && typeof numero !== "string") return null;

  return {
    nivel_urgencia: r.nivel_urgencia,
    es_emergencia: r.es_emergencia,
    accion_inmediata: accion as string | null,
    categoria_detectada: categoria as string | null,
    pregunta_seguimiento: pregunta as string | null,
    resumen_diagnostico: r.resumen_diagnostico,
    proveedores_sugeridos: [],
    numero_emergencia: numero as string | null,
    source: "llm",
  };
}

function enforceBusinessRules(d: DiagnosticoResponse): DiagnosticoResponse {
  if (d.nivel_urgencia === "CRÍTICO") {
    const providers: string[] = [];
    return {
      ...d,
      es_emergencia: true,
      categoria_detectada: null,
      proveedores_sugeridos: providers,
      numero_emergencia: "911",
    };
  }

  // Solo mostramos proveedores cuando el análisis es claro y conciso:
  // no hay pregunta de seguimiento pendiente y hay una categoría detectada.
  const analisisClaro =
    !d.pregunta_seguimiento && d.categoria_detectada !== null;

  const providers = analisisClaro ? filterProviders(d.categoria_detectada) : [];
  return {
    ...d,
    proveedores_sugeridos: providers.map((p) => p.id),
    numero_emergencia: null,
  };
}

type OpenAIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | OpenAIContentPart[];
}

function buildMessages(body: DiagnosticoRequest): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt() },
  ];

  const history = (body.history ?? []).slice(-MAX_HISTORY_TURNS);
  for (const h of history) {
    messages.push({
      role: h.role === "bot" ? "assistant" : "user",
      content: h.content,
    });
  }

  const userParts: OpenAIContentPart[] = [];
  if (body.text && body.text.trim().length > 0) {
    userParts.push({ type: "text", text: body.text });
  }
  if (body.image) {
    userParts.push({ type: "image_url", image_url: { url: body.image } });
  }

  if (userParts.length === 0) {
    userParts.push({ type: "text", text: "(sin entrada)" });
  }

  messages.push({ role: "user", content: userParts });
  return messages;
}

async function callLLM(
  messages: ChatMessage[],
  retryHint?: string
): Promise<DiagnosticoResponse | null> {
  if (!openai) return null;

  const finalMessages = retryHint
    ? [...messages, { role: "user" as const, content: retryHint }]
    : messages;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: finalMessages as OpenAI.Chat.ChatCompletionMessageParam[],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as unknown;
    return validateDiagnostico(parsed);
  } catch (err) {
    console.error("[diagnostico] LLM error:", err);
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: DiagnosticoRequest;
  try {
    body = (await request.json()) as DiagnosticoRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hasText = typeof body.text === "string" && body.text.trim().length > 0;
  const hasImage = typeof body.image === "string" && body.image.length > 0;
  if (!hasText && !hasImage) {
    return Response.json(
      { error: "Requiere text o image" },
      { status: 400 }
    );
  }

  if (openai) {
    const messages = buildMessages(body);
    let result = await callLLM(messages);
    if (!result) {
      result = await callLLM(
        messages,
        "La respuesta anterior no fue un JSON válido o faltó algún campo. Responde SOLO con el objeto JSON siguiendo el schema exacto pedido en el sistema."
      );
    }
    if (result) {
      return Response.json(enforceBusinessRules(result));
    }
  }

  const fb = fallbackDiagnostico(body.text ?? "");
  return Response.json(enforceBusinessRules(fb));
}
