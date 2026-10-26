// Lo que sale en todas las escenas: una cocina a oscuras con una tabla de madera; en la tabla, una cebolla con un
// cuchillo de cocina hundido en ella; encima, un ojo enorme que llora, con la mira roja de un francotirador. Al cortar,
// la cebolla lanza una niebla de gotitas hacia el ojo. Dentro del corte, al microscopio, sus células: el azufre en oro,
// la enzima en cian y el gas que fabrican en verde. Los nervios del ojo, en rojo; las lágrimas, en cian claro. Todo en
// 2D, con la cámara dentro del svg (un transform del grupo).
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", NARANJA = "#ff8a3d";
export const F0 = { x: 540, y: 1000, z: 1 };                  // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma empalma con el primero.
export const TOTAL = 41.73;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const pico = (g, t, sub = 0.08, baja = 0.5) => K.sale(K.tramo(g, t, t + sub)) * (1 - K.suave(K.tramo(g, t + sub, t + baja)));

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, celula: 8.11, ojo: 18.93, camara: 23.17, cuchillos: 30.72, cierre: 35.94 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  cebolla: 0.88, disparando: 2.68, entera: 3.54, nada: 4.58, arma: 6.22, fabrica: 6.5, cortas: 7.5,
  celula: 8.44, separado: 9.32, azufre: 10.52, enzima: 11.28, cuchillo: 12.16, romperla: 12.92, mezcla: 13.96,
  segundos: 14.7, fabrican: 15.26, gas: 15.78, antes: 16.22, sube: 17.72, ojos: 18.44,
  nervios: 19.26, detectan: 20.24, suelta: 21.52, lagrimas: 21.96, lavarlo: 22.6,
  cornell: 23.42, camara: 24.54, superlenta: 24.94, cada: 26.1, lanza: 26.82, nube: 27.34, sube2: 28.38, sesenta: 28.94,
  salen: 31.34, rapido: 32.06, cuchillo2: 33.26, sin: 33.66, deprisa: 34.94,
  afila: 36.46, corta: 37.74, despacio: 38.18, asi: 39.18, casi: 40.09, dispararte: 40.78,
};

// ── lo que pasa en cada momento ───────────────────────────────────────────────────────────────────────────────────
// el filo del cuchillo grande (su y en el mundo): a media cebolla en el fotograma 0 y en el último
const filo = (g) => 1230 + 25 * sube(g, 0.3, 2.6) + 60 * K.sale(K.tramo(g, T.disparando - 0.06, T.disparando + 0.1))
  - 345 * sube(g, 3.6, 4.2) + 345 * K.entra(K.tramo(g, T.cortas - 0.22, T.cortas))
  - 340 * sube(g, 24.0, 24.8) + 410 * K.suave(K.tramo(g, T.cada, 29.8)) - 410 * sube(g, 31.0, 31.6)
  + 230 * K.suave(K.tramo(g, T.corta, 39.7));
// lo abierto del ojo (1, del todo; menos, entornado); lo rojo; las lágrimas; la mira
const abierto = (g) => 0.72 + 0.28 * sube(g, 3.6, 4.2) - 0.45 * pico(g, T.disparando + 0.04, 0.08, 0.7) - 0.4 * pico(g, T.cortas, 0.06, 0.5)
  - 0.42 * sube(g, T.detectan + 0.05, T.detectan + 0.45) + 0.27 * sube(g, 22.7, 23.3) - 0.13 * sube(g, 40.6, 41.3);
const rojez = (g) => 0.55 - 0.55 * sube(g, 3.6, 4.4) + sube(g, T.detectan, T.detectan + 0.6) - 0.6 * sube(g, 22.8, 23.6) + 0.15 * sube(g, 40.6, 41.3);
const llanto = (g) => 1 - sube(g, 3.6, 4.4) + sube(g, T.lagrimas - 0.1, T.lagrimas + 0.4) - 0.6 * sube(g, 23.2, 24.0) + 0.6 * sube(g, 40.6, 41.4);
const mira = (g) => 1 - sube(g, 3.55, 3.95) + sube(g, T.dispararte - 0.1, T.dispararte + 0.35);
const micro = (g) => sube(g, 8.55, 9.1) - sube(g, T.sube, T.sube + 0.5);              // la lente del microscopio
const nervioOn = (g) => sube(g, T.nervios - 0.05, T.nervios + 0.6) - sube(g, 23.0, 23.5);
const glandula = (g) => sube(g, T.suelta - 0.1, T.suelta + 0.3) - sube(g, 22.9, 23.4);
const visor = (g) => sube(g, 23.25, 23.65) - sube(g, 30.3, 30.6);
const regla = (g) => sube(g, T.sube2 - 0.1, T.sube2 + 0.35) - sube(g, 30.35, 30.65);
const lupas = (g, i) => sube(g, i ? T.sin - 0.1 : T.cuchillo2 - 0.1, (i ? T.sin : T.cuchillo2) + 0.3) - sube(g, 35.6, 35.95);
const brilloFilo = (g) => K.tramo(g, T.afila - 0.05, T.afila + 0.55);

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0b0e12; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(6,8,10,0) 55%, rgba(6,8,10,0.6) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(10,13,16,0.96) 0, rgba(10,13,16,0.86) 300px, rgba(10,13,16,0.55) 470px, rgba(10,13,16,0) 630px); }
.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(12,15,19,0.88); border: 2px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 10px 24px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.45); opacity: 0; text-align: center; }
.c-etq b { font-weight: 800; }
.c-etq.c b { color: ${CIAN}; } .c-etq.o b { color: ${ORO}; } .c-etq.r b { color: ${ROJO}; } .c-etq.v b { color: ${VERDE}; } .c-etq.n b { color: ${NARANJA}; }
.c-etq.c { border-color: rgba(95,212,255,0.45); } .c-etq.o { border-color: rgba(255,194,74,0.5); } .c-etq.r { border-color: rgba(240,68,90,0.5); } .c-etq.v { border-color: rgba(34,211,138,0.5); } .c-etq.n { border-color: rgba(255,138,61,0.5); }
.c-etq.g { font-size: 56px; padding: 12px 30px; }
.c-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }
.c-visor { position: absolute; left: 50px; top: 560px; width: 980px; height: 880px; opacity: 0; pointer-events: none; }
.c-visor i { position: absolute; width: 90px; height: 90px; border: 0 solid rgba(255,255,255,0.85); }
.c-visor i.a { left: 0; top: 0; border-left-width: 6px; border-top-width: 6px; border-radius: 14px 0 0 0; }
.c-visor i.b { right: 0; top: 0; border-right-width: 6px; border-top-width: 6px; border-radius: 0 14px 0 0; }
.c-visor i.c { left: 0; bottom: 0; border-left-width: 6px; border-bottom-width: 6px; border-radius: 0 0 0 14px; }
.c-visor i.d { right: 0; bottom: 0; border-right-width: 6px; border-bottom-width: 6px; border-radius: 0 0 14px 0; }
.c-visor .rec { position: absolute; left: 40px; top: 34px; font-family: var(--letra), sans-serif; font-weight: 800; font-size: 38px; color: #fff;
  background: rgba(12,15,19,0.7); border-radius: 12px; padding: 4px 16px; }
.c-visor .rec b { color: ${ROJO}; }
.c-visor .tc { position: absolute; right: 40px; top: 34px; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 36px; color: #e8edf2;
  background: rgba(12,15,19,0.7); border-radius: 12px; padding: 4px 16px; font-variant-numeric: tabular-nums; }
.c-visor .lento { position: absolute; right: 40px; bottom: 34px; font-family: var(--letra), sans-serif; font-weight: 800; font-size: 36px; color: ${CIAN};
  background: rgba(12,15,19,0.7); border-radius: 12px; padding: 4px 16px; }
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
// el centro de la lente del microscopio, dentro del corte; lo de dentro se dibuja a escala de pantalla (z = 6)
const MC = [540, 1290], MZ = 6;
const enMundo = (lx, ly) => [MC[0] + lx / MZ, MC[1] + ly / MZ];
// los dos cuchillos pequeños de la comparación
const CA = 2110, CB = 2590, CY = 1305;
const CAMINO = [
  [0, F0], [2.55, { x: 540, y: 975, z: 1.07 }], [3.5, { x: 540, y: 985, z: 1.04 }],    // la ráfaga
  [5.2, { x: 540, y: 1010, z: 0.98 }], [7.3, { x: 540, y: 1040, z: 1.02 }],              // entera
  [7.95, { x: 540, y: 1200, z: 1.7 }], [9.2, { x: MC[0], y: MC[1], z: MZ }],             // el corte; dentro
  [12.0, { x: MC[0], y: MC[1] - 3, z: 6.25 }], [14.3, { x: MC[0], y: MC[1], z: 5.7 }], [17.4, { x: MC[0], y: MC[1] - 12, z: 5.1 }],
  [18.6, { x: 540, y: 880, z: 1.15 }], [19.35, { x: 540, y: 705, z: 2.05 }],              // el gas sube al ojo
  [22.8, { x: 548, y: 715, z: 2.2 }], [24.0, { x: 540, y: 1000, z: 1.0 }],                // el ojo
  [28.2, { x: 540, y: 1050, z: 1.04 }], [29.1, { x: 560, y: 940, z: 0.9 }], [30.4, { x: 560, y: 945, z: 0.91 }], // la cámara lenta
  [31.0, { x: 2350, y: 1130, z: 1.08 }], [35.55, { x: 2350, y: 1125, z: 1.1 }],           // los dos cuchillos
  [36.3, { x: 620, y: 1120, z: 1.3 }], [38.9, { x: 600, y: 1130, z: 1.32 }],               // afila, despacio
  [40.3, { x: 540, y: 1010, z: 1.02 }], [TOTAL, F0],
];
export const camaraEn = (g) => camara(g, CAMINO);

