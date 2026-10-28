// El mundo de las rayas de la cebra, todo en 2D, en un svg con la cámara dentro (un transform del grupo), por estaciones:
//   y = 1000   la cebra de cerca, con un tábano que la ronda (gancho y cierre: el último fotograma es el primero)
//   y = 4000   la sabana al atardecer: un león de espaldas; en su mirada, la cebra lejana se emborrona y se ve gris
//   y = 7000   la cebra entera; la cámara baja hasta un tábano en su piel. Debajo, el corte de la piel: pelo corto
//   y = 10000  la granja de 2019: una cebra y un caballo; los tábanos se acercan igual, pero en la cebra no se posan
//   y = 13000  el lomo de la cebra en grande: un tábano pasa de largo, otro choca y rebota
//   y = 16000  las pruebas: caballos con manta lisa y con manta de rayas; más abajo, dos vacas, una pintada
//   y = 19000  el ojo del tábano; debajo, lo que ve al llegar: las rayas tiemblan y no sabe dónde posarse
const K = window.K;
const NS = "http://www.w3.org/2000/svg";
const PI = Math.PI;

export const ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", CIAN = "#5fd4ff";
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 56.28;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);
const fr = (v) => v - Math.floor(v);

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, leon: 5.13, tabano: 10.28, granja: 21.74, aterrizaje: 31.52, pruebas: 36.08, ojo: 46.467, cierre: 52.88 };

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
const LE = 4000, TA = 7000, GR = 10500, AT = 13500, PR = 16500, OJ = 20200;
const PIEL = TA + 1800;                    // la superficie de la piel en el corte

// ── la cámara: el punto (x, y) del mundo queda en (540, 1000) con zoom z ───────────────────────────────────────
export const F0 = { x: 120, y: 900, z: 1.2 };
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
  [0, [[0, F0], [1.6, Z(112, 1.25, 890)], [3.3, Z(118, 1.3, 872)], [3.95, Z(160, 1.46, 885)], [G0.leon, Z(150, 1.42, 885)]]],
  [G0.leon, [[G0.leon, Z(540, 1.0, LE + 60)], [6.4, Z(545, 1.04, LE + 10)], [7.7, Z(560, 1.28, LE - 210)], [G0.tabano, Z(560, 1.36, LE - 230)]]],
  [G0.tabano, [[G0.tabano, Z(470, 0.62, TA + 40)], [11.4, Z(482, 0.68, TA + 30)], [13.1, Z(600, 7.6, TA)], [16.93, Z(600, 9.0, TA)]]],
  [16.93, [[16.93, Z(540, 1.08, PIEL - 60)], [19.5, Z(540, 1.22, PIEL - 20)], [G0.granja, Z(540, 1.38, PIEL)]]],
  [G0.granja, [[G0.granja, Z(540, 0.92, GR + 150)], [24.5, Z(540, 1.0, GR + 160)], [29.0, Z(540, 1.0, GR + 160)], [G0.aterrizaje, Z(540, 1.05, GR + 160)]]],
  [G0.aterrizaje, [[G0.aterrizaje, Z(540, 1.0, AT - 20)], [34.2, Z(540, 1.04, AT)], [34.45, Z(530, 1.1, AT + 20)], [G0.pruebas, Z(540, 1.06, AT + 10)]]],
  [G0.pruebas, [[G0.pruebas, Z(540, 0.94, PR + 40)], [41.2, Z(540, 1.0, PR + 40)], [41.8, Z(540, 1.0, PR + 1640)], [G0.ojo, Z(540, 1.05, PR + 1650)]]],
  [G0.ojo, [[G0.ojo, Z(540, 0.9, OJ + 30)], [49.2, Z(540, 1.15, OJ)]]],
  [49.24, [[49.24, Z(540, 1.0, OJ + 2400)], [51.8, Z(540, 1.75, OJ + 2400)], [G0.cierre, Z(540, 1.85, OJ + 2400)]]],
  [G0.cierre, [[G0.cierre, Z(260, 0.6, 1000)], [54.1, Z(190, 0.76, 950)], [55.7, F0], [TOTAL, F0]]],
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
.c-etq .tacha { position: absolute; left: 12px; right: 12px; top: 48%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240,68,90,0.7); }
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

// ── la silueta de un équido (cebra o caballo), mirando a la izquierda, en sus coordenadas ───────────────────────
const CUERPO = "M-330 60 C-370 -20 -350 -110 -280 -150 C-200 -185 -60 -175 60 -170 C180 -168 290 -185 360 -150 C420 -118 430 -40 415 30 C402 90 380 130 330 150 C220 175 60 165 -60 165 C-180 165 -280 140 -330 60 Z";
const CABEZA = "M-280 -150 C-320 -230 -380 -330 -430 -400 C-450 -430 -470 -470 -500 -480 C-545 -492 -590 -470 -625 -425 C-670 -365 -715 -300 -745 -255 C-765 -222 -752 -190 -718 -182 C-690 -176 -655 -190 -625 -210 C-600 -228 -570 -235 -545 -220 C-480 -170 -410 -60 -340 40 Z";
const OREJAS = "M-470 -455 C-472 -500 -458 -548 -440 -566 C-428 -538 -428 -492 -445 -450 Z M-506 -470 C-516 -515 -511 -556 -497 -574 C-482 -546 -478 -506 -486 -465 Z";
const PATAS_LEJOS = "M-205 110 L-152 110 L-154 300 L-158 505 L-196 505 L-200 300 Z M322 80 L388 70 C398 190 383 280 368 330 L365 505 L329 505 L333 330 C341 270 333 190 322 80 Z";
const PATAS_CERCA = "M-305 95 L-250 100 L-246 300 C-247 380 -250 440 -252 505 L-290 505 C-292 440 -297 380 -299 300 Z M225 100 L298 90 C303 200 288 280 273 330 L270 505 L234 505 L238 330 C246 270 238 200 225 100 Z";
const MANTA = "M-292 -158 C-150 -190 150 -186 342 -166 C392 -130 406 -60 396 22 L332 122 C150 142 -100 142 -252 112 C-292 40 -312 -60 -292 -158 Z";
const linea = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join(" ");
function rayasCuerpo() {
  let d = "";
  for (let x = -300; x <= 222; x += 56) d += `M${x} -215 C${x - 18} -90 ${x + 22} 40 ${x - 6} 195 `;
  return d;
}
function rayasAnca() {
  let d = "";
  for (let i = 0; i < 6; i++) d += `M${250 + i * 27} -205 Q${300 + i * 8} ${-80 + i * 25} 445 ${-10 + i * 48} `;
  return d;
}
function rayasPatas() {
  let d = "";
  for (let y = 178; y <= 500; y += 40) d += `M-430 ${y} L470 ${y + 6} `;
  return d;
}
function rayasCuello() {
  let d = "";
  const A = [-310, -60], B = [-470, -430], L = Math.hypot(B[0] - A[0], B[1] - A[1]), dx = (B[0] - A[0]) / L, dy = (B[1] - A[1]) / L, nx = -dy, ny = dx;
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, cx = A[0] + t * (B[0] - A[0]), cy = A[1] + t * (B[1] - A[1]);
    d += `M${f1(cx - nx * 240)} ${f1(cy - ny * 240)} Q${f1(cx + dx * 16)} ${f1(cy + dy * 16)} ${f1(cx + nx * 240)} ${f1(cy + ny * 240)} `;
  }
  return d;
}
function rayasCara() {
  let d = "";
  const F = [-540, -450], M = [-720, -230], L = Math.hypot(M[0] - F[0], M[1] - F[1]), dx = (M[0] - F[0]) / L, dy = (M[1] - F[1]) / L, nx = -dy, ny = dx;
  for (let t = 0.08; t < 0.9; t += 0.105) {
    const cx = F[0] + t * (M[0] - F[0]), cy = F[1] + t * (M[1] - F[1]);
    d += `M${f1(cx - nx * 130)} ${f1(cy - ny * 130)} Q${f1(cx - dx * 10)} ${f1(cy - dy * 10)} ${f1(cx + nx * 130)} ${f1(cy + ny * 130)} `;
  }
  return d;
}
const R_CUERPO = rayasCuerpo(), R_ANCA = rayasAnca(), R_PATAS = rayasPatas(), R_CUELLO = rayasCuello(), R_CARA = rayasCara();
const NEGRO = "#151417", BLANCO = "#f3efe6";

