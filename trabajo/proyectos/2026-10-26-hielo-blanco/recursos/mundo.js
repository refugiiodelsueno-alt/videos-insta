// El mundo del hielo blanco, todo en 2D, en un svg con la cámara dentro (un transform del grupo), por estaciones:
//   y = 1000   el cubito de casa, con su centro blanco (gancho y cierre: el último fotograma es el primero)
//   y = 4020   las moléculas: el agua con aire disuelto (oro); el hielo, en rejilla, no le deja sitio y lo empuja
//   y = 7000   la cubitera en corte: el frío entra por todos los lados y el aire acaba acorralado en el centro
//   y = 10000  la luz: atraviesa el hielo claro y rebota en las burbujas hacia cualquier lado
//   y = 13000  la máquina de los bares: placa fría abajo, agua de arriba en movimiento, el aire se escapa
//   y = 16000  el truco: una nevera de playa sin tapa en el congelador; se corta la parte blanca del fondo
const K = window.K;
const NS = "http://www.w3.org/2000/svg";
const PI = Math.PI;

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a";
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 60.22;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);
const fr = (v) => v - Math.floor(v);

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, agua: 5.4, cubitera: 13.94, luz: 25.54, bar: 37.38, truco: 47.4, cierre: 56.76 };

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
const CX = 493, CY = 1047;                 // el centro de la cara del cubito
const AG = 4020, CU = 7000, LU = 10000, BA = 13000, TR = 16000;

// ── la cámara: el punto (x, y) del mundo queda en (540, 1000) con zoom z ───────────────────────────────────────
export const F0 = { x: 540, y: 1000, z: 1.25 };
export function pantalla(k, wx, wy) { return [540 + (wx - k.x) * k.z, 1000 + (wy - k.y) * k.z]; }
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
// un camino por escena; entre escenas, corte
const CAMINOS = [
  [0, [[0, F0], [0.8, Z(526, 1.36, 1014)], [1.9, Z(CX, 1.85, CY)], [2.75, Z(CX, 2.1, CY)], [3.7, Z(CX, 4.5, CY)], [G0.agua, Z(CX + 12, 5.2, CY - 8)]]],
  [G0.agua, [[G0.agua, Z(540, 1.32, AG + 250)], [7.4, Z(540, 1.08, AG + 130)], [9.8, Z(540, 1.0, AG + 60)], [G0.cubitera, Z(540, 1.1, AG - 90)]]],
  [G0.cubitera, [[G0.cubitera, Z(540, 1.2, CU)], [16.9, Z(540, 1.28, CU)], [18.3, Z(540, 2.0, CU)], [22.0, Z(540, 2.15, CU)], [24.2, Z(540, 2.5, CU)], [G0.luz, Z(540, 2.75, CU)]]],
  [G0.luz, [[G0.luz, Z(540, 1.28, LU - 40)], [28.6, Z(560, 1.12, LU)], [31.6, Z(540, 1.16, LU)], [35.4, Z(540, 1.0, LU)], [G0.bar, Z(540, 0.94, LU)]]],
  [G0.bar, [[G0.bar, Z(540, 0.84, BA + 60)], [40.0, Z(540, 0.94, BA + 120)], [41.3, Z(620, 1.25, BA - 320)], [43.3, Z(560, 1.0, BA)], [46.0, Z(540, 1.2, BA - 250)], [G0.truco, Z(540, 1.28, BA - 300)]]],
  [G0.truco, [[G0.truco, Z(540, 0.8, TR)], [50.0, Z(540, 0.86, TR - 40)], [51.8, Z(540, 0.96, TR)], [54.4, Z(540, 1.02, TR + 150)], [G0.cierre, Z(540, 0.98, TR + 120)]]],
  [G0.cierre, [[G0.cierre, Z(CX, 2.5, CY)], [58.2, Z(520, 1.7, 1010)], [59.7, F0], [TOTAL, F0]]],
];
export function camaraEn(g) {
  let c = CAMINOS[0][1];
  for (const [t, cl] of CAMINOS) if (g >= t) c = cl;
  return camara(g, c);
}

// ── lo que pasa con el tiempo (g, los segundos del vídeo entero) ────────────────────────────────────────────────
const frenteAgua = (g) => AG + 540 - 270 * sube(g, 7.5, 9.3) - 390 * sube(g, 10.3, 13.4);      // sube el hielo
const fondoCubi = (g) => 172 * sube(g, 17.3, 23.6);                                            // lo que crece desde cada pared
const frenteBar = (g) => BA + 460 - 740 * sube(g, 38.4, 46.9);
const frenteTruco = (g) => TR - 200 + 490 * sube(g, 51.2, 53.9) + 165 * sube(g, 53.7, 54.6);
const CORTE = TR + 290;

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0a0f17; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(5,7,12,0) 55%, rgba(5,7,12,0.6) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(8,12,19,0.95) 0, rgba(8,12,19,0.84) 300px, rgba(8,12,19,0.45) 470px, rgba(8,12,19,0) 630px); }
.c-destello { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 70% 50% at 50% 52%, #fff 0, rgba(220,245,255,0.6) 60%, rgba(220,245,255,0.2) 100%); opacity: 0; }

.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(10,14,22,0.9); border: 2px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 10px 24px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.45); opacity: 0; }
.c-etq b { font-weight: 800; }
.c-etq.c b { color: ${CIAN}; } .c-etq.o b { color: ${ORO}; } .c-etq.r b { color: #ff6b7e; } .c-etq.v b { color: ${VERDE}; }
.c-etq.c { border-color: rgba(95,212,255,0.5); } .c-etq.o { border-color: rgba(255,194,74,0.55); } .c-etq.r { border-color: rgba(240,68,90,0.6); } .c-etq.v { border-color: rgba(34,211,138,0.55); }
.c-etq.g { font-size: 58px; padding: 12px 30px; }
.c-etq small { display: block; font-weight: 600; font-size: 32px; color: #c3ccd9; }
.c-etq .tacha { position: absolute; left: 12px; right: 12px; top: 48%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240,68,90,0.7); }

.c-medidor { position: absolute; left: 90px; width: 900px; top: 1560px; height: 76px; border-radius: 40px; opacity: 0;
  background: rgba(10,14,22,0.92); border: 2px solid rgba(255,255,255,0.18); box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden; }
.c-medidor span { position: absolute; left: 30px; top: 0; line-height: 72px; font-family: var(--letra), sans-serif; font-weight: 800;
  font-size: 28px; letter-spacing: 0.08em; color: #fff; text-transform: uppercase; }
.c-medidor svg { position: absolute; left: 300px; top: 0; }
.c-medidor b { position: absolute; left: 610px; top: 0; line-height: 72px; font-family: var(--letra), sans-serif; font-weight: 800; font-size: 32px; }
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

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(90,160,255,0.24)"/><stop offset="0.55" stop-color="rgba(70,120,220,0.1)"/><stop offset="1" stop-color="rgba(70,120,220,0)"/></radialGradient>
  <radialGradient id="c-mota" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(225,245,255,0.75)"/><stop offset="1" stop-color="rgba(225,245,255,0)"/></radialGradient>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.6)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <radialGradient id="c-caustica" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(140,220,255,0.35)"/><stop offset="1" stop-color="rgba(140,220,255,0)"/></radialGradient>
  <linearGradient id="c-cara" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(195,232,255,0.46)"/><stop offset="0.5" stop-color="rgba(140,200,245,0.3)"/><stop offset="1" stop-color="rgba(105,165,225,0.4)"/></linearGradient>
  <linearGradient id="c-cara-arr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(230,248,255,0.62)"/><stop offset="1" stop-color="rgba(175,222,250,0.42)"/></linearGradient>
  <linearGradient id="c-cara-der" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(125,180,230,0.42)"/><stop offset="1" stop-color="rgba(70,120,185,0.46)"/></linearGradient>
  <radialGradient id="c-nube" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.97)"/><stop offset="0.42" stop-color="rgba(246,251,255,0.9)"/><stop offset="0.72" stop-color="rgba(225,240,255,0.45)"/><stop offset="1" stop-color="rgba(210,235,255,0)"/></radialGradient>
  <radialGradient id="c-nubeb" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.55)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
  <linearGradient id="c-brillo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset="0.5" stop-color="rgba(255,255,255,0.32)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>
  <radialGradient id="c-oxi" cx="0.35" cy="0.35" r="0.65"><stop offset="0" stop-color="#b6e2ff"/><stop offset="0.55" stop-color="#3a8fe0"/><stop offset="1" stop-color="#1b4f9a"/></radialGradient>
  <radialGradient id="c-oro" cx="0.35" cy="0.35" r="0.65"><stop offset="0" stop-color="#fff4cc"/><stop offset="0.5" stop-color="${ORO}"/><stop offset="1" stop-color="#c98a12"/></radialGradient>
  <radialGradient id="c-halo-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,194,74,0.75)"/><stop offset="0.45" stop-color="rgba(255,194,74,0.25)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <linearGradient id="c-agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(60,150,240,0.5)"/><stop offset="1" stop-color="rgba(28,88,190,0.62)"/></linearGradient>
  <linearGradient id="c-hielo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(205,240,255,0.36)"/><stop offset="1" stop-color="rgba(150,210,245,0.24)"/></linearGradient>
  <linearGradient id="c-frente" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(220,250,255,0)"/><stop offset="0.75" stop-color="rgba(220,250,255,0.55)"/><stop offset="1" stop-color="rgba(240,253,255,0.95)"/></linearGradient>
  <linearGradient id="c-frente2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgba(220,250,255,0)"/><stop offset="0.75" stop-color="rgba(220,250,255,0.55)"/><stop offset="1" stop-color="rgba(240,253,255,0.95)"/></linearGradient>
  <linearGradient id="c-acero" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#55606e"/><stop offset="0.45" stop-color="#c9d2dc"/><stop offset="1" stop-color="#626d7b"/></linearGradient>
  <linearGradient id="c-placa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6f6ff"/><stop offset="1" stop-color="#3cb2ea"/></linearGradient>
  <radialGradient id="c-frio" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(95,212,255,0.6)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <linearGradient id="c-plastico" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f5fb0"/><stop offset="0.4" stop-color="#3f97f0"/><stop offset="1" stop-color="#1c56a2"/></linearGradient>
  <linearGradient id="c-tapa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9d6e4"/></linearGradient>
  <linearGradient id="c-blanco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.25)"/><stop offset="0.5" stop-color="rgba(250,253,255,0.75)"/><stop offset="1" stop-color="rgba(255,255,255,0.92)"/></linearGradient>
  <radialGradient id="c-burbuja" cx="0.42" cy="0.4" r="0.6"><stop offset="0" stop-color="rgba(255,255,255,0.04)"/><stop offset="0.68" stop-color="rgba(255,255,255,0.14)"/><stop offset="0.9" stop-color="rgba(255,255,255,0.7)"/><stop offset="1" stop-color="rgba(255,255,255,0.95)"/></radialGradient>
  <pattern id="c-rejilla" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0.75H60M0.75 0V60" stroke="rgba(95,212,255,0.1)" stroke-width="1.5"/></pattern>
