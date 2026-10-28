// El mundo del pan duro, todo en 2D, en un svg con la cámara dentro (un transform del grupo), por estaciones:
//   y = 1000   la media hogaza en su tabla (gancho, «seca y dura» y cierre: el último fotograma es el primero)
//   y = 4000   la hogaza en la báscula: pasan los días, se endurece y pesa lo mismo; luego, dentro de la bolsa
//   y = 7000   la miga enorme: los agujeros y, en una pared, los granitos de almidón
//   y = 10000  el horno: los granitos se abren y se empapan de agua
//   y = 13000  las cadenas del almidón que se juntan en cristales con el agua presa
//   y = 16000  encimera, nevera y congelador, uno al lado del otro
//   y = 19000  la rebanada sobre la resistencia
//   y = 22000  las mismas cadenas: el calor las suelta y, al enfriarse, se vuelven a juntar
const K = window.K;
const NS = "http://www.w3.org/2000/svg";
const PI = Math.PI;

export const ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", CIAN = "#5fd4ff";
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 45.9;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);
const fr = (v) => v - Math.floor(v);
const mezcla = (a, b, t) => a + (b - a) * t;

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, bolsa: 2.18, miga: 7.4, horno: 11.4, cristales: 16.59, nevera: 27.38, tostar: 35.0, cierre: 42.44 };

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
const GA = 1000, BO = 4000, MI = 7000, HO = 10000, CR = 13000, NE = 16000, TO = 19000, TR = 22000;

// ── la cámara: el punto (x, y) del mundo queda en (540, 1000) con zoom z ───────────────────────────────────────
export const F0 = { x: 540, y: GA + 70, z: 1.05 };
export function camara(s, claves) {
  const n = claves.length, Tt = claves.map((c) => c[0]);
  if (s <= Tt[0]) return { ...claves[0][1] };
  if (s >= Tt[n - 1]) return { ...claves[n - 1][1] };
  let i = 1;
  while (s > Tt[i]) i++;
  const r = {};
  for (const key of ["x", "y", "z"]) {
    const v = claves.map((c) => (key === "z" ? Math.log(c[1].z) : c[1][key]));
    const d = (j) => (v[j + 1] - v[j]) / (Tt[j + 1] - Tt[j]);
    const m = (j) => {
      if (j <= 0 || j >= n - 1) return 0;
      const a = d(j - 1), b = d(j), h0 = Tt[j] - Tt[j - 1], h1 = Tt[j + 1] - Tt[j];
      if (a * b <= 0) return 0;
      return 3 * (h0 + h1) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b);
    };
    const h = Tt[i] - Tt[i - 1], u = (s - Tt[i - 1]) / h, u2 = u * u, u3 = u2 * u;
    const val = (2 * u3 - 3 * u2 + 1) * v[i - 1] + (u3 - 2 * u2 + u) * h * m(i - 1) + (-2 * u3 + 3 * u2) * v[i] + (u3 - u2) * h * m(i);
    r[key] = key === "z" ? Math.exp(val) : val;
  }
  return r;
}
const Z = (x, z, y) => ({ x, y, z });
// la pared de la miga donde entra la cámara (en el mundo)
const FOCO = { x: 540 + 60 * 2.3, y: MI + 500 - 190 * 2.3 };
// un camino por tramo; entre tramos, corte
const CAMINOS = [
  [0, [[0, F0], [0.9, Z(540, 1.08, GA + 66)], [1.35, Z(552, 1.2, GA + 50)], [G0.bolsa, Z(566, 1.36, GA + 30)]]],
  [G0.bolsa, [[G0.bolsa, Z(540, 0.98, BO + 150)], [4.4, Z(540, 1.02, BO + 145)], [5.1, Z(540, 1.0, BO + 130)], [6.6, Z(540, 1.06, BO + 120)], [G0.miga, Z(540, 1.1, BO + 115)]]],
  [G0.miga, [[G0.miga, Z(540, 0.7, MI + 60)], [7.9, Z(560, 0.78, MI + 60)], [8.6, Z(610, 1.5, FOCO.y)], [9.5, Z(FOCO.x, 4.4, FOCO.y)], [10.6, Z(FOCO.x, 5.0, FOCO.y)], [G0.horno, Z(FOCO.x - 10, 3.9, FOCO.y)]]],
  [G0.horno, [[G0.horno, Z(540, 0.94, HO + 70)], [12.8, Z(540, 0.98, HO + 70)], [14.4, Z(540, 1.04, HO + 70)], [15.6, Z(540, 1.12, HO + 60)], [G0.cristales, Z(540, 1.16, HO + 60)]]],
  [G0.cristales, [[G0.cristales, Z(540, 0.94, CR + 110)], [18.8, Z(540, 0.98, CR + 110)], [20.0, Z(540, 1.02, CR + 110)], [22.4, Z(540, 1.04, CR + 110)], [23.4, Z(540, 1.9, CR + 190)], [24.6, Z(540, 2.05, CR + 195)]]],
  [24.62, [[24.62, Z(540, 1.3, GA + 40)], [26.2, Z(540, 1.24, GA + 45)], [26.8, Z(540, 1.2, GA + 50)], [G0.nevera, Z(540, 1.19, GA + 50)]]],
  [G0.nevera, [[G0.nevera, Z(540, 1.6, NE - 80)], [30.15, Z(540, 1.7, NE - 70)]]],
  [30.2, [[30.2, Z(540, 0.98, NE + 10)], [31.8, Z(540, 1.0, NE + 10)], [32.35, Z(560, 1.0, NE + 5)], [33.3, Z(840, 1.42, NE - 70)], [G0.tostar, Z(850, 1.48, NE - 75)]]],
  [G0.tostar, [[G0.tostar, Z(540, 1.0, TO + 60)], [36.9, Z(540, 1.12, TO + 40)], [37.9, Z(540, 1.16, TO + 40)]]],
  [37.92, [[37.92, Z(540, 0.98, TR + 110)], [39.6, Z(540, 1.02, TR + 110)], [41.1, Z(540, 1.0, TR + 110)], [G0.cierre, Z(540, 0.96, TR + 110)]]],
  [G0.cierre, [[G0.cierre, Z(540, 0.62, GA + 120)], [43.6, Z(540, 0.78, GA + 95)], [44.3, Z(540, 0.9, GA + 85)], [45.55, F0], [TOTAL, F0]]],
];
export function camaraEn(g) {
  let c = CAMINOS[0][1];
  for (const [t, cl] of CAMINOS) if (g >= t) c = cl;
  return camara(g, c);
}

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0c0b0a; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(6,5,4,0) 55%, rgba(6,5,4,0.62) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(12,11,10,0.95) 0, rgba(12,11,10,0.84) 300px, rgba(12,11,10,0.45) 470px, rgba(12,11,10,0) 630px); }
.c-destello { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 70% 50% at 50% 52%, #fff 0, rgba(255,240,220,0.6) 60%, rgba(255,240,220,0.2) 100%); opacity: 0; }

.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(14,12,10,0.9); border: 2px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 10px 24px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.45); opacity: 0; }
.c-etq b { font-weight: 800; }
.c-etq.c b { color: ${CIAN}; } .c-etq.o b { color: ${ORO}; } .c-etq.r b { color: #ff6b7e; } .c-etq.v b { color: ${VERDE}; }
.c-etq.c { border-color: rgba(95,212,255,0.5); } .c-etq.o { border-color: rgba(255,194,74,0.55); } .c-etq.r { border-color: rgba(240,68,90,0.6); } .c-etq.v { border-color: rgba(34,211,138,0.55); }
.c-etq.g { font-size: 58px; padding: 12px 30px; }
.c-txt { font-family: var(--letra), sans-serif; font-weight: 800; }
`;

function estilos() {
  if (document.getElementById("mundo-css")) return;
  const s = document.createElement("style");
  s.id = "mundo-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── svg ─────────────────────────────────────────────────────────────────────────────────────────────────────────
function el(padre, tag, at = {}) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, at[k]);
  padre.appendChild(e);
  return e;
}
// cada escena tiene su propio svg en el mismo documento: sus id llevan el número de la escena
let PRE = "c-", escenas = 0;
const ids = (html) => html.replace(/id="c-/g, `id="${PRE}`).replace(/url\(#c-/g, `url(#${PRE}`);
const u = (id) => `url(#${PRE}${id})`;
// una caché para no tocar el DOM si el valor no cambia
const pon1 = (e, a, v) => { if (e["_" + a] !== v) { e.setAttribute(a, v); e["_" + a] = v; } };
const texto = (p, x, y, t, at = {}) => { const e = el(p, "text", { x, y, "text-anchor": "middle", class: "c-txt", fill: "#fff", "font-size": 40, ...at }); e.textContent = t; return e; };
const pone = (e, x, y, s = 1, a = 0) => pon1(e, "transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${s.toFixed(3)})`);

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,170,90,0.2)"/><stop offset="0.55" stop-color="rgba(200,110,60,0.08)"/><stop offset="1" stop-color="rgba(200,110,60,0)"/></radialGradient>
  <radialGradient id="c-mota" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,220,160,0.7)"/><stop offset="1" stop-color="rgba(255,220,160,0)"/></radialGradient>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.6)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <radialGradient id="c-corteza" cx="0.4" cy="0.2" r="0.9"><stop offset="0" stop-color="#e6a04a"/><stop offset="0.45" stop-color="#b8661f"/><stop offset="0.8" stop-color="#7d3c10"/><stop offset="1" stop-color="#4e2208"/></radialGradient>
  <radialGradient id="c-miga" cx="0.45" cy="0.55" r="0.65"><stop offset="0" stop-color="#fbf0d6"/><stop offset="0.7" stop-color="#f0dcae"/><stop offset="1" stop-color="#ddbb7c"/></radialGradient>
  <radialGradient id="c-agujero" cx="0.5" cy="0.38" r="0.6"><stop offset="0" stop-color="#9c7a48"/><stop offset="0.7" stop-color="#c7a46c"/><stop offset="1" stop-color="#e2c690"/></radialGradient>
  <radialGradient id="c-almidon" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="#fff2c4"/><stop offset="0.45" stop-color="#ffcf5e"/><stop offset="1" stop-color="#cf8a1e"/></radialGradient>
  <radialGradient id="c-gel" cx="0.4" cy="0.36" r="0.7"><stop offset="0" stop-color="rgba(220,250,255,0.75)"/><stop offset="0.6" stop-color="rgba(120,210,255,0.4)"/><stop offset="1" stop-color="rgba(60,150,230,0.5)"/></radialGradient>
  <radialGradient id="c-gota" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#effcff"/><stop offset="0.45" stop-color="#78d4ff"/><stop offset="1" stop-color="#1c70c4"/></radialGradient>
  <radialGradient id="c-brilloAgua" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(95,212,255,0.65)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <radialGradient id="c-humo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.8)"/><stop offset="0.6" stop-color="rgba(240,246,255,0.35)"/><stop offset="1" stop-color="rgba(240,246,255,0)"/></radialGradient>
  <linearGradient id="c-calido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,150,70,0)"/><stop offset="0.6" stop-color="rgba(255,140,60,0.1)"/><stop offset="1" stop-color="rgba(255,130,50,0.26)"/></linearGradient>
  <radialGradient id="c-calor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,150,40,0.55)"/><stop offset="0.6" stop-color="rgba(255,110,30,0.18)"/><stop offset="1" stop-color="rgba(255,110,30,0)"/></radialGradient>
  <radialGradient id="c-frio" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(95,212,255,0.42)"/><stop offset="0.6" stop-color="rgba(95,212,255,0.13)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <linearGradient id="c-mesa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c3c22"/><stop offset="0.3" stop-color="#3e2715"/><stop offset="1" stop-color="#1c120a"/></linearGradient>
  <linearGradient id="c-tabla" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a768"/><stop offset="0.5" stop-color="#b57d42"/><stop offset="1" stop-color="#7c4f24"/></linearGradient>
  <linearGradient id="c-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8e4de"/><stop offset="0.3" stop-color="#bdb6ac"/><stop offset="1" stop-color="#6e675f"/></linearGradient>
  <linearGradient id="c-horno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241812"/><stop offset="0.5" stop-color="#1a110c"/><stop offset="1" stop-color="#2a1a10"/></linearGradient>
  <linearGradient id="c-bolsa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(220,236,255,0.2)"/><stop offset="0.2" stop-color="rgba(240,248,255,0.06)"/><stop offset="0.7" stop-color="rgba(240,248,255,0.04)"/><stop offset="0.9" stop-color="rgba(230,242,255,0.22)"/><stop offset="1" stop-color="rgba(220,236,255,0.1)"/></linearGradient>
  <pattern id="c-rejilla" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0.75H60M0.75 0V60" stroke="rgba(255,200,140,0.08)" stroke-width="1.5"/></pattern>
