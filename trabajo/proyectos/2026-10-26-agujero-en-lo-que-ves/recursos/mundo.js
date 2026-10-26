// Lo que sale en todas las escenas, en un solo mundo 2D: la lámina de la prueba (rayas, una cruz blanca y un punto
// rojo, del tamaño exacto de la pantalla, para que la prueba funcione de verdad), con el agujero rasgado del punto
// ciego; a su derecha, un ojo cortado por la mitad con su nervio y, en el punto ciego, la retina de cerca; luego un
// cielo de noche con la luna; las dos vistas de los dos ojos; y el ojo del pulpo encima del nuestro.
// Todo con la cámara dentro del svg (un transform del grupo).
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CIAN = "#5fd4ff", ORO = "#ffc24a", ROJO = "#f0445a", VERDE = "#22d38a", NARANJA = "#ff8a3d";
// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma empalma con el primero.
export const TOTAL = 54.31;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const pico = (g, t, sub = 0.08, baja = 0.5) => K.sale(K.tramo(g, t, t + sub)) * (1 - K.suave(K.tramo(g, t + sub, t + baja)));

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, prueba: 4.5, ojo: 18.68, cielo: 28.58, ojos: 33.86, pulpo: 41.38, cierre: 49.8 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  agujero: 1.12, cerebro: 2.72, tapando: 3.52,
  tapate: 4.53, izquierdo: 5.2, mira: 6.08, cruz: 7.2, acercate: 7.78, despacio: 8.78,
  palmo: 10.58, punto: 11.78, desaparece: 12.42, negro: 14.64, rayas: 15.84, inventa: 17.12,
  ciego: 19.52, nervio: 21.36, sale: 22.16, juntan: 23.76, millon: 24.4, cables: 24.84, queda: 26.24, luz: 27.84,
  enorme: 29.0, cielo: 30.08, diez: 31.28, fila: 32.44,
  cada: 34.8, tapa: 35.4, otro: 36.32, cerrado: 37.44, rellena: 38.64, alrededor: 40.16,
  pulpo: 41.52, detras: 44.4, retina: 45.04, nuestro: 46.08, delante: 47.04, atravesarla: 48.16,
  ahora: 50.32, trozo: 51.36, inventando: 52.8,
};

// ── la lámina: la pantalla de 1080 × 1920, tal cual ────────────────────────────────────────────────────────────────
const CRUZ = [190, 960], PUNTO = [900, 960];
const HRX = 150, HRY = 200;               // el agujero del punto ciego, más alto que ancho, como el de verdad
// lo abierto que está el agujero (1 abierto, 0 tapado del todo)
const abierto = (g) => {
  if (g < G0.prueba) return 1 - sube(g, T.tapando - 0.1, T.tapando + 0.85);
  if (g < G0.cierre) return 0;
  return K.sale(K.tramo(g, T.inventando + 0.05, T.inventando + 0.75));
};
// el desplazamiento de las rayas: corren a velocidad fija en el hook y en el cierre, y están quietas en la prueba
const VR = 120 / (G0.prueba + TOTAL - G0.cierre);
const deriva = (g) => VR * (Math.min(g, G0.prueba) + Math.max(0, g - G0.cierre));

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
// el ojo grande y su retina de cerca (CS: lo de cerca se dibuja CS veces más pequeño, pegado a la pared del fondo)
const OJO = [3000, 1000], OR = 380, CS = 0.2, CC = [OJO[0] + OR - 240 * CS, OJO[1]];
const CIELO = [6000, 1000], VISTAS = [9000, 1000], PULPO = [12000, 760], HUMANO = [12000, 1290];
export const F0 = { x: PUNTO[0], y: 985, z: 1.6 };       // el encuadre del fotograma 0 (y del último): el agujero
const LAMINA = { x: 540, y: 1000, z: 1 };                 // la pantalla tal cual: la prueba de verdad
const CAMINO = [
  [0, F0], [2.2, { x: 902, y: 978, z: 1.72 }], [3.5, { x: 902, y: 975, z: 1.78 }], [4.49, { x: 880, y: 980, z: 1.6 }], // el agujero
  [4.5, LAMINA], [18.67, LAMINA],                                                                                    // corte: la prueba, quieta
  [18.68, { x: 3000, y: 1000, z: 1.0 }], [21.2, { x: 3040, y: 1000, z: 1.06 }], [23.5, { x: 3120, y: 1000, z: 1.16 }], // corte: el ojo
  [24.25, { x: 3290, y: 1000, z: 2.6 }], [25.0, { x: CC[0] + 12, y: 1000, z: 5.0 }], [28.57, { x: CC[0] + 14, y: 1000, z: 5.3 }],
  [28.58, { x: CIELO[0], y: 1020, z: 1.0 }], [33.85, { x: CIELO[0], y: 1000, z: 1.07 }],                              // corte: el cielo
  [33.86, { x: VISTAS[0], y: 1000, z: 1.0 }], [36.4, { x: VISTAS[0], y: 1000, z: 1.12 }], [41.37, { x: VISTAS[0], y: 1000, z: 1.2 }], // corte: los dos ojos
  [41.38, { x: PULPO[0], y: PULPO[1], z: 1.3 }], [45.3, { x: PULPO[0], y: PULPO[1], z: 1.4 }],                       // corte: el pulpo
  [46.4, { x: HUMANO[0], y: HUMANO[1], z: 1.4 }], [49.79, { x: HUMANO[0], y: HUMANO[1], z: 1.5 }],
  [49.8, LAMINA], [51.0, { x: 560, y: 1000, z: 1.02 }], [52.9, { x: 870, y: 985, z: 1.45 }], [53.7, F0], [TOTAL, F0],     // corte: la lámina otra vez
];
// cada escena con sus claves: así el fotograma de antes de un corte no cae a medio camino entre dos sitios
const BORDES = Object.values(G0).sort((a, b) => a - b).concat([TOTAL + 1]);
const TRAMOS = BORDES.slice(0, -1).map((a, i) => CAMINO.filter(([t]) => t >= a && t < BORDES[i + 1]));
export const camaraEn = (g) => { let i = 0; while (i < TRAMOS.length - 1 && g >= BORDES[i + 1]) i++; return camara(g, TRAMOS[i]); };

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0b0e12; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 90% 62% at 50% 52%, rgba(6,8,10,0) 58%, rgba(6,8,10,0.55) 100%); }
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

