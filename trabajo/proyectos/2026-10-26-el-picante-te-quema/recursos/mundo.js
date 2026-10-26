// Lo que sale en todas las escenas: una cara de frente, con los ojos apretados, la boca abierta y la lengua fuera; en
// la lengua, un chile rojo mordido; de la boca salen llamas, y al lado un termómetro marca 36 °C. Dentro de la
// lengua, al microscopio, la membrana de un nervio con dos sensores: el del calor (naranja) y el del frío (cian). La
// capsaicina, en oro, con forma de llave; el mentol, en cian. A la derecha de la cara, una placa de laboratorio con
// células y la medalla del Nobel; a la izquierda, una mata de chiles con un pájaro. Todo en 2D, con la cámara dentro
// del svg (un transform del grupo).
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", NARANJA = "#ff8a3d";
export const F0 = { x: 540, y: 1000, z: 1 };                  // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma empalma con el primero.
export const TOTAL = 45.41;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const pico = (g, t, sub = 0.08, baja = 0.5) => K.sale(K.tramo(g, t, t + sub)) * (1 - K.suave(K.tramo(g, t + sub, t + baja)));

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, sensor: 4.04, llave: 9.8, alarma: 15.38, nobel: 21.72, mentol: 27.12, pajaros: 32.56, cierre: 38.42 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  picante: 0.24, quema: 1.04, boca: 1.44, mintiendo: 2.6, lengua: 3.2,
  lengua2: 4.5, sensor: 5.48, salta: 6.6, calor: 7.31, verdad: 7.94, cuarenta: 9.06, grados: 9.27,
  capsaicina: 9.92, chile: 10.72, encaja: 11.16, sensor2: 12.02, llave: 12.74, abre: 13.52, sin: 14.0, calor2: 14.56,
  cerebro: 15.52, alarma: 16.68, fuego: 17.12, cuerpo: 17.84, cree: 18.4, sudas: 19.04, rojo: 20.08, lloras: 20.72,
  encontrar: 21.76, sensor3: 22.73, chile2: 23.98, nobel: 25.09, dosmil: 25.71, david: 26.2, julius: 26.61,
  mentol: 27.38, truco: 28.46, reves: 28.9, abre2: 29.58, sensor4: 29.98, frio: 30.54, haga: 31.38, frio2: 31.66,
  pajaros: 32.86, capsaicina2: 33.42, pica: 34.46, nada: 34.7, comen: 35.5, chile3: 35.82, siembran: 36.38, semillas: 37.02, enteras: 37.5,
  chile4: 38.62, pica2: 38.9, espantar: 39.5, mamiferos: 40.1, aun: 41.14, bocado: 42.38, lengua3: 43.14, vuelve: 43.74, creer: 44.22, arde: 44.7,
};

// ── lo que pasa en cada momento ───────────────────────────────────────────────────────────────────────────────────
// lo fuerte de las llamas (0,85 en el fotograma 0 y en el último)
const llama = (g) => 0.85 + 0.4 * pico(g, T.quema, 0.08, 0.8) + 0.45 * sube(g, T.fuego - 0.1, T.fuego + 0.4) - 0.45 * sube(g, 21.3, 21.7)
  + 0.3 * sube(g, T.pica2 - 0.1, T.pica2 + 0.5) - 0.3 * sube(g, 43.4, 44.4) + 0.35 * pico(g, T.arde, 0.08, 0.5);