// ── la silueta de una vaca, mirando a la izquierda ──────────────────────────────────────────────────────────────
const VACA = "M-300 -150 C-150 -178 150 -178 300 -162 C352 -150 372 -100 372 -30 C372 40 352 100 300 126 C150 150 -150 150 -282 126 C-332 100 -346 20 -340 -60 C-335 -110 -320 -140 -300 -150 Z";
const VACA_CABEZA = "M-300 -140 C-362 -152 -422 -142 -472 -112 C-522 -72 -548 -2 -542 40 C-536 72 -500 86 -470 76 C-430 60 -380 22 -336 2 Z";
const VACA_PATAS = "M-270 100 L-205 105 L-208 430 L-262 430 Z M-160 110 L-105 110 L-108 430 L-158 430 Z M190 105 L250 100 L250 430 L196 430 Z M280 95 L338 90 L336 430 L284 430 Z";
const VACA_CUERNOS = "M-452 -118 C-462 -150 -450 -178 -425 -190 C-438 -168 -440 -144 -432 -122 Z M-412 -126 C-410 -160 -392 -184 -364 -190 C-382 -170 -390 -148 -392 -126 Z";

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,170,90,0.2)"/><stop offset="0.55" stop-color="rgba(200,110,60,0.08)"/><stop offset="1" stop-color="rgba(200,110,60,0)"/></radialGradient>
  <radialGradient id="c-mota" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,220,160,0.7)"/><stop offset="1" stop-color="rgba(255,220,160,0)"/></radialGradient>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.6)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <linearGradient id="c-panza" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,250,235,0.12)"/><stop offset="0.45" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(20,10,0,0.4)"/></linearGradient>
  <linearGradient id="c-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1530"/><stop offset="0.45" stop-color="#5a2c3a"/><stop offset="0.8" stop-color="#c8643a"/><stop offset="1" stop-color="#f2a04a"/></linearGradient>
  <linearGradient id="c-suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a1c"/><stop offset="0.3" stop-color="#3a2614"/><stop offset="1" stop-color="#140d07"/></linearGradient>
  <radialGradient id="c-sol" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff2c8"/><stop offset="0.35" stop-color="#ffc46a"/><stop offset="0.6" stop-color="rgba(255,150,70,0.45)"/><stop offset="1" stop-color="rgba(255,120,60,0)"/></radialGradient>
  <linearGradient id="c-prado" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3a1c"/><stop offset="1" stop-color="#111a0b"/></linearGradient>
  <linearGradient id="c-abdomen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d5a40"/><stop offset="0.5" stop-color="#4a3b29"/><stop offset="1" stop-color="#2c2216"/></linearGradient>
  <linearGradient id="c-ojo-mosca" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#42d17a"/><stop offset="0.18" stop-color="#42d17a"/><stop offset="0.2" stop-color="#8a3fc4"/><stop offset="0.36" stop-color="#8a3fc4"/>
    <stop offset="0.38" stop-color="#3fb4d9"/><stop offset="0.55" stop-color="#3fb4d9"/><stop offset="0.57" stop-color="#8a3fc4"/><stop offset="0.74" stop-color="#8a3fc4"/>
    <stop offset="0.76" stop-color="#42d17a"/><stop offset="1" stop-color="#2a8a50"/></linearGradient>
  <radialGradient id="c-brillo-ojo" cx="0.35" cy="0.3" r="0.6"><stop offset="0" stop-color="rgba(255,255,255,0.55)"/><stop offset="0.4" stop-color="rgba(255,255,255,0.08)"/><stop offset="1" stop-color="rgba(0,0,0,0.35)"/></radialGradient>
  <linearGradient id="c-carne" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2a28e"/><stop offset="0.15" stop-color="#c9806c"/><stop offset="1" stop-color="#5a2626"/></linearGradient>
  <radialGradient id="c-sangre" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,70,70,0.95)"/><stop offset="1" stop-color="rgba(255,40,40,0)"/></radialGradient>
  <radialGradient id="c-germen" cx="0.4" cy="0.35" r="0.65"><stop offset="0" stop-color="#e7b6ff"/><stop offset="0.6" stop-color="#9b3fd6"/><stop offset="1" stop-color="#4f1a7a"/></radialGradient>
  <linearGradient id="c-manta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f86a8"/><stop offset="1" stop-color="#3c4d68"/></linearGradient>
  <pattern id="c-rejilla" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0.75H60M0.75 0V60" stroke="rgba(255,200,140,0.08)" stroke-width="1.5"/></pattern>
  <pattern id="c-panal" width="52" height="90" patternUnits="userSpaceOnUse"><path d="M26 0 L52 15 L52 45 L26 60 L0 45 L0 15 Z M26 60 L26 90 M0 45 L-26 60 M52 45 L78 60" fill="none" stroke="rgba(10,8,6,0.55)" stroke-width="4"/></pattern>
  <pattern id="c-panal-ojo" width="13" height="22.5" patternUnits="userSpaceOnUse"><path d="M6.5 0 L13 3.75 L13 11.25 L6.5 15 L0 11.25 L0 3.75 Z M6.5 15 L6.5 22.5" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="1.2"/></pattern>
  <clipPath id="c-z-cuerpo"><path d="${CUERPO}"/></clipPath>
  <clipPath id="c-z-cabeza"><path d="${CABEZA}"/><path d="${OREJAS}"/></clipPath>
  <clipPath id="c-z-lejos"><path d="${PATAS_LEJOS}"/></clipPath>
  <clipPath id="c-z-cerca"><path d="${PATAS_CERCA}"/></clipPath>
  <clipPath id="c-z-manta"><path d="${MANTA}"/></clipPath>
  <clipPath id="c-vaca"><path d="${VACA}"/><path d="${VACA_CABEZA}"/><path d="${VACA_PATAS}"/></clipPath>
  <clipPath id="c-lente"><circle cx="560" cy="${LE - 230}" r="300"/></clipPath>
  <clipPath id="c-pinta"><rect class="c-pinta-r" x="-600" y="-300" width="0" height="800"/></clipPath>
  <filter id="c-borroso" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0"/></filter>
