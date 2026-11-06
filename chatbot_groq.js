
// =========================================
// chatbot_groq.js - Versión optimizada
// Groq + Tarot + Sistema de voz
// =========================================

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO_IA = "openai/gpt-oss-20b";

// Última interpretación para el sistema de voz
let ultimaInterpretacion = "";

// Respaldo temporal de API Key
let apiKeyEnMemoria = null;


// =========================================
// 1. GESTIÓN DE API KEY
// =========================================

function ensureGroqKey() {

    try {

        let apiKey = localStorage.getItem("groq_api_key");

        const esValida =
            apiKey &&
            apiKey.trim() !== "" &&
            apiKey !== "null" &&
            apiKey !== "undefined";

        if (esValida) {

            apiKeyEnMemoria = apiKey.trim();

            return apiKeyEnMemoria;
        }

    } catch (error) {

        console.warn("No se pudo acceder a localStorage:", error);
    }

    if (apiKeyEnMemoria) {
        return apiKeyEnMemoria;
    }

    const nuevaKey = prompt(
        "Introduce tu API Key de Groq:"
    );

    if (!nuevaKey || !nuevaKey.trim()) {

        alert("Debes ingresar una API Key para utilizar el oráculo.");

        return null;
    }

    const claveLimpia = nuevaKey.trim();

    apiKeyEnMemoria = claveLimpia;

    try {

        localStorage.setItem(
            "groq_api_key",
            claveLimpia
        );

        const claveGuardada =
            localStorage.getItem("groq_api_key");

        if (claveGuardada === claveLimpia) {

            console.log("API Key guardada correctamente.");

        } else {

            console.warn("Se utilizará la clave temporal.");
        }

    } catch (error) {

        console.warn("No se pudo guardar la API Key:", error);
    }

    return claveLimpia;
}


// =========================================
// 2. LIMITAR EXTENSIÓN DE RESPUESTA
// =========================================

function limitarPalabras(texto, limite = 180) {

    const palabras = texto.trim().split(/\s+/);

    if (palabras.length <= limite) {
        return texto.trim();
    }

    const recorte = palabras
        .slice(0, limite)
        .join(" ");

    const ultimoPunto = Math.max(
        recorte.lastIndexOf("."),
        recorte.lastIndexOf("!"),
        recorte.lastIndexOf("?")
    );

    if (ultimoPunto > recorte.length * 0.65) {
        return recorte.substring(0, ultimoPunto + 1);
    }

    return recorte.replace(/[,:;]$/, "") + "…";
}


// =========================================
// 3. FUNCIÓN PRINCIPAL DE IA
// =========================================

