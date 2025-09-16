// chatbot_groq.js - Versión mejorada para Cesar
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO_IA = "llama-3.1-8b-instant";

// Fix #1: Función mejorada para garantizar que la API Key se guarde
function ensureGroqKey() {
    let apiKey = localStorage.getItem("groq_api_key");
    
    // Verificar si realmente existe y no está vacía
    if (!apiKey || apiKey.trim() === "" || apiKey === "null" || apiKey === "undefined") {
        console.log("API Key no encontrada o inválida. Solicitando nueva...");
        
        apiKey = prompt("Introduce tu API Key de Groq (solo se guardará una vez):");
        
        if (apiKey && apiKey.trim() && apiKey.trim() !== "") {
            // Limpiar y guardar
            const cleanKey = apiKey.trim();
            localStorage.setItem("groq_api_key", cleanKey);
            
            // Verificar que se guardó correctamente
            const savedKey = localStorage.getItem("groq_api_key");
            if (savedKey === cleanKey) {
                console.log("✅ API Key guardada correctamente en localStorage.");
                return cleanKey;
            } else {
                console.error("❌ Error al guardar la API Key");
                alert("Error al guardar la clave. Intenta de nuevo.");
                return null;
            }
        } else {
            console.warn("No se ingresó una clave válida.");
            alert("Necesitas una API Key válida para usar el oráculo.");
            return null;
        }
    }
    
    console.log("✅ API Key encontrada en localStorage.");
    return apiKey;
}

// Llamar la función al cargar
ensureGroqKey();

async function generarInterpretacionIA(cartas, pregunta) {
    try {
        // Verificar la API Key cada vez
        const GROQ_API_KEY = ensureGroqKey();
        
        if (!GROQ_API_KEY) {
            return "No hay conexión con el oráculo. Necesito tu API key de Groq para funcionar.";
        }

        const nombresCartas = cartas.map((c) => {
            const estado = c.invertida ? "invertida" : "derecha";
            return `${c.carta} (${estado})`;
        });

        // Fix #2: Prompt optimizado para respuestas cortas y en primera persona
        const prompt = `Pregunta: "${pregunta}"
Cartas: ${nombresCartas[0]} (pasado), ${nombresCartas[1]} (desafíos), ${nombresCartas[2]} (futuro)

Como experto tarotista, dame UNA interpretación directa y concisa en PRIMERA PERSONA (usando "veo", "percibo", "siento"). 
Máximo 200 palabras. Conecta las 3 cartas en un mensaje cohesivo y místico que responda la pregunta.
Usa tono sabio pero directo. No divagues.`;

        const payload = {
            model: MODELO_IA,
            messages: [
                {
                    role: "system", 
                    content: "Eres un tarotista sabio. Responde siempre en primera persona, de forma concisa y directa. Máximo 200 palabras por respuesta."
                },
                {
                    role: "user", 
                    content: prompt
                }
            ],
            max_tokens: 250, // Reducido para respuestas más cortas
            temperature: 0.8 // Ligeramente menos creativo para más precisión
        };

        console.log(`Consultando el modelo: ${MODELO_IA}`);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                console.error("Error al parsear respuesta:", e);
            }
            
            console.error(`Error Groq API: ${response.status}`, errorData);
            
            // Manejo de errores más específico
            if (response.status === 401) {
                // API Key inválida, limpiar localStorage
                localStorage.removeItem("groq_api_key");
                return "API Key inválida. Se ha eliminado la clave guardada. Recarga la página e introduce una nueva.";
            }
            
            return `Error en el oráculo (${response.status}). ${errorData.error?.message || 'Intenta de nuevo.'}`;
        }

        const data = await response.json();
        console.log("Respuesta recibida:", data);

        const texto = data?.choices?.[0]?.message?.content;
        
        if (!texto) {
            return "El oráculo respondió en silencio. Intenta de nuevo.";
        }

        // Asegurar que la respuesta no sea demasiado larga
        const respuestaLimpia = texto.trim();
        return respuestaLimpia.length > 800 ? respuestaLimpia.substring(0, 800) + "..." : respuestaLimpia;

    } catch (error) {
        console.error("Error en generarInterpretacionIA:", error);
        return "Algo falló en la consulta. Las estrellas están alineadas incorrectamente. 🔮";
    }
}

// Función para limpiar la API Key (útil para debugging)
function limpiarApiKey() {
    localStorage.removeItem("groq_api_key");
    console.log("API Key eliminada. Recarga la página para introducir una nueva.");
}

// Función para verificar la API Key actual
function verificarApiKey() {
    const key = localStorage.getItem("groq_api_key");
    console.log("API Key actual:", key ? "***" + key.slice(-4) : "No encontrada");
    return key;
}