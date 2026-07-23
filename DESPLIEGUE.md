# Despliegue de KDA GOTA (demo gratuita)

Guía para levantar la app **en local** y para **desplegar una demo sin costo**.

## Arquitectura elegida (y por qué)

El backend (Express) sirve **la API y el frontend estático desde el mismo origen**.
Esto se decidió pensando primero en el despliegue gratuito:

- **Un solo servicio, una sola URL, cero CORS.** El plan gratuito de Render (u otros)
  te da un web service. Si separaras front y back tendrías dos despliegues y CORS que
  configurar. Sirviendo el front desde Express, todo vive en `https://tu-app.onrender.com`.
- **Base de datos SQLite efímera → se siembra en cada arranque.** En los planes free el
  disco se borra al reiniciar/dormir. Por eso `start:prod` corre `migrate deploy` + `seed`
  **en cada boot**, y la demo siempre aparece con los 12 bebederos. El seed es idempotente
  (si ya hay datos, no duplica).
- **Prisma 7 genera cliente TypeScript.** Se ejecuta con `node --experimental-strip-types`
  (Node ≥ 22.6), por eso el `engines` y el `.node-version` fijan Node 22.

### Cómo se conectan front y back

- Los **bebederos** del mapa vienen EN VIVO de `GET /api/v1/bebederos`
  ([api.js](KDA_front/api.js) traduce la forma del backend a la del mapa).
- Las **demás categorías** (cafeterías, wifi, etc.) siguen desde `data/puntos.json`.
- El **formulario de reporte** ([reporte.html](KDA_front/reporte.html)) hace un
  `POST /api/v1/reportes` real con el `id` del bebedero.
- Si el backend está caído, el mapa **sigue funcionando** con las capas estáticas.

### Panel de administración y autenticación

`/admin.html` es la vista de monitoreo del personal de mantenimiento: contadores,
bebederos más reportados, filtros y cambio de estado de cada reporte.

**La API dejó de ser abierta.** Antes cualquiera podía listar usuarios o borrar
reportes con un `curl`; ahora [auth.middleware.js](KDA_back/src/middlewares/auth.middleware.js)
verifica el JWT que ya emitía el login. Reparto actual:

| Público (sin token) | Protegido (Bearer) |
|---|---|
| `GET /api/v1/bebederos` (el mapa) | Todo `/api/v1/users` y `/api/v1/controles` |
| `POST /api/v1/reportes` (el formulario del QR) | `GET/PUT/DELETE /api/v1/reportes` |
| `GET /api/v1/codigos` y el SVG (imprimir etiquetas) | `GET /api/v1/bebederos/:id` (incluye reportes) |
| `GET /q/:codigo` (el escaneo) | Escrituras de bebederos y códigos QR |

Los reportes traen `correo_reporte`, por eso leerlos exige token aunque crearlos no.

**El registro público está cerrado**: `POST /auth/sign-up` ahora exige token, así que
solo una cuenta existente puede crear otra. La primera la siembra el seed a partir de
`ADMIN_EMAIL` / `ADMIN_PASSWORD`. Si no defines `ADMIN_PASSWORD` el seed no crea nada
y no podrás entrar al panel — es a propósito: una contraseña por defecto sería una
puerta trasera conocida en cada copia del proyecto. En Render va con `sync: false`
para que la pidas al desplegar y no quede escrita en el repo.

### Códigos QR de los bebederos

Cada bebedero tiene una etiqueta QR pegada encima. El QR **no** contiene el id
directo, sino un código opaco que el backend resuelve:

```
QR → https://tu-app/q/F10F54D0 → 302 → /reporte.html?id=1&bebedero=…&estado=…
```

Esa indirección permite **revocar** una etiqueta concreta (`CodigoQR.activo = false`,
que manda a `qr-invalido.html`) sin reimprimir las demás, y resuelve el estado del
bebedero en cada escaneo en vez de dejarlo congelado en el papel.

- **Los códigos son deterministas**: se derivan de `sha256(QR_SALT + bebedero_id)`
  en [codigo-qr.js](KDA_back/src/utils/codigo-qr.js). Es imprescindible aquí: el seed
  corre en **cada arranque** (ver abajo), y con códigos aleatorios cada reinicio de
  Render invalidaría todas las etiquetas ya pegadas en el campus.
- **`QR_SALT` debe ser fijo para siempre.** Si cambia, todos los QR impresos mueren.
  Por eso en `render.yaml` va como `value:` y nunca como `generateValue: true`.
- **`APP_URL` debe ser la URL pública absoluta.** Es lo que se codifica dentro del QR;
  `localhost` no existe para el celular que escanea. Para probar con el móvil en local,
  ponle la IP LAN de tu PC (ej. `http://192.168.1.10:3000`).

Para imprimirlas: abre **`/etiquetas.html`** → botón *Imprimir* → salen 12 por hoja A4
en papel adhesivo, con el nombre del pabellón en cada una para saber dónde va pegada.
El SVG de una etiqueta suelta está en `GET /api/v1/codigos/:codigo/imagen.svg`.

> Ojo con el plan free: quien escanee el sticker en el campus se come el cold start
> de ~30–50 s si el servicio estaba dormido. Es el argumento más fuerte para mover el
> backend a algo que no duerma si el QR pasa a uso real.

---

## Correr en local

```bash
cd KDA_back
cp .env.example .env.development.local   # ajusta JWT_SECRET si quieres
npm run setup                            # install + prisma generate + migrate + seed
npm run dev                              # levanta en http://localhost:3000
```

Abre **http://localhost:3000** → ahí se sirve el mapa y consume la API.

> Si prefieres abrir el front con Live Server (`:5500`), funciona igual: `config.js`
> detecta el puerto y apunta al backend en `http://localhost:3000` (con CORS habilitado).

---

## Desplegar la demo en Render (gratis)

1. Sube el repo a GitHub.
2. En [Render](https://render.com) → **New +** → **Blueprint**, selecciona el repo.
   Render lee [`render.yaml`](render.yaml) y crea el servicio automáticamente.
   - *(Alternativa manual:* New → Web Service → Root Directory `KDA_back`,
     Build `npm install && npx prisma generate`, Start `npm run start:prod`.*)*
3. Espera el deploy. Tu demo queda en `https://kda-gota.onrender.com` (o el nombre que asignes).

**Ten en cuenta (plan free):**
- El servicio **duerme tras ~15 min** de inactividad → el primer request tras dormir
  tarda ~30–50 s (cold start).
- Los datos escritos durante la demo (nuevos reportes) **se pierden** al dormir, porque
  la BD se re-siembra en cada arranque. Es lo esperado para una demo sin costo.

### Otras plataformas gratis
- **Fly.io**: soporta un *volume* persistente para que SQLite no se borre (requiere Docker
  y tarjeta, sin cobro dentro del free allowance).
- **Railway**: similar, con créditos gratuitos limitados.

---

## Alternativa: front y back separados

Si algún día quieres el front siempre encendido (sin cold start):

- **Front** en Netlify/Vercel (estático, gratis, siempre activo). En `KDA_front/config.js`
  fija `API_BASE` a la URL pública del backend.
- **Back** en Render. El `cors()` ya está habilitado, así que aceptará las peticiones.

Es más rápido para el usuario pero implica **dos despliegues y dos URLs**. Para una demo
puntual, el servicio único de arriba es más simple.
