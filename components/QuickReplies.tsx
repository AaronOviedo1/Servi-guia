"use client";

import { motion } from "framer-motion";

interface QuickRepliesProps {
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function QuickReplies({
  options,
  onSelect,
  disabled,
}: QuickRepliesProps) {
  if (!options?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="flex flex-wrap gap-2 pl-10"
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(opt)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
        >
          {opt}
        </button>
      ))}
    </motion.div>
  );
}
