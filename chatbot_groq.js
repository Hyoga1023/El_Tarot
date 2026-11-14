
// =========================================
// chatbot_groq.js - IA vía backend en Render
// =========================================

const API_URL = "https://tarot-backend-047w.onrender.com/api/interpretar";

// Última interpretación para el sistema de voz
let ultimaInterpretacion = "";


// =========================================
// LIMITAR EXTENSIÓN DE RESPUESTA
// =========================================

function limitarPalabras(texto, limite = 250) {

    const palabras = texto.trim().split(/\s+/);

    if (palabras.length <= limite) {
        return texto.trim();
    }

    const recorte = palabras.slice(0, limite).join(" ");

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
// FUNCIÓN PRINCIPAL DE IA
// =========================================

async function generarInterpretacionIA(cartas, pregunta) {

    try {

        if (!Array.isArray(cartas) || cartas.length !== 3) {

            throw new Error("La tirada debe contener exactamente tres cartas.");
        }

        // El servidor gratuito puede tardar en despertar
        const controller = new AbortController();

        const temporizador = setTimeout(
            () => controller.abort(),
            90000
        );

        const response = await fetch(API_URL, {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({

                pregunta,

                cartas: cartas.map((c) => ({
                    carta: c.carta,
                    invertida: Boolean(c.invertida)
                }))
            }),

            signal: controller.signal
        });

        clearTimeout(temporizador);

        if (!response.ok) {

            let mensaje = "";

            try {

                const errorData = await response.json();

                mensaje = errorData.error || "";

            } catch (error) {

                console.error("No se pudo leer el error del servidor.");
            }

            console.error(`Error del servidor: ${response.status}`, mensaje);

            if (response.status === 429) {

                return "Has hecho demasiadas consultas seguidas. Espera un momento.";
            }

            return mensaje || `Error en el oráculo (${response.status}).`;
        }

        const data = await response.json();

        const texto = data?.interpretacion;

        if (!texto || !texto.trim()) {

            return "No recibí una interpretación. Intenta nuevamente.";
        }

        const interpretacionFinal = limitarPalabras(texto.trim(), 250);

        // Guardar para sistema de voz
        ultimaInterpretacion = interpretacionFinal;

        console.log(
            "Interpretación generada:",
            interpretacionFinal.split(/\s+/).length,
            "palabras."
        );

        return interpretacionFinal;

    } catch (error) {

        console.error("Error en generarInterpretacionIA:", error);

        if (error.name === "AbortError") {

            return "El oráculo tardó demasiado en despertar. Intenta nuevamente.";
        }

        return "No pude completar la consulta al oráculo. Intenta nuevamente.";
    }
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
console.log("Sistema de voz integrado.");
console.log("----------------------------------------");
