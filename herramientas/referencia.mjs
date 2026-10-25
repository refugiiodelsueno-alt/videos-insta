#!/usr/bin/env node
// referencia.mjs <reel.mp4 o enlace> --proyecto <proyecto> [--idioma es]
//
// Mide un reel que el creador quiere recrear y deja en <proyecto>/referencia/:
//   reel.mp4            el reel (un enlace se baja con yt-dlp, que se instala con pip si falta)
//   referencia.json     duración, tamaño, cortes, frases con su segundo y su número de palabras, sonido en los silencios
//   hoja-hook.jpg       los 4 primeros segundos, cada 0,4 s
//   hoja.jpg            un fotograma cada 2 s
// Con eso el agente escribe referencia.md: una fila por plano (segundos, qué llena el plano y cuánto, qué se mueve,
// dónde va el texto y su tamaño, qué se dice, qué suena). Un corte se mira siempre en la hoja: una cámara que sigue
// a algo puede parecer un corte.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { arg, duracion, escribirJson, fallo, ffm, ffmpeg, ffprobe, fuenteFF, hyperframes, posicional, proyecto, r3 } from "./_comun.mjs";

const fuente = posicional();
if (!fuente) fallo("uso: node herramientas/referencia.mjs <reel.mp4 o enlace> --proyecto <proyecto>");
const { dir } = proyecto(arg("proyecto"));
const idioma = arg("idioma", "es");
const ref = join(dir, "referencia");
mkdirSync(ref, { recursive: true });
const reel = join(ref, "reel.mp4");

if (/^https?:\/\//.test(fuente)) {
  const py = process.platform === "win32" ? "python" : "python3";
  let yt = spawnSync(py, ["-m", "yt_dlp", "--version"], { encoding: "utf8" });
  if (yt.status !== 0) spawnSync(py, ["-m", "pip", "install", "--user", "yt-dlp"], { stdio: "inherit" });
  yt = spawnSync(py, ["-m", "yt_dlp", "-f", "bv*+ba/b", "--merge-output-format", "mp4", "-o", reel, fuente], { stdio: "inherit" });
  if (yt.status !== 0 || !existsSync(reel)) fallo("no pude bajar el reel; pide el archivo al creador");
} else {
  if (!existsSync(fuente)) fallo(`no encuentro ${fuente}`);
  ffm(["-i", fuente, "-c", "copy", reel]);
}

const info = JSON.parse(execFileSync(ffprobe(), ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "json", reel]).toString()).streams[0];
const dur = duracion(reel);

