#!/usr/bin/env node
// medir.mjs <video> [--escenas 0,3.2,6.8]
//
// Mide lo que el ojo suele dar por bueno sin serlo, en la zona donde se dibuja (de y 540 a 1450):
//   movimiento   cuánto cambia la imagen cada décima de segundo; los tramos quietos de más de 1 s son un fallo
//   ocupación    qué parte de la zona está llena de cosas y no de fondo, en el centro de cada escena y en el
//                fotograma 0; por debajo del mínimo, es una diapositiva y no una escena
//   tirones      instantes en que la cámara o lo que se mueve cambia de velocidad de golpe (fuera de los cortes)
// La vara es la referencia de este vídeo, medida igual: el nuestro tiene que moverse y llenar la pantalla al menos como
// ella. Sin referencia, unos mínimos técnicos por debajo de los cuales cualquier vídeo está quieto o vacío.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { arg, duracion, fallo, ffmpeg, ffprobe, posicional, r3 } from "./_comun.mjs";

// Por debajo de umbral_quieto de cambio medio entre fotogramas, la imagen está casi quieta (técnico, no de gusto). El
// resto, solo para cuando no hay referencia.
export const MINIMOS = { umbral_quieto: 0.6, quieto_max_s: 1.5, pct_quieto_max: 20, ocupacion_hook: 0.45, ocupacion_media: 0.35, ocupacion_escena: 0.25 };

// Lo que mide la vara en un vídeo cualquiera: movimiento y ocupación (fotograma 0 y diez puntos repartidos).
export function perfil(video, dur) {
  const m = movimiento(video);
  const ts = Array.from({ length: 10 }, (_, i) => r3(((i + 0.5) * dur) / 10));
  const occ = ts.map((t) => ocupacion(video, t)).filter((x) => x !== null);
  const orden = [...occ].sort((a, b) => a - b);
  return { pct_quieto: m.pct_quieto, quieto_max_s: Math.max(0, ...m.quietos.map(([a, b]) => b - a)), hook: ocupacion(video, 0),
    ocupacion_media: r3(occ.reduce((a, x) => a + x, 0) / Math.max(1, occ.length)), ocupacion_baja: orden[Math.floor(orden.length * 0.1)] ?? 0 };
}

// Los mínimos para este vídeo: los de su referencia, un poco por debajo, para no exigir una copia exacta.
export function vara(ref) {
  if (!ref) return { ...MINIMOS, de: "los mínimos" };
  return {
    umbral_quieto: MINIMOS.umbral_quieto,
    pct_quieto_max: Math.max(10, ref.pct_quieto + 5),
    quieto_max_s: Math.max(1.5, ref.quieto_max_s + 0.5),
    ocupacion_hook: r3(ref.hook * 0.85),
    ocupacion_media: r3(ref.ocupacion_media * 0.85),
    ocupacion_escena: r3(ref.ocupacion_baja * 0.85),
    de: "la referencia",
  };
}

// El perfil de la referencia del proyecto (guion.json: "referencia" para copiarla entera, "estilo" para copiar su
// estilo). Se mide una vez y se guarda al lado, en <archivo>.perfil.json.
export function referenciaDe(dir, guion) {
  const r = guion.referencia || guion.estilo;
  if (!r) return null;
  const f = resolve(dir, r);
  if (!existsSync(f)) fallo(`no encuentro la referencia ${f}`);
  const cache = f + ".perfil.json", sello = statSync(f).mtimeMs;
  if (existsSync(cache)) { const c = JSON.parse(readFileSync(cache, "utf8")); if (c.sello === sello) return c.perfil; }
  const perfilRef = perfil(f, duracion(f));
  writeFileSync(cache, JSON.stringify({ sello, perfil: perfilRef }, null, 2));
  return perfilRef;
}

// Juicio de un vídeo: devuelve los fallos, uno por línea, con su segundo. Vacío = pasa.
// ref: el perfil de la referencia (perfil()), o null.
export function juzgar(video, escenas, ref = null) {
  const V = vara(ref);
  const m = movimiento(video, V), fallos = [];
  if (m.pct_quieto > V.pct_quieto_max) fallos.push(`quieto el ${m.pct_quieto} % del tiempo (máximo ${V.pct_quieto_max} %, según ${V.de})`);
  for (const [a, b] of m.quietos) fallos.push(`casi quieto de ${a} a ${b} s`);
  const hook = ocupacion(video, 0);
  if (hook !== null && hook < V.ocupacion_hook) fallos.push(`fotograma 0 lleno al ${Math.round(hook * 100)} % (mínimo ${Math.round(V.ocupacion_hook * 100)} %, según ${V.de}): no para a nadie`);
  const occ = escenas.map((s) => ({ ...s, occ: ocupacion(video, s.medio) }));
  for (const s of occ) if (s.occ !== null && s.occ < V.ocupacion_escena) fallos.push(`escena ${s.escena} (${s.medio} s) llena al ${Math.round(s.occ * 100)} %: casi vacía`);
  const media = occ.length ? occ.reduce((a, s) => a + (s.occ || 0), 0) / occ.length : 1;
  if (media < V.ocupacion_media) fallos.push(`ocupación media ${Math.round(media * 100)} % (mínimo ${Math.round(V.ocupacion_media * 100)} %, según ${V.de})`);
  return { vara: V, movimiento: m, hook, escenas: occ, fallos };
}

