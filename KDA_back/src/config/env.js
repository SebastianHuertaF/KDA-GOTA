import {config} from 'dotenv';

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const {
    PORT,
    NODE_ENV,
    DB_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    APP_URL,
    QR_SALT,
    ADMIN_EMAIL,
    ADMIN_PASSWORD
} = process.env; // viene del env variable file

// URL pública que se codifica dentro de los QR impresos. DEBE ser absoluta y
// alcanzable desde un celular: "localhost" no existe para el teléfono que escanea.
// En local usa la IP LAN de tu PC (ej. http://192.168.1.10:3000) si quieres probar
// con el móvil; en producción, la URL de Render.
export const URL_PUBLICA = (APP_URL || `http://localhost:${PORT || 3000}`).replace(/\/+$/, '');

// Salt fijo con el que se derivan los códigos QR. Tiene que ser ESTABLE en el
// tiempo: si cambia, todos los QR ya impresos y pegados dejan de resolver.
// Por eso no se autogenera en cada despliegue (a diferencia de JWT_SECRET).
export const SALT_QR = QR_SALT || 'kda-gota-qr';