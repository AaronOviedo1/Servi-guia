import type { Trabajador } from "@/types";

// Pesos del score compuesto S(p) = W1 * B̄(p) + W2 * Î(p)
// Deben sumar 1 para mantener S(p) ∈ [0, 1].
export const W1 = 0.7; // peso del Bayesian Average
export const W2 = 0.3; // peso del score de insignias

// Parámetros del Bayesian Average B(p) = (n*r + m*C) / (n + m)
export const C_GLOBAL = 4.5; // calificación promedio global del catálogo
export const M_REVIEWS = 50; // umbral mínimo de reviews para confianza plena

// Pesos individuales de cada insignia (αk).
export const PESO_INSIGNIA: Record<string, number> = {
  experiencia_top: 3,
  certificado: 2,
  siempre_puntual: 2,
  trabajador_formal: 1,
};

// Suma máxima posible de insignias (Σαk_max), denominador de normalización.
export const MAX_INSIGNIAS = 8;

/**
 * Bayesian Average normalizado a [0, 1].
 *
 *   B(p)  = (nₚ * rₚ + m * C) / (nₚ + m)
 *   B̄(p) = B(p) / 5
 *
 * Penaliza proveedores con pocas reviews acercándolos al promedio global C,
 * evitando que un 4.9 con 3 reviews supere a un 4.7 con 200 reviews.
 */
export function calcularBayesianNorm(
  calificacion: number,
  totalReviews: number,
): number {
  const numerador = totalReviews * calificacion + M_REVIEWS * C_GLOBAL;
  const denominador = totalReviews + M_REVIEWS;
  const B = numerador / denominador;
  return B / 5;
}

/**
 * Score de insignias normalizado a [0, 1].
 *
 *   Î(p) = Σαk / Σαk_max
 *
 * Normalizar sobre el máximo posible garantiza que sea comparable
 * con B̄(p) al combinarse mediante los pesos W1 y W2.
 */
export function calcularInsigniasNorm(insignias: string[]): number {
  const suma = insignias.reduce(
    (acc, i) => acc + (PESO_INSIGNIA[i] ?? 0),
    0,
  );
  return suma / MAX_INSIGNIAS;
}

/**
 * Score compuesto final S(p) ∈ [0, 1].
 *
 *   S(p) = W1 * B̄(p) + W2 * Î(p)
 *
 * Combina la calidad ponderada por confianza estadística (Bayesian Average)
 * con el reconocimiento institucional (insignias).
 */
export function calcularScore(p: Trabajador): number {
  const bayesian = calcularBayesianNorm(p.calificacion_global, p.total_reviews);
  const insignias = calcularInsigniasNorm(p.insignias);
  return W1 * bayesian + W2 * insignias;
}
