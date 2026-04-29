import { emergencies } from "./emergencies";
import type { Emergency, FlowNode, Message, Severity } from "@/types";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function detectEmergency(input: string): Emergency | null {
  const text = normalize(input);
  if (!text) return null;
  let best: { emergency: Emergency; score: number } | null = null;
  for (const e of emergencies) {
    let score = 0;
    for (const kw of e.keywords) {
      const nk = normalize(kw);
      if (!nk) continue;
      const pattern = new RegExp(`\\b${escapeRegex(nk)}\\b`);
      if (pattern.test(text)) score += nk.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { emergency: e, score };
    }
  }
  return best?.emergency ?? null;
}

export interface BotReply {
  content: string;
  severity?: Severity;
  quickReplies?: string[];
}

export function getInitialBotMessage(): Message {
  return {
    id: crypto.randomUUID(),
    role: "bot",
    content:
      "Hola, soy tu asistente de emergencias domésticas. Estoy aquí para guiarte paso a paso si algo está pasando en casa.\n\nCuéntame qué ocurre o elige una emergencia común.",
    timestamp: Date.now(),
    quickReplies: [
      "Fuga de gas",
      "Fuga de agua",
      "Apagón / corto circuito",
      "Incendio en casa",
    ],
  };
}

export function startEmergencyReply(emergency: Emergency): BotReply {
  return {
    content: emergency.initialMessage,
    severity: emergency.severity,
    quickReplies: emergency.quickReplies,
  };
}

export function findFlowNode(
  emergency: Emergency,
  path: string[]
): FlowNode | null {
  let currentFlow: Record<string, FlowNode> | undefined = emergency.flow;
  let node: FlowNode | null = null;
  for (const step of path) {
    if (!currentFlow) return null;
    const nextNode: FlowNode | undefined = currentFlow[step];
    if (!nextNode) return null;
    node = nextNode;
    currentFlow = nextNode.flow;
  }
  return node;
}

export function resolveUserInput(
  input: string,
  emergency: Emergency | null,
  path: string[]
): {
  reply: BotReply;
  nextEmergency: Emergency | null;
  nextPath: string[];
} {
  const trimmed = input.trim();
  const lower = normalize(trimmed);

  if (lower === "menu principal" || lower === "menú principal") {
    return {
      reply: {
        content:
          "Listo. ¿Con qué emergencia te ayudo? Puedes describirla o elegir una opción.",
        quickReplies: [
          "Fuga de gas",
          "Fuga de agua",
          "Apagón / corto circuito",
          "Incendio en casa",
          "Inundación",
          "Olor químico / monóxido",
        ],
      },
      nextEmergency: null,
      nextPath: [],
    };
  }

  if (emergency) {
    const node = findFlowNode(emergency, [...path, trimmed]);
    if (node) {
      return {
        reply: {
          content: node.response,
          severity: node.severity ?? emergency.severity,
          quickReplies: node.quickReplies,
        },
        nextEmergency: emergency,
        nextPath: [...path, trimmed],
      };
    }
  }

  const detected = detectEmergency(trimmed);
  if (detected) {
    return {
      reply: startEmergencyReply(detected),
      nextEmergency: detected,
      nextPath: [],
    };
  }

  if (emergency) {
    const currentNode =
      path.length > 0 ? findFlowNode(emergency, path) : null;
    const currentReplies =
      currentNode?.quickReplies ?? emergency.quickReplies;
    return {
      reply: {
        content:
          "No estoy seguro de haberte entendido. Si prefieres, toca una de estas opciones o descríbeme de nuevo qué pasa:",
        severity: "info",
        quickReplies: currentReplies,
      },
      nextEmergency: emergency,
      nextPath: path,
    };
  }

  const thanks = ["gracias", "ok", "vale", "listo", "perfecto"];
  if (thanks.some((w) => lower.includes(w))) {
    return {
      reply: {
        content:
          "Con gusto. ¿Hay alguna otra emergencia en la que pueda ayudarte?",
        quickReplies: [
          "Fuga de gas",
          "Fuga de agua",
          "Incendio en casa",
          "Apagón / corto circuito",
        ],
      },
      nextEmergency: null,
      nextPath: [],
    };
  }

  return {
    reply: {
      content:
        "No reconocí la emergencia. Describe con tus palabras lo que ocurre (por ejemplo: \"huele a gas\" o \"entra agua\") o toca una opción:",
      severity: "info",
      quickReplies: [
        "Fuga de gas",
        "Fuga de agua",
        "Apagón / corto circuito",
        "Incendio en casa",
      ],
    },
    nextEmergency: null,
    nextPath: [],
  };
}

export function findEmergencyByTitle(title: string): Emergency | null {
  return emergencies.find((e) => e.title === title) ?? null;
}
