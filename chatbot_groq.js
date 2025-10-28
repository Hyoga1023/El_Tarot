// =========================================
// chatbot_groq.js - Versión final con voz integrada (REFACORIZADA)
// =========================================

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO_IA = "llama-3.1-8b-instant";

// Variable para guardar la última interpretación
let ultimaInterpretacion = '';

// ==========================
// 1. GESTIÓN DE API KEY
// ==========================

function ensureGroqKey() {
  let apiKey = localStorage.getItem("groq_api_key");

  const esValida = apiKey && 
                   apiKey.trim() !== "" && 
                   apiKey !== "null" && 
                   apiKey !== "undefined" && 
                   apiKey !== null;

  if (esValida) {
    console.log("API Key válida encontrada en localStorage.");
    return apiKey.trim();
  }

  console.log("API Key no encontrada o inválida. Solicitando...");

  const nuevaKey = prompt("Introduce tu API Key de Groq (se guardará localmente):");

  if (nuevaKey && nuevaKey.trim() !== "") {
    const claveLimpia = nuevaKey.trim();
    localStorage.setItem("groq_api_key", claveLimpia);
    console.log("API Key guardada correctamente.");
    return claveLimpia;
  } else {
    alert("Debes ingresar una API Key válida para usar el oráculo.");
    return null;
  }
}

// ==========================
// 2. FUNCIÓN PRINCIPAL DE IA
// ==========================