// ── svg ─────────────────────────────────────────────────────────────────────────────────────────────────────────
function el(padre, tag, at = {}) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, typeof at[k] === "string" ? at[k].replace("url(#c-", `url(#${PRE}`) : at[k]);
  padre.appendChild(e);
  return e;
}
// cada escena tiene su propio svg en el mismo documento: sus id llevan el número de la escena
let PRE = "c-", escenas = 0;
const ids = (html) => html.replace(/id="c-/g, `id="${PRE}`).replace(/url\(#c-/g, `url(#${PRE}`);
const f1 = (v) => v.toFixed(1);
// una curva suave que pasa por los puntos (Catmull-Rom); cerrada, si se pide
function curva(P, cerrada = false) {
  const n = P.length, q = (i) => (cerrada ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f1(P[0][0])} ${f1(P[0][1])}`;
  for (let i = 0; i < (cerrada ? n : n - 1); i++) {
    const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2);
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + (cerrada ? " Z" : "");
}
const show = (e, o) => e.setAttribute("opacity", f1(Math.max(0, Math.min(1, o))));

// ── el ojo, de frente, con su piel, la ceja y las pestañas ───────────────────────────────────────────────────────
export const OJO = [540, 690];
const ESQ_I = [305, 700], ESQ_E = [775, 688];                     // el lagrimal (a la izquierda) y el rabillo
const IRIS = [548, 700], R_IRIS = 82;
export const GLANDULA = [712, 598];
// el borde de arriba y el de abajo del ojo, según lo abierto que esté
const parpados = (a) => {
  const arriba = 118 * a, abajo = 64 * (0.75 + 0.25 * a);
  const sup = `M${ESQ_I[0]} ${ESQ_I[1]} C${ESQ_I[0] + 70} ${f1(ESQ_I[1] - arriba * 1.05)} ${ESQ_E[0] - 150} ${f1(ESQ_E[1] - arriba * 1.32)} ${ESQ_E[0]} ${ESQ_E[1]}`;
  const inf = `C${ESQ_E[0] - 110} ${f1(ESQ_E[1] + abajo * 1.2)} ${ESQ_I[0] + 120} ${f1(ESQ_I[1] + abajo * 1.3)} ${ESQ_I[0]} ${ESQ_I[1]}`;
  return { sup, inf, arriba, abajo };
};
// un punto del párpado de arriba (u de 0 a 1, del lagrimal al rabillo)
function bezier(p0, p1, p2, p3, u) {
  const v = 1 - u;
  return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]];
}
const supEn = (a, u) => { const ar = 118 * a; return bezier(ESQ_I, [ESQ_I[0] + 70, ESQ_I[1] - ar * 1.05], [ESQ_E[0] - 150, ESQ_E[1] - ar * 1.32], ESQ_E, u); };
const infEn = (a, u) => { const ab = 64 * (0.75 + 0.25 * a); return bezier(ESQ_I, [ESQ_I[0] + 120, ESQ_I[1] + ab * 1.3], [ESQ_E[0] - 110, ESQ_E[1] + ab * 1.2], ESQ_E, u); };

// los nervios de la córnea: entran por el borde del iris y van hacia el centro, con una rama cada uno
const NERVIOS = Array.from({ length: 11 }, (_, i) => {
  const r = K.azar(40 + i), a0 = (i / 11) * Math.PI * 2 + r() * 0.3, P = [];
  for (let j = 0; j <= 5; j++) {
    const rr = 128 - j * 19, a = a0 + j * 0.16 + (r() - 0.5) * 0.12;
    P.push([IRIS[0] + Math.cos(a) * rr, IRIS[1] + Math.sin(a) * rr * 0.92]);
  }
  const b = P[2], ab = a0 + 0.9;
  const R = [b, [b[0] + Math.cos(ab) * 22, b[1] + Math.sin(ab) * 20], [b[0] + Math.cos(ab + 0.3) * 40, b[1] + Math.sin(ab + 0.3) * 36]];
  return { P, R };
});
// donde se posan las moléculas del gas, sobre la córnea
const POSA = Array.from({ length: 13 }, (_, i) => {
  const r = K.azar(70 + i), a = i * 2.4, rr = 22 + 88 * Math.sqrt((i + 0.5) / 13);
  return [IRIS[0] + Math.cos(a) * rr + (r() - 0.5) * 10, IRIS[1] + Math.sin(a) * rr * 0.75 + (r() - 0.5) * 8, r()];
});

function ojo(cam) {
  const g = el(cam, "g");
  el(g, "ellipse", { cx: 540, cy: 720, rx: 720, ry: 330, fill: "url(#c-piel)" });
  el(g, "ellipse", { cx: 540, cy: 705, rx: 330, ry: 175, fill: "url(#c-cuenca)" });
  // la ceja
  const ceja = el(g, "g", { fill: "none", stroke: "#3a261c", "stroke-linecap": "round" });
  const rc = K.azar(3);
  for (let i = 0; i < 44; i++) {
    const u = i / 43, x = 300 + u * 470, y = 548 - 30 * Math.sin(Math.PI * Math.min(1, u * 1.15)) + (rc() - 0.5) * 10;
    el(ceja, "path", { d: `M${f1(x)} ${f1(y + 10)} q${f1(18 + rc() * 10)} ${f1(-10 - rc() * 6)} ${f1(34 + rc() * 12)} ${f1(-8 + u * 10)}`, "stroke-width": f1(5 + rc() * 3), opacity: f1(0.6 + rc() * 0.4) });
  }
  // el ojo: lo blanco, lo rojo de la irritación, las venitas, el iris y la pupila, recortados por los párpados
  const clip = el(cam, "clipPath", { id: `${PRE}almendra` });
  const clipP = el(clip, "path", {});
  const dentro = el(g, "g", { "clip-path": "url(#c-almendra)" });
  el(dentro, "rect", { x: 280, y: 520, width: 520, height: 320, fill: "url(#c-blanco)" });
  const rojo = el(dentro, "rect", { x: 280, y: 520, width: 520, height: 320, fill: "url(#c-rojez)", opacity: 0 });
  const venas = el(dentro, "g", { fill: "none", stroke: "#d0384a", "stroke-linecap": "round", opacity: 0 });
  const rv = K.azar(8);
  for (let i = 0; i < 16; i++) {
    const izq = i % 2 === 0, x0 = izq ? 318 + rv() * 30 : 760 - rv() * 30, y0 = 670 + rv() * 60, P = [[x0, y0]];
    for (let j = 1; j < 5; j++) P.push([x0 + (izq ? 1 : -1) * j * (28 + rv() * 14), y0 + (rv() - 0.5) * 40]);
    el(venas, "path", { d: curva(P), "stroke-width": f1(1.8 + rv() * 1.8) });
  }
  const iris = el(dentro, "g");
  el(iris, "circle", { cx: IRIS[0], cy: IRIS[1], r: R_IRIS, fill: "url(#c-iris)" });
  const ri = K.azar(17), rayas = el(iris, "g", { stroke: "rgba(60,30,10,0.45)", "stroke-width": 2.2, "stroke-linecap": "round" });
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, r0 = 38 + ri() * 6, r1 = 74 + ri() * 6;
    el(rayas, "line", { x1: f1(IRIS[0] + Math.cos(a) * r0), y1: f1(IRIS[1] + Math.sin(a) * r0), x2: f1(IRIS[0] + Math.cos(a + 0.05) * r1), y2: f1(IRIS[1] + Math.sin(a + 0.05) * r1) });
  }
  el(iris, "circle", { cx: IRIS[0], cy: IRIS[1], r: R_IRIS, fill: "none", stroke: "#2a1608", "stroke-width": 6 });
  const pupila = el(iris, "circle", { cx: IRIS[0], cy: IRIS[1], r: 34, fill: "#07080a" });
  el(iris, "ellipse", { cx: IRIS[0] - 30, cy: IRIS[1] - 32, rx: 18, ry: 13, fill: "rgba(255,255,255,0.85)" });
  el(iris, "circle", { cx: IRIS[0] + 34, cy: IRIS[1] + 26, r: 6, fill: "rgba(255,255,255,0.5)" });
  // los nervios de la córnea (se dibujan en «nervios») y sus pulsos (en «detectan»)
  const ner = el(dentro, "g", { fill: "none", "stroke-linecap": "round" });
  const nervios = NERVIOS.map((n) => {
    const halo = el(ner, "path", { d: curva(n.P), stroke: "rgba(240,68,90,0.35)", "stroke-width": 9, opacity: 0 });
    const p = el(ner, "path", { d: curva(n.P), stroke: "#ff5a6c", "stroke-width": 3.2, opacity: 0 });
    const b = el(ner, "path", { d: curva(n.R), stroke: "#ff5a6c", "stroke-width": 2.4, opacity: 0 });
    const L = p.getTotalLength(), Lb = b.getTotalLength();
    [halo, p].forEach((e) => e.setAttribute("stroke-dasharray", `${f1(L)} ${f1(L)}`));
    b.setAttribute("stroke-dasharray", `${f1(Lb)} ${f1(Lb)}`);
    const pulso = el(ner, "circle", { r: 9, fill: "url(#c-punto-r)", opacity: 0 });
    return { halo, p, b, L, Lb, pulso };
  });
  // la película de lágrimas que cubre el ojo cuando llora
  const pelicula = el(dentro, "rect", { x: 280, y: 520, width: 520, height: 320, fill: "url(#c-pelicula)", opacity: 0 });
  const brilloP = el(dentro, "ellipse", { rx: 90, ry: 16, fill: "rgba(220,248,255,0.55)", opacity: 0 });
  const lagrimal = el(g, "ellipse", { cx: ESQ_I[0] + 16, cy: ESQ_I[1] + 2, rx: 16, ry: 11, fill: "#d98682" });
  // los párpados: la piel de encima y debajo del ojo, el borde, el pliegue y las pestañas
  const supPiel = el(g, "path", { fill: "url(#c-piel)" });
  const infPiel = el(g, "path", { fill: "url(#c-piel)" });
  const sombra = el(g, "path", { fill: "none", stroke: "rgba(90,40,28,0.35)", "stroke-width": 16, "stroke-linecap": "round" });
  const pliegue = el(g, "path", { fill: "none", stroke: "rgba(110,55,40,0.55)", "stroke-width": 5, "stroke-linecap": "round" });
  const borde = el(g, "path", { fill: "none", stroke: "#2c1810", "stroke-width": 7, "stroke-linecap": "round" });
  const bordeI = el(g, "path", { fill: "none", stroke: "rgba(150,70,60,0.8)", "stroke-width": 4, "stroke-linecap": "round" });
  const menisco = el(g, "path", { fill: "none", stroke: "rgba(200,245,255,0.9)", "stroke-width": 5, "stroke-linecap": "round", opacity: 0 });
  const pest = el(g, "g", { fill: "none", stroke: "#1c0f0a", "stroke-width": 4.5, "stroke-linecap": "round" });
  const PEST = Array.from({ length: 22 }, (_, i) => ({ e: el(pest, "path", {}), u: 0.08 + 0.86 * (i / 21), l: 26 + 14 * Math.sin(Math.PI * (i / 21)) }));
  // la glándula de las lágrimas, arriba en el rabillo, bajo la piel
  const gla = el(g, "g", { opacity: 0 });
  el(gla, "ellipse", { cx: GLANDULA[0], cy: GLANDULA[1], rx: 70, ry: 34, fill: "url(#c-punto-c)", transform: `rotate(-14 ${GLANDULA[0]} ${GLANDULA[1]})` });
  el(gla, "ellipse", { cx: GLANDULA[0], cy: GLANDULA[1], rx: 48, ry: 22, fill: "rgba(95,212,255,0.35)", stroke: CIAN, "stroke-width": 3.5, transform: `rotate(-14 ${GLANDULA[0]} ${GLANDULA[1]})` });
  // las lágrimas que asoman y ruedan por la mejilla
  const gotas = [0, 1, 2].map((i) => ({ e: el(g, "path", { fill: "url(#c-lagrima)", stroke: "rgba(230,250,255,0.8)", "stroke-width": 2, opacity: 0 }),
    reg: el(g, "path", { fill: "none", stroke: "rgba(170,230,255,0.35)", "stroke-width": 7, "stroke-linecap": "round", opacity: 0 }), u: [0.3, 0.48, 0.72][i], fase: [0.62, 0.15, 0.4][i], P: [3.3, 2.6, 3.7][i] }));
  // el chorro de la glándula hacia el ojo
  const chorros = [0, 1, 2].map(() => el(g, "path", { fill: "none", stroke: "rgba(170,235,255,0.75)", "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }));
  // las moléculas del gas que se posan en la córnea
  const posadas = POSA.map(() => molecula(g, 1));

  return (gg) => {
    const a = abierto(gg), P = parpados(a), ro = rojez(gg), ll = llanto(gg);
    clipP.setAttribute("d", `${P.sup} ${P.inf} Z`);
    show(rojo, ro);
    show(venas, ro * 1.1);
    // el iris mira un poco hacia abajo, a la cebolla, y se mueve apenas
    const mx = 4 * Math.sin(vuelta(gg, 0.21)), my = 10 * (1 - sube(gg, 18.6, 19.2) + sube(gg, 23.2, 23.9)) + 3 * Math.sin(vuelta(gg, 0.17));
    iris.setAttribute("transform", `translate(${f1(mx)} ${f1(my)})`);
    pupila.setAttribute("r", f1(34 - 6 * pico(gg, T.disparando + 0.04, 0.1, 0.9)));
    supPiel.setAttribute("d", `M${ESQ_I[0] - 60} ${ESQ_I[1] + 4} L${ESQ_I[0]} ${ESQ_I[1]} ${P.sup.slice(P.sup.indexOf("C"))} L${ESQ_E[0] + 60} ${ESQ_E[1] - 4} L${ESQ_E[0] + 40} 520 L${ESQ_I[0] - 40} 520 Z`);
    infPiel.setAttribute("d", `M${ESQ_E[0] + 60} ${ESQ_E[1] - 4} L${ESQ_E[0]} ${ESQ_E[1]} ${P.inf} L${ESQ_I[0] - 60} ${ESQ_I[1] + 4} L${ESQ_I[0] - 40} 860 L${ESQ_E[0] + 40} 860 Z`);
    const ar = P.arriba;
    pliegue.setAttribute("d", `M${ESQ_I[0] + 20} ${f1(ESQ_I[1] - 40 - ar * 0.6)} C${ESQ_I[0] + 110} ${f1(ESQ_I[1] - 70 - ar * 1.15)} ${ESQ_E[0] - 140} ${f1(ESQ_E[1] - 80 - ar * 1.3)} ${ESQ_E[0] - 20} ${f1(ESQ_E[1] - 34 - ar * 0.4)}`);
    borde.setAttribute("d", P.sup);
    sombra.setAttribute("d", P.sup);
    bordeI.setAttribute("d", `M${ESQ_E[0]} ${ESQ_E[1]} ${P.inf}`);
    menisco.setAttribute("d", `M${ESQ_E[0] - 20} ${ESQ_E[1] + 4} ${P.inf.replace(/^C[^C]*$/, (m) => m)}`);
    show(menisco, ll * 0.9);
    PEST.forEach((p) => {
      const [x, y] = supEn(a, p.u), [x2] = supEn(a, Math.min(1, p.u + 0.01)), ang = -Math.PI / 2 - (p.u - 0.5) * 1.2 - (x2 - x < 0 ? 0 : 0);
      const l = p.l * (0.75 + 0.25 * a);
      p.e.setAttribute("d", `M${f1(x)} ${f1(y)} q${f1(Math.cos(ang) * l * 0.4 - 8)} ${f1(Math.sin(ang) * l * 0.6)} ${f1(Math.cos(ang) * l - 6)} ${f1(Math.sin(ang) * l + 8)}`);
    });
    // los nervios
    const on = nervioOn(gg), dib = sube(gg, T.nervios - 0.05, T.nervios + 0.7);
    nervios.forEach((n, i) => {
      const k = K.lim(dib * 1.4 - (i / 11) * 0.4) * (on > 0.01 ? 1 : 0);
      n.p.setAttribute("stroke-dashoffset", f1(n.L * (1 - k))); n.halo.setAttribute("stroke-dashoffset", f1(n.L * (1 - k)));
      n.b.setAttribute("stroke-dashoffset", f1(n.Lb * (1 - K.lim(k * 2 - 1))));
      const fuego = K.lim((gg - T.detectan) / 0.2) * (1 - K.lim((gg - 21.6) / 0.4));
      show(n.p, on); show(n.b, on); show(n.halo, on * (0.35 + 0.65 * fuego));
      // los pulsos: del centro hacia fuera, una y otra vez mientras dura el aviso
      const u = ((gg - T.detectan) * 1.8 + i * 0.37) % 1;
      if (fuego > 0.01 && u >= 0) {
        const q = n.p.getPointAtLength((1 - u) * n.L);
        n.pulso.setAttribute("cx", f1(q.x)); n.pulso.setAttribute("cy", f1(q.y));
        show(n.pulso, fuego * Math.sin(Math.PI * u) * 1.3);
      } else show(n.pulso, 0);
    });
    // la película de lágrimas y su brillo
    show(pelicula, ll * 0.55);
    const bx = 400 + 260 * ((ciclo(gg, 0.25)) % 1);
    brilloP.setAttribute("cx", f1(bx)); brilloP.setAttribute("cy", f1(infEn(a, (bx - 305) / 470)[1] - 12));
    show(brilloP, ll * 0.8 * Math.sin(Math.PI * ((ciclo(gg, 0.25)) % 1)));
    lagrimal.setAttribute("fill", ro > 0.5 ? "#e0707a" : "#d98682");
    // la glándula y sus chorros
    const gl = glandula(gg);
    show(gla, gl * (0.75 + 0.25 * Math.sin(vuelta(gg, 1.6))));
    chorros.forEach((c, i) => {
      const u = ((gg - T.lagrimas) * 1.3 + i / 3) % 1, k = K.lim((gg - T.lagrimas + 0.05) / 0.2) * (1 - K.lim((gg - 22.95) / 0.3));
      if (k <= 0.01 || u < 0) { show(c, 0); return; }
      const x0 = GLANDULA[0] - 20 - i * 26, [xe, ye] = supEn(a, 0.82 - i * 0.12), [xi, yi] = infEn(a, 0.25 + i * 0.12);
      const y = ye + (yi - ye) * u, x = xe + (xi - xe) * u;
      c.setAttribute("d", `M${f1(x0 + (x - x0) * u * 0.5)} ${f1(GLANDULA[1] + (y - GLANDULA[1]) * u * 0.5)} Q${f1(xe)} ${f1(ye + 20)} ${f1(x)} ${f1(y)}`);
      show(c, k * Math.sin(Math.PI * u));
    });
    // las lágrimas que ruedan: asoman en el párpado de abajo y caen por la mejilla
    gotas.forEach((d) => {
      const u = (ciclo(gg, 1 / d.P) + d.fase) % 1, [x, y0] = infEn(a, d.u);
      const crece = K.sale(K.lim(u / 0.55)), cae = K.entra(K.lim((u - 0.55) / 0.45));
      const r = 9 + 9 * crece, y = y0 + 6 + r * 0.8 + cae * 250, op = ll * (1 - K.lim((u - 0.88) / 0.12));
      d.e.setAttribute("d", `M${f1(x)} ${f1(y - r * 1.9)} C${f1(x + r * 0.5)} ${f1(y - r)} ${f1(x + r)} ${f1(y - r * 0.2)} ${f1(x + r)} ${f1(y + r * 0.2)} A${f1(r)} ${f1(r)} 0 1 1 ${f1(x - r)} ${f1(y + r * 0.2)} C${f1(x - r)} ${f1(y - r * 0.2)} ${f1(x - r * 0.5)} ${f1(y - r)} ${f1(x)} ${f1(y - r * 1.9)} Z`);
      show(d.e, op);
      d.reg.setAttribute("d", `M${f1(x)} ${f1(y0 + 8)} L${f1(x + 2)} ${f1(y - r)}`);
      show(d.reg, op * K.lim(cae * 3));
    });
    // el gas: sube de la cebolla al ojo, se posa en la córnea y las lágrimas se lo llevan
    posadas.forEach((m, i) => {
      const [px, py, fr] = POSA[i], t0 = T.sube - 0.05 + i * 0.05, t1 = T.ojos + 0.05 + i * 0.03;
      const u = K.suave(K.tramo(gg, t0, t1)), lava = K.entra(K.tramo(gg, T.lavarlo - 0.05 + fr * 0.25, T.lavarlo + 0.55 + fr * 0.25));
      const sx = 470 + 140 * fr, sy = 1095, cx = (sx + px) / 2 + (fr - 0.5) * 260, cy = 900;
      let x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx + u * u * px, y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy + u * u * py;
      x += 3 * Math.sin(vuelta(gg, 0.7) + i) * u; y += 3 * Math.cos(vuelta(gg, 0.6) + i * 2) * u + lava * 150;
      const late = 1 + 0.35 * K.lim((gg - T.detectan) / 0.15) * (1 - K.lim((gg - 21.4) / 0.4)) * Math.max(0, Math.sin(vuelta(gg, 2) + i));
      m.e.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(gg * 60 + i * 40)}) scale(${f1(0.42 * late)})`);
      show(m.e, K.lim((gg - t0) / 0.15) * (1 - lava));
    });
  };
}

