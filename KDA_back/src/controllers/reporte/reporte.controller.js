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

// Filtros + paginación: el panel no puede traerse la tabla entera para contar en
// el navegador. Con 12 bebederos con QR esto crece rápido.
// Ojo con los nombres del modelo: 'tipo' es el estado del flujo
// (PENDIENTE/REVISION/RESUELTO) y 'estado' es el tipo de problema reportado.
export const getReportes = async (req, res, next) => {
    try {
        const pagina = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const porPagina = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));

        const where = { activo: true };
        if (req.query.tipo) where.tipo = req.query.tipo;
        if (req.query.problema) where.estado = req.query.problema;

        const bebederoId = parseId(req.query.bebedero_id);
        if (Number.isInteger(bebederoId)) where.bebedero_id = bebederoId;

        const [total, reportes] = await Promise.all([
            client.reporte.count({ where }),
            client.reporte.findMany({
                where,
                include: { bebedero: { include: { pabellon: true } }, control_calidad: true },
                orderBy: { createdAt: "desc" }, // en monitoreo interesa lo último primero
                skip: (pagina - 1) * porPagina,
                take: porPagina,
            }),
        ]);

        res.status(200).json({
            success: true,
            data: reportes,
            meta: { total, pagina, porPagina, paginas: Math.max(1, Math.ceil(total / porPagina)) },
        });
    } catch (error) {
        next(error);
    }
};

// Contadores para la cabecera del panel. Se resuelve con agregaciones en SQL en
// vez de descargar todos los reportes y contarlos en el cliente.
export const getResumenReportes = async (req, res, next) => {
    try {
        const where = { activo: true };

        const [total, porFlujo, porProblema, masReportados] = await Promise.all([
            client.reporte.count({ where }),
            client.reporte.groupBy({ by: ["tipo"], where, _count: { _all: true } }),
            client.reporte.groupBy({ by: ["estado"], where, _count: { _all: true } }),
            client.reporte.groupBy({
                by: ["bebedero_id"],
                where,
                _count: { _all: true },
                orderBy: { _count: { bebedero_id: "desc" } },
                take: 5,
            }),
        ]);

        // Los bebederos más reportados se muestran por pabellón, no por id.
        const bebederos = await client.bebedero.findMany({
            where: { id: { in: masReportados.map((b) => b.bebedero_id) } },
            include: { pabellon: true },
        });
        const nombrePorId = new Map(
            bebederos.map((b) => [b.id, b.pabellon?.nombre || `Bebedero #${b.id}`])
        );

        const aObjeto = (filas, clave) =>
            Object.fromEntries(filas.map((f) => [f[clave], f._count._all]));

        res.status(200).json({
            success: true,
            data: {
                total,
                porFlujo: aObjeto(porFlujo, "tipo"),
                porProblema: aObjeto(porProblema, "estado"),
                masReportados: masReportados.map((b) => ({
                    bebedero_id: b.bebedero_id,
                    pabellon: nombrePorId.get(b.bebedero_id) || `Bebedero #${b.bebedero_id}`,
                    reportes: b._count._all,
                })),
            },
        });
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
