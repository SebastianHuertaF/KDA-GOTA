import {Router} from 'express';
import {
    createBebedero,
    deleteBebedero,
    getBebederoById,
    getBebederos,
    getBebederosByPabellon,
    updateBebedero
} from "../../controllers/bebedero/bebedero.controller.js";
import authorize from "../../middlewares/auth.middleware.js";

const bebederoRouter = new Router();

// PÚBLICO: el mapa dibuja los bebederos con esto. No incluye reportes.
bebederoRouter.get('/', getBebederos);

bebederoRouter.get('/pabellon/:id', getBebederosByPabellon);

// PROTEGIDO: el detalle sí incluye los reportes, con el correo de quien reportó.
bebederoRouter.get('/:id', authorize, getBebederoById);

bebederoRouter.post('/', authorize, createBebedero);

bebederoRouter.put('/:id', authorize, updateBebedero);

bebederoRouter.delete('/:id', authorize, deleteBebedero);

export default bebederoRouter;
