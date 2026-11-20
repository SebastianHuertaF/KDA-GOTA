import client from "../../database/sqlite.js";

const parseId = (id) => Number.parseInt(id, 10);

const notFound = () => {
    const error = new Error("Bebedero not found");
    error.statusCode = 404;
    return error;
};

export const getBebederos = async (req, res, next) => {
    try {
        const bebederos = await client.bebedero.findMany({
            where: { activo: true },
            include: { pabellon: true, codigos_qr: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: bebederos });
    } catch (error) {
        next(error);
    }
};

export const getBebederoById = async (req, res, next) => {
    try {
        const bebedero = await client.bebedero.findFirst({
            where: { id: parseId(req.params.id), activo: true },
            include: { pabellon: true, codigos_qr: true, reportes: true, controles: true },
        });

        if (!bebedero) throw notFound();

        res.status(200).json({ success: true, data: bebedero });
    } catch (error) {
        next(error);
    }
};

export const createBebedero = async (req, res, next) => {
    try {
        const { codigo, latitud, longitud, estado, pabellon_id } = req.body;

        const bebedero = await client.bebedero.create({
            data: {
                codigo,
                latitud: Number(latitud),
                longitud: Number(longitud),
                estado,
                pabellon_id: parseId(pabellon_id),
            },
        });

        res.status(201).json({ success: true, data: bebedero });
    } catch (error) {
        next(error);
    }
};

export const updateBebedero = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const { codigo, latitud, longitud, estado, activo, pabellon_id } = req.body;

        const exists = await client.bebedero.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        const bebedero = await client.bebedero.update({
            where: { id },
            data: {
                codigo,
                latitud: latitud === undefined ? undefined : Number(latitud),
                longitud: longitud === undefined ? undefined : Number(longitud),
                estado,
                activo,
                pabellon_id: pabellon_id === undefined ? undefined : parseId(pabellon_id),
            },
        });

        res.status(200).json({ success: true, data: bebedero });
    } catch (error) {
        next(error);
    }
};

export const deleteBebedero = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);

        const exists = await client.bebedero.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        await client.bebedero.update({
            where: { id },
            data: { activo: false, deleted_at: new Date(), deleted_by: req.body.deleted_by },
        });

        res.status(200).json({ success: true, message: "Bebedero deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const getBebederosByPabellon = async (req, res, next) => {
    try {
        const bebederos = await client.bebedero.findMany({
            where: { pabellon_id: parseId(req.params.id), activo: true },
            include: { pabellon: true, codigos_qr: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: bebederos });
    } catch (error) {
        next(error);
    }
};
