// Lo que sale en todas las escenas: un dedo de perfil, tumbado, con la mano a la izquierda y la punta a la derecha.
// Otra mano lo agarra por la punta y tira. Por dentro (rayos X): el hueso de la mano, la falange, la cápsula con su
// líquido y el gas disuelto (puntos de oro). Al tirar, la presión cae, las superficies se sueltan de golpe y el gas
// sale y forma una burbuja: el crac. En 2015, la resonancia (gris) la ve nacer justo con el ruido. Abajo, en el mundo
// (y = 2600), las dos manos del médico que crujió solo una durante sesenta años.
// Todo en 2D, en un svg con la cámara dentro (un transform del grupo), para que de cerca se vea nítido.
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a";
export const F0 = { x: 760, y: 990, z: 0.95 };                  // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 53.56;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);
// el azar que cambia a saltos sale del segundo dentro del bucle: en TOTAL vuelve a ser el de 0
const salto = (g, porSeg) => Math.floor((((g % TOTAL) + TOTAL) % TOTAL) * porSeg + 1e-6);

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, tira: 11.3, resonancia: 23.63, veinte: 36.29, manos: 42.63, cierre: 50.34 };

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
// la cabeza del hueso de la mano (H, radio 75) y la base cóncava de la falange, que se aleja d px al tirar
const HX = 455, HY = 1000;
const DEDO = [[-760, 850], [100, 846], [330, 850], [450, 868], [520, 872], [600, 890], [700, 905], [1000, 906],
  [1070, 897], [1140, 905], [1350, 912], [1470, 925], [1545, 960], [1565, 1010], [1540, 1065], [1460, 1090],
  [1360, 1092], [1300, 1084], [1200, 1092], [1080, 1100], [900, 1098], [700, 1098], [600, 1110], [500, 1150],
  [380, 1180], [100, 1192], [-760, 1195]];
// los otros dedos, doblados debajo (es un puño con el índice estirado)
const PUNO = [[-200, 1150], [120, 1160], [380, 1172], [500, 1196], [566, 1250], [576, 1320], [540, 1382], [430, 1404],
  [260, 1400], [60, 1390], [-200, 1380]];
const MANOS_Y = 2560, MI = 300, MD = 780;                         // la fila de las dos manos de abajo

// ── lo que pasa con el tiempo (g, los segundos del vídeo entero) ────────────────────────────────────────────────
const sn = (t) => (t <= 0 ? 0 : 1 - Math.exp(-30 * t) * Math.cos(45 * t));        // el chasquido: salta y rebota
const tiembla = (g) => 1.6 * Math.sin(vuelta(g, 9)) + 0.9 * Math.sin(vuelta(g, 23));
// cuánto se separa la falange del hueso de la mano (px del mundo)
export function abre(g) {
  if (g < 0.28) return 26 + 0.6 * tiembla(g);
  if (g < 5.3) return 26 + 64 * sn(g - 0.28);
  if (g < 11.6) return 90 * (1 - sube(g, 5.3, 5.75));                                // rebobina: antes del crac
  if (g < 18.08) return 18 * sube(g, 11.6, 13.3) + 8 * sube(g, 13.3, 17.9) + tiembla(g) * sube(g, 12.6, 14);
  if (g < 28.5) return 26 + 64 * sn(g - 18.08);
  if (g < 31.2) return 90 * (1 - sube(g, 28.5, 29.0));                               // 2015: otra vez desde el principio
  if (g < 33.12) return 26 * sube(g, 31.2, 33.0) + 0.8 * tiembla(g) * sube(g, 31.6, 32.4);
  if (g < 39.7) return 26 + 64 * sn(g - 33.12) + 12 * sube(g, 37.4, 38.2) * (1 - sube(g, 38.4, 38.9))
    + 0.8 * tiembla(g) * sube(g, 37.5, 37.9) * (1 - sube(g, 38.4, 38.8));            // otra vez: no hay crac
  if (g < 51.2) return 90 * (1 - sube(g, 39.7, 42.3));                               // el gas se disuelve
  return 26 * sube(g, 51.2, 53.3) + 0.6 * tiembla(g) * sube(g, 52, 53.3);
}
// la burbuja: nace de golpe, rebota y se queda; se borra al rebobinar o al disolverse
const pop = (g, t) => (g < t ? 0 : 1 - Math.exp(-12 * (g - t)) * Math.cos(18 * (g - t)));
const burbuja = (g) => pop(g, 0.28) * (1 - sube(g, 5.3, 5.6)) + pop(g, 20.72) * (1 - sube(g, 28.5, 28.9))
  + pop(g, 33.12) * (1 - sube(g, 39.7, 42.2));
// cuánto se ha juntado cada punto de gas en la burbuja (e, de 0 a 1, lo retrasa un poco)
const junta = (g, e) => sube(g, 0.2 + 0.08 * e, 0.34 + 0.08 * e) * (1 - sube(g, 5.3 + 0.2 * e, 5.6 + 0.2 * e))
  + sube(g, 19.0 + 1.2 * e, 19.5 + 1.2 * e) * (1 - sube(g, 28.5 + 0.25 * e, 28.9 + 0.25 * e))
  + sube(g, 33.0 + 0.08 * e, 33.16 + 0.08 * e) * (1 - sube(g, 39.7 + 2.2 * e, 40.4 + 2.2 * e));
// la presión dentro de la cápsula (1 normal): cae al tirar y vuelve con el crac
const presion = (g) => 1 - 0.94 * (1 - sube(g, 0.28, 0.45)) - 0.94 * sube(g, 13.3, 16.4) + 0.94 * sube(g, 18.08, 18.3)
  - 0.94 * sube(g, 31.6, 33.0) + 0.94 * sube(g, 33.12, 33.3) - 0.94 * sube(g, 51.5, 53.4);
// de rayos X y de resonancia (gris, el líquido blanco, la burbuja negra)
const rayos = (g) => sube(g, 0.3, 0.65) - sube(g, 50.6, 51.4);
const reso = (g) => sube(g, 28.5, 29.0) - sube(g, 36.0, 36.6);
// la otra mano: está (1) o no (0); y si tira
const mano = (g) => 1 - sube(g, 5.4, 6.0) + sube(g, 11.0, 11.6) - sube(g, 23.6, 24.2) + sube(g, 30.4, 31.0)
  - sube(g, 35.6, 36.2) + sube(g, 36.9, 37.3) - sube(g, 39.0, 39.6) + sube(g, 50.6, 51.2);
const tirar = (g) => (1 - sube(g, 0.28, 0.5)) + sube(g, 11.6, 12.0) * (1 - sube(g, 18.08, 18.3))
  + sube(g, 31.2, 31.6) * (1 - sube(g, 33.12, 33.3)) + sube(g, 37.3, 37.6) * (1 - sube(g, 38.8, 39.1)) + sube(g, 51.3, 51.7);
