// =========================================
// SWEETALERT2 REFACTORIZADO CON VOZ
// Sistema de popups del tarot con lectura de voz
// =========================================

// ==========================
// 1. POPUP DE BIENVENIDA
// ==========================
async function mostrarBienvenida() {
  const textoInicial = `Las cartas están listas para revelarte lo que el Universo guarda en silencio.
Conecta con tu intuición, elige con el corazón, y deja que el destino te guíe.
¿Estás listo para descubrir tu camino?`;

  // Detener cualquier voz previa
  if (window.tarotVoz) {
    window.tarotVoz.detener();
  }

  await Swal.fire({
    title: 'Bienvenido al Tarót',
    html: `
      <p style="font-size: 1.3rem; line-height: 1.6; color: var(--color3); font-family: var(--font-Parrafos2); font-style: italic;">
        Las cartas están listas para revelarte lo que el Universo guarda en silencio.<br>
        Conecta con tu intuición, elige con el corazón, y deja que el destino te guíe.<br><br>
        ¿Estás listo para descubrir tu camino?
      </p>
      <div id="contenedor-boton-voz-bienvenida"></div>
    `,
    color: 'var(--color3)',
    confirmButtonText: 'Comenzar lectura',
    confirmButtonColor: 'var(--color4)',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'tarot-popup smoke-popup',
      title: 'tarot-title',
      confirmButton: 'tarot-button'
    },
    showClass: {
      popup: 'smoke-in'
    },
    hideClass: {
      popup: 'smoke-out'
    },
    didOpen: () => {
      // Agregar botón de voz
      if (window.agregarBotonVoz) {
        window.agregarBotonVoz('#contenedor-boton-voz-bienvenida', textoInicial);
      }
    },
    willClose: () => {
      // Detener voz al cerrar
      if (window.tarotVoz) {
        window.tarotVoz.detener();
      }
    }
  });
}

// ==========================
// 2. POPUP DE PREGUNTA
// ==========================
async function solicitarPregunta() {
  // Detener cualquier voz previa
  if (window.tarotVoz) {
    window.tarotVoz.detener();
  }

  const { value: pregunta } = await Swal.fire({
    title: '¿Qué deseas consultar?',
    html: `
      <p style="font-size: 1.2rem; margin-bottom: 15px; color: var(--color3); font-family: var(--font-Parrafos2);">
        Escribe tu pregunta con claridad y desde el corazón.
      </p>
    `,
    input: 'textarea',
    inputPlaceholder: 'Ejemplo: ¿Qué me depara el futuro en el amor?',
    inputAttributes: {
      'aria-label': 'Escribe tu pregunta',
      style: `
        font-size: 1.1rem;
        font-family: var(--font-Parrafos2);
        color: var(--color1);
        background: var(--color3);
        border: 2px solid var(--color4);
        border-radius: 10px;
        padding: 15px;
        min-height: 120px;
      `
    },
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: 'var(--color4)',
    cancelButtonColor: 'var(--color5)',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'tarot-popup smoke-popup',
      title: 'tarot-title',
      confirmButton: 'tarot-button',
      cancelButton: 'tarot-button'
    },
    showClass: {
      popup: 'smoke-in'
    },
    hideClass: {
      popup: 'smoke-out'
    },
    inputValidator: (value) => {
      if (!value || value.trim().length < 10) {
        return 'Por favor, escribe una pregunta más detallada (mínimo 10 caracteres)';
      }
    }
  });

  return pregunta?.trim() || null;
}