</defs>`;

// ── la media hogaza, vista por el corte, con la base en (0, 0): unos 640 × 390 ─────────────────────────────────────
const HOGAZA = "M-320 0 C-336 -120 -290 -330 -70 -384 C-24 -394 24 -394 70 -384 C290 -330 336 -120 320 0 Z";
const MIGA = "M-292 -22 C-304 -126 -262 -306 -64 -354 C-22 -362 22 -362 64 -354 C262 -306 304 -126 292 -22 Z";
const GOTA = "M0 -46 C14 -26 30 -6 30 12 C30 30 16 42 0 42 C-16 42 -30 30 -30 12 C-30 -6 -14 -26 0 -46 Z";
const CRISTAL = "M0 -14 L8 0 L0 14 L-8 0 Z";
const enMiga = (x, y, m = 0) => y < -40 - m && (x / (282 - m)) ** 2 + ((y + 30) / (325 - m)) ** 2 < 0.86;
// o: agujeros (cuántos), gotas, cris (cristalitos), seed, foco [x, y, R] (una pared sin agujeros, con granitos)
function hogaza(p, o = {}) {
  const r = K.azar(o.seed || 7);
  const G = el(p, "g");
  el(G, "ellipse", { cx: 0, cy: 8, rx: 330, ry: 26, fill: u("sombra") });
  const R = el(G, "g");
  el(R, "path", { d: HOGAZA, fill: u("corteza"), stroke: "#3c1a06", "stroke-width": 5 });
  el(R, "path", { d: "M-250 -250 C-200 -320 -120 -360 -40 -372", stroke: "rgba(255,226,170,0.45)", "stroke-width": 10, fill: "none", "stroke-linecap": "round" });
  for (let i = 0; i < 14; i++) {
    const a = PI * (0.08 + 0.84 * r()), x = -Math.cos(a) * 300, y = -Math.sin(a) * 360 + 10;
    el(R, "ellipse", { cx: f1(x), cy: f1(y), rx: f1(6 + r() * 10), ry: 3, fill: "rgba(255,244,226,0.3)", transform: `rotate(${f1(-a * 57.3 + 90)} ${f1(x)} ${f1(y)})` });
  }
  el(R, "path", { d: MIGA, fill: u("miga"), stroke: "#a9773a", "stroke-width": 4 });
  // los agujeros de la miga
  const hechos = [];
  const [fx, fy, fR] = o.foco || [0, 0, -1e3];
  for (let t = 0; t < 2600 && hechos.length < (o.agujeros ?? 80); t++) {
    const rx = 5 + r() ** 1.6 * 26, x = -280 + r() * 560, y = -350 + r() * 320;
    if (!enMiga(x, y, rx + 6)) continue;
    if (Math.hypot(x - fx, y - fy) < fR + rx + 14) continue;
    if (hechos.some((h) => Math.hypot(h[0] - x, h[1] - y) < h[2] + rx + 5)) continue;
    const ry = rx * (0.6 + r() * 0.3);
    hechos.push([x, y, rx, ry]);
    el(R, "ellipse", { cx: f1(x), cy: f1(y), rx: f1(rx), ry: f1(ry), fill: u("agujero"), transform: `rotate(${f1(-30 + r() * 60)} ${f1(x)} ${f1(y)})` });
  }
  // los granitos de almidón de una pared (se ven de muy cerca)
  let oro = null;
  if (o.foco) {
    // una pared de granitos que llena todo lo que se ve de cerca (se asoma con el zoom: de lejos no se ve el borde)
    const gb = el(R, "g", { opacity: 0 }), go = el(R, "g", { opacity: 0 });
    const gs = [];
    for (let t = 0; t < 30000 && gs.length < 700; t++) {
      const x = fx + (r() - 0.5) * 160, y = fy + (r() - 0.5) * 290, rr = 2.3 + r() * 1.3;
      if (!enMiga(x, y, 2) || hechos.some((h) => Math.hypot(h[0] - x, h[1] - y) < h[2] + rr)) continue;
      if (gs.some((h) => Math.abs(h[0] - x) < 8 && Math.hypot(h[0] - x, h[1] - y) < h[2] + rr + 0.45)) continue;
      gs.push([x, y, rr]);
      const at = { cx: f1(x), cy: f1(y), rx: rr.toFixed(2), ry: (rr * 0.8).toFixed(2), transform: `rotate(${f1(r() * 180)} ${f1(x)} ${f1(y)})` };
      el(gb, "ellipse", { ...at, fill: "#f3e2b8", stroke: "rgba(160,120,60,0.45)", "stroke-width": 0.3 });
      el(go, "ellipse", { ...at, fill: u("almidon"), stroke: "#8a5410", "stroke-width": 0.35 });
      el(go, "ellipse", { cx: f1(x - rr * 0.1), cy: f1(y), rx: (rr * 0.32).toFixed(2), ry: (rr * 0.22).toFixed(2), fill: "rgba(150,90,20,0.5)" });
    }
    oro = (k, b) => { pon1(go, "opacity", k.toFixed(2)); pon1(gb, "opacity", b.toFixed(2)); };
  }
  // el agua de dentro
  const gotas = el(R, "g", { opacity: 0 });
  const GT = [];
  for (let t = 0; t < 800 && GT.length < (o.gotas ?? 0); t++) {
    const x = -250 + r() * 500, y = -320 + r() * 280;
    if (!enMiga(x, y, 30) || hechos.some((h) => Math.hypot(h[0] - x, h[1] - y) < h[2] + 14) || GT.some((h) => Math.hypot(h.x - x, h.y - y) < 60)) continue;
    const s = 0.24 + r() * 0.12;
    const g = el(gotas, "g", { transform: `translate(${f1(x)} ${f1(y)})` });
    const brillo = el(g, "circle", { r: 26, fill: u("brilloAgua") });
    el(g, "path", { d: GOTA, fill: u("gota"), stroke: "#0c4a8a", "stroke-width": 4, transform: `scale(${s.toFixed(2)})` });
    GT.push({ x, y, g, brillo, f: r() });
  }
  // los cristalitos del pan duro
  const CR_ = [];
  for (let t = 0; t < 800 && CR_.length < (o.cris ?? 0); t++) {
    const x = -250 + r() * 500, y = -320 + r() * 280;
    if (!enMiga(x, y, 24) || CR_.some((h) => Math.hypot(h.x - x, h.y - y) < 52)) continue;
    const g = el(R, "g", { opacity: 0 });
    el(g, "path", { d: CRISTAL, fill: "#ff8fa0", stroke: "#fff", "stroke-width": 2.5, "stroke-linejoin": "round" });
    el(g, "path", { d: "M-3 -4 L0 -10 L3 -4 Z", fill: "rgba(255,255,255,0.85)" });
    CR_.push({ x, y, g, a: r() * 60 - 30 });
  }
  const palida = el(R, "path", { d: MIGA, fill: "#efe9dc", opacity: 0 });
  const tostada = el(R, "path", { d: MIGA, fill: "#d98a32", opacity: 0 });
  // f(x, y, s, { gotas, palida, tost, cris, sq, a, op, oro })
  const f = (x, y, s, e = {}) => {
    const op = e.op ?? 1;
    pon1(G, "opacity", op.toFixed(2));
    if (op < 0.01) return;
    const sq = e.sq || 0;
    pon1(G, "transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(e.a || 0)}) scale(${(s * (1 + sq)).toFixed(3)} ${(s * (1 - sq)).toFixed(3)})`);
    pon1(palida, "opacity", ((e.palida || 0) * 0.45).toFixed(2));
    pon1(tostada, "opacity", ((e.tost || 0) * 0.42).toFixed(2));
    const gt = e.gotas || 0;
    pon1(gotas, "opacity", gt.toFixed(2));
    if (gt > 0.01) GT.forEach((d) => pon1(d.brillo, "opacity", (0.45 + 0.55 * Math.abs(Math.sin(e.t * 2.4 + d.f * 6.28))).toFixed(2)));
    const cr = e.cris || 0;
    CR_.forEach((c, i) => {
      const k = K.sale(K.tramo(cr * CR_.length - i, 0, 1));
      pon1(c.g, "opacity", k > 0.01 ? "1" : "0");
      if (k > 0.01) pone(c.g, c.x, c.y, k * (1 / Math.max(0.5, s)) * 0.9, c.a);
    });
    if (oro) oro(e.oro || 0, e.granos || 0);
  };
  f.G = G;
  return f;
}

