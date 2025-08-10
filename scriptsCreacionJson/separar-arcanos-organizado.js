const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

let arcanosMayores = [];
let arcanosMenores = {
    copas: [],
    oros: [],
    espadas: [],
    bastos: []
};

fs.readdirSync(dataDir).forEach(file => {
    if (path.extname(file) === '.json' && !file.startsWith('arcanos_')) {
        const filePath = path.join(dataDir, file);
        const rawData = fs.readFileSync(filePath, 'utf8');
        const carta = JSON.parse(rawData);

        if (carta.carta.startsWith('major_arcana')) {
            arcanosMayores.push(carta);
        } else if (carta.carta.startsWith('minor_arcana')) {
            if (carta.carta.includes('cups')) {
                arcanosMenores.copas.push(carta);
            } else if (carta.carta.includes('pentacles')) {
                arcanosMenores.oros.push(carta);
            } else if (carta.carta.includes('swords')) {
                arcanosMenores.espadas.push(carta);
            } else if (carta.carta.includes('wands')) {
                arcanosMenores.bastos.push(carta);
            }
        }
    }
});

// Guardar arcanos mayores
fs.writeFileSync(
    path.join(dataDir, 'arcanos_mayores.json'),
    JSON.stringify(arcanosMayores, null, 4),
    'utf8'
);

// Guardar arcanos menores organizados
fs.writeFileSync(
    path.join(dataDir, 'arcanos_menores.json'),
    JSON.stringify(arcanosMenores, null, 4),
    'utf8'
);

console.log('✅ Listo: arcanos_mayores.json y arcanos_menores.json (organizado por palos) creados en data.');
