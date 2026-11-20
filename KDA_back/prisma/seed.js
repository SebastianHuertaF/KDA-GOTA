// Seed idempotente: carga los bebederos (mapeo oficial) a partir del mismo
// archivo que usaba el frontend estático (KDA_front/data/bebederos.json).
// Se ejecuta en cada arranque de producción (start:prod) para que la BD
// efímera de los planes gratuitos siempre tenga datos.
import '../src/config/env.js'; // carga .env.*.local en process.env ANTES de crear el cliente
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import bcrypt from 'bcryptjs';

import client from '../src/database/sqlite.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../src/config/env.js';
import { codigoDeBebedero } from '../src/utils/codigo-qr.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BEBEDEROS_JSON = path.resolve(__dirname, '../../KDA_front/data/bebederos.json');

// El frontend usa estados descriptivos; el backend solo maneja 3 valores.
const ESTADO_FRONT_A_BACKEND = {
    operativo: 'ACTIVO',
    filtro: 'MANTENIMIENTO',
    revision: 'MANTENIMIENTO',
    fuera_servicio: 'FUERA DE SERVICIO',
};

// Abreviación corta a partir del nombre de la zona (ej. "Polideportivo" -> "POLI").
const abreviar = (nombre) =>
    nombre.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'BEB';

async function sembrarBebederos() {
    const yaHay = await client.bebedero.count();
    if (yaHay > 0) {
        console.log(`Bebederos: omitido, ya existen ${yaHay}.`);
        return;
    }

    const bebederos = JSON.parse(readFileSync(BEBEDEROS_JSON, 'utf-8'));
    const pabellones = new Map(); // zona -> Pabellon (uno por zona, no uno por bebedero)

    for (const b of bebederos) {
        let pabellon = pabellones.get(b.zona);
        if (!pabellon) {
            pabellon = await client.pabellon.create({
                data: { nombre: b.zona, abreviation: abreviar(b.zona) },
            });
            pabellones.set(b.zona, pabellon);
        }

        await client.bebedero.create({
            data: {
                codigo: b.codigo,
                latitud: b.lat,
                longitud: b.lng,
                estado: ESTADO_FRONT_A_BACKEND[b.estado] || 'ACTIVO',
                pabellon_id: pabellon.id,
            },
        });
    }

    console.log(`Bebederos: ${bebederos.length} creados en ${pabellones.size} pabellones.`);
}

// Un código QR activo por bebedero. Es idempotente a nivel de bebedero (no de
// tabla) para que también se generen los que falten en una BD que ya tenía
// bebederos sembrados de antes.
async function sembrarCodigosQR() {
    const bebederos = await client.bebedero.findMany({
        where: { activo: true },
        select: { id: true },
        orderBy: { id: 'asc' },
    });

    let creados = 0;
    for (const { id } of bebederos) {
        const yaTiene = await client.codigoQR.findFirst({
            where: { bebedero_id: id, activo: true },
        });
        if (yaTiene) continue;

        await client.codigoQR.create({
            data: { codigo: codigoDeBebedero(id), bebedero_id: id },
        });
        creados++;
    }

    console.log(`Códigos QR: ${creados} creados, ${bebederos.length - creados} ya existían.`);
}

// Cuenta inicial de mantenimiento. Sin esto no hay forma de entrar al panel:
// el registro público está cerrado a propósito.
// La contraseña NO tiene valor por defecto adrede — un default sería una puerta
// trasera conocida en cada despliegue del proyecto.
async function sembrarAdmin() {
    if (!ADMIN_PASSWORD) {
        console.log('Admin: omitido, falta ADMIN_PASSWORD en el entorno.');
        return;
    }

    const correo = ADMIN_EMAIL || 'admin@pucp.edu.pe';
    const existente = await client.user.findUnique({ where: { correo } });
    if (existente) {
        console.log(`Admin: ya existe (${correo}).`);
        return;
    }

    await client.user.create({
        data: { correo, password: await bcrypt.hash(ADMIN_PASSWORD, 10) },
    });
    console.log(`Admin: creado (${correo}).`);
}

async function main() {
    await sembrarBebederos();
    await sembrarCodigosQR();
    await sembrarAdmin();
}

main()
    .catch((e) => {
        console.error('Error en el seed:', e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await client.$disconnect();
    });
