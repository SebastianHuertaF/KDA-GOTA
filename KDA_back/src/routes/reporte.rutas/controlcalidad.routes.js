import {Router} from 'express';
import {
    createControlCalidad,
    deleteControlCalidad,
    getControlByReporte,
    getControlCalidadById,
    getControlesByBebedero,
    getControlesCalidad,
    updateControlCalidad
} from "../../controllers/reporte/controlcalidad.controller.js";

const controlcalidadRouter = new Router();

controlcalidadRouter.get('/', getControlesCalidad);

controlcalidadRouter.get('/bebedero/:id', getControlesByBebedero);

controlcalidadRouter.get('/controlcalidad/:id', getControlByReporte);

controlcalidadRouter.get('/:id', getControlCalidadById);

controlcalidadRouter.post('/', createControlCalidad);

controlcalidadRouter.put('/:id', updateControlCalidad);

controlcalidadRouter.delete('/:id', deleteControlCalidad);

export default controlcalidadRouter;
