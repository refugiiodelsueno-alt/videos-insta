// La piel de gallina, todo en 2D, en un svg con la cámara dentro (un transform del grupo), por estaciones:
//   y = 1000   el brazo con frío: los bultitos y el abrigo que ya no está (gancho y cierre)
//   y = 4000   el corte de la piel: el pelo, su músculo y el bultito (músculo)
//   y = 7000   un animal con pelo: los pelos de pie atrapan aire; el plumas (abrigo)
//   y = 10000  el antepasado peludo que pierde el pelo (antepasado)
//   y = 13000  el gato erizado y tu brazo en la misma alarma (miedo)
//   y = 16000  el ratón, y debajo el corte de su piel: el nervio despierta las células del pelo (raíz)
const K = window.K;
const NS = "http://www.w3.org/2000/svg";
const PI = Math.PI;

export const ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", CIAN = "#5fd4ff";
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 51.21;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);
const fr = (v) => v - Math.floor(v);
const mezcla = (a, b, t) => a + (b - a) * t;
const azar = (s) => K.azar(s);
const bez = (a, b, c, d, t) => (1 - t) ** 3 * a + 3 * t * (1 - t) ** 2 * b + 3 * t * t * (1 - t) * c + t ** 3 * d;
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mezclaColor = (a, b, t) => { const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(mezcla(v, B[i], t)).toString(16).padStart(2, "0")).join(""); };

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, musculo: 4.68, abrigo: 15.18, antepasado: 22.526, miedo: 28.44, raiz: 39.567, cierre: 48.78 };

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
const BR = 1000, CO = 4000, CS = CO + 250, AB = 7000, AP = 10000, MI = 13000, RA = 16000, RS = RA + 2600;

