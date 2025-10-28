// tarot_voz.js
// =========================================
// Sistema de Voz para El Tarót
// =========================================

const synth = window.speechSynthesis;
let currentUtterance = null;
let voices = [];
let isPaused = false;

// ==========================
// 1. Cargar voces disponibles
// ==========================
function cargarVoces() {
  voices = synth.getVoices();
  
  if (voices.length === 0) {
    console.warn('⚠️ Voces aún no disponibles, reintentando...');
    return;
  }
  
  // Priorizar voces en español
  const vozEspanol = voices.find(v => 
    v.lang.includes('es') && v.name.includes('Microsoft')
  ) || voices.find(v => v.lang.includes('es'));
  
  if (vozEspanol) {
    console.log(`✅ Voz seleccionada: ${vozEspanol.name} (${vozEspanol.lang})`);
  } else {
    console.log('⚠️ No se encontró voz en español, usando voz por defecto');
  }
}

// Cargar voces cuando estén disponibles
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = cargarVoces;
}
cargarVoces();

// ==========================
// 2. Crear botón de voz dinámicamente
// ==========================
function crearBotonVoz(contenedor, texto) {
  // Verificar si ya existe un botón
  const botonExistente = contenedor.querySelector('.btn-leer-voz');
  if (botonExistente) {
    botonExistente.remove();
  }
  
  const botonVoz = document.createElement('button');
  botonVoz.className = 'btn-leer-voz';
  botonVoz.innerHTML = '🔊 Escuchar lectura';
  botonVoz.style.cssText = `
    margin-top: 20px;
    padding: 12px 32px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(90deg, #FEBA17 0%, #74512D 100%);
    color: #F8F4E1;
    font-size: 1.3rem;
    font-family: var(--font-Titulos);
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(254, 186, 23, 0.4);
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  `;
  
  // Estados del botón
  let estadoActual = 'detenido'; // 'detenido', 'reproduciendo', 'pausado'
  
  function actualizarBoton(estado) {
    estadoActual = estado;
    switch(estado) {
      case 'reproduciendo':
        botonVoz.innerHTML = '⏸️ Pausar';
        botonVoz.style.background = 'linear-gradient(90deg, #74512D 0%, #4E1F00 100%)';
        break;
      case 'pausado':
        botonVoz.innerHTML = '▶️ Continuar';
        botonVoz.style.background = 'linear-gradient(90deg, #FEBA17 0%, #74512D 100%)';
        break;
      case 'detenido':
      default:
        botonVoz.innerHTML = '🔊 Escuchar lectura';
        botonVoz.style.background = 'linear-gradient(90deg, #FEBA17 0%, #74512D 100%)';
        break;
    }
  }
  
  // Evento hover
  botonVoz.addEventListener('mouseenter', () => {
    if (estadoActual === 'detenido') {
      botonVoz.style.transform = 'scale(1.05)';
      botonVoz.style.boxShadow = '0 6px 20px rgba(254, 186, 23, 0.6)';
    }
  });
  
  botonVoz.addEventListener('mouseleave', () => {
    botonVoz.style.transform = 'scale(1)';
    botonVoz.style.boxShadow = '0 4px 16px rgba(254, 186, 23, 0.4)';
  });
  
  // Lógica de reproducción
  botonVoz.addEventListener('click', () => {
    if (estadoActual === 'reproduciendo') {
      // Pausar
      synth.pause();
      isPaused = true;
      actualizarBoton('pausado');
    } else if (estadoActual === 'pausado') {
      // Reanudar
      synth.resume();
      isPaused = false;
      actualizarBoton('reproduciendo');
    } else {
      // Iniciar lectura
      leerTexto(texto, botonVoz, actualizarBoton);
    }
  });
  
  return botonVoz;
}

// ==========================
// 3. Función principal de lectura
// ==========================
function leerTexto(texto, boton, actualizarBoton) {
  // Detener cualquier lectura anterior
  if (synth.speaking) {
    synth.cancel();
  }
  
  // Limpiar el texto (quitar emojis y caracteres especiales excesivos)
  const textoLimpio = texto
    .replace(/[🔮✨🌙⭐💫🌟]/g, '') // Quitar emojis comunes del tarot
    .replace(/\*\*/g, '') // Quitar negritas markdown
    .replace(/\n\n+/g, '. ') // Convertir saltos de línea en pausas
    .trim();
  
  currentUtterance = new SpeechSynthesisUtterance(textoLimpio);
  
  // Configurar la voz
  const vozEspanol = voices.find(v => 
    v.lang.includes('es') && v.name.includes('Microsoft')
  ) || voices.find(v => v.lang.includes('es')) || voices[0];
  
  if (vozEspanol) {
    currentUtterance.voice = vozEspanol;
  }
  
  // Configuración de la voz (ajustable según preferencia)
  currentUtterance.rate = 0.9;    // Velocidad (0.1 - 10)
  currentUtterance.pitch = 1;     // Tono (0 - 2)
  currentUtterance.volume = 1;    // Volumen (0 - 1)
  currentUtterance.lang = 'es-ES'; // Idioma
  
  // Eventos de la síntesis
  currentUtterance.onstart = () => {
    console.log('🗣️ Iniciando lectura...');
    actualizarBoton('reproduciendo');
  };
  
  currentUtterance.onend = () => {
    console.log('✅ Lectura finalizada');
    actualizarBoton('detenido');
    currentUtterance = null;
    isPaused = false;
  };
  
  currentUtterance.onerror = (event) => {
    console.error('❌ Error en la síntesis de voz:', event.error);
    actualizarBoton('detenido');
    
    // Mensaje de error amigable
    if (event.error === 'network') {
      console.warn('Error de red. Verifica tu conexión.');
    } else if (event.error === 'synthesis-failed') {
      console.warn('Fallo en la síntesis. Intenta de nuevo.');
    }
  };
  
  currentUtterance.onpause = () => {
    console.log('⏸️ Lectura pausada');
  };
  
  currentUtterance.onresume = () => {
    console.log('▶️ Lectura reanudada');
  };
  
  // Iniciar la síntesis
  synth.speak(currentUtterance);
}

// ==========================
// 4. Detener completamente la voz
// ==========================
function detenerVoz() {
  if (synth.speaking) {
    synth.cancel();
    currentUtterance = null;
    isPaused = false;
    console.log('🛑 Voz detenida');
  }
}

// ==========================
// 5. Función pública para integrar con SweetAlert
// ==========================
window.agregarBotonVoz = function(contenedorSelector, texto) {
  const contenedor = document.querySelector(contenedorSelector);
  if (!contenedor) {
    console.error(`No se encontró el contenedor: ${contenedorSelector}`);
    return;
  }
  
  const boton = crearBotonVoz(contenedor, texto);
  contenedor.appendChild(boton);
};

// ==========================
// 6. Limpieza automática al cerrar popups
// ==========================
window.addEventListener('beforeunload', () => {
  detenerVoz();
});

// Exportar funciones útiles
window.tarotVoz = {
  leer: (texto) => {
    const contenedorTemp = document.createElement('div');
    leerTexto(texto, null, () => {});
  },
  detener: detenerVoz,
  estáReproduciendo: () => synth.speaking
};

console.log('✅ Sistema de voz del tarot cargado correctamente');