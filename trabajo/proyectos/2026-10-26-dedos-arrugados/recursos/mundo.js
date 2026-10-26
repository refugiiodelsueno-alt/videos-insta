// Lo que sale en todas las escenas: una mano mojada recién salida de la bañera, de cara, con los dedos hacia arriba,
// delante de unos azulejos a oscuras; las yemas arrugadas; los nervios en dorado, los vasos de sangre por dentro de la
// yema, el neumático de lluvia, la carrera de canicas y las etiquetas. Todo en 2D. La cámara va dentro del svg (un
// transform del grupo), para que de muy cerca se vea nítido.
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a";
export const F0 = { x: 362, y: 922, z: 4.6 };                  // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar (el vaho, los pulsos) da un número entero de vueltas en TOTAL
// segundos, y la gota del final es la que cae en el fotograma 0: así el último fotograma empalma con el primero.
export const TOTAL = 42.09;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));

// el segundo en que empieza cada escena (build/h1/index.html: cada una 0,3 s antes de que acabe la anterior)
export const G0 = { hook: 0, brazo: 2.36, nervio: 7.7, dentro: 18.28, rueda: 26.794, canicas: 31.94, cierre: 39.48 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  gota: 0.15, por: 1.36, agua: 1.6,
  empapandose: 3.12, brazo: 5.04, solo: 5.92, yemas: 6.84,
  raro: 8.08, nervio: 9.12, roto: 10.08, liso: 12.1, no: 13.62, agua2: 14.14, sistema: 15.06, proposito: 17.14,
  notar: 18.42, agua3: 18.82, nervios: 19.42, aprietan: 19.86, vasos: 20.5,
  menos: 22.28, deshincha: 23.64, piel: 24.54, pliega: 25.5, surcos: 26.02,
  neumatico: 27.88, surcos2: 29.48, echan: 29.92, patinar: 30.88,
  pasaba: 35.4, doce: 38.36,
  no2: 39.52, por2: 39.76, agua4: 40.0, para: 40.98,
};

// la mano: cada dedo derecho en su sitio (cx, de la base a la punta, ancho) y girado «a» grados sobre su base
const DEDOS = [
  { n: "pulgar", cx: 330, base: 1650, tip: 1230, w: 118, a: -24, s: 11 },
  { n: "indice", cx: 360, base: 1330, tip: 830, w: 108, a: 0, s: 23 },
  { n: "corazon", cx: 480, base: 1320, tip: 760, w: 114, a: 0, s: 37 },
  { n: "anular", cx: 600, base: 1330, tip: 810, w: 108, a: 1.5, s: 41 },
  { n: "menique", cx: 712, base: 1360, tip: 950, w: 94, a: 6, s: 53 },
];
const IND = 1, ANU = 3;
const CORTE_Y = 1180;                                           // dónde se corta el nervio del anular
// un punto del dedo (en sus coordenadas, sin girar) en el mundo
function rot(f, x, y) {
  const a = f.a * Math.PI / 180, dx = x - f.cx, dy = y - f.base;
  return [f.cx + dx * Math.cos(a) - dy * Math.sin(a), f.base + dx * Math.sin(a) + dy * Math.cos(a)];
}
export const yema = (i) => rot(DEDOS[i], DEDOS[i].cx, DEDOS[i].tip + 85);

// lo arrugado de cada dedo (1 arrugado, 0 liso), lo hinchada que está la yema del índice y lo que se ve por dentro
function arruga(i, g) {
  if (i === IND) return 1 - sube(g, 18.4, 18.9) + sube(g, T.pliega, 26.4);
  if (i === ANU) return 1 - sube(g, 10.35, 12.0) + sube(g, 19.0, 20.0);
  return 1;
}
const hinchada = (g) => sube(g, 18.4, 18.9) - sube(g, T.deshincha, 24.5);
const corte = (g) => sube(g, 18.6, 19.2) - sube(g, T.piel, 25.3);
// el agua que corre por los surcos (rueda y cierre)
const flujo = (g) => asoma(g, T.surcos2, 31.7) + asoma(g, T.para, 41.75);

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0c1013; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vaho { position: absolute; left: 0; top: 0; border-radius: 50%; background: radial-gradient(circle, rgba(215,232,242,0.16) 0, rgba(215,232,242,0.06) 40%, rgba(215,232,242,0) 70%); }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(6,8,10,0) 55%, rgba(6,8,10,0.55) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(10,13,16,0.96) 0, rgba(10,13,16,0.86) 300px, rgba(10,13,16,0.55) 470px, rgba(10,13,16,0) 630px); }