// ── la cámara: el punto (x, y) del mundo queda en (540, 1000) con zoom z ───────────────────────────────────────
export const F0 = { x: 540, y: BR + 300, z: 1.0 };
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
  [0, [[0, F0], [1.4, Z(550, 1.05, BR + 300)], [3.3, Z(570, 1.1, BR + 290)], [G0.musculo, Z(590, 1.14, BR + 285)]]],
  [G0.musculo, [[G0.musculo, Z(540, 1.12, CS + 20)], [6.3, Z(600, 1.3, CS + 90)], [8.4, Z(600, 1.3, CS + 80)], [10.0, Z(580, 1.2, CS + 30)], [12.3, Z(570, 1.2, CS + 20)], [13.3, Z(570, 1.18, CS + 20)], [14.2, Z(540, 0.72, CS + 200)], [G0.abrigo, Z(540, 0.7, CS + 210)]]],
  [G0.abrigo, [[G0.abrigo, Z(540, 1.04, AB + 470)], [17.3, Z(540, 1.0, AB + 450)], [19.6, Z(560, 1.06, AB + 480)], [20.55, Z(560, 1.04, AB + 470)], [21.05, Z(1720, 1.0, AB + 500)], [G0.antepasado, Z(1720, 1.05, AB + 500)]]],
  [G0.antepasado, [[G0.antepasado, Z(500, 0.95, AP + 300)], [24.0, Z(500, 1.0, AP + 290)], [26.6, Z(560, 1.0, AP + 270)], [27.2, Z(640, 1.1, AP + 300)], [G0.miedo, Z(660, 1.14, AP + 300)]]],
  [G0.miedo, [[G0.miedo, Z(500, 0.96, MI + 380)], [30.6, Z(500, 1.04, MI + 400)], [31.6, Z(500, 1.0, MI + 400)], [33.9, Z(520, 0.98, MI + 380)], [34.6, Z(820, 0.66, MI + 420)], [35.5, Z(860, 0.66, MI + 420)], [36.1, Z(1270, 1.2, MI + 470)], [G0.raiz, Z(1270, 1.25, MI + 470)]]],
  [G0.raiz, [[G0.raiz, Z(540, 0.95, RA + 470)], [41.4, Z(500, 1.0, RA + 450)], [41.95, Z(480, 1.3, RA + 380)], [42.42, Z(470, 6.5, RA + 330)]]],
  [42.42, [[42.42, Z(560, 1.4, RS + 60)], [43.3, Z(560, 1.2, RS + 30)], [45.0, Z(560, 1.18, RS + 30)], [46.0, Z(620, 1.1, RS)], [47.3, Z(600, 1.1, RS)], [48.1, Z(540, 0.74, RS + 180)], [G0.cierre, Z(540, 0.72, RS + 190)]]],
  [G0.cierre, [[G0.cierre, Z(560, 0.9, BR + 340)], [50.86, Z(540, 0.99, BR + 302)], [TOTAL, F0]]],
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
.c-blanco { position: absolute; inset: 0; pointer-events: none; background: #fff6f0; opacity: 0; }

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
let PRE = "c-", escenas = 0, nid = 0;
const ids = (html) => html.replace(/id="c-/g, `id="${PRE}`).replace(/url\(#c-/g, `url(#${PRE}`);
const u = (id) => `url(#${PRE}${id})`;
const nuevoId = () => `${PRE}x${++nid}`;
// una caché para no tocar el DOM si el valor no cambia
const pon1 = (e, a, v) => { if (e["_" + a] !== v) { e.setAttribute(a, v); e["_" + a] = v; } };
const texto = (p, x, y, t, at = {}) => { const e = el(p, "text", { x, y, "text-anchor": "middle", class: "c-txt", fill: "#fff", "font-size": 40, ...at }); e.textContent = t; return e; };
const pone = (e, x, y, s = 1, a = 0) => pon1(e, "transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(a)}) scale(${s.toFixed(3)})`);
const opa = (e, v) => pon1(e, "opacity", v.toFixed(2));
const P = (x, y) => `${f1(x)} ${f1(y)}`;

const DEFS = `
<defs>
  <linearGradient id="c-piel" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1300"><stop offset="0" stop-color="#f6cbab"/><stop offset="0.3" stop-color="#e7aa8a"/><stop offset="1" stop-color="#b9785e"/></linearGradient>
  <linearGradient id="c-borde" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="230"><stop offset="0" stop-color="rgba(120,55,38,0.42)"/><stop offset="1" stop-color="rgba(120,55,38,0)"/></linearGradient>
  <radialGradient id="c-bulto" cx="0.38" cy="0.36" r="0.66"><stop offset="0" stop-color="#ffe9da"/><stop offset="0.45" stop-color="#f3bb9e"/><stop offset="0.82" stop-color="#c98466"/><stop offset="1" stop-color="rgba(190,120,92,0)"/></radialGradient>
  <linearGradient id="c-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1422"/><stop offset="0.45" stop-color="#1a2d47"/><stop offset="1" stop-color="#2d4b6c"/></linearGradient>
  <radialGradient id="c-halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(150,200,255,0.28)"/><stop offset="1" stop-color="rgba(150,200,255,0)"/></radialGradient>
  <linearGradient id="c-aire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1524"/><stop offset="0.6" stop-color="#1b2f4a"/><stop offset="1" stop-color="#2f5070"/></linearGradient>
  <linearGradient id="c-dermis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2a9a0"/><stop offset="0.45" stop-color="#e48f8a"/><stop offset="1" stop-color="#c9716f"/></linearGradient>
  <radialGradient id="c-verdeG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(34,211,138,0.7)"/><stop offset="1" stop-color="rgba(34,211,138,0)"/></radialGradient>
  <radialGradient id="c-oroG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,194,74,0.75)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-rojoG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,80,96,0.55)"/><stop offset="1" stop-color="rgba(255,80,96,0)"/></radialGradient>
  <linearGradient id="c-plumas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a6c"/><stop offset="0.55" stop-color="#e03449"/><stop offset="1" stop-color="#a51f33"/></linearGradient>
  <linearGradient id="c-cieloA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151d33"/><stop offset="0.55" stop-color="#2f3f62"/><stop offset="1" stop-color="#6b7c9c"/></linearGradient>
  <linearGradient id="c-suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef5fb"/><stop offset="0.3" stop-color="#c3d4e3"/><stop offset="1" stop-color="#7f93a8"/></linearGradient>
  <radialGradient id="c-foco" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#5a4590"/><stop offset="0.5" stop-color="#2e2250"/><stop offset="1" stop-color="#120d1e"/></radialGradient>
  <linearGradient id="c-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2140"/><stop offset="1" stop-color="#47395e"/></linearGradient>
  <radialGradient id="c-lab" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#4a4034"/><stop offset="0.6" stop-color="#2a241d"/><stop offset="1" stop-color="#14110d"/></radialGradient>
  <linearGradient id="c-madera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6240"/><stop offset="0.15" stop-color="#6a4a30"/><stop offset="1" stop-color="#2e2014"/></linearGradient>
  <radialGradient id="c-raton" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stop-color="#c9c9d4"/><stop offset="0.6" stop-color="#9a9aa8"/><stop offset="1" stop-color="#6c6c7a"/></radialGradient>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.55)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <linearGradient id="c-desv" gradientUnits="userSpaceOnUse" x1="1150" y1="0" x2="1380" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
  <linearGradient id="c-fantasma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd8ea"/></linearGradient>
</defs>`;

// ── piezas sueltas ──────────────────────────────────────────────────────────────────────────────────────────────
// nieve que cae y vuelve a empezar (da vueltas enteras en TOTAL)
function nieve(p, x0, x1, y0, y1, n, seed) {
  const R = azar(seed), q = el(p, "g"), L = [];
  for (let i = 0; i < n; i++) {
    const r = 2.5 + 5 * R();
    L.push({ e: el(q, "circle", { r: f1(r), fill: "#eef6ff", opacity: f1(0.35 + 0.55 * R()) }), x: x0 + (x1 - x0) * R(), ph: R(), f: (0.05 + 0.06 * R()) * (r / 5), sw: 10 + 22 * R(), q: R() });
  }
  return (g, op = 1) => {
    opa(q, op);
    if (op < 0.01) return;
    for (const c of L) pon1(c.e, "transform", `translate(${P(c.x + c.sw * Math.sin(vuelta(g, 0.2) + 6.28 * c.q), y0 + (y1 - y0) * fr(ciclo(g, c.f) + c.ph))})`);
  };
}
// ráfagas de viento: una raya que recorre el camino en 0,8 s
function rafagas(p, L) {
  const E = L.map(([d, ts]) => ({ ts, e: el(p, "path", { d, fill: "none", stroke: "rgba(220,242,255,0.85)", "stroke-width": 8, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "0.35 2", opacity: 0 }) }));
  return (g) => E.forEach(({ ts, e }) => {
    const t = ts.find((t) => g >= t && g <= t + 0.8);
    if (t === undefined) { opa(e, 0); return; }
    opa(e, 1);
    pon1(e, "stroke-dashoffset", (-mezcla(-0.4, 1.05, K.tramo(g, t, t + 0.8))).toFixed(3));
  });
}
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
  return (x, y, s, op, a = 0) => { opa(g, op); if (op > 0.01) pon1(g, "transform", `translate(${P(x, y)}) rotate(${f1(a)}) scale(${s.toFixed(3)} ${s.toFixed(3)})`); };
}
function anillo(p, col) {
  const g = el(p, "g", { opacity: 0 });
  el(g, "circle", { r: 1, fill: "none", stroke: col, "stroke-width": 0.09 });
  return (x, y, r, op) => { opa(g, op); if (op > 0.01) pone(g, x, y, r); };
}
// un golpe que crece y vuelve (para los sellos)
const pop = (g, t) => (g < t ? 0 : 0.6 + 0.4 * K.sale(K.tramo(g, t, t + 0.18)) + 0.12 * Math.sin(K.tramo(g, t + 0.18, t + 0.5) * PI));
// una lupa: lo de dentro se dibuja con dentro(grupo) y se recorta en un círculo de radio r
function lupa(p, r, dentro) {
  const g = el(p, "g", { opacity: 0 });
  el(g, "path", { d: `M${r * 0.68} ${r * 0.68} L${r * 1.45} ${r * 1.45}`, stroke: "#2a2f38", "stroke-width": 46, "stroke-linecap": "round" });
  el(g, "path", { d: `M${r * 0.74} ${r * 0.74} L${r * 1.4} ${r * 1.4}`, stroke: "#8a93a3", "stroke-width": 30, "stroke-linecap": "round" });
  const id = nuevoId();
  const cp = el(g, "clipPath", { id });
  el(cp, "circle", { r });
  const q = el(g, "g", { "clip-path": `url(#${id})` });
  const f = dentro(q);
  el(g, "circle", { r: r + 4, fill: "none", stroke: "#1b1f27", "stroke-width": 26 });
  el(g, "circle", { r: r + 4, fill: "none", stroke: "#e9edf3", "stroke-width": 14 });
  el(g, "path", { d: `M${-r * 0.62} ${-r * 0.3} A${r * 0.7} ${r * 0.7} 0 0 1 ${-r * 0.2} ${-r * 0.66}`, fill: "none", stroke: "rgba(255,255,255,0.55)", "stroke-width": 9, "stroke-linecap": "round" });
  return (x, y, s, op, gg) => { opa(g, op); if (op > 0.01) { pone(g, x, y, s); f(gg); } };
}

// ── el brazo: la piel vista por encima, con el borde de perfil arriba ───────────────────────────────────────────
// En coordenadas del brazo, u va a lo largo y v hacia dentro (v = 0 es el borde). El borde pasa por (540, 300) del
// grupo en u ≈ 1304. o.nivel(g, u): lo encogido que está cada músculo (0 liso, 1 bultito). o.abrigo(g, k): el pelaje
// que no tienes, { f: lo que ha crecido, w: lo que se lo ha llevado el viento }.
const UB = []; for (let x = 260; x <= 2440; x += 34) UB.push(x);
function brazo(p, o) {
  const t = el(p, "g", o.y ? { transform: `translate(0 ${o.y})` } : {});
  const q = el(t, "g", { transform: "translate(-700 703) rotate(-18)" });
  const R = azar(7);
  const piel = el(q, "path", { fill: u("piel") });
  el(q, "rect", { x: -1800, y: 0, width: 5800, height: 240, fill: u("borde") });
  // arrugas y pecas
  for (let i = 0; i < 9; i++) {
    const v = 180 + 110 * i + 40 * R(), x0 = -200 + 400 * R();
    el(q, "path", { d: `M${x0} ${f1(v)} C${x0 + 700} ${f1(v - 30)} ${x0 + 1400} ${f1(v + 40)} ${x0 + 2600} ${f1(v + 10)}`, fill: "none", stroke: "rgba(150,78,58,0.13)", "stroke-width": 3 });
  }
  for (let i = 0; i < 30; i++) el(q, "circle", { cx: f1(300 + 2200 * R()), cy: f1(90 + 600 * R()), r: f1(2 + 4 * R()), fill: "rgba(165,90,64,0.28)" });
  // los poros de la cara del brazo
  const FA = [];
  for (let r = 0; r < 8; r++) {
    for (let x = 340 + (r % 2) * 46; x <= 2350; x += 92) {
      const uu = x + 36 * (R() - 0.5), v = 75 + 82 * r + 30 * (R() - 0.5);
      FA.push({ u: uu, v, a0: 6 + 22 * R(), l0: 26 + 14 * R(), bu: el(q, "circle", { r: 1, fill: u("bulto"), opacity: 0 }) });
    }
  }
  const poros = el(q, "path", { fill: "#8a4632" });
  poros.setAttribute("d", FA.map((f) => `M${f1(f.u - 2.6)} ${f1(f.v)}a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0`).join(""));
  const pelosCara = el(q, "path", { fill: "none", stroke: "#3d2516", "stroke-width": 3.6, "stroke-linecap": "round" });
  const borde = el(q, "path", { fill: "none", stroke: "#ffd6bd", "stroke-width": 5, "stroke-linejoin": "round" });
  const LB = UB.map(() => 46 + 14 * R());
  const pelosBorde = el(q, "path", { fill: "none", stroke: "#3d2516", "stroke-width": 4.5, "stroke-linecap": "round" });
  // el abrigo que ya no tienes
  const AL = [];
  if (o.abrigo) {
    for (let i = 0; i < 80; i++) {
      const borde = i < 50;
      const uu = borde ? 300 + 2100 * R() : 400 + 1900 * R(), v = borde ? 4 : 40 + 480 * R();
      const a = (borde ? -30 - 50 * R() : -20 + 35 * R()) * PI / 180, L = borde ? 110 + 60 * R() : 90 + 50 * R();
      AL.push({ uu, v, a, L, cu: (R() - 0.5) * 0.5, k: R(), e: el(q, "path", { fill: "none", stroke: i % 2 ? "#efd6a8" : "#fff1d6", "stroke-width": f1(6 + 3 * R()), "stroke-linecap": "round", opacity: 0 }) });
    }
  }
  return (g) => {
    const B = UB.map((x) => o.nivel(g, x));
    // el borde con sus bultitos
    let d = "M-1800 0L200 0";
    for (let x = 200; x <= 2500; x += 4) {
      const j = Math.round((x - 260) / 34);
      let v = 0;
      for (let i = j - 1; i <= j + 1; i++) if (i >= 0 && i < UB.length && B[i] > 0.001) { const z = (x - UB[i]) / 12; v -= 14 * B[i] * Math.exp(-z * z); }
      d += `L${x} ${f1(v)}`;
    }
    d += "L4000 0";
    pon1(borde, "d", d);
    pon1(piel, "d", d + "L4000 1300L-1800 1300Z");
    let pb = "";
    UB.forEach((x, i) => { const a = mezcla(-10, -76, B[i]) * PI / 180, y = -14 * B[i]; pb += `M${f1(x)} ${f1(y + 2)}L${f1(x + LB[i] * Math.cos(a))} ${f1(y + LB[i] * Math.sin(a))}`; });
    pon1(pelosBorde, "d", pb);
    let pc = "";
    for (const f of FA) {
      const b = o.nivel(g, f.u);
      opa(f.bu, Math.min(1, b * 1.5));
      if (b > 0.01) pone(f.bu, f.u + 3, f.v + 2, 15 * b);
      const a = mezcla(f.a0, -62, b) * PI / 180, L = mezcla(f.l0, 18, b);
      pc += `M${f1(f.u)} ${f1(f.v)}L${f1(f.u + L * Math.cos(a))} ${f1(f.v + L * Math.sin(a))}`;
    }
    pon1(pelosCara, "d", pc);
    for (const s of AL) {
      const { f, w } = o.abrigo(g, s.k);
      const op = Math.min(1, f * 3) * (1 - w);
      opa(s.e, op * 0.95);
      if (op < 0.01) continue;
      const L = s.L * f, x0 = s.uu + w * (420 + 380 * s.k), y0 = s.v - w * (200 + 260 * s.k);
      const ca = Math.cos(s.a), sa = Math.sin(s.a);
      const x1 = x0 + L * ca, y1 = y0 + L * sa;
      pon1(s.e, "d", `M${P(x0, y0)}Q${P(x0 + L * 0.5 * ca - L * s.cu * sa, y0 + L * 0.5 * sa + L * s.cu * ca)} ${P(x1, y1)}`);
    }
  };
}
// el sitio del brazo
function onda(off, amp, ph) {
  let d = "";
  for (let x = -250; x <= 1350; x += 50) d += `${d ? "L" : "M"}${x} ${f1(BR + 475 - 0.325 * x - off - amp * Math.sin(x / 170 + ph))}`;
  return d;
}
function sitioBrazo(p) {
  el(p, "rect", { x: -3000, y: BR - 1500, width: 8000, height: 3000, fill: u("cielo") });
  el(p, "ellipse", { cx: 600, cy: BR + 60, rx: 900, ry: 560, fill: u("halo") });
  const ni = nieve(p, -500, 1700, BR - 900, BR + 1000, 80, 11);
  const b = brazo(p, {
    y: BR,
    nivel: (g, x) => (g < 10 ? sube(g, 0.45 + Math.max(0, x - 300) / 2600, 0.75 + Math.max(0, x - 300) / 2600) : sube(g, 49.35 + (x - 300) / 3000, 49.65 + (x - 300) / 3000) * (1 - sube(g, 50.35, 50.95))),
    abrigo: (g, k) => ({ f: sube(g, 2.35 + 0.35 * k, 2.75 + 0.35 * k), w: sube(g, 3.45 + 0.3 * k, 4.1 + 0.3 * k) }),
  });
  const ra = rafagas(p, [[onda(110, 26, 0), [0.05, 49.1]], [onda(250, 34, 2), [0.25, 49.3]], [onda(400, 30, 4), [0.45, 49.5]]]);
  return (g) => { ni(g); b(g); ra(g); };
}

// ── el corte de la piel: el aire arriba, la piel, el pelo con su músculo, la grasa abajo ───────────────────────
// o.est(g) → { F: [{ c (músculo encogido), b (bultito), brillo, flechas, crece, despierta }], anillo, nervio, celulas,
// fabrica, frio, resalte }
const XF = [-260, 140, 540, 940, 1340];
function corte(p, o) {
  const S = o.S, rata = !!o.raton, R = azar(rata ? 23 : 13), AIRE = o.aire || 1600;
  const bulto = (x, F) => { let v = 0; F.forEach((f, i) => { const z = (x - XF[i] - 70) / 95; if (z * z < 16) v += 30 * f.b * Math.exp(-z * z); }); return v; };
  el(p, "rect", { x: -1500, y: S - AIRE, width: 4200, height: AIRE, fill: u("aire") });
  const frio = el(p, "rect", { x: -1500, y: S - AIRE, width: 4200, height: AIRE, fill: "#7fd2ff", opacity: 0 });
  const ni = nieve(p, -700, 1900, S - AIRE + 100, S + 10, 70, rata ? 41 : 31);
  const epi = el(p, "path", { fill: "#f3bba1" });
  const der = el(p, "path", { fill: u("dermis") });
  // fibras, vasos y grasa
  for (let i = 0; i < 12; i++) {
    const y = S + 140 + 36 * i + 14 * R(), x0 = -1500 + 300 * R();
    let d = `M${x0} ${f1(y)}`;
    for (let x = x0 + 120; x < 2700; x += 120) d += `Q${x - 60} ${f1(y + (R() - 0.5) * 30)} ${x} ${f1(y + (R() - 0.5) * 10)}`;
    el(p, "path", { d, fill: "none", stroke: "rgba(255,232,226,0.2)", "stroke-width": 5 });
  }
  const vaso = (y, c1, c2, w, ph) => {
    let d = "";
    for (let x = -1500; x <= 2700; x += 60) d += `${d ? "L" : "M"}${x} ${f1(y + 18 * Math.sin(x / 210 + ph))}`;
    el(p, "path", { d, fill: "none", stroke: "rgba(80,20,30,0.5)", "stroke-width": w + 8, "stroke-linejoin": "round" });
    el(p, "path", { d, fill: "none", stroke: c1, "stroke-width": w, "stroke-linejoin": "round" });
    el(p, "path", { d, fill: "none", stroke: c2, "stroke-width": w * 0.28, "stroke-linejoin": "round", transform: `translate(0 ${-w * 0.2})` });
  };
  vaso(S + 600, "#c23446", "#ef7280", 26, 0);
  vaso(S + 690, "#5b6fc4", "#93a3e6", 30, 2);
  for (let r = 0; r < 9; r++) for (let x = -1500 + (r % 2) * 60; x < 2700; x += 120) el(p, "ellipse", { cx: f1(x + 10 * (R() - 0.5)), cy: f1(S + 800 + 100 * r), rx: f1(56 + 6 * R()), ry: f1(48 + 6 * R()), fill: "#f6dc8a", stroke: "#dcb253", "stroke-width": 5 });
  const capaN = el(p, "g"), capaF = el(p, "g");
  const rim = el(p, "path", { fill: "none", stroke: "#ffd6bd", "stroke-width": 6, "stroke-linejoin": "round" });
  const resalte = el(p, "path", { fill: "none", stroke: ORO, "stroke-width": 12, "stroke-linecap": "round", opacity: 0 });
  const capaP = el(p, "g"), capaE = el(p, "g");
  const colPelo = rata ? "#b4b6c2" : "#4a3020", colPelo2 = rata ? "#e4e6ee" : "#7a5236";
  const FO = XF.map((xf, i) => {
    const n = {};
    n.nervio = el(capaN, "path", { fill: "none", stroke: "#ffd24a", "stroke-width": 10, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", opacity: 0 });
    n.pulsos = [0, 1, 2].map(() => el(capaN, "circle", { r: 15, fill: "#fff6c8", stroke: ORO, "stroke-width": 6, opacity: 0 }));
    const q = el(capaF, "g");
    n.vaina = el(q, "path", { fill: "none", stroke: "#f8dccd", "stroke-width": 66, "stroke-linecap": "round" });
    n.vaina2 = el(q, "path", { fill: "none", stroke: "#eec0ae", "stroke-width": 36, "stroke-linecap": "round" });
    n.bulbo = el(q, "circle", { r: 44, fill: "#efb39b", stroke: "#d38c74", "stroke-width": 4 });
    n.papila = el(q, "circle", { r: 17, fill: "#c9566a" });
    n.raiz = el(q, "path", { fill: "none", stroke: colPelo, "stroke-width": 14, "stroke-linecap": "round" });
    n.brillo = el(q, "path", { fill: "none", stroke: "rgba(255,194,74,0.55)", "stroke-width": 30, "stroke-linejoin": "round", opacity: 0 });
    n.musc = el(q, "path", { fill: "#d9384c", stroke: "#8e1f30", "stroke-width": 4, "stroke-linejoin": "round" });
    n.estr = el(q, "path", { fill: "none", stroke: "rgba(255,175,185,0.6)", "stroke-width": 3 });
    n.fl = [0, 1].map(() => el(q, "path", { d: "M16 0 L-12 -16 L-12 16 Z", fill: ORO, stroke: "#3a2606", "stroke-width": 3, "stroke-linejoin": "round", opacity: 0 }));
    // las células madre del pelo (el ratón)
    n.cel = el(q, "g", { opacity: 0 });
    n.puntos = [0, 1, 2, 3, 4, 5].map(() => el(n.cel, "circle", { r: 7, fill: VERDE, opacity: 0 }));
    n.celulas = [0, 1, 2].map(() => {
      const c = el(n.cel, "g");
      const halo = el(c, "circle", { r: 54, fill: u("verdeG"), opacity: 0 });
      el(c, "ellipse", { rx: 27, ry: 23, fill: "#3ad995", stroke: "#0f6b45", "stroke-width": 4 });
      const ojos = [-9, 9].map((x) => el(c, "ellipse", { cx: x, cy: -3, rx: 3.6, ry: 1, fill: "#0b2a1c" }));
      return { c, halo, ojos };
    });
    n.zz = texto(n.cel, 0, 0, "z", { "font-size": 34, fill: "#dff8ec", opacity: 0 });
    n.pelo = el(capaP, "path", { fill: "none", stroke: colPelo, "stroke-width": 14, "stroke-linecap": "round" });
    n.pelo2 = el(capaP, "path", { fill: "none", stroke: colPelo2, "stroke-width": 4, "stroke-linecap": "round" });
    return n;
  });
  const an = anillo(capaE, ORO);
  let cal = null;
  if (rata) {
    const c = el(capaE, "g", { opacity: 0 });
    el(c, "rect", { x: -90, y: -90, width: 180, height: 180, rx: 20, fill: "#f4f6fa", stroke: "#1b1f27", "stroke-width": 6 });
    el(c, "path", { d: "M-90 -40 V-70 A20 20 0 0 1 -70 -90 H70 A20 20 0 0 1 90 -70 V-40 Z", fill: "#e14b5a" });
    texto(c, 0, -52, "DÍA", { "font-size": 30, fill: "#fff" });
    [-45, 45].map((x) => el(c, "rect", { x: x - 6, y: -104, width: 12, height: 30, rx: 6, fill: "#1b1f27" }));
    const n = texto(c, 0, 62, "1", { "font-size": 96, fill: "#1d2230" });
    cal = { c, n };
  }
  return (g) => {
    const E = o.est(g), F = E.F;
    opa(frio, 0.18 * E.frio);
    ni(g, E.frio);
    let top = "";
    for (let x = -1500; x <= 2700; x += 8) top += `${top ? "L" : "M"}${x} ${f1(S - bulto(x, F))}`;
    pon1(rim, "d", top);
    pon1(epi, "d", top + `L2700 ${S + 1800}L-1500 ${S + 1800}Z`);
    let t2 = "";
    for (let x = -1500; x <= 2700; x += 8) t2 += `${t2 ? "L" : "M"}${x} ${f1(S + 48 - 0.8 * bulto(x, F))}`;
    pon1(der, "d", t2 + `L2700 ${S + 1800}L-1500 ${S + 1800}Z`);
    opa(resalte, E.resalte);
    if (E.resalte > 0.01) { let d = ""; for (let x = 360; x <= 880; x += 8) d += `${d ? "L" : "M"}${x} ${f1(S - bulto(x, F) - 3)}`; pon1(resalte, "d", d); }
    FO.forEach((n, i) => {
      const f = F[i], xf = XF[i];
      const th = mezcla(60, 12, f.c) * PI / 180, dx = -Math.sin(th), dy = Math.cos(th);
      const ys = S - bulto(xf, F);
      const at = (s) => [xf + dx * s, ys + dy * s];
      const [a40, a400, a410, a420, a432] = [at(40), at(400), at(410), at(420), at(432)];
      pon1(n.vaina, "d", `M${P(...a40)}L${P(...a400)}`);
      pon1(n.vaina2, "d", `M${P(...a40)}L${P(...a400)}`);
      pon1(n.bulbo, "cx", f1(a420[0])); pon1(n.bulbo, "cy", f1(a420[1]));
      pon1(n.papila, "cx", f1(a432[0])); pon1(n.papila, "cy", f1(a432[1]));
      pon1(n.raiz, "d", `M${P(...a410)}L${P(...at(0))}`);
      const Lh = rata ? mezcla(55, 290, f.crece) : 240, tip = at(-Lh);
      const ex = 18 * (rata ? 1 : 0.6);
      pon1(n.pelo, "d", `M${P(...at(0))}Q${P((ys + tip[0]) / 2 * 0 + (xf + tip[0]) / 2 + ex * dy, (ys + tip[1]) / 2 - ex * dx)} ${P(...tip)}`);
      pon1(n.pelo2, "d", `M${P(...at(-10))}L${P(...at(-Lh * 0.8))}`);
      // el músculo: del pelo a la piel, más gordo y más corto cuando se encoge
      const A = at(190), Bm = [xf + 210, S + 60 - 0.6 * bulto(xf + 210, F)];
      const mx = (A[0] + Bm[0]) / 2, my = (A[1] + Bm[1]) / 2, L = Math.hypot(Bm[0] - A[0], Bm[1] - A[1]);
      const ux = (Bm[0] - A[0]) / L, uy = (Bm[1] - A[1]) / L, nx = -uy, ny = ux, w = mezcla(17, 34, f.c);
      const md = `M${P(...A)}Q${P(mx + nx * 2 * w, my + ny * 2 * w)} ${P(...Bm)}Q${P(mx - nx * 2 * w, my - ny * 2 * w)} ${P(...A)}Z`;
      pon1(n.musc, "d", md);
      pon1(n.estr, "d", `M${P(A[0] + ux * 30, A[1] + uy * 30)}Q${P(mx + nx * w * 0.8, my + ny * w * 0.8)} ${P(Bm[0] - ux * 30, Bm[1] - uy * 30)}M${P(A[0] + ux * 30, A[1] + uy * 30)}Q${P(mx - nx * w * 0.8, my - ny * w * 0.8)} ${P(Bm[0] - ux * 30, Bm[1] - uy * 30)}`);
      opa(n.brillo, f.brillo);
      if (f.brillo > 0.01) pon1(n.brillo, "d", md);
      n.fl.forEach((e, j) => {
        opa(e, f.flechas);
        if (f.flechas < 0.01) return;
        const s = 46 + 10 * Math.sin(vuelta(g, 3)), [ox, oy] = j ? [Bm[0] + ux * s, Bm[1] + uy * s] : [A[0] - ux * s, A[1] - uy * s];
        pone(e, ox, oy, 1.3, Math.atan2(uy, ux) * 180 / PI + (j ? 180 : 0));
      });
      // el nervio llega al músculo
      opa(n.nervio, E.nervio > 0.01 ? 1 : 0);
      const N0 = [xf + 560, S + 1000], N1 = [xf + 560, S + 560], N2 = [mx + 220, my + 160];
      if (E.nervio > 0.01) {
        pon1(n.nervio, "d", `M${P(...N0)}C${P(...N1)} ${P(...N2)} ${P(mx, my)}`);
        pon1(n.nervio, "stroke-dashoffset", (1 - E.nervio).toFixed(3));
      }
      n.pulsos.forEach((e, k) => {
        const tt = fr(ciclo(g, 0.8) + k / 3), on = E.nervio >= 0.99 ? Math.sin(PI * tt) : 0;
        opa(e, on);
        if (on > 0.01) { pon1(e, "cx", f1(bez(N0[0], N1[0], N2[0], mx, tt))); pon1(e, "cy", f1(bez(N0[1], N1[1], N2[1], my, tt))); }
      });
      // las células madre, al lado del pelo
      opa(n.cel, E.celulas);
      if (E.celulas > 0.01) {
        const nl = [-Math.cos(th), -Math.sin(th)];
        const C = [0, 1, 2].map((k) => { const a = at(150 + 45 * k); return [a[0] + nl[0] * 46, a[1] + nl[1] * 46]; });
        n.celulas.forEach((c, k) => {
          const de = f.despierta, bot = 3 * de * Math.sin(vuelta(g, 2) + k * 2);
          pone(c.c, C[k][0], C[k][1] + bot, 1 + 0.08 * de);
          opa(c.halo, de);
          c.ojos.forEach((e) => pon1(e, "ry", mezcla(0.8, 4.2, de).toFixed(2)));
        });
        const zt = fr(ciclo(g, 0.6));
        opa(n.zz, (1 - f.despierta) * Math.sin(PI * zt));
        pon1(n.zz, "x", f1(C[0][0] + 26 + 16 * zt)); pon1(n.zz, "y", f1(C[0][1] - 30 - 50 * zt));
        n.puntos.forEach((e, j) => {
          const tt = fr(ciclo(g, 0.7) + j / 6), on = E.fabrica * Math.sin(PI * tt), c0 = C[j % 3];
          opa(e, on);
          if (on > 0.01) { pon1(e, "cx", f1(mezcla(c0[0], a420[0], tt))); pon1(e, "cy", f1(mezcla(c0[1], a420[1], tt))); }
        });
      }
    });
    an(540, S - bulto(540, F), 95, E.anillo);
    if (cal) {
      const on = E.cal || 0;
      opa(cal.c, on);
      if (on > 0.01) {
        const dia = 1 + Math.floor(27 * K.tramo(g, 46.2, 47.3));
        if (cal.n.textContent !== String(dia)) cal.n.textContent = String(dia);
        pone(cal.c, 960, S - 190, 0.9 + 0.1 * on);
      }
    }
  };
}
function musculo(p) {
  return corte(p, {
    S: CS,
    est: (g) => ({
      F: XF.map((x, i) => {
        const D = Math.abs(i - 2), c = sube(g, 8.48 + 0.14 * D, 9.6 + 0.14 * D);
        return { c, b: 0.3 * c + 0.7 * sube(g, 11.6 + 0.1 * D, 12.3 + 0.1 * D), brillo: i === 2 ? asoma(g, 6.2, 7.75) : 0, flechas: i === 2 ? asoma(g, 8.45, 9.7) : 0, crece: 1, despierta: 0 };
      }),
      anillo: asoma(g, 5.3, 6.15), nervio: 0, celulas: 0, fabrica: 0, frio: sube(g, 7.8, 8.3), resalte: asoma(g, 10.95, 12.4),
    }),
  });
}

// ── un animal con pelo: los pelos de pie atrapan aire caliente; y el plumas que se infla ────────────────────────
function abrigo(p) {
  const S = AB + 700, R = azar(17);
  el(p, "rect", { x: -3000, y: AB - 1500, width: 8000, height: 3000, fill: u("cielo") });
  const frio = el(p, "rect", { x: -3000, y: AB - 1500, width: 8000, height: 3000, fill: "#7fd2ff", opacity: 0 });
  const ni = nieve(p, -400, 2400, AB - 600, S, 70, 19);
  const mid = nuevoId();
  const m = el(p, "mask", { id: mid, maskUnits: "userSpaceOnUse", x: -3000, y: AB - 2000, width: 8000, height: 4000 });
  el(m, "rect", { x: -3000, y: AB - 2000, width: 8000, height: 4000, fill: u("desv") });
  const q = el(p, "g", { mask: `url(#${mid})` });
  const calor = el(q, "ellipse", { cx: 480, cy: S - 110, rx: 900, ry: 220, fill: u("oroG"), opacity: 0 });
  // la piel del animal
  el(q, "rect", { x: -800, y: S, width: 1950, height: 900, fill: "#d99a7c" });
  el(q, "rect", { x: -800, y: S + 40, width: 1950, height: 860, fill: u("dermis") });
  el(q, "path", { d: `M-800 ${S}H1150`, stroke: "#ffd6bd", "stroke-width": 6 });
  const viento = [0, 1, 2, 3].map((k) => el(q, "path", { fill: "none", stroke: CIAN, "stroke-width": 7, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "0.06 0.05", opacity: 0 }));
  const PE = [];
  for (let x = -240; x <= 1150; x += 52) for (let j = 0; j < 2; j++) {
    const x0 = x + 26 * j + 10 * (R() - 0.5), L = 270 + 60 * R();
    PE.push({ x0, L, cu: 0.1 + 0.12 * R(), e: el(q, "path", { fill: "none", stroke: j ? "#6b4428" : "#7d5232", "stroke-width": 12, "stroke-linecap": "round" }), e2: el(q, "path", { fill: "none", stroke: "#b98250", "stroke-width": 3.5, "stroke-linecap": "round" }) });
  }
  const BU = [];
  for (let i = 0; i < 46; i++) { const x = -200 + 1340 * R(); BU.push({ x, y: S - 40 - 220 * R(), r: 11 + 11 * R(), ph: R(), e: el(q, "circle", { r: 1, fill: "rgba(95,212,255,0.22)", stroke: CIAN, "stroke-width": 0.12, opacity: 0 }) }); }
  const ondas = [0, 1, 2, 3, 4].map(() => el(q, "path", { fill: "none", stroke: ORO, "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }));
  const si = sello(p, true);
  // el plumas
  const J = el(p, "g", { transform: `translate(1720 ${AB + 560})` });
  const jhalo = el(J, "ellipse", { cx: 0, cy: 0, rx: 620, ry: 560, fill: u("oroG"), opacity: 0 });
  const banda = (padre, w, h) => { const b = el(padre, "path", { fill: u("plumas"), stroke: "#6e1220", "stroke-width": 5, "stroke-linejoin": "round" }); const luz = el(padre, "ellipse", { fill: "rgba(255,255,255,0.28)" }); return { b, luz, w, h }; };
  const mangas = [-1, 1].map((sx) => { const m = el(J, "g", { transform: `translate(${sx * 200} -250) rotate(${sx * -14})` }); return [0, 1, 2, 3].map((k) => ({ ...banda(m, 130, 100), x: sx * 60, y: k * 100 })); });
  const cuerpo = [0, 1, 2, 3, 4, 5].map((k) => ({ ...banda(J, 400, 100), x: 0, y: -290 + k * 100 }));
  el(J, "path", { d: "M-130 -330 Q0 -300 130 -330 L120 -280 Q0 -258 -120 -280 Z", fill: "#a51f33", stroke: "#6e1220", "stroke-width": 5 });
  el(J, "path", { d: "M0 -300 V312", stroke: "#2a1a1e", "stroke-width": 7 });
  el(J, "rect", { x: -9, y: -250, width: 18, height: 40, rx: 5, fill: "#d8dce4", stroke: "#2a1a1e", "stroke-width": 3 });
  const aireJ = []; for (let i = 0; i < 18; i++) aireJ.push(el(J, "circle", { cx: f1(-170 + 340 * R()), cy: f1(-270 + 560 * R()), r: f1(5 + 4 * R()), fill: "rgba(200,240,255,0.85)", opacity: 0 }));
  const pinta = (B, k) => {
    const { b, luz, w, h, x, y } = B, x0 = x - w / 2, x1 = x + w / 2;
    pon1(b, "d", `M${P(x0, y)}C${P(x0 - k, y + h * 0.3)} ${P(x0 - k, y + h * 0.7)} ${P(x0, y + h)}Q${P(x, y + h + k * 0.5)} ${P(x1, y + h)}C${P(x1 + k, y + h * 0.7)} ${P(x1 + k, y + h * 0.3)} ${P(x1, y)}Q${P(x, y - k * 0.5)} ${P(x0, y)}Z`);
    pon1(luz, "cx", f1(x)); pon1(luz, "cy", f1(y + h * 0.32)); pon1(luz, "rx", f1(w * 0.36)); pon1(luz, "ry", f1(12 + k * 0.4));
  };
  return (g) => {
    const vi = sube(g, 15.3, 15.8) * (1 - sube(g, 20.5, 20.9)), cal = sube(g, 19.45, 20.1);
    opa(frio, 0.16 * (1 - cal));
    ni(g);
    opa(calor, cal);
    for (const h of PE) {
      const st = sube(g, 17.45 + (h.x0 + 240) / 2600, 17.9 + (h.x0 + 240) / 2600);
      const a = mezcla(74, 8, st) * PI / 180, sa = Math.sin(a), ca = Math.cos(a);
      const tx = h.x0 + h.L * sa, ty = S - h.L * ca, cx = h.x0 + h.L * 0.5 * sa + h.L * h.cu * ca, cy = S - h.L * 0.5 * ca + h.L * h.cu * sa;
      pon1(h.e, "d", `M${P(h.x0, S + 4)}Q${P(cx, cy)} ${P(tx, ty)}`);
      pon1(h.e2, "d", `M${P(mezcla(h.x0, cx, 0.4), mezcla(S, cy, 0.4))}Q${P(cx, cy)} ${P(mezcla(cx, tx, 0.9), mezcla(cy, ty, 0.9))}`);
    }
    for (const b of BU) {
      const on = sube(g, 18.05 + (b.x + 200) / 3500, 18.4 + (b.x + 200) / 3500);
      opa(b.e, on);
      if (on > 0.01) pone(b.e, b.x + 6 * Math.sin(vuelta(g, 0.5) + 6.28 * b.ph), b.y + 5 * Math.cos(vuelta(g, 0.4) + 6.28 * b.ph), b.r * on);
    }
    const alto = sube(g, 18.15, 18.9);
    viento.forEach((e, k) => {
      opa(e, vi * 0.85);
      if (vi < 0.01) return;
      const y = mezcla(S - 30 - 22 * k, S - 340 - 26 * k, alto);
      let d = "";
      for (let x = -400; x <= 1400; x += 60) d += `${d ? "L" : "M"}${x} ${f1(y + 10 * Math.sin(x / 90 + k))}`;
      pon1(e, "d", d);
      pon1(e, "stroke-dashoffset", (-ciclo(g, 0.6) - k * 0.03).toFixed(3));
    });
    ondas.forEach((e, k) => {
      opa(e, cal * 0.9);
      if (cal < 0.01) return;
      const x = 120 + 190 * k, tt = fr(ciclo(g, 0.8) + k * 0.23), y = S - 40 - 200 * tt;
      pon1(e, "d", `M${P(x, y)}q12 -14 0 -28t0 -28t0 -28`);
      opa(e, cal * Math.sin(PI * tt));
    });
    si(820, AB + 260, pop(g, 16.62), asoma(g, 16.62, 17.5));
    const inf = sube(g, 21.1, 21.75), k = mezcla(5, 30, inf);
    opa(jhalo, inf * 0.8);
    mangas.forEach((M) => M.forEach((B) => pinta(B, k * 0.7)));
    cuerpo.forEach((B) => pinta(B, k));
    aireJ.forEach((e, i) => opa(e, inf * (0.5 + 0.5 * Math.sin(vuelta(g, 1) + i))));
  };
}

// ── el antepasado: peludo y encorvado → tú, casi sin pelo; los músculos siguen ahí ──────────────────────────────
const HU = { cab: [10, -835], cue: [0, -740], cad: [-5, -450], hom: [0, -712], cod: [14, -578], man: [30, -448], rod: [6, -232], tob: [-6, -34], pun: [62, -6] };
const AN = { cab: [118, -640], cue: [62, -606], cad: [-40, -382], hom: [66, -590], cod: [128, -420], man: [162, -250], rod: [34, -205], tob: [-22, -34], pun: [52, -6] };
function antepasado(p) {
  const X0 = 440, Y0 = AP + 900, R = azar(29);
  el(p, "rect", { x: -3000, y: AP - 1500, width: 8000, height: 3000, fill: u("cieloA") });
  el(p, "circle", { cx: 160, cy: AP + 60, r: 260, fill: u("halo") });
  el(p, "circle", { cx: 160, cy: AP + 60, r: 70, fill: "#f4ead2", opacity: 0.85 });
  el(p, "path", { d: `M-1200 ${AP + 900} L-600 ${AP + 520} L-200 ${AP + 760} L300 ${AP + 430} L800 ${AP + 740} L1250 ${AP + 500} L1900 ${AP + 860} V${AP + 1000} H-1200Z`, fill: "#26324a" });
  el(p, "path", { d: `M-1200 ${AP + 900} L-400 ${AP + 680} L250 ${AP + 820} L900 ${AP + 640} L1900 ${AP + 880} V${AP + 1000} H-1200Z`, fill: "#3a4864" });
  el(p, "path", { d: `M-1500 ${AP + 905} Q300 ${AP + 870} 2200 ${AP + 905} V${AP + 1500} H-1500Z`, fill: u("suelo") });
  el(p, "ellipse", { cx: X0 + 20, cy: Y0 + 4, rx: 190, ry: 26, fill: u("sombra") });
  const ni = nieve(p, -500, 1700, AP - 700, AP + 900, 70, 37);
  const capaPelo = el(p, "g");
  const tramo = () => ({ o: el(p, "path", { fill: "none", stroke: "#3a2216", "stroke-linecap": "round", "stroke-linejoin": "round" }), c: el(p, "path", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }) });
  const brazoAtras = tramo(), piernaAtras = tramo(), torso = tramo(), piernaDel = tramo(), cuello = tramo();
  const cabO = el(p, "circle", { fill: "#3a2216" }), cab = el(p, "circle", {});
  const pelo = el(p, "path", { fill: "#2a1a10", opacity: 0 });
  const ceja = el(p, "path", { fill: "none", stroke: "#3a2216", "stroke-width": 7, "stroke-linecap": "round" });
  const ojo = el(p, "circle", { r: 8, fill: "#1a0f08" });
  const nariz = el(p, "circle", { r: 14 });
  const brazoDel = tramo();
  const capaPelo2 = el(p, "g");
  const SEG = [["cue", "cad", 0.5], ["hom", "cod", 0.3], ["cod", "man", 0.3], ["cad", "rod", 0.36], ["rod", "tob", 0.3], ["cue", "cab", 0.4]];
  const FUR = [];
  for (let i = 0; i < 130; i++) {
    const s = Math.floor(R() * SEG.length), lado = R() < 0.5 ? -1 : 1;
    FUR.push({ s, t: R(), lado, L: 30 + 28 * R(), cae: 25.25 + R() * 0.5, R1: R(), R2: R(), e: el(i % 3 ? capaPelo2 : capaPelo, "path", { fill: "none", stroke: i % 2 ? "#5a3a22" : "#7b5233", "stroke-width": f1(8 + 3 * R()), "stroke-linecap": "round" }) });
  }
  const conector = el(p, "path", { fill: "none", stroke: "#e9edf3", "stroke-width": 5, "stroke-dasharray": "14 12", opacity: 0 });
  const lu = lupa(p, 165, (q) => {
    el(q, "rect", { x: -200, y: -200, width: 400, height: 180, fill: "#2c4766" });
    el(q, "rect", { x: -200, y: -20, width: 400, height: 220, fill: "#f3bba1" });
    el(q, "rect", { x: -200, y: 6, width: 400, height: 200, fill: u("dermis") });
    el(q, "path", { d: "M-200 -20 H200", stroke: "#ffd6bd", "stroke-width": 4 });
    el(q, "path", { d: "M-10 -14 L-80 120", stroke: "#f8dccd", "stroke-width": 36, "stroke-linecap": "round" });
    el(q, "circle", { cx: -84, cy: 128, r: 24, fill: "#efb39b", stroke: "#d38c74", "stroke-width": 3 });
    el(q, "path", { d: "M-10 -14 L60 -70", stroke: "#4a3020", "stroke-width": 7, "stroke-linecap": "round" });
    const gl = el(q, "path", { d: "M-46 54 Q20 10 76 4 Q30 44 -46 54Z", fill: "none", stroke: "rgba(255,194,74,0.7)", "stroke-width": 26, "stroke-linejoin": "round" });
    el(q, "path", { d: "M-46 54 Q20 10 76 4 Q30 44 -46 54Z", fill: "#e03a4e", stroke: "#8e1f30", "stroke-width": 3 });
    return (g) => opa(gl, 0.5 + 0.5 * Math.sin(vuelta(g, 2)));
  });
  return (g) => {
    ni(g);
    const m = sube(g, 25.0, 26.1), J = {};
    for (const k in HU) J[k] = [X0 + mezcla(AN[k][0], HU[k][0], m), Y0 + mezcla(AN[k][1], HU[k][1], m)];
    const col = mezclaColor("#6e4a2c", "#dca07c", m), colB = mezclaColor("#4e3420", "#b98066", m);
    const pinta = (T, pts, w, c, dx = 0) => {
      const d = pts.map((k, i) => `${i ? "L" : "M"}${P(J[k][0] + dx, J[k][1])}`).join("");
      pon1(T.o, "d", d); pon1(T.c, "d", d);
      pon1(T.o, "stroke-width", f1(w + 12)); pon1(T.c, "stroke-width", f1(w)); pon1(T.c, "stroke", c);
    };
    pinta(brazoAtras, ["hom", "cod", "man"], 54, colB, -30);
    pinta(piernaAtras, ["cad", "rod", "tob", "pun"], 66, colB, -34);
    pinta(torso, ["cue", "cad"], mezcla(180, 150, m), col);
    pinta(piernaDel, ["cad", "rod", "tob", "pun"], 70, col);
    pinta(cuello, ["cue", "cab"], 64, col);
    const rC = mezcla(72, 68, m), [hx, hy] = J.cab;
    pon1(cabO, "cx", f1(hx)); pon1(cabO, "cy", f1(hy)); pon1(cabO, "r", f1(rC + 6));
    pon1(cab, "cx", f1(hx)); pon1(cab, "cy", f1(hy)); pon1(cab, "r", f1(rC)); pon1(cab, "fill", col);
    pon1(ojo, "cx", f1(hx + 30)); pon1(ojo, "cy", f1(hy - 6));
    pon1(nariz, "cx", f1(hx + rC * 0.92)); pon1(nariz, "cy", f1(hy + 10)); pon1(nariz, "fill", col);
    pon1(ceja, "d", `M${P(hx + 10, hy - 24 + 6 * m)}Q${P(hx + 32, hy - 32 - 4 * (1 - m))} ${P(hx + 56, hy - 22)}`);
    opa(pelo, m);
    pon1(pelo, "d", `M${P(hx - rC - 4, hy + 6)}A${f1(rC + 4)} ${f1(rC + 4)} 0 0 1 ${P(hx + rC * 0.7, hy - rC * 0.75)}Q${P(hx, hy - rC * 0.45)} ${P(hx - rC * 0.5, hy + 10)}Z`);
    pinta(brazoDel, ["hom", "cod", "man"], 56, col);
    const eriza = 1 + 0.5 * asoma(g, 23.95, 25.2);
    for (const f of FUR) {
      const [a, b, wf] = SEG[f.s], A = J[a], B = J[b];
      const sx = B[0] - A[0], sy = B[1] - A[1], L = Math.hypot(sx, sy) || 1, nx = -sy / L, ny = sx / L;
      const W = (f.s === 0 ? mezcla(180, 150, m) : 60) * wf;
      let x0 = A[0] + sx * f.t + nx * f.lado * W, y0 = A[1] + sy * f.t + ny * f.lado * W;
      const ang = Math.atan2(ny * f.lado, nx * f.lado) + 0.5 * (f.R1 - 0.5) + 0.35;
      const d = sube(g, f.cae, f.cae + 0.9);
      const op = 1 - d;
      opa(f.e, op);
      if (op < 0.01) continue;
      x0 += d * 380 * (0.6 + f.R2);
      y0 += -120 * d + 300 * d * d;
      const Lf = f.L * eriza, a2 = ang + d * 2 * (f.R1 - 0.5);
      pon1(f.e, "d", `M${P(x0, y0)}q${P(Lf * 0.5 * Math.cos(a2) + 6, Lf * 0.5 * Math.sin(a2) + 6)} ${P(Lf * Math.cos(a2), Lf * Math.sin(a2))}`);
    }
    const on = pop(g, 26.95);
    lu(820, AP + 380, on, g >= 26.95 ? 1 : 0, g);
    opa(conector, sube(g, 27.0, 27.3));
    const mm = [(J.cod[0] + J.man[0]) / 2, (J.cod[1] + J.man[1]) / 2];
    pon1(conector, "d", `M${P(mm[0] + 30, mm[1])}L${P(820 - 140, AP + 380 + 90)}`);
  };
}

// ── el miedo: el gato que se eriza, el nervio de alarma y tu brazo ──────────────────────────────────────────────
function gato(p) {
  const R = azar(43);
  const t = el(p, "g");
  el(t, "ellipse", { cx: -10, cy: 6, rx: 260, ry: 30, fill: u("sombra") });
  const cola0 = el(t, "path", { fill: "none", stroke: "#7a5cff", "stroke-linecap": "round" });
  const cola = el(t, "path", { fill: "none", stroke: "#16141b", "stroke-linecap": "round" });
  const colaPelo = el(t, "path", { fill: "none", stroke: "#16141b", "stroke-width": 6, "stroke-linecap": "round" });
  const patas0 = el(t, "path", { fill: "none", stroke: "#7a5cff", "stroke-width": 46, "stroke-linecap": "round" });
  const patasB = el(t, "path", { fill: "none", stroke: "#0d0c11", "stroke-width": 36, "stroke-linecap": "round" });
  const patas = el(t, "path", { fill: "none", stroke: "#16141b", "stroke-width": 36, "stroke-linecap": "round" });
  const pua0 = el(t, "path", { fill: "none", stroke: "#7a5cff", "stroke-width": 13, "stroke-linecap": "round" });
  const pua = el(t, "path", { fill: "none", stroke: "#16141b", "stroke-width": 7, "stroke-linecap": "round" });
  const cuerpo = el(t, "path", { fill: "#16141b", stroke: "#7a5cff", "stroke-width": 6, "stroke-linejoin": "round" });
  const orejas = [0, 1].map(() => el(t, "path", { d: "M-26 0 L0 -70 L26 0 Z", fill: "#16141b", stroke: "#7a5cff", "stroke-width": 6, "stroke-linejoin": "round" }));
  const cabeza = el(t, "circle", { r: 74, fill: "#16141b", stroke: "#7a5cff", "stroke-width": 6 });
  const hocico = el(t, "ellipse", { rx: 40, ry: 30, fill: "#16141b" });
  const ojos = [0, 1].map(() => ({ o: el(t, "ellipse", { rx: 15, fill: "#f6d743" }), p: el(t, "ellipse", { fill: "#0a0a0a" }) }));
  const boca = el(t, "path", { fill: "#5a0f1c", stroke: "#0a0a0a", "stroke-width": 3 });
  const colm = el(t, "path", { fill: "#fff" });
  const bigotes = el(t, "path", { fill: "none", stroke: "rgba(255,255,255,0.65)", "stroke-width": 3, "stroke-linecap": "round" });
  const PU = []; for (let i = 0; i < 46; i++) PU.push({ t: 0.03 + 0.94 * (i / 45), L: 0.7 + 0.6 * R(), a: (R() - 0.5) * 0.5 });
  const PC = []; for (let i = 0; i < 26; i++) PC.push({ t: i / 25, L: 0.7 + 0.6 * R(), lado: i % 2 ? 1 : -1 });
  return (g, x, y, s, a, ojosOn) => {
    pone(t, x, y, s);
    const L = 40 * a, resp = 4 * Math.sin(vuelta(g, 0.4)) * (1 - a);
    const ap = -290 - 130 * a - L + resp;
    const ch = [165, -180 - L], ru = [-195, -170 - L];
    const c1 = [[170, -260 - L], [90, ap + 10], [-10, ap]], c2 = [[-110, ap + 10], [-200, -250 - L], ru];
    pon1(cuerpo, "d", `M${P(...ch)}C${P(...c1[0])} ${P(...c1[1])} ${P(...c1[2])}C${P(...c2[0])} ${P(...c2[1])} ${P(...c2[2])}C${P(-190, -120 - L)} ${P(-120, -105 - L)} ${P(-60, -110 - L)}C${P(20, -112 - L)} ${P(120, -110 - L)} ${P(...ch)}Z`);
    // púas del lomo
    let d = "";
    const lomo = (tt) => (tt < 0.5 ? (() => { const v = tt * 2; return [bez(ch[0], c1[0][0], c1[1][0], c1[2][0], v), bez(ch[1], c1[0][1], c1[1][1], c1[2][1], v)]; })() : (() => { const v = tt * 2 - 1; return [bez(c1[2][0], c2[0][0], c2[1][0], c2[2][0], v), bez(c1[2][1], c2[0][1], c2[1][1], c2[2][1], v)]; })());
    for (const q of PU) {
      const [px, py] = lomo(q.t), [qx, qy] = lomo(Math.min(1, q.t + 0.01));
      const tx = qx - px, ty = qy - py, l = Math.hypot(tx, ty) || 1;
      const nx = ty / l, ny = -tx / l, Lp = mezcla(6, 38, a) * q.L;
      d += `M${P(px - nx * 6, py - ny * 6)}l${P((nx + q.a * tx / l) * Lp + nx * 6, (ny + q.a * ty / l) * Lp + ny * 6)}`;
    }
    pon1(pua, "d", d); pon1(pua0, "d", d);
    // patas tiesas
    const pt = (x0) => `M${x0} ${f1(-130 - L)}L${f1(x0 + 4)} -6`;
    pon1(patas, "d", pt(120) + pt(-150)); pon1(patas0, "d", pt(120) + pt(-150));
    pon1(patasB, "d", pt(150) + pt(-118));
    // la cola, de cepillo
    const T = [ru, [-285, -250 - L - 60 * a], [-305, -420 - L - 90 * a], [-245, -500 - L - 100 * a]];
    const cd = `M${P(...T[0])}C${P(...T[1])} ${P(...T[2])} ${P(...T[3])}`, w = mezcla(26, 64, a);
    pon1(cola, "d", cd); pon1(cola0, "d", cd); pon1(cola, "stroke-width", f1(w)); pon1(cola0, "stroke-width", f1(w + 12));
    let cp = "";
    if (a > 0.01) for (const q of PC) {
      const v = 0.15 + 0.85 * q.t, px = bez(T[0][0], T[1][0], T[2][0], T[3][0], v), py = bez(T[0][1], T[1][1], T[2][1], T[3][1], v);
      const qx = bez(T[0][0], T[1][0], T[2][0], T[3][0], v + 0.01), qy = bez(T[0][1], T[1][1], T[2][1], T[3][1], v + 0.01);
      const l = Math.hypot(qx - px, qy - py) || 1, nx = (qy - py) / l * q.lado, ny = -(qx - px) / l * q.lado, Lp = (w / 2 + 18 * a) * q.L;
      cp += `M${P(px, py)}l${P(nx * Lp, ny * Lp)}`;
    }
    pon1(colaPelo, "d", cp);
    // la cabeza
    const H = [225, -235 - L * 0.9];
    pone(cabeza, H[0], H[1]);
    pone(hocico, H[0] + 52, H[1] + 22);
    orejas.forEach((e, i) => pone(e, H[0] + (i ? 22 : -34), H[1] - 52 + (i ? -6 : 0), 1, (i ? 18 : -14) - 62 * a));
    ojos.forEach((o, i) => {
      const ex = H[0] + (i ? 50 : 6), ey = H[1] - 12;
      pone(o.o, ex, ey); pon1(o.o, "ry", f1(mezcla(4, 16, ojosOn)));
      pone(o.p, ex + 3, ey); pon1(o.p, "rx", f1(mezcla(6, 3, a))); pon1(o.p, "ry", f1(mezcla(1.5, 13, ojosOn)));
    });
    const bo = a;
    pon1(boca, "d", `M${P(H[0] + 40, H[1] + 32)}Q${P(H[0] + 62, H[1] + 26 + 30 * bo)} ${P(H[0] + 88, H[1] + 30)}Z`);
    pon1(colm, "d", bo > 0.05 ? `M${P(H[0] + 46, H[1] + 31)}l6 ${f1(16 * bo)}l6 ${f1(-16 * bo)}ZM${P(H[0] + 72, H[1] + 31)}l6 ${f1(14 * bo)}l6 ${f1(-14 * bo)}Z` : "M0 0");
    pon1(bigotes, "d", `M${P(H[0] + 70, H[1] + 18)}l70 -16M${P(H[0] + 70, H[1] + 24)}l74 4M${P(H[0] + 66, H[1] + 30)}l64 22`);
    return [x + s * -10, y + s * ap];
  };
}
function miedo(p) {
  el(p, "rect", { x: -3000, y: MI - 1500, width: 8000, height: 3000, fill: "#120d1e" });
  el(p, "ellipse", { cx: 600, cy: MI + 420, rx: 1500, ry: 1100, fill: u("foco") });
  el(p, "rect", { x: -3000, y: MI + 700, width: 8000, height: 900, fill: "#1b1528" });
  el(p, "path", { d: `M-3000 ${MI + 700} H5000`, stroke: "#4a3a72", "stroke-width": 5 });
  // el panel con tu brazo
  const PX = 1280, PY = MI + 480, PR = 280;
  const panel = el(p, "g", { opacity: 0 });
  const id = nuevoId();
  el(el(panel, "clipPath", { id }), "circle", { cx: PX, cy: PY, r: PR });
  const dentro = el(panel, "g", { "clip-path": `url(#${id})` });
  el(dentro, "rect", { x: PX - PR, y: PY - PR, width: 2 * PR, height: 2 * PR, fill: u("panel") });
  const bz = el(dentro, "g", { transform: `translate(${PX} ${PY}) scale(0.7) translate(-540 -300)` });
  const ola = (g, t0, x) => sube(g, t0 + (x - 300) / 3000, t0 + 0.3 + (x - 300) / 3000);
  const brz = brazo(bz, { nivel: (g, x) => Math.max(ola(g, 35.62, x) * (1 - sube(g, 37.15, 37.6)), ola(g, 38.42, x)) });
  el(panel, "circle", { cx: PX, cy: PY, r: PR + 4, fill: "none", stroke: "#1b1f27", "stroke-width": 22 });
  el(panel, "circle", { cx: PX, cy: PY, r: PR + 4, fill: "none", stroke: "#e9edf3", "stroke-width": 12 });
  // los nervios desde la alarma
  const NX = 840, NY = MI + 150;
  const NA = `M${NX} ${NY} C${NX - 120} ${NY - 40} ${560} ${MI + 120} 430 ${MI + 220}`, NB = `M${NX} ${NY} C${NX + 100} ${NY + 20} ${980} ${MI + 220} 1060 ${MI + 320}`;
  const nervio = (d) => ({ o: el(p, "path", { d, fill: "none", stroke: "#3a2a06", "stroke-width": 18, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", opacity: 0 }), e: el(p, "path", { d, fill: "none", stroke: "#ffd24a", "stroke-width": 10, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "1 1", opacity: 0 }), d });
  const NN = [nervio(NA), nervio(NB)];
  const pulsos = [0, 1, 2, 3, 4, 5].map(() => el(p, "circle", { r: 15, fill: "#fff6c8", stroke: ORO, "stroke-width": 6, opacity: 0 }));
  const curva = NN.map((n) => n.d.match(/-?\d+(\.\d+)?/g).map(Number));
  const ga = gato(p);
  const alarma = el(p, "g", { opacity: 0 });
  el(alarma, "circle", { r: 120, fill: u("oroG") });
  const aro = el(alarma, "circle", { r: 60, fill: "none", stroke: ORO, "stroke-width": 6 });
  el(alarma, "circle", { r: 58, fill: "#ffd24a", stroke: "#3a2a06", "stroke-width": 7 });
  el(alarma, "path", { d: "M8 -38 L-20 6 H2 L-8 40 L24 -6 H2 Z", fill: "#3a2a06" });
  const exc = el(p, "g", { opacity: 0 });
  texto(exc, 0, 0, "!", { "font-size": 170, fill: ROJO, stroke: "#1a0608", "stroke-width": 10, "paint-order": "stroke" });
  // la regla: parece más grande
  const regla = el(p, "g", { opacity: 0 });
  const rl = el(regla, "path", { fill: "none", stroke: ORO, "stroke-width": 8, "stroke-linecap": "round" });
  const rd = el(regla, "path", { fill: "none", stroke: "rgba(255,194,74,0.6)", "stroke-width": 4, "stroke-dasharray": "12 10" });
  const rp = el(regla, "path", { d: "M0 -26 L-20 6 H20 Z", fill: ORO });
  // el susto y la canción
  const bu = el(p, "g", { opacity: 0 });
  el(bu, "path", { d: "M-90 70 C-100 -40 -70 -120 0 -120 C70 -120 100 -40 90 70 L60 50 L30 74 L0 50 L-30 74 L-60 50 Z", fill: u("fantasma"), stroke: "#1b1f27", "stroke-width": 6 });
  el(bu, "ellipse", { cx: -28, cy: -40, rx: 12, ry: 18, fill: "#1b1f27" }); el(bu, "ellipse", { cx: 28, cy: -40, rx: 12, ry: 18, fill: "#1b1f27" });
  el(bu, "ellipse", { cx: 0, cy: 6, rx: 16, ry: 20, fill: "#1b1f27" });
  texto(bu, 0, -150, "¡BU!", { "font-size": 76, fill: "#fff", stroke: "#1a0608", "stroke-width": 9, "paint-order": "stroke" });
  const notas = [0, 1, 2, 3, 4].map((i) => { const n = el(p, "g", { opacity: 0 }); texto(n, 0, 0, i % 2 ? "♫" : "♪", { "font-size": 96, fill: i % 2 ? CIAN : ORO, stroke: "#120d1e", "stroke-width": 6, "paint-order": "stroke" }); return n; });
  return (g) => {
    const a = sube(g, 31.62, 32.05), s = mezcla(1.15, 1.3, sube(g, 32.7, 33.3));
    const bur = a * 0.02 * Math.sin(vuelta(g, 6));
    const top = ga(g, 430, MI + 700, s * (1 + bur), a, mezcla(0.3, 1, sube(g, 30.6, 30.9)));
    const ex = asoma(g, 29.82, 31.3);
    opa(exc, ex);
    if (ex > 0.01) pone(exc, 830, MI + 270 - 20 * ex, pop(g, 29.82), 8 * Math.sin(vuelta(g, 3)));
    const rr = sube(g, 33.0, 33.2) * (1 - sube(g, 34.1, 34.3));
    opa(regla, rr);
    if (rr > 0.01) {
      const y0 = MI + 700 - 1.15 * 290;
      pon1(rl, "d", `M900 ${MI + 700}V${f1(top[1])}M880 ${MI + 700}H920M880 ${f1(top[1])}H920`);
      pon1(rd, "d", `M${f1(top[0])} ${f1(top[1])}H900M300 ${f1(y0)}H900`);
      pone(rp, 900, top[1] - 24);
    }
    const al = sube(g, 34.0, 34.4);
    opa(alarma, al);
    if (al > 0.01) { pone(alarma, NX, NY, 0.9 + 0.1 * al + 0.06 * Math.sin(vuelta(g, 2))); pon1(aro, "r", f1(60 + 60 * fr(ciclo(g, 1)))); pon1(aro, "opacity", (1 - fr(ciclo(g, 1))).toFixed(2)); }
    const k = [sube(g, 34.1, 34.6), sube(g, 34.4, 34.9)];
    NN.forEach((n, i) => { [n.o, n.e].forEach((e) => { opa(e, k[i] > 0.01 ? 1 : 0); pon1(e, "stroke-dashoffset", (1 - k[i]).toFixed(3)); }); });
    pulsos.forEach((e, j) => {
      const i = j % 2, tt = fr(ciclo(g, 0.9) + Math.floor(j / 2) / 3), on = k[i] >= 0.99 ? Math.sin(PI * tt) : 0;
      opa(e, on);
      if (on > 0.01) { const c = curva[i]; pon1(e, "cx", f1(bez(c[0], c[2], c[4], c[6], tt))); pon1(e, "cy", f1(bez(c[1], c[3], c[5], c[7], tt))); }
    });
    const po = sube(g, 34.0, 34.5);
    opa(panel, po);
    if (po > 0.01) brz(g);
    const b = asoma(g, 36.58, 37.3);
    opa(bu, b);
    if (b > 0.01) pone(bu, 1500, MI + 250 + 10 * Math.sin(vuelta(g, 2)), pop(g, 36.58), -6);
    notas.forEach((n, i) => {
      const t0 = 37.7 + 0.22 * i, tt = K.tramo(g, t0, t0 + 1.6), on = g < t0 ? 0 : Math.sin(PI * tt) * (1 - sube(g, 39.2, 39.5));
      opa(n, on);
      if (on > 0.01) pone(n, 1080 + 80 * i + 40 * tt, MI + 360 - 260 * tt, 0.8 + 0.3 * tt, 14 * Math.sin(vuelta(g, 1.5) + i));
    });
  };
}

// ── la raíz: el ratón; en su piel, el nervio despierta a las células que fabrican el pelo ──────────────────────
function raton(p) {
  const t = el(p, "g");
  el(t, "ellipse", { cx: -10, cy: 6, rx: 210, ry: 24, fill: u("sombra") });
  el(t, "path", { d: "M-150 -40 C-260 -10 -330 -10 -390 -70 C-420 -100 -440 -60 -420 -40", fill: "none", stroke: "#e7a3b0", "stroke-width": 11, "stroke-linecap": "round" });
  const cuerpo = el(t, "g");
  el(cuerpo, "ellipse", { cx: -20, cy: -88, rx: 152, ry: 90, fill: u("raton"), stroke: "#3c3c48", "stroke-width": 5 });
  el(cuerpo, "path", { d: "M-130 -40 Q-20 -10 100 -50", fill: "none", stroke: "rgba(255,255,255,0.35)", "stroke-width": 10, "stroke-linecap": "round" });
  [-80, 60].forEach((x) => el(t, "ellipse", { cx: x, cy: -4, rx: 26, ry: 10, fill: "#f0a8b6", stroke: "#3c3c48", "stroke-width": 3 }));
  el(t, "circle", { cx: 100, cy: -178, r: 50, fill: "#a7a7b4", stroke: "#3c3c48", "stroke-width": 5 });
  el(t, "circle", { cx: 100, cy: -178, r: 32, fill: "#f0a8b6" });
  el(t, "path", { d: "M70 -170 Q160 -190 236 -104 Q180 -60 80 -64 Q40 -110 70 -170Z", fill: u("raton"), stroke: "#3c3c48", "stroke-width": 5, "stroke-linejoin": "round" });
  el(t, "circle", { cx: 168, cy: -128, r: 11, fill: "#0b0b10" });
  el(t, "circle", { cx: 171, cy: -132, r: 3.5, fill: "#fff" });
  const nariz = el(t, "circle", { r: 10, fill: "#f07f98" });
  const big = el(t, "path", { fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-width": 2.5, "stroke-linecap": "round" });
  return (g, x, y, s) => {
    pone(t, x, y, s);
    const tw = 3 * Math.sin(vuelta(g, 4)) * (fr(ciclo(g, 0.5)) < 0.3 ? 1 : 0);
    pone(nariz, 236, -102 + tw);
    pon1(big, "d", `M220 ${f1(-98 + tw)}l70 -18M220 ${f1(-94 + tw)}l76 6M218 ${f1(-90 + tw)}l62 26`);
    pon1(cuerpo, "transform", `translate(0 ${f1(-88)}) scale(1 ${(1 + 0.02 * Math.sin(vuelta(g, 0.6))).toFixed(3)}) translate(0 88)`);
  };
}
function raiz(p) {
  // debajo, el corte de su piel
  const co = corte(p, {
    S: RS, raton: true, aire: 1100,
    est: (g) => ({
      F: XF.map((x, i) => {
        const D = Math.abs(i - 2);
        return { c: 0.25 * sube(g, 42.5, 43.1) + 0.5 * sube(g, 46.2, 46.8), b: 0.4 * sube(g, 46.3, 47), brillo: 0, flechas: 0, crece: sube(g, 47.3 + 0.1 * D, 48.3 + 0.1 * D), despierta: sube(g, 43.3 + 0.12 * D, 43.75 + 0.12 * D) };
      }),
      anillo: 0, nervio: sube(g, 42.3, 42.7), celulas: 1, fabrica: sube(g, 44.6, 45), frio: sube(g, 46, 46.5), resalte: 0,
      cal: sube(g, 46, 46.3) * (1 - sube(g, 48, 48.4)),
    }),
  });
  el(p, "rect", { x: -3000, y: RA - 1500, width: 8000, height: 2000 + 1100, fill: "#14110d" });
  el(p, "ellipse", { cx: 520, cy: RA + 420, rx: 1300, ry: 1000, fill: u("lab") });
  el(p, "rect", { x: -3000, y: RA + 720, width: 8000, height: RS - 1100 - RA - 720, fill: u("madera") });
  const ra = raton(p);
  const no = sello(p, false), si = sello(p, true);
  const lu = lupa(p, 150, (q) => {
    el(q, "rect", { x: -200, y: -200, width: 400, height: 400, fill: "#2f5070" });
    el(q, "rect", { x: -200, y: 30, width: 400, height: 200, fill: "#f3bba1" });
    el(q, "rect", { x: -200, y: 54, width: 400, height: 200, fill: u("dermis") });
    el(q, "path", { d: "M-200 30 H200", stroke: "#ffd6bd", "stroke-width": 4 });
    for (let x = -170; x <= 170; x += 34) {
      el(q, "path", { d: `M${x} 34 L${x - 40} 130`, stroke: "#f8dccd", "stroke-width": 16, "stroke-linecap": "round" });
      el(q, "path", { d: `M${x} 34 l40 -24`, stroke: "#b4b6c2", "stroke-width": 6, "stroke-linecap": "round" });
    }
    return () => {};
  });
  return (g) => {
    co(g);
    ra(g, 470, RA + 720, 1.45);
    const f = K.tramo(g, 40.45, 40.71), cambia = g >= 40.58;
    const sx = Math.abs(Math.cos(PI * f));
    const vis = asoma(g, 39.9, 41.2);
    no(830, RA + 170, pop(g, 39.9), cambia ? 0 : vis);
    si(830, RA + 170, 1, cambia ? vis : 0);
    if (vis > 0.01) { (cambia ? si : no)(830, RA + 170, pop(g, 39.9), vis); }
    const ul = sube(g, 41.7, 41.95);
    lu(470, RA + 330, 0.6 + 0.4 * ul, ul, g);
    void sx;
  };
}

// ── el sitio: fondo oscuro ─────────────────────────────────────────────────────────────────────────────────────
function fondo(p) {
  el(p, "rect", { x: -4000, y: -4000, width: 12000, height: 26000, fill: "#0b0d10" });
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
  r(`la piel de <b>gallina</b>`, "o g", ARR, (g) => (g < 4 ? 1 - K.suave(K.tramo(g, 1.0, 1.22)) : asoma(g, TOTAL - 0.7)));
  r(`es tu <b>cuerpo</b>…`, "", ARR, (g) => ve(g, 1.28, 2.25));
  r(`intentando ponerte un <b>abrigo</b>`, "o g", ARR, (g) => ve(g, 2.3, 3.4));
  r(`que <b>ya no tienes</b>`, "r g", ARR, (g) => ve(g, 3.44, 4.66));
  // músculo
  r(`debajo de cada <b>pelo</b>`, "", ARR, (g) => ve(g, 4.75, 6.2));
  r(`un <b>músculo</b> diminuto`, "r g", ARR, (g) => ve(g, 6.24, 7.7));
  r(`con <b>frío</b>…`, "c g", ARR, (g) => ve(g, 7.8, 8.45));
  r(`se <b>encoge</b>`, "r g", ARR, (g) => ve(g, 8.48, 9.4));
  r(`y pone el pelo <b>de pie</b>`, "o", ARR, (g) => ve(g, 9.44, 10.5));
  r(`la piel de alrededor <b>sube</b>`, "", ARR, (g) => ve(g, 10.6, 12.2));
  r(`un <b>bultito</b>`, "o g", ARR, (g) => ve(g, 12.24, 13.25));
  r(`= piel de <b>gallina</b>`, "o g", ARR, (g) => ve(g, 13.28, 15.1));
  // abrigo
  r(`en un animal con <b>pelo</b>`, "", ARR, (g) => ve(g, 15.22, 16.6));
  r(`eso <b>sirve</b>`, "v g", ARR, (g) => ve(g, 16.62, 17.28));
  r(`los pelos <b>de pie</b>`, "", ARR, (g) => ve(g, 17.3, 18.05));
  r(`atrapan <b>aire</b>`, "c g", ARR, (g) => ve(g, 18.1, 19.5));
  r(`y el aire guarda el <b>calor</b>`, "o", ARR, (g) => ve(g, 19.54, 20.7));
  r(`como inflar un <b>plumas</b>`, "c g", ARR, (g) => ve(g, 20.78, 22.45));
  // antepasado
  r(`tus <b>antepasados</b>`, "o g", ARR, (g) => ve(g, 22.6, 23.95));
  r(`tenían ese <b>abrigo</b>`, "o", ARR, (g) => ve(g, 24.0, 25.0));
  r(`tú perdiste casi todo el <b>pelo</b>`, "r", ARR, (g) => ve(g, 25.06, 26.8));
  r(`pero <b>no</b> los <b>músculos</b>`, "v g", ARR, (g) => ve(g, 26.82, 28.4));
  // miedo
  r(`también con <b>miedo</b>`, "r g", ARR, (g) => ve(g, 28.5, 30.5));
  r(`un <b>gato</b> asustado`, "", ARR, (g) => ve(g, 30.54, 31.6));
  r(`se <b>eriza</b> entero`, "r g", ARR, (g) => ve(g, 31.62, 32.4));
  r(`para parecer <b>más grande</b>`, "o g", ARR, (g) => ve(g, 32.42, 34.0));
  r(`el mismo <b>nervio de alarma</b>`, "o", ARR, (g) => ve(g, 34.05, 35.5));
  r(`te eriza <b>a ti</b>`, "r g", ARR, (g) => ve(g, 35.55, 36.5));
  r(`con un <b>susto</b>`, "r g", ARR, (g) => ve(g, 36.55, 37.3));
  r(`o una <b>canción</b> que te emociona`, "c", ARR, (g) => ve(g, 37.3, 39.5));
  // raíz
  r(`no es del todo <b>inútil</b>`, "v g", ARR, (g) => ve(g, 39.6, 41.3));
  r(`en <b>ratones</b>`, "", ARR, (g) => ve(g, 41.38, 42.28));
  r(`ese <b>nervio</b>`, "o g", ARR, (g) => ve(g, 42.3, 43.3));
  r(`<b>despierta</b> las células`, "v g", ARR, (g) => ve(g, 43.34, 44.6));
  r(`que fabrican el <b>pelo</b>`, "v", ARR, (g) => ve(g, 44.62, 45.85));
  r(`si el frío dura <b>semanas</b>`, "c", ARR, (g) => ve(g, 45.9, 47.3));
  r(`sale <b>pelo nuevo</b>`, "v g", ARR, (g) => ve(g, 47.38, 48.75));
  // cierre
  r(`la próxima vez…`, "", ARR, (g) => ve(g, 48.82, 50.25));
  r(`<b>acuérdate</b>:`, "o g", ARR, (g) => ve(g, 50.3, TOTAL - 0.75));
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
    est(BR, sitioBrazo),
    est(CO, musculo),
    est(AB, abrigo),
    est(AP, antepasado),
    est(MI, miedo),
    est(RA + 1300, raiz),
  ];
  K.crear(esc, `<div class="c-vineta"></div>`);
  E.destello = K.crear(esc, `<div class="c-destello"></div>`);
  E.blanco = K.crear(esc, `<div class="c-blanco"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  E.ro = rotulos(capa);
  return E;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los instantes en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const GOLPES = [[0.48, 0.6], [8.48, 0.4], [12.24, 0.4], [17.86, 0.35], [21.14, 0.5], [29.82, 0.5], [31.62, 0.8], [36.58, 0.8], [43.34, 0.4], [47.94, 0.4], [49.4, 0.4]];
const FLASH = [[31.62, 0.12], [36.58, 0.18]];
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // un temblor pequeño en cada golpe
    const a = Math.max(...GOLPES.map(([t, f]) => f * asoma(g, t, t + 0.25))) * 0.8;
    const tx = 8 * a * Math.sin(83 * g), ty = 6 * a * Math.cos(71 * g);
    E.cam.setAttribute("transform", `translate(${(540 - k.x * k.z + tx).toFixed(2)} ${(1000 - k.y * k.z + ty).toFixed(2)}) scale(${k.z.toFixed(4)})`);
    E.destello.style.opacity = FLASH.reduce((m, [t, f]) => Math.max(m, f * asoma(g, t, t + 0.12) * (1 - K.tramo(g, t + 0.12, t + 0.45))), 0).toFixed(3);
    // el corte escondido al entrar en la lupa del ratón
    const dB = Math.abs(g - 42.42);
    E.blanco.style.opacity = (dB < 0.28 ? Math.pow(1 - dB / 0.28, 0.7) : 0).toFixed(3);
    E.fo(g);
    const alto = 1000 / k.z + 1400;
    // lo que queda lejos de la cámara se esconde
    E.est.forEach(([y, f, q]) => { const on = Math.abs(k.y - y) < alto + 600; if (on) f(g); q.style.display = on ? "" : "none"; });
    E.ro(g);
    return { g, k };
  };
  return E;
}