</defs>`;

// una cebra (o un caballo): devuelve su grupo
function equido(p, x, y, s, o = {}) {
  const cebra = o.tipo !== "caballo";
  const base = cebra ? BLANCO : "#8a5631", oscuro = cebra ? NEGRO : "#2a170c";
  const G = el(p, "g", { transform: `translate(${x} ${y}) scale(${s})` });
  if (o.sombra !== false) el(G, "ellipse", { cx: 40, cy: 515, rx: 520, ry: 46, fill: u("sombra") });
  const borde = { stroke: "rgba(0,0,0,0.55)", "stroke-width": 5, "stroke-linejoin": "round" };
  // las patas de lejos, más oscuras
  el(G, "path", { d: PATAS_LEJOS, fill: base, ...borde });
  if (cebra) el(el(G, "g", { "clip-path": u("z-lejos") }), "path", { d: R_PATAS, stroke: NEGRO, "stroke-width": 20, fill: "none" });
  el(G, "path", { d: PATAS_LEJOS, fill: "rgba(0,0,0,0.3)" });
  // el cuerpo
  el(G, "path", { d: CUERPO, fill: base, ...borde });
  const cg = el(G, "g", { "clip-path": u("z-cuerpo") });
  if (cebra) {
    el(cg, "path", { d: R_CUERPO, stroke: NEGRO, "stroke-width": 30, fill: "none", "stroke-linecap": "round" });
    el(cg, "path", { d: R_ANCA, stroke: NEGRO, "stroke-width": 22, fill: "none", "stroke-linecap": "round" });
  }
  el(cg, "rect", { x: -400, y: -200, width: 850, height: 380, fill: u("panza") });
  // las patas de cerca
  el(G, "path", { d: PATAS_CERCA, fill: base, ...borde });
  if (cebra) el(el(G, "g", { "clip-path": u("z-cerca") }), "path", { d: R_PATAS, stroke: NEGRO, "stroke-width": 20, fill: "none" });
  [[-290, -252], [-196, -158], [234, 270], [329, 365]].forEach(([a, b]) => el(G, "rect", { x: a - 2, y: 488, width: b - a + 4, height: 30, rx: 6, fill: "#0b0a0a" }));
  // la manta
  if (o.manta) {
    const m = el(G, "g");
    el(m, "path", { d: MANTA, fill: o.manta === "rayas" ? BLANCO : u("manta"), stroke: "rgba(0,0,0,0.6)", "stroke-width": 5 });
    if (o.manta === "rayas") el(el(m, "g", { "clip-path": u("z-manta") }), "path", { d: R_CUERPO + R_ANCA, stroke: NEGRO, "stroke-width": 28, fill: "none" });
    el(m, "path", { d: MANTA, fill: "none", stroke: o.manta === "rayas" ? "#d9b04a" : "#a8b8d0", "stroke-width": 9, "stroke-dasharray": "2 14", "stroke-linecap": "round" });
    G.manta = m;
  }
  // el cuello y la cabeza
  el(G, "path", { d: OREJAS, fill: base, ...borde });
  el(G, "path", { d: CABEZA, fill: base, ...borde });
  const hg = el(G, "g", { "clip-path": u("z-cabeza") });
  if (cebra) {
    el(hg, "path", { d: R_CUELLO, stroke: NEGRO, "stroke-width": 30, fill: "none", "stroke-linecap": "round" });
    el(hg, "path", { d: R_CARA, stroke: NEGRO, "stroke-width": 14, fill: "none", "stroke-linecap": "round" });
  }
  el(hg, "path", { d: "M-470 -455 L-440 -566 M-506 -470 L-497 -574", stroke: oscuro, "stroke-width": 16, "stroke-linecap": "round" });
  el(G, "ellipse", { cx: -726, cy: -214, rx: 44, ry: 38, fill: cebra ? "#1b1a1c" : "#3a2216" });
  el(G, "ellipse", { cx: -742, cy: -228, rx: 9, ry: 6, fill: "#000", opacity: 0.8 });
  el(G, "ellipse", { cx: -578, cy: -392, rx: 15, ry: 11, fill: "#0a0808" });
  el(G, "circle", { cx: -583, cy: -396, r: 4, fill: "#fff", opacity: 0.85 });
  // la crin
  const crin = "M-292 -168 C-342 -262 -402 -362 -476 -476";
  el(G, "path", { d: crin, stroke: cebra ? BLANCO : oscuro, "stroke-width": 34, fill: "none", "stroke-linecap": "round", ...(cebra ? {} : {}) });
  if (cebra) el(G, "path", { d: crin, stroke: NEGRO, "stroke-width": 34, fill: "none", "stroke-dasharray": "17 15" });
  // la cola
  el(G, "path", { d: "M408 -122 C442 -62 454 40 448 168", stroke: base, "stroke-width": 15, fill: "none", "stroke-linecap": "round" });
  el(G, "ellipse", { cx: 450, cy: 200, rx: 18, ry: 44, fill: oscuro });
  return G;
}

function vaca(p, x, y, s, pintada) {
  const G = el(p, "g", { transform: `translate(${x} ${y}) scale(${s})` });
  el(G, "ellipse", { cx: 0, cy: 440, rx: 470, ry: 42, fill: u("sombra") });
  const neg = "#1e1c21", borde = { stroke: "rgba(255,255,255,0.18)", "stroke-width": 4 };
  el(G, "path", { d: "M366 -120 C392 -50 398 80 392 210", stroke: neg, "stroke-width": 14, fill: "none", "stroke-linecap": "round" });
  el(G, "ellipse", { cx: 392, cy: 236, rx: 16, ry: 34, fill: "#0e0d10" });
  el(G, "path", { d: VACA_PATAS, fill: neg, ...borde });
  el(G, "path", { d: VACA, fill: neg, ...borde });
  el(G, "path", { d: VACA_CUERNOS, fill: "#d8cdb6" });
  el(G, "path", { d: VACA_CABEZA, fill: neg, ...borde });
  el(G, "path", { d: "M-452 -110 C-490 -128 -520 -128 -540 -112 C-520 -98 -490 -96 -456 -98 Z", fill: neg, ...borde });
  el(G, "ellipse", { cx: -515, cy: 46, rx: 34, ry: 28, fill: "#3a3238" });
  el(G, "circle", { cx: -455, cy: -60, r: 10, fill: "#000" }); el(G, "circle", { cx: -458, cy: -63, r: 3.5, fill: "#fff" });
  let pinta = null;
  if (pintada) {
    const w = el(G, "g", { "clip-path": u("vaca") });
    const r = el(w, "g", { "clip-path": u("pinta") });
    let d = "";
    for (let xx = -560; xx <= 380; xx += 70) d += `M${xx} -220 C${xx - 22} -60 ${xx + 26} 120 ${xx - 8} 450 `;
    el(r, "path", { d, stroke: "#f5f1e8", "stroke-width": 30, fill: "none", "stroke-linecap": "round" });
    pinta = r;
  }
  el(G, "rect", { x: -350, y: -180, width: 730, height: 330, fill: u("panza"), "clip-path": u("vaca") });
  return { G, pinta };
}

// ── el tábano, visto desde arriba, mirando a +x ─────────────────────────────────────────────────────────────────
function mosca(p) {
  const g = el(p, "g", { opacity: 0 });
  const patas = [[8, 8, 30, 32], [8, -8, 30, -32], [0, 10, -2, 40], [0, -10, -2, -40], [-8, 9, -32, 34], [-8, -9, -32, -34]];
  patas.forEach(([x1, y1, x2, y2]) => el(g, "path", { d: `M${x1} ${y1} Q${(x1 + x2) / 2 + 8} ${(y1 + y2) / 2} ${x2} ${y2}`, stroke: "#1a140e", "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" }));
  el(g, "ellipse", { cx: -42, cy: 0, rx: 44, ry: 24, fill: u("abdomen"), stroke: "#1a140e", "stroke-width": 2.5 });
  for (let i = 0; i < 4; i++) el(g, "path", { d: `M${-70 + i * 15} -21 Q${-66 + i * 15} 0 ${-70 + i * 15} 21`, stroke: "rgba(235,205,150,0.5)", "stroke-width": 4, fill: "none" });
  el(g, "ellipse", { cx: -2, cy: 0, rx: 25, ry: 22, fill: "#4c3b2a", stroke: "#1a140e", "stroke-width": 2.5 });
  el(g, "path", { d: "M-18 -7 H12 M-18 7 H12", stroke: "rgba(220,200,160,0.45)", "stroke-width": 3 });
  el(g, "ellipse", { cx: 24, cy: 0, rx: 13, ry: 23, fill: "#2a2018" });
  [-12, 12].forEach((yy) => { el(g, "ellipse", { cx: 28, cy: yy, rx: 14, ry: 13, fill: u("ojo-mosca") }); el(g, "ellipse", { cx: 28, cy: yy, rx: 14, ry: 13, fill: u("brillo-ojo") }); });
  const alas = [1, -1].map((sg) => {
    const a = el(g, "g");
    el(a, "ellipse", { cx: 40, cy: 0, rx: 52, ry: 15, fill: "rgba(210,228,248,0.34)", stroke: "rgba(235,242,255,0.7)", "stroke-width": 2 });
    el(a, "path", { d: "M0 0 L88 -2 M20 0 L70 9 M30 0 L80 -9", stroke: "rgba(255,255,255,0.35)", "stroke-width": 1.5 });
    return { a, sg };
  });
  // x, y en el mundo; ang en grados; s, la escala; aleteo de 0 (plegadas) a 1
  return (x, y, ang, s, op, aleteo, g0) => {
    pon1(g, "opacity", f1(op));
    if (op < 0.01) return;
    g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)}) scale(${s.toFixed(3)})`);
    const fl = aleteo * (0.5 + 0.5 * Math.sin(vuelta(g0, 13)));
    alas.forEach(({ a, sg }) => a.setAttribute("transform", `translate(-4 ${sg * 10}) rotate(${f1(sg * (162 - 50 * fl))})`));
  };
}
// el tábano de lado (para el corte de la piel), mirando a +x; trompa: lo que baja la trompa
function moscaLado(p, x, y, s) {
  const g = el(p, "g", { transform: `translate(${x} ${y}) scale(${s})` });
  const trompa = el(g, "path", { stroke: "#2a1a10", "stroke-width": 5, fill: "none", "stroke-linecap": "round" });
  [[8, 30], [-6, 33], [-22, 30]].forEach(([xx, yy], i) => el(g, "path", { d: `M${xx} 4 Q${xx + 12 - i * 8} 18 ${xx + 6 - i * 10} ${yy}`, stroke: "#1a140e", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }));
  const ala = el(g, "ellipse", { cx: -30, cy: -34, rx: 54, ry: 14, fill: "rgba(210,228,248,0.36)", stroke: "rgba(235,242,255,0.75)", "stroke-width": 2 });
  el(g, "ellipse", { cx: -40, cy: -4, rx: 42, ry: 19, fill: u("abdomen"), stroke: "#1a140e", "stroke-width": 2.5, transform: "rotate(8 -40 -4)" });
  for (let i = 0; i < 4; i++) el(g, "path", { d: `M${-66 + i * 14} -20 Q${-62 + i * 14} -2 ${-64 + i * 14} 14`, stroke: "rgba(235,205,150,0.5)", "stroke-width": 3.5, fill: "none" });
  el(g, "circle", { cx: -2, cy: -6, r: 22, fill: "#4c3b2a", stroke: "#1a140e", "stroke-width": 2.5 });
  el(g, "ellipse", { cx: 26, cy: -4, rx: 17, ry: 19, fill: u("ojo-mosca") });
  el(g, "ellipse", { cx: 26, cy: -4, rx: 17, ry: 19, fill: u("brillo-ojo") });
  return (largo, g0) => {
    trompa.setAttribute("d", `M36 6 L${f1(38 + largo * 0.05)} ${f1(30 + largo)}`);
    ala.setAttribute("transform", `rotate(${f1(-6 * Math.sin(vuelta(g0, 1.3)))} -2 -20)`);
  };
}
// un germen: una bola morada con pinchos
function germen(p) {
  const g = el(p, "g", { opacity: 0 });
  for (let i = 0; i < 10; i++) { const a = (i * PI) / 5; el(g, "path", { d: `M${f1(Math.cos(a) * 16)} ${f1(Math.sin(a) * 16)} L${f1(Math.cos(a) * 26)} ${f1(Math.sin(a) * 26)}`, stroke: "#c27ef0", "stroke-width": 4, "stroke-linecap": "round" }); el(g, "circle", { cx: f1(Math.cos(a) * 27), cy: f1(Math.sin(a) * 27), r: 4, fill: "#e7b6ff" }); }
  el(g, "circle", { r: 18, fill: u("germen") });
  el(g, "circle", { cx: -5, cy: -4, r: 4, fill: "rgba(255,255,255,0.6)" });
  return g;
}