</defs>`;

// ── el sitio: fondo oscuro, una luz fría en cada estación y escarcha que flota ──────────────────────────────────
function fondo(p) {
  el(p, "rect", { x: -4000, y: -4000, width: 9000, height: 26000, fill: "#0a0f17" });
  [1000, AG, CU, LU, BA, TR].forEach((y) => el(p, "ellipse", { cx: 540, cy: y, rx: 1200, ry: 1300, fill: u("luz") }));
  const r = K.azar(5), motas = [];
  for (let i = 0; i < 72; i++) {
    const reg = [1000, AG, CU, LU, BA, TR][i % 6];
    motas.push({ e: el(p, "circle", { r: 5 + r() * 12, fill: u("mota") }), x: -250 + r() * 1580, y: reg - 1100 + r() * 2300, f: r(), w: r() * 6.28 });
  }
  return (g) => motas.forEach((m) => {
    const ph = fr(ciclo(g, 0.05) + m.f);
    m.e.setAttribute("cx", f1(m.x + 30 * Math.sin(vuelta(g, 0.08) + m.w)));
    m.e.setAttribute("cy", f1(m.y - 320 * ph));
    m.e.setAttribute("opacity", f1(0.8 * Math.sin(PI * ph)));
  });
}

// ── flechas de frío: entran desde fuera, una y otra vez ─────────────────────────────────────────────────────────
const FLECHA = "M-11 -46 H11 V-4 H28 L0 32 L-28 -4 H-11 Z";                       // apunta hacia abajo (+y)
function flechas(p, lista, escala = 1, color = CIAN) {
  const A = lista.map(([x, y, a]) => ({ e: el(p, "path", { d: FLECHA, fill: color, stroke: "rgba(10,15,23,0.6)", "stroke-width": 3, opacity: 0 }), x, y, a, dx: -Math.sin((a * PI) / 180), dy: Math.cos((a * PI) / 180) }));
  return (g, on) => A.forEach((q, i) => {
    if (on < 0.01) { pon1(q.e, "opacity", "0"); return; }
    const ph = fr(ciclo(g, 0.9) + i * 0.37), m = (-55 + 110 * ph) * escala;
    q.e.setAttribute("transform", `translate(${f1(q.x + q.dx * m)} ${f1(q.y + q.dy * m)}) rotate(${q.a}) scale(${escala})`);
    q.e.setAttribute("opacity", f1(on * Math.sin(PI * ph)));
  });
}

// ── el cubito de casa: claro por fuera, blanco por dentro ───────────────────────────────────────────────────────
function cuboDibujo(p, x, y, s, detalle) {
  const g = el(p, "g", { transform: `translate(${x} ${y}) scale(${s})` });
  const H = 300, D = 95;
  el(g, "ellipse", { cx: 50, cy: H + 34, rx: 440, ry: 70, fill: u("sombra") });
  el(g, "ellipse", { cx: 40, cy: H + 30, rx: 260, ry: 40, fill: u("caustica") });
  el(g, "path", { d: `M${-H} ${-H} L${-H + D} ${-H - D} L${H + D} ${-H - D} L${H} ${-H} Z`, fill: u("cara-arr"), stroke: "rgba(230,248,255,0.75)", "stroke-width": 4, "stroke-linejoin": "round" });
  el(g, "path", { d: `M${H} ${-H} L${H + D} ${-H - D} L${H + D} ${H - D} L${H} ${H} Z`, fill: u("cara-der"), stroke: "rgba(200,235,255,0.6)", "stroke-width": 4, "stroke-linejoin": "round" });
  // el blanco asoma también por arriba y por el lado
  el(g, "ellipse", { cx: 40, cy: -H - D / 2, rx: 150, ry: 26, fill: u("nubeb") });
  el(g, "ellipse", { cx: H + D / 2, cy: -40, rx: 26, ry: 150, fill: u("nubeb") });
  el(g, "rect", { x: -H, y: -H, width: 2 * H, height: 2 * H, rx: 34, fill: u("cara"), stroke: "rgba(235,250,255,0.9)", "stroke-width": 4 });
  // grietas y reflejos del hielo claro
  const r = K.azar(detalle ? 3 : 8);
  for (let i = 0; i < 9; i++) {
    const a = r() * 6.28, rr = 245 + r() * 40;
    el(g, "path", { d: `M${f1(Math.cos(a) * rr)} ${f1(Math.sin(a) * rr)} l${f1((r() - 0.5) * 70)} ${f1((r() - 0.5) * 70)}`, stroke: "rgba(235,250,255,0.35)", "stroke-width": 2, fill: "none", "stroke-linecap": "round" });
  }
  // el centro blanco: nubes, plumas que apuntan al centro y burbujas
  const nube = el(g, "g");
  el(nube, "ellipse", { cx: 0, cy: 8, rx: 225, ry: 238, fill: u("nube") });
  for (let i = 0; i < 7; i++) el(nube, "ellipse", { cx: f1((r() - 0.5) * 220), cy: f1((r() - 0.5) * 220), rx: f1(70 + r() * 70), ry: f1(60 + r() * 70), fill: u("nubeb") });
  for (let i = 0; i < (detalle ? 90 : 40); i++) {
    const a = r() * 6.28, r0 = 110 + r() * 140, l = 25 + r() * 70;
    el(nube, "path", { d: `M${f1(Math.cos(a) * r0)} ${f1(Math.sin(a) * r0)} L${f1(Math.cos(a) * (r0 - l))} ${f1(Math.sin(a) * (r0 - l))}`, stroke: "rgba(255,255,255,0.4)", "stroke-width": f1(1.5 + r() * 2.5), "stroke-linecap": "round" });
  }
  const bur = el(g, "g", { color: "#ffffff" }), lista = [];
  for (let i = 0; i < (detalle ? 340 : 70); i++) {
    const a = r() * 6.28, rr = 215 * Math.pow(r(), 0.75), big = r() < 0.1;
    const bx = Math.cos(a) * rr, by = Math.sin(a) * rr * 1.05, br = big ? 9 + r() * 8 : 2.5 + r() * 5.5;
    const e = el(bur, "circle", { cx: f1(bx), cy: f1(by), r: f1(br), fill: "currentColor", "fill-opacity": 0.42, stroke: "rgba(255,255,255,0.95)", "stroke-width": f1(Math.max(1, br * 0.22)) });
    if (big) el(bur, "circle", { cx: f1(bx - br * 0.35), cy: f1(by - br * 0.35), r: f1(br * 0.25), fill: "#fff" });
    lista.push({ e, bx, by, a, w: r() * 6.28 });
  }
  // el bisel y el destello que pasa
  el(g, "rect", { x: -H + 16, y: -H + 16, width: 2 * H - 32, height: 2 * H - 32, rx: 24, fill: "none", stroke: "rgba(255,255,255,0.16)", "stroke-width": 12 });
  el(g, "path", { d: `M${-H + 40} ${-H + 30} H${H - 120}`, stroke: "rgba(255,255,255,0.55)", "stroke-width": 7, "stroke-linecap": "round" });
  el(g, "path", { d: `M${-H + 28} ${-H + 50} V${-H + 220}`, stroke: "rgba(255,255,255,0.4)", "stroke-width": 6, "stroke-linecap": "round" });
  const cl = el(g, "clipPath", { id: `${PRE}cara${x}` });
  el(cl, "rect", { x: -H, y: -H, width: 2 * H, height: 2 * H, rx: 34 });
  const gl = el(g, "g", { "clip-path": u(`cara${x}`) });
  const raya = el(gl, "rect", { x: -90, y: -700, width: 180, height: 1400, fill: u("brillo") });
  return { g, bur, lista, raya };
}

function cubos(p) {
  const atras = cuboDibujo(p, -60, 450, 0.55, false);
  atras.g.setAttribute("opacity", "0.55");
  const lado = cuboDibujo(p, 1040, 1560, 0.6, false);
  lado.g.setAttribute("opacity", "0.6");
  const C = cuboDibujo(p, CX, CY, 1, true);
  return (g) => {
    // el destello pasa cada 4 s y cruza en diagonal
    [C, atras, lado].forEach((c, i) => c.raya.setAttribute("transform", `rotate(28) translate(${f1(-650 + 1300 * fr(ciclo(g, 0.25) + i * 0.3))} 0)`));
    if (g > 5.6 && g < 56.6) return;
    // «aire»: las burbujas se vuelven de oro; «escapar»: empujan hacia fuera y no pueden
    const oro = asoma(g, 3.45, 5.6) + asoma(g, 57.0, 58.2);
    C.bur.setAttribute("color", oro > 0.01 ? `rgb(255,${f1(255 - 61 * oro)},${f1(255 - 181 * oro)})` : "#ffffff");
    const emp = asoma(g, 4.3, 5.2);
    C.lista.forEach((q) => {
      const o = emp * 7 * Math.max(0, Math.sin(vuelta(g, 2.5) + q.w)), m = 1.6 * Math.sin(vuelta(g, 0.6) + q.w);
      q.e.setAttribute("cx", f1(q.bx + Math.cos(q.a) * o + m));
      q.e.setAttribute("cy", f1(q.by + Math.sin(q.a) * o + m * 0.6));
    });
  };
}

// ── las moléculas: el agua (azul), el aire disuelto (oro) y el hielo en rejilla que lo empuja ──────────────────
function mol(p) {
  const g = el(p, "g");
  el(g, "circle", { cx: -17, cy: 12, r: 9.5, fill: "#eaf6ff" });
  el(g, "circle", { cx: 17, cy: 12, r: 9.5, fill: "#eaf6ff" });
  el(g, "circle", { r: 17, fill: u("oxi") });
  return g;
}
function moleculas(p) {
  const X0 = 120, X1 = 960, Y0 = AG - 540, Y1 = AG + 540;
  const g = el(p, "g");
  el(g, "rect", { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, rx: 40, fill: "rgba(30,90,170,0.2)", stroke: "rgba(95,212,255,0.4)", "stroke-width": 4 });
  el(g, "rect", { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, rx: 40, fill: u("rejilla") });
  const hie = el(g, "rect", { x: X0 + 2, width: X1 - X0 - 4, rx: 30, fill: "rgba(175,228,255,0.14)" });
  const fre = el(g, "rect", { x: X0 + 2, width: X1 - X0 - 4, height: 46, fill: u("frente"), opacity: 0 });
  // los sitios de la rejilla del hielo, de abajo arriba
  const S = [];
  for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) { const x = X0 + 56 + c * 76 + (r % 2) * 38, y = Y1 - 40 - r * 60; if (x < X1 - 40) S.push({ x, y }); }
  const enl = [];
  S.forEach((a, i) => S.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 80) enl.push({ i, j, e: el(g, "line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: "rgba(175,228,255,0.7)", "stroke-width": 4, "stroke-dasharray": "7 7", opacity: 0 }) }); }));
  const r = K.azar(12), M = [];
  for (let i = 0; i < 165; i++) M.push({ e: mol(g), bx: X0 + 40 + r() * (X1 - X0 - 80), by: Y0 + 40 + r() * (Y1 - Y0 - 80), w: r() * 6.28, f: 0.3 + r() * 0.5, a0: r() * 360, s: i < S.length ? S[i] : null, fz: 0 });
  const A = [];
  for (let i = 0; i < 26; i++) {
    const e = el(g, "g"), halo = el(e, "circle", { r: 40, fill: u("halo-o"), opacity: 0 });
    el(e, "circle", { cx: -11, r: 12.5, fill: u("oro") }); el(e, "circle", { cx: 11, r: 12.5, fill: u("oro") });
    A.push({ e, halo, bx: X0 + 50 + r() * (X1 - X0 - 100), by: Y0 + 50 + r() * (Y1 - Y0 - 100), w: r() * 6.28, f: 0.25 + r() * 0.4, a0: r() * 180 });
  }
  const empG = el(g, "g");                                   // las flechas de empujar se mueven con el frente
  const emp = flechas(empG, [200, 370, 540, 710, 880].map((x) => [x, 0, 180]), 0.8, ORO);
  return (gg) => {
    const F = frenteAgua(gg), hielo = F < Y1 - 2;
    pon1(hie, "y", f1(F)); pon1(hie, "height", f1(Math.max(0, Y1 - F)));
    fre.setAttribute("y", f1(F - 40)); fre.setAttribute("opacity", f1(hielo ? 0.9 * (1 - sube(gg, 13.4, 13.9)) : 0));
    const yL = (by, m) => Y0 + 40 + (by - Y0 - 40) * Math.max(0, F - m - Y0 - 40) / (Y1 - 80 - Y0);
    M.forEach((q) => {
      const lx = q.bx + 9 * Math.sin(vuelta(gg, q.f) + q.w), ly = yL(q.by, 30) + 9 * Math.cos(vuelta(gg, q.f * 0.8) + q.w);
      const ang = q.a0 + 40 * Math.sin(vuelta(gg, q.f * 0.6) + q.w);
      q.fz = q.s ? K.suave(K.tramo(q.s.y - F, -12, 46)) : 0;
      const x = q.fz > 0 ? K.mez(lx, q.s.x + 1.5 * Math.sin(vuelta(gg, 3) + q.w), q.fz) : lx;
      const y = q.fz > 0 ? K.mez(ly, q.s.y, q.fz) : ly;
      q.e.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(K.mez(ang, 0, q.fz))})`);
    });
    enl.forEach((l) => pon1(l.e, "opacity", f1(Math.min(M[l.i].fz, M[l.j].fz))));
    const brilla = asoma(gg, 6.15, 8.3);
    A.forEach((q) => {
      const y = Y0 + 50 + (q.by - Y0 - 50) * Math.max(0, F - 70 - Y0 - 50) / (Y1 - 100 - Y0);
      q.e.setAttribute("transform", `translate(${f1(q.bx + 11 * Math.sin(vuelta(gg, q.f) + q.w))} ${f1(y + 10 * Math.cos(vuelta(gg, q.f) + q.w))}) rotate(${f1(q.a0 + 50 * Math.sin(vuelta(gg, q.f * 0.5) + q.w))})`);
      pon1(q.halo, "opacity", f1(brilla * (0.6 + 0.4 * Math.sin(vuelta(gg, 1.2) + q.w))));
    });
    empG.setAttribute("transform", `translate(0 ${f1(F - 95)})`);
    emp(gg, asoma(gg, 11.3, 13.7));
  };
}

