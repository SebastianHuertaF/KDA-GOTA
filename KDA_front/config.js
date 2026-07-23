// Configuración de la conexión con el backend.
//
// - Si el frontend lo sirve Express (mismo origen, ej. en despliegue), usamos
//   rutas relativas ("") y no hay CORS de por medio.
// - Si abres el archivo directo (file://) o lo sirves con Live Server (:5500/:5501),
//   apuntamos al backend local en http://localhost:3000.
//
// Para producción con front y back separados, cambia API_BASE por la URL pública
// del backend (ej. "https://mi-api.onrender.com").
window.KDA_CONFIG = {
	API_BASE: (function () {
		const esArchivo = location.protocol === "file:";
		const puertosEstaticos = ["5500", "5501"]; // Live Server u similares
		if (esArchivo || puertosEstaticos.includes(location.port)) {
			return "http://localhost:3000";
		}
		return ""; // mismo origen
	})()
};