async function generarInterpretacionIA(cartas, pregunta) {
  try {
    const GROQ_API_KEY = ensureGroqKey();

    if (!GROQ_API_KEY) {
      return "No hay conexión con el oráculo. Necesito tu API key de Groq para funcionar.";
    }

    const nombresCartas = cartas.map((c) => {
      const estado = c.invertida ? "invertida" : "derecha";
      return `${c.carta} (${estado})`;
    });

    const prompt = `Pregunta: "${pregunta}"
Cartas: ${nombresCartas[0]} (pasado), ${nombresCartas[1]} (desafíos), ${nombresCartas[2]} (futuro)

Como experto tarotista, dame UNA interpretación directa y concisa en SEGUNDA PERSONA (usando "veo", "percibo", "siento"). 
Máximo 250 palabras. Conecta las 3 cartas en un mensaje cohesivo y místico que responda la pregunta.
Usa tono sabio pero directo. No divagues.`;

    const payload = {
      model: MODELO_IA,
      messages: [
        {
          role: "system",
          content: "Eres un tarotista sabio. Responde siempre en segunda persona, de forma concisa y directa. Máximo 250 palabras por respuesta.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 325,
      temperature: 0.8,
    };

    console.log(`Consultando el modelo: ${MODELO_IA}`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error("Error al parsear respuesta:", e);
      }

      console.error(`Error Groq API: ${response.status}`, errorData);

      if (response.status === 401) {
        localStorage.removeItem("groq_api_key");
        return "API Key inválida. Se ha eliminado la clave guardada. Recarga la página e introduce una nueva.";
      }

      return `Error en el oráculo (${response.status}). ${errorData.error?.message || "Intenta de nuevo."}`;
    }

    const data = await response.json();
    const texto = data?.choices?.[0]?.message?.content;

    if (!texto) {
      return "El oráculo respondió en silencio. Intenta de nuevo.";
    }

    // Guardar para voz
    ultimaInterpretacion = texto.trim();
    console.log('Interpretación guardada para lectura de voz');

    return texto.trim();

  } catch (error) {
    console.error("Error en generarInterpretacionIA:", error);
    return "Algo falló en la consulta. Las estrellas están alineadas incorrectamente.";
  }
}

// ==========================
// 3. FUNCIONES AUXILIARES DE API KEY
// ==========================

function limpiarApiKey() {
  localStorage.removeItem("groq_api_key");
  console.log("API Key eliminada. Recarga la página para introducir una nueva.");
}

function verificarApiKey() {
  const key = localStorage.getItem("groq_api_key");
  console.log("API Key actual:", key ? "***" + key.slice(-4) : "No encontrada");
  return key;
}

// ==========================
// 4. CREAR EL BOTÓN DE VOZ (SOLO CUANDO EXISTA #limpiar)
// ==========================

function crearBotonVoz() {
  if (document.getElementById('boton-voz-tarot')) {
    return;
  }

  const botonLimpiar = document.getElementById('limpiar');
  if (!botonLimpiar) {
    console.warn('Botón "Limpiar" no encontrado. Reintentando...');
    setTimeout(crearBotonVoz, 500);
    return;
  }

  // Crear contenedor flex si no existe
  let contenedor = botonLimpiar.parentElement;
  if (!contenedor.classList.contains('botones-tarot')) {
    const nuevoContenedor = document.createElement('div');
    nuevoContenedor.className = 'botones-tarot';
    nuevoContenedor.style.cssText = `
      display: flex;
      gap: 20px;
      justify-content: center;
      align-items: center;
      margin-top: 30px;
      flex-wrap: wrap;
    `;
    botonLimpiar.parentNode.insertBefore(nuevoContenedor, botonLimpiar);
    nuevoContenedor.appendChild(botonLimpiar);
    contenedor = nuevoContenedor;
  }

  // Crear botón de voz
  const botonVoz = document.createElement('button');
  botonVoz.id = 'boton-voz-tarot';
  botonVoz.innerHTML = 'Escuchar lectura';
  botonVoz.style.cssText = `
    display: none;
    padding: 18px 48px;
    border: none;
    border-radius: 32px;
    background: linear-gradient(90deg, var(--color4) 0%, var(--color5) 100%);
    color: var(--color2);
    font-size: 2rem;
    font-family: var(--font-Titulos);
    font-weight: bold;
    letter-spacing: 2px;
    box-shadow: 0 4px 24px var(--color6), 0 2px 8px var(--color1);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(.4,2,.6,1);
    min-width: 280px;
  `;

  let estado = 'detenido';

  function actualizarEstado(nuevoEstado) {
    estado = nuevoEstado;
    switch (estado) {
      case 'reproduciendo':
        botonVoz.innerHTML = 'Pausar lectura';
        botonVoz.style.background = 'linear-gradient(90deg, var(--color5) 0%, var(--color6) 100%)';
        break;
      case 'pausado':
        botonVoz.innerHTML = 'Continuar lectura';
        botonVoz.style.background = 'linear-gradient(90deg, var(--color4) 0%, var(--color5) 100%)';
        break;
      default:
        botonVoz.innerHTML = 'Escuchar lectura';
        botonVoz.style.background = 'linear-gradient(90deg, var(--color4) 0%, var(--color5) 100%)';
        break;
    }
  }

  // Hover
  botonVoz.addEventListener('mouseenter', () => {
    if (estado === 'detenido') {
      botonVoz.style.transform = 'scale(1.07)';
      botonVoz.style.boxShadow = '0 8px 32px var(--color4), 0 4px 16px var(--color6)';
    }
  });

  botonVoz.addEventListener('mouseleave', () => {
    botonVoz.style.transform = 'scale(1)';
    botonVoz.style.boxShadow = '0 4px 24px var(--color6), 0 2px 8px var(--color1)';
  });

  // Click
  botonVoz.addEventListener('click', () => {
    if (!ultimaInterpretacion) {
      alert('No hay ninguna lectura para reproducir. Lanza las cartas primero.');
      return;
    }

    if (estado === 'reproduciendo') {
      window.speechSynthesis.pause();
      actualizarEstado('pausado');
    } else if (estado === 'pausado') {
      window.speechSynthesis.resume();
      actualizarEstado('reproduciendo');
    } else {
      leerInterpretacion(ultimaInterpretacion, actualizarEstado);
    }
  });

  // Insertar al lado de Limpiar
  contenedor.appendChild(botonVoz);
  console.log('Botón de voz creado junto a "Limpiar"');
}

// ==========================
// 5. FUNCIÓN DE LECTURA DE VOZ
// ==========================

function leerInterpretacion(texto, callback) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const textoLimpio = texto
    .replace(/[🔮✨🌙⭐💫🌟]/g, '')
    .replace(/\*\*/g, '')
    .replace(/\n\n+/g, '. ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(textoLimpio);

  const voices = window.speechSynthesis.getVoices();
  const vozEspanol = voices.find(v => 
    v.lang.includes('es') && (v.name.includes('Microsoft') || v.name.includes('Google'))
  ) || voices.find(v => v.lang.includes('es')) || voices[0];

  if (vozEspanol) utterance.voice = vozEspanol;

  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.lang = 'es-ES';

  utterance.onstart = () => callback('reproduciendo');
  utterance.onend = () => callback('detenido');
  utterance.onerror = () => callback('detenido');
  utterance.onpause = () => console.log('Lectura pausada');
  utterance.onresume = () => console.log('Lectura reanudada');

  window.speechSynthesis.speak(utterance);
}

// ==========================
// 6. MOSTRAR/OCULTAR BOTÓN
// ==========================

function mostrarBotonVoz() {
  const boton = document.getElementById('boton-voz-tarot');
  if (boton) {
    boton.style.display = 'block';
    console.log('Botón de voz visible');
  }
}

function ocultarBotonVoz() {
  const boton = document.getElementById('boton-voz-tarot');
  if (boton) {
    boton.style.display = 'none';
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }
}

// ==========================
// 7. DETECTAR NUEVA LECTURA
// ==========================

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'lanzar') {
    ocultarBotonVoz();
    ultimaInterpretacion = '';
    console.log('Nueva lectura iniciada, botón oculto');
  }
});

// ==========================
// 8. FUNCIONES PÚBLICAS
// ==========================

window.generarInterpretacionIA = generarInterpretacionIA;
window.crearBotonVoz = crearBotonVoz;
window.mostrarBotonVozTarot = mostrarBotonVoz;
window.ocultarBotonVozTarot = ocultarBotonVoz;
window.limpiarApiKey = limpiarApiKey;
window.verificarApiKey = verificarApiKey;

// ==========================
// INICIALIZACIÓN
// ==========================

window.speechSynthesis.onvoiceschanged = () => {
  console.log('Voces cargadas:', window.speechSynthesis.getVoices().length);
};

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SISTEMA DE VOZ INTEGRADO - ACTIVADO');
console.log('Botón aparecerá junto a "Limpiar"');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');