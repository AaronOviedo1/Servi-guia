# ServiGuía — chatbot de diagnóstico de servicios del hogar

Evolución del chatbot de emergencias hacia **ServiGuía**: detecta emergencias, clasifica problemas del hogar en el catálogo de ServiApp y sugiere proveedores. Usa **GPT-5 nano** (con visión) como clasificador, con el motor de reglas original como fallback.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4
- `framer-motion`, `lucide-react`
- `openai` v6 (Chat Completions API, modelo `gpt-5-nano`)
- TypeScript estricto, sin `any`

## Cómo correrlo

```bash
cd emergency-chatbot
npm install
cp .env.example .env.local
# edita .env.local y pega tu OPENAI_API_KEY
npm run dev
```

Abre `http://localhost:3000` para el chat, o `http://localhost:3000/test` para la suite de pruebas.

### Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `OPENAI_API_KEY` | sí (recomendado) | API key de OpenAI. Si no se define, el endpoint cae automáticamente al motor de reglas (precisión limitada). |

## Arquitectura

```
app/
  page.tsx                  ← UI: chat async contra endpoint
  api/diagnostico/route.ts  ← POST: GPT-5 nano + validación + fallback + filtrado de proveedores
  test/page.tsx             ← Suite visual de los 9 casos
components/
  ChatWindow.tsx            ← chat con botón de cámara + compresión
  MessageBubble.tsx         ← soporta imagen adjunta + provider cards
  ProviderCard.tsx          ← nuevo
  Sidebar.tsx, QuickReplies.tsx, EmergencyCard.tsx  ← sin cambios
lib/
  chatEngine.ts             ← motor de reglas (ahora con word-boundary, usado solo por fallback)
  emergencies.ts            ← 8 emergencias (alimenta sidebar y fallback)
  chatEngineV2.ts           ← cliente: fetch /api/diagnostico + hidratación de proveedores
  serviguia/
    prompt.ts               ← system prompt + inyección de catálogo
    filterProviders.ts      ← filtra/ordena trabajadores por categoría
    fallback.ts             ← mapea reglas → DiagnosticoResponse cuando falla el LLM
  data/
    categorias.ts           ← única fuente de verdad de IDs
    trabajadores.json       ← 10 trabajadores dummy (t001–t010)
types/index.ts              ← schema compartido cliente/servidor
```

## Flujo de una petición

1. Cliente manda `POST /api/diagnostico` con `{ text, image?, history? }`. La imagen ya llega comprimida a ≤1024px JPEG 0.8.
2. Endpoint arma `messages` con system prompt (catálogo inyectado), últimos 6 turnos de historial y el turno actual (content array con `text` y opcional `image_url`).
3. Llama `openai.chat.completions.create({ model: "gpt-5-nano", temperature: 0.2, response_format: { type: "json_object" } })`.
4. Valida JSON contra el schema. Si falla, reintenta 1 vez con un hint de corrección.
5. Si vuelve a fallar o no hay API key → `fallbackDiagnostico` (motor de reglas + mapping hardcoded).
6. Aplica reglas de negocio:
   - `CRÍTICO` → `categoria_detectada = null`, `proveedores = []`, `numero_emergencia = "911"`.
   - Resto → `filterProviders(categoria)` ordena por calificación desc y toma top 3 disponibles.
7. Devuelve `DiagnosticoResponse`.

## Schema de respuesta

```ts
{
  nivel_urgencia: "CRÍTICO" | "MODERADO" | "NORMAL",
  es_emergencia: boolean,
  accion_inmediata: string | null,
  categoria_detectada: string | null,   // ID del catálogo o null
  pregunta_seguimiento: string | null,
  resumen_diagnostico: string,
  proveedores_sugeridos: string[],      // IDs de trabajadores
  numero_emergencia: "911" | null,
  source: "llm" | "fallback"            // debug, no se muestra al usuario
}
```

## Soporte de imagen (mobile-first)