// vapor: bocanadas que salen de (x, y) hacia ang; t, los segundos (para que corra); fuerza 0–1
function humo(p, n, seed = 3) {
  const r = K.azar(seed), B = [];
  for (let i = 0; i < n; i++) B.push({ e: el(p, "circle", { r: 0, fill: u("humo"), opacity: 0 }), f: i / n, j: r() - 0.5, v: 0.8 + r() * 0.5 });
  return (x, y, ang, t, fuerza, largo = 300, ancho = 0.5, ritmo = 1.4, grande = 1) => B.forEach((b) => {
    if (fuerza < 0.01) { pon1(b.e, "opacity", "0"); return; }
    const ph = fr(t * ritmo * b.v + b.f), a = ang + b.j * ancho, d = largo * ph;
    b.e.setAttribute("cx", f1(x + Math.cos(a) * d));
    b.e.setAttribute("cy", f1(y + Math.sin(a) * d));
    b.e.setAttribute("r", f1(grande * (18 + 70 * ph)));
    b.e.setAttribute("opacity", (fuerza * Math.min(1, ph * 6) * (1 - ph)).toFixed(2));
  });
}
// el ¡TOC! de tebeo
function estallido(p, letras = "¡TOC!") {
  const g = el(p, "g", { opacity: 0 });
  let d = "";
  for (let i = 0; i < 24; i++) { const a = (i / 24) * 2 * PI, rr = i % 2 ? 100 : 160; d += `${i ? "L" : "M"}${f1(Math.cos(a) * rr * 1.3)} ${f1(Math.sin(a) * rr)} `; }
  el(g, "path", { d: d + "Z", fill: "#f4f1ea", stroke: "#2a1404", "stroke-width": 9, "stroke-linejoin": "round" });
  texto(g, 0, 34, letras, { "font-size": 96, fill: "#2a1404", transform: "rotate(-8)" });
  return (x, y, s, op, a = 0) => { pon1(g, "opacity", op.toFixed(2)); if (op > 0.01) pone(g, x, y, s, a); };
}
// el golpe del pan duro contra la tabla: cuánto sube, y cómo se aplasta al caer
function golpe(g, tocs) {
  let h = 0, sq = 0, t0 = -9;
  tocs.forEach((t) => {
    if (g > t - 0.4 && g < t + 0.6) {
      const arriba = K.suave(K.tramo(g, t - 0.36, t - 0.15)), cae = K.tramo(g, t - 0.15, t);
      h = 80 * arriba * (1 - cae * cae);
      const d = g - t;
      if (d >= 0) sq = 0.05 * Math.exp(-d * 10) * Math.cos(d * 42);
      t0 = t;
    }
  });
  return { h, sq, d: g - t0 };
}

