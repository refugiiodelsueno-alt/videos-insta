// Lo que sale en todas las escenas: un personaje sin cuerpo (cabeza y manos que flotan) delante de un fondo oscuro.
// Su mano izquierda, abierta de cara, es donde pasan las cosquillas: su propio índice, el de otra persona (uñas rojas,
// puño naranja) o la espuma de un brazo robot que mueve con una palanca. La cabeza gira a perfil y se vuelve de rayos X
// para ver el cerebro: la orden (oro), la copia al cerebelo (cian), el toque (rojo). Abajo, el cosquillómetro.
// Todo en 2D, en un svg con la cámara dentro (un transform del grupo), para que de cerca se vea nítido.
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a";
export const F0 = { x: 585, y: 1250, z: 1.6 };                  // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 48.35;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);

// el segundo en que empieza cada escena (build/h1/index.html: cada una 0,3 s antes de que acabe la anterior)
export const G0 = { hook: 0, cerebro: 8.96, robot: 29.63, cierre: 43.5 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  intenta: 0, cosquillas: 0.8, ahora: 1.28, no: 2.32, poder: 2.72,
  piel: 4.18, sensible: 4.82, otra: 5.94, toca: 6.62, igual: 6.94, mueres: 7.58, risa: 8.18,
  diferencia: 9.1, cabeza: 10.26,
  mueves: 11.6, mano: 12.0, manda: 13.04, copia: 13.52, orden: 14.0, cerebelo: 14.48, aqui: 15.2,
  calcula: 16.82, sentir: 17.7, antes: 18.52, sentirlo: 18.88,
  llega: 20.56, toque: 20.88, esperaba: 21.72, resta: 22.56, casi: 23.28, notas: 23.84,
  mano2: 24.66, otro: 24.98, nohay: 25.38, copia2: 25.78, donde: 27.42, cuando: 27.94, salta: 28.66, alarma: 29.14,
  londres: 29.88, robot: 31.18, movias: 31.78, palanca: 32.34, unamano: 33.06, pasaba: 33.7, espuma: 34.18, laotra: 34.9,
  sin: 35.62, retraso: 35.78, apenas: 36.5, notaba: 36.98,
  dos: 38.34, decimas: 38.58, retraso2: 39.62, cuenta: 40.42, cuadraba: 41.06, volvian: 41.78, cosquillas2: 42.34,
  cerebro: 43.673, sorprender: 44.94, mismo: 45.7, sinsorpresa: 46.34, sorpresa: 46.5, nohay2: 47.16, cosquillas3: 47.48,
};

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
const H = [540, 590];                                            // el centro de la cabeza
const TOQUE = [600, 1364];                                       // donde le hacen las cosquillas, en la palma
const PALMA = { tx: 288, ty: 464, s: 0.6 };                      // la mano de dedos-arrugados, encogida y en su sitio
const MOTOR = [H[0] + 20, H[1] - 160], SENS = [H[0] - 25, H[1] - 158], CEREB = [H[0] - 105, H[1] + 85];
const JOY = [300, 1620];                                         // la palanca
const HOMBRO = [950, 1700];                                      // el hombro del robot

// ── lo que pasa con el tiempo (g, los segundos del vídeo entero) ────────────────────────────────────────────────
// cuánto se ve su propio índice en la palma (1 tocando, 0 fuera de plano)
const propio = (g) => 1 - sube(g, T.otra - 0.1, T.otra + 0.45) + sube(g, T.mueves - 0.5, T.mueves + 0.3)
  - sube(g, T.mano2 - 0.3, T.mano2 + 0.25) + sube(g, 44.0, 44.8);
// la mano de la otra persona
const ajena = (g) => sube(g, T.otra, T.toca) - sube(g, 9.4, 10.2) + sube(g, T.mano2, T.otro + 0.2) - sube(g, 29.7, 30.5);
// la palanca y el robot
const robot = (g) => sube(g, 30.9, 31.9) - sube(g, 43.6, 44.6);
const palanca = (g) => sube(g, 31.6, 32.4) - sube(g, 43.6, 44.4);
// de perfil y en rayos X
const rayos = (g) => sube(g, T.cabeza, T.cabeza + 0.6) - sube(g, T.londres - 0.15, T.londres + 0.45);
// lo que marca el cosquillómetro
function cosquillas(g) {
  const base = 0.04 + 0.02 * Math.sin(vuelta(g, 1.7));
  const ajenas = sube(g, T.toca, T.toca + 0.75) - sube(g, 9.6, 10.6);
  const blip = 0.1 * (sube(g, 22.2, 22.5) - sube(g, 22.6, 23.0));
  const alarma = sube(g, T.salta, T.salta + 0.45) - sube(g, 29.9, 30.9);
  const rob = 0.08 * sube(g, T.espuma, T.espuma + 0.5) + 0.8 * sube(g, T.cuenta, T.cosquillas2 + 0.1) - 0.88 * sube(g, 43.6, 44.8);
  return Math.min(1, Math.max(0, base + 0.94 * ajenas + blip + 0.95 * alarma + Math.max(0, rob)));
}
// la risa de la cara (0 aburrida, 1 muerta de risa)
const risa = (g) => sube(g, T.toca, T.mueres + 0.1) - sube(g, 9.3, 10.0) + sube(g, T.volvian + 0.1, T.cosquillas2 + 0.2) - sube(g, 44.0, 44.8);
// el retraso del robot y lo que se mueve la palanca
const retraso = (g) => 0.2 * sube(g, T.dos, T.decimas + 0.4);
const vaiven = (g) => Math.sin(vuelta(g, 0.9)) * palanca(g);

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0b0f15; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(5,7,10,0) 55%, rgba(5,7,10,0.6) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(9,12,17,0.96) 0, rgba(9,12,17,0.86) 300px, rgba(9,12,17,0.5) 470px, rgba(9,12,17,0) 630px); }

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

