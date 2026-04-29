import type { Emergency } from "@/types";

export const emergencies: Emergency[] = [
  {
    id: "gas_leak",
    title: "Fuga de gas",
    icon: "Flame",
    severity: "alta",
    keywords: ["gas", "fuga de gas", "huele a gas", "olor a gas", "tanque"],
    initialMessage:
      "Detecté una posible fuga de gas. Esto es una emergencia seria. Primero dime: ¿puedes oler el gas en este momento?",
    quickReplies: ["Sí, huele mucho", "Huele poco", "No estoy seguro"],
    flow: {
      "Sí, huele mucho": {
        severity: "alta",
        response:
          "⚠️ Actúa YA. Sigue estos pasos en orden:\n\n1. NO enciendas luces ni uses interruptores\n2. NO uses el celular DENTRO de la casa\n3. Abre puertas y ventanas\n4. Cierra la llave de paso del gas\n5. Sal de la casa inmediatamente\n6. Desde AFUERA, llama al 911 o a tu proveedor",
        quickReplies: [
          "¿Dónde está la llave de paso?",
          "Ya salí, ¿ahora qué?",
          "Necesito el número del proveedor",
        ],
        flow: {
          "¿Dónde está la llave de paso?": {
            response:
              "La llave de paso del gas suele estar en:\n\n• Junto al tanque estacionario (azotea o patio)\n• En el medidor si usas gas natural (fachada o banqueta)\n• Cocina: detrás o debajo de la estufa\n\nGírala 90° hasta que quede perpendicular al tubo para cerrarla. Si no la encuentras, sal de inmediato.",
            quickReplies: ["Ya la cerré", "No puedo encontrarla"],
            flow: {
              "Ya la cerré": {
                response:
                  "✅ Perfecto. Ahora sal de la casa si no lo has hecho, deja puertas y ventanas abiertas, y llama al proveedor para que verifiquen la instalación antes de volver a abrir el gas.",
                quickReplies: ["Número del proveedor", "Menú principal"],
              },
              "No puedo encontrarla": {
                severity: "alta",
                response:
                  "No pierdas más tiempo buscando. Sal de la casa ahora y llama al 911 desde afuera. Ellos coordinarán con bomberos y gas.",
                quickReplies: ["Ya salí, ¿ahora qué?", "Menú principal"],
              },
            },
          },
          "Ya salí, ¿ahora qué?": {
            response:
              "✅ Bien hecho. Ahora:\n\n1. Aléjate al menos 50 metros\n2. No dejes que nadie entre\n3. Llama al 911 y a tu proveedor\n4. Espera a que un técnico confirme que es seguro regresar\n\nNo regreses por objetos personales.",
            quickReplies: ["Número del proveedor", "Menú principal"],
          },
          "Necesito el número del proveedor": {
            response:
              "📞 Proveedores comunes en México:\n\n• Gas Natural Fenosa: 800 888 9000\n• Engie México: 800 112 0202\n• Gas LP local: consulta tu recibo\n• Emergencias generales: 911\n\nLlama desde afuera de la casa.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Huele poco": {
        severity: "media",
        response:
          "Aun un olor leve es motivo de acción. Haz esto:\n\n1. Abre ventanas y puertas para ventilar\n2. Apaga pilotos y no enciendas flama\n3. Revisa si una hornilla quedó abierta\n4. Cierra la llave de paso si el olor persiste\n\n¿El olor disminuye al ventilar?",
        quickReplies: ["Sí, desaparece", "No, sigue igual o aumenta"],
        flow: {
          "Sí, desaparece": {
            response:
              "✅ Probablemente fue una hornilla mal cerrada. Revisa:\n\n• Que todas las perillas estén en OFF\n• Que no haya pilotos apagados con válvula abierta\n\nSi vuelve el olor, cierra el gas y llama al proveedor.",
            quickReplies: ["Menú principal"],
          },
          "No, sigue igual o aumenta": {
            severity: "alta",
            response:
              "⚠️ Trátalo como fuga seria. Cierra la llave de paso, sal de la casa y llama al 911 desde afuera.",
            quickReplies: ["¿Dónde está la llave de paso?", "Menú principal"],
          },
        },
      },
      "No estoy seguro": {
        response:
          "El gas doméstico tiene un olor fuerte añadido (como huevo podrido). Si dudas:\n\n1. Ventila la casa abriendo ventanas\n2. No enciendas nada eléctrico\n3. Pide a alguien más que huela\n\n¿Ya ventilaste? ¿Ahora hueles algo?",
        quickReplies: ["Sí, ahora huele", "No huele a nada", "Menú principal"],
        flow: {
          "Sí, ahora huele": {
            severity: "alta",
            response:
              "Trátalo como fuga confirmada. Cierra la llave de paso y sal de la casa.",
            quickReplies: ["¿Dónde está la llave de paso?", "Ya salí, ¿ahora qué?"],
          },
          "No huele a nada": {
            response:
              "✅ Bien. Mantén la cocina ventilada por un rato más y revisa perillas y pilotos. Si vuelve el olor, actúa de inmediato.",
            quickReplies: ["Menú principal"],
          },
        },
      },
    },
  },
  {
    id: "water_leak",
    title: "Fuga de agua",
    icon: "Droplet",
    severity: "media",
    keywords: ["agua", "fuga de agua", "tuberia", "gotea", "chorro", "cañería"],
    initialMessage:
      "Vamos a controlar la fuga de agua. ¿Qué tan grave es lo que ves?",
    quickReplies: [
      "Hay mucha agua / chorro fuerte",
      "Gotea poco",
      "No sé de dónde viene",
    ],
    flow: {
      "Hay mucha agua / chorro fuerte": {
        severity: "alta",
        response:
          "⚠️ Actúa rápido para evitar daño:\n\n1. Cierra la llave de paso general (usualmente en el patio o entrada)\n2. Si hay contactos cerca, baja el switch principal de luz\n3. Retira objetos y muebles de la zona\n4. Coloca cubetas y trapos para contener",
        quickReplies: [
          "¿Dónde está la llave general?",
          "Ya cerré la llave",
          "Hay agua cerca de contactos",
        ],
        flow: {
          "¿Dónde está la llave general?": {
            response:
              "La llave general suele estar:\n\n• En la cisterna o tinaco\n• Junto al medidor (frente de la casa)\n• En el patio trasero o azotea\n\nGírala en sentido horario hasta que esté firme. Si no puedes cerrarla, cierra cada llave local (baño, cocina) mientras llegas a la principal.",
            quickReplies: ["Ya cerré la llave", "No puedo cerrarla"],
            flow: {
              "No puedo cerrarla": {
                response:
                  "Llama a un plomero de emergencia y, si el agua está afectando estructura o electricidad, contacta a Protección Civil o al 911.",
                quickReplies: ["Menú principal"],
              },
            },
          },
          "Ya cerré la llave": {
            response:
              "✅ Perfecto. Ahora:\n\n1. Identifica la fuga (tubo, conexión, mueble)\n2. Seca el área para evitar moho\n3. Toma fotos para tu seguro o para el plomero\n4. Llama a un plomero para la reparación\n\n¿Ves de dónde salía el agua?",
            quickReplies: ["De un tubo visible", "De la pared o techo", "Menú principal"],
            flow: {
              "De la pared o techo": {
                response:
                  "Fuga interna. No intentes abrir la pared tú mismo. Deja el agua cerrada y llama a un plomero con equipo de detección. Si el techo cede, evacúa esa habitación.",
                quickReplies: ["Menú principal"],
              },
              "De un tubo visible": {
                response:
                  "Si es una conexión floja, puedes ajustarla con llave. Si es el tubo roto, envuélvelo con cinta plomera o tela mientras llega el plomero. No vuelvas a abrir el agua hasta que esté reparado.",
                quickReplies: ["Menú principal"],
              },
            },
          },
          "Hay agua cerca de contactos": {
            severity: "alta",
            response:
              "⚠️ Peligro eléctrico. Haz esto:\n\n1. NO toques el agua ni los aparatos\n2. Baja el switch principal del tablero eléctrico\n3. Una vez sin luz, cierra el paso del agua\n4. Llama a CFE (071) si no puedes bajar el switch",
            quickReplies: ["Ya corté la luz", "No puedo llegar al tablero"],
            flow: {
              "No puedo llegar al tablero": {
                severity: "alta",
                response:
                  "Sal de la casa, no cruces el agua. Llama al 911 y a CFE (071). Espera afuera.",
                quickReplies: ["Menú principal"],
              },
              "Ya corté la luz": {
                response:
                  "✅ Ahora puedes cerrar el agua y limpiar. No vuelvas a encender luz hasta secar bien el área.",
                quickReplies: ["Menú principal"],
              },
            },
          },
        },
      },
      "Gotea poco": {
        severity: "info",
        response:
          "Una fuga pequeña también se trata:\n\n1. Coloca un recipiente para recoger el agua\n2. Cierra la llave local si sabes cuál es\n3. Apunta la ubicación exacta\n4. Agenda un plomero en las próximas 24-48 h\n\n¿Sabes dónde está la fuga?",
        quickReplies: ["Sí, es en un grifo", "Sí, es en la taza/WC", "No sé"],
        flow: {
          "Sí, es en un grifo": {
            response:
              "Suele ser el empaque de la llave. Cierra la llave local bajo el lavabo y sustitúyelo. Mientras tanto, un recipiente evita el desperdicio.",
            quickReplies: ["Menú principal"],
          },
          "Sí, es en la taza/WC": {
            response:
              "Revisa la llave angular al pie del WC o el flotador del tanque. Cierra la angular hasta que lo repares.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "No sé de dónde viene": {
        response:
          "Vamos por pasos:\n\n1. Cierra toda llave abierta en la casa\n2. Mira el medidor: si sigue girando, hay fuga oculta\n3. Revisa manchas en techos y paredes\n\n¿El medidor sigue girando con todo cerrado?",
        quickReplies: ["Sí, sigue girando", "No, se detuvo", "No tengo medidor"],
        flow: {
          "Sí, sigue girando": {
            response:
              "Hay fuga oculta. Cierra la llave general y llama a un plomero con detector de fugas. Documenta manchas o humedad que veas.",
            quickReplies: ["Menú principal"],
          },
          "No, se detuvo": {
            response:
              "✅ No hay fuga oculta activa. Probablemente una llave quedó abierta. Revisa todas las llaves de la casa.",
            quickReplies: ["Menú principal"],
          },
        },
      },
    },
  },
  {
    id: "power_outage",
    title: "Apagón / corto circuito",
    icon: "Zap",
    severity: "media",
    keywords: ["luz", "apagon", "apagón", "corto", "electricidad", "cfe", "sin luz"],
    initialMessage:
      "Te ayudo con el tema eléctrico. ¿Qué está pasando?",
    quickReplies: [
      "Se fue toda la luz",
      "Saltó un switch / breaker",
      "Huele a quemado o hay chispas",
    ],
    flow: {
      "Se fue toda la luz": {
        severity: "info",
        response:
          "Primero descarta si es solo tu casa o la zona:\n\n1. Mira si tus vecinos tienen luz\n2. Revisa el tablero: ¿hay breakers abajo?\n\n¿Qué ves?",
        quickReplies: [
          "Mis vecinos sí tienen luz",
          "Nadie tiene luz en la zona",
          "Hay un breaker abajo",
        ],
        flow: {
          "Mis vecinos sí tienen luz": {
            response:
              "El problema es solo tuyo. Sube cada breaker del tablero uno por uno. Si alguno vuelve a saltar, deja ese abajo: hay un corto en ese circuito.",
            quickReplies: ["Ya subí todos y vuelve a saltar uno", "Ya regresó la luz"],
            flow: {
              "Ya subí todos y vuelve a saltar uno": {
                severity: "alta",
                response:
                  "⚠️ Hay un corto. Deja ese breaker abajo, desconecta todo lo que estaba en esa zona y llama a un electricista. No lo fuerces a subir.",
                quickReplies: ["Menú principal"],
              },
            },
          },
          "Nadie tiene luz en la zona": {
            response:
              "Es apagón de CFE. Llama al 071 para reportar. Mientras:\n\n1. Desconecta electrónicos sensibles (al volver la luz puede haber pico)\n2. Deja una sola luz encendida para saber cuándo regresa\n3. Evita abrir refrigerador innecesariamente",
            quickReplies: ["Menú principal"],
          },
          "Hay un breaker abajo": {
            response:
              "Desconecta de ese circuito lo último que conectaste (puede ser la causa). Sube el breaker. Si vuelve a saltar, déjalo abajo y llama a un electricista.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Saltó un switch / breaker": {
        response:
          "Lo más seguro es que algo hizo sobrecarga. Haz esto:\n\n1. Desconecta los aparatos de ese circuito\n2. Sube el breaker\n3. Conecta uno por uno para identificar el culpable\n\nSi el breaker sigue saltando sin nada conectado, hay corto en la instalación.",
        quickReplies: ["Ya identifiqué el aparato", "Sigue saltando sin nada"],
        flow: {
          "Sigue saltando sin nada": {
            severity: "alta",
            response:
              "⚠️ Corto en la instalación. No sigas forzando el breaker. Llama a un electricista y deja ese circuito abajo.",
            quickReplies: ["Menú principal"],
          },
          "Ya identifiqué el aparato": {
            response:
              "✅ No lo uses hasta revisar. Puede tener un corto interno o haber sobrecargado el circuito. Llévalo a servicio técnico.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Huele a quemado o hay chispas": {
        severity: "alta",
        response:
          "⚠️ Emergencia eléctrica. Actúa YA:\n\n1. Baja el switch principal del tablero\n2. NO toques el aparato ni los cables\n3. Si hay fuego, NO uses agua. Usa extintor ABC o tierra\n4. Ventila el cuarto\n5. Llama al 911 si hay fuego y a CFE (071)",
        quickReplies: ["Hay fuego pequeño", "No hay fuego, solo olor", "Ya corté la luz"],
        flow: {
          "Hay fuego pequeño": {
            severity: "alta",
            response:
              "Usa extintor ABC apuntando a la base de la llama. Si no tienes o crece, SAL de la casa y llama al 911. No uses agua sobre fuego eléctrico.",
            quickReplies: ["Menú principal"],
          },
          "No hay fuego, solo olor": {
            response:
              "Deja el circuito cortado, ventila y llama a un electricista. No uses esos contactos hasta revisar.",
            quickReplies: ["Menú principal"],
          },
        },
      },
    },
  },
  {
    id: "fire",
    title: "Incendio en casa",
    icon: "Flame",
    severity: "alta",
    keywords: ["fuego", "incendio", "humo", "quema", "flama", "llama", "chispas"],
    initialMessage:
      "🚨 Un incendio es una emergencia grave. Lo más importante: tu vida. Dime qué pasa ahora:",
    quickReplies: [
      "Hay fuego pequeño y controlable",
      "El fuego crece o hay mucho humo",
      "Aún no hay fuego, solo humo",
    ],
    flow: {
      "Hay fuego pequeño y controlable": {
        severity: "alta",
        response:
          "Actúa rápido pero con cabeza:\n\n1. Si es aceite en sartén: tapa con una tapa metálica. NO AGUA\n2. Si es eléctrico: corta la luz y usa extintor ABC\n3. Si es papel/tela: agua o extintor\n4. Si en 30 segundos no lo controlas: SAL\n5. Llama al 911 aunque creas haberlo apagado",
        quickReplies: ["Es de aceite en la cocina", "Es eléctrico", "Ya lo apagué"],
        flow: {
          "Es de aceite en la cocina": {
            response:
              "🚨 NUNCA uses agua en aceite ardiendo. Tapa la sartén con una tapa metálica o bandeja para ahogar la flama. Apaga la estufa. Deja la tapa 15+ minutos antes de destapar.",
            quickReplies: ["Ya lo apagué", "No logré apagarlo"],
            flow: {
              "No logré apagarlo": {
                severity: "alta",
                response:
                  "SAL de la casa ahora y llama al 911 desde afuera. Cierra la puerta de la cocina al salir para contener el fuego.",
                quickReplies: ["Menú principal"],
              },
            },
          },
          "Es eléctrico": {
            severity: "alta",
            response:
              "1. Corta la luz en el tablero\n2. Usa extintor ABC (NO agua)\n3. Si no tienes extintor o el fuego crece, SAL y llama al 911",
            quickReplies: ["Ya lo apagué", "No logré apagarlo"],
          },
          "Ya lo apagué": {
            response:
              "✅ Aún así llama al 911 o a bomberos. Pueden revisar rescoldos y daño estructural. Ventila bien la casa. No duermas ahí hasta confirmar que no hay riesgo.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "El fuego crece o hay mucho humo": {
        severity: "alta",
        response:
          "🚨 SAL DE LA CASA YA. No intentes apagarlo:\n\n1. Agáchate — el humo es más denso arriba\n2. Cubre boca y nariz con tela húmeda si puedes\n3. Toca puertas antes de abrir: si están calientes, busca otra salida\n4. NO uses elevador\n5. Afuera, llama al 911\n6. NO regreses por nada",
        quickReplies: ["Estoy atrapado en una habitación", "Ya salí"],
        flow: {
          "Estoy atrapado en una habitación": {
            severity: "alta",
            response:
              "⚠️ Haz esto:\n\n1. Cierra la puerta y tapa con toallas mojadas las rendijas\n2. Abre la ventana y pide ayuda visible (tela, linterna)\n3. Llama al 911 y di TU DIRECCIÓN y el cuarto donde estás\n4. Mantente bajo, el aire limpio está cerca del piso\n5. Si hay balcón, ve ahí",
            quickReplies: ["Menú principal"],
          },
          "Ya salí": {
            response:
              "✅ Aléjate al menos 100m. Llama al 911 con la dirección exacta. No permitas que nadie entre. Espera a bomberos.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Aún no hay fuego, solo humo": {
        severity: "alta",
        response:
          "El humo es señal de alarma. Identifica el origen con cuidado:\n\n1. Si el humo viene de un aparato: desconéctalo del contacto con guante o tela\n2. Si no ves origen claro: SAL y llama al 911\n3. Ventila abriendo puertas y ventanas solo si es seguro\n4. Revisa detectores de humo",
        quickReplies: ["Viene de un aparato", "No sé de dónde viene"],
        flow: {
          "No sé de dónde viene": {
            severity: "alta",
            response:
              "No te arriesgues. Sal de la casa y llama al 911. Puede ser humo estructural o de un cuarto cerrado.",
            quickReplies: ["Menú principal"],
          },
          "Viene de un aparato": {
            response:
              "Desconéctalo con guante o tela seca desde el enchufe. Sácalo a un lugar abierto si puedes. Ventila. Si reaparece humo o sale flama, sal y llama al 911.",
            quickReplies: ["Menú principal"],
          },
        },
      },
    },
  },
  {
    id: "flood",
    title: "Inundación",
    icon: "Waves",
    severity: "alta",
    keywords: ["inundacion", "inundación", "inunda", "lluvia", "entró agua"],
    initialMessage:
      "Inundación en casa. Dime el origen para ayudarte mejor:",
    quickReplies: [
      "Está entrando agua de la calle",
      "Se desbordó una tubería",
      "Se filtra del techo",
    ],
    flow: {
      "Está entrando agua de la calle": {
        severity: "alta",
        response:
          "⚠️ Prioridad: seguridad y electricidad.\n\n1. Baja el switch principal de la luz\n2. Coloca bolsas de arena o trapos en puertas\n3. Sube objetos importantes a partes altas\n4. Desconecta aparatos bajos\n5. Si el agua sube rápido, sube al piso alto o techo\n6. Llama al 911 si el nivel es peligroso",
        quickReplies: ["El agua sigue subiendo", "Logré contenerla"],
        flow: {
          "El agua sigue subiendo": {
            severity: "alta",
            response:
              "🚨 Sube al nivel más alto posible. Lleva celular, identificaciones y agua potable. Llama al 911 y reporta tu ubicación. No intentes caminar por corrientes: 15 cm de agua corriendo te derriban.",
            quickReplies: ["Menú principal"],
          },
          "Logré contenerla": {
            response:
              "✅ Mantente atento al pronóstico. Documenta daños con fotos para tu seguro. No uses aparatos que se mojaron hasta revisar.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Se desbordó una tubería": {
        severity: "alta",
        response:
          "1. Cierra la llave general del agua\n2. Baja el switch eléctrico si el agua se acerca a contactos\n3. Retira agua con trapeador y cubetas\n4. Llama a un plomero de urgencia\n5. Ventila para evitar moho",
        quickReplies: ["¿Dónde está la llave general?", "Ya cerré la llave"],
        flow: {
          "¿Dónde está la llave general?": {
            response:
              "Usualmente está junto al medidor (fachada) o en la cisterna/tinaco. Gírala en sentido horario hasta cerrar.",
            quickReplies: ["Ya cerré la llave", "Menú principal"],
          },
          "Ya cerré la llave": {
            response:
              "✅ Ahora llama al plomero y comienza a retirar el agua. Fotografía todo para tu seguro.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Se filtra del techo": {
        severity: "media",
        response:
          "1. Coloca cubetas bajo las filtraciones\n2. Haz un pequeño orificio en la parte más baja del abombamiento del yeso para liberar presión y evitar colapso\n3. Retira objetos eléctricos de la zona\n4. Una vez pase la lluvia, llama a un albañil/impermeabilizador",
        quickReplies: ["El techo se está abombando", "Menú principal"],
        flow: {
          "El techo se está abombando": {
            severity: "alta",
            response:
              "⚠️ Evacúa esa habitación. Si el abombamiento crece rápido, podría colapsar. Llama al 911 o a Protección Civil si es grande.",
            quickReplies: ["Menú principal"],
          },
        },
      },
    },
  },
  {
    id: "chemical_smell",
    title: "Olor químico / monóxido",
    icon: "Wind",
    severity: "alta",
    keywords: [
      "quimico",
      "químico",
      "monoxido",
      "monóxido",
      "co",
      "cloro",
      "amoniaco",
      "olor raro",
    ],
    initialMessage:
      "Un olor químico o monóxido es serio. Dime más:",
    quickReplies: [
      "Mareo, dolor de cabeza o náusea",
      "Mezcla de cloro y otro producto",
      "Olor intenso desconocido",
    ],
    flow: {
      "Mareo, dolor de cabeza o náusea": {
        severity: "alta",
        response:
          "🚨 Posible envenenamiento por monóxido o químicos. ACTÚA YA:\n\n1. SAL de la casa al aire libre\n2. Lleva contigo a todos (mascotas también)\n3. Deja puertas abiertas para ventilar\n4. Llama al 911 — necesitas evaluación médica\n5. NO regreses hasta que bomberos confirmen que es seguro",
        quickReplies: ["¿Qué es el monóxido?", "Ya estamos afuera"],
        flow: {
          "¿Qué es el monóxido?": {
            response:
              "El monóxido de carbono (CO) es un gas sin olor ni color que producen calentadores, estufas y autos en mal estado. Causa dolor de cabeza, mareo, náusea y puede matar en minutos. Si hay síntomas, TODOS deben salir y recibir atención médica.",
            quickReplies: ["Ya estamos afuera", "Menú principal"],
          },
          "Ya estamos afuera": {
            response:
              "✅ Quédate afuera. Cuenta que estén todos. Espera a los servicios de emergencia. No permitas que nadie entre por pertenencias.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Mezcla de cloro y otro producto": {
        severity: "alta",
        response:
          "⚠️ Cloro + amoniaco o ácidos produce gases tóxicos (cloramina). Haz esto:\n\n1. SAL del cuarto de inmediato\n2. Abre puertas y ventanas desde la entrada\n3. NO intentes limpiarlo\n4. Sal de la casa\n5. Si hay tos, ardor en ojos o pecho: 911\n6. Espera 30+ min antes de volver, con ventilación total",
        quickReplies: ["Tengo tos o ardor", "Estoy bien, solo ventilé"],
        flow: {
          "Tengo tos o ardor": {
            severity: "alta",
            response:
              "Llama al 911. Mientras, respira aire limpio y enjuaga ojos con agua si hay ardor. No te automediques.",
            quickReplies: ["Menú principal"],
          },
          "Estoy bien, solo ventilé": {
            response:
              "✅ Bien. Mantén ventilado al menos 1 hora. Si aparecen síntomas después, llama a un médico. Nunca mezcles productos de limpieza.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Olor intenso desconocido": {
        severity: "alta",
        response:
          "Trátalo como peligro:\n\n1. Sal a un lugar ventilado\n2. Identifica si viene de la cocina (gas), un producto de limpieza, o de afuera\n3. Si persiste, llama al 911\n4. No enciendas flama si sospechas de gas",
        quickReplies: ["Puede ser gas", "Parece venir de afuera", "Menú principal"],
        flow: {
          "Puede ser gas": {
            response:
              "Si sospechas gas, abre el menú lateral y elige \"Fuga de gas\" para el protocolo completo. Mientras tanto: no enciendas flama ni interruptores, ventila y considera salir.",
            quickReplies: ["Menú principal"],
          },
          "Parece venir de afuera": {
            response:
              "Cierra puertas y ventanas del lado afectado, ventila por el otro. Llama al 911 para reportar si el olor es intenso y persistente; puede ser una fuga en tu colonia.",
            quickReplies: ["Menú principal"],
          },
        },
      },
    },
  },
  {
    id: "appliance_fail",
    title: "Falla de aparato eléctrico",
    icon: "AlertTriangle",
    severity: "media",
    keywords: ["aparato", "electrodomestico", "electrodoméstico", "refrigerador", "licuadora", "microondas", "lavadora"],
    initialMessage:
      "Un aparato está fallando. ¿Qué síntoma tiene?",
    quickReplies: [
      "Saca humo o huele a quemado",
      "Da toques al tocarlo",
      "No enciende",
    ],
    flow: {
      "Saca humo o huele a quemado": {
        severity: "alta",
        response:
          "⚠️ Pasos de inmediato:\n\n1. Desconéctalo del enchufe (con guante o tela seca)\n2. Si no puedes llegar al enchufe, baja el breaker de ese circuito\n3. Si hay fuego, usa extintor ABC. NO agua en eléctrico\n4. Ventila\n5. No lo vuelvas a usar hasta revisión técnica",
        quickReplies: ["Hay fuego pequeño", "Ya lo desconecté"],
        flow: {
          "Hay fuego pequeño": {
            severity: "alta",
            response:
              "Usa extintor ABC o manta ignífuga. Si no lo controlas en 30 seg, SAL y llama al 911.",
            quickReplies: ["Menú principal"],
          },
          "Ya lo desconecté": {
            response:
              "✅ Déjalo en un lugar ventilado lejos de materiales flamables hasta que se enfríe. Llévalo a servicio o deséchalo según aplique.",
            quickReplies: ["Menú principal"],
          },
        },
      },
      "Da toques al tocarlo": {
        severity: "alta",
        response:
          "⚠️ Aparato con fuga de corriente. Haz esto:\n\n1. NO lo toques de nuevo\n2. Desconéctalo usando guante seco o bajando el breaker primero\n3. No lo uses hasta que un técnico lo revise\n4. Revisa que tu casa tenga tierra física — un electricista puede verificar",
        quickReplies: ["Menú principal"],
      },
      "No enciende": {
        severity: "info",
        response:
          "Antes de asumir falla del aparato:\n\n1. Prueba en otro contacto\n2. Revisa que el breaker no haya saltado\n3. Revisa el cable por cortes o daño\n4. Si enciende en otro contacto: el problema es la toma\n5. Si no enciende en ninguno: llévalo a servicio",
        quickReplies: ["Menú principal"],
      },
    },
  },
  {
    id: "locked_out",
    title: "Me quedé fuera de casa",
    icon: "DoorClosed",
    severity: "info",
    keywords: ["afuera", "sin llaves", "fuera de casa", "cerrado", "me quede fuera"],
    initialMessage:
      "Te quedaste fuera. Primero lo primero: ¿hay alguien en riesgo adentro (niños, mascotas, estufa encendida)?",
    quickReplies: [
      "Sí, hay alguien o algo urgente adentro",
      "No, solo quiero entrar",
    ],
    flow: {
      "Sí, hay alguien o algo urgente adentro": {
        severity: "alta",
        response:
          "🚨 Llama al 911 de inmediato. Explica la situación:\n\n• Si hay un niño pequeño o persona vulnerable\n• Si dejaste algo encendido (estufa, plancha)\n• Si hay mascota en peligro (calor, encierro largo)\n\nBomberos pueden forzar la entrada sin daño mayor. No intentes romper ventanas tú mismo.",
        quickReplies: ["Menú principal"],
      },
      "No, solo quiero entrar": {
        severity: "info",
        response:
          "Opciones ordenadas de menos a más invasivas:\n\n1. ¿Tienes copia con algún familiar o vecino?\n2. ¿Alguna ventana o puerta secundaria sin seguro?\n3. Llama a un cerrajero de confianza (pide identificación y cotización antes)\n4. Como último recurso, romper cristal es costoso y peligroso\n\n¿Cuál opción quieres explorar?",
        quickReplies: [
          "Necesito cerrajero",
          "Hay una ventana abierta, ¿la uso?",
          "Menú principal",
        ],
        flow: {
          "Necesito cerrajero": {
            response:
              "Recomendaciones:\n\n• Busca cerrajeros con reseñas verificadas\n• Pide cotización antes de que llegue\n• Exige identificación al llegar\n• Paga solo al terminar y con recibo\n• Cobros típicos: $500-$1500 MXN según cerradura y hora",
            quickReplies: ["Menú principal"],
          },
          "Hay una ventana abierta, ¿la uso?": {
            response:
              "Solo si es segura de alcanzar (sin saltos peligrosos ni vidrios rotos). Si está alta, mejor paga un cerrajero: una caída sale más cara. Si lo haces, avísale a un vecino para que te vea.",
            quickReplies: ["Menú principal"],
          },
        },
      },
    },
  },
];

export const getEmergencyById = (id: string): Emergency | undefined =>
  emergencies.find((e) => e.id === id);