// ── gancho, «seca y dura» y cierre: la hogaza en su tabla ───────────────────────────────────────────────────────
const TABLA_Y = GA + 300;
const TOCS = [0.42, 26.62, 44.2];
function gancho(p) {
  el(p, "rect", { x: -1600, y: GA - 1100, width: 4300, height: 1400, fill: u("calido") });
  el(p, "rect", { x: -1600, y: TABLA_Y + 50, width: 4300, height: 1600, fill: u("mesa") });
  el(p, "rect", { x: -1600, y: TABLA_Y + 48, width: 4300, height: 5, fill: "rgba(255,210,160,0.18)" });
  el(p, "rect", { x: 40, y: TABLA_Y - 4, width: 1000, height: 62, rx: 20, fill: u("tabla"), stroke: "#4a2c12", "stroke-width": 4 });
  el(p, "rect", { x: 70, y: TABLA_Y + 4, width: 940, height: 7, rx: 3, fill: "rgba(255,236,200,0.35)" });
  [[180, 30, 230], [520, 36, 360], [800, 26, 180]].forEach(([x, y, w]) => el(p, "path", { d: `M${x} ${TABLA_Y + y} q${w / 2} -6 ${w} 0`, stroke: "rgba(90,52,20,0.45)", "stroke-width": 3, fill: "none" }));
  const pan = hogaza(p, { agujeros: 70, gotas: 16, seed: 11 });
  const toc = estallido(p);
  return (g) => {
    const { h, sq, d } = golpe(g, TOCS);
    // el agua: en «seco» se enciende; en «seca y dura», presa, más apagada
    const gotas = (g < 2.4 ? sube(g, 1.3, 1.62) : 0) + (g > 24 && g < 28 ? 0.7 * sube(g, 24.62, 25.0) : 0);
    pan(540, TABLA_Y - h, 1.25, { gotas, palida: 0.35, sq, a: -h * 0.05, t: ciclo(g, 1) });
    const on = d >= 0 && d < 0.6 ? asoma(d, 0, 0.32) : 0;
    toc(g > 20 && g < 30 ? 770 : 860, TABLA_Y - 110, (0.7 + 0.3 * K.sale(K.tramo(d, 0, 0.14))) * 0.95, on, 8);
  };
}

// ── la báscula: se endurece y pesa lo mismo; luego, dentro de la bolsa ──────────────────────────────────────────
function bascula(p) {
  const Y = BO;
  el(p, "ellipse", { cx: 540, cy: Y + 430, rx: 420, ry: 30, fill: u("sombra") });
  el(p, "rect", { x: 250, y: Y + 300, width: 580, height: 130, rx: 30, fill: u("metal"), stroke: "#4a443e", "stroke-width": 4 });
  el(p, "rect", { x: 190, y: Y + 284, width: 700, height: 22, rx: 11, fill: "#d8d2c9", stroke: "#5e5850", "stroke-width": 3 });
  el(p, "rect", { x: 400, y: Y + 326, width: 280, height: 80, rx: 12, fill: "#13201a", stroke: "#2c3a33", "stroke-width": 4 });
  const pantalla = el(p, "rect", { x: 404, y: Y + 330, width: 272, height: 72, rx: 10, fill: CIAN, opacity: 0 });
  const peso = texto(p, 540, Y + 386, "500 g", { "font-size": 56, fill: "#9dffcf", "font-family": "monospace" });
  // el calendario
  const C = el(p, "g", { transform: `translate(130 ${Y + 20})` });
  el(C, "rect", { x: -70, y: -80, width: 140, height: 160, rx: 16, fill: "#f4efe6" });
  el(C, "rect", { x: -70, y: -80, width: 140, height: 44, rx: 16, fill: ROJO });
  el(C, "rect", { x: -70, y: -50, width: 140, height: 14, fill: ROJO });
  texto(C, 0, -48, "día", { "font-size": 30 });
  const dia = texto(C, 0, 58, "1", { "font-size": 88, fill: "#2a2420" });
  // la dureza
  const D = el(p, "g", { transform: `translate(960 ${Y + 90})` });
  el(D, "rect", { x: -26, y: -190, width: 52, height: 360, rx: 26, fill: "rgba(255,255,255,0.1)", stroke: "rgba(255,255,255,0.25)", "stroke-width": 3 });
  const barra = el(D, "rect", { x: -20, width: 40, rx: 20, fill: ROJO });
  texto(D, 0, 220, "dureza", { "font-size": 32, fill: "rgba(255,255,255,0.75)" });
  const pan = hogaza(p, { agujeros: 60, seed: 4 });
  // la bolsa, con su pinza
  const B = el(p, "g", { opacity: 0 });
  el(B, "path", { d: "M-300 290 C-310 120 -312 -60 -270 -90 C-200 -110 -120 -140 -40 -190 L40 -190 C120 -140 200 -110 270 -90 C312 -60 310 120 300 290 Z", fill: u("bolsa"), stroke: "rgba(230,242,255,0.6)", "stroke-width": 4 });
  el(B, "path", { d: "M-250 260 C-262 120 -262 0 -236 -60", stroke: "rgba(255,255,255,0.35)", "stroke-width": 9, fill: "none", "stroke-linecap": "round" });
  el(B, "path", { d: "M-40 -190 C-30 -240 -60 -280 -30 -300 M40 -190 C30 -240 60 -280 30 -300", stroke: "rgba(230,242,255,0.6)", "stroke-width": 4, fill: "none" });
  el(B, "rect", { x: -58, y: -222, width: 116, height: 30, rx: 10, fill: ORO, stroke: "#6a4410", "stroke-width": 3 });
  const toc = estallido(p);
  return (g) => {
    // dos tandas de días: sin bolsa y con bolsa
    const conBolsa = g >= 5.3;
    const k = conBolsa ? sube(g, 5.75, 6.85) : sube(g, 2.45, 4.5);
    const dd = 1 + Math.min(2, Math.floor(k * 2.999));
    if (dia.textContent !== String(dd)) dia.textContent = String(dd);
    const vacia = 1 - sube(g, 5.05, 5.35) * (g < 5.75 ? 1 : 0);
    const dur = conBolsa ? k : k * vacia;
    pon1(barra, "y", f1(170 - 340 * dur - 20)); pon1(barra, "height", f1(340 * dur + 20));
    pon1(pantalla, "opacity", f1(0.28 * asoma(g, 3.7, 5.0) * (0.6 + 0.4 * Math.sin(g * 9))));
    pon1(peso, "fill", g > 3.7 && g < 5.3 ? CIAN : "#9dffcf");
    const { h, sq, d } = golpe(g, [6.9]);
    pan(540, Y + 284 - h, 0.82, { palida: 0.15 + 0.4 * dur, sq, a: -h * 0.05 });
    const bo = sube(g, 5.0, 5.7);
    pon1(B, "opacity", f1(bo));
    if (bo > 0.01) pone(B, 540, Y - 520 * (1 - bo) - h, 1);
    toc(840, Y + 60, 0.9, d >= 0 && d < 0.6 ? asoma(d, 0, 0.3) : 0, 8);
  };
}

