// El mundo de las palomitas, todo en 2D, en un svg con la cámara dentro (un transform del grupo), por estaciones:
//   y = 1000   la olla con aceite y llamas, el grano grande y otros alrededor (gancho y cierre: el último fotograma es el primero)
//   y = 4000   cámara lenta: el grano dentro de un cronómetro de 0 a 120 ms
//   y = 7000   el grano cortado por la mitad: cáscara, almidón y la gota de agua; el manómetro y el termómetro
//   y = 10000  el almidón que se hincha en espuma, con una lupa sobre las burbujas
//   y = 13000  el grano tumbado en la olla: la patita, el salto con la estela y el gimnasta
//   y = 16000  la grieta que suelta el vapor, y una botella que se descorcha
//   y = 19000  el cubo de palomitas y los granos duros en la mesa
const K = window.K;
const NS = "http://www.w3.org/2000/svg";
const PI = Math.PI;

export const ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", CIAN = "#5fd4ff";
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 54.5;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);
const fr = (v) => v - Math.floor(v);
const mezcla = (a, b, t) => a + (b - a) * t;

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, lento: 3.45, dentro: 8.27, espuma: 25.58, salto: 32.14, ruido: 38.56, duros: 44.72, cierre: 50.88 };

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
const GA = 1000, LE = 4000, DE = 7000, ES = 10000, SA = 13000, RU = 16000, DU = 19000;

// ── la cámara: el punto (x, y) del mundo queda en (540, 1000) con zoom z ───────────────────────────────────────
export const F0 = { x: 540, y: GA + 40, z: 1.22 };
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
// un camino por tramo; entre tramos, corte
const CAMINOS = [
  [0, [[0, F0], [1.4, Z(546, 1.3, GA + 40)], [2.15, Z(556, 1.42, GA + 30)], [2.6, Z(566, 1.56, GA + 20)], [G0.lento, Z(572, 1.62, GA + 15)]]],
  [G0.lento, [[G0.lento, Z(540, 0.9, LE - 45)], [4.3, Z(540, 0.85, LE - 55)], [7.3, Z(540, 0.81, LE - 62)], [7.6, Z(540, 0.79, LE - 65)], [G0.dentro, Z(540, 0.78, LE - 65)]]],
  [G0.dentro, [[G0.dentro, Z(540, 0.82, DE + 70)], [9.3, Z(540, 0.9, DE + 40)], [10.2, Z(540, 1.9, DE - 50)], [11.2, Z(540, 0.92, DE + 20)], [12.4, Z(540, 1.0, DE + 10)],
    [13.7, Z(540, 1.02, DE + 20)], [14.6, Z(540, 0.8, DE + 230)], [15.6, Z(540, 0.84, DE + 200)], [16.3, Z(540, 1.0, DE + 30)], [17.25, Z(560, 1.0, DE + 40)],
    [18.0, Z(700, 0.8, DE + 150)], [21.6, Z(700, 0.8, DE + 150)], [22.5, Z(560, 0.72, DE + 150)], [24.0, Z(560, 0.74, DE + 140)], [25.0, Z(560, 0.78, DE + 60)], [G0.espuma, Z(560, 0.8, DE + 50)]]],
  [G0.espuma, [[G0.espuma, Z(540, 1.5, ES - 10)], [28.15, Z(540, 1.62, ES - 20)], [28.75, Z(540, 0.98, ES + 70)], [29.3, Z(540, 1.0, ES + 60)], [30.0, Z(540, 1.32, ES - 20)], [G0.salto, Z(540, 1.4, ES - 20)]]],
  [G0.salto, [[G0.salto, Z(400, 1.45, SA + 210)], [33.5, Z(380, 1.55, SA + 230)], [34.6, Z(420, 1.3, SA + 200)], [35.4, Z(620, 0.8, SA + 10)], [36.0, Z(660, 0.8, SA + 20)],
    [36.5, Z(1010, 0.6, SA + 60)], [G0.ruido, Z(1010, 0.62, SA + 60)]]],
  [G0.ruido, [[G0.ruido, Z(440, 1.05, RU + 120)], [40.6, Z(420, 1.25, RU + 40)], [41.6, Z(440, 1.05, RU)], [42.9, Z(560, 0.86, RU + 20)], [43.5, Z(1150, 0.8, RU - 140)], [G0.duros, Z(1150, 0.82, RU - 145)]]],
  [G0.duros, [[G0.duros, Z(540, 0.84, DU + 220)], [45.9, Z(540, 0.88, DU + 260)], [46.7, Z(530, 1.28, DU + 500)], [47.5, Z(470, 1.55, DU + 530)], [48.3, Z(410, 2.2, DU + 530)], [G0.cierre, Z(410, 2.3, DU + 530)]]],
  [G0.cierre, [[G0.cierre, Z(540, 0.55, GA + 120)], [52.4, Z(540, 0.62, GA + 90)], [53.95, Z(540, 1.12, GA + 45)], [54.3, F0], [TOTAL, F0]]],
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
// un recorte propio (con el prefijo de su escena)
function recorte(p, nombre) { const c = el(p, "clipPath", { id: PRE + nombre }); return { c, url: u(nombre) }; }
// una caché para no tocar el DOM si el valor no cambia
const pon1 = (e, a, v) => { if (e["_" + a] !== v) { e.setAttribute(a, v); e["_" + a] = v; } };
const texto = (p, x, y, t, at = {}) => { const e = el(p, "text", { x, y, "text-anchor": "middle", class: "c-txt", fill: "#fff", "font-size": 40, ...at }); e.textContent = t; return e; };
const pone = (e, x, y, s = 1, a = 0) => pon1(e, "transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${s.toFixed(3)})`);

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,170,90,0.2)"/><stop offset="0.55" stop-color="rgba(200,110,60,0.08)"/><stop offset="1" stop-color="rgba(200,110,60,0)"/></radialGradient>
  <radialGradient id="c-mota" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,220,160,0.7)"/><stop offset="1" stop-color="rgba(255,220,160,0)"/></radialGradient>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.6)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <radialGradient id="c-grano" cx="0.36" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffe59a"/><stop offset="0.3" stop-color="#f7b83a"/><stop offset="0.68" stop-color="#d97c18"/><stop offset="1" stop-color="#7a3a0c"/></radialGradient>
  <linearGradient id="c-pico" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ead0"/><stop offset="1" stop-color="#b8925a"/></linearGradient>
  <radialGradient id="c-flor" cx="0.4" cy="0.34" r="0.7"><stop offset="0" stop-color="#fffef8"/><stop offset="0.55" stop-color="#f7ecd2"/><stop offset="1" stop-color="#d6bb88"/></radialGradient>
  <radialGradient id="c-almidon" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#fff4d6"/><stop offset="0.6" stop-color="#efd9a2"/><stop offset="1" stop-color="#d1aa62"/></radialGradient>
  <linearGradient id="c-cascara" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2a33a"/><stop offset="0.5" stop-color="#c8661a"/><stop offset="1" stop-color="#7a340c"/></linearGradient>
  <radialGradient id="c-gota" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#effcff"/><stop offset="0.45" stop-color="#78d4ff"/><stop offset="1" stop-color="#1c70c4"/></radialGradient>
  <radialGradient id="c-humo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.8)"/><stop offset="0.6" stop-color="rgba(240,246,255,0.35)"/><stop offset="1" stop-color="rgba(240,246,255,0)"/></radialGradient>
  <linearGradient id="c-calido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,130,50,0)"/><stop offset="0.55" stop-color="rgba(255,120,45,0.12)"/><stop offset="1" stop-color="rgba(255,120,40,0.34)"/></linearGradient>
  <radialGradient id="c-ascua" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,120,30,0.7)"/><stop offset="0.5" stop-color="rgba(210,60,15,0.3)"/><stop offset="1" stop-color="rgba(200,50,10,0)"/></radialGradient>
  <linearGradient id="c-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#77706a"/><stop offset="0.22" stop-color="#3e3835"/><stop offset="1" stop-color="#1c1816"/></linearGradient>
  <linearGradient id="c-aceite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,222,120,0.9)"/><stop offset="1" stop-color="rgba(205,140,40,0.65)"/></linearGradient>
  <linearGradient id="c-llama" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2a5bff"/><stop offset="0.45" stop-color="#6aaeff"/><stop offset="0.82" stop-color="rgba(255,170,80,0.85)"/><stop offset="1" stop-color="rgba(255,200,120,0)"/></linearGradient>
  <radialGradient id="c-esfera" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#3d2f25"/><stop offset="0.8" stop-color="#2b2019"/><stop offset="1" stop-color="#1e1712"/></radialGradient>
  <radialGradient id="c-calor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,150,40,0.6)"/><stop offset="0.6" stop-color="rgba(255,110,30,0.2)"/><stop offset="1" stop-color="rgba(255,110,30,0)"/></radialGradient>
  <radialGradient id="c-frio" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(95,212,255,0.45)"/><stop offset="0.6" stop-color="rgba(95,212,255,0.14)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <radialGradient id="c-burbuja" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#fffdf5"/><stop offset="0.6" stop-color="#f3e3c0"/><stop offset="1" stop-color="#d9b97e"/></radialGradient>
  <linearGradient id="c-mesa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3e"/><stop offset="0.25" stop-color="#6e4628"/><stop offset="1" stop-color="#2e1c10"/></linearGradient>
  <linearGradient id="c-vidrio" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b2618"/><stop offset="0.3" stop-color="#2f7048"/><stop offset="0.42" stop-color="#5aa878"/><stop offset="0.55" stop-color="#1c4a2e"/><stop offset="1" stop-color="#06140c"/></linearGradient>
  <linearGradient id="c-dorado" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6420"/><stop offset="0.4" stop-color="#ffe08a"/><stop offset="1" stop-color="#9a7028"/></linearGradient>
  <linearGradient id="c-tubo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,255,255,0.1)"/><stop offset="0.3" stop-color="rgba(255,255,255,0.4)"/><stop offset="1" stop-color="rgba(255,255,255,0.08)"/></linearGradient>
  <pattern id="c-rejilla" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0.75H60M0.75 0V60" stroke="rgba(255,200,140,0.08)" stroke-width="1.5"/></pattern>
  <pattern id="c-granulos" width="22" height="20" patternUnits="userSpaceOnUse"><path d="M2 3 L9 1 L14 5 L12 11 L5 12 Z M14 12 L20 10 L22 16 L17 20 L12 17 Z" fill="rgba(255,250,230,0.25)" stroke="rgba(160,110,40,0.4)" stroke-width="1"/></pattern>
  <pattern id="c-rayas" width="120" height="40" patternUnits="userSpaceOnUse"><rect width="60" height="40" fill="#d8283a"/><rect x="60" width="60" height="40" fill="#f6efe2"/></pattern>
