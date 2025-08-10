// generar-json-tarot.js
const fs = require('fs');
const path = require('path');

// Ruta donde tienes TODAS las imágenes
const carpetaImagenes = "C:/Users/Cexitar Martinez/Desktop/Desarrollos Propios/El Tarot/img";
const carpetaJSON = path.join(__dirname, 'data');

// Crea la carpeta de datos si no existe
if (!fs.existsSync(carpetaJSON)) {
    fs.mkdirSync(carpetaJSON, { recursive: true });
}

// Lee todas las imágenes de la carpeta
const imagenes = fs.readdirSync(carpetaImagenes)
    .filter(archivo => /\.(png|jpg|jpeg)$/i.test(archivo)); // solo imágenes

// Por cada imagen, crea un JSON con el mismo nombre
imagenes.forEach(nombreArchivo => {
    const nombreBase = path.parse(nombreArchivo).name; // sin extensión
    const jsonPath = path.join(carpetaJSON, `${nombreBase}.json`);

    const contenido = {
        carta: nombreBase,
        significado_derecho: "",
        significado_invertido: "",
        descripcion: ""
    };

    fs.writeFileSync(jsonPath, JSON.stringify(contenido, null, 4), 'utf8');
    console.log(`Creado: ${jsonPath}`);
});

console.log('Todos los JSON fueron creados con éxito.');
