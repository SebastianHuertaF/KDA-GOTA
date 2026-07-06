import express from 'express';

import {PORT} from './src/config/env.js';

import bebederoRouter from "./src/routes/bebedero.rutas/bebedero.routes.js";
import codigoRouter from "./src/routes/bebedero.rutas/codigoqr.routes.js";

import pabellonRouter from "./src/routes/pabellon.rutas/pabellon.routes.js";

import controlcalidadRouter from "./src/routes/reporte.rutas/controlcalidad.routes.js";
import reporteRouter from "./src/routes/reporte.rutas/reporte.routes.js";

import authRouter from "./src/routes/usuario.rutas/auth.routes.js";
import userRouter from "./src/routes/usuario.rutas/user.routes.js";

import { connectToDatabase } from "./src/database/sqlite.js";
import errorMiddleware from "./src/middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // process in simple format

app.use('/api/v1/auth', authRouter); // direccionar las rutas
app.use('/api/v1/users', userRouter); // direccionar las rutas
app.use('/api/v1/reportes', reporteRouter); // direccionar las rutas
app.use('/api/v1/controles', controlcalidadRouter); // direccionar las rutas
app.use('/api/v1/pabellones', pabellonRouter); // direccionar las rutas
app.use('/api/v1/codigos', codigoRouter); // direccionar las rutas
app.use('/api/v1/bebederos', bebederoRouter); // direccionar las rutas


app.get('/', (req, res) => {
    res.send('Bienvenido a KDA GOTA APP');
});

app.use(errorMiddleware);

app.listen(PORT, async() => {
    console.log('KDA GOTA App listening on http://localhost:'+ PORT );

    await connectToDatabase(); // conectar a la bd (asincrono)
});

export default app;