const CRACS = [0.28, 18.08, 33.12];                              // los golpes: destello, temblor y ondas
const golpe = (g, t, a = 8) => (g < t ? 0 : Math.exp(-a * (g - t)));
const rebobina = (g) => sube(g, 5.2, 5.3) * (1 - sube(g, 5.75, 5.9)) + sube(g, 28.4, 28.5) * (1 - sube(g, 29.0, 29.15));

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0b0f15; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(5,7,10,0) 55%, rgba(5,7,10,0.62) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(9,12,17,0.96) 0, rgba(9,12,17,0.86) 300px, rgba(9,12,17,0.5) 470px, rgba(9,12,17,0) 630px); }
.c-destello { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 70% 50% at 50% 52%, #fff 0, rgba(255,240,220,0.6) 60%, rgba(255,240,220,0.2) 100%); opacity: 0; }

.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(11,14,20,0.9); border: 2px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 10px 24px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.45); opacity: 0; }
.c-etq b { font-weight: 800; }
.c-etq.c b { color: ${CIAN}; } .c-etq.o b { color: ${ORO}; } .c-etq.r b { color: #ff6b7e; } .c-etq.v b { color: ${VERDE}; }
.c-etq.c { border-color: rgba(95,212,255,0.5); } .c-etq.o { border-color: rgba(255,194,74,0.55); } .c-etq.r { border-color: rgba(240,68,90,0.6); } .c-etq.v { border-color: rgba(34,211,138,0.55); }
.c-etq.g { font-size: 58px; padding: 12px 30px; }
.c-etq small { display: block; font-weight: 600; font-size: 32px; color: #c3ccd9; }
.c-etq .tacha { position: absolute; left: 12px; right: 12px; top: 48%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240,68,90,0.7); }

.c-medidor { position: absolute; left: 130px; width: 820px; top: 1362px; height: 76px; border-radius: 40px; opacity: 0;
  background: rgba(11,14,20,0.92); border: 2px solid rgba(255,255,255,0.18); box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden; }
.c-medidor span { position: absolute; left: 30px; top: 0; line-height: 72px; font-family: var(--letra), sans-serif; font-weight: 800;
  font-size: 28px; letter-spacing: 0.08em; color: #fff; text-transform: uppercase; }
.c-medidor .luz { position: absolute; left: 262px; top: 31px; width: 12px; height: 12px; border-radius: 50%; background: ${ROJO}; }
.c-medidor svg { position: absolute; left: 290px; top: 0; }
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
const Z = (x, z, y = 1000) => ({ x, y, z });
const CAMINO = [
  [0, F0], [0.9, Z(610, 1.45)], [2.0, Z(565, 1.75)],                                   // crac: entra al nudillo
  [3.2, Z(585, 2.75)], [5.0, Z(590, 2.9)],                                             // la burbuja
  [5.9, Z(560, 1.9)], [7.1, Z(552, 2.1)], [8.7, Z(548, 3.0)], [10.6, Z(550, 3.05)],    // cápsula, líquido, gas
  [11.6, Z(760, 0.85)], [12.9, Z(548, 2.6)], [14.9, Z(560, 2.3)],                       // tiras; se resisten
  [17.9, Z(572, 2.7)], [19.0, Z(578, 2.75)], [20.7, Z(585, 3.0)], [23.0, Z(585, 2.3)],  // se sueltan; burbuja
  [24.4, Z(600, 1.6)], [28.3, Z(585, 1.9)],                                            // setenta años
  [30.6, Z(640, 1.35)], [32.6, Z(570, 2.3)], [33.4, Z(582, 2.6)], [36.0, Z(585, 2.4)],  // la resonancia
  [37.3, Z(660, 1.2)], [38.9, Z(600, 1.9)], [39.9, Z(585, 2.6)], [42.2, Z(582, 2.7)],   // otra vez; 20 minutos
  [43.4, Z(540, 0.9, 2600)], [49.6, Z(540, 0.94, 2590)],                               // las manos del médico
  [51.0, Z(700, 1.1)], [52.6, F0], [TOTAL, F0],
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
const u = (id) => `url(#${PRE}${id})`;
// una curva suave que pasa por los puntos (Catmull-Rom)
function curva(P, cerrada = false) {
  const n = P.length, q = (i) => P[cerrada ? (i + n) % n : Math.min(n - 1, Math.max(0, i))];
  let d = `M${f1(P[0][0])} ${f1(P[0][1])}`;
  for (let i = 0; i < (cerrada ? n : n - 1); i++) {
    const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2);
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + (cerrada ? " Z" : "");
}
// un dedo: una cápsula de (x1, y1) a (x2, y2) con radio r
function capsula(x1, y1, x2, y2, r) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * r, ny = Math.cos(a) * r;
  return `M${f1(x1 + nx)} ${f1(y1 + ny)} L${f1(x2 + nx)} ${f1(y2 + ny)} A${r} ${r} 0 0 0 ${f1(x2 - nx)} ${f1(y2 - ny)} L${f1(x1 - nx)} ${f1(y1 - ny)} A${r} ${r} 0 0 0 ${f1(x1 + nx)} ${f1(y1 + ny)} Z`;
}

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,190,140,0.2)"/><stop offset="0.5" stop-color="rgba(120,140,200,0.08)"/><stop offset="1" stop-color="rgba(120,140,200,0)"/></radialGradient>
  <radialGradient id="c-luzfria" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(140,190,255,0.16)"/><stop offset="1" stop-color="rgba(140,190,255,0)"/></radialGradient>
  <radialGradient id="c-bola" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,214,170,0.2)"/><stop offset="1" stop-color="rgba(255,214,170,0)"/></radialGradient>
  <pattern id="c-rejilla" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0.75H60M0.75 0V60" stroke="rgba(95,212,255,0.12)" stroke-width="1.5"/></pattern>
  <linearGradient id="c-piel" gradientUnits="userSpaceOnUse" x1="0" y1="846" x2="0" y2="1200"><stop offset="0" stop-color="#f6caa9"/><stop offset="0.3" stop-color="#e9b08f"/><stop offset="0.75" stop-color="#c98463"/><stop offset="1" stop-color="#a5634a"/></linearGradient>
  <linearGradient id="c-puno" gradientUnits="userSpaceOnUse" x1="0" y1="1150" x2="0" y2="1404"><stop offset="0" stop-color="#b8735a"/><stop offset="0.4" stop-color="#d89a7a"/><stop offset="1" stop-color="#9a5a42"/></linearGradient>
  <linearGradient id="c-otra" gradientUnits="userSpaceOnUse" x1="0" y1="740" x2="0" y2="1270"><stop offset="0" stop-color="#f2c4a2"/><stop offset="0.35" stop-color="#e2a586"/><stop offset="0.8" stop-color="#bf7a5c"/><stop offset="1" stop-color="#9c5c44"/></linearGradient>
  <linearGradient id="c-dorso" gradientUnits="userSpaceOnUse" x1="-150" y1="0" x2="150" y2="0"><stop offset="0" stop-color="#b9765a"/><stop offset="0.3" stop-color="#e3a785"/><stop offset="0.65" stop-color="#f1c09f"/><stop offset="1" stop-color="#c3805f"/></linearGradient>
  <linearGradient id="c-una" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9e0"/><stop offset="1" stop-color="#e8b5a4"/></linearGradient>
  <linearGradient id="c-manga" gradientUnits="userSpaceOnUse" x1="-130" y1="0" x2="130" y2="0"><stop offset="0" stop-color="#1d2a44"/><stop offset="0.5" stop-color="#34507f"/><stop offset="1" stop-color="#1d2a44"/></linearGradient>
  <linearGradient id="c-manga2" gradientUnits="userSpaceOnUse" x1="0" y1="740" x2="0" y2="1280"><stop offset="0" stop-color="#3a5b92"/><stop offset="1" stop-color="#1a2846"/></linearGradient>
  <linearGradient id="c-hueso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(236,248,255,0.97)"/><stop offset="1" stop-color="rgba(170,210,238,0.9)"/></linearGradient>
  <radialGradient id="c-burbuja" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(12,22,34,0.92)"/><stop offset="0.72" stop-color="rgba(20,40,60,0.85)"/><stop offset="0.92" stop-color="rgba(170,235,255,0.9)"/><stop offset="1" stop-color="rgba(220,250,255,1)"/></radialGradient>
  <radialGradient id="c-halo-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,194,74,0.9)"/><stop offset="0.45" stop-color="rgba(255,194,74,0.3)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-halo-b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.9)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
  <radialGradient id="c-halo-v" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(34,211,138,0.7)"/><stop offset="1" stop-color="rgba(34,211,138,0)"/></radialGradient>
  <linearGradient id="c-barrido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(95,212,255,0)"/><stop offset="0.85" stop-color="rgba(95,212,255,0.35)"/><stop offset="1" stop-color="rgba(220,250,255,0.95)"/></linearGradient>