// ── la cubitera en corte: el hielo crece desde las cuatro paredes y acorrala el aire ────────────────────────────
function cubitera(p) {
  const g = el(p, "g");
  const W = 340, H = 360, Y0 = CU - 180;
  el(g, "rect", { x: -440, y: Y0 - 34, width: 1580, height: H + 66, rx: 38, fill: "rgba(120,200,225,0.18)", stroke: "rgba(170,230,255,0.6)", "stroke-width": 6 });
  el(g, "rect", { x: -470, y: Y0 - 46, width: 1640, height: 24, rx: 12, fill: "rgba(175,232,255,0.42)" });
  const C = [-390, -10, 370, 750].map((x0, ci) => {
    const foco = ci === 2, cx = x0 + W / 2;
    el(g, "rect", { x: x0, y: Y0, width: W, height: H, rx: 28, fill: u("hielo"), stroke: "rgba(205,242,255,0.75)", "stroke-width": 4 });
    // las agujas del hielo, que crecen desde cada pared hacia dentro
    const rr = K.azar(40 + ci);
    for (let k = 0; k < (foco ? 64 : 26); k++) {
      const lado = k % 4, t = 0.08 + rr() * 0.84, l = 50 + rr() * 120, a = (rr() - 0.5) * 0.5;
      const [sx, sy, dx, dy] = lado === 0 ? [x0 + t * W, Y0, 0, 1] : lado === 1 ? [x0 + t * W, Y0 + H, 0, -1] : lado === 2 ? [x0, Y0 + t * H, 1, 0] : [x0 + W, Y0 + t * H, -1, 0];
      el(g, "path", { d: `M${f1(sx)} ${f1(sy)} l${f1((dx + a * dy) * l)} ${f1((dy + a * dx) * l)}`, stroke: "rgba(230,250,255,0.32)", "stroke-width": 2.5, "stroke-linecap": "round" });
    }
    const liq = el(g, "rect", { fill: u("agua") });
    const fre = el(g, "rect", { fill: "none", stroke: "rgba(235,252,255,0.8)", "stroke-width": 5 });
    const nube = el(g, "ellipse", { cx, cy: CU, rx: 100, ry: 108, fill: u("nube"), opacity: 0 });
    const D = [];
    for (let i = 0; i < (foco ? 120 : 46); i++) {
      const df = 96 + rr() * 66;
      D.push({ e: el(g, "circle", { r: 6, fill: ORO }), bx: x0 + 16 + rr() * (W - 32), by: Y0 + 16 + rr() * (H - 32), df, rb: 4 + rr() * 9, w: rr() * 6.28, f: 0.6 + rr() * 0.9, est: 0 });
    }
    return { x0, cx, liq, fre, nube, D };
  });
  const fuera = flechas(g, [
    ...[-250, 160, 540, 920, 1290].map((x) => [x, Y0 - 230, 0]), ...[-250, 160, 540, 920, 1290].map((x) => [x, Y0 + H + 230, 180]),
    [-620, CU, -90], [1700, CU, 90]], 1.9);
  const dentro = flechas(g, [[540, Y0 - 90, 0], [455, Y0 - 90, 0], [625, Y0 - 90, 0], [540, Y0 + H + 90, 180], [455, Y0 + H + 90, 180], [625, Y0 + H + 90, 180], [370 - 90, CU, -90], [710 + 90, CU, 90], [370 - 90, CU - 90, -90], [710 + 90, CU + 90, 90]], 0.6);
  return (gg) => {
    const d = fondoCubi(gg), sacude = asoma(gg, 21.7, 23.3);
    C.forEach((c) => {
      const w = W - 2 * d, h = H - 2 * d;
      if (w < 8) { pon1(c.liq, "opacity", "0"); pon1(c.fre, "opacity", "0"); }
      else {
        const at = { x: f1(c.x0 + d), y: f1(Y0 + d), width: f1(w), height: f1(h), rx: f1(Math.min(26, w / 2, h / 2)) };
        for (const a in at) { c.liq.setAttribute(a, at[a]); c.fre.setAttribute(a, at[a]); }
        pon1(c.liq, "opacity", "1"); pon1(c.fre, "opacity", f1(sube(gg, 17.3, 17.8)));
      }
      pon1(c.nube, "opacity", f1(0.95 * sube(gg, 22.6, 24.8)));
      c.D.forEach((q) => {
        const di = Math.min(d, q.df), sx = (W - 2 * di) / W, sy = (H - 2 * di) / H;
        const b = K.tramo(d, q.df, q.df + 14), j = (4 + 9 * sacude) * (1 - b);
        q.e.setAttribute("cx", f1(c.cx + (q.bx - c.cx) * sx + j * Math.sin(vuelta(gg, q.f) + q.w)));
        q.e.setAttribute("cy", f1(CU + (q.by - CU) * sy + j * Math.cos(vuelta(gg, q.f * 1.1) + q.w)));
        q.e.setAttribute("r", f1(K.mez(6, q.rb, b)));
        const est = b > 0.5 ? 1 : 0;
        if (est !== q.est) {
          q.est = est;
          q.e.setAttribute("fill", est ? "rgba(255,255,255,0.45)" : ORO);
          q.e.setAttribute("stroke", est ? "#ffffff" : "none");
          q.e.setAttribute("stroke-width", "2");
        }
      });
    });
    fuera(gg, asoma(gg, 14.9, 17.9));
    dentro(gg, asoma(gg, 18.0, 20.1));
  };
}

