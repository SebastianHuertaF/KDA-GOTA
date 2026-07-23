import QRCode from "qrcode";

import client from "../../database/sqlite.js";
import { urlDeCodigo } from "../../utils/codigo-qr.js";

const parseId = (id) => Number.parseInt(id, 10);

const notFound = () => {
    const error = new Error("Codigo QR not found");
    error.statusCode = 404;
    return error;
};

const buscarPorCodigo = (codigo) =>
    client.codigoQR.findFirst({
        where: { codigo, activo: true },
        include: { bebedero: { include: { pabellon: true } } },
    });

export const getCodigos = async (req, res, next) => {
    try {
        const codigos = await client.codigoQR.findMany({
            where: { activo: true },
            include: { bebedero: { include: { pabellon: true } } },
            orderBy: { id: "asc" },
        });

        // `url` es lo que va dentro del QR; la hoja de etiquetas la muestra como
        // texto de respaldo por si alguien no puede escanear.
        const data = codigos.map((c) => ({ ...c, url: urlDeCodigo(c.codigo) }));

        res.status(200).json({ success: true, data });
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

// Destino del QR físico: alguien escanea el sticker del bebedero y cae aquí.
// Redirige al formulario ya identificado, con los mismos query params que usa el
// mapa, así el formulario no necesita saber nada de códigos QR.
export const resolverCodigo = async (req, res, next) => {
    try {
        const registro = await buscarPorCodigo(req.params.codigo);

        // Sticker retirado, dañado o inventado: página explicativa, no un JSON de error.
        if (!registro || !registro.bebedero.activo) return res.redirect("/qr-invalido.html");

        const { bebedero } = registro;
        const nombre = bebedero.pabellon?.nombre || `Bebedero #${bebedero.id}`;
        const query = new URLSearchParams({
            id: String(bebedero.id),
            bebedero: nombre,
            estado: bebedero.estado,
        });

        // El estado se resuelve en cada escaneo, no queda congelado en el papel.
        res.redirect(`/reporte.html?${query.toString()}`);
    } catch (error) {
        next(error);
    }
};

// SVG del QR listo para imprimir. Vectorial para que escale a cualquier tamaño
// de calcomanía sin pixelarse.
export const getImagenCodigo = async (req, res, next) => {
    try {
        const registro = await buscarPorCodigo(req.params.codigo);
        if (!registro) throw notFound();

        const svg = await QRCode.toString(urlDeCodigo(registro.codigo), {
            type: "svg",
            // Nivel H: tolera ~30% del código dañado, que es lo que le espera a una
            // calcomanía pegada a un bebedero (agua, rayones, suciedad).
            errorCorrectionLevel: "H",
            margin: 1,
        });

        res.type("image/svg+xml");
        res.set("Cache-Control", "public, max-age=86400"); // el QR de un código nunca cambia
        res.send(svg);
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
