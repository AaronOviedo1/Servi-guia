import trabajadoresData from "../data/trabajadores.json";
import type { Trabajador } from "@/types";
import {
  calcularBayesianNorm,
  calcularInsigniasNorm,
  calcularScore,
} from "./scoreProviders";

// Re-exportado por compatibilidad con código que importaba PESO_INSIGNIA desde aquí.
export { PESO_INSIGNIA } from "./scoreProviders";

const trabajadores = trabajadoresData as Trabajador[];

export function getAllTrabajadores(): Trabajador[] {
  return trabajadores;
}

export function getTrabajadoresByIds(ids: string[]): Trabajador[] {
  const set = new Set(ids);
  return trabajadores.filter((t) => set.has(t.id));
}

/**
 * Filtra proveedores disponibles para una categoría y devuelve el top `limit`
 * ordenado por el score compuesto S(p) descendente.
 *
 * El filtrado de categoría/disponibilidad se mantiene idéntico al original.
 * Solo cambia el criterio de ordenamiento: antes era lexicográfico en cascada
 * (calificación → insignias → reviews); ahora es S(p) = W1*B̄(p) + W2*Î(p).
 */
export function filterProviders(
  categoriaId: string | null,
  limit = 3,
): Trabajador[] {
  if (!categoriaId) return [];
  const root = categoriaId.includes(".")
    ? categoriaId.split(".")[0]
    : categoriaId;

  const matches = trabajadores.filter((t) => {
    if (!t.disponible) return false;
    return t.categorias.some((c) => c === categoriaId || c === root);
  });

  // Calcula los tres componentes una sola vez por proveedor (función pura).
  const scored: Trabajador[] = matches.map((t) => {
    const bayesian_score = calcularBayesianNorm(
      t.calificacion_global,
      t.total_reviews,
    );
    const insignias_score = calcularInsigniasNorm(t.insignias);
    const score = calcularScore(t);
    return { ...t, bayesian_score, insignias_score, score };
  });

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return scored.slice(0, limit);
}
