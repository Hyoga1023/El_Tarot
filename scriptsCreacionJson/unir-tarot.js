// unir-tarot.js
const fs = require('fs');
const path = require('path');

// rutas de los JSON ya existentes
const mayoresPath = path.join(__dirname, 'data', 'arcanos_mayores.json');
const menoresPath = path.join(__dirname, 'data', 'arcanos_menores.json');
const salidaPath = path.join(__dirname, 'data', 'tarot_completo.json');

try {
    // leer archivos existentes
    const arcanosMayores = JSON.parse(fs.readFileSync(mayoresPath, 'utf8'));
    const arcanosMenoresOrganizado = JSON.parse(fs.readFileSync(menoresPath, 'utf8'));

    // convertir los menores organizados por palo en un solo array
    const arcanosMenoresArray = [
        ...arcanosMenoresOrganizado.copas,
        ...arcanosMenoresOrganizado.oros,
        ...arcanosMenoresOrganizado.espadas,
        ...arcanosMenoresOrganizado.bastos
    ];

    // juntar todo en un solo array
    const tarotCompleto = [...arcanosMayores, ...arcanosMenoresArray];

    // agregar ID a cada carta
    const tarotConID = tarotCompleto.map((carta, index) => ({
        id: index + 1,
        ...carta
    }));

    // guardar archivo final
    fs.writeFileSync(salidaPath, JSON.stringify(tarotConID, null, 4), 'utf8');

    console.log(`✅ tarot_completo.json creado con ${tarotConID.length} cartas y IDs numéricos.`);
} catch (err) {
    console.error('❌ Error uniendo el tarot:', err);
}