const W = 108, H = 91, FPS = 10;

function gris(video, filtros) {
  const r = spawnSync(ffmpeg(), ["-v", "error", "-i", video, "-vf", `${filtros},crop=1080:910:0:540,scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
  return r.stdout;
}

export function movimiento(video, V = MINIMOS) {
  const b = gris(video, `fps=${FPS}`);
  const n = Math.floor(b.length / (W * H)), d = [];
  for (let i = 1; i < n; i++) {
    let s = 0;
    for (let k = 0; k < W * H; k++) s += Math.abs(b[i * W * H + k] - b[(i - 1) * W * H + k]);
    d.push(s / (W * H));
  }
  const quietos = [];
  let desde = null;
  d.forEach((x, i) => {
    if (x < V.umbral_quieto) { if (desde === null) desde = i; }
    else { if (desde !== null && (i - desde) / FPS > V.quieto_max_s) quietos.push([r3(desde / FPS), r3(i / FPS)]); desde = null; }
  });
  if (desde !== null && (d.length - desde) / FPS > V.quieto_max_s) quietos.push([r3(desde / FPS), r3(d.length / FPS)]);
  const media = d.reduce((a, x) => a + x, 0) / Math.max(1, d.length);
  return { media: r3(media), pct_quieto: Math.round((100 * d.filter((x) => x < V.umbral_quieto).length) / Math.max(1, d.length)), quietos };
}

// Ocupación de un fotograma: el fondo es el gris más repetido; lleno es lo que se separa de él.
export function ocupacion(video, t) {
  const b = gris(video, `select='gte(t\\,${t})',trim=end_frame=1`);
  if (!b || b.length < W * H) return null;
  const hist = new Array(256).fill(0);
  for (let k = 0; k < W * H; k++) hist[b[k]]++;
  const fondo = hist.indexOf(Math.max(...hist));
  let llenos = 0;
  for (let k = 0; k < W * H; k++) if (Math.abs(b[k] - fondo) > 14) llenos++;
  return r3(llenos / (W * H));
}

// Los cortes entre escenas, fotograma a fotograma (30 por segundo, de 0,2 s antes a 0,6 s después de cada uno):
// un fogonazo o un apagón de uno o dos fotogramas, o la zona de dibujo vacía en mitad del cambio. Tres fotogramas por
// corte en una hoja no los ven; esto sí. Son avisos con su segundo, para mirarlos con revisar.mjs --en.
export function cortes(video, instantes) {
  const avisos = [], P = W * H, F = 30;
  for (const T of instantes) {
    const desde = Math.max(0, T - 0.2);
    const r = spawnSync(ffmpeg(), ["-v", "error", "-ss", String(desde), "-t", "0.8", "-i", video, "-vf", `fps=${F},crop=1080:910:0:540,scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 28 });
    const b = r.stdout, n = b ? Math.floor(b.length / P) : 0;
    if (n < 6) continue;
    const luz = [], dispersion = [];
    for (let i = 0; i < n; i++) {
      let s = 0, s2 = 0;
      for (let k = 0; k < P; k++) { const v = b[i * P + k]; s += v; s2 += v * v; }
      luz.push(s / P);
      dispersion.push(Math.sqrt(Math.max(0, s2 / P - (s / P) ** 2)));
    }
    const seg = (i) => r3(desde + i / F);
    // Fogonazo o apagón: de uno a tres fotogramas más claros (o más oscuros) que lo de antes y lo de después, en más
    // de 25. Un cambio de una escena clara a una oscura no lo es: pasa por en medio, no por encima de las dos.
    let visto = false;
    for (let i = 1; i < n - 1 && !visto; i++) {
      for (const ancho of [1, 2, 3]) {
        if (i + ancho >= n) continue;
        const antes = luz[i - 1], despues = luz[i + ancho], tramo = luz.slice(i, i + ancho);
        const claro = tramo.every((x) => x > Math.max(antes, despues) + 25), oscuro = tramo.every((x) => x < Math.min(antes, despues) - 25);
        if (claro || oscuro) {
          avisos.push(`corte de ${T} s: ${claro ? "fogonazo" : "apagón"} en ${seg(i)} s`);
          visto = true;
          break;
        }
      }
    }
    // La zona de dibujo vacía (un color liso) en mitad del cambio, con cosas antes y después.
    const plano = dispersion.findIndex((d, i) => i > 0 && i < n - 1 && d < 4);
    if (!visto && plano >= 0 && dispersion[0] > 12 && dispersion[n - 1] > 12) avisos.push(`corte de ${T} s: fotograma vacío en ${seg(plano)} s`);
  }
  return avisos;
}

