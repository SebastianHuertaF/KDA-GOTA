import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {PORT} from './src/config/env.js';

import bebederoRouter from "./src/routes/bebedero.rutas/bebedero.routes.js";
import codigoRouter from "./src/routes/bebedero.rutas/codigoqr.routes.js";
import { resolverCodigo } from "./src/controllers/bebedero/codigoqr.controller.js";

import pabellonRouter from "./src/routes/pabellon.rutas/pabellon.routes.js";

import controlcalidadRouter from "./src/routes/reporte.rutas/controlcalidad.routes.js";
import reporteRouter from "./src/routes/reporte.rutas/reporte.routes.js";

import authRouter from "./src/routes/usuario.rutas/auth.routes.js";
import userRouter from "./src/routes/usuario.rutas/user.routes.js";

import { connectToDatabase } from "./src/database/sqlite.js";
import errorMiddleware from "./src/middlewares/error.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// El frontend estático vive en el proyecto hermano KDA_front
const FRONT_DIR = path.resolve(__dirname, '../KDA_front');

const app = express();

app.use(cors()); // respaldo: permite que el front funcione aunque corra en otro origen (ej. Live Server)
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // process in simple format

app.use('/api/v1/auth', authRouter); // direccionar las rutas
app.use('/api/v1/users', userRouter); // direccionar las rutas
app.use('/api/v1/reportes', reporteRouter); // direccionar las rutas
app.use('/api/v1/controles', controlcalidadRouter); // direccionar las rutas
app.use('/api/v1/pabellones', pabellonRouter); // direccionar las rutas
app.use('/api/v1/codigos', codigoRouter); // direccionar las rutas
app.use('/api/v1/bebederos', bebederoRouter); // direccionar las rutas

app.get('/api/v1/health', (req, res) => {
    res.json({ success: true, status: 'ok' });
});

// Ruta corta a la que apuntan los QR pegados en los bebederos. Fuera de /api/v1
// a propósito: cada carácter de la URL densifica el código impreso.
app.get('/q/:codigo', resolverCodigo);

// Servir el frontend en el mismo origen que la API (index.html en "/", reporte.html, etc.)
app.use(express.static(FRONT_DIR));

app.use(errorMiddleware);

app.listen(PORT || 3000, async() => {
    console.log('KDA GOTA App listening on http://localhost:'+ (PORT || 3000) );

    await connectToDatabase(); // conectar a la bd (asincrono)
});

export default app;