// una molécula del gas: un átomo grande y dos pequeños, en verde
function molecula(padre, op = 0) {
  const e = el(padre, "g", { opacity: op ? 0 : 0 });
  el(e, "circle", { r: 34, fill: "url(#c-punto-v)" });
  el(e, "circle", { cx: 22, cy: -12, r: 10, fill: "#b8f5d8" });
  el(e, "circle", { cx: -20, cy: 14, r: 9, fill: "#b8f5d8" });
  el(e, "circle", { r: 15, fill: VERDE, stroke: "#e2fff1", "stroke-width": 2.5 });
  return { e };
}

// ── la cebolla, con su piel dorada, sus vetas, el moño de arriba y las raíces ───────────────────────────────────
const BULBO = [[0, -178], [36, -164], [104, -134], [160, -76], [178, -4], [166, 66], [124, 122], [62, 154], [0, 162], [-62, 154], [-124, 122], [-166, 66], [-178, -4], [-160, -76], [-104, -134], [-36, -164]];
function cebolla(padre, x, y, s, n) {
  const g = el(padre, "g", { transform: `translate(${x} ${y}) scale(${s})` });
  el(g, "ellipse", { cx: 0, cy: 160, rx: 190, ry: 18, fill: "rgba(0,0,0,0.45)" });
  const raices = el(g, "g", { fill: "none", stroke: "#d9c39a", "stroke-width": 3, "stroke-linecap": "round", opacity: 0.8 });
  [-34, -18, -4, 10, 24, 38].forEach((dx, i) => el(raices, "path", { d: `M${dx * 0.5} 158 q${dx * 0.6} ${6 + (i % 2) * 4} ${dx * 1.3} ${2 + (i % 3) * 3}` }));
  const cuerpo = el(g, "g");
  el(cuerpo, "path", { d: curva(BULBO, true), fill: "url(#c-cebolla)", stroke: "#6e3414", "stroke-width": 4 });
  const clip = el(padre, "clipPath", { id: `${PRE}bulbo${n}` });
  el(clip, "path", { d: curva(BULBO, true) });
  const vetas = el(cuerpo, "g", { "clip-path": `url(#${PRE}bulbo${n})`, fill: "none", stroke: "rgba(110,48,16,0.42)", "stroke-width": 3.5, "stroke-linecap": "round" });
  [-0.85, -0.6, -0.35, -0.12, 0.12, 0.35, 0.6, 0.85].forEach((k) => el(vetas, "path", { d: `M0 -176 C${f1(k * 250)} -120 ${f1(k * 250)} 110 0 160` }));
  el(vetas, "path", { d: "M-178 0 C-90 30 90 30 178 0", stroke: "rgba(255,220,160,0.12)", "stroke-width": 10 });
  el(cuerpo, "ellipse", { cx: -70, cy: -62, rx: 42, ry: 78, fill: "url(#c-brillo)", transform: "rotate(28 -70 -62)" });
  el(cuerpo, "path", { d: "M120 -100 C160 -50 170 20 150 80", fill: "none", stroke: "rgba(60,22,6,0.35)", "stroke-width": 16, "stroke-linecap": "round" });
  // el moño seco de arriba
  el(g, "path", { d: "M-20 -168 C-16 -200 -6 -220 4 -240 C8 -226 6 -214 14 -200 C22 -214 30 -222 36 -226 C30 -206 20 -186 20 -168 Z", fill: "#a8692e", stroke: "#6e3414", "stroke-width": 3 });
  el(g, "path", { d: "M-4 -172 C0 -196 4 -214 4 -236", fill: "none", stroke: "rgba(255,210,150,0.4)", "stroke-width": 3, "stroke-linecap": "round" });
  return { g, cuerpo };
}

