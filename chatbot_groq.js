// chatbot_huggingface.js (o renómbralo a chatbot_groq.js para claridad)

// ¡AQUÍ ESTÁ EL FIX! Define API_URL al inicio del archivo.
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO_IA = "llama-3.1-8b-instant";  // Modelo actualizado y activo en Groq (rápido, context window grande)

// Comprobar o pedir la clave al cargar el script
(function ensureGroqKey() {
  let apiKey = localStorage.getItem("groq_api_key");
  if (!apiKey) {
    apiKey = prompt("Introduce tu API Key de Groq (solo se guardará una vez):");
    if (apiKey && apiKey.trim()) {
      localStorage.setItem("groq_api_key", apiKey.trim());
      console.log("API Key guardada en localStorage.");
    } else {
      console.warn("No se ingresó ninguna clave, la app no funcionará.");
    }
  }
})();

async function generarInterpretacionIA(cartas, pregunta) {
  try {
    const GROQ_API_KEY = localStorage.getItem("groq_api_key");
    if (!GROQ_API_KEY) {
      return "No hay conexión con el oráculo. Guarda tu API key de Groq en el LocalStorage.";
    }

    const nombresCartas = cartas.map((c) => {
      const estado = c.invertida ? "invertida" : "derecha";
      return `${c.carta} (${estado})`;
    });

    const prompt = `Eres un experto en el tarot y un maestro de la sabiduría arcana. La persona pregunta: "${pregunta}". Las cartas son: 1) ${nombresCartas[0]} (pasado / situación actual) 2) ${nombresCartas[1]} (desafíos) 3) ${nombresCartas[2]} (futuro / resultado) Proporciona una interpretación esotérica y profunda de esta tirada. Conecta las tres cartas en un relato coherente y significativo que responda a la pregunta del consultante. Evita lenguaje técnico, usa un tono sabio, misterioso y poético. debes desarrollar y culminar la idea antes de 390 tokens`;

    const payload = {
      model: MODELO_IA,
      messages: [
        { role: "system", content: "Eres un guía esotérico y sabio." },
        { role: "user", content: prompt }  // Usa el prompt real con las cartas y pregunta
      ],
      max_tokens: 400,
      temperature: 0.9
    };

    console.log(`Consultando el modelo de Groq: ${MODELO_IA}`);
    console.log("Payload enviado:", JSON.stringify(payload, null, 2));  // Para debugging

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
        console.error("No se pudo parsear el error de la API:", e);
      }
      console.error(`Error en Groq API: ${response.status} -`, errorData);
      if (errorData.error && typeof errorData.error === 'object') {
        return `Error en la API: ${errorData.error.message || 'Solicitud inválida'}. Verifica el modelo o la clave API.`;
      }
      return "El oráculo está de huelga. Vuelve a intentarlo.";
    }

    const data = await response.json();
    console.log("Respuesta de Groq:", data);

    const texto = data?.choices?.[0]?.message?.content;
    return texto ? texto.trim() : "El oráculo habló en silencio absoluto.";
  } catch (error) {
    console.error("Error al generar interpretación:", error);
    return "Algo falló en la consulta al oráculo. Intenta de nuevo cuando las estrellas se alineen.";
  }
}