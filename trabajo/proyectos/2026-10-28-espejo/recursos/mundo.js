// El mundo del espejo, todo en 2D, en un svg con la cámara dentro (un transform del grupo), por estaciones:
//   y = 1000   de frente: el espejo en la pared, tú de espaldas y tu reflejo (gancho, prueba, pino y cierre)
//   y = 4000   visto desde arriba: tú, el cristal y tu reflejo (planta y giro)
//   y = 7000   la ambulancia de frente y el retrovisor del coche de delante
const K = window.K;
const NS = "http://www.w3.org/2000/svg";
const PI = Math.PI;

export const ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", CIAN = "#5fd4ff";
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 49.59;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);
const fr = (v) => v - Math.floor(v);
const mezcla = (a, b, t) => a + (b - a) * t;

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, prueba: 6.36, planta: 15.66, giro: 25.9, pino: 34.2, ambulancia: 39.96, cierre: 46.92 };

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
const GA = 1000, PL = 4000, AM = 7000;

// ── la cámara: el punto (x, y) del mundo queda en (540, 1000) con zoom z ───────────────────────────────────────
export const F0 = { x: 560, y: GA + 400, z: 1.0 };
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
  [0, [[0, F0], [2.0, Z(562, 1.02, GA + 405)], [4.9, Z(590, 1.1, GA + 420)], [G0.prueba, Z(596, 1.12, GA + 420)]]],
  [G0.prueba, [[G0.prueba, Z(560, 0.98, GA + 400)], [9.6, Z(566, 1.0, GA + 395)], [12.1, Z(572, 1.03, GA + 392)], [G0.planta, Z(580, 1.07, GA + 392)]]],
  [G0.planta, [[G0.planta, Z(600, 1.08, PL - 150)], [19.0, Z(600, 1.11, PL - 150)], [20.2, Z(600, 1.12, PL - 150)], [22.3, Z(600, 1.2, PL - 150)], [G0.giro, Z(600, 1.17, PL - 150)]]],
  [G0.giro, [[G0.giro, Z(500, 0.98, PL - 100)], [30.3, Z(480, 0.98, PL - 100)], [31.6, Z(600, 1.28, PL - 250)], [G0.pino, Z(600, 1.34, PL - 262)]]],
  [G0.pino, [[G0.pino, Z(570, 0.98, GA + 420)], [36.6, Z(600, 1.0, GA + 400)], [G0.ambulancia, Z(630, 1.12, GA + 360)]]],
  [G0.ambulancia, [[G0.ambulancia, Z(540, 0.94, AM + 200)], [42.6, Z(540, 1.0, AM + 220)], [43.2, Z(540, 1.32, AM + 300)], [43.85, Z(540, 1.34, AM + 300)], [44.7, Z(540, 0.95, AM - 60)], [G0.cierre, Z(540, 0.98, AM - 60)]]],
  [G0.cierre, [[G0.cierre, Z(560, 0.84, GA + 430)], [48.2, Z(560, 0.93, GA + 412)], [TOTAL - 0.35, F0], [TOTAL, F0]]],
];
export function camaraEn(g) {
  let c = CAMINOS[0][1];
  for (const [t, cl] of CAMINOS) if (g >= t) c = cl;
  return camara(g, c);
}

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0b0d10; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(5,6,8,0) 55%, rgba(5,6,8,0.6) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(10,12,15,0.95) 0, rgba(10,12,15,0.84) 300px, rgba(10,12,15,0.45) 470px, rgba(10,12,15,0) 630px); }
.c-destello { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 70% 50% at 50% 52%, #fff 0, rgba(220,240,255,0.6) 60%, rgba(220,240,255,0.2) 100%); opacity: 0; }

.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(12,14,18,0.9); border: 2px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 10px 24px;
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
const opa = (e, v) => pon1(e, "opacity", v.toFixed(2));

const DEFS = `
<defs>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.55)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <radialGradient id="c-luzPared" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#5b6478"/><stop offset="0.45" stop-color="#3a4152"/><stop offset="1" stop-color="#171a22"/></radialGradient>
  <linearGradient id="c-suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3e2a"/><stop offset="0.4" stop-color="#3a2618"/><stop offset="1" stop-color="#160e08"/></linearGradient>
  <linearGradient id="c-marco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0cf8a"/><stop offset="0.35" stop-color="#b8873e"/><stop offset="0.6" stop-color="#e2b866"/><stop offset="1" stop-color="#7a5320"/></linearGradient>
  <linearGradient id="c-vidrio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f8aa8"/><stop offset="0.6" stop-color="#55708f"/><stop offset="1" stop-color="#3c516b"/></linearGradient>
  <linearGradient id="c-sueloRef" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e5a52"/><stop offset="1" stop-color="#4a3a36"/></linearGradient>
  <linearGradient id="c-brillo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset="0.5" stop-color="rgba(255,255,255,0.55)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>
  <linearGradient id="c-velo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.16)"/><stop offset="0.4" stop-color="rgba(255,255,255,0.02)"/><stop offset="0.7" stop-color="rgba(255,255,255,0.07)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>
  <linearGradient id="c-madera" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0c88a"/><stop offset="0.55" stop-color="#d6a466"/><stop offset="1" stop-color="#a8733a"/></linearGradient>
  <linearGradient id="c-luna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe9ff"/><stop offset="1" stop-color="#7fb2d8"/></linearGradient>
  <linearGradient id="c-carro" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ccd2"/><stop offset="0.18" stop-color="#f6f7f9"/><stop offset="0.82" stop-color="#f6f7f9"/><stop offset="1" stop-color="#b9bcc3"/></linearGradient>
  <linearGradient id="c-parabrisas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4a6e"/><stop offset="1" stop-color="#0f1c2c"/></linearGradient>
  <linearGradient id="c-noche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1422"/><stop offset="0.6" stop-color="#1a2234"/><stop offset="1" stop-color="#121722"/></linearGradient>
  <linearGradient id="c-asfalto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2d33"/><stop offset="1" stop-color="#121418"/></linearGradient>
  <radialGradient id="c-faro" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,250,220,0.95)"/><stop offset="0.35" stop-color="rgba(255,240,190,0.45)"/><stop offset="1" stop-color="rgba(255,240,190,0)"/></radialGradient>
  <radialGradient id="c-azul" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(70,140,255,0.55)"/><stop offset="1" stop-color="rgba(70,140,255,0)"/></radialGradient>
  <radialGradient id="c-rojo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,60,80,0.5)"/><stop offset="1" stop-color="rgba(255,60,80,0)"/></radialGradient>
  <radialGradient id="c-verde" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(34,211,138,0.6)"/><stop offset="1" stop-color="rgba(34,211,138,0)"/></radialGradient>
  <pattern id="c-baldosa" width="140" height="140" patternUnits="userSpaceOnUse"><rect width="140" height="140" fill="#3b342d"/><rect width="70" height="70" fill="#5c5145"/><rect x="70" y="70" width="70" height="70" fill="#5c5145"/><path d="M0 0.75H140M0.75 0V140M0 70.5H140M70.5 0V140" stroke="rgba(0,0,0,0.35)" stroke-width="2"/></pattern>
</defs>`;

// ── el maniquí de madera, de frente o de espaldas, con los pies en (0, 0); mide unos 560 ────────────────────────
// La pulsera roja va siempre en la muñeca de su lado +x. De espaldas (cara 0, sx 1) es su mano derecha.
// f(x, y, s, { brazo (0 abajo, 1 arriba, el de la pulsera), otro (el otro brazo), cara, sx, sy, a, op, falso })
const PIVOTE = -280;
function maniqui(p, o = {}) {
  const fan = !!o.fantasma;
  const LIN = fan ? "#8fe4ff" : "#3a2414", MAD = fan ? "#1b4a60" : u("madera"), MAD2 = fan ? "#2a6680" : "#b98447";
  const G = el(p, "g");
  if (!fan) el(G, "ellipse", { cx: 0, cy: 2, rx: 120, ry: 18, fill: u("sombra") });
  const C = el(G, "g");
  const seg = (w, col) => {
    const a = el(C, "path", { fill: "none", stroke: LIN, "stroke-width": w + 10, "stroke-linecap": "round", "stroke-linejoin": "round" });
    const b = el(C, "path", { fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" });
    return (d) => { pon1(a, "d", d); pon1(b, "d", d); };
  };
  const bola = (x, y, r) => el(C, "circle", { cx: x, cy: y, r, fill: MAD2, stroke: LIN, "stroke-width": 5 });
  // las piernas y los pies
  [-1, 1].forEach((s) => {
    el(C, "ellipse", { cx: s * 46, cy: -12, rx: 32, ry: 14, fill: MAD2, stroke: LIN, "stroke-width": 6 });
    seg(44, fan ? MAD : "#d09a58")(`M${s * 32} -228 L${s * 36} -122 L${s * 40} -22`);
    bola(s * 36, -122, 17);
  });
  // el tronco
  el(C, "path", { d: "M-74 -440 C-84 -400 -62 -330 -46 -292 C-58 -262 -68 -234 -62 -204 C-30 -192 30 -192 62 -204 C68 -234 58 -262 46 -292 C62 -330 84 -400 74 -440 C40 -456 -40 -456 -74 -440 Z", fill: MAD, stroke: LIN, "stroke-width": 9 });
  el(C, "path", { d: "M-46 -292 Q0 -282 46 -292", fill: "none", stroke: LIN, "stroke-width": 5, opacity: 0.6 });
  // por detrás: la espalda
  const espalda = el(C, "g");
  el(espalda, "path", { d: "M0 -436 L0 -300", stroke: LIN, "stroke-width": 5, opacity: 0.45 });
  el(espalda, "path", { d: "M-46 -418 Q-30 -392 -12 -412 M46 -418 Q30 -392 12 -412", fill: "none", stroke: LIN, "stroke-width": 5, opacity: 0.4 });
  // por delante: el pecho
  const pecho = el(C, "g");
  el(pecho, "path", { d: "M-40 -392 Q-22 -376 -6 -390 M40 -392 Q22 -376 6 -390", fill: "none", stroke: LIN, "stroke-width": 5, opacity: 0.4 });
  // los brazos (se dibujan en cada fotograma)
  const brazos = [-1, 1].map((s) => ({
    s, d: seg(32, fan ? MAD : "#d6a466"),
    codo: el(C, "circle", { r: 14, fill: MAD2, stroke: LIN, "stroke-width": 5 }),
    mano: el(C, "circle", { r: 21, fill: MAD, stroke: LIN, "stroke-width": 7 }),
  }));
  const pul = [el(C, "path", { fill: "none", stroke: "#5a0a14", "stroke-width": 46, "stroke-linecap": "butt" }), el(C, "path", { fill: "none", stroke: ROJO, "stroke-width": 38, "stroke-linecap": "butt" })];
  const pulBrillo = el(C, "path", { fill: "none", stroke: "#ff9aa8", "stroke-width": 6, "stroke-linecap": "round" });
  [-1, 1].forEach((s) => bola(s * 66, -426, 22));
  // el brazo que no se mueve, pintado a rayas (lo que pasaría si el espejo cambiara los lados)
  const falso = el(C, "g", { opacity: 0 });
  const falsoB = el(falso, "path", { fill: "none", stroke: ROJO, "stroke-width": 8, "stroke-dasharray": "18 14", "stroke-linecap": "round", "stroke-linejoin": "round" });
  const falsoM = el(falso, "circle", { r: 22, fill: "rgba(240,68,90,0.15)", stroke: ROJO, "stroke-width": 7, "stroke-dasharray": "12 10" });
  // el cuello y la cabeza
  seg(26, fan ? MAD : "#d6a466")("M0 -446 L0 -470");
  el(C, "ellipse", { cx: 0, cy: -514, rx: 42, ry: 52, fill: MAD, stroke: LIN, "stroke-width": 9 });
  const cara = el(C, "g");
  el(cara, "ellipse", { cx: -15, cy: -520, rx: 5.5, ry: 8, fill: LIN });
  el(cara, "ellipse", { cx: 15, cy: -520, rx: 5.5, ry: 8, fill: LIN });
  el(cara, "path", { d: "M-15 -492 Q0 -481 15 -492", fill: "none", stroke: LIN, "stroke-width": 5, "stroke-linecap": "round" });
  const nuca = el(C, "g");
  el(nuca, "path", { d: "M-24 -488 Q0 -478 24 -488", fill: "none", stroke: LIN, "stroke-width": 4, opacity: 0.35 });
  // el estado del último fotograma (para saber dónde queda cada mano en el mundo)
  const st = { x: 0, y: 0, s: 1, sx: 1, sy: 1, a: 0, manos: {} };
  const brazo = (s, k) => {
    const th = mezcla(0.13, PI - 0.24, k), th2 = th + mezcla(0.06, -0.16, k);
    const S = [s * 66, -426], E = [S[0] + s * 118 * Math.sin(th), S[1] + 118 * Math.cos(th)];
    const H = [E[0] + s * 108 * Math.sin(th2), E[1] + 108 * Math.cos(th2)];
    return { S, E, H };
  };
  const f = (x, y, s, e = {}) => {
    const op = e.op ?? 1;
    opa(G, op);
    if (op < 0.01) return;
    const sx = e.sx ?? 1, sy = e.sy ?? 1, a = e.a || 0;
    Object.assign(st, { x, y, s, sx, sy, a });
    pon1(G, "transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${s.toFixed(3)})`);
    pon1(C, "transform", `translate(0 ${PIVOTE}) scale(${Math.abs(sx) < 0.004 ? 0.004 : sx.toFixed(3)} ${Math.abs(sy) < 0.004 ? 0.004 : sy.toFixed(3)}) translate(0 ${-PIVOTE})`);
    const cr = e.cara ?? 0;
    opa(cara, cr); opa(pecho, cr); opa(nuca, 1 - cr); opa(espalda, 1 - cr);
    brazos.forEach((b) => {
      const k = b.s > 0 ? e.brazo || 0 : e.otro || 0;
      const { S, E, H } = brazo(b.s, k);
      b.d(`M${f1(S[0])} ${f1(S[1])} L${f1(E[0])} ${f1(E[1])} L${f1(H[0])} ${f1(H[1])}`);
      pon1(b.codo, "cx", f1(E[0])); pon1(b.codo, "cy", f1(E[1]));
      pon1(b.mano, "cx", f1(H[0])); pon1(b.mano, "cy", f1(H[1]));
      st.manos[b.s] = H;
      if (b.s > 0) {
        const P = (t) => `${f1(mezcla(E[0], H[0], t))} ${f1(mezcla(E[1], H[1], t))}`;
        const d = `M${P(0.66)} L${P(0.84)}`;
        pul.forEach((q) => pon1(q, "d", d));
        pon1(pulBrillo, "d", `M${P(0.7)} L${P(0.8)}`);
      }
    });
    const fa = e.falso || 0;
    opa(falso, fa);
    if (fa > 0.01) {
      const { S, E, H } = brazo(-1, 1);
      pon1(falsoB, "d", `M${f1(S[0])} ${f1(S[1])} L${f1(E[0])} ${f1(E[1])} L${f1(H[0])} ${f1(H[1])}`);
      pon1(falsoM, "cx", f1(H[0])); pon1(falsoM, "cy", f1(H[1]));
      st.manos.falsa = H;
    }
  };
  // un punto del maniquí (en sus coordenadas) en el mundo, con el estado del último fotograma
  f.punto = (lx, ly) => {
    const cx = st.sx * lx, cy = PIVOTE + st.sy * (ly - PIVOTE);
    const ca = Math.cos(st.a * PI / 180), sa = Math.sin(st.a * PI / 180);
    return [st.x + st.s * (cx * ca - cy * sa), st.y + st.s * (cx * sa + cy * ca)];
  };
  f.mano = (k) => { const H = st.manos[k]; return H ? f.punto(H[0], H[1]) : [0, 0]; };
  return f;
}

// ── el maniquí visto desde arriba, mirando hacia -y (la nariz), con la pulsera en su mano +x (la derecha) ───────
// f(x, y, s, { a (grados), sy (-1: en el espejo), op })
function cenital(p, o = {}) {
  const fan = !!o.fantasma;
  const LIN = fan ? "#8fe4ff" : "#3a2414", MAD = fan ? "#1b4a60" : u("madera"), MAD2 = fan ? "#2a6680" : "#b98447";
  const G = el(p, "g");
  if (!fan) el(G, "ellipse", { cx: 0, cy: 8, rx: 150, ry: 70, fill: u("sombra") });
  [-1, 1].forEach((s) => el(G, "ellipse", { cx: s * 30, cy: -40, rx: 17, ry: 30, fill: MAD2, stroke: LIN, "stroke-width": 6 }));
  [-1, 1].forEach((s) => el(G, "ellipse", { cx: s * 100, cy: 4, rx: 22, ry: 32, fill: MAD2, stroke: LIN, "stroke-width": 6 }));
  el(G, "ellipse", { cx: 0, cy: 0, rx: 104, ry: 40, fill: MAD, stroke: LIN, "stroke-width": 8 });
  el(G, "ellipse", { cx: 110, cy: 6, rx: 11, ry: 24, fill: ROJO, stroke: "#5a0a14", "stroke-width": 4 });
  [-1, 1].forEach((s) => el(G, "circle", { cx: s * 122, cy: 8, r: 19, fill: MAD, stroke: LIN, "stroke-width": 6 }));
  el(G, "path", { d: "M-12 -34 L0 -62 L12 -34 Z", fill: MAD2, stroke: LIN, "stroke-width": 5, "stroke-linejoin": "round" });
  el(G, "circle", { cx: 0, cy: -2, r: 42, fill: MAD, stroke: LIN, "stroke-width": 8 });
  el(G, "circle", { cx: -10, cy: -12, r: 14, fill: "rgba(255,255,255,0.22)" });
  const st = { x: 0, y: 0, s: 1, a: 0, sy: 1 };
  const f = (x, y, s, e = {}) => {
    const op = e.op ?? 1;
    opa(G, op);
    Object.assign(st, { x, y, s, a: e.a || 0, sy: e.sy ?? 1 });
    if (op < 0.01) return;
    pon1(G, "transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(st.a)}) scale(${s.toFixed(3)} ${(s * st.sy).toFixed(3)})`);
  };
  f.punto = (lx, ly) => {
    const ca = Math.cos(st.a * PI / 180), sa = Math.sin(st.a * PI / 180), X = lx * st.s, Y = ly * st.s * st.sy;
    return [st.x + X * ca - Y * sa, st.y + X * sa + Y * ca];
  };
  return f;
}

// ── flechas, sellos y anillos ───────────────────────────────────────────────────────────────────────────────────
// f(x0, y0, x1, y1, k (lo dibujado), op, curva (px hacia la izquierda del camino), col)
function flecha(p, col, w = 12, rayas = false) {
  const g = el(p, "g", { opacity: 0 });
  const borde = el(g, "path", { fill: "none", stroke: "rgba(0,0,0,0.55)", "stroke-width": w + 8, "stroke-linecap": "round", "stroke-linejoin": "round" });
  const linea = el(g, "path", { fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", ...(rayas ? { "stroke-dasharray": `${w * 1.8} ${w * 1.4}` } : {}) });
  const punta = el(g, "path", { d: `M${w * 3.2} 0 L${-w * 1.4} ${-w * 2.4} L${-w * 0.6} 0 L${-w * 1.4} ${w * 2.4} Z`, fill: col, stroke: "rgba(0,0,0,0.55)", "stroke-width": 4, "stroke-linejoin": "round" });
  return (x0, y0, x1, y1, k, op, curva = 0, c = col) => {
    opa(g, op * (k > 0.02 ? 1 : 0));
    if (op < 0.01 || k < 0.02) return;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) || 1;
    const cx = mx + ((y1 - y0) / L) * curva, cy = my - ((x1 - x0) / L) * curva;
    const B = (t) => [(1 - t) ** 2 * x0 + 2 * t * (1 - t) * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * t * (1 - t) * cy + t * t * y1];
    let d = "";
    const n = 24;
    for (let i = 0; i <= n; i++) { const [x, y] = B((k * i) / n); d += `${i ? "L" : "M"}${f1(x)} ${f1(y)}`; }
    pon1(linea, "d", d); pon1(borde, "d", d);
    pon1(linea, "stroke", c); pon1(punta, "fill", c);
    const [ax, ay] = B(k), [bx, by] = B(Math.max(0, k - 0.02));
    pon1(punta, "transform", `translate(${f1(ax)} ${f1(ay)}) rotate(${f1(Math.atan2(ay - by, ax - bx) * 180 / PI)})`);
  };
}
function sello(p, bien) {
  const g = el(p, "g", { opacity: 0 });
  el(g, "circle", { r: 50, fill: bien ? VERDE : ROJO, stroke: "#fff", "stroke-width": 7 });
  el(g, "path", { d: bien ? "M-24 2 L-7 19 L25 -17" : "M-18 -18 L18 18 M18 -18 L-18 18", stroke: "#fff", "stroke-width": 12, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
  return (x, y, s, op, a = 0) => { opa(g, op); if (op > 0.01) pone(g, x, y, s, a); };
}
function anillo(p, col) {
  const g = el(p, "g", { opacity: 0 });
  el(g, "circle", { r: 1, fill: "none", stroke: col, "stroke-width": 0.09 });
  return (x, y, r, op) => { opa(g, op); if (op > 0.01) pone(g, x, y, r); };
}
function pregunta(p, col = ORO) {
  const g = el(p, "g", { opacity: 0 });
  texto(g, 0, 60, "?", { "font-size": 190, fill: col, stroke: "#1a1206", "stroke-width": 10, "paint-order": "stroke" });
  return (x, y, s, op, a = 0) => { opa(g, op); if (op > 0.01) pone(g, x, y, s, a); };
}
// un golpe que crece y vuelve (para los sellos)
const pop = (g, t) => (g < t ? 0 : 0.6 + 0.4 * K.sale(K.tramo(g, t, t + 0.18)) + 0.12 * Math.sin(K.tramo(g, t + 0.18, t + 0.5) * PI));

// ── de frente: la pared, el espejo, tú de espaldas y tu reflejo ─────────────────────────────────────────────────
const VID = { x0: 380, x1: 900, y0: GA + 90, y1: GA + 860 };
const REF = { x: 692, y: GA + 790, s: 0.95 };
const TU = { x: 330, y: GA + 1362, s: 1.42 };
function frente(p) {
  el(p, "rect", { x: -1600, y: GA - 1600, width: 4300, height: 2545, fill: u("luzPared") });
  el(p, "rect", { x: -1600, y: GA + 945, width: 4300, height: 1700, fill: u("suelo") });
  el(p, "rect", { x: -1600, y: GA + 940, width: 4300, height: 14, fill: "#2a2018" });
  for (let i = 0; i < 9; i++) el(p, "path", { d: `M${-400 + i * 260} ${GA + 954} L${-1400 + i * 520} ${GA + 2600}`, stroke: "rgba(0,0,0,0.28)", "stroke-width": 4 });
  // el espejo
  el(p, "rect", { x: VID.x0 - 34, y: VID.y0 - 34, width: VID.x1 - VID.x0 + 68, height: VID.y1 - VID.y0 + 68, rx: 22, fill: "rgba(0,0,0,0.45)", transform: "translate(10 16)" });
  el(p, "rect", { x: VID.x0 - 30, y: VID.y0 - 30, width: VID.x1 - VID.x0 + 60, height: VID.y1 - VID.y0 + 60, rx: 20, fill: u("marco"), stroke: "#4a3010", "stroke-width": 6 });
  el(p, "rect", { x: VID.x0 - 10, y: VID.y0 - 10, width: VID.x1 - VID.x0 + 20, height: VID.y1 - VID.y0 + 20, rx: 8, fill: "none", stroke: "rgba(80,50,10,0.6)", "stroke-width": 5 });
  const clip = el(p, "clipPath", { id: `${PRE}vidrio` });
  el(clip, "rect", { x: VID.x0, y: VID.y0, width: VID.x1 - VID.x0, height: VID.y1 - VID.y0, rx: 4 });
  const D = el(p, "g", { "clip-path": u("vidrio") });
  el(D, "rect", { x: VID.x0, y: VID.y0, width: VID.x1 - VID.x0, height: VID.y1 - VID.y0, fill: u("vidrio") });
  el(D, "rect", { x: VID.x0, y: GA + 700, width: VID.x1 - VID.x0, height: 200, fill: u("sueloRef") });
  el(D, "rect", { x: VID.x0, y: GA + 696, width: VID.x1 - VID.x0, height: 8, fill: "rgba(30,24,20,0.6)" });
  // la puerta de la habitación, en el reflejo
  el(D, "rect", { x: 418, y: GA + 300, width: 120, height: 400, fill: "rgba(40,52,70,0.55)", stroke: "rgba(220,235,255,0.25)", "stroke-width": 4 });
  el(D, "circle", { cx: 520, cy: GA + 510, r: 7, fill: "rgba(255,220,150,0.6)" });
  const ref = maniqui(D);
  const velo = el(D, "rect", { x: VID.x0, y: VID.y0, width: VID.x1 - VID.x0, height: VID.y1 - VID.y0, fill: u("velo") });
  const brillo = el(D, "rect", { x: -160, y: GA - 200, width: 160, height: 1400, fill: u("brillo"), opacity: 0.7 });
  // lo que se imagina (el fantasma), las marcas y tú
  const marcas = el(p, "g");
  const mito = flecha(marcas, "#ffffff", 12, true), bien = flecha(marcas, VERDE, 12);
  const no = sello(marcas, false), si = sello(marcas, true);
  const duda = pregunta(marcas, ORO);
  const ok1 = sello(marcas, true), ok2 = sello(marcas, true), noOtro = sello(marcas, false);
  const arr1 = flecha(marcas, VERDE, 14), arr2 = flecha(marcas, VERDE, 12), der1 = flecha(marcas, CIAN, 14), der2 = flecha(marcas, CIAN, 12);
  const tu = maniqui(p);
  const delante = el(p, "g");
  const fan = maniqui(delante, { fantasma: true });
  const malAnillo = anillo(delante, ROJO);
  const pinoNo = sello(delante, false);
  return (g) => {
    // los dos se mecen igual (en el espejo, hacia el mismo lado)
    const mece = 1.3 * Math.sin(vuelta(g, 0.22)), resp = 0.006 * Math.sin(vuelta(g, 0.3));
    const sube1 = g < 16 ? sube(g, 7.36, 8.0) : 0;
    // en «cabeza abajo» (gancho) el reflejo se da la vuelta y vuelve
    const vu = g < 7 ? sube(g, 5.0, 5.42) * (1 - sube(g, 6.0, 6.36)) : 0;
    const syR = Math.cos(PI * vu);
    ref(REF.x, REF.y, REF.s * (1 + resp), { cara: 1, brazo: sube1, sy: syR, a: mece, falso: g > 11 && g < 16 ? sube(g, 11.38, 11.7) : 0 });
    tu(TU.x, TU.y, TU.s * (1 + resp), { cara: 0, brazo: sube1, a: mece });
    // el brillo que cruza el espejo al empezar
    pon1(brillo, "x", f1(mezcla(VID.x0 - 300, VID.x1 + 200, K.tramo(g, 0.05, 1.1))));
    pon1(brillo, "transform", `rotate(18 640 ${GA + 470})`);
    opa(velo, 1);
    // gancho: la flecha del mito (a la mano del otro lado) y la de verdad (a la del mismo lado)
    const [hx, hy] = tu.mano(1), [rx1, ry1] = ref.mano(-1), [rx2, ry2] = ref.mano(1);
    const kM = g < 7 ? sube(g, 0.25, 1.5) : 0, opM = g < 7 ? 1 - sube(g, 2.7, 3.0) : 0;
    const roja = g >= 2.08;
    mito(hx, hy - 30, rx1, ry1 + 34, kM, opM, -120, roja ? ROJO : "#ffffff");
    no(mezcla(hx, rx1, 0.5) - 70, mezcla(hy, ry1, 0.5) - 20, pop(g, 2.08), g < 7 ? asoma(g, 2.08, 2.75) : 0, -10);
    const kB = g < 7 ? sube(g, 2.2, 2.85) : 0, opB = g < 7 ? 1 - sube(g, 4.6, 4.95) : 0;
    bien(hx + 10, hy - 30, rx2, ry2 + 34, kB, opB, 60);
    si(rx2 + 64, ry2 + 40, pop(g, 2.85), g < 7 ? asoma(g, 2.85, 4.6) : 0, 8);
    duda(REF.x + 180, GA + 260, 0.9 + 0.1 * Math.sin(g * 6), g < 7 ? asoma(g, 5.1, 6.0) : 0, 12 * Math.sin(g * 4));
    // prueba: la mano del mismo lado; la del otro lado, no; arriba sigue arriba; la derecha, a la derecha
    const p1 = tu.mano(1), p2 = ref.mano(1);
    const enPrueba = g > 6 && g < 16;
    ok1(p1[0] + 70, p1[1] - 10, pop(g, 10.34) * 0.85, enPrueba ? asoma(g, 10.34, 12.05) : 0);
    ok2(p2[0] + 66, p2[1] + 10, pop(g, 10.34) * 0.75, enPrueba ? asoma(g, 10.34, 12.05) : 0);
    const pf = ref.mano("falsa");
    noOtro(pf[0] - 50, pf[1] - 40, pop(g, 11.42) * 0.75, enPrueba ? asoma(g, 11.42, 12.05) : 0);
    const kA = enPrueba ? sube(g, 12.18, 12.6) : 0, oA = enPrueba ? 1 - sube(g, 15.4, 15.66) : 0;
    arr1(TU.x - 150, GA + 820, TU.x - 150, GA + 820 - 200 * kA, 1, kA > 0.02 ? oA : 0);
    arr2(REF.x - 150, GA + 360, REF.x - 150, GA + 360 - 140 * kA, 1, kA > 0.02 ? oA : 0);
    const kD = enPrueba ? sube(g, 13.78, 14.2) : 0;
    const c1 = tu.punto(0, -360), c2 = ref.punto(0, -360);
    der1(c1[0] - 70, c1[1], c1[0] - 70 + 190 * kD, c1[1], 1, kD > 0.02 ? oA : 0);
    der2(c2[0] - 60, c2[1], c2[0] - 60 + 150 * kD, c2[1], 1, kD > 0.02 ? oA : 0);
    // pino: te imaginas dándote la vuelta cabeza abajo hasta su sitio
    const enPino = g > 34 && g < 41;
    const kP = enPino ? sube(g, 35.0, 36.5) : 0, opP = enPino ? sube(g, 34.5, 34.9) * (1 - sube(g, 39.6, 39.95)) : 0;
    const syP = Math.cos(PI * kP);
    const salta = Math.sin(PI * kP) * 120;
    fan(mezcla(TU.x, REF.x, kP), mezcla(TU.y, REF.y, kP) - salta, mezcla(TU.s, REF.s, kP), { cara: kP > 0.5 ? 1 : 0, sy: syP, op: opP * 0.82, a: mece });
    const cabeza = ref.punto(0, -514), cabezaF = fan.punto(0, -514);
    const mal = enPino ? asoma(g, 38.58, 39.6) : 0;
    malAnillo(cabeza[0], cabeza[1], 70 + 10 * Math.sin(g * 14), mal);
    pinoNo(cabezaF[0] + 110, cabezaF[1], pop(g, 38.58) * 0.8, mal);
    opa(marcas, 1);
  };
}

// ── visto desde arriba: tú, el cristal y tu reflejo ─────────────────────────────────────────────────────────────
const TUP = { x: 600, y: PL + 300, s: 1.32 }, REP = { x: 600, y: PL - 300, s: 1.32 };
function planta(p) {
  el(p, "rect", { x: -1600, y: PL - 1700, width: 4300, height: 3400, fill: u("baldosa") });
  // lo de detrás del cristal es el mundo del espejo
  el(p, "rect", { x: -1600, y: PL - 1700, width: 4300, height: 1700, fill: "rgba(95,170,255,0.13)" });
  el(p, "rect", { x: -1600, y: PL - 1700, width: 4300, height: 1700, fill: "rgba(10,20,40,0.28)" });
  const etq = texto(p, 600, PL + 520, "visto desde arriba", { "font-size": 40, fill: "rgba(255,255,255,0.7)" });
  // el ojo que mira desde arriba
  el(p, "path", { d: `M430 ${PL + 507} q-34 -26 -68 0 q34 26 68 0 Z`, fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-width": 4, transform: "translate(-14 0)" });
  el(p, "circle", { cx: 382, cy: PL + 507, r: 9, fill: "rgba(255,255,255,0.7)" });
  // el cristal, de canto
  el(p, "rect", { x: 250, y: PL - 18, width: 700, height: 36, rx: 6, fill: "rgba(0,0,0,0.5)" });
  el(p, "rect", { x: 250, y: PL - 14, width: 700, height: 12, fill: "#5b4a3a" });
  el(p, "rect", { x: 250, y: PL - 2, width: 700, height: 16, fill: u("luna") });
  el(p, "rect", { x: 250, y: PL + 1, width: 700, height: 4, fill: "rgba(255,255,255,0.8)" });
  el(p, "rect", { x: 236, y: PL - 22, width: 20, height: 44, rx: 6, fill: u("marco") });
  el(p, "rect", { x: 944, y: PL - 22, width: 20, height: 44, rx: 6, fill: u("marco") });
  const marcas = el(p, "g");
  const ref = cenital(p), tu = cenital(p);
  const fan = cenital(p, { fantasma: true });
  const lin1 = el(marcas, "path", { fill: "none", stroke: ORO, "stroke-width": 7, "stroke-dasharray": "4 16", "stroke-linecap": "round", opacity: 0 });
  const lin2 = el(marcas, "path", { fill: "none", stroke: CIAN, "stroke-width": 7, "stroke-dasharray": "4 16", "stroke-linecap": "round", opacity: 0 });
  const delT = flecha(p, ORO, 14), delR = flecha(p, ORO, 14);
  const derT = flecha(p, CIAN, 11), derR = flecha(p, CIAN, 11);
  const duda = pregunta(p, ORO);
  const camino = el(p, "path", { fill: "none", stroke: "rgba(143,228,255,0.6)", "stroke-width": 7, "stroke-dasharray": "2 18", "stroke-linecap": "round", opacity: 0 });
  const gira = flecha(p, "#8fe4ff", 10);
  const aR = anillo(p, ROJO), aC = anillo(p, CIAN);
  const noS = sello(p, false);
  return (g) => {
    const mece = 1.5 * Math.sin(vuelta(g, 0.2));
    // en «él mira hacia ti» los dos se asoman al cristal a la vez
    const ac = g > 15 && g < 26 ? 34 * asoma(g, 20.3, 22.2) * (0.7 + 0.3 * Math.sin(g * 5)) : 0;
    tu(TUP.x, TUP.y - ac, TUP.s, { a: mece });
    ref(REP.x, REP.y + ac, REP.s, { sy: -1, a: -mece });
    opa(etq, 1);
    const enPl = g > 15 && g < 26;
    // la derecha sigue a la derecha (las dos pulseras, en el mismo lado)
    const kd = enPl ? sube(g, 15.85, 16.3) * (1 - sube(g, 18.4, 18.62)) : 0;
    derT(TUP.x + 150, TUP.y + 8, TUP.x + 150 + 120 * kd, TUP.y + 8, 1, kd > 0.02 ? 1 : 0);
    derR(REP.x + 150, REP.y - 8, REP.x + 150 + 120 * kd, REP.y - 8, 1, kd > 0.02 ? 1 : 0);
    // delante y detrás: las narices se miran
    const kv = enPl ? sube(g, 16.45, 16.95) : 0, ov = enPl ? 1 - sube(g, 25.5, 25.9) : 0;
    const late = 1 + 0.25 * (asoma(g, 17.1, 17.4) + asoma(g, 17.76, 18.06));
    delT(TUP.x, TUP.y - 95, TUP.x, TUP.y - 95 - 150 * kv * late, 1, kv > 0.02 ? ov : 0);
    delR(REP.x, REP.y + 95, REP.x, REP.y + 95 + 150 * kv * late, 1, kv > 0.02 ? ov : 0);
    // tú hacia él, él hacia ti: la nariz con la nariz y la pulsera con la pulsera
    const k1 = enPl ? sube(g, 19.4, 20.1) : 0, k2 = enPl ? sube(g, 20.35, 21.0) : 0, ol = enPl ? 1 - sube(g, 25.5, 25.9) : 0;
    pon1(lin1, "d", `M${TUP.x} ${f1(TUP.y - 70)} L${TUP.x} ${f1(mezcla(TUP.y - 70, REP.y + 70, k1))}`);
    opa(lin1, k1 > 0.02 ? ol : 0);
    pon1(lin2, "d", `M${TUP.x + 145} ${TUP.y} L${TUP.x + 145} ${f1(mezcla(TUP.y, REP.y, k2))}`);
    opa(lin2, k2 > 0.02 ? ol : 0);
    pon1(lin1, "stroke-dashoffset", f1(-g * 60)); pon1(lin2, "stroke-dashoffset", f1(g * 60));
    duda(820, PL - 10, 0.85 + 0.08 * Math.sin(g * 6), enPl ? asoma(g, 23.62, 25.6) : 0, 10 * Math.sin(g * 3));
    // giro: te imaginas yendo a su sitio, dando la vuelta de lado
    const enG = g > 25.5 && g < 34.5;
    const kg = enG ? sube(g, 27.3, 30.2) : 0;
    const opF = enG ? sube(g, 26.0, 26.5) : 0;
    const B = (t) => {
      const P0 = [TUP.x, TUP.y], P1 = [-120, PL + 420], P2 = [-120, PL - 420], P3 = [REP.x, REP.y];
      const c = [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3];
      return [c[0] * P0[0] + c[1] * P1[0] + c[2] * P2[0] + c[3] * P3[0], c[0] * P0[1] + c[1] * P1[1] + c[2] * P2[1] + c[3] * P3[1]];
    };
    const [fx, fy] = B(kg);
    fan(fx, fy, TUP.s, { a: -180 * kg + mece, op: opF * 0.85 });
    let d = "";
    for (let i = 0; i <= 30; i++) { const [x, y] = B(i / 30); d += `${i ? "L" : "M"}${f1(x)} ${f1(y)}`; }
    pon1(camino, "d", d);
    opa(camino, enG ? sube(g, 26.6, 27.1) * (1 - sube(g, 30.3, 30.8)) : 0);
    const kgira = enG ? sube(g, 28.5, 29.4) : 0;
    gira(fx - 20, fy + 150, fx + 150, fy + 40, kgira, enG ? 1 - sube(g, 30.2, 30.6) : 0, -110);
    // la derecha acaba en el otro lado: las pulseras no coinciden
    const pF = fan.punto(110, 6), pR = ref.punto(110, 6);
    const mal = enG ? asoma(g, 32.1, 34.3) : 0;
    aR(pF[0], pF[1], 62 + 8 * Math.sin(g * 12), mal);
    aC(pR[0], pR[1], 62 + 8 * Math.sin(g * 12 + 1.5), enG ? asoma(g, 33.18, 34.3) : 0);
    noS(REP.x + 250, REP.y - 90, pop(g, 33.18) * 0.7, enG ? asoma(g, 33.18, 34.3) : 0);
  };
}

// ── la ambulancia, de frente, y el retrovisor del coche de delante ─────────────────────────────────────────────
function ambulancia(p) {
  el(p, "rect", { x: -1600, y: AM - 1700, width: 4300, height: 2380, fill: u("noche") });
  // edificios
  const r = K.azar(9);
  for (let i = 0; i < 12; i++) {
    const w = 140 + r() * 160, h = 300 + r() * 600, x = -500 + i * 190;
    el(p, "rect", { x: f1(x), y: f1(AM + 620 - h), width: f1(w), height: f1(h), fill: "#121a28", stroke: "#1c2638", "stroke-width": 3 });
    for (let k = 0; k < 6; k++) if (r() < 0.35) el(p, "rect", { x: f1(x + 20 + r() * (w - 60)), y: f1(AM + 640 - h + r() * (h - 100)), width: 26, height: 36, fill: "rgba(255,200,120,0.35)" });
  }
  el(p, "rect", { x: -1600, y: AM + 620, width: 4300, height: 1400, fill: u("asfalto") });
  for (let i = -3; i < 4; i++) el(p, "path", { d: `M${540 + i * 40} ${AM + 640} L${540 + i * 260} ${AM + 1900}`, stroke: i === 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0)", "stroke-width": 12, "stroke-dasharray": "60 70" });
  const luzA = el(p, "ellipse", { cx: 380, cy: AM + 20, rx: 700, ry: 520, fill: u("azul"), opacity: 0 });
  const luzR = el(p, "ellipse", { cx: 700, cy: AM + 20, rx: 700, ry: 520, fill: u("rojo"), opacity: 0 });
  const A = el(p, "g", { id: `${PRE}amb` });
  el(A, "ellipse", { cx: 540, cy: AM + 700, rx: 480, ry: 40, fill: u("sombra") });
  // ruedas
  [[190, 300], [790, 880]].forEach(([a, b]) => el(A, "rect", { x: a, y: AM + 600, width: b - a, height: 100, rx: 18, fill: "#111" }));
  // la caja
  el(A, "path", { d: `M170 ${AM + 70} Q170 ${AM + 30} 210 ${AM + 30} L870 ${AM + 30} Q910 ${AM + 30} 910 ${AM + 70} L920 ${AM + 600} L160 ${AM + 600} Z`, fill: u("carro"), stroke: "#4a4e56", "stroke-width": 6 });
  // las luces de arriba
  el(A, "rect", { x: 290, y: AM - 34, width: 500, height: 66, rx: 18, fill: "#2a2e36", stroke: "#111", "stroke-width": 4 });
  const azul = el(A, "rect", { x: 300, y: AM - 26, width: 236, height: 50, rx: 12, fill: "#2a6cff" });
  const rojo = el(A, "rect", { x: 544, y: AM - 26, width: 236, height: 50, rx: 12, fill: "#ff2a44" });
  // parabrisas
  el(A, "path", { d: `M232 ${AM + 92} L848 ${AM + 92} L872 ${AM + 262} L208 ${AM + 262} Z`, fill: u("parabrisas"), stroke: "#2a2e36", "stroke-width": 6 });
  el(A, "path", { d: `M300 ${AM + 110} L380 ${AM + 110} L320 ${AM + 248} L250 ${AM + 248} Z`, fill: "rgba(255,255,255,0.12)" });
  // el nombre, al revés
  const nombre = el(A, "g", { transform: `translate(540 ${AM + 338}) scale(-1 1)` });
  const nomTxt = texto(nombre, 0, 0, "AMBULANCIA", { "font-size": 96, fill: "#d8202e", "letter-spacing": 2 });
  // la banda de cuadros verdes y amarillos
  for (let i = 0; i < 19; i++) el(A, "rect", { x: 168 + i * 40, y: AM + 380, width: 40, height: 44, fill: i % 2 ? "#18a35a" : "#ffd400" });
  // rejilla y faros
  el(A, "rect", { x: 380, y: AM + 450, width: 320, height: 100, rx: 14, fill: "#1b1e24", stroke: "#4a4e56", "stroke-width": 4 });
  for (let i = 0; i < 4; i++) el(A, "rect", { x: 396, y: AM + 466 + i * 22, width: 288, height: 8, rx: 4, fill: "#3a3e46" });
  [255, 825].forEach((x) => { el(A, "circle", { cx: x, cy: AM + 500, r: 120, fill: u("faro") }); el(A, "circle", { cx: x, cy: AM + 500, r: 44, fill: "#fffbe6", stroke: "#8a8e96", "stroke-width": 6 }); });
  el(A, "rect", { x: 150, y: AM + 562, width: 780, height: 54, rx: 14, fill: "#8a8e96", stroke: "#3a3e46", "stroke-width": 4 });
  // la cruz
  el(A, "path", { d: `M524 ${AM + 50} h32 v18 h18 v32 h-18 v18 h-32 v-18 h-18 v-32 h18 Z`, fill: "#1f6fff", transform: "translate(0 -6)" });
  // el resplandor del nombre cuando se lee
  const halo = el(p, "ellipse", { cx: 540, cy: AM + 304, rx: 420, ry: 120, fill: u("verde"), opacity: 0 });
  const tachon = el(p, "rect", { x: 230, y: AM + 266, width: 620, height: 92, rx: 18, fill: "none", stroke: ROJO, "stroke-width": 8, opacity: 0 });
  // el retrovisor del coche de delante, con la ambulancia dentro (otra vez al revés: se lee al derecho)
  const RV = el(p, "g");
  const RVY = AM - 150;
  el(RV, "rect", { x: 530, y: RVY - 520, width: 20, height: 420, fill: "#1a1c20" });
  el(RV, "rect", { x: 222, y: RVY - 136, width: 636, height: 272, rx: 60, fill: "#0e0f12", stroke: "#3a3e46", "stroke-width": 6 });
  const clip = el(p, "clipPath", { id: `${PRE}retro` });
  el(clip, "rect", { x: 244, y: RVY - 114, width: 592, height: 228, rx: 46 });
  const V = el(RV, "g", { "clip-path": u("retro") });
  el(V, "rect", { x: 244, y: RVY - 114, width: 592, height: 228, fill: "#1a2234" });
  el(V, "use", { href: `#${PRE}amb`, transform: `translate(540 ${RVY + 10}) scale(-0.56 0.56) translate(-540 ${-(AM + 304)})` });
  el(V, "rect", { x: 244, y: RVY - 114, width: 592, height: 228, fill: "rgba(160,200,255,0.1)" });
  el(V, "path", { d: `M300 ${RVY - 114} L380 ${RVY - 114} L300 ${RVY + 114} L230 ${RVY + 114} Z`, fill: "rgba(255,255,255,0.1)" });
  const marcoV = el(RV, "rect", { x: 244, y: RVY - 114, width: 592, height: 228, rx: 46, fill: "none", stroke: VERDE, "stroke-width": 8, opacity: 0 });
  const ok = sello(p, true);
  return (g) => {
    const on = fr(ciclo(g, 2.2)) < 0.5;
    pon1(azul, "fill", on ? "#5a9cff" : "#173a8a"); pon1(rojo, "fill", on ? "#7a1420" : "#ff4a60");
    opa(luzA, on ? 0.9 : 0.25); opa(luzR, on ? 0.2 : 0.85);
    const enA = g > 39.5 && g < 47.5;
    // en «revés» el nombre late y se tacha
    const late = enA ? asoma(g, 42.9, 43.8) : 0;
    pon1(nombre, "transform", `translate(540 ${AM + 338}) scale(${(-1 - 0.06 * late * Math.sin(K.tramo(g, 42.9, 43.4) * PI)).toFixed(3)} ${(1 + 0.06 * late * Math.sin(K.tramo(g, 42.9, 43.4) * PI)).toFixed(3)})`);
    opa(tachon, late);
    // el retrovisor baja en «retrovisor»
    const b = enA ? K.sale(K.tramo(g, 43.8, 44.4)) : 0;
    pon1(RV, "transform", `translate(0 ${f1(-700 * (1 - b))})`);
    opa(RV, b);
    const lee = enA ? sube(g, 45.95, 46.25) : 0;
    opa(marcoV, lee);
    opa(halo, 0);
    pon1(nomTxt, "fill", "#d8202e");
    ok(900, RVY - 90, pop(g, 46.0) * 0.8, enA ? asoma(g, 46.0, 47.4) : 0);
  };
}

// ── el sitio: fondo oscuro ─────────────────────────────────────────────────────────────────────────────────────
function fondo(p) {
  el(p, "rect", { x: -4000, y: -4000, width: 9000, height: 16000, fill: "#0b0d10" });
  return () => {};
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
  r(`tu <b>espejo</b>`, "o g", ARR, (g) => (g < 4 ? 1 - K.suave(K.tramo(g, 0.86, 1.06)) : asoma(g, TOTAL - 0.7)));
  r(`no cambia <b>izquierda</b> y <b>derecha</b>`, "r", ARR, (g) => ve(g, 1.1, 2.85));
  r(`si lo hiciera…`, "", ARR, (g) => ve(g, 2.95, 4.9));
  r(`¿la <b>cabeza abajo</b>?`, "r g", ARR, (g) => ve(g, 5.0, 6.3));
  // prueba
  r(`levanta la <b>derecha</b>`, "r g", ARR, (g) => ve(g, 7.3, 8.8));
  r(`el reflejo, en el <b>mismo lado</b>`, "v", ARR, (g) => ve(g, 9.0, 11.0));
  r(`<b>no</b> en el otro`, "r", ARR, (g) => ve(g, 11.06, 12.1));
  r(`<b>arriba</b> sigue arriba`, "v g", ARR, (g) => ve(g, 12.18, 13.7));
  r(`la <b>derecha</b>, a la derecha`, "c", ARR, (g) => ve(g, 13.78, 15.6));
  // planta
  r(`lo único que da la <b>vuelta</b>`, "o", ARR, (g) => ve(g, 15.75, 17.7));
  r(`<b>delante</b> y <b>detrás</b>`, "o g", ARR, (g) => ve(g, 17.78, 18.55));
  r(`tú miras <b>hacia él</b>`, "o", ARR, (g) => ve(g, 18.62, 20.0));
  r(`él mira <b>hacia ti</b>`, "o g", ARR, (g) => ve(g, 20.06, 22.3));
  r(`¿de dónde <b>sale</b>…`, "r g", ARR, (g) => ve(g, 22.38, 24.2));
  r(`…lo de <b>izquierda</b> y <b>derecha</b>?`, "", ARR, (g) => ve(g, 24.22, 25.85));
  // giro
  r(`de tu <b>cabeza</b>`, "o g", ARR, (g) => ve(g, 25.94, 27.2));
  r(`te pones en su <b>sitio</b>`, "c", ARR, (g) => ve(g, 27.22, 28.45));
  r(`girando de <b>lado</b>`, "c g", ARR, (g) => ve(g, 28.46, 30.8));
  r(`la derecha acaba en el <b>otro lado</b>`, "r", ARR, (g) => ve(g, 30.86, 34.15));
  // pino
  r(`girando como al hacer el <b>pino</b>`, "o", ARR, (g) => ve(g, 34.22, 36.65));
  r(`la <b>cabeza abajo</b>`, "r g", ARR, (g) => ve(g, 36.7, 39.9));
  // ambulancia
  r(`las <b>ambulancias</b>`, "r g", ARR, (g) => ve(g, 40.0, 41.7));
  r(`escrito <b>al revés</b>`, "r", ARR, (g) => ve(g, 41.73, 43.5));
  r(`en el <b>retrovisor</b>`, "c g", ARR, (g) => ve(g, 43.56, 45.4));
  r(`se lee <b>al derecho</b>`, "v g", ARR, (g) => ve(g, 45.44, 46.9));
  // cierre
  r(`aunque lo <b>parezca</b>`, "", ARR, (g) => ve(g, 47.0, 48.6));
  r(`<b>acuérdate</b>:`, "o g", ARR, (g) => ve(g, 48.68, TOTAL - 0.75));
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
    est(GA, frente),
    est(PL, planta),
    est(AM, ambulancia),
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
const GOLPES = [[2.08, 0.6], [5.04, 0.5], [11.42, 0.4], [33.18, 0.5], [38.58, 0.6], [42.96, 0.5]];
const FLASH = [[5.04, 0.1], [36.2, 0.08], [46.0, 0.12]];
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
    // lo que queda lejos de la cámara se esconde
    E.est.forEach(([y, f, q]) => { const on = Math.abs(k.y - y) < alto + 600; if (on) f(g); q.style.display = on ? "" : "none"; });
    E.ro(g);
    return { g, k };
  };
  return E;
}