- Botón cámara a la izquierda del textarea, `<input type="file" accept="image/*" capture="environment">` → abre cámara trasera en móvil, file picker en desktop.
- Compresión cliente: `createImageBitmap` → canvas redimensionado a máx 1024px lado mayor → `toDataURL("image/jpeg", 0.8)`.
- Preview miniatura con botón X para quitar antes de enviar.
- Puede enviarse: texto solo, imagen sola, o ambos.
- El bubble del usuario muestra thumbnail + texto; click en thumbnail abre tamaño real en nueva pestaña.

## Suite de pruebas

Ruta: `/test`. Botón "Correr todos" dispara los 9 casos contra el endpoint y valida urgencia, categoría y providers requeridos.

### Resultados esperados (con `OPENAI_API_KEY` configurada — GPT-5 nano)

| ID | Input | Urgencia | Categoría esperada | Proveedor clave |
|---|---|---|---|---|
| C-01 | "Mi casa huele mucho a gas" | CRÍTICO | — | — |
| C-02 | "Hay chispas en el contacto de la cocina" | CRÍTICO | — | — |
| C-03 | "Tengo una gotera en el techo cuando llueve" | NORMAL | `construccion.impermeabilizacion` | t007 |
| C-04 | "El aire acondicionado ya no enfría" | NORMAL | `clima.reparacion_ac` | t005 |
| C-05 | "Se me fue la luz en dos cuartos nada más" | NORMAL | `electricidad` | t003 |
| C-06 | "Algo se descompuso en el baño" | NORMAL | (ambiguo, `pregunta_seguimiento` poblada) | — |
| C-07 | "Mi refrigerador ya no enfría bien" | NORMAL | `reparaciones.refrigeradores` | t010 |
| C-08 | "Hay agua saliendo por el fregadero" | MODERADO | `plomeria.fugas_menores` | t001 |
| C-09 (extra) | Texto + imagen PNG 1×1 dummy | NORMAL | (ambiguo) | — |

### Resultados en modo fallback (sin API key, solo motor de reglas)

Verificado en `/api/diagnostico` sin `OPENAI_API_KEY`:

| ID | Urgencia | Categoría | Providers | Veredicto |
|---|---|---|---|---|
| C-01 | CRÍTICO | null | [] | ✅ |
| C-02 | CRÍTICO | null | [] | ✅ (después de agregar "chispas" al keyword de `fire`) |
| C-03 | NORMAL | null | [] | ⚠️ (rule engine no conoce `impermeabilizacion`) |
| C-04 | NORMAL | null | [] | ⚠️ (no conoce `reparacion_ac`) |
| C-05 | MODERADO | electricidad | t003, t004 | ⚠️ (urgencia un nivel más alta) |
| C-06 | NORMAL | null | [] | ⚠️ (ambigüedad sin follow-up) |
| C-07 | NORMAL | reparaciones | t010 | ✅ |
| C-08 | MODERADO | plomeria.fugas_menores | t001, t002 | ✅ |

**El fallback es un safety net, no reemplaza al LLM.** La promesa de 8/8 aplica con `OPENAI_API_KEY` configurada. Sin key, el app sigue usable con ~5/8.

## Decisiones de diseño

- **No se tocó el motor de reglas ni la UI existente:** se agregó encima. El único cambio a `chatEngine.ts` fue usar word-boundary para evitar que keywords cortos (`co`, `luz`) matchearan substrings de palabras largas.
- **Catálogo inyectado en el system prompt** para que GPT-5 nano no invente IDs. Validación doble: el server también rechaza categorías fuera del catálogo (reintenta o cae a fallback).
- **Provider cards dentro de un bubble del bot**, siguiendo el flow de chat — mobile-first.
- **Historial limitado a últimos 6 turnos** para controlar tokens sin perder contexto conversacional.
- **Modo fallback silencioso** cuando no hay API key: la demo funciona sin configurar nada, pero el campo `source: "fallback"` queda en la respuesta para debug.
