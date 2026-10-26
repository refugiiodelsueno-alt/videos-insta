// Lo que sale en todas las escenas: una mano derecha grande, de dorso, con los dedos estirados hacia arriba; sobre el
// nudillo del dedo corazón, una lupa que deja ver dentro: la cabeza del metacarpiano, la base de la falange, el
// cartílago, la cápsula y el líquido con el gas disuelto (puntitos cian). A la derecha de la mano, la resonancia en
// grises con el dedo en un tubo y un cable; a la izquierda, las dos manos del médico con sus contadores y la medalla.
// Todo en 2D, con la cámara dentro del svg (un transform del grupo).
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", NARANJA = "#ff8a3d";
export const F0 = { x: 540, y: 1080, z: 1.5 };                // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma empalma con el primero.
export const TOTAL = 49.41;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const pico = (g, t, sub = 0.08, baja = 0.5) => K.sale(K.tramo(g, t, t + sub)) * (1 - K.suave(K.tramo(g, t + sub, t + baja)));
const salto = (g, t, d = 0.1) => K.sale(K.tramo(g, t, t + d));

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, junta: 4.5, resonancia: 16.92, espera: 25.78, manos: 31.8, cierre: 44.26 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  crac: 0.32, dedos: 0.88, burbuja: 1.76, gas: 2.32, nace: 2.72, nudillo: 3.64,
  rompe: 4.74, chocan: 5.62, huesos: 6.1, liquido: 7.86, gas2: 8.5, refresco: 9.82, cerrado: 10.3,
  tiras: 11.44, separan: 13.08, presion: 14.06, cae: 14.34, gas3: 15.5, forma: 15.78, burbuja2: 16.26,
  vieron: 17.08, metiendo: 17.88, resonancia: 18.92, tirando: 19.76, cable: 20.76,
  crac2: 21.9, aparece: 23.36, hueco: 23.92, burbuja3: 25.08,
  crujir: 26.74, otra: 27.1, enseguida: 27.46, esperar: 28.62, veinte: 29.18, disolver: 31.14,
  artrosis: 32.21, medico: 33.21, crujio: 34.04, izquierda: 35.69, cincuenta: 37.18, veces: 38.92,
  ninguna: 40.26, manos: 41.1, artrosis2: 41.82, ig: 43.18,
  rompe2: 45.18, nada2: 45.5, crac3: 46.38, refresco2: 47.14, abre: 47.98, dedo: 48.78,
};
const CAV1 = 15.92, CAV2 = T.crac2, CAV3 = T.crac3;   // los tres crac que se ven nacer

// ── lo que pasa en cada momento ───────────────────────────────────────────────────────────────────────────────────
// lo separados que están los huesos (0 juntos, 1 el hueco del crac) y lo grande de la burbuja, en la lupa
const sepL = (g) => {
  if (g < G0.junta) return 1;
  if (g < G0.espera) return 0.7 * sube(g, 12.3, 13.6) + 0.3 * salto(g, CAV1, CAV1 + 0.08);
  if (g < G0.cierre) return 0.75 + 0.25 * sube(g, 26.6, 27.3) - 0.25 * sube(g, 27.7, 28.3) - 0.75 * sube(g, 29.2, 31.4);
  return 0.7 * sube(g, 45.3, 46.3) + 0.3 * salto(g, CAV3, CAV3 + 0.08);
};
const burL = (g) => {
  if (g < G0.junta) return 1;
  if (g < G0.espera) return salto(g, CAV1, CAV1 + 0.15);
  if (g < G0.cierre) return 1 - sube(g, 29.0, 31.3);
  return salto(g, CAV3, CAV3 + 0.15);
};
// el burbujeo alrededor de la burbuja recién nacida (encendido en el fotograma 0 y en el último)
const fizz = (g) => 1 - sube(g, 1.4, 2.0) + sube(g, 47.0, 47.6) + asoma(g, CAV1 + 0.05, 16.6);
// lo mismo en la resonancia
const sepR = (g) => 0.6 * sube(g, 19.8, 21.8) + 0.4 * salto(g, CAV2, CAV2 + 0.08);
const burR = (g) => salto(g, CAV2, CAV2 + 0.15);
const metido = (g) => sube(g, 17.7, 18.6);
const tenso = (g) => sube(g, 19.6, 19.9);
const barrido = (g) => K.tramo(g, T.resonancia, 19.7);

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
.c-etq.x { font-size: 84px; padding: 10px 34px; letter-spacing: 2px; }
.c-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }
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
// la lupa, sobre el nudillo del dedo corazón; lo de dentro se dibuja MZ veces más grande, en un círculo de radio RL
const MC = [540, 1180], MZ = 3.2, RL = 830, RW = RL / MZ;
const enMundo = (lx, ly) => [MC[0] + lx / MZ, MC[1] + ly / MZ];
// la cámara dentro de la lupa: s es la escala en pantalla de lo de dentro
const lente = (lx, ly, s) => ({ x: MC[0] + lx / MZ, y: MC[1] + ly / MZ, z: s * MZ });
// la resonancia y las dos manos del médico
const RM = [2400, 1080], RS = 0.42;
const MANOS = { iz: [-2215, 1060], de: [-1785, 1060], s: 0.46 };
const CAMINO = [
  [0, F0], [1.6, { x: 540, y: 1120, z: 1.75 }], [2.4, { x: 540, y: 1178, z: 3.0 }], [3.4, { x: 540, y: 1180, z: 3.2 }],   // entra en la lupa
  [4.3, { x: 540, y: 1130, z: 1.85 }], [4.49, { x: 540, y: 1125, z: 1.8 }],                                                 // el nudillo
  [4.5, lente(0, -30, 1.5)], [7.0, lente(0, -30, 1.6)], [9.4, lente(0, -40, 1.66)],                                        // corte: la junta
  [10.0, lente(280, -40, 0.85)], [11.0, lente(280, -40, 0.87)], [13.0, lente(270, -60, 0.9)], [14.9, lente(260, -60, 0.9)], // con la botella
  [15.7, lente(0, -80, 1.7)], [16.91, lente(0, -80, 1.8)],                                                                  // nace la burbuja
  [16.92, { x: RM[0], y: 1060, z: 0.85 }], [18.9, { x: RM[0], y: 1060, z: 0.92 }],                                           // corte: la resonancia
  [21.7, { x: RM[0], y: 1080, z: 1.25 }], [23.9, { x: RM[0], y: 1085, z: 1.7 }], [25.77, { x: RM[0], y: 1085, z: 1.85 }],
  [25.78, lente(0, 40, 0.95)], [28.6, lente(0, 40, 0.92)], [31.79, lente(0, 20, 1.05)],                                    // corte: la espera
  [31.8, { x: -2000, y: 1150, z: 1.05 }], [34.0, { x: -2000, y: 1145, z: 1.1 }], [35.3, { x: -2180, y: 1110, z: 1.3 }],     // corte: las dos manos
  [37.0, { x: -2010, y: 1140, z: 1.12 }], [40.0, { x: -2000, y: 1145, z: 1.08 }], [42.5, { x: -2000, y: 1110, z: 1.05 }], [44.25, { x: -2000, y: 1100, z: 1.02 }],
  [44.26, { x: 540, y: 1060, z: 1.05 }], [46.3, { x: 540, y: 1070, z: 1.25 }], [47.4, { x: 540, y: 1075, z: 1.35 }], [TOTAL, F0],   // corte: la mano otra vez
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
const show = (e, o) => e.setAttribute("opacity", f1(Math.max(0, Math.min(1, o)) * 100 / 100));
const texto = (padre, x, y, s, at, tam, color, peso = 800) => {
  const t = el(padre, "text", { x, y, "text-anchor": "middle", fill: color, "font-size": tam, "font-weight": peso, style: "font-family: var(--letra), sans-serif", ...at });
  t.textContent = s;
  return t;
};
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// ── la mano derecha, de dorso, con los dedos hacia arriba (sus coordenadas son las del mundo) ───────────────────
const DEDOS = {
  indice: [[400, 1200], [370, 690], 112], corazon: [[540, 1170], [540, 620], 118],
  anular: [[675, 1195], [700, 690], 110], menique: [[795, 1250], [850, 860], 94],
};
const PULGAR = [[330, 1500], [150, 1180], 130];
const DORSO = [[345, 1215], [300, 1380], [318, 1600], [340, 1800], [350, 2100], [770, 2100], [790, 1800], [830, 1560], [858, 1330],
  [845, 1250], [795, 1215], [700, 1180], [560, 1150], [440, 1170]];
// un dedo: una cápsula de la base (b) a la punta (t), con su uña y sus arrugas
function dedo(padre, b, t, w, ext = 90) {
  const dx = t[0] - b[0], dy = t[1] - b[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, h = w / 2;
  const B = [b[0] - ux * ext, b[1] - uy * ext];
  const p = (P, s, a = 0) => [P[0] + nx * h * s + ux * a, P[1] + ny * h * s + uy * a];
  const [l0, l1, r1, r0] = [p(B, -1), p(t, -1), p(t, 1), p(B, 1)];
  el(padre, "path", { d: `M${f1(l0[0])} ${f1(l0[1])} L${f1(l1[0])} ${f1(l1[1])} A${h} ${h} 0 0 1 ${f1(r1[0])} ${f1(r1[1])} L${f1(r0[0])} ${f1(r0[1])} Z`, fill: "url(#c-dedo)" });
  // el canto iluminado
  const a0 = p(b, -0.45, 30), a1 = p(t, -0.45, -h * 0.4);
  el(padre, "path", { d: `M${f1(a0[0])} ${f1(a0[1])} L${f1(a1[0])} ${f1(a1[1])}`, stroke: "rgba(255,226,206,0.28)", "stroke-width": w * 0.16, "stroke-linecap": "round" });
  // las arrugas de las dos articulaciones del dedo
  const arruga = (f, n) => {
    for (let i = 0; i < n; i++) {
      const a = L * f + (i - (n - 1) / 2) * 9, q0 = p(b, -0.42, a), q1 = p(b, 0.42, a), qc = p(b, 0, a - 7);
      el(padre, "path", { d: `M${f1(q0[0])} ${f1(q0[1])} Q${f1(qc[0])} ${f1(qc[1])} ${f1(q1[0])} ${f1(q1[1])}`, fill: "none", stroke: "rgba(110,52,38,0.42)", "stroke-width": 4, "stroke-linecap": "round" });
    }
  };
  arruga(0.42, 3);
  arruga(0.76, 2);
  // la uña
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI + 90, c = p(t, 0, -w * 0.12);
  const u = el(padre, "g", { transform: `translate(${f1(c[0])} ${f1(c[1])}) rotate(${f1(ang)})` });
  el(u, "rect", { x: f1(-w * 0.31), y: f1(-w * 0.34), width: f1(w * 0.62), height: f1(w * 0.66), rx: f1(w * 0.26), fill: "#f0c3ad", stroke: "#c4876f", "stroke-width": 3 });
  el(u, "rect", { x: f1(-w * 0.18), y: f1(-w * 0.26), width: f1(w * 0.12), height: f1(w * 0.44), rx: f1(w * 0.06), fill: "rgba(255,255,255,0.4)" });
}
function mano(padre, tr = "") {
  const g = el(padre, "g", tr ? { transform: tr } : {});
  dedo(g, ...PULGAR, 120);
  el(g, "path", { d: curva(DORSO, true), fill: "url(#c-mano)" });
  // los tendones, que bajan de cada nudillo a la muñeca
  Object.values(DEDOS).forEach(([b]) => el(g, "path", { d: `M${b[0]} ${b[1] + 40} Q${f1((b[0] + 560) / 2)} 1650 ${f1(540 + (b[0] - 560) * 0.35)} 2050`, fill: "none", stroke: "rgba(255,214,194,0.16)", "stroke-width": 12, "stroke-linecap": "round" }));
  el(g, "ellipse", { cx: 560, cy: 1500, rx: 200, ry: 260, fill: "url(#c-brillo)" });
  ["indice", "anular", "menique"].forEach((k) => dedo(g, ...DEDOS[k]));
  const dc = el(g, "g");
  dedo(dc, ...DEDOS.corazon);
  // los nudillos: un bulto más claro en la base de cada dedo
  Object.values(DEDOS).forEach(([b, , w]) => el(g, "ellipse", { cx: b[0], cy: b[1] + 8, rx: f1(w * 0.36), ry: f1(w * 0.22), fill: "rgba(255,222,204,0.26)" }));
  // la manga
  el(g, "rect", { x: 290, y: 1960, width: 520, height: 800, rx: 40, fill: "#1f2c3d" });
  el(g, "rect", { x: 280, y: 1960, width: 540, height: 70, rx: 22, fill: "#2b3b50" });
  return { g, dc };
}

// ── la junta por dentro (en unidades de la lupa: el centro, en la cabeza del metacarpiano; y hacia abajo) ────────
const DOMO = (x) => 40 + 150 * (x / 230) ** 2;
const META = (() => {
  const P = [];
  for (let x = -230; x <= 230; x += 23) P.push([x, DOMO(x)]);
  return curva([...P, [240, 260], [205, 420], [165, 560], [150, 800], [150, 1700], [-150, 1700], [-150, 800], [-165, 560], [-205, 420], [-240, 260]], true);
})();
const BORDE = (dy) => { const P = []; for (let x = -220; x <= 220; x += 22) P.push([x, DOMO(x) + dy]); return curva(P); };
function falange(arriba) {
  const P = [];
  for (let x = -200; x <= 200; x += 20) P.push([x, DOMO(x) - 16]);
  const lado = [[225, 40], [215, -90], [160, -260], [135, -420], [135, arriba + 60]];
  return curva([...P, ...lado, [70, arriba + 10], [0, arriba], [-70, arriba + 10], ...lado.map(([x, y]) => [-x, y]).reverse()], true);
}
// la cápsula: dos paredes que se estiran cuando la falange sube
const pared = (s, sh) => [[s * 240, 380], [s * 320, 250], [s * 332, 60], [s * 305, -110 - sh * 0.6], [s * 225, -200 - sh]];
// el gas disuelto: puntitos en los bolsillos del líquido y en la rendija; cada uno sabe a qué sitio de la burbuja va
const GAS = Array.from({ length: 36 }, (_, i) => {
  const r = K.azar(300 + i), lado = i < 28 ? (i % 2 ? 1 : -1) : 0;
  return { lado, u: r(), v: r(), f: r(), a: r() * 6.28, rr: Math.sqrt(r()), w: r() * 6.28 };
});
const FIZZ = Array.from({ length: 14 }, (_, i) => { const r = K.azar(400 + i); return { s: i % 2 ? 1 : -1, a: (r() - 0.5) * 1.3, f: r(), r: 5 + r() * 6 }; });
function articulacion(padre, rm) {
  const C = rm
    ? { fluido: "#cfcfcf", hueso: "url(#c-rm-hueso)", cortical: "#1a1a1a", cw: 26, cart: "#8a8a8a", caps: "#3c3c3c" }
    : { fluido: "rgba(255,194,74,0.34)", hueso: "url(#c-hueso)", cortical: "#8f7550", cw: 8, cart: "rgba(206,238,250,0.92)", caps: "rgba(236,128,150,0.75)" };
  const fl = el(padre, "path", { fill: C.fluido });
  const brillo = rm ? null : el(padre, "path", { fill: "rgba(255,226,140,0.5)", opacity: 0 });
  const caps = el(padre, "path", { fill: "none", stroke: C.caps, "stroke-width": 16, "stroke-linecap": "round" });
  el(padre, "path", { d: META, fill: C.hueso, stroke: C.cortical, "stroke-width": C.cw });
  el(padre, "path", { d: BORDE(12), fill: "none", stroke: C.cart, "stroke-width": 24, "stroke-linecap": "round" });
  const fa = el(padre, "g");
  el(fa, "path", { d: falange(rm ? -620 : -1800), fill: C.hueso, stroke: C.cortical, "stroke-width": C.cw });
  el(fa, "path", { d: BORDE(-28), fill: "none", stroke: C.cart, "stroke-width": 24, "stroke-linecap": "round" });
  if (rm) {
    // en la resonancia se ve el dedo entero: la falange del medio y la de la punta
    el(fa, "rect", { x: -105, y: -900, width: 210, height: 240, rx: 70, fill: C.hueso, stroke: C.cortical, "stroke-width": C.cw });
    el(fa, "rect", { x: -80, y: -990, width: 160, height: 70, rx: 34, fill: C.hueso, stroke: C.cortical, "stroke-width": C.cw });
  } else {
    // la médula, en puntitos
    const r = K.azar(55);
    for (let i = 0; i < 26; i++) {
      const y = 300 + r() * 600, x = (r() - 0.5) * 220;
      el(padre, "circle", { cx: f1(x), cy: f1(y), r: f1(6 + r() * 10), fill: "rgba(170,130,80,0.18)" });
    }
    for (let i = 0; i < 18; i++) el(fa, "circle", { cx: f1((r() - 0.5) * 200), cy: f1(-200 - r() * 560), r: f1(6 + r() * 10), fill: "rgba(170,130,80,0.18)" });
  }
  // el gas, la burbuja, la onda del crac y el burbujeo
  const puntos = rm ? [] : GAS.map(() => ({ h: el(padre, "circle", { r: 30, fill: "url(#c-punto-c)" }), p: el(padre, "circle", { r: 10, fill: "#c8f2ff" }) }));
  const bur = el(padre, "path", rm ? { fill: "#000" } : { fill: "url(#c-burbuja)", stroke: "#cdf4ff", "stroke-width": 6 });
  const brilloB = rm ? null : el(padre, "ellipse", { fill: "rgba(255,255,255,0.55)" });
  const contorno = rm ? el(padre, "path", { fill: "none", stroke: CIAN, "stroke-width": 12, opacity: 0 }) : null;
  const onda = el(padre, "circle", { fill: "none", stroke: rm ? "#fff" : CIAN, "stroke-width": 14, opacity: 0 });
  const fz = rm ? [] : FIZZ.map((f) => el(padre, "circle", { r: f.r, fill: "rgba(200,244,255,0.25)", stroke: "#bff0ff", "stroke-width": 3, opacity: 0 }));

  return (sep, b, o = {}) => {
    const sh = 200 * sep, gap = 16 + sh, g = o.g || 0;
    const izq = pared(-1, sh), der = pared(1, sh);
    caps.setAttribute("d", `${curva(izq)} ${curva(der)}`);
    fl.setAttribute("d", curva([...izq.slice().reverse(), ...der], true));
    if (brillo) { brillo.setAttribute("d", fl.getAttribute("d")); show(brillo, o.liquido || 0); }
    fa.setAttribute("transform", `translate(0 ${f1(-sh)})`);
    // la burbuja: sigue la curva del hueco, entre los dos cartílagos
    const cy = (x) => DOMO(x) - 8 - sh / 2;
    const pulso = 1 + 0.14 * (o.pulso || 0);
    const rx = 150 * b * pulso, ry = Math.max(0, Math.min(100, gap / 2 - 8)) * b * pulso;
    if (b > 0.01 && ry > 1) {
      const P = [];
      for (let i = 0; i < 20; i++) { const a = (i / 20) * 6.283, x = rx * Math.cos(a); P.push([x, cy(x) - ry * Math.sin(a)]); }
      const d = curva(P, true);
      bur.setAttribute("d", d);
      show(bur, 1);
      if (contorno) { contorno.setAttribute("d", d); show(contorno, o.contorno || 0); }
      if (brilloB) { brilloB.setAttribute("cx", f1(-rx * 0.35)); brilloB.setAttribute("cy", f1(cy(-rx * 0.35) - ry * 0.45)); brilloB.setAttribute("rx", f1(rx * 0.22)); brilloB.setAttribute("ry", f1(ry * 0.18)); }
    } else {
      show(bur, 0);
      if (contorno) show(contorno, 0);
      if (brilloB) brilloB.setAttribute("rx", 0);
    }
    // la onda del crac
    const u = o.onda == null ? -1 : o.onda;
    if (u >= 0 && u < 1) {
      onda.setAttribute("cx", 0); onda.setAttribute("cy", f1(cy(0)));
      onda.setAttribute("r", f1(60 + 700 * K.sale(u)));
      onda.setAttribute("stroke-width", f1(18 * (1 - u) + 2));
      show(onda, 0.9 * (1 - u));
    } else show(onda, 0);
    // los puntitos de gas: sueltos en el líquido, o metidos en la burbuja
    const bFull = 150, ryFull = Math.max(0, Math.min(100, gap / 2 - 8));
    puntos.forEach((q, i) => {
      const P = GAS[i];
      let x, y;
      if (P.lado) { x = P.lado * (258 + 45 * P.u); y = -120 - sh * 0.7 + (440 + sh * 0.7) * P.v; }
      else { x = (P.u - 0.5) * 380; y = cy(x) + (P.v - 0.5) * Math.max(0, gap - 30); }
      x += 7 * Math.sin(vuelta(g, 0.5) + P.w); y += 7 * Math.cos(vuelta(g, 0.4) + P.w);
      const p = K.suave(K.lim((b - P.f * 0.6) / 0.4));
      const tx = Math.cos(P.a) * P.rr * bFull * 0.7, ty = cy(tx) + Math.sin(P.a) * P.rr * ryFull * 0.6;
      x += (tx - x) * p; y += (ty - y) * p;
      const parp = o.parpadeo ? 1 + 0.8 * o.parpadeo * (0.5 + 0.5 * Math.sin(vuelta(g, 3) + P.w)) : 1;
      q.p.setAttribute("cx", f1(x)); q.p.setAttribute("cy", f1(y)); q.h.setAttribute("cx", f1(x)); q.h.setAttribute("cy", f1(y));
      q.h.setAttribute("r", f1(30 * parp));
      show(q.p, 1 - p); show(q.h, (1 - p) * Math.min(1, 0.6 * parp));
    });
    // el burbujeo: burbujitas que salen de los bordes de la burbuja
    fz.forEach((e, i) => {
      const F = FIZZ[i], k = (ciclo(g, 0.8) + F.f) % 1, on = (o.fizz || 0) * b;
      if (on <= 0.01) { show(e, 0); return; }
      const ang = F.a, d = 1 + 1.4 * k;
      const x = F.s * (rx * 0.9 + 140 * k) * Math.cos(ang * 0.3), y = cy(x) + Math.sin(ang) * ry * 0.5 * d;
      e.setAttribute("cx", f1(x)); e.setAttribute("cy", f1(y));
      show(e, K.lim(on) * Math.sin(Math.PI * k));
    });
  };
}

// ── la lupa sobre el nudillo ─────────────────────────────────────────────────────────────────────────────────────
// la botella de refresco, cerrada al lado de la junta, para comparar
const BOT = 560;
const SUBEN = Array.from({ length: 12 }, (_, i) => { const r = K.azar(500 + i); return { x: (r() - 0.5) * 150, f: r(), r: 6 + r() * 8 }; });
function botella(padre) {
  const g = el(padre, "g", { opacity: 0, transform: `translate(${BOT} 0)` });
  const CUERPO = "M-40 -360 L-40 -250 C-40 -190 -100 -170 -100 -100 L-100 290 C-100 312 -84 322 -64 322 L64 322 C84 322 100 312 100 290 L100 -100 C100 -170 40 -190 40 -250 L40 -360 Z";
  el(g, "path", { d: CUERPO, fill: "rgba(95,212,255,0.08)" });
  el(g, "path", { d: "M-34 -240 C-34 -186 -92 -166 -92 -100 L-92 288 C-92 304 -80 314 -64 314 L64 314 C80 314 92 304 92 288 L92 -100 C92 -166 34 -186 34 -240 Z", fill: "rgba(95,212,255,0.3)" });
  const quietos = [];
  const r = K.azar(77);
  for (let i = 0; i < 22; i++) quietos.push(el(g, "circle", { cx: f1((r() - 0.5) * 150), cy: f1(-120 + r() * 420), r: 5, fill: "#c8f2ff" }));
  const suben = SUBEN.map((s) => el(g, "circle", { r: s.r, fill: "rgba(220,248,255,0.35)", stroke: "#dff7ff", "stroke-width": 3, opacity: 0 }));
  el(g, "path", { d: CUERPO, fill: "none", stroke: "rgba(220,240,255,0.75)", "stroke-width": 8, "stroke-linejoin": "round" });
  el(g, "path", { d: "M-70 -60 L-70 260", stroke: "rgba(255,255,255,0.35)", "stroke-width": 12, "stroke-linecap": "round" });
  el(g, "rect", { x: -100, y: 0, width: 200, height: 120, fill: "rgba(240,68,90,0.55)" });
  const tapon = el(g, "g");
  el(tapon, "rect", { x: -50, y: -410, width: 100, height: 54, rx: 10, fill: ROJO, stroke: "#9a1a2c", "stroke-width": 5 });
  for (let x = -38; x <= 38; x += 15) el(tapon, "path", { d: `M${x} -404 L${x} -362`, stroke: "rgba(80,0,10,0.4)", "stroke-width": 4 });
  const chorro = el(g, "path", { d: "M-30 -380 L-70 -470 M0 -385 L0 -500 M30 -380 L70 -470", stroke: "#e8fbff", "stroke-width": 8, "stroke-linecap": "round", opacity: 0 });
  return (gg) => {
    show(g, asoma(gg, 9.6, 15.3));
    const u = K.sale(K.tramo(gg, T.cae, T.cae + 0.6));
    tapon.setAttribute("transform", `translate(${f1(60 * u)} ${f1(-300 * u)}) rotate(${f1(70 * u)} 0 -383)`);
    show(tapon, 1 - K.tramo(gg, T.cae + 0.3, T.cae + 0.6));
    show(chorro, pico(gg, T.cae, 0.05, 0.6));
    quietos.forEach((q) => show(q, 1 - sube(gg, T.cae, T.cae + 0.8)));
    suben.forEach((e, i) => {
      const S = SUBEN[i], k = ((gg - T.cae) * 0.9 + S.f) % 1, on = sube(gg, T.cae, T.cae + 0.3);
      e.setAttribute("cx", f1(S.x)); e.setAttribute("cy", f1(300 - 560 * k));
      show(e, on * Math.sin(Math.PI * k));
    });
  };
}
function lupa(cam) {
  const g = el(cam, "g", { transform: `translate(${MC[0]} ${MC[1]}) scale(${1 / MZ})` });
  const clip = el(cam, "clipPath", { id: `${PRE}lente` });
  el(clip, "circle", { r: RL });
  const d = el(g, "g", { "clip-path": "url(#c-lente)" });
  el(d, "rect", { x: -RL, y: -RL, width: 2 * RL, height: 2 * RL, fill: "url(#c-tejido)" });
  const rb = K.azar(31);
  for (let i = 0; i < 14; i++) el(d, "ellipse", { cx: f1((rb() - 0.5) * 1500), cy: f1((rb() - 0.5) * 1500), rx: f1(90 + rb() * 120), ry: f1(40 + rb() * 50), fill: "rgba(255,150,170,0.05)", stroke: "rgba(255,170,190,0.1)", "stroke-width": 5 });
  const ar = articulacion(d, false);
  const bo = botella(d);
  // la flecha que tira del dedo, sobre la falange
  const flecha = el(d, "g", { opacity: 0 });
  el(flecha, "path", { d: "M0 -560 L-70 -470 L-26 -470 L-26 -300 L26 -300 L26 -470 L70 -470 Z", fill: CIAN, stroke: "#e8fbff", "stroke-width": 6 });
  // el reloj de los 20 minutos, alrededor de la junta
  const reloj = el(d, "g", { opacity: 0 });
  el(reloj, "circle", { r: 450, fill: "none", stroke: "rgba(95,212,255,0.16)", "stroke-width": 18 });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * 6.283 - Math.PI / 2;
    el(reloj, "path", { d: `M${f1(430 * Math.cos(a))} ${f1(430 * Math.sin(a))} L${f1(400 * Math.cos(a))} ${f1(400 * Math.sin(a))}`, stroke: "rgba(95,212,255,0.45)", "stroke-width": 6, "stroke-linecap": "round" });
  }
  const arco = el(reloj, "circle", { r: 450, fill: "none", stroke: CIAN, "stroke-width": 18, "stroke-linecap": "round", transform: "rotate(-90)", "stroke-dasharray": `0 ${f1(2 * Math.PI * 450)}` });
  const aguja = el(reloj, "circle", { r: 24, fill: "#e8fbff" });
  // el cristal
  el(g, "path", { d: `M${-RL * 0.72} ${-RL * 0.3} A${RL * 0.8} ${RL * 0.8} 0 0 1 ${-RL * 0.28} ${-RL * 0.72}`, fill: "none", stroke: "rgba(255,255,255,0.14)", "stroke-width": 26, "stroke-linecap": "round" });
  el(g, "circle", { r: RL, fill: "none", stroke: "#2a3039", "stroke-width": 44 });
  el(g, "circle", { r: RL + 14, fill: "none", stroke: "rgba(200,215,230,0.55)", "stroke-width": 8 });
  el(g, "circle", { r: RL - 22, fill: "none", stroke: "rgba(255,255,255,0.18)", "stroke-width": 6 });
  return (gg) => {
    const sep = sepL(gg), b = burL(gg);
    const cracs = [T.crac, CAV1, CAV3];
    let onda = -1;
    cracs.forEach((t) => { if (gg >= t && gg < t + 0.7) onda = (gg - t) / 0.7; });
    ar(sep, b, {
      g: gg, fizz: fizz(gg), onda,
      pulso: pico(gg, T.crac, 0.06, 0.5),
      liquido: asoma(gg, T.liquido - 0.05, 8.6) * (0.6 + 0.4 * Math.sin(vuelta(gg, 2))),
      parpadeo: asoma(gg, T.gas2, 9.6),
    });
    bo(gg);
    show(flecha, asoma(gg, 11.9, 13.7) + asoma(gg, 26.5, 27.6));
    flecha.setAttribute("transform", `translate(0 ${f1(-200 * sep - 30 * Math.sin(vuelta(gg, 1.5)))})`);
    show(reloj, asoma(gg, T.esperar - 0.1, 31.5));
    const p = K.tramo(gg, T.esperar, 31.3), Lc = 2 * Math.PI * 450;
    arco.setAttribute("stroke-dasharray", `${f1(Lc * p)} ${f1(Lc)}`);
    const a = p * 6.283 - Math.PI / 2;
    aguja.setAttribute("cx", f1(450 * Math.cos(a))); aguja.setAttribute("cy", f1(450 * Math.sin(a)));
  };
}

// ── la mano grande: el dedo corazón sube cuando se tira, y la flecha de fuera ──────────────────────────────────────
function manoGrande(cam) {
  el(cam, "ellipse", { cx: 560, cy: 1300, rx: 700, ry: 800, fill: "url(#c-luz)" });
  const m = mano(cam);
  // el mango de la lupa
  const a = Math.PI / 4, x0 = MC[0] + (RW + 6) * Math.cos(a), y0 = MC[1] + (RW + 6) * Math.sin(a);
  el(cam, "path", { d: `M${f1(x0)} ${f1(y0)} L${f1(x0 + 230)} ${f1(y0 + 230)}`, stroke: "#20252d", "stroke-width": 58, "stroke-linecap": "round" });
  el(cam, "path", { d: `M${f1(x0 + 10)} ${f1(y0 + 2)} L${f1(x0 + 220)} ${f1(y0 + 212)}`, stroke: "rgba(255,255,255,0.14)", "stroke-width": 12, "stroke-linecap": "round" });
  const flecha = el(cam, "path", { d: "M540 600 L505 650 L527 650 L527 720 L553 720 L553 650 L575 650 Z", fill: CIAN, stroke: "#e8fbff", "stroke-width": 3, opacity: 0 });
  return (g) => {
    const sep = sepL(g);
    m.dc.setAttribute("transform", `translate(0 ${f1(-25 * sep)})`);
    show(flecha, asoma(g, 45.15, 46.35));
    flecha.setAttribute("transform", `translate(0 ${f1(-25 * sep - 14 * Math.sin(vuelta(g, 1.5)))})`);
  };
}
// el estallido de rayas del crac, alrededor de la lupa
const RAYAS = Array.from({ length: 14 }, (_, i) => { const r = K.azar(800 + i); return { a: (i / 14) * 6.283 + (r() - 0.5) * 0.25, l: 0.7 + r() * 0.6 }; });
function estallido(cam) {
  const rs = RAYAS.map((_, i) => el(cam, "path", { stroke: i % 2 ? "#fff3cf" : ORO, "stroke-width": 16, "stroke-linecap": "round", opacity: 0 }));
  return (g) => {
    const t = [T.crac, CAV3].find((t) => g >= t && g < t + 0.6);
    rs.forEach((e, i) => {
      if (t == null) { show(e, 0); return; }
      const u = (g - t) / 0.6, R = RAYAS[i], r0 = RW + 30 + 80 * K.sale(u), r1 = r0 + 120 * R.l * (1 - 0.6 * u);
      e.setAttribute("d", `M${f1(MC[0] + r0 * Math.cos(R.a))} ${f1(MC[1] + r0 * Math.sin(R.a))} L${f1(MC[0] + r1 * Math.cos(R.a))} ${f1(MC[1] + r1 * Math.sin(R.a))}`);
      show(e, 1 - K.suave(u));
    });
  };
}

// ── la resonancia: el dedo en un tubo, tirado por un cable; el barrido lo vuelve gris por dentro ────────────────────
const PANEL = { x0: RM[0] - 430, x1: RM[0] + 430, y0: 420, y1: 1660 };
const ARRIBA = [[-360, 200], [-345, -150], [-280, -420], [-255, -700], [-245, -900], [-170, -1000], [0, -1020], [170, -1000], [245, -900], [255, -700], [280, -420], [345, -150], [360, 200]];
const ABAJO = [[-360, -100], [-375, 250], [-340, 550], [-330, 800], [-420, 1100], [-700, 1500], [-900, 2200], [900, 2200], [700, 1500], [420, 1100], [330, 800], [340, 550], [375, 250], [360, -100]];
function resonancia(cam) {
  el(cam, "ellipse", { cx: RM[0], cy: RM[1], rx: 800, ry: 900, fill: "url(#c-luz)" });
  const { x0, x1, y0, y1 } = PANEL;
  el(cam, "rect", { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 26, fill: "#05070a", stroke: "rgba(150,170,190,0.4)", "stroke-width": 5 });
  const clipP = el(cam, "clipPath", { id: `${PRE}panel` });
  el(clipP, "rect", { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 26 });
  const clipB = el(cam, "clipPath", { id: `${PRE}gris` });
  const ventana = el(clipB, "rect", { x: x0, y: y0, width: x1 - x0, height: 0 });
  const p = el(cam, "g", { "clip-path": "url(#c-panel)" });
  // antes del barrido: el dedo de verdad, con su piel
  const piel = el(p, "g");
  el(piel, "path", { d: curva(ABAJO, true), fill: "url(#c-dedo)" });
  const pielA = el(piel, "g");
  el(pielA, "path", { d: curva(ARRIBA, true), fill: "url(#c-dedo)" });
  el(pielA, "rect", { x: -120, y: -1000, width: 240, height: 140, rx: 60, fill: "#f0c3ad", stroke: "#c4876f", "stroke-width": 8, transform: "scale(1 1)" });
  // después: la imagen de la resonancia, en grises
  const gris = el(p, "g", { "clip-path": "url(#c-gris)" });
  el(gris, "rect", { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: "#030303" });
  const dentro = el(gris, "g");
  el(dentro, "path", { d: curva(ABAJO, true), fill: "url(#c-rm-tejido)" });
  const grisA = el(dentro, "g");
  el(grisA, "path", { d: curva(ARRIBA, true), fill: "url(#c-rm-tejido)" });
  const ar = articulacion(dentro, true);
  // las líneas de la pantalla
  for (let y = y0 + 6; y < y1; y += 14) el(p, "path", { d: `M${x0} ${y} L${x1} ${y}`, stroke: "rgba(255,255,255,0.035)", "stroke-width": 3 });
  // el tubo de cristal
  el(p, "path", { d: `M${RM[0] - 200} 1300 L${RM[0] - 200} 680 C${RM[0] - 200} 600 ${RM[0] + 200} 600 ${RM[0] + 200} 680 L${RM[0] + 200} 1300`, fill: "rgba(190,225,255,0.07)", stroke: "rgba(200,230,255,0.55)", "stroke-width": 6 });
  el(p, "path", { d: `M${RM[0] - 160} 1260 L${RM[0] - 160} 700`, stroke: "rgba(255,255,255,0.16)", "stroke-width": 10, "stroke-linecap": "round" });
  // el cable y su pinza
  const cable = el(p, "path", { fill: "none", stroke: "#c8ced6", "stroke-width": 7, "stroke-linecap": "round" });
  el(p, "rect", { x: RM[0] - 50, y: y0 + 4, width: 100, height: 34, rx: 8, fill: "#3a4250" });
  const pinza = el(p, "rect", { x: -26, y: -14, width: 52, height: 28, rx: 8, fill: "#3a4250" });
  // el barrido
  const barra = el(p, "rect", { x: x0, y: 0, width: x1 - x0, height: 70, fill: "url(#c-barrido)", opacity: 0 });
  const linea = el(p, "path", { stroke: CIAN, "stroke-width": 5, opacity: 0 });
  // el marco: esquinas y letras
  [[x0 + 24, y0 + 24, 1, 1], [x1 - 24, y0 + 24, -1, 1], [x0 + 24, y1 - 24, 1, -1], [x1 - 24, y1 - 24, -1, -1]].forEach(([x, y, sx, sy]) =>
    el(cam, "path", { d: `M${x} ${y + sy * 60} L${x} ${y} L${x + sx * 60} ${y}`, fill: "none", stroke: "rgba(150,200,230,0.6)", "stroke-width": 6 }));
  texto(cam, x0 + 80, y0 + 82, "RM", { "text-anchor": "start" }, 40, "rgba(170,200,220,0.7)");
  const rec = el(cam, "circle", { cx: x1 - 70, cy: y0 + 70, r: 14, fill: ROJO, opacity: 0 });
  return (g) => {
    const dy = 380 * (1 - metido(g)), sep = sepR(g), sh = 200 * sep;
    const tr = `translate(${RM[0]} ${f1(RM[1] + dy)}) scale(${RS})`;
    piel.setAttribute("transform", tr);
    dentro.setAttribute("transform", tr);
    pielA.setAttribute("transform", `translate(0 ${f1(-sh)})`);
    grisA.setAttribute("transform", `translate(0 ${f1(-sh)})`);
    let onda = -1;
    if (g >= CAV2 && g < CAV2 + 0.7) onda = (g - CAV2) / 0.7;
    ar(sep, burR(g), { g, onda, contorno: sube(g, T.burbuja3, T.burbuja3 + 0.3) });
    const b = barrido(g);
    ventana.setAttribute("height", f1((y1 - y0) * b));
    barra.setAttribute("y", f1(y0 + (y1 - y0) * b - 35));
    show(barra, b > 0 && b < 1 ? 1 : 0);
    linea.setAttribute("d", `M${x0} ${f1(y0 + (y1 - y0) * b)} L${x1} ${f1(y0 + (y1 - y0) * b)}`);
    show(linea, b > 0 && b < 1 ? 1 : 0);
    show(rec, b > 0 ? 0.6 + 0.4 * Math.sin(vuelta(g, 2)) : 0);
    // el cable: flojo hasta que tiran, luego tenso y vibrando
    const py = RM[1] + dy + (-1020 - sh) * RS, t = tenso(g);
    const vib = t * 10 * Math.sin((g - 19.76) * 70) * Math.exp(-Math.max(0, g - 19.76) * 3);
    const top = y0 + 38, mid = (py + top) / 2;
    cable.setAttribute("d", `M${RM[0]} ${f1(py)} Q${f1(RM[0] + 90 * (1 - t) + vib)} ${f1(mid)} ${RM[0]} ${top}`);
    pinza.setAttribute("transform", `translate(${RM[0]} ${f1(py)})`);
  };
}

// ── las dos manos del médico: la izquierda cruje sin parar 50 años; la derecha, nunca ──────────────────────────────
const NUD = Object.values(DEDOS).map(([b]) => [MANOS.iz[0] - MANOS.s * (b[0] - 540), MANOS.iz[1] + MANOS.s * (b[1] - 1180)]);
const POPS = Array.from({ length: 41 }, (_, k) => ({ t: T.crujio + 4.96 * (k / 40) ** 0.7, n: [1, 0, 2, 3][(k * 7 + (k >> 2)) % 4] }));
const cracsEn = (g) => g < T.crujio ? 0 : Math.round(36500 * Math.min(1, ((g - T.crujio) / 4.96) ** (1 / 0.7)));
const anosEn = (g) => Math.round(50 * K.tramo(g, T.crujio, 37.4));
function medico(cam) {
  const [ix, iy] = MANOS.iz, [dx, dy] = MANOS.de, s = MANOS.s;
  el(cam, "ellipse", { cx: -2000, cy: 1100, rx: 800, ry: 800, fill: "url(#c-luz)" });
  const brilloI = el(cam, "ellipse", { cx: ix, cy: iy + 40, rx: 260, ry: 380, fill: "url(#c-punto-c)", opacity: 0 });
  const verdeI = el(cam, "ellipse", { cx: ix, cy: iy + 40, rx: 260, ry: 380, fill: "url(#c-punto-v)", opacity: 0 });
  const verdeD = el(cam, "ellipse", { cx: dx, cy: dy + 40, rx: 260, ry: 380, fill: "url(#c-punto-v)", opacity: 0 });
  mano(cam, `translate(${ix} ${iy}) scale(${-s} ${s}) translate(-540 -1180)`);
  const de = mano(cam, `translate(${dx} ${dy}) scale(${s}) translate(-540 -1180)`);
  const sombra = el(cam, "rect", { x: dx - 200, y: 700, width: 400, height: 900, fill: "#0b0e12", opacity: 0 });
  // los crac de la mano izquierda: estrellitas en los nudillos
  const pops = [0, 1, 2, 3, 4, 5].map(() => {
    const gg = el(cam, "g", { opacity: 0 });
    el(gg, "circle", { r: 34, fill: "url(#c-punto-c)" });
    const ani = el(gg, "circle", { r: 20, fill: "none", stroke: CIAN, "stroke-width": 5 });
    const ray = el(gg, "path", { d: "M0 -30 L0 -52 M26 -18 L44 -30 M-26 -18 L-44 -30", stroke: "#e8fbff", "stroke-width": 6, "stroke-linecap": "round" });
    return { gg, ani, ray };
  });
  // la medalla del Ig Nobel, que baja colgada de su cinta
  const med = el(cam, "g", { opacity: 0 });
  el(med, "path", { d: "M-70 -560 L-20 -150 L20 -150 L70 -560 Z", fill: "#c8343f" });
  el(med, "path", { d: "M-20 -560 L0 -150 M20 -560 L0 -150", stroke: "#f2f2f2", "stroke-width": 10 });
  el(med, "circle", { r: 190, fill: "url(#c-punto-o)" });
  el(med, "circle", { r: 150, fill: "url(#c-oro)", stroke: "#8a5c12", "stroke-width": 8 });
  el(med, "circle", { r: 124, fill: "none", stroke: "rgba(255,240,190,0.7)", "stroke-width": 5 });
  texto(med, 0, -6, "IG NOBEL", {}, 44, "#5a3a08");
  texto(med, 0, 52, "2009", {}, 50, "#5a3a08");
  el(med, "ellipse", { cx: -60, cy: -70, rx: 40, ry: 22, fill: "rgba(255,255,255,0.45)", transform: "rotate(-35 -60 -70)" });
  const brillo = el(med, "path", { d: "M0 -60 L9 -12 L60 0 L9 12 L0 60 L-9 12 L-60 0 L-9 -12 Z", fill: "#fff", opacity: 0 });
  return (g) => {
    show(brilloI, asoma(g, T.izquierda - 0.1, 40.0) * (0.7 + 0.3 * Math.sin(vuelta(g, 2))));
    show(sombra, 0.45 * (sube(g, 34.6, 35.2) - sube(g, 39.6, 40.2)));
    show(verdeI, asoma(g, T.ninguna, 44.0)); show(verdeD, asoma(g, T.ninguna + 0.2, 44.0));
    pops.forEach((p, j) => {
      let P = null;
      for (let k = j; k < POPS.length; k += 6) if (g >= POPS[k].t && g < POPS[k].t + 0.28) P = POPS[k];
      if (!P) { show(p.gg, 0); return; }
      const u = (g - P.t) / 0.28, [x, y] = NUD[P.n];
      p.gg.setAttribute("transform", `translate(${f1(x)} ${f1(y - 6)}) scale(${f1(0.8 + 0.5 * K.sale(u))})`);
      p.ani.setAttribute("r", f1(16 + 30 * K.sale(u)));
      show(p.gg, 1 - K.suave(u));
    });
    const u = K.sale(K.tramo(g, T.ig, T.ig + 0.5)), sw = 7 * Math.sin((g - T.ig) * 7) * Math.exp(-Math.max(0, g - T.ig) * 1.6);
    med.setAttribute("transform", `translate(-2000 ${f1(-300 + 1220 * u)}) rotate(${f1(sw)} 0 -560) scale(0.7)`);
    show(med, u > 0 ? 1 - sube(g, 44.0, 44.25) : 0);
    show(brillo, pico(g, T.ig + 0.55, 0.1, 0.6));
  };
}

// ── el polvo que flota delante de la luz ─────────────────────────────────────────────────────────────────────────
function polvo(cam) {
  const r = K.azar(9), ps = [];
  for (let i = 0; i < 30; i++) ps.push({ e: el(cam, "circle", { r: 2 + r() * 4, fill: "rgba(255,210,170,0.4)" }), x: r() * 1400 - 160, f: r(), w: r() * 6.28 });
  return (g) => ps.forEach((p) => {
    const u = (ciclo(g, 0.05) + p.f) % 1;
    p.e.setAttribute("cx", f1(p.x + 30 * Math.sin(vuelta(g, 0.04) + p.w)));
    p.e.setAttribute("cy", f1(1750 - u * 1400));
    p.e.setAttribute("opacity", f1(0.55 * Math.sin(Math.PI * u)));
  });
}

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,170,110,0.2)"/><stop offset="1" stop-color="rgba(255,170,110,0)"/></radialGradient>
  <radialGradient id="c-mano" gradientUnits="userSpaceOnUse" cx="560" cy="1450" r="650"><stop offset="0" stop-color="#e9ab8c"/><stop offset="0.6" stop-color="#cf8a6a"/><stop offset="1" stop-color="#a8634a"/></radialGradient>
  <linearGradient id="c-dedo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c5a42"/><stop offset="0.3" stop-color="#d99a7a"/><stop offset="0.5" stop-color="#eab092"/><stop offset="0.78" stop-color="#d08c6c"/><stop offset="1" stop-color="#9c5a42"/></linearGradient>
  <radialGradient id="c-brillo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,228,210,0.22)"/><stop offset="1" stop-color="rgba(255,228,210,0)"/></radialGradient>
  <linearGradient id="c-tejido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1018"/><stop offset="1" stop-color="#3e1824"/></linearGradient>
  <linearGradient id="c-hueso" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9b48c"/><stop offset="0.45" stop-color="#f3e8d2"/><stop offset="1" stop-color="#d2bf9a"/></linearGradient>
  <linearGradient id="c-rm-hueso" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a9a9a"/><stop offset="0.5" stop-color="#e2e2e2"/><stop offset="1" stop-color="#a8a8a8"/></linearGradient>
  <linearGradient id="c-rm-tejido" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2e2e2e"/><stop offset="0.5" stop-color="#6a6a6a"/><stop offset="1" stop-color="#343434"/></linearGradient>
  <radialGradient id="c-burbuja" cx="0.42" cy="0.4" r="0.6"><stop offset="0" stop-color="rgba(230,250,255,0.95)"/><stop offset="0.5" stop-color="rgba(95,212,255,0.75)"/><stop offset="1" stop-color="rgba(40,150,210,0.6)"/></radialGradient>
  <radialGradient id="c-destello" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.95)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
  <radialGradient id="c-punto-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,246,216,0.7)"/><stop offset="0.35" stop-color="rgba(255,194,74,0.45)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-punto-c" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(232,251,255,0.9)"/><stop offset="0.35" stop-color="rgba(95,212,255,0.55)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <radialGradient id="c-punto-v" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(34,211,138,0.45)"/><stop offset="0.5" stop-color="rgba(34,211,138,0.2)"/><stop offset="1" stop-color="rgba(34,211,138,0)"/></radialGradient>
  <linearGradient id="c-barrido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(95,212,255,0)"/><stop offset="0.5" stop-color="rgba(95,212,255,0.4)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></linearGradient>
  <radialGradient id="c-oro" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff0b0"/><stop offset="0.45" stop-color="#f0b43a"/><stop offset="1" stop-color="#a8721a"/></radialGradient>
</defs>`;

// ── las etiquetas (en pantalla, sujetas a un punto del mundo o a un sitio fijo) ─────────────────────────────────
function etiqueta(cont, html, clase = "") { return K.crear(cont, `<div class="c-etq ${clase}">${typeof html === "function" ? html(0) : html}</div>`); }
function pon(e, sx, sy, on, dy = 24) {
  if (on <= 0.001) { e.style.opacity = 0; return; }
  const w = e.offsetWidth, h = e.offsetHeight;
  const x = Math.min(Math.max(sx, 40 + w / 2), 1040 - w / 2), y = Math.min(Math.max(sy, 560 + h / 2), 1440 - h / 2);
  e.style.opacity = on;
  e.style.transform = `translate(${f1(x - w / 2)}px, ${f1(y - h / 2 + (1 - on) * dy)}px) scale(${f1(0.9 + 0.1 * on)})`;
}
const junto = (wx, wy, dx = 0, dy = 0) => (k) => { const [x, y] = pantalla(k, wx, wy); return [x + dx, y + dy]; };
const enLente = (lx, ly, dx = 0, dy = 0) => { const [wx, wy] = enMundo(lx, ly); return junto(wx, wy, dx, dy); };
const fijo = (x, y) => () => [x, y];

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on) => L.push({ e: etiqueta(capa, html, clase), html, sitio, on, ultimo: null });
  const abajo = fijo(540, 1400);
  // hook
  r(`¡<b>CRAC</b>!`, "o x", junto(MC[0] + 140, MC[1] - 330), (g) => asoma(g, T.crac, 1.6));
  r(`<b>burbuja</b> de gas`, "c g", abajo, (g) => asoma(g, T.burbuja, 3.5));
  r(`tu <b>nudillo</b>`, "o", junto(MC[0], MC[1] + 300), (g) => asoma(g, T.nudillo, 4.45));
  // la junta
  r(`no se <b>rompe</b> nada`, "v g", abajo, (g) => asoma(g, 5.0, 5.9));
  r(`los huesos <b>no chocan</b>`, "v", abajo, (g) => asoma(g, 5.95, 6.85));
  r(`un <b>líquido</b>`, "o g", abajo, (g) => asoma(g, T.liquido, 8.4));
  r(`<b>gas</b> disuelto`, "c g", abajo, (g) => asoma(g, T.gas2, 9.7));
  r(`un <b>refresco</b> cerrado`, "c", enLente(BOT, 360, 0, 70), (g) => asoma(g, T.refresco, 11.1));
  r(`se <b>separan</b>`, "", abajo, (g) => asoma(g, T.separan, 14.0));
  r(`la presión <b>cae</b>`, "r g", abajo, (g) => asoma(g, T.presion, 15.5));
  r(`una <b>burbuja</b>`, "c g", abajo, (g) => asoma(g, 15.95, 16.9));
  // la resonancia
  r(`<b>resonancia</b>`, "c", abajo, (g) => asoma(g, T.resonancia, 20.6));
  r(`un <b>cable</b>`, "", abajo, (g) => asoma(g, T.cable, 21.8));
  r(`¡<b>CRAC</b>!`, "o x", abajo, (g) => asoma(g, T.crac2, 23.3));
  r(`un hueco <b>negro</b>`, "", abajo, (g) => asoma(g, T.hueco, 25.0));
  r(`la <b>burbuja</b>`, "c g", abajo, (g) => asoma(g, T.burbuja3, 25.75));
  // la espera
  r(`<b>sin</b> crac`, "r g", abajo, (g) => asoma(g, T.enseguida, 28.5));
  r(`<b>20</b> minutos`, "c g", abajo, (g) => asoma(g, T.veinte, 31.75));
  // las dos manos
  r(`¿<b>artrosis</b>?`, "r g", abajo, (g) => asoma(g, T.artrosis, 33.1));
  r((g) => `<b>${anosEn(g)}</b> años`, "o g", fijo(540, 600), (g) => asoma(g, T.crujio, 40.1));
  r((g) => `<b>${miles(cracsEn(g))}</b> cracs`, "c g", fijo(310, 1400), (g) => asoma(g, T.crujio, 40.1));
  r(`<b>0</b> cracs`, "g", fijo(790, 1400), (g) => asoma(g, T.izquierda, 40.1));
  r(`sin <b>artrosis</b>`, "v", fijo(310, 1400), (g) => asoma(g, T.ninguna, 44.0));
  r(`sin <b>artrosis</b>`, "v", fijo(790, 1400), (g) => asoma(g, T.ninguna + 0.2, 44.0));
  // el cierre
  r(`no se <b>rompe</b> nada`, "v g", abajo, (g) => asoma(g, T.nada2, 46.3));
  r(`¡<b>CRAC</b>!`, "o x", junto(MC[0] + 140, MC[1] - 330), (g) => asoma(g, T.crac3, 47.0));
  r(`un <b>refresco</b>`, "c g", abajo, (g) => asoma(g, T.refresco2, 48.9));
  return (g, k) => L.forEach((l) => {
    const on = l.on(g);
    if (typeof l.html === "function" && on > 0.001) {
      const s = l.html(g);
      if (s !== l.ultimo) { l.e.innerHTML = s; l.ultimo = s; }
    }
    const [x, y] = l.sitio(k);
    pon(l.e, x, y, on);
  });
}

// ── lo que tiene cada escena, por capas: el fondo, el mundo, la viñeta, la sombra de arriba y la pantalla ─────────
export function montaje(esc) {
  estilos();
  PRE = `c${++escenas}-`;
  K.crear(esc, `<div class="c-fondo"></div>`);
  const mundo = K.crear(esc, `<div class="c-mundo"></div>`);
  const sv = K.crear(mundo, ids(`<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">${DEFS}<g class="c-cam"></g></svg>`));
  const cam = sv.querySelector(".c-cam");
  el(cam, "rect", { x: -4000, y: -2000, width: 9000, height: 7500, fill: "#0b0e12" });
  const pv = polvo(cam);
  const mg = manoGrande(cam);
  const lu = lupa(cam);
  const es = estallido(cam);
  const rm = resonancia(cam);
  const me = medico(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const ro = rotulos(capa);
  return { cam, pv, mg, lu, es, rm, me, ro };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los 0,3 s en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // los golpes: la cámara da un respingo con cada crac y con la medalla
    const sac = Math.max(pico(g, T.crac, 0.06, 0.45), 0.8 * pico(g, CAV1, 0.06, 0.45), 0.8 * pico(g, CAV2, 0.06, 0.45), pico(g, CAV3, 0.06, 0.45), 0.4 * pico(g, T.ig + 0.5, 0.05, 0.35));
    const kx = k.x + sac * 7 * Math.sin(g * 90), ky = k.y + sac * 6 * Math.cos(g * 77), kz = k.z * (1 + 0.035 * sac);
    E.cam.setAttribute("transform", `translate(${(540 - kx * kz).toFixed(2)} ${(1000 - ky * kz).toFixed(2)}) scale(${kz.toFixed(4)})`);
    E.pv(g);
    E.mg(g);
    E.lu(g);
    E.es(g);
    E.rm(g);
    E.me(g);
    E.ro(g, { x: kx, y: ky, z: kz });
    return { g, k };
  };
  return E;
}