// ── el sitio: fondo oscuro con rejilla, una luz cálida en cada estación y polvo que flota ───────────────────────
function fondo(p) {
  el(p, "rect", { x: -4000, y: -4000, width: 9000, height: 30000, fill: "#0c0b0a" });
  el(p, "rect", { x: -4000, y: -4000, width: 9000, height: 30000, fill: u("rejilla") });
  [1000, LE, TA, PIEL, GR, AT, PR, PR + 1700, OJ, OJ + 2400].forEach((y) => el(p, "ellipse", { cx: 540, cy: y, rx: 1200, ry: 1300, fill: u("luz") }));
  const r = K.azar(5), motas = [];
  for (let i = 0; i < 80; i++) {
    const reg = [1000, LE, TA, GR, AT, PR, PR + 1700, OJ][i % 8];
    motas.push({ e: el(p, "circle", { r: 4 + r() * 10, fill: u("mota") }), x: -250 + r() * 1580, y: reg - 1100 + r() * 2300, f: r(), w: r() * 6.28 });
  }
  return (g) => motas.forEach((m) => {
    const ph = fr(ciclo(g, 0.05) + m.f);
    m.e.setAttribute("cx", f1(m.x + 30 * Math.sin(vuelta(g, 0.08) + m.w)));
    m.e.setAttribute("cy", f1(m.y - 260 * ph));
    m.e.setAttribute("opacity", f1(0.7 * Math.sin(PI * ph)));
  });
}

// ── gancho y cierre: la cebra de cerca, un tábano que la ronda y otro que se lanza y rebota ─────────────────────
function gancho(p) {
  el(p, "rect", { x: -900, y: -400, width: 2900, height: 3000, fill: u("prado"), opacity: 0.55 });
  for (let i = 0; i < 40; i++) { const x = -500 + i * 50; el(p, "path", { d: `M${x} 1700 q8 -60 18 -110 M${x + 20} 1700 q-4 -50 -14 -90`, stroke: "rgba(140,170,80,0.3)", "stroke-width": 6, fill: "none" }); }
  equido(p, 600, 1150, 1);
  const ronda = [mosca(p), mosca(p)];
  const salta = mosca(p);
  const chispa = el(p, "g", { opacity: 0 });
  for (let i = 0; i < 8; i++) { const a = (i * PI) / 4; el(chispa, "path", { d: `M${f1(Math.cos(a) * 26)} ${f1(Math.sin(a) * 26)} L${f1(Math.cos(a) * 62)} ${f1(Math.sin(a) * 62)}`, stroke: ORO, "stroke-width": 9, "stroke-linecap": "round" }); }
  const orbita = (g, i) => {
    const t = vuelta(g, 0.36) + i * PI, x = 100 + 270 * Math.cos(t) + 30 * Math.sin(3 * t), y = 790 + 150 * Math.sin(t) + 26 * Math.cos(2 * t);
    return [x, y];
  };
  // la que se lanza: sale de arriba a la derecha, choca con el cuello y rebota dando vueltas
  const lanza = (g, t0) => {
    const a = K.tramo(g, t0, t0 + 0.62), b = K.tramo(g, t0 + 0.62, t0 + 1.5);
    if (g < t0 + 0.62) { const e = K.entra(a); return [K.mez(820, 236, e), K.mez(470, 930, e), Math.atan2(460, -584) * 180 / PI, 1, 1]; }
    const e = K.sale(b);
    return [K.mez(236, 760, e), K.mez(930, 1320, e) - 260 * Math.sin(PI * e), 141 + 900 * e, 1 - K.tramo(b, 0.75, 1), 1];
  };
  return (g) => {
    ronda.forEach((m, i) => {
      const [x, y] = orbita(g, i), [x2, y2] = orbita(g + 0.02, i);
      m(x, y, Math.atan2(y2 - y, x2 - x) * 180 / PI, 1.55, 1, 1, g);
    });
    let t0 = null;
    if (g > 3.2 && g < 5.2) t0 = 3.28;
    if (g > 53.3 && g < 55.3) t0 = 53.4;
    if (t0 === null) salta(0, 0, 0, 1, 0, 1, g);
    else { const [x, y, ang, op] = lanza(g, t0); salta(x, y, ang, 1.9, g < t0 ? 0 : op, 1, g); }
    const ch = t0 === null ? 0 : asoma(g, t0 + 0.6, t0 + 0.85);
    pon1(chispa, "opacity", f1(ch));
    chispa.setAttribute("transform", `translate(236 930) scale(${f1(0.6 + 0.6 * K.tramo(g, (t0 || 0) + 0.6, (t0 || 0) + 1.0))})`);
  };
}

