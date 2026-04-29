export interface Categoria {
  id: string;
  nombre: string;
  subcategorias?: Array<{ id: string; nombre: string }>;
}

export const categorias: Categoria[] = [
  { id: "electricidad", nombre: "Electricistas" },
  {
    id: "plomeria",
    nombre: "Plomeros",
    subcategorias: [
      { id: "fugas_menores", nombre: "Fugas menores" },
      { id: "tinacos", nombre: "Tinacos" },
      { id: "lavadora_secadora", nombre: "Lavadora / Secadora" },
      { id: "hidroneumaticos", nombre: "Hidroneumáticos" },
    ],
  },
  {
    id: "reparaciones",
    nombre: "Reparaciones de electrodomésticos",
    subcategorias: [
      { id: "lavadoras", nombre: "Lavadoras" },
      { id: "secadoras", nombre: "Secadoras" },
      { id: "refrigeradores", nombre: "Refrigeradores" },
      { id: "estufas", nombre: "Estufas" },
      { id: "calentones", nombre: "Calentones" },
      { id: "hornos_de_microondas", nombre: "Hornos de microondas" },
    ],
  },
  { id: "carpinteria", nombre: "Carpinteros" },
  {
    id: "construccion",
    nombre: "Construcción",
    subcategorias: [
      { id: "albañileria", nombre: "Albañilería" },
      { id: "impermeabilizacion", nombre: "Impermeabilización" },
      { id: "tablaroca", nombre: "Tablaroca" },
    ],
  },
  { id: "fumigacion", nombre: "Fumigación" },
  {
    id: "clima",
    nombre: "Clima",
    subcategorias: [
      { id: "instalacion_ac", nombre: "Instalación de A/C" },
      { id: "ducteros", nombre: "Ducteros" },
      { id: "reparacion_abanicos", nombre: "Reparación de abanicos" },
      { id: "reparacion_ac", nombre: "Reparación de A/C" },
    ],
  },
  { id: "pintura", nombre: "Pintura" },
  {
    id: "limpieza",
    nombre: "Limpieza",
    subcategorias: [
      { id: "alfombras", nombre: "Alfombras" },
      { id: "colchones", nombre: "Colchones" },
      { id: "salas", nombre: "Salas" },
    ],
  },
  {
    id: "seguridad",
    nombre: "Seguridad",
    subcategorias: [{ id: "alarmas", nombre: "Alarmas" }],
  },
  {
    id: "computo",
    nombre: "Cómputo",
    subcategorias: [{ id: "soporte", nombre: "Soporte" }],
  },
];

export function getValidCategoryIds(): string[] {
  const ids: string[] = [];
  for (const c of categorias) {
    ids.push(c.id);
    if (c.subcategorias) {
      for (const s of c.subcategorias) ids.push(`${c.id}.${s.id}`);
    }
  }
  return ids;
}

export function isValidCategoryId(id: string): boolean {
  return getValidCategoryIds().includes(id);
}

export function getCategoriaById(id: string): Categoria | undefined {
  const root = id.includes(".") ? id.split(".")[0] : id;
  return categorias.find((c) => c.id === root);
}
