"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Camera, Menu, Send, X } from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import MessageBubble from "./MessageBubble";
import QuickReplies from "./QuickReplies";
import type { Message } from "@/types";

interface ChatWindowProps {
  title: string;
  messages: Message[];
  isTyping: boolean;
  onSend: (text: string, imageDataUrl?: string) => void;
  onOpenSidebar: () => void;
}

const MAX_IMAGE_SIDE = 1024;
const JPEG_QUALITY = 0.8;

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let newW = width;
  let newH = height;
  const maxSide = Math.max(width, height);
  if (maxSide > MAX_IMAGE_SIDE) {
    const scale = MAX_IMAGE_SIDE / maxSide;
    newW = Math.round(width * scale);
    newH = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener contexto canvas");
  ctx.drawImage(bitmap, 0, 0, newW, newH);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2"
    >
      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
        <Bot size={16} />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function ChatWindow({
  title,
  messages,
  isTyping,
  onSend,
  onOpenSidebar,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if ((!text && !pendingImage) || isTyping) return;
    onSend(text, pendingImage ?? undefined);
    setInput("");
    setPendingImage(null);
    setImgError(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setImgError(null);
      const dataUrl = await compressImage(file);
      setPendingImage(dataUrl);
    } catch (err) {
      console.error(err);
      setImgError("No se pudo procesar la imagen.");
    }
  };

  const lastBot = [...messages].reverse().find((m) => m.role === "bot");
  const showQuick =
    !isTyping &&
    lastBot &&
    lastBot.quickReplies &&
    lastBot.quickReplies.length > 0 &&
    messages[messages.length - 1]?.role === "bot";

  return (
    <main className="flex h-full flex-1 flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">En línea</span>
            </div>
          </div>
        </div>
      </header>

      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-6 md:px-8"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {isTyping && <TypingIndicator key="typing" />}
        </AnimatePresence>
        {showQuick && lastBot?.quickReplies && (
          <QuickReplies
            options={lastBot.quickReplies}
            onSelect={(v) => onSend(v)}
          />
        )}
      </div>

      <form
        onSubmit={submit}
        className="border-t border-slate-200 bg-white px-4 py-3 md:px-6"
      >
        {pendingImage && (
          <div className="mb-2 flex items-center gap-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pendingImage}
                alt="Preview"
                className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white shadow"
                aria-label="Quitar imagen"
              >
                <X size={12} />
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Imagen lista para enviar
            </span>
          </div>
        )}
        {imgError && (
          <p className="mb-1 text-xs text-red-600">{imgError}</p>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white px-2 py-2 focus-within:border-blue-500">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPickImage}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Adjuntar imagen"
            disabled={isTyping}
          >
            <Camera size={18} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Describe tu problema o toma una foto..."
            className="max-h-32 flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={(!input.trim() && !pendingImage) || isTyping}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:bg-slate-300"
            aria-label="Enviar mensaje"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          En caso de emergencia grave, llama al <span className="font-semibold text-red-600">911</span> antes que nada.
        </p>
      </form>
    </main>
  );
}
