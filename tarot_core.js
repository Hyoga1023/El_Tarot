
// =========================================
// tarot_core.js - Versión optimizada
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    const botonLanzar = document.getElementById("lanzar");
    const board = document.getElementById("tarot-board");
    const rutaJSON = "data/tarot_completo.json";
    const reversoCarta = "img/anverso_cartas.png";

    let preguntaUsuario = "";

    // =========================================
    // ESTILOS UNIFICADOS SWEETALERT2
    // =========================================

    const aplicarEstilosUnificados = (popup) => {

        popup.style.padding = "1.6rem";
        popup.style.backgroundImage = "url('img/madera_negra.png')";
        popup.style.backgroundSize = "cover";
        popup.style.backgroundPosition = "center center";
        popup.style.backgroundRepeat = "no-repeat";
        popup.style.position = "relative";
        popup.style.overflow = "hidden";

        if (!popup.querySelector(".tarot-overlay")) {

            const overlay = document.createElement("div");

            overlay.className = "tarot-overlay";

            overlay.style.cssText = `
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 0;
            `;

            popup.insertBefore(overlay, popup.firstChild);
        }

        popup.querySelectorAll("*:not(.tarot-overlay)").forEach(el => {

            el.style.position = "relative";
            el.style.zIndex = "1";
        });

        const title = popup.querySelector(".swal2-title");

        if (title) {

            title.style.fontSize = "1.8rem";
            title.style.fontWeight = "bold";
            title.style.fontFamily = "var(--font-Titulos)";
            title.style.color = "var(--color4)";
            title.style.textShadow =
                "0 4px 24px var(--color6), 0 2px 8px var(--color1)";
        }

        const htmlContainer = popup.querySelector(".swal2-html-container");

        if (htmlContainer) {

            htmlContainer.style.fontSize = "1.1rem";
            htmlContainer.style.fontFamily = "var(--font-Parrafos2)";
            htmlContainer.style.fontStyle = "italic";
            htmlContainer.style.color = "var(--color3)";
        }

        popup.querySelectorAll(".swal2-styled").forEach(btn => {

            btn.style.fontSize = "1.1rem";
            btn.style.padding = "12px 24px";
            btn.style.fontFamily = "var(--font-Titulos)";
            btn.style.fontWeight = "bold";
            btn.style.borderRadius = "8px";
        });

        const confirmButton = popup.querySelector(".swal2-confirm");

        if (confirmButton) {

            confirmButton.style.background = "var(--color4)";
            confirmButton.style.color = "var(--color6)";
            confirmButton.style.border = "none";
        }

        const cancelButton = popup.querySelector(".swal2-cancel");

        if (cancelButton) {

            cancelButton.style.background = "#666";
            cancelButton.style.color = "var(--color3)";
            cancelButton.style.border = "none";
        }
    };

    const configBase = {

        background: "transparent",
        color: "var(--color3)",
        allowOutsideClick: false,
        allowEscapeKey: false,

        customClass: {

            popup: "tarot-popup smoke-popup",
            title: "tarot-title",
            confirmButton: "tarot-button",
            cancelButton: "tarot-button"
        },

        showClass: { popup: "smoke-in" },
        hideClass: { popup: "smoke-out" },

        didOpen: aplicarEstilosUnificados
    };


    // =========================================
    // SOLICITAR PREGUNTA
    // =========================================

    window.pedirPreguntaUsuario = async function () {

        const { value: pregunta } = await Swal.fire({

            ...configBase,

            title: "Antes de comenzar...",

            input: "text",

            inputLabel:
                "Escribe tu pregunta o el área de interés (amor, trabajo, dinero, salud, etc.)",

            inputPlaceholder: "Ej: ¿Cómo me irá en el amor este año?",

            confirmButtonText: "Continuar",

            width: "600px",

            inputValidator: (value) => {

                if (!value || !value.trim()) {

                    return "Debes escribir una pregunta o tema para continuar.";
                }
            }
        });

        if (pregunta) {

            preguntaUsuario = pregunta.trim();

            return true;
        }

        return false;
    };


    // =========================================
    // LIMPIAR / NUEVA CONSULTA
    // =========================================

    window.manejarLimpiar = async function () {

        const { isConfirmed } = await Swal.fire({

            ...configBase,

            title: "¿Qué deseas hacer?",

            html: "Puedes realizar una nueva consulta o regresar al inicio.",

            showCancelButton: true,

            confirmButtonText: "Nueva Consulta",

            cancelButtonText: "Ir al Inicio"
        });

        if (isConfirmed) {

            const confirmacion = await Swal.fire({

                ...configBase,

                title: "Consulta con sabiduría",

                html: `
                    <p style="
                        font-size: 1.1rem;
                        line-height: 1.6;
                        color: var(--color3);
                        font-family: var(--font-Parrafos2);
                        font-style: italic;
                    ">
                        El oráculo recomienda no abusar de las consultas del futuro.
                        <br><br>
                        Las cartas revelan su sabiduría cuando realmente la necesitas.
                        <br><br>
                        ¿Estás seguro de que deseas continuar?
                    </p>
                `,

                showCancelButton: true,

                confirmButtonText: "Sí, continuar",

                cancelButtonText: "Mejor no"
            });

            if (confirmacion.isConfirmed) {

                location.reload();

            } else {

                window.location.href =
                    "https://hyoga1023.github.io/El_Tarot/";
            }

        } else {

            window.location.href =
                "https://hyoga1023.github.io/El_Tarot/";
        }
    };


    // =========================================
    // CREAR BOTÓN LIMPIAR
    // =========================================

    window.createLimpiarButton = function () {

        const btn = document.createElement("button");

        btn.id = "limpiar";

        btn.textContent = "Limpiar";

        btn.style.cssText = `
            padding: 18px 48px;
            border: none;
            border-radius: 32px;
            background: linear-gradient(90deg, #666 0%, #888 100%);
            color: white;
            font-size: 2rem;
            font-family: var(--font-Titulos);
            font-weight: bold;
            letter-spacing: 2px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.3s;
        `;

        btn.addEventListener("mouseenter", () => {

            btn.style.transform = "scale(1.05)";
        });

        btn.addEventListener("mouseleave", () => {

            btn.style.transform = "scale(1)";
        });

        return btn;
    };


    // =========================================
    // FUNCIÓN PRINCIPAL: LANZAR CARTAS
    // =========================================

    window.lanzarCartas = async function () {

        try {

            const preguntaOK = await window.pedirPreguntaUsuario();

            if (!preguntaOK) return;

            Swal.fire({

                ...configBase,

                title: "Consultando el oráculo...",

                html: `
                    <p style="
                        font-size: 1.1rem;
                        color: var(--color3);
                        font-family: var(--font-Parrafos2);
                        font-style: italic;
                    ">
                        Las cartas están siendo llamadas por el universo.
                    </p>
                `,

                didOpen: () => Swal.showLoading()
            });


            // =========================================
            // CARGAR CARTAS
            // =========================================

            const res = await fetch(rutaJSON);

            if (!res.ok) {

                throw new Error("No se pudo cargar el archivo de cartas.");
            }

            const cartas = await res.json();

            if (!Array.isArray(cartas) || cartas.length < 3) {

                throw new Error("El archivo de cartas no contiene suficientes cartas.");
            }


            // =========================================
            // SELECCIONAR TRES CARTAS DIFERENTES
            // =========================================

            const cartasDisponibles = [...cartas];

            const seleccionadas = [];

            while (seleccionadas.length < 3) {

                const idx = Math.floor(
                    Math.random() * cartasDisponibles.length
                );

                const carta = {
                    ...cartasDisponibles.splice(idx, 1)[0]
                };

                carta.invertida = Math.random() < 0.5;

                seleccionadas.push(carta);
            }


            // =========================================
            // SOLICITAR INTERPRETACIÓN
            // =========================================

            const interpretacionIA =
                await window.generarInterpretacionIA(
                    seleccionadas,
                    preguntaUsuario
                );

            if (!interpretacionIA) {

                throw new Error("No se recibió interpretación.");
            }

            Swal.close();

            botonLanzar.style.display = "none";


            // =========================================
            // CONTENEDOR PRINCIPAL
            // =========================================

            const contenedorPrincipal = document.createElement("div");

            contenedorPrincipal.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 25px;
                padding: 20px;
                width: 100%;
                box-sizing: border-box;
            `;


            // =========================================
            // CARTAS
            // =========================================

            const contenedorCartas = document.createElement("div");

            contenedorCartas.className = "cartas-container";

            contenedorCartas.style.cssText = `
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
                width: 100%;
            `;

            seleccionadas.forEach((carta, i) => {

                const cartaDiv = document.createElement("div");

                cartaDiv.className = "carta";

                cartaDiv.style.textAlign = "center";

                const img = document.createElement("img");

                img.src = reversoCarta;

                img.alt = "Reverso de carta de tarot";

                img.style.cssText = `
                    width: 230px;
                    max-width: 100%;
                    border-radius: 12px;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
                    transition: transform 0.5s;
                `;

                cartaDiv.appendChild(img);

                setTimeout(() => {

                    img.src = `cartas/${carta.imagen}.png`;

                    img.alt = carta.carta;

                    if (carta.invertida) {

                        img.style.transform = "rotate(180deg)";
                    }

                    const titulo = document.createElement("h3");

                    titulo.textContent =
                        carta.carta +
                        (carta.invertida ? " (Invertida)" : "");

                    titulo.style.cssText = `
                        color: var(--color4);
                        font-family: var(--font-Titulos);
                        margin-top: 10px;
                        font-size: 1.2rem;
                    `;

                    cartaDiv.appendChild(titulo);

                }, 1000 + i * 800);

                contenedorCartas.appendChild(cartaDiv);
            });

            contenedorPrincipal.appendChild(contenedorCartas);


            // =========================================
            // INTERPRETACIÓN DE LA IA
            // =========================================

            const interpretacionDiv = document.createElement("div");

            interpretacionDiv.style.cssText = `
                width: 100%;
                max-width: 950px;
                box-sizing: border-box;
                text-align: left;
                padding: 28px;
                background: rgba(248, 244, 225, 0.1);
                border: 2px solid var(--color4);
                border-radius: 20px;
                margin: 5px 0;
                overflow: visible;
            `;

            const tituloInterpretacion = document.createElement("h2");

            tituloInterpretacion.textContent = "Mensaje del Tarot";

            tituloInterpretacion.style.cssText = `
                font-size: clamp(2rem, 4vw, 3rem);
                color: var(--color4);
                font-family: var(--font-Titulos);
                text-align: center;
                margin: 0 0 25px 0;
            `;

            const textoInterpretacion = document.createElement("p");

            textoInterpretacion.textContent = interpretacionIA;

            textoInterpretacion.style.cssText = `
                font-size: clamp(19px, 2vw, 21px);
                color: var(--color3);
                font-family: var(--font-Parrafos);
                line-height: 1.8;
                text-align: justify;
                white-space: pre-wrap;
                overflow-wrap: break-word;
                word-break: normal;
                margin: 0;
                width: 100%;
                max-width: 100%;
            `;

            interpretacionDiv.appendChild(tituloInterpretacion);

            interpretacionDiv.appendChild(textoInterpretacion);


            // =========================================
            // AGREGAR AL BOARD
            // =========================================

            board.innerHTML = "";

            board.appendChild(contenedorPrincipal);

            setTimeout(() => {

                contenedorPrincipal.appendChild(interpretacionDiv);

            }, 3500);


            // =========================================
            // BOTONES LIMPIAR Y VOZ
            // =========================================

            const limpiarBtn = window.createLimpiarButton();

            setTimeout(() => {

                contenedorPrincipal.appendChild(limpiarBtn);

                limpiarBtn.addEventListener(
                    "click",
                    window.manejarLimpiar
                );

                if (typeof window.crearBotonVoz === "function") {

                    window.crearBotonVoz();

                    setTimeout(() => {

                        if (
                            typeof window.mostrarBotonVozTarot === "function"
                        ) {

                            window.mostrarBotonVozTarot();
                        }

                    }, 1000);
                }

            }, 5000);


        } catch (err) {

            console.error("Error en lanzarCartas:", err);

            Swal.fire({

                ...configBase,

                title: "Error Místico",

                text: err.message || "El oráculo no pudo responder. Intenta de nuevo.",

                icon: "error"
            });
        }
    };


    // =========================================
    // EVENTO BOTÓN LANZAR
    // =========================================

    if (botonLanzar) {

        botonLanzar.addEventListener(
            "click",
            window.lanzarCartas
        );
    }

});