// ── un cuchillo de cocina, de lado: el filo en y = 0, el talón en x = 0 y la punta a la izquierda ─────────────────
function cuchillo(padre, afilado, n) {
  const g = el(padre, "g");
  const HOJA = "M0 0 L-500 0 Q-590 -8 -640 -80 Q-560 -140 -440 -150 L0 -150 Z";
  el(g, "path", { d: HOJA, fill: "url(#c-acero)", stroke: "#56606a", "stroke-width": 3 });
  // el bisel del filo: fino y brillante en el bueno; ancho, gris y mellado en el romo
  if (afilado) el(g, "path", { d: "M0 0 L-500 0 Q-590 -8 -640 -80 Q-600 -46 -500 -26 L0 -26 Z", fill: "url(#c-bisel)" });
  else {
    el(g, "path", { d: "M0 0 L-500 0 Q-590 -8 -640 -80 Q-604 -52 -500 -34 L0 -34 Z", fill: "#7d868e" });
    const r = K.azar(31 + n);
    let d = "";
    for (let i = 0; i < 16; i++) { const x = -40 - i * 30 - r() * 12; d += `M${f1(x)} 1 q6 -${f1(6 + r() * 6)} 12 0 `; }
    el(g, "path", { d, fill: "#0b0e12", stroke: "#4c545b", "stroke-width": 2 });
  }
  el(g, "path", { d: "M-440 -146 L0 -146", stroke: "rgba(255,255,255,0.55)", "stroke-width": 4, "stroke-linecap": "round" });
  el(g, "path", { d: "M-480 -96 L-60 -96", stroke: "rgba(255,255,255,0.12)", "stroke-width": 16, "stroke-linecap": "round" });
  // la virola y el mango, con sus remaches
  el(g, "path", { d: "M-4 -150 L34 -150 L34 -40 Q20 -30 -4 -26 Z", fill: "url(#c-acero)", stroke: "#56606a", "stroke-width": 3 });
  el(g, "path", { d: "M34 -142 L270 -132 Q300 -128 302 -100 Q300 -66 270 -62 L34 -52 Z", fill: "url(#c-mango)", stroke: "#120c08", "stroke-width": 3 });
  [90, 160, 230].forEach((x) => el(g, "circle", { cx: x, cy: -97, r: 9, fill: "#c8ced4", stroke: "#56606a", "stroke-width": 2 }));
  el(g, "path", { d: "M44 -132 L262 -124", stroke: "rgba(255,255,255,0.18)", "stroke-width": 6, "stroke-linecap": "round" });
  // el destello que recorre el filo (en «afila»)
  const destello = afilado ? el(g, "g", { opacity: 0 }) : null;
  if (destello) {
    el(destello, "ellipse", { cx: 0, cy: -8, rx: 110, ry: 12, fill: "url(#c-destello)" });
    el(destello, "path", { d: "M0 -60 L7 -14 L50 -8 L7 -2 L0 44 L-7 -2 L-50 -8 L-7 -14 Z", fill: "#ffffff" });
  }
  return { g, destello };
}

