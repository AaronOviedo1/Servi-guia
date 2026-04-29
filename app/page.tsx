"use client";

import { useCallback, useEffect, useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import { getInitialBotMessage } from "@/lib/chatEngine";
import {
  diagnosticoToBotMessage,
  messagesToHistory,
  postDiagnostico,
} from "@/lib/chatEngineV2";
import type { Emergency, Message } from "@/types";

function typingDelay(): number {
  return 600 + Math.random() * 600;
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMessages([getInitialBotMessage()]);
  }, []);

  const appendBotMessage = useCallback(
    (msg: Omit<Message, "id" | "role" | "timestamp">) => {
      setIsTyping(true);
      const delay = typingDelay();
      window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "bot",
            timestamp: Date.now(),
            ...msg,
          },
        ]);
        setIsTyping(false);
      }, delay);
    },
    []
  );

  const clearLastQuickReplies = useCallback((prev: Message[]): Message[] => {
    const last = prev[prev.length - 1];
    if (last && last.role === "bot" && last.quickReplies) {
      return [...prev.slice(0, -1), { ...last, quickReplies: undefined }];
    }
    return prev;
  }, []);

  const handleSend = useCallback(
    async (text: string, imageDataUrl?: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: Date.now(),
        imageDataUrl,
      };

      let historyForRequest: Message[] = [];
      setMessages((prev) => {
        const cleared = clearLastQuickReplies(prev);
        const next = [...cleared, userMessage];
        historyForRequest = cleared;
        return next;
      });

      setIsTyping(true);
      try {
        const diag = await postDiagnostico({
          text,
          image: imageDataUrl,
          history: messagesToHistory(historyForRequest),
        });
        const bot = diagnosticoToBotMessage(diag);
        setIsTyping(false);
        appendBotMessage({
          content: bot.content,
          severity: bot.severity,
          providers: bot.providers,
          urgencia: bot.urgencia,
          numeroEmergencia: bot.numeroEmergencia,
        });
      } catch (err) {
        console.error(err);
        setIsTyping(false);
        appendBotMessage({
          content:
            "Tuve un problema para procesar tu mensaje. ¿Puedes intentarlo de nuevo?",
          severity: "info",
        });
      }
    },
    [appendBotMessage, clearLastQuickReplies]
  );

  const handleSelectEmergency = useCallback(
    (e: Emergency) => {
      setSidebarOpen(false);
      setActiveEmergency(e);
      void handleSend(e.title);
    },
    [handleSend]
  );

  const handleNewChat = useCallback(() => {
    setActiveEmergency(null);
    setIsTyping(false);
    setMessages([getInitialBotMessage()]);
    setSidebarOpen(false);
  }, []);

  const title = activeEmergency ? activeEmergency.title : "Nueva conversación";

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
      <Sidebar
        activeId={activeEmergency?.id ?? null}
        onSelectEmergency={handleSelectEmergency}
        onNewChat={handleNewChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ChatWindow
        title={title}
        messages={messages}
        isTyping={isTyping}
        onSend={handleSend}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    </div>
  );
}
