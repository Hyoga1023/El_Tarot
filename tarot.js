document.addEventListener("DOMContentLoaded", () => {
  const botonLanzar = document.getElementById("lanzar");
  const board = document.getElementById("tarot-board");
  const rutaJSON = "data/tarot_completo.json";
  const reversoCarta = "img/anverso_cartas.png";

  // Configuración de Groq
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  let GROQ_API_KEY = localStorage.getItem('groq_api_key') || null;
  let cartasLanzadas = false;
  let preguntaUsuario = "";

  // Cambiar API Key manualmente
  window.cambiarAPIKey = async function() {
    GROQ_API_KEY = null;
    localStorage.removeItem('groq_api_key');
    await solicitarAPIKey();
  }

  async function manejarLimpiar() {
    const { value: opcion } = await Swal.fire({
      title: '¿Qué deseas hacer?',
      html: 'Puedes realizar una nueva consulta o regresar al inicio',
      background: 'var(--color6)',
      color: 'var(--color3)',
      showCancelButton: true,
      confirmButtonText: 'Nueva Consulta',
      cancelButtonText: 'Ir al Inicio',
      confirmButtonColor: 'var(--color4)',
      cancelButtonColor: '#666',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'tarot-popup smoke-popup',
        title: 'tarot-title',
        confirmButton: 'tarot-button',
        cancelButton: 'tarot-button'
      },
      showClass: { popup: 'smoke-in' },
      hideClass: { popup: 'smoke-out' },
      didOpen: () => {
        const popup = Swal.getPopup();
        popup.style.padding = '1.6rem';
        
        // Título específico
        const title = popup.querySelector('.swal2-title');
        if(title) {
          title.style.fontSize = '1.8rem';
          title.style.fontWeight = 'bold';
        }
        
        // Contenido HTML
        const htmlContainer = popup.querySelector('.swal2-html-container');
        if(htmlContainer) {
          htmlContainer.style.fontSize = '1.1rem';
          htmlContainer.style.fontFamily = 'Arial, sans-serif';
          htmlContainer.style.fontStyle = 'italic';
        }
        
        // Botones
        const buttons = popup.querySelectorAll('.swal2-styled');
        buttons.forEach(btn => {
          btn.style.fontSize = '1.1rem';
          btn.style.padding = '12px 24px';
        });
      }
    });

    if (opcion) {
      // Si eligió nueva consulta, mostrar advertencia
      const { isConfirmed } = await Swal.fire({
        title: 'Consulta con sabiduría',
        html: `
          <p style="font-size: 1.1rem; line-height: 1.6; color: var(--color3); font-family: Arial, sans-serif; font-style: italic; margin-bottom: 15px;">
            El oráculo recomienda no abusar de las consultas del futuro.<br><br>
            Las cartas revelan su sabiduría cuando realmente la necesitas.<br>
            ¿Estás seguro de que deseas continuar?
          </p>
        `,
        background: 'var(--color6)',
        color: 'var(--color3)',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Mejor no',
        confirmButtonColor: 'var(--color4)',
        cancelButtonColor: '#666',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: 'tarot-popup smoke-popup',
          title: 'tarot-title',
          confirmButton: 'tarot-button',
          cancelButton: 'tarot-button'
        },
        showClass: { popup: 'smoke-in' },
        hideClass: { popup: 'smoke-out' },
        didOpen: () => {
          const popup = Swal.getPopup();
          popup.style.padding = '1.6rem';
          
          // Título específico
          const title = popup.querySelector('.swal2-title');
          if(title) {
            title.style.fontSize = '1.8rem';
            title.style.fontWeight = 'bold';
          }
          
          // Botones
          const buttons = popup.querySelectorAll('.swal2-styled');
          buttons.forEach(btn => {
            btn.style.fontSize = '1.1rem';
            btn.style.padding = '12px 24px';
          });
        }
      });

      if (isConfirmed) {
        // Continuar con nueva consulta
        location.reload();
      } else {
        // Ir al inicio
        window.location.href = '/';
      }
    } else {
      // Si eligió cancelar o ir al inicio
      window.location.href = '/';
    }
  };

  function createLimpiarButton() {
    const limpiarBtn = document.createElement('button');
    limpiarBtn.id = 'limpiar';
    limpiarBtn.textContent = 'Limpiar';
    limpiarBtn.className = botonLanzar.className;
    return limpiarBtn;
  }

  async function solicitarAPIKey() {
    const { value: apiKey } = await Swal.fire({
      title: 'Configura tu oráculo',
      html: `
        <p style="font-size: 1.6rem; line-height: 1.6; color: var(--color3); font-family: var(--font-Parrafos); margin-bottom: 20px;">
          Para que el oráculo pueda interpretar las cartas, necesitas conectar tu API Key de Groq.<br><br>
          <strong>¿No tienes una?</strong><br>
          Ve a <a href="https://groq.com" target="_blank" style="color: var(--color4);">groq.com</a> y crea tu cuenta gratis.
        </p>
      `,
      input: 'password',
      inputPlaceholder: 'Ingresa tu API Key de Groq...',
      inputAttributes: {
        style: 'font-family: monospace; padding: 10px; border-radius: 8px; border: 2px solid var(--color4); background: var(--color6); color: var(--color3); font-size: 1rem;'
      },
      background: 'var(--color6)',
      color: 'var(--color3)',
      confirmButtonText: 'Conectar Oráculo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--color4)',
      cancelButtonColor: '#666',
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'tarot-popup smoke-popup',
        title: 'tarot-title',
        confirmButton: 'tarot-button',
        cancelButton: 'tarot-button'
      },
      showClass: { popup: 'smoke-in' },
      hideClass: { popup: 'smoke-out' },
      inputValidator: (value) => {
        if (!value) return 'El oráculo necesita la clave para funcionar';
        if (!value.startsWith('gsk_')) return 'La clave de Groq debe comenzar con "gsk_"';
        if (value.length < 20) return 'La clave parece muy corta';
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        popup.style.padding = '1.6rem';
        
        // Título específico
        const title = popup.querySelector('.swal2-title');
        if(title) {
          title.style.fontSize = '1.8rem';
          title.style.fontWeight = 'bold';
        }
        
        // Input
        const input = Swal.getInput();
        if(input) {
          input.style.fontSize = '1rem';
          input.style.padding = '15px';
        }
        
        // Botones
        const buttons = popup.querySelectorAll('.swal2-styled');
        buttons.forEach(btn => {
          btn.style.fontSize = '1.1rem';
          btn.style.padding = '12px 24px';
        });
      }
    });

    if (apiKey) {
      GROQ_API_KEY = apiKey;
      localStorage.setItem('groq_api_key', apiKey);

      await Swal.fire({
        title: 'Oráculo Conectado',
        html: `<p style="font-size: 1.8rem; line-height: 1.6; color: var(--color3); font-family: var(--font-Parrafos);">
            ✨ El oráculo ha sido conectado exitosamente.<br>
            Las cartas ahora podrán revelar mensajes personalizados para ti.
          </p>`,
        background: 'var(--color6)',
        color: 'var(--color3)',
        confirmButtonText: 'Comenzar lectura',
        confirmButtonColor: 'var(--color4)',
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: 'tarot-popup smoke-popup', title: 'tarot-title', confirmButton: 'tarot-button' },
        showClass: { popup: 'smoke-in' },
        hideClass: { popup: 'smoke-out' },
        didOpen: () => {
          const popup = Swal.getPopup();
          popup.style.padding = '1.6rem';
          
          // Título específico
          const title = popup.querySelector('.swal2-title');
          if(title) {
            title.style.fontSize = '1.8rem';
            title.style.fontWeight = 'bold';
          }
          
          // Botón
          const confirmButton = popup.querySelector('.swal2-confirm');
          if(confirmButton) {
            confirmButton.style.fontSize = '1.1rem';
            confirmButton.style.padding = '12px 24px';
          }
        }
      });

      return true;
    }
    return false;
  }