.c-medidor { position: absolute; left: 150px; width: 780px; top: 1362px; height: 76px; border-radius: 40px;
  background: rgba(11,14,20,0.9); border: 2px solid rgba(255,255,255,0.18); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.c-medidor span { position: absolute; left: 30px; top: 0; line-height: 72px; font-family: var(--letra), sans-serif; font-weight: 800;
  font-size: 30px; letter-spacing: 0.08em; color: #fff; text-transform: uppercase; }
.c-medidor .pista { position: absolute; left: 290px; right: 22px; top: 22px; height: 30px; border-radius: 16px; background: #222a36; overflow: hidden; }
.c-medidor .lleno { position: absolute; inset: 0; border-radius: 16px;
  background: linear-gradient(90deg, ${VERDE} 0, ${ORO} 55%, ${ROJO} 100%); }
.c-medidor .marcas { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(11,14,20,0) 0 46px, rgba(11,14,20,0.55) 46px 49px); }
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
const MED = { x: 560, y: 985, z: 0.82 };                         // cabeza y mano
const CARA = { x: 540, y: 610, z: 1.85 };                        // la cara de cerca
const CAB = { x: 525, y: 590, z: 2.1 };                          // el cerebro de cerca
const ANCHO = { x: 610, y: 1160, z: 0.66 };                      // con la palanca y el robot
const CAMINO = [
  [0, F0], [2.25, { x: 588, y: 1256, z: 1.66 }],                                               // la palma y su dedo
  [3.3, { x: 562, y: 990, z: 0.84 }], [5.6, { x: 560, y: 985, z: 0.82 }],                      // la cara, aburrida
  [6.5, { x: 575, y: 1040, z: 0.9 }], [8.9, { x: 565, y: 1020, z: 0.88 }],                      // la otra persona
  [10.15, CARA], [10.9, { x: 538, y: 605, z: 1.95 }],                                           // la cabeza gira
  [12.3, MED], [13.4, { x: 556, y: 970, z: 0.84 }],                                             // la orden baja
  [14.7, CAB], [19.8, { x: 522, y: 585, z: 2.2 }],                                              // copia, cerebelo, previsto
  [20.55, { x: 560, y: 980, z: 0.83 }], [21.5, { x: 555, y: 960, z: 0.85 }],                   // sube el toque
  [22.35, CAB], [24.1, { x: 525, y: 588, z: 2.15 }],                                            // lo resta
  [25.0, MED], [27.0, { x: 552, y: 930, z: 0.88 }],                                             // la mano de otro
  [28.55, { x: 528, y: 650, z: 1.55 }], [29.6, { x: 530, y: 660, z: 1.5 }],                    // la alarma
  [31.2, ANCHO], [43.4, { x: 605, y: 1150, z: 0.68 }],                                          // Londres, el robot
  [45.4, MED], [46.5, { x: 575, y: 1140, z: 1.05 }],
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

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,190,140,0.42)"/><stop offset="0.5" stop-color="rgba(130,150,210,0.2)"/><stop offset="1" stop-color="rgba(120,140,200,0)"/></radialGradient>
  <radialGradient id="c-bola" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,214,170,0.22)"/><stop offset="1" stop-color="rgba(255,214,170,0)"/></radialGradient>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.55)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <pattern id="c-rejilla" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0.75H60M0.75 0V60" stroke="rgba(95,212,255,0.13)" stroke-width="1.5"/></pattern>
  <linearGradient id="c-piel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b06a4f"/><stop offset="0.16" stop-color="#d89a79"/><stop offset="0.42" stop-color="#f4c4a6"/><stop offset="0.7" stop-color="#e5a988"/><stop offset="1" stop-color="#a46049"/></linearGradient>
  <radialGradient id="c-palma" cx="0.45" cy="0.38" r="0.7"><stop offset="0" stop-color="#f3c3a5"/><stop offset="0.6" stop-color="#dc9e7e"/><stop offset="1" stop-color="#b06d52"/></radialGradient>
  <linearGradient id="c-dedo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8735a"/><stop offset="0.35" stop-color="#f2c2a3"/><stop offset="0.7" stop-color="#e3a785"/><stop offset="1" stop-color="#a8634b"/></linearGradient>
  <linearGradient id="c-puno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1c0a1"/><stop offset="0.6" stop-color="#d99a79"/><stop offset="1" stop-color="#b47157"/></linearGradient>
  <linearGradient id="c-dedo2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e4129"/><stop offset="0.35" stop-color="#a8704c"/><stop offset="0.7" stop-color="#93603f"/><stop offset="1" stop-color="#5f3721"/></linearGradient>
  <linearGradient id="c-puno2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a66f4b"/><stop offset="0.6" stop-color="#8c5a3a"/><stop offset="1" stop-color="#6a4029"/></linearGradient>
  <linearGradient id="c-manga" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f3f73"/><stop offset="0.45" stop-color="#3a6cc0"/><stop offset="1" stop-color="#1b3561"/></linearGradient>
  <linearGradient id="c-manga2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8460e"/><stop offset="0.45" stop-color="#f08a2c"/><stop offset="1" stop-color="#93390a"/></linearGradient>
  <radialGradient id="c-cara" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stop-color="#f6cbae"/><stop offset="0.65" stop-color="#e2a585"/><stop offset="1" stop-color="#b8725a"/></radialGradient>
  <linearGradient id="c-pelo" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#4a3226"/><stop offset="1" stop-color="#22160f"/></linearGradient>
  <radialGradient id="c-rubor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(232,96,96,0.55)"/><stop offset="1" stop-color="rgba(232,96,96,0)"/></radialGradient>
  <radialGradient id="c-craneo" cx="0.45" cy="0.4" r="0.65"><stop offset="0" stop-color="rgba(40,90,130,0.55)"/><stop offset="1" stop-color="rgba(12,30,48,0.85)"/></radialGradient>
  <radialGradient id="c-sesos" cx="0.45" cy="0.35" r="0.7"><stop offset="0" stop-color="#f0b7c0"/><stop offset="0.7" stop-color="#cf8796"/><stop offset="1" stop-color="#a65d70"/></radialGradient>
  <radialGradient id="c-cerebelo" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#e3a0ac"/><stop offset="1" stop-color="#a65a6c"/></radialGradient>
  <radialGradient id="c-halo-c" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(95,212,255,0.85)"/><stop offset="0.45" stop-color="rgba(95,212,255,0.3)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <radialGradient id="c-halo-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,194,74,0.9)"/><stop offset="0.45" stop-color="rgba(255,194,74,0.3)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-halo-r" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,80,100,0.9)"/><stop offset="0.45" stop-color="rgba(240,68,90,0.32)"/><stop offset="1" stop-color="rgba(240,68,90,0)"/></radialGradient>
  <radialGradient id="c-halo-b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.9)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
  <linearGradient id="c-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef2f6"/><stop offset="0.35" stop-color="#b9c3cf"/><stop offset="0.75" stop-color="#7b8796"/><stop offset="1" stop-color="#4d5764"/></linearGradient>
  <radialGradient id="c-junta" cx="0.38" cy="0.35" r="0.7"><stop offset="0" stop-color="#5b6675"/><stop offset="1" stop-color="#1c222b"/></radialGradient>
  <radialGradient id="c-espuma" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#fff2a6"/><stop offset="0.6" stop-color="#ffd84d"/><stop offset="1" stop-color="#d9a21c"/></radialGradient>
  <radialGradient id="c-bolita" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stop-color="#ff8c9a"/><stop offset="1" stop-color="#b3142c"/></radialGradient>
  <linearGradient id="c-caja" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c4552"/><stop offset="1" stop-color="#191e26"/></linearGradient>
