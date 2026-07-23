// Seed idempotente: carga los bebederos de demostración a partir del mismo
// archivo que usaba el frontend estático (KDA_front/data/bebederos.json).
// Se ejecuta en cada arranque de producción (start:prod) para que la BD
// efímera de los planes gratuitos siempre tenga datos.
import '../src/config/env.js'; // carga .env.*.local en process.env ANTES de crear el cliente
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import client from '../src/database/sqlite.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BEBEDEROS_JSON = path.resolve(__dirname, '../../KDA_front/data/bebederos.json');

// El frontend usa estados descriptivos; el backend solo maneja 3 valores.
const ESTADO_FRONT_A_BACKEND = {
    operativo: 'ACTIVO',
    filtro: 'MANTENIMIENTO',
    revision: 'MANTENIMIENTO',
    fuera_servicio: 'FUERA DE SERVICIO',
};

// Abreviación corta a partir del nombre del pabellón (ej. "Pabellón A (Letras)" -> "PA").
const abreviar = (nombre) => {
    const letras = nombre.replace(/[^A-Za-zÁÉÍÓÚÑ ]/g, ' ').trim().split(/\s+/);
    return letras.slice(0, 3).map((w) => w[0].toUpperCase()).join('') || 'BEB';
};

async function main() {
    const yaHay = await client.bebedero.count();
    if (yaHay > 0) {
        console.log(`Seed omitido: ya existen ${yaHay} bebederos.`);
        return;
    }

    const bebederos = JSON.parse(readFileSync(BEBEDEROS_JSON, 'utf-8'));

    for (const b of bebederos) {
        const nombrePabellon = b.title.replace(/^Bebedero\s*-\s*/, '');

        // Un pabellón por bebedero, para conservar el nombre descriptivo sin
        // tener que ampliar el esquema (esto es lo que verá el popup del mapa).
        const pabellon = await client.pabellon.create({
            data: {
                nombre: nombrePabellon,
                abreviation: abreviar(nombrePabellon),
            },
        });

        await client.bebedero.create({
            data: {
                latitud: b.lat,
                longitud: b.lng,
                estado: ESTADO_FRONT_A_BACKEND[b.estado] || 'ACTIVO',
                pabellon_id: pabellon.id,
            },
        });
    }

    console.log(`Seed completado: ${bebederos.length} bebederos creados.`);
}

main()
    .catch((e) => {
        console.error('Error en el seed:', e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await client.$disconnect();
    });
