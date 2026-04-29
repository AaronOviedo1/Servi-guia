"use client";

import { useState } from "react";
import type { DiagnosticoResponse } from "@/types";

interface TestCase {
  id: string;
  description: string;
  input: string;
  image?: string;
  expect: {
    urgencia: "CRÍTICO" | "MODERADO" | "NORMAL";
    categoria?: string | null;
    categoriaAnyOf?: string[];
    requiresProviders?: string[];
    forbidProviders?: boolean;
    allowsFollowUp?: boolean;
  };
}

const DUMMY_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const cases: TestCase[] = [
  {
    id: "C-01",
    description: "Fuga de gas",
    input: "Mi casa huele mucho a gas",
    expect: { urgencia: "CRÍTICO", categoria: null, forbidProviders: true },
  },
  {
    id: "C-02",
    description: "Chispas eléctricas",
    input: "Hay chispas en el contacto de la cocina",
    expect: { urgencia: "CRÍTICO", categoria: null, forbidProviders: true },
  },
  {
    id: "C-03",
    description: "Gotera en techo",
    input: "Tengo una gotera en el techo cuando llueve",
    expect: {
      urgencia: "NORMAL",
      categoriaAnyOf: ["construccion.impermeabilizacion", "construccion"],
      requiresProviders: ["t007"],
    },
  },
  {
    id: "C-04",
    description: "A/C no enfría",
    input: "El aire acondicionado ya no enfría",
    expect: {
      urgencia: "NORMAL",
      categoriaAnyOf: ["clima.reparacion_ac", "clima"],
      requiresProviders: ["t005"],
    },
  },
  {
    id: "C-05",
    description: "Apagón parcial",
    input: "Se me fue la luz en dos cuartos nada más",
    expect: {
      urgencia: "NORMAL",
      categoriaAnyOf: ["electricidad"],
      requiresProviders: ["t003"],
    },
  },
  {
    id: "C-06",
    description: "Ambiguo — baño",
    input: "Algo se descompuso en el baño",
    expect: { urgencia: "NORMAL", allowsFollowUp: true },
  },
  {
    id: "C-07",
    description: "Refri no enfría",
    input: "Mi refrigerador ya no enfría bien",
    expect: {
      urgencia: "NORMAL",
      categoriaAnyOf: ["reparaciones.refrigeradores", "reparaciones"],
      requiresProviders: ["t010"],
    },
  },
  {
    id: "C-08",
    description: "Agua por fregadero",
    input: "Hay agua saliendo por el fregadero",
    expect: {
      urgencia: "MODERADO",
      categoriaAnyOf: ["plomeria", "plomeria.fugas_menores"],
      requiresProviders: ["t001"],
    },
  },
  {
    id: "C-09",
    description: "Imagen dummy + texto (envío multimodal)",
    input: "Mira esta foto, creo que tengo un problema",
    image: DUMMY_IMAGE,
    expect: { urgencia: "NORMAL", allowsFollowUp: true },
  },
];

type Verdict = "pass" | "fail" | "warn";

interface Result {
  id: string;
  verdict: Verdict;
  notes: string[];
  response?: DiagnosticoResponse;
  error?: string;
}

function evaluate(tc: TestCase, res: DiagnosticoResponse): Result {
  const notes: string[] = [];
  let verdict: Verdict = "pass";

  if (res.nivel_urgencia !== tc.expect.urgencia) {
    notes.push(
      `urgencia esperada ${tc.expect.urgencia}, obtuvo ${res.nivel_urgencia}`
    );
    verdict = "fail";
  }

  if (tc.expect.categoria !== undefined) {
    if (res.categoria_detectada !== tc.expect.categoria) {
      notes.push(
        `categoria esperada ${tc.expect.categoria}, obtuvo ${res.categoria_detectada}`
      );
      verdict = "fail";
    }
  }

  if (tc.expect.categoriaAnyOf) {
    if (
      !res.categoria_detectada ||
      !tc.expect.categoriaAnyOf.includes(res.categoria_detectada)
    ) {
      notes.push(
        `categoria esperada en [${tc.expect.categoriaAnyOf.join(", ")}], obtuvo ${res.categoria_detectada}`
      );
      verdict = "fail";
    }
  }

  if (tc.expect.requiresProviders) {
    for (const pid of tc.expect.requiresProviders) {
      if (!res.proveedores_sugeridos.includes(pid)) {
        notes.push(`falta proveedor ${pid}`);
        verdict = "fail";
      }
    }
  }

  if (tc.expect.forbidProviders && res.proveedores_sugeridos.length > 0) {
    notes.push(
      `no debía haber proveedores, obtuvo [${res.proveedores_sugeridos.join(", ")}]`
    );
    verdict = "fail";
  }

  if (tc.expect.allowsFollowUp) {
    if (!res.pregunta_seguimiento) {
      notes.push("se esperaba pregunta_seguimiento (caso ambiguo)");
      if (verdict === "pass") verdict = "warn";
    }
  }

  if (res.source === "fallback") {
    notes.push("respuesta del motor de reglas (fallback)");
    if (verdict === "pass") verdict = "warn";
  }

  return { id: tc.id, verdict, notes, response: res };
}