</defs>`;

// ── la palma: la mano de dedos-arrugados, lisa y seca ──────────────────────────────────────────────────────────
const DEDOS = [
  { cx: 330, base: 1650, tip: 1230, w: 118, a: -24, s: 11 },
  { cx: 360, base: 1330, tip: 830, w: 108, a: 0, s: 23 },
  { cx: 480, base: 1320, tip: 760, w: 114, a: 0, s: 37 },
  { cx: 600, base: 1330, tip: 810, w: 108, a: 1.5, s: 41 },
  { cx: 712, base: 1360, tip: 950, w: 94, a: 6, s: 53 },
];
function dContorno(f) {
  const P = [], hw0 = f.w / 2, cy = f.tip + hw0;
  const hw = (y) => hw0 * (0.97 + 0.09 * (y - cy) / (f.base - cy));
  for (let y = f.base + 30; y > cy; y -= 12) P.push([f.cx - hw(y), y]);
  const r = hw(cy);
  for (let i = 0; i <= 16; i++) { const th = Math.PI - Math.PI * i / 16; P.push([f.cx + r * Math.cos(th), cy - 1.08 * r * Math.sin(th)]); }
  for (let y = cy + 12; y <= f.base + 30; y += 12) P.push([f.cx + hw(y), y]);
  return P.map((p, i) => (i ? "L" : "M") + f1(p[0]) + " " + f1(p[1])).join("") + "Z";
}
function palma(padre) {
  const g = el(padre, "g", { transform: `translate(${PALMA.tx} ${PALMA.ty}) scale(${PALMA.s})` });
  el(g, "ellipse", { cx: 520, cy: 1760, rx: 420, ry: 140, fill: u("sombra"), transform: "translate(40 260)" });
  // la manga y la muñeca
  el(g, "path", { d: "M398 1830 L722 1830 C730 1900 734 1960 738 2010 L392 2010 C394 1960 396 1900 398 1830 Z", fill: u("piel") });
  el(g, "rect", { x: 360, y: 1960, width: 410, height: 150, rx: 26, fill: u("manga") });
  el(g, "rect", { x: 360, y: 1980, width: 410, height: 14, fill: "rgba(255,255,255,0.75)" });
  el(g, "path", { d: "M286 1300 L772 1305 C792 1500 764 1700 722 1868 L398 1868 C350 1760 270 1620 262 1480 C258 1400 270 1340 286 1300 Z", fill: u("palma") });
  const rayas = el(g, "g", { fill: "none", stroke: "rgba(128,62,42,0.42)", "stroke-width": 4.5, "stroke-linecap": "round" });
  ["M330 1430 C430 1405 580 1410 760 1440", "M318 1505 C420 1488 530 1525 650 1575", "M392 1440 C360 1560 384 1712 474 1832", "M410 1862 Q560 1880 712 1862"]
    .forEach((d) => el(rayas, "path", { d }));
  // los dedos, que se encogen un poco con las cosquillas
  const dedos = DEDOS.map((f) => {
    const dg = el(g, "g");
    el(dg, "path", { d: dContorno(f), fill: u("piel"), stroke: "rgba(80,34,22,0.45)", "stroke-width": 1.6, transform: `rotate(${f.a} ${f.cx} ${f.base})` });
    const det = el(dg, "g", { transform: `rotate(${f.a} ${f.cx} ${f.base})`, fill: "none" });
    const hw0 = f.w / 2;
    [f.tip + 195, f.tip + 360].forEach((y) => {
      if (y > f.base - 20) return;
      el(det, "path", { d: `M${f.cx - hw0 + 6} ${y} Q${f.cx} ${y + 9} ${f.cx + hw0 - 6} ${y}`, stroke: "rgba(128,62,42,0.5)", "stroke-width": 3.4 });
      el(det, "path", { d: `M${f.cx - hw0 * 0.75} ${y + 7} Q${f.cx} ${y + 15} ${f.cx + hw0 * 0.75} ${y + 7}`, stroke: "rgba(255,222,200,0.35)", "stroke-width": 2 });
    });
    for (let r = 9; r < 46; r += 7) el(det, "ellipse", { cx: f.cx + 3, cy: f.tip + 80, rx: r, ry: r * 1.25, stroke: "rgba(135,66,46,0.16)", "stroke-width": 1.3 });
    el(det, "path", { d: `M${f.cx - hw0 * 0.36} ${f.tip + 40} L${f.cx - hw0 * 0.4} ${f.base - 30}`, stroke: "rgba(255,240,228,0.16)", "stroke-width": f.w * 0.1, "stroke-linecap": "round" });
    return { dg, f };
  });
  return (g0) => {
    const c = cosquillas(g0);
    dedos.forEach(({ dg, f }, i) => {
      const t = Math.max(0, c - 0.15) * (5 + 4 * Math.sin(vuelta(g0, 3.1) + i * 1.7));
      dg.setAttribute("transform", `rotate(${f1(t * (i === 0 ? -1 : 1) * (i % 2 ? 1 : 0.7))} ${f.cx} ${f.base})`);
    });
  };
}

// ── una mano que señala con el índice (hacia arriba, el nudillo del índice en 0,0) ─────────────────────────────
// otra = la de la otra persona (piel más oscura, uñas rojas, puño naranja y una pulsera); puno = sin el índice
function manoQueSenala(padre, otra, puno = false) {
  const g = el(padre, "g", { opacity: 0 });
  const dedoG = el(g, "g");
  const sk = otra ? "2" : "", linea = otra ? "rgba(50,24,12,0.55)" : "rgba(110,52,34,0.5)";
  // la muñeca y la manga
  el(g, "path", { d: "M-34 170 L140 170 L150 330 L-44 330 Z", fill: u("dedo" + sk) });
  el(g, "rect", { x: -78, y: 285, width: 270, height: 170, rx: 30, fill: u("manga" + sk) });
  if (otra) {
    el(g, "rect", { x: -78, y: 300, width: 270, height: 12, fill: "rgba(255,240,220,0.8)" });
    el(g, "rect", { x: -78, y: 322, width: 270, height: 8, fill: "rgba(255,240,220,0.6)" });
    el(g, "rect", { x: -46, y: 255, width: 202, height: 26, rx: 13, fill: ORO, stroke: "#a87512", "stroke-width": 3 });
  } else el(g, "rect", { x: -78, y: 305, width: 270, height: 12, fill: "rgba(255,255,255,0.75)" });
  // el índice
  if (!puno) {
    el(dedoG, "path", { d: "M-36 30 L-36 -214 C-36 -262 36 -262 36 -214 L36 30 Z", fill: u("dedo" + sk), stroke: linea, "stroke-width": 2 });
    el(dedoG, "path", { d: "M-22 -200 C-22 -238 22 -238 22 -200 L22 -178 C10 -172 -10 -172 -22 -178 Z", fill: otra ? "#d42a45" : "rgba(255,226,214,0.85)", stroke: otra ? "#8c1024" : "rgba(160,90,70,0.5)", "stroke-width": 2 });
    if (otra) el(dedoG, "ellipse", { cx: -9, cy: -214, rx: 5, ry: 11, fill: "rgba(255,255,255,0.6)" });
    [-140, -62].forEach((y) => el(dedoG, "path", { d: `M-28 ${y} Q0 ${y + 8} 28 ${y}`, fill: "none", stroke: linea, "stroke-width": 3 }));
    el(dedoG, "path", { d: "M-14 -190 L-16 10", stroke: "rgba(255,240,228,0.22)", "stroke-width": 9, "stroke-linecap": "round" });
  }
  // el puño: tres (o cuatro) dedos doblados y el pulgar cruzado
  const bultos = puno ? [0, 50, 100, 145] : [50, 100, 145];
  const pd = `M-44 ${puno ? 10 : 20} ` + bultos.map((x) => `C${x - 24} -40 ${x + 24} -40 ${x + 24} 0`).join(" ") + " C176 20 178 120 160 160 C140 200 0 205 -30 180 C-60 150 -58 60 -44 20 Z";
  el(g, "path", { d: pd, fill: u("puno" + sk), stroke: linea, "stroke-width": 2 });
  bultos.slice(1).forEach((x) => el(g, "path", { d: `M${x - 2} 0 C${x - 6} 30 ${x - 4} 60 ${x - 10} 92`, fill: "none", stroke: linea, "stroke-width": 3 }));
  bultos.forEach((x) => el(g, "ellipse", { cx: x, cy: -12, rx: 14, ry: 8, fill: "rgba(255,236,222,0.3)" }));
  el(g, "path", { d: "M-50 118 C-20 86 40 70 96 82 C116 86 118 112 98 118 C50 128 0 140 -40 160 Z", fill: u("dedo" + sk), stroke: linea, "stroke-width": 2 });
  el(g, "path", { d: "M70 86 C86 84 100 92 102 104", fill: "none", stroke: otra ? "rgba(255,200,180,0.5)" : "rgba(255,240,230,0.6)", "stroke-width": 3 });
  return { g, dedoG };
}

// la mano en su sitio: la punta del índice en (x, y), el dedo con un ángulo (grados, 0 hacia arriba), y fuera = cuánto
// se ha ido hacia atrás (0 tocando, 1 fuera); el dedo hace cosquillas con un vaivén
function colocaMano(m, x, y, ang, fuera, g, espejo = false, rasca = 1) {
  const a = ang * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
  const ras = rasca * (1 - fuera);
  const w1 = Math.sin(vuelta(g, 3.8)), w2 = Math.sin(vuelta(g, 7.6) + 0.6);
  const ox = x - dx * (250 + 620 * K.suave(fuera)) + ras * 10 * w1, oy = y - dy * (250 + 620 * K.suave(fuera)) + ras * 6 * w2;
  m.g.setAttribute("transform", `translate(${f1(ox)} ${f1(oy)}) ${espejo ? "scale(-1 1)" : ""} rotate(${f1(espejo ? -ang : ang)})`);
  m.dedoG.setAttribute("transform", `rotate(${f1(ras * 7 * w1)} 0 20)`);
  m.g.setAttribute("opacity", f1(1 - K.suave(K.tramo(fuera, 0.75, 1))));
}

// ── la cara de frente: aburrida (0) o muerta de risa (1) ───────────────────────────────────────────────────────
const PARPADEOS = [1.65, 4.5, 31.6, 36.2, 39.4, 45.4];
function caraFrente(padre) {
  const g = el(padre, "g");
  const cab = el(g, "g");
  [-1, 1].forEach((s) => {
    el(cab, "ellipse", { cx: s * 166, cy: 18, rx: 28, ry: 44, fill: "#d18f72" });
    el(cab, "path", { d: `M${s * 160} 0 C${s * 178} 4 ${s * 180} 30 ${s * 164} 40`, fill: "none", stroke: "rgba(120,58,40,0.5)", "stroke-width": 4 });
  });
  el(cab, "ellipse", { cx: 0, cy: 10, rx: 168, ry: 192, fill: u("cara") });
  el(cab, "path", { d: "M-176 20 C-186 -130 -120 -226 0 -228 C130 -230 196 -130 178 22 C168 -40 150 -78 120 -104 C80 -82 20 -96 -10 -118 C-40 -90 -110 -78 -150 -70 C-166 -40 -172 -10 -176 20 Z", fill: u("pelo") });
  ["M-120 -150 C-80 -190 -20 -200 30 -196", "M-40 -196 C20 -210 90 -190 130 -150", "M60 -120 C90 -130 120 -120 140 -100"]
    .forEach((d) => el(cab, "path", { d, fill: "none", stroke: "rgba(140,100,80,0.35)", "stroke-width": 4, "stroke-linecap": "round" }));
  const rubor = [-1, 1].map((s) => el(cab, "ellipse", { cx: s * 104, cy: 64, rx: 46, ry: 28, fill: u("rubor") }));
  // ojos abiertos (con el párpado a media asta, de aburrimiento) y cerrados de risa
  const ojos = [-1, 1].map((s) => {
    const o = el(cab, "g", { transform: `translate(${s * 66} -6)` });
    const ab = el(o, "g");
    el(ab, "ellipse", { cx: 0, cy: 0, rx: 30, ry: 22, fill: "#fbf6f2" });
    el(ab, "circle", { cx: s * 2, cy: 3, r: 15, fill: "#5a3a26" });
    el(ab, "circle", { cx: s * 2, cy: 3, r: 7.5, fill: "#160d08" });
    el(ab, "circle", { cx: s * 2 - 5, cy: -3, r: 4.5, fill: "#fff" });
    const parpado = el(ab, "path", { fill: "#e0a383" });
    const linea = el(ab, "path", { fill: "none", stroke: "#6b3a26", "stroke-width": 4.5, "stroke-linecap": "round" });
    const cerrado = el(o, "path", { d: "M-28 6 C-16 -18 16 -18 28 6", fill: "none", stroke: "#4a2414", "stroke-width": 7, "stroke-linecap": "round", opacity: 0 });
    const lagrima = el(o, "path", { d: `M${s * 36} 10 C${s * 30} 22 ${s * 32} 32 ${s * 40} 32 C${s * 48} 32 ${s * 50} 22 ${s * 36} 10 Z`, fill: "#8fd8ff", stroke: "#e8f8ff", "stroke-width": 2, opacity: 0 });
    return { ab, parpado, linea, cerrado, lagrima };
  });
  const cejas = [-1, 1].map((s) => el(cab, "path", { fill: "none", stroke: "#3a2418", "stroke-width": 11, "stroke-linecap": "round" }));
  el(cab, "path", { d: "M-4 14 C4 36 14 54 4 66 C-4 72 -16 70 -22 64", fill: "none", stroke: "rgba(140,70,46,0.55)", "stroke-width": 5, "stroke-linecap": "round" });
  el(cab, "ellipse", { cx: -6, cy: 36, rx: 7, ry: 16, fill: "rgba(255,236,222,0.45)" });
  // la boca: la raya de aburrimiento y la boca abierta de risa (lengua y dientes)
  const boca = el(cab, "g", { transform: "translate(0 112)" });
  const raya = el(boca, "path", { d: "M-46 2 C-20 -2 20 -2 46 4", fill: "none", stroke: "#7a3424", "stroke-width": 7, "stroke-linecap": "round" });
  const abierta = el(boca, "g");
  const bclip = el(abierta, "clipPath", { id: `${PRE}boca` });
  const BOCA = "M-82 -16 C-40 -26 40 -26 82 -16 C78 50 40 86 0 86 C-40 86 -78 50 -82 -16 Z";
  el(bclip, "path", { d: BOCA });
  el(abierta, "path", { d: BOCA, fill: "#4a0f1a" });
  const dentro = el(abierta, "g", { "clip-path": `url(#${PRE}boca)` });
  el(dentro, "ellipse", { cx: 0, cy: 82, rx: 56, ry: 34, fill: "#e5677b" });
  el(dentro, "path", { d: "M-80 -30 L80 -30 L78 2 C40 8 -40 8 -78 2 Z", fill: "#fbf7f2" });
  el(abierta, "path", { d: BOCA, fill: "none", stroke: "#7a3424", "stroke-width": 5 });
  // los «ja» que salen de la cabeza
  const jas = [0, 1, 2, 3, 4].map((i) => {
    const t = el(g, "text", { x: 0, y: 0, "font-family": "Figtree, sans-serif", "font-weight": 900, "font-size": 64, fill: ORO, stroke: "#3a2208", "stroke-width": 3, "paint-order": "stroke", "text-anchor": "middle", opacity: 0 });
    t.textContent = "JA";
    return t;
  });
  return (g0) => {
    const r = risa(g0), r2 = K.suave(K.tramo(r, 0.25, 0.75));
    let pa = 0;
    PARPADEOS.forEach((p) => { pa = Math.max(pa, 1 - Math.min(1, Math.abs(g0 - p) / 0.09)); });
    const bote = r * 16 * Math.abs(Math.sin(vuelta(g0, 4.2))), giro = r * 4 * Math.sin(vuelta(g0, 2.1));
    cab.setAttribute("transform", `translate(0 ${f1(-bote)}) rotate(${f1(giro)} 0 120)`);
    // el párpado: a media asta aburrido, cerrado en el parpadeo y en la risa
    const cierre = Math.max(0.42 * (1 - r2), pa, r2);
    ojos.forEach((o) => {
      const y = -24 + 48 * cierre;
      o.parpado.setAttribute("d", `M-34 -30 L34 -30 L34 ${f1(y)} C14 ${f1(y + 4)} -14 ${f1(y + 4)} -34 ${f1(y)} Z`);
      o.linea.setAttribute("d", `M-31 ${f1(y)} C-14 ${f1(y + 4)} 14 ${f1(y + 4)} 31 ${f1(y)}`);
      o.ab.style.opacity = f1(1 - r2);
      o.cerrado.style.opacity = f1(r2);
      o.lagrima.style.opacity = f1(K.suave(K.tramo(r, 0.8, 1)));
    });
    cejas.forEach((c, i) => {
      const s = i ? 1 : -1, y = -62 - 18 * r2 + (1 - r) * 4;
      c.setAttribute("d", `M${s * 34} ${f1(y + 2 - 4 * r2)} C${s * 60} ${f1(y - 8 - 6 * r2)} ${s * 86} ${f1(y - 6 - 2 * r2)} ${s * 104} ${f1(y + 6)}`);
    });
    rubor.forEach((b) => b.setAttribute("opacity", f1(0.35 + 0.65 * r)));
    raya.style.opacity = f1(1 - K.suave(K.tramo(r, 0.1, 0.35)));
    const ab = K.suave(K.tramo(r, 0.1, 0.6)) * (0.88 + 0.12 * Math.abs(Math.sin(vuelta(g0, 4.2))));
    abierta.setAttribute("transform", `translate(0 -14) scale(${f1(0.6 + 0.4 * ab)} ${Math.max(0.02, ab).toFixed(3)}) translate(0 14)`);
    jas.forEach((t, i) => {
      const p = (ciclo(g0, 0.9) + i / 5) % 1, lado = i % 2 ? 1 : -1;
      t.setAttribute("x", f1(lado * (200 + 40 * Math.sin(i * 2.3)) + lado * 60 * p));
      t.setAttribute("y", f1(-40 - 260 * p + 30 * i % 60));
      t.setAttribute("opacity", f1(K.suave(K.tramo(r, 0.6, 0.95)) * Math.sin(Math.PI * p)));
      t.setAttribute("font-size", f1(52 + 20 * p));
    });
  };
}

