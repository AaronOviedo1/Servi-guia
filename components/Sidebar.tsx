"use client";

import { Phone, Plus, Shield, X } from "lucide-react";
import EmergencyCard from "./EmergencyCard";
import { emergencies } from "@/lib/emergencies";
import type { Emergency } from "@/types";

interface SidebarProps {
  activeId: string | null;
  onSelectEmergency: (emergency: Emergency) => void;
  onNewChat: () => void;
  open: boolean;
  onClose: () => void;
}

const emergencyPhones = [
  { label: "911", desc: "Emergencias generales" },
  { label: "071", desc: "CFE (electricidad)" },
  { label: "068", desc: "Bomberos (nacional)" },
];

export default function Sidebar({
  activeId,
  onSelectEmergency,
  onNewChat,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
              <Shield size={16} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-tight">
                Asistente de
              </h1>
              <h1 className="text-sm font-semibold text-slate-900 leading-tight">
                Emergencias
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Plus size={16} />
            Nueva conversación
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Emergencias comunes
          </h2>
          <div className="flex flex-col gap-1">
            {emergencies.map((e) => (
              <EmergencyCard
                key={e.id}
                emergency={e}
                onClick={onSelectEmergency}
                active={activeId === e.id}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-3 py-3">
          <h2 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Números de emergencia
          </h2>
          <ul className="flex flex-col gap-1.5">
            {emergencyPhones.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
              >
                <Phone size={14} className="text-red-600" />
                <span className="font-semibold text-slate-900">{p.label}</span>
                <span className="text-xs text-slate-500">— {p.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