// ── la luz: pasa recta por el hielo claro y rebota en las burbujas hacia cualquier lado ────────────────────────
function traza(x, y0, B) {
  let px = x, py = y0, dx = 0, dy = 1;
  const P = [[px, py]];
  for (let n = 0; n < 14; n++) {
    let best = 1e9, bi = -1;
    B.forEach((b, i) => {
      const ox = px - b.x, oy = py - b.y, Bq = ox * dx + oy * dy, Cq = ox * ox + oy * oy - b.r * b.r, disc = Bq * Bq - Cq;
      if (disc < 0) return;
      const t = -Bq - Math.sqrt(disc);
      if (t > 0.5 && t < best) { best = t; bi = i; }
    });
    if (bi < 0) { P.push([px + dx * 1700, py + dy * 1700]); break; }
    px += dx * best; py += dy * best; P.push([px, py]);
    const b = B[bi], nx = (px - b.x) / b.r, ny = (py - b.y) / b.r, dd = dx * nx + dy * ny;
    dx -= 2 * dd * nx; dy -= 2 * dd * ny;
  }
  let L = 0;
  for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  return { d: P.map((q, i) => `${i ? "L" : "M"}${f1(q[0])} ${f1(q[1])}`).join(" "), L };
}
function luz(p) {
  const g = el(p, "g"), X0 = 130, X1 = 950, Y0 = LU - 360, Y1 = LU + 360;
  el(g, "ellipse", { cx: 560, cy: Y1 + 40, rx: 520, ry: 70, fill: u("sombra") });
  el(g, "rect", { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, rx: 48, fill: u("cara"), stroke: "rgba(235,250,255,0.9)", "stroke-width": 4 });
  el(g, "rect", { x: X0 + 16, y: Y0 + 16, width: X1 - X0 - 32, height: Y1 - Y0 - 32, rx: 36, fill: "none", stroke: "rgba(255,255,255,0.15)", "stroke-width": 12 });
  const nube = el(g, "ellipse", { cx: 540, cy: LU, rx: 285, ry: 285, fill: u("nube"), opacity: 0 });
  const r = K.azar(21), B = [];
  for (let k = 0; k < 4000 && B.length < 46; k++) {
    const a = r() * 6.28, rr = 245 * Math.sqrt(r()), x = 540 + Math.cos(a) * rr, y = LU + Math.sin(a) * rr, br = 13 + r() * 21;
    if (B.every((b) => Math.hypot(b.x - x, b.y - y) > b.r + br + 7)) B.push({ x, y, r: br });
  }
  B.forEach((b) => { el(g, "circle", { cx: f1(b.x), cy: f1(b.y), r: f1(b.r), fill: u("burbuja"), stroke: "rgba(255,255,255,0.85)", "stroke-width": 2.5 }); el(g, "circle", { cx: f1(b.x - b.r * 0.38), cy: f1(b.y - b.r * 0.38), r: f1(b.r * 0.2), fill: "#fff" }); });
  const R = [175, 245, 315, 385, 440, 492, 540, 588, 640, 695, 765, 835, 905].map((x, i) => {
    const t = traza(x, LU - 880, B);
    const e = el(g, "path", { d: t.d, fill: "none", stroke: "#ffe9a8", "stroke-width": 5, "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": `${f1(t.L)} ${f1(t.L)}`, opacity: 0.9 });
    const fo = el(g, "path", { d: t.d, fill: "none", stroke: "#ffffff", "stroke-width": 10, "stroke-linecap": "round", "stroke-dasharray": "26 340", opacity: 0 });
    return { e, fo, L: t.L, i };
  });
  const frio = flechas(g, [[300, Y0 - 120, 0], [540, Y0 - 120, 0], [780, Y0 - 120, 0], [300, Y1 + 120, 180], [540, Y1 + 120, 180], [780, Y1 + 120, 180], [X0 - 110, LU - 150, -90], [X0 - 110, LU + 150, -90], [X1 + 110, LU - 150, 90], [X1 + 110, LU + 150, 90]], 1.1);
  return (gg) => {
    pon1(nube, "opacity", f1(0.92 * sube(gg, 28.7, 29.4)));
    R.forEach((q) => {
      const v = K.tramo(gg, 25.85 + 0.06 * q.i, 27.9 + 0.06 * q.i), on = 1 - sube(gg, 36.9, 37.35);
      q.e.setAttribute("stroke-dashoffset", f1(q.L * (1 - v)));
      pon1(q.e, "opacity", f1(0.9 * on * (v > 0 ? 1 : 0)));
      q.fo.setAttribute("stroke-dashoffset", f1(-366 * fr(ciclo(gg, 0.8) + q.i * 0.29)));
      pon1(q.fo, "opacity", f1(0.85 * sube(gg, 27.8, 28.4) * on));
    });
    frio(gg, asoma(gg, 35.8, 37.2));
  };
}