</defs>`;

// ── el sitio: fondo oscuro con una luz cálida; en rayos X, una rejilla ──────────────────────────────────────────
function fondo(padre) {
  el(padre, "rect", { x: -3000, y: -3000, width: 7000, height: 9000, fill: "#0b0f15" });
  el(padre, "ellipse", { cx: 620, cy: 1000, rx: 1300, ry: 1100, fill: u("luz") });
  el(padre, "ellipse", { cx: 540, cy: MANOS_Y + 50, rx: 900, ry: 900, fill: u("luzfria") });
  const rej = el(padre, "rect", { x: -3000, y: -3000, width: 7000, height: 9000, fill: u("rejilla"), opacity: 0 });
  const r = K.azar(31), motas = [];
  for (let i = 0; i < 18; i++) motas.push({ e: el(padre, "circle", { r: 24 + r() * 60, fill: u("bola") }), x: -300 + r() * 1800, y: 500 + r() * 2600, f: r(), w: r() * 6.28, a: 0.4 + r() * 0.6 });
  return (g) => {
    rej.setAttribute("opacity", f1(0.8 * rayos(g)));
    motas.forEach((m) => {
      const p = (ciclo(g, 0.035) + m.f) % 1;
      m.e.setAttribute("cx", f1(m.x + 40 * Math.sin(vuelta(g, 0.07) + m.w)));
      m.e.setAttribute("cy", f1(m.y - 500 * p));
      m.e.setAttribute("opacity", f1(m.a * Math.sin(Math.PI * p) * (1 - 0.6 * rayos(g))));
    });
  };
}

// ── el dedo: la piel (que se estira con d), el puño y, en rayos X, los huesos, la cápsula y el gas ──────────────
const sm = (a, b, x) => K.suave(K.tramo(x, a, b));
function pielDedo(d, p) {
  return DEDO.map(([x, y]) => {
    const hunde = 16 * (1 - p) * Math.exp(-(((x - 560) / 70) ** 2)) * (y < 1000 ? 1 : -0.6);
    return [x + d * sm(450, 640, x), y + hunde];
  });
}
function capsulaPts(d, p) {
  const c = 537 + d / 2, s = 30 * (1 - p);
  return [[395, 955], [425, 916], [c - 40, 900 + s * 0.7], [c, 896 + s], [c + 40, 900 + s * 0.7], [650 + d, 914], [692 + d, 958],
    [692 + d, 1042], [650 + d, 1086], [c + 40, 1100 - s * 0.7], [c, 1104 - s], [c - 40, 1100 - s * 0.7], [425, 1084], [395, 1045]];
}

function dedo(padre) {
  const g = el(padre, "g");
  // la piel de verdad
  const piel = el(g, "g");
  el(piel, "path", { d: curva(PUNO, true), fill: u("puno"), stroke: "rgba(70,30,20,0.5)", "stroke-width": 4 });
  [[300, 1170, 1395], [420, 1176, 1400]].forEach(([x, a, b]) => el(piel, "path", { d: `M${x} ${a} C${x + 14} ${a + 80} ${x + 10} ${b - 80} ${x - 6} ${b}`, fill: "none", stroke: "rgba(110,50,34,0.45)", "stroke-width": 4 }));
  el(piel, "path", { d: "M470 1200 C520 1230 545 1280 540 1340", fill: "none", stroke: "rgba(255,226,206,0.3)", "stroke-width": 10, "stroke-linecap": "round" });
  const cp = el(g, "clipPath", { id: `${PRE}dedo` });
  const cpP = el(cp, "path");
  const pielP = el(piel, "path", { fill: u("piel"), stroke: "rgba(90,40,26,0.55)", "stroke-width": 4 });
  const brillo = el(piel, "path", { fill: "none", stroke: "rgba(255,238,224,0.42)", "stroke-width": 12, "stroke-linecap": "round", "clip-path": u("dedo") });
  const arrugas = [0, 1, 2].map(() => el(piel, "path", { fill: "none", stroke: "rgba(120,58,40,0.5)", "stroke-width": 3.5, "stroke-linecap": "round" }));
  const pliegue = el(piel, "path", { fill: "none", stroke: "rgba(120,58,40,0.4)", "stroke-width": 3.5, "stroke-linecap": "round" });
  const una = el(piel, "path", { fill: u("una"), stroke: "rgba(150,90,70,0.5)", "stroke-width": 2 });
  // en rayos X: el contorno, la cápsula con su líquido, el gas, los huesos y la burbuja
  const rx = el(g, "g", { opacity: 0 });
  el(rx, "path", { d: curva(PUNO, true), fill: "rgba(95,212,255,0.05)", stroke: "rgba(95,212,255,0.45)", "stroke-width": 3 });
  const rxPiel = el(rx, "path", { fill: "rgba(95,212,255,0.07)", stroke: "rgba(95,212,255,0.8)", "stroke-width": 4 });
  const cc = el(g, "clipPath", { id: `${PRE}caps` });
  const ccP = el(cc, "path");
  const liquido = el(rx, "path", { fill: "rgba(95,212,255,0.2)" });
  const blanco = el(rx, "path", { fill: "#f4f7fa", opacity: 0 });                  // en resonancia, el líquido brilla
  const gas = el(rx, "g", { "clip-path": u("caps") });
  const rr = K.azar(77), puntos = [];
  for (let i = 0; i < 74; i++) {
    const bx = 478 + rr() * 130, by = 908 + rr() * 184;
    puntos.push({ e: el(gas, "circle", { r: f1(3.5 + rr() * 2.5), fill: ORO }), bx, by, e2: rr(), w: rr() * 6.28, f: 0.6 + rr() * 0.8 });
  }
  const hueso = { fill: u("hueso"), stroke: "rgba(150,210,255,0.95)", "stroke-width": 3 };
  const mc = el(rx, "path", { d: "M-700 968 L360 966 C400 960 420 930 448 925.4 A75 75 0 1 1 448 1074.6 C420 1070 400 1040 360 1034 L-700 1032 Z", ...hueso });
  el(rx, "path", { d: "M500 942 A75 75 0 0 1 500 1058", fill: "none", stroke: "rgba(170,236,255,0.75)", "stroke-width": 8, "stroke-linecap": "round" });
  const falanges = el(rx, "g");
  const PF = "M521 940 C540 925 580 958 640 968 L1040 968 C1070 958 1092 975 1092 1000 C1092 1025 1070 1042 1040 1032 L640 1032 C580 1042 540 1075 521 1060 A89 89 0 0 0 521 940 Z";
  el(falanges, "path", { d: PF, ...hueso });
  el(falanges, "path", { d: "M528 946 A89 89 0 0 0 528 1054", fill: "none", stroke: "rgba(170,236,255,0.75)", "stroke-width": 8, "stroke-linecap": "round" });
  el(falanges, "path", { d: "M1108 980 C1108 966 1130 970 1160 972 L1290 974 C1320 970 1330 984 1330 1000 C1330 1016 1320 1030 1290 1026 L1160 1028 C1130 1030 1108 1034 1108 1020 Z", ...hueso });
  el(falanges, "path", { d: "M1350 984 C1350 974 1370 976 1400 978 L1470 982 C1500 984 1512 994 1512 1004 C1512 1016 1496 1022 1470 1020 L1400 1022 C1370 1024 1350 1026 1350 1016 Z", ...hueso });
  // en resonancia, el hueso sale gris
  const grisM = el(rx, "path", { d: mc.getAttribute("d"), fill: "#4c5157", opacity: 0 });
  const grisF = el(falanges, "path", { d: PF, fill: "#4c5157", opacity: 0 });
  const capsBorde = el(rx, "path", { fill: "none", stroke: "rgba(150,220,255,0.6)", "stroke-width": 5, "stroke-linejoin": "round" });
  // flechitas de la succión, hacia dentro, cuando cae la presión
  const chupa = [0, 1, 2, 3].map(() => el(rx, "path", { fill: "none", stroke: ORO, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }));
  const bH = el(rx, "ellipse", { fill: u("halo-b"), opacity: 0 });
  const bur = el(rx, "ellipse", { fill: u("burbuja") });
  const bBrillo = el(rx, "ellipse", { fill: "rgba(255,255,255,0.85)" });
  let dHecho = -1, pHecho = -1;
  return (gg) => {
    const x = rayos(gg), d = abre(gg), p = presion(gg), m = reso(gg), b = burbuja(gg);
    piel.setAttribute("opacity", f1(1 - 0.8 * x));
    rx.setAttribute("opacity", f1(x));
    const dd = Math.round(d * 4) / 4, pp = Math.round(p * 100) / 100;
    if (dd !== dHecho || pp !== pHecho) {
      dHecho = dd; pHecho = pp;
      const S = pielDedo(dd, pp), dS = curva(S, true);
      pielP.setAttribute("d", dS); cpP.setAttribute("d", dS); rxPiel.setAttribute("d", dS);
      brillo.setAttribute("d", curva(S.slice(1, 12).map(([a, c]) => [a, c + 12])));
      const c = 537 + dd / 2, hu = 16 * (1 - pp);
      arrugas.forEach((a, i) => { const ax = c - 26 + 26 * i; a.setAttribute("d", `M${f1(ax - 12)} ${f1(884 + hu + i * 2)} C${f1(ax - 4)} ${f1(898 + hu)} ${f1(ax + 4)} ${f1(898 + hu)} ${f1(ax + 12)} ${f1(884 + hu + i * 2)}`); });
      pliegue.setAttribute("d", `M${f1(1088 + dd)} 1100 C${f1(1080 + dd)} 1080 ${f1(1082 + dd)} 1060 ${f1(1092 + dd)} 1046`);
      una.setAttribute("d", `M${f1(1418 + dd)} 924 C${f1(1470 + dd)} 914 ${f1(1520 + dd)} 924 ${f1(1546 + dd)} 952 C${f1(1520 + dd)} 948 ${f1(1470 + dd)} 942 ${f1(1420 + dd)} 944 Z`);
      const C = curva(capsulaPts(dd, pp), true);
      ccP.setAttribute("d", C); liquido.setAttribute("d", C); blanco.setAttribute("d", C); capsBorde.setAttribute("d", C);
      falanges.setAttribute("transform", `translate(${f1(dd)} 0)`);
    }
    if (x < 0.01) return;
    blanco.setAttribute("opacity", f1(0.85 * m));
    grisM.setAttribute("opacity", f1(0.8 * m)); grisF.setAttribute("opacity", f1(0.8 * m));
    const tens = (1 - p) * (1 - m);
    capsBorde.setAttribute("stroke", tens > 0.3 ? "rgba(255,194,74,0.85)" : "rgba(150,220,255,0.6)");
    // la succión
    const cx = 537 + d / 2;
    chupa.forEach((c, i) => {
      const arriba = i < 2, sx = cx + (i % 2 ? 60 : -60), sy = arriba ? 860 : 1140, s = arriba ? 1 : -1;
      const v = (ciclo(gg, 1.2) + i * 0.25) % 1, yy = sy + s * 22 * v;
      c.setAttribute("d", `M${f1(sx - 14)} ${f1(yy)} L${f1(sx)} ${f1(yy + s * 14)} L${f1(sx + 14)} ${f1(yy)}`);
      c.setAttribute("opacity", f1(tens * Math.sin(Math.PI * v) * 0.95));
    });
    // el gas: disuelto, se agita un poco; al bajar la presión, más; luego se junta en la burbuja
    const agita = 2 + 5 * (1 - p);
    puntos.forEach((q) => {
      const hx = q.bx + d * sm(478, 608, q.bx), hy = q.by;
      const jx = hx + agita * Math.sin(vuelta(gg, 0.8 * q.f) + q.w), jy = hy + agita * Math.cos(vuelta(gg, 0.7 * q.f) + q.w * 1.3);
      const j = K.entra(Math.min(1, junta(gg, q.e2)));
      const tx = cx + (q.bx - 543) * 0.12, ty = 1000 + (q.by - 1000) * 0.12;
      q.e.setAttribute("cx", f1(K.mez(jx, tx, j)));
      q.e.setAttribute("cy", f1(K.mez(jy, ty, j)));
      q.e.setAttribute("opacity", f1((1 - K.tramo(j, 0.8, 1)) * (1 - 0.5 * m)));
    });
    // la burbuja (en resonancia, un hueco negro)
    const rxB = 44 * b, ryB = 56 * b;
    if (b < 0.01) { bur.setAttribute("opacity", 0); bBrillo.setAttribute("opacity", 0); bH.setAttribute("opacity", 0); return; }
    bur.setAttribute("cx", f1(cx)); bur.setAttribute("cy", 1000); bur.setAttribute("rx", f1(rxB)); bur.setAttribute("ry", f1(ryB));
    bur.setAttribute("opacity", 1);
    bur.setAttribute("fill", m > 0.5 ? "#050608" : u("burbuja"));
    bBrillo.setAttribute("cx", f1(cx - 14 * b)); bBrillo.setAttribute("cy", f1(1000 - 22 * b));
    bBrillo.setAttribute("rx", f1(9 * b)); bBrillo.setAttribute("ry", f1(13 * b)); bBrillo.setAttribute("opacity", f1(0.9 * (1 - m)));
    bH.setAttribute("cx", f1(cx)); bH.setAttribute("cy", 1000); bH.setAttribute("rx", f1(rxB * 2.2)); bH.setAttribute("ry", f1(ryB * 2));
    bH.setAttribute("opacity", f1(0.35 * (1 - m)));
  };
}

// ── la otra mano: el pulgar por encima, el índice por debajo, la palma a la derecha; tira con el dedo ───────────
function otraMano(padre) {
  const g = el(padre, "g");
  const PALMA = curva([[1640, 830], [1800, 760], [2000, 744], [2400, 780], [2400, 1240], [2000, 1272], [1800, 1240], [1660, 1170], [1615, 1000]], true);
  const PULGAR = capsula(1170, 866, 1760, 838, 46), INDICE = capsula(1170, 1136, 1760, 1164, 50);
  const formas = [PALMA, INDICE, PULGAR];
  formas.forEach((d) => el(g, "path", { d, fill: "#7a4430", stroke: "rgba(70,30,20,0.85)", "stroke-width": 9 }));
  formas.forEach((d) => el(g, "path", { d, fill: u("otra") }));
  el(g, "path", { d: "M1176 826 C1200 812 1250 812 1268 822 C1262 834 1214 838 1176 838 Z", fill: u("una"), stroke: "rgba(150,90,70,0.5)", "stroke-width": 2 });
  el(g, "path", { d: "M1180 1182 C1210 1194 1250 1196 1272 1188", fill: "none", stroke: "rgba(255,226,206,0.5)", "stroke-width": 8, "stroke-linecap": "round" });
  [[1440, 830, 880], [1460, 1120, 1170]].forEach(([x, a, b]) => el(g, "path", { d: `M${x} ${a} C${x + 10} ${(a + b) / 2} ${x + 10} ${(a + b) / 2} ${x} ${b}`, fill: "none", stroke: "rgba(110,50,34,0.45)", "stroke-width": 4 }));
  el(g, "path", { d: "M1200 836 C1400 826 1600 818 1760 812", fill: "none", stroke: "rgba(255,238,224,0.4)", "stroke-width": 12, "stroke-linecap": "round" });
  el(g, "path", { d: "M2300 760 L2900 740 L2900 1300 L2300 1260 C2330 1100 2330 920 2300 760 Z", fill: u("manga2") });
  el(g, "path", { d: "M2300 760 C2330 920 2330 1100 2300 1260", fill: "none", stroke: "rgba(160,190,240,0.4)", "stroke-width": 8 });
  // la flecha del tirón, por encima
  const fl = el(padre, "g", { opacity: 0 });
  el(fl, "path", { d: "M0 0 H210", stroke: ORO, "stroke-width": 16, "stroke-linecap": "round" });
  el(fl, "path", { d: "M182 -34 L236 0 L182 34", fill: "none", stroke: ORO, "stroke-width": 16, "stroke-linecap": "round", "stroke-linejoin": "round" });
  return (gg) => {
    const x = rayos(gg), d = abre(gg), off = (1 - mano(gg)) * 1100;
    g.setAttribute("transform", `translate(${f1(d + off)} 0)`);
    g.setAttribute("opacity", f1(1 - 0.72 * x));
    const t = tirar(gg) * mano(gg), v = (ciclo(gg, 1.4)) % 1;
    fl.setAttribute("opacity", f1(t));
    fl.setAttribute("transform", `translate(${f1(1300 + d + off + 30 * K.sale(v))} 740)`);
  };
}

// ── los golpes en el mundo: ondas, la palabra CRAC, y los fantasmas del debate (nacer / explotar) ────────────────
function efectos(padre) {
  const g = el(padre, "g");
  const ondas = [...CRACS, 20.72].map((t) => ({ t, es: [0, 1, 2].map(() => el(g, "ellipse", { fill: "none", stroke: "#fff", "stroke-width": 6, opacity: 0 })) }));
  const PAL = [[0.28, 600, 820, 120], [22.98, 585, 1140, 64], [33.12, 600, 905, 50]];
  const palabras = PAL.map(([t, x, y, s]) => {
    const e = el(g, "text", { x: 0, y: 0, "text-anchor": "middle", "font-family": "Figtree, sans-serif", "font-weight": 900, "font-size": s, fill: "#fff", stroke: "#0b0f15", "stroke-width": s / 9, "paint-order": "stroke", opacity: 0 });
    e.textContent = "CRAC";
    return { e, t, x, y };
  });
  const nace = el(g, "ellipse", { fill: "none", stroke: VERDE, "stroke-width": 5, "stroke-dasharray": "12 10", opacity: 0 });
  const revienta = el(g, "ellipse", { fill: "none", stroke: ROJO, "stroke-width": 5, "stroke-dasharray": "12 10", opacity: 0 });
  const trozos = Array.from({ length: 10 }, () => el(g, "circle", { r: 6, fill: ROJO, opacity: 0 }));
  return (gg) => {
    const cx = 537 + abre(gg) / 2;
    ondas.forEach((o) => o.es.forEach((e, i) => {
      const v = K.tramo(gg, o.t + i * 0.09, o.t + i * 0.09 + 0.9);
      if (v <= 0 || v >= 1) { e.setAttribute("opacity", 0); return; }
      const r = 50 + 420 * K.sale(v);
      e.setAttribute("cx", f1(cx)); e.setAttribute("cy", 1000); e.setAttribute("rx", f1(r)); e.setAttribute("ry", f1(r * 1.1));
      e.setAttribute("opacity", f1((1 - v) * 0.7)); e.setAttribute("stroke-width", f1(8 - 6 * v));
    }));
    palabras.forEach((p) => {
      const v = gg - p.t;
      if (v < 0 || v > 1.1) { p.e.setAttribute("opacity", 0); return; }
      const s = 0.6 + 0.4 * K.sale(K.tramo(v, 0, 0.12)) + 0.15 * Math.exp(-14 * v) * Math.sin(40 * v) + 0.06 * v;
      p.e.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(-7) scale(${s.toFixed(3)})`);
      p.e.setAttribute("opacity", f1(1 - K.suave(K.tramo(v, 0.75, 1.1))));
    });
    // ¿al nacer? un anillo que crece desde nada; ¿al explotar? uno que se cierra y se rompe
    const vn = K.tramo(gg, 26.56, 27.3), ve = K.tramo(gg, 27.32, 28.1);
    nace.setAttribute("cx", f1(cx - 150)); nace.setAttribute("cy", 1000);
    nace.setAttribute("rx", f1(44 * K.sale(vn))); nace.setAttribute("ry", f1(56 * K.sale(vn)));
    nace.setAttribute("opacity", f1(vn > 0 && vn < 1 ? Math.sin(Math.PI * vn) : 0));
    const cierra = K.tramo(ve, 0, 0.45);
    revienta.setAttribute("cx", f1(cx + 150)); revienta.setAttribute("cy", 1000);
    revienta.setAttribute("rx", f1(44 * (1 - 0.7 * K.entra(cierra)))); revienta.setAttribute("ry", f1(56 * (1 - 0.7 * K.entra(cierra))));
    revienta.setAttribute("opacity", f1(ve > 0 && cierra < 1 ? 1 : 0));
    const vt = K.tramo(ve, 0.45, 1);
    trozos.forEach((t, i) => {
      const a = (i / 10) * 6.283;
      t.setAttribute("cx", f1(cx + 150 + Math.cos(a) * (14 + 70 * K.sale(vt))));
      t.setAttribute("cy", f1(1000 + Math.sin(a) * (16 + 80 * K.sale(vt))));
      t.setAttribute("opacity", f1(vt > 0 && vt < 1 ? 1 - vt : 0));
    });
  };
}