// ── las gotitas que lanza la cebolla: tandas fijas en el tiempo, cada gota con su camino ─────────────────────────
// cada tanda: t0 (cuándo sale), x, y (de dónde), n, alto, dura (lo que tarda en subir), ancho, hacia (x a la que
// van), queda (lo que flotan antes de irse), estela, r (tamaño)
function tandas() {
  const L = [];
  // la niebla: sale sin parar mientras se corta (en el hook, al cortar despacio y antes de volver al principio)
  const niebla = (t) => (t < T.entera ? 1 : t > 37.9 && t < 40.5 ? 0.22 : t >= 40.5 ? Math.min(1, 0.22 + (t - 40.5) * 0.9) : 0);
  const r = K.azar(101);
  for (let t = 0; t < TOTAL; t += 0.07) if (r() < niebla(t)) L.push({ t0: t, x: 450, y: 1100, n: 1, alto: 300, dura: 1.9, ancho: 180, hacia: 540, queda: 0, r: 5, s: Math.floor(t * 100) });
  // la ráfaga de «disparando»: van como balas al ojo
  L.push({ t0: T.disparando - 0.04, x: 470, y: 1095, n: 24, alto: 380, dura: 0.34, ancho: 140, hacia: 548, queda: 0, estela: 1, r: 6, s: 7, bala: 1 });
  // la bocanada de «cortas»
  L.push({ t0: T.cortas, x: 420, y: 1100, n: 18, alto: 210, dura: 0.6, ancho: 260, hacia: 540, queda: 0, r: 5, s: 8 });
  // a cámara lenta: dos chorros y la nube que sube hasta 60 cm
  L.push({ t0: T.lanza, x: 500, y: 1100, n: 20, alto: 520, dura: 2.0, ancho: 50, hacia: 420, queda: 1.2, estela: 1, r: 9, s: 9, lento: 1 });
  L.push({ t0: T.lanza + 0.16, x: 560, y: 1100, n: 20, alto: 560, dura: 2.0, ancho: 50, hacia: 680, queda: 1.0, estela: 1, r: 9, s: 10, lento: 1 });
  L.push({ t0: T.nube, x: 440, y: 1100, n: 80, alto: 960, dura: 1.6, ancho: 220, hacia: 560, queda: 0.9, r: 8, s: 11, lento: 1, nube: 1 });
  // los dos cuchillos pequeños: el afilado (pocas, lentas) y el romo (muchas, rápidas, con estela)
  golpesA.forEach((t, i) => L.push({ t0: t + 0.35, x: CA - 70, y: CY - 120, n: 3, alto: 150, dura: 1.3, ancho: 140, hacia: CA, queda: 0, r: 4.5, s: 30 + i }));
  golpesB.forEach((t, i) => L.push({ t0: t + 0.12, x: CB - 70, y: CY - 120, n: 11, alto: 340, dura: 0.5, ancho: 160, hacia: CB, queda: 0, estela: 1, r: 5, s: 60 + i }));
  // al cortar despacio con el bueno: casi nada
  L.push({ t0: T.despacio + 0.3, x: 470, y: 1100, n: 3, alto: 120, dura: 1.4, ancho: 120, hacia: 540, queda: 0, r: 4.5, s: 90 });
  // cada gota con su camino
  const G = [];
  L.forEach((tn) => {
    const rr = K.azar(500 + tn.s * 7 + Math.round(tn.t0 * 10));
    for (let i = 0; i < tn.n; i++) {
      const x0 = tn.x + rr() * tn.ancho, alto = tn.nube ? (i < 10 ? tn.alto * (0.94 + 0.06 * rr()) : tn.alto * (0.3 + 0.62 * rr())) : tn.alto * (0.6 + 0.4 * rr());
      const tarde = tn.bala ? rr() * 0.12 : tn.nube ? (i < 10 ? rr() * 0.08 : rr() * 0.6) : tn.lento ? rr() * 0.45 : rr() * 0.08;
      const dura = tn.nube && i < 10 ? T.sesenta - T.nube - tarde : tn.dura * (0.8 + 0.4 * rr());
      const x1 = tn.bala ? POSA[i % POSA.length][0] + (rr() - 0.5) * 40 : tn.hacia + (x0 - tn.hacia) * (0.4 + 0.8 * rr()) + (rr() - 0.5) * 80;
      G.push({ t0: tn.t0 + tarde, x0, y0: tn.y + (rr() - 0.5) * 16, x1, alto, dura, queda: tn.queda * (0.6 + 0.8 * rr()), r: tn.r * (0.6 + 0.8 * rr()), estela: tn.estela, f: rr() * 6.28, bala: tn.bala });
    }
  });
  return G;
}
// los golpes de los cuchillos pequeños (el segundo en que empieza a bajar cada uno)
const golpesA = [31.0, 33.2, 35.35];
const golpesB = [];
for (let t = 31.0; t < T.deprisa - 0.3; t += 1.0) golpesB.push(t);
for (let t = T.deprisa - 0.15; t < 35.9; t += 0.36) golpesB.push(t);
// dónde está el filo de un cuchillo pequeño en g: baja en «baja» segundos y sube en «sube»
function golpeY(g, golpes, baja, subeT, arriba = 1150, abajo = 1414) {
  let s = null;
  for (const t of golpes) if (t <= g) s = t;
  if (s === null) return arriba;
  const u = g - s;
  if (u < baja) return arriba + (abajo - arriba) * K.suave(u / baja);
  return abajo - (abajo - arriba) * K.suave(K.lim((u - baja) / subeT));
}

function gotitas(padre) {
  const G = tandas();
  const N = 190;
  const pool = Array.from({ length: N }, () => ({ e: el(padre, "line", { stroke: "rgba(220,240,255,0.55)", "stroke-linecap": "round", opacity: 0 }), c: el(padre, "circle", { fill: "url(#c-gota)", opacity: 0 }) }));
  const donde = (d, u) => {
    const k = d.bala ? u : K.sale(u);
    return [d.x0 + (d.x1 - d.x0) * k, d.y0 - d.alto * k];
  };
  return (g) => {
    let j = 0;
    for (const d of G) {
      if (j >= N) break;
      // el mismo instante al final y al principio (lo que sale antes del final se ve en el fotograma 0)
      let tau = g - d.t0;
      if (tau < 0) tau += TOTAL;
      else if (tau > d.dura + d.queda + 0.8) tau -= TOTAL;
      const vida = d.dura + d.queda + 0.6;
      if (tau < 0 || tau > vida) continue;
      const u = K.lim(tau / d.dura);
      let [x, y] = donde(d, u);
      const flota = Math.max(0, tau - d.dura);
      x += 10 * Math.sin(d.f + tau * 2.2) * K.lim(u * 2); y += -16 * flota + 6 * Math.cos(d.f + tau * 1.7);
      const op = K.lim(tau / 0.12) * (1 - K.lim((tau - d.dura - d.queda) / 0.6)) * (d.bala ? 1 - K.lim((u - 0.92) / 0.08) : 1);
      const p = pool[j++];
      p.c.setAttribute("cx", f1(x)); p.c.setAttribute("cy", f1(y)); p.c.setAttribute("r", f1(d.r * 1.9)); show(p.c, op);
      if (d.estela && u < 1) {
        const [xa, ya] = donde(d, Math.max(0, u - (d.bala ? 0.35 : 0.12)));
        p.e.setAttribute("x1", f1(xa)); p.e.setAttribute("y1", f1(ya)); p.e.setAttribute("x2", f1(x)); p.e.setAttribute("y2", f1(y));
        p.e.setAttribute("stroke-width", f1(d.r * 1.3)); show(p.e, op * 0.8);
      } else show(p.e, 0);
    }
    for (; j < N; j++) { show(pool[j].c, 0); show(pool[j].e, 0); }
  };
}

// ── la mira roja sobre el ojo ───────────────────────────────────────────────────────────────────────────────────
function miraRoja(cam) {
  const g = el(cam, "g", { opacity: 0 });
  const giro = el(g, "g", { fill: "none", stroke: ROJO, "stroke-linecap": "round" });
  el(giro, "circle", { r: 150, "stroke-width": 6, "stroke-dasharray": "60 18.5" });
  el(giro, "circle", { r: 104, "stroke-width": 3, opacity: 0.6 });
  [0, 1, 2, 3].forEach((i) => {
    const a = i * Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
    el(giro, "line", { x1: f1(c * 120), y1: f1(s * 120), x2: f1(c * 186), y2: f1(s * 186), "stroke-width": 7 });
  });
  el(g, "circle", { r: 8, fill: ROJO });
  el(g, "circle", { r: 170, fill: "url(#c-mira)" });
  return (gg) => {
    const m = mira(gg), p = pico(gg, T.disparando, 0.08, 0.6);
    show(g, m * (0.85 + 0.15 * Math.sin(vuelta(gg, 1.2))));
    g.setAttribute("transform", `translate(${IRIS[0]} ${IRIS[1]}) scale(${f1(1 + 0.18 * p + 0.25 * (1 - m))})`);
    giro.setAttribute("transform", `rotate(${f1(360 * ciclo(gg, 0.06) + 30 * p)})`);
  };
}

// ── la tabla de madera ──────────────────────────────────────────────────────────────────────────────────────────
function tabla(cam) {
  const g = el(cam, "g");
  el(g, "rect", { x: -900, y: 1416, width: 4400, height: 130, rx: 10, fill: "url(#c-madera)" });
  el(g, "rect", { x: -900, y: 1416, width: 4400, height: 10, fill: "rgba(255,220,170,0.3)" });
  const r = K.azar(55), vetas = el(g, "g", { fill: "none", stroke: "rgba(70,36,14,0.45)", "stroke-width": 3 });
  for (let i = 0; i < 26; i++) {
    const x = -900 + r() * 4400, y = 1434 + r() * 90, l = 140 + r() * 300;
    el(vetas, "path", { d: `M${f1(x)} ${f1(y)} q${f1(l / 2)} ${f1((r() - 0.5) * 14)} ${f1(l)} 0` });
  }
  el(g, "rect", { x: -900, y: 1546, width: 4400, height: 40, fill: "#1a110b" });
}

