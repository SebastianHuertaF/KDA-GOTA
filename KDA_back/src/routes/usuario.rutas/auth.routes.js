import {Router} from 'express';
import {signUp} from "../../controllers/usuario/controller/auth.controller.js";
import {signIn} from "../../controllers/usuario/controller/auth.controller.js";
import {signOut} from "../../controllers/usuario/controller/auth.controller.js";
import authorize from "../../middlewares/auth.middleware.js";

const authRouter = Router();

// El registro NO es público: las cuentas son de personal de mantenimiento, no de
// alumnos. Solo un usuario ya autenticado puede dar de alta a otro; el primero
// lo crea el seed (ADMIN_EMAIL / ADMIN_PASSWORD).
authRouter.post('/sign-up', authorize, signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);

export default authRouter;