// las llamas de mentira: un holograma que parpadea
const holo = (g) => sube(g, T.mintiendo - 0.05, T.mintiendo + 0.2) - sube(g, 15.4, 15.6);
const rubor = (g) => 0.35 - 0.35 * sube(g, 4.0, 4.4) + sube(g, T.rojo - 0.1, T.rojo + 0.4) - sube(g, 21.4, 21.8) + 0.35 * sube(g, 39.0, 40.2);
const sudor = (g) => sube(g, T.sudas - 0.1, T.sudas + 0.4) - sube(g, 21.4, 21.8);
const llanto = (g) => sube(g, T.lloras - 0.1, T.lloras + 0.3) - sube(g, 21.4, 21.8);
const aprieta = (g) => 0.5 + 0.5 * pico(g, T.quema, 0.06, 0.7) + 0.5 * sube(g, T.fuego, T.fuego + 0.3) - 0.5 * sube(g, 21.3, 21.7) + 0.5 * pico(g, T.arde, 0.06, 0.5);
const micro = (g) => sube(g, 4.3, 4.8) - sube(g, 15.5, 15.95) + sube(g, 27.1, 27.12) - sube(g, 32.54, 32.56);  // la lente
const cerebroOn = (g) => sube(g, 15.6, 16.1) - sube(g, 21.3, 21.7);
const nervioOn = (g) => sube(g, 15.45, 15.8) - sube(g, 21.3, 21.7);
// lo abierto de cada sensor
const abreV = (g) => sube(g, T.salta + 0.05, T.salta + 0.3) - sube(g, 9.25, 9.55) + sube(g, T.abre, T.abre + 0.3) - sube(g, 15.9, 16.2);
const abreM = (g) => sube(g, T.abre2, T.abre2 + 0.3) - sube(g, 32.6, 32.9);
const calorOn = (g) => sube(g, 6.2, 6.6) - sube(g, 9.15, 9.5);

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
// el centro de la lente del microscopio, en la punta de la lengua; lo de dentro se dibuja a escala de pantalla (z = 8)
const MC = [560, 1420], MZ = 8;
const enMundo = (lx, ly) => [MC[0] + lx / MZ, MC[1] + ly / MZ];
// en la lente: el sensor del calor en lx = 0, el del frío en lx = 900; la membrana en ly = 0
const XM = 700;
const lente = (lx, ly, z) => ({ x: MC[0] + lx / MZ, y: MC[1] + ly / MZ, z });
// la placa del laboratorio y la mata de chiles
const PL = [2400, 1080], PLR = 330;
const MATA = -1720;
const CAMINO = [
  [0, F0], [2.5, { x: 540, y: 1025, z: 1.06 }], [3.45, { x: 548, y: 1120, z: 1.18 }],     // la boca, la lengua
  [4.05, { x: 556, y: 1320, z: 1.8 }], [4.95, lente(0, -60, MZ)],                          // dentro de la lengua
  [7.0, lente(0, -60, 8.3)], [9.3, lente(0, -70, 7.9)], [12.0, lente(0, -90, 8.6)], [13.6, lente(0, -70, 8.7)], [15.15, lente(0, -60, 8.0)],
  [16.25, { x: 540, y: 560, z: 0.47 }], [18.2, { x: 540, y: 560, z: 0.5 }],                // sale: la cara entera
  [18.95, { x: 560, y: 760, z: 0.66 }], [21.71, { x: 560, y: 775, z: 0.71 }],              // sudas, rojo, lloras
  [21.72, { x: PL[0], y: 1010, z: 0.94 }],                                                   // corte: la placa
  [21.95, { x: PL[0], y: 1020, z: 0.96 }], [23.5, { x: PL[0], y: 1050, z: 1.06 }],          // la placa
  [24.55, { x: PL[0] + 20, y: 1080, z: 1.14 }], [25.3, { x: PL[0], y: 1000, z: 1.0 }], [27.11, { x: PL[0], y: 994, z: 1.03 }],
  [27.12, lente(330, -60, 4.3)], [28.7, lente(380, -60, 4.6)],                               // otra vez dentro: los dos
  [29.55, lente(XM, -70, 7.0)], [32.55, lente(XM, -60, 7.6)],                               // el del frío
  [32.56, { x: MATA + 30, y: 1005, z: 0.98 }], [32.85, { x: MATA + 40, y: 1000, z: 1.0 }], [34.2, { x: MATA + 70, y: 1000, z: 1.07 }],   // el pájaro
  [35.1, { x: MATA + 100, y: 990, z: 1.16 }], [36.3, { x: MATA + 80, y: 1000, z: 1.1 }], [37.3, { x: MATA, y: 1080, z: 1.0 }], [38.41, { x: MATA, y: 1088, z: 1.02 }],
  [38.42, { x: 540, y: 870, z: 0.64 }], [38.95, { x: 540, y: 880, z: 0.66 }], [41.0, { x: 540, y: 900, z: 0.72 }],                // la cara otra vez
  [42.5, { x: 540, y: 960, z: 0.86 }], [44.4, { x: 540, y: 995, z: 0.99 }], [TOTAL, F0],
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
const texto = (padre, x, y, s, at, tam, color, peso = 800) => {
  const t = el(padre, "text", { x, y, "text-anchor": "middle", fill: color, "font-size": tam, "font-weight": peso, style: "font-family: var(--letra), sans-serif", ...at });
  t.textContent = s;
  return t;
};

// ── la cara, de frente ──────────────────────────────────────────────────────────────────────────────────────────
const OJOS = [[300, 560], [780, 560]];
const BOCA = [540, 1110];
const CEREBRO = [540, 330];
// el camino del nervio: de la punta de la lengua, por dentro de la mejilla, al cerebro
const NERVIO = [[560, 1400], [610, 1240], [700, 1120], [790, 960], [800, 760], [730, 560], [640, 470]];
function cara(cam) {
  const g = el(cam, "g");
  // el cuello y los hombros
  el(g, "path", { d: "M380 1560 L380 2050 L700 2050 L700 1560 Z", fill: "url(#c-cuello)" });
  el(g, "path", { d: "M-400 2400 C-380 2060 100 1930 380 1900 L700 1900 C980 1930 1460 2060 1480 2400 Z", fill: "#1e2a3a" });
  el(g, "path", { d: "M380 1900 Q540 2010 700 1900", fill: "none", stroke: "#2c3c52", "stroke-width": 14 });
  // las orejas
  [[-100, 1], [1180, -1]].forEach(([x, s]) => {
    el(g, "ellipse", { cx: x, cy: 640, rx: 70, ry: 140, fill: "#c98568" });
    el(g, "path", { d: `M${x + s * 20} 540 C${x - s * 30} 580 ${x - s * 30} 720 ${x + s * 18} 760`, fill: "none", stroke: "rgba(110,50,36,0.5)", "stroke-width": 12, "stroke-linecap": "round" });
  });
  // la cabeza
  el(g, "ellipse", { cx: 540, cy: 860, rx: 650, ry: 820, fill: "url(#c-piel)" });
  // el pelo
  el(g, "path", { d: "M-110 640 C-150 160 160 -60 540 -60 C920 -60 1230 160 1190 640 C1140 420 1060 300 960 250 C820 190 700 230 540 220 C380 230 240 190 120 250 C20 300 -60 420 -110 640 Z", fill: "url(#c-pelo)" });
  const rp = K.azar(12), mechas = el(g, "g", { fill: "none", stroke: "rgba(120,80,50,0.35)", "stroke-width": 6, "stroke-linecap": "round" });
  for (let i = 0; i < 26; i++) { const x = -40 + i * 46 + rp() * 20; el(mechas, "path", { d: `M${f1(x)} ${f1(40 + rp() * 60)} q${f1(30 + rp() * 30)} ${f1(80 + rp() * 40)} ${f1(10 + rp() * 40)} ${f1(170 + rp() * 60)}` }); }
  // el cerebro, como en una radiografía (sale en «alarma»)
  const cerOn = el(g, "g", { opacity: 0 }), cer = el(cerOn, "g", { transform: "translate(540 300) scale(0.85) translate(-540 -330)" });
  el(cer, "ellipse", { cx: CEREBRO[0], cy: CEREBRO[1], rx: 430, ry: 290, fill: "url(#c-craneo)" });
  el(cer, "path", { d: "M180 380 C140 240 240 110 400 100 C470 60 610 60 680 100 C840 110 940 240 900 380 C880 470 780 500 700 470 C640 520 440 520 380 470 C300 500 200 470 180 380 Z", fill: "rgba(255,170,190,0.16)", stroke: "rgba(255,200,215,0.7)", "stroke-width": 7 });
  el(cer, "path", { d: "M540 90 C530 200 550 320 540 480", fill: "none", stroke: "rgba(255,200,215,0.5)", "stroke-width": 6 });
  const rc = K.azar(21), surcos = el(cer, "g", { fill: "none", stroke: "rgba(255,200,215,0.42)", "stroke-width": 5, "stroke-linecap": "round" });
  for (let i = 0; i < 18; i++) {
    const x = 230 + rc() * 620, y = 150 + rc() * 280, P = [[x, y]];
    for (let j = 1; j < 4; j++) P.push([x + j * (24 + rc() * 14) * (i % 2 ? 1 : -1), y + Math.sin(j * 2.1 + i) * 28]);
    el(surcos, "path", { d: curva(P) });
  }
  const destello = el(cer, "ellipse", { cx: CEREBRO[0], cy: CEREBRO[1], rx: 470, ry: 330, fill: "url(#c-punto-r)", opacity: 0 });
  const anillos = [0, 1, 2].map(() => el(cer, "ellipse", { cx: CEREBRO[0], cy: CEREBRO[1], fill: "none", stroke: ROJO, "stroke-width": 12, opacity: 0 }));
  // las cejas, levantadas y juntas (le duele)
  [[1, 300], [-1, 780]].forEach(([s, x]) => el(g, "path", { d: `M${x - s * 150} 470 C${x - s * 80} 430 ${x} 410 ${x + s * 120} 380`, fill: "none", stroke: "#3b2416", "stroke-width": 30, "stroke-linecap": "round" }));
  // los ojos, apretados: una curva gruesa, pestañas y arrugas en el rabillo
  const ojos = OJOS.map(([x, y], i) => {
    const s = i ? -1 : 1, o = el(g, "g");
    el(o, "ellipse", { cx: x, cy: y, rx: 150, ry: 70, fill: "rgba(120,60,44,0.35)" });
    const linea = el(o, "path", { fill: "none", stroke: "#2a1610", "stroke-width": 13, "stroke-linecap": "round" });
    const pest = el(o, "path", { fill: "none", stroke: "#2a1610", "stroke-width": 6, "stroke-linecap": "round" });
    const arrugas = el(o, "path", { fill: "none", stroke: "rgba(110,50,36,0.6)", "stroke-width": 6, "stroke-linecap": "round" });
    return { x, y, s, linea, pest, arrugas };
  });
  // la nariz
  el(g, "path", { d: "M500 640 C490 720 470 780 450 830", fill: "none", stroke: "rgba(110,55,40,0.35)", "stroke-width": 12, "stroke-linecap": "round" });
  el(g, "ellipse", { cx: 540, cy: 845, rx: 105, ry: 62, fill: "url(#c-nariz)" });
  el(g, "ellipse", { cx: 490, cy: 875, rx: 26, ry: 14, fill: "#5e2c22" });
  el(g, "ellipse", { cx: 590, cy: 875, rx: 26, ry: 14, fill: "#5e2c22" });
  el(g, "ellipse", { cx: 540, cy: 820, rx: 40, ry: 18, fill: "rgba(255,230,210,0.3)" });
  // el rubor de las mejillas
  const rub = el(g, "g", { opacity: 0 });
  [[230, 900], [850, 900]].forEach(([x, y]) => el(rub, "ellipse", { cx: x, cy: y, rx: 210, ry: 140, fill: "url(#c-rubor)" }));
  // la boca abierta: el hueco, los dientes de arriba, la garganta, los labios
  const [bx, by] = BOCA;
  const HUECO = `M300 1060 C360 990 470 1010 540 1015 C610 1010 720 990 780 1060 C760 1180 650 1260 540 1262 C430 1260 320 1180 300 1060 Z`;
  el(g, "path", { d: HUECO, fill: "url(#c-hueco)" });
  el(g, "ellipse", { cx: bx, cy: 1150, rx: 120, ry: 70, fill: "rgba(150,30,40,0.55)" });
  el(g, "path", { d: "M352 1046 C420 1020 480 1028 540 1030 C600 1028 660 1020 728 1046 L716 1090 C660 1080 600 1084 540 1086 C480 1084 420 1080 364 1090 Z", fill: "url(#c-diente)" });
  [410, 475, 540, 605, 670].forEach((x) => el(g, "line", { x1: x, y1: 1030, x2: x, y2: 1086, stroke: "rgba(150,140,130,0.6)", "stroke-width": 3 }));
  el(g, "path", { d: "M290 1062 C350 980 470 990 540 1008 C610 990 730 980 790 1062 C730 1020 640 1012 540 1028 C440 1012 350 1020 290 1062 Z", fill: "url(#c-labio)" });
  el(g, "path", { d: "M290 1062 C330 1190 430 1280 540 1282 C650 1280 750 1190 790 1062 C740 1170 650 1250 540 1254 C430 1250 340 1170 290 1062 Z", fill: "url(#c-labio)" });
  el(g, "path", { d: "M400 1250 C470 1270 610 1270 680 1250", fill: "none", stroke: "rgba(255,220,220,0.35)", "stroke-width": 8, "stroke-linecap": "round" });
  // la lengua, fuera, por encima del labio de abajo
  const LENGUA = "M400 1150 C390 1250 390 1360 430 1440 C470 1500 610 1500 650 1440 C690 1360 690 1250 680 1150 C620 1130 460 1130 400 1150 Z";
  el(g, "path", { d: LENGUA, fill: "url(#c-lengua)", stroke: "#9a3a4a", "stroke-width": 4 });
  el(g, "path", { d: "M540 1170 C536 1260 538 1360 545 1440", fill: "none", stroke: "rgba(140,40,60,0.55)", "stroke-width": 9, "stroke-linecap": "round" });
  const rl = K.azar(5), pap = el(g, "g", { fill: "rgba(255,190,200,0.55)" });
  for (let i = 0; i < 70; i++) {
    const x = 420 + rl() * 240, y = 1180 + rl() * 290;
    if (Math.abs(x - 540) > 130 - (y > 1420 ? (y - 1420) * 1.6 : 0)) continue;
    el(pap, "circle", { cx: f1(x), cy: f1(y), r: f1(2.5 + rl() * 3) });
  }
  el(g, "ellipse", { cx: 480, cy: 1220, rx: 40, ry: 90, fill: "rgba(255,230,235,0.25)", transform: "rotate(-8 480 1220)" });
  // el chile, tumbado en la lengua, con un mordisco en la punta
  chile(g, 700, 1250, 1.0, 152, true);
  // el sudor de la frente, las lágrimas y el nervio
  const sud = [[300, 300, 0.1], [460, 250, 0.55], [640, 270, 0.3], [800, 320, 0.8], [180, 420, 0.65], [900, 430, 0.2]].map(([x, y, f]) => ({ x, y, f, e: el(g, "path", { fill: "url(#c-lagrima)", stroke: "rgba(230,250,255,0.85)", "stroke-width": 3, opacity: 0 }) }));
  const lag = [0, 1, 2, 3].map((i) => ({ o: OJOS[i % 2], s: i % 2 ? 1 : -1, f: [0.1, 0.45, 0.7, 0.25][i], e: el(g, "path", { fill: "url(#c-lagrima)", stroke: "rgba(230,250,255,0.85)", "stroke-width": 3, opacity: 0 }), reg: el(g, "path", { fill: "none", stroke: "rgba(170,230,255,0.4)", "stroke-width": 10, "stroke-linecap": "round", opacity: 0 }) }));
  const ner = el(g, "g", { fill: "none", "stroke-linecap": "round", opacity: 0 });
  const nHalo = el(ner, "path", { d: curva(NERVIO), stroke: "rgba(255,138,61,0.3)", "stroke-width": 26 });
  const nLinea = el(ner, "path", { d: curva(NERVIO), stroke: NARANJA, "stroke-width": 9 });
  const NL = nLinea.getTotalLength();
  [nHalo, nLinea].forEach((e) => e.setAttribute("stroke-dasharray", `${f1(NL)} ${f1(NL)}`));
  const pulsos = [0, 1, 2].map(() => el(ner, "circle", { r: 40, fill: "url(#c-punto-r)", opacity: 0 }));

  return (gg) => {
    const ap = aprieta(gg);
    ojos.forEach((o) => {
      const h = 18 + 22 * ap, w = 120 - 10 * ap;
      o.linea.setAttribute("d", `M${f1(o.x - w)} ${f1(o.y + 6)} C${f1(o.x - w * 0.4)} ${f1(o.y - h)} ${f1(o.x + w * 0.4)} ${f1(o.y - h)} ${f1(o.x + w)} ${f1(o.y + 6)}`);
      let d = "";
      for (let j = 0; j < 7; j++) { const u = 0.15 + j * 0.115, x = o.x - w + 2 * w * u, y = o.y + 6 - h * 1.5 * 4 * u * (1 - u) * 0.5 + 4; d += `M${f1(x)} ${f1(y)} l${f1((u - 0.5) * 18)} 22 `; }
      o.pest.setAttribute("d", d);
      const ex = o.s > 0 ? o.x - w - 10 : o.x + w + 10, dx = o.s > 0 ? -1 : 1;
      o.arrugas.setAttribute("d", `M${f1(ex)} ${f1(o.y - 20)} l${f1(dx * (30 + 20 * ap))} -14 M${f1(ex)} ${f1(o.y + 4)} l${f1(dx * (36 + 24 * ap))} 0 M${f1(ex)} ${f1(o.y + 28)} l${f1(dx * (30 + 20 * ap))} 14`);
    });
    show(rub, rubor(gg));
    // el sudor: gotas que asoman en la frente y resbalan
    const su = sudor(gg);
    sud.forEach((d) => {
      const u = (ciclo(gg, 0.4) + d.f) % 1, r = 14 + 6 * K.sale(K.lim(u / 0.4)), y = d.y + 140 * K.entra(K.lim((u - 0.4) / 0.6));
      d.e.setAttribute("d", gota(d.x, y, r));
      show(d.e, su * (1 - K.lim((u - 0.88) / 0.12)));
    });
    // las lágrimas: salen del rabillo y caen por la mejilla
    const ll = llanto(gg);
    lag.forEach((d) => {
      const u = (ciclo(gg, 0.45) + d.f) % 1, x = d.o[0] - d.s * 100 + d.s * 10 * u, y0 = d.o[1] + 40, r = 16 + 6 * K.sale(K.lim(u / 0.3)), y = y0 + 330 * K.entra(K.lim((u - 0.3) / 0.7));
      d.e.setAttribute("d", gota(x, y, r));
      show(d.e, ll * (1 - K.lim((u - 0.9) / 0.1)));
      d.reg.setAttribute("d", `M${f1(d.o[0] - d.s * 100)} ${f1(y0)} L${f1(x)} ${f1(y - r)}`);
      show(d.reg, ll * K.lim((u - 0.3) * 4) * 0.8);
    });
    // el cerebro y el nervio que lleva la alarma
    const co = cerebroOn(gg), al = pico(gg, T.alarma, 0.08, 1.0), late = 0.35 + 0.25 * Math.max(0, Math.sin(vuelta(gg, 2.2)));
    show(cerOn, co);
    show(destello, co * Math.max(al, K.lim((gg - T.alarma) / 0.2) * late * (1 - K.lim((gg - 21.0) / 0.4))));
    anillos.forEach((a, i) => {
      const u = ((gg - T.alarma) * 1.1 + i / 3) % 1, k = K.lim((gg - T.alarma) / 0.05) * (1 - K.lim((gg - 18.6) / 0.4));
      if (gg < T.alarma) { show(a, 0); return; }
      a.setAttribute("rx", f1(300 + 380 * u)); a.setAttribute("ry", f1(200 + 260 * u));
      show(a, k * (1 - u) * 0.9);
    });
    const no = nervioOn(gg), dib = sube(gg, 15.45, 16.0);
    show(ner, no);
    [nHalo, nLinea].forEach((e) => e.setAttribute("stroke-dashoffset", f1(NL * (1 - dib))));
    pulsos.forEach((p, i) => {
      const u = ((gg - 15.6) * 1.0 + i / 3) % 1, k = K.lim((gg - 15.6 - i / 3) * 20) * (1 - K.lim((gg - 20.9) / 0.4));
      if (gg < 15.6 + i / 3 || k <= 0) { show(p, 0); return; }
      const q = nLinea.getPointAtLength(u * NL);
      p.setAttribute("cx", f1(q.x)); p.setAttribute("cy", f1(q.y));
      show(p, k * Math.sin(Math.PI * Math.min(1, u * 1.15)));
    });
  };
}
// una gota (de sudor o de lágrima) con la punta arriba
const gota = (x, y, r) => `M${f1(x)} ${f1(y - r * 1.9)} C${f1(x + r * 0.5)} ${f1(y - r)} ${f1(x + r)} ${f1(y - r * 0.2)} ${f1(x + r)} ${f1(y + r * 0.2)} A${f1(r)} ${f1(r)} 0 1 1 ${f1(x - r)} ${f1(y + r * 0.2)} C${f1(x - r)} ${f1(y - r * 0.2)} ${f1(x - r * 0.5)} ${f1(y - r)} ${f1(x)} ${f1(y - r * 1.9)} Z`;

// ── un chile rojo: el rabo en (x, y), el cuerpo hacia abajo girado «giro» grados; mordido, si se pide ─────────────
function chile(padre, x, y, s, giro, mordido = false) {
  const g = el(padre, "g", { transform: `translate(${x} ${y}) rotate(${giro}) scale(${s})` });
  const CUERPO = "M-40 10 C-60 80 -50 200 -10 300 C10 340 40 360 60 350 C40 300 50 180 40 10 C20 -6 -20 -6 -40 10 Z";
  el(g, "path", { d: CUERPO, fill: "url(#c-chile)", stroke: "#7a0f18", "stroke-width": 4 });
  el(g, "path", { d: "M-22 40 C-34 120 -24 220 4 290", fill: "none", stroke: "rgba(255,210,200,0.55)", "stroke-width": 9, "stroke-linecap": "round" });
  if (mordido) {
    // la punta, mordida: se ve la carne y las semillas
    el(g, "path", { d: "M-24 262 C-8 250 26 252 50 270 C46 300 50 330 60 350 C40 360 10 340 -10 300 Z", fill: "#0b0e12", opacity: 0 });
    el(g, "path", { d: "M-22 258 Q-6 246 8 258 Q22 246 36 258 Q46 250 52 262 L48 280 C24 270 0 270 -18 282 Z", fill: "#ffd9b8", stroke: "#c43a2e", "stroke-width": 3 });
    [[0, 266], [16, 262], [32, 268]].forEach(([sx, sy]) => el(g, "ellipse", { cx: sx, cy: sy, rx: 6, ry: 4, fill: "#fff3c0" }));
  }
  el(g, "path", { d: "M-46 14 C-40 -14 40 -14 46 14 C30 0 20 22 0 6 C-20 22 -30 0 -46 14 Z", fill: "#3f8a35", stroke: "#24561e", "stroke-width": 3 });
  el(g, "path", { d: "M0 0 C2 -30 14 -54 34 -66", fill: "none", stroke: "#3f8a35", "stroke-width": 12, "stroke-linecap": "round" });
  return g;
}

// ── las llamas que salen de la boca: de verdad o de holograma ─────────────────────────────────────────────────────
// cada lengua de fuego: x de la base, ancho, alto, fase, vueltas por segundo, capa (0 fuera, 1 dentro)
const LLAMAS = [
  [360, 150, 360, 0.0, 1.1, 0], [440, 170, 520, 1.7, 0.9, 0], [540, 200, 640, 3.1, 1.0, 0], [640, 170, 540, 4.4, 1.2, 0], [720, 150, 380, 5.6, 0.95, 0],
  [400, 110, 300, 2.2, 1.3, 1], [480, 120, 420, 0.6, 1.15, 1], [560, 140, 470, 3.8, 1.25, 1], [650, 110, 330, 5.0, 1.05, 1],
  [500, 70, 230, 1.2, 1.5, 2], [580, 80, 260, 4.6, 1.4, 2],
];
function lenguaFuego(bx, by, w, h, sw, curl) {
  const tx = bx + sw, ty = by - h;
  return `M${f1(bx - w / 2)} ${f1(by)} C${f1(bx - w * 0.62)} ${f1(by - h * 0.42)} ${f1(tx - w * 0.3 - curl)} ${f1(by - h * 0.7)} ${f1(tx)} ${f1(ty)} C${f1(tx + w * 0.2 + curl)} ${f1(by - h * 0.62)} ${f1(bx + w * 0.62)} ${f1(by - h * 0.4)} ${f1(bx + w / 2)} ${f1(by)} Q${f1(bx)} ${f1(by + w * 0.25)} ${f1(bx - w / 2)} ${f1(by)} Z`;
}
function llamas(cam) {
  const g = el(cam, "g");
  const brillo = el(g, "ellipse", { cx: 540, cy: 880, rx: 520, ry: 460, fill: "url(#c-fuego)" });
  const real = el(g, "g");
  const clip = el(cam, "clipPath", { id: `${PRE}llamas` });
  const hol = el(g, "g", { opacity: 0 });
  const fills = ["url(#c-llama0)", "url(#c-llama1)", "url(#c-llama2)"];
  const L = LLAMAS.map((l) => ({ l, r: el(real, "path", { fill: fills[l[5]] }), h: el(hol, "path", { fill: "rgba(95,212,255,0.12)", stroke: CIAN, "stroke-width": 4 }), c: el(clip, "path", {}) }));
  // las rayas del holograma, recortadas a las llamas
  const rayas = el(hol, "g", { "clip-path": "url(#c-llamas)" });
  const RAYAS = Array.from({ length: 34 }, (_, i) => el(rayas, "rect", { x: 200, y: 400 + i * 22, width: 680, height: 7, fill: "rgba(150,230,255,0.45)" }));
  const corte = el(hol, "rect", { x: 200, y: 0, width: 680, height: 26, fill: "rgba(200,245,255,0.5)", opacity: 0 });
  return (gg) => {
    const k = llama(gg), ho = holo(gg);
    // el parpadeo del holograma: fijo para cada instante
    const tic = Math.sin(gg * 71.3) * Math.sin(gg * 23.7), parpadea = ho > 0 ? 0.55 + 0.35 * Math.sign(tic) * Math.min(1, Math.abs(tic) * 3) : 1;
    const salto = ho * (Math.abs(Math.sin(gg * 13.1)) > 0.85 ? 22 * Math.sin(gg * 57) : 0);
    L.forEach((o, i) => {
      const [x, w, h, f, v, capa] = o.l, a = vuelta(gg, v) + f;
      const hh = h * k * (0.82 + 0.12 * Math.sin(a) + 0.06 * Math.sin(2.3 * a + i));
      const sw = 26 * Math.sin(a * 0.5 + i) + 14 * Math.sin(1.7 * a), curl = 18 * Math.sin(a + 1);
      const by = 1100 - capa * 6 + 8 * Math.sin(vuelta(gg, 0.7) + i);
      const d = lenguaFuego(x, by, w * (0.9 + 0.1 * k), hh, sw, curl);
      o.r.setAttribute("d", d); o.c.setAttribute("d", d);
      o.h.setAttribute("d", lenguaFuego(x + salto * (i % 2 ? 1 : -0.6), by, w, hh, sw, curl));
    });
    show(real, 1 - ho);
    show(hol, ho * parpadea);
    show(brillo, (0.75 + 0.25 * Math.sin(vuelta(gg, 1.3))) * Math.min(1.3, k) / 1.3 * (1 - 0.8 * ho));
    hol.setAttribute("transform", `translate(${f1(salto)} 0)`);
    if (ho > 0.01) {
      const off = (ciclo(gg, 0.6) % 1) * 22;
      RAYAS.forEach((r, i) => r.setAttribute("y", f1(400 + i * 22 + off)));
      const u = (gg * 1.7) % 1;
      corte.setAttribute("y", f1(1100 - 700 * u));
      show(corte, ho * 0.8 * Math.sin(Math.PI * u));
    }
  };
}

// ── el termómetro: 36 °C de verdad, con la raya roja de 43 °C ────────────────────────────────────────────────────
const TX = 960, ty = (c) => 1180 - (c - 30) * 25;
function termometro(cam) {
  const g = el(cam, "g");
  el(g, "rect", { x: TX - 44, y: 600, width: 88, height: 640, rx: 44, fill: "rgba(12,15,19,0.82)", stroke: "rgba(255,255,255,0.18)", "stroke-width": 3 });
  el(g, "rect", { x: TX - 16, y: 640, width: 32, height: 600, rx: 16, fill: "rgba(220,235,245,0.18)", stroke: "rgba(230,240,250,0.6)", "stroke-width": 4 });
  el(g, "circle", { cx: TX, cy: 1270, r: 44, fill: "rgba(220,235,245,0.18)", stroke: "rgba(230,240,250,0.6)", "stroke-width": 4 });
  el(g, "circle", { cx: TX, cy: 1270, r: 32, fill: VERDE });
  const col = el(g, "rect", { x: TX - 8, width: 16, rx: 8, fill: VERDE });
  for (let c = 30; c <= 50; c += 2) el(g, "line", { x1: TX + 16, y1: ty(c), x2: TX + 16 + (c % 10 === 0 ? 22 : 12), y2: ty(c), stroke: "rgba(230,240,250,0.7)", "stroke-width": 3 });
  el(g, "line", { x1: TX - 60, y1: ty(43), x2: TX + 40, y2: ty(43), stroke: ROJO, "stroke-width": 6, "stroke-dasharray": "14 8" });
  texto(g, TX - 4, ty(43) - 18, "43°", {}, 34, ROJO);
  const lectura = el(g, "g");
  el(lectura, "rect", { x: TX - 150, y: ty(36) - 30, width: 110, height: 60, rx: 14, fill: "rgba(12,15,19,0.9)", stroke: VERDE, "stroke-width": 3 });
  texto(lectura, TX - 95, ty(36) + 14, "36°", {}, 40, VERDE);
  el(g, "circle", { cx: TX - 10, cy: 1252, r: 9, fill: "rgba(255,255,255,0.6)" });
  return (gg) => {
    // el mercurio tiembla un pelo, pero no sube
    const y = ty(36) + 2 * Math.sin(vuelta(gg, 0.5));
    col.setAttribute("y", f1(y)); col.setAttribute("height", f1(1262 - y));
    show(lectura, 1 - asoma(gg, T.quema, 3.9));
  };
}

// ── dentro de la lengua, al microscopio: la membrana del nervio y sus dos sensores ──────────────────────────────
// una mitad de un sensor (lado -1, la izquierda), en unidades de la lente
const MITAD = "M-14 -150 C-14 -176 -40 -186 -70 -186 C-100 -186 -118 -170 -118 -140 L-118 140 C-118 168 -100 184 -70 184 C-40 184 -14 172 -14 150 L-14 40 C-26 20 -26 -20 -14 -40 Z";
function sensor(padre, x, color, oscuro, id) {
  const g = el(padre, "g", { transform: `translate(${x} 0)` });
  const halo = el(g, "ellipse", { rx: 260, ry: 260, fill: `url(#c-punto-${id})`, opacity: 0 });
  const poro = el(g, "ellipse", { rx: 30, ry: 170, fill: `url(#c-punto-${id})`, opacity: 0 });
  const mitades = [-1, 1].map((lado) => {
    const m = el(g, "g");
    el(m, "path", { d: MITAD, fill: color, stroke: oscuro, "stroke-width": 6, transform: lado > 0 ? "scale(-1 1)" : "" });
    el(m, "path", { d: "M-100 -120 C-80 -100 -50 -110 -30 -90 M-100 -40 C-80 -20 -50 -30 -30 -10 M-100 40 C-80 60 -50 50 -30 70 M-100 120 C-80 140 -50 130 -30 150", fill: "none", stroke: "rgba(255,255,255,0.35)", "stroke-width": 6, "stroke-linecap": "round", transform: lado > 0 ? "scale(-1 1)" : "" });
    return { m, lado };
  });
  return { g, halo, poro, mitades };
}
// la molécula de capsaicina, como una llave: un anillo (el mango) y una cadena en zigzag (los dientes); la punta en (0, 0)
function capsaicina(padre) {
  const g = el(padre, "g", { opacity: 0 });
  el(g, "circle", { cx: 0, cy: -250, r: 130, fill: "url(#c-punto-o)" });
  let d = "M0 0";
  for (let i = 1; i <= 6; i++) d += ` L${i % 2 ? 22 : -22} ${-i * 26}`;
  d += " L0 -170";
  el(g, "path", { d, fill: "none", stroke: ORO, "stroke-width": 16, "stroke-linejoin": "round", "stroke-linecap": "round" });
  el(g, "path", { d, fill: "none", stroke: "#fff3cf", "stroke-width": 4, "stroke-linejoin": "round", "stroke-linecap": "round" });
  const hex = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + i * Math.PI / 3; return [Math.cos(a) * 62, -250 + Math.sin(a) * 62]; });
  el(g, "path", { d: `M${hex.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")} Z`, fill: "rgba(255,194,74,0.25)", stroke: ORO, "stroke-width": 14, "stroke-linejoin": "round" });
  el(g, "circle", { cx: 0, cy: -250, r: 30, fill: "none", stroke: "#fff3cf", "stroke-width": 5 });
  el(g, "path", { d: "M54 -282 L92 -306 M-54 -282 L-92 -306", stroke: ORO, "stroke-width": 12, "stroke-linecap": "round" });
  el(g, "circle", { cx: 96, cy: -310, r: 13, fill: ORO });
  el(g, "circle", { cx: -96, cy: -310, r: 13, fill: ORO });
  const clic = el(g, "circle", { cx: 0, cy: -10, r: 60, fill: "url(#c-destello)", opacity: 0 });
  return { g, clic };
}
// la molécula de mentol: un anillo con tres ramas, en cian
function mentol(padre) {
  const g = el(padre, "g", { opacity: 0 });
  el(g, "circle", { cx: 0, cy: -150, r: 140, fill: "url(#c-punto-c)" });
  const hex = Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return [Math.cos(a) * 70, -150 + Math.sin(a) * 70]; });
  el(g, "path", { d: `M${hex.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")} Z`, fill: "rgba(95,212,255,0.22)", stroke: CIAN, "stroke-width": 14, "stroke-linejoin": "round" });
  el(g, "path", { d: "M0 -80 L0 0 M70 -150 L130 -190 L170 -160 M130 -190 L140 -250 M-70 -150 L-128 -186", fill: "none", stroke: CIAN, "stroke-width": 14, "stroke-linecap": "round", "stroke-linejoin": "round" });
  el(g, "circle", { cx: -136, cy: -192, r: 20, fill: "#e8fbff", stroke: CIAN, "stroke-width": 5 });
  el(g, "circle", { cx: 0, cy: 0, r: 16, fill: "#e8fbff" });
  return g;
}
// un copo de escarcha
function copo(padre) {
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
    d += `M0 0 L${f1(c * 40)} ${f1(s * 40)} M${f1(c * 24)} ${f1(s * 24)} L${f1(c * 24 + Math.cos(a + 0.8) * 13)} ${f1(s * 24 + Math.sin(a + 0.8) * 13)} M${f1(c * 24)} ${f1(s * 24)} L${f1(c * 24 + Math.cos(a - 0.8) * 13)} ${f1(s * 24 + Math.sin(a - 0.8) * 13)} `;
  }
  return el(padre, "path", { d, fill: "none", stroke: "#dff7ff", "stroke-width": 5, "stroke-linecap": "round", opacity: 0 });
}
const IONES = Array.from({ length: 14 }, (_, i) => { const r = K.azar(600 + i); return { x0: (r() - 0.5) * 700, y0: -520 - r() * 120, x1: (r() - 0.5) * 500, f: r() }; });
const COPOS = Array.from({ length: 16 }, (_, i) => { const r = K.azar(700 + i); return { x: XM + (r() - 0.5) * 1100, y: (r() < 0.5 ? -1 : 1) * (110 + r() * 280), s: 0.7 + r() * 0.9, t: T.frio - 0.1 + r() * 0.8 }; });
function microscopio(cam) {
  const g = el(cam, "g", { opacity: 0, transform: `translate(${MC[0]} ${MC[1]}) scale(${1 / MZ})` });
  const clip = el(cam, "clipPath", { id: `${PRE}lente` });
  el(clip, "circle", { r: 1500 });
  const d = el(g, "g", { "clip-path": "url(#c-lente)" });
  el(d, "rect", { x: -1600, y: -1600, width: 3200, height: 1600, fill: "url(#c-tejido)" });
  el(d, "rect", { x: -1600, y: 0, width: 3200, height: 1600, fill: "url(#c-nervio)" });
  // el calor de la lengua, de fondo; y lo que se calienta cuando entra calor
  const caliente = el(d, "rect", { x: -1600, y: -1600, width: 3200, height: 1600, fill: "url(#c-calor)", opacity: 0 });
  const rb = K.azar(77);
  for (let i = 0; i < 16; i++) el(d, "ellipse", { cx: f1((rb() - 0.5) * 3000), cy: f1(-300 - rb() * 1100), rx: f1(120 + rb() * 120), ry: f1(80 + rb() * 70), fill: "rgba(255,170,190,0.06)", stroke: "rgba(255,180,200,0.16)", "stroke-width": 6 });
  // la membrana: dos filas de cabezas y sus colas
  const mem = el(d, "g");
  for (let x = -1560; x <= 1560; x += 40) {
    if (Math.abs(x) < 140 || Math.abs(x - XM) < 140) continue;
    const w = 5 * Math.sin(x / 130);
    [-1, 1].forEach((s) => {
      el(mem, "path", { d: `M${x - 7} ${f1(w + s * 44)} L${x - 9} ${f1(w + s * 8)} M${x + 7} ${f1(w + s * 44)} L${x + 9} ${f1(w + s * 8)}`, stroke: "rgba(255,220,180,0.5)", "stroke-width": 4, "stroke-linecap": "round" });
      el(mem, "circle", { cx: x, cy: f1(w + s * 54), r: 17, fill: "#f2c27e", stroke: "#a8743a", "stroke-width": 3 });
    });
  }
  // el calor: ondas que bajan
  const ondas = [0, 1, 2, 3].map(() => el(d, "path", { fill: "none", stroke: NARANJA, "stroke-width": 12, "stroke-linecap": "round", opacity: 0 }));
  const sv = sensor(d, 0, "url(#c-trpv1)", "#8a2a10", "n"), sm = sensor(d, XM, "url(#c-trpm8)", "#14607a", "c");
  // los iones que entran por el sensor abierto, y la señal que corre por dentro del nervio
  const iones = (x, color) => IONES.map(() => el(d, "circle", { r: 14, fill: color, stroke: "#fff", "stroke-width": 3, opacity: 0 }));
  const ionV = iones(0, ORO), ionM = iones(XM, "#bdeeff");
  const senal = (id) => [0, 1, 2, 3, 4, 5].map(() => el(d, "ellipse", { rx: 120, ry: 60, fill: `url(#c-punto-${id})`, opacity: 0 }));
  const seV = senal("r"), seM = senal("c");
  const copos = COPOS.map(() => copo(d));
  const ca = capsaicina(d), me = mentol(d);
  el(d, "circle", { r: 1500, fill: "none", stroke: "rgba(200,232,255,0.4)", "stroke-width": 40 });
  el(d, "circle", { r: 1470, fill: "none", stroke: "rgba(255,255,255,0.15)", "stroke-width": 8 });

  const abrir = (s, a, gg) => {
    s.mitades.forEach((m) => m.m.setAttribute("transform", `translate(${f1(m.lado * 34 * a)} 0) rotate(${f1(m.lado * 5 * a)} ${m.lado * 60} 180)`));
    show(s.poro, a * (0.7 + 0.3 * Math.sin(vuelta(gg, 2))));
    s.poro.setAttribute("rx", f1(20 + 40 * a));
  };
  const corriente = (pool, xc, a, gg, t0) => pool.forEach((p, i) => {
    const P = IONES[i], u = ((gg - t0) * 0.9 + P.f) % 1;
    if (a < 0.02 || gg < t0) { show(p, 0); return; }
    // de arriba al poro (u < 0.6) y del poro hacia dentro del nervio
    let x, y;
    if (u < 0.6) { const v = K.suave(u / 0.6); x = xc + P.x0 * (1 - v); y = P.y0 + (-30 - P.y0) * v; }
    else { const v = K.sale((u - 0.6) / 0.4); x = xc + P.x1 * v; y = -30 + 430 * v; }
    p.setAttribute("cx", f1(x + 8 * Math.sin(gg * 3 + i))); p.setAttribute("cy", f1(y));
    show(p, a * Math.sin(Math.PI * u) * 1.4);
  });
  const ola = (pool, xc, a, gg, t0) => pool.forEach((p, i) => {
    const u = ((gg - t0) * 0.8 + (i >> 1) / 3) % 1, s = i % 2 ? 1 : -1;
    if (a < 0.02 || gg < t0) { show(p, 0); return; }
    p.setAttribute("cx", f1(xc + s * (80 + 1300 * u))); p.setAttribute("cy", "190");
    show(p, a * (1 - u) * 1.2);
  });
  return (gg) => {
    const on = micro(gg);
    show(g, on);
    if (on < 0.001) return;
    // el calor de verdad
    const cal = calorOn(gg);
    show(caliente, cal * 0.8);
    ondas.forEach((o, i) => {
      const u = ((gg - 6.2) * 0.85 + i / 4) % 1, y = -720 + 520 * u;
      let p = `M-700 ${f1(y)}`;
      for (let x = -700; x <= 700; x += 70) p += ` L${x} ${f1(y + 26 * Math.sin(x / 70 * 1.6 + gg * 6 + i))}`;
      o.setAttribute("d", p);
      show(o, cal * Math.sin(Math.PI * u) * 0.95);
    });
    // el sensor del calor: se ilumina, se abre con el calor y otra vez con la llave
    const av = abreV(gg), mira = asoma(gg, T.sensor - 0.1, 7.2) + asoma(gg, T.sensor2 - 0.1, 13.0) + asoma(gg, T.truco, 29.3);
    show(sv.halo, Math.min(1, mira * (0.55 + 0.25 * Math.sin(vuelta(gg, 1.4))) + av * 0.6));
    abrir(sv, av, gg);
    corriente(ionV, 0, av, gg, gg < 12 ? T.salta : T.abre);
    ola(seV, 0, av, gg, gg < 12 ? T.salta + 0.2 : T.abre + 0.2);
    // la llave: llega flotando, baja, encaja, hace clic y gira
    const ap = sube(gg, T.capsaicina - 0.1, T.capsaicina + 0.4) * (1 - sube(gg, 15.7, 16.0));
    const baja = sube(gg, T.encaja - 0.1, T.sensor2 + 0.1), entra = K.entra(K.tramo(gg, T.llave - 0.25, T.llave));
    const lx = -330 * (1 - baja) + 14 * Math.sin(vuelta(gg, 0.4)) * (1 - baja);
    const ly = -300 - 40 * Math.sin(vuelta(gg, 0.3)) * (1 - baja) + 120 * baja + 80 * entra;
    const rot = 64 * (1 - baja) + 10 * Math.sin(vuelta(gg, 0.35)) * (1 - baja) + 18 * sube(gg, T.abre - 0.1, T.abre + 0.25);
    ca.g.setAttribute("transform", `translate(${f1(lx)} ${f1(ly)}) rotate(${f1(rot)}) scale(${f1(1 + 0.12 * pico(gg, T.llave, 0.05, 0.4))})`);
    show(ca.g, ap);
    show(ca.clic, pico(gg, T.llave, 0.04, 0.5));
    // el del frío: se ilumina y se abre con el mentol; luego, la escarcha
    const am = abreM(gg);
    show(sm.halo, Math.min(1, asoma(gg, T.sensor4 - 0.1, 31.3) * 0.7 + am * 0.6 + asoma(gg, 27.2, 28.4) * 0.35));
    abrir(sm, am, gg);
    corriente(ionM, XM, am, gg, T.abre2);
    ola(seM, XM, am, gg, T.abre2 + 0.2);
    const ma = sube(gg, T.mentol - 0.1, T.mentol + 0.35) * (1 - sube(gg, 32.4, 32.7));
    const va = sube(gg, T.reves - 0.15, T.abre2);
    const mx = XM - 360 * (1 - va) + 18 * Math.sin(vuelta(gg, 0.4)) * (1 - va), my = -330 * (1 - va) - 160 * va - 30 * Math.sin(vuelta(gg, 0.3)) * (1 - va);
    me.setAttribute("transform", `translate(${f1(mx)} ${f1(my)}) rotate(${f1(-50 * (1 - va) + 6 * Math.sin(vuelta(gg, 0.5)))})`);
    show(me, ma);
    copos.forEach((c, i) => {
      const P = COPOS[i], k = K.sale(K.tramo(gg, P.t, P.t + 0.4)) * (1 - sube(gg, 32.4, 32.7));
      c.setAttribute("transform", `translate(${f1(P.x)} ${f1(P.y)}) rotate(${f1(gg * 20 + i * 17)}) scale(${f1(P.s * k)})`);
      show(c, k * 0.9);
    });
  };
}

