import {Router} from 'express';
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser
} from "../../controllers/usuario/controller/user.controller.js";
import authorize from "../../middlewares/auth.middleware.js";

const userRouter = new Router();

// Todo el módulo de usuarios es personal de mantenimiento: nada público aquí.
userRouter.use(authorize);

userRouter.get('/', getUsers);

userRouter.get('/:id', getUserById);

userRouter.post('/', createUser);

userRouter.put('/:id', updateUser);

userRouter.delete('/:id', deleteUser);

export default userRouter;
