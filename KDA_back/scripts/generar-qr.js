// Genera los PNG de los códigos QR de todos los bebederos, listos para probar
// escaneando con el celular o para mandar a imprimir.
//
//   npm run qr:generar                              -> usa APP_URL del .env
//   npm run qr:generar -- --url http://192.168.1.47:3000   -> pruebas desde el móvil
//   npm run qr:generar -- --url https://kda-gota.onrender.com  -> los definitivos
//
// El QR debe apuntar a una URL alcanzable desde el teléfono que escanea:
// "localhost" es el propio celular, así que nunca funciona en pruebas reales.
import '../src/config/env.js'; // carga .env.*.local ANTES de crear el cliente
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import QRCode from 'qrcode';

import client from '../src/database/sqlite.js';
import { URL_PUBLICA } from '../src/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = path.resolve(__dirname, '../qr-prueba');

// --url tiene prioridad sobre APP_URL, para generar tandas de prueba sin tocar el .env.
const argUrl = process.argv.indexOf('--url');
const BASE = (argUrl !== -1 ? process.argv[argUrl + 1] : URL_PUBLICA).replace(/\/+$/, '');

// Nombres de archivo seguros en Windows: fuera acentos y caracteres reservados.
const parteSegura = (texto) =>
    texto.normalize('NFD').replace(/[̀-ͯ]/g, '') // quita las tildes ya separadas
        .replace(/[^A-Za-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);

async function main() {
    const codigos = await client.codigoQR.findMany({
        where: { activo: true },
        include: { bebedero: { include: { pabellon: true } } },
        orderBy: { bebedero_id: 'asc' },
    });

    if (!codigos.length) {
        console.log('No hay códigos QR. Corre "npm run db:seed" primero.');
        return;
    }

    rmSync(SALIDA, { recursive: true, force: true }); // evita mezclar tandas de URLs distintas
    mkdirSync(SALIDA, { recursive: true });

    const indice = [];
    for (const registro of codigos) {
        const nombre = registro.bebedero.pabellon?.nombre || `Bebedero ${registro.bebedero_id}`;
        const url = `${BASE}/q/${registro.codigo}`;
        const archivo = `${String(registro.bebedero_id).padStart(2, '0')}-${parteSegura(nombre)}-${registro.codigo}.png`;

        await QRCode.toFile(path.join(SALIDA, archivo), url, {
            errorCorrectionLevel: 'H', // aguanta ~30% de daño: agua, rayones, suciedad
            width: 600,                // suficiente resolución para imprimir sin pixelar
            margin: 2,                 // zona silenciosa: sin ella muchos lectores fallan
        });

        indice.push({ bebedero_id: registro.bebedero_id, pabellon: nombre, codigo: registro.codigo, url, archivo });
        console.log(`  ${archivo}  ->  ${url}`);
    }

    writeFileSync(path.join(SALIDA, 'indice.json'), JSON.stringify(indice, null, 2));
    console.log(`\n${codigos.length} QR generados en ${SALIDA}`);
    console.log(`URL base usada: ${BASE}`);
    if (BASE.includes('localhost')) {
        console.log('\nAVISO: apuntan a localhost, un celular NO podrá abrirlos.');
        console.log('Regenera con: npm run qr:generar -- --url http://TU-IP-LAN:3000');
    }
}

main()
    .catch((e) => {
        console.error('Error generando los QR:', e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await client.$disconnect();
    });
