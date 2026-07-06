import {Router} from 'express';
import {
    createBebedero,
    deleteBebedero,
    getBebederoById,
    getBebederos,
    getBebederosByPabellon,
    updateBebedero
} from "../../controllers/bebedero/bebedero.controller.js";

const bebederoRouter = new Router();

bebederoRouter.get('/', getBebederos);

bebederoRouter.get('/pabellon/:id', getBebederosByPabellon);

bebederoRouter.get('/:id', getBebederoById);

bebederoRouter.post('/', createBebedero);

bebederoRouter.put('/:id', updateBebedero);

bebederoRouter.delete('/:id', deleteBebedero);

export default bebederoRouter;
