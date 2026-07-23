// Verifica el JWT que emite auth.controller. Hasta ahora el token se firmaba en
// el login pero nadie lo comprobaba: toda la API quedaba abierta.
//
// Criterio de qué se protege: público solo lo que necesitan el mapa y el QR
// (listar bebederos y crear un reporte). Todo lo que lee datos personales
// (correo_reporte, usuarios) o modifica el estado del sistema, va con token.
import jwt from "jsonwebtoken";

import client from "../database/sqlite.js";
import { JWT_SECRET } from "../config/env.js";

const unauthorized = (message) => {
    const error = new Error(message);
    error.statusCode = 401;
    return error;
};

export const authorize = async (req, res, next) => {
    try {
        const cabecera = req.headers.authorization || "";
        if (!cabecera.startsWith("Bearer ")) throw unauthorized("Falta el token de acceso");

        const token = cabecera.slice(7).trim();
        if (!token) throw unauthorized("Falta el token de acceso");

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch {
            // Firma inválida, token manipulado o expirado: mismo mensaje para no
            // dar pistas sobre cuál de los tres fue.
            throw unauthorized("Token inválido o expirado");
        }

        // Se relee el usuario en cada request: así desactivar una cuenta corta el
        // acceso al instante, sin esperar a que caduque el token que ya emitimos.
        const usuario = await client.user.findFirst({
            where: { id: payload.userId, activo: true, deleted_at: null },
        });
        if (!usuario) throw unauthorized("La cuenta ya no está activa");

        req.user = { id: usuario.id, correo: usuario.correo };
        next();
    } catch (error) {
        next(error);
    }
};

export default authorize;