// ── dentro del corte, al microscopio: las células de la cebolla (todo en unidades de pantalla, a z = 6) ────────────
const CELDA_W = 600, CELDA_H = 255;
const AZUFRE = Array.from({ length: 16 }, (_, i) => {
  const r = K.azar(200 + i), a = (i / 16) * Math.PI * 2 + 0.2, x = Math.cos(a) * (250 + r() * 14), y = Math.sin(a) * (98 + r() * 8);
  const mx = (r() - 0.5) * 460, my = (r() - 0.5) * 170;
  return { x, y, mx, my, t: T.segundos + 0.05 + ((i * 7) % 16) * 0.1, f: r() };
});
const ENZIMA = Array.from({ length: 7 }, (_, i) => {
  const r = K.azar(300 + i), a = (i / 7) * Math.PI * 2, x = Math.cos(a) * 140 * (0.6 + 0.4 * r()), y = Math.sin(a) * 40;
  return { x, y, mx: (r() - 0.5) * 420, my: (r() - 0.5) * 160, f: r() };
});
const GAS_EXTRA = Array.from({ length: 22 }, (_, i) => {
  const r = K.azar(400 + i);
  return { x: (r() < 0.5 ? -1 : 1) * (40 + r() * 230), y: (r() - 0.5) * 220, t: T.fabrican + 0.1 + i * 0.07 + r() * 0.1, f: r() };
});
function celdaSvg(padre, x, y, heroe) {
  const g = el(padre, "g", { transform: `translate(${f1(x)} ${f1(y)})` });
  el(g, "rect", { x: -CELDA_W / 2, y: -CELDA_H / 2, width: CELDA_W, height: CELDA_H, rx: 80, fill: heroe ? "url(#c-celda-h)" : "url(#c-celda)", stroke: heroe ? "#f2e2a8" : "rgba(230,214,160,0.5)", "stroke-width": heroe ? 12 : 9 });
  const vac = el(g, "ellipse", { cx: 0, cy: 0, rx: 205, ry: 72, fill: heroe ? "url(#c-vacuola)" : "rgba(95,212,255,0.07)", stroke: heroe ? CIAN : "rgba(95,212,255,0.3)", "stroke-width": heroe ? 5 : 3 });
  if (!heroe) {
    const r = K.azar(Math.round(x * 3 + y));
    for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28 + r(); el(g, "circle", { cx: f1(Math.cos(a) * 250), cy: f1(Math.sin(a) * 98), r: 8, fill: "rgba(255,194,74,0.45)" }); }
    for (let i = 0; i < 4; i++) el(g, "circle", { cx: f1((r() - 0.5) * 260), cy: f1((r() - 0.5) * 60), r: 9, fill: "rgba(95,212,255,0.4)" });
  }
  return { g, vac };
}
// una enzima: un comecocos cian
const comecocos = (abre) => {
  const a = abre * 0.9, r = 26;
  return `M0 0 L${f1(Math.cos(a) * r)} ${f1(-Math.sin(a) * r)} A${r} ${r} 0 1 0 ${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)} Z`;
};
function microscopio(cam) {
  const g = el(cam, "g", { opacity: 0, transform: `translate(${MC[0]} ${MC[1]}) scale(${1 / MZ})` });
  const clip = el(cam, "clipPath", { id: `${PRE}lente` });
  el(clip, "circle", { r: 1500 });
  const d = el(g, "g", { "clip-path": "url(#c-lente)" });
  el(d, "circle", { r: 1500, fill: "url(#c-micro)" });
  // las otras células, como ladrillos
  for (let j = -5; j <= 5; j++) for (let i = -3; i <= 3; i++) {
    const x = i * (CELDA_W + 22) + (j % 2 ? (CELDA_W + 22) / 2 : 0), y = j * (CELDA_H + 22);
    if (j === 0 && i === 0) continue;
    celdaSvg(d, x, y, false);
  }
  // la célula de la que se habla, en dos mitades (el cuchillo la parte por x = 0)
  const mitades = [-1, 1].map((lado) => {
    const c = el(cam, "clipPath", { id: `${PRE}mitad${lado > 0 ? 1 : 0}` });
    el(c, "rect", { x: lado < 0 ? -400 : 0, y: -300, width: 400, height: 600 });
    const m = el(d, "g", {});
    const dentro = el(m, "g", { "clip-path": `url(#${PRE}mitad${lado > 0 ? 1 : 0})` });
    const cs = celdaSvg(dentro, 0, 0, true);
    return { m, vac: cs.vac, lado };
  });
  const brillo = el(d, "ellipse", { rx: 225, ry: 90, fill: "none", stroke: "#bff0ff", "stroke-width": 10, opacity: 0 });
  // lo de dentro: el azufre (oro), las enzimas (cian) y el gas (verde)
  const parts = el(d, "g");
  const az = AZUFRE.map(() => ({ o: el(parts, "g"), v: molecula(parts) }));
  az.forEach((a) => { el(a.o, "circle", { r: 30, fill: "url(#c-punto-o)" }); el(a.o, "circle", { r: 12, fill: ORO, stroke: "#fff3cf", "stroke-width": 2.5 }); });
  const en = ENZIMA.map(() => el(parts, "path", { fill: CIAN, stroke: "#dff7ff", "stroke-width": 3 }));
  const extra = GAS_EXTRA.map(() => molecula(parts));
  // el cuchillo, a esta escala: una cuña de acero
  const cuna = el(d, "g", { opacity: 0 });
  el(cuna, "path", { d: "M-70 -1700 L70 -1700 L70 -300 L0 0 L-70 -300 Z", fill: "url(#c-acero-v)", stroke: "#56606a", "stroke-width": 4 });
  el(cuna, "path", { d: "M0 -1700 L0 0", stroke: "rgba(255,255,255,0.7)", "stroke-width": 4 });
  el(d, "circle", { r: 1500, fill: "none", stroke: "rgba(200,232,255,0.4)", "stroke-width": 40 });
  el(d, "circle", { r: 1470, fill: "none", stroke: "rgba(255,255,255,0.15)", "stroke-width": 8 });

  return (gg) => {
    const on = micro(gg);
    show(g, on);
    if (on < 0.001) return;
    const yb = -1150 + 2400 * K.tramo(gg, T.cuchillo, 13.62);
    cuna.setAttribute("transform", `translate(0 ${f1(yb)})`);
    show(cuna, K.lim((gg - T.cuchillo + 0.05) / 0.1) * (1 - K.lim((gg - 13.55) / 0.1)));
    const sep = 46 * K.sale(K.tramo(gg, 12.8, 13.25)), rompe = K.tramo(gg, T.romperla - 0.05, T.romperla + 0.35);
    mitades.forEach((m) => {
      m.m.setAttribute("transform", `translate(${f1(m.lado * sep)} 0)`);
      m.vac.setAttribute("stroke-dasharray", rompe > 0 ? `${f1(60 * (1 - rompe) + 4)} ${f1(30 + 60 * rompe)}` : "none");
      show(m.vac, 1 - 0.6 * rompe);
    });
    const sep1 = asoma(gg, T.separado - 0.05, 10.5);
    show(brillo, sep1 * (0.55 + 0.45 * Math.sin(vuelta(gg, 1.5))));
    // se mezclan: de su sitio a un remolino en la grieta
    const u = sube(gg, 13.15, 14.5), giro = 1.4 * (1 - sube(gg, 13.3, 15.0));
    const sitio = (p, i) => {
      const hx = p.x + (p.x < 0 ? -sep : sep), c = Math.cos(giro), s = Math.sin(giro);
      const mx = p.mx * c - p.my * s, my = p.mx * s + p.my * c;
      return [hx + (mx - hx) * u + 6 * Math.sin(vuelta(gg, 0.5) + i * 1.3), p.y + (my * 0.9 - p.y) * u + 6 * Math.cos(vuelta(gg, 0.45) + i)];
    };
    const marca = asoma(gg, T.azufre - 0.05, 12.2);
    AZUFRE.forEach((p, i) => {
      const [x, y] = sitio(p, i), k = K.tramo(gg, p.t, p.t + 0.2), vuela = K.entra(K.tramo(gg, p.t + 0.25, p.t + 2.6));
      const late = 1 + 0.3 * marca * Math.max(0, Math.sin(vuelta(gg, 1.4) + i));
      az[i].o.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${f1(late * (1 - 0.5 * k))})`);
      show(az[i].o, 1 - k);
      const yv = y - 1150 * vuela, xv = x + 40 * Math.sin(p.f * 6 + gg * 2) * vuela;
      az[i].v.e.setAttribute("transform", `translate(${f1(xv)} ${f1(yv)}) rotate(${f1(gg * 90 + i * 30)}) scale(${f1(0.6 + 0.6 * K.sale(k) - 0.15 * pico(gg, p.t, 0.08, 0.3))})`);
      show(az[i].v.e, k * (1 - K.lim((vuela - 0.85) / 0.15)));
    });
    const come = asoma(gg, T.enzima - 0.05, 12.2);
    ENZIMA.forEach((p, i) => {
      const [x, y] = sitio(p, i + 20), abre = 0.25 + 0.75 * Math.abs(Math.sin(vuelta(gg, 1.6) + i));
      en[i].setAttribute("d", comecocos(abre));
      en[i].setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(i * 51 + 30 * Math.sin(vuelta(gg, 0.3) + i))}) scale(${f1(1 + 0.25 * come)})`);
    });
    GAS_EXTRA.forEach((p, i) => {
      const k = K.sale(K.tramo(gg, p.t, p.t + 0.25)), vuela = K.entra(K.tramo(gg, p.t + 0.2, p.t + 2.4));
      const x = p.x + 30 * Math.sin(p.f * 6 + gg * 2), y = p.y - 1150 * vuela;
      extra[i].e.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(gg * 80 + i * 50)}) scale(${f1(0.3 + 0.75 * k)})`);
      show(extra[i].e, k * (1 - K.lim((vuela - 0.85) / 0.15)));
    });
  };
}

// ── la regla de la cámara lenta: de la tabla a 60 cm ─────────────────────────────────────────────────────────────
const CM = 16, X_REGLA = 900;
function reglaSvg(cam) {
  const g = el(cam, "g", { opacity: 0 });
  el(g, "rect", { x: X_REGLA - 16, y: 1416 - 61 * CM, width: 32, height: 61 * CM, rx: 8, fill: "url(#c-regla)", stroke: "rgba(255,255,255,0.3)", "stroke-width": 2 });
  for (let c = 0; c <= 60; c += 5) {
    const y = 1416 - c * CM, larga = c % 10 === 0;
    el(g, "line", { x1: X_REGLA - 16, y1: y, x2: X_REGLA - 16 + (larga ? 30 : 16), y2: y, stroke: "#0b0e12", "stroke-width": larga ? 4 : 2.5 });
    if (larga && c > 0 && c < 60) el(g, "text", { x: X_REGLA - 30, y: y + 14, "text-anchor": "end", fill: "#d8e0e8", "font-size": 40, "font-weight": 700, style: "font-family: var(--letra), sans-serif" }).textContent = String(c);
  }
  const marca = el(g, "g", { opacity: 0 });
  el(marca, "line", { x1: 220, y1: 1416 - 60 * CM, x2: X_REGLA + 16, y2: 1416 - 60 * CM, stroke: CIAN, "stroke-width": 5, "stroke-dasharray": "18 12" });
  el(marca, "circle", { cx: X_REGLA, cy: 1416 - 60 * CM, r: 16, fill: CIAN });
  return (gg) => {
    show(g, regla(gg));
    show(marca, K.sale(K.tramo(gg, T.sesenta - 0.05, T.sesenta + 0.25)));
  };
}

// ── las lupas del filo: en V (afilado) y redondeado y mellado (sin filo) ─────────────────────────────────────────
function lupa(cam, x, y, afilado, n) {
  const g = el(cam, "g", { opacity: 0, transform: `translate(${x} ${y})` });
  const c = el(cam, "clipPath", { id: `${PRE}lupa${n}` });
  el(c, "circle", { r: 100 });
  el(g, "circle", { r: 104, fill: "url(#c-lupa)" });
  const d = el(g, "g", { "clip-path": `url(#${PRE}lupa${n})` });
  if (afilado) el(d, "path", { d: "M-60 -140 L60 -140 L60 -20 L0 70 L-60 -20 Z", fill: "url(#c-acero-v)", stroke: "#e8f6ff", "stroke-width": 4 });
  else el(d, "path", { d: "M-60 -140 L60 -140 L60 -10 C60 60 -60 60 -60 -10 Z", fill: "url(#c-acero-v)", stroke: "#a8b0b8", "stroke-width": 4 });
  if (!afilado) [[-34, 36], [22, 42], [46, 18]].forEach(([mx, my]) => el(d, "circle", { cx: mx, cy: my, r: 9, fill: "#20262c" }));
  const color = afilado ? VERDE : ROJO;
  el(g, "circle", { r: 104, fill: "none", stroke: color, "stroke-width": 8 });
  el(g, "line", { x1: 74, y1: 74, x2: 120, y2: 120, stroke: color, "stroke-width": 14, "stroke-linecap": "round" });
  return (gg) => {
    const o = lupas(gg, afilado ? 0 : 1);
    show(g, o);
    g.setAttribute("transform", `translate(${x} ${y}) scale(${f1(0.7 + 0.3 * K.sale(o))})`);
  };
}

// ── el polvo que flota delante de la luz ─────────────────────────────────────────────────────────────────────────
function polvo(cam) {
  const r = K.azar(9), ps = [];
  for (let i = 0; i < 30; i++) ps.push({ e: el(cam, "circle", { r: 2 + r() * 4, fill: "rgba(200,220,240,0.45)" }), x: r() * 3400 - 300, f: r(), w: r() * 6.28 });
  return (g) => ps.forEach((p) => {
    const u = (ciclo(g, 0.04) + p.f) % 1;
    p.e.setAttribute("cx", f1(p.x + 30 * Math.sin(vuelta(g, 0.04) + p.w)));
    p.e.setAttribute("cy", f1(1750 - u * 1400));
    p.e.setAttribute("opacity", f1(0.55 * Math.sin(Math.PI * u)));
  });
}

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,196,130,0.22)"/><stop offset="1" stop-color="rgba(255,196,130,0)"/></radialGradient>
  <radialGradient id="c-piel" gradientUnits="userSpaceOnUse" cx="540" cy="720" r="720" gradientTransform="translate(540 720) scale(1 0.46) translate(-540 -720)"><stop offset="0" stop-color="#e7ad8c"/><stop offset="0.45" stop-color="#c98a6c"/><stop offset="0.78" stop-color="rgba(120,72,56,0.55)"/><stop offset="1" stop-color="rgba(60,36,28,0)"/></radialGradient>
  <radialGradient id="c-cuenca" cx="0.5" cy="0.45" r="0.5"><stop offset="0.55" stop-color="rgba(120,60,46,0.35)"/><stop offset="1" stop-color="rgba(120,60,46,0)"/></radialGradient>
  <radialGradient id="c-blanco" gradientUnits="userSpaceOnUse" cx="545" cy="690" r="270"><stop offset="0" stop-color="#fbf7f3"/><stop offset="0.6" stop-color="#ece2dc"/><stop offset="1" stop-color="#c79b94"/></radialGradient>
  <radialGradient id="c-rojez" gradientUnits="userSpaceOnUse" cx="545" cy="690" r="260"><stop offset="0.25" stop-color="rgba(240,90,100,0.05)"/><stop offset="1" stop-color="rgba(220,50,70,0.6)"/></radialGradient>
  <radialGradient id="c-iris" gradientUnits="userSpaceOnUse" cx="548" cy="700" r="82"><stop offset="0.3" stop-color="#d79a3c"/><stop offset="0.55" stop-color="#8a5a24"/><stop offset="1" stop-color="#4a2c10"/></radialGradient>
  <linearGradient id="c-pelicula" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(170,230,255,0.05)"/><stop offset="0.6" stop-color="rgba(140,215,255,0.25)"/><stop offset="1" stop-color="rgba(140,215,255,0.65)"/></linearGradient>
  <linearGradient id="c-parpado" gradientUnits="userSpaceOnUse" x1="0" y1="520" x2="0" y2="700"><stop offset="0" stop-color="#d79878"/><stop offset="1" stop-color="#b9785e"/></linearGradient>
  <linearGradient id="c-parpado-i" gradientUnits="userSpaceOnUse" x1="0" y1="700" x2="0" y2="860"><stop offset="0" stop-color="#c28066"/><stop offset="1" stop-color="#d79a7c"/></linearGradient>
  <radialGradient id="c-lagrima" cx="0.4" cy="0.6" r="0.6"><stop offset="0" stop-color="rgba(240,252,255,0.95)"/><stop offset="0.5" stop-color="rgba(150,220,250,0.7)"/><stop offset="1" stop-color="rgba(95,180,230,0.55)"/></radialGradient>
  <radialGradient id="c-mira" cx="0.5" cy="0.5" r="0.5"><stop offset="0.6" stop-color="rgba(240,68,90,0)"/><stop offset="0.9" stop-color="rgba(240,68,90,0.16)"/><stop offset="1" stop-color="rgba(240,68,90,0)"/></radialGradient>
  <radialGradient id="c-cebolla" gradientUnits="userSpaceOnUse" cx="-60" cy="-70" r="250"><stop offset="0" stop-color="#f7cf86"/><stop offset="0.45" stop-color="#d48a3e"/><stop offset="0.85" stop-color="#9a501f"/><stop offset="1" stop-color="#6e3414"/></radialGradient>
  <radialGradient id="c-brillo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,244,220,0.6)"/><stop offset="1" stop-color="rgba(255,244,220,0)"/></radialGradient>
  <linearGradient id="c-acero" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9eef2"/><stop offset="0.45" stop-color="#b5bec6"/><stop offset="1" stop-color="#8d979f"/></linearGradient>
  <linearGradient id="c-acero-v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d979f"/><stop offset="0.5" stop-color="#eef3f6"/><stop offset="1" stop-color="#98a2aa"/></linearGradient>
  <linearGradient id="c-bisel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8e2ea"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
  <linearGradient id="c-mango" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a20"/><stop offset="0.5" stop-color="#22170f"/><stop offset="1" stop-color="#120c08"/></linearGradient>
  <radialGradient id="c-destello" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.95)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
  <radialGradient id="c-gota" cx="0.4" cy="0.4" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.95)"/><stop offset="0.45" stop-color="rgba(200,236,255,0.6)"/><stop offset="1" stop-color="rgba(160,220,255,0)"/></radialGradient>
  <linearGradient id="c-madera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9824e"/><stop offset="0.5" stop-color="#94602f"/><stop offset="1" stop-color="#5e3a1b"/></linearGradient>
  <radialGradient id="c-micro" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#3a3018"/><stop offset="0.7" stop-color="#2a2312"/><stop offset="1" stop-color="#17140b"/></radialGradient>
  <radialGradient id="c-celda" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="rgba(250,232,170,0.22)"/><stop offset="1" stop-color="rgba(200,170,90,0.12)"/></radialGradient>
  <radialGradient id="c-celda-h" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="rgba(255,240,190,0.38)"/><stop offset="1" stop-color="rgba(220,180,90,0.22)"/></radialGradient>
  <radialGradient id="c-vacuola" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="rgba(150,226,255,0.3)"/><stop offset="1" stop-color="rgba(95,212,255,0.14)"/></radialGradient>
  <radialGradient id="c-punto-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6d8"/><stop offset="0.35" stop-color="${ORO}"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-punto-r" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe2e2"/><stop offset="0.35" stop-color="${ROJO}"/><stop offset="1" stop-color="rgba(240,68,90,0)"/></radialGradient>
  <radialGradient id="c-punto-c" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e8fbff"/><stop offset="0.35" stop-color="${CIAN}"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <radialGradient id="c-punto-v" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(210,255,232,0.9)"/><stop offset="0.4" stop-color="rgba(34,211,138,0.6)"/><stop offset="1" stop-color="rgba(34,211,138,0)"/></radialGradient>
  <linearGradient id="c-regla" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f2d68a"/><stop offset="1" stop-color="#c9a24e"/></linearGradient>
  <radialGradient id="c-lupa" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#3a4a5a"/><stop offset="1" stop-color="#141b22"/></radialGradient>
</defs>`;

// ── las etiquetas (en pantalla, sujetas a un punto del mundo o a un sitio fijo) ─────────────────────────────────
function etiqueta(cont, html, clase = "") { return K.crear(cont, `<div class="c-etq ${clase}">${html}</div>`); }
function pon(e, sx, sy, on, dy = 24) {
  if (on <= 0.001) { e.style.opacity = 0; return; }
  const w = e.offsetWidth, h = e.offsetHeight;
  const x = Math.min(Math.max(sx, 40 + w / 2), 1040 - w / 2), y = Math.min(Math.max(sy, 560 + h / 2), 1440 - h / 2);
  e.style.opacity = on;
  e.style.transform = `translate(${f1(x - w / 2)}px, ${f1(y - h / 2 + (1 - on) * dy)}px) scale(${f1(0.9 + 0.1 * on)})`;
}
const junto = (wx, wy, dx = 0, dy = 0) => (k) => { const [x, y] = pantalla(k, wx, wy); return [x + dx, y + dy]; };
const enLente = (lx, ly, dx = 0, dy = 0) => { const [wx, wy] = enMundo(lx, ly); return junto(wx, wy, dx, dy); };

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on) => L.push({ e: etiqueta(capa, html, clase), sitio, on });
  // hook
  r(`te está <b>disparando</b>`, "r g", junto(OJO[0], OJO[1], 0, 250), (g) => asoma(g, T.disparando, 3.45));
  r(`entera: <b>0</b> lágrimas`, "v", junto(540, 1000, 0, -10), (g) => asoma(g, T.nada - 0.3, 6.05));
  r(`fabrica el <b>arma</b> al cortar`, "r", junto(540, 1000, 0, -10), (g) => asoma(g, T.arma, 8.0));
  // célula
  r(`por <b>separado</b>`, "c", enLente(0, 0, 0, -250), (g) => asoma(g, T.separado, 10.4));
  r(`compuesto de <b>azufre</b>`, "o", enLente(0, 0, 0, -250), (g) => asoma(g, T.azufre, 12.1));
  r(`<b>enzima</b>`, "c g", enLente(0, 0, 0, 260), (g) => asoma(g, T.enzima, 12.1));
  r(`se <b>mezclan</b>`, "n g", enLente(0, 0, 0, 280), (g) => asoma(g, T.mezcla, 14.9));
  r(`un gas <b>nuevo</b>`, "v g", enLente(0, 0, 0, 280), (g) => asoma(g, T.gas, 17.6));
  r(`sube a tus <b>ojos</b>`, "v", junto(OJO[0], OJO[1], 0, 250), (g) => asoma(g, T.ojos - 0.2, 19.15));
  // ojo
  r(`<b>nervios</b> del ojo`, "r", junto(IRIS[0], IRIS[1], 0, 300), (g) => asoma(g, T.nervios + 0.1, 20.15));
  r(`¡<b>alarma</b>!`, "r g", junto(IRIS[0], IRIS[1], 0, 300), (g) => asoma(g, T.detectan + 0.05, 21.4));
  r(`<b>lágrimas</b> para lavarlo`, "c", junto(IRIS[0], IRIS[1], 0, 320), (g) => asoma(g, T.lagrimas, 23.0));
  // cámara lenta
  r(`Cornell · <b>2025</b>`, "o g", () => [540, 1430], (g) => asoma(g, T.cornell, 26.0));
  r(`cámara <b>superlenta</b>`, "c g", () => [540, 1430], (g) => asoma(g, 26.1, 28.2));
  r(`hasta <b>60</b> cm`, "c g", () => [540, 1430], (g) => asoma(g, T.sesenta, 30.4));
  // los cuchillos
  r(`<b>afilado</b>`, "v g", junto(CA, 800), (g) => asoma(g, 30.95, 35.6));
  r(`<b>sin filo</b>`, "r g", junto(CB, 800), (g) => asoma(g, 30.95, 35.6));
  r(`<b>más</b> gotas`, "r", junto(CB, 1520), (g) => asoma(g, T.salen, 32.0));
  r(`y más <b>rápidas</b>`, "r", junto(CB, 1520), (g) => asoma(g, T.rapido, 35.6));
  // cierre
  r(`<b>afila</b> el cuchillo`, "v g", junto(560, 1430, 0, 0), (g) => asoma(g, T.afila, 37.95));
  r(`corta <b>despacio</b>`, "v g", junto(560, 1430, 0, 0), (g) => asoma(g, T.despacio - 0.1, 39.7));
  r(`casi <b>no</b> puede`, "v", junto(540, 1000, 0, 0), (g) => asoma(g, T.casi, 41.05));
  return (g, k) => L.forEach((l) => {
    const [x, y] = l.sitio(k);
    pon(l.e, x, y, l.on(g));
  });
}

// el visor de la cámara: las esquinas, REC y el tiempo, que pasa muy despacio
function visorHtml(capa) {
  const e = K.crear(capa, `<div class="c-visor"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><div class="rec"><b>●</b> REC</div><div class="tc">00:00.000</div></div>`);
  const rec = e.querySelector(".rec b"), tc = e.querySelector(".tc");
  return (g) => {
    const o = visor(g);
    e.style.opacity = f1(o);
    if (o < 0.001) return;
    rec.style.opacity = Math.sin(vuelta(g, 1)) > 0 ? 1 : 0.2;
    const s = Math.max(0, g - 23.3) * 0.02;
    tc.textContent = `00:${String(Math.floor(s)).padStart(2, "0")}.${String(Math.floor((s % 1) * 1000)).padStart(3, "0")}`;
  };
}

// ── lo que tiene cada escena, por capas: el fondo, el mundo, la viñeta, la sombra de arriba y la pantalla ─────────
export function montaje(esc) {
  estilos();
  PRE = `c${++escenas}-`;
  K.crear(esc, `<div class="c-fondo"></div>`);
  const mundo = K.crear(esc, `<div class="c-mundo"></div>`);
  const sv = K.crear(mundo, ids(`<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">${DEFS}<g class="c-cam"></g></svg>`));
  const cam = sv.querySelector(".c-cam");
  el(cam, "rect", { x: -3000, y: -2000, width: 8000, height: 7500, fill: "#0b0e12" });
  el(cam, "ellipse", { cx: 540, cy: 1000, rx: 1100, ry: 1100, fill: "url(#c-luz)" });
  el(cam, "ellipse", { cx: 2350, cy: 1150, rx: 900, ry: 800, fill: "url(#c-luz)" });
  const pv = polvo(cam);
  const oj = ojo(cam);
  tabla(cam);
  // el cuchillo grande, detrás de la cebolla (la mitad de delante lo tapa)
  const cg = cuchillo(cam, true, 0);
  const ce = cebolla(cam, 540, 1416 - 162, 1, 0);
  const ka = cuchillo(cam, true, 1), ca = cebolla(cam, CA, CY, 0.7, 1);
  const kb = cuchillo(cam, false, 2), cb = cebolla(cam, CB, CY, 0.7, 2);
  // los cuchillos pequeños van detrás de sus cebollas: los pongo antes en el dibujo
  cam.insertBefore(ka.g, ca.g); cam.insertBefore(kb.g, cb.g);
  const gt = gotitas(el(cam, "g"));
  const mr = miraRoja(cam);
  const rg = reglaSvg(cam);
  const la = lupa(cam, CA, 960, true, 1), lb = lupa(cam, CB, 960, false, 2);
  const mi = microscopio(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const vi = visorHtml(capa), ro = rotulos(capa);
  return { cam, pv, oj, cg, ce, ka, kb, cb, gt, mr, rg, la, lb, mi, vi, ro };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los 0,3 s en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // los golpes: la cámara da un respingo con la ráfaga y con el corte
    const sac = Math.max(pico(g, T.disparando, 0.06, 0.45), 0.7 * pico(g, T.cortas, 0.05, 0.4), 0.5 * pico(g, T.deprisa, 0.05, 0.35));
    const kx = k.x + sac * 7 * Math.sin(g * 90), ky = k.y + sac * 6 * Math.cos(g * 77), kz = k.z * (1 + 0.035 * sac);
    E.cam.setAttribute("transform", `translate(${(540 - kx * kz).toFixed(2)} ${(1000 - ky * kz).toFixed(2)}) scale(${kz.toFixed(4)})`);
    E.pv(g);
    E.oj(g);
    E.cg.g.setAttribute("transform", `translate(870 ${f1(filo(g))})`);
    if (E.cg.destello) {
      const b = brilloFilo(g);
      E.cg.destello.setAttribute("transform", `translate(${f1(-640 * K.suave(b))} 0)`);
      show(E.cg.destello, Math.sin(Math.PI * b));
    }
    E.ka.g.setAttribute("transform", `translate(${CA + 170} ${f1(golpeY(g, golpesA, 1.6, 0.5))}) scale(0.5)`);
    const yb = golpeY(g, golpesB, golpesB.length && g > T.deprisa - 0.2 ? 0.16 : 0.35, g > T.deprisa - 0.2 ? 0.18 : 0.5);
    E.kb.g.setAttribute("transform", `translate(${CB + 170} ${f1(yb)}) scale(0.5)`);
    // la cebolla del romo se aplasta un poco con cada golpe
    const aplasta = K.lim((yb - 1180) / 120) * 0.07;
    E.cb.cuerpo.setAttribute("transform", `translate(0 ${f1(160 * aplasta)}) scale(${f1(1 + aplasta * 0.6)} ${f1(1 - aplasta)})`);
    E.gt(g);
    E.mr(g);
    E.rg(g);
    E.la(g); E.lb(g);
    E.mi(g);
    E.vi(g);
    E.ro(g, { x: kx, y: ky, z: kz });
    return { g, k };
  };
  return E;
}