// ── svg ─────────────────────────────────────────────────────────────────────────────────────────────────────────
function el(padre, tag, at = {}) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, typeof at[k] === "string" ? at[k].replace(/url\(#c-/g, `url(#${PRE}`) : at[k]);
  padre.appendChild(e);
  return e;
}
// cada escena tiene su propio svg en el mismo documento: sus id llevan el número de la escena
let PRE = "c-", escenas = 0;
const ids = (html) => html.replace(/id="c-/g, `id="${PRE}`).replace(/url\(#c-/g, `url(#${PRE}`).replace(/href="#c-/g, `href="#${PRE}`);
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
const show = (e, o) => e.setAttribute("opacity", Math.max(0, Math.min(1, o)).toFixed(3));
const vis = (e, on) => e.setAttribute("display", on ? "inline" : "none");
const poli = (P) => "M" + P.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L") + " Z";
// un arco de circunferencia (ángulos en grados, 0 hacia la derecha, hacia abajo positivo)
function arco(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${f1(x0)} ${f1(y0)} A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${f1(x1)} ${f1(y1)}`;
}

// ── el borde rasgado del agujero ────────────────────────────────────────────────────────────────────────────────
const azar0 = K.azar(7);
const RASGADO = Array.from({ length: 56 }, (_, i) => {
  const a = (i / 56) * Math.PI * 2, j = (i % 2 ? 0.93 : 1.04) + (azar0() - 0.5) * 0.12;
  return [Math.cos(a) * j, Math.sin(a) * j];
});
const rasgado = (cx, cy, rx, ry, e = 1) => poli(RASGADO.map(([x, y]) => [cx + x * rx * e, cy + y * ry * e]));
const elipse = (cx, cy, rx, ry, n = 48) => Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((i / n) * 6.2832), cy + ry * Math.sin((i / n) * 6.2832)]);

// un agujero rasgado que se cierra desde el borde: el negro encoge, una costura cian corre por su borde y deja ver las
// rayas que ya estaban debajo (lo que se inventa el cerebro)
function agujero(padre, cx, cy, rx, ry, semilla) {
  const g = el(padre, "g");
  const r = K.azar(semilla);
  const canto = el(g, "path", { fill: "#2c4258", stroke: "rgba(150,200,235,0.35)", "stroke-width": 2 });
  const hueco = el(g, "path", { fill: "url(#c-vacio)" });
  const sombra = el(g, "path", { fill: "none", stroke: "rgba(0,0,0,0.75)", "stroke-width": 16, "stroke-linejoin": "round" });
  // trocitos de raya que se caen dentro, en espiral
  const migas = Array.from({ length: 16 }, () => ({ e: el(g, "rect", { width: 14, height: 4, rx: 2, fill: "#3b6886" }), f: r(), a: r() * 6.28, v: 0.6 + r() * 0.5 }));
  const costura = el(g, "path", { fill: "none", stroke: CIAN, "stroke-width": 7, "stroke-linejoin": "round", filter: "url(#c-brillo)" });
  const chispas = Array.from({ length: 14 }, () => ({ e: el(g, "circle", { r: 4 + r() * 4, fill: "url(#c-punto-c)" }), a: r() * 6.28, f: r() }));
  return (gg, ab, o = 1, borde = 0) => {
    show(g, o);
    vis(g, o > 0.004 && (ab > 0.004 || borde > 0.004));
    if (o <= 0.004) return;
    const e = Math.max(0.0001, ab);
    canto.setAttribute("d", rasgado(cx, cy, rx * 1.05, ry * 1.04, e));
    hueco.setAttribute("d", rasgado(cx, cy, rx, ry, e));
    sombra.setAttribute("d", rasgado(cx, cy, rx * 0.97, ry * 0.97, e));
    show(canto, ab > 0.01 ? 1 : 0); show(hueco, ab > 0.01 ? 1 : 0); show(sombra, ab > 0.01 ? 1 : 0);
    // la costura: mientras se cierra (o se abre), y un rato después en el borde ya tapado
    const cose = Math.sin(Math.PI * Math.min(1, Math.max(0, ab))) ** 0.6;
    const seamE = ab > 0.01 ? e : 1;
    costura.setAttribute("d", ab > 0.01 ? rasgado(cx, cy, rx, ry, seamE) : poli(elipse(cx, cy, rx, ry)));
    costura.setAttribute("stroke-dasharray", ab > 0.01 ? "none" : "14 12");
    show(costura, Math.max(ab > 0.01 && ab < 0.995 ? cose : 0, borde));
    chispas.forEach((c) => {
      const u = (ciclo(gg, 0.9) + c.f) % 1;
      c.e.setAttribute("cx", f1(cx + Math.cos(c.a) * rx * e * (1 + 0.25 * u)));
      c.e.setAttribute("cy", f1(cy + Math.sin(c.a) * ry * e * (1 + 0.25 * u)));
      show(c.e, ab > 0.01 && ab < 0.995 ? cose * Math.sin(Math.PI * u) : 0);
    });
    migas.forEach((m) => {
      const u = (ciclo(gg, 0.25 * m.v) + m.f) % 1, rr = 1 - u, a = m.a + 4 * u;
      const x = cx + Math.cos(a) * rx * 0.85 * rr * e, y = cy + Math.sin(a) * ry * 0.85 * rr * e;
      m.e.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1((a * 180) / Math.PI + 90)}) scale(${f1(0.3 + rr)})`);
      show(m.e, ab > 0.3 ? Math.sin(Math.PI * u) * 0.8 : 0);
    });
  };
}

