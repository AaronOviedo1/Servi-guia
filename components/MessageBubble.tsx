"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ProviderCard from "./ProviderCard";
import type { Message } from "@/types";

const severityStyles: Record<string, string> = {
  alta: "bg-red-50 border border-red-200 text-red-900",
  media: "bg-amber-50 border border-amber-200 text-amber-900",
  info: "bg-white border border-slate-200 text-slate-900",
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const botBg = message.severity
    ? severityStyles[message.severity] ?? severityStyles.info
    : "bg-white border border-slate-200 text-slate-900";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex w-full gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
          <Bot size={16} />
        </div>
      )}
      <div
        className={`flex max-w-[78%] flex-col gap-2 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {message.imageDataUrl && (
          <a
            href={message.imageDataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-slate-200 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageDataUrl}
              alt="Imagen enviada"
              className="max-h-48 max-w-full object-cover"
            />
          </a>
        )}

        {message.content && (
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isUser
                ? "rounded-br-sm bg-blue-600 text-white"
                : `rounded-bl-sm ${botBg}`
            }`}
          >
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {message.content}
            </p>
            <p
              className={`mt-1 text-[10px] ${
                isUser ? "text-blue-100" : "text-slate-400"
              }`}
            >
              {formatTime(message.timestamp)}
            </p>
          </div>
        )}

        {!isUser && message.providers && message.providers.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Proveedores sugeridos
            </p>
            {message.providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <User size={16} />
        </div>
      )}
    </motion.div>
  );
}
