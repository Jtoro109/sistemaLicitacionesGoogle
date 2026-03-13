const { execSync } = require("child_process");
const path = require("path");

// 1. Definimos las rutas de tus proyectos según tu imagen
const carpetasBackend = ["Backend/Automatizaciones", "Backend/Funciones"];

const carpetasFrontend = [
  "Frontend/portalLicitaciones",
  "Frontend/portalProponentes",
];

// Función para ejecutar comandos de consola en una carpeta específica
function ejecutarComando(comando, carpeta) {
  console.log(`\n================================================`);
  console.log(`⚙️ Ejecutando: "${comando}" en /${carpeta}`);
  console.log(`================================================\n`);
  try {
    // Usamos npx clasp para asegurarnos de que use la versión de tu proyecto
    execSync(`npx ${comando}`, {
      cwd: path.join(__dirname, carpeta),
      stdio: "inherit", // Esto muestra los colores y el progreso real en la consola
    });
  } catch (error) {
    console.error(`\n❌ Error en la carpeta ${carpeta}. Proceso detenido.`);
    process.exit(1);
  }
}

console.log("🚀 Iniciando la subida y despliegue masivo para TENCO...\n");

// 2. Pushear el Backend (Solo sube el código, no implementa)
console.log("📦 PASO 1: Subiendo código del Backend...");
carpetasBackend.forEach((carpeta) => {
  ejecutarComando("clasp push -f", carpeta); // Usamos -f (force) por si hay discrepancias menores
});

// 3. Pushear y Desplegar el Frontend
console.log("\n🌐 PASO 2: Subiendo e implementando el Frontend...");
carpetasFrontend.forEach((carpeta) => {
  ejecutarComando("clasp push -f", carpeta);

  // Obtenemos la fecha actual para la descripción de la implementación
  const fecha = new Date().toLocaleString("es-CO");
  ejecutarComando(
    `clasp deploy -d "Despliegue automático - ${fecha}"`,
    carpeta,
  );
});

console.log(
  "\n✅ ¡Éxito! Todos los proyectos se han subido y el frontend está implementado.",
);