// ==========================
// 3. POPUP DE INTERPRETACIÓN
// ==========================
async function mostrarInterpretacion(interpretacion, cartas = []) {
  // Detener cualquier voz previa
  if (window.tarotVoz) {
    window.tarotVoz.detener();
  }

  // Construir HTML de las cartas (si se pasan)
  let htmlCartas = '';
  if (cartas.length > 0) {
    htmlCartas = `
      <div class="cartas-container" style="display: flex; justify-content: center; gap: 20px; margin: 20px 0; flex-wrap: wrap;">
        ${cartas.map(carta => `
          <div class="carta" style="text-align: center; max-width: 150px;">
            <img src="${carta.imagen}" alt="${carta.carta}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <p style="margin-top: 8px; font-family: var(--font-Parrafos); font-size: 1.1rem; color: var(--color4);">
              ${carta.carta}
            </p>
            ${carta.invertida ? '<p style="font-size: 0.9rem; color: var(--color4);">(Invertida)</p>' : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  await Swal.fire({
    title: '<span class="tarot-title">🔮 Tu Lectura del Tarót</span>',
    html: `
      ${htmlCartas}
      <div class="interpretacion-ia" style="
        font-size: 1.8rem; 
        line-height: 1.8; 
        color: var(--color3); 
        font-family: var(--font-Parrafos);
        text-align: justify;
        padding: 20px;
        background: rgba(0,0,0,0.3);
        border-radius: 12px;
        margin: 20px 0;
      ">
        ${interpretacion}
      </div>
      <div id="contenedor-boton-voz-interpretacion"></div>
    `,
    width: '90%',
    color: 'var(--color3)',
    confirmButtonText: 'Cerrar',
    confirmButtonColor: 'var(--color4)',
    customClass: {
      popup: 'tarot-popup smoke-popup',
      title: 'tarot-title',
      confirmButton: 'tarot-button'
    },
    showClass: {
      popup: 'smoke-in'
    },
    hideClass: {
      popup: 'smoke-out'
    },
    backdrop: `
      rgba(0,0,0,0.85)
      url("https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.gif")
      center center
      no-repeat
    `,
    didOpen: () => {
      // Agregar botón de voz para la interpretación
      if (window.agregarBotonVoz) {
        window.agregarBotonVoz('#contenedor-boton-voz-interpretacion', interpretacion);
      }
    },
    willClose: () => {
      // Detener voz al cerrar
      if (window.tarotVoz) {
        window.tarotVoz.detener();
      }
    }
  });
}

// ==========================
// 4. POPUP DE CARGA
// ==========================
function mostrarCargando(mensaje = 'Consultando el oráculo...') {
  // Detener cualquier voz previa
  if (window.tarotVoz) {
    window.tarotVoz.detener();
  }

  Swal.fire({
    title: mensaje,
    html: `
      <div style="padding: 20px;">
        <div class="loader" style="
          border: 4px solid var(--color3);
          border-top: 4px solid var(--color4);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        "></div>
        <p style="font-family: var(--font-Parrafos); font-size: 1.3rem; color: var(--color3); margin-top: 15px;">
          Las cartas están revelando su mensaje...
        </p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    customClass: {
      popup: 'tarot-popup smoke-popup',
      title: 'tarot-title'
    },
    showClass: {
      popup: 'smoke-in'
    }
  });
}

// ==========================
// 5. POPUP DE ERROR
// ==========================
async function mostrarError(mensaje = 'Algo salió mal en la consulta') {
  // Detener cualquier voz previa
  if (window.tarotVoz) {
    window.tarotVoz.detener();
  }

  await Swal.fire({
    icon: 'error',
    title: 'Error en el Oráculo',
    html: `
      <p style="font-size: 1.2rem; color: var(--color3); font-family: var(--font-Parrafos2);">
        ${mensaje}
      </p>
    `,
    confirmButtonText: 'Entendido',
    confirmButtonColor: 'var(--color4)',
    customClass: {
      popup: 'tarot-popup smoke-popup',
      title: 'tarot-title',
      confirmButton: 'tarot-button'
    },
    showClass: {
      popup: 'smoke-in'
    },
    hideClass: {
      popup: 'smoke-out'
    }
  });
}

// ==========================
// 6. EXPORTAR FUNCIONES
// ==========================
window.tarotPopups = {
  bienvenida: mostrarBienvenida,
  pregunta: solicitarPregunta,
  interpretacion: mostrarInterpretacion,
  cargando: mostrarCargando,
  error: mostrarError
};

console.log('✅ Sistema de popups del tarot cargado correctamente');