async function generarInterpretacionIA(cartas, pregunta) {

    try {

        const GROQ_API_KEY = ensureGroqKey();

        if (!GROQ_API_KEY) {

            return "No puedo consultar el oráculo sin una API Key de Groq.";
        }

        if (!Array.isArray(cartas) || cartas.length !== 3) {

            throw new Error("La tirada debe contener exactamente tres cartas.");
        }

        const nombresCartas = cartas.map((c) => {

            const estado = c.invertida
                ? "invertida"
                : "derecha";

            return `${c.carta} (${estado})`;

        });

        // =========================================
        // PROMPT DE INTERPRETACIÓN
        // =========================================

        const prompt = `
Pregunta del consultante: "${pregunta}"

Cartas seleccionadas:

1. ${nombresCartas[0]}: pasado o situación actual.
2. ${nombresCartas[1]}: desafíos.
3. ${nombresCartas[2]}: futuro o resultado.

Interpreta las tres cartas como un único mensaje coherente
que responda directamente a la pregunta.

REGLAS OBLIGATORIAS:

- Escribe entre 130 y 170 palabras.
- Habla siempre en primera persona como tarotista.
- Utiliza expresiones como "veo", "percibo", "interpreto" y "siento".
- Dirígete directamente al consultante utilizando "tú".
- Nunca hables del tarotista en tercera persona.
- No describas al consultante como si fuera otra persona.
- Explica el significado de cada carta y su relación con las demás.
- Analiza cómo la situación actual influye en los desafíos y en el posible resultado.
- Ofrece una reflexión significativa relacionada con la pregunta.
- Utiliza un tono místico, cálido, profundo y natural.
- Evita introducciones, saludos y conclusiones innecesarias.
- No repitas ideas para completar la extensión.
- Entrega únicamente la interpretación.
`;

        // =========================================
        // CONFIGURACIÓN DE GROQ
        // =========================================

        const payload = {

            model: MODELO_IA,

            messages: [

                {
                    role: "system",

                    content: `
Eres un intérprete profesional de tarot.

Tu comunicación es directa, personal y cercana.

Hablas en primera persona singular.
Tu voz utiliza expresiones como:
"Veo en estas cartas..."
"Percibo una energía..."
"Interpreto esta combinación..."

Te diriges directamente a quien consulta.

Jamás hables de ti en tercera persona.

Tus interpretaciones son profundas, claras y significativas.

Escribe entre 130 y 170 palabras.
Desarrolla el significado de las tres cartas.
Conecta sus mensajes en una interpretación coherente.
No repitas ideas ni utilices frases de relleno.

Mantén siempre un tono místico, cálido y reflexivo.
`
                },

                {
                    role: "user",
                    content: prompt
                }

            ],

            max_completion_tokens: 500,

            reasoning_effort: "low",

            reasoning_format: "hidden",

            temperature: 0.6
        };

        console.log("Consultando modelo:", MODELO_IA);

        // =========================================
        // SOLICITUD API
        // =========================================

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: `Bearer ${GROQ_API_KEY}`

            },

            body: JSON.stringify(payload)

        });

        // =========================================
        // MANEJO DE ERRORES
        // =========================================

        if (!response.ok) {

            let errorData = {};

            try {

                errorData = await response.json();

            } catch (error) {

                console.error("No se pudo leer el error de Groq.");
            }

            const mensajeError =
                errorData.error?.message || "Error desconocido.";

            console.error(
                `Error Groq API: ${response.status}`,
                mensajeError
            );

            if (response.status === 401) {

                limpiarApiKey();

                return "Tu API Key no es válida. Recarga la página e introduce una nueva.";
            }

            if (response.status === 404) {

                return "El modelo de IA no está disponible para tu cuenta de Groq.";
            }

            if (response.status === 429) {

                return "Has alcanzado el límite de consultas de Groq. Inténtalo más tarde.";
            }

            return `Error en el oráculo (${response.status}). ${mensajeError}`;
        }

        // =========================================
        // PROCESAR RESPUESTA
        // =========================================

        const data = await response.json();

        const texto = data?.choices?.[0]?.message?.content;

        if (!texto || !texto.trim()) {

            return "No recibí una interpretación. Intenta nuevamente.";
        }

        const interpretacionFinal = limitarPalabras(
            texto.trim(),
            180
        );

        // Guardar para sistema de voz
        ultimaInterpretacion = interpretacionFinal;

        console.log(
            "Interpretación generada:",
            interpretacionFinal.split(/\s+/).length,
            "palabras."
        );

        return interpretacionFinal;

    } catch (error) {

        console.error(
            "Error en generarInterpretacionIA:",
            error
        );

        return "No pude completar la consulta al oráculo. Intenta nuevamente.";
    }
}


// =========================================
// 4. FUNCIONES AUXILIARES API KEY
// =========================================

function limpiarApiKey() {

    try {

        localStorage.removeItem("groq_api_key");

    } catch (error) {

        console.warn("No se pudo limpiar localStorage.");
    }

    apiKeyEnMemoria = null;

    console.log("API Key eliminada.");
}


function verificarApiKey() {

    let key = null;

    try {

        key = localStorage.getItem("groq_api_key");

    } catch (error) {

        console.warn("No se pudo acceder a localStorage.");
    }

    key = key || apiKeyEnMemoria;

    console.log(
        "API Key:",
        key ? "***" + key.slice(-4) : "No encontrada"
    );

    return Boolean(key);
}


// =========================================
// 5. CREAR BOTÓN DE VOZ
// =========================================

