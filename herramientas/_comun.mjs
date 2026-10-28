// Lo que comparten todas las herramientas: rutas, ejecutar programas, ffmpeg, HyperFrames y las claves.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const HF = "hyperframes@0.8.167"; // versión fija: el mismo vídeo sale igual hoy y dentro de un año
export const WIN = process.platform === "win32";

// --ayuda en cualquier herramienta: imprime su cabecera, que dice cómo se usa, y sale. Así nadie tiene que leer el
// código para usarla.
if (process.argv.includes("--ayuda") && process.argv[1] && existsSync(process.argv[1])) {
  const cab = [];
  for (const l of readFileSync(process.argv[1], "utf8").split(/\r?\n/)) {
    if (l.startsWith("#!")) continue;
    if (!l.startsWith("//")) break;
    cab.push(l.replace(/^\/\/ ?/, ""));
  }
  console.log(cab.join("\n").trim());
  process.exit(0);
}

export const arg = (nombre, def) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : def;
};
export const tiene = (nombre) => process.argv.includes(`--${nombre}`);
const SIN_VALOR = new Set(["--borrador", "--rehacer", "--kokoro", "--forzar", "--ayuda"]);
export const posicional = (n = 0) => {
  const a = process.argv.slice(2), sueltos = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith("--")) { if (!SIN_VALOR.has(a[i])) i++; continue; }
    sueltos.push(a[i]);
  }
  return sueltos[n];
};

export const leerJson = (f, def) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : def);
export const escribirJson = (f, v) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(v, null, 2) + "\n"); };
export const r3 = (x) => Math.round(x * 1000) / 1000;
export const fallo = (msg) => { console.error(`error: ${msg}`); process.exit(1); };

// Las claves del comprador viven en .env.local, en la raíz. Nunca se piden en el chat (herramientas/clave.mjs).
export function cargarClaves() {
  const f = join(RAIZ, ".env.local");
  if (!existsSync(f)) return;
  for (const linea of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linea);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

export function programa(nombre) {
  const env = process.env[nombre.toUpperCase()];
  if (env && existsSync(env)) return env;
  const r = spawnSync(WIN ? "where" : "which", [nombre], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.split(/\r?\n/)[0].trim() : null;
}
export const ffmpeg = () => programa("ffmpeg") || fallo("falta ffmpeg (node herramientas/doctor.mjs dice cómo ponerlo)");
export const ffprobe = () => programa("ffprobe") || fallo("falta ffprobe (node herramientas/doctor.mjs dice cómo ponerlo)");

export function duracion(f) {
  return Number(execFileSync(ffprobe(), ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());
}

// HyperFrames por npx, con la versión fija. En Windows npx es un .cmd: va con shell y cada argumento entre comillas.
// La salida se guarda y no se imprime: quien llama enseña resumen(r) solo si algo falla.
export function hyperframes(args, { cwd = RAIZ } = {}) {
  const npx = WIN ? "npx.cmd" : "npx";
  const lista = ["--yes", HF, ...args];
  const r = spawnSync(npx, WIN ? lista.map((a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)) : lista, {
    cwd, encoding: "utf8", shell: WIN, maxBuffer: 1 << 28, stdio: "pipe",
  });
  return { ok: r.status === 0, salida: r.stdout || "", errores: r.stderr || "", codigo: r.status };
}

// Lo que dice HyperFrames sin el ruido (avisos de shaders de Chrome en Windows, barras de progreso, líneas vacías),
// y solo las últimas líneas: lo que hace falta para arreglar un fallo.
const RUIDO = new RegExp([
  /X4008|X4122|warning X\d{4}|^\s*$|[█▓▒░]|\[=*>?\s*\]|^\s*\d+(\.\d+)?\s*%\s*$/.source,
  /^\s*◇\s+(0 |0\/0 |disabled)|^(Runtime|Layout|Motion|Contrast|Snapshots)$|^(Report|Revision):|Browser session never ran/.source,
].join("|"));
export const resumen = (r, n = 25) => `${r.salida}\n${r.errores}`.split(/\r?\n/).filter((l) => !RUIDO.test(l)).slice(-n).join("\n");

// drawtext sin fuente explícita cuelga algunos ffmpeg de Windows: se le da una del sistema, o se escribe sin texto.
export function fuenteFF() {
  const f = [
    "C:/Windows/Fonts/arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/TTF/DejaVuSans.ttf",
  ].find((p) => existsSync(p));
  return f ? `fontfile='${f.replace(/:/g, "\\:")}':` : null;
}
export function rotulo(texto, x = 8, y = 8, tam = 18, color = "white") {
  const f = fuenteFF();
  return f ? `drawtext=${f}text='${String(texto).replace(/[:'\\%]/g, " ")}':x=${x}:y=${y}:fontsize=${tam}:fontcolor=${color}` : null;
}

export function ffm(args) {
  execFileSync(ffmpeg(), ["-v", "error", "-y", ...args], { stdio: ["ignore", "ignore", "inherit"] });
}

// Un proyecto es una carpeta en trabajo/proyectos/ con guion.json. Se acepta la ruta o solo su nombre.
export function proyecto(nombre) {
  if (!nombre) fallo("falta el proyecto: node herramientas/<x>.mjs <carpeta del proyecto>");
  const dir = existsSync(nombre) ? resolve(nombre) : join(RAIZ, "trabajo", "proyectos", nombre);
  if (!existsSync(join(dir, "guion.json"))) fallo(`no encuentro ${join(dir, "guion.json")}`);
  return { dir, guion: leerJson(join(dir, "guion.json")) };
}

// Las aperturas que hay que hacer: todas las de "aperturas", o la que se pida con --apertura. Las de "reserva" no
// se hacen hasta que el creador las pida y pasen a "aperturas".
export function aperturas(guion) {
  const todas = guion.aperturas || [];
  const una = arg("apertura");
  if (!todas.length) fallo("guion.json no tiene aperturas");
  return una ? todas.filter((a) => a.id === una) : todas;
}

// Lo que decide la voz de una apertura. voz.mjs lo guarda en voz/<id>.json; si cambia, revisar.mjs rehace la voz.
export const firmaVoz = (guion, ap) => createHash("sha1")
  .update(JSON.stringify([ap, guion.cuerpo, guion.voz, guion.pausa, guion.cola, guion.idioma])).digest("hex").slice(0, 12);

// Palabras para el subtítulo y las marcas de tiempo: se quitan signos y se pasa a minúsculas sin tildes.
export const palabras = (t) => String(t).split(/\s+/).filter(Boolean);
export const clave = (w) => String(w).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ%.,]/g, "").replace(/[.,]+$/g, "");

// Sin GPU, un vídeo con escenas 3D pesadas no cabe en los 120 s que `hyperframes check` se da a sí mismo: entonces se
// pasa por tramos (--range), que mira lo mismo y da a cada tramo su propio plazo.
export function comprobar(out, dur) {
  const r = hyperframes(["check"], { cwd: out });
  if (r.ok || !/within its deadline/.test(r.salida + r.errores)) return r;
  console.log("  el check no cabe en su plazo de una vez (sin GPU): lo paso por tramos de 5 s");
  for (let a = 0; a < dur; a += 5) {
    const t = hyperframes(["check", "--range", `${r3(a)},${r3(Math.min(dur, a + 5))}`], { cwd: out });
    if (!t.ok) return t;
  }
  return { ok: true, salida: "", errores: "" };
}