// ── los bares: placa fría abajo, el agua de arriba moviéndose; el hielo sube y el aire se escapa ───────────────
function bar(p) {
  const g = el(p, "g"), X0 = 200, X1 = 880, YS = BA - 440, YB = BA + 460;
  el(g, "rect", { x: 120, y: YB + 70, width: 840, height: 230, rx: 26, fill: "#18202b", stroke: "rgba(255,255,255,0.14)", "stroke-width": 3 });
  for (let i = 0; i < 9; i++) el(g, "rect", { x: 220 + i * 74, y: YB + 150, width: 40, height: 90, rx: 10, fill: "rgba(255,255,255,0.06)" });
  const halo = el(g, "ellipse", { cx: 540, cy: YB + 30, rx: 560, ry: 170, fill: u("frio") });
  // el hielo (columnas que suben) y, encima, el agua que queda
  el(g, "rect", { x: X0, y: YS, width: X1 - X0, height: YB - YS, fill: "rgba(190,236,255,0.2)" });
  const r = K.azar(55);
  for (let i = 0; i < 46; i++) { const x = X0 + 10 + r() * (X1 - X0 - 20), l = 200 + r() * 700; el(g, "path", { d: `M${f1(x)} ${YB} l${f1((r() - 0.5) * 20)} ${f1(-l)}`, stroke: "rgba(235,252,255,0.28)", "stroke-width": f1(1.5 + r() * 2.5), "stroke-linecap": "round" }); }
  const liq = el(g, "rect", { x: X0, y: YS, width: X1 - X0, fill: u("agua") });
  const fre = el(g, "rect", { x: X0, width: X1 - X0, height: 40, fill: u("frente2") });
  // el agua de arriba, siempre en movimiento: un remolino y un chorro
  const giro = [0, 1].map((k) => el(g, "path", { d: `M${300 + k * 60} ${YS + 130} A${240 - k * 60} ${80 - k * 22} 0 1 0 ${780 - k * 60} ${YS + 130} A${240 - k * 60} ${80 - k * 22} 0 1 0 ${300 + k * 60} ${YS + 130}`, fill: "none", stroke: "rgba(225,247,255,0.75)", "stroke-width": 6, "stroke-linecap": "round", "stroke-dasharray": "46 54", opacity: 0 }));
  const chorro = el(g, "path", { d: `M800 ${YS + 34} Q620 ${YS + 66} 330 ${YS + 52}`, fill: "none", stroke: "rgba(235,250,255,0.9)", "stroke-width": 7, "stroke-linecap": "round", "stroke-dasharray": "30 26", opacity: 0 });
  const ola = el(g, "path", { fill: "none", stroke: "rgba(225,247,255,0.9)", "stroke-width": 5 });
  // la bomba y su tubo
  el(g, "path", { d: `M1000 ${YS - 250} H860 Q820 ${YS - 250} 820 ${YS - 210} V${YS + 22}`, fill: "none", stroke: "#8f9aa8", "stroke-width": 30, "stroke-linecap": "round" });
  el(g, "path", { d: `M1000 ${YS - 250} H860 Q820 ${YS - 250} 820 ${YS - 210} V${YS + 22}`, fill: "none", stroke: "rgba(255,255,255,0.35)", "stroke-width": 8, "stroke-linecap": "round", transform: "translate(-6 -4)" });
  el(g, "rect", { x: 790, y: YS + 14, width: 46, height: 30, rx: 8, fill: "#b9c3ce" });
  el(g, "rect", { x: 930, y: YS - 330, width: 150, height: 160, rx: 22, fill: "#2a3442", stroke: "rgba(255,255,255,0.2)", "stroke-width": 3 });
  const aspa = el(g, "g");
  for (let i = 0; i < 4; i++) el(aspa, "path", { d: "M0 0 C14 -8 22 -34 4 -46 C-6 -30 -10 -12 0 0 Z", fill: CIAN, transform: `rotate(${i * 90})` });
  el(aspa, "circle", { r: 8, fill: "#fff" });
  // las paredes de acero y la placa fría
  el(g, "rect", { x: 160, y: YS - 110, width: 40, height: YB - YS + 110, rx: 6, fill: u("acero") });
  el(g, "rect", { x: 880, y: YS - 110, width: 40, height: YB - YS + 110, rx: 6, fill: u("acero") });
  el(g, "rect", { x: 160, y: YB, width: 760, height: 72, rx: 10, fill: u("placa") });
  for (let i = 0; i < 18; i++) el(g, "path", { d: `M${208 + i * 37} ${YB} l8 -16 l8 16`, fill: "rgba(240,252,255,0.85)" });
  const sube1 = flechas(g, [[300, YB - 90, 180], [540, YB - 90, 180], [780, YB - 90, 180]], 1.1);
  // el aire: puntos de oro que suben, salen por arriba y revientan
  const D = [];
  for (let i = 0; i < 72; i++) D.push({ e: el(g, "circle", { r: 6.5, fill: ORO }), o: el(g, "circle", { r: 6, fill: "none", stroke: "rgba(255,240,200,0.9)", "stroke-width": 3, opacity: 0 }), bx: X0 + 24 + r() * (X1 - X0 - 48), by: YS + 30 + r() * (YB - YS - 60), te: 41.0 + 5.5 * Math.pow(r(), 1.2), w: r() * 6.28, f: 0.4 + r() * 0.6 });
  return (gg) => {
    const F = frenteBar(gg), mov = sube(gg, 40.6, 41.4);
    pon1(liq, "height", f1(Math.max(0, F - YS)));
    fre.setAttribute("y", f1(F)); pon1(fre, "opacity", f1(sube(gg, 38.4, 39.0)));
    halo.setAttribute("opacity", f1(0.75 + 0.25 * Math.sin(vuelta(gg, 0.5))));
    giro.forEach((e, k) => { e.setAttribute("stroke-dashoffset", f1((k ? 1 : -1) * 400 * ciclo(gg, 0.5))); pon1(e, "opacity", f1(0.85 * mov)); });
    chorro.setAttribute("stroke-dashoffset", f1(560 * ciclo(gg, 0.5))); pon1(chorro, "opacity", f1(mov));
    aspa.setAttribute("transform", `translate(1005 ${YS - 250}) rotate(${f1(360 * ciclo(gg, 0.3 + 0.9 * mov))})`);
    let d = `M${X0} ${YS}`;
    for (let x = X0; x <= X1; x += 20) d += ` L${x} ${f1(YS + (3 + 7 * mov) * Math.sin(x / 38 - vuelta(gg, 0.8)))}`;
    ola.setAttribute("d", d);
    D.forEach((q) => {
      const y0 = YS + 30 + (q.by - YS - 30) * Math.max(0, F - 60 - YS) / (YB - 90 - YS);
      const x0 = q.bx + 6 * Math.sin(vuelta(gg, q.f) + q.w) + 30 * mov * Math.sin(vuelta(gg, 0.5) + q.by / 90);
      const v = K.tramo(gg, q.te, q.te + 0.9), pop = K.tramo(gg, q.te + 0.9, q.te + 1.3);
      const y = K.mez(y0, YS - 8, K.entra ? K.entra(v) : v * v);
      q.e.setAttribute("cx", f1(x0)); q.e.setAttribute("cy", f1(y));
      pon1(q.e, "opacity", v >= 1 ? "0" : "1");
      pon1(q.e, "fill", v > 0 ? "#fff6dd" : ORO);
      if (v >= 1 && pop < 1) { q.o.setAttribute("cx", f1(x0)); q.o.setAttribute("cy", f1(YS - 12 - 20 * pop)); q.o.setAttribute("r", f1(6 + 18 * pop)); pon1(q.o, "opacity", f1(1 - pop)); }
      else pon1(q.o, "opacity", "0");
    });
    sube1(gg, asoma(gg, 38.8, 41.0));
  };
}

