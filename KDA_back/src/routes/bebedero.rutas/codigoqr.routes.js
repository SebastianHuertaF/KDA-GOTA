import {Router} from 'express';
import {
    createCodigo,
    deleteCodigo,
    getCodigoByBebedero,
    getCodigoById,
    getCodigos,
    updateCodigo
} from "../../controllers/bebedero/codigoqr.controller.js";

const codigoRouter = new Router();

codigoRouter.get('/', getCodigos);

codigoRouter.get('/codigo/:id', getCodigoByBebedero);

codigoRouter.get('/:id', getCodigoById);

codigoRouter.post('/', createCodigo);

codigoRouter.put('/:id', updateCodigo);

codigoRouter.delete('/:id', deleteCodigo);

export default codigoRouter;