async function pedirPreguntaUsuario() {
    const { value: pregunta } = await Swal.fire({
      title: 'Antes de comenzar...',
      input: 'text',
      inputLabel: 'Escribe tu pregunta o el área de interés (amor, trabajo, dinero, salud, etc.)',
      inputPlaceholder: 'Ejemplo: ¿Cómo me irá en el amor este año?',
      background: 'var(--color6)',
      color: 'var(--color3)',
      confirmButtonText: 'Continuar',
      confirmButtonColor: 'var(--color4)',
      width: '600px',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'tarot-popup smoke-popup',
        title: 'tarot-title',
        confirmButton: 'tarot-button'
      },
      showClass: { popup: 'smoke-in' },
      hideClass: { popup: 'smoke-out' },
      inputValidator: (value) => {
        if (!value) return 'Debes escribir una pregunta o tema para que el oráculo pueda responder.';
      },
      didOpen: () => {
        const popup = Swal.getPopup();
        popup.style.padding = '1.6rem';
        
        // Título específico
        const title = popup.querySelector('.swal2-title');
        if(title) {
          title.style.fontSize = '1.8rem';
          title.style.fontWeight = 'bold';
        }
        
        // Label del input
        const inputLabel = popup.querySelector('.swal2-input-label');
        if(inputLabel) {
          inputLabel.style.fontSize = '1.1rem';
          inputLabel.style.fontWeight = '500';
          inputLabel.style.fontFamily = 'Arial, sans-serif';
          inputLabel.style.fontStyle = 'italic';
        }
        
        // Input
        const input = Swal.getInput();
        if(input) {
          input.style.fontSize = '1rem';
          input.style.padding = '15px';
        }
        
        // Botón
        const confirmButton = popup.querySelector('.swal2-confirm');
        if(confirmButton) {
          confirmButton.style.fontSize = '1.1rem';
          confirmButton.style.padding = '12px 24px';
        }
      }
    });

    if (pregunta) {
      preguntaUsuario = pregunta.trim();
      return true;
    }
    return false;
}

  async function generarInterpretacionIA(cartasSeleccionadas, contextoUsuario = "") {
  try {
    const cartasInfo = cartasSeleccionadas.map((carta, index) => {
      const posicion = ['pasado', 'presente', 'futuro'][index];
      return `
      En el ${posicion}, surge la carta "${carta.carta}" ${carta.invertida ? 'invertida' : 'en posición correcta'}.
      Significado: ${carta.invertida ? carta.significado_invertido : carta.significado_derecho}.
      Descripción: ${carta.descripcion}.
      `;
    }).join('\n');

    const prompt = `
    Has realizado una tirada de tres cartas que representan pasado, presente y futuro.
    ${contextoUsuario ? `El consultante quiere saber sobre: ${contextoUsuario}.` : ""}
    A continuación tienes la descripción de cada una:

    ${cartasInfo}

    A partir de esta información, crea una interpretación profunda, personalizada y coherente.
    La interpretación debe fluir como una historia única que conecte los tres momentos,
    transmitiendo el mensaje de forma mística pero cercana.

    ❗ Instrucciones:
    - Usa entre 150 y 200 palabras.
    - Resume la idea principal si el texto se acerca al límite de tokens.
    - No menciones explícitamente "pasado, presente o futuro".
    - Usa segunda persona (tú).
    - Da consejos prácticos y reflexiones espirituales.
    - Mantén un tono sabio, misterioso y empático.
    `;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Eres un tarotista sabio y místico que conecta profundamente con el consultante.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 350,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Respuesta de Groq:", errorText);
      throw new Error(`Error en Groq API: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('Error al generar interpretación:', error);
    return `Las cartas revelan un momento de transición...`;
  }
}


  async function lanzarCartas() {
    try {
      if (!GROQ_API_KEY) {
        const keyConfigured = await solicitarAPIKey();
        if (!keyConfigured) return;
      }

      const preguntaOK = await pedirPreguntaUsuario();
      if (!preguntaOK) return;

      Swal.fire({
        title: 'Consultando el oráculo...',
        html: 'Las cartas están siendo llamadas por el universo',
        background: 'var(--color6)',
        color: 'var(--color3)',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => { 
          Swal.showLoading(); 
          
          const popup = Swal.getPopup();
          popup.style.padding = '1.6rem';
          
          // Título específico
          const title = popup.querySelector('.swal2-title');
          if(title) {
            title.style.fontSize = '1.8rem';
            title.style.fontWeight = 'bold';
          }
          
          // Contenido HTML
          const htmlContainer = popup.querySelector('.swal2-html-container');
          if(htmlContainer) {
            htmlContainer.style.fontSize = '1.1rem';
            htmlContainer.style.fontFamily = 'Arial, sans-serif';
            htmlContainer.style.fontStyle = 'italic';
          }
        },
        customClass: { popup: 'tarot-popup smoke-popup', title: 'tarot-title' }
      });

      const res = await fetch(rutaJSON);
      const cartas = await res.json();

      const seleccionadas = [];
      while (seleccionadas.length < 3) {
        const randomIndex = Math.floor(Math.random() * cartas.length);
        const carta = { ...cartas[randomIndex] };
        if (!seleccionadas.find(c => c.id === carta.id)) {
          carta.invertida = Math.random() < 0.5;
          seleccionadas.push(carta);
        }
      }

      const interpretacionIA = await generarInterpretacionIA(seleccionadas);
      Swal.close();
      botonLanzar.style.display = 'none';

      const contenedorPrincipal = document.createElement("div");
      contenedorPrincipal.style.display = 'flex';
      contenedorPrincipal.style.flexDirection = 'column';
      contenedorPrincipal.style.alignItems = 'center';
      contenedorPrincipal.style.gap = '20px';

      const contenedorCartas = document.createElement("div");
      contenedorCartas.classList.add("cartas-container");

      seleccionadas.forEach((carta, i) => {
        const cartaDiv = document.createElement("div");
        cartaDiv.classList.add("carta");

        const img = document.createElement("img");
        img.src = reversoCarta;
        img.alt = "Carta de tarot";
        img.classList.add("reverso");

        cartaDiv.appendChild(img);
        contenedorCartas.appendChild(cartaDiv);

        setTimeout(() => {
          img.src = `cartas/${carta.imagen}.png`;
          if (carta.invertida) img.style.transform = "rotate(180deg)";
          const titulo = document.createElement("h3");
          titulo.innerHTML = `<strong>${carta.carta}</strong>${carta.invertida ? ' (Invertida)' : ''}`;
          titulo.style.fontFamily = 'var(--font-Titulos)';
          titulo.style.color = 'var(--color4)';
          titulo.style.fontSize = '1.1em';
          titulo.style.marginTop = '10px';
          cartaDiv.appendChild(titulo);
        }, 1000 + i * 1000);
      });

      contenedorPrincipal.appendChild(contenedorCartas);

      const interpretacionDiv = document.createElement("div");
      interpretacionDiv.style.maxWidth = '600px';
      interpretacionDiv.style.textAlign = 'center';
      interpretacionDiv.style.marginTop = '20px';
      interpretacionDiv.style.padding = '20px';
      interpretacionDiv.style.backgroundColor = 'rgba(248, 244, 225, 0.1)';
      interpretacionDiv.style.borderRadius = '15px';
      interpretacionDiv.style.border = '2px solid var(--color4)';

      const tituloInterpretacion = document.createElement("h2");
      tituloInterpretacion.textContent = "Mensaje del Tarot";
      tituloInterpretacion.style.fontSize = '3rem';
      tituloInterpretacion.style.fontFamily = 'var(--font-Titulos)';
      tituloInterpretacion.style.color = 'var(--color4)';
      tituloInterpretacion.style.marginBottom = '15px';

      const textoInterpretacion = document.createElement("p");
      textoInterpretacion.innerHTML = interpretacionIA;
      textoInterpretacion.style.fontFamily = 'var(--font-Parrafos)';
      textoInterpretacion.style.fontSize = '2rem';
      textoInterpretacion.style.color = 'var(--color3)';
      textoInterpretacion.style.lineHeight = '1.6';

      interpretacionDiv.appendChild(tituloInterpretacion);
      interpretacionDiv.appendChild(textoInterpretacion);

      setTimeout(() => {
        contenedorPrincipal.appendChild(interpretacionDiv);
      }, 4000);

      board.appendChild(contenedorPrincipal);
      cartasLanzadas = true;

      const limpiarBtn = createLimpiarButton();
      setTimeout(() => {
        contenedorPrincipal.appendChild(limpiarBtn);
        limpiarBtn.addEventListener('click', manejarLimpiar);
      }, 5000);

    } catch (err) {
      console.error("Error cargando las cartas:", err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron consultar las cartas. Inténtalo nuevamente.',
        icon: 'error',
        background: 'var(--color6)',
        color: 'var(--color3)',
        confirmButtonColor: 'var(--color4)',
        didOpen: () => {
          const popup = Swal.getPopup();
          popup.style.padding = '1.6rem';
          
          // Título específico
          const title = popup.querySelector('.swal2-title');
          if(title) {
            title.style.fontSize = '1.8rem';
            title.style.fontWeight = 'bold';
          }
          
          // Contenido
          const content = popup.querySelector('.swal2-content');
          if(content) {
            content.style.fontSize = '1.1rem';
            content.style.fontFamily = 'Arial, sans-serif';
            content.style.fontStyle = 'italic';
          }
          
          // Botón
          const confirmButton = popup.querySelector('.swal2-confirm');
          if(confirmButton) {
            confirmButton.style.fontSize = '1.1rem';
            confirmButton.style.padding = '12px 24px';
          }
        }
      });
    }
  }

  botonLanzar.addEventListener("click", lanzarCartas);
});