// ── el truco: una nevera de playa sin tapa dentro del congelador; se congela de arriba abajo ───────────────────
function truco(p) {
  const g = el(p, "g");
  const IX0 = 285, IX1 = 795, IY0 = TR - 225, IY1 = TR + 465, AGUA0 = TR - 200;
  // el congelador, con escarcha en las paredes
  el(g, "rect", { x: 60, y: TR - 720, width: 960, height: 1440, rx: 30, fill: "#0d1723", stroke: "rgba(215,240,255,0.6)", "stroke-width": 12 });
  const r = K.azar(66);
  for (let i = 0; i < 70; i++) {
    const lado = i % 3, t = r();
    const [x, y] = lado === 0 ? [66 + t * 948, TR - 714] : lado === 1 ? [66, TR - 714 + t * 1428] : [1014, TR - 714 + t * 1428];
    el(g, "ellipse", { cx: f1(x), cy: f1(y), rx: f1(10 + r() * 26), ry: f1(8 + r() * 18), fill: "rgba(235,248,255,0.4)" });
  }
  el(g, "rect", { x: 72, y: TR + 540, width: 936, height: 14, fill: "rgba(215,240,255,0.3)" });
  // el frío: entra por arriba; por los lados lo para el aislante
  const arriba = flechas(g, [[380, TR - 420, 0], [540, TR - 420, 0], [700, TR - 420, 0]], 1.15);
  const lados = flechas(g, [[150, TR + 40, -90], [150, TR + 300, -90], [930, TR + 40, 90], [930, TR + 300, 90]], 0.85, "rgba(95,212,255,0.75)");
  const cruces = el(g, "g", { opacity: 0 });
  [[222, TR + 40], [222, TR + 300], [858, TR + 40], [858, TR + 300]].forEach(([x, y]) => el(cruces, "path", { d: `M${x - 18} ${y - 18} L${x + 18} ${y + 18} M${x + 18} ${y - 18} L${x - 18} ${y + 18}`, stroke: ROJO, "stroke-width": 9, "stroke-linecap": "round" }));
  // la nevera
  const nev = el(g, "g");
  el(nev, "rect", { x: 230, y: TR - 280, width: 620, height: 800, rx: 34, fill: u("plastico"), stroke: "rgba(10,20,40,0.6)", "stroke-width": 4 });
  el(nev, "rect", { x: 250, y: TR - 260, width: 580, height: 760, rx: 22, fill: "#e8eef4" });
  for (let i = 0; i < 12; i++) el(nev, "path", { d: `M252 ${TR - 240 + i * 62} l30 30 M798 ${TR - 240 + i * 62} l30 30`, stroke: "rgba(150,170,190,0.6)", "stroke-width": 3 });
  el(nev, "rect", { x: IX0, y: IY0, width: IX1 - IX0, height: IY1 - IY0, rx: 12, fill: "#0b1420" });
  el(nev, "rect", { x: 190, y: TR + 40, width: 44, height: 120, rx: 14, fill: "#d9e2ea", stroke: "rgba(0,0,0,0.3)", "stroke-width": 3 });
  el(nev, "rect", { x: 846, y: TR + 40, width: 44, height: 120, rx: 14, fill: "#d9e2ea", stroke: "rgba(0,0,0,0.3)", "stroke-width": 3 });
  // el agua y el bloque de hielo (arriba claro; abajo, lo blanco)
  const liq = el(g, "rect", { x: IX0, width: IX1 - IX0, fill: u("agua") });
  const iArr = el(g, "rect", { x: IX0, y: AGUA0, width: IX1 - IX0, rx: 10, fill: u("hielo"), stroke: "rgba(225,248,255,0.8)", "stroke-width": 4 });
  const colum = el(g, "g");
  for (let i = 0; i < 26; i++) { const x = IX0 + 14 + r() * (IX1 - IX0 - 28); el(colum, "path", { d: `M${f1(x)} ${AGUA0 + 6} l${f1((r() - 0.5) * 16)} ${f1(150 + r() * 330)}`, stroke: "rgba(235,252,255,0.3)", "stroke-width": 2.5, "stroke-linecap": "round" }); }
  const ccl = el(g, "clipPath", { id: `${PRE}colum` });
  const ccR = el(ccl, "rect", { x: IX0, y: AGUA0, width: IX1 - IX0 });
  colum.setAttribute("clip-path", u("colum"));
  const fre = el(g, "rect", { x: IX0, width: IX1 - IX0, height: 40, fill: u("frente") });
  const abajo = el(g, "g");
  const iAba = el(abajo, "rect", { x: IX0, y: CORTE, width: IX1 - IX0, rx: 10, fill: u("hielo"), stroke: "rgba(225,248,255,0.8)", "stroke-width": 4 });
  const nube = el(abajo, "rect", { x: IX0 + 4, y: CORTE + 4, width: IX1 - IX0 - 8, height: IY1 - CORTE - 8, rx: 10, fill: u("blanco"), opacity: 0 });
  const D = [];
  for (let i = 0; i < 90; i++) D.push({ e: el(abajo, "circle", { r: 6, fill: ORO }), bx: IX0 + 18 + r() * (IX1 - IX0 - 36), by: AGUA0 + 20 + r() * (IY1 - AGUA0 - 40), hf: 40 + r() * 128, rb: 4 + r() * 8, w: r() * 6.28, f: 0.5 + r() * 0.7, est: 0 });
  // la tapa
  const tapa = el(g, "g");
  el(tapa, "rect", { x: 212, y: TR - 330, width: 656, height: 60, rx: 18, fill: u("tapa"), stroke: "rgba(40,60,90,0.5)", "stroke-width": 4 });
  el(tapa, "path", { d: `M430 ${TR - 330} V${TR - 372} Q430 ${TR - 386} 444 ${TR - 386} H636 Q650 ${TR - 386} 650 ${TR - 372} V${TR - 330}`, fill: "none", stroke: "#d0dae4", "stroke-width": 20, "stroke-linecap": "round" });
  // el corte
  const sierra = el(g, "path", { d: `M${IX0 - 40} ${CORTE} H${IX1 + 40}`, stroke: ROJO, "stroke-width": 8, "stroke-linecap": "round", "stroke-dasharray": `${IX1 - IX0 + 80} ${IX1 - IX0 + 80}`, opacity: 0 });
  const chispas = el(g, "g");
  const ch = Array.from({ length: 6 }, () => el(chispas, "circle", { r: 5, fill: "#ffe9e0", opacity: 0 }));
  const estrellas = [[360, TR - 140], [700, TR - 40], [470, TR + 150]].map(([x, y]) => el(g, "path", { d: "M0 -36 L8 -8 L36 0 L8 8 L0 36 L-8 8 L-36 0 L-8 -8 Z", fill: "#fff", transform: `translate(${x} ${y}) scale(0)` }));
  return (gg) => {
    const F = frenteTruco(gg), h = IY1 - F;
    // la tapa sale volando
    const vt = K.sale(K.tramo(gg, 50.2, 51.0));
    tapa.setAttribute("transform", `translate(${f1(300 * vt)} ${f1(-560 * vt)}) rotate(${f1(38 * vt)} 540 ${TR - 300})`);
    pon1(tapa, "opacity", f1(1 - K.tramo(vt, 0.55, 1)));
    arriba(gg, asoma(gg, 50.6, 53.7));
    const ld = asoma(gg, 51.3, 53.7);
    lados(gg, ld); pon1(cruces, "opacity", f1(ld * (0.6 + 0.4 * Math.sin(vuelta(gg, 1.5)))));
    // la nevera se aparta y deja el bloque
    const fuera = sube(gg, 54.0, 54.6);
    nev.setAttribute("transform", `translate(0 ${f1(220 * fuera)})`); pon1(nev, "opacity", f1(1 - fuera));
    pon1(liq, "y", f1(F)); pon1(liq, "height", f1(Math.max(0, IY1 - F))); pon1(liq, "opacity", h < 12 ? "0" : "1");
    pon1(iArr, "height", f1(Math.max(0, Math.min(F, CORTE) - AGUA0))); pon1(iArr, "opacity", F > AGUA0 + 2 ? "1" : "0");
    pon1(ccR, "height", f1(Math.max(0, Math.min(F, CORTE) - AGUA0)));
    pon1(iAba, "height", f1(Math.max(0, F - CORTE))); pon1(iAba, "opacity", F > CORTE + 2 ? "1" : "0");
    fre.setAttribute("y", f1(F - 40)); pon1(fre, "opacity", f1(sube(gg, 51.2, 51.6) * (1 - sube(gg, 54.3, 54.6))));
    pon1(nube, "opacity", f1(sube(gg, 54.0, 54.9)));
    D.forEach((q) => {
      const hi = Math.max(h, q.hf), esc = Math.max(0, hi - 18) / (IY1 - AGUA0 - 20);
      const b = K.tramo(-h, -q.hf, -q.hf + 14), j = 5 * (1 - b);
      q.e.setAttribute("cx", f1(q.bx + j * Math.sin(vuelta(gg, q.f) + q.w)));
      q.e.setAttribute("cy", f1(IY1 - 18 - (IY1 - 20 - q.by) * esc + j * Math.cos(vuelta(gg, q.f) + q.w)));
      q.e.setAttribute("r", f1(K.mez(6, q.rb, b)));
      const est = b > 0.5 ? 1 : 0;
      if (est !== q.est) { q.est = est; q.e.setAttribute("fill", est ? "rgba(255,255,255,0.5)" : ORO); q.e.setAttribute("stroke", est ? "#fff" : "none"); q.e.setAttribute("stroke-width", "2"); }
    });
    // se corta y la parte blanca cae
    const vs = K.tramo(gg, 54.55, 54.95);
    sierra.setAttribute("stroke-dashoffset", f1((IX1 - IX0 + 80) * (1 - vs)));
    pon1(sierra, "opacity", f1(vs > 0 ? 1 - sube(gg, 55.5, 55.9) : 0));
    ch.forEach((c, i) => {
      const k = fr(ciclo(gg, 3) + i / 6), x = IX0 - 40 + (IX1 - IX0 + 80) * vs;
      c.setAttribute("cx", f1(x + 40 * k * Math.cos(i * 1.7))); c.setAttribute("cy", f1(CORTE - 50 * k * Math.abs(Math.sin(i * 2.3))));
      pon1(c, "opacity", f1(vs > 0 && vs < 1 ? 1 - k : 0));
    });
    const cae = sube(gg, 55.25, 56.4);
    abajo.setAttribute("transform", `translate(${f1(40 * cae)} ${f1(260 * cae)}) rotate(${f1(7 * cae)} 540 ${CORTE})`);
    pon1(abajo, "opacity", f1(1 - sube(gg, 55.9, 56.6)));
    estrellas.forEach((e, i) => {
      const s = asoma(gg, 55.8 + 0.25 * i, 56.75) * (0.7 + 0.3 * Math.sin(vuelta(gg, 2) + i * 2));
      const [x, y] = [[360, TR - 140], [700, TR - 40], [470, TR + 150]][i];
      e.setAttribute("transform", `translate(${x} ${y}) rotate(${f1(20 * gg)}) scale(${f1(s)})`);
    });
  };
}

// ── en pantalla: las dos tarjetas de «nieve» y «espuma» ─────────────────────────────────────────────────────────
function pantallaFija(capa) {
  const sv = K.crear(capa, `<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0"></svg>`);
  const tarjeta = (cx) => { const t = el(sv, "g", { opacity: 0 }); el(t, "rect", { x: cx - 120, y: 1380, width: 240, height: 210, rx: 26, fill: "rgba(10,14,22,0.92)", stroke: "rgba(255,255,255,0.2)", "stroke-width": 2 }); return t; };
  const nieve = tarjeta(300), espuma = tarjeta(780);
  for (let i = 0; i < 6; i++) {
    const a = (i * PI) / 3, c = Math.cos(a), s = Math.sin(a), X = 300, Y = 1485;
    el(nieve, "path", { d: `M${X} ${Y} L${f1(X + c * 78)} ${f1(Y + s * 78)} M${f1(X + c * 46)} ${f1(Y + s * 46)} l${f1(Math.cos(a + 0.7) * 26)} ${f1(Math.sin(a + 0.7) * 26)} M${f1(X + c * 46)} ${f1(Y + s * 46)} l${f1(Math.cos(a - 0.7) * 26)} ${f1(Math.sin(a - 0.7) * 26)}`, stroke: "#eaf7ff", "stroke-width": 8, "stroke-linecap": "round" });
  }
  const rb = K.azar(4);
  for (let i = 0; i < 26; i++) { const x = 780 + (rb() - 0.5) * 170, y = 1485 + (rb() - 0.5) * 140, rr = 9 + rb() * 18; el(espuma, "circle", { cx: f1(x), cy: f1(y), r: f1(rr), fill: "rgba(255,255,255,0.3)", stroke: "#fff", "stroke-width": 3 }); }
  return (g) => {
    nieve.setAttribute("opacity", f1(asoma(g, 30.0, 31.5)));
    espuma.setAttribute("opacity", f1(asoma(g, 30.6, 31.5)));
  };
}