// ── la sabana: un león de espaldas; en su mirada, la cebra lejana se emborrona hasta verse gris ─────────────────
function sabana(p) {
  const H = LE + 150;
  el(p, "rect", { x: -700, y: LE - 1300, width: 2500, height: 1450, fill: u("cielo") });
  el(p, "circle", { cx: 780, cy: H - 10, r: 260, fill: u("sol") });
  el(p, "rect", { x: -700, y: H, width: 2500, height: 1300, fill: u("suelo") });
  // la acacia
  el(p, "path", { d: `M880 ${H} L892 ${H - 150} L860 ${H - 210} M892 ${H - 150} L930 ${H - 220}`, stroke: "#1a0f08", "stroke-width": 12, fill: "none", "stroke-linecap": "round" });
  el(p, "path", { d: `M770 ${H - 205} C800 ${H - 260} 1000 ${H - 270} 1040 ${H - 215} C980 ${H - 195} 820 ${H - 190} 770 ${H - 205} Z`, fill: "#1a0f08" });
  // las cebras lejanas
  [[610, 0.075], [668, 0.082], [722, 0.07]].forEach(([x, s], i) => equido(p, x, H - 2 - i, s, { sombra: false }));
  // la hierba
  const r = K.azar(11);
  for (let i = 0; i < 120; i++) { const x = -300 + r() * 1700, y = H + 10 + r() * 900, h = 20 + (y - H) * 0.12; el(p, "path", { d: `M${f1(x)} ${f1(y)} q${f1(4 + r() * 8)} ${f1(-h * 0.6)} ${f1(10 + r() * 10)} ${f1(-h)}`, stroke: `rgba(${150 + r() * 60},${100 + r() * 40},50,0.5)`, "stroke-width": 4, fill: "none" }); }
  // el león de espaldas: lomo, melena de mechones y orejas
  const leon = el(p, "g", { transform: `translate(300 ${LE + 600})` });
  el(leon, "path", { d: "M-330 520 C-320 300 -180 170 0 170 C180 170 360 300 380 520 Z", fill: "#7a4a1e", stroke: "#2a1608", "stroke-width": 6 });
  el(leon, "path", { d: "M-200 520 C-190 360 -90 260 20 250", stroke: "rgba(255,190,110,0.35)", "stroke-width": 14, fill: "none", "stroke-linecap": "round" });
  const rl = K.azar(17);
  for (let capa = 0; capa < 3; capa++) {
    const R = 250 - capa * 55, col = ["#3a1c0a", "#6a3510", "#94531c"][capa];
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * 2 * PI + capa * 0.1, l = 60 + rl() * 50, w = 0.13;
      const x0 = Math.cos(a - w) * R * 0.5, y0 = Math.sin(a - w) * R * 0.5, x1 = Math.cos(a + w) * R * 0.5, y1 = Math.sin(a + w) * R * 0.5;
      const xt = Math.cos(a) * (R + l * 0.4), yt = Math.sin(a) * (R + l * 0.4) * 0.92;
      el(leon, "path", { d: `M${f1(x0)} ${f1(y0)} Q${f1(xt * 0.8 + 18)} ${f1(yt * 0.8)} ${f1(xt)} ${f1(yt)} Q${f1(xt * 0.8 - 18)} ${f1(yt * 0.8)} ${f1(x1)} ${f1(y1)} Z`, fill: col, stroke: "rgba(255,170,80,0.55)", "stroke-width": 3 });
    }
  }
  el(leon, "path", { d: "M-135 -170 C-160 -235 -105 -262 -78 -215 Z M135 -170 C160 -235 105 -262 78 -215 Z", fill: "#a8641f", stroke: "#2a1608", "stroke-width": 6 });
  el(leon, "circle", { r: 120, fill: "#a8641f" });
  el(leon, "path", { d: "M-95 -70 C-50 -120 50 -120 95 -70", stroke: "rgba(255,210,140,0.6)", "stroke-width": 10, fill: "none", "stroke-linecap": "round" });
  // la mirada
  const mirada = el(p, "path", { d: `M330 ${LE + 480} L640 ${H - 20}`, stroke: "rgba(255,220,150,0.8)", "stroke-width": 5, "stroke-dasharray": "14 14", fill: "none", opacity: 0 });
  // la lente: lo que ve el león, ampliado
  const lente = el(p, "g", { opacity: 0 });
  const dentro = el(lente, "g", { "clip-path": u("lente") });
  el(dentro, "rect", { x: 200, y: LE - 560, width: 720, height: 360, fill: u("cielo") });
  el(dentro, "rect", { x: 200, y: LE - 200, width: 720, height: 360, fill: "#6a4524" });
  const borr = el(dentro, "g", { filter: u("borroso") });
  const zl = equido(borr, 600, LE - 170, 0.36);
  el(lente, "circle", { cx: 560, cy: LE - 230, r: 300, fill: "none", stroke: ORO, "stroke-width": 10 });
  el(lente, "circle", { cx: 560, cy: LE - 230, r: 318, fill: "none", stroke: "rgba(255,194,74,0.3)", "stroke-width": 18 });
  const gris = el(lente, "g", { opacity: 0 });
  el(gris, "rect", { x: 760, y: LE + 20, width: 110, height: 110, rx: 18, fill: "#8b8580", stroke: "#fff", "stroke-width": 5 });
  let blur = null;
  return (g) => {
    if (!blur) blur = p.ownerSVGElement.querySelector(`#${PRE_DE.get(p)}borroso feGaussianBlur`);
    pon1(mirada, "opacity", f1(0.9 * asoma(g, 6.35, 9.9)));
    mirada.setAttribute("stroke-dashoffset", f1(-60 * g));
    const ap = K.sale(K.tramo(g, 6.6, 7.2));
    pon1(lente, "opacity", f1(ap));
    lente.setAttribute("transform", `translate(560 ${LE - 230}) scale(${f1(0.4 + 0.6 * ap)}) translate(-560 ${-(LE - 230)})`);
    const b = sube(g, 7.95, 9.3);
    if (blur) pon1(blur, "stdDeviation", (9 * b).toFixed(2));
    zl.setAttribute("transform", `translate(${f1(600 - 30 * b)} ${LE - 170}) scale(${(0.36 - 0.07 * b).toFixed(3)})`);
    pon1(gris, "opacity", f1(asoma(g, 9.4)));
  };
}
const PRE_DE = new Map();     // de qué escena es cada grupo (para buscar su filtro)

