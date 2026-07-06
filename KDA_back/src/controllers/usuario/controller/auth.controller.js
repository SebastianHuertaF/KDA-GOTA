import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

// Ahora importas tu instancia de Prisma en lugar de Mongoose y el Modelo
import client from "../../../database/sqlite.js"; // Ajusta la ruta según donde tengas tu prismaClient
import { JWT_EXPIRES_IN, JWT_SECRET } from "../../../config/env.js";

const removePassword = (user) => {
    const { password, ...safeUser } = user;
    return safeUser;
};

export const signUp = async (req, res, next) => {
    try {
        const { correo, password } = req.body;

        const existingUser = await client.user.findUnique({
            where: { correo: correo }
        });

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // 2. Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // 3. Crear nuevo usuario
        const newUser = await client.user.create({
            data: {
                correo: correo,
                password: hash
            }
        });

        // 4. Generar el Token
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({
            success: true,
            message: "User Created successfully",
            data: {
                token: token,
                user: removePassword(newUser)
            }
        });

    } catch (ex) {
        next(ex);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const { correo, password } = req.body;

        // 1. Buscar al usuario
        const user = await client.user.findUnique({
            where: { correo: correo }
        });

        if (!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }

        // 2. Comparar contraseñas
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            const error = new Error('User or passwords do not match');
            error.statusCode = 401;
            throw error;
        }

        // EXTRA: Como tu schema de Prisma tiene 'latest_login', podemos actualizarlo aquí:
        await client.user.update({
            where: { id: user.id },
            data: { latest_login: new Date() }
        });

        // 3. Generar token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token: token,
                user: removePassword(user),
            }
        });
    } catch (ex) {
        next(ex);
    }
}

export const signOut = async (req, res, next) => {
    try {
        /*
         * el cierre de sesión real ocurre en el FRONTEND cuando
         * se elimina el token del LocalStorage o de las Cookies.
         */
        res.status(200).json({
            success: true,
            message: "User signed out successfully. "
        });

    } catch (ex) {
        next(ex);
    }
}