// ── abajo en el mundo: las dos manos del médico, por el dorso ──────────────────────────────────────────────────
const DEDOS = [[-98, 50, 178, -9], [-36, 56, 236, -3], [28, 58, 258, 1], [92, 56, 226, 6]]; // x, ancho, largo, giro
function dorso(padre, cx, espejo) {
  const g = el(padre, "g", { transform: `translate(${cx} ${MANOS_Y})${espejo ? " scale(-1 1)" : ""}` });
  el(g, "path", { d: "M-128 500 L-118 980 L118 980 L128 500 C60 486 -60 486 -128 500 Z", fill: u("manga") });
  el(g, "path", { d: "M-128 500 C-60 486 60 486 128 500", fill: "none", stroke: "rgba(160,190,240,0.4)", "stroke-width": 7 });
  const PALMA = curva([[-125, 14], [-60, -4], [30, -8], [110, 6], [138, 90], [142, 182], [126, 262], [100, 300], [96, 520], [-96, 520], [-102, 300], [-126, 256], [-140, 150]], true);
  const formas = [PALMA];
  const rota = (d, x, a, y0 = 14) => ({ d, t: `rotate(${a} ${x} ${y0})` });
  const ds = [{ d: PALMA, t: "" }];
  DEDOS.forEach(([x, w, L, a]) => ds.push(rota(`M${x - w / 2} 40 L${x - w / 2} ${-L + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${-L + w / 2} L${x + w / 2} 40 Z`, x, a)));
  ds.push({ d: capsula(112, 200, 112 + 150 * Math.cos(-0.95), 200 + 150 * Math.sin(-0.95), 33), t: "" });
  ds.forEach((f) => el(g, "path", { d: f.d, transform: f.t, fill: "#7a4430", stroke: "rgba(70,30,20,0.85)", "stroke-width": 8 }));
  ds.forEach((f) => el(g, "path", { d: f.d, transform: f.t, fill: u("dorso") }));
  void formas;
  // nudillos, pliegues y uñas
  DEDOS.forEach(([x, w, L, a]) => {
    const f = el(g, "g", { transform: `rotate(${a} ${x} 14)` });
    el(f, "ellipse", { cx: x, cy: 12, rx: w * 0.42, ry: 15, fill: "rgba(255,232,214,0.38)" });
    [0.36, 0.66].forEach((k) => el(f, "path", { d: `M${x - w * 0.26} ${-L * k + 4} Q${x} ${-L * k - 6} ${x + w * 0.26} ${-L * k + 4}`, fill: "none", stroke: "rgba(120,58,40,0.5)", "stroke-width": 3.5, "stroke-linecap": "round" }));
    el(f, "rect", { x: x - w * 0.32, y: -L + 9, width: w * 0.64, height: 46, rx: 15, fill: u("una"), stroke: "rgba(150,90,70,0.45)", "stroke-width": 2 });
  });
  const tx = 112 + 150 * Math.cos(-0.95), ty = 200 + 150 * Math.sin(-0.95);
  el(g, "ellipse", { cx: f1(tx - 6), cy: f1(ty + 8), rx: 18, ry: 24, transform: `rotate(35 ${f1(tx)} ${f1(ty)})`, fill: u("una"), stroke: "rgba(150,90,70,0.45)", "stroke-width": 2 });
  el(g, "path", { d: "M-60 90 C-40 160 -40 220 -50 270 M10 80 C20 150 20 220 10 280 M70 90 C80 150 82 200 76 250", fill: "none", stroke: "rgba(150,80,58,0.25)", "stroke-width": 6, "stroke-linecap": "round" });
  return g;
}
function manos(padre) {
  const izq = dorso(padre, MI, false), der = dorso(padre, MD, true);
  // los crac de la mano izquierda: uno tras otro, en un nudillo distinto
  const chispas = el(padre, "g");
  const rayitos = Array.from({ length: 8 }, () => el(chispas, "path", { stroke: ORO, "stroke-width": 7, "stroke-linecap": "round", opacity: 0 }));
  const halo = el(chispas, "circle", { r: 70, fill: u("halo-o"), opacity: 0 });
  const barrido = el(padre, "rect", { x: 60, width: 960, height: 120, fill: u("barrido"), opacity: 0 });
  const verdes = [MI, MD].map((x) => el(padre, "ellipse", { cx: x, cy: MANOS_Y + 14, rx: 200, ry: 90, fill: u("halo-v"), opacity: 0 }));
  return (gg) => {
    const on = sube(gg, 44.1, 44.3) * (1 - sube(gg, 48.9, 49.1));
    const i = salto(gg, 1 / 0.55), v = (((gg % 0.55) + 0.55) % 0.55) / 0.55;
    const [fx, , , a] = DEDOS[(i * 3) % 4];
    const kx = MI + fx + 12 * Math.sin((a * Math.PI) / 180), ky = MANOS_Y + 10;
    rayitos.forEach((r, j) => {
      const ang = (j / 8) * 6.283 + 0.3, r0 = 30 + 40 * K.sale(K.tramo(v, 0, 0.5)), r1 = r0 + 34 * (1 - v);
      r.setAttribute("d", `M${f1(kx + Math.cos(ang) * r0)} ${f1(ky + Math.sin(ang) * r0)} L${f1(kx + Math.cos(ang) * r1)} ${f1(ky + Math.sin(ang) * r1)}`);
      r.setAttribute("opacity", f1(on * (1 - K.tramo(v, 0.1, 0.6))));
    });
    halo.setAttribute("cx", f1(kx)); halo.setAttribute("cy", f1(ky));
    halo.setAttribute("opacity", f1(on * 0.8 * (1 - K.tramo(v, 0, 0.5))));
    izq.setAttribute("transform", `translate(${MI} ${f1(MANOS_Y - on * 5 * Math.exp(-10 * v))})`);
    const vb = K.tramo(gg, 47.9, 48.9);
    barrido.setAttribute("y", f1(2220 + 700 * vb - 120));
    barrido.setAttribute("opacity", f1(vb > 0 && vb < 1 ? Math.min(1, 4 * Math.sin(Math.PI * vb)) : 0));
    verdes.forEach((e) => e.setAttribute("opacity", f1(asoma(gg, 49.1, 50.5))));
    void der;
  };
}

