// Lo que sale en todas las escenas: una cabeza de perfil mirando a la izquierda, en una habitación a oscuras, con su
// móvil delante de la boca y una nota de voz sonando. Por dentro, el cráneo, la mandíbula, el oído interno y la laringe.
// Lo que va por el aire, en cian; lo que va por el hueso, en dorado; lo que falta, en rojo. Todo en 2D, con la cámara
// dentro del svg (un transform del grupo), para que de cerca se vea nítido.
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a";
export const F0 = { x: 430, y: 1000, z: 1.45 };                 // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar (la nota de voz, las ondas, el polvo) da un número entero de
// vueltas en TOTAL segundos: así el último fotograma empalma con el primero.
export const TOTAL = 48.53;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, cabeza: 6.65, craneo: 15.84, micro: 27.36, tapado: 32.84, experimento: 38.46, cierre: 44.32 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  verdad: 2.56, grabe: 4.16, mal: 4.48, asi: 5.16, oyen: 5.6, todos: 5.92,
  rara: 7.22, oyes: 8.1, dos: 9.86, fuera: 11.72, sale: 12.48, boca: 12.95, cruza: 13.36, aire: 13.96, entra: 14.4, oreja: 14.92,
  otro: 16.04, dentro: 16.7, hablar: 17.7, vibran: 18.22, huesos: 18.78, llevan: 19.98, oido: 20.92,
  hueso: 21.92, pasar: 22.6, graves: 23.4, grave: 25.72, lleno: 26.52,
  micro: 27.66, oye: 28.18, aire2: 28.5, audio: 29.54, faltan: 30.07, graves2: 30.66, fino: 31.94,
  tapate: 32.86, oidos: 33.38, habla: 33.94, casi: 34.69, hueso2: 35.86, aun: 36.98, mas: 37.34,
  experimento: 38.84, puntuo: 39.8, grabada: 40.6, mejor: 41.0, sin: 42.56, suya: 43.56,
  asi2: 44.36, rara2: 45.16, audio2: 46.36, oyes2: 47.66, tu2: 47.98,
};

// lo que pasa en cada momento (de 0 a 1)
const corte = (g) => sube(g, T.dentro - 0.1, T.dentro + 0.5) - sube(g, 27.4, 28.0) + sube(g, T.habla, T.habla + 0.6) - sube(g, 38.4, 38.95);
const hueso = (g) => Math.max(sube(g, T.hablar, T.vibran + 0.2) - sube(g, 27.3, 27.8), 0.55 * (sube(g, 27.3, 27.8) - sube(g, 32.6, 33.0)), sube(g, T.habla, T.habla + 0.4) - sube(g, 38.2, 38.6));
const aireOn = (g) => sube(g, T.fuera, T.fuera + 0.4) - sube(g, 15.7, 16.3) + sube(g, T.habla, T.habla + 0.4) - sube(g, 38.2, 38.6);
const microOn = (g) => sube(g, T.oye, T.oye + 0.35) - sube(g, 32.5, 32.9);
const boca = (g) => sube(g, T.sale, T.sale + 0.3) - sube(g, 15.7, 16.3) + sube(g, T.hablar, T.hablar + 0.3) - sube(g, 21.6, 22.0)
  + sube(g, 27.6, 28.0) - sube(g, 32.5, 32.9) + sube(g, T.habla, T.habla + 0.3) - sube(g, 38.2, 38.6);
const movil = (g) => 1 - sube(g, 6.2, 6.9) + sube(g, 44.5, 45.2);             // la nota de voz suena
const lista = (g) => sube(g, 38.85, 39.35) - sube(g, 44.4, 44.9);             // la pantalla del experimento
const dedoOn = (g) => sube(g, T.tapate, T.oidos) - sube(g, 38.3, 38.9);
const tapado = (g) => sube(g, T.oidos - 0.1, T.oidos + 0.25) - sube(g, 38.3, 38.7);
const fino = (g) => sube(g, T.fino - 0.1, T.fino + 0.4) - sube(g, 32.6, 33.2);

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
.c-etq.c b { color: ${CIAN}; } .c-etq.o b { color: ${ORO}; } .c-etq.r b { color: ${ROJO}; } .c-etq.v b { color: ${VERDE}; }
.c-etq.c { border-color: rgba(95,212,255,0.45); } .c-etq.o { border-color: rgba(255,194,74,0.5); } .c-etq.r { border-color: rgba(240,68,90,0.5); } .c-etq.v { border-color: rgba(34,211,138,0.5); }
.c-etq.g { font-size: 56px; padding: 12px 30px; }
.c-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }
.c-etq .tacha { position: absolute; left: 12px; right: 12px; top: 48%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240,68,90,0.7); }
.c-espectro { position: absolute; left: 70px; top: 1222px; width: 940px; height: 220px; opacity: 0; border-radius: 26px;
  background: rgba(12,15,19,0.9); border: 2px solid rgba(255,255,255,0.14); box-shadow: 0 14px 40px rgba(0,0,0,0.5); }
.c-espectro .tit { position: absolute; left: 0; right: 0; top: 14px; height: 46px; font-family: var(--letra), sans-serif; font-size: 38px; font-weight: 800; color: #fff; text-align: center; }
.c-espectro .tit span { position: absolute; left: 0; right: 0; top: 0; }
.c-espectro .lado { position: absolute; top: 20px; font-family: var(--letra), sans-serif; font-size: 32px; font-weight: 600; color: #8b939d; }
.c-espectro .barra { position: absolute; bottom: 22px; width: 38px; }
.c-espectro .barra i { position: absolute; left: 0; right: 0; bottom: 0; border-radius: 7px 7px 3px 3px; }
.c-espectro .barra .ai { background: linear-gradient(to top, #2a8fbf, ${CIAN}); }
.c-espectro .barra .ho { background: linear-gradient(to top, #d9932a, ${ORO}); box-shadow: 0 0 14px rgba(255,194,74,0.45); }
.c-espectro .barra .fa { border: 3px dashed ${ROJO}; border-bottom: none; background: rgba(240,68,90,0.08); }
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
  [0, F0], [2.4, { x: 418, y: 998, z: 1.6 }], [3.6, { x: 424, y: 1002, z: 1.56 }],     // la nota de voz
  [6.1, { x: 610, y: 1060, z: 0.86 }],                                                 // así te oyen todos
  [7.4, { x: 690, y: 1062, z: 0.8 }], [10.6, { x: 700, y: 1072, z: 0.8 }], [12.6, { x: 705, y: 1080, z: 0.82 }], // la cabeza
  [15.0, { x: 815, y: 1045, z: 0.95 }], [17.0, { x: 822, y: 1040, z: 1.0 }], [19.2, { x: 842, y: 1030, z: 1.06 }], // por dentro
  [20.9, { x: 892, y: 990, z: 1.75 }], [21.9, { x: 888, y: 994, z: 1.72 }],           // el oído interno
  [23.2, { x: 850, y: 1090, z: 1.1 }], [26.9, { x: 846, y: 1094, z: 1.13 }],          // los graves
  [28.2, { x: 480, y: 1118, z: 1.05 }], [32.0, { x: 488, y: 1120, z: 1.08 }],         // el micro
  [33.7, { x: 850, y: 1090, z: 1.1 }], [37.9, { x: 852, y: 1088, z: 1.15 }],          // tapado
  [39.5, { x: 290, y: 1020, z: 1.9 }], [41.6, { x: 292, y: 1050, z: 2.02 }], [43.9, { x: 290, y: 1110, z: 2.2 }],          // el experimento, en la pantalla
  [45.6, { x: 422, y: 1004, z: 1.52 }], [TOTAL, F0],
];
export const camaraEn = (g) => camara(g, CAMINO);

// ── svg ─────────────────────────────────────────────────────────────────────────────────────────────────────────
function el(padre, tag, at = {}) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, typeof at[k] === "string" ? at[k].replace("url(#c-", `url(#${PRE}`) : at[k]);
  padre.appendChild(e);
  return e;
}
function texto(padre, x, y, s, at = {}) {
  const e = el(padre, "text", { x, y, "font-family": "Figtree, sans-serif", fill: "#e9edef", ...at });
  e.textContent = s;
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

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(120,160,210,0.26)"/><stop offset="1" stop-color="rgba(120,160,210,0)"/></radialGradient>
  <linearGradient id="c-piel" gradientUnits="userSpaceOnUse" x1="500" y1="700" x2="1200" y2="1000"><stop offset="0" stop-color="#f3c6a8"/><stop offset="0.45" stop-color="#e2a586"/><stop offset="1" stop-color="#a8664c"/></linearGradient>
  <linearGradient id="c-cuello" gradientUnits="userSpaceOnUse" x1="680" y1="0" x2="1060" y2="0"><stop offset="0" stop-color="#d19174"/><stop offset="0.5" stop-color="#c58468"/><stop offset="1" stop-color="#8f5340"/></linearGradient>
  <radialGradient id="c-brillo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,236,222,0.5)"/><stop offset="1" stop-color="rgba(255,236,222,0)"/></radialGradient>
  <radialGradient id="c-rubor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(222,110,100,0.32)"/><stop offset="1" stop-color="rgba(222,110,100,0)"/></radialGradient>
  <linearGradient id="c-pelo" gradientUnits="userSpaceOnUse" x1="600" y1="430" x2="1200" y2="1100"><stop offset="0" stop-color="#3a2820"/><stop offset="1" stop-color="#1c130f"/></linearGradient>
  <radialGradient id="c-hueso" gradientUnits="userSpaceOnUse" cx="760" cy="700" r="620"><stop offset="0" stop-color="#d9cdb2"/><stop offset="0.7" stop-color="#b9aa88"/><stop offset="1" stop-color="#8f8264"/></radialGradient>
  <radialGradient id="c-oro" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,194,74,0.55)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-punto-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6d8"/><stop offset="0.35" stop-color="${ORO}"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-punto-c" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e8fbff"/><stop offset="0.35" stop-color="${CIAN}"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <linearGradient id="c-dedo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0c0a2"/><stop offset="0.55" stop-color="#d99a7b"/><stop offset="1" stop-color="#a9654c"/></linearGradient>
  <linearGradient id="c-marco" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4f57"/><stop offset="0.5" stop-color="#22252a"/><stop offset="1" stop-color="#3b3f46"/></linearGradient>
  <linearGradient id="c-cristal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.10)"/><stop offset="0.35" stop-color="rgba(255,255,255,0.02)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>
  <pattern id="c-chat" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#0b141a"/><circle cx="12" cy="14" r="3" fill="#121c22"/><path d="M38 40 l8 -8 M42 48 l6 6" stroke="#121c22" stroke-width="3"/></pattern>
  <clipPath id="c-pantalla"><rect x="152" y="692" width="276" height="616" rx="34"/></clipPath>
</defs>`;

// ── la cabeza ───────────────────────────────────────────────────────────────────────────────────────────────────
const PERFIL = [
  [700, 1880], [692, 1600], [680, 1440], [664, 1386], [676, 1332], [690, 1292],
  [640, 1262], [594, 1244], [558, 1214], [548, 1174], [556, 1142], [566, 1126],
  [549, 1106], [545, 1088], [558, 1074], [548, 1062], [543, 1046], [554, 1024], [566, 1002],
  [548, 993], [522, 985], [502, 964], [507, 940], [528, 892], [548, 842], [565, 808],
  [553, 778], [551, 742], [560, 662], [590, 582], [650, 510], [740, 462], [860, 440], [980, 452], [1080, 500],
  [1150, 580], [1192, 690], [1205, 820], [1190, 950], [1150, 1060], [1100, 1140], [1062, 1192],
  [1040, 1300], [1045, 1500], [1064, 1880],
];
const PELO = [
  [578, 640], [600, 548], [660, 478], [750, 430], [880, 412], [1010, 428], [1110, 480], [1188, 570], [1222, 700], [1228, 850],
  [1210, 990], [1168, 1100], [1100, 1172], [1062, 1150], [1050, 1070], [1036, 960], [996, 862], [930, 842], [868, 870],
  [846, 960], [826, 900], [800, 790], [744, 700], [672, 650], [612, 640],
];
const OREJA = [[938, 890], [975, 866], [1012, 885], [1030, 940], [1022, 1000], [1002, 1042], [986, 1074], [960, 1080], [944, 1062], [945, 1030], [934, 1000], [929, 968], [928, 928]];
export const CANAL = [948, 975], COCLEA = [872, 990], BOCA = [548, 1068], MIC = [290, 1316], LARINGE = [702, 1362];

function cabeza(cam) {
  const piel = el(cam, "g");
  el(piel, "path", { d: curva(PERFIL) + " Z", fill: "url(#c-piel)" });
  el(piel, "path", { d: "M690 1292 C760 1300 880 1250 1000 1180 L1062 1192 C1040 1300 1040 1500 1064 1880 L700 1880 C692 1600 680 1440 664 1386 C668 1350 676 1320 690 1292 Z", fill: "url(#c-cuello)", opacity: 0.92 });
  el(piel, "path", { d: "M600 1242 C700 1262 860 1220 990 1120 C960 1180 880 1250 760 1290 C700 1300 650 1280 600 1242 Z", fill: "rgba(90,40,28,0.32)" });
  el(piel, "ellipse", { cx: 690, cy: 700, rx: 120, ry: 140, fill: "url(#c-brillo)" });
  el(piel, "ellipse", { cx: 545, cy: 930, rx: 30, ry: 60, fill: "url(#c-brillo)" });
  el(piel, "ellipse", { cx: 690, cy: 1000, rx: 110, ry: 90, fill: "url(#c-rubor)" });
  // el ojo, la ceja, la nariz y los labios
  el(piel, "path", { d: "M596 813 Q612 798 632 806 Q616 826 596 813 Z", fill: "#f1e7df" });
  el(piel, "ellipse", { cx: 603, cy: 812, rx: 5.5, ry: 8, fill: "#3a2a22" });
  el(piel, "path", { d: "M592 812 Q612 795 636 806", fill: "none", stroke: "#3a2620", "stroke-width": 4, "stroke-linecap": "round" });
  el(piel, "path", { d: "M600 826 Q616 830 630 822", fill: "none", stroke: "rgba(120,60,45,0.45)", "stroke-width": 3, "stroke-linecap": "round" });
  el(piel, "path", { d: "M566 772 Q606 756 652 770", fill: "none", stroke: "#2c1e18", "stroke-width": 10, "stroke-linecap": "round" });
  el(piel, "path", { d: "M540 985 Q552 979 562 992", fill: "none", stroke: "rgba(110,52,40,0.7)", "stroke-width": 5, "stroke-linecap": "round" });
  el(piel, "path", { d: "M560 984 Q584 990 588 1010", fill: "none", stroke: "rgba(110,52,40,0.35)", "stroke-width": 5, "stroke-linecap": "round" });
  el(piel, "path", { d: "M548 1026 Q541 1046 547 1060 L566 1066 Q568 1044 560 1026 Z", fill: "rgba(196,92,86,0.55)" });
  el(piel, "path", { d: "M549 1074 Q544 1090 552 1104 Q566 1102 572 1078 Z", fill: "rgba(196,92,86,0.5)" });
  el(piel, "path", { d: "M552 1068 Q572 1072 598 1069", fill: "none", stroke: "#8a3f3a", "stroke-width": 4, "stroke-linecap": "round" });
  el(piel, "path", { d: "M600 1060 Q610 1070 600 1080", fill: "none", stroke: "rgba(110,52,40,0.35)", "stroke-width": 3, "stroke-linecap": "round" });
  const pelo = el(cam, "g");
  el(pelo, "path", { d: curva(PELO, true), fill: "url(#c-pelo)" });
  const mech = el(pelo, "g", { fill: "none", stroke: "rgba(120,86,64,0.35)", "stroke-width": 4, "stroke-linecap": "round" });
  const r = K.azar(4);
  for (let i = 0; i < 26; i++) {
    const a = 0.15 + 0.8 * (i / 25), cx = 900 + 300 * Math.cos(Math.PI * (1.05 + a)) * 0.95, cy = 860 + 430 * Math.sin(Math.PI * (1.05 + a)) * 0.92;
    const l = 90 + r() * 80, an = Math.PI * (1.55 + a) + (r() - 0.5) * 0.3;
    el(mech, "path", { d: `M${f1(cx)} ${f1(cy)} q${f1(Math.cos(an) * l * 0.5 + 14)} ${f1(Math.sin(an) * l * 0.5)} ${f1(Math.cos(an) * l)} ${f1(Math.sin(an) * l)}` });
  }
  el(pelo, "path", { d: "M640 520 Q760 450 900 440", fill: "none", stroke: "rgba(200,170,150,0.18)", "stroke-width": 14, "stroke-linecap": "round" });
  return { piel, pelo };
}

function oreja(cam) {
  const g = el(cam, "g");
  el(g, "path", { d: curva(OREJA, true), fill: "#dc9e80", stroke: "rgba(120,60,45,0.55)", "stroke-width": 3 });
  el(g, "path", { d: curva([[982, 892], [1008, 930], [1010, 985], [994, 1032], [975, 1050]]), fill: "none", stroke: "rgba(120,60,45,0.5)", "stroke-width": 7, "stroke-linecap": "round" });
  el(g, "path", { d: curva([[950, 900], [985, 905], [998, 950]]), fill: "none", stroke: "rgba(255,226,206,0.5)", "stroke-width": 5, "stroke-linecap": "round" });
  el(g, "ellipse", { cx: 965, cy: 985, rx: 24, ry: 32, fill: "rgba(120,58,44,0.4)" });
  el(g, "ellipse", { cx: CANAL[0] + 2, cy: CANAL[1], rx: 9, ry: 12, fill: "#3e1f1a" });
  el(g, "path", { d: "M936 956 Q924 978 938 998 Q948 980 936 956 Z", fill: "#e2a688", stroke: "rgba(120,60,45,0.5)", "stroke-width": 2.5 });
  const brillo = el(g, "circle", { cx: CANAL[0], cy: CANAL[1], r: 40, fill: "none", stroke: CIAN, "stroke-width": 6, opacity: 0 });
  return { g, brillo };
}

// ── por dentro: el cráneo, la mandíbula, los dientes, la columna, el oído interno y la laringe ──────────────────────
function craneo(cam) {
  const g = el(cam, "g", { opacity: 0 });
  const col = el(g, "g");
  for (let i = 0; i < 12; i++) {
    const y = 1110 + i * 64, x = 1004 - i * 4;
    el(col, "rect", { x: x - 40, y, width: 80, height: 52, rx: 14, fill: "url(#c-hueso)", stroke: "#9c8b6a", "stroke-width": 3 });
    el(col, "rect", { x: x + 34, y: y + 10, width: 34, height: 30, rx: 10, fill: "#cfc1a0", stroke: "#9c8b6a", "stroke-width": 2.5 });
  }
  const huesos = el(g, "g");
  const CRANEO = [[588, 650], [640, 556], [760, 490], [880, 474], [1000, 488], [1100, 546], [1160, 660], [1176, 800], [1160, 930], [1120, 1030],
    [1060, 1080], [1010, 1072], [978, 1034], [900, 1006], [800, 968], [720, 952], [682, 922], [640, 878], [592, 862], [580, 800]];
  const MAXILAR = [[590, 860], [640, 880], [690, 924], [722, 956], [704, 1002], [662, 1034], [590, 1040], [574, 990], [570, 930]];
  const MANDIBULA = [[582, 1094], [668, 1092], [780, 1118], [860, 1078], [880, 1030], [905, 1008], [932, 1020], [916, 1062], [896, 1160],
    [870, 1214], [760, 1250], [640, 1252], [586, 1232], [568, 1190], [572, 1140]];
  const dC = curva(CRANEO, true), dX = curva(MAXILAR, true), dM = curva(MANDIBULA, true);
  [dC, dX, dM].forEach((d) => el(huesos, "path", { d, fill: "url(#c-hueso)", stroke: "#9c8b6a", "stroke-width": 4 }));
  el(huesos, "ellipse", { cx: 632, cy: 812, rx: 40, ry: 46, fill: "#3b2b22", stroke: "#9c8b6a", "stroke-width": 3 });
  el(huesos, "path", { d: "M582 900 Q600 930 586 968 Q572 940 582 900 Z", fill: "#3b2b22" });
  el(huesos, "path", { d: "M700 930 Q800 950 900 990", fill: "none", stroke: "rgba(140,120,90,0.6)", "stroke-width": 4 });
  el(huesos, "path", { d: "M700 820 Q760 700 900 640 M760 560 Q900 600 1060 700", fill: "none", stroke: "rgba(160,140,105,0.35)", "stroke-width": 3 });
  for (let i = 0; i < 5; i++) {
    el(huesos, "rect", { x: 578 + i * 19.5, y: 1034 + i * 1.2, width: 17, height: 27, rx: 6, fill: "#faf5ea", stroke: "#a89878", "stroke-width": 2 });
    el(huesos, "rect", { x: 582 + i * 19, y: 1064 + i * 1.5, width: 16, height: 25, rx: 6, fill: "#faf5ea", stroke: "#a89878", "stroke-width": 2 });
  }
  // el brillo dorado de los huesos que vibran
  const vib = el(g, "g", { fill: "none", stroke: ORO, "stroke-width": 6, opacity: 0, "stroke-linejoin": "round" });
  [dC, dX, dM].forEach((d) => el(vib, "path", { d }));
  // el oído interno: el conducto, el tímpano, la cóclea y los canales
  const oi = el(g, "g");
  el(oi, "path", { d: `M${CANAL[0]} ${CANAL[1]} Q925 970 902 978`, fill: "none", stroke: "#c8857a", "stroke-width": 20, "stroke-linecap": "round" });
  el(oi, "path", { d: `M${CANAL[0]} ${CANAL[1]} Q925 970 902 978`, fill: "none", stroke: "#5a2a25", "stroke-width": 10, "stroke-linecap": "round" });
  el(oi, "path", { d: "M900 962 L898 996", stroke: "#f6dccf", "stroke-width": 5, "stroke-linecap": "round" });
  let d = "";
  for (let i = 0; i <= 80; i++) {
    const a = i / 80 * Math.PI * 5, rr = 26 - 21 * i / 80;
    d += `${i ? "L" : "M"}${f1(COCLEA[0] + rr * Math.cos(a))} ${f1(COCLEA[1] + rr * Math.sin(a))}`;
  }
  el(oi, "circle", { cx: COCLEA[0], cy: COCLEA[1], r: 32, fill: "#f0d6cc", stroke: "#b77a6e", "stroke-width": 3 });
  const espiral = el(oi, "path", { d, fill: "none", stroke: "#c2655f", "stroke-width": 5, "stroke-linecap": "round" });
  ["M884 958 q-22 -40 6 -54 q26 -10 22 40", "M890 960 q34 -30 52 -6 q8 26 -40 18", "M880 962 q-40 -18 -30 -44 q20 -14 38 30"].forEach((p) =>
    el(oi, "path", { d: p, fill: "none", stroke: "#d78d82", "stroke-width": 6, "stroke-linecap": "round" }));
  const coc = el(oi, "circle", { cx: COCLEA[0], cy: COCLEA[1], r: 60, fill: "url(#c-oro)", opacity: 0 });
  // la laringe, donde nace la voz
  const lar = el(g, "g");
  el(lar, "path", { d: "M676 1330 L728 1330 L722 1398 Q702 1408 682 1398 Z", fill: "#e2c4b2", stroke: "#a07f6c", "stroke-width": 3 });
  el(lar, "path", { d: "M690 1342 Q702 1372 714 1342", fill: "none", stroke: "#b56a62", "stroke-width": 4 });
  const glo = el(lar, "circle", { cx: LARINGE[0], cy: LARINGE[1], r: 50, fill: "url(#c-oro)", opacity: 0 });
  return { g, huesos, vib, espiral, coc, glo };
}

// ── los caminos de la voz: por el aire (cian) y por el hueso (dorado), con puntos que corren ─────────────────────
const AIRE = [BOCA, [470, 1100], [468, 1200], [560, 1302], [700, 1316], [830, 1212], [918, 1086], CANAL];
const AL_MICRO = [BOCA, [478, 1140], [380, 1252], MIC];
const HUESOS = [
  [[606, 1076], [700, 1192], [820, 1192], [890, 1092], COCLEA],
  [[598, 1040], [680, 962], [780, 946], [850, 962], COCLEA],
  [LARINGE, [800, 1300], [900, 1182], [930, 1082], COCLEA],
];
function camino(padre, P, color, n, punto) {
  const linea = el(padre, "path", { d: curva(P), fill: "none", stroke: color, "stroke-width": 7, "stroke-linecap": "round", "stroke-dasharray": "2 18", opacity: 0 });
  const L = linea.getTotalLength();
  const ps = [];
  for (let i = 0; i < n; i++) ps.push(el(padre, "circle", { r: 26, fill: `url(#${PRE}${punto})`, opacity: 0 }));
  // u0: desde dónde corren; hasta: hasta qué punto del camino llegan (1, al final)
  return (g, on, linea0, vel = 0.9, hasta = 1) => {
    linea.setAttribute("opacity", f1(Math.max(on, linea0) * 0.75));
    ps.forEach((p, i) => {
      const u = (ciclo(g, 1 / vel) + i / n) % 1;
      if (on < 0.01) { p.setAttribute("opacity", 0); return; }
      const v = u * hasta, q = linea.getPointAtLength(v * L);
      p.setAttribute("cx", f1(q.x)); p.setAttribute("cy", f1(q.y));
      p.setAttribute("opacity", f1(on * Math.min(1, u * 8, (1 - u) * 6)));
    });
  };
}
// las ondas que salen de la boca (hacia la izquierda) y las del móvil
function ondas(cam) {
  const g = el(cam, "g", { fill: "none", "stroke-linecap": "round" });
  const bo = [0, 1, 2].map(() => el(g, "path", { stroke: CIAN, "stroke-width": 6, opacity: 0 }));
  const mo = [0, 1, 2].map(() => el(g, "rect", { stroke: CIAN, "stroke-width": 5, opacity: 0 }));
  return (g_, onB, onM, todos) => {
    bo.forEach((p, i) => {
      const u = (ciclo(g_, 1 / 0.75) + i / 3) % 1, r = 24 + u * 150;
      const a0 = Math.PI * 0.72, a1 = Math.PI * 1.28;
      p.setAttribute("d", `M${f1(BOCA[0] + r * Math.cos(a0) + 6)} ${f1(BOCA[1] + r * Math.sin(a0))} A${f1(r)} ${f1(r)} 0 0 1 ${f1(BOCA[0] + r * Math.cos(a1) + 6)} ${f1(BOCA[1] + r * Math.sin(a1))}`);
      p.setAttribute("opacity", f1(onB * (1 - u) * Math.min(1, u * 6)));
    });
    mo.forEach((p, i) => {
      const u = (ciclo(g_, 1 / 2.3) + i / 3) % 1, e = 20 + u * (240 + 520 * todos);
      p.setAttribute("x", f1(140 - e)); p.setAttribute("y", f1(680 - e));
      p.setAttribute("width", f1(300 + 2 * e)); p.setAttribute("height", f1(640 + 2 * e));
      p.setAttribute("rx", f1(44 + e));
      p.setAttribute("opacity", f1(onM * (0.5 + 0.3 * todos) * (1 - u) * Math.min(1, u * 5)));
    });
  };
}

// ── el dedo que tapa el oído (entra desde arriba a la derecha) ──────────────────────────────────────────────────
function dedo(cam) {
  const g = el(cam, "g", { opacity: 0 });
  el(g, "path", { d: "M40 40 C200 46 400 50 640 56 L640 -56 C400 -50 200 -46 40 -40 C6 -40 -14 -20 -14 0 C-14 20 6 40 40 40 Z", fill: "url(#c-dedo)", stroke: "rgba(110,52,40,0.45)", "stroke-width": 3 });
  el(g, "path", { d: "M14 -28 Q20 -40 60 -41 L104 -40 Q112 -28 104 -18 L34 -18 Q14 -18 14 -28 Z", fill: "#f4d2c4", stroke: "rgba(140,80,66,0.5)", "stroke-width": 2.5 });
  el(g, "path", { d: "M24 -30 Q60 -36 98 -34", fill: "none", stroke: "rgba(255,255,255,0.6)", "stroke-width": 3, "stroke-linecap": "round" });
  const cr = el(g, "g", { fill: "none", stroke: "rgba(120,58,44,0.45)", "stroke-width": 3.5, "stroke-linecap": "round" });
  ["M170 -42 Q176 0 170 44", "M186 -42 Q192 0 186 44", "M350 -48 Q358 0 350 50", "M370 -48 Q378 0 370 50"].forEach((d) => el(cr, "path", { d }));
  el(g, "path", { d: "M20 22 Q300 40 640 44", fill: "none", stroke: "rgba(90,40,28,0.25)", "stroke-width": 14, "stroke-linecap": "round" });
  const dir = [Math.cos(-28 * Math.PI / 180), Math.sin(-28 * Math.PI / 180)];
  return (g_) => {
    const on = dedoOn(g_);
    g.setAttribute("opacity", f1(K.lim(on * 3)));
    const x = CANAL[0] + 8 + dir[0] * (1 - on) * 520, y = CANAL[1] + 6 + dir[1] * (1 - on) * 520;
    g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(-28)`);
  };
}

// ── el móvil con la nota de voz (y, en el experimento, la lista de voces que se puntúan) ─────────────────────────
const ONDA = (() => { const r = K.azar(17); return Array.from({ length: 26 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.9 + r() * 2)) * (0.5 + 0.5 * r())); })();
const NOTAS = [3, 2, 5, 3], TU = 2;
function estrella(cx, cy, r) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`;
  }
  return d + "Z";
}
function telefono(cam) {
  const g = el(cam, "g");
  el(g, "rect", { x: 128, y: 700, width: 324, height: 660, rx: 54, fill: "rgba(0,0,0,0.45)", transform: "translate(18 26)" });
  el(g, "rect", { x: 140, y: 680, width: 300, height: 640, rx: 46, fill: "url(#c-marco)" });
  el(g, "rect", { x: 144, y: 684, width: 292, height: 632, rx: 42, fill: "#0a0b0d" });
  el(g, "rect", { x: 437, y: 830, width: 6, height: 90, rx: 3, fill: "#3d4148" });
  el(g, "rect", { x: 137, y: 800, width: 6, height: 54, rx: 3, fill: "#3d4148" });
  el(g, "rect", { x: 137, y: 870, width: 6, height: 54, rx: 3, fill: "#3d4148" });
  const scr = el(g, "g", { "clip-path": `url(#${PRE}pantalla)` });
  el(scr, "rect", { x: 152, y: 692, width: 276, height: 616, fill: `url(#${PRE}chat)` });
  // el chat
  const chat = el(scr, "g");
  el(chat, "rect", { x: 152, y: 692, width: 276, height: 110, fill: "#1f2c34" });
  el(chat, "path", { d: "M174 760 l-10 10 l10 10", fill: "none", stroke: "#e9edef", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" });
  el(chat, "circle", { cx: 206, cy: 770, r: 21, fill: "#7b9cb4" });
  texto(chat, 206, 778, "S", { "font-size": 22, "font-weight": 700, "text-anchor": "middle", fill: "#fff" });
  texto(chat, 238, 768, "Sara", { "font-size": 24, "font-weight": 700 });
  texto(chat, 238, 791, "en línea", { "font-size": 15, fill: "#9fb0bb" });
  el(chat, "rect", { x: 164, y: 826, width: 214, height: 84, rx: 16, fill: "#202c33" });
  texto(chat, 178, 860, "¿Me lo cuentas", { "font-size": 23 });
  texto(chat, 178, 891, "por audio?", { "font-size": 23 });
  el(chat, "rect", { x: 176, y: 936, width: 242, height: 122, rx: 18, fill: "#005c4b" });
  const play = el(chat, "path", { d: "M206 974 L230 990 L206 1006 Z", fill: "#e9edef" });
  const pausa = el(chat, "path", { d: "M204 975 h8 v30 h-8 Z M222 975 h8 v30 h-8 Z", fill: "#e9edef", opacity: 0 });
  const barras = ONDA.map((h, i) => el(chat, "rect", { x: 250 + i * 5.9, y: 990, width: 3.6, height: 4, rx: 1.8, fill: "#8fb8ad" }));
  const bola = el(chat, "circle", { cx: 250, cy: 990, r: 8, fill: CIAN });
  const tiempo = texto(chat, 250, 1042, "0:07", { "font-size": 17, fill: "#cfe9e1" });
  texto(chat, 352, 1042, "21:47", { "font-size": 14, fill: "#cfe9e1" });
  el(chat, "path", { d: "M394 1036 l5 5 l9 -10 M402 1041 l9 -10", fill: "none", stroke: "#53bdeb", "stroke-width": 2.5, "stroke-linecap": "round" });
  el(chat, "rect", { x: 162, y: 1240, width: 206, height: 52, rx: 26, fill: "#202c33" });
  texto(chat, 184, 1273, "Mensaje", { "font-size": 20, fill: "#8696a0" });
  el(chat, "circle", { cx: 398, cy: 1266, r: 25, fill: "#00a884" });
  el(chat, "rect", { x: 392, y: 1250, width: 12, height: 20, rx: 6, fill: "#fff" });
  el(chat, "path", { d: "M386 1264 q12 16 24 0 M398 1276 v6", fill: "none", stroke: "#fff", "stroke-width": 2.5, "stroke-linecap": "round" });
  // el experimento: cuatro voces grabadas que se puntúan con estrellas
  const ex = el(scr, "g", { opacity: 0 });
  el(ex, "rect", { x: 152, y: 692, width: 276, height: 616, fill: "#0b141a" });
  el(ex, "rect", { x: 152, y: 692, width: 276, height: 110, fill: "#1f2c34" });
  texto(ex, 290, 772, "¿Qué voz suena mejor?", { "font-size": 22, "font-weight": 800, "text-anchor": "middle" });
  const filas = NOTAS.map((nota, j) => {
    const y = 822 + j * 116, f = el(ex, "g");
    const caja = el(f, "rect", { x: 162, y, width: 256, height: 104, rx: 16, fill: "#1b252c", stroke: VERDE, "stroke-width": 0 });
    const av = el(f, "circle", { cx: 194, cy: y + 36, r: 22, fill: "#44525c" });
    const q = texto(f, 194, y + 44, "?", { "font-size": 24, "font-weight": 800, "text-anchor": "middle", fill: "#cfd6db" });
    const tu = texto(f, 194, y + 44, "Tú", { "font-size": 19, "font-weight": 800, "text-anchor": "middle", fill: "#0b141a", opacity: 0 });
    const r = K.azar(30 + j);
    const bs = Array.from({ length: 22 }, (_, i) => { const h = 6 + 22 * r(); return { e: el(f, "rect", { x: 228 + i * 8, y: y + 36 - h / 2, width: 4.5, height: h, rx: 2.2, fill: "#6d7c86" }), h }; });
    const es = [0, 1, 2, 3, 4].map((i) => {
      el(f, "path", { d: estrella(234 + i * 36, y + 78, 14), fill: "#33404a" });
      return el(f, "path", { d: estrella(234 + i * 36, y + 78, 14), fill: ORO, opacity: 0 });
    });
    return { caja, av, q, tu, bs, es, nota, j, y };
  });
  el(g, "rect", { x: 152, y: 692, width: 276, height: 616, rx: 34, fill: "url(#c-cristal)" });
  el(g, "rect", { x: 250, y: 702, width: 80, height: 24, rx: 12, fill: "#000" });
  el(g, "circle", { cx: MIC[0] - 40, cy: 1313.5, r: 2.4, fill: "#000" });
  [0, 1, 2, 3, 4].forEach((i) => el(g, "circle", { cx: MIC[0] + 26 + i * 9, cy: 1313.5, r: 2.2, fill: "#000" }));
  return (g_) => {
    // la nota de voz: suena en bucle (siete vueltas en el vídeo entero) y se vuelve fina sin los graves
    const p = ciclo(g_, 1 / 6.9) % 1, n = Math.floor(p * ONDA.length), so = movil(g_) > 0.5 || microOn(g_) > 0.5;
    const fi = fino(g_);
    barras.forEach((b, i) => {
      const h = 6 + 40 * ONDA[i] * (1 - 0.55 * fi * (i % 3 ? 1 : 0.6));
      b.setAttribute("y", f1(990 - h / 2)); b.setAttribute("height", f1(h));
      b.setAttribute("fill", i <= n ? CIAN : "#8fb8ad");
    });
    bola.setAttribute("cx", f1(250 + p * 150));
    play.setAttribute("opacity", so ? 0 : 1); pausa.setAttribute("opacity", so ? 1 : 0);
    tiempo.textContent = `0:0${Math.min(7, Math.floor(p * 7.9))}`;
    const li = lista(g_);
    ex.setAttribute("opacity", f1(li)); chat.setAttribute("opacity", f1(1 - li));
    filas.forEach((f) => {
      f.es.forEach((e, i) => {
        const t = T.puntuo + f.j * 0.32 + i * 0.07, k = i < f.nota ? K.sale(K.tramo(g_, t, t + 0.25)) : 0;
        e.setAttribute("opacity", f1(k));
        const [cx, cy] = [234 + i * 36, f.y + 78];
        e.setAttribute("transform", `translate(${cx} ${cy}) scale(${f1(0.4 + 0.6 * k)}) translate(${-cx} ${-cy})`);
      });
      // las cuatro voces suenan por turnos, una vez por segundo, con su barra de avance
      const u = (g_ - 39.3) / 1.05, turno = u > 0 && u < 4.2 ? Math.floor(u) % 4 : -1, av = u - Math.floor(u);
      f.bs.forEach((b, i) => {
        const suena = turno === f.j, h = b.h * (suena ? 0.55 + 0.6 * Math.abs(Math.sin(vuelta(g_, 1.7) + i * 0.7)) : 1);
        b.e.setAttribute("height", f1(h)); b.e.setAttribute("y", f1(f.y + 36 - h / 2));
        b.e.setAttribute("fill", suena && i / 22 < av ? CIAN : "#6d7c86");
      });
      if (f.j === TU) {
        const m = asoma(g_, T.mejor, 44.6), s = K.sale(K.tramo(g_, T.suya, T.suya + 0.3));
        f.caja.setAttribute("stroke-width", f1(4 * m));
        f.caja.setAttribute("fill", m > 0.5 ? "#173a2e" : "#1b252c");
        f.av.setAttribute("fill", s > 0.5 ? VERDE : "#44525c");
        f.q.setAttribute("opacity", f1(1 - s)); f.tu.setAttribute("opacity", f1(s));
      }
    });
  };
}

// ── el polvo que flota delante de la luz ─────────────────────────────────────────────────────────────────────────
function polvo(cam) {
  const r = K.azar(9), ps = [];
  for (let i = 0; i < 26; i++) ps.push({ e: el(cam, "circle", { r: 2 + r() * 4, fill: "rgba(200,220,240,0.5)" }), x: r() * 1500 - 150, f: r(), w: r() * 6.28 });
  return (g) => ps.forEach((p) => {
    const u = (ciclo(g, 0.04) + p.f) % 1;
    p.e.setAttribute("cx", f1(p.x + 30 * Math.sin(vuelta(g, 0.04) + p.w)));
    p.e.setAttribute("cy", f1(1750 - u * 1400));
    p.e.setAttribute("opacity", f1(0.6 * Math.sin(Math.PI * u)));
  });
}

// ── el espectro: las barras de la voz, de los graves a los agudos ────────────────────────────────────────────────
const AIRE_B = [0.34, 0.48, 0.6, 0.68, 0.72, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.26, 0.22, 0.19, 0.16];
const HUESO_B = [0.52, 0.5, 0.44, 0.36, 0.27, 0.18, 0.1, 0.05, 0.02, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function espectro(capa) {
  const e = K.crear(capa, `<div class="c-espectro"><div class="tit"><span>lo que oyes <b style="color:${ORO}">tú</b></span><span>el <b style="color:${CIAN}">audio</b></span><span>con los oídos <b style="color:${ORO}">tapados</b></span></div>
    <div class="lado" style="left:34px">graves</div><div class="lado" style="right:34px">agudos</div></div>`);
  const tits = [...e.querySelectorAll(".tit span")];
  const bs = AIRE_B.map((a, i) => {
    const b = K.crear(e, `<div class="barra" style="left:${48 + i * 48}px"><i class="fa"></i><i class="ho"></i><i class="ai"></i></div>`);
    return { ai: b.querySelector(".ai"), ho: b.querySelector(".ho"), fa: b.querySelector(".fa"), a, h: HUESO_B[i] };
  });
  return (g) => {
    const on = sube(g, T.pasar - 0.1, T.pasar + 0.3) - sube(g, 38.25, 38.6);
    e.style.opacity = f1(on);
    if (on < 0.001) return;
    e.style.transform = `translateY(${f1((1 - on) * 30)}px)`;
    const au = sube(g, T.audio - 0.1, T.audio + 0.3) - sube(g, T.habla - 0.2, T.habla + 0.2), tp = sube(g, T.habla - 0.2, T.habla + 0.2);
    [1 - au - tp, au, tp].forEach((v, i) => { tits[i].style.opacity = f1(K.lim(v)); });
    const hu = sube(g, T.graves - 0.15, T.graves + 0.5);                        // el hueso suma los graves
    const falta = sube(g, T.faltan, T.graves2 + 0.3) * (1 - tp);                   // en el audio se van
    const mas = sube(g, T.casi, T.hueso2) * 0.5 + sube(g, T.aun, T.mas + 0.3) * 0.35;  // tapado: más hueso, menos aire
    const menos = sube(g, T.habla, T.casi + 0.4) * 0.55;
    bs.forEach((b, i) => {
      const pulso = 1 + 0.06 * Math.sin(vuelta(g, 1.3) + i * 0.8);
      const ha = 120 * b.a * (1 - menos) * pulso, hh = 120 * b.h * hu * (1 - falta) * (1 + mas) * pulso;
      b.ai.style.height = `${f1(ha)}px`;
      b.ho.style.height = `${f1(ha + hh)}px`;
      b.ho.style.opacity = f1(hh > 0.5 ? 1 : 0);
      b.fa.style.height = `${f1(ha + 120 * b.h)}px`;
      b.fa.style.opacity = f1(b.h > 0 ? falta : 0);
    });
  };
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
const junto = (wx, wy, dx = 0, dy = 0) => (k) => { const [x, y] = pantalla(k, wx, wy); return [x + dx, y + dy]; };

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on, tch) => L.push({ e: etiqueta(capa, html + (tch ? `<i class="tacha"></i>` : ""), clase), sitio, on, tch });
  // hook
  r(`tu voz <b>de verdad</b>`, "v g", junto(296, 1110, 0, 30), (g) => asoma(g, T.verdad, 3.4));
  r(`¿el móvil graba <b>mal</b>?`, "r", junto(290, 680, 0, -50), (g) => asoma(g, T.grabe, 5.75), T.asi);
  r(`así te oyen <b>todos</b>`, "c g", () => [540, 1380], (g) => asoma(g, T.oyen, 6.7));
  // cabeza
  r(`lo que oyes <b>tú</b>`, "o", junto(975, 860, 0, -60), (g) => asoma(g, T.oyes, 9.6));
  r(`<b>2</b> caminos`, "g", () => [540, 1390], (g) => asoma(g, T.dos, 11.5));
  r(`por el <b>aire</b>`, "c", junto(560, 1302, -60, 70), (g) => asoma(g, T.aire, 15.75));
  // craneo
  r(`<b>huesos</b>`, "o", junto(660, 1250, -40, 70), (g) => asoma(g, T.huesos, 20.3));
  r(`<b>oído</b> interno`, "o", junto(COCLEA[0], COCLEA[1], -30, 150), (g) => asoma(g, T.oido, 21.85));
  r(`más <b>grave</b> y más <b>lleno</b>`, "o", () => [540, 1150], (g) => asoma(g, T.grave, 27.25));
  // micro
  r(`<b>micro</b>`, "c", junto(MIC[0], MIC[1], 170, -20), (g) => asoma(g, T.micro, 29.4));
  r(`te faltan los <b>graves</b>`, "r", () => [540, 1150], (g) => asoma(g, T.graves2, 32.7));
  r(`más <b>fino</b>`, "c", junto(296, 1110, 0, 20), (g) => asoma(g, T.fino, 32.7));
  // tapado
  r(`casi todo por el <b>hueso</b>`, "o", () => [540, 1150], (g) => asoma(g, T.hueso2 - 0.2, 37.2));
  r(`aún más <b>grave</b>`, "o g", () => [540, 1150], (g) => asoma(g, T.mas, 38.3));
  // experimento
  r(`era la <b>suya</b><small>Hughes y Harrison, Perception (2013)</small>`, "v", junto(290, 1300, 0, 20), (g) => asoma(g, T.suya, 44.55));
  // cierre
  r(`<b>así</b> suenas`, "v", junto(296, 1110, 0, 20), (g) => asoma(g, T.audio2, 47.95));
  return (g, k) => L.forEach((l) => {
    const [x, y] = l.sitio(k);
    pon(l.e, x, y, l.on(g));
    if (l.tch) tacha(l.e, g, l.tch);
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
  el(cam, "rect", { x: -3000, y: -2000, width: 7000, height: 7500, fill: "#0b0e12" });
  el(cam, "ellipse", { cx: 760, cy: 980, rx: 1100, ry: 1200, fill: `url(#${PRE}luz)` });
  const pv = polvo(cam);
  const on = ondas(cam);
  const cb = cabeza(cam);
  const cr = craneo(cam);
  const ore = oreja(cam);
  const caminos = el(cam, "g");
  const aire = camino(caminos, AIRE, CIAN, 6, "punto-c");
  const micro = camino(caminos, AL_MICRO, CIAN, 5, "punto-c");
  const hs = HUESOS.map((P) => camino(caminos, P, ORO, 5, "punto-o"));
  const glow = el(cam, "ellipse", { cx: 720, cy: 1010, rx: 230, ry: 280, fill: `url(#${PRE}oro)`, opacity: 0 });
  const tope = el(cam, "circle", { cx: 935, cy: 1000, r: 30, fill: "none", stroke: ROJO, "stroke-width": 6, opacity: 0 });
  const de = dedo(cam);
  const tel = telefono(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const es = espectro(capa), ro = rotulos(capa);
  return { cam, pv, cb, cr, ore, aire, micro, hs, glow, tope, de, tel, on, es, ro };
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
    const c = corte(g), h = hueso(g), tp = tapado(g);
    E.pv(g);
    E.cb.piel.setAttribute("opacity", f1(1 - 0.62 * c));
    E.cb.pelo.setAttribute("opacity", f1(1 - 0.7 * c));
    E.cr.g.setAttribute("opacity", f1(0.8 * c));
    // los huesos vibran mientras hablas
    const vibra = h * (0.55 + 0.45 * Math.abs(Math.sin(vuelta(g, 3.1))));
    E.cr.vib.setAttribute("opacity", f1(vibra * (0.55 + 0.35 * tp)));
    E.cr.huesos.setAttribute("transform", `translate(${f1(h * 1.6 * Math.sin(vuelta(g, 23)))} ${f1(h * 1.2 * Math.cos(vuelta(g, 19)))})`);
    E.cr.coc.setAttribute("opacity", f1(K.lim(h * (0.6 + 0.4 * Math.sin(vuelta(g, 2.2))) * (1 + tp))));
    E.cr.glo.setAttribute("opacity", f1(boca(g) * c * (0.6 + 0.4 * Math.sin(vuelta(g, 2.7)))));
    E.cr.espiral.setAttribute("stroke", h > 0.5 ? ORO : "#c2655f");
    E.ore.g.setAttribute("opacity", f1(1 - 0.5 * c));
    const ll = asoma(g, T.oreja - 0.3, 15.7) + asoma(g, T.oyes, 9.5);
    E.ore.brillo.setAttribute("opacity", f1(K.lim(ll) * (0.6 + 0.4 * Math.sin(vuelta(g, 1.6)))));
    E.ore.brillo.setAttribute("stroke", g < 10 ? ORO : CIAN);
    // los dos caminos: en «dos caminos» se ven los dos; luego corre cada uno en su palabra
    const pre = asoma(g, T.dos, 11.4);
    E.aire(g, aireOn(g), pre, 0.9, tp > 0.5 ? 0.84 : 1);
    E.micro(g, microOn(g), 0, 0.7);
    E.hs.forEach((f, i) => f(g, h * (i === 2 ? c : 1), pre * (i === 0 ? 1 : 0), 0.85 + i * 0.12));
    E.tope.setAttribute("opacity", f1(tp * aireOn(g) * (0.5 + 0.5 * Math.sin(vuelta(g, 1.4)))));
    E.glow.setAttribute("opacity", f1(asoma(g, T.oyes2, 48.15) * 0.9 + h * 0.25 * tp));
    E.de(g);
    E.tel(g);
    E.on(g, boca(g), movil(g), sube(g, T.oyen, T.todos + 0.3) - sube(g, 6.3, 6.9));
    E.es(g);
    E.ro(g, k);
    return { g, k };
  };
  return E;
}