function crearBotonVoz() {

    if (document.getElementById("boton-voz-tarot")) {
        return;
    }

    const botonLimpiar = document.getElementById("limpiar");

    if (!botonLimpiar) {

        console.warn("Esperando botón Limpiar...");

        setTimeout(crearBotonVoz, 500);

        return;
    }

    let contenedor = botonLimpiar.parentElement;

    if (!contenedor.classList.contains("botones-tarot")) {

        const nuevoContenedor = document.createElement("div");

        nuevoContenedor.className = "botones-tarot";

        nuevoContenedor.style.cssText = `
            display: flex;
            gap: 20px;
            justify-content: center;
            align-items: center;
            margin-top: 30px;
            flex-wrap: wrap;
        `;

        botonLimpiar.parentNode.insertBefore(
            nuevoContenedor,
            botonLimpiar
        );

        nuevoContenedor.appendChild(botonLimpiar);

        contenedor = nuevoContenedor;
    }

    const botonVoz = document.createElement("button");

    botonVoz.id = "boton-voz-tarot";

    botonVoz.textContent = "Escuchar lectura";

    botonVoz.style.cssText = `
        display: none;
        padding: 18px 48px;
        border: none;
        border-radius: 32px;
        background: linear-gradient(90deg, var(--color4), var(--color5));
        color: var(--color2);
        font-size: 2rem;
        font-family: var(--font-Titulos);
        font-weight: bold;
        letter-spacing: 2px;
        box-shadow: 0 4px 24px var(--color6);
        cursor: pointer;
        transition: all 0.4s;
        min-width: 280px;
        max-width: 100%;
    `;

    let estado = "detenido";

    function actualizarEstado(nuevoEstado) {

        estado = nuevoEstado;

        switch (estado) {

            case "reproduciendo":

                botonVoz.textContent = "Pausar lectura";

                botonVoz.style.background =
                    "linear-gradient(90deg, var(--color5), var(--color6))";

                break;

            case "pausado":

                botonVoz.textContent = "Continuar lectura";

                botonVoz.style.background =
                    "linear-gradient(90deg, var(--color4), var(--color5))";

                break;

            default:

                botonVoz.textContent = "Escuchar lectura";

                botonVoz.style.background =
                    "linear-gradient(90deg, var(--color4), var(--color5))";

                break;
        }
    }

    botonVoz.addEventListener("mouseenter", () => {

        if (estado === "detenido") {

            botonVoz.style.transform = "scale(1.05)";
        }
    });

    botonVoz.addEventListener("mouseleave", () => {

        botonVoz.style.transform = "scale(1)";
    });

    botonVoz.addEventListener("click", () => {

        if (!ultimaInterpretacion) {

            alert("No hay ninguna lectura para reproducir.");

            return;
        }

        if (!("speechSynthesis" in window)) {

            alert("Tu navegador no admite lectura de voz.");

            return;
        }

        if (estado === "reproduciendo") {

            window.speechSynthesis.pause();

            actualizarEstado("pausado");

        } else if (estado === "pausado") {

            window.speechSynthesis.resume();

            actualizarEstado("reproduciendo");

        } else {

            leerInterpretacion(
                ultimaInterpretacion,
                actualizarEstado
            );
        }
    });

    contenedor.appendChild(botonVoz);

    console.log("Botón de voz creado correctamente.");
}


// =========================================
// 6. FUNCIÓN DE LECTURA DE VOZ
// =========================================

function leerInterpretacion(texto, callback) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    if (window.speechSynthesis.speaking) {

        window.speechSynthesis.cancel();
    }

    const textoLimpio = texto

        .replace(/[🔮✨🌙⭐💫🌟]/g, "")

        .replace(/\*\*/g, "")

        .replace(/\n\n+/g, ". ")

        .trim();

    const utterance = new SpeechSynthesisUtterance(
        textoLimpio
    );

    const voices = window.speechSynthesis.getVoices();

    const vozEspanol = voices.find(v =>
        v.lang.toLowerCase().startsWith("es") &&
        (
            v.name.includes("Microsoft") ||
            v.name.includes("Google")
        )
    ) || voices.find(v =>
        v.lang.toLowerCase().startsWith("es")
    );

    if (vozEspanol) {

        utterance.voice = vozEspanol;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "es-ES";

    utterance.onstart = () => {
        callback("reproduciendo");
    };

    utterance.onend = () => {
        callback("detenido");
    };

    utterance.onerror = () => {
        callback("detenido");
    };

    window.speechSynthesis.speak(utterance);
}


// =========================================
// 7. MOSTRAR / OCULTAR BOTÓN
// =========================================

function mostrarBotonVoz() {

    const boton = document.getElementById(
        "boton-voz-tarot"
    );

    if (boton) {

        boton.style.display = "block";

        console.log("Botón de voz visible.");
    }
}


function ocultarBotonVoz() {

    const boton = document.getElementById(
        "boton-voz-tarot"
    );

    if (boton) {

        boton.style.display = "none";
    }

    if (
        "speechSynthesis" in window &&
        window.speechSynthesis.speaking
    ) {

        window.speechSynthesis.cancel();
    }
}


// =========================================
// 8. DETECTAR NUEVA LECTURA
// =========================================

document.addEventListener("click", (e) => {

    if (e.target && e.target.closest("#lanzar")) {

        ocultarBotonVoz();

        ultimaInterpretacion = "";

        console.log("Nueva lectura iniciada.");
    }
});


// =========================================
// 9. FUNCIONES PÚBLICAS
// =========================================

window.generarInterpretacionIA = generarInterpretacionIA;

window.crearBotonVoz = crearBotonVoz;

window.mostrarBotonVozTarot = mostrarBotonVoz;

window.ocultarBotonVozTarot = ocultarBotonVoz;

window.limpiarApiKey = limpiarApiKey;

window.verificarApiKey = verificarApiKey;


// =========================================
// 10. INICIALIZACIÓN DEL SISTEMA DE VOZ
// =========================================

if ("speechSynthesis" in window) {

    window.speechSynthesis.onvoiceschanged = () => {

        console.log(
            "Voces disponibles:",
            window.speechSynthesis.getVoices().length
        );
    };
}

console.log("----------------------------------------");
console.log("SISTEMA DE TAROT CON IA ACTIVADO");
console.log("Modelo:", MODELO_IA);
console.log("Sistema de voz integrado.");
console.log("----------------------------------------");
