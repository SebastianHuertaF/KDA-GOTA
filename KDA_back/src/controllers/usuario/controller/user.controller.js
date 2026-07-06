import bcrypt from "bcryptjs";
import client from "../../../database/sqlite.js";

const parseId = (id) => Number.parseInt(id, 10);

const notFound = () => {
    const error = new Error("User not found");
    error.statusCode = 404;
    return error;
};

const removePassword = (user) => {
    const { password, ...safeUser } = user;
    return safeUser;
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await client.user.findMany({
            where: { activo: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: users.map(removePassword) });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await client.user.findFirst({
            where: { id: parseId(req.params.id), activo: true },
        });

        if (!user) throw notFound();

        res.status(200).json({ success: true, data: removePassword(user) });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const { correo, password } = req.body;

        const existingUser = await client.user.findUnique({ where: { correo } });
        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await client.user.create({
            data: { correo, password: hash },
        });

        res.status(201).json({ success: true, data: removePassword(user) });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const { correo, password, activo } = req.body;

        const exists = await client.user.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        const user = await client.user.update({
            where: { id },
            data: {
                correo,
                activo,
                password: password === undefined ? undefined : await bcrypt.hash(password, 10),
            },
        });

        res.status(200).json({ success: true, data: removePassword(user) });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);

        const exists = await client.user.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        await client.user.update({
            where: { id },
            data: { activo: false, deleted_at: new Date(), deleted_by: req.body.deleted_by },
        });

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
};