// ── las etiquetas (en pantalla, sujetas a un punto del mundo o a un sitio fijo) ─────────────────────────────────
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
  const ARR = () => [540, 650], ABA = () => [540, 1270];
  // gancho y cierre (el mismo rótulo en el primer fotograma y en el último)
  r(`¿es <b data-layout-allow-occlusion>hielo</b>?`, "g", ARR, (g) => (g < 4 ? 1 - K.suave(K.tramo(g, 2.45, 2.75)) : asoma(g, 59.5)), 2.1);
  r(`lo <b>blanco</b>`, "", ABA, (g) => asoma(g, 0.25, 1.95));
  r(`es <b>aire</b>`, "o g", ABA, (g) => asoma(g, 3.45, 5.05));
  r(`no pudo <b>escapar</b>`, "r", ARR, (g) => asoma(g, 4.35, 5.05));
  // agua
  r(`<b>agua</b>`, "c", () => [540, 1270], (g) => asoma(g, 5.6, 6.3));
  r(`<b>aire</b> disuelto`, "o g", ARR, (g) => asoma(g, 6.25, 8.5));
  r(`<b>hielo</b>: todo en su sitio`, "c", ABA, (g) => asoma(g, 7.6, 9.6));
  r(`para el aire <b>no hay sitio</b>`, "r", ARR, (g) => asoma(g, 8.9, 10.3));
  r(`lo va <b>empujando</b>`, "o g", ARR, (g) => asoma(g, 11.4, 13.6));
  // cubitera
  r(`tu <b>cubitera</b>`, "", ARR, (g) => asoma(g, 14.1, 15.6));
  r(`frío por <b>todos los lados</b>`, "c g", ARR, (g) => asoma(g, 15.75, 17.7));
  r(`de <b>fuera</b> hacia <b>dentro</b>`, "c", ABA, (g) => asoma(g, 17.95, 19.8));
  r(`<b>acorralado</b>`, "o g", ARR, (g) => asoma(g, 20.55, 21.95));
  r(`<b>sin salida</b>`, "r g", ARR, (g) => asoma(g, 22.0, 23.35));
  r(`miles de <b>burbujas</b>`, "g", ARR, (g) => asoma(g, 24.0, 25.2));
  // luz
  r(`la luz se <b>desvía</b>`, "o", ARR, (g) => asoma(g, 26.3, 28.8));
  r(`se ve <b>blanco</b>`, "g", ARR, (g) => asoma(g, 29.0, 31.5));
  r(`como la <b>nieve</b>`, "", () => [300, 1300], (g) => asoma(g, 30.0, 31.5));
  r(`o la <b>espuma</b>`, "", () => [780, 1300], (g) => asoma(g, 30.6, 31.5));
  r(`<b data-layout-allow-occlusion>hervir</b> el agua`, "r", ARR, (g) => asoma(g, 31.65, 35.0), 33.68);
  r(`agua <b data-layout-allow-occlusion>destilada</b>`, "r", () => [540, 1270], (g) => asoma(g, 32.85, 35.0), 33.9);
  r(`por dónde entra el <b>frío</b>`, "c g", ARR, (g) => asoma(g, 35.85, 37.05));
  // bar
  r(`en los <b>bares</b>`, "", ARR, (g) => asoma(g, 37.55, 38.8));
  r(`frío por <b>un solo lado</b>`, "c g", ARR, (g) => asoma(g, 38.85, 40.9));
  r(`agua <b>en movimiento</b>`, "c", () => [540, 1270], (g) => asoma(g, 41.0, 43.3));
  r(`crece <b>hacia arriba</b>`, "c", ARR, (g) => asoma(g, 43.4, 44.95));
  r(`el aire <b>se escapa</b>`, "v g", ARR, (g) => asoma(g, 45.0, 47.05));
  // truco
  r(`en <b>casa</b>`, "", ARR, (g) => asoma(g, 47.6, 49.25));
  r(`nevera de <b>playa</b>`, "", ARR, (g) => asoma(g, 49.3, 50.25));
  r(`<b>sin tapa</b>`, "c g", ARR, (g) => asoma(g, 50.3, 51.5));
  r(`los lados, <b>aislados</b>`, "r", () => [540, 1270], (g) => asoma(g, 51.6, 53.1));
  r(`de <b>arriba</b> abajo`, "c", ARR, (g) => asoma(g, 53.2, 54.5));
  r(`<b>cortas</b> la parte blanca`, "r g", ARR, (g) => asoma(g, 54.6, 56.4));
  // cierre
  r(`lo blanco es <b>aire</b>`, "o g", ABA, (g) => asoma(g, 57.3, 59.3));
  return (g, k) => L.forEach((l) => {
    const [x, y] = l.sitio(k);
    pon(l.e, x, y, l.on(g));
    if (l.tch) tacha(l.e, g, l.tch);
  });
}

// ── abajo: el aire que se queda atrapado en cada forma de congelar ──────────────────────────────────────────────
function medidor(capa) {
  const m = K.crear(capa, `<div class="c-medidor"><span>aire atrapado</span>
    <svg width="290" height="76" viewBox="0 0 290 76" aria-hidden="true"><rect x="0" y="27" width="280" height="22" rx="11" fill="rgba(255,255,255,0.1)"/><rect class="barra" x="0" y="27" height="22" rx="11"/></svg><b></b></div>`);
  const barra = m.querySelector(".barra"), val = m.querySelector("b");
  let ultimo = "";
  return (g) => {
    const on = asoma(g, 19.6, 25.2) + asoma(g, 43.0, 47.1) + asoma(g, 52.6, 56.4);
    m.style.opacity = on.toFixed(2);
    if (on < 0.005) return;
    const p = g < 30 ? 0.95 * sube(g, 20.0, 24.6) : g < 50 ? 0.02 : 0.3 * sube(g, 53.4, 54.5) * (1 - sube(g, 55.3, 56.0));
    const col = p > 0.6 ? ROJO : p > 0.08 ? ORO : VERDE;
    barra.setAttribute("width", f1(Math.max(22, 280 * p)));
    barra.setAttribute("fill", col);
    const txt = p > 0.6 ? "MUCHO" : p > 0.08 ? (g < 30 ? "cada vez más" : "solo el fondo") : g < 30 ? "poco" : "casi nada";
    if (txt !== ultimo) { val.textContent = txt; ultimo = txt; }
    val.style.color = col;
  };
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
  E.fo = fondo(el(cam, "g"));
  E.cu = cubos(cam);
  E.mo = moleculas(cam);
  E.ct = cubitera(cam);
  E.lu = luz(cam);
  E.ba = bar(cam);
  E.tr = truco(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  E.destello = K.crear(esc, `<div class="c-destello"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  E.pf = pantallaFija(capa); E.me = medidor(capa); E.ro = rotulos(capa);
  return E;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los instantes en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  const cerca = (k, y) => Math.abs(k.y - y) < 2600;
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // un temblor pequeño cuando el aire choca sin salida y cuando se corta
    let tx = 0, ty = 0;
    const a = asoma(g, 22.0, 22.6) * 0.6 + Math.exp(-8 * Math.max(0, g - 54.6)) * (g > 54.6 ? 1 : 0);
    tx = 7 * a * Math.sin(83 * g); ty = 5 * a * Math.cos(71 * g);
    E.cam.setAttribute("transform", `translate(${(540 - k.x * k.z + tx).toFixed(2)} ${(1000 - k.y * k.z + ty).toFixed(2)}) scale(${k.z.toFixed(4)})`);
    E.destello.style.opacity = (0.3 * (g > 54.6 ? Math.exp(-9 * (g - 54.6)) : 0) + 0.25 * asoma(g, 28.95, 29.3) * (1 - K.tramo(g, 29.3, 29.9))).toFixed(3);
    E.fo(g);
    if (cerca(k, 1000)) E.cu(g);
    if (cerca(k, AG)) E.mo(g);
    if (cerca(k, CU)) E.ct(g);
    if (cerca(k, LU)) E.lu(g);
    if (cerca(k, BA)) E.ba(g);
    if (cerca(k, TR)) E.tr(g);
    E.pf(g);
    E.me(g);
    E.ro(g, k);
    return { g, k };
  };
  return E;
}
