import client from "../../database/sqlite.js";

const parseId = (id) => Number.parseInt(id, 10);

const notFound = () => {
    const error = new Error("Codigo QR not found");
    error.statusCode = 404;
    return error;
};

export const getCodigos = async (req, res, next) => {
    try {
        const codigos = await client.codigoQR.findMany({
            where: { activo: true },
            include: { bebedero: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: codigos });
    } catch (error) {
        next(error);
    }
};

export const getCodigoById = async (req, res, next) => {
    try {
        const codigo = await client.codigoQR.findFirst({
            where: { id: parseId(req.params.id), activo: true },
            include: { bebedero: true },
        });

        if (!codigo) throw notFound();

        res.status(200).json({ success: true, data: codigo });
    } catch (error) {
        next(error);
    }
};

export const createCodigo = async (req, res, next) => {
    try {
        const { codigo, bebedero_id } = req.body;

        const nuevoCodigo = await client.codigoQR.create({
            data: { codigo, bebedero_id: parseId(bebedero_id) },
        });

        res.status(201).json({ success: true, data: nuevoCodigo });
    } catch (error) {
        next(error);
    }
};

export const updateCodigo = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const { codigo, bebedero_id, activo } = req.body;

        const exists = await client.codigoQR.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        const codigoActualizado = await client.codigoQR.update({
            where: { id },
            data: {
                codigo,
                activo,
                bebedero_id: bebedero_id === undefined ? undefined : parseId(bebedero_id),
            },
        });

        res.status(200).json({ success: true, data: codigoActualizado });
    } catch (error) {
        next(error);
    }
};

export const deleteCodigo = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);

        const exists = await client.codigoQR.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        await client.codigoQR.update({
            where: { id },
            data: { activo: false, deleted_at: new Date(), deleted_by: req.body.deleted_by },
        });

        res.status(200).json({ success: true, message: "Codigo QR deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const getCodigoByBebedero = async (req, res, next) => {
    try {
        const codigo = await client.codigoQR.findFirst({
            where: { bebedero_id: parseId(req.params.id), activo: true },
            include: { bebedero: true },
        });

        if (!codigo) throw notFound();

        res.status(200).json({ success: true, data: codigo });
    } catch (error) {
        next(error);
    }
};
