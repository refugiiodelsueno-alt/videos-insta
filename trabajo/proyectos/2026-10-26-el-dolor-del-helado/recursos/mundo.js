// Lo que sale en todas las escenas: una cabeza de perfil mirando a la izquierda, en una habitación a oscuras, con un
// cucurucho de fresa en los labios. Por dentro, el cerebro con su arteria, la boca en corte (el paladar, la lengua y
// sus vasos) y el nervio trigémino. El frío, en cian; la sangre, en rojo; el aviso del nervio, en dorado; el dolor, un
// pinchazo rojo en la frente. Todo en 2D, con la cámara dentro del svg (un transform del grupo).
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", NARANJA = "#ff8a3d";
export const F0 = { x: 630, y: 900, z: 1.45 };                 // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma empalma con el primero.
export const TOTAL = 45.35;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, boca: 8.26, arteria: 14.71, lengua: 23.63, experimento: 27.33, nervio: 34.5, cierre: 40.84 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  pinchazo: 0.36, frente: 0.96, no: 2.32, frente2: 3.08, congela: 4.32, cerebro: 4.84, techo: 6.72, boca: 7.32,
  toca: 8.96, paladar: 9.28, frio: 10.24, cierra: 10.56, vasos: 11.12, abren: 13.62, golpe: 14.02,
  midieron: 15.44, duele: 16.96, arteria: 17.68, frente3: 18.83, ensancha: 19.32, mas: 20.44, estrecharse: 22.12, va: 23.38,
  pegas: 25.0, lengua: 25.36, calientas: 26.6,
  colegio: 27.7, probaron: 28.22, comian: 29.5, cinco: 30.38, dolio: 31.58, doble: 32.06, tardaban: 32.86, minuto: 33.58,
  frente4: 35.52, aviso: 37.0, nervio: 37.92, toda: 39.73, cara: 40.08,
  nace: 41.84, boca2: 42.48, cerebro2: 43.4, pone: 44.16, frente5: 44.64,
};

// lo que pasa en cada momento (de 0 a 1)
const corte = (g) => sube(g, 4.0, 4.6) - sube(g, 43.9, 44.7);
const ancho = (g) => sube(g, T.ensancha, T.ensancha + 0.55) - sube(g, T.estrecharse, T.estrecharse + 0.65);   // la arteria
// los vasos del paladar: 1 normal, 0,35 cerrados por el frío, 2 abiertos de golpe
const vasos = (g) => 1 - 0.65 * sube(g, T.cierra, T.cierra + 0.7) + 1.65 * K.sale(K.tramo(g, T.abren - 0.05, T.abren + 0.28)) - sube(g, T.estrecharse, T.estrecharse + 0.7);
const frio = (g) => sube(g, T.toca, T.toca + 0.8) - sube(g, T.calientas - 0.2, T.calientas + 0.6) + sube(g, 41.5, 42.0) - sube(g, 43.6, 44.2);
const calor = (g) => sube(g, T.calientas - 0.3, T.calientas + 0.4) - sube(g, 27.9, 28.6);
const subeLengua = (g) => sube(g, T.pegas - 0.1, T.lengua + 0.15) - sube(g, 27.2, 27.9);
const bocado = (g) => sube(g, 8.55, T.toca + 0.1) - sube(g, 24.4, 25.0) + sube(g, 41.2, 41.7) - sube(g, 43.6, 44.3);
const dolor = (g) => Math.max(1 - sube(g, 3.3, 4.0), (sube(g, T.duele, T.duele + 0.4) - sube(g, T.va - 0.1, T.va + 0.35)) * (0.55 + 0.45 * ancho(g)),
  sube(g, T.frente4 - 0.1, T.frente4 + 0.3) - sube(g, 37.0, 37.5), sube(g, T.frente5 - 0.25, T.frente5 + 0.1));
const arteriaOn = (g) => sube(g, 15.9, 16.6) - sube(g, 23.6, 24.2);
const nervioOn = (g) => sube(g, T.nervio - 0.05, T.nervio + 0.9) - sube(g, 43.8, 44.5);
const caras = (g) => sube(g, T.toda - 0.1, T.toda + 0.4) - sube(g, 40.9, 41.5);
const lista = (g) => sube(g, T.colegio - 0.1, T.colegio + 0.4) - sube(g, 34.3, 34.8);
const doppler = (g) => sube(g, T.midieron - 0.1, T.midieron + 0.35) - sube(g, 23.5, 24.0);

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0b0e12; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(6,8,10,0) 55%, rgba(6,8,10,0.6) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(10,13,16,0.96) 0, rgba(10,13,16,0.86) 300px, rgba(10,13,16,0.55) 470px, rgba(10,13,16,0) 630px); }
.c-oscuro { position: absolute; inset: 0; background: #07090c; opacity: 0; }
.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(12,15,19,0.88); border: 2px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 10px 24px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.45); opacity: 0; text-align: center; }
.c-etq b { font-weight: 800; }
.c-etq.c b { color: ${CIAN}; } .c-etq.o b { color: ${ORO}; } .c-etq.r b { color: ${ROJO}; } .c-etq.v b { color: ${VERDE}; } .c-etq.n b { color: ${NARANJA}; }
.c-etq.c { border-color: rgba(95,212,255,0.45); } .c-etq.o { border-color: rgba(255,194,74,0.5); } .c-etq.r { border-color: rgba(240,68,90,0.5); } .c-etq.v { border-color: rgba(34,211,138,0.5); } .c-etq.n { border-color: rgba(255,138,61,0.5); }
.c-etq.g { font-size: 56px; padding: 12px 30px; }
.c-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }
.c-etq .tacha { position: absolute; left: 12px; right: 12px; top: 48%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240,68,90,0.7); }
.c-tarjeta { position: absolute; border-radius: 26px; opacity: 0; font-family: var(--letra), sans-serif; color: #fff;
  background: rgba(12,15,19,0.92); border: 2px solid rgba(255,255,255,0.14); box-shadow: 0 14px 40px rgba(0,0,0,0.5); }
