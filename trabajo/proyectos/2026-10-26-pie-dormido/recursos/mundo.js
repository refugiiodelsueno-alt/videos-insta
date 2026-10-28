// Lo que sale en todas las escenas: una pierna sentada de perfil, mirando a la derecha, con el muslo apoyado en el
// borde de una silla. Por dentro baja el nervio (cinco fibras de oro) con su arteria al lado. El borde de la silla lo
// aplasta en un punto (C): ahí se corta la sangre, ahí se callan las fibras y ahí, cuando vuelve la sangre, nacen los
// disparos falsos que el cerebro coloca en el pie como hormigas. Abajo, lo que le llega al cerebro, en directo.
// Todo en 2D, en un svg con la cámara dentro (un transform del grupo), para que de cerca se vea nítido.
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a";
export const F0 = { x: 640, y: 1430, z: 1.9 };                  // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma es el primero.
export const TOTAL = 49.86;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const f1 = (v) => v.toFixed(1);
// el azar que cambia a saltos (chispas, rayos) sale del segundo dentro del bucle: en TOTAL vuelve a ser el de 0
const salto = (g, porSeg) => Math.floor((((g % TOTAL) + TOTAL) % TOTAL) * porSeg + 1e-6);

// el segundo en que empieza cada escena (build/h1/index.html: cada una 0,3 s antes de que acabe la anterior)
export const G0 = { hook: 0, nervio: 8.76, despierta: 24.09, aguja: 37.1, cierre: 46.24 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  notas: 0.84, duerme: 1.68, pie: 2.2, no: 2.64, vienen: 2.8, pie2: 3.44,
  nacen: 4.2, arriba: 4.8, trozo: 5.84, nervio: 6.24, aplastado: 7.6,
  pierna: 9.04, nervio2: 10.08, miles: 10.92, fibras: 11.44, cerebro: 12.48, toca: 13.12, pie3: 13.52,
  sientas: 14.56, encima: 15.0, aplastas: 15.68, cortas: 16.56, sangre: 17.52,
  oxigeno: 18.64, fibras2: 19.52, callan: 20.0, pie4: 20.88, noticias: 21.84, dormido: 23.12,
  raro: 24.34, vuelve: 25.3, sangre2: 25.78, trozo2: 26.74, aplastado2: 26.98, recuperado: 28.34,
  disparan: 29.9, solas: 30.42, nada: 31.38, toque: 31.78,
  cerebro2: 32.78, aluvion: 33.78, avisos: 34.34, falsos: 34.74, coloca: 35.64, pie5: 36.2,
  y1980: 37.24, escucharon: 38.52, aguja: 39.4, nervio3: 40.36, trescientos: 41.56, disparos: 42.36, segundo: 43.0,
  nacidos: 43.76, nervio4: 44.44, no2: 45.08, piel: 45.48,
  nervio5: 46.6, despertandose: 47.04, asi: 48.52, sabes: 49.04,
};

// ── el sitio de cada cosa en el mundo ───────────────────────────────────────────────────────────────────────────
const SUELO = 1560;
const PIERNA = [[-760, 470], [560, 480], [690, 560], [702, 640], [650, 800], [620, 1100], [600, 1330], [612, 1400],
  [700, 1450], [850, 1508], [884, 1540], [852, 1560], [560, 1562], [470, 1555], [450, 1500], [470, 1420], [500, 1330],
  [470, 1100], [430, 900], [448, 770], [482, 722], [300, 712], [-760, 712]];
const NERVIO = [[-820, 650], [0, 655], [300, 664], [398, 676], [462, 704], [492, 790], [482, 950], [500, 1150],
  [520, 1330], [532, 1440], [620, 1515], [800, 1532]];
const C = [398, 676];                                            // donde el borde de la silla aplasta el nervio
const Q = [120, 1030], QR = 150;                                 // el corte del nervio, ampliado
const PUNTA = [C[0] + 2, C[1] - 2], EJE = [0.643, -0.766];       // la aguja: su punta y hacia dónde sale
const PIE = [690, 1500];                                         // el centro del pie, para las etiquetas
const N = 5;                                                     // fibras dibujadas

// ── lo que pasa con el tiempo (g, los segundos del vídeo entero) ────────────────────────────────────────────────
// de rayos X: la piel se vuelve casi transparente y se ven huesos, nervio y arteria
const rayos = (g) => sube(g, 2.7, 3.3) - sube(g, 46.4, 47.6);
// las chispas falsas en C: al principio y desde que disparan solas, hasta el final
const ecto = (g) => 1 - sube(g, 8.7, 9.2) + sube(g, 29.7, 30.3);
// el trozo aplastado: estrecho e irritado (se suelta mientras se explica el nervio sano)
const dent = (g) => 1 - sube(g, 8.7, 9.3) + sube(g, 15.0, 15.8);
const irrita = (g) => 1 - sube(g, 8.7, 9.2) + sube(g, 26.6, 27.4);
// la flecha de tu peso
const peso = (g) => sube(g, 7.3, 7.7) - sube(g, 8.55, 8.9) + sube(g, T.sientas, T.aplastas) - sube(g, T.vuelve, 25.9);
// la sangre que no pasa de C
const corte = (g) => sube(g, T.cortas, 17.6) - sube(g, T.vuelve, 26.3);
// cada fibra se calla por turnos
const calla = (g, i) => sube(g, 18.6 + 0.5 * i, 18.95 + 0.5 * i) - sube(g, T.vuelve, 25.8);
// los avisos de verdad, del pie al cerebro
const sano = (g) => sube(g, 11.9, 12.4) - sube(g, T.vuelve, 25.8);
// el pie azulado y dormido
const dormido = (g) => sube(g, 22.6, 23.4) - sube(g, T.vuelve, 26.0);
// las hormigas en el pie
const hormigas = (g) => 1 - sube(g, T.no, 3.2) + sube(g, 35.5, 36.3) - sube(g, 37.0, 37.6) + sube(g, 46.4, 47.2);
// la aguja: entra en C y sale
const aguja = (g) => sube(g, 38.9, T.aguja + 0.25) - sube(g, 45.6, 46.3);
// lo que le llega al cerebro: avisos por segundo (los de verdad y los falsos)
const silencio = (g) => { let s = 0; for (let i = 0; i < N; i++) s += calla(g, i); return s / N; };
const ritmoSano = (g) => 7 * sano(g) * (1 - silencio(g));
const ritmoFalso = (g) => 30 * ecto(g);

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0b0f15; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(5,7,10,0) 55%, rgba(5,7,10,0.62) 100%); }
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
const ANCHO = { x: 330, y: 1120, z: 0.62 };                      // la pierna entera
const CERCA = { x: 410, y: 700, z: 1.6 };                        // el trozo aplastado
const CAMINO = [
  [0, F0], [2.7, { x: 652, y: 1418, z: 2.02 }],                                                // hormigas en el pie
  [4.7, { x: 455, y: 760, z: 1.5 }], [7.7, { x: 420, y: 728, z: 1.62 }],                       // sube a C
  [8.9, ANCHO], [9.9, { x: 340, y: 1100, z: 0.64 }],                                            // la pierna y su nervio
  [11.0, { x: 400, y: 880, z: 0.96 }], [12.3, { x: 410, y: 900, z: 0.92 }],                    // miles de fibras
  [13.4, { x: 470, y: 1160, z: 0.8 }], [14.4, { x: 400, y: 700, z: 1.3 }],                     // lo que toca tu pie
  [16.4, { x: 405, y: 705, z: 1.32 }], [17.6, { x: 440, y: 900, z: 0.92 }],                    // tu peso, la sangre
  [18.6, { x: 420, y: 760, z: 1.25 }], [20.6, { x: 425, y: 770, z: 1.2 }],                     // se callan
  [21.6, { x: 540, y: 1120, z: 0.76 }], [23.0, { x: 600, y: 1260, z: 0.92 }], [24.2, { x: 610, y: 1280, z: 0.95 }],
  [25.3, { x: 430, y: 840, z: 0.95 }], [26.9, { x: 410, y: 715, z: 1.5 }],                     // vuelve la sangre
  [29.9, { x: 402, y: 690, z: 1.85 }], [31.4, { x: 410, y: 720, z: 1.55 }],                    // disparan solas
  [32.7, { x: 420, y: 1080, z: 0.72 }], [36.4, { x: 430, y: 1090, z: 0.74 }],                    // el aluvión, al pie
  [37.3, { x: 412, y: 690, z: 1.95 }], [41.0, { x: 406, y: 686, z: 2.05 }],                    // la aguja
  [43.8, { x: 470, y: 1140, z: 0.8 }], [45.8, { x: 480, y: 1150, z: 0.78 }],                   // en el nervio, no en la piel
  [47.2, { x: 590, y: 1300, z: 1.35 }], [TOTAL, F0],
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
const linea = (P) => "M" + P.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L");

const DEFS = `
<defs>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,190,140,0.2)"/><stop offset="0.5" stop-color="rgba(120,140,200,0.08)"/><stop offset="1" stop-color="rgba(120,140,200,0)"/></radialGradient>
  <radialGradient id="c-bola" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,214,170,0.2)"/><stop offset="1" stop-color="rgba(255,214,170,0)"/></radialGradient>
  <radialGradient id="c-sombra" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(0,0,0,0.6)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <pattern id="c-rejilla" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0.75H60M0.75 0V60" stroke="rgba(95,212,255,0.13)" stroke-width="1.5"/></pattern>
  <linearGradient id="c-suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a211b"/><stop offset="1" stop-color="#0d0b0a"/></linearGradient>
  <linearGradient id="c-madera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a45"/><stop offset="0.25" stop-color="#7a5134"/><stop offset="1" stop-color="#3f2a1c"/></linearGradient>
  <linearGradient id="c-pata" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a3122"/><stop offset="0.45" stop-color="#7a5235"/><stop offset="1" stop-color="#3a271a"/></linearGradient>
  <linearGradient id="c-muslo" gradientUnits="userSpaceOnUse" x1="0" y1="470" x2="0" y2="712"><stop offset="0" stop-color="#f6caa9"/><stop offset="0.35" stop-color="#e9b08f"/><stop offset="0.8" stop-color="#c98463"/><stop offset="1" stop-color="#a5634a"/></linearGradient>
  <linearGradient id="c-tibia" gradientUnits="userSpaceOnUse" x1="430" y1="0" x2="700" y2="0"><stop offset="0" stop-color="#a9664c"/><stop offset="0.3" stop-color="#d79a7a"/><stop offset="0.72" stop-color="#f2c2a2"/><stop offset="1" stop-color="#c78262"/></linearGradient>
  <linearGradient id="c-empeine" gradientUnits="userSpaceOnUse" x1="0" y1="1400" x2="0" y2="1562"><stop offset="0" stop-color="#f4c5a6"/><stop offset="0.55" stop-color="#e2a483"/><stop offset="1" stop-color="#a9654b"/></linearGradient>
  <linearGradient id="c-tela" gradientUnits="userSpaceOnUse" x1="0" y1="455" x2="0" y2="730"><stop offset="0" stop-color="#3f6db8"/><stop offset="0.5" stop-color="#2c5193"/><stop offset="1" stop-color="#1a3263"/></linearGradient>
  <linearGradient id="c-camisa" gradientUnits="userSpaceOnUse" x1="-760" y1="0" x2="-330" y2="0"><stop offset="0" stop-color="#2b3340"/><stop offset="0.6" stop-color="#4a5566"/><stop offset="1" stop-color="#2a313c"/></linearGradient>
  <linearGradient id="c-hueso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(232,246,255,0.95)"/><stop offset="1" stop-color="rgba(168,208,236,0.85)"/></linearGradient>
  <linearGradient id="c-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset="0.4" stop-color="#b9c3cf"/><stop offset="1" stop-color="#5d6774"/></linearGradient>
  <radialGradient id="c-azul" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(98,120,220,0.75)"/><stop offset="0.7" stop-color="rgba(98,120,220,0.45)"/><stop offset="1" stop-color="rgba(98,120,220,0)"/></radialGradient>
  <radialGradient id="c-halo-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,194,74,0.9)"/><stop offset="0.45" stop-color="rgba(255,194,74,0.3)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <radialGradient id="c-halo-r" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,96,80,0.95)"/><stop offset="0.45" stop-color="rgba(240,68,90,0.35)"/><stop offset="1" stop-color="rgba(240,68,90,0)"/></radialGradient>
  <radialGradient id="c-halo-b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.9)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
  <radialGradient id="c-halo-v" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(34,211,138,0.7)"/><stop offset="1" stop-color="rgba(34,211,138,0)"/></radialGradient>
  <radialGradient id="c-corte" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stop-color="#3a2a12"/><stop offset="1" stop-color="#1c140a"/></radialGradient>
</defs>`;

// ── el sitio: suelo, silla y una luz cálida; en rayos X, una rejilla ────────────────────────────────────────────
function fondo(padre) {
  el(padre, "rect", { x: -3000, y: -3000, width: 7000, height: 7000, fill: "#0b0f15" });
  el(padre, "ellipse", { cx: 430, cy: 950, rx: 1300, ry: 1300, fill: u("luz") });
  const rej = el(padre, "rect", { x: -3000, y: -3000, width: 7000, height: 7000, fill: u("rejilla"), opacity: 0 });
  el(padre, "rect", { x: -3000, y: SUELO, width: 7000, height: 2000, fill: u("suelo") });
  el(padre, "rect", { x: -3000, y: SUELO - 1, width: 7000, height: 3, fill: "rgba(255,220,190,0.12)" });
  // tablas del suelo
  for (let x = -1200; x < 2200; x += 260) el(padre, "path", { d: `M${x} ${SUELO + 2} L${x - 140} ${SUELO + 600}`, stroke: "rgba(0,0,0,0.35)", "stroke-width": 3 });
  el(padre, "ellipse", { cx: 670, cy: SUELO + 6, rx: 260, ry: 22, fill: u("sombra") });
  el(padre, "ellipse", { cx: 110, cy: SUELO + 6, rx: 420, ry: 26, fill: u("sombra") });
  const r = K.azar(23), motas = [];
  for (let i = 0; i < 16; i++) motas.push({ e: el(padre, "circle", { r: 30 + r() * 70, fill: u("bola") }), x: -500 + r() * 1700, y: -100 + r() * 1600, f: r(), w: r() * 6.28, a: 0.4 + r() * 0.6 });
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
function silla(padre) {
  const g = el(padre, "g");
  el(g, "rect", { x: -900, y: 752, width: 40, height: SUELO - 752, fill: u("pata") });
  el(g, "rect", { x: 350, y: 752, width: 42, height: SUELO - 752, fill: u("pata") });
  el(g, "rect", { x: -880, y: 1180, width: 1250, height: 24, rx: 8, fill: "#4a3122" });
  el(g, "rect", { x: -960, y: 716, width: 1374, height: 46, rx: 20, fill: u("madera") });
  el(g, "path", { d: "M-940 720 H396", stroke: "rgba(255,230,200,0.35)", "stroke-width": 3, "stroke-linecap": "round" });
  return g;
}

// ── la pierna: camisa, pantalón corto, piel con sus sombras y, en rayos X, los huesos ───────────────────────────
function pierna(padre) {
  const g = el(padre, "g");
  const piel = el(g, "g");
  el(piel, "path", { d: "M-780 480 C-790 200 -770 -200 -760 -700 L-330 -700 C-320 -200 -330 200 -360 482 Z", fill: u("camisa") });
  const cp = el(g, "clipPath", { id: `${PRE}pierna` });
  const dP = curva(PIERNA, true);
  el(cp, "path", { d: dP });
  el(piel, "path", { d: dP, fill: "#e0a383" });
  const dentro = el(piel, "g", { "clip-path": u("pierna") });
  el(dentro, "rect", { x: -800, y: 460, width: 1450, height: 262, fill: u("muslo") });
  el(dentro, "path", { d: "M560 640 C640 600 760 620 760 760 L760 1400 L400 1400 L400 760 C420 700 480 650 560 640 Z", fill: u("tibia") });
  el(dentro, "path", { d: "M440 1395 C520 1370 600 1380 640 1400 L900 1480 L900 1600 L400 1600 Z", fill: u("empeine") });
  // la luz por arriba del muslo y por delante de la espinilla; la rodilla, el tobillo y los dedos
  el(dentro, "path", { d: "M-760 486 C-200 482 300 486 560 494", fill: "none", stroke: "rgba(255,236,220,0.45)", "stroke-width": 16, "stroke-linecap": "round" });
  el(dentro, "path", { d: "M676 650 C666 760 640 900 628 1100 C620 1220 612 1300 606 1340", fill: "none", stroke: "rgba(255,232,214,0.32)", "stroke-width": 14, "stroke-linecap": "round" });
  el(dentro, "path", { d: "M452 780 C470 740 520 712 600 700", fill: "none", stroke: "rgba(120,60,40,0.35)", "stroke-width": 5, "stroke-linecap": "round" });
  el(dentro, "ellipse", { cx: 560, cy: 1400, rx: 26, ry: 20, fill: "rgba(150,80,58,0.35)" });
  el(dentro, "ellipse", { cx: 552, cy: 1395, rx: 16, ry: 11, fill: "rgba(255,226,206,0.35)" });
  [[800, 1508, 26], [830, 1520, 20], [852, 1530, 14]].forEach(([x, y, r]) =>
    el(dentro, "path", { d: `M${x - r} ${y + 4} C${x - r * 0.4} ${y - r * 0.6} ${x + r * 0.5} ${y - r * 0.5} ${x + r * 0.7} ${y + r * 0.5}`, fill: "none", stroke: "rgba(140,72,50,0.45)", "stroke-width": 3.5, "stroke-linecap": "round" }));
  el(dentro, "path", { d: "M858 1517 C868 1514 878 1520 880 1530 C872 1532 862 1528 858 1517 Z", fill: "rgba(255,240,232,0.75)" });
  el(dentro, "path", { d: "M520 1552 C620 1556 760 1556 846 1554", fill: "none", stroke: "rgba(90,40,26,0.35)", "stroke-width": 8, "stroke-linecap": "round" });
  // el pie dormido: un tinte frío desde el tobillo a los dedos
  el(piel, "path", { d: "M-780 455 C-300 450 0 452 168 462 C190 540 190 650 172 728 C0 732 -300 732 -780 730 Z", fill: u("tela") });
  el(piel, "path", { d: "M168 466 C186 540 186 650 170 724", fill: "none", stroke: "rgba(10,20,40,0.55)", "stroke-width": 6 });
  el(piel, "path", { d: "M-780 470 C-300 466 0 468 160 476", fill: "none", stroke: "rgba(160,190,240,0.35)", "stroke-width": 6 });
  // en rayos X: el contorno y los huesos
  const rx = el(g, "g", { opacity: 0 });
  el(rx, "path", { d: dP, fill: "rgba(95,212,255,0.06)", stroke: "rgba(95,212,255,0.75)", "stroke-width": 4 });
  const hueso = { fill: u("hueso"), stroke: "rgba(150,210,255,0.9)", "stroke-width": 3, opacity: 0.55 };
  el(rx, "path", { d: curva([[-760, 574], [200, 572], [480, 570], [560, 558], [612, 578], [622, 612], [596, 640], [540, 634], [480, 622], [200, 622], [-760, 624]], true), ...hueso });
  el(rx, "ellipse", { cx: 672, cy: 598, rx: 22, ry: 34, ...hueso });
  el(rx, "path", { d: curva([[556, 662], [640, 660], [628, 706], [606, 1000], [592, 1360], [606, 1392], [546, 1400], [548, 1362], [566, 1000], [566, 708]], true), ...hueso });
  el(rx, "path", { d: "M528 700 C524 900 524 1150 524 1376", fill: "none", stroke: "rgba(190,228,255,0.6)", "stroke-width": 13, "stroke-linecap": "round" });
  el(rx, "ellipse", { cx: 512, cy: 1500, rx: 50, ry: 36, ...hueso });
  el(rx, "ellipse", { cx: 570, cy: 1436, rx: 40, ry: 24, ...hueso });
  [[[600, 1452], [720, 1486], [836, 1522]], [[596, 1476], [716, 1508], [820, 1536]], [[590, 1500], [700, 1526], [790, 1546]]].forEach((P) =>
    el(rx, "path", { d: curva(P), fill: "none", stroke: "rgba(200,232,255,0.6)", "stroke-width": 11, "stroke-linecap": "round" }));
  const azul = el(g, "ellipse", { cx: 660, cy: 1440, rx: 330, ry: 260, fill: u("azul"), opacity: 0, "clip-path": u("pierna") });
  return (gg) => {
    const x = rayos(gg);
    piel.setAttribute("opacity", f1(1 - 0.78 * x));
    rx.setAttribute("opacity", f1(x));
    azul.setAttribute("opacity", (0.85 * dormido(gg) + 0.25 * corte(gg) * (1 - dormido(gg))).toFixed(2));
  };
}

// ── el nervio, sus cinco fibras y la arteria, con lo que corre por ellos ────────────────────────────────────────
function nervio(padre) {
  const g = el(padre, "g", { opacity: 0 });
  // el camino del nervio, medido: puntos cada pocos px con su normal
  const guia = el(g, "path", { d: curva(NERVIO), fill: "none", stroke: "none" });
  const L = guia.getTotalLength(), M = 420, P = [];
  for (let j = 0; j <= M; j++) { const p = guia.getPointAtLength((L * j) / M); P.push([p.x, p.y]); }
  const NO = P.map((p, j) => { const a = P[Math.max(0, j - 1)], b = P[Math.min(M, j + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
  let jc = 0, best = 1e9;
  P.forEach((p, j) => { const d = Math.hypot(p[0] - C[0], p[1] - C[1]); if (d < best) { best = d; jc = j; } });
  const sC = (L * jc) / M;
  const en = (s, off = 0) => { const j = Math.min(M, Math.max(0, Math.round((s / L) * M))); return [P[j][0] + NO[j][0] * off, P[j][1] + NO[j][1] * off]; };
  // cuánto se estrecha el haz en el trozo aplastado
  const pinza = (j, d) => 1 - 0.68 * d * Math.exp(-((((j - jc) * L) / M / 34) ** 2));
  const tramo = (a, b, off) => { const Q = []; for (let j = a; j <= b; j++) Q.push([P[j][0] + NO[j][0] * off, P[j][1] + NO[j][1] * off]); return linea(Q); };

  // la arteria (por encima del nervio en el muslo, por delante en la pantorrilla)
  const ART = -34;
  el(g, "path", { d: tramo(0, M, ART), fill: "none", stroke: "#6a1020", "stroke-width": 20, "stroke-linecap": "round" });
  el(g, "path", { d: tramo(0, M, ART), fill: "none", stroke: "#d02c40", "stroke-width": 13, "stroke-linecap": "round" });
  const sinSangre = el(g, "path", { d: tramo(jc, M, ART), fill: "none", stroke: "#3a2a58", "stroke-width": 15, "stroke-linecap": "round", opacity: 0 });
  const gotas = [];
  for (let k = 0; k < 34; k++) gotas.push(el(g, "ellipse", { rx: 7, ry: 4, fill: "#ff8a8a", opacity: 0 }));
  // el nervio: la vaina y las fibras
  const vaina = el(g, "path", { fill: "none", stroke: "rgba(255,194,74,0.2)", "stroke-width": 46, "stroke-linecap": "round", "stroke-linejoin": "round" });
  const fibras = [], apagadas = [];
  for (let i = 0; i < N; i++) {
    fibras.push(el(g, "path", { fill: "none", stroke: "#f4c25a", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    apagadas.push(el(g, "path", { fill: "none", stroke: "#5c6370", "stroke-width": 5.5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }));
  }
  let dHecho = -1;
  const dibujaHaz = (d) => {
    const dd = Math.round(d * 50) / 50;
    if (dd === dHecho) return;
    dHecho = dd;
    const ancho = (j) => pinza(j, dd);
    const V = []; for (let j = 0; j <= M; j++) V.push(P[j]);
    vaina.setAttribute("d", linea(V));
    vaina.setAttribute("stroke-width", f1(46 - 18 * dd));
    for (let i = 0; i < N; i++) {
      const off = (i - (N - 1) / 2) * 6.6, Qf = [], Qa = [];
      for (let j = 0; j <= M; j++) Qf.push([P[j][0] + NO[j][0] * off * ancho(j), P[j][1] + NO[j][1] * off * ancho(j)]);
      for (let j = 0; j <= jc; j++) Qa.push(Qf[j]);
      fibras[i].setAttribute("d", linea(Qf));
      apagadas[i].setAttribute("d", linea(Qa));
    }
  };
  // el trozo aplastado: un brillo rojo de irritación y las chispas falsas
  const irr = el(g, "ellipse", { cx: C[0], cy: C[1], rx: 70, ry: 44, fill: u("halo-r"), opacity: 0 });
  const halo = el(g, "circle", { cx: C[0], cy: C[1], r: 120, fill: u("halo-o"), opacity: 0 });
  const rayitos = [0, 1, 2, 3].map(() => el(g, "path", { fill: "none", stroke: "#fff4c8", "stroke-width": 3.5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }));
  // los avisos: blancos y de verdad desde el pie, rojos y falsos desde C
  const mk = (halo, r, col) => ({ h: el(g, "circle", { r: r * 3, fill: u(halo), opacity: 0 }), c: el(g, "circle", { r, fill: col, opacity: 0 }) });
  const buenos = [], falsos = [];
  for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) buenos.push({ i, k, ...mk("halo-b", 6.5, "#ffffff") });
  for (let i = 0; i < N; i++) for (let k = 0; k < 6; k++) falsos.push({ i, k, ...mk("halo-r", 7, "#ffe2a0") });
  const pon = (o, x, y, a) => {
    if (a < 0.01) { o.c.setAttribute("opacity", 0); o.h.setAttribute("opacity", 0); return; }
    o.c.setAttribute("cx", f1(x)); o.c.setAttribute("cy", f1(y)); o.c.setAttribute("opacity", a.toFixed(2));
    o.h.setAttribute("cx", f1(x)); o.h.setAttribute("cy", f1(y)); o.h.setAttribute("opacity", (0.8 * a).toFixed(2));
  };
  const offF = (i, s) => { const j = Math.round((s / L) * M); return (i - (N - 1) / 2) * 6.6 * pinza(Math.min(M, Math.max(0, j)), dHecho); };

  const paso = (gg) => {
    g.setAttribute("opacity", f1(rayos(gg)));
    const d = dent(gg), e = ecto(gg), ir = irrita(gg);
    dibujaHaz(d);
    for (let i = 0; i < N; i++) {
      const c = calla(gg, i);
      fibras[i].setAttribute("stroke", c > 0.5 ? "#8a7a52" : "#f4c25a");
      fibras[i].setAttribute("opacity", (1 - 0.45 * c).toFixed(2));
      apagadas[i].setAttribute("opacity", c.toFixed(2));
    }
    // la sangre: de arriba abajo, sin pasar de C mientras está cortada
    const co = corte(gg);
    sinSangre.setAttribute("opacity", (0.85 * co).toFixed(2));
    gotas.forEach((o, k) => {
      const p = (ciclo(gg, 0.16) + k / gotas.length) % 1, s = p * L, [x, y] = en(s, ART);
      const j = Math.min(M, Math.round(p * M)), a = NO[j];
      const pasa = s > sC + 10 ? 1 - co : 1;
      o.setAttribute("cx", f1(x)); o.setAttribute("cy", f1(y));
      o.setAttribute("transform", `rotate(${f1((Math.atan2(a[0], -a[1]) * 180) / Math.PI)} ${f1(x)} ${f1(y)})`);
      o.setAttribute("opacity", (0.85 * pasa * Math.min(1, p * 12, (1 - p) * 12)).toFixed(2));
    });
    // los avisos de verdad suben del pie (s = L) hacia el cerebro (s = 0); en C se paran si su fibra está callada
    const sa = sano(gg);
    buenos.forEach((o) => {
      const p = (ciclo(gg, 0.24) + o.k / 3 + o.i * 0.19) % 1, s = L * (1 - p);
      const muere = s < sC ? calla(gg, o.i) : calla(gg, o.i) * sube(gg, 21.0, 22.0);
      const [x, y] = en(s, offF(o.i, s));
      pon(o, x, y, sa * (1 - muere) * Math.min(1, p * 10, (1 - p) * 10));
    });
    // los falsos nacen en C y suben, deprisa
    falsos.forEach((o) => {
      const p = (ciclo(gg, 0.95) + o.k / 6 + o.i * 0.137) % 1, s = sC * (1 - p);
      const [x, y] = en(s, offF(o.i, s));
      pon(o, x, y, e * Math.min(1, p * 14, (1 - p) * 6));
    });
    irr.setAttribute("opacity", (ir * (0.55 + 0.25 * Math.sin(vuelta(gg, 1.4)))).toFixed(2));
    halo.setAttribute("opacity", (e * (0.55 + 0.3 * Math.sin(vuelta(gg, 7)) * Math.sin(vuelta(gg, 3)))).toFixed(2));
    // los chispazos cambian 15 veces por segundo
    const r = K.azar(1 + salto(gg, 15));
    rayitos.forEach((ry) => {
      if (e < 0.05 || r() < 0.3) { ry.setAttribute("opacity", 0); r(); return; }
      const a = r() * 6.283, len = 40 + r() * 50, Q = [[C[0], C[1]]];
      for (let k = 1; k <= 4; k++) { const t = (len * k) / 4; Q.push([C[0] + Math.cos(a) * t + (r() - 0.5) * 22, C[1] + Math.sin(a) * t * 0.7 + (r() - 0.5) * 22]); }
      ry.setAttribute("d", linea(Q));
      ry.setAttribute("opacity", (e * (0.5 + 0.5 * r())).toFixed(2));
    });
  };
  return { paso, en, L, sC, P, NO };
}

// ── el corte del nervio, ampliado: miles de fibras (aquí 90), cada una con su vaina de mielina ──────────────────
function corteNervio(padre, nv) {
  const g = el(padre, "g", { opacity: 0 });
  const [nx, ny] = nv.en(nv.L * 0.47);
  const guia = el(g, "path", { d: `M${f1(nx)} ${f1(ny)} L${Q[0] + QR * 0.86} ${Q[1] - QR * 0.5}`, stroke: "rgba(255,194,74,0.7)", "stroke-width": 3, "stroke-dasharray": "8 8" });
  el(g, "circle", { cx: nx, cy: ny, r: 26, fill: "none", stroke: "rgba(255,194,74,0.8)", "stroke-width": 3 });
  const lupa = el(g, "g", { transform: `translate(${Q[0]} ${Q[1]})` });
  el(lupa, "circle", { r: QR + 10, fill: "rgba(11,14,20,0.94)", stroke: "rgba(255,194,74,0.8)", "stroke-width": 4 });
  el(lupa, "circle", { r: QR - 4, fill: u("corte") });
  const luces = [];
  for (let k = 0; k < 90; k++) {
    const rr = (QR - 18) * Math.sqrt((k + 0.5) / 90), a = k * 2.39996, x = rr * Math.cos(a), y = rr * Math.sin(a);
    el(lupa, "circle", { cx: f1(x), cy: f1(y), r: 9.5, fill: "#f6e7c4", stroke: "rgba(255,250,236,0.9)", "stroke-width": 2 });
    el(lupa, "circle", { cx: f1(x), cy: f1(y), r: 4.5, fill: "#d9952e" });
    luces.push(el(lupa, "circle", { cx: f1(x), cy: f1(y), r: 13, fill: u("halo-b"), opacity: 0 }));
  }
  return (gg) => {
    const a = asoma(gg, T.miles - 0.1, 14.0);
    g.setAttribute("opacity", a.toFixed(2));
    g.style.display = a < 0.005 ? "none" : "";
    if (a < 0.005) return;
    lupa.setAttribute("transform", `translate(${Q[0]} ${Q[1]}) scale(${(0.6 + 0.4 * K.sale(Math.min(1, a))).toFixed(3)})`);
    guia.setAttribute("opacity", a.toFixed(2));
    const sa = sano(gg), r = K.azar(7 + salto(gg, 8));
    luces.forEach((l) => l.setAttribute("opacity", (r() < 0.22 ? sa * (0.5 + 0.5 * r()) : 0).toFixed(2)));
  };
}

// ── las hormigas y los pinchazos del pie ────────────────────────────────────────────────────────────────────────
function hormiga(padre) {
  const g = el(padre, "g");
  const patas = [-1, 0, 1].map((k) => [-1, 1].map((s) => el(g, "path", { fill: "none", stroke: "#1a0e08", "stroke-width": 1.8, "stroke-linecap": "round" })));
  el(g, "ellipse", { cx: -9, cy: 0, rx: 7.5, ry: 5.5, fill: "#24130a" });
  el(g, "ellipse", { cx: 0, cy: 0, rx: 4.2, ry: 3.4, fill: "#2e190d" });
  el(g, "ellipse", { cx: 7, cy: 0, rx: 4.6, ry: 4.2, fill: "#24130a" });
  el(g, "ellipse", { cx: -10, cy: -2, rx: 3, ry: 1.6, fill: "rgba(255,220,190,0.35)" });
  el(g, "path", { d: "M10 -2 C14 -6 17 -7 19 -6 M10 2 C14 6 17 7 19 6", fill: "none", stroke: "#1a0e08", "stroke-width": 1.4, "stroke-linecap": "round" });
  return (fase) => {
    patas.forEach((par, k) => par.forEach((p, n) => {
      const s = n ? 1 : -1, sw = Math.sin(fase + (k + n) * Math.PI) * 4, x0 = -1 + k * 3;
      p.setAttribute("d", `M${x0} 0 L${f1(x0 + k * 3 + sw)} ${s * 6} L${f1(x0 + k * 4 + sw * 1.4)} ${s * 10}`);
    }));
  };
}
function pieVivo(padre) {
  const g = el(padre, "g", { "clip-path": u("pierna") });
  const rutas = [[490, 1440, 0.2], [520, 1512, -0.12], [600, 1480, 0.35], [640, 1528, -0.08], [700, 1488, 0.3], [560, 1350, 1.3],
    [585, 1270, 1.6], [520, 1395, 0.6], [740, 1530, 0.05], [660, 1442, 0.45], [545, 1462, -0.35], [612, 1408, 0.9], [770, 1508, 0.22], [500, 1300, 1.45]];
  const ants = rutas.map(([x, y, a], i) => {
    const grp = el(g, "g", { opacity: 0 });
    return { grp, patas: hormiga(grp), x, y, a, off: (i * 0.377) % 1 };
  });
  const r = K.azar(31);
  const pinchos = [];
  for (let i = 0; i < 12; i++) {
    const p = el(g, "path", { d: "M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z", fill: "#fff6d8", opacity: 0 });
    pinchos.push({ p, x: 500 + r() * 340, y: 1300 + r() * 240, off: r() });
  }
  return (gg) => {
    const h = hormigas(gg);
    g.style.display = h < 0.005 ? "none" : "";
    if (h < 0.005) return;
    ants.forEach((o) => {
      const p = (ciclo(gg, 0.3) + o.off) % 1, x = o.x + Math.cos(o.a) * 110 * p, y = o.y + Math.sin(o.a) * 110 * p;
      const zig = 0.18 * Math.sin(vuelta(gg, 1.1) + o.off * 9);
      o.grp.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(((o.a + zig) * 180) / Math.PI)}) scale(1.15)`);
      o.grp.setAttribute("opacity", (h * Math.min(1, p * 6, (1 - p) * 6)).toFixed(2));
      o.patas(vuelta(gg, 6) + o.off * 6.283);
    });
    pinchos.forEach((o) => {
      const p = (ciclo(gg, 1.2) + o.off) % 1, k = p < 0.35 ? Math.sin((Math.PI * p) / 0.35) : 0;
      o.p.setAttribute("transform", `translate(${o.x} ${o.y}) scale(${(0.4 + 0.8 * k).toFixed(2)}) rotate(${f1(p * 90)})`);
      o.p.setAttribute("opacity", (h * k * 0.9).toFixed(2));
    });
  };
}

// ── lo demás del mundo: la flecha del peso, el toque del suelo, el «Zzz», la flecha al pie y la aguja ───────────
function extras(padre) {
  const g = el(padre, "g");
  const fl = el(g, "g", { opacity: 0 });
  el(fl, "path", { d: "M398 352 L398 420", stroke: "#fff", "stroke-width": 16, "stroke-linecap": "round" });
  el(fl, "path", { d: "M366 412 L398 456 L430 412 Z", fill: "#fff", stroke: "#fff", "stroke-width": 6, "stroke-linejoin": "round" });
  const ondas = [0, 1, 2].map(() => el(g, "ellipse", { fill: "none", stroke: "#ffffff", "stroke-width": 4, opacity: 0 }));
  const zs = [0, 1, 2].map((i) => {
    const t = el(g, "text", { "font-family": "Figtree, sans-serif", "font-weight": 800, "font-size": 58 - i * 10, fill: "#a9b8ff", opacity: 0 });
    t.textContent = "z";
    return t;
  });
  const dA = curva([[-300, 560], [100, 360], [560, 330], [840, 620], [900, 1100], [790, 1400]]);
  const arco = el(g, "path", { d: dA, fill: "none", stroke: "rgba(255,120,110,0.95)", "stroke-width": 9, "stroke-linecap": "round", pathLength: 1000, "stroke-dasharray": "0 1000", opacity: 0 });
  const arcoH = el(g, "path", { d: dA, fill: "none", stroke: "rgba(255,96,80,0.25)", "stroke-width": 30, "stroke-linecap": "round", pathLength: 1000, "stroke-dasharray": "0 1000", opacity: 0 });
  const punta = el(g, "path", { d: "M-24 -18 L14 0 L-24 18 Z", fill: "#ff786e", opacity: 0 });
  // la aguja: punta en C, sale hacia arriba a la derecha; con su cono de plástico y su cable
  const ag = el(g, "g", { opacity: 0 });
  const ang = (Math.atan2(EJE[1], EJE[0]) * 180) / Math.PI;
  const cuerpo = el(ag, "g");
  el(cuerpo, "path", { d: "M0 0 L26 -2.2 L560 -3.4 L560 3.4 L26 2.2 Z", fill: u("metal"), stroke: "rgba(40,48,58,0.6)", "stroke-width": 0.8 });
  el(cuerpo, "path", { d: "M30 -1.4 L560 -2.2", stroke: "rgba(255,255,255,0.9)", "stroke-width": 1 });
  el(cuerpo, "path", { d: "M560 -9 L600 -16 L700 -16 L700 16 L600 16 L560 9 Z", fill: "#2f7cf6", stroke: "#1b4ea8", "stroke-width": 2 });
  el(cuerpo, "path", { d: "M700 0 C780 0 820 40 900 30 C980 20 1040 -40 1200 -30", fill: "none", stroke: "#e8ecf2", "stroke-width": 5 });
  const chispa = el(ag, "circle", { cx: 0, cy: 0, r: 30, fill: u("halo-b"), opacity: 0 });
  return {
    ag,
    paso(gg) {
      fl.setAttribute("opacity", peso(gg).toFixed(2));
      fl.setAttribute("transform", `translate(0 ${f1(-26 * (1 - peso(gg)) + 6 * Math.sin(vuelta(gg, 1.5)) * peso(gg))})`);
      // el pie toca el suelo
      const t = asoma(gg, 12.9, 14.2);
      ondas.forEach((o, i) => {
        const p = (ciclo(gg, 1.6) + i / 3) % 1;
        o.setAttribute("cx", 680); o.setAttribute("cy", SUELO);
        o.setAttribute("rx", f1(40 + 160 * p)); o.setAttribute("ry", f1(8 + 26 * p));
        o.setAttribute("opacity", (t * 0.8 * (1 - p)).toFixed(2));
      });
      const dz = asoma(gg, T.dormido - 0.2, 24.6);
      zs.forEach((z, i) => {
        const p = (ciclo(gg, 0.45) + i / 3) % 1;
        z.setAttribute("x", f1(780 + 70 * p + 18 * Math.sin(vuelta(gg, 0.9) + i)));
        z.setAttribute("y", f1(1400 - 230 * p));
        z.setAttribute("opacity", (dz * Math.sin(Math.PI * p)).toFixed(2));
      });
      // los avisos falsos vuelven al pie
      const rev = K.suave(K.tramo(gg, 35.0, 35.95)), fa = 1 - sube(gg, 36.6, 37.0);
      const on = rev > 0.001 && fa > 0.001;
      [arco, arcoH].forEach((a) => { a.setAttribute("stroke-dasharray", `${f1(1000 * rev)} 1000`); a.setAttribute("opacity", on ? fa.toFixed(2) : 0); });
      if (on) {
        const L = arco.getTotalLength(), q = arco.getPointAtLength(L * rev), q0 = arco.getPointAtLength(Math.max(0, L * rev - 6));
        punta.setAttribute("transform", `translate(${f1(q.x)} ${f1(q.y)}) rotate(${f1((Math.atan2(q.y - q0.y, q.x - q0.x) * 180) / Math.PI)})`);
        punta.setAttribute("opacity", fa.toFixed(2));
      } else punta.setAttribute("opacity", 0);
      // la aguja entra y sale por su eje
      const a = aguja(gg), fuera = (1 - K.suave(a)) * 620;
      ag.setAttribute("opacity", Math.min(1, a * 3).toFixed(2));
      ag.style.display = a < 0.002 ? "none" : "";
      ag.setAttribute("transform", `translate(${f1(PUNTA[0] + EJE[0] * fuera)} ${f1(PUNTA[1] + EJE[1] * fuera)}) rotate(${f1(ang)})`);
      chispa.setAttribute("opacity", (a > 0.98 ? 0.55 + 0.4 * Math.sin(vuelta(gg, 9)) : 0).toFixed(2));
    },
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
  const r = (html, clase, sitio, on, tch) => L.push({ e: etiqueta(capa, html + (tch ? `<i class="tacha" data-layout-allow-occlusion></i>` : ""), clase), sitio, on, tch });
  const MEDIO = [PUNTA[0] + EJE[0] * 230, PUNTA[1] + EJE[1] * 230];
  // hook
  r(`no vienen <b>de tu pie</b>`, "r g", () => [540, 720], (g) => asoma(g, T.no - 0.05, 4.0));
  r(`nacen <b>más arriba</b>`, "o", (k) => junto(k, C, 0, -170), (g) => asoma(g, T.arriba - 0.1, 7.25));
  r(`nervio <b>aplastado</b>`, "r", (k) => junto(k, C, 0, -170), (g) => asoma(g, T.aplastado, 8.55));
  // nervio
  r(`<b>nervio</b>`, "o", (k) => junto(k, [492, 1000], 150, 0), (g) => asoma(g, T.nervio2, 10.75));
  r(`miles de <b>fibras</b>`, "o", (k) => junto(k, Q, 0, -(QR + 70) * k.z), (g) => asoma(g, T.miles + 0.1, 13.9));
  r(`lo que <b>toca tu pie</b>`, "", (k) => junto(k, [700, SUELO], 0, -230), (g) => asoma(g, T.toca, 14.15));
  r(`tu <b>peso</b>`, "", (k) => junto(k, [398, 400], 190, 0), (g) => asoma(g, T.encima, 17.0));
  r(`le cortas la <b>sangre</b>`, "r", (k) => junto(k, [560, 960], 210, 0), (g) => asoma(g, T.cortas + 0.1, 18.35));
  r(`sin <b>oxígeno</b>`, "c", (k) => junto(k, C, 0, -160), (g) => asoma(g, T.oxigeno, 20.6));
  r(`<b>sin noticias</b>`, "c g", () => [540, 1240], (g) => asoma(g, T.noticias, 23.0));
  r(`pie <b>dormido</b>`, "c", (k) => junto(k, PIE, -40, -250), (g) => asoma(g, T.dormido, 24.4));
  // despierta
  r(`vuelve la <b>sangre</b>`, "r", (k) => junto(k, [560, 960], 200, 0), (g) => asoma(g, T.vuelve, 26.6));
  r(`aún <b>sin recuperar</b>`, "r", (k) => junto(k, C, 0, -170), (g) => asoma(g, T.trozo2 + 0.2, 29.55));
  r(`disparan <b>solas</b>`, "o g", () => [540, 1240], (g) => asoma(g, T.disparan, 31.2));
  r(`y nada las <b>toca</b>`, "", () => [540, 1240], (g) => asoma(g, T.nada, 32.45));
  r(`avisos <b>falsos</b>`, "r g", () => [540, 1250], (g) => asoma(g, T.avisos, 35.3));
  r(`→ en el <b>pie</b>`, "r", (k) => junto(k, PIE, 0, -230), (g) => asoma(g, T.coloca, 36.85));
  // aguja
  r(`<b>1980</b><small>una aguja dentro del nervio</small>`, "g", () => [540, 640], (g) => asoma(g, T.y1980, 39.1));
  r(`<b>aguja</b>`, "", (k) => junto(k, MEDIO, 40, 50), (g) => asoma(g, T.aguja + 0.15, 41.25));
  const cuenta = { e: etiqueta(capa, `hasta <b>0</b> por segundo`, "o g"), sitio: () => [540, 1240], on: (g) => asoma(g, T.trescientos - 0.1, 43.55) };
  L.push(cuenta);
  r(`en el <b>nervio</b>`, "v", (k) => junto(k, C, 0, -150), (g) => asoma(g, T.nervio4, 46.2));
  r(`en la <b>piel</b>`, "", (k) => junto(k, PIE, 0, -200), (g) => asoma(g, T.no2, 46.2), T.piel);
  // cierre
  r(`tu nervio, <b>despertándose</b>`, "v g", () => [540, 720], (g) => asoma(g, T.nervio5 - 0.1, 48.3));
  const nb = cuenta.e.querySelector("b");
  let ultimo = "";
  return (g, k) => {
    const n = String(Math.round(300 * K.sale(K.tramo(g, T.trescientos - 0.05, T.disparos + 0.25))));
    if (n !== ultimo) { nb.textContent = n; ultimo = n; }
    L.forEach((l) => {
      const [x, y] = l.sitio(k);
      pon(l.e, x, y, l.on(g));
      if (l.tch) tacha(l.e, g, l.tch);
    });
  };
}

// ── abajo, lo que le llega al cerebro: un trazo de 2 s que corre, con cada aviso como un pico ───────────────────
function medidor(capa) {
  const m = K.crear(capa, `<div class="c-medidor"><span>al cerebro</span><i class="luz"></i>
    <svg width="510" height="76" viewBox="0 0 510 76" aria-hidden="true"><path class="base" d="M0 38 H510" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
    <path class="traza" fill="none" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/></svg></div>`);
  const t1 = m.querySelector("span"), luz = m.querySelector(".luz"), traza = m.querySelector(".traza");
  const HUECOS = Math.round(TOTAL * 40), DT = TOTAL / HUECOS, VENT = 2, ANCHO_T = 500;
  const pico = (j) => { const x = Math.sin(j * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  return (g) => {
    const on = asoma(g, 4.4, 46.4);
    m.style.opacity = on.toFixed(2);
    if (on < 0.005) return;
    const ag = asoma(g, 37.3, 45.8);
    const quien = ag > 0.5 ? "la aguja" : "al cerebro";
    if (t1.textContent !== quien) t1.textContent = quien;
    t1.style.opacity = Math.abs(1 - 2 * ag).toFixed(2);
    // cada hueco de 1/40 s, con su azar fijo, tiene un pico si toca por el ritmo de ese segundo
    const j1 = Math.floor(g / DT), j0 = j1 - Math.ceil(VENT / DT);
    let d = "M0 38", fuerte = 0;
    for (let j = j0; j <= j1; j++) {
      const tj = j * DT, jj = ((j % HUECOS) + HUECOS) % HUECOS, tw = jj * DT;
      const x = ANCHO_T * (1 - (g - tj) / VENT) + 4;
      if (x < 0) continue;
      const rs = ritmoSano(tw), rf = ritmoFalso(tw), a = pico(jj), b = pico(jj + 7777);
      const esF = a < (rf * DT), esS = !esF && b < rs * DT;
      if (esF || esS) {
        const h = esF ? 14 + 18 * pico(jj + 333) : 22;
        d += ` L${f1(x - 3)} 38 L${f1(x - 1)} ${f1(38 - h)} L${f1(x + 1.5)} ${f1(38 + h * 0.45)} L${f1(x + 3.5)} 38`;
        if (g - tj < 0.6) fuerte += esF ? 1 : 0.5;
      }
    }
    traza.setAttribute("d", d + ` L${ANCHO_T + 4} 38`);
    const f = ecto(g);
    traza.setAttribute("stroke", f > 0.5 ? "#ff8a6a" : "#ffffff");
    luz.style.opacity = (Math.min(1, fuerte / 6) * (0.5 + 0.5 * Math.sin(vuelta(g, 11)))).toFixed(2);
    luz.style.background = f > 0.5 ? ROJO : VERDE;
    const t = 6 * f * sube(g, T.aluvion - 0.2, T.aluvion + 0.3) * (1 - sube(g, 36.4, 37.0));
    m.style.transform = `translate(${f1(t * Math.sin(vuelta(g, 13)))}px, ${f1(t * 0.6 * Math.sin(vuelta(g, 17) + 1))}px)`;
    m.style.borderColor = f > 0.5 ? "rgba(240,68,90,0.6)" : "rgba(255,255,255,0.18)";
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
  silla(cam);
  const pi = pierna(cam);
  const nv = nervio(cam);
  const pv = pieVivo(cam);
  const cn = corteNervio(cam, nv);
  const ex = extras(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const me = medidor(capa), ro = rotulos(capa);
  return { cam, fo, pi, nv, pv, cn, ex, me, ro };
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
    E.pi(g);
    E.nv.paso(g);
    E.pv(g);
    E.cn(g);
    E.ex.paso(g);
    E.me(g);
    E.ro(g, k);
    return { g, k };
  };
  return E;
}