</defs>`;

// ── el grano de maíz, de pie con la punta abajo, en sus coordenadas (unos 240 × 280) ────────────────────────────
const GRANO = "M0 -130 C52 -136 104 -128 117 -84 C129 -36 110 40 70 96 C52 120 36 134 22 140 C10 144 -10 144 -22 140 C-36 134 -52 120 -70 96 C-110 40 -129 -36 -117 -84 C-104 -128 -52 -136 0 -130 Z";
const PICO = "M-24 136 C-16 152 16 152 24 136 C14 124 -14 124 -24 136 Z";
const GRIETA = "M-4 -131 L10 -112 L-8 -84 L12 -52 L-6 -22 L8 6 L-2 30";
const GOTA = "M0 -46 C14 -26 30 -6 30 12 C30 30 16 42 0 42 C-16 42 -30 30 -30 12 C-30 -6 -14 -26 0 -46 Z";
// la palomita abierta: nubes de almidón
const FLOR = [[-96, -66, 50], [96, -72, 52], [0, -126, 58], [-72, 12, 64], [74, 8, 66], [-36, 72, 56], [42, 70, 58], [0, -48, 80], [0, 24, 68]];

// un grano: devuelve la función que lo pone. grieta 0–1, abre 0–1 (la palomita que sale), tiembla (de lado), pata (largo)
function grano(p, o = {}) {
  const G = el(p, "g");
  const sombra = o.sombra === false ? null : el(G, "ellipse", { cx: 0, cy: 146, rx: 118, ry: 16, fill: u("sombra") });
  const R = el(G, "g");
  const pata = o.pata ? el(R, "g", { opacity: 0 }) : null;
  let pataL = null, pataB = null;
  if (pata) {
    pataB = el(pata, "path", { stroke: "#8a6430", "stroke-width": 50, "stroke-linecap": "round", fill: "none" });
    pataL = el(pata, "path", { stroke: u("flor"), "stroke-width": 42, "stroke-linecap": "round", fill: "none" });
  }
  el(R, "path", { d: GRANO, fill: u("grano"), stroke: "#6a3208", "stroke-width": 4 });
  el(R, "path", { d: "M0 -40 C30 -40 40 10 30 60 C22 100 8 118 0 120 C-8 118 -22 100 -30 60 C-40 10 -30 -40 0 -40 Z", fill: "rgba(255,236,170,0.32)" });
  el(R, "path", { d: PICO, fill: u("pico") });
  el(R, "ellipse", { cx: -62, cy: -70, rx: 16, ry: 40, fill: "rgba(255,255,255,0.42)", transform: "rotate(28 -62 -70)" });
  const grieta = el(R, "path", { d: GRIETA, stroke: "#3a1804", "stroke-width": 8, fill: "none", "stroke-linejoin": "round", "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 });
  const luzG = el(R, "path", { d: GRIETA, stroke: "#fff3c8", "stroke-width": 3, fill: "none", "stroke-linejoin": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 });
  const flor = el(R, "g", { opacity: 0 });
  FLOR.forEach(([x, y, r]) => el(flor, "circle", { cx: x, cy: y, r, fill: u("flor"), stroke: "rgba(140,96,40,0.38)", "stroke-width": 3 }));
  [[-30, -90, 10], [40, -20, 8], [-50, 40, 7], [20, 60, 9]].forEach(([x, y, r]) => el(flor, "ellipse", { cx: x, cy: y, rx: r, ry: r * 0.6, fill: "rgba(225,140,40,0.55)" }));
  const f = (x, y, a, s, grt = 0, abre = 0, op = 1, wob = 0, largo = 0) => {
    pon1(G, "opacity", op.toFixed(2));
    if (op < 0.01) return;
    pon1(G, "transform", `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})`);
    pon1(R, "transform", `rotate(${f1(a)})`);
    if (sombra) pon1(sombra, "opacity", f1(1 - abre * 0.3));
    pon1(grieta, "stroke-dashoffset", (1 - grt).toFixed(3));
    pon1(luzG, "stroke-dashoffset", (1 - grt).toFixed(3));
    pon1(flor, "opacity", abre > 0.005 ? "1" : "0");
    if (abre > 0.005) pon1(flor, "transform", `translate(0 -46) scale(${(abre * (1 + wob)).toFixed(3)} ${(abre * (1 - wob)).toFixed(3)})`);
    if (pata) {
      pon1(pata, "opacity", largo > 0.5 ? "1" : "0");
      const d = `M0 -120 L0 ${f1(-130 - largo)}`;
      pon1(pataL, "d", d); pon1(pataB, "d", d);
    }
  };
  f.G = G;
  return f;
}
// una palomita suelta, quieta (para el cubo)
function palomita(p, x, y, s, a) {
  const g = el(p, "g", { transform: `translate(${x} ${y}) rotate(${a}) scale(${s})` });
  FLOR.forEach(([cx, cy, r]) => el(g, "circle", { cx, cy, r, fill: u("flor"), stroke: "rgba(140,96,40,0.38)", "stroke-width": 3 }));
  el(g, "path", { d: "M-40 92 Q0 130 40 92 Q0 110 -40 92 Z", fill: "#c8661a" });
  return g;
}

// ── la olla: el fuego de abajo, el metal y el aceite con burbujitas ─────────────────────────────────────────────
function olla(p, y, x0 = -1600, x1 = 2700) {
  const W = x1 - x0;
  const fuego = el(p, "g");
  el(fuego, "ellipse", { cx: (x0 + x1) / 2, cy: y + 260, rx: W * 0.42, ry: 300, fill: u("ascua") });
  const llamas = [];
  for (let x = x0 + 60, i = 0; x < x1; x += 120, i++) {
    const l = el(fuego, "path", { d: "M0 0 C-30 -34 -16 -92 0 -136 C16 -92 30 -34 0 0 Z", fill: u("llama") });
    llamas.push({ l, x, i });
  }
  el(p, "rect", { x: x0, y, width: W, height: 130, fill: u("metal") });
  el(p, "rect", { x: x0, y: y - 2, width: W, height: 6, fill: "rgba(255,220,180,0.35)" });
  el(p, "rect", { x: x0, y: y - 22, width: W, height: 24, fill: u("aceite") });
  const r = K.azar(9), burb = [];
  for (let i = 0; i < Math.round(W / 70); i++) burb.push({ e: el(p, "circle", { cx: f1(x0 + r() * W), cy: f1(y - 12 - r() * 8), r: 0, fill: "none", stroke: "rgba(255,240,190,0.85)", "stroke-width": 2.5 }), f: r(), v: 1 + Math.round(r() * 2) });
  return (g, fuerza = 1) => {
    pon1(fuego, "opacity", fuerza.toFixed(2));
    if (fuerza > 0.01) llamas.forEach(({ l, x, i }) => l.setAttribute("transform", `translate(${x} ${y + 290}) scale(1 ${(0.82 + 0.18 * Math.sin(vuelta(g, 2 + (i % 3)) + i * 1.7)).toFixed(3)})`));
    burb.forEach((b) => {
      const ph = fr(ciclo(g, b.v * 0.9) + b.f);
      b.e.setAttribute("r", f1(3 + 9 * ph));
      b.e.setAttribute("opacity", f1(0.9 * (1 - ph)));
    });
  };
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
// las ondas del ruido
function ondas(p, color = "#fff") {
  const A = [0, 1, 2, 3].map(() => el(p, "circle", { r: 0, fill: "none", stroke: color, opacity: 0 }));
  return (x, y, t, R = 420) => A.forEach((c, i) => {
    const k = K.tramo(t, i * 0.14, i * 0.14 + 0.7);
    if (k <= 0 || k >= 1) { pon1(c, "opacity", "0"); return; }
    c.setAttribute("cx", f1(x)); c.setAttribute("cy", f1(y));
    c.setAttribute("r", f1(30 + R * K.sale(k)));
    c.setAttribute("stroke-width", f1(16 * (1 - k) + 2));
    c.setAttribute("opacity", (0.9 * (1 - k)).toFixed(2));
  });
}
// el ¡POP! de tebeo
function estallido(p, letras = "¡POP!") {
  const g = el(p, "g", { opacity: 0 });
  let d = "";
  for (let i = 0; i < 28; i++) { const a = (i / 28) * 2 * PI, rr = i % 2 ? 108 : 170; d += `${i ? "L" : "M"}${f1(Math.cos(a) * rr * 1.25)} ${f1(Math.sin(a) * rr)} `; }
  el(g, "path", { d: d + "Z", fill: ORO, stroke: "#2a1404", "stroke-width": 9, "stroke-linejoin": "round" });
  texto(g, 0, 36, letras, { "font-size": 100, fill: "#2a1404", transform: "rotate(-8)" });
  return (x, y, s, op, a = 0) => { pon1(g, "opacity", op.toFixed(2)); if (op > 0.01) pone(g, x, y, s, a); };
}
// un altavoz tachado (romperse no suena)
function mudo(p) {
  const g = el(p, "g", { opacity: 0 });
  el(g, "circle", { r: 92, fill: "rgba(14,12,10,0.88)", stroke: "rgba(255,255,255,0.25)", "stroke-width": 4 });
  el(g, "path", { d: "M-46 -20 H-22 L8 -46 V46 L-22 20 H-46 Z", fill: "#fff" });
  el(g, "path", { d: "M24 -22 Q40 0 24 22 M36 -36 Q62 0 36 36", stroke: "#fff", "stroke-width": 7, fill: "none", "stroke-linecap": "round" });
  const raya = el(g, "path", { d: "M-62 -62 L62 62", stroke: ROJO, "stroke-width": 14, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 });
  return (x, y, s, op, tacha) => { pon1(g, "opacity", op.toFixed(2)); if (op > 0.01) { pone(g, x, y, s); pon1(raya, "stroke-dashoffset", (1 - tacha).toFixed(3)); } };
}

// ── gancho y cierre: la olla, el grano grande, otros alrededor ──────────────────────────────────────────────────
// los granos de la olla: x, s, giro, y cuándo revientan (fuera del encuadre del fotograma 0, salvo el del «pop»)
const OLLA_Y = GA + 300;
const GRANOS = [
  { x: 225, s: 0.68, a: 22, pop: 0.24, dx: -1 }, { x: 860, s: 0.72, a: -24 }, { x: 40, s: 0.6, a: 40 }, { x: 1045, s: 0.62, a: -50 },
  { x: -150, s: 0.66, a: 15, pop: 51.15, dx: -1 }, { x: 1235, s: 0.7, a: -15, pop: 51.7, dx: 1 }, { x: -380, s: 0.62, a: 60, pop: 52.36, dx: -1 },
  { x: 1440, s: 0.66, a: -35, pop: 52.96, dx: 1 }, { x: -720, s: 0.6, a: 10 }, { x: 1680, s: 0.6, a: -20 }, { x: -560, s: 0.64, a: 30, pop: 51.9, dx: -1 }, { x: 1900, s: 0.62, a: -10 },
];
function gancho(p) {
  el(p, "rect", { x: -1600, y: GA - 1100, width: 4300, height: 1410, fill: u("calido") });
  const fuego = olla(p, OLLA_Y);
  const vap = humo(p, 7, 4);
  const gs = GRANOS.map((k) => ({ ...k, f: grano(p) }));
  const M = grano(p);
  const vapM = humo(p, 6, 8);
  const pops = GRANOS.filter((k) => k.pop).map(() => estallido(p));
  const mu = mudo(p);
  return (g) => {
    fuego(g);
    vap(540, OLLA_Y - 40, -PI / 2, ciclo(g, 0.4), 0.55, 700, 2.6, 1, 1.4);
    let ip = 0;
    gs.forEach((k) => {
      const y0 = OLLA_Y - 8 - 140 * k.s;
      const tb = 2.5 * Math.sin(vuelta(g, 3) + k.x * 0.01);
      if (k.pop) {
        const t = g - k.pop, en = t >= 0 && (k.pop > 1 || t < 1.6 && g < 3.4);
        const P = pops[ip++];
        if (en) {
          if (t > 1.45) { k.f(0, 0, 0, 1, 0, 0, 0); P(0, 0, 1, 0); return; }
          const vu = K.sale(K.tramo(t, 0.04, 1.4));
          k.f(k.x + k.dx * 260 * vu, y0 - 1900 * vu, k.a + k.dx * 420 * vu, k.s, 1, K.sale(K.tramo(t, 0, 0.12)), 1);
          P(k.x + k.dx * 40, y0 - 120, k.s * (k.pop > 1 ? 1.9 : 1.15) * (0.6 + 0.4 * K.sale(K.tramo(t, 0, 0.15))), asoma(t, 0, 0.55), k.dx * 8);
          return;
        }
        P(0, 0, 1, 0);
      }
      k.f(k.x + tb, y0, k.a, k.s);
    });
    // el grande: tiembla; en «rompiéndose» se raja sin hacer ruido
    const hk = g < 3.6 ? 1 : 0;
    const grt = hk * sube(g, 2.12, 2.45), ab = 0;
    const tm = 4 * Math.sin(vuelta(g, 7)) + 2 * Math.sin(vuelta(g, 11) + 1);
    M(540 + tm, OLLA_Y - 8 - 140 * 1.15, -8 + 1.2 * Math.sin(vuelta(g, 5)), 1.15, grt, ab);
    vapM(560, OLLA_Y - 330, -PI / 2, ciclo(g, 0.6), 0.5, 360, 0.7, 1, 0.8);
    mu(780, GA - 70, 1, hk * asoma(g, 2.45, 3.2), sube(g, 2.6, 2.85));
  };
}

// ── cámara lenta: el grano dentro de un cronómetro ──────────────────────────────────────────────────────────────
function cronometro(p, x, y, R) {
  const G = el(p, "g", { transform: `translate(${x} ${y})` });
  el(G, "rect", { x: -60, y: -R - 110, width: 120, height: 40, rx: 14, fill: "#8a7e74" });
  el(G, "rect", { x: -32, y: -R - 76, width: 64, height: 60, rx: 10, fill: "#5a5048" });
  el(G, "rect", { x: R * 0.62, y: -R * 0.86, width: 70, height: 46, rx: 12, fill: "#5a5048", transform: `rotate(45 ${R * 0.62 + 35} ${-R * 0.86 + 23})` });
  el(G, "circle", { r: R + 30, fill: "#3a302a", stroke: "#9a8e84", "stroke-width": 10 });
  el(G, "circle", { r: R, fill: u("esfera") });
  for (let i = 0; i < 120; i += 2) {
    const a = (i / 120) * 2 * PI - PI / 2, M = i % 10 === 0, r0 = R - (M ? 46 : 22);
    el(G, "path", { d: `M${f1(Math.cos(a) * r0)} ${f1(Math.sin(a) * r0)} L${f1(Math.cos(a) * (R - 8))} ${f1(Math.sin(a) * (R - 8))}`, stroke: M ? "rgba(255,240,220,0.75)" : "rgba(255,240,220,0.35)", "stroke-width": M ? 7 : 3.5, "stroke-linecap": "round" });
  }
  [20, 40, 60, 80].forEach((v) => { const a = (v / 120) * 2 * PI - PI / 2; texto(G, f1(Math.cos(a) * (R - 92)), f1(Math.sin(a) * (R - 92) + 16), String(v), { "font-size": 44, fill: "rgba(255,240,220,0.6)" }); });
  const arco = el(G, "circle", { r: R - 30, fill: "none", stroke: ORO, "stroke-width": 16, pathLength: 1, "stroke-dasharray": "0 1", transform: "rotate(-90)", opacity: 0.85 });
  // las dos marcas: se abre (0 ms) y pop (100 ms)
  const m0 = el(G, "g", { opacity: 0 }), m1 = el(G, "g", { opacity: 0 });
  el(m0, "circle", { cx: 0, cy: -R + 30, r: 20, fill: ORO });
  texto(m0, 0, -R + 112, "0", { "font-size": 54, fill: ORO });
  const a1 = (100 / 120) * 2 * PI - PI / 2;
  el(m1, "circle", { cx: f1(Math.cos(a1) * (R - 30)), cy: f1(Math.sin(a1) * (R - 30)), r: 22, fill: ROJO });
  texto(m1, f1(Math.cos(a1) * (R - 112)), f1(Math.sin(a1) * (R - 112) + 18), "100", { "font-size": 54, fill: "#ff6b7e" });
  const aguja = el(G, "g");
  el(aguja, "path", { d: `M-7 46 L-4 ${-R + 50} L0 ${-R + 30} L4 ${-R + 50} L7 46 Z`, fill: "#fff" });
  el(G, "circle", { r: 18, fill: "#fff" });
  el(G, "circle", { r: 7, fill: ROJO });
  const lect = texto(G, 0, R * 0.6, "0 ms", { "font-size": 84, fill: "#fff" });
  return (ms, abre, pop) => {
    pon1(aguja, "transform", `rotate(${f1((ms / 120) * 360)})`);
    pon1(arco, "stroke-dasharray", `${(ms / 120).toFixed(4)} 1`);
    pon1(arco, "stroke", pop > 0.5 ? ROJO : ORO);
    pon1(m0, "opacity", f1(abre)); pon1(m1, "opacity", f1(pop));
    const t = `${Math.round(ms)} ms`;
    if (lect.textContent !== t) lect.textContent = t;
    pon1(lect, "fill", pop > 0.5 ? "#ff6b7e" : "#fff");
  };
}
function lento(p) {
  const Y = LE;
  const cr = cronometro(p, 540, Y + 60, 440);
  const k = grano(p, { sombra: false });
  const on = ondas(p, ORO), bum = estallido(p);
  return (g) => {
    const ms = 100 * K.tramo(g, 4.26, 7.38);
    cr(ms, sube(g, 4.2, 4.45), sube(g, 7.3, 7.5));
    const tm = g < 4.26 ? 3 * Math.sin(83 * g) : 0;
    const ab = 0.12 + 0.78 * K.suave(K.tramo(g, 4.26, 7.1)) + 0.1 * K.sale(K.tramo(g, 7.38, 7.6));
    k(540 + tm, Y + 30, 0, 1.3, sube(g, 3.75, 4.25), g < 4.26 ? 0.12 * sube(g, 4.0, 4.26) : ab, 1, 0.03 * Math.sin(vuelta(g, 1.5)));
    on(540, Y - 60, g - 7.38, 520);
    bum(820, Y - 230, 0.9 + 0.15 * K.sale(K.tramo(g, 7.38, 7.55)), asoma(g, 7.38, 7.9), 10);
  };
}

// ── por dentro: el grano cortado ────────────────────────────────────────────────────────────────────────────────
function manometro(p, x, y, R) {
  const G = el(p, "g", { opacity: 0 });
  el(G, "rect", { x: -22, y: R + 6, width: 44, height: 90, fill: "#8d857c" });
  el(G, "circle", { r: R + 22, fill: "#b9b1a6", stroke: "#5a534c", "stroke-width": 6 });
  el(G, "circle", { r: R, fill: "#f3efe6" });
  const ang = (v) => ((-225 + 27 * v) * PI) / 180;
  const arc = (a, b, r) => { const A = ang(a), B = ang(b); return `M${f1(Math.cos(A) * r)} ${f1(Math.sin(A) * r)} A${r} ${r} 0 ${b - a > 6.6 ? 1 : 0} 1 ${f1(Math.cos(B) * r)} ${f1(Math.sin(B) * r)}`; };
  el(G, "path", { d: arc(7.5, 10, R - 26), stroke: ROJO, "stroke-width": 22, fill: "none" });
  for (let v = 0; v <= 10; v += R < 100 ? 1 : 0.5) {
    const a = ang(v), M = v % 1 === 0, r0 = R - (M ? 40 : 24);
    el(G, "path", { d: `M${f1(Math.cos(a) * r0)} ${f1(Math.sin(a) * r0)} L${f1(Math.cos(a) * (R - 10))} ${f1(Math.sin(a) * (R - 10))}`, stroke: "#2a2420", "stroke-width": M ? 6 : 3 });
  }
  [0, 2, 4, 6, 8, 10].forEach((v) => texto(G, f1(Math.cos(ang(v)) * (R - 72)), f1(Math.sin(ang(v)) * (R - 72) + 14), String(v), { "font-size": R * 0.2, fill: "#2a2420" }));
  // la marca del aire de fuera (1)
  const aire = el(G, "circle", { cx: f1(Math.cos(ang(1)) * (R - 26)), cy: f1(Math.sin(ang(1)) * (R - 26)), r: 14, fill: CIAN, opacity: 0 });
  const lect = texto(G, 0, R * 0.62, "×1", { "font-size": R * 0.34, fill: "#2a2420" });
  const ag = el(G, "g");
  el(ag, "path", { d: `M-10 0 L0 ${-R + 30} L10 0 Z`, fill: ROJO });
  el(G, "circle", { r: 16, fill: "#2a2420" });
  return (v, op, marca = 0) => {
    pon1(G, "opacity", op.toFixed(2));
    if (op < 0.01) return;
    pon1(G, "transform", `translate(${x} ${y})`);
    pon1(ag, "transform", `rotate(${f1(-135 + 27 * v)})`);
    pon1(aire, "opacity", f1(marca));
    const t = `×${Math.round(Math.max(1, v))}`;
    if (lect.textContent !== t) lect.textContent = t;
    pon1(lect, "fill", v > 7.4 ? ROJO : "#2a2420");
  };
}
function termometro(p, x, y, H) {
  const G = el(p, "g", { opacity: 0, transform: `translate(${x} ${y})` });
  el(G, "rect", { x: -40, y: -H / 2 - 10, width: 80, height: H + 20, rx: 40, fill: "#e9e4dc" });
  el(G, "circle", { cy: H / 2 + 40, r: 66, fill: "#e9e4dc" });
  el(G, "rect", { x: -22, y: -H / 2, width: 44, height: H, rx: 22, fill: "#3a3330" });
  el(G, "circle", { cy: H / 2 + 40, r: 50, fill: ROJO });
  const col = el(G, "rect", { x: -16, width: 32, rx: 16, fill: ROJO });
  el(G, "rect", { x: -16, y: -H / 2 + 6, width: 12, height: H - 12, rx: 6, fill: u("tubo") });
  for (let t = 0; t <= 200; t += 20) {
    const yy = H / 2 - (t / 200) * H;
    el(G, "path", { d: `M40 ${f1(yy)} H${t % 100 === 0 ? 70 : 58}`, stroke: "#e9e4dc", "stroke-width": 5 });
  }
  const lect = texto(G, 0, -H / 2 - 50, "100 °C", { "font-size": 58, fill: "#ff6b7e" });
  return (t, op) => {
    pon1(G, "opacity", op.toFixed(2));
    if (op < 0.01) return;
    const h = (t / 200) * H;
    pon1(col, "y", f1(H / 2 - h)); pon1(col, "height", f1(h + 40));
    const s = `${Math.round(t)} °C`;
    if (lect.textContent !== s) lect.textContent = s;
  };
}
// el borde de dentro del grano: un punto a lo largo (0–1) y su normal
const BORDE = (() => {
  const pts = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * 2 * PI;
    pts.push([Math.cos(a), Math.sin(a)]);
  }
  return pts;
})();
function dentro(p) {
  const Y = DE, S = 3.3;
  const fuego = olla(p, Y + 3.3 * 142 + 24, -900, 2000);
  const kg = el(p, "g");
  const cuerpo = el(kg, "g");
  el(cuerpo, "path", { d: GRANO, fill: u("almidon") });
  el(cuerpo, "path", { d: GRANO, fill: u("granulos") });
  el(cuerpo, "path", { d: "M-24 136 C-30 100 -26 60 0 40 C26 60 30 100 24 136 Z", fill: "rgba(240,200,110,0.65)" });
  const calor = el(cuerpo, "path", { d: GRANO, fill: "rgba(255,90,30,0.28)", opacity: 0 });
  // flechas de calor que suben desde abajo
  const sube_ = [-60, -30, 0, 30, 60].map((x, i) => el(cuerpo, "path", { d: `M${x} 120 q-10 -20 0 -40 q10 -20 0 -40 q-10 -20 0 -40`, stroke: i % 2 ? ORO : ROJO, "stroke-width": 7, fill: "none", "stroke-linecap": "round", opacity: 0 }));
  // la gota
  const gota = el(cuerpo, "g", { opacity: 0 });
  el(gota, "path", { d: GOTA, fill: u("gota"), stroke: "#1a5fa8", "stroke-width": 2 });
  el(gota, "ellipse", { cx: -10, cy: -2, rx: 7, ry: 12, fill: "rgba(255,255,255,0.7)" });
  // el vapor: bolitas que rebotan dentro
  const r = K.azar(21), mol = [];
  for (let i = 0; i < 44; i++) mol.push({ e: el(cuerpo, "circle", { r: 5.5, fill: "#dff6ff", stroke: CIAN, "stroke-width": 2, opacity: 0 }), x0: r(), y0: r(), vx: 0.5 + r(), vy: 0.5 + r() });
  // las que intentan salir y rebotan
  const esc = [-0.5, 0.15, 0.85].map((a) => ({ a: a * PI - PI / 2 - 0.3, e: el(cuerpo, "circle", { r: 7, fill: "#bfe9ff", stroke: CIAN, "stroke-width": 2, opacity: 0 }) }));
  // flechas de presión contra la pared
  const empuje = el(cuerpo, "g", { opacity: 0 });
  const fl = BORDE.filter((_, i) => i % 2 === 0).map(([c, s]) => {
    const e = el(empuje, "g", { transform: `translate(${f1(c * 70)} ${f1(s * 82 - 10)}) rotate(${f1((Math.atan2(s, c) * 180) / PI)})` });
    el(e, "path", { d: "M0 0 H22 M14 -8 L24 0 L14 8", stroke: CIAN, "stroke-width": 5, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
    return e;
  });
  // la cáscara (el borde) y su brillo
  const brillo = el(kg, "path", { d: GRANO, fill: "none", stroke: ORO, "stroke-width": 26, opacity: 0 });
  el(kg, "path", { d: GRANO, fill: "none", stroke: u("cascara"), "stroke-width": 15 });
  el(kg, "path", { d: GRANO, fill: "none", stroke: "#5a2606", "stroke-width": 2, transform: "scale(0.94)" });
  // las grietas
  const grietas = ["M60 -110 L46 -92 L58 -76", "M-92 -60 L-78 -50 L-88 -34", "M98 20 L84 30 L92 46"].map((d) => el(kg, "path", { d, stroke: "#2a1004", "stroke-width": 5, fill: "none", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, "stroke-linecap": "round" }));
  const raja = el(kg, "path", { d: "M-6 -150 L10 -112 L-10 -84 L14 -52 L-8 -22", stroke: "#1a0802", "stroke-width": 9, fill: "none", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, "stroke-linejoin": "round", "stroke-linecap": "round" });
  // por fuera: el grano entero, que se corta en dos al empezar
  const { c: cp, url: curl } = recorte(p, "corte");
  const cr = el(cp, "rect", { x: -200, y: -200, width: 400, height: 400 });
  const fuera = el(kg, "g", { "clip-path": curl });
  const kf = grano(fuera, { sombra: false });
  const laser = el(kg, "path", { d: "M-180 0 H180", stroke: ORO, "stroke-width": 4, opacity: 0 });
  const mano = manometro(p, 1010, Y + 330, 190);
  const term = termometro(p, 30, Y + 40, 520);
  return (g) => {
    const calorV = sube(g, 13.86, 14.6);
    fuego(g, calorV);
    // la presión: de 1 a 9 y, al final, aprieta de más
    const pres = 1 + 8 * sube(g, 17.6, 19.2) + 0.6 * sube(g, 24.0, 25.0) - 9.6 * sube(g, 25.16, 25.4);
    const tens = sube(g, 16.34, 17.0) * (0.4 + 0.6 * sube(g, 23.0, 25.1)) * (1 - K.tramo(g, 25.16, 25.3));
    const bulto = 0.012 * tens * (0.5 + 0.5 * Math.sin(g * 12));
    const tm = tens * 3 * Math.sin(91 * g) + (g > 23 ? sube(g, 23, 25.1) * 4 * Math.sin(67 * g) : 0);
    pon1(kg, "transform", `translate(${f1(540 + tm)} ${Y}) scale(${(S * (1 + bulto)).toFixed(4)})`);
    // el corte
    const c = sube(g, 8.45, 9.25);
    pon1(cr, "y", f1(-200 + 400 * c));
    kf(0, 0, 0, 1, 0, 0, c < 0.999 ? 1 : 0);
    pon1(laser, "opacity", f1(c > 0.001 && c < 0.999 ? 1 : 0));
    pon1(laser, "transform", `translate(0 ${f1(-200 + 400 * c)})`);
    // la gota: aparece, tiembla y se hace vapor
    const gv = asoma(g, 9.35) * (1 - sube(g, 15.6, 16.0));
    pon1(gota, "opacity", f1(gv));
    if (gv > 0.01) pon1(gota, "transform", `translate(0 -14) scale(${(0.9 + 0.1 * Math.sin(g * 6) + 0.4 * sube(g, 14.6, 15.7)).toFixed(3)} ${(0.9 - 0.06 * Math.sin(g * 6)).toFixed(3)})`);
    // el vapor: rápido y cada vez más
    const vap = sube(g, 15.65, 16.1) * (1 - K.tramo(g, 25.2, 25.5));
    const fase = Math.max(0, g - 15.65) * 0.55 + Math.max(0, g - 17.3) * 0.7 + Math.max(0, g - 21.9) * 0.6;
    mol.forEach((m, i) => {
      if (vap < 0.01) { pon1(m.e, "opacity", "0"); return; }
      const tri = (v) => 2 * Math.abs(fr(v) - 0.5) * 2 - 1;
      const ux = tri(m.x0 + m.vx * fase), uy = tri(m.y0 + m.vy * fase * 0.9);
      const rad = vap * (i < 20 ? 1 : sube(g, 16.3 + (i - 20) * 0.04, 16.8 + (i - 20) * 0.04));
      const px = ux * 74 * (0.4 + 0.6 * rad), py = -10 + uy * 92 * (0.4 + 0.6 * rad);
      m.e.setAttribute("cx", f1(px * (1 - 0.25 * Math.max(0, uy)))); m.e.setAttribute("cy", f1(py));
      m.e.setAttribute("opacity", f1(rad));
    });
    // no deja escapar nada: tres que van a la pared y vuelven
    esc.forEach((q, i) => {
      const t = K.tramo(g, 12.36 + i * 0.2, 13.4 + i * 0.2), d = 92 * (1 - Math.abs(2 * t - 1));
      pon1(q.e, "opacity", f1(t > 0 && t < 1 ? Math.min(1, 6 * Math.min(t, 1 - t)) : 0));
      q.e.setAttribute("cx", f1(Math.cos(q.a) * d)); q.e.setAttribute("cy", f1(-14 + Math.sin(q.a) * d * 1.15));
    });
    pon1(brillo, "opacity", f1(0.85 * asoma(g, 10.95, 13.6) * (0.75 + 0.25 * Math.sin(g * 9))));
    pon1(calor, "opacity", f1(calorV * (0.6 + 0.4 * sube(g, 21.9, 24))));
    sube_.forEach((s, i) => {
      const on = asoma(g, 13.9 + i * 0.08, 15.8);
      pon1(s, "opacity", f1(on));
      if (on > 0.01) s.setAttribute("transform", `translate(0 ${f1(-60 * fr(g * 0.9 + i * 0.3))})`);
    });
    pon1(empuje, "opacity", f1(sube(g, 16.34, 16.7) * (1 - K.tramo(g, 25.16, 25.3)) * (0.6 + 0.4 * Math.sin(g * 10))));
    fl.forEach((e, i) => { });
    grietas.forEach((e, i) => pon1(e, "stroke-dashoffset", (1 - sube(g, 24.15 + i * 0.25, 24.5 + i * 0.25)).toFixed(3)));
    pon1(raja, "stroke-dashoffset", (1 - K.sale(K.tramo(g, 25.12, 25.24))).toFixed(3));
    // el manómetro y el termómetro
    mano(pres + (tens > 0.5 ? 0.25 * Math.sin(g * 40) * sube(g, 23, 25) : 0), asoma(g, 17.25), asoma(g, 19.95, 21.9));
    term(100 + 80 * sube(g, 21.75, 22.4), asoma(g, 21.6));
  };
}

// ── la espuma: el almidón blando que se hincha y se queda duro ──────────────────────────────────────────────────
function espuma(p) {
  const Y = ES;
  const calor = el(p, "ellipse", { cx: 540, cy: Y + 80, rx: 900, ry: 900, fill: u("calor") });
  const frio = el(p, "ellipse", { cx: 540, cy: Y + 80, rx: 900, ry: 900, fill: u("frio"), opacity: 0 });
  const fuego = olla(p, Y + 560, -900, 2000);
  const k = grano(p);
  // la lupa
  const L = el(p, "g", { opacity: 0 });
  const LX = 540, LY = Y + 40, LR = 250;
  el(L, "rect", { x: LR * 0.62, y: -26, width: 300, height: 52, rx: 26, fill: "#3a2c22", stroke: "#8a7a6a", "stroke-width": 4, transform: "rotate(48)" });
  el(L, "circle", { r: LR + 24, fill: "#2b231d", stroke: "#cfc6ba", "stroke-width": 10 });
  const { c: lc, url: lurl } = recorte(p, "lupa");
  el(lc, "circle", { r: LR });
  const dentro_ = el(L, "g", { "clip-path": lurl });
  el(dentro_, "circle", { r: LR, fill: "#e8d3a4" });
  const celdas = [];
  const PASO = 46;
  for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) {
    const cx = (i + (j % 2 ? 0.5 : 0)) * PASO, cy = j * PASO * 0.866, d = Math.hypot(cx, cy);
    if (d > LR + PASO) continue;
    celdas.push({ e: el(dentro_, "circle", { cx: f1(cx), cy: f1(cy), r: 0, fill: u("burbuja"), stroke: "rgba(150,100,40,0.55)", "stroke-width": 2.5 }), d: d / LR });
  }
  el(L, "ellipse", { cx: -LR * 0.4, cy: -LR * 0.45, rx: LR * 0.3, ry: LR * 0.14, fill: "rgba(255,255,255,0.22)", transform: `rotate(-35 ${-LR * 0.4} ${-LR * 0.45})` });
  return (g) => {
    fuego(g, 1 - sube(g, 30.2, 30.9));
    const caliente = 1 - sube(g, 30.28, 30.95);
    pon1(calor, "opacity", f1(0.35 + 0.65 * caliente));
    pon1(frio, "opacity", f1(1 - caliente));
    // blando: asoma y tiembla; de golpe: se hincha
    const hincha = K.sale(K.tramo(g, 28.24, 28.62));
    const blando = (0.16 + 0.1 * sube(g, 25.7, 27.4)) * (1 - hincha);
    const wob = (1 - hincha) * 0.12 * Math.sin(g * 9) * sube(g, 26.8, 27.3) + hincha * 0.04 * Math.sin(g * 30) * (1 - K.tramo(g, 28.62, 29.2));
    const toc = asoma(g, 31.3, 31.45) * 0.6;
    k(540 + 4 * toc * Math.sin(70 * g), Y + 300, 0, 2.0, 1, blando + hincha, 1, wob);
    // la lupa sobre la espuma
    const lu = asoma(g, 29.25);
    pon1(L, "opacity", f1(lu));
    if (lu > 0.01) {
      pone(L, LX, LY, 0.85 + 0.15 * K.sale(K.tramo(g, 29.25, 29.6)));
      const duro = sube(g, 30.95, 31.4);
      celdas.forEach((c) => {
        const t = K.sale(K.tramo(g, 29.35 + c.d * 0.45, 29.85 + c.d * 0.45));
        pon1(c.e, "r", f1(PASO * 0.58 * t));
        pon1(c.e, "stroke-width", f1(2.5 + 3 * duro));
        pon1(c.e, "stroke", duro > 0.5 ? "rgba(120,72,24,0.85)" : "rgba(150,100,40,0.55)");
      });
    }
  };
}

// ── el salto: la patita, la voltereta con su estela y el gimnasta ───────────────────────────────────────────────
const SUELO = SA + 400;
const SALTO_X0 = 330, SALTO_X1 = 870, SALTO_A0 = 205, S_SA = 1.2;
function enSalto(t) {
  const y0 = SUELO - 22 - (140 + 70) * S_SA * 0.9, y1 = SUELO - 22 - 120 * S_SA;
  return { x: mezcla(SALTO_X0, SALTO_X1, t), y: mezcla(y0, y1, t) - 430 * 4 * t * (1 - t), a: SALTO_A0 - 500 * t, ab: 0.22 + 0.78 * K.sale(K.tramo(t, 0.02, 0.45)) };
}
function gimnasta(p) {
  const g = el(p, "g", { opacity: 0 });
  const st = { stroke: CIAN, "stroke-width": 26, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" };
  const cuerpo = el(g, "path", st), brazos = el(g, "path", st), piernas = el(g, "path", st);
  const cabeza = el(g, "circle", { r: 30, fill: CIAN });
  const P = (a, b, t) => [mezcla(a[0], b[0], t), mezcla(a[1], b[1], t)];
  const L = (pts) => pts.map((q, i) => `${i ? "L" : "M"}${f1(q[0])} ${f1(q[1])}`).join(" ");
  return (x, y, a, tuck, op, s = 2) => {
    pon1(g, "opacity", op.toFixed(2));
    if (op < 0.01) return;
    pone(g, x, y, s, a);
    const hom = P([0, -70], [8, -40], tuck), cad = P([0, 40], [0, 30], tuck);
    const cab = P([0, -112], [26, -76], tuck);
    cabeza.setAttribute("cx", f1(cab[0])); cabeza.setAttribute("cy", f1(cab[1]));
    cuerpo.setAttribute("d", L([hom, cad]));
    const rod1 = P([-14, 100], [40, -10], tuck), pie1 = P([-20, 160], [20, 40], tuck);
    const rod2 = P([14, 100], [46, 0], tuck), pie2 = P([20, 160], [30, 50], tuck);
    piernas.setAttribute("d", L([pie1, rod1, cad, rod2, pie2]));
    const man1 = P([-46, -160], [40, -14], tuck), man2 = P([46, -160], [50, 0], tuck);
    brazos.setAttribute("d", L([man1, hom, man2]));
  };
}
function salto(p) {
  const fuego = olla(p, SUELO, -1000, 2600);
  // la estela: el recorrido y las fotos del grano en el aire
  const ruta = el(p, "path", { d: (() => { let d = ""; for (let i = 0; i <= 40; i++) { const q = enSalto(i / 40); d += `${i ? "L" : "M"}${f1(q.x)} ${f1(q.y)} `; } return d; })(), stroke: "rgba(255,194,74,0.6)", "stroke-width": 6, fill: "none", "stroke-dasharray": "14 16", pathLength: 1, opacity: 0 });
  const fotos = [1, 2, 3, 4].map((i) => ({ t: i / 5, f: grano(p, { sombra: false }) }));
  const k = grano(p, { pata: true });
  const gim = gimnasta(p);
  const GX0 = 1340, GX1 = 1660, GY = SUELO - 22 - 160 * 2;
  const fotosG = [0.2, 0.4, 0.6, 0.8].map((t) => ({ t, f: gimnasta(p) }));
  const rutaG = el(p, "path", { d: (() => { let d = ""; for (let i = 0; i <= 30; i++) { const t = i / 30; d += `${i ? "L" : "M"}${f1(mezcla(GX0, GX1, t))} ${f1(GY - 400 * 4 * t * (1 - t))} `; } return d; })(), stroke: "rgba(95,212,255,0.55)", "stroke-width": 6, fill: "none", "stroke-dasharray": "14 16", opacity: 0 });
  return (g) => {
    fuego(g);
    const t = K.tramo(g, 34.8, 35.95);
    // la patita sale y empuja
    const pata = 70 * K.sale(K.tramo(g, 33.64, 34.4)) * (1 - K.sale(K.tramo(g, 34.82, 35.15)));
    const ap = 0.22 * sube(g, 33.4, 33.8);
    if (t <= 0) {
      const y = SUELO - 22 - (140 + pata) * S_SA * 0.9 + (g > 34.5 ? 10 * Math.sin(PI * K.tramo(g, 34.5, 34.8)) : 0);
      k(SALTO_X0 + 2 * Math.sin(73 * g) * sube(g, 33.6, 34), y, SALTO_A0, S_SA, 1, ap, 1, 0, pata);
    } else {
      const q = enSalto(t);
      k(q.x, q.y, q.a, S_SA, 1, q.ab, 1, 0, pata);
    }
    pon1(ruta, "opacity", f1(asoma(g, 34.8, 38.2)));
    pon1(ruta, "stroke-dasharray", `${K.tramo(g, 34.8, 35.95).toFixed(3)} 1`);
    fotos.forEach((f) => {
      const q = enSalto(f.t), on = 0.3 * asoma(g, 34.8 + 1.15 * f.t, 38.2);
      f.f(q.x, q.y, q.a, S_SA, 1, q.ab, on);
    });
    // el gimnasta
    const tg = K.tramo(g, 36.44, 37.45), og = asoma(g, 35.8);
    const tuck = Math.sin(PI * tg) ** 0.6;
    gim(mezcla(GX0, GX1, tg), GY - 400 * 4 * tg * (1 - tg), -360 * K.suave(tg), tuck, og);
    fotosG.forEach((f) => {
      const on = 0.22 * asoma(g, 36.44 + 1.01 * f.t, 38.2);
      f.f(mezcla(GX0, GX1, f.t), GY - 400 * 4 * f.t * (1 - f.t), -360 * K.suave(f.t), Math.sin(PI * f.t) ** 0.6, on);
    });
    pon1(rutaG, "opacity", f1(asoma(g, 36.44, 38.2)));
  };
}

// ── el ruido: el vapor que sale por la grieta, y una botella que se descorcha ───────────────────────────────────
function botella(p, x, y) {
  const G = el(p, "g", { transform: `translate(${x} ${y})` });
  el(G, "ellipse", { cx: 0, cy: 0, rx: 150, ry: 18, fill: u("sombra") });
  el(G, "path", { d: "M-110 0 L-110 -380 C-110 -470 -42 -500 -36 -600 L-36 -720 L36 -720 L36 -600 C42 -500 110 -470 110 -380 L110 0 Z", fill: u("vidrio"), stroke: "#03100a", "stroke-width": 4 });
  el(G, "rect", { x: -100, y: -330, width: 200, height: 170, rx: 8, fill: "#f3e6c4" });
  texto(G, 0, -232, "CAVA", { "font-size": 52, fill: "#7a1c24" });
  el(G, "path", { d: "M-40 -560 L-38 -730 L38 -730 L40 -560 Z", fill: u("dorado") });
  const corcho = el(G, "g");
  el(corcho, "path", { d: "M-30 -730 L-30 -790 C-30 -830 30 -830 30 -790 L30 -730 Z", fill: "#d9b77e", stroke: "#8a6430", "stroke-width": 4 });
  el(corcho, "path", { d: "M-26 -780 H26 M-24 -756 H24", stroke: "#8a6430", "stroke-width": 3 });
  return (t) => {
    const v = K.sale(K.tramo(t, 0, 0.9));
    pon1(corcho, "transform", t > 0 ? `translate(${f1(260 * v)} ${f1(-520 * v)}) rotate(${f1(380 * v)} 0 -770)` : "");
  };
}
function ruido(p) {
  const Y = RU;
  const fuego = olla(p, Y + 500, -1000, 2600);
  const k = grano(p);
  const KX = 420, KY = Y + 500 - 22 - 140 * 2.2, KA = 8;
  const gx = KX + Math.sin((KA * PI) / 180) * 138 * 2.2, gy = KY - Math.cos((KA * PI) / 180) * 138 * 2.2;
  const chorro = humo(p, 14, 11);
  const on = ondas(p, "#fff"), bum = estallido(p);
  const BX = 1250;
  const b = botella(p, BX, Y + 478);
  const espumaB = humo(p, 12, 5);
  const on2 = ondas(p, ORO), bum2 = estallido(p);
  return (g) => {
    fuego(g);
    const ab = 0.1 + 0.42 * K.sale(K.tramo(g, 41.1, 41.9));
    k(KX + (g > 41.1 && g < 41.9 ? 4 * Math.sin(80 * g) : 0), KY, KA, 2.2, 1, ab, 1, 0.02 * Math.sin(g * 7));
    chorro(gx, gy, -PI / 2 + 0.25, g, asoma(g, 40.84, 43.3) * (1.1 - 0.5 * sube(g, 41.9, 43)), 520, 0.9, 1.7, 1.3);
    on(gx, gy - 60, g - 41.72, 560);
    bum(gx + 300, gy + 40, 1.0 + 0.2 * K.sale(K.tramo(g, 41.72, 41.9)), asoma(g, 41.72, 42.5), 8);
    b(g - 43.72);
    espumaB(BX, Y + 478 - 740, -PI / 2, g, asoma(g, 43.72, 44.5), 380, 0.8, 2.0, 0.9);
    on2(BX, Y + 478 - 760, g - 43.72, 520);
    bum2(BX - 250, Y + 478 - 600, 0.9 + 0.2 * K.sale(K.tramo(g, 43.72, 43.9)), asoma(g, 43.72, 44.5), -8);
  };
}

// ── los duros: el cubo de palomitas y los granos sin abrir ──────────────────────────────────────────────────────
function duros(p) {
  const Y = DU, MESA = Y + 640;
  el(p, "rect", { x: -1200, y: MESA, width: 3500, height: 1800, fill: u("mesa") });
  el(p, "rect", { x: -1200, y: MESA - 3, width: 3500, height: 8, fill: "rgba(255,220,170,0.4)" });
  for (let i = 0; i < 6; i++) el(p, "path", { d: `M-1200 ${MESA + 90 + i * 140} C0 ${MESA + 70 + i * 140} 900 ${MESA + 120 + i * 140} 2300 ${MESA + 95 + i * 140}`, stroke: "rgba(40,20,8,0.35)", "stroke-width": 6, fill: "none" });
  // el cubo con su montaña de palomitas
  const CUBO = `M250 ${Y - 60} L830 ${Y - 60} L740 ${MESA} L340 ${MESA} Z`;
  el(p, "ellipse", { cx: 540, cy: MESA, rx: 260, ry: 26, fill: u("sombra") });
  const r = K.azar(31);
  for (let i = 0; i < 26; i++) palomita(p, f1(270 + r() * 540), f1(Y - 70 - r() * 230 * Math.sin(PI * ((i % 13) / 13 + 0.04))), (0.42 + r() * 0.2).toFixed(2), Math.round(r() * 360));
  el(p, "path", { d: CUBO, fill: u("rayas") });
  el(p, "path", { d: CUBO, fill: "none", stroke: "rgba(0,0,0,0.35)", "stroke-width": 6 });
  el(p, "rect", { x: 236, y: Y - 92, width: 608, height: 44, rx: 14, fill: "#f6efe2", stroke: "rgba(0,0,0,0.3)", "stroke-width": 4 });
  [[880, MESA - 70, 0.5, 30], [960, MESA - 64, 0.44, 200], [180, MESA - 68, 0.46, 120]].forEach(([x, y, s, a]) => palomita(p, x, y, s, a));
  // los granos sin abrir
  const KS = [{ x: 330, a: 80, s: 0.5 }, { x: 545, a: -40, s: 0.42 }, { x: 760, a: 110, s: 0.45 }];
  const ks = KS.map((q) => ({ ...q, f: grano(p) }));
  const aros = KS.map(() => el(p, "circle", { r: 0, fill: "none", stroke: ROJO, "stroke-width": 7, opacity: 0 }));
  const fuga = humo(p, 9, 17);
  const mano = manometro(p, 470, Y + 490, 46);
  return (g) => {
    ks.forEach((q, i) => {
      const y = MESA - 6 - 112 * q.s;
      q.f(q.x, y, q.a, q.s, i === 0 ? sube(g, 47.3, 47.9) : 0, 0);
      const on = asoma(g, 46.2 + i * 0.12, 47.5);
      pon1(aros[i], "opacity", f1(on));
      aros[i].setAttribute("cx", f1(q.x)); aros[i].setAttribute("cy", f1(y));
      aros[i].setAttribute("r", f1(170 * q.s * (1.15 - 0.15 * on)));
    });
    // la grieta del primero pierde vapor
    const K1 = KS[0], ang = (K1.a * PI) / 180, y1 = MESA - 6 - 112 * K1.s;
    const cx = K1.x + Math.sin(ang) * 110 * K1.s, cy = y1 - Math.cos(ang) * 110 * K1.s;
    fuga(cx, cy, -PI / 2 + 0.6, g, asoma(g, 47.9) * (0.6 + 0.4 * sube(g, 48.48, 49.0)), 230, 0.6, 1.3, 0.75);
    // su manómetro: nunca llega
    const v = 3.2 - 2.2 * sube(g, 49.1, 49.9) + 0.25 * Math.sin(g * 5);
    mano(v, asoma(g, 48.1), 0);
  };
}

// ── el sitio: fondo oscuro con rejilla, una luz cálida en cada estación y polvo que flota ───────────────────────
function fondo(p) {
  el(p, "rect", { x: -4000, y: -4000, width: 9000, height: 30000, fill: "#0c0b0a" });
  el(p, "rect", { x: -4000, y: -4000, width: 9000, height: 30000, fill: u("rejilla") });
  [GA, LE, DE, ES, SA, RU, DU].forEach((y) => el(p, "ellipse", { cx: 540, cy: y, rx: 1200, ry: 1300, fill: u("luz") }));
  const r = K.azar(5), motas = [];
  for (let i = 0; i < 70; i++) {
    const reg = [GA, LE, DE, ES, SA, RU, DU][i % 7];
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
  r(`el <b>«pop»</b>`, "o g", ARR, (g) => (g < 4 ? 1 - K.suave(K.tramo(g, 1.45, 1.7)) : asoma(g, TOTAL - 0.7)));
  r(`no es el grano <b>rompiéndose</b>`, "r", ARR, (g) => ve(g, 1.75, 3.15));
  // lento
  r(`primero se <b>abre</b>`, "o g", ARR, (g) => ve(g, 4.1, 5.35));
  r(`y el <b>ruido</b>…`, "", ARR, (g) => ve(g, 5.42, 6.32));
  r(`<b>0,1 s</b> después`, "r g", ARR, (g) => ve(g, 6.42, 7.97));
  // dentro
  r(`una gota de <b>agua</b>`, "c g", ARR, (g) => ve(g, 9.4, 10.35));
  r(`la <b>cáscara</b>`, "o g", ARR, (g) => ve(g, 10.95, 12.28));
  r(`no deja <b>escapar</b> nada`, "r", ARR, (g) => ve(g, 12.36, 13.78));
  r(`<b>calor</b>`, "r g", ARR, (g) => ve(g, 13.86, 15.6));
  r(`se hace <b>vapor</b>`, "c g", ARR, (g) => ve(g, 15.7, 17.2));
  r(`una <b>olla a presión</b>`, "o", ARR, (g) => ve(g, 17.3, 18.75));
  r(`<b>9 veces</b> el aire de fuera`, "o", ARR, (g) => ve(g, 18.82, 21.8));
  r(`<b>180 °C</b>`, "r g", ARR, (g) => ve(g, 21.9, 24.05));
  r(`ya no <b>aguanta</b>`, "r g", ARR, (g) => ve(g, 24.13, 25.25));
  // espuma
  r(`el <b>almidón</b>`, "o g", ARR, (g) => ve(g, 25.72, 26.8));
  r(`<b>blando</b> por el calor`, "", ARR, (g) => ve(g, 26.87, 28.15));
  r(`se hincha de <b>golpe</b>`, "o g", ARR, (g) => ve(g, 28.24, 29.25));
  r(`como una <b>espuma</b>`, "o g", ARR, (g) => ve(g, 29.32, 30.2));
  r(`al <b>enfriarse</b>`, "c", ARR, (g) => ve(g, 30.28, 30.95));
  r(`se queda <b>duro</b>`, "c g", ARR, (g) => ve(g, 31.0, 31.84));
  // salto
  r(`para <b>saltar</b>`, "", ARR, (g) => ve(g, 32.44, 33.55));
  r(`una <b>patita</b> de almidón`, "o g", ARR, (g) => ve(g, 33.64, 34.75));
  r(`<b>empuja</b> contra la olla`, "r", ARR, (g) => ve(g, 34.8, 36.35));
  r(`como un <b>gimnasta</b>`, "c g", ARR, (g) => ve(g, 36.44, 37.4));
  r(`una <b>voltereta</b>`, "v g", ARR, (g) => ve(g, 37.48, 38.26));
  // ruido
  r(`el <b>ruido</b>`, "", ARR, (g) => ve(g, 38.76, 39.8));
  r(`justo <b>después</b>`, "", ARR, (g) => ve(g, 39.88, 40.78));
  r(`el <b>vapor</b> escapa de golpe`, "c g", ARR, (g) => ve(g, 40.84, 42.2));
  r(`por la <b>grieta</b>`, "r g", ARR, (g) => ve(g, 42.28, 43.05));
  r(`como <b>descorchar</b> una botella`, "o", ARR, (g) => ve(g, 43.12, 44.42));
  // duros
  r(`los que se quedan <b>sin abrir</b>`, "", ARR, (g) => ve(g, 45.3, 47.55));
  r(`cáscara <b>dañada</b>`, "r g", ARR, (g) => ve(g, 47.64, 48.4));
  r(`el vapor se <b>escapa</b>`, "c", ARR, (g) => ve(g, 48.48, 49.55));
  r(`<b>antes de tiempo</b>`, "r g", ARR, (g) => ve(g, 49.64, 50.58));
  // cierre
  r(`cuando las <b>oigas</b>`, "", ARR, (g) => ve(g, 51.4, 53.28));
  r(`<b>acuérdate</b>:`, "o g", ARR, (g) => ve(g, 53.36, TOTAL - 0.75));
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
  E.est = [
    [GA, gancho(grupo())],
    [LE, lento(grupo())],
    [DE, dentro(grupo())],
    [ES, espuma(grupo())],
    [SA, salto(grupo())],
    [RU, ruido(grupo())],
    [DU + 300, duros(grupo())],
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
const GOLPES = [[0.24, 0.5], [7.38, 0.8], [25.16, 1], [28.24, 0.8], [31.32, 0.35], [34.8, 0.6], [41.72, 1], [43.72, 0.7]];
const FLASH = [[7.38, 0.2], [25.16, 0.26], [28.24, 0.18], [41.72, 0.22]];
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
    E.est.forEach(([y, f]) => { if (Math.abs(k.y - y) < alto + 1200) f(g); });
    E.ro(g);
    return { g, k };
  };
  return E;
}
