"use client";

import {
  AlertTriangle,
  DoorClosed,
  Droplet,
  Flame,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import type { Emergency } from "@/types";

const iconMap = {
  Flame,
  Droplet,
  Zap,
  AlertTriangle,
  Waves,
  Wind,
  DoorClosed,
} as const;

type IconName = keyof typeof iconMap;

const severityStyles: Record<string, string> = {
  alta: "text-red-600 bg-red-50",
  media: "text-amber-600 bg-amber-50",
  info: "text-blue-600 bg-blue-50",
};

interface EmergencyCardProps {
  emergency: Emergency;
  onClick: (emergency: Emergency) => void;
  active?: boolean;
}

export default function EmergencyCard({
  emergency,
  onClick,
  active,
}: EmergencyCardProps) {
  const Icon = iconMap[emergency.icon as IconName] ?? AlertTriangle;
  const iconStyle = severityStyles[emergency.severity] ?? severityStyles.info;
  return (
    <button
      type="button"
      onClick={() => onClick(emergency)}
      className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
        active
          ? "border-blue-500 bg-blue-50"
          : "border-transparent hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${iconStyle}`}
      >
        <Icon size={16} />
      </span>
      <span className="text-sm font-medium text-slate-800">{emergency.title}</span>
    </button>
  );
}