// ── el laboratorio: una placa con células; una gota de capsaicina enciende una sola; luego, la medalla ───────────
const CELULAS = Array.from({ length: 42 }, (_, i) => {
  const r = K.azar(800 + i), a = i * 2.39996, rr = 40 + 245 * Math.sqrt((i + 0.5) / 42);
  return { x: PL[0] + Math.cos(a) * rr + (r() - 0.5) * 16, y: PL[1] + Math.sin(a) * rr * 0.9 + (r() - 0.5) * 16, r: 24 + r() * 8, f: r() };
});
const ELEGIDA = CELULAS.reduce((b, c, i) => (Math.hypot(c.x - PL[0] - 60, c.y - PL[1] + 40) < Math.hypot(CELULAS[b].x - PL[0] - 60, CELULAS[b].y - PL[1] + 40) ? i : b), 0);
function laboratorio(cam) {
  const g = el(cam, "g");
  const placa = el(g, "g");
  el(placa, "ellipse", { cx: PL[0], cy: PL[1] + PLR * 0.92 + 30, rx: PLR * 1.05, ry: 40, fill: "rgba(0,0,0,0.5)" });
  el(placa, "ellipse", { cx: PL[0], cy: PL[1], rx: PLR + 20, ry: (PLR + 20) * 0.92, fill: "url(#c-placa)", stroke: "rgba(230,240,250,0.55)", "stroke-width": 10 });
  el(placa, "ellipse", { cx: PL[0], cy: PL[1], rx: PLR - 6, ry: (PLR - 6) * 0.92, fill: "none", stroke: "rgba(230,240,250,0.25)", "stroke-width": 5 });
  const cel = CELULAS.map((c) => {
    const e = el(placa, "g", { transform: `translate(${f1(c.x)} ${f1(c.y)})` });
    const cuerpo = el(e, "circle", { r: f1(c.r), fill: "rgba(255,226,214,0.22)", stroke: "rgba(255,230,220,0.55)", "stroke-width": 4 });
    el(e, "circle", { cx: f1(c.r * 0.2), cy: f1(-c.r * 0.15), r: f1(c.r * 0.36), fill: "rgba(200,140,170,0.6)" });
    const luz = el(e, "circle", { r: f1(c.r * 2.6), fill: "url(#c-punto-r)", opacity: 0 });
    const prueba = el(e, "circle", { r: f1(c.r + 4), fill: "none", stroke: CIAN, "stroke-width": 5, opacity: 0 });
    return { e, cuerpo, luz, prueba };
  });
  el(placa, "ellipse", { cx: PL[0] - 150, cy: PL[1] - 170, rx: 120, ry: 40, fill: "rgba(255,255,255,0.12)", transform: `rotate(-30 ${PL[0] - 150} ${PL[1] - 170})` });
  // la línea que va probando las células
  const barrido = el(g, "g", { opacity: 0 });
  el(barrido, "rect", { x: -6, y: PL[1] - PLR - 30, width: 12, height: 2 * PLR + 60, rx: 6, fill: CIAN });
  el(barrido, "rect", { x: -60, y: PL[1] - PLR - 30, width: 120, height: 2 * PLR + 60, fill: "url(#c-barrido)" });
  // la pipeta y su gota
  const pip = el(g, "g", { opacity: 0 });
  el(pip, "path", { d: "M-30 -900 L30 -900 L30 -180 L8 -40 L-8 -40 L-30 -180 Z", fill: "rgba(220,235,245,0.22)", stroke: "rgba(230,240,250,0.7)", "stroke-width": 5 });
  el(pip, "path", { d: "M-22 -420 L22 -420 L22 -180 L6 -60 L-6 -60 L-22 -180 Z", fill: "rgba(255,194,74,0.6)" });
  const gotaO = el(g, "path", { fill: ORO, stroke: "#fff3cf", "stroke-width": 3, opacity: 0 });
  // la medalla, que baja colgada de su cinta
  const med = el(g, "g", { opacity: 0 });
  el(med, "path", { d: "M-70 -560 L-20 -150 L20 -150 L70 -560 Z", fill: "#c8343f" });
  el(med, "path", { d: "M-20 -560 L0 -150 M20 -560 L0 -150", stroke: "#f2f2f2", "stroke-width": 10 });
  el(med, "circle", { r: 190, fill: "url(#c-punto-o)" });
  el(med, "circle", { r: 150, fill: "url(#c-oro)", stroke: "#8a5c12", "stroke-width": 8 });
  el(med, "circle", { r: 124, fill: "none", stroke: "rgba(255,240,190,0.7)", "stroke-width": 5 });
  texto(med, 0, -10, "NOBEL", {}, 52, "#5a3a08");
  texto(med, 0, 52, "2021", {}, 50, "#5a3a08");
  el(med, "ellipse", { cx: -60, cy: -70, rx: 40, ry: 22, fill: "rgba(255,255,255,0.45)", transform: "rotate(-35 -60 -70)" });
  const brillo = el(med, "path", { d: "M0 -60 L9 -12 L60 0 L9 12 L0 60 L-9 12 L-60 0 L-9 -12 Z", fill: "#fff", opacity: 0 });
  const el0 = CELULAS[ELEGIDA];
  return (gg) => {
    // el barrido: cada célula se enciende en cian al pasar, y nada
    const bx = PL[0] - PLR - 40 + (2 * PLR + 80) * K.tramo(gg, T.encontrar, 23.5);
    barrido.setAttribute("transform", `translate(${f1(bx)} 0)`);
    show(barrido, asoma(gg, T.encontrar - 0.1, 23.45));
    const prende = K.sale(K.tramo(gg, T.chile2 + 0.28, T.chile2 + 0.5)), apaga = sube(gg, T.nobel, T.nobel + 0.4);
    cel.forEach((c, i) => {
      const C = CELULAS[i], d = Math.abs(C.x - bx), p = gg > T.encontrar && gg < 23.6 ? K.lim(1 - d / 50) : 0;
      show(c.prueba, p);
      const yo = i === ELEGIDA;
      show(c.luz, yo ? prende * (0.75 + 0.25 * Math.sin(vuelta(gg, 2))) * (1 - 0.5 * apaga) : 0);
      c.cuerpo.setAttribute("fill", yo && prende > 0.5 ? "#ff6a4a" : "rgba(255,226,214,0.22)");
    });
    show(placa, 1 - 0.55 * apaga);
    // la pipeta baja sobre la elegida y suelta la gota en «chile»
    const pb = sube(gg, 23.3, 23.85) - sube(gg, 24.5, 25.0);
    pip.setAttribute("transform", `translate(${f1(el0.x)} ${f1(el0.y - 160 - 300 * (1 - pb))})`);
    show(pip, pb);
    const u = K.entra(K.tramo(gg, T.chile2, T.chile2 + 0.3));
    gotaO.setAttribute("d", gota(el0.x, el0.y - 200 + 190 * u, 14));
    show(gotaO, K.lim((gg - T.chile2 + 0.05) / 0.05) * (1 - K.lim((u - 0.92) / 0.08)));
    // la medalla: cae, se balancea y se queda
    const mb = K.sale(K.tramo(gg, T.nobel - 0.15, T.nobel + 0.35)), t = Math.max(0, gg - T.nobel - 0.2);
    const giro = 14 * Math.exp(-t * 2.2) * Math.cos(t * 7) * (gg > T.nobel ? 1 : 0);
    med.setAttribute("transform", `translate(${PL[0]} ${f1(860 - 700 * (1 - mb))}) rotate(${f1(giro)} 0 -560) scale(${f1(0.9 + 0.1 * mb)})`);
    show(med, mb * (1 - sube(gg, 26.9, 27.1)));
    show(brillo, pico(gg, T.dosmil, 0.08, 0.6) + pico(gg, T.julius, 0.08, 0.6));
    brillo.setAttribute("transform", `translate(${f1(gg < 26 ? 90 : -80)} ${f1(gg < 26 ? -80 : 70)}) rotate(${f1(gg * 90)})`);
  };
}