// ── la cabeza de perfil por rayos X, mirando a la derecha: cráneo, cerebro, cerebelo y tronco ─────────────────────
const PERFIL = [[-150, -128], [-60, -184], [40, -186], [126, -138], [168, -60], [176, -12], [182, 22], [214, 62], [190, 82],
  [192, 104], [182, 114], [190, 128], [174, 146], [176, 170], [148, 196], [70, 208], [30, 200], [34, 262], [-70, 262], [-84, 196],
  [-150, 120], [-186, 10]];
const SESOS = [[-150, -36], [-140, -96], [-96, -146], [-30, -170], [40, -164], [104, -128], [140, -70], [146, -12], [120, 36],
  [60, 52], [10, 58], [-40, 44], [-100, 44], [-140, 20]];
function cabezaPerfil(padre) {
  const g = el(padre, "g");
  el(g, "path", { d: curva(PERFIL, true), fill: u("craneo"), stroke: CIAN, "stroke-width": 4, "stroke-opacity": 0.8 });
  el(g, "path", { d: curva(PERFIL, true), fill: "none", stroke: "rgba(95,212,255,0.25)", "stroke-width": 16 });
  // el hueso del cráneo, la oreja y el ojo, en líneas
  el(g, "path", { d: curva([[-168, 10], [-136, -112], [-52, -168], [40, -170], [116, -126], [152, -60], [150, -20]]), fill: "none", stroke: "rgba(220,240,255,0.35)", "stroke-width": 10 });
  el(g, "path", { d: "M-6 10 C-30 0 -36 50 -14 66 C-2 74 6 60 -2 50", fill: "none", stroke: "rgba(95,212,255,0.55)", "stroke-width": 5 });
  el(g, "path", { d: "M120 -22 C134 -30 150 -26 156 -18", fill: "none", stroke: "rgba(95,212,255,0.7)", "stroke-width": 5, "stroke-linecap": "round" });
  // el tronco y el cerebelo
  const tronco = el(g, "path", { d: "M-46 30 C-36 90 -40 170 -34 262 L6 262 C2 170 6 90 4 30 Z", fill: "#c88693", stroke: "rgba(80,20,40,0.5)", "stroke-width": 2 });
  const cereb = el(g, "g");
  el(cereb, "ellipse", { cx: -105, cy: 85, rx: 62, ry: 40, fill: u("cerebelo"), stroke: "rgba(90,24,44,0.6)", "stroke-width": 2.5 });
  for (let i = -3; i <= 3; i++) el(cereb, "path", { d: `M${-160 + Math.abs(i) * 4} ${85 + i * 10} C${-130} ${80 + i * 11} ${-80} ${80 + i * 11} ${-50 - Math.abs(i) * 4} ${85 + i * 10}`, fill: "none", stroke: "rgba(110,30,54,0.5)", "stroke-width": 2.4 });
  const sesos = el(g, "g");
  el(sesos, "path", { d: curva(SESOS, true), fill: u("sesos"), stroke: "rgba(110,34,56,0.65)", "stroke-width": 3 });
  const az = K.azar(7);
  const surcos = el(sesos, "g", { fill: "none", stroke: "rgba(120,40,64,0.55)", "stroke-width": 3.2, "stroke-linecap": "round" });
  el(surcos, "path", { d: curva([[0, -168], [-6, -120], [10, -80], [-2, -40]]), "stroke-width": 4.5 });
  el(surcos, "path", { d: curva([[-130, 4], [-70, -6], [0, 10], [70, 0], [118, 26]]), "stroke-width": 4.5 });
  for (let i = 0; i < 16; i++) {
    const x = -120 + az() * 240, y = -140 + az() * 160, L = [];
    for (let j = 0; j < 4; j++) L.push([x + (j - 1.5) * 18 + (az() - 0.5) * 10, y + (az() - 0.5) * 26]);
    if (Math.hypot((x + 5) / 140, (y + 50) / 100) < 0.95) el(surcos, "path", { d: curva(L) });
  }
  el(sesos, "path", { d: curva([[-110, -96], [-60, -140], [10, -150]]), fill: "none", stroke: "rgba(255,230,236,0.4)", "stroke-width": 8, "stroke-linecap": "round" });
  // lo que se enciende: la zona del movimiento (oro), la del tacto (roja o cian) y el cerebelo (cian)
  const luzM = el(g, "circle", { cx: MOTOR[0] - H[0], cy: MOTOR[1] - H[1], r: 60, fill: u("halo-o"), opacity: 0 });
  const luzS = el(g, "circle", { cx: SENS[0] - H[0], cy: SENS[1] - H[1], r: 70, fill: u("halo-r"), opacity: 0 });
  const luzC = el(g, "ellipse", { cx: CEREB[0] - H[0], cy: CEREB[1] - H[1], rx: 100, ry: 76, fill: u("halo-c"), opacity: 0 });
  const tinte = el(g, "path", { d: curva(SESOS, true), fill: ROJO, opacity: 0 });
  return { g, luzM, luzS, luzC, tinte, sesos };
}

// ── los nervios y lo que corre por ellos ────────────────────────────────────────────────────────────────────────
function nervios(padre) {
  const capa = el(padre, "g", { opacity: 0 });
  const camino = (P, color, ancho = 6) => {
    const d = curva(P);
    const fondo = el(capa, "path", { d, fill: "none", stroke: color, "stroke-width": ancho, "stroke-opacity": 0.18, "stroke-linecap": "round", "stroke-dasharray": "2 14" });
    const luz = el(capa, "path", { d, fill: "none", stroke: color, "stroke-width": ancho, "stroke-linecap": "round", opacity: 0.9 });
    const L = luz.getTotalLength();
    luz.setAttribute("stroke-dasharray", `${f1(L)} ${f1(L + 10)}`);
    return { fondo, luz, L, p: (t) => { const q = luz.getPointAtLength(Math.max(0, Math.min(1, t)) * L); return [q.x, q.y]; } };
  };
  const C = {
    orden: camino([MOTOR, [H[0] + 10, H[1] - 60], [H[0] - 18, H[1] + 120], [H[0] - 30, H[1] + 250], [430, 1120], [372, 1400], [420, 1630]], ORO),
    copia: camino([MOTOR, [H[0] - 10, H[1] - 90], [H[0] - 70, H[1] - 10], CEREB], CIAN),
    previsto: camino([CEREB, [H[0] - 140, H[1] - 20], [H[0] - 100, H[1] - 120], SENS], CIAN, 4),
    toque: camino([TOQUE, [596, 1190], [580, 990], [H[0] - 10, H[1] + 250], [H[0] - 16, H[1] + 120], [H[0] - 30, H[1] - 60], SENS], ROJO),
  };
  // una señal: un garabato de cosquilla que corre por su camino, con su halo
  const senal = (color, halo) => {
    const s = el(padre, "g", { opacity: 0 });
    el(s, "circle", { r: 54, fill: u(halo) });
    const z = el(s, "g");
    el(z, "path", { d: "M-34 0 L-24 -16 L-12 16 L0 -16 L12 16 L24 -16 L34 0", fill: "none", stroke: "#0b0f15", "stroke-width": 11, "stroke-linejoin": "round", "stroke-linecap": "round" });
    el(z, "path", { d: "M-34 0 L-24 -16 L-12 16 L0 -16 L12 16 L24 -16 L34 0", fill: "none", stroke: color, "stroke-width": 6, "stroke-linejoin": "round", "stroke-linecap": "round" });
    return { s, z };
  };
  const pulso = (color, halo) => { const s = el(padre, "g", { opacity: 0 }); el(s, "circle", { r: 40, fill: u(halo) }); el(s, "circle", { r: 11, fill: "#fff" }); return { s }; };
  const pOrden = pulso(ORO, "halo-o"), pCopia = pulso(CIAN, "halo-c");
  const sPrev = senal(CIAN, "halo-c"), sToque = senal(ROJO, "halo-r"), sAjeno = senal(ROJO, "halo-r");
  // el hueco vacío de la copia (con la mano de otro) y el destello de la resta
  const hueco = el(padre, "g", { opacity: 0 });
  el(hueco, "circle", { r: 40, fill: "rgba(11,15,21,0.6)", stroke: CIAN, "stroke-width": 4, "stroke-dasharray": "10 9" });
  const interr = el(hueco, "text", { y: 17, "text-anchor": "middle", "font-family": "Figtree, sans-serif", "font-weight": 900, "font-size": 48, fill: CIAN });
  interr.textContent = "?";
  const flash = el(padre, "circle", { r: 10, fill: "none", stroke: "#fff", "stroke-width": 6, opacity: 0 });
  const ondas = [0, 1, 2].map(() => el(padre, "circle", { r: 10, fill: "none", stroke: ROJO, "stroke-width": 10, opacity: 0 }));
  const pon = (o, [x, y], op, extra = "") => { o.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) ${extra}`); o.setAttribute("opacity", f1(op)); };
  const traza = (c, t, op) => { c.luz.setAttribute("stroke-dashoffset", f1(c.L * (1 - Math.max(0, Math.min(1, t))))); c.luz.style.opacity = f1(op); };
  return (g) => {
    const xr = rayos(g);
    capa.setAttribute("opacity", f1(xr));
    // la orden baja a la mano y la copia va al cerebelo
    const tO = sube(g, T.manda, T.manda + 0.95), tC = sube(g, T.copia + 0.05, T.copia + 0.85);
    const apaga1 = 1 - sube(g, 23.9, 24.5);
    traza(C.orden, tO, xr * apaga1); traza(C.copia, tC, xr * apaga1);
    pon(pOrden.s, C.orden.p(tO), xr * asoma(g, T.manda, T.manda + 0.95));
    pon(pCopia.s, C.copia.p(tC), xr * asoma(g, T.copia + 0.05, T.copia + 0.85));
    // el cerebelo calcula lo que vas a sentir: el garabato cian sale de él y espera en la zona del tacto
    const tP = sube(g, T.antes - 0.05, T.antes + 0.65);
    traza(C.previsto, tP, xr * apaga1);
    const nace = sube(g, T.calcula, T.calcula + 0.6), resta = sube(g, T.resta, T.resta + 0.35), anula = sube(g, T.resta + 0.3, T.resta + 0.9);
    const [px, py] = C.previsto.p(tP), late = 1 + 0.08 * Math.sin(vuelta(g, 2.5));
    pon(sPrev.s, [px, py], xr * nace * (1 - anula), `scale(${f1(late * (0.4 + 0.6 * nace))})`);
    sPrev.z.setAttribute("transform", `scale(1 ${f1((1 - 2 * resta) * (1 - anula))})`);
    // llega el toque (el suyo) y se resta
    const tT = sube(g, T.llega - 0.1, T.esperaba - 0.05);
    traza(C.toque, tT, xr * (1 - sube(g, 23.9, 24.5)));
    pon(sToque.s, C.toque.p(tT), xr * asoma(g, T.llega - 0.1) * (1 - anula));
    sToque.z.setAttribute("transform", `scale(1 ${f1(1 - anula)})`);
    const fl = K.tramo(g, T.resta + 0.3, T.resta + 1.0);
    pon(flash, SENS, xr * (fl > 0 && fl < 1 ? 1 - fl : 0)); flash.setAttribute("r", f1(20 + 120 * fl));
    // la mano de otro: no hay copia, el toque llega entero y salta la alarma
    const tA = sube(g, T.copia2 + 0.2, T.donde - 0.2);
    const borra = 1 - sube(g, 29.6, 30.2);
    if (g > 24) traza(C.toque, tA, xr * borra);
    pon(sAjeno.s, C.toque.p(tA), xr * asoma(g, T.copia2 + 0.2) * borra, `scale(${f1(1 + 0.35 * sube(g, T.salta, T.salta + 0.3) * (1 + 0.15 * Math.sin(vuelta(g, 6))))})`);
    pon(hueco, [SENS[0] - 70, SENS[1] - 40], xr * asoma(g, T.copia2, T.salta - 0.1));
    ondas.forEach((o, i) => {
      const p = (ciclo(g, 1.4) + i / 3) % 1, on = xr * sube(g, T.salta, T.salta + 0.2) * borra;
      o.setAttribute("transform", `translate(${SENS[0]} ${SENS[1]})`);
      o.setAttribute("r", f1(30 + 240 * p)); o.setAttribute("opacity", f1(on * (1 - p))); o.setAttribute("stroke-width", f1(12 * (1 - p) + 2));
    });
  };
}

// ── la palanca y el brazo robot con la espuma ───────────────────────────────────────────────────────────────────
function maquina(padre) {
  const pal = el(padre, "g", { opacity: 0 });
  el(pal, "ellipse", { cx: JOY[0], cy: JOY[1] + 92, rx: 170, ry: 30, fill: u("sombra") });
  el(pal, "rect", { x: JOY[0] - 130, y: JOY[1] - 10, width: 260, height: 100, rx: 22, fill: u("caja"), stroke: "rgba(255,255,255,0.12)", "stroke-width": 3 });
  el(pal, "ellipse", { cx: JOY[0], cy: JOY[1] - 6, rx: 60, ry: 18, fill: "#0d1117" });
  [[-90, VERDE], [90, ROJO]].forEach(([dx, c]) => el(pal, "circle", { cx: JOY[0] + dx, cy: JOY[1] + 42, r: 13, fill: c }));
  const palo = el(pal, "g");
  el(palo, "rect", { x: -11, y: -190, width: 22, height: 190, rx: 10, fill: u("metal") });
  el(palo, "circle", { cx: 0, cy: -200, r: 42, fill: u("bolita") });
  const puno = manoQueSenala(palo, false, true);
  // el robot: base, brazo, antebrazo y la espuma
  const rob = el(padre, "g", { opacity: 0 });
  const base = el(rob, "g");
  el(base, "path", { d: "M-110 260 L-70 30 L70 30 L110 260 Z", fill: u("caja"), stroke: "rgba(255,255,255,0.1)", "stroke-width": 3 });
  el(base, "rect", { x: -60, y: 70, width: 120, height: 16, rx: 6, fill: ORO, opacity: 0.85 });
  const seg = (largo, ancho) => {
    const s = el(rob, "g");
    el(s, "rect", { x: 0, y: -ancho / 2, width: largo, height: ancho, rx: ancho / 2, fill: u("metal"), stroke: "rgba(20,26,34,0.6)", "stroke-width": 3 });
    el(s, "rect", { x: ancho * 0.4, y: -ancho * 0.14, width: largo - ancho * 0.8, height: ancho * 0.12, rx: 4, fill: "rgba(255,255,255,0.5)" });
    el(s, "rect", { x: largo * 0.3, y: ancho * 0.18, width: largo * 0.4, height: ancho * 0.16, rx: 5, fill: ORO, opacity: 0.85 });
    return s;
  };
  const L1 = 400, L2 = 360;
  const brazo = seg(L1, 78), ante = seg(L2, 62);
  const junta = (r) => { const j = el(rob, "g"); el(j, "circle", { r, fill: u("junta"), stroke: "rgba(255,255,255,0.18)", "stroke-width": 3 }); el(j, "circle", { r: r * 0.38, fill: "#9aa6b5" }); return j; };
  const j1 = junta(54), j2 = junta(44);
  const mun = el(rob, "g");
  el(mun, "rect", { x: -8, y: -30, width: 60, height: 60, rx: 10, fill: u("junta") });
  el(mun, "rect", { x: 46, y: -62, width: 92, height: 124, rx: 40, fill: u("espuma"), stroke: "#b8860b", "stroke-width": 3 });
  const az = K.azar(3);
  for (let i = 0; i < 22; i++) el(mun, "circle", { cx: 60 + az() * 66, cy: -50 + az() * 100, r: 2 + az() * 4, fill: "rgba(170,120,10,0.45)" });
  const j3 = junta(32);
  return (g) => {
    const pa = palanca(g), ro = robot(g);
    pal.setAttribute("opacity", f1(pa));
    pal.setAttribute("transform", `translate(0 ${f1(220 * (1 - pa))})`);
    const ang = 22 * vaiven(g);
    palo.setAttribute("transform", `translate(${JOY[0]} ${JOY[1] - 4}) rotate(${f1(ang)})`);
    puno.g.setAttribute("transform", `translate(-36 -228) rotate(90) scale(0.62)`);
    puno.g.setAttribute("opacity", 1);
    // la espuma sigue a la palanca con el retraso de ese momento
    const d = retraso(g), v = vaiven(g - d);
    const toca = sube(g, T.pasaba, T.espuma + 0.1);
    const ex = TOQUE[0] - 20 + 85 * v + 380 * (1 - toca) + 500 * (1 - ro), ey = TOQUE[1] + 18 * Math.sin(vuelta(g, 1.8)) + 120 * (1 - toca) + 600 * (1 - ro);
    const sx = HOMBRO[0] + 420 * (1 - ro), sy = HOMBRO[1] + 520 * (1 - ro);
    // el codo, por cinemática inversa (hacia arriba y a la derecha)
    const wx = ex + 100, wy = ey + 40;
    const dx = wx - sx, dy = wy - sy, D = Math.min(L1 + L2 - 1, Math.hypot(dx, dy));
    const a0 = Math.atan2(dy, dx), c = Math.acos((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D));
    const a1 = a0 + c, cx = sx + L1 * Math.cos(a1), cy = sy + L1 * Math.sin(a1);
    const a2 = Math.atan2(wy - cy, wx - cx);
    rob.setAttribute("opacity", f1(K.suave(K.tramo(ro, 0, 0.35))));
    base.setAttribute("transform", `translate(${f1(sx)} ${f1(sy)})`);
    brazo.setAttribute("transform", `translate(${f1(sx)} ${f1(sy)}) rotate(${f1(a1 * 180 / Math.PI)})`);
    ante.setAttribute("transform", `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(a2 * 180 / Math.PI)})`);
    j1.setAttribute("transform", `translate(${f1(sx)} ${f1(sy)})`);
    j2.setAttribute("transform", `translate(${f1(cx)} ${f1(cy)})`);
    j3.setAttribute("transform", `translate(${f1(wx)} ${f1(wy)})`);
    mun.setAttribute("transform", `translate(${f1(wx)} ${f1(wy)}) rotate(${f1(180 + 12 * v)})`);
  };
}

// ── el fondo: una luz cálida detrás del personaje, motas que flotan y, en rayos X, una rejilla ─────────────────────
function fondo(padre) {
  el(padre, "rect", { x: -3000, y: -2000, width: 7000, height: 7000, fill: "#0b0f15" });
  el(padre, "ellipse", { cx: 560, cy: 900, rx: 1700, ry: 1900, fill: u("luz") });
  const rej = el(padre, "rect", { x: -3000, y: -2000, width: 7000, height: 7000, fill: u("rejilla"), opacity: 0 });
  const r = K.azar(17), motas = [];
  for (let i = 0; i < 18; i++) motas.push({ e: el(padre, "circle", { r: 30 + r() * 70, fill: u("bola") }), x: -200 + r() * 1500, y: r() * 2200, f: r(), w: r() * 6.28, a: 0.4 + r() * 0.6 });
  return (g) => {
    rej.setAttribute("opacity", f1(rayos(g)));
    motas.forEach((m) => {
      const p = (ciclo(g, 0.035) + m.f) % 1;
      m.e.setAttribute("cx", f1(m.x + 40 * Math.sin(vuelta(g, 0.07) + m.w)));
      m.e.setAttribute("cy", f1(m.y - 500 * p));
      m.e.setAttribute("opacity", f1(m.a * Math.sin(Math.PI * p) * (1 - 0.6 * rayos(g))));
    });
  };
}

// ── las ondas del toque en la palma: grises con su propio dedo, rosas con el de otro ────────────────────────────
function ondasToque(padre) {
  const os = [0, 1, 2].map(() => el(padre, "ellipse", { fill: "none", "stroke-width": 5, opacity: 0 }));
  return (g, x, y) => {
    const c = cosquillas(g);
    os.forEach((o, i) => {
      const p = (ciclo(g, 2.2) + i / 3) % 1;
      o.setAttribute("cx", f1(x)); o.setAttribute("cy", f1(y));
      o.setAttribute("rx", f1(20 + 120 * p)); o.setAttribute("ry", f1(14 + 80 * p));
      o.setAttribute("stroke", c > 0.3 ? "#ff7a9a" : "#ffffff");
      o.setAttribute("opacity", f1((0.12 + 0.75 * c) * (1 - p)));
    });
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
  const r = (html, clase, sitio, on, tch) => L.push({ e: etiqueta(capa, html + (tch ? `<i class="tacha"></i>` : ""), clase), sitio, on, tch });
  // hook
  r(`no vas a <b>poder</b>`, "r g", () => [540, 760], (g) => asoma(g, T.no, 3.45));
  r(`tu piel es <b>menos sensible</b>`, "", () => [540, 590], (g) => asoma(g, T.piel, 5.85), T.sensible + 0.45);
  r(`<b>otra persona</b>`, "o", (k) => junto(k, [800, 1310], 60, 0), (g) => asoma(g, T.otra + 0.2, 8.6));
  // cerebro
  r(`la <b>orden</b>`, "o", (k) => junto(k, [430, 1120], -150, 0), (g) => asoma(g, T.manda + 0.2, 14.4));
  r(`una <b>copia</b>`, "c", (k) => junto(k, [H[0] - 70, H[1] - 10], 210, -60), (g) => asoma(g, T.copia + 0.2, 16.0));
  r(`<b>cerebelo</b><small>aquí atrás</small>`, "c", (k) => junto(k, CEREB, -90, 150), (g) => asoma(g, T.cerebelo, 16.6));
  r(`lo que <b>vas a sentir</b>`, "c", (k) => junto(k, CEREB, 120, 210), (g) => asoma(g, T.sentir - 0.3, 18.4));
  r(`<b>antes</b> de sentirlo`, "c g", () => [540, 1250], (g) => asoma(g, T.antes, 20.3));
  r(`el <b>toque</b>`, "r", (k) => junto(k, [580, 990], 170, 0), (g) => asoma(g, T.toque, 21.9));
  r(`toque <b>−</b> previsto`, "", () => [540, 1210], (g) => asoma(g, T.resta, 24.25));
  r(`<b>≈ 0</b>`, "v g", () => [540, 1300], (g) => asoma(g, T.casi + 0.2, 24.25));
  r(`la mano <b>de otro</b>`, "o", (k) => junto(k, [840, 1420]), (g) => asoma(g, T.otro, 27.1));
  r(`<b>copia</b>`, "c", (k) => junto(k, [SENS[0] - 70, SENS[1] - 40], -150, -30), (g) => asoma(g, T.nohay, 27.2), T.copia2);
  r(`¿<b>dónde</b>?`, "r", () => [300, 1240], (g) => asoma(g, T.donde, 28.6));
  r(`¿<b>cuándo</b>?`, "r", () => [780, 1240], (g) => asoma(g, T.cuando, 28.6));
  r(`<b>¡alarma!</b>`, "r g", () => [540, 1240], (g) => asoma(g, T.alarma - 0.25, 29.7));
  // robot
  r(`<b>Londres</b><small>University College</small>`, "", () => [540, 600], (g) => asoma(g, T.londres + 0.1, 31.1));
  r(`<b>robot</b>`, "", (k) => junto(k, [HOMBRO[0], HOMBRO[1] - 250], -60, 0), (g) => asoma(g, T.robot, 32.3));
  r(`<b>palanca</b>`, "o", (k) => junto(k, [JOY[0], JOY[1] - 330], 0, 0), (g) => asoma(g, T.palanca, 33.9));
  r(`<b>espuma</b>`, "o", (k) => junto(k, [TOQUE[0] + 100, TOQUE[1] - 230], 40, 0), (g) => asoma(g, T.espuma, 35.5));
  const ret = { e: etiqueta(capa, `retraso <b>0,0 s</b>`, "v g"), sitio: () => [800, 625], on: (g) => asoma(g, T.retraso, 43.4) };
  L.push(ret);
  r(`la cuenta <b>no cuadra</b>`, "r", () => [800, 745], (g) => asoma(g, T.cuenta, 43.4));
  // cierre
  r(`<b>sorprenderse</b> a sí mismo`, "", () => [540, 890], (g) => asoma(g, T.sorprender, 46.2), T.mismo + 0.2);
  r(`sin sorpresa, <b>sin cosquillas</b>`, "c g", () => [540, 760], (g) => asoma(g, T.sorpresa, 47.95));
  const rb = ret.e.querySelector("b");
  let ultimo = "";
  return (g, k) => {
    const d = retraso(g), txt = `${d.toFixed(1).replace(".", ",")} s`;
    if (txt !== ultimo) { rb.textContent = txt; ultimo = txt; }
    ret.e.className = `c-etq g ${d > 0.05 ? "r" : "v"}`;
    L.forEach((l) => {
      const [x, y] = l.sitio(k);
      pon(l.e, x, y, l.on(g));
      if (l.tch) tacha(l.e, g, l.tch);
    });
  };
}

// el cosquillómetro, abajo
function medidor(capa) {
  const m = K.crear(capa, `<div class="c-medidor"><span>cosquillas</span><div class="pista"><div class="lleno"></div><div class="marcas"></div></div></div>`);
  const ll = m.querySelector(".lleno");
  return (g) => {
    const c = cosquillas(g), t = Math.max(0, c - 0.6) * 9;
    ll.style.clipPath = `inset(0 ${f1(100 - 100 * Math.max(0.035, c))}% 0 0 round 16px)`;
    m.style.transform = `translate(${f1(t * Math.sin(vuelta(g, 13)))}px, ${f1(t * 0.6 * Math.sin(vuelta(g, 17) + 1))}px)`;
    m.style.borderColor = c > 0.6 ? "rgba(240,68,90,0.7)" : "rgba(255,255,255,0.18)";
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
  const pa = palma(cam);
  const ot = ondasToque(cam);
  const maq = maquina(cam);
  const mia = manoQueSenala(cam, false), suya = manoQueSenala(cam, true);
  const cabeza = el(cam, "g");
  el(cabeza, "ellipse", { cx: 0, cy: 250, rx: 150, ry: 26, fill: u("sombra") });
  const frente = el(cabeza, "g"), perfil = el(cabeza, "g");
  const cf = caraFrente(frente), cp = cabezaPerfil(perfil);
  const nv = nervios(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const me = medidor(capa), ro = rotulos(capa);
  return { cam, fo, pa, ot, maq, mia, suya, cabeza, frente, perfil, cf, cp, nv, me, ro };
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
    E.fo(g);
    E.pa(g);
    // las dos manos que hacen cosquillas
    const tx = TOQUE[0] + 6 * Math.sin(vuelta(g, 1.3)), ty = TOQUE[1];
    colocaMano(E.mia, tx, ty, 38, 1 - propio(g), g);
    colocaMano(E.suya, tx + 8, ty - 6, -40, 1 - ajena(g), g, true, 1.5);
    E.ot(g, tx, ty);
    E.maq(g);
    // la cabeza: de frente, gira a perfil (rayos X) y vuelve; tiembla con la alarma
    const xr = rayos(g), al = sube(g, T.salta, T.salta + 0.2) * (1 - sube(g, 29.5, 29.9));
    const sx = xr < 0.5 ? Math.cos(Math.PI * xr) : -Math.cos(Math.PI * xr);
    E.cabeza.setAttribute("transform", `translate(${f1(H[0] + al * 7 * Math.sin(vuelta(g, 19)))} ${H[1]})`);
    E.frente.setAttribute("transform", `scale(${Math.max(0.001, sx).toFixed(3)} 1)`);
    E.frente.style.display = xr < 0.5 ? "" : "none";
    E.perfil.setAttribute("transform", `scale(${Math.max(0.001, sx).toFixed(3)} 1)`);
    E.perfil.style.display = xr >= 0.5 ? "" : "none";
    E.cf(g);
    // lo que se enciende dentro del cerebro
    E.cp.luzM.setAttribute("opacity", f1(asoma(g, T.manda - 0.1, T.orden + 0.4)));
    E.cp.luzC.setAttribute("opacity", f1(asoma(g, T.copia + 0.7, 19.6) * (0.75 + 0.25 * Math.sin(vuelta(g, 2.5)))));
    E.cp.luzS.setAttribute("opacity", f1(asoma(g, T.esperaba - 0.1, T.resta + 0.6) * 0.8 + asoma(g, T.donde - 0.2, 29.7)));
    E.cp.tinte.setAttribute("opacity", f1(0.35 * asoma(g, T.salta, 29.6) * (0.7 + 0.3 * Math.sin(vuelta(g, 6)))));
    E.nv(g);
    E.me(g);
    E.ro(g, k);
    return { g, k };
  };
  return E;
}
