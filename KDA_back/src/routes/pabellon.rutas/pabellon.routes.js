import {Router} from 'express';
import {
    createPabellon,
    deletePabellon,
    getPabellonById,
    getPabellones,
    updatePabellon
} from "../../controllers/pabellon/pabellon.controller.js";

const pabellonRouter = new Router();

pabellonRouter.get('/', getPabellones);

pabellonRouter.get('/:id', getPabellonById);

pabellonRouter.post('/', createPabellon);

pabellonRouter.put('/:id', updatePabellon);

pabellonRouter.delete('/:id', deletePabellon);

export default pabellonRouter;
