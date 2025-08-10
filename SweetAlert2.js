Swal.fire({
  title: 'Bienvenido al Tarót',
  html: `
    <p style="font-size: 1.3rem; line-height: 1.6; color: var(--color3); font-family: var(--font-Parrafos2); font-style: italic;">
      Las cartas están listas para revelarte lo que el Universo guarda en silencio.<br>
      Conecta con tu intuición, elige con el corazón, y deja que el destino te guíe.<br><br>
      ¿Estás listo para descubrir tu camino?
    </p>
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
  }
});
