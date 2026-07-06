import client from "../../database/sqlite.js";

const parseId = (id) => Number.parseInt(id, 10);

const notFound = () => {
    const error = new Error("Pabellon not found");
    error.statusCode = 404;
    return error;
};

export const getPabellones = async (req, res, next) => {
    try {
        const pabellones = await client.pabellon.findMany({
            where: { activo: true },
            include: { bebederos: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: pabellones });
    } catch (error) {
        next(error);
    }
};

export const getPabellonById = async (req, res, next) => {
    try {
        const pabellon = await client.pabellon.findFirst({
            where: { id: parseId(req.params.id), activo: true },
            include: { bebederos: true },
        });

        if (!pabellon) throw notFound();

        res.status(200).json({ success: true, data: pabellon });
    } catch (error) {
        next(error);
    }
};

export const createPabellon = async (req, res, next) => {
    try {
        const { nombre, abreviation } = req.body;

        const pabellon = await client.pabellon.create({
            data: { nombre, abreviation },
        });

        res.status(201).json({ success: true, data: pabellon });
    } catch (error) {
        next(error);
    }
};

export const updatePabellon = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const { nombre, abreviation, activo } = req.body;

        const exists = await client.pabellon.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        const pabellon = await client.pabellon.update({
            where: { id },
            data: { nombre, abreviation, activo },
        });

        res.status(200).json({ success: true, data: pabellon });
    } catch (error) {
        next(error);
    }
};

export const deletePabellon = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);

        const exists = await client.pabellon.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        await client.pabellon.update({
            where: { id },
            data: { activo: false, deleted_at: new Date(), deleted_by: req.body.deleted_by },
        });

        res.status(200).json({ success: true, message: "Pabellon deleted successfully" });
    } catch (error) {
        next(error);
    }
};
