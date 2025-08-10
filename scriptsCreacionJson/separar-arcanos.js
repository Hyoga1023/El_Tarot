const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

// Arrays donde guardaremos los resultados
let arcanosMayores = [];
let arcanosMenores = [];

// Leemos todos los archivos JSON de la carpeta data
fs.readdirSync(dataDir).forEach(file => {
    if (path.extname(file) === '.json') {
        const filePath = path.join(dataDir, file);
        const rawData = fs.readFileSync(filePath, 'utf8');
        const carta = JSON.parse(rawData);

        // Clasificamos por nombre
        if (carta.carta.startsWith('major_arcana')) {
            arcanosMayores.push(carta);
        } else if (carta.carta.startsWith('minor_arcana')) {
            arcanosMenores.push(carta);
        }
    }
});

// Guardamos los dos JSON
fs.writeFileSync(
    path.join(dataDir, 'arcanos_mayores.json'),
    JSON.stringify(arcanosMayores, null, 4),
    'utf8'
);

fs.writeFileSync(
    path.join(dataDir, 'arcanos_menores.json'),
    JSON.stringify(arcanosMenores, null, 4),
    'utf8'
);

console.log('✅ Listo: arcanos_mayores.json y arcanos_menores.json creados en la carpeta data.');
