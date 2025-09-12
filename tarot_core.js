// tarot.js
// Contiene la funcionalidad principal del tarot y la interfaz de usuario.

document.addEventListener("DOMContentLoaded", () => {
    const botonLanzar = document.getElementById("lanzar");
    const board = document.getElementById("tarot-board");
    const rutaJSON = "data/tarot_completo.json";
    const reversoCarta = "img/anverso_cartas.png";

    let cartasLanzadas = false;
    let preguntaUsuario = "";

    // SweetAlert2
    const aplicarEstilosUnificados = (popup) => {
        popup.style.padding = '1.6rem';
        popup.style.backgroundImage = "url('img/madera_negra.png')";
        popup.style.backgroundSize = 'cover';
        popup.style.backgroundPosition = 'center center';
        popup.style.backgroundRepeat = 'no-repeat';
        popup.style.position = 'relative';
        popup.style.overflow = 'hidden';

        if (!popup.querySelector('.tarot-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'tarot-overlay';
            overlay.style.cssText = `
                content: "";
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 0;
            `;
            popup.insertBefore(overlay, popup.firstChild);
        }

        const allElements = popup.querySelectorAll('*:not(.tarot-overlay)');
        allElements.forEach(el => {
            if (el !== popup) {
                el.style.position = 'relative';
                el.style.zIndex = '1';
            }
        });

        const title = popup.querySelector('.swal2-title');
        if (title) {
            title.style.fontSize = '1.8rem';
            title.style.fontWeight = 'bold';
            title.style.fontFamily = 'var(--font-Titulos)';
            title.style.color = 'var(--color4)';
            title.style.textShadow = '0 4px 24px var(--color6), 0 2px 8px var(--color1), 0 0 2px var(--color2)';
        }

        const htmlContainer = popup.querySelector('.swal2-html-container');
        if (htmlContainer) {
            htmlContainer.style.fontSize = '1.1rem';
            htmlContainer.style.fontFamily = 'var(--font-Parrafos2)';
            htmlContainer.style.fontStyle = 'italic';
            htmlContainer.style.color = 'var(--color3)';
        }

        const content = popup.querySelector('.swal2-content');
        if (content) {
            content.style.fontSize = '1.1rem';
            content.style.fontFamily = 'var(--font-Parrafos2)';
            content.style.fontStyle = 'italic';
            content.style.color = 'var(--color3)';
        }

        const inputLabel = popup.querySelector('.swal2-input-label');
        if (inputLabel) {
            inputLabel.style.fontSize = '1.1rem';
            inputLabel.style.fontWeight = '500';
            inputLabel.style.fontFamily = 'var(--font-Parrafos2)';
            inputLabel.style.fontStyle = 'italic';
            inputLabel.style.color = 'var(--color3)';
        }

        const input = popup.querySelector('.swal2-input');
        if (input) {
            input.style.fontSize = '1rem';
            input.style.padding = '15px';
            input.style.fontFamily = 'monospace';
            input.style.borderRadius = '8px';
            input.style.border = '2px solid var(--color4)';
            input.style.background = 'var(--color6)';
            input.style.color = 'var(--color3)';
        }

        const buttons = popup.querySelectorAll('.swal2-styled');
        buttons.forEach(btn => {
            btn.style.fontSize = '1.1rem';
            btn.style.padding = '12px 24px';
            btn.style.fontFamily = 'var(--font-Titulos)';
            btn.style.fontWeight = 'bold';
            btn.style.borderRadius = '8px';
        });

        const confirmButton = popup.querySelector('.swal2-confirm');
        if (confirmButton) {
            confirmButton.style.background = 'var(--color4)';
            confirmButton.style.color = 'var(--color6)';
            confirmButton.style.border = 'none';
        }

        const cancelButton = popup.querySelector('.swal2-cancel');
        if (cancelButton) {
            cancelButton.style.background = '#666';
            cancelButton.style.color = 'var(--color3)';
            cancelButton.style.border = 'none';
        }

        const progressBar = popup.querySelector('.swal2-timer-progress-bar');
        if (progressBar) {
            progressBar.style.background = 'var(--color4)';
        }

        const loader = popup.querySelector('.swal2-loader');
        if (loader) {
            loader.style.borderColor = 'var(--color4) transparent var(--color4) transparent';
        }
    };

    const configBase = {
        background: 'transparent',
        color: 'var(--color3)',
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
        didOpen: aplicarEstilosUnificados
    };

    window.cambiarAPIKey = async function() {
        // [CORRECCIÓN] Ahora se elimina la clave de Hugging Face
        localStorage.removeItem('huggingface_api_key'); 
        await solicitarAPIKey();
    }

    async function manejarLimpiar() {
        const { value: opcion } = await Swal.fire({
            ...configBase,
            title: '¿Qué deseas hacer?',
            html: 'Puedes realizar una nueva consulta o regresar al inicio',
            showCancelButton: true,
            confirmButtonText: 'Nueva Consulta',
            cancelButtonText: 'Ir al Inicio',
            confirmButtonColor: 'var(--color4)',
            cancelButtonColor: '#666'
        });

        if (opcion) {
            const { isConfirmed } = await Swal.fire({
                ...configBase,
                title: 'Consulta con sabiduría',
                html: `
                    <p style="font-size: 1.1rem; line-height: 1.6; color: var(--color3); font-family: var(--font-Parrafos2); font-style: italic; margin-bottom: 15px;">
                        El oráculo recomienda no abusar de las consultas del futuro.<br><br>
                        Las cartas revelan su sabiduría cuando realmente la necesitas.<br>
                        ¿Estás seguro de que deseas continuar?
                    </p>
                `,
                showCancelButton: true,
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Mejor no',
                confirmButtonColor: 'var(--color4)',
                cancelButtonColor: '#666'
            });

            if (isConfirmed) {
                location.reload();
            } else {
                window.location.href = 'https://hyoga1023.github.io/El_Tarot/';
            }
        } else {
            window.location.href = 'https://hyoga1023.github.io/El_Tarot/';
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
            ...configBase,
            title: 'Configura tu oráculo',
            // [CORRECCIÓN] Mensaje actualizado para que diga "Hugging Face"
            html: `
                <p style="font-size: 1.1rem; line-height: 1.6; color: var(--color3); font-family: var(--font-Parrafos2); font-style: italic; margin-bottom: 20px;">
                    Para que el oráculo pueda interpretar las cartas, necesitas conectar tu API Key de Hugging Face.<br><br>
                    <strong>¿No tienes una?</strong><br>
                    Ve a <a href="https://huggingface.co/settings/tokens" target="_blank" style="color: var(--color4); text-decoration: underline;">huggingface.co</a> y crea tu cuenta gratis para obtenerla.
                </p>
            `,
            input: 'password',
            // [CORRECCIÓN] Placeholder actualizado para Hugging Face
            inputPlaceholder: 'Ingresa tu API Key de Hugging Face...',
            confirmButtonText: 'Conectar Oráculo',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: 'var(--color4)',
            cancelButtonColor: '#666',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return 'El oráculo necesita la clave para funcionar';
            }
        });

        if (apiKey) {
            // [CORRECCIÓN] La clave ahora se guarda con el nombre correcto para Hugging Face
            localStorage.setItem('huggingface_api_key', apiKey);
            await Swal.fire({
                ...configBase,
                title: 'Oráculo Conectado',
                html: `<p style="font-size: 1.1rem; line-height: 1.6; color: var(--color3); font-family: var(--font-Parrafos2); font-style: italic;">
                        ✨ El oráculo ha sido conectado exitosamente.<br><br>
                        Las cartas ahora podrán revelar mensajes personalizados para ti.
                    </p>`,
                confirmButtonText: 'Comenzar lectura',
                confirmButtonColor: 'var(--color4)',
                timer: 3000,
                timerProgressBar: true
            });
            return true;
        }
        return false;
    }

    async function pedirPreguntaUsuario() {
        const { value: pregunta } = await Swal.fire({
            ...configBase,
            title: 'Antes de comenzar...',
            input: 'text',
            inputLabel: 'Escribe tu pregunta o el área de interés (amor, trabajo, dinero, salud, etc.)',
            inputPlaceholder: 'Ej: ¿Cómo me irá en el amor este año?',
            confirmButtonText: 'Continuar',
            confirmButtonColor: 'var(--color4)',
            width: '600px',
            inputValidator: (value) => {
                if (!value) return 'Debes escribir una pregunta o tema para que el oráculo pueda responder.';
            }
        });

        if (pregunta) {
            preguntaUsuario = pregunta.trim();
            return true;
        }
        return false;
    }

    async function lanzarCartas() {
        try {
            const HUGGINGFACE_API_KEY = localStorage.getItem('huggingface_api_key');
            if (!HUGGINGFACE_API_KEY) {
                const keyConfigured = await solicitarAPIKey();
                if (!keyConfigured) return;
            }

            const preguntaOK = await pedirPreguntaUsuario();
            if (!preguntaOK) return;

            Swal.fire({
                ...configBase,
                title: 'Consultando el oráculo...',
                html: '<p style="font-size: 1.1rem; color: var(--color3); font-family: var(--font-Parrafos2); font-style: italic;">Las cartas están siendo llamadas por el universo</p>',
                didOpen: (popup) => {
                    Swal.showLoading();
                    aplicarEstilosUnificados(popup);
                }
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

            // Llamada a la función del chatbot en el archivo externo.
            const interpretacionIA = await generarInterpretacionIA(seleccionadas, preguntaUsuario);
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
            tituloInterpretacion.textContent = "Mensaje del Tarót";
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
                ...configBase,
                title: 'Error Místico',
                html: '<p style="font-size: 1.1rem; color: var(--color3); font-family: var(--font-Parrafos2); font-style: italic;">No se pudieron consultar las cartas. Las energías están bloqueadas. Inténtalo nuevamente.</p>',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo',
                confirmButtonColor: 'var(--color4)'
            });
        }
    }

    botonLanzar.addEventListener("click", lanzarCartas);
});
