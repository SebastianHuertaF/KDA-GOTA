import client from "../../database/sqlite.js";

const parseId = (id) => Number.parseInt(id, 10);

const notFound = () => {
    const error = new Error("Control de Calidad not found");
    error.statusCode = 404;
    return error;
};

const parseDate = (value, field) => {
    if (!value) return value;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        const error = new Error(`${field} must be a valid date`);
        error.statusCode = 400;
        throw error;
    }

    return date;
};

export const getControlesCalidad = async (req, res, next) => {
    try {
        const controles = await client.controlCalidad.findMany({
            where: { activo: true },
            include: { bebedero: true, reporte: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: controles });
    } catch (error) {
        next(error);
    }
};

export const getControlCalidadById = async (req, res, next) => {
    try {
        const control = await client.controlCalidad.findFirst({
            where: { id: parseId(req.params.id), activo: true },
            include: { bebedero: true, reporte: true },
        });

        if (!control) throw notFound();

        res.status(200).json({ success: true, data: control });
    } catch (error) {
        next(error);
    }
};

export const createControlCalidad = async (req, res, next) => {
    try {
        const {
            nombre_responsable,
            apellido_paterno_responsable,
            apellido_materno_responsable,
            fecha_control,
            fecha_resolucion,
            estado,
            observacion,
            reporte_id,
            bebedero_id,
        } = req.body;

        const control = await client.controlCalidad.create({
            data: {
                nombre_responsable,
                apellido_paterno_responsable,
                apellido_materno_responsable,
                fecha_control: parseDate(fecha_control, "fecha_control"),
                fecha_resolucion: parseDate(fecha_resolucion, "fecha_resolucion"),
                estado,
                observacion,
                reporte_id: reporte_id === undefined || reporte_id === null ? undefined : parseId(reporte_id),
                bebedero_id: parseId(bebedero_id),
            },
        });

        res.status(201).json({ success: true, data: control });
    } catch (error) {
        next(error);
    }
};

export const updateControlCalidad = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const {
            nombre_responsable,
            apellido_paterno_responsable,
            apellido_materno_responsable,
            fecha_control,
            fecha_resolucion,
            estado,
            observacion,
            activo,
            reporte_id,
            bebedero_id,
        } = req.body;

        const exists = await client.controlCalidad.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        const control = await client.controlCalidad.update({
            where: { id },
            data: {
                nombre_responsable,
                apellido_paterno_responsable,
                apellido_materno_responsable,
                fecha_control: fecha_control === undefined ? undefined : parseDate(fecha_control, "fecha_control"),
                fecha_resolucion: fecha_resolucion === undefined ? undefined : parseDate(fecha_resolucion, "fecha_resolucion"),
                estado,
                observacion,
                activo,
                reporte_id: reporte_id === undefined ? undefined : reporte_id === null ? null : parseId(reporte_id),
                bebedero_id: bebedero_id === undefined ? undefined : parseId(bebedero_id),
            },
        });

        res.status(200).json({ success: true, data: control });
    } catch (error) {
        next(error);
    }
};

export const deleteControlCalidad = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);

        const exists = await client.controlCalidad.findFirst({ where: { id, activo: true } });
        if (!exists) throw notFound();

        await client.controlCalidad.update({
            where: { id },
            data: { activo: false, deleted_at: new Date(), deleted_by: req.body.deleted_by },
        });

        res.status(200).json({ success: true, message: "Control de Calidad deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const getControlesByBebedero = async (req, res, next) => {
    try {
        const controles = await client.controlCalidad.findMany({
            where: { bebedero_id: parseId(req.params.id), activo: true },
            include: { bebedero: true, reporte: true },
            orderBy: { id: "asc" },
        });

        res.status(200).json({ success: true, data: controles });
    } catch (error) {
        next(error);
    }
};

export const getControlByReporte = async (req, res, next) => {
    try {
        const control = await client.controlCalidad.findFirst({
            where: { reporte_id: parseId(req.params.id), activo: true },
            include: { bebedero: true, reporte: true },
        });

        if (!control) throw notFound();

        res.status(200).json({ success: true, data: control });
    } catch (error) {
        next(error);
    }
};