// ── en pantalla: el refresco (cerrado / se abre), el marco de la resonancia, el rebobinado y el destello ────────
function pantallaFija(capa) {
  const sv = K.crear(capa, `<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0"></svg>`);
  // el refresco
  const ref = el(sv, "g", { opacity: 0 });
  el(ref, "rect", { x: 800, y: 720, width: 230, height: 350, rx: 26, fill: "rgba(11,14,20,0.92)", stroke: "rgba(255,255,255,0.22)", "stroke-width": 2 });
  const B = (x, y) => [800 + x, 720 + y];
  const botella = curva([B(97, 60), B(97, 112), B(72, 150), B(66, 200), B(66, 318), B(80, 332), B(150, 332), B(164, 318), B(164, 200), B(158, 150), B(133, 112), B(133, 60)]);
  const cb = el(sv, "clipPath", { id: `${PRE}botella` });
  el(cb, "path", { d: botella + " Z" });
  el(ref, "rect", { x: 860, y: 860, width: 120, height: 200, fill: "#6b2a14", "clip-path": u("botella") });
  el(ref, "rect", { x: 860, y: 860, width: 120, height: 10, fill: "rgba(255,200,150,0.45)", "clip-path": u("botella") });
  const burb = el(ref, "g", { "clip-path": u("botella") });
  const rb = K.azar(9), bs = [];
  for (let i = 0; i < 26; i++) bs.push({ e: el(burb, "circle", { r: 3, fill: ORO }), x: 870 + rb() * 90, y: 875 + rb() * 170, f: rb(), w: rb() * 6.28 });
  el(ref, "path", { d: botella, fill: "rgba(170,230,200,0.08)", stroke: "rgba(200,240,255,0.75)", "stroke-width": 4 });
  el(ref, "path", { d: `M${880} 930 L880 1030`, stroke: "rgba(255,255,255,0.35)", "stroke-width": 7, "stroke-linecap": "round" });
  const tapon = el(ref, "rect", { x: 891, y: 760, width: 58, height: 26, rx: 6, fill: ROJO, stroke: "#8a1626", "stroke-width": 3 });
  const spray = Array.from({ length: 9 }, () => el(ref, "circle", { r: 4, fill: "rgba(255,240,220,0.8)", opacity: 0 }));
  // el marco de la resonancia
  const rm = el(sv, "g", { opacity: 0 });
  [[90, 600, 1, 1], [990, 600, -1, 1], [90, 1335, 1, -1], [990, 1335, -1, -1]].forEach(([x, y, a, b]) =>
    el(rm, "path", { d: `M${x} ${y + 60 * b} V${y} H${x + 60 * a}`, fill: "none", stroke: "rgba(230,236,244,0.85)", "stroke-width": 5 }));
  const rmT = el(rm, "text", { x: 112, y: 1310, "font-family": "JetBrains Mono, monospace", "font-weight": 700, "font-size": 30, fill: "rgba(230,236,244,0.9)" });
  rmT.textContent = "RM · 2015";
  const rec = el(rm, "circle", { cx: 968, cy: 1300, r: 10, fill: ROJO });
  const reloj = el(rm, "text", { x: 948, y: 1310, "text-anchor": "end", "font-family": "JetBrains Mono, monospace", "font-weight": 700, "font-size": 30, fill: "rgba(230,236,244,0.9)" });
  const linea = el(rm, "rect", { x: 90, width: 900, height: 3, fill: "rgba(230,236,244,0.35)" });
  // el rebobinado
  const rw = el(sv, "g", { opacity: 0 });
  const rayas = Array.from({ length: 7 }, () => el(rw, "rect", { x: 0, width: 1080, height: 6, fill: "rgba(255,255,255,0.18)" }));
  el(rw, "path", { d: "M600 930 L530 1000 L600 1070 Z M690 930 L620 1000 L690 1070 Z", fill: "#fff", transform: "translate(-74 0)" });
  let ultimo = "";
  return (gg) => {
    // refresco
    const on = asoma(gg, 9.6, 11.4) + asoma(gg, 18.9, 21.8);
    ref.setAttribute("opacity", f1(on));
    if (on > 0.01) {
      const ab = sube(gg, 19.15, 19.45), v = K.tramo(gg, 19.15, 19.9);
      tapon.setAttribute("transform", `translate(${f1(60 * v)} ${f1(-90 * K.sale(v))}) rotate(${f1(140 * v)} 920 773)`);
      tapon.setAttribute("opacity", f1(1 - K.tramo(v, 0.6, 1)));
      bs.forEach((q) => {
        const s = (ciclo(gg, 0.9) * (0.7 + q.f) + q.f) % 1;
        const yy = K.mez(q.y + 3 * Math.sin(vuelta(gg, 0.5) + q.w), 1060 - 200 * s, ab);
        q.e.setAttribute("cx", f1(q.x + 3 * Math.cos(vuelta(gg, 0.6) + q.w) * (1 - ab) + 4 * Math.sin(s * 12 + q.w) * ab));
        q.e.setAttribute("cy", f1(yy));
        q.e.setAttribute("r", f1(3 + 4 * ab * s));
        q.e.setAttribute("fill", ab > 0.5 ? "rgba(255,236,200,0.85)" : ORO);
      });
      spray.forEach((s, i) => {
        const c = (ciclo(gg, 1.3) + i / 9) % 1;
        s.setAttribute("cx", f1(920 + (i - 4) * 9 * c)); s.setAttribute("cy", f1(770 - 70 * c));
        s.setAttribute("opacity", f1(ab * (1 - c) * (1 - sube(gg, 21.0, 21.6))));
      });
    }
    // resonancia
    const m = reso(gg);
    rm.setAttribute("opacity", f1(m));
    if (m > 0.01) {
      const t = Math.max(0, gg - 29.0), txt = `00:${String(Math.floor(t)).padStart(2, "0")}.${String(Math.floor((t % 1) * 100)).padStart(2, "0")}`;
      if (txt !== ultimo) { reloj.textContent = txt; ultimo = txt; }
      rec.setAttribute("opacity", f1(0.5 + 0.5 * Math.sin(vuelta(gg, 1.5))));
      linea.setAttribute("y", f1(600 + 735 * ((ciclo(gg, 0.66)) % 1)));
    }
    // rebobinado
    const r = rebobina(gg);
    rw.setAttribute("opacity", f1(r));
    if (r > 0.01) rayas.forEach((e, i) => { const k = salto(gg, 30) * 7 + i; e.setAttribute("y", f1(560 + ((k * 97) % 800))); });
  };
}

