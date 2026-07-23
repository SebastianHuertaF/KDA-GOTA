import {Router} from 'express';
import {
    createReporte,
    deleteReporte,
    getReporteById,
    getReportes,
    getReportesByBebedero,
    updateReporte
} from "../../controllers/reporte/reporte.controller.js";
import { getResumenReportes } from "../../controllers/reporte/reporte.controller.js";
import authorize from "../../middlewares/auth.middleware.js";

const reporteRouter = new Router();

// PÚBLICO: es lo que envía el formulario que abre el QR del bebedero.
reporteRouter.post('/', createReporte);

// PROTEGIDO: los reportes incluyen correo_reporte (datos de quien reporta).
reporteRouter.get('/resumen', authorize, getResumenReportes); // antes de '/:id'

reporteRouter.get('/', authorize, getReportes);

reporteRouter.get('/bebedero/:id', authorize, getReportesByBebedero);

reporteRouter.get('/:id', authorize, getReporteById);

reporteRouter.put('/:id', authorize, updateReporte);

reporteRouter.delete('/:id', authorize, deleteReporte);

export default reporteRouter;
