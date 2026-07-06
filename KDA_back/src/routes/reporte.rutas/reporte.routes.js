import {Router} from 'express';
import {
    createReporte,
    deleteReporte,
    getReporteById,
    getReportes,
    getReportesByBebedero,
    updateReporte
} from "../../controllers/reporte/reporte.controller.js";

const reporteRouter = new Router();

reporteRouter.get('/', getReportes);

reporteRouter.get('/bebedero/:id', getReportesByBebedero);

reporteRouter.get('/:id', getReporteById);

reporteRouter.post('/', createReporte);

reporteRouter.put('/:id', updateReporte);

reporteRouter.delete('/:id', deleteReporte);

export default reporteRouter;
