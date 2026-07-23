import {Router} from 'express';
import {
    createCodigo,
    deleteCodigo,
    getCodigoByBebedero,
    getCodigoById,
    getCodigos,
    getImagenCodigo,
    updateCodigo
} from "../../controllers/bebedero/codigoqr.controller.js";
import authorize from "../../middlewares/auth.middleware.js";

const codigoRouter = new Router();

// Las lecturas quedan públicas: el código impreso en el sticker no es un secreto
// (cualquiera puede leerlo escaneando) y así etiquetas.html imprime sin login.
codigoRouter.get('/', getCodigos);

codigoRouter.get('/codigo/:id', getCodigoByBebedero);

// SVG imprimible del QR. Va antes de '/:id' porque tiene dos segmentos y no colisiona.
codigoRouter.get('/:codigo/imagen.svg', getImagenCodigo);

codigoRouter.get('/:id', getCodigoById);

// Crear, reasignar o revocar una etiqueta sí es administrativo.
codigoRouter.post('/', authorize, createCodigo);

codigoRouter.put('/:id', authorize, updateCodigo);

codigoRouter.delete('/:id', authorize, deleteCodigo);

export default codigoRouter;
