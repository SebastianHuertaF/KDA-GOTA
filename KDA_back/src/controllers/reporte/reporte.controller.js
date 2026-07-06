import client from "../../database/sqlite.js";

const parseId = (id) => Number.parseInt(id, 10);

const notFound = () => {
    const error = new Error("Reporte not found");
    error.statusCode = 404;
    return error;
};

const parseDate = (value) => {
    if (!value) return value;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        const error = new Error("fecha_revision must be a valid date");
        error.statusCode = 400;
        throw error;
    }

    return date;
};

export const getReportes = async (req, res, next) => {
    try {
        const reportes = await client.reporte.findMany({
            where: { activo: true },
            include: { bebedero: true, control_calidad: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: reportes });
    } catch (error) {
        next(error);
    }
};

export const getReporteById = async (req, res, next) => {
    try {
        const reporte = await client.reporte.findFirst({
            where: { id: parseId(req.params.id), activo: true },
            include: { bebedero: true, control_calidad: true },
        });

        if (!reporte) throw notFound();

        res.status(200).json({ success: true, data: reporte });
    } catch (error) {
        next(error);
    }
};

export const createReporte = async (req, res, next) => {
    try {
        const { tipo, estado, fecha_revision, observacion, correo_reporte, bebedero_id } = req.body;

        const reporte = await client.reporte.create({
            data: {
                tipo,
                estado,
                fecha_revision: parseDate(fecha_revision),
                observacion,
                correo_reporte,
                bebedero_id: parseId(bebedero_id),
            },
        });

        res.status(201).json({ success: true, data: reporte });
    } catch (error) {
        next(error);
    }
};

export const updateReporte = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const { tipo, estado, fecha_revision, observacion, correo_reporte, activo, bebedero_id } = req.body;

        const exists = await client.reporte.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        const reporte = await client.reporte.update({
            where: { id },
            data: {
                tipo,
                estado,
                fecha_revision: fecha_revision === undefined ? undefined : parseDate(fecha_revision),
                observacion,
                correo_reporte,
                activo,
                bebedero_id: bebedero_id === undefined ? undefined : parseId(bebedero_id),
            },
        });

        res.status(200).json({ success: true, data: reporte });
    } catch (error) {
        next(error);
    }
};

export const deleteReporte = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);

        const exists = await client.reporte.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        await client.reporte.update({
            where: { id },
            data: { activo: false, deleted_at: new Date(), deleted_by: req.body.deleted_by },
        });

        res.status(200).json({ success: true, message: "Reporte deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const getReportesByBebedero = async (req, res, next) => {
    try {
        const reportes = await client.reporte.findMany({
            where: { bebedero_id: parseId(req.params.id), activo: true },
            include: { bebedero: true, control_calidad: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: reportes });
    } catch (error) {
        next(error);
    }
};