// ── las etiquetas (en pantalla, sujetas a un punto del mundo o a un sitio fijo) ─────────────────────────────────
export function etiqueta(cont, html, clase = "") { return K.crear(cont, `<div class="c-etq ${clase}">${html}</div>`); }
function pon(e, sx, sy, on, dy = 24) {
  if (on <= 0.001) { e.style.opacity = 0; return; }
  const w = e.offsetWidth, h = e.offsetHeight;
  const x = Math.min(Math.max(sx, 40 + w / 2), 1040 - w / 2), y = Math.min(Math.max(sy, 565 + h / 2), 1340 - h / 2);
  e.style.opacity = on;
  e.style.transform = `translate(${f1(x - w / 2)}px, ${f1(y - h / 2 + (1 - on) * dy)}px) scale(${f1(0.9 + 0.1 * on)})`;
}
const tacha = (e, g, t) => { e.querySelector(".tacha").style.transform = `scaleX(${K.sale(K.tramo(g, t, t + 0.3))})`; };
const junto = (k, P, dx = 0, dy = 0) => { const [x, y] = pantalla(k, P[0], P[1]); return [x + dx, y + dy]; };

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on, tch) => { const l = { e: etiqueta(capa, html + (tch ? `<i class="tacha" data-layout-allow-occlusion></i>` : ""), clase), sitio, on, tch }; L.push(l); return l; };
  const ARR = () => [540, 650], ABA = () => [540, 1270];
  // hook
  r(`un <b data-layout-allow-occlusion>hueso</b>`, "r g", ARR, (g) => asoma(g, 1.7, 3.1), 2.4);
  r(`una <b>burbuja</b>`, "v g", ABA, (g) => asoma(g, 3.2, 5.25));
  r(`antes del <b>crac</b>`, "", ARR, (g) => asoma(g, 5.75, 7.0));
  r(`<b>cápsula</b>`, "c", ARR, (g) => asoma(g, 7.08, 8.4));
  r(`<b>líquido</b>`, "c", ABA, (g) => asoma(g, 7.92, 9.3));
  r(`<b>gas</b> disuelto`, "o", ARR, (g) => asoma(g, 8.72, 11.1));
  r(`refresco <b>cerrado</b>`, "", () => [915, 1125], (g) => asoma(g, 10.0, 11.2));
  // tira
  r(`<b>tiras</b>`, "o", ARR, (g) => asoma(g, 11.6, 13.0));
  r(`se <b>resisten</b>`, "o", ARR, (g) => asoma(g, 13.3, 16.0));
  r(`la presión <b>cae</b>`, "r", ABA, (g) => asoma(g, 15.9, 17.6));
  r(`¡se <b>sueltan</b>!`, "r g", ARR, (g) => asoma(g, 18.0, 18.7));
  r(`<b>gas</b> fuera del líquido`, "o", ARR, (g) => asoma(g, 19.0, 20.4));
  r(`una <b>burbuja</b>`, "v g", ARR, (g) => asoma(g, 20.72, 22.8));
  // resonancia
  r(`<b>70 años</b> de debate`, "g", ARR, (g) => asoma(g, 24.3, 28.1));
  const nacer = r(`¿al <b>nacer</b>?`, "", () => [290, 1270], (g) => asoma(g, 26.5, 35.9));
  r(`¿al <b data-layout-allow-occlusion>explotar</b>?`, "r", () => [790, 1270], (g) => asoma(g, 27.3, 35.9), 35.0);
  r(`<b>2015</b><small>resonancia en directo</small>`, "g", ARR, (g) => asoma(g, 28.4, 31.4));
  r(`suena al <b>nacer</b>`, "v g", ARR, (g) => asoma(g, 33.1, 34.5));
  r(`y <b>sigue ahí</b>`, "v", ARR, (g) => asoma(g, 34.8, 36.2));
  // veinte
  r(`otra vez el <b>mismo dedo</b>`, "", ARR, (g) => asoma(g, 37.0, 38.6));
  r(`<b>sin crac</b>`, "r g", ABA, (g) => asoma(g, 38.6, 39.6));
  r(`unos <b>20 minutos</b>`, "o g", ARR, (g) => asoma(g, 40.4, 42.5));
  // manos
  r(`un <b>médico</b>, una <b>sola</b> mano`, "", ABA, (g) => asoma(g, 43.0, 46.1));
  r(`<b>crac</b> a diario`, "o", (k) => junto(k, [MI, 2250]), (g) => asoma(g, 45.0, 48.8));
  r(`<b>nunca</b>`, "", (k) => junto(k, [MD, 2250]), (g) => asoma(g, 45.4, 48.8));
  const cuenta = r(`<b>0</b> años`, "g", ABA, (g) => asoma(g, 46.5, 47.55));
  r(`¿<b>artritis</b>?`, "r g", ABA, (g) => asoma(g, 47.9, 48.9));
  r(`<b>sin artritis</b>`, "v", (k) => junto(k, [MI, 2250]), (g) => asoma(g, 49.1, 50.6));
  r(`<b>sin artritis</b>`, "v", (k) => junto(k, [MD, 2250]), (g) => asoma(g, 49.1, 50.6));
  // cierre
  r(`es una <b>burbuja</b>`, "v g", ARR, (g) => asoma(g, 52.3, 53.15));
  const nb = cuenta.e.querySelector("b");
  let ultimo = "", verde = false;
  return (g, k) => {
    const n = String(Math.round(60 * K.sale(K.tramo(g, 46.6, 47.3))));
    if (n !== ultimo) { nb.textContent = n; ultimo = n; }
    const v = g > 33.1;
    if (v !== verde) { nacer.e.classList.toggle("v", v); verde = v; }
    L.forEach((l) => {
      const [x, y] = l.sitio(k);
      pon(l.e, x, y, l.on(g));
      if (l.tch) tacha(l.e, g, l.tch);
    });
  };
}