.c-dop { left: 70px; top: 1210px; width: 940px; height: 230px; }
.c-dop .tit { position: absolute; left: 30px; top: 16px; font-size: 36px; font-weight: 800; }
.c-dop .tit b { color: ${ROJO}; }
.c-dop .fu { position: absolute; right: 30px; top: 22px; font-size: 32px; font-weight: 500; color: #8b939d; }
.c-dop svg { position: absolute; left: 30px; top: 70px; }
.c-exp { left: 50px; top: 580px; width: 980px; height: 860px; background: radial-gradient(ellipse 90% 70% at 50% 40%, rgba(44,56,70,0.94) 0, rgba(24,31,40,0.94) 60%, rgba(14,18,24,0.94) 100%); }
.c-exp .cab { position: absolute; left: 0; right: 0; top: 26px; text-align: center; font-size: 42px; font-weight: 800; }
.c-exp .cab b { color: ${ORO}; }
.c-exp .gente { position: absolute; left: 20px; top: 84px; }
.c-exp .col { position: absolute; top: 262px; width: 440px; height: 560px; }
.c-exp .reloj { position: absolute; left: 334px; width: 110px; top: 30px; text-align: left; font-size: 40px; font-weight: 800; color: #fff; pointer-events: none; }
.c-exp .nom { position: absolute; left: 0; right: 0; top: 238px; text-align: center; font-size: 50px; font-weight: 800; }
.c-exp .zona { position: absolute; left: 140px; width: 160px; top: 312px; height: 220px; border-bottom: 3px solid rgba(255,255,255,0.25); }
.c-exp .zona i { position: absolute; left: 0; right: 0; bottom: 0; height: 0; border-radius: 12px 12px 3px 3px; background: linear-gradient(to top, #b8243a, ${ROJO}); box-shadow: 0 0 24px rgba(240,68,90,0.4); }
.c-exp .num { position: absolute; left: -60px; right: -60px; text-align: center; font-size: 60px; font-weight: 800; color: #fff; opacity: 0; }
.c-exp .x2 { position: absolute; left: 400px; top: 596px; width: 180px; height: 180px; border-radius: 50%; background: ${ROJO};
  color: #fff; font-size: 76px; font-weight: 800; text-align: center; line-height: 180px; opacity: 0; box-shadow: 0 0 40px rgba(240,68,90,0.6); }
.c-exp .fu { position: absolute; left: 0; right: 0; bottom: 22px; text-align: center; font-size: 32px; font-weight: 500; color: #8b939d; }
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
  [0, F0], [2.2, { x: 620, y: 868, z: 1.62 }], [3.5, { x: 612, y: 930, z: 1.55 }],     // el pinchazo; la línea baja
  [5.0, { x: 800, y: 830, z: 1.0 }], [5.9, { x: 780, y: 850, z: 1.05 }],              // el cerebro
  [7.5, { x: 700, y: 1026, z: 2.3 }], [10.6, { x: 698, y: 1022, z: 2.45 }], [13.5, { x: 702, y: 1020, z: 2.6 }], [14.5, { x: 700, y: 1018, z: 2.55 }], // el paladar
  [16.2, { x: 765, y: 860, z: 1.12 }], [18.9, { x: 700, y: 800, z: 1.45 }], [21.0, { x: 705, y: 790, z: 1.55 }], [23.0, { x: 712, y: 830, z: 1.38 }], // la arteria
  [24.9, { x: 700, y: 1030, z: 2.4 }], [27.1, { x: 705, y: 1026, z: 2.55 }],          // la lengua
  [28.6, { x: 760, y: 960, z: 0.9 }], [34.0, { x: 752, y: 950, z: 0.97 }],            // el experimento, detrás de la tarjeta
  [35.6, { x: 690, y: 830, z: 1.35 }], [37.6, { x: 720, y: 900, z: 1.2 }], [39.3, { x: 735, y: 930, z: 1.1 }], [40.4, { x: 712, y: 930, z: 1.0 }], // el nervio
  [42.4, { x: 700, y: 990, z: 1.3 }], [43.5, { x: 735, y: 870, z: 1.18 }], [TOTAL, F0],
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
const mueve = (P, dx, dy) => P.map(([x, y]) => [x + dx, y + dy]);
const mezcla = (A, B, u) => A.map((p, i) => [p[0] + (B[i][0] - p[0]) * u, p[1] + (B[i][1] - p[1]) * u]);

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
const CRANEO = [[588, 650], [640, 556], [760, 490], [880, 474], [1000, 488], [1100, 546], [1160, 660], [1176, 800], [1160, 930], [1120, 1030],
  [1060, 1080], [1010, 1072], [978, 1034], [900, 1006], [800, 968], [720, 952], [682, 922], [640, 878], [592, 862], [580, 800]];
const CEREBRO = [[618, 712], [636, 618], [700, 552], [790, 512], [900, 500], [1010, 514], [1098, 566], [1144, 660], [1154, 780], [1134, 876],
  [1084, 924], [1016, 930], [962, 914], [905, 928], [846, 944], [792, 972], [744, 966], [716, 928], [694, 884], [654, 856], [624, 806]];
export const FRENTE = [590, 702], GANGLIO = [790, 925], RAIZ = [908, 948];
// la boca en corte: el borde del paladar que da a la boca, la lengua en reposo y pegada al paladar
const PALADAR = [[596, 1034], [620, 1022], [660, 1012], [710, 1008], [765, 1014], [812, 1032], [842, 1056]];
const LENGUA_R = [[600, 1066], [618, 1052], [660, 1044], [710, 1040], [765, 1045], [812, 1060], [840, 1092], [850, 1150]];
const LENGUA_A = [[598, 1042], [620, 1030], [660, 1020], [710, 1016], [765, 1021], [810, 1039], [838, 1074], [850, 1150]];
const LENGUA_B = [[826, 1180], [760, 1150], [700, 1114], [640, 1100], [606, 1086]];

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(120,160,210,0.26)"/><stop offset="1" stop-color="rgba(120,160,210,0)"/></radialGradient>
  <linearGradient id="c-piel" gradientUnits="userSpaceOnUse" x1="500" y1="700" x2="1200" y2="1000"><stop offset="0" stop-color="#f3c6a8"/><stop offset="0.45" stop-color="#e2a586"/><stop offset="1" stop-color="#a8664c"/></linearGradient>
  <linearGradient id="c-cuello" gradientUnits="userSpaceOnUse" x1="680" y1="0" x2="1060" y2="0"><stop offset="0" stop-color="#d19174"/><stop offset="0.5" stop-color="#c58468"/><stop offset="1" stop-color="#8f5340"/></linearGradient>
  <radialGradient id="c-brillo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,236,222,0.5)"/><stop offset="1" stop-color="rgba(255,236,222,0)"/></radialGradient>
  <radialGradient id="c-rubor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(222,110,100,0.32)"/><stop offset="1" stop-color="rgba(222,110,100,0)"/></radialGradient>
  <linearGradient id="c-pelo" gradientUnits="userSpaceOnUse" x1="600" y1="430" x2="1200" y2="1100"><stop offset="0" stop-color="#3a2820"/><stop offset="1" stop-color="#1c130f"/></linearGradient>
  <radialGradient id="c-seso" gradientUnits="userSpaceOnUse" cx="760" cy="640" r="560"><stop offset="0" stop-color="#f1c4c4"/><stop offset="0.6" stop-color="#d79a9e"/><stop offset="1" stop-color="#a86a72"/></radialGradient>
  <linearGradient id="c-lengua" gradientUnits="userSpaceOnUse" x1="0" y1="1020" x2="0" y2="1160"><stop offset="0" stop-color="#ef8a90"/><stop offset="0.5" stop-color="#d4606a"/><stop offset="1" stop-color="#9e3b46"/></linearGradient>
  <radialGradient id="c-dolor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,235,235,0.95)"/><stop offset="0.22" stop-color="rgba(240,68,90,0.85)"/><stop offset="1" stop-color="rgba(240,68,90,0)"/></radialGradient>
  <radialGradient id="c-frio" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(150,230,255,0.7)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <radialGradient id="c-calor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,190,110,0.85)"/><stop offset="0.45" stop-color="rgba(255,138,61,0.5)"/><stop offset="1" stop-color="rgba(255,138,61,0)"/></radialGradient>
  <radialGradient id="c-oro" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,194,74,0.6)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-punto-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6d8"/><stop offset="0.35" stop-color="${ORO}"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-punto-r" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe2e2"/><stop offset="0.35" stop-color="${ROJO}"/><stop offset="1" stop-color="rgba(240,68,90,0)"/></radialGradient>
  <radialGradient id="c-punto-c" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#e8fbff"/><stop offset="0.35" stop-color="${CIAN}"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <radialGradient id="c-bola" gradientUnits="userSpaceOnUse" cx="-22" cy="-30" r="96"><stop offset="0" stop-color="#ffe0ea"/><stop offset="0.45" stop-color="#f68fae"/><stop offset="1" stop-color="#c84f78"/></radialGradient>
  <linearGradient id="c-galleta" gradientUnits="userSpaceOnUse" x1="-56" y1="0" x2="56" y2="0"><stop offset="0" stop-color="#f0bd72"/><stop offset="0.5" stop-color="#d7964c"/><stop offset="1" stop-color="#9d6227"/></linearGradient>
  <pattern id="c-gofre" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="26" height="26" fill="none"/><path d="M0 0 H26 M0 0 V26" stroke="rgba(110,62,20,0.55)" stroke-width="4"/></pattern>
  <linearGradient id="c-mano" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0c0a2"/><stop offset="0.55" stop-color="#d99a7b"/><stop offset="1" stop-color="#a9654c"/></linearGradient>
  <clipPath id="c-cer"><path d="${curva(CEREBRO, true)}"/></clipPath>
  <clipPath id="c-cara"><path d="${curva(PERFIL)} Z"/></clipPath>
</defs>`;

function cabeza(cam) {
  const piel = el(cam, "g");
  el(piel, "path", { d: curva(PERFIL) + " Z", fill: "url(#c-piel)" });
  el(piel, "path", { d: "M690 1292 C760 1300 880 1250 1000 1180 L1062 1192 C1040 1300 1040 1500 1064 1880 L700 1880 C692 1600 680 1440 664 1386 C668 1350 676 1320 690 1292 Z", fill: "url(#c-cuello)", opacity: 0.92 });
  el(piel, "path", { d: "M600 1242 C700 1262 860 1220 990 1120 C960 1180 880 1250 760 1290 C700 1300 650 1280 600 1242 Z", fill: "rgba(90,40,28,0.32)" });
  el(piel, "ellipse", { cx: 690, cy: 700, rx: 120, ry: 140, fill: "url(#c-brillo)" });
  el(piel, "ellipse", { cx: 545, cy: 930, rx: 30, ry: 60, fill: "url(#c-brillo)" });
  el(piel, "ellipse", { cx: 690, cy: 1000, rx: 110, ry: 90, fill: "url(#c-rubor)" });
  // el ojo (entornado por el dolor), la ceja que se frunce, la nariz y los labios
  el(piel, "path", { d: "M596 813 Q612 803 632 808 Q616 822 596 813 Z", fill: "#f1e7df" });
  el(piel, "ellipse", { cx: 604, cy: 812, rx: 5, ry: 5.5, fill: "#3a2a22" });
  el(piel, "path", { d: "M592 812 Q612 800 636 808", fill: "none", stroke: "#3a2620", "stroke-width": 4.5, "stroke-linecap": "round" });
  el(piel, "path", { d: "M600 824 Q616 828 630 820", fill: "none", stroke: "rgba(120,60,45,0.45)", "stroke-width": 3, "stroke-linecap": "round" });
  const ceja = el(piel, "path", { d: "M564 782 Q604 760 652 772", fill: "none", stroke: "#2c1e18", "stroke-width": 10, "stroke-linecap": "round" });
  const arruga = el(piel, "path", { d: "M566 760 Q574 748 588 744 M570 742 Q584 730 600 730", fill: "none", stroke: "rgba(120,58,44,0.5)", "stroke-width": 3.5, "stroke-linecap": "round" });
  el(piel, "path", { d: "M540 985 Q552 979 562 992", fill: "none", stroke: "rgba(110,52,40,0.7)", "stroke-width": 5, "stroke-linecap": "round" });
  el(piel, "path", { d: "M560 984 Q584 990 588 1010", fill: "none", stroke: "rgba(110,52,40,0.35)", "stroke-width": 5, "stroke-linecap": "round" });
  el(piel, "path", { d: "M548 1026 Q541 1046 547 1060 L566 1066 Q568 1044 560 1026 Z", fill: "rgba(196,92,86,0.55)" });
  el(piel, "path", { d: "M549 1074 Q544 1090 552 1104 Q566 1102 572 1078 Z", fill: "rgba(196,92,86,0.5)" });
  el(piel, "path", { d: "M552 1068 Q572 1072 598 1069", fill: "none", stroke: "#8a3f3a", "stroke-width": 4, "stroke-linecap": "round" });
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
  return { piel, pelo, ceja, arruga };
}

function oreja(cam) {
  const g = el(cam, "g");
  el(g, "path", { d: curva(OREJA, true), fill: "#dc9e80", stroke: "rgba(120,60,45,0.55)", "stroke-width": 3 });
  el(g, "path", { d: curva([[982, 892], [1008, 930], [1010, 985], [994, 1032], [975, 1050]]), fill: "none", stroke: "rgba(120,60,45,0.5)", "stroke-width": 7, "stroke-linecap": "round" });
  el(g, "path", { d: curva([[950, 900], [985, 905], [998, 950]]), fill: "none", stroke: "rgba(255,226,206,0.5)", "stroke-width": 5, "stroke-linecap": "round" });
  el(g, "ellipse", { cx: 965, cy: 985, rx: 24, ry: 32, fill: "rgba(120,58,44,0.4)" });
  el(g, "ellipse", { cx: 950, cy: 975, rx: 9, ry: 12, fill: "#3e1f1a" });
  el(g, "path", { d: "M936 956 Q924 978 938 998 Q948 980 936 956 Z", fill: "#e2a688", stroke: "rgba(120,60,45,0.5)", "stroke-width": 2.5 });
  return g;
}

// ── por dentro: el cráneo, el cerebro y su arteria, la boca en corte y el nervio ───────────────────────────────────
function dentro(cam) {
  const g = el(cam, "g", { opacity: 0 });
  el(g, "path", { d: curva(PERFIL) + " Z", fill: "rgba(22,9,11,0.62)" });
  // la columna y la garganta
  for (let i = 0; i < 11; i++) {
    const y = 1130 + i * 64, x = 1004 - i * 4;
    el(g, "rect", { x: x - 40, y, width: 80, height: 52, rx: 14, fill: "rgba(200,186,152,0.45)", stroke: "rgba(156,139,106,0.6)", "stroke-width": 3 });
  }
  el(g, "path", { d: "M846 1060 Q870 1150 868 1260 Q866 1360 880 1520", fill: "none", stroke: "#2a0d10", "stroke-width": 34, "stroke-linecap": "round" });
  // el cráneo, por su borde
  el(g, "path", { d: curva(CRANEO, true), fill: "none", stroke: "#cdbf9e", "stroke-width": 16, opacity: 0.85 });
  el(g, "ellipse", { cx: 632, cy: 820, rx: 38, ry: 40, fill: "none", stroke: "rgba(205,191,158,0.55)", "stroke-width": 6 });
  // el cerebro, con sus pliegues
  const seso = el(g, "g");
  el(seso, "ellipse", { cx: 1050, cy: 975, rx: 78, ry: 46, fill: "#c98e94", stroke: "#9b5f68", "stroke-width": 3 });
  [0, 1, 2, 3].forEach((i) => el(seso, "path", { d: `M${985 + i * 6} ${960 + i * 11} Q1050 ${948 + i * 12} ${1118 - i * 4} ${966 + i * 10}`, fill: "none", stroke: "#9b5f68", "stroke-width": 3 }));
  el(seso, "path", { d: "M905 930 Q930 1010 940 1110", fill: "none", stroke: "#c48a8f", "stroke-width": 52, "stroke-linecap": "round" });
  el(seso, "path", { d: curva(CEREBRO, true), fill: "url(#c-seso)", stroke: "#9b5f68", "stroke-width": 4 });
  const plie = el(seso, "g", { "clip-path": "url(#c-cer)", fill: "none", stroke: "rgba(140,72,82,0.62)", "stroke-width": 5, "stroke-linecap": "round" });
  const r = K.azar(23);
  for (let i = 0; i < 46; i++) {
    const cx = 620 + r() * 540, cy = 500 + r() * 450, a = r() * Math.PI, P = [];
    for (let j = 0; j < 5; j++) P.push([cx + Math.cos(a) * (j - 2) * 34 + (r() - 0.5) * 30, cy + Math.sin(a) * (j - 2) * 34 + (r() - 0.5) * 30]);
    el(plie, "path", { d: curva(P) });
  }
  el(plie, "path", { d: curva([[730, 900], [800, 860], [880, 820], [960, 800]]), stroke: "rgba(120,52,64,0.85)", "stroke-width": 8 });
  el(plie, "path", { d: curva([[900, 505], [880, 620], [860, 720], [850, 800]]), stroke: "rgba(120,52,64,0.75)", "stroke-width": 7 });
  const escarcha = el(seso, "g", { opacity: 0 });
  el(escarcha, "path", { d: curva(CEREBRO, true), fill: "rgba(150,225,255,0.5)", stroke: CIAN, "stroke-width": 6 });
  const rc = K.azar(5);
  for (let i = 0; i < 18; i++) el(escarcha, "path", { d: copo(650 + rc() * 480, 540 + rc() * 360, 14 + rc() * 12), stroke: "#e8fbff", "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" });
  const brilloSeso = el(seso, "path", { d: curva(CEREBRO, true), fill: "url(#c-oro)", opacity: 0 });
  // la boca en corte: lo oscuro de dentro, el paladar con su hueso y sus vasos, la lengua y los dientes de delante
  const boca = el(g, "g");
  el(boca, "ellipse", { cx: 728, cy: 1052, rx: 140, ry: 52, fill: "#250b0e" });
  el(boca, "path", { d: curva([[600, 990], [660, 960], [740, 950], [820, 966], [850, 1000]]), fill: "none", stroke: "#1a0709", "stroke-width": 50, "stroke-linecap": "round" });
  el(boca, "path", { d: curva(mueve(PALADAR, 0, -20)), fill: "none", stroke: "#d8cba9", "stroke-width": 12, "stroke-linecap": "round" });
  el(boca, "path", { d: curva(mueve(PALADAR, 0, -7)), fill: "none", stroke: "#e58a90", "stroke-width": 17, "stroke-linecap": "round" });
  const rugas = el(boca, "g", { fill: "none", stroke: "rgba(170,70,80,0.55)", "stroke-width": 3, "stroke-linecap": "round" });
  [612, 630, 648, 668].forEach((x, i) => el(rugas, "path", { d: `M${x} ${1022 - i * 3} q4 -8 0 -14` }));
  el(boca, "path", { d: "M842 1048 Q856 1068 850 1084 Q838 1078 834 1056 Z", fill: "#e07c84" });
  // los vasos del paladar: uno largo y sus ramas
  const vas = el(boca, "g", { fill: "none", "stroke-linecap": "round" });
  const VASOS = [mueve(PALADAR.slice(0, 6), 2, -6)];
  [[624, 1020], [662, 1010], [700, 1006], [740, 1008], [780, 1016]].forEach(([x, y], i) => VASOS.push([[x, y - 1], [x + 12, y - 9 + (i % 2) * 3], [x + 26, y - 6]]));
  const vasosG = VASOS.map((P, i) => ({ halo: el(vas, "path", { d: curva(P), stroke: ROJO, opacity: 0 }), v: el(vas, "path", { d: curva(P), stroke: "#c42a3c" }), w: i ? 3 : 5 }));
  const fr = el(boca, "g", { opacity: 0 });
  el(fr, "ellipse", { cx: 712, cy: 1012, rx: 120, ry: 34, fill: "url(#c-frio)" });
  const copos = [[640, 1004], [676, 996], [714, 993], [752, 996], [790, 1006], [700, 1022]].map(([x, y]) => el(fr, "path", { d: copo(x, y, 9), stroke: "#e8fbff", "stroke-width": 2.5, fill: "none", "stroke-linecap": "round" }));
  const bola = el(boca, "path", { d: "M670 1032 C676 1014 742 1012 750 1028 C756 1042 690 1046 670 1032 Z", fill: "url(#c-bola)", opacity: 0 });
  const lengua = el(boca, "path", { fill: "url(#c-lengua)", stroke: "#93323d", "stroke-width": 3 });
  const lb = el(boca, "path", { fill: "none", stroke: "rgba(255,210,210,0.4)", "stroke-width": 5, "stroke-linecap": "round" });
  const cal = el(boca, "ellipse", { cx: 714, cy: 1020, rx: 150, ry: 60, fill: "url(#c-calor)", opacity: 0 });
  el(boca, "path", { d: "M580 1030 L596 1030 L594 1060 Q586 1066 580 1058 Z", fill: "#faf5ea", stroke: "#a89878", "stroke-width": 2 });
  el(boca, "path", { d: "M584 1066 L598 1066 L600 1092 Q592 1096 586 1090 Z", fill: "#faf5ea", stroke: "#a89878", "stroke-width": 2 });
  el(boca, "path", { d: curva([[578, 1100], [596, 1128], [610, 1180], [596, 1232], [640, 1250], [760, 1248]]), fill: "none", stroke: "rgba(205,191,158,0.5)", "stroke-width": 10, "stroke-linecap": "round" });
  // la arteria: sube por el cuello, entra en el cráneo y pasa por detrás de la frente
  const art = el(g, "g", { opacity: 0, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
  const ARTERIA = [[828, 1380], [810, 1250], [800, 1120], [792, 1010], [774, 952], [748, 918], [702, 892], [666, 838], [652, 770], [666, 700], [716, 640], [800, 600], [900, 586], [990, 602]];
  const dA = curva(ARTERIA);
  const ramas = el(art, "g", { stroke: "#b9303f", "stroke-width": 4 });
  ["M660 730 Q640 690 650 640", "M700 650 Q690 600 710 560", "M800 600 Q800 560 820 520", "M900 588 Q920 550 930 520", "M774 952 Q840 900 900 860 Q960 830 1010 830"].forEach((d) => el(ramas, "path", { d }));
  const aHalo = el(art, "path", { d: dA, stroke: "rgba(240,68,90,0.25)" });
  const aBorde = el(art, "path", { d: dA, stroke: "#7d1624" });
  const aDentro = el(art, "path", { d: dA, stroke: "#e23a4c" });
  const aLuz = el(art, "path", { d: dA, stroke: "rgba(255,170,175,0.55)" });
  const sangre = Array.from({ length: 16 }, () => el(art, "ellipse", { rx: 6, ry: 3.5, fill: "#ffd3d6" }));
  // el nervio trigémino: del tronco del cerebro al ganglio y sus tres ramas (frente, mejilla y paladar, mandíbula)
  const ner = el(g, "g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
  const RAMAS = [
    [RAIZ, [850, 934], GANGLIO],
    [GANGLIO, [740, 880], [690, 840], [648, 800], [612, 756], FRENTE],
    [GANGLIO, [730, 915], [670, 926], [612, 932], [572, 942]],
    [[704, 922], [706, 968], [700, 1004]],
    [GANGLIO, [800, 984], [790, 1060], [742, 1138], [662, 1170], [598, 1160]],
    [[612, 756], [584, 690], [580, 640]], [[612, 756], [610, 690], [616, 636]],
  ];
  const nervios = RAMAS.map((P, i) => {
    const d = curva(P), halo = el(ner, "path", { d, stroke: "rgba(255,194,74,0.25)", "stroke-width": 16, opacity: 0 }), p = el(ner, "path", { d, stroke: ORO, "stroke-width": i ? 6 : 9, opacity: 0 });
    const L = p.getTotalLength();
    [halo, p].forEach((e) => e.setAttribute("stroke-dasharray", `${f1(L)} ${f1(L)}`));
    return { halo, p, L };
  });
  const gan = el(ner, "ellipse", { cx: GANGLIO[0], cy: GANGLIO[1], rx: 18, ry: 12, fill: ORO, opacity: 0 });
  // las tres zonas de la cara que recoge
  const zonas = el(cam, "g", { "clip-path": "url(#c-cara)", opacity: 0 });
  [[600, 680, 90, 120], [610, 940, 80, 62], [660, 1170, 110, 56]].forEach(([cx, cy, rx, ry]) => el(zonas, "ellipse", { cx, cy, rx, ry, fill: "url(#c-oro)" }));
  return {
    g, escarcha, brilloSeso, zonas, gan,
    boca: (g_) => {
      const v = vasos(g_), fo = frio(g_), ca = calor(g_);
      vasosG.forEach((x) => {
        const w = x.w * v;
        x.v.setAttribute("stroke-width", f1(w));
        x.v.setAttribute("stroke", v < 0.7 ? "#8a2633" : v > 1.4 ? "#ff3d52" : "#c42a3c");
        x.halo.setAttribute("stroke-width", f1(w * 3.2));
        x.halo.setAttribute("opacity", f1(K.lim((v - 1) * 0.5) * (0.6 + 0.4 * Math.sin(vuelta(g_, 1.2)))));
      });
      fr.setAttribute("opacity", f1(fo));
      copos.forEach((c, i) => c.setAttribute("opacity", f1(0.55 + 0.45 * Math.sin(vuelta(g_, 0.9) + i * 1.7))));
      cal.setAttribute("opacity", f1(ca * (0.8 + 0.2 * Math.sin(vuelta(g_, 1.1)))));
      const b = bocado(g_);
      bola.setAttribute("opacity", f1(K.lim(b * 2)));
      bola.setAttribute("transform", `translate(${f1(-90 * (1 - b))} ${f1(14 * (1 - b))}) scale(1 ${f1(1 - 0.25 * subeLengua(g_))})`);
      const top = mezcla(LENGUA_R, LENGUA_A, subeLengua(g_));
      lengua.setAttribute("d", curva([...top, ...LENGUA_B], true));
      lb.setAttribute("d", curva(mueve(top.slice(1, 5), 0, 8)));
    },
    arteria: (g_) => {
      const on = arteriaOn(g_);
      art.setAttribute("opacity", f1(on));
      if (on < 0.01) return;
      const late = Math.pow(Math.max(0, Math.sin(vuelta(g_, 1.15))), 6), w = 11 * (1 + 1.1 * ancho(g_)) * (1 + 0.06 * late);
      aHalo.setAttribute("stroke-width", f1(w * 2.6)); aBorde.setAttribute("stroke-width", f1(w + 5));
      aDentro.setAttribute("stroke-width", f1(w)); aLuz.setAttribute("stroke-width", f1(w * 0.28));
      aHalo.setAttribute("opacity", f1(0.4 + 0.6 * ancho(g_)));
      const L = aDentro.getTotalLength(), fase = ciclo(g_, 0.45) + 0.55 * rampa(g_, T.ensancha, T.ensancha + 0.55) - 0.55 * rampa(g_, T.estrecharse, T.estrecharse + 0.65);
      sangre.forEach((s, i) => {
        const u = (fase + i / sangre.length) % 1, q = aDentro.getPointAtLength(u * L), q2 = aDentro.getPointAtLength(Math.min(L, u * L + 2));
        s.setAttribute("cx", f1(q.x)); s.setAttribute("cy", f1(q.y));
        s.setAttribute("transform", `rotate(${f1(Math.atan2(q2.y - q.y, q2.x - q.x) * 180 / Math.PI)} ${f1(q.x)} ${f1(q.y)})`);
        s.setAttribute("opacity", f1(Math.min(1, u * 10, (1 - u) * 10) * (0.55 + 0.45 * ancho(g_))));
      });
    },
    nervio: (g_) => {
      const on = nervioOn(g_), dib = sube(g_, T.nervio - 0.05, T.nervio + 0.9), cz = caras(g_);
      nervios.forEach((n, i) => {
        const tarde = i >= 5 ? 0.25 : i * 0.08, k = K.lim((dib - tarde) / (1 - tarde)) * (on > 0.01 ? 1 : 0);
        n.p.setAttribute("stroke-dashoffset", f1(n.L * (1 - k))); n.halo.setAttribute("stroke-dashoffset", f1(n.L * (1 - k)));
        n.p.setAttribute("opacity", f1(on)); n.halo.setAttribute("opacity", f1(on * (0.4 + 0.6 * cz)));
      });
      gan.setAttribute("opacity", f1(on));
      zonas.setAttribute("opacity", f1(cz * (0.75 + 0.25 * Math.sin(vuelta(g_, 1.3)))));
    },
  };
}
// cuánto ha avanzado una rampa de 0 a 1 entre a y b, sumada en el tiempo (para que la sangre acelere sin saltar)
const rampa = (g, a, b) => (g < a ? 0 : g < b ? (g - a) ** 2 / (2 * (b - a)) : g - a - (b - a) / 2);
function copo(x, y, r) {
  let d = "";
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI / 3, c = Math.cos(a) * r, s = Math.sin(a) * r;
    d += `M${f1(x - c)} ${f1(y - s)} L${f1(x + c)} ${f1(y + s)} `;
  }
  return d;
}

// ── un punto que viaja por un camino, con su estela ─────────────────────────────────────────────────────────────
function viaje(padre, P, color, punto) {
  const linea = el(padre, "path", { d: curva(P), fill: "none", stroke: color, "stroke-width": 7, "stroke-linecap": "round", opacity: 0 });
  const L = linea.getTotalLength();
  linea.setAttribute("stroke-dasharray", `${f1(L)} ${f1(L)}`);
  const p = el(padre, "circle", { r: 30, fill: `url(#${PRE}${punto})`, opacity: 0 });
  return (g, a, b, fin = b + 0.5) => {
    const u = K.suave(K.tramo(g, a, b)), op = K.lim((g - a + 0.12) / 0.15) * (1 - K.lim((g - fin) / 0.3));
    linea.setAttribute("stroke-dashoffset", f1(L * (1 - u)));
    linea.setAttribute("opacity", f1(op * 0.7));
    const q = linea.getPointAtLength(u * L);
    p.setAttribute("cx", f1(q.x)); p.setAttribute("cy", f1(q.y));
    p.setAttribute("opacity", f1(op * (u < 1 ? 1 : 0.6)));
  };
}

// ── el pinchazo de la frente: un brillo rojo y unos rayos que laten ─────────────────────────────────────────────────
function pinchazo(cam) {
  const g = el(cam, "g", { opacity: 0 });
  const halo = el(g, "circle", { cx: FRENTE[0], cy: FRENTE[1], r: 120, fill: "url(#c-dolor)" });
  const rayos = el(g, "g", { stroke: "#ffd9dc", "stroke-width": 6, "stroke-linecap": "round", fill: "none" });
  const R = Array.from({ length: 9 }, (_, i) => ({ e: el(rayos, "path", {}), a: -Math.PI * 0.95 + i * Math.PI * 0.24 }));
  return (g_) => {
    const d = dolor(g_), late = 0.5 + 0.5 * Math.sin(vuelta(g_, 1.5)), pico = K.sale(K.tramo(g_, T.pinchazo, T.pinchazo + 0.25)) * (1 - K.tramo(g_, T.pinchazo + 0.25, T.pinchazo + 1.2));
    g.setAttribute("opacity", f1(K.lim(d * 1.4)));
    halo.setAttribute("r", f1(90 + 40 * late * d + 60 * pico));
    R.forEach((r, i) => {
      const l0 = 70 + 10 * late, l1 = l0 + (26 + 22 * late + 40 * pico) * (i % 2 ? 0.7 : 1);
      const c = Math.cos(r.a), s = Math.sin(r.a);
      r.e.setAttribute("d", `M${f1(FRENTE[0] + c * l0)} ${f1(FRENTE[1] + s * l0)} L${f1(FRENTE[0] + c * l1)} ${f1(FRENTE[1] + s * l1)}`);
    });
    rayos.setAttribute("opacity", f1(d * (0.6 + 0.4 * late)));
  };
}

// ── el cucurucho de fresa en los labios, con la mano que lo sujeta ──────────────────────────────────────────────────
const BOLA = [[-64, 4], [-60, -26], [-40, -54], [-8, -66], [26, -60], [52, -40], [64, -8], [62, 14], [50, 24], [40, 40], [30, 26], [14, 30], [4, 48], [-8, 30], [-26, 30], [-40, 44], [-50, 26]];
function cucurucho(cam) {
  const g = el(cam, "g", { transform: "translate(484 1070) rotate(35)" });
  // la mano: el dorso hacia abajo a la derecha, los dedos rodeando la galleta
  el(g, "path", { d: "M10 110 C70 100 130 120 150 170 C175 230 190 330 230 520 L60 560 C40 420 10 300 -20 230 Z", fill: "url(#c-mano)", stroke: "rgba(110,52,40,0.4)", "stroke-width": 3 });
  el(g, "path", { d: "M-56 18 L56 18 L5 244 Q0 252 -5 244 Z", fill: "url(#c-galleta)" });
  el(g, "path", { d: "M-56 18 L56 18 L5 244 Q0 252 -5 244 Z", fill: "url(#c-gofre)" });
  el(g, "rect", { x: -62, y: 10, width: 124, height: 24, rx: 11, fill: "#e0a35e", stroke: "#9d6227", "stroke-width": 3 });
  [118, 146, 174, 202].forEach((y, i) => {
    const x0 = -44 + i * 6, x1 = 70 - i * 4;
    el(g, "rect", { x: x0, y: y - 14, width: x1 - x0, height: 30, rx: 15, fill: "url(#c-mano)", stroke: "rgba(110,52,40,0.45)", "stroke-width": 3 });
    el(g, "path", { d: `M${x0 + 10} ${y - 4} Q${x0 + 20} ${y - 11} ${x0 + 34} ${y - 9}`, fill: "none", stroke: "rgba(255,226,206,0.55)", "stroke-width": 3, "stroke-linecap": "round" });
  });
  el(g, "path", { d: "M70 100 C40 92 -6 96 -30 108 C-40 114 -34 126 -22 124 C10 118 50 120 80 126 Z", fill: "url(#c-mano)", stroke: "rgba(110,52,40,0.45)", "stroke-width": 3 });
  // la bola, con sus gotas sobre el borde, sus trocitos y su brillo
  el(g, "path", { d: curva(BOLA, true), fill: "url(#c-bola)", stroke: "rgba(160,50,90,0.4)", "stroke-width": 2.5 });
  const r = K.azar(12);
  for (let i = 0; i < 9; i++) el(g, "ellipse", { cx: f1(-44 + r() * 90), cy: f1(-50 + r() * 70), rx: 4.5, ry: 2.6, fill: "#b2203f", transform: `rotate(${f1(r() * 180)})`, opacity: 0.8 });
  el(g, "ellipse", { cx: -28, cy: -36, rx: 18, ry: 10, fill: "rgba(255,255,255,0.55)", transform: "rotate(-35 -28 -36)" });
  // el vaho frío que sube de la bola
  const vaho = [0, 1, 2].map(() => el(cam, "path", { fill: "none", stroke: "rgba(215,245,255,0.5)", "stroke-width": 8, "stroke-linecap": "round", opacity: 0 }));
  return (g_) => vaho.forEach((v, i) => {
    const u = (ciclo(g_, 1 / 2.4) + i / 3) % 1, x = 450 + i * 26, y = 1000 - u * 120;
    v.setAttribute("d", `M${f1(x)} ${f1(y)} q${f1(-14 + 8 * Math.sin(vuelta(g_, 0.6) + i))} -24 0 -48 q14 -24 0 -48`);
    v.setAttribute("opacity", f1(0.7 * Math.sin(Math.PI * u)));
  });
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

// ── la gráfica del Doppler: el flujo de sangre en esa arteria, en vivo ────────────────────────────────────────────
function grafica(capa) {
  const e = K.crear(capa, `<div class="c-tarjeta c-dop"><div class="tit">sangre en la <b>arteria</b></div><div class="fu">Doppler · Harvard (2012)</div>
    <svg width="880" height="140" viewBox="0 0 880 140"><path d="M0 130 H880" stroke="rgba(255,255,255,0.12)" stroke-width="2"/><polyline fill="none" stroke="${ROJO}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/><circle r="10" fill="#fff"/></svg></div>`);
  const pl = e.querySelector("polyline"), pt = e.querySelector("circle");
  const flujo = (t) => 0.22 + 0.55 * ancho(t) + 0.13 * Math.pow(Math.max(0, Math.sin(vuelta(t, 1.15))), 6);
  return (g) => {
    const on = doppler(g);
    e.style.opacity = f1(on);
    if (on < 0.001) return;
    e.style.transform = `translateY(${f1((1 - on) * 30)}px)`;
    const pts = [];
    for (let i = 0; i <= 88; i++) { const t = g - 4 + i * 4 / 88; pts.push(`${f1(i * 10)},${f1(126 - 112 * flujo(t))}`); }
    pl.setAttribute("points", pts.join(" "));
    pt.setAttribute("cx", 880); pt.setAttribute("cy", f1(126 - 112 * flujo(g)));
  };
}

// ── la tarjeta del experimento del colegio: 5 s contra 30 s ────────────────────────────────────────────────────────
function conoSvg(n) {
  return `<svg width="440" height="240" viewBox="-220 -120 440 240" style="position:absolute;left:0;top:0">
    <defs><radialGradient id="${PRE}eb${n}" gradientUnits="userSpaceOnUse" cx="-18" cy="-40" r="70"><stop offset="0" stop-color="#ffe0ea"/><stop offset="0.45" stop-color="#f68fae"/><stop offset="1" stop-color="#c84f78"/></radialGradient>
    <linearGradient id="${PRE}eg${n}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0bd72"/><stop offset="1" stop-color="#9d6227"/></linearGradient></defs>
    <circle r="106" fill="rgba(255,255,255,0.03)" stroke="#1f272e" stroke-width="14"/>
    <circle class="aro" r="106" fill="none" stroke="${ORO}" stroke-width="14" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="666 666" stroke-dashoffset="666"/>
    <line class="aguja" x1="0" y1="0" x2="0" y2="-88" stroke="rgba(255,194,74,0.55)" stroke-width="5" stroke-linecap="round"/>
    <path d="M-38 -2 L38 -2 L3 96 Q0 102 -3 96 Z" fill="url(#${PRE}eg${n})"/>
    <path d="M-38 -2 L38 -2" stroke="#9d6227" stroke-width="8" stroke-linecap="round"/>
    <g class="bola"><path d="M-44 -4 C-48 -40 -26 -64 0 -64 C26 -64 48 -40 44 -4 C32 6 16 -2 6 8 C-6 0 -26 8 -44 -4 Z" fill="url(#${PRE}eb${n})"/>
    <ellipse cx="-16" cy="-42" rx="11" ry="6" fill="rgba(255,255,255,0.55)" transform="rotate(-30 -16 -42)"/></g></svg>`;
}
// los 145 alumnos: aparecen, se reparten en dos grupos y se encienden en rojo los que tuvieron dolor
const ALUMNOS = Array.from({ length: 145 }, (_, i) => {
  const lado = i < 73 ? 0 : 1, j = lado ? i - 73 : i, fila = Math.floor(j / 15), col = j % 15;
  const r = K.azar(i + 7);
  return { lado, x0: 34 + (i % 29) * 31, y0: 22 + Math.floor(i / 29) * 30, x1: (lado ? 506 : 16) + col * 29, y1: 22 + fila * 30, t: 27.75 + i * 0.011 + r() * 0.15, duele: false, f: r() };
});
[0, 1].forEach((lado) => { const g = ALUMNOS.filter((a) => a.lado === lado); g.sort((a, b) => a.f - b.f); g.slice(0, lado ? 9 : 20).forEach((a) => (a.duele = true)); });
function experimento(capa) {
  const col = (n, x, s, pc) => `<div class="col" style="left:${x}px">${conoSvg(n)}<div class="reloj">0 s</div><div class="nom">en <b style="color:${n ? "#cfd6db" : ROJO}">${s}</b></div>
    <div class="zona"><i></i><div class="num">${pc} %</div></div></div>`;
  const e = K.crear(capa, `<div class="c-tarjeta c-exp"><div class="cab">Un colegio · <b>145</b> alumnos</div>
    <svg class="gente" width="940" height="170" viewBox="0 0 940 170">${ALUMNOS.map(() => `<circle r="10"/>`).join("")}</svg>
    ${col(0, 40, "5 s", 27)}${col(1, 500, "30 s", 13)}
    <div class="x2">×2</div><div class="fu">les dolió la cabeza · Kaczorowski, BMJ (2002)</div></div>`);
  const pts = [...e.querySelectorAll(".gente circle")];
  const cols = [...e.querySelectorAll(".col")].map((c, i) => ({ aro: c.querySelector(".aro"), aguja: c.querySelector(".aguja"), bola: c.querySelector(".bola"), reloj: c.querySelector(".reloj"),
    barra: c.querySelector(".zona i"), num: c.querySelector(".num"), seg: i ? 30 : 5, pc: i ? 13 : 27, t: i ? [T.tardaban, T.minuto + 0.45] : [T.cinco, T.cinco + 0.75] }));
  const x2 = e.querySelector(".x2");
  return (g) => {
    const on = lista(g);
    e.style.opacity = f1(on);
    if (on < 0.001) return;
    e.style.transform = `translateY(${f1((1 - on) * 40)}px) scale(${(0.96 + 0.04 * on + 0.025 * K.suave(K.tramo(g, 28, 34.3))).toFixed(4)})`;
    const parte = K.suave(K.tramo(g, T.comian ?? 29.5, 30.25)), enc = K.sale(K.tramo(g, T.dolio - 0.1, T.dolio + 0.6));
    ALUMNOS.forEach((a, i) => {
      const p = pts[i], k = K.sale(K.tramo(g, a.t, a.t + 0.3)), u = K.suave(K.lim(parte * 1.4 - a.f * 0.4));
      p.setAttribute("cx", f1(a.x0 + (a.x1 - a.x0) * u)); p.setAttribute("cy", f1(a.y0 + (a.y1 - a.y0) * u));
      const rojo = a.duele ? enc : 0, late = rojo * (0.5 + 0.5 * Math.sin(vuelta(g, 1.4) + a.f * 6));
      p.setAttribute("r", f1(10 * k * (1 + 0.25 * late)));
      p.setAttribute("fill", rojo > 0.5 ? ROJO : a.lado && parte > 0.5 ? "#7d8a96" : "#cfd6db");
      p.setAttribute("opacity", f1(rojo > 0.5 ? 1 : 0.55 + 0.45 * k - 0.25 * enc));
    });
    cols.forEach((c, i) => {
      const p = K.tramo(g, c.t[0], c.t[1]);
      c.aro.setAttribute("stroke-dashoffset", f1(666 * (1 - p)));
      c.aguja.setAttribute("transform", `rotate(${f1(360 * p)})`);
      c.reloj.textContent = `${Math.round(p * c.seg)} s`;
      // la bola se acaba a bocados, y mientras espera se mece
      const b = 1 - 0.85 * (Math.floor(p * 5) / 5 + K.sale((p * 5) % 1) / 5), m = Math.sin(vuelta(g, 0.9) + i * 2);
      c.bola.setAttribute("transform", `translate(0 ${f1(-6 * (1 - b) + 3 * m)}) rotate(${f1(4 * m)}) scale(${f1(Math.max(0.15, b))})`);
      const h = 140 * c.pc / 27 * K.sale(K.tramo(g, T.dolio - 0.05, T.dolio + 0.5));
      c.barra.style.height = `${f1(h)}px`;
      c.num.style.bottom = `${f1(h + 6)}px`;
      c.num.style.opacity = f1(K.tramo(g, T.dolio, T.dolio + 0.3));
    });
    const k = K.sale(K.tramo(g, T.doble - 0.05, T.doble + 0.3));
    x2.style.opacity = f1(k);
    x2.style.transform = `scale(${f1(0.4 + 0.6 * k + 0.12 * Math.sin(Math.PI * k) + 0.05 * k * Math.sin(vuelta(g, 1.4)))}) rotate(${f1(-12 * (1 - k))}deg)`;
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
  r(`¿de <b>aquí</b>?`, "r g", junto(FRENTE[0], FRENTE[1], 230, -30), (g) => asoma(g, T.frente, 3.5), T.no);
  r(`cerebro <b>congelado</b>`, "c", junto(880, 640, 0, 0), (g) => asoma(g, T.congela, 5.75), T.cerebro + 0.1);
  r(`el <b>paladar</b>`, "c g", junto(712, 1004, 0, -110), (g) => asoma(g, T.techo, 9.9));
  // boca
  r(`el frío <b>cierra</b> los vasos`, "c", () => [540, 1340], (g) => asoma(g, T.cierra, 13.35));
  r(`se abren de <b>golpe</b>`, "r g", () => [540, 1340], (g) => asoma(g, T.abren, 14.5));
  // arteria
  r(`<b>arteria</b>`, "r", junto(652, 770, -140, 0), (g) => asoma(g, T.arteria, 21.0));
  r(`<b>más</b> sangre`, "r g", junto(820, 600, 60, -90), (g) => asoma(g, T.mas, 21.9));
  r(`el dolor <b>se va</b>`, "v g", junto(FRENTE[0], FRENTE[1], 200, -80), (g) => asoma(g, T.va - 0.1, 24.2));
  // lengua
  r(`<b>lengua</b>`, "n", junto(730, 1060, 0, 120), (g) => asoma(g, T.lengua, 27.1));
  r(`lo <b>calientas</b>`, "n g", junto(712, 1004, 0, -120), (g) => asoma(g, T.calientas, 27.4));
  // nervio
  r(`¿por qué <b>aquí</b>?`, "r", junto(FRENTE[0], FRENTE[1], 220, -40), (g) => asoma(g, T.frente4, 37.2));
  r(`un <b>nervio</b>`, "o", junto(GANGLIO[0], GANGLIO[1], 60, 130), (g) => asoma(g, T.nervio, 39.5));
  r(`toda la <b>cara</b>`, "o g", () => [540, 1370], (g) => asoma(g, T.toda, 40.9));
  // cierre
  r(`nace en tu <b>boca</b>`, "c", junto(700, 1012, 0, 140), (g) => asoma(g, T.nace, 43.3));
  r(`lo pone <b>aquí</b>`, "r g", junto(FRENTE[0], FRENTE[1], 250, -40), (g) => asoma(g, T.frente5 - 0.1, 44.95));
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
  const cb = cabeza(cam);
  const de = dentro(cam);
  const ore = oreja(cam);
  const pin = pinchazo(cam);
  const viajes = el(cam, "g");
  const baja = viaje(viajes, [FRENTE, [614, 780], [640, 880], [622, 980], [584, 1046]], ORO, "punto-o");        // hook: no viene de la frente
  const sube1 = viaje(viajes, [[700, 1004], [706, 968], [704, 922], GANGLIO, [850, 934], RAIZ], ORO, "punto-o"); // el aviso, al cerebro
  const sube2 = viaje(viajes, [[700, 1004], [706, 968], [704, 922], GANGLIO, [850, 934], RAIZ], ORO, "punto-o");
  const alaFrente = viaje(viajes, [RAIZ, [850, 934], GANGLIO, [740, 880], [690, 840], [648, 800], [612, 756], FRENTE], ROJO, "punto-r");
  const cu = cucurucho(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  const osc = K.crear(esc, `<div class="c-oscuro"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const gr = grafica(capa), ex = experimento(capa), ro = rotulos(capa);
  return { cam, pv, cb, de, ore, pin, baja, sube1, sube2, alaFrente, cu, osc, gr, ex, ro };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los 0,3 s en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // el golpe de «de golpe»: la cámara da un respingo cuando se abren los vasos
    const sac = K.sale(K.tramo(g, T.abren, T.abren + 0.08)) * (1 - K.tramo(g, T.abren + 0.08, T.abren + 0.5));
    const kx = k.x + sac * 6 * Math.sin(g * 90), ky = k.y + sac * 5 * Math.cos(g * 77), kz = k.z * (1 + 0.03 * sac);
    E.cam.setAttribute("transform", `translate(${(540 - kx * kz).toFixed(2)} ${(1000 - ky * kz).toFixed(2)}) scale(${kz.toFixed(4)})`);
    const c = corte(g), d = dolor(g);
    E.pv(g);
    E.cb.piel.setAttribute("opacity", f1(1 - 0.6 * c));
    E.cb.pelo.setAttribute("opacity", f1(1 - 0.75 * c));
    E.cb.ceja.setAttribute("d", `M564 ${f1(782 + 4 * d)} Q604 ${f1(760 + 10 * d)} 652 ${f1(772 - 2 * d)}`);
    E.cb.arruga.setAttribute("opacity", f1(d));
    E.de.g.setAttribute("opacity", f1(c));
    E.de.escarcha.setAttribute("opacity", f1(asoma(g, T.congela - 0.1, T.cerebro + 0.5)));
    E.de.brilloSeso.setAttribute("opacity", f1(asoma(g, T.cerebro2 - 0.1, 44.2) * (0.7 + 0.3 * Math.sin(vuelta(g, 1.6)))));
    E.de.boca(g);
    E.de.arteria(g);
    E.de.nervio(g);
    E.ore.setAttribute("opacity", f1(1 - 0.5 * c));
    E.pin(g);
    E.baja(g, T.no, T.frente2 + 0.2, 5.4);
    E.sube1(g, T.aviso, T.nervio + 0.3, 39.4);
    E.sube2(g, T.nace, T.boca2 + 0.5, 43.4);
    E.alaFrente(g, T.cerebro2 + 0.3, T.frente5, 44.85);
    E.cu(g);
    E.osc.style.opacity = f1(0.4 * lista(g));
    E.gr(g);
    E.ex(g);
    E.ro(g, { x: kx, y: ky, z: kz });
    return { g, k };
  };
  return E;
}
