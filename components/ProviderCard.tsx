"use client";

import { Award, BadgeCheck, Clock, Star, UserRound } from "lucide-react";
import type { Trabajador } from "@/types";

const insigniaIconMap: Record<string, typeof BadgeCheck> = {
  experiencia_top: Award,
  certificado: BadgeCheck,
  siempre_puntual: Clock,
  trabajador_formal: UserRound,
};

const insigniaLabelMap: Record<string, string> = {
  experiencia_top: "Experiencia top",
  certificado: "Certificado",
  siempre_puntual: "Siempre puntual",
  trabajador_formal: "Trabajador formal",
};

export default function ProviderCard({ provider }: { provider: Trabajador }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{provider.nombre}</p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
            <Star size={12} className="fill-amber-400 stroke-amber-500" />
            <span className="font-medium">
              {provider.calificacion_global.toFixed(1)}
            </span>
            <span className="text-slate-400">
              ({provider.total_reviews} reseñas)
            </span>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold text-slate-900">
            ${provider.precio_desde}–${provider.precio_hasta}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            MXN
          </p>
        </div>
      </div>

      {provider.insignias.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {provider.insignias.map((i) => {
            const Icon = insigniaIconMap[i] ?? BadgeCheck;
            const label = insigniaLabelMap[i] ?? i;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
              >
                <Icon size={11} />
                {label}
              </span>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="mt-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
      >
        Contactar
      </button>
    </div>
  );
}