// ── la lámina de la prueba ──────────────────────────────────────────────────────────────────────────────────────
function lamina(cam) {
  const g = el(cam, "g");
  const fondo = el(g, "rect", { x: -1500, y: -1200, width: 3700, height: 4400, fill: "url(#c-rayas)" });
  el(g, "rect", { x: -1500, y: -1200, width: 3700, height: 4400, fill: "url(#c-luz-lamina)" });
  // la cruz
  const cruz = el(g, "g", { transform: `translate(${CRUZ[0]} ${CRUZ[1]})` });
  const aros = [0, 1].map(() => el(cruz, "circle", { r: 60, fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-width": 4 }));
  el(cruz, "rect", { x: -48, y: -8, width: 96, height: 16, rx: 5, fill: "#fff" });
  el(cruz, "rect", { x: -8, y: -48, width: 16, height: 96, rx: 5, fill: "#fff" });
  // el punto rojo
  const punto = el(g, "g", { transform: `translate(${PUNTO[0]} ${PUNTO[1]})` });
  el(punto, "circle", { r: 62, fill: "url(#c-halo-rojo)" });
  el(punto, "circle", { r: 40, fill: "url(#c-rojo)" });
  el(punto, "circle", { cx: -12, cy: -13, r: 11, fill: "rgba(255,255,255,0.35)" });
  // el agujero del punto ciego
  const ag = agujero(g, PUNTO[0], PUNTO[1], HRX, HRY, 11);
  // la cara con un ojo tapado y el móvil que se acerca (abajo, lejos del punto)
  const cara = el(g, "g");
  el(cara, "circle", { cx: 0, cy: 0, r: 92, fill: "#e0a988", stroke: "#b77a5c", "stroke-width": 4 });
  el(cara, "path", { d: "M-92 -10 C-92 -80 -50 -104 0 -104 C50 -104 92 -80 92 -10 C80 -50 40 -70 0 -70 C-40 -70 -80 -50 -92 -10 Z", fill: "#3a2a22" });
  const ojoD = el(cara, "g");
  el(ojoD, "ellipse", { cx: 32, cy: 2, rx: 17, ry: 12, fill: "#fff" });
  el(ojoD, "circle", { cx: 26, cy: 2, r: 8, fill: "#2a5d8a" });
  el(cara, "ellipse", { cx: -32, cy: 2, rx: 17, ry: 12, fill: "#fff" });
  el(cara, "path", { d: "M-20 52 Q0 62 20 52", fill: "none", stroke: "#8a4a3a", "stroke-width": 5, "stroke-linecap": "round" });
  const mano = el(cara, "g");
  el(mano, "path", { d: "M-80 -36 C-80 -50 -10 -50 -6 -36 L-4 30 C-4 46 -78 46 -80 30 Z", fill: "#d99a7a", stroke: "#a8634a", "stroke-width": 4 });
  [-62, -44, -26].forEach((x) => el(mano, "path", { d: `M${x} -40 L${x} 28`, stroke: "rgba(140,80,60,0.6)", "stroke-width": 3 }));
  const movil = el(g, "g");
  el(movil, "rect", { x: -44, y: -80, width: 88, height: 160, rx: 14, fill: "#1a2230", stroke: "#cfd8e2", "stroke-width": 5 });
  el(movil, "rect", { x: -34, y: -66, width: 68, height: 132, rx: 6, fill: "url(#c-rayas-mini)" });
  el(movil, "rect", { x: -26, y: -4, width: 16, height: 4, fill: "#fff" }); el(movil, "rect", { x: -20, y: -10, width: 4, height: 16, fill: "#fff" });
  el(movil, "circle", { cx: 22, cy: -2, r: 6, fill: ROJO });
  const flechas = el(g, "path", { d: "M-40 -20 L-62 0 L-40 20 M40 -20 L62 0 L40 20", fill: "none", stroke: CIAN, "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" });
  return (gg) => {
    const enLamina = gg < G0.ojo || gg >= G0.cierre;
    vis(g, enLamina);
    if (!enLamina) return;
    const o = deriva(gg);
    el(g, "g"); // nada: el patrón se mueve con su transform
    PAT.forEach((p) => p.setAttribute("patternTransform", `rotate(45) translate(${f1(o)} 0)`));
    // el punto: no está en el hook (se lo ha tragado el agujero), y en el cierre se va cuando se inventa el trozo
    const pv = gg < G0.prueba ? 0 : gg < G0.cierre ? 1 - sube(gg, T.rayas - 0.2, T.rayas + 0.5) : 1 - sube(gg, T.trozo, T.trozo + 0.6);
    show(punto, pv);
    // los aros de la cruz: «mírala fijamente»
    aros.forEach((a, i) => {
      const u = K.tramo(gg, T.mira + i * 0.55, T.mira + i * 0.55 + 1.1);
      a.setAttribute("r", f1(50 + 70 * K.sale(u)));
      show(a, u > 0 && u < 1 ? 0.8 * (1 - u) : 0);
    });
    // el agujero, y su costura, que se queda marcando el trozo inventado
    const borde = gg < G0.prueba ? 0 : gg < G0.cierre ? asoma(gg, T.inventa - 0.1, G0.ojo) * 0.9 : asoma(gg, T.trozo + 0.2, T.inventando);
    ag(gg, abierto(gg), 1, borde);
    // la cara, abajo
    const c = gg >= G0.prueba && gg < G0.cierre ? asoma(gg, T.tapate - 0.05, T.desaparece + 0.3) : 0;
    show(cara, c);
    cara.setAttribute("transform", `translate(330 1300) scale(${f1(0.9 + 0.1 * c)})`);
    const tapa = sube(gg, T.tapate + 0.1, T.izquierdo + 0.3);
    mano.setAttribute("transform", `translate(${f1(-70 * (1 - tapa))} ${f1(60 * (1 - tapa))})`);
    show(mano, tapa);
    // el móvil se acerca y se aleja despacio
    const m = gg >= G0.prueba && gg < G0.cierre ? asoma(gg, T.acercate - 0.1, T.desaparece + 0.3) : 0;
    const vaiven = 0.5 - 0.5 * Math.cos(vuelta(gg, 0.4));
    movil.setAttribute("transform", `translate(${f1(720 - 170 * vaiven)} 1300) scale(${f1(0.75 + 0.25 * vaiven)})`);
    show(movil, m);
    flechas.setAttribute("transform", `translate(${f1(720 - 170 * vaiven - 120)} 1300) scale(0.7)`);
    show(flechas, 0);
  };
}
let PAT = [];

// ── el ojo cortado por la mitad, mirando a la izquierda; el nervio sale por detrás ─────────────────────────────────
function ojoGrande(cam) {
  const [cx, cy] = OJO, R = OR;
  const g = el(cam, "g");
  el(g, "rect", { x: cx - 1700, y: cy - 1300, width: 3400, height: 2600, fill: "#0b0f15" });
  el(g, "circle", { cx, cy, r: 900, fill: "url(#c-luz-ojo)" });
  const pared = el(g, "g");
  // el nervio óptico, por detrás
  const nervio = el(pared, "path", { d: `M${cx + R - 30} ${cy - 46} C${cx + R + 120} ${cy - 50} ${cx + R + 260} ${cy - 30} ${cx + R + 720} ${cy - 70} L${cx + R + 720} ${cy + 70} C${cx + R + 260} ${cy + 30} ${cx + R + 120} ${cy + 50} ${cx + R - 30} ${cy + 46} Z`, fill: "url(#c-nervio)", stroke: "#c9b9a2", "stroke-width": 3 });
  const hilosN = Array.from({ length: 7 }, (_, i) => {
    const y = -30 + i * 10;
    return el(pared, "path", { d: `M${cx + R - 20} ${cy + y} C${cx + R + 140} ${cy + y} ${cx + R + 300} ${cy + y * 0.8} ${cx + R + 720} ${cy + y * 1.7}`, fill: "none", stroke: CIAN, "stroke-width": 3, "stroke-linecap": "round", "stroke-dasharray": "18 26", opacity: 0 });
  });
  // dentro: el humor vítreo
  el(pared, "circle", { cx, cy, r: R - 30, fill: "url(#c-vitreo)" });
  // la esclerótica, la coroides y la retina (con el hueco del nervio a 0 grados)
  const A = 7;
  el(pared, "path", { d: arco(cx, cy, R - 11, A, 360 - 52), fill: "none", stroke: "#e6ddd0", "stroke-width": 22 });
  el(pared, "path", { d: arco(cx, cy, R - 11, 52, 360 - A), fill: "none", stroke: "#e6ddd0", "stroke-width": 22 });
  el(pared, "path", { d: arco(cx, cy, R - 26, A, 140), fill: "none", stroke: "#7a2a30", "stroke-width": 9 });
  el(pared, "path", { d: arco(cx, cy, R - 26, 220, 360 - A), fill: "none", stroke: "#7a2a30", "stroke-width": 9 });
  const retina = [el(pared, "path", { d: arco(cx, cy, R - 35, A, 130), fill: "none", stroke: "url(#c-retina)", "stroke-width": 9 }),
    el(pared, "path", { d: arco(cx, cy, R - 35, 230, 360 - A), fill: "none", stroke: "url(#c-retina)", "stroke-width": 9 })];
  // el disco óptico
  const disco = el(pared, "ellipse", { cx: cx + R - 34, cy, rx: 9, ry: 46, fill: "#f6e7c4" });
  // la fóvea
  const fa = (-24 * Math.PI) / 180, fov = [cx + (R - 36) * Math.cos(fa), cy + (R - 36) * Math.sin(fa)];
  // delante: la córnea, el iris y el cristalino
  el(pared, "path", { d: `M${cx - R * Math.cos(0.92)} ${cy - R * Math.sin(0.92)} C${cx - R - 90} ${cy - 150} ${cx - R - 90} ${cy + 150} ${cx - R * Math.cos(0.92)} ${cy + R * Math.sin(0.92)}`, fill: "rgba(170,215,255,0.1)", stroke: "rgba(190,230,255,0.75)", "stroke-width": 7 });
  el(pared, "path", { d: `M${cx - R + 52} ${cy - 186} L${cx - R + 62} ${cy - 62} M${cx - R + 52} ${cy + 186} L${cx - R + 62} ${cy + 62}`, stroke: "#3d7fb8", "stroke-width": 16, "stroke-linecap": "round" });
  const LX = cx - R + 92;
  el(pared, "ellipse", { cx: LX, cy, rx: 44, ry: 110, fill: "url(#c-cristalino)", stroke: "rgba(225,245,255,0.75)", "stroke-width": 4 });
  // los rayos: el de la cruz va a la fóvea; el del punto rojo, al disco
  const rayoB = el(g, "path", { d: `M${cx - 1400} ${cy + (1400 - (cx - LX)) * Math.tan(-fa) * 0} L${LX} ${cy} L${f1(fov[0])} ${f1(fov[1])}`, fill: "none", stroke: "rgba(255,255,255,0.85)", "stroke-width": 6, "stroke-linecap": "round" });
  const yB = cy + (LX - (cx - 1400)) * Math.tan(-fa) * ((fov[0] - LX) ? (fov[1] - cy) / (fov[0] - LX) / Math.tan(-fa) * -1 : 0);
  rayoB.setAttribute("d", `M${cx - 1400} ${f1(cy - ((fov[1] - cy) / (fov[0] - LX)) * (cx - 1400 - LX))} L${LX} ${cy} L${f1(fov[0])} ${f1(fov[1])}`);
  void yB;
  const rayoR = el(g, "path", { d: `M${cx - 1400} ${cy} L${cx + R - 40} ${cy}`, fill: "none", stroke: ROJO, "stroke-width": 9, "stroke-linecap": "round", filter: "url(#c-brillo)" });
  const golpe = el(g, "circle", { cx: cx + R - 40, cy, r: 40, fill: "url(#c-halo-rojo)" });
  const golpeB = el(g, "circle", { cx: fov[0], cy: fov[1], r: 30, fill: "url(#c-punto-b)" });
  const largoB = Math.hypot(LX - (cx - 1400), 400) + Math.hypot(fov[0] - LX, fov[1] - cy) + 400, largoR = 2000;
  // la retina de cerca, pegada a la pared del fondo
  const cerca = retinaCerca(el(g, "g", { transform: `translate(${CC[0]} ${CC[1]}) scale(${CS})` }));
  return (gg, k) => {
    const aqui = gg >= G0.ojo && gg < G0.cielo;
    vis(g, aqui);
    if (!aqui) return;
    const zc = sube(k.z, 2.0, 3.4);            // lo de cerca entra según el zoom
    show(pared, 1 - 0.85 * zc);
    const ra = sube(gg, G0.ojo + 0.1, G0.ojo + 0.9);
    rayoB.setAttribute("stroke-dasharray", `${f1(largoB * ra)} 99999`);
    rayoR.setAttribute("stroke-dasharray", `${f1(largoR * sube(gg, T.ciego - 0.6, T.ciego + 0.1))} 99999`);
    show(rayoB, 0.9 * (1 - zc));
    show(rayoR, 1 - zc);
    show(golpeB, ra * (0.7 + 0.3 * Math.sin(vuelta(gg, 1.2))) * (1 - zc));
    const pr = pico(gg, T.ciego + 0.1, 0.1, 0.8);
    golpe.setAttribute("r", f1(40 + 60 * pr));
    show(golpe, sube(gg, T.ciego, T.ciego + 0.15) * (1 - zc));
    disco.setAttribute("fill", gg >= T.ciego ? "#ff8a96" : "#f6e7c4");
    show(disco, 1);
    const nv = sube(gg, T.nervio - 0.1, T.nervio + 0.3);
    hilosN.forEach((h, i) => { show(h, nv); h.setAttribute("stroke-dashoffset", f1(-ciclo(gg, 1.0) * 44 * 6 - i * 9)); });
    nervio.setAttribute("stroke", nv > 0.5 ? CIAN : "#c9b9a2");
    retina.forEach((r) => show(r, 1));
    cerca(gg, zc);
  };
}

// la retina de cerca, en vertical (la luz llega por la izquierda): los cables delante, las células que ven la luz
// detrás, y en el centro el hueco por donde se van todos los cables hacia el nervio
function retinaCerca(g) {
  const r = K.azar(23), HUECO = 150, Y = 1300;
  el(g, "rect", { x: -1400, y: -Y, width: 1270, height: 2 * Y, fill: "url(#c-vitreo-cerca)" });
  // las capas de detrás: la esclerótica, la coroides y el epitelio
  el(g, "rect", { x: 170, y: -Y, width: 900, height: 2 * Y, fill: "#d9cfc2" });
  el(g, "rect", { x: 112, y: -Y, width: 60, height: 2 * Y, fill: "#6a1f28" });
  for (let i = 0; i < 26; i++) { const y = -Y + i * 100 + r() * 40; el(g, "ellipse", { cx: 142, cy: f1(y), rx: 14, ry: 30, fill: "#8e2a34" }); }
  el(g, "rect", { x: 92, y: -Y, width: 22, height: 2 * Y, fill: "#3b2219" });
  // el nervio que sale a la derecha
  el(g, "path", { d: `M90 ${-HUECO} C200 ${-HUECO} 260 -230 420 -250 L1100 -260 L1100 260 L420 250 C260 230 200 ${HUECO} 90 ${HUECO} Z`, fill: "url(#c-nervio-cerca)" });
  // tapa el hueco en las capas de detrás
  el(g, "rect", { x: -30, y: -HUECO, width: 200, height: 2 * HUECO, fill: "url(#c-nervio-cerca)" });
  // las células que ven la luz: bastones y conos, apuntando hacia atrás
  const celulas = el(g, "g");
  for (let y = -Y + 8; y < Y; y += 17) {
    if (Math.abs(y) < HUECO + 14) continue;
    const cono = r() < 0.18;
    if (cono) el(celulas, "path", { d: `M-6 ${f1(y - 6)} L50 ${f1(y - 7)} L88 ${f1(y - 2)} L88 ${f1(y + 2)} L50 ${f1(y + 7)} L-6 ${f1(y + 6)} Z`, fill: "url(#c-cono)" });
    else el(celulas, "rect", { x: -6, y: f1(y - 5), width: 96, height: 10, rx: 5, fill: "url(#c-baston)" });
    el(celulas, "circle", { cx: -14, cy: f1(y), r: 6, fill: "#8a6a3a" });
  }
  const brilloCel = el(g, "rect", { x: -30, y: -720, width: 130, height: 360, rx: 30, fill: "url(#c-punto-o)", opacity: 0 });
  // las capas de en medio: bipolares y ganglionares
  for (let y = -Y + 20; y < Y; y += 34) {
    if (Math.abs(y) < HUECO + 10) continue;
    el(g, "ellipse", { cx: -48, cy: f1(y + (r() - 0.5) * 8), rx: 13, ry: 8, fill: "#6d5aa8", opacity: 0.85 });
    el(g, "circle", { cx: -88, cy: f1(y + 12), r: 10, fill: "#4c8db0" });
  }
  // los cables: corren por delante, de arriba y de abajo hacia el hueco, y salen por él al nervio
  const cables = [];
  for (let i = 0; i < 36; i++) {
    const lado = i % 2 ? 1 : -1, f = Math.floor(i / 2) / 17, x = -126 + f * 22;
    const yN = lado * (8 + f * 200);
    const d = `M${f1(x)} ${lado * Y} L${f1(x)} ${f1(lado * (HUECO + 60 + f * 40))} C${f1(x)} ${f1(lado * (HUECO - 20))} ${f1(x + 60)} ${f1(lado * (HUECO - 40) * (0.4 + 0.5 * f))} ${f1(x + 140)} ${f1(yN * 0.5)} C${f1(x + 260)} ${f1(yN * 0.6)} 600 ${f1(yN)} 1100 ${f1(yN)}`;
    el(g, "path", { d, fill: "none", stroke: "rgba(95,212,255,0.28)", "stroke-width": 5 });
    cables.push({ e: el(g, "path", { d, fill: "none", stroke: CIAN, "stroke-width": 5, "stroke-linecap": "round", "stroke-dasharray": "26 60" }), f: r() });
  }
  // la luz que llega: arriba la ven las células; en el hueco no la ve nadie
  const luzA = el(g, "rect", { x: -1400, y: -600, width: 0, height: 120, fill: "url(#c-haz)" });
  const luzB = el(g, "rect", { x: -1400, y: -70, width: 0, height: 140, fill: "url(#c-haz-rojo)" });
  return (gg, o) => {
    show(g, o);
    vis(g, o > 0.004);
    if (o <= 0.004) return;
    cables.forEach((c) => c.e.setAttribute("stroke-dashoffset", f1(-ciclo(gg, 0.5) * 86 * 4 - c.f * 86)));
    const la = sube(gg, T.queda - 0.3, T.queda + 0.4), lb = sube(gg, T.queda + 0.5, T.queda + 1.3);
    luzA.setAttribute("width", f1(1400 * la)); show(luzA, la > 0 ? 0.9 : 0);
    luzB.setAttribute("width", f1(1700 * lb)); show(luzB, lb > 0 ? 0.9 : 0);
    show(brilloCel, la > 0.95 ? 0.6 + 0.4 * Math.sin(vuelta(gg, 2)) : 0);
  };
}

// ── el cielo de noche, con la luna y el punto ciego encima: caben diez lunas ───────────────────────────────────────
const LUNA = 64;   // el diámetro de la luna; el punto ciego mide unas 10,6 lunas de ancho y 14,4 de alto
function cielo(cam) {
  const [cx, cy] = CIELO, r = K.azar(31);
  const g = el(cam, "g");
  el(g, "rect", { x: cx - 1300, y: cy - 1400, width: 2600, height: 2800, fill: "url(#c-noche)" });
  const estrellas = Array.from({ length: 90 }, () => ({ e: el(g, "circle", { cx: f1(cx - 1100 + r() * 2200), cy: f1(cy - 1200 + r() * 1700), r: f1(1 + r() * 2.4), fill: "#fff" }), f: r(), b: 0.3 + r() * 0.6 }));
  // los montes y la ciudad, al fondo
  el(g, "path", { d: curva([[cx - 1300, cy + 520], [cx - 900, cy + 430], [cx - 500, cy + 480], [cx - 100, cy + 400], [cx + 300, cy + 470], [cx + 700, cy + 420], [cx + 1300, cy + 500]]) + ` L${cx + 1300} ${cy + 1400} L${cx - 1300} ${cy + 1400} Z`, fill: "#101826" });
  const casas = el(g, "g");
  for (let x = cx - 1200; x < cx + 1200; x += 46 + r() * 30) {
    const h = 40 + r() * 120;
    el(casas, "rect", { x: f1(x), y: f1(cy + 560 - h), width: 40, height: f1(h + 900), fill: "#0a0f18" });
    if (r() < 0.6) el(casas, "rect", { x: f1(x + 12), y: f1(cy + 580 - h + r() * 40), width: 8, height: 10, fill: "rgba(255,194,74,0.7)" });
  }
  // la luna de verdad
  const luna = (p) => { const l = el(p, "g"); el(l, "circle", { r: LUNA * 1.4, fill: "url(#c-halo-luna)" }); el(l, "circle", { r: LUNA / 2, fill: "url(#c-luna)" });
    el(l, "circle", { cx: -8, cy: -6, r: 6, fill: "rgba(150,150,140,0.35)" }); el(l, "circle", { cx: 9, cy: 8, r: 4, fill: "rgba(150,150,140,0.3)" }); return l; };
  const L0 = [cx + 300, cy - 400];
  const la = luna(g); la.setAttribute("transform", `translate(${L0[0]} ${L0[1]})`);
  // el punto ciego
  const RX = (LUNA * 10.6) / 2, RY = (LUNA * 14.4) / 2;
  const mancha = el(g, "ellipse", { cx, cy, rx: RX, ry: RY, fill: "rgba(0,0,0,0.45)", stroke: ROJO, "stroke-width": 6, "stroke-dasharray": "22 14" });
  // las diez lunas en fila
  const lunas = Array.from({ length: 10 }, (_, i) => { const l = luna(g); return { e: l, x: cx - RX + LUNA / 2 + i * LUNA + (2 * RX - 10 * LUNA) / 2 }; });
  return (gg) => {
    const aqui = gg >= G0.cielo && gg < G0.ojos;
    vis(g, aqui);
    if (!aqui) return;
    estrellas.forEach((s) => show(s.e, s.b * (0.7 + 0.3 * Math.sin(vuelta(gg, 0.7) + s.f * 20))));
    const m = sube(gg, T.enorme - 0.1, T.enorme + 0.7);
    mancha.setAttribute("rx", f1(RX * (0.2 + 0.8 * K.sale(m))));
    mancha.setAttribute("ry", f1(RY * (0.2 + 0.8 * K.sale(m))));
    show(mancha, m);
    lunas.forEach((l, i) => {
      const u = K.tramo(gg, T.diez + i * 0.11, T.diez + i * 0.11 + 0.45), s = K.suave(u);
      const x = L0[0] + (l.x - L0[0]) * s, y = L0[1] + (cy - L0[1]) * s - 120 * Math.sin(Math.PI * s);
      l.e.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${f1(0.9 + 0.1 * s + 0.25 * Math.sin(Math.PI * u))})`);
      show(l.e, u > 0 ? 1 : 0);
    });
  };
}

// ── lo que ve cada ojo: la misma lámina, con el agujero cada uno a un lado; juntos se tapan ───────────────────────
function vistas(cam) {
  const [cx, cy] = VISTAS, RV = 250, SEP = 268;
  const g = el(cam, "g");
  el(g, "rect", { x: cx - 1300, y: cy - 1300, width: 2600, height: 2600, fill: "#0b0f15" });
  const vista = (lado) => {
    const v = el(g, "g");
    const clip = el(g, "clipPath", { id: `${PRE}vista${lado > 0 ? "d" : "i"}` });
    el(clip, "circle", { cx: 0, cy: 0, r: RV });
    const dentro = el(v, "g", { "clip-path": `url(#${PRE}vista${lado > 0 ? "d" : "i"})` });
    el(dentro, "rect", { x: -RV, y: -RV, width: 2 * RV, height: 2 * RV, fill: "url(#c-rayas)" });
    el(dentro, "rect", { x: -26, y: -5, width: 52, height: 10, rx: 3, fill: "#fff" });
    el(dentro, "rect", { x: -5, y: -26, width: 10, height: 52, rx: 3, fill: "#fff" });
    const ag = agujero(dentro, lado * 130, 0, 52, 70, lado > 0 ? 41 : 43);
    const aro = el(v, "circle", { r: RV, fill: "none", stroke: lado > 0 ? CIAN : ORO, "stroke-width": 6 });
    // el ojo de encima
    const ojo = el(v, "g", { transform: `translate(0 ${-RV - 92})` });
    el(ojo, "path", { d: "M-70 0 Q0 -54 70 0 Q0 54 -70 0 Z", fill: "#f2ede6", stroke: "#cfc4b8", "stroke-width": 4 });
    el(ojo, "circle", { r: 24, fill: "#3d7fb8" }); el(ojo, "circle", { r: 11, fill: "#0b0f15" }); el(ojo, "circle", { cx: -7, cy: -8, r: 5, fill: "#fff" });
    const parpado = el(ojo, "path", { fill: "#d99a7a", stroke: "#a8634a", "stroke-width": 4 });
    return { v, ag, aro, parpado, lado };
  };
  const I = vista(-1), D = vista(1);
  const flechas = el(g, "g");
  const fl = Array.from({ length: 8 }, (_, i) => el(flechas, "path", { d: "M0 -14 L0 14 M-10 4 L0 14 L10 4", fill: "none", stroke: CIAN, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", "data-a": (i / 8) * 6.2832 }));
  return (gg) => {
    const aqui = gg >= G0.ojos && gg < G0.pulpo;
    vis(g, aqui);
    if (!aqui) return;
    const junta = sube(gg, T.tapa - 0.1, T.otro + 0.2), cierra = sube(gg, T.cerrado - 0.15, T.cerrado + 0.3);
    const pulso = (l) => pico(gg, T.cada + (l > 0 ? 0.3 : 0), 0.1, 0.6);
    [I, D].forEach((V) => {
      const x = cx + V.lado * SEP * (1 - junta);
      V.v.setAttribute("transform", `translate(${f1(x)} ${cy})`);
      // el agujero de cada uno se ve hasta que el otro lo tapa; con un ojo cerrado, vuelve el del abierto y se rellena
      let ab = 1, o = 1 - junta;
      if (V.lado > 0) { o = Math.max(1 - junta, cierra); ab = 1 - sube(gg, T.rellena - 0.1, T.rellena + 0.8); }
      V.ag(gg, ab * (1 + 0.15 * pulso(V.lado)), o, V.lado > 0 ? asoma(gg, T.rellena + 0.7, 41.4) * 0.9 : 0);
      if (V.lado < 0) show(V.v, 1 - 0.9 * cierra);
      V.aro.setAttribute("stroke", junta > 0.5 && cierra < 0.5 ? VERDE : V.lado > 0 ? CIAN : ORO);
      // el párpado del izquierdo baja
      const p = V.lado < 0 ? cierra : 0, yb = -54 + 108 * p;
      V.parpado.setAttribute("d", `M-72 0 Q0 -60 72 0 Q0 ${f1(yb)} -72 0 Z`);
      show(V.parpado, p > 0.01 ? 1 : 0);
      V.v.querySelector("g[transform]").setAttribute("transform", `translate(${f1(V.lado * 70 * junta)} ${-RV - 92})`);
    });
    // lo de alrededor entra en el hueco
    const al = asoma(gg, T.rellena - 0.2, 41.0);
    show(flechas, al);
    fl.forEach((f, i) => {
      const a = +f.getAttribute("data-a"), u = (ciclo(gg, 1.2) + i / 8) % 1, rr = 1 - 0.35 * u;
      const x = cx + 130 + Math.cos(a) * 120 * rr, y = cy + Math.sin(a) * 150 * rr;
      f.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1((a * 180) / Math.PI + 90)})`);
      show(f, Math.sin(Math.PI * u));
    });
  };
}

// ── el ojo del pulpo (los cables por detrás) encima del nuestro (los cables por delante, y el hueco) ──────────────
function ojoDiagrama(padre, cx, cy, R, pulpo, sem) {
  const g = el(padre, "g");
  const r = K.azar(sem);
  el(g, "circle", { cx, cy, r: R + 14, fill: "#e6ddd0" });
  el(g, "circle", { cx, cy, r: R, fill: "url(#c-vitreo)" });
  // la córnea y el cristalino
  el(g, "path", { d: `M${cx - R * 0.6} ${cy - R * 0.8} C${cx - R - 70} ${cy - 90} ${cx - R - 70} ${cy + 90} ${cx - R * 0.6} ${cy + R * 0.8}`, fill: "rgba(170,215,255,0.1)", stroke: "rgba(190,230,255,0.75)", "stroke-width": 6 });
  el(g, "ellipse", { cx: cx - R + 70, cy, rx: 30, ry: 72, fill: "url(#c-cristalino)", stroke: "rgba(225,245,255,0.75)", "stroke-width": 3 });
  // la retina: una banda por la pared del fondo; las células que ven la luz, rayitas doradas
  const RR = R - 22, A0 = -72, A1 = 72, HG = pulpo ? 0 : 8;
  const banda = el(g, "g");
  for (let a = A0; a <= A1; a += 2.4) {
    if (Math.abs(a) < HG) continue;
    const t = (a * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
    // en el pulpo apuntan hacia la luz; en el nuestro, hacia atrás: da igual a esta escala, son rayitas
    el(banda, "path", { d: `M${f1(cx + (RR - 12) * c)} ${f1(cy + (RR - 12) * s)} L${f1(cx + (RR + 10) * c)} ${f1(cy + (RR + 10) * s)}`, stroke: ORO, "stroke-width": 4.5, "stroke-linecap": "round" });
  }
  // el nervio, detrás
  const NX = cx + R + 14;
  el(g, "path", { d: `M${NX - 30} ${cy - 34} C${NX + 60} ${cy - 36} ${NX + 120} ${cy - 30} ${NX + 300} ${cy - 50} L${NX + 300} ${cy + 50} C${NX + 120} ${cy + 30} ${NX + 60} ${cy + 36} ${NX - 30} ${cy + 34} Z`, fill: "url(#c-nervio)" });
  // los cables: en el pulpo, por fuera de la retina; en el nuestro, por dentro, y atraviesan la retina por el hueco
  const cables = [];
  for (let i = 0; i < 14; i++) {
    const lado = i % 2 ? 1 : -1, f = Math.floor(i / 2) / 6, aIni = lado * (30 + f * 40);
    const rC = pulpo ? RR + 24 + f * 5 : RR - 22 - f * 6;
    const P = [];
    for (let k = 0; k <= 10; k++) { const a = (aIni * (1 - k / 10) + lado * 1.5 * (1 - k / 10) * 0) * Math.PI / 180, rr = rC; P.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    const yN = lado * (4 + f * 22);
    const d = curva(P) + ` C${f1(cx + RR + 10)} ${f1(yN * 0.4 + cy)} ${f1(NX + 30)} ${f1(cy + yN)} ${f1(NX + 300)} ${f1(cy + yN * 1.5)}`;
    el(g, "path", { d, fill: "none", stroke: "rgba(95,212,255,0.3)", "stroke-width": 3.5 });
    cables.push({ e: el(g, "path", { d, fill: "none", stroke: CIAN, "stroke-width": 3.5, "stroke-linecap": "round", "stroke-dasharray": "14 34" }), f: r() });
  }
  const hueco = pulpo ? null : el(g, "ellipse", { cx: cx + RR, cy, rx: 26, ry: 40, fill: "url(#c-halo-rojo)", opacity: 0 });
  return (gg, enc, flash) => {
    cables.forEach((c) => {
      c.e.setAttribute("stroke-dashoffset", f1(-ciclo(gg, 0.6) * 48 * 5 - c.f * 48));
      c.e.setAttribute("stroke-width", f1(3.5 + 2 * enc));
    });
    if (hueco) show(hueco, flash);
  };
}
function pulpos(cam) {
  const g = el(cam, "g");
  el(g, "rect", { x: PULPO[0] - 1300, y: PULPO[1] - 1300, width: 2600, height: 3000, fill: "#0b0f15" });
  el(g, "circle", { cx: PULPO[0], cy: PULPO[1], r: 700, fill: "url(#c-luz-ojo)" });
  el(g, "circle", { cx: HUMANO[0], cy: HUMANO[1], r: 700, fill: "url(#c-luz-ojo)" });
  const P = ojoDiagrama(g, PULPO[0], PULPO[1], 205, true, 51);
  const H = ojoDiagrama(g, HUMANO[0], HUMANO[1], 205, false, 53);
  // el pulpo, arriba a la izquierda de su ojo
  const pu = el(g, "g", { transform: `translate(${PULPO[0] - 250} ${PULPO[1] - 250})` });
  const tent = Array.from({ length: 8 }, (_, i) => el(pu, "path", { fill: "none", stroke: "#e2725b", "stroke-width": 16, "stroke-linecap": "round" }));
  el(pu, "path", { d: "M-70 10 C-80 -90 80 -90 70 10 C60 40 -60 40 -70 10 Z", fill: "#ef8a6e", stroke: "#b8503a", "stroke-width": 4 });
  [-26, 26].forEach((x) => { el(pu, "ellipse", { cx: x, cy: -6, rx: 15, ry: 12, fill: "#fff6e0" }); el(pu, "rect", { x: x - 10, y: -9, width: 20, height: 6, rx: 3, fill: "#1a1a1a" }); });
  return (gg) => {
    const aqui = gg >= G0.pulpo && gg < G0.cierre;
    vis(g, aqui);
    if (!aqui) return;
    tent.forEach((t, i) => {
      const x0 = -56 + i * 16, w = Math.sin(vuelta(gg, 0.5) + i) * 14;
      t.setAttribute("d", `M${x0} 20 C${x0 + w} 60 ${x0 - w} 90 ${x0 + (i - 3.5) * 9 + w} 120`);
    });
    P(gg, sube(gg, T.detras - 0.2, T.detras + 0.3) * (1 - sube(gg, 45.6, 46.0)), 0);
    H(gg, sube(gg, T.delante - 0.2, T.delante + 0.3), pico(gg, T.atravesarla + 0.2, 0.12, 1.2) + 0.5 * sube(gg, T.atravesarla + 0.5, T.atravesarla + 0.9));
  };
}

const DEFS = `
<defs>
  <pattern id="c-rayas" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)"><rect width="40" height="40" fill="#0f1822"/><rect width="15" height="40" fill="#24465f"/></pattern>
  <pattern id="c-rayas-mini" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)"><rect width="12" height="12" fill="#0f1822"/><rect width="5" height="12" fill="#24465f"/></pattern>
  <radialGradient id="c-luz-lamina" gradientUnits="userSpaceOnUse" cx="560" cy="980" r="900"><stop offset="0" stop-color="rgba(120,200,255,0.08)"/><stop offset="1" stop-color="rgba(0,0,0,0.35)"/></radialGradient>
  <radialGradient id="c-vacio" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000"/><stop offset="0.7" stop-color="#020304"/><stop offset="1" stop-color="#0a1016"/></radialGradient>
  <radialGradient id="c-rojo" cx="0.42" cy="0.4" r="0.62"><stop offset="0" stop-color="#ff7686"/><stop offset="0.55" stop-color="#f0445a"/><stop offset="1" stop-color="#b8243a"/></radialGradient>
  <radialGradient id="c-halo-rojo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,90,110,0.55)"/><stop offset="1" stop-color="rgba(240,68,90,0)"/></radialGradient>
  <radialGradient id="c-punto-c" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(232,251,255,0.95)"/><stop offset="0.35" stop-color="rgba(95,212,255,0.6)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
  <radialGradient id="c-punto-b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,255,255,0.9)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient>
  <radialGradient id="c-punto-o" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,246,216,0.75)"/><stop offset="0.4" stop-color="rgba(255,194,74,0.45)"/><stop offset="1" stop-color="rgba(255,194,74,0)"/></radialGradient>
  <filter id="c-brillo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <radialGradient id="c-luz-ojo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(95,150,210,0.12)"/><stop offset="1" stop-color="rgba(95,150,210,0)"/></radialGradient>
  <radialGradient id="c-vitreo" cx="0.4" cy="0.45" r="0.65"><stop offset="0" stop-color="#18283a"/><stop offset="1" stop-color="#0d1622"/></radialGradient>
  <linearGradient id="c-vitreo-cerca" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d1622"/><stop offset="1" stop-color="#16263a"/></linearGradient>
  <linearGradient id="c-retina" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9b24e"/><stop offset="1" stop-color="#c98a2e"/></linearGradient>
  <linearGradient id="c-nervio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdbda6"/><stop offset="0.5" stop-color="#f1e6d4"/><stop offset="1" stop-color="#c2b199"/></linearGradient>
  <linearGradient id="c-nervio-cerca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3f52"/><stop offset="0.5" stop-color="#1b2c3c"/><stop offset="1" stop-color="#2a3f52"/></linearGradient>
  <radialGradient id="c-cristalino" cx="0.4" cy="0.4" r="0.7"><stop offset="0" stop-color="rgba(235,248,255,0.55)"/><stop offset="1" stop-color="rgba(150,200,240,0.2)"/></radialGradient>
  <linearGradient id="c-baston" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9902e"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>
  <linearGradient id="c-cono" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d07a2a"/><stop offset="1" stop-color="#ffb36a"/></linearGradient>
  <linearGradient id="c-haz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,240,200,0)"/><stop offset="0.8" stop-color="rgba(255,240,200,0.35)"/><stop offset="1" stop-color="rgba(255,240,200,0.7)"/></linearGradient>
  <linearGradient id="c-haz-rojo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,90,110,0)"/><stop offset="0.8" stop-color="rgba(255,90,110,0.35)"/><stop offset="1" stop-color="rgba(255,90,110,0.75)"/></linearGradient>
  <linearGradient id="c-noche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050913"/><stop offset="0.6" stop-color="#0f1f3d"/><stop offset="1" stop-color="#23365e"/></linearGradient>
  <radialGradient id="c-luna" cx="0.4" cy="0.38" r="0.65"><stop offset="0" stop-color="#fffbea"/><stop offset="0.7" stop-color="#e9e3cc"/><stop offset="1" stop-color="#c9c2a8"/></radialGradient>
  <radialGradient id="c-halo-luna" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,250,225,0.35)"/><stop offset="1" stop-color="rgba(255,250,225,0)"/></radialGradient>
</defs>`;

// ── las etiquetas (en pantalla, sujetas a un punto del mundo o a un sitio fijo) ─────────────────────────────────
function etiqueta(cont, html, clase = "") { return K.crear(cont, `<div class="c-etq ${clase}">${typeof html === "function" ? html(0) : html}</div>`); }
function pon(e, sx, sy, on, dy = 24) {
  if (on <= 0.001) { e.style.opacity = 0; return; }
  const w = e.offsetWidth, h = e.offsetHeight;
  const x = Math.min(Math.max(sx, 40 + w / 2), 1040 - w / 2), y = Math.min(Math.max(sy, 560 + h / 2), 1460 - h / 2);
  e.style.opacity = on;
  e.style.transform = `translate(${f1(x - w / 2)}px, ${f1(y - h / 2 + (1 - on) * dy)}px) scale(${f1(0.9 + 0.1 * on)})`;
}
const junto = (wx, wy, dx = 0, dy = 0) => (k) => { const [x, y] = pantalla(k, wx, wy); return [x + dx, y + dy]; };
const fijo = (x, y) => () => [x, y];

function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on) => L.push({ e: etiqueta(capa, html, clase), html, sitio, on });
  const abajo = fijo(540, 1420);
  // hook
  r(`un <b>agujero</b>`, "r g", abajo, (g) => asoma(g, T.agujero, T.tapando - 0.2));
  r(`tu <b>cerebro</b> lo tapa`, "c g", abajo, (g) => asoma(g, T.tapando, 4.45));
  // la prueba (abajo, lejos del punto)
  r(`tapa el ojo <b>izquierdo</b>`, "o", fijo(700, 1180), (g) => asoma(g, T.izquierdo, T.mira - 0.1));
  r(`mira la <b>cruz</b>`, "", fijo(700, 1180), (g) => asoma(g, T.mira, T.acercate - 0.1));
  r(`acerca el móvil <b>despacio</b>`, "c", fijo(560, 1440), (g) => asoma(g, T.acercate, T.desaparece - 0.1));
  r(`el punto <b>desaparece</b>`, "r g", fijo(540, 1440), (g) => asoma(g, T.desaparece, T.negro + 0.6));
  r(`ves las <b>rayas</b>`, "c g", fijo(540, 1440), (g) => asoma(g, T.rayas, T.inventa - 0.1));
  r(`se las <b>inventa</b> tu cerebro`, "c g", fijo(540, 1440), (g) => asoma(g, T.inventa, 18.6));
  // el ojo
  r(`punto <b>ciego</b>`, "r g", fijo(540, 1420), (g) => asoma(g, T.ciego, T.nervio - 0.1));
  r(`nervio <b>óptico</b>`, "c g", fijo(540, 1420), (g) => asoma(g, T.nervio, 23.3));
  r(`<b>1.000.000</b> de cables`, "c g", fijo(330, 1420), (g) => asoma(g, T.millon, T.queda - 0.2));
  r(`aquí <b>sí</b> ven la luz`, "o", fijo(400, 700), (g) => asoma(g, T.queda + 0.1, 28.5));
  r(`aquí <b>nada</b>`, "r g", fijo(330, 1180), (g) => asoma(g, T.queda + 1.0, 28.5));
  // el cielo
  r(`tu punto <b>ciego</b>`, "r", fijo(540, 1460), (g) => asoma(g, T.enorme + 0.3, T.diez - 0.1));
  r(`<b>10</b> lunas llenas`, "o g", fijo(540, 1460), (g) => asoma(g, T.diez + 0.3, 33.8));
  // los dos ojos
  r(`ojo <b>izquierdo</b>`, "o", junto(VISTAS[0] - 268, VISTAS[1] + 320), (g) => asoma(g, 34.0, T.tapa));
  r(`ojo <b>derecho</b>`, "c", junto(VISTAS[0] + 268, VISTAS[1] + 320), (g) => asoma(g, 34.15, T.tapa));
  r(`se <b>tapan</b> entre los dos`, "v g", fijo(540, 1420), (g) => asoma(g, T.otro - 0.2, T.cerrado - 0.2));
  r(`un ojo <b>cerrado</b>`, "o g", fijo(540, 1420), (g) => asoma(g, T.cerrado, T.rellena - 0.1));
  r(`lo <b>rellena</b> con lo de alrededor`, "c", fijo(540, 1420), (g) => asoma(g, T.rellena, 41.3));
  // el pulpo
  r(`<b>pulpo</b>`, "n g", junto(PULPO[0] - 250, PULPO[1] + 280), (g) => asoma(g, T.pulpo, 45.7));
  r(`cables <b>detrás</b>`, "v", junto(PULPO[0] + 230, PULPO[1] - 270), (g) => asoma(g, T.detras, 45.7));
  r(`sin punto ciego`, "v", junto(PULPO[0], PULPO[1] + 300), (g) => asoma(g, T.retina, 45.7));
  r(`<b>tú</b>`, "c g", junto(HUMANO[0] - 250, HUMANO[1] - 270), (g) => asoma(g, T.nuestro, 49.7));
  r(`cables <b>delante</b>`, "r", junto(HUMANO[0] + 230, HUMANO[1] - 270), (g) => asoma(g, T.delante, 49.7));
  r(`el <b>agujero</b>`, "r g", junto(HUMANO[0] + 183, HUMANO[1] + 200), (g) => asoma(g, T.atravesarla + 0.3, 49.7));
  // el cierre
  r(`<b>inventado</b>`, "c g", fijo(540, 1420), (g) => asoma(g, T.trozo + 0.3, T.inventando + 0.4));
  return (g, k) => L.forEach((l) => { const [x, y] = l.sitio(k); pon(l.e, x, y, l.on(g)); });
}

// ── lo que tiene cada escena, por capas: el fondo, el mundo, la viñeta, la sombra de arriba y la pantalla ─────────
export function montaje(esc) {
  estilos();
  PRE = `c${++escenas}-`;
  K.crear(esc, `<div class="c-fondo"></div>`);
  const mundo = K.crear(esc, `<div class="c-mundo"></div>`);
  const sv = K.crear(mundo, ids(`<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">${DEFS}<g class="c-cam"></g></svg>`));
  const cam = sv.querySelector(".c-cam");
  PAT = [sv.querySelector(`#${PRE}rayas`)];
  el(cam, "rect", { x: -4000, y: -2000, width: 20000, height: 7500, fill: "#0b0e12" });
  const la = lamina(cam);
  const oj = ojoGrande(cam);
  const ci = cielo(cam);
  const vi = vistas(cam);
  const pu = pulpos(cam);
  K.crear(esc, `<div class="c-vineta"></div>`);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  const ro = rotulos(capa);
  return { cam, la, oj, ci, vi, pu, ro };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los 0,3 s en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    // los golpes: la cámara da un respingo cuando se rasga el agujero al final
    const sac = 0.9 * pico(g, T.inventando + 0.05, 0.06, 0.5);
    const kx = k.x + sac * 7 * Math.sin(g * 90), ky = k.y + sac * 6 * Math.cos(g * 77), kz = k.z * (1 + 0.03 * sac);
    E.cam.setAttribute("transform", `translate(${(540 - kx * kz).toFixed(2)} ${(1000 - ky * kz).toFixed(2)}) scale(${kz.toFixed(4)})`);
    const kk = { x: kx, y: ky, z: kz };
    E.la(g);
    E.oj(g, kk);
    E.ci(g);
    E.vi(g);
    E.pu(g);
    E.ro(g, kk);
    return { g, k: kk };
  };
  return E;
}