// ── abajo: el medidor, en tres modos (el sonido, la presión, el gas que se disuelve) ───────────────────────────
function medidor(capa) {
  const m = K.crear(capa, `<div class="c-medidor"><span>sonido</span><i class="luz"></i>
    <svg width="510" height="76" viewBox="0 0 510 76" aria-hidden="true">
      <g class="m-son"><path d="M0 38 H510" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
      <path class="traza" fill="none" stroke="#fff" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/></g>
      <g class="m-pre"><rect x="6" y="27" width="490" height="22" rx="11" fill="rgba(255,255,255,0.1)"/><rect class="barra" x="6" y="27" height="22" rx="11"/></g>
      <g class="m-gas"><rect x="6" y="27" width="370" height="22" rx="11" fill="rgba(255,255,255,0.1)"/><rect class="barra2" x="6" y="27" height="22" rx="11" fill="${ORO}"/>
      <path d="M98.5 22 V54 M191 22 V54 M283.5 22 V54" stroke="rgba(11,14,20,0.9)" stroke-width="3"/>
      <text class="min" x="500" y="49" text-anchor="end" font-family="JetBrains Mono, monospace" font-weight="700" font-size="30" fill="#fff">0 min</text></g>
    </svg></div>`);
  const t1 = m.querySelector("span"), luz = m.querySelector(".luz"), traza = m.querySelector(".traza");
  const son = m.querySelector(".m-son"), pre = m.querySelector(".m-pre"), gasG = m.querySelector(".m-gas");
  const barra = m.querySelector(".barra"), barra2 = m.querySelector(".barra2"), mins = m.querySelector(".min");
  const VENT = 2, N = 150, ANCHO_T = 500, SONES = [0.28, 33.12];
  const ruido = (t) => 1.6 * Math.sin(vuelta(t, 7.3)) + 1.1 * Math.sin(vuelta(t, 13.1) + 1) + 0.8 * Math.sin(vuelta(t, 23.7) + 2);
  let modo = "", ultimo = "";
  return (g) => {
    const on = asoma(g, -1, 5.3) + asoma(g, 11.4, 19.0) + asoma(g, 30.6, 36.0) + asoma(g, 39.4, 42.5) + asoma(g, 51.0);
    m.style.opacity = on.toFixed(2);
    if (on < 0.005) return;
    const mo = g < 9 || (g > 29 && g < 37) || g > 50 ? "sonido" : g < 25 ? "presión" : "gas disuelto";
    if (mo !== modo) {
      modo = mo; t1.textContent = mo;
      son.style.display = mo === "sonido" ? "" : "none";
      pre.style.display = mo === "presión" ? "" : "none";
      gasG.style.display = mo === "gas disuelto" ? "" : "none";
      luz.style.display = mo === "sonido" ? "" : "none";
    }
    if (mo === "sonido") {
      let d = "", fuerte = 0;
      for (let j = 0; j <= N; j++) {
        const t = g - VENT * (1 - j / N), tw = ((t % TOTAL) + TOTAL) % TOTAL;
        let y = ruido(tw);
        SONES.forEach((s) => { const v = tw - s; if (v >= 0 && v < 0.7) { y += -30 * Math.exp(-7 * v) * Math.sin(70 * v); if (j === N) fuerte = Math.max(fuerte, Math.exp(-4 * v)); } });
        d += `${j ? " L" : "M"}${f1(4 + (ANCHO_T * j) / N)} ${f1(38 + Math.max(-34, Math.min(34, y)))}`;
      }
      traza.setAttribute("d", d);
      luz.style.opacity = (0.25 + 0.75 * fuerte).toFixed(2);
    } else if (mo === "presión") {
      const p = presion(g);
      barra.setAttribute("width", f1(Math.max(22, 490 * p)));
      barra.setAttribute("fill", p > 0.6 ? VERDE : p > 0.3 ? ORO : ROJO);
    } else {
      const n = 20 * sube(g, 39.7, 42.3);
      barra2.setAttribute("width", f1(Math.max(0.1, 370 * n / 20)));
      const txt = `${Math.round(n)} min`;
      if (txt !== ultimo) { mins.textContent = txt; ultimo = txt; }
    }
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
  const fo = fondo(el(cam, "g"));
  const de = dedo(cam);
  const om = otraMano(cam);
  const ef = efectos(cam);
  const ma = manos(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  const destello = K.crear(esc, `<div class="c-destello"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const pf = pantallaFija(capa), me = medidor(capa), ro = rotulos(capa);
  return { mundo, cam, fo, de, om, ef, ma, destello, pf, me, ro };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los instantes en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // el temblor y el destello de cada crac
    let tx = 0, ty = 0, fl = 0;
    CRACS.forEach((t) => { const a = golpe(g, t, 7); tx += 12 * a * Math.sin(83 * (g - t)); ty += 9 * a * Math.cos(71 * (g - t)); fl += 0.55 * golpe(g, t, 9); });
    fl += 0.25 * golpe(g, 20.72, 10);
    E.cam.setAttribute("transform", `translate(${(540 - k.x * k.z + tx).toFixed(2)} ${(1000 - k.y * k.z + ty).toFixed(2)}) scale(${k.z.toFixed(4)})`);
    E.destello.style.opacity = Math.min(0.8, fl).toFixed(3);
    const m = reso(g);
    E.mundo.style.filter = m > 0.005 ? `grayscale(${m.toFixed(2)}) contrast(${(1 + 0.3 * m).toFixed(2)})` : "none";
    E.fo(g);
    E.de(g);
    E.om(g);
    E.ef(g);
    E.ma(g);
    E.pf(g);
    E.me(g);
    E.ro(g, k);
    return { g, k };
  };
  return E;
}