// ── la miga enorme y, en una pared, los granitos de almidón ─────────────────────────────────────────────────────
function miga(p) {
  const pan = hogaza(p, { agujeros: 110, seed: 23, foco: [60, -190, 14] });
  return (g) => pan(540, MI + 500, 2.3, { granos: sube(g, 8.2, 8.9), oro: sube(g, 8.55, 9.1) });
}

// ── el horno: los granitos se abren y se empapan de agua ────────────────────────────────────────────────────────
const anillo = (rx, ry, amp, ph) => {
  let d = "";
  for (let i = 0; i <= 44; i++) {
    const a = (i / 44) * 2 * PI, k = 1 + amp * Math.sin(5 * a + ph) + amp * 0.6 * Math.sin(9 * a - ph * 1.4);
    d += `${i ? "L" : "M"}${f1(Math.cos(a) * rx * k)} ${f1(Math.sin(a) * ry * k)}`;
  }
  return d + "Z";
};
function resistencia(p, x0, x1, y) {
  let d = `M${x0} ${y}`;
  for (let x = x0, i = 0; x < x1; x += 60, i++) d += ` Q${x + 30} ${y + (i % 2 ? 34 : -34)} ${x + 60} ${y}`;
  el(p, "path", { d, stroke: "#3a1a10", "stroke-width": 22, fill: "none", "stroke-linecap": "round" });
  const vivo = el(p, "path", { d, stroke: "#ff6a2a", "stroke-width": 12, fill: "none", "stroke-linecap": "round", opacity: 0 });
  const aura = el(p, "path", { d, stroke: "rgba(255,120,40,0.35)", "stroke-width": 46, fill: "none", "stroke-linecap": "round", opacity: 0 });
  return (k) => { pon1(vivo, "opacity", f1(k)); pon1(aura, "opacity", f1(k)); };
}
const GRANOS = [[300, -90, 100, 20], [760, -130, 88, -30], [540, 150, 118, 10], [250, 280, 84, 50], [820, 250, 96, -15]];
function horno(p) {
  const Y = HO;
  el(p, "rect", { x: 40, y: Y - 420, width: 1000, height: 960, rx: 40, fill: u("horno"), stroke: "#4a3a30", "stroke-width": 8 });
  const calor = el(p, "ellipse", { cx: 540, cy: Y + 60, rx: 700, ry: 640, fill: u("calor"), opacity: 0.2 });
  const arriba = resistencia(p, 90, 990, Y - 360), abajo = resistencia(p, 90, 990, Y + 480);
  const r = K.azar(31);
  const gs = GRANOS.map(([x, y, R, a], i) => {
    const G = el(p, "g");
    const cuerpo = el(G, "ellipse", { rx: R, ry: R * 0.82, fill: u("almidon"), stroke: "#8a5410", "stroke-width": 4 });
    const gel = el(G, "ellipse", { rx: R, ry: R * 0.82, fill: u("gel"), opacity: 0 });
    const an = [0.32, 0.56, 0.8].map((k) => ({ k, e: el(G, "path", { fill: "none", stroke: "#9a5e14", "stroke-width": 5, "stroke-linecap": "round", pathLength: 100 }) }));
    const hilo = el(G, "ellipse", { rx: R * 0.12, ry: R * 0.07, fill: "rgba(140,80,15,0.6)" });
    el(G, "ellipse", { cx: -R * 0.42, cy: -R * 0.42, rx: R * 0.2, ry: R * 0.09, fill: "rgba(255,255,255,0.45)", transform: `rotate(-35 ${-R * 0.42} ${-R * 0.42})` });
    const dentro = [0, 1, 2, 3, 4, 5].map(() => ({ e: el(G, "circle", { r: R * 0.09, fill: CIAN, opacity: 0 }), a: r() * 6.28, d: 0.2 + r() * 0.55 }));
    return { x, y: Y + y, R, a, G, cuerpo, gel, an, hilo, dentro, i };
  });
  // las gotas: flotan entre los granitos y se meten dentro
  const gotas = [];
  for (let i = 0; i < 15; i++) {
    const G = el(p, "g");
    el(G, "circle", { r: 30, fill: u("brilloAgua") });
    el(G, "path", { d: GOTA, fill: u("gota"), stroke: "#0c4a8a", "stroke-width": 4, transform: "scale(0.5)" });
    gotas.push({ G, x: 110 + r() * 860, y: Y - 260 + r() * 640, a: r() * 6.28, v: 0.7 + r() * 0.6, k: gs[i % 5], t0: 13.56 + r() * 0.5 });
  }
  const vap = humo(p, 6, 12);
  return (g) => {
    const enc = sube(g, 12.3, 12.9);
    arriba(enc); abajo(enc);
    pon1(calor, "opacity", f1(0.2 + 0.8 * enc));
    const abre = sube(g, 12.88, 13.7), emp = sube(g, 13.7, 15.0);
    const blanda = asoma(g, 15.68, 16.2) * Math.sin((g - 15.68) * 22) * Math.exp(-(g - 15.68) * 2.4);
    gs.forEach((k) => {
      const s = 1 + 0.42 * abre + 0.08 * emp;
      const sx = s * (1 + 0.1 * blanda), sy = s * (1 - 0.1 * blanda);
      pon1(k.G, "transform", `translate(${k.x} ${f1(k.y + 8 * Math.sin(g * 1.3 + k.i))}) rotate(${k.a}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
      pon1(k.cuerpo, "opacity", f1(1 - 0.45 * abre));
      pon1(k.gel, "opacity", f1(0.85 * emp));
      k.an.forEach((a, j) => {
        pon1(a.e, "d", anillo(k.R * a.k * (1 + 0.25 * abre), k.R * 0.82 * a.k * (1 + 0.25 * abre), 0.14 * abre, g * 2.2 + j * 1.7 + k.i));
        const hueco = 9 * abre;
        pon1(a.e, "stroke-dasharray", `${f1(25 - hueco)} ${f1(hueco + 0.01)}`);
        pon1(a.e, "stroke", emp > 0.5 ? "#e8b04a" : "#9a5e14");
      });
      pon1(k.hilo, "opacity", f1(1 - abre));
      k.dentro.forEach((d) => {
        pon1(d.e, "opacity", f1(emp));
        if (emp > 0.01) { pon1(d.e, "cx", f1(Math.cos(d.a + g * 0.8) * k.R * d.d)); pon1(d.e, "cy", f1(Math.sin(d.a + g * 0.8) * k.R * d.d * 0.8)); }
      });
    });
    gotas.forEach((d) => {
      const m = K.suave(K.tramo(g, d.t0, d.t0 + 0.9));
      const x = d.x + 26 * Math.sin(g * d.v + d.a), y = d.y + 20 * Math.sin(g * d.v * 1.3 + d.a * 2);
      const tx = d.k.x, ty = d.k.y;
      pon1(d.G, "opacity", f1(1 - K.tramo(g, d.t0 + 0.6, d.t0 + 1.0)));
      pone(d.G, mezcla(x, tx, m), mezcla(y, ty, m), 1 - 0.6 * m);
    });
    vap(540, Y - 300, -PI / 2, g, 0.4 * enc, 260, 2.4, 0.8, 1.2);
  };
}

// ── las cadenas del almidón: sueltas, o juntas de dos en dos en cristales con el agua en sus celdas ─────────────────
// s: { frio, junta, cristal, caja (el agua en su celda), rejas, presa }
function red(p, Y, seed) {
  const X0 = 100, X1 = 980, N = 44, SP = 185, Y0 = Y - 75;
  const calor = el(p, "ellipse", { cx: 540, cy: Y + 200, rx: 900, ry: 800, fill: u("calor") });
  const frio = el(p, "ellipse", { cx: 540, cy: Y + 200, rx: 900, ry: 800, fill: u("frio"), opacity: 0 });
  const r = K.azar(seed);
  const orden = [3, 6, 0, 5, 1, 7, 2, 4];
  const H = orden.map((o, i) => ({
    aura: el(p, "path", { fill: "none", stroke: "rgba(255,107,126,0.3)", "stroke-width": 30, "stroke-linecap": "round", opacity: 0 }),
    base: el(p, "path", { fill: "none", stroke: ORO, "stroke-width": 11, "stroke-linecap": "round", "stroke-linejoin": "round" }),
    brillo: el(p, "path", { fill: "none", stroke: "#fff1f3", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }),
    yb: Y - 110 + o * 92, f1: 0.007 + r() * 0.007, f2: 0.017 + r() * 0.01, p1: r() * 6.28, p2: r() * 6.28, v: 0.6 + r() * 0.6,
    j: Math.floor(i / 2), s: i % 2 ? 1 : -1,
  }));
  const rejas = [];
  for (let f = 0; f < 3; f++) for (const x of [120, 400, 680, 960]) {
    rejas.push(el(p, "path", { d: `M${x} ${Y0 + f * SP + 16} V${Y0 + (f + 1) * SP - 16}`, stroke: "#fff1f3", "stroke-width": 9, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 }));
  }
  const brillos = [0, 1, 2, 3, 4, 5].map((i) => {
    const e = el(p, "path", { d: "M0 -30 L6 -6 L30 0 L6 6 L0 30 L-6 6 L-30 0 L-6 -6 Z", fill: "#fff", opacity: 0 });
    return { e, x: 160 + r() * 760, y: Y0 + Math.floor(r() * 4) * SP, t: r() * 0.4 };
  });
  const gotas = [];
  for (let f = 0; f < 3; f++) for (let c = 0; c < 3; c++) {
    const G = el(p, "g");
    el(G, "circle", { r: 54, fill: u("brilloAgua") });
    el(G, "path", { d: GOTA, fill: u("gota"), stroke: "#0c4a8a", "stroke-width": 5, transform: "scale(0.85)" });
    el(G, "ellipse", { cx: -9, cy: -6, rx: 7, ry: 11, fill: "rgba(255,255,255,0.7)" });
    gotas.push({ G, cx: 260 + 280 * c, cy: Y0 + SP * (f + 0.5), a: r() * 6.28, b: r() * 6.28, v: 0.7 + r() * 0.5 });
  }
  return (g, s) => {
    pon1(calor, "opacity", f1(1 - s.frio));
    pon1(frio, "opacity", f1(s.frio));
    const ag = 1 - s.junta;
    H.forEach((h) => {
      let d = "";
      for (let n = 0; n <= N; n++) {
        const x = X0 + ((X1 - X0) * n) / N;
        const yl = h.yb + 55 * Math.sin(x * h.f1 + h.p1 + g * 1.3 * h.v) + 28 * Math.sin(x * h.f2 + h.p2 - g * 2.1 * h.v);
        const ya = Y0 + h.j * SP + h.s * 13 * Math.cos(x * 0.04 + h.j * 1.7);
        d += `${n ? "L" : "M"}${f1(x)} ${f1(mezcla(yl, ya, s.junta))}`;
      }
      pon1(h.base, "d", d); pon1(h.brillo, "d", d); pon1(h.aura, "d", d);
      pon1(h.base, "stroke", s.cristal > 0.5 ? "#f6c6cf" : ORO);
      pon1(h.brillo, "opacity", f1(s.cristal));
      pon1(h.aura, "opacity", f1(s.cristal * (1 - 0.5 * ag)));
    });
    rejas.forEach((e) => {
      pon1(e, "stroke-dashoffset", (1 - s.rejas).toFixed(3));
      pon1(e, "stroke", s.presa > 0.5 ? ROJO : "#fff1f3");
      pon1(e, "stroke-width", f1(9 + 5 * s.presa));
    });
    brillos.forEach((b) => {
      const k = s.destello ? asoma(g, s.destello + b.t, s.destello + b.t + 0.35) : 0;
      pon1(b.e, "opacity", f1(k));
      if (k > 0.01) pone(b.e, b.x, b.y, 0.6 + 0.8 * k, g * 90);
    });
    gotas.forEach((d) => {
      const lx = 540 + 390 * Math.sin(g * 0.55 * d.v + d.a), ly = Y + 200 + 270 * Math.sin(g * 0.7 * d.v + d.b);
      const em = Math.sin(g * 5.2 * d.v + d.a);
      const dx = 82 * em * s.presa;
      const aplasta = s.presa * Math.max(0, Math.abs(em) - 0.82) / 0.18 * 0.2;
      pon1(d.G, "transform", `translate(${f1(mezcla(lx, d.cx + dx, s.caja))} ${f1(mezcla(ly, d.cy, s.caja))}) scale(${(1 - aplasta).toFixed(3)} ${(1 + aplasta * 0.6).toFixed(3)})`);
    });
  };
}
function cristales(p) {
  const R = red(p, CR, 41);
  return (g) => R(g, {
    frio: sube(g, 16.88, 17.8), junta: sube(g, 18.84, 19.85), cristal: sube(g, 19.4, 19.95), destello: 19.9,
    caja: sube(g, 20.8, 21.5), rejas: sube(g, 21.0, 21.75), presa: sube(g, 23.9, 24.25),
  });
}
function cadenas(p) {
  const R = red(p, TR, 41);
  return (g) => R(g, {
    frio: (1 - sube(g, 37.92, 38.5)) * (g < 40 ? 1 : 0) + sube(g, 41.12, 41.8),
    junta: g < 40 ? 1 - sube(g, 38.24, 39.2) : sube(g, 41.25, 42.15),
    cristal: g < 40 ? 1 - sube(g, 38.24, 38.75) : sube(g, 41.85, 42.3), destello: 42.2,
    caja: g < 40.5 ? 1 - sube(g, 39.6, 40.2) : sube(g, 41.55, 42.25),
    rejas: g < 40 ? 1 - sube(g, 38.24, 38.9) : sube(g, 41.8, 42.4), presa: 0,
  });
}

// ── encimera, nevera y congelador ───────────────────────────────────────────────────────────────────────────────
function nevera(p) {
  const Y = NE;
  const r = K.azar(17);
  const P = [
    { x: 185, nom: "encimera", t: "20 °C", fondo: "#2c1d13", borde: "rgba(255,194,74,0.5)", col: ORO },
    { x: 540, nom: "nevera", t: "4 °C", fondo: "#10283a", borde: "rgba(95,212,255,0.6)", col: CIAN },
    { x: 895, nom: "congelador", t: "−18 °C", fondo: "#163646", borde: "rgba(210,244,255,0.75)", col: "#d8f6ff" },
  ].map((c, i) => {
    const G = el(p, "g");
    el(G, "rect", { x: c.x - 150, y: Y - 260, width: 300, height: 700, rx: 28, fill: c.fondo, stroke: c.borde, "stroke-width": 5 });
    if (i === 0) el(G, "rect", { x: c.x - 150, y: Y + 200, width: 300, height: 240, rx: 0, fill: "#5c3c22" });
    if (i > 0) {
      el(G, "ellipse", { cx: c.x, cy: Y - 160, rx: 200, ry: 220, fill: u("frio") });
      el(G, "rect", { x: c.x - 140, y: Y + 200, width: 280, height: 10, rx: 5, fill: "rgba(210,240,255,0.45)" });
      el(G, "rect", { x: c.x - 140, y: Y - 82, width: 280, height: 8, rx: 4, fill: "rgba(210,240,255,0.25)" });
    }
    if (i === 2) for (let k = 0; k < 46; k++) {
      const a = r() * 6.28, x = c.x + (r() - 0.5) * 290, y = Y - 255 + r() * 690;
      if (Math.abs(x - c.x) < 120 && y > Y + 10 && y < Y + 205) continue;
      el(G, "circle", { cx: f1(x), cy: f1(y), r: f1(2 + r() * 5), fill: "rgba(235,250,255,0.55)" });
    }
    texto(G, c.x, Y - 185, c.nom, { "font-size": 42 });
    texto(G, c.x, Y - 132, c.t, { "font-size": 38, fill: c.col });
    const pan = hogaza(G, { agujeros: 40, cris: 16, seed: 20 + i });
    el(G, "rect", { x: c.x - 110, y: Y + 290, width: 220, height: 30, rx: 15, fill: "rgba(255,255,255,0.12)" });
    const barra = el(G, "rect", { x: c.x - 110, y: Y + 290, width: 30, height: 30, rx: 15, fill: ROJO });
    texto(G, c.x, Y + 372, "dureza", { "font-size": 30, fill: "rgba(255,255,255,0.65)" });
    const ok = el(G, "g", { opacity: 0 });
    el(ok, "circle", { r: 46, fill: VERDE });
    el(ok, "path", { d: "M-22 2 L-6 18 L24 -16", stroke: "#06281a", "stroke-width": 11, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
    return { ...c, G, pan, barra, ok };
  });
  return (g) => {
    const ancho = g >= 30.2;
    const k = [
      ancho ? 0.26 * sube(g, 30.4, 31.7) + 0.14 * sube(g, 31.7, 34.9) : 0,
      ancho ? sube(g, 30.4, 31.7) : 0.85 * sube(g, 28.5, 30.0),
      0,
    ];
    P.forEach((c, i) => {
      const op = i === 1 ? 1 : ancho ? (i === 2 ? 0.45 + 0.55 * sube(g, 32.3, 32.7) : 1 - 0.45 * sube(g, 32.3, 32.7)) : 0;
      pon1(c.G, "opacity", f1(op));
      if (op < 0.01) return;
      c.pan(c.x, Y + 200, 0.44, { cris: k[i], palida: 0.2 + 0.6 * k[i] });
      pon1(c.barra, "width", f1(30 + 190 * k[i]));
      const ok = i === 2 ? asoma(g, 33.76) : 0;
      pon1(c.ok, "opacity", f1(ok));
      if (ok > 0.01) pone(c.ok, c.x + 110, Y + 20, 0.7 + 0.3 * K.sale(K.tramo(g, 33.76, 34.1)));
    });
  };
}

// ── la rebanada sobre la resistencia: vuelve a estar tierna ─────────────────────────────────────────────────────
function tostar(p) {
  const Y = TO;
  const calor = el(p, "ellipse", { cx: 540, cy: Y + 320, rx: 760, ry: 520, fill: u("calor"), opacity: 0.1 });
  const res = [0, 1].map((i) => resistencia(p, 120, 960, Y + 300 + i * 70));
  const ondas = [0, 1, 2, 3, 4].map((i) => ({ e: el(p, "path", { fill: "none", stroke: "rgba(255,170,90,0.6)", "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }), x: 200 + i * 170, f: i / 5 }));
  const pan = hogaza(p, { agujeros: 70, cris: 18, seed: 9 });
  const vap = humo(p, 8, 21);
  return (g) => {
    const enc = sube(g, 35.2, 35.9);
    res.forEach((f) => f(enc));
    pon1(calor, "opacity", f1(0.1 + 0.9 * enc));
    ondas.forEach((o) => {
      const ph = fr(g * 0.9 + o.f), y0 = Y + 260 - ph * 520;
      let d = "";
      for (let k = 0; k <= 8; k++) d += `${k ? "L" : "M"}${f1(o.x + 16 * Math.sin(k * 1.4 + g * 6))} ${f1(y0 - k * 18)}`;
      pon1(o.e, "d", d);
      pon1(o.e, "opacity", f1(enc * Math.sin(PI * ph) * 0.8));
    });
    const funde = sube(g, 35.9, 36.9);
    const tierno = asoma(g, 36.96, 37.7) * Math.sin((g - 36.96) * 20) * Math.exp(-(g - 36.96) * 2.6) * 0.07;
    pan(540, Y + 250, 0.95, { cris: 1 - funde, palida: 0.6 * (1 - funde), tost: funde, sq: tierno });
    vap(540, Y - 140, -PI / 2, g, enc * sube(g, 36.0, 36.6), 420, 1.2, 0.9, 1.3);
  };
}

// ── el sitio: fondo oscuro con rejilla, una luz cálida en cada estación y polvo que flota ───────────────────────
const SITIOS = [GA, BO, MI, HO, CR, NE, TO, TR];
function fondo(p) {
  el(p, "rect", { x: -4000, y: -4000, width: 9000, height: 32000, fill: "#0c0b0a" });
  el(p, "rect", { x: -4000, y: -4000, width: 9000, height: 32000, fill: u("rejilla") });
  SITIOS.forEach((y) => el(p, "ellipse", { cx: 540, cy: y, rx: 1200, ry: 1300, fill: u("luz") }));
  const r = K.azar(5), motas = [];
  for (let i = 0; i < 72; i++) {
    const reg = SITIOS[i % SITIOS.length];
    motas.push({ e: el(p, "circle", { r: 4 + r() * 10, fill: u("mota") }), x: -250 + r() * 1580, y: reg - 1100 + r() * 2300, f: r(), w: r() * 6.28 });
  }
  return (g) => motas.forEach((m) => {
    const ph = fr(ciclo(g, 0.05) + m.f);
    m.e.setAttribute("cx", f1(m.x + 30 * Math.sin(vuelta(g, 0.08) + m.w)));
    m.e.setAttribute("cy", f1(m.y - 260 * ph));
    m.e.setAttribute("opacity", f1(0.7 * Math.sin(PI * ph)));
  });
}

// ── las etiquetas (en pantalla, en un sitio fijo) ───────────────────────────────────────────────────────────────
export function etiqueta(cont, html, clase = "") { return K.crear(cont, `<div class="c-etq ${clase}">${html}</div>`); }
function pon(e, sx, sy, on, dy = 24) {
  if (on <= 0.001) { if (e._on !== 0) { e.style.opacity = 0; e._on = 0; } return; }
  e._on = on;
  const w = e.offsetWidth, h = e.offsetHeight;
  const x = Math.min(Math.max(sx, 40 + w / 2), 1040 - w / 2), y = Math.min(Math.max(sy, 565 + h / 2), 1340 - h / 2);
  e.style.opacity = on;
  e.style.transform = `translate(${f1(x - w / 2)}px, ${f1(y - h / 2 + (1 - on) * dy)}px) scale(${f1(0.9 + 0.1 * on)})`;
}

// los rótulos: entran en 0,25 s y se van del todo antes de que llegue el siguiente (nunca dos a la vez)
const ve = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.25)) * (1 - K.suave(K.tramo(g, b - 0.2, b)));

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on) => { const l = { e: etiqueta(capa, html, clase), sitio, on }; L.push(l); return l; };
  const ARR = [540, 650];
  // gancho y cierre (el mismo rótulo en el primer fotograma y en el último)
  r(`el pan <b>duro</b>`, "o g", ARR, (g) => (g < 4 ? 1 - K.suave(K.tramo(g, 0.86, 1.06)) : asoma(g, TOTAL - 0.7)));
  r(`no está <b>seco</b>`, "r g", ARR, (g) => ve(g, 1.1, 2.08));
  // bolsa
  r(`se <b>endurece</b>`, "r g", ARR, (g) => ve(g, 2.3, 3.6));
  r(`sin perder <b>agua</b>`, "c g", ARR, (g) => ve(g, 3.68, 5.05));
  r(`también dentro de la <b>bolsa</b>`, "o", ARR, (g) => ve(g, 5.2, 7.1));
  // miga
  r(`el <b>culpable</b>`, "r g", ARR, (g) => ve(g, 7.5, 8.45));
  r(`el <b>almidón</b>`, "o g", ARR, (g) => ve(g, 8.52, 9.48));
  r(`unos <b>granitos</b>`, "o g", ARR, (g) => ve(g, 9.55, 10.55));
  r(`que forman la <b>miga</b>`, "", ARR, (g) => ve(g, 10.6, 11.15));
  // horno
  r(`en el <b>horno</b>`, "o g", ARR, (g) => ve(g, 11.5, 12.28));
  r(`el <b>calor</b> los abre`, "r g", ARR, (g) => ve(g, 12.36, 13.48));
  r(`se empapan de <b>agua</b>`, "c g", ARR, (g) => ve(g, 13.56, 15.58));
  r(`miga <b>blanda</b>`, "v g", ARR, (g) => ve(g, 15.68, 16.3));
  // cristales
  r(`al <b>enfriarse</b>`, "c g", ARR, (g) => ve(g, 16.7, 17.76));
  r(`sus <b>cadenas</b>`, "o g", ARR, (g) => ve(g, 17.84, 18.76));
  r(`se <b>juntan</b>`, "", ARR, (g) => ve(g, 18.84, 19.34));
  r(`<b>cristales</b> duros`, "r g", ARR, (g) => ve(g, 19.42, 20.72));
  r(`con el <b>agua</b> dentro`, "c", ARR, (g) => ve(g, 20.8, 22.42));
  r(`el agua <b>sigue ahí</b>`, "c g", ARR, (g) => ve(g, 22.52, 23.85));
  r(`pero <b>presa</b>`, "r g", ARR, (g) => ve(g, 23.92, 25.3));
  r(`se nota <b>seca</b>`, "r", ARR, (g) => ve(g, 25.42, 26.42));
  r(`y <b>dura</b>`, "r g", ARR, (g) => ve(g, 26.5, 27.25));
  // nevera
  r(`la <b>nevera</b>`, "c g", ARR, (g) => ve(g, 27.5, 28.42));
  r(`lo <b>acelera</b>`, "r g", ARR, (g) => ve(g, 28.48, 30.12));
  r(`<b>varias veces</b> más rápido`, "r", ARR, (g) => ve(g, 30.22, 32.18));
  r(`en el <b>congelador</b>`, "c g", ARR, (g) => ve(g, 32.3, 33.68));
  r(`se queda <b>como estaba</b>`, "v", ARR, (g) => ve(g, 33.76, 34.85));
  // tostar
  r(`al <b>calentarlo</b>`, "r g", ARR, (g) => ve(g, 35.1, 36.88));
  r(`vuelve a estar <b>tierno</b>`, "v", ARR, (g) => ve(g, 36.96, 37.82));
  r(`el calor <b>deshace</b> los cristales`, "o", ARR, (g) => ve(g, 37.92, 39.5));
  r(`y <b>suelta</b> el agua`, "c g", ARR, (g) => ve(g, 39.58, 41.02));
  r(`hasta que se <b>enfría</b>`, "c g", ARR, (g) => ve(g, 41.1, 42.3));
  // cierre
  r(`aunque suene como una <b>piedra</b>`, "", ARR, (g) => ve(g, 42.6, 44.66));
  r(`<b>acuérdate</b>:`, "o g", ARR, (g) => ve(g, 44.74, TOTAL - 0.75));
  return (g) => L.forEach((l) => pon(l.e, l.sitio[0], l.sitio[1], l.on(g)));
}

// ── lo que tiene cada escena, por capas: el mundo, la viñeta, la sombra de arriba y la pantalla ───────────────────
export function montaje(esc) {
  estilos();
  PRE = `c${++escenas}-`;
  K.crear(esc, `<div class="c-fondo"></div>`);
  const mundo = K.crear(esc, `<div class="c-mundo"></div>`);
  const sv = K.crear(mundo, ids(`<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">${DEFS}<g class="c-cam"></g></svg>`));
  const cam = sv.querySelector(".c-cam");
  const E = { mundo, cam };
  const grupo = () => el(cam, "g");
  E.fo = fondo(grupo());
  const est = (y, fn) => { const q = grupo(); return [y, fn(q), q]; };
  E.est = [
    est(GA, gancho),
    est(BO, bascula),
    est(MI, miga),
    est(HO, horno),
    est(CR + 150, cristales),
    est(NE, nevera),
    est(TO, tostar),
    est(TR + 150, cadenas),
  ];
  K.crear(esc, `<div class="c-vineta"></div>`);
  E.destello = K.crear(esc, `<div class="c-destello"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  E.ro = rotulos(capa);
  return E;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los instantes en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const GOLPES = [[0.42, 0.8], [6.9, 0.6], [19.9, 0.6], [26.62, 0.8], [44.2, 0.9]];
const FLASH = [[0.42, 0.12], [19.9, 0.2], [44.2, 0.12]];
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // un temblor pequeño en cada golpe
    const a = Math.max(...GOLPES.map(([t, f]) => f * asoma(g, t, t + 0.25))) * 0.8;
    const tx = 8 * a * Math.sin(83 * g), ty = 6 * a * Math.cos(71 * g);
    E.cam.setAttribute("transform", `translate(${(540 - k.x * k.z + tx).toFixed(2)} ${(1000 - k.y * k.z + ty).toFixed(2)}) scale(${k.z.toFixed(4)})`);
    E.destello.style.opacity = FLASH.reduce((m, [t, f]) => Math.max(m, f * asoma(g, t, t + 0.12) * (1 - K.tramo(g, t + 0.12, t + 0.45))), 0).toFixed(3);
    E.fo(g);
    const alto = 1000 / k.z + 1400;
    // lo que queda lejos de la cámara se esconde (si no, se queda donde nació, en el 0,0)
    E.est.forEach(([y, f, q]) => { const on = Math.abs(k.y - y) < alto + 1200; if (on) f(g); q.style.display = on ? "" : "none"; });
    E.ro(g);
    return { g, k };
  };
  return E;
}