export default function TestPage() {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [running, setRunning] = useState(false);

  const runAll = async () => {
    setRunning(true);
    setResults({});
    for (const tc of cases) {
      try {
        const res = await fetch("/api/diagnostico", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: tc.input, image: tc.image }),
        });
        if (!res.ok) {
          setResults((r) => ({
            ...r,
            [tc.id]: {
              id: tc.id,
              verdict: "fail",
              notes: [`HTTP ${res.status}`],
            },
          }));
          continue;
        }
        const data = (await res.json()) as DiagnosticoResponse;
        setResults((r) => ({ ...r, [tc.id]: evaluate(tc, data) }));
      } catch (e) {
        setResults((r) => ({
          ...r,
          [tc.id]: {
            id: tc.id,
            verdict: "fail",
            notes: [(e as Error).message],
          },
        }));
      }
    }
    setRunning(false);
  };

  const counts = Object.values(results).reduce(
    (acc, r) => {
      acc[r.verdict]++;
      return acc;
    },
    { pass: 0, fail: 0, warn: 0 } as Record<Verdict, number>
  );

  const verdictColor: Record<Verdict, string> = {
    pass: "bg-emerald-100 text-emerald-800",
    fail: "bg-red-100 text-red-800",
    warn: "bg-amber-100 text-amber-800",
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Suite ServiGuía — 9 casos
          </h1>
          <p className="text-sm text-slate-500">
            Corre los 8 casos de aceptación + 1 extra con imagen dummy contra{" "}
            <code>/api/diagnostico</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={runAll}
          disabled={running}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:bg-slate-300"
        >
          {running ? "Corriendo..." : "Correr todos"}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="mb-4 flex gap-3 text-sm">
          <span className="rounded-md bg-emerald-100 px-2 py-1 font-medium text-emerald-800">
            ✓ {counts.pass}
          </span>
          <span className="rounded-md bg-amber-100 px-2 py-1 font-medium text-amber-800">
            ⚠ {counts.warn}
          </span>
          <span className="rounded-md bg-red-100 px-2 py-1 font-medium text-red-800">
            ✗ {counts.fail}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Input</th>
              <th className="px-3 py-2">Esperado</th>
              <th className="px-3 py-2">Resultado</th>
              <th className="px-3 py-2">Veredicto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.map((tc) => {
              const r = results[tc.id];
              const exp: string[] = [];
              exp.push(`urgencia=${tc.expect.urgencia}`);
              if (tc.expect.categoria !== undefined)
                exp.push(`cat=${tc.expect.categoria}`);
              if (tc.expect.categoriaAnyOf)
                exp.push(`cat ∈ [${tc.expect.categoriaAnyOf.join("|")}]`);
              if (tc.expect.requiresProviders)
                exp.push(`incluye ${tc.expect.requiresProviders.join(",")}`);
              if (tc.expect.forbidProviders) exp.push("sin proveedores");
              if (tc.expect.allowsFollowUp) exp.push("puede preguntar");

              return (
                <tr key={tc.id} className="align-top">
                  <td className="px-3 py-3 font-mono text-xs font-semibold">
                    {tc.id}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-800">
                      {tc.description}
                    </div>
                    <div className="text-xs text-slate-500">
                      &ldquo;{tc.input}&rdquo;
                      {tc.image && " (+imagen)"}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">
                    {exp.map((e, i) => (
                      <div key={i}>{e}</div>
                    ))}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {r?.response ? (
                      <>
                        <div>urg: {r.response.nivel_urgencia}</div>
                        <div>cat: {r.response.categoria_detectada ?? "—"}</div>
                        <div>
                          prov: [{r.response.proveedores_sugeridos.join(", ") || "—"}]
                        </div>
                        {r.response.pregunta_seguimiento && (
                          <div className="italic text-slate-500">
                            ?: {r.response.pregunta_seguimiento}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          ({r.response.source})
                        </div>
                      </>
                    ) : r?.error ? (
                      <span className="text-red-600">{r.error}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {r ? (
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${verdictColor[r.verdict]}`}
                      >
                        {r.verdict === "pass" && "✓ pass"}
                        {r.verdict === "fail" && "✗ fail"}
                        {r.verdict === "warn" && "⚠ warn"}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                    {r?.notes && r.notes.length > 0 && (
                      <ul className="mt-1 list-disc pl-4 text-[11px] text-slate-500">
                        {r.notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