// ── la mata de chiles y el pájaro ────────────────────────────────────────────────────────────────────────────────
const SUELO = 1450;
const PERCHA = [MATA + 250, 985];                 // donde se posa el pájaro
const PRESA = [MATA + 120, 1000];                 // el rabo del chile que se come
const SEMILLAS = Array.from({ length: 6 }, (_, i) => { const r = K.azar(900 + i); return { t: T.siembran + 0.1 + i * 0.12, f: r(), x: 0 }; });
function mata(cam) {
  const g = el(cam, "g");
  el(g, "ellipse", { cx: MATA, cy: 1000, rx: 900, ry: 800, fill: "url(#c-luz)" });
  el(g, "rect", { x: MATA - 900, y: SUELO, width: 1800, height: 260, fill: "url(#c-tierra)" });
  el(g, "path", { d: `M${MATA - 900} ${SUELO} L${MATA + 900} ${SUELO}`, stroke: "#6d4a2a", "stroke-width": 8 });
  const rt = K.azar(31), hierba = el(g, "g", { fill: "none", stroke: "#3c7a32", "stroke-width": 5, "stroke-linecap": "round" });
  for (let i = 0; i < 40; i++) { const x = MATA - 860 + rt() * 1720; el(hierba, "path", { d: `M${f1(x)} ${SUELO} q${f1((rt() - 0.5) * 20)} -${f1(14 + rt() * 20)} ${f1((rt() - 0.5) * 30)} -${f1(26 + rt() * 26)}` }); }
  // el tallo y las ramas
  const ramas = el(g, "g", { fill: "none", stroke: "#3f7a2e", "stroke-linecap": "round" });
  el(ramas, "path", { d: curva([[MATA - 80, SUELO + 4], [MATA - 70, 1250], [MATA - 50, 1050], [MATA - 60, 860], [MATA - 30, 720]]), "stroke-width": 26 });
  el(ramas, "path", { d: curva([[MATA - 52, 1060], [MATA + 80, 1010], [MATA + 200, 990], [PERCHA[0] + 90, PERCHA[1] - 4]]), "stroke-width": 16 });
  el(ramas, "path", { d: curva([[MATA - 56, 940], [MATA - 180, 900], [MATA - 320, 880]]), "stroke-width": 14 });
  el(ramas, "path", { d: curva([[MATA - 40, 800], [MATA + 80, 760], [MATA + 170, 740]]), "stroke-width": 12 });
  el(ramas, "path", { d: curva([[MATA - 66, 1180], [MATA - 200, 1150], [MATA - 300, 1170]]), "stroke-width": 12 });
  const rh = K.azar(44), hojas = el(g, "g");
  [[MATA + 40, 1015, -20], [MATA + 180, 975, 15], [MATA - 140, 890, -160], [MATA - 260, 870, 200], [MATA + 30, 770, -30], [MATA + 140, 730, 10], [MATA - 30, 700, -80],
   [MATA - 160, 1140, 190], [MATA - 260, 1160, 160], [MATA - 100, 980, -140], [MATA + 20, 900, -50], [MATA - 110, 760, -130]].forEach(([x, y, a]) => {
    const s = 0.8 + rh() * 0.5;
    el(hojas, "path", { d: `M0 0 C30 -34 110 -36 150 0 C110 36 30 34 0 0 Z`, fill: "url(#c-hoja)", stroke: "#24561e", "stroke-width": 3, transform: `translate(${x} ${y}) rotate(${a}) scale(${f1(s)})` });
    el(hojas, "path", { d: "M6 0 L140 0", stroke: "rgba(200,255,190,0.35)", "stroke-width": 3, transform: `translate(${x} ${y}) rotate(${a}) scale(${f1(s)})` });
  });
  // los chiles que cuelgan
  [[MATA - 200, 905, 10, 0.55], [MATA - 300, 885, -8, 0.5], [MATA + 120, 760, 6, 0.5], [MATA - 230, 1160, 4, 0.5], [MATA - 20, 820, -12, 0.48]].forEach(([x, y, a, s]) => chile(g, x, y, s, a));
  const presa = el(g, "g");
  chile(presa, 0, 0, 0.52, 0);
  // las semillas que caen y brotan
  const sem = SEMILLAS.map(() => ({ s: el(g, "ellipse", { rx: 9, ry: 6, fill: "#f6e7a8", stroke: "#a88a3a", "stroke-width": 2, opacity: 0 }), b: el(g, "path", { fill: "none", stroke: "#5fc34a", "stroke-width": 6, "stroke-linecap": "round", opacity: 0 }), h: el(g, "path", { fill: "#5fc34a", opacity: 0 }) }));
  // el pájaro, mirando a la izquierda
  const ave = el(g, "g");
  const cola = el(ave, "path", { d: "M60 10 L190 70 L180 96 L50 40 Z", fill: "#5d636b", stroke: "#3a3f45", "stroke-width": 3 });
  el(ave, "ellipse", { cx: 0, cy: 0, rx: 100, ry: 64, fill: "url(#c-pajaro)", transform: "rotate(-14)" });
  el(ave, "ellipse", { cx: -14, cy: 20, rx: 66, ry: 36, fill: "rgba(235,235,230,0.8)", transform: "rotate(-10)" });
  const ala = el(ave, "path", { d: "M-30 -20 C10 -50 90 -40 120 0 C80 10 20 20 -30 -20 Z", fill: "#4a5058", stroke: "#2e3238", "stroke-width": 3 });
  el(ave, "path", { d: "M0 -14 L80 -6 M10 0 L84 6", stroke: "rgba(255,255,255,0.35)", "stroke-width": 4, "stroke-linecap": "round" });
  const patas = el(ave, "path", { d: "M-10 58 L-16 88 M20 58 L22 88", stroke: "#2a2a2a", "stroke-width": 6, "stroke-linecap": "round" });
  const buche = el(ave, "ellipse", { cx: -66, cy: -6, rx: 34, ry: 30, fill: "#d9d9d2", opacity: 0 });
  const cabeza = el(ave, "g");
  el(cabeza, "circle", { cx: -84, cy: -56, r: 48, fill: "url(#c-pajaro)" });
  el(cabeza, "path", { d: "M-126 -66 L-178 -50 L-128 -42 Z", fill: "#2a2a2a" });
  el(cabeza, "circle", { cx: -98, cy: -70, r: 10, fill: "#0b0e12" });
  el(cabeza, "circle", { cx: -101, cy: -73, r: 3.5, fill: "#fff" });
  el(cabeza, "path", { d: "M-120 -84 L-74 -84", stroke: "#3a3f45", "stroke-width": 6, "stroke-linecap": "round" });
  const CUELLO = [-60, -30];
  return (gg) => {
    // picotazo, se lo traga, y se va volando
    const pic = sube(gg, T.pica - 0.2, T.pica + 0.05) - sube(gg, T.pica + 0.3, T.nada + 0.5);
    const traga = K.tramo(gg, T.comen, T.chile3 + 0.15), vuela = K.suave(K.tramo(gg, T.siembran - 0.05, T.siembran + 1.3));
    const salta = Math.abs(Math.sin(Math.PI * K.tramo(gg, T.nada + 0.55, T.nada + 0.85))) * 14;
    const bx = PERCHA[0] - 420 * vuela + 10 * Math.sin(vuelta(gg, 0.3)) * (1 - vuela), by = PERCHA[1] - 70 - salta - 520 * vuela * (0.6 + 0.4 * vuela);
    ave.setAttribute("transform", `translate(${f1(bx)} ${f1(by)}) rotate(${f1(-8 * vuela)})`);
    const ang = -46 * pic + 5 * Math.sin(vuelta(gg, 0.6)) * (1 - pic) + 12 * pico(gg, T.comen + 0.1, 0.1, 0.4);
    cabeza.setAttribute("transform", `rotate(${f1(ang)} ${CUELLO[0]} ${CUELLO[1]})`);
    show(patas, 1 - vuela);
    const aleteo = vuela > 0.001 && vuela < 0.999 ? 40 * Math.sin(gg * 28) : 6 * pico(gg, T.nada + 0.55, 0.1, 0.4);
    ala.setAttribute("transform", `rotate(${f1(-aleteo)} -30 -20)`);
    cola.setAttribute("transform", `rotate(${f1(4 * Math.sin(vuelta(gg, 0.5)))} 60 20)`);
    show(buche, pico(gg, T.chile3, 0.12, 0.6));
    // dónde está la punta del pico, en el mundo
    const a = ang * Math.PI / 180, px = -178 - CUELLO[0], py = -50 - CUELLO[1];
    const tip = [bx + CUELLO[0] + px * Math.cos(a) - py * Math.sin(a), by + CUELLO[1] + px * Math.sin(a) + py * Math.cos(a)];
    // el chile cuelga hasta el picotazo; luego va en el pico y se lo traga
    const cogido = gg > T.pica + 0.05;
    if (!cogido) presa.setAttribute("transform", `translate(${PRESA[0]} ${PRESA[1]}) rotate(${f1(4 * Math.sin(vuelta(gg, 0.4)))})`);
    else presa.setAttribute("transform", `translate(${f1(tip[0] + 8)} ${f1(tip[1] - 4)}) rotate(${f1(-70 + ang * 0.6)}) scale(${f1(1 - K.entra(traga))})`);
    show(presa, 1 - K.lim((traga - 0.9) / 0.1));
    // las semillas: caen del pájaro al suelo y brotan
    sem.forEach((s, i) => {
      const P = SEMILLAS[i];
      if (gg < P.t) { show(s.s, 0); show(s.b, 0); show(s.h, 0); return; }
      const v0 = K.tramo(P.t, T.siembran - 0.05, T.siembran + 1.3), b0x = PERCHA[0] - 420 * K.suave(v0) + 40, b0y = PERCHA[1] - 30 - 520 * K.suave(v0) * (0.6 + 0.4 * K.suave(v0));
      const x = b0x + (P.f - 0.5) * 60, u = K.entra(K.tramo(gg, P.t, P.t + 0.55)), y = b0y + (SUELO - 6 - b0y) * u;
      s.s.setAttribute("cx", f1(x)); s.s.setAttribute("cy", f1(y)); s.s.setAttribute("transform", `rotate(${f1(gg * 300 * (1 - u))} ${f1(x)} ${f1(y)})`);
      show(s.s, 1 - sube(gg, 38.3, 38.6));
      const br = K.sale(K.tramo(gg, T.enteras + i * 0.06, T.enteras + 0.5 + i * 0.06)), h = 70 * br;
      s.b.setAttribute("d", `M${f1(x)} ${SUELO - 6} q-6 ${f1(-h * 0.5)} ${f1(4)} ${f1(-h)}`);
      s.h.setAttribute("d", `M${f1(x + 4)} ${f1(SUELO - 6 - h)} c-10 -18 -34 -20 -40 -10 c10 14 30 16 40 10 Z M${f1(x + 4)} ${f1(SUELO - 6 - h)} c10 -18 34 -20 40 -10 c-10 14 -30 16 -40 10 Z`);
      show(s.b, br * (1 - sube(gg, 38.3, 38.6))); show(s.h, br * (1 - sube(gg, 38.3, 38.6)));
    });
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
  <radialGradient id="c-piel" gradientUnits="userSpaceOnUse" cx="540" cy="820" r="760" gradientTransform="translate(540 820) scale(1 1.2) translate(-540 -820)"><stop offset="0" stop-color="#e8a888"/><stop offset="0.55" stop-color="#cf8a6a"/><stop offset="0.86" stop-color="#a8634a"/><stop offset="1" stop-color="#6e3e2e"/></radialGradient>
  <linearGradient id="c-cuello" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e5240"/><stop offset="0.5" stop-color="#b87458"/><stop offset="1" stop-color="#8e5240"/></linearGradient>
  <linearGradient id="c-pelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a12"/><stop offset="1" stop-color="#160d08"/></linearGradient>
  <radialGradient id="c-craneo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(40,10,24,0.85)"/><stop offset="0.8" stop-color="rgba(40,10,24,0.7)"/><stop offset="1" stop-color="rgba(40,10,24,0)"/></radialGradient>
  <radialGradient id="c-nariz" cx="0.5" cy="0.3" r="0.6"><stop offset="0" stop-color="#e9a88a"/><stop offset="1" stop-color="rgba(190,110,84,0)"/></radialGradient>
  <radialGradient id="c-rubor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(240,50,60,0.6)"/><stop offset="1" stop-color="rgba(240,50,60,0)"/></radialGradient>
  <radialGradient id="c-hueco" gradientUnits="userSpaceOnUse" cx="540" cy="1150" r="260"><stop offset="0" stop-color="#3a0610"/><stop offset="1" stop-color="#160206"/></radialGradient>
  <linearGradient id="c-diente" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ec"/><stop offset="1" stop-color="#d9d0c0"/></linearGradient>
  <linearGradient id="c-labio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c25a5e"/><stop offset="1" stop-color="#9a3a42"/></linearGradient>
  <radialGradient id="c-lengua" gradientUnits="userSpaceOnUse" cx="520" cy="1260" r="260"><stop offset="0" stop-color="#f08c98"/><stop offset="0.7" stop-color="#d9606f"/><stop offset="1" stop-color="#b04355"/></radialGradient>
  <linearGradient id="c-chile" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff4a3a"/><stop offset="0.5" stop-color="#e01e28"/><stop offset="1" stop-color="#9a0c18"/></linearGradient>
  <radialGradient id="c-lagrima" cx="0.4" cy="0.6" r="0.6"><stop offset="0" stop-color="rgba(240,252,255,0.95)"/><stop offset="0.5" stop-color="rgba(150,220,250,0.7)"/><stop offset="1" stop-color="rgba(95,180,230,0.55)"/></radialGradient>
  <radialGradient id="c-fuego" cx="0.5" cy="0.6" r="0.5"><stop offset="0" stop-color="rgba(255,150,60,0.45)"/><stop offset="0.6" stop-color="rgba(255,90,40,0.15)"/><stop offset="1" stop-color="rgba(255,90,40,0)"/></radialGradient>
  <linearGradient id="c-llama0" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a2a"/><stop offset="0.5" stop-color="#f0402a"/><stop offset="1" stop-color="rgba(200,30,30,0.15)"/></linearGradient>
  <linearGradient id="c-llama1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd24a"/><stop offset="0.55" stop-color="#ff8a2a"/><stop offset="1" stop-color="rgba(255,120,40,0.2)"/></linearGradient>
  <linearGradient id="c-llama2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fffbe6"/><stop offset="0.5" stop-color="#ffe27a"/><stop offset="1" stop-color="rgba(255,220,120,0.3)"/></linearGradient>
  <radialGradient id="c-destello" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.95)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
  <radialGradient id="c-punto-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,246,216,0.7)"/><stop offset="0.35" stop-color="rgba(255,194,74,0.45)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-punto-r" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffe2e2"/><stop offset="0.35" stop-color="${ROJO}"/><stop offset="1" stop-color="rgba(240,68,90,0)"/></radialGradient>
  <radialGradient id="c-punto-n" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,236,210,0.9)"/><stop offset="0.35" stop-color="rgba(255,138,61,0.6)"/><stop offset="1" stop-color="rgba(255,138,61,0)"/></radialGradient>
  <radialGradient id="c-punto-c" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(232,251,255,0.9)"/><stop offset="0.35" stop-color="rgba(95,212,255,0.55)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <linearGradient id="c-tejido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1018"/><stop offset="1" stop-color="#4a1c28"/></linearGradient>
  <linearGradient id="c-nervio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1220"/><stop offset="1" stop-color="#1a0810"/></linearGradient>
  <linearGradient id="c-calor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,120,40,0.05)"/><stop offset="1" stop-color="rgba(255,120,40,0.4)"/></linearGradient>
  <linearGradient id="c-trpv1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8461e"/><stop offset="0.6" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ffb070"/></linearGradient>
  <linearGradient id="c-trpm8" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d7fa6"/><stop offset="0.6" stop-color="#5fd4ff"/><stop offset="1" stop-color="#a8ecff"/></linearGradient>
  <radialGradient id="c-placa" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="rgba(255,190,170,0.22)"/><stop offset="1" stop-color="rgba(220,140,130,0.12)"/></radialGradient>
  <linearGradient id="c-barrido" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(95,212,255,0)"/><stop offset="0.5" stop-color="rgba(95,212,255,0.3)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></linearGradient>
  <radialGradient id="c-oro" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff0b0"/><stop offset="0.45" stop-color="#f0b43a"/><stop offset="1" stop-color="#a8721a"/></radialGradient>
  <linearGradient id="c-tierra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3c22"/><stop offset="1" stop-color="#20140a"/></linearGradient>
  <linearGradient id="c-hoja" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3f8a35"/><stop offset="1" stop-color="#6cc05a"/></linearGradient>
  <radialGradient id="c-pajaro" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#b8bcc2"/><stop offset="1" stop-color="#6c727a"/></radialGradient>
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
const fijo = (x, y) => () => [x, y];

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on) => L.push({ e: etiqueta(capa, html, clase), sitio, on });
  // hook
  r(`<b>36</b> °C`, "v g", junto(TX - 95, ty(36), 0, 0), (g) => asoma(g, T.quema, 3.9));
  r(`te está <b>mintiendo</b>`, "r g", fijo(500, 1400), (g) => asoma(g, T.mintiendo, 4.0));
  // el sensor
  r(`un <b>sensor</b> del calor`, "n g", enLente(0, 0, 0, 330), (g) => asoma(g, T.sensor, 7.25));
  r(`calor <b>de verdad</b>`, "n g", enLente(0, 0, 0, 330), (g) => asoma(g, T.verdad - 0.1, 8.95));
  r(`más de <b>43 °C</b>`, "r g", enLente(0, 0, 0, 330), (g) => asoma(g, T.cuarenta, 9.7));
  // la llave
  r(`<b>capsaicina</b>`, "o g", enLente(0, 0, 0, 330), (g) => asoma(g, T.capsaicina, 12.55));
  r(`como una <b>llave</b>`, "o g", enLente(0, 0, 0, 330), (g) => asoma(g, T.llave - 0.05, 13.95));
  r(`y <b>0</b> grados de más`, "v g", enLente(0, 0, 0, 330), (g) => asoma(g, T.sin, 15.4));
  // la alarma
  r(`¡<b>FUEGO</b>!`, "r g", junto(CEREBRO[0], 300, 0, -150), (g) => asoma(g, T.alarma, 18.55));
  r(`<b>sudas</b>`, "c g", fijo(540, 1400), (g) => asoma(g, T.sudas, 20.0));
  r(`te pones <b>rojo</b>`, "r g", fijo(540, 1400), (g) => asoma(g, T.rojo, 20.65));
  r(`<b>lloras</b>`, "c g", fijo(540, 1400), (g) => asoma(g, T.lloras, 21.5));
  // el Nobel
  r(`buscando el <b>sensor</b>`, "c", fijo(540, 1420), (g) => asoma(g, T.encontrar + 0.05, 23.85));
  r(`¡<b>este</b>!`, "n g", junto(CELULAS[ELEGIDA].x, CELULAS[ELEGIDA].y, 0, 130), (g) => asoma(g, T.chile2 + 0.35, 24.95));
  r(`<b>Nobel</b> 2021`, "o g", fijo(540, 1420), (g) => asoma(g, T.nobel + 0.05, 26.1));
  r(`David <b>Julius</b>`, "o g", fijo(540, 1420), (g) => asoma(g, T.david, 27.0));
  // el mentol
  r(`<b>mentol</b>`, "c g", enLente(XM - 360, -330, 0, 260), (g) => asoma(g, T.mentol, 28.85));
  r(`al <b>revés</b>`, "c g", fijo(540, 1400), (g) => asoma(g, T.reves, 29.95));
  r(`sensor del <b>frío</b>`, "c g", fijo(540, 1400), (g) => asoma(g, T.sensor4, 31.3));
  r(`sin frío: <b>36 °C</b>`, "v g", fijo(540, 1400), (g) => asoma(g, T.haga, 32.45));
  // los pájaros
  r(`<b>0</b> picor`, "v g", junto(PERCHA[0], PERCHA[1], 0, -330), (g) => asoma(g, T.nada, 36.2));
  r(`semillas <b>enteras</b>`, "v g", junto(MATA + 60, SUELO, 0, -110), (g) => asoma(g, T.semillas, 38.35));
  // el cierre
  r(`para <b>espantar</b> mamíferos`, "r", fijo(540, 1420), (g) => asoma(g, T.espantar, 41.1));
  r(`y se lo vuelve a <b>creer</b>`, "r", fijo(540, 1420), (g) => asoma(g, T.vuelve, 45.0));
  return (g, k) => L.forEach((l) => {
    const [x, y] = l.sitio(k);
    pon(l.e, x, y, l.on(g));
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
  el(cam, "rect", { x: -3000, y: -2000, width: 8000, height: 7500, fill: "#0b0e12" });
  el(cam, "ellipse", { cx: 540, cy: 900, rx: 1300, ry: 1300, fill: "url(#c-luz)" });
  el(cam, "ellipse", { cx: PL[0], cy: PL[1], rx: 800, ry: 800, fill: "url(#c-luz)" });
  const pv = polvo(cam);
  const ca = cara(cam);
  const ll = llamas(cam);
  const te = termometro(cam);
  const la = laboratorio(cam);
  const ma = mata(cam);
  const mi = microscopio(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const ro = rotulos(capa);
  return { cam, pv, ca, ll, te, la, ma, mi, ro };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los 0,3 s en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // los golpes: la cámara da un respingo con «quema», con el clic de la llave, con la alarma y con «arde»
    const sac = Math.max(pico(g, T.quema, 0.06, 0.45), 0.6 * pico(g, T.llave, 0.05, 0.35), 0.9 * pico(g, T.alarma, 0.06, 0.5), 0.6 * pico(g, T.arde, 0.06, 0.4));
    const kx = k.x + sac * 7 * Math.sin(g * 90), ky = k.y + sac * 6 * Math.cos(g * 77), kz = k.z * (1 + 0.035 * sac);
    E.cam.setAttribute("transform", `translate(${(540 - kx * kz).toFixed(2)} ${(1000 - ky * kz).toFixed(2)}) scale(${kz.toFixed(4)})`);
    E.pv(g);
    E.ca(g);
    E.ll(g);
    E.te(g);
    E.la(g);
    E.ma(g);
    E.mi(g);
    E.ro(g, { x: kx, y: ky, z: kz });
    return { g, k };
  };
  return E;
}
