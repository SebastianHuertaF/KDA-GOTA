// Capa de acceso al backend KDA. Traduce la forma de datos del API
// (Prisma/SQLite) a la que espera el mapa (app.js) y viceversa.
(function () {
	const API_BASE = (window.KDA_CONFIG && window.KDA_CONFIG.API_BASE) || "";

	// El backend maneja 3 estados; el mapa usa etiquetas más descriptivas.
	const ESTADO_BACKEND_A_FRONT = {
		"ACTIVO": "operativo",
		"MANTENIMIENTO": "revision",
		"FUERA DE SERVICIO": "fuera_servicio"
	};

	// Convierte un bebedero del API al punto que dibuja el mapa.
	function mapearBebedero(b) {
		const nombre = (b.pabellon && b.pabellon.nombre) || `Bebedero #${b.id}`;
		return {
			id: b.id, // id numérico real del backend (se usa al reportar)
			title: `Bebedero - ${nombre}`,
			codigo: b.codigo || "",
			lat: b.latitud,
			lng: b.longitud,
			tipo: "Bebederos",
			estado: ESTADO_BACKEND_A_FRONT[b.estado] || "operativo",
			ubicacion: nombre,
			ultimoReporte: b.updatedAt ? String(b.updatedAt).slice(0, 10) : "—",
			reportes: Array.isArray(b.reportes) ? b.reportes.length : 0
		};
	}

	async function getBebederos() {
		const res = await fetch(`${API_BASE}/api/v1/bebederos`);
		if (!res.ok) throw new Error(`API bebederos respondió ${res.status}`);
		const json = await res.json();
		return (json.data || []).map(mapearBebedero);
	}

	// Crea un reporte real en el backend.
	// { bebedero_id, tipoProblema, descripcion, correo }
	async function crearReporte({ bebedero_id, tipoProblema, descripcion, correo }) {
		const body = {
			tipo: "PENDIENTE",
			estado: tipoProblema,                 // Reporte.estado guarda el tipo de problema
			fecha_revision: new Date().toISOString(),
			observacion: descripcion,
			correo_reporte: correo || null,
			bebedero_id: Number(bebedero_id)
		};
		const res = await fetch(`${API_BASE}/api/v1/reportes`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});
		const json = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(json.error || `API reportes respondió ${res.status}`);
		return json.data;
	}

	window.KDA_API = { API_BASE, getBebederos, crearReporte };
})();