.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(12,15,19,0.88); border: 2px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 10px 24px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.45); opacity: 0; }
.c-etq b { font-weight: 800; }
.c-etq.c b { color: ${CIAN}; } .c-etq.o b { color: ${ORO}; } .c-etq.r b { color: ${ROJO}; } .c-etq.v b { color: ${VERDE}; }
.c-etq.c { border-color: rgba(95,212,255,0.45); } .c-etq.o { border-color: rgba(255,194,74,0.5); } .c-etq.r { border-color: rgba(240,68,90,0.5); } .c-etq.v { border-color: rgba(34,211,138,0.5); }
.c-etq.g { font-size: 56px; padding: 12px 30px; }
.c-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }
.c-etq .tacha { position: absolute; left: 12px; right: 12px; top: 48%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240,68,90,0.7); }
.c-rueda { position: absolute; left: 590px; top: 680px; width: 360px; height: 740px; opacity: 0; }
.c-carrera { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; display: none; background: #0e1215; }
.c-cuenta { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 36px; color: #c9ced6;
  text-align: center; width: 230px; background: rgba(12,15,19,0.9); border: 2px solid rgba(255,255,255,0.14); border-radius: 18px; padding: 8px 0 10px; }
.c-cuenta b { display: block; font-family: var(--letra-mono), monospace; font-size: 76px; line-height: 1.05; color: #fff; }
.c-cuenta.v { border-color: rgba(34,211,138,0.6); } .c-cuenta.v b { color: ${VERDE}; }
`;

function estilos() {
  if (document.getElementById("mundo-css")) return;
  const s = document.createElement("style");
  s.id = "mundo-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── la cámara: el punto (x, y) del mundo queda en (540, 1000) con zoom z ───────────────────────────────────────
export function pantalla(k, wx, wy) { return [540 + (wx - k.x) * k.z, 1000 + (wy - k.y) * k.z]; }
// una cámara entre claves, con el zoom en escala logarítmica, sin pasarse de ninguna clave (curva monótona)
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
const CAMINO = [
  [0, F0], [2.1, { x: 364, y: 926, z: 4.95 }],                                                  // la yema
  [3.5, { x: 470, y: 1560, z: 0.5 }], [5.0, { x: 480, y: 1640, z: 0.5 }], [6.0, { x: 480, y: 1600, z: 0.5 }], // la mano y el brazo
  [7.3, { x: 480, y: 1120, z: 0.85 }], [8.6, { x: 485, y: 1075, z: 1.05 }], [9.9, { x: 495, y: 1065, z: 1.1 }], // las yemas, los dedos
  [10.9, { x: 610, y: 990, z: 1.75 }], [12.7, { x: 612, y: 992, z: 1.8 }],                     // el anular
  [13.7, { x: 520, y: 1060, z: 1.12 }], [14.9, { x: 500, y: 1080, z: 1.08 }],
  [16.2, { x: 490, y: 1650, z: 0.5 }], [17.5, { x: 480, y: 1600, z: 0.52 }],                   // el brazo con sus nervios
  [19.6, { x: 360, y: 925, z: 5.0 }], [25.6, { x: 362, y: 935, z: 5.2 }], [26.4, { x: 362, y: 935, z: 5.1 }], // dentro
  [27.6, { x: 430, y: 930, z: 4.0 }], [31.7, { x: 432, y: 935, z: 4.15 }],                     // con el neumático
  [33.0, { x: 362, y: 925, z: 4.3 }], [39.6, { x: 362, y: 928, z: 4.3 }],                      // (detrás de las canicas)
  [TOTAL, F0],
];
export const camaraEn = (g) => camara(g, CAMINO);

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
const f1 = (v) => v.toFixed(1);
// una curva suave que pasa por los puntos (Catmull-Rom)
function curva(P) {
  let d = `M${f1(P[0][0])} ${f1(P[0][1])}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}

const DEFS = `
<defs>
  <pattern id="c-azulejo" width="150" height="150" patternUnits="userSpaceOnUse"><rect width="150" height="150" fill="#151b20"/><rect x="6" y="6" width="138" height="138" rx="6" fill="#18202a" opacity="0.55"/><path d="M0 1.5H150M1.5 0V150" stroke="#0a0d10" stroke-width="5"/></pattern>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(140,190,220,0.22)"/><stop offset="1" stop-color="rgba(140,190,220,0)"/></radialGradient>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.5)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <linearGradient id="c-piel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a5624a"/><stop offset="0.16" stop-color="#d39474"/><stop offset="0.42" stop-color="#f1bfa2"/><stop offset="0.7" stop-color="#e2a685"/><stop offset="1" stop-color="#9f5c44"/></linearGradient>
  <radialGradient id="c-palma" cx="0.45" cy="0.38" r="0.7"><stop offset="0" stop-color="#f0bea0"/><stop offset="0.6" stop-color="#d89a7a"/><stop offset="1" stop-color="#ad6b51"/></radialGradient>
  <radialGradient id="c-pulpa" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stop-color="#e48c80"/><stop offset="1" stop-color="#b8545a"/></radialGradient>
  <radialGradient id="c-globulo" cx="0.35" cy="0.35" r="0.7"><stop offset="0" stop-color="#ff8f99"/><stop offset="1" stop-color="#c3162f"/></radialGradient>
  <radialGradient id="c-onda" cx="0.5" cy="0.5" r="0.5"><stop offset="0.6" stop-color="rgba(95,212,255,0)"/><stop offset="0.85" stop-color="rgba(95,212,255,0.7)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
</defs>`;

// ── un dedo: su contorno por puntos (con su normal), que se hincha o se ondula (los surcos) en la yema ─────────────
function contorno(f) {
  const P = [], hw0 = f.w / 2, cy = f.tip + hw0;
  const hw = (y) => hw0 * (0.97 + 0.09 * (y - cy) / (f.base - cy));
  const enYema = (y) => 1 - K.suave(K.tramo(y, f.tip + 150, f.tip + 205));
  const paso = 3;
  for (let y = f.base + 30; y > cy; y -= paso) P.push({ x: f.cx - hw(y), y, nx: -1, ny: 0, h: hw(y) });
  const r = hw(cy), n = Math.ceil(Math.PI * r * 1.04 / paso);
  for (let i = 0; i <= n; i++) {
    const th = Math.PI - Math.PI * i / n, ex = Math.cos(th), ey = -1.08 * Math.sin(th), l = Math.hypot(ex, ey / 1.08 / 1.08);
    P.push({ x: f.cx + r * ex, y: cy + r * ey, nx: ex / l, ny: ey / 1.08 / 1.08 / l, h: r });
  }
  for (let y = cy + paso; y <= f.base + 30; y += paso) P.push({ x: f.cx + hw(y), y, nx: 1, ny: 0, h: hw(y) });
  // la onda: lóbulos redondos con valles finos, de ancho algo irregular
  const az = K.azar(f.s);
  let fase = az() * 3, acc = 0;
  P.forEach((p, i) => {
    if (i) { const d = Math.hypot(p.x - P[i - 1].x, p.y - P[i - 1].y); acc += d; fase += d * Math.PI / (12 * (1 + 0.3 * Math.sin(acc / 37 + f.s))); }
    p.m = enYema(p.y);
    p.v = Math.pow(1 - Math.abs(Math.sin(fase)), 3);
  });
  return P;
}
function dContorno(P, W, sw) {
  let d = "";
  P.forEach((p, i) => {
    const o = sw * 0.075 * p.h * p.m - W * p.m * p.v * 2.8;
    d += (i ? "L" : "M") + f1(p.x + p.nx * o) + " " + f1(p.y + p.ny * o);
  });
  return d + "Z";
}
// los surcos de la yema: largos, siguiendo la yema, y unos cortos que los cruzan
function surcos(f) {
  const az = K.azar(f.s + 5), L = [], hw0 = f.w / 2, cy = f.tip + hw0;
  for (let i = 0; i < 7; i++) {
    const u = -0.8 + i * 0.267 + (az() - 0.5) * 0.08;
    const y0 = cy - Math.sqrt(Math.max(0.05, 1 - u * u)) * hw0 * 1.08 + 8 + az() * 8;
    const y1 = f.tip + 140 + az() * 45;
    const P = [], ph = az() * 6, fr = 7 + az() * 5;
    for (let j = 0; j <= 9; j++) {
      const t = j / 9, y = K.mez(y0, y1, t);
      P.push([f.cx + u * hw0 * (0.8 + 0.22 * t) + 3.2 * Math.sin(t * fr + ph) + (az() - 0.5) * 3, y]);
    }
    L.push(P);
  }
  for (let i = 0; i < 3; i++) {
    const u = -0.55 + az() * 1.1, y = f.tip + 40 + az() * 110, len = 14 + az() * 16, s = az() < 0.5 ? -1 : 1;
    const x = f.cx + u * hw0;
    L.push([[x - len / 2, y - s * 6], [x, y + (az() - 0.5) * 4], [x + len / 2, y + s * 6]]);
  }
  return L.map(curva);
}

function dedo(padre, f, i, defs) {
  const g = el(padre, "g", { transform: `rotate(${f.a} ${f.cx} ${f.base})` });
  const P = contorno(f);
  const clip = el(defs, "clipPath", { id: `${PRE}clip${i}` }), clipP = el(clip, "path");
  const piel = el(g, "path", { fill: `url(#${PRE}piel)` });
  const dentro = el(g, "g", { "clip-path": `url(#${PRE}clip${i})` });
  const hw0 = f.w / 2;
  // la huella: arcos finos en la yema
  const hu = el(dentro, "g", { fill: "none", stroke: "rgba(135,66,46,0.2)", "stroke-width": 1.3 });
  for (let r = 9; r < 62; r += 6.5) el(hu, "ellipse", { cx: f.cx + 3, cy: f.tip + 98, rx: r, ry: r * 1.28 });
  // los pliegues de las articulaciones (y la base, que esconde dónde empieza el dedo)
  [f.tip + 195, f.tip + 360, f.base - 18].forEach((y, j) => {
    el(dentro, "path", { d: `M${f.cx - hw0 - 4} ${y} Q${f.cx} ${y + 9} ${f.cx + hw0 + 4} ${y}`, fill: "none", stroke: "rgba(128,62,42,0.5)", "stroke-width": j === 2 ? 5 : 3.4 });
    el(dentro, "path", { d: `M${f.cx - hw0 * 0.8} ${y + 7} Q${f.cx} ${y + 15} ${f.cx + hw0 * 0.8} ${y + 7}`, fill: "none", stroke: "rgba(255,222,200,0.35)", "stroke-width": 2 });
  });
  // los surcos: la sombra del valle y la luz del borde
  const S = surcos(f);
  const sur = el(dentro, "g", { fill: "none", "stroke-linecap": "round" });
  S.forEach((d) => {
    el(sur, "path", { d, stroke: "rgba(255,228,210,0.42)", "stroke-width": 3.2, transform: "translate(2.6 1.4)" });
    el(sur, "path", { d, stroke: "rgba(128,58,38,0.26)", "stroke-width": 7 });
    el(sur, "path", { d, stroke: "rgba(96,38,24,0.6)", "stroke-width": 1.7 });
  });
  // por dentro (solo el índice): pulpa, hueso, vasos de sangre y glóbulos
  let cort = null;
  if (i === IND) cort = corteYema(dentro, f);
  // el agua que corre por los surcos
  const agua = el(dentro, "g", { fill: "none", stroke: CIAN, "stroke-width": 2.6, "stroke-linecap": "round", "stroke-dasharray": "9 16", opacity: 0 });
  S.slice(0, 7).forEach((d) => el(agua, "path", { d }));
  // el brillo de lo mojado: una raya de luz y unas gotas
  const brillo = el(dentro, "g");
  el(brillo, "path", { d: `M${f.cx - hw0 * 0.36} ${f.tip + 30} L${f.cx - hw0 * 0.42} ${f.base}`, stroke: "rgba(255,255,255,0.2)", "stroke-width": f.w * 0.1, "stroke-linecap": "round" });
  el(brillo, "ellipse", { cx: f.cx - hw0 * 0.25, cy: f.tip + 40, rx: hw0 * 0.22, ry: hw0 * 0.4, fill: "rgba(255,255,255,0.16)" });
  const az = K.azar(f.s + 9);
  for (let j = 0; j < 4; j++) {
    const x = f.cx + (az() - 0.5) * f.w * 0.6, y = f.tip + 60 + az() * (f.base - f.tip - 120), r = 4 + az() * 5;
    el(brillo, "ellipse", { cx: x, cy: y, rx: r, ry: r * 1.15, fill: "rgba(200,232,250,0.2)", stroke: "rgba(255,255,255,0.45)", "stroke-width": 1 });
    el(brillo, "circle", { cx: x - r * 0.35, cy: y - r * 0.4, r: r * 0.28, fill: "rgba(255,255,255,0.85)" });
  }
  const borde = el(g, "path", { fill: "none", stroke: "rgba(80,34,22,0.45)", "stroke-width": 1.6 });
  return (g0) => {
    const W = arruga(i, g0), sw = i === IND ? hinchada(g0) : 0;
    const d = dContorno(P, W, sw);
    piel.setAttribute("d", d); clipP.setAttribute("d", d); borde.setAttribute("d", d);
    sur.style.opacity = W;
    const fl = flujo(g0) * W;
    agua.style.opacity = fl;
    if (fl > 0.001) agua.setAttribute("stroke-dashoffset", f1(-25 * ciclo(g0, 1.2)));
    const c = cort ? cort(g0) : 0;
    brillo.style.opacity = 1 - c;
  };
}

// ── la yema por dentro: pulpa, hueso, vasos (que se estrechan) y glóbulos (que corren y luego son menos) ─────────
const VASOS = [
  "M338 1210 C336 1080 332 985 334 922 C336 872 384 872 386 922 C388 985 384 1080 382 1210",
  "M335 968 C318 938 312 905 328 888 C340 877 352 886 352 902",
  "M385 972 C402 942 407 908 393 890 C381 879 368 886 368 902",
  "M352 902 C350 868 372 866 368 902",
];
// lo que han avanzado los glóbulos: a su velocidad hasta «menos sangre» y luego al 35 %
function avance(g) {
  const a = T.menos - 0.4, b = T.menos + 0.4;
  if (g <= a) return g;
  let h = a;
  const fin = Math.min(g, b);
  for (let x = a; x < fin; x += 0.01) h += Math.min(0.01, fin - x) * (1 - 0.65 * sube(x + 0.005, a, b));
  return h + Math.max(0, g - b) * 0.35;
}
function corteYema(padre, f) {
  const c = el(padre, "g", { opacity: 0 });
  el(c, "rect", { x: f.cx - 90, y: f.tip - 20, width: 180, height: 520, fill: `url(#${PRE}pulpa)` });
  const palida = el(c, "rect", { x: f.cx - 90, y: f.tip - 20, width: 180, height: 520, fill: "#e9c3b4", opacity: 0 });
  // el hueso de la punta (con su penacho) y el del medio
  const hueso = el(c, "g", { fill: "#efe4d0", stroke: "#c4b295", "stroke-width": 2 });
  el(hueso, "path", { d: `M342 884 C336 872 384 872 378 884 C372 900 371 960 373 1000 C374 1014 346 1014 347 1000 C349 960 348 900 342 884 Z` });
  el(hueso, "rect", { x: 340, y: 1032, width: 40, height: 150, rx: 15 });
  const vasos = VASOS.map((d) => ({
    fuera: el(c, "path", { d, fill: "none", stroke: "#5c0a16", "stroke-linecap": "round" }),
    dentro: el(c, "path", { d, fill: "none", stroke: "#cf2238", "stroke-linecap": "round" }),
    luz: el(c, "path", { d, fill: "none", stroke: "rgba(255,140,150,0.6)", "stroke-linecap": "round" }),
  }));
  const N = [20, 7, 7, 4], glob = [];
  vasos.forEach((v, j) => {
    for (let n = 0; n < N[j]; n++) glob.push({ v: j, f: n / N[j], e: el(c, "circle", { r: 3.6, fill: `url(#${PRE}globulo)`, stroke: "#7d0c1c", "stroke-width": 0.7 }), par: n % 2 });
  });
  const onda = el(c, "ellipse", { cx: f.cx, cy: f.tip + 40, rx: 0, ry: 0, fill: `url(#${PRE}onda)` });
  let largos = null;
  return (g) => {
    const a = corte(g);
    c.style.opacity = a;
    if (a <= 0.001) return 0;
    if (!largos) largos = vasos.map((v) => v.dentro.getTotalLength());
    const an = 8.5 - 4.6 * sube(g, T.aprietan, T.aprietan + 0.7);
    vasos.forEach((v) => {
      v.fuera.setAttribute("stroke-width", f1(an + 3.4));
      v.dentro.setAttribute("stroke-width", f1(an));
      v.luz.setAttribute("stroke-width", f1(an * 0.28));
    });
    palida.style.opacity = 0.42 * sube(g, T.menos, T.menos + 0.9);
    const h = avance(g), pocos = sube(g, T.menos, T.menos + 0.5);
    glob.forEach((b) => {
      const L = largos[b.v], u = ((b.f + h * 55 / L) % 1 + 1) % 1, p = vasos[b.v].dentro.getPointAtLength(u * L);
      b.e.setAttribute("cx", f1(p.x)); b.e.setAttribute("cy", f1(p.y));
      b.e.setAttribute("r", f1(Math.min(3.6, an * 0.42)));
      b.e.style.opacity = b.par ? 1 - pocos : 1;
    });
    // la onda del agua que se nota en «agua»
    const o = K.tramo(g, T.agua3, T.agua3 + 0.9);
    onda.setAttribute("rx", f1(10 + 70 * o)); onda.setAttribute("ry", f1(6 + 40 * o));
    onda.style.opacity = o > 0 && o < 1 ? 1 - o : 0;
    return a;
  };
}

// ── los nervios: del brazo a cada dedo, por los dos lados, con pulsos que corren hacia la yema ───────────────────
function nervios(padre) {
  const g = el(padre, "g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 });
  const tramos = [];
  DEDOS.forEach((f, i) => {
    const tx = i < 3 ? 520 : 668;
    [-1, 1].forEach((s) => {
      const lx = f.cx + s * 0.3 * f.w;
      const [bx, by] = rot(f, lx, f.base - 10), [cx, cy] = rot(f, lx, CORTE_Y + (f.base - 1330)), [cx2, cy2] = rot(f, lx, CORTE_Y + (f.base - 1330) - 16);
      const [ux, uy] = rot(f, lx, f.tip + 120), [px, py] = rot(f, f.cx + s * 0.14 * f.w, f.tip + 42);
      const [rx, ry] = rot(f, f.cx + s * 0.05 * f.w, f.tip + 92), [qx, qy] = rot(f, lx, f.tip + 150);
      const abajo = `M${tx + s * 14} 2950 L${tx + s * 14} 1860 C${tx + s * 14} 1660 ${f1(bx)} ${f1(by + 160)} ${f1(bx)} ${f1(by)} L${f1(cx)} ${f1(cy)}`;
      const arriba = `M${f1(cx2)} ${f1(cy2)} L${f1(ux)} ${f1(uy)} Q${f1(rot(f, lx, f.tip + 70)[0])} ${f1(rot(f, lx, f.tip + 70)[1])} ${f1(px)} ${f1(py)} M${f1(qx)} ${f1(qy)} L${f1(rx)} ${f1(ry)}`;
      [abajo, arriba].forEach((d, j) => tramos.push({
        i, j, d,
        halo: el(g, "path", { d, stroke: "rgba(255,194,74,0.16)" }),
        hilo: el(g, "path", { d, stroke: ORO }),
        pulso: el(g, "path", { d, stroke: "#fff3c4", "stroke-dasharray": "24 156" }),
      }));
    });
  });
  // el corte del anular: dos marcas rojas y un destello
  const roto = el(padre, "g", { opacity: 0 });
  const fA = DEDOS[ANU], ys = CORTE_Y - 8;
  [-1, 1].forEach((s) => {
    const [x, y] = rot(fA, fA.cx + s * 0.3 * fA.w, ys);
    el(roto, "path", { d: `M${f1(x - 13)} ${f1(y - 9)} L${f1(x + 13)} ${f1(y + 5)}`, stroke: ROJO, "stroke-width": 6, "stroke-linecap": "round" });
    el(roto, "circle", { cx: f1(x), cy: f1(y + 9), r: 3.5, fill: ROJO });
    el(roto, "circle", { cx: f1(x), cy: f1(y - 9), r: 3.5, fill: "#8b8f96" });
  });
  const [ox, oy] = rot(fA, fA.cx, ys);
  const destello = el(padre, "circle", { cx: f1(ox), cy: f1(oy), r: 0, fill: "none", stroke: ROJO, "stroke-width": 5, opacity: 0 });
  let largo = null;
  return (gg, k) => {
    const vis = sube(gg, 9.0, 9.6) - sube(gg, 26.0, 26.6);
    g.style.opacity = vis;
    const rt = sube(gg, T.roto, T.roto + 0.2) - sube(gg, 19.0, 19.6);
    roto.style.opacity = rt;
    const dl = K.tramo(gg, T.roto, T.roto + 0.6);
    destello.setAttribute("r", f1(10 + 70 * dl)); destello.style.opacity = dl > 0 && dl < 1 ? 1 - dl : 0;
    if (vis <= 0.001) return;
    if (!largo) largo = tramos.map((t) => t.hilo.getTotalLength());
    const q = Math.min(2.2, Math.pow(1.1 / k.z, 0.6));
    const brilla = 0.55 + 0.45 * Math.max(sube(gg, T.sistema, T.sistema + 0.5) - sube(gg, 17.9, 18.4), sube(gg, T.nervios, T.nervios + 0.4) - sube(gg, 23.5, 24.2));
    const off = 180 * ciclo(gg, 0.9);
    tramos.forEach((t, n) => {
      const muerto = t.i === ANU && t.j === 1 ? rt : 0;
      t.halo.setAttribute("stroke-width", f1(14 * q)); t.hilo.setAttribute("stroke-width", f1(3.6 * q)); t.pulso.setAttribute("stroke-width", f1(6 * q));
      t.halo.style.opacity = (1 - muerto) * brilla;
      t.hilo.setAttribute("stroke", muerto > 0.5 ? "#7d8188" : ORO);
      t.pulso.style.opacity = (1 - muerto) * brilla;
      // el tramo de arriba sigue al de abajo, para que los pulsos no salten en el corte
      t.pulso.setAttribute("stroke-dashoffset", f1(-off + (t.j === 1 ? largo[n - 1] + 16 : 0)));
    });
  };
}

// ── la gota que cae en la yema del índice en el fotograma 0 (y la del final, que es la misma) ──────────────────
function gota(padre) {
  const X = 370, Y = 884;
  const g = el(padre, "g");
  const cae = el(g, "g");
  el(cae, "path", { d: "M0 -17 C6 -7 10 -1 10 5 A10 10 0 0 1 -10 5 C-10 -1 -6 -7 0 -17 Z", fill: "rgba(175,228,255,0.55)", stroke: "rgba(255,255,255,0.8)", "stroke-width": 1.2 });
  el(cae, "ellipse", { cx: -3.5, cy: 2, rx: 2.4, ry: 4, fill: "rgba(255,255,255,0.9)" });
  const aro = el(g, "ellipse", { cx: X, cy: Y + 4, rx: 0, ry: 0, fill: "none", stroke: "rgba(210,240,255,0.85)", "stroke-width": 2 });
  const perla = el(g, "g");
  el(perla, "ellipse", { cx: 0, cy: 0, rx: 13, ry: 9, fill: "rgba(200,235,255,0.3)", stroke: "rgba(255,255,255,0.6)", "stroke-width": 1.2 });
  el(perla, "ellipse", { cx: -4, cy: -3, rx: 3.5, ry: 2.2, fill: "rgba(255,255,255,0.9)" });
  const az = K.azar(77), chis = [];
  for (let i = 0; i < 7; i++) chis.push({ a: -Math.PI * (0.12 + 0.76 * i / 6), v: 60 + az() * 50, r: 1.6 + az() * 1.6, e: el(g, "circle", { r: 2, fill: "rgba(215,242,255,0.9)" }) });
  return (gg) => {
    const t = gg > TOTAL - 0.6 ? gg - TOTAL : gg;                 // la del final es la del principio
    if (t < T.gota) {
      const y = Y - 760 * (T.gota - t);
      cae.setAttribute("transform", `translate(${X} ${f1(y)}) scale(1 ${f1(1 + 0.25 * K.lim((T.gota - t) / 0.1))})`);
      cae.style.opacity = 1;
    } else cae.style.opacity = 0;
    const u = K.tramo(t, T.gota, T.gota + 0.45);
    aro.setAttribute("rx", f1(6 + 46 * K.sale(u))); aro.setAttribute("ry", f1(2 + 15 * K.sale(u)));
    aro.style.opacity = u > 0 && u < 1 ? 1 - u : 0;
    const v = K.tramo(t, T.gota, T.gota + 0.5);
    chis.forEach((c) => {
      const d = v * 0.5;
      c.e.setAttribute("cx", f1(X + Math.cos(c.a) * c.v * d));
      c.e.setAttribute("cy", f1(Y + Math.sin(c.a) * c.v * d + 260 * d * d));
      c.e.setAttribute("r", f1(c.r));
      c.e.style.opacity = v > 0 && v < 1 ? 1 - v : 0;
    });
    const p = t >= T.gota ? 1 - sube(t, 1.3, 1.9) : 0, ab = K.sale(K.tramo(t, T.gota, T.gota + 0.25));
    perla.setAttribute("transform", `translate(${X} ${Y + 4}) scale(${f1(0.4 + 0.6 * ab)} ${f1(0.4 + 0.6 * ab)})`);
    perla.style.opacity = p;
  };
}

// ── el brazo: flechas de agua que entran en la piel, arrugas de mentira en el brazo y aros en las yemas ─────────
function brazoExtra(padre) {
  const falsas = el(padre, "g", { fill: "none", stroke: ROJO, "stroke-width": 7, "stroke-dasharray": "16 12", "stroke-linecap": "round", opacity: 0 });
  for (let y = 1990; y <= 2590; y += 75) {
    const P = [];
    for (let x = 405; x <= 735; x += 30) P.push([x, y + 9 * Math.sin(x / 26 + y)]);
    el(falsas, "path", { d: curva(P) });
  }
  const fl = el(padre, "g", { fill: CIAN, stroke: "#0d4a63", "stroke-width": 3, opacity: 0 });
  const SITIOS = [[250, 2000, 1], [250, 2300, 1], [250, 2600, 1], [900, 2050, -1], [900, 2400, -1], [80, 1350, 1], [930, 1500, -1], [180, 1850, 1], [880, 1750, -1]];
  const fs = SITIOS.map(([x, y, s]) => ({ x, y, s, e: el(fl, "path") }));
  const aros = el(padre, "g", { fill: "none", stroke: CIAN, opacity: 0 });
  const ar = DEDOS.map((f, i) => { const [x, y] = yema(i); return el(aros, "circle", { cx: f1(x), cy: f1(y - 15), r: f.w * 0.72 }); });
  return (g) => {
    falsas.style.opacity = 0.9 * asoma(g, T.brazo - 0.1, T.solo);
    falsas.setAttribute("stroke-dashoffset", f1(-40 * K.tramo(g, T.brazo, T.solo)));
    const vf = asoma(g, T.empapandose, 4.9);
    fl.style.opacity = vf;
    if (vf > 0.001) fs.forEach((a, n) => {
      const u = (ciclo(g, 1.1) + n * 0.37) % 1, x = a.x + a.s * 70 * u, L = 120, c = 50, h = 14, ab = 34;
      const P = [[-L, -h], [-c, -h], [-c, -ab], [0, 0], [-c, ab], [-c, h], [-L, h]];
      a.e.setAttribute("d", "M" + P.map(([px, py]) => `${f1(x + a.s * px)} ${f1(a.y + py)}`).join(" L") + " Z");
      a.e.style.opacity = Math.sin(Math.PI * u);
    });
    const va = asoma(g, T.yemas, 8.3);
    aros.style.opacity = va;
    aros.setAttribute("stroke-width", 9);
    ar.forEach((c, n) => c.setAttribute("r", f1(DEDOS[n].w * (0.72 + 0.06 * Math.sin(vuelta(g, 1.4) + n)))));
  };
}

// ── el neumático de lluvia (pantalla): entra rodando y echa el agua por sus surcos ──────────────────────────────
function rueda(capa) {
  const d = K.crear(capa, ids(`<div class="c-rueda"><svg width="360" height="740" viewBox="0 0 360 740">
    <defs><linearGradient id="c-goma" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d0e10"/><stop offset="0.5" stop-color="#2a2d32"/><stop offset="1" stop-color="#0d0e10"/></linearGradient>
    <clipPath id="c-banda"><rect x="10" y="0" width="340" height="740" rx="44"/></clipPath></defs>
    <rect x="10" y="0" width="340" height="740" rx="44" fill="url(#c-goma)"/>
    <g clip-path="url(#c-banda)"><g class="c-dibujo"></g></g>
    <rect x="10" y="0" width="340" height="740" rx="44" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3"/>
  </svg></div>`));
  const dib = d.querySelector(".c-dibujo");
  const surcosR = [], aguas = [], gotas = [];
  for (let j = -1; j < 8; j++) {
    const y = j * 110;
    surcosR.push(el(dib, "path", { d: `M20 ${y} L180 ${y + 70} L340 ${y}`, fill: "none", stroke: "#060708", "stroke-width": 26, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    aguas.push(el(dib, "path", { d: `M180 ${y + 70} L20 ${y}`, fill: "none", stroke: CIAN, "stroke-width": 10, "stroke-linecap": "round", "stroke-dasharray": "18 24" }));
    aguas.push(el(dib, "path", { d: `M180 ${y + 70} L340 ${y}`, fill: "none", stroke: CIAN, "stroke-width": 10, "stroke-linecap": "round", "stroke-dasharray": "18 24" }));
  }
  el(dib, "path", { d: "M100 -20 V760 M260 -20 V760", stroke: "#060708", "stroke-width": 18 });
  const sv = d.querySelector("svg");
  const az = K.azar(5);
  for (let i = 0; i < 14; i++) gotas.push({ s: i % 2 ? 1 : -1, y: 40 + az() * 660, f: az(), e: el(sv, "circle", { r: 4 + az() * 4, fill: CIAN }) });
  const dibG = dib;
  return (g) => {
    const v = K.sale(K.tramo(g, T.neumatico - 0.1, T.neumatico + 0.45)) * (1 - K.tramo(g, 31.9, 32.3));
    d.style.opacity = v > 0.001 ? 1 : 0;
    if (v <= 0.001) return;
    d.style.transform = `translateX(${f1(560 * (1 - v))}px)`;
    dibG.setAttribute("transform", `translate(0 ${f1((g * 300) % 110)})`);
    const a = sube(g, T.surcos2 - 0.1, T.surcos2 + 0.4);
    aguas.forEach((p) => { p.style.opacity = a; p.setAttribute("stroke-dashoffset", f1(-g * 160)); });
    const ch = sube(g, T.echan, T.echan + 0.4);
    gotas.forEach((p) => {
      const u = (ciclo(g, 1.3) + p.f) % 1;
      p.e.setAttribute("cx", f1(180 + p.s * (170 + 110 * u)));
      p.e.setAttribute("cy", f1(p.y - 40 * u + 60 * u * u));
      p.e.style.opacity = ch * (1 - u);
    });
  };
}

// ── la carrera de canicas (otro sitio, en pantalla): dedos lisos arriba y arrugados abajo ────────────────────────
const COLORES = ["#4fa3ff", "#ff6b6b", "#ffd166", "#06d6a0", "#c77dff", "#ff9f1c", "#5fd4ff", "#ff7ab6"];
const SALIDA = 32.3, P_LISOS = 1.12, P_ARRUGADOS = 1.0;
export const caidas = (P) => { const r = []; for (let k = 0; SALIDA + P * (k + 0.6) < 39.5; k++) r.push(+(SALIDA + P * (k + 0.6)).toFixed(2)); return r; };
function carrera(capa) {
  const d = K.crear(capa, `<div class="c-carrera"></div>`);
  const sv = K.crear(d, ids(`<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">
    <defs><radialGradient id="c-brillo" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stop-color="rgba(255,255,255,0.9)"/><stop offset="0.3" stop-color="rgba(255,255,255,0.15)"/><stop offset="1" stop-color="rgba(0,0,0,0.25)"/></radialGradient>
    <linearGradient id="c-piel2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a5624a"/><stop offset="0.4" stop-color="#f1bfa2"/><stop offset="1" stop-color="#9f5c44"/></linearGradient>
    <pattern id="c-azul2" width="150" height="150" patternUnits="userSpaceOnUse"><rect width="150" height="150" fill="#12171b"/><path d="M0 1.5H150M1.5 0V150" stroke="#0a0d10" stroke-width="5"/></pattern></defs>
    <rect width="1080" height="1920" fill="url(#c-azul2)"/>
    <rect x="40" y="588" width="900" height="404" rx="34" fill="#1c252d" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
    <rect x="40" y="1022" width="900" height="404" rx="34" fill="#1c2a26" stroke="rgba(34,211,138,0.28)" stroke-width="3"/>
  </svg>`));
  const LX = 215, RX = 655, ESC = 1.22;
  const carril = (yc, P, arrugado, semilla) => {
    const g = el(sv, "g", { transform: `translate(${f1(435 * (1 - ESC))} ${f1(yc * (1 - ESC))}) scale(${ESC})` });
    const bote = (x) => {
      el(g, "path", { d: `M${x - 92} ${yc - 40} V${yc + 100} Q${x - 92} ${yc + 128} ${x - 64} ${yc + 128} H${x + 64} Q${x + 92} ${yc + 128} ${x + 92} ${yc + 100} V${yc - 40}`, fill: "rgba(140,200,235,0.07)", stroke: "rgba(210,235,255,0.5)", "stroke-width": 4 });
      el(g, "rect", { x: x - 88, y: yc + 20, width: 176, height: 104, rx: 22, fill: "rgba(95,212,255,0.18)" });
      el(g, "path", { d: `M${x - 88} ${yc + 20} H${x + 88}`, stroke: "rgba(160,230,255,0.6)", "stroke-width": 3 });
      el(g, "ellipse", { cx: x, cy: yc - 40, rx: 92, ry: 12, fill: "none", stroke: "rgba(210,235,255,0.45)", "stroke-width": 3 });
    };
    const sitio = (x, n) => [x - 60 + (n % 4) * 40 + ((n >> 2) % 2) * 20, yc + 100 - Math.floor(n / 4) * 34];
    const bolas = [];
    for (let n = 0; n < 11; n++) {
      const b = el(g, "g");
      el(b, "circle", { r: 20, fill: COLORES[(n + semilla) % COLORES.length] });
      el(b, "circle", { r: 20, fill: `url(#${PRE}brillo)` });
      bolas.push(b);
    }
    bote(LX); bote(RX);
    // los dos dedos que pellizcan (índice y pulgar, vistos de lado), con o sin surcos
    const pinza = el(g, "g");
    const dedoP = (s) => {
      const q = el(pinza, "g");
      el(q, "rect", { x: -25, y: -138, width: 50, height: 150, rx: 25, fill: `url(#${PRE}piel2)`, stroke: "rgba(80,34,22,0.5)", "stroke-width": 2 });
      if (arrugado) for (let j = 0; j < 4; j++) el(q, "path", { d: `M${-13 + j * 9} -6 C${-16 + j * 9} -18 ${-10 + j * 9} -30 ${-13 + j * 9} -46`, fill: "none", stroke: "rgba(112,46,30,0.75)", "stroke-width": 2.6, "stroke-linecap": "round" });
      return q;
    };
    const izq = dedoP(-1), der = dedoP(1);
    const cuenta = K.crear(d, `<div class="c-cuenta${arrugado ? " v" : ""}">${arrugado ? "arrugados" : "lisos"}<b>0</b></div>`);
    cuenta.style.transform = `translate(${435 - 115}px, ${yc + 2}px)`;
    const num = cuenta.querySelector("b");
    const hover = yc - 82, grab = yc - 12;
    return (gg) => {
      const ph = Math.max(0, (gg - SALIDA) / P), k = Math.floor(ph), u = gg < SALIDA ? 0 : ph - k;
      const hechos = gg < SALIDA ? 0 : k + (u >= 0.6 ? 1 : 0);
      let x = LX, y = hover, ab = 1, lleva = false, mx = 0, my = 0;
      if (gg >= SALIDA) {
        if (u < 0.12) { y = K.mez(hover, grab, K.suave(u / 0.12)); }
        else if (u < 0.2) { const t = (u - 0.12) / 0.08; y = K.mez(grab, hover, K.suave(t)); ab = 1 - K.lim(t * 3); lleva = true; }
        else if (u < 0.55) { const t = K.suave((u - 0.2) / 0.35); x = K.mez(LX, RX, t); y = hover - 30 * Math.sin(Math.PI * t); ab = 0; lleva = true;
          if (!arrugado) { mx = 5 * Math.sin(u * 60); my = 3 * Math.sin(u * 45); } }
        else if (u < 0.6) { x = RX; y = K.mez(hover, hover + 40, K.suave((u - 0.55) / 0.05)); ab = 0; lleva = true; }
        else if (u < 0.65) { x = RX; y = hover + 40; ab = K.lim((u - 0.6) / 0.03); }
        else { const t = K.suave((u - 0.65) / 0.35); x = K.mez(RX, LX, t); y = hover + 40 * (1 - t) - 25 * Math.sin(Math.PI * t); }
      }
      pinza.setAttribute("transform", `translate(${f1(x)} ${f1(y)})`);
      izq.setAttribute("transform", `translate(${f1(-22 - 14 * ab)} 0) rotate(14)`);
      der.setAttribute("transform", `translate(${f1(22 + 14 * ab)} 0) rotate(-14)`);
      // las canicas: en el bote de la izquierda, la que va en los dedos, la que cae y las del bote de la derecha
      const enMano = lleva ? 1 : 0;
      bolas.forEach((b, n) => {
        let p;
        if (n < hechos) p = sitio(RX, n);
        else if (n === hechos && enMano) p = [x + mx, y + 22 + my];
        else if (n === hechos && u >= 0.6 && u < 0.7 && gg >= SALIDA) { const t = K.entra(K.lim((u - 0.6) / 0.1)), s = sitio(RX, n); p = [s[0], K.mez(hover + 62, s[1], t)]; }
        else p = sitio(LX, 10 - n);
        b.setAttribute("transform", `translate(${f1(p[0])} ${f1(p[1])})`);
      });
      num.textContent = hechos;
    };
  };
  const lisos = carril(842, P_LISOS, false, 0), arribaG = sv.lastChild, arrugados = carril(1276, P_ARRUGADOS, true, 3);
  const premio = K.crear(d, `<div class="c-etq v g"><b>+12 %</b> más rápido<small>Kareklas y otros, Univ. de Newcastle, 2013</small></div>`);
  return (g) => {
    const dentro = K.sale(K.tramo(g, 31.94, 32.3)), fuera = K.suave(K.tramo(g, 39.48, 39.85));
    if (dentro <= 0 || fuera >= 1) { d.style.display = "none"; return; }
    d.style.display = "block";
    d.style.transform = `translateX(${f1(1080 * (1 - dentro) - 1080 * fuera)}px)`;
    lisos(g); arrugados(g);
    arribaG.style.opacity = 1 - 0.7 * K.sale(K.tramo(g, T.doce, T.doce + 0.35));
    const on = K.sale(K.tramo(g, T.doce, T.doce + 0.35));
    premio.style.opacity = on;
    const w = premio.offsetWidth, h = premio.offsetHeight;
    premio.style.transform = `translate(${f1(490 - w / 2)}px, ${f1(790 - h / 2 + (1 - on) * 24)}px) scale(${f1(0.85 + 0.15 * on)})`;
  };
}

// ── el vaho que sube (pantalla) ─────────────────────────────────────────────────────────────────────────────────
function vaho(cont) {
  const r = K.azar(9), ps = [];
  for (let i = 0; i < 12; i++) {
    const s = 160 + r() * 260;
    ps.push({ e: K.crear(cont, `<div class="c-vaho" style="width:${s}px;height:${s}px"></div>`), s, x: r() * 1080, f: r(), a: 0.5 + r() * 0.5, w: r() * 6.28 });
  }
  return (g) => ps.forEach((p) => {
    const u = (ciclo(g, 0.048) + p.f) % 1;
    p.e.style.transform = `translate(${f1(p.x - p.s / 2 + 50 * Math.sin(vuelta(g, 0.048) + p.w))}px, ${f1(1750 - u * 1350 - p.s / 2)}px)`;
    p.e.style.opacity = f1(p.a * Math.sin(Math.PI * u));
  });
}

// ── las etiquetas (en pantalla, sujetas a un punto del mundo o a un sitio fijo) ─────────────────────────────────
function etiqueta(cont, html, clase = "") { return K.crear(cont, `<div class="c-etq ${clase}">${html}</div>`); }
function pon(e, sx, sy, on, dy = 24) {
  if (on <= 0.001) { e.style.opacity = 0; return; }
  const w = e.offsetWidth, h = e.offsetHeight;
  const x = Math.min(Math.max(sx, 40 + w / 2), 950 - w / 2), y = Math.min(Math.max(sy, 560 + h / 2), 1440 - h / 2);
  e.style.opacity = on;
  e.style.transform = `translate(${f1(x - w / 2)}px, ${f1(y - h / 2 + (1 - on) * dy)}px) scale(${f1(0.9 + 0.1 * on)})`;
}
const tacha = (e, g, t) => { e.querySelector(".tacha").style.transform = `scaleX(${K.sale(K.tramo(g, t, t + 0.3))})`; };

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on, tch) => L.push({ e: etiqueta(capa, html + (tch ? `<i class="tacha"></i>` : ""), clase), sitio, on, tch });
  // hook
  r(`por el agua`, "g", () => [540, 1370], (g) => asoma(g, T.por, 2.45), T.agua + 0.02);
  // brazo
  r(`¿también el <b>brazo</b>?`, "r", (k) => pantalla(k, 570, 2230), (g) => asoma(g, T.brazo, 6.55), T.solo);
  r(`solo las <b>yemas</b>`, "c g", (k) => { const [x, y] = pantalla(k, 480, 720); return [x, y - 40]; }, (g) => asoma(g, T.yemas, 8.25));
  // nervio
  r(`<b>nervio</b>`, "o", (k) => { const [x, y] = pantalla(k, 640, 1120); return [x + 150, y]; }, (g) => asoma(g, T.nervio, 10.0));
  r(`<b>roto</b>`, "r", (k) => { const [x, y] = pantalla(k, 640, CORTE_Y); return [x + 190, y]; }, (g) => asoma(g, T.roto, 12.0));
  r(`<b>liso</b>`, "g", (k) => { const [x, y] = pantalla(k, 640, 880); return [x + 190, y]; }, (g) => asoma(g, T.liso, 13.4));
  r(`el agua`, "g", () => [540, 1370], (g) => asoma(g, T.no, 15.0), T.agua2);
  r(`<b>sistema nervioso</b>`, "o g", () => [540, 1330], (g) => asoma(g, T.sistema, 16.95));
  r(`<b>a propósito</b>`, "o g", () => [540, 1330], (g) => asoma(g, T.proposito, 18.15));
  // dentro
  r(`<b>vasos</b> de sangre`, "r", () => [540, 1390], (g) => asoma(g, T.vasos - 0.15, 22.1));
  r(`<b>menos</b> sangre`, "r", () => [540, 1390], (g) => asoma(g, T.menos, 23.45));
  r(`se <b>deshincha</b>`, "c", () => [540, 1390], (g) => asoma(g, T.deshincha, 25.3));
  r(`<b>surcos</b>`, "c g", () => [540, 1390], (g) => asoma(g, T.surcos, 27.4));
  // rueda
  r(`neumático <b>de lluvia</b>`, "c", () => [770, 610], (g) => asoma(g, T.neumatico, 31.85));
  r(`<b>no patina</b>`, "v", () => [770, 1400], (g) => asoma(g, T.patinar, 31.85));
  // cierre
  r(`por el agua`, "g", () => [540, 1250], (g) => asoma(g, T.por2, 41.72), T.agua4);
  r(`<b>para</b> el agua`, "c g", () => [540, 1385], (g) => asoma(g, T.para, 41.72));
  return (g, k) => L.forEach((l) => {
    const [x, y] = l.sitio(k);
    pon(l.e, x, y, l.on(g));
    if (l.tch) tacha(l.e, g, l.tch);
  });
}

// ── lo que tiene cada escena, por capas: el fondo, el mundo, el vaho, la viñeta, la sombra de arriba y la pantalla ─
export function montaje(esc) {
  estilos();
  PRE = `c${++escenas}-`;
  K.crear(esc, `<div class="c-fondo"></div>`);
  const mundo = K.crear(esc, `<div class="c-mundo"></div>`);
  const sv = K.crear(mundo, ids(`<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">${DEFS}<g class="c-cam"></g></svg>`));
  const defs = sv.querySelector("defs"), cam = sv.querySelector(".c-cam");
  el(cam, "rect", { x: -3000, y: -2000, width: 7000, height: 7500, fill: `url(#${PRE}azulejo)` });
  el(cam, "ellipse", { cx: 480, cy: 1250, rx: 1500, ry: 1700, fill: `url(#${PRE}luz)` });
  el(cam, "ellipse", { cx: 530, cy: 1700, rx: 650, ry: 1300, fill: `url(#${PRE}sombra)` });
  // el antebrazo y la palma
  el(cam, "path", { d: "M398 1830 L722 1830 C736 2200 742 2600 752 3100 L376 3100 C384 2600 390 2200 398 1830 Z", fill: `url(#${PRE}piel)` });
  el(cam, "path", { d: "M286 1300 L772 1305 C792 1500 764 1700 722 1868 L398 1868 C350 1760 270 1620 262 1480 C258 1400 270 1340 286 1300 Z", fill: `url(#${PRE}palma)` });
  const rayas = el(cam, "g", { fill: "none", stroke: "rgba(128,62,42,0.4)", "stroke-width": 4.5, "stroke-linecap": "round" });
  ["M330 1430 C430 1405 580 1410 760 1440", "M318 1505 C420 1488 530 1525 650 1575", "M392 1440 C360 1560 384 1712 474 1832", "M410 1862 Q560 1880 712 1862", "M420 1896 Q560 1912 706 1896"]
    .forEach((d) => el(rayas, "path", { d }));
  const dedos = DEDOS.map((f, i) => dedo(cam, f, i, defs));
  const extra = brazoExtra(cam);
  const nv = nervios(cam);
  const go = gota(cam);
  const vh = vaho(esc);
  K.crear(esc, `<div class="c-vineta"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const ru = rueda(capa), ca = carrera(capa), ro = rotulos(capa);
  return { cam, dedos, extra, nv, go, vh, ru, ca, ro };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los 0,3 s en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    E.cam.setAttribute("transform", `translate(${(540 - k.x * k.z).toFixed(2)} ${(1000 - k.y * k.z).toFixed(2)}) scale(${k.z.toFixed(4)})`);
    E.dedos.forEach((d) => d(g));
    E.extra(g);
    E.nv(g, k);
    E.go(g);
    E.vh(g);
    E.ru(g);
    E.ca(g);
    E.ro(g, k);
    return { g, k };
  };
  return E;
}
