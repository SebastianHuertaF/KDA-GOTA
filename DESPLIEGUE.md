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