// ── el tábano en la piel de la cebra, y el corte de la piel ─────────────────────────────────────────────────────
function tabano(p) {
  el(p, "rect", { x: -900, y: TA - 1000, width: 2900, height: 2000, fill: u("prado"), opacity: 0.5 });
  equido(p, 560, TA + 60, 1);
  // el pelo de cerca: trazos pequeños alrededor del tábano
  const pelo = el(p, "g", { opacity: 0 });
  const r = K.azar(21);
  for (let i = 0; i < 520; i++) { const x = 600 + (r() - 0.5) * 170, y = TA + (r() - 0.5) * 300, a = 1.3 + r() * 0.5; el(pelo, "path", { d: `M${f1(x)} ${f1(y)} l${f1(Math.cos(a) * 3)} ${f1(Math.sin(a) * 3)}`, stroke: r() < 0.5 ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.28)", "stroke-width": 0.7, "stroke-linecap": "round" }); }
  const m = mosca(p);
  const ondas = [0, 1, 2].map(() => el(p, "circle", { cx: 611, cy: TA, r: 2, fill: "none", stroke: ROJO, "stroke-width": 1.2, opacity: 0 }));
  const gota = el(p, "circle", { cx: 613, cy: TA, r: 0, fill: u("sangre") });
  const germenes = [0, 1, 2, 3, 4].map(() => germen(p));
  // el corte de la piel
  const S = PIEL;
  el(p, "rect", { x: -400, y: S, width: 1900, height: 1100, fill: u("carne") });
  el(p, "path", { d: `M-400 ${S + 4} H1500`, stroke: "rgba(255,225,210,0.8)", "stroke-width": 8 });
  const vasos = [S + 190, S + 330].map((y, i) => {
    el(p, "path", { d: `M-400 ${y} C0 ${y - 30} 300 ${y + 30} 600 ${y} S1200 ${y - 30} 1500 ${y}`, stroke: "#8a1622", "stroke-width": 40, fill: "none" });
    return el(p, "path", { d: `M-400 ${y} C0 ${y - 30} 300 ${y + 30} 600 ${y} S1200 ${y - 30} 1500 ${y}`, stroke: "#e2343f", "stroke-width": 16, fill: "none", "stroke-dasharray": "18 26", "stroke-linecap": "round", "data-i": i });
  });
  // el pelo corto, con sus rayas (grupos blancos y negros)
  for (let x = -380, i = 0; x < 1500; x += 12, i++) {
    const neg = Math.floor(i / 9) % 2 === 0;
    el(p, "path", { d: `M${x} ${S + 2} q4 -20 10 -36`, stroke: neg ? "#121114" : "#efe9de", "stroke-width": 6, fill: "none", "stroke-linecap": "round" });
  }
  const lado = moscaLado(p, 470, S - 134, 3);
  const pinchazo = el(p, "circle", { cx: 596, cy: S + 186, r: 0, fill: u("sangre") });
  return (g) => {
    // el tábano en la piel: aletea al llegar y se queda
    const llega = sube(g, 10.6, 12.6), x = K.mez(470, 600, llega), y = K.mez(TA - 260, TA, llega);
    m(x, y, -14 + 14 * llega, 0.35, 1, 1 - K.tramo(g, 12.4, 12.9), g);
    pon1(pelo, "opacity", f1(sube(g, 12.2, 13.2)));
    ondas.forEach((o, i) => {
      const k = K.tramo(g, 14.7 + i * 0.25, 15.6 + i * 0.25);
      pon1(o, "opacity", f1(k > 0 && k < 1 ? 1 - k : 0)); o.setAttribute("r", f1(2 + 22 * k));
    });
    gota.setAttribute("r", f1(5 * K.sale(K.tramo(g, 14.8, 15.3))));
    germenes.forEach((e, i) => {
      const a = -1.2 + i * 0.62, k = K.sale(K.tramo(g, 15.65 + i * 0.12, 16.6 + i * 0.12));
      const on = k > 0 ? 1 : 0;
      pon1(e, "opacity", f1(on));
      e.setAttribute("transform", `translate(${f1(613 + Math.cos(a) * 34 * k)} ${f1(TA + Math.sin(a) * 34 * k)}) scale(${f1(0.16 * k + 0.02 * Math.sin(vuelta(g, 2) + i))}) rotate(${f1(60 * g + i * 40)})`);
    });
    vasos.forEach((v, i) => v.setAttribute("stroke-dashoffset", f1(-90 * g * (i ? 0.8 : 1))));
    const baja = K.entra(K.tramo(g, 19.55, 20.3));
    lado(66 * baja + 6, g);
    pinchazo.setAttribute("r", f1(70 * K.sale(K.tramo(g, 20.3, 20.9)) * (0.85 + 0.15 * Math.sin(vuelta(g, 3)))));
  };
}

// ── la granja: una cebra y un caballo; los tábanos se acercan igual, pero en la cebra casi no se posan ──────────
function vuelo(n, semilla) {
  const r = K.azar(semilla);
  return Array.from({ length: n }, () => ({ f: 0.18 + r() * 0.2, ph: r() * 6.28, rx: 240 + r() * 90, ry: 120 + r() * 60, w: r() * 6.28, lx: (r() - 0.5) * 420, ly: -60 + (r() - 0.3) * 120 }));
}
function granja(p) {
  el(p, "rect", { x: -700, y: GR - 1000, width: 2500, height: 2700, fill: u("prado") });
  el(p, "rect", { x: -700, y: GR - 1000, width: 2500, height: 2700, fill: u("rejilla") });
  [GR + 290, GR + 900].forEach((y) => {
    for (let x = -100; x < 1300; x += 160) el(p, "rect", { x, y: y - 70, width: 16, height: 90, rx: 4, fill: "#5a3f26" });
    el(p, "path", { d: `M-200 ${y - 52} H1400 M-200 ${y - 16} H1400`, stroke: "#6a4a2c", "stroke-width": 10 });
  });
  const A = [{ x: 600, y: GR + 10, tipo: "cebra" }, { x: 600, y: GR + 600, tipo: "caballo" }];
  A.forEach((a) => equido(p, a.x, a.y, 0.42, { tipo: a.tipo }));
  // los tábanos: 12 por animal; se posan 3 en la cebra y 12 en el caballo
  const V = A.map((a, j) => vuelo(12, 30 + j).map((v, i) => ({ ...v, m: mosca(p), a, posa: j === 1 ? 28.95 + i * 0.13 : [29.3, 29.95, 30.55][i] ?? null })));
  const cuenta = A.map((a) => {
    const t = texto(p, 950, a.y - 40, "", { "font-size": 40, fill: "#fff" });
    const n = texto(p, 950, a.y + 40, "", { "font-size": 76 });
    return { t, n };
  });
  return (g) => {
    V.forEach((lista, j) => lista.forEach((v, i) => {
      const pos = (t) => {
        const th = vuelta(t, v.f) + v.ph;
        return [v.a.x - 40 + v.rx * Math.cos(th) + 40 * Math.sin(2 * th + v.w), v.a.y - 80 + v.ry * Math.sin(th) + 30 * Math.cos(3 * th)];
      };
      let [x, y] = pos(g), [x2, y2] = pos(g + 0.02), al = 1;
      if (v.posa !== null) {
        const k = K.suave(K.tramo(g, v.posa - 0.45, v.posa));
        const px = v.a.x - 40 + v.lx, py = v.a.y + v.ly;
        x = K.mez(x, px, k); y = K.mez(y, py, k); al = 1 - k;
        if (k >= 1) { x2 = x + 1; y2 = y - 0.3; }
      }
      const on = K.tramo(g, G0.granja + 0.3 + i * 0.12, G0.granja + 0.7 + i * 0.12);
      v.m(x, y, Math.atan2(y2 - y, x2 - x) * 180 / PI, 0.36, on, al, g + i);
    }));
    cuenta.forEach((c, j) => {
      const posan = g >= 28.9;
      const n = posan ? V[j].filter((v) => v.posa !== null && g >= v.posa).length : Math.round(31 * sube(g, 25.4, 28.0));
      const txt = posan ? "se posan" : "se acercan";
      if (c.t._v !== txt) { c.t.textContent = txt; c.t._v = txt; }
      if (c.n._v !== n) { c.n.textContent = String(n); c.n._v = n; }
      const on = posan ? 1 : sube(g, 25.2, 25.6);
      pon1(c.t, "opacity", f1(on)); pon1(c.n, "opacity", f1(on));
      pon1(c.n, "fill", posan ? (j ? ROJO : VERDE) : "#fff");
    });
  };
}

// ── el lomo de la cebra en grande: uno pasa de largo, otro choca y rebota (con su rastro: no frena) ─────────────
function aterrizaje(p) {
  equido(p, 560, AT + 640, 2.2, { sombra: false });
  const ms = [mosca(p), mosca(p)];
  const rastro = [0, 1].map(() => Array.from({ length: 30 }, () => el(p, "circle", { r: 7, fill: "rgba(255,220,150,0.85)", opacity: 0 })));
  const golpe = el(p, "g", { opacity: 0 });
  for (let i = 0; i < 8; i++) { const a = (i * PI) / 4 + 0.2; el(golpe, "path", { d: `M${f1(Math.cos(a) * 30)} ${f1(Math.sin(a) * 30)} L${f1(Math.cos(a) * 80)} ${f1(Math.sin(a) * 80)}`, stroke: ORO, "stroke-width": 10, "stroke-linecap": "round" }); }
  // el camino de cada una: puntos y segundos; la velocidad casi no cambia
  const C1 = [[31.75, -200, AT - 640], [32.75, 480, AT + 222], [33.5, 1300, AT + 100]];
  const C2 = [[33.4, 1150, AT - 450], [34.2, 430, AT + 252]];
  const en = (C, t) => {
    if (t <= C[0][0]) return [C[0][1], C[0][2]];
    for (let i = 1; i < C.length; i++) if (t <= C[i][0]) { const k = (t - C[i - 1][0]) / (C[i][0] - C[i - 1][0]); return [K.mez(C[i - 1][1], C[i][1], k), K.mez(C[i - 1][2], C[i][2], k)]; }
    const L = C[C.length - 1], P = C[C.length - 2], k = (t - L[0]) / (L[0] - P[0]);
    return [L[1] + (L[1] - P[1]) * k, L[2] + (L[2] - P[2]) * k];
  };
  const rebote = (t) => { const e = K.sale(K.tramo(t, 34.2, 35.4)); return [K.mez(430, 170, e), K.mez(AT + 252, AT - 330, e) - 120 * Math.sin(PI * e)]; };
  return (g) => {
    // la primera: entra, roza el lomo sin frenar y se va
    {
      const [x, y] = en(C1, g), [x2, y2] = en(C1, g + 0.02);
      ms[0](x, y, Math.atan2(y2 - y, x2 - x) * 180 / PI, 1.5, g > 31.6 && g < 33.9 ? 1 : 0, 1, g);
      rastro[0].forEach((c, i) => {
        const t = 31.75 + i * 0.07, on = g > t && g < 34.0 ? 0.9 * (1 - K.tramo(g, 33.4, 34.0)) : 0;
        pon1(c, "opacity", f1(on)); if (on) { const [cx, cy] = en(C1, t); c.setAttribute("cx", f1(cx)); c.setAttribute("cy", f1(cy)); }
      });
    }
    // la segunda: baja en picado, choca y rebota dando vueltas
    {
      let x, y, ang;
      if (g < 34.2) { [x, y] = en(C2, g); ang = Math.atan2(702, -720) * 180 / PI; }
      else { [x, y] = rebote(g); ang = 135 + 800 * K.sale(K.tramo(g, 34.2, 35.4)); }
      ms[1](x, y, ang, 1.5, g > 33.3 && g < 35.9 ? 1 - K.tramo(g, 35.4, 35.9) : 0, 1, g);
      rastro[1].forEach((c, i) => {
        const t = 33.4 + i * 0.07, on = g > t && t < 34.2 && g < 35.6 ? 0.9 * (1 - K.tramo(g, 35.0, 35.6)) : 0;
        pon1(c, "opacity", f1(on)); if (on) { const [cx, cy] = en(C2, t); c.setAttribute("cx", f1(cx)); c.setAttribute("cy", f1(cy)); }
      });
      pon1(golpe, "opacity", f1(asoma(g, 34.18, 34.5)));
      golpe.setAttribute("transform", `translate(420 ${AT + 262}) scale(${f1(0.7 + 0.8 * K.tramo(g, 34.18, 34.7))})`);
    }
  };
}

// ── las pruebas: caballos con manta, y vacas, una pintada de rayas ──────────────────────────────────────────────
function pruebas(p) {
  el(p, "rect", { x: -700, y: PR - 700, width: 2500, height: 3600, fill: u("prado") });
  el(p, "rect", { x: -700, y: PR - 700, width: 2500, height: 3600, fill: u("rejilla") });
  const H = [{ x: 600, y: PR - 140, manta: "lisa", posa: 10 }, { x: 600, y: PR + 440, manta: "rayas", posa: 2 }];
  H.forEach((h) => { h.G = equido(p, h.x, h.y, 0.42, { tipo: "caballo", manta: h.manta }); });
  const tag = (x, y, t, col) => { const e = texto(p, x, y, t, { "font-size": 34, fill: col }); return e; };
  H[0].tag = tag(920, PR - 160, "manta lisa", "#c9d6ea"); H[1].tag = tag(920, PR + 420, "manta de rayas", ORO);
  const vacas = [{ x: 590, y: PR + 1480, pintada: false, posa: 10 }, { x: 590, y: PR + 2060, pintada: true, posa: 5 }];
  vacas.forEach((v) => { const r = vaca(p, v.x, v.y, 0.45, v.pintada); v.pinta = r.pinta; });
  vacas[0].tag = tag(930, PR + 1470, "sin pintar", "#c9d6ea"); vacas[1].tag = tag(930, PR + 2050, "con rayas", ORO);
  let rect = null;
  const brocha = el(p, "g", { opacity: 0 });
  el(brocha, "rect", { x: -16, y: -110, width: 32, height: 150, rx: 8, fill: "#e8e4dc", stroke: "#222", "stroke-width": 3 });
  el(brocha, "rect", { x: -9, y: -200, width: 18, height: 95, rx: 6, fill: "#b8743a" });
  // tábanos que se posan, como puntos con alas
  const grupos = [...H.map((h, j) => ({ ...h, t0: 39.45, lx: 420, ly: 260, s: 0.42, cx: h.x - 30, cy: h.y - 20, sem: 50 + j })),
    ...vacas.map((v, j) => ({ ...v, t0: 44.25, lx: 520, ly: 210, s: 0.45, cx: v.x - 40, cy: v.y - 20, sem: 60 + j }))];
  grupos.forEach((q) => {
    const r = K.azar(q.sem);
    q.ms = Array.from({ length: q.posa }, (_, i) => ({ m: mosca(p), px: q.cx + (r() - 0.5) * q.lx, py: q.cy + (r() - 0.5) * q.ly, t: q.t0 + i * (1.1 / q.posa) + r() * 0.05, a: r() * 360, desde: [q.cx + (r() - 0.5) * 900, q.cy - 500 - r() * 200] }));
    q.n = texto(p, q.tag.getAttribute("x"), Number(q.tag.getAttribute("y")) + 70, "", { "font-size": 60 });
  });
  return (g) => {
    if (!rect) rect = p.ownerSVGElement.querySelector(`#${PRE_DE.get(p)}pinta .c-pinta-r`);
    // las mantas caen encima
    H.forEach((h, j) => {
      const k = K.sale(K.tramo(g, 36.7 + j * 0.75, 37.35 + j * 0.75));
      h.G.manta.setAttribute("transform", `translate(0 ${f1(-340 * (1 - k))})`);
      pon1(h.G.manta, "opacity", f1(k));
      pon1(h.tag, "opacity", f1(k));
    });
    // la brocha pinta la vaca de abajo
    const pk = K.tramo(g, 42.1, 43.5), px = -600 + 1000 * K.suave(pk);
    if (rect) pon1(rect, "width", f1(px + 600));
    pon1(brocha, "opacity", f1(pk > 0 && pk < 1 ? 1 : 0));
    brocha.setAttribute("transform", `translate(${f1(590 + px * 0.45)} ${f1(PR + 2060 + 30 * Math.sin(vuelta(g, 3)))}) rotate(${f1(-18 + 10 * Math.sin(vuelta(g, 3)))})`);
    vacas.forEach((v) => pon1(v.tag, "opacity", f1(v.pintada ? K.tramo(g, 43.3, 43.6) : 1)));
    grupos.forEach((q) => {
      q.ms.forEach((f, i) => {
        const k = K.suave(K.tramo(g, f.t - 0.5, f.t));
        const x = K.mez(f.desde[0], f.px, k), y = K.mez(f.desde[1], f.py, k);
        f.m(x, y, k < 1 ? Math.atan2(f.py - f.desde[1], f.px - f.desde[0]) * 180 / PI : f.a, 0.34, g > f.t - 0.5 ? 1 : 0, 1 - k, g + i);
      });
      const n = q.ms.filter((f) => g >= f.t).length;
      if (q.n._v !== n) { q.n.textContent = String(n); q.n._v = n; }
      pon1(q.n, "opacity", f1(g > q.t0 - 0.2 ? 1 : 0));
      pon1(q.n, "fill", q.posa > 5 ? ROJO : VERDE);
    });
  };
}

// ── el ojo del tábano y lo que ve al llegar ─────────────────────────────────────────────────────────────────────
function ojo(p) {
  const C = el(p, "g", { transform: `translate(540 ${OJ}) scale(3.2)` });
  el(C, "ellipse", { cx: 0, cy: 40, rx: 170, ry: 150, fill: "#2a2018", opacity: 0.9 });
  [-1, 1].forEach((sg) => {
    el(C, "ellipse", { cx: sg * 62, cy: -10, rx: 66, ry: 92, fill: u("ojo-mosca"), transform: `rotate(${sg * -8} ${sg * 62} -10)` });
    el(C, "ellipse", { cx: sg * 62, cy: -10, rx: 66, ry: 92, fill: u("panal-ojo"), transform: `rotate(${sg * -8} ${sg * 62} -10)` });
    el(C, "ellipse", { cx: sg * 62, cy: -10, rx: 66, ry: 92, fill: u("brillo-ojo"), transform: `rotate(${sg * -8} ${sg * 62} -10)` });
  });
  el(C, "path", { d: "M-12 72 L0 140 L12 72 Z", fill: "#1a120c" });
  el(C, "path", { d: "M-8 -96 Q-30 -130 -50 -136 M8 -96 Q30 -130 50 -136", stroke: "#1a120c", "stroke-width": 7, fill: "none", "stroke-linecap": "round" });
  const preg = [[-330, -330], [330, -280], [-300, 330], [320, 360]].map(([x, y]) => ({ e: texto(p, 540 + x, OJ + y, "?", { "font-size": 150, fill: ORO, opacity: 0 }), x, y }));
  // lo que ve: rayas que tiemblan, bajo un panal de ojo compuesto
  const V = OJ + 2400;
  const rayas = el(p, "g");
  let d = "";
  for (let x = -900; x < 2000; x += 180) d += `M${x} ${V - 1100} C${x - 50} ${V - 400} ${x + 60} ${V + 400} ${x - 20} ${V + 1100} `;
  el(p, "rect", { x: -900, y: V - 1100, width: 2900, height: 2200, fill: BLANCO });
  el(rayas, "path", { d, stroke: NEGRO, "stroke-width": 92, fill: "none" });
  p.appendChild(rayas);
  el(p, "rect", { x: -900, y: V - 1100, width: 2900, height: 2200, fill: u("panal") });
  const mira = el(p, "g", { opacity: 0 });
  el(mira, "circle", { r: 120, fill: "none", stroke: ROJO, "stroke-width": 9 });
  el(mira, "path", { d: "M-170 0 H-60 M60 0 H170 M0 -170 V-60 M0 60 V170", stroke: ROJO, "stroke-width": 9, "stroke-linecap": "round" });
  return (g) => {
    preg.forEach((q, i) => {
      pon1(q.e, "opacity", f1(asoma(g, 46.7 + i * 0.3, 49.0)));
      q.e.setAttribute("transform", `translate(0 ${f1(-14 * Math.sin(vuelta(g, 0.8) + i))})`);
    });
    const t = sube(g, 49.6, 50.6);
    rayas.setAttribute("transform", `translate(${f1(540 + 60 * t * Math.sin(vuelta(g, 2.3)))} ${V}) skewX(${f1(9 * t * Math.sin(vuelta(g, 1.7) + 1))}) translate(-540 ${-V})`);
    const j = sube(g, 50.3, 51.2);
    mira.setAttribute("transform", `translate(${f1(540 + 150 * j * Math.sin(vuelta(g, 1.9)))} ${f1(V + 110 * j * Math.cos(vuelta(g, 1.4)))}) rotate(${f1(30 * j * Math.sin(vuelta(g, 1.1)))})`);
    pon1(mira, "opacity", f1(sube(g, 49.5, 49.9)));
  };
}

// ── en pantalla: el león del gancho (tachado) y el marco de la cámara de 2019 ───────────────────────────────────
function pantallaFija(capa) {
  const sv = K.crear(capa, ids(`<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0"></svg>`));
  const leon = el(sv, "g", { opacity: 0 });
  let d = "";
  for (let i = 0; i <= 28; i++) { const a = (i / 28) * 2 * PI, rr = 118 + (i % 2 ? 22 : 0); d += `${i ? "L" : "M"}${f1(Math.cos(a) * rr)} ${f1(Math.sin(a) * rr)} `; }
  el(leon, "path", { d: d + "Z", fill: "#b5651d", stroke: "#3a1c06", "stroke-width": 5 });
  el(leon, "circle", { r: 82, fill: "#e8a54a" });
  el(leon, "circle", { cx: -30, cy: -18, r: 9, fill: "#2a1404" }); el(leon, "circle", { cx: 30, cy: -18, r: 9, fill: "#2a1404" });
  el(leon, "path", { d: "M-16 14 L16 14 L0 32 Z", fill: "#3a1c06" });
  el(leon, "path", { d: "M0 32 Q-18 52 -34 40 M0 32 Q18 52 34 40", stroke: "#3a1c06", "stroke-width": 5, fill: "none", "stroke-linecap": "round" });
  const equis = el(leon, "path", { d: "M-120 -120 L120 120 M120 -120 L-120 120", stroke: ROJO, "stroke-width": 22, "stroke-linecap": "round", "stroke-dasharray": "340", "stroke-dashoffset": "340" });
  const rec = el(sv, "g", { opacity: 0 });
  [[70, 600, 1, 1], [1010, 600, -1, 1], [70, 1800, 1, -1], [1010, 1800, -1, -1]].forEach(([x, y, sx, sy]) => el(rec, "path", { d: `M${x} ${y + sy * 90} V${y} H${x + sx * 90}`, stroke: "#fff", "stroke-width": 8, fill: "none", "stroke-linecap": "round" }));
  const punto = el(rec, "circle", { cx: 120, cy: 1745, r: 16, fill: ROJO });
  texto(rec, 210, 1760, "REC", { "font-size": 44 });
  texto(rec, 900, 1760, "2019", { "font-size": 52, fill: ORO });
  return (g) => {
    const on = asoma(g, 2.05, 3.15);
    pon1(leon, "opacity", f1(on));
    leon.setAttribute("transform", `translate(220 1560) scale(${f1(0.7 + 0.3 * K.sale(K.tramo(g, 2.05, 2.4)))})`);
    equis.setAttribute("stroke-dashoffset", f1(340 * (1 - K.sale(K.tramo(g, 2.45, 2.8)))));
    pon1(rec, "opacity", f1(asoma(g, 22.75, 31.2)));
    pon1(punto, "opacity", fr(g * 1.2) < 0.55 ? "1" : "0.15");
  };
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
// la raya que tacha: solo cerca de su segundo (así, al dar la vuelta, no queda tachada)
const tacha = (e, g, t) => { e.querySelector(".tacha").style.transform = `scaleX(${g < t + 6 ? K.sale(K.tramo(g, t, t + 0.3)) : 0})`; };

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on, tch) => { const l = { e: etiqueta(capa, html + (tch ? `<i class="tacha" data-layout-allow-occlusion></i>` : ""), clase), sitio, on, tch }; L.push(l); return l; };
  const ARR = [540, 650], ABA = [540, 1270];
  // gancho y cierre (el mismo rótulo en el primer fotograma y en el último)
  r(`¿para <b data-layout-allow-occlusion>esconderse</b>?`, "g", ARR, (g) => (g < 4 ? 1 - K.suave(K.tramo(g, 2.0, 2.3)) : asoma(g, TOTAL - 0.75)), 1.22);
  r(`de los <b>leones</b>`, "r", ABA, (g) => asoma(g, 2.1, 3.1));
  r(`la protegen de las <b>moscas</b>`, "o g", ARR, (g) => asoma(g, 3.3, 4.83));
  // león
  r(`de <b>lejos</b>`, "", ARR, (g) => asoma(g, 5.35, 6.5));
  r(`los ojos de un <b>león</b>`, "o", ARR, (g) => asoma(g, 6.55, 7.9));
  r(`las rayas se <b>mezclan</b>`, "", ABA, (g) => asoma(g, 7.95, 9.3));
  r(`se ve <b>gris</b>`, "g", ARR, (g) => asoma(g, 9.35, 9.98));
  // tábano
  r(`su enemigo de <b>verdad</b>`, "r", ARR, (g) => asoma(g, 10.5, 12.05));
  r(`mucho más <b>pequeño</b>`, "", ABA, (g) => asoma(g, 12.1, 13.1));
  r(`el <b>tábano</b>`, "o g", ARR, (g) => asoma(g, 13.2, 14.6));
  r(`<b>pica</b>`, "r g", ABA, (g) => asoma(g, 14.7, 15.6));
  r(`contagia <b>enfermedades</b>`, "r", ARR, (g) => asoma(g, 15.65, 16.63));
  r(`su pelo, <b>muy corto</b>`, "c g", ARR, (g) => asoma(g, 18.3, 19.6));
  r(`lo <b>atraviesa</b>`, "r g", ARR, (g) => asoma(g, 19.65, 21.44));
  // granja
  r(`una granja <b>inglesa</b>`, "", ARR, (g) => asoma(g, 23.6, 24.9));
  r(`se acercan <b>igual</b>`, "c g", ARR, (g) => asoma(g, 26.05, 28.3));
  r(`se posan <b>4 veces menos</b>`, "v g", ARR, (g) => asoma(g, 29.95, 31.22));
  // aterrizaje
  r(`no <b>frenan</b>`, "r g", ARR, (g) => asoma(g, 31.65, 32.8));
  r(`pasan de <b>largo</b>`, "", ARR, (g) => asoma(g, 32.84, 33.95));
  r(`chocan y <b>rebotan</b>`, "o g", ARR, (g) => asoma(g, 34.0, 35.78));
  // pruebas
  r(`manta de <b>rayas</b>`, "o", ARR, (g) => asoma(g, 37.75, 39.5));
  r(`muchas <b>menos</b>`, "v g", ARR, (g) => asoma(g, 39.6, 41.1));
  r(`en <b>Japón</b>`, "", ARR, (g) => asoma(g, 41.6, 42.9));
  r(`vacas <b>pintadas</b>`, "o", ARR, (g) => asoma(g, 42.95, 44.3));
  r(`la <b>mitad</b> de moscas`, "v g", ARR, (g) => asoma(g, 44.4, 46.17));
  // ojo
  r(`nadie lo sabe <b>aún</b>`, "", ARR, (g) => asoma(g, 46.6, 48.3));
  r(`¿qué <b>ve</b> la mosca?`, "o", ABA, (g) => asoma(g, 47.3, 48.9));
  r(`de <b>cerca</b>`, "", ARR, (g) => asoma(g, 49.35, 50.2));
  r(`las rayas la <b>despistan</b>`, "o g", ARR, (g) => asoma(g, 50.25, 52.58));
  // cierre
  r(`contra las <b>moscas</b>`, "v g", ABA, (g) => asoma(g, 53.2, 55.3));
  return (g) => L.forEach((l) => {
    pon(l.e, l.sitio[0], l.sitio[1], l.on(g));
    if (l.tch) tacha(l.e, g, l.tch);
  });
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
  const grupo = () => { const g = el(cam, "g"); PRE_DE.set(g, PRE); return g; };
  E.fo = fondo(grupo());
  E.est = [
    [1000, gancho(grupo())],
    [LE, sabana(grupo())],
    [TA + 900, tabano(grupo())],
    [GR, granja(grupo())],
    [AT, aterrizaje(grupo())],
    [PR + 1000, pruebas(grupo())],
    [OJ + 1200, ojo(grupo())],
  ];
  K.crear(esc, `<div class="c-vineta"></div>`);
  E.destello = K.crear(esc, `<div class="c-destello"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  E.pf = pantallaFija(capa); E.ro = rotulos(capa);
  return E;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los instantes en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // un temblor pequeño en cada choque
    const a = Math.max(asoma(g, 3.88, 4.2), asoma(g, 34.2, 34.5), asoma(g, 53.98, 54.3)) * 0.7;
    const tx = 7 * a * Math.sin(83 * g), ty = 5 * a * Math.cos(71 * g);
    E.cam.setAttribute("transform", `translate(${(540 - k.x * k.z + tx).toFixed(2)} ${(1000 - k.y * k.z + ty).toFixed(2)}) scale(${k.z.toFixed(4)})`);
    E.destello.style.opacity = (0.22 * asoma(g, 3.88, 4.05) * (1 - K.tramo(g, 4.05, 4.4)) + 0.2 * asoma(g, 34.2, 34.35) * (1 - K.tramo(g, 34.35, 34.7))).toFixed(3);
    E.fo(g);
    const alto = 1000 / k.z + 1400;
    E.est.forEach(([y, f]) => { if (Math.abs(k.y - y) < alto + 1200) f(g); });
    E.pf(g);
    E.ro(g);
    return { g, k };
  };
  return E;
}
