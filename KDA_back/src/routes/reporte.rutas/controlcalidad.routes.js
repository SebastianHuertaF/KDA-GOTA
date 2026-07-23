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
import authorize from "../../middlewares/auth.middleware.js";

const controlcalidadRouter = new Router();

// El control de calidad es trabajo interno de mantenimiento: todo con token.
controlcalidadRouter.use(authorize);

controlcalidadRouter.get('/', getControlesCalidad);

controlcalidadRouter.get('/bebedero/:id', getControlesByBebedero);

controlcalidadRouter.get('/controlcalidad/:id', getControlByReporte);

controlcalidadRouter.get('/:id', getControlCalidadById);

controlcalidadRouter.post('/', createControlCalidad);

controlcalidadRouter.put('/:id', updateControlCalidad);

controlcalidadRouter.delete('/:id', deleteControlCalidad);

export default controlcalidadRouter;