// Tirones: cuánto se desplaza la imagen entera de un fotograma al siguiente (correlación de fase sobre una copia de
// 64 × 128), y los instantes en que esa velocidad cambia de golpe: una cámara que frena en seco, algo que arranca sin
// acelerar, una mirada que salta. Fuera de los cortes (cambios de imagen enteros) y solo donde la medida es fiable (un
// zoom o un giro fuertes la confunden: esos no se cuentan). Son avisos con su segundo, para mirarlos en tirones.jpg.
function fft(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = ((inv ? 2 : -2) * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) for (let k = 0, cr = 1, ci = 0; k < len / 2; k++) {
      const p = i + k, q = p + len / 2, tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr;
      re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
      const t2 = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t2;
    }
  }
}
function fft2(re, im, w, h, inv) {
  const fr = new Float64Array(w), fi = new Float64Array(w), cr = new Float64Array(h), ci = new Float64Array(h);
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) { fr[x] = re[y * w + x]; fi[x] = im[y * w + x]; } fft(fr, fi, inv); for (let x = 0; x < w; x++) { re[y * w + x] = fr[x]; im[y * w + x] = fi[x]; } }
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) { cr[y] = re[y * w + x]; ci[y] = im[y * w + x]; } fft(cr, ci, inv); for (let y = 0; y < h; y++) { re[y * w + x] = cr[y]; im[y * w + x] = ci[y]; } }
}
export function tirones(video, cortesT = []) {
  const w = 64, h = 128, P = w * h;
  const fps = Number(eval(spawnSync(ffprobe(), ["-v", "error", "-select_streams", "v", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", video], { encoding: "utf8" }).stdout.trim()));
  // Solo la zona de dibujo, sin las franjas de los subtítulos (arriba y abajo): un subtítulo que cambia no es un tirón.
  const b = spawnSync(ffmpeg(), ["-v", "error", "-i", video, "-vf", `crop=1080:760:0:540,scale=${w}:${h},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 }).stdout;
  const n = Math.floor(b.length / P), han = new Float64Array(P);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) han[y * w + x] = (0.5 - 0.5 * Math.cos((2 * Math.PI * x) / (w - 1))) * (0.5 - 0.5 * Math.cos((2 * Math.PI * y) / (h - 1)));
  const espectro = (i) => { const re = new Float64Array(P), im = new Float64Array(P); for (let k = 0; k < P; k++) re[k] = b[i * P + k] * han[k]; fft2(re, im, w, h, false); return [re, im]; };
  const vel = [], cambio = [];
  let ant = espectro(0);
  for (let i = 1; i < n; i++) {
    const act = espectro(i), re = new Float64Array(P), im = new Float64Array(P);
    let d = 0; for (let k = 0; k < P; k++) d += Math.abs(b[i * P + k] - b[(i - 1) * P + k]);
    cambio.push(d / P);
    for (let k = 0; k < P; k++) { const r = act[0][k] * ant[0][k] + act[1][k] * ant[1][k], q = act[1][k] * ant[0][k] - act[0][k] * ant[1][k], m = Math.hypot(r, q) + 1e-9; re[k] = r / m; im[k] = q / m; }
    fft2(re, im, w, h, true);
    let pico = -1, pk = 0; for (let k = 0; k < P; k++) if (re[k] > pico) { pico = re[k]; pk = k; }
    let dx = pk % w, dy = Math.floor(pk / w); if (dx > w / 2) dx -= w; if (dy > h / 2) dy -= h;
    vel.push({ x: (dx * 1080) / w, y: (dy * 760) / h, fiable: pico / P > 0.12 && d / P > 0.3 });
    ant = act;
  }
  const t = (i) => r3((i + 1) / fps), cerca = (s) => cortesT.some((c) => Math.abs(s - c) < 0.08);
  const malos = [];
  for (let i = 1; i < vel.length; i++) {
    const a = Math.hypot(vel[i].x - vel[i - 1].x, vel[i].y - vel[i - 1].y) * fps * fps;
    if (a > 40000 && vel[i].fiable && vel[i - 1].fiable && cambio[i] < 25 && cambio[i - 1] < 25 && !cerca(t(i))) malos.push(t(i));
  }
  return malos.filter((s, i) => i === 0 || s - malos[i - 1] > 0.15);
}

if (process.argv[1] && process.argv[1].endsWith("medir.mjs")) {
  const v = posicional();
  const esc = (arg("escenas", "") || "").split(",").filter(Boolean).map(Number);
  const m = movimiento(v);
  const occ = [0, ...esc].map((t) => [t, ocupacion(v, t)]);
  console.log(JSON.stringify({ ...m, ocupacion: occ }, null, 1));
}