// Cortes: cambios bruscos de imagen.
const sc = spawnSync(ffmpeg(), ["-i", reel, "-vf", "select='gt(scene,0.35)',showinfo", "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 26 });
const cortes = [...(sc.stderr || "").matchAll(/pts_time:([\d.]+)/g)].map((m) => r3(Number(m[1])));

// Palabras con su segundo.
const tmp = join(ref, ".tr");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const tr = hyperframes(["transcribe", reel, "--language", idioma, "--dir", tmp, "--json"], { cwd: ref, json: true });
const f = join(tmp, "transcript.json");
const palabras = tr.ok && existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : [];
rmSync(tmp, { recursive: true, force: true });
if (!palabras.length) console.log("aviso: no se pudo transcribir el reel; sus frases quedan sin medir");

// Frases: se corta en un signo de final o en una pausa de más de 0,35 s.
const frases = [];
let cur = null;
for (const w of palabras) {
  if (cur && w.start - cur.fin > 0.35) { frases.push(cur); cur = null; }
  if (!cur) cur = { inicio: r3(w.start), fin: 0, texto: "" };
  cur.texto += (cur.texto ? " " : "") + String(w.text).trim();
  cur.fin = r3(w.end);
  if (/[.?!]$/.test(String(w.text).trim())) { frases.push(cur); cur = null; }
}
if (cur) frases.push(cur);
frases.forEach((x) => { x.palabras = x.texto.split(/\s+/).length; });

// Sonido en los silencios de la voz: lo que suena además de ella.
const huecos = [];
let prev = 0;
for (const x of frases) { if (x.inicio - prev > 0.4) huecos.push([prev + 0.05, x.inicio - 0.05]); prev = x.fin; }
if (dur - prev > 0.4) huecos.push([prev + 0.05, dur]);
const sonido = huecos.map(([a, b]) => {
  const r = spawnSync(ffmpeg(), ["-ss", String(a), "-t", String(b - a), "-i", reel, "-vn", "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
  const media = Number((/mean_volume: (-?[\d.]+)/.exec(r.stderr) || [])[1]);
  const pico = Number((/max_volume: (-?[\d.]+)/.exec(r.stderr) || [])[1]);
  return { desde: r3(a), hasta: r3(b), media_db: media, pico_db: pico, suena: media > -45 ? "algo" : "silencio" };
});

// Hojas para mirar.
const hojaDe = (desde, hasta, cada, salida) => ffm(["-ss", String(desde), "-t", String(hasta - desde), "-i", reel, "-vf",
  `fps=1/${cada},scale=220:-1,${fuenteFF() ? `drawtext=${fuenteFF()}text='%{pts\\:hms}':x=4:y=4:fontsize=16:fontcolor=yellow:box=1:boxcolor=black@0.6,` : ""}tile=8x${Math.ceil((hasta - desde) / cada / 8)}`,
  "-frames:v", "1", salida]);
hojaDe(0, Math.min(4, dur), 0.4, join(ref, "hoja-hook.jpg"));
hojaDe(0, dur, 2, join(ref, "hoja.jpg"));

// Su paleta: los colores que más pantalla ocupan, en 16 fotogramas repartidos, con su parte del total.
const PW = 60, PH = 107, cuenta = new Map();
for (let i = 0; i < 16; i++) {
  const r = spawnSync(ffmpeg(), ["-v", "error", "-ss", String(((i + 0.5) * dur) / 16), "-i", reel, "-frames:v", "1", "-vf", `scale=${PW}:${PH}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 24 });
  const b = r.stdout || Buffer.alloc(0);
  for (let k = 0; k + 2 < b.length; k += 3) {
    const key = ((b[k] >> 4) << 8) | ((b[k + 1] >> 4) << 4) | (b[k + 2] >> 4);
    cuenta.set(key, (cuenta.get(key) || 0) + 1);
  }
}
const todos = [...cuenta.values()].reduce((a, x) => a + x, 0) || 1;
const hex = (k) => "#" + [(k >> 8) & 15, (k >> 4) & 15, k & 15].map((v) => (v * 16 + 8).toString(16).padStart(2, "0")).join("");
const paleta = [];
for (const [k, n] of [...cuenta.entries()].sort((a, b) => b[1] - a[1])) {
  const c = hex(k), rgb = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  if (paleta.some((p) => Math.hypot(...p.rgb.map((v, i) => v - rgb[i])) < 48)) continue;
  paleta.push({ color: c, rgb, parte: r3(n / todos) });
  if (paleta.length === 8) break;
}

// Sus acentos: los colores vivos (saturados y no oscuros) más repetidos, aunque ocupen poca pantalla.
const acentos = [];
for (const [k, n] of [...cuenta.entries()].sort((a, b) => b[1] - a[1])) {
  const c = hex(k), rgb = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mx = Math.max(...rgb), mn = Math.min(...rgb);
  if (mx < 90 || (mx - mn) / mx < 0.45) continue;
  if (acentos.some((p) => Math.hypot(...p.rgb.map((v, i) => v - rgb[i])) < 60)) continue;
  acentos.push({ color: c, rgb, parte: r3(n / todos) });
  if (acentos.length === 5) break;
}

const total = palabras.length;
const voz = frases.length ? r3(frases[frases.length - 1].fin - frases[0].inicio) : 0;
escribirJson(join(ref, "referencia.json"), {
  archivo: "referencia/reel.mp4", duracion: r3(dur), ancho: info.width, alto: info.height, fps: info.r_frame_rate,
  cortes, cortes_por_minuto: r3((cortes.length / dur) * 60), palabras: total, palabras_por_segundo: voz ? r3(total / voz) : null,
  paleta: paleta.map(({ color, parte }) => ({ color, parte })), acentos: acentos.map(({ color, parte }) => ({ color, parte })), frases, sonido,
});
console.log(`${join(ref, "referencia.json")}: ${r3(dur)} s, ${cortes.length} cortes, ${frases.length} frases, ${total} palabras`);
console.log(`Mira ${join(ref, "hoja-hook.jpg")} y ${join(ref, "hoja.jpg")} y escribe referencia.md.`);
