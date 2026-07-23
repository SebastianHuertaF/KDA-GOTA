// Derivación de los códigos que viajan dentro de los QR pegados en los bebederos.
//
// Son DETERMINISTAS a propósito: en los planes gratuitos el disco es efímero y
// `start:prod` vuelve a sembrar la BD en cada arranque. Si el código fuera
// aleatorio, cada reinicio de Render invalidaría todos los stickers ya impresos
// y pegados en el campus. Derivándolo de (salt + id) el código sobrevive a
// cualquier re-siembra.
//
// No es un secreto: el formulario de reporte es público y no protege nada. El
// salt solo evita que los códigos sean 1, 2, 3… y se puedan recorrer a mano.
import { createHash } from 'node:crypto';

import { SALT_QR, URL_PUBLICA } from '../config/env.js';

// 8 caracteres hexadecimales: corto (QR poco denso, se escanea mejor de lejos)
// y sin caracteres ambiguos, porque el alfabeto 0-9A-F no tiene O/0 ni I/l/1.
export const codigoDeBebedero = (bebederoId) =>
    createHash('sha256')
        .update(`${SALT_QR}:${bebederoId}`)
        .digest('hex')
        .slice(0, 8)
        .toUpperCase();

// URL absoluta que se codifica en el QR. Corta a propósito: cada carácter de más
// densifica el código y lo vuelve más difícil de leer sobre una calcomanía chica.
export const urlDeCodigo = (codigo) => `${URL_PUBLICA}/q/${codigo}`;
