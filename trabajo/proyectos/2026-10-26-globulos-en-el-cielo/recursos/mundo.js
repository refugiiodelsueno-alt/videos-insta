// El mundo del vídeo: el cielo azul con sus puntitos, el ojo de frente, el ojo cortado, el capilar y la red de vasos.
// Todo sale del reloj del vídeo entero (g): cada escena dibuja lo mismo en el mismo segundo.
const K = window.K; const NS = "http://www.w3.org/2000/svg";
export const CIAN = "#5fd4ff", ROJO = "#f0445a", LILA = "#d8c8ff";
export const TOTAL = 50.89;
export const G0 = { hook: 0, ojo: 4.6, retina: 9.37, sombra: 14.44, capilar: 19.02, cielo: 33.96, centro: 40.86, cierre: 45.66 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  puntitos: 0.32, luz: 0.88, cielo: 1.76, son: 2.64, globulos: 3.12,
  moscas: 4.96, volantes: 5.28, es: 6.24, sangre: 6.56, moviendose: 7.28, dentro: 7.96, ojo: 8.56,
  antes: 9.46, fondo: 10.26, luz2: 11.34, cruzar: 11.99, red: 12.58, vasitos: 12.98,
  nola: 14.46, cerebro: 15.38, borra: 15.94, siempre: 16.66, mismo: 17.62,
  globulos2: 20.02, fila: 21.22, tragan: 22.1, luz3: 22.58,
  globulo: 24.74, blanco: 25.1, grande: 25.94, lento: 26.74, aparta: 27.54,
  hueco: 29.54, cuela: 30.18, enciende: 32.26, puntito: 32.98,
  mueve: 34.42, cerebro2: 35.1, no: 35.62, borrar: 36.18, saltitos: 37.3, rapido: 38.34, con: 38.86, cada: 39.03, latido: 39.22,
  justo: 41.1, miras: 41.62, ninguno: 42.34, vasos: 43.58, nitido: 44.62,
  asi: 45.7, traves: 49.06, propia: 49.82,
};
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const pico = (g, t, sub = 0.08, baja = 0.5) => K.sale(K.tramo(g, t, t + sub)) * (1 - K.suave(K.tramo(g, t + sub, t + baja)));
// rampa que arranca desde quieta y acaba con pendiente 1 (para velocidades que cambian sin tirón)
const rampa = (g, a, b) => { const u = K.lim((g - a) / (b - a)); return (b - a) * (u * u * u - (u * u * u * u) / 2) + Math.max(0, g - b); };
const blando = (a, b, k = 10) => Math.min(a, b) - k * Math.log(1 + Math.exp(-Math.abs(a - b) / k));
const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2), f3 = (v) => v.toFixed(3);
const fr = (x) => x - Math.floor(x);
const angd = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: #0b0e12; }
.c-mundo { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 85% 60% at 50% 52%, rgba(6,8,10,0) 55%, rgba(6,8,10,0.55) 100%); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(10,13,16,0.96) 0, rgba(10,13,16,0.86) 300px, rgba(10,13,16,0.55) 470px, rgba(10,13,16,0) 630px); }
.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(12,15,19,0.88); border: 2px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 10px 24px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.45); opacity: 0; text-align: center; }
.c-etq b { font-weight: 800; }
.c-etq.c b { color: ${CIAN}; } .c-etq.r b { color: ${ROJO}; } .c-etq.l b { color: ${LILA}; }
.c-etq.c { border-color: rgba(95,212,255,0.45); } .c-etq.r { border-color: rgba(240,68,90,0.5); } .c-etq.l { border-color: rgba(216,200,255,0.5); }
.c-etq.g { font-size: 56px; padding: 12px 30px; }
.c-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }
.c-etq .tach { position: absolute; left: 4%; top: 50%; height: 7px; margin-top: -2px; background: ${ROJO}; border-radius: 4px; box-shadow: 0 0 12px rgba(240,68,90,0.7); }
`;
function estilos() {
  if (document.getElementById("mundo-css")) return;
  const s = document.createElement("style");
  s.id = "mundo-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const DEFS = `<defs>
<radialGradient id="c-punto-c"><stop offset="0" stop-color="rgba(232,251,255,0.9)"/><stop offset="0.35" stop-color="rgba(95,212,255,0.55)"/><stop offset="1" stop-color="rgba(95,212,255,0)"/></radialGradient>
<radialGradient id="c-punto-b"><stop offset="0" stop-color="rgba(255,255,255,1)"/><stop offset="0.28" stop-color="rgba(228,247,255,0.75)"/><stop offset="1" stop-color="rgba(200,236,255,0)"/></radialGradient>
<linearGradient id="c-cielo" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="1800"><stop offset="0" stop-color="#082a72"/><stop offset="0.5" stop-color="#2f7ad9"/><stop offset="1" stop-color="#a3d3f8"/></linearGradient>
<linearGradient id="c-lejos" gradientUnits="userSpaceOnUse" x1="0" y1="-1300" x2="0" y2="600"><stop offset="0" stop-color="#3c88dc"/><stop offset="0.4" stop-color="#173f86"/><stop offset="1" stop-color="#0b1426"/></linearGradient>
<linearGradient id="c-cielo-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(47,120,216,0.85)"/><stop offset="1" stop-color="rgba(47,120,216,0)"/></linearGradient>
<radialGradient id="c-sol"><stop offset="0" stop-color="rgba(255,252,240,0.85)"/><stop offset="0.4" stop-color="rgba(255,246,225,0.3)"/><stop offset="1" stop-color="rgba(255,240,210,0)"/></radialGradient>
<radialGradient id="c-nube"><stop offset="0" stop-color="rgba(255,255,255,0.8)"/><stop offset="0.6" stop-color="rgba(250,252,255,0.35)"/><stop offset="1" stop-color="rgba(245,250,255,0)"/></radialGradient>
<linearGradient id="c-barre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset="0.5" stop-color="rgba(255,255,255,0.8)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>
<radialGradient id="c-piel" gradientUnits="userSpaceOnUse" cx="0" cy="-40" r="950"><stop offset="0" stop-color="#e4ad8e"/><stop offset="0.5" stop-color="#c98b6d"/><stop offset="1" stop-color="#7a4734"/></radialGradient>
<radialGradient id="c-cuenca"><stop offset="0" stop-color="rgba(70,28,18,0.42)"/><stop offset="0.7" stop-color="rgba(70,28,18,0.22)"/><stop offset="1" stop-color="rgba(70,28,18,0)"/></radialGradient>
<radialGradient id="c-esclera" gradientUnits="userSpaceOnUse" cx="0" cy="-20" r="520"><stop offset="0" stop-color="#fbf8f4"/><stop offset="0.55" stop-color="#ece3da"/><stop offset="0.85" stop-color="#d3bfb2"/><stop offset="1" stop-color="#b3907f"/></radialGradient>
<radialGradient id="c-iris" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="230"><stop offset="0" stop-color="#2e1c0c"/><stop offset="0.42" stop-color="#8f5f22"/><stop offset="0.55" stop-color="#c4903f"/><stop offset="0.68" stop-color="#8a8040"/><stop offset="0.88" stop-color="#4e5a30"/><stop offset="1" stop-color="#262616"/></radialGradient>
<radialGradient id="c-fondo-ojo" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="100"><stop offset="0" stop-color="#e46a3a"/><stop offset="0.7" stop-color="#b43a22"/><stop offset="1" stop-color="#651710"/></radialGradient>
<radialGradient id="c-reflejo"><stop offset="0" stop-color="rgba(255,120,70,0.95)"/><stop offset="0.7" stop-color="rgba(200,50,30,0.8)"/><stop offset="1" stop-color="rgba(120,20,10,0.5)"/></radialGradient>
<radialGradient id="c-mancha"><stop offset="0" stop-color="rgba(90,18,8,0.7)"/><stop offset="1" stop-color="rgba(90,18,8,0)"/></radialGradient>
<radialGradient id="c-papila"><stop offset="0" stop-color="#fff3c8"/><stop offset="0.6" stop-color="#f2c27a"/><stop offset="1" stop-color="rgba(230,150,90,0)"/></radialGradient>
<radialGradient id="c-vitreo" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="rgba(170,205,240,0.30)"/><stop offset="1" stop-color="rgba(90,125,170,0.16)"/></radialGradient>
<radialGradient id="c-rbc"><stop offset="0" stop-color="#b8212f"/><stop offset="0.5" stop-color="#e34a58"/><stop offset="0.82" stop-color="#b51f2f"/><stop offset="1" stop-color="#6e0b18"/></radialGradient>
<radialGradient id="c-wbc" cx="0.45" cy="0.42"><stop offset="0" stop-color="#f8f5ff"/><stop offset="0.65" stop-color="#ddd3f3"/><stop offset="1" stop-color="#a99bd6"/></radialGradient>
<radialGradient id="c-nucleo" cx="0.4" cy="0.35"><stop offset="0" stop-color="#9c82d8"/><stop offset="1" stop-color="#583d97"/></radialGradient>
<linearGradient id="c-cono" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a88cbc"/><stop offset="1" stop-color="#5d4677"/></linearGradient>
<linearGradient id="c-cono-luz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#effcff"/><stop offset="1" stop-color="#5fd4ff"/></linearGradient>
<linearGradient id="c-sombra-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(0,0,0,0.62)"/><stop offset="1" stop-color="rgba(0,0,0,0.38)"/></linearGradient>
<linearGradient id="c-lluvia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(95,212,255,0)"/><stop offset="1" stop-color="rgba(95,212,255,0.13)"/></linearGradient>
<linearGradient id="c-pared" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c77a6c"/><stop offset="0.5" stop-color="#e3a191"/><stop offset="1" stop-color="#c77a6c"/></linearGradient>
<radialGradient id="c-tej"><stop offset="0" stop-color="rgba(170,84,118,0.24)"/><stop offset="0.7" stop-color="rgba(150,70,100,0.08)"/><stop offset="1" stop-color="rgba(150,70,100,0)"/></radialGradient>
<pattern id="c-tejido" patternUnits="userSpaceOnUse" width="420" height="420">
  <circle cx="70" cy="80" r="80" fill="url(#c-tej)"/><circle cx="260" cy="40" r="60" fill="url(#c-tej)"/><circle cx="350" cy="230" r="90" fill="url(#c-tej)"/>
  <circle cx="150" cy="300" r="70" fill="url(#c-tej)"/><circle cx="20" cy="390" r="55" fill="url(#c-tej)"/>
  <path d="M0 200 C 90 170, 180 240, 280 190 S 380 150, 420 180" fill="none" stroke="rgba(230,150,170,0.07)" stroke-width="6"/>
</pattern>
<radialGradient id="c-sangre-v"><stop offset="0.45" stop-color="rgba(150,8,30,0)"/><stop offset="1" stop-color="rgba(150,8,30,0.6)"/></radialGradient>
</defs>`;

// ---------- piezas de SVG ----------
let PRE = "c-", escenas = 0;
function el(padre, tag, at = {}) { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, typeof at[k] === "string" ? at[k].replace("url(#c-", `url(#${PRE}`) : at[k]); padre.appendChild(e); return e; }
const ids = (html) => html.replace(/id="c-/g, `id="${PRE}`).replace(/url\(#c-/g, `url(#${PRE}`);
function curva(P, cerrada = false) { const n = P.length, q = (i) => (cerrada ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))]); let d = `M${f1(P[0][0])} ${f1(P[0][1])}`; for (let i = 0; i < (cerrada ? n : n - 1); i++) { const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2); d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; } return d + (cerrada ? " Z" : ""); }
const show = (e, o) => e.setAttribute("opacity", f3(Math.max(0, Math.min(1, o))));
const vis = (e, on) => { const v = on ? "inline" : "none"; if (e._v !== v) { e.setAttribute("display", v); e._v = v; } };
const polil = (P, cada = 1) => { let d = `M${f1(P[0][0])} ${f1(P[0][1])}`; for (let i = cada; i < P.length; i += cada) d += ` L${f1(P[i][0])} ${f1(P[i][1])}`; const u = P[P.length - 1]; return d + ` L${f1(u[0])} ${f1(u[1])}`; };
function muestras(P, k = 8) {
  const n = P.length, R = [], q = (i) => P[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2);
    for (let s = 0; s < k; s++) { const t = s / k, t2 = t * t, t3 = t2 * t; R.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))); }
  }
  R.push(P[n - 1]); return R;
}
// la misma curva con puntos a la misma distancia, para recorrerla a velocidad pareja
function remuestrea(P, n) {
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const tot = L[L.length - 1], R = []; let j = 0;
  for (let k = 0; k < n; k++) { const s = (tot * k) / (n - 1); while (j < L.length - 2 && L[j + 1] < s) j++; const u = (s - L[j]) / (L[j + 1] - L[j] || 1); R.push([P[j][0] + (P[j + 1][0] - P[j][0]) * u, P[j][1] + (P[j + 1][1] - P[j][1]) * u]); }
  return { P: R, L: tot };
}
function en(C, u) { const x = K.lim(u) * (C.P.length - 1), i = Math.min(C.P.length - 2, Math.floor(x)), f = x - i; return [C.P[i][0] + (C.P[i + 1][0] - C.P[i][0]) * f, C.P[i][1] + (C.P[i + 1][1] - C.P[i][1]) * f]; }

// ---------- geometría compartida ----------
const FV = [540, 1000], OJ = [-3000, 1000], RE = [4000, 1000], CY = 7000;

// el corazón: a cada latido la sangre da un acelerón y luego afloja (56 latidos en el vídeo, uno en «latido»)
const P_H = TOTAL / 56, LAT0 = T.latido;
function H(g) { const x = (g - LAT0) / P_H, n = Math.floor(x), f = (x - n) * P_H; return LAT0 + P_H * (n + K.sale(K.lim(f / 0.45))); }
const pulso = (g) => 0.5 + 0.42 * sube(g, 36.4, T.saltitos) * (1 - sube(g, 40.9, 42.5));
export const latidos = (a, b) => { const r = []; for (let n = Math.ceil((a - LAT0) / P_H); LAT0 + n * P_H <= b; n++) r.push(LAT0 + n * P_H); return r; };
const uDe = (d, g) => fr(d.f + (d.n / TOTAL) * (g + pulso(g) * (H(g) - g)));

// los capilares alrededor del centro de la mirada: por ellos corren los puntitos (nunca a menos de 250 del centro)
const CAPS = (() => {
  const r = K.azar(31), C = [];
  for (let p = 0; p < 34; p++) {
    const th = (p / 34) * 2 * Math.PI + r() * 0.15, rad = 275 + r() * 400;
    let x = FV[0] + rad * Math.cos(th), y = FV[1] + rad * Math.sin(th) * 1.05;
    let dir = th + (Math.PI / 2) * (r() < 0.5 ? 1 : -1) + (r() - 0.5) * 0.9, cur = 0;
    const P = [[x, y]];
    for (let i = 0; i < 46; i++) {
      cur = cur * 0.85 + (r() - 0.5) * 0.22; dir += cur;
      const dx = x - FV[0], dy = y - FV[1], d = Math.hypot(dx, dy);
      if (d < 260) dir += angd(Math.atan2(dy, dx), dir) * 0.35;
      if (d > 720) dir += angd(Math.atan2(-dy, -dx), dir) * 0.25;
      x += 13 * Math.cos(dir); y += 13 * Math.sin(dir); P.push([x, y]);
    }
    C.push(remuestrea(P, 140));
  }
  return C;
})();
// el puntito que se sigue: un camino lento a la derecha del centro
const DCAM = remuestrea(muestras([[812, 690], [846, 785], [822, 880], [796, 962], [818, 1050], [856, 1130], [842, 1222], [804, 1306]], 10), 160);
export const DSTAR = { c: DCAM, n: 8, f: 0.17 };
const PUNTOS = [];
{ const r = K.azar(77); CAPS.forEach((c) => { const v0 = 160 + r() * 170, n = Math.max(4, Math.round((v0 * TOTAL) / c.L)), f = r(); PUNTOS.push({ c, n, f }, { c, n, f: f + 0.5 }); }); PUNTOS.push(DSTAR); }
export const posDe = (d, g) => en(d.c, uDe(d, g));
const envDe = (u) => Math.min(1, 2.4 * Math.sin(Math.PI * u));

// la red de vasos (la misma en el cielo, en el fondo del ojo y al final): dos arcadas que rodean el centro
const OD = [1290, 1040];
const ARC = [
  [OD, [1180, 820], [980, 640], [720, 560], [460, 590], [240, 700], [80, 900]],
  [OD, [1180, 1260], [980, 1440], [720, 1520], [460, 1490], [240, 1380], [80, 1180]],
];
const ARBOL = (() => {
  const r = K.azar(5), V = [];
  const rama = (P, w, n, tipo) => V.push({ d: curva(P), w, n, tipo });
  ARC.forEach((A, ai) => {
    [["v", 0, 15], ["a", 1, 10]].forEach(([tipo, j, w]) => {
      const P0 = A.map(([x, y], i) => (i === 0 ? [x - 10, y + (j ? 16 : -16) * (ai ? -1 : 1)] : [FV[0] + (x - FV[0]) * (j ? 0.93 : 1) + (r() - 0.5) * 16, FV[1] + (y - FV[1]) * (j ? 0.93 : 1) + (r() - 0.5) * 16]));
      rama(P0, w, 0, tipo);
      const C = remuestrea(muestras(P0, 8), 61).P;
      for (let b = 0; b < 8; b++) {
        const q = C[Math.round((0.12 + b * 0.105 + (r() - 0.5) * 0.03) * 60)], dx = q[0] - FV[0], dy = q[1] - FV[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
        if ((b + j) % 3 !== 2) {
          const rho = 248 + r() * 46, gi = (r() - 0.5) * 0.5, ex = FV[0] + rho * Math.cos(Math.atan2(uy, ux) + gi), ey = FV[1] + rho * Math.sin(Math.atan2(uy, ux) + gi);
          const mx = (q[0] + ex) / 2 - uy * (r() - 0.5) * 70, my = (q[1] + ey) / 2 + ux * (r() - 0.5) * 70;
          rama([q, [mx, my], [ex, ey]], tipo === "v" ? 6.5 : 4.8, 1, tipo);
          const ta = Math.atan2(ey - FV[1], ex - FV[0]);
          [-1, 1].forEach((s) => { const a2 = ta + s * (0.16 + r() * 0.12), r2 = rho - 8 + r() * 26; rama([[ex, ey], [FV[0] + (rho + 4) * Math.cos(ta + s * 0.08), FV[1] + (rho + 4) * Math.sin(ta + s * 0.08)], [FV[0] + r2 * Math.cos(a2), FV[1] + r2 * Math.sin(a2)]], 3, 2, tipo); });
        } else {
          const L = 220 + r() * 220, a = Math.atan2(uy, ux) + (r() - 0.5) * 0.7;
          rama([q, [q[0] + Math.cos(a) * L * 0.5 + (r() - 0.5) * 60, q[1] + Math.sin(a) * L * 0.5 + (r() - 0.5) * 60], [q[0] + Math.cos(a) * L, q[1] + Math.sin(a) * L]], tipo === "v" ? 8 : 6, 1, tipo);
        }
      }
    });
  });
  [-1, 1].forEach((s) => rama([[OD[0] - 30, OD[1] + s * 24], [920, 1000 + s * 60], [540 + 280, 1000 + s * 70]], 5, 1, s > 0 ? "v" : "a"));
  return V;
})();

// ---------- cámara ----------
export function pantalla(k, wx, wy) { return [540 + (wx - k.x) * k.z, 1000 + (wy - k.y) * k.z]; }
export function camara(s, claves) {
  const n = claves.length, Tt = claves.map((c) => c[0]);
  if (s <= Tt[0]) return { ...claves[0][1] };
  if (s >= Tt[n - 1]) return { ...claves[n - 1][1] };
  let i = 1; while (s > Tt[i]) i++;
  const r = {};
  for (const key of ["x", "y", "z"]) {
    const v = claves.map((c) => (key === "z" ? Math.log(c[1].z) : c[1][key]));
    const d = (j) => (v[j + 1] - v[j]) / (Tt[j + 1] - Tt[j]);
    const m = (j) => { if (j <= 0 || j >= n - 1) return 0; const a = d(j - 1), b = d(j), h0 = Tt[j] - Tt[j - 1], h1 = Tt[j + 1] - Tt[j]; if (a * b <= 0) return 0; return (3 * (h0 + h1)) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b); };
    const h = Tt[i] - Tt[i - 1], u = (s - Tt[i - 1]) / h, u2 = u * u, u3 = u2 * u;
    const val = (2 * u3 - 3 * u2 + 1) * v[i - 1] + (u3 - 2 * u2 + u) * h * m(i - 1) + (-2 * u3 + 3 * u2) * v[i] + (u3 - u2) * h * m(i);
    r[key] = key === "z" ? Math.exp(val) : val;
  }
  return r;
}
const F0 = { x: 540, y: 1000, z: 1.2 };
const pd = (g, z) => { const [x, y] = posDe(DSTAR, g); return { x, y, z }; };
const CAMINO = [
  [0, F0], [T.son, { x: 575, y: 1000, z: 1.3 }], [3.6, pd(3.6, 1.9)], [4.59, pd(4.4, 2.05)],
  [4.6, { x: OJ[0], y: OJ[1] + 6, z: 0.97 }], [T.moviendose, { x: OJ[0], y: OJ[1] - 4, z: 1.07 }], [T.ojo, { x: OJ[0], y: OJ[1] - 10, z: 11 }], [9.36, { x: OJ[0], y: OJ[1] - 10, z: 14 }],
  [9.37, { x: RE[0], y: RE[1] + 20, z: 1.06 }], [T.luz2, { x: RE[0], y: RE[1] + 80, z: 1.12 }], [T.cruzar, { x: RE[0], y: RE[1] + 388, z: 2.1 }], [12.75, { x: RE[0], y: RE[1] + 388, z: 22.8 }], [14.43, { x: RE[0], y: RE[1] + 388, z: 24.5 }],
  [14.44, F0], [T.siempre, { x: 540, y: 1000, z: 1.22 }], [18.3, { x: 790, y: 905, z: 1.26 }], [19.01, { x: 830, y: 885, z: 1.75 }],
  [19.02, { x: 540, y: CY + 38, z: 1.12 }], [20.3, { x: 540, y: CY + 38, z: 1.3 }], [33.0, { x: 540, y: CY + 38, z: 1.33 }], [33.94, { x: 540, y: CY + 38, z: 0.78 }],
  [33.96, pd(33.96, 1.65)], [35.4, { x: 610, y: 1000, z: 1.25 }], [40.85, { x: 545, y: 1000, z: 1.17 }],
  [40.86, { x: 540, y: 1000, z: 0.96 }], [42.0, { x: 540, y: 1000, z: 0.88 }], [45.65, { x: 540, y: 1000, z: 0.85 }],
  [45.66, { x: 540, y: 1000, z: 0.85 }], [47.6, { x: 540, y: 1000, z: 1.05 }], [TOTAL, F0],
];
// en el capilar la cámara va con el glóbulo blanco
const CAP = { R: 78, S: 118, V: 300, X0: -1515 };
const libre = (i, g) => CAP.X0 + i * CAP.S + (i > 0 ? 60 : i < 0 ? -60 : 0) + CAP.V * (g - G0.capilar);
export const blanco = (g) => libre(0, g) - 160 * rampa(g, 25.9, 26.9);
const capX = (g) => 540 + 300 * rampa(g, 25.2, 26.0) - 160 * rampa(g, 25.9, 26.9);
// cada escena interpola solo sus claves: los cortes no tiran de la cámara de al lado
const BORDES = Object.values(G0).sort((a, b) => a - b).concat([TOTAL + 1]);
const TRAMOS = BORDES.slice(0, -1).map((a, i) => CAMINO.filter(([t]) => t >= a && t < BORDES[i + 1]));
export const camaraEn = (g) => { let i = 0; while (i < TRAMOS.length - 1 && g >= BORDES[i + 1]) i++; const k = camara(g, TRAMOS[i]); if (g >= G0.capilar && g < G0.cielo) k.x = capX(g); return k; };

// ---------- el cielo ----------
function cieloMundo(cam) {
  const G = el(cam, "g");
  el(G, "rect", { x: -2200, y: -1600, width: 5400, height: 5400, fill: "url(#c-cielo)" });
  el(G, "circle", { cx: 1080, cy: 430, r: 780, fill: "url(#c-sol)", opacity: 0.5 });
  const r = K.azar(12), nubes = [];
  for (let i = 0; i < 16; i++) {
    const cx = -800 + r() * 2700, cy = 150 + r() * 1900, s = 0.7 + r() * 0.9;
    const n = el(G, "g", { opacity: f3(0.3 + r() * 0.35) });
    for (let j = 0; j < 6; j++) el(n, "ellipse", { cx: f1(cx + (r() - 0.5) * 360 * s), cy: f1(cy + (r() - 0.5) * 90 * s), rx: f1((110 + r() * 130) * s), ry: f1((55 + r() * 60) * s), fill: "url(#c-nube)" });
    nubes.push({ n, w: r() * 6.28, a: 18 + r() * 24 });
  }
  const rojo = el(G, "g", { opacity: 0 });
  CAPS.forEach((c) => el(rojo, "path", { d: polil(c.P, 3), fill: "none", stroke: "rgba(196,26,46,0.85)", "stroke-width": 4.5, "stroke-linecap": "round" }));
  const PG = el(G, "g"), colas = el(PG, "g"), halos = el(PG, "g"), nucs = el(PG, "g");
  const P = PUNTOS.map((d) => ({ d, cola: el(colas, "polyline", { fill: "none", stroke: "rgba(8,22,64,0.3)", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }), halo: el(halos, "circle", { r: 21, fill: "url(#c-punto-b)" }), nuc: el(nucs, "circle", { r: 5, fill: "#ffffff" }) }));
  return (g) => {
    const on = g < G0.ojo || (g >= G0.sombra && g < G0.capilar) || g >= G0.cielo;
    vis(G, on); if (!on) return;
    nubes.forEach((c) => c.n.setAttribute("transform", `translate(${f1(c.a * Math.sin(vuelta(g, 0.03) + c.w))} 0)`));
    const ro = g < 47 ? sube(g, T.vasos - 0.3, T.vasos + 0.5) * (1 - sube(g, T.asi, T.asi + 0.6)) : sube(g, T.traves, T.traves + 0.7) * (1 - sube(g, 50.35, 50.8));
    vis(rojo, ro > 0.001); show(rojo, ro * 0.8);
    const po = g < G0.ojo || g >= G0.cielo; vis(PG, po); if (!po) return;
    P.forEach((p, i) => {
      const u = uDe(p.d, g), e = envDe(u), [x, y] = en(p.d.c, u);
      const du = fr(u - uDe(p.d, g - 0.04) + 0.5) - 0.5, v = (Math.abs(du) * p.d.c.L) / 0.04, tl = Math.min(52, 14 + 0.12 * v) / p.d.c.L;
      let pts = ""; for (let k = 0; k <= 5; k++) { const q = en(p.d.c, u - (tl * k) / 5); pts += `${f1(q[0])},${f1(q[1])} `; }
      p.cola.setAttribute("points", pts); show(p.cola, e * 0.8);
      p.halo.setAttribute("cx", f1(x)); p.halo.setAttribute("cy", f1(y)); show(p.halo, e * 0.95);
      p.nuc.setAttribute("cx", f1(x)); p.nuc.setAttribute("cy", f1(y)); p.nuc.setAttribute("r", f2(4.6 + 0.8 * Math.sin(g * 9 + i))); show(p.nuc, e);
    });
  };
}

// ---------- la red de vasos, dibujada de tres maneras ----------
function arbolEn(padre, modo) {
  const G = el(padre, "g");
  if (modo === "fantasma") {
    [0, 1, 2].forEach((n) => el(G, "path", { d: ARBOL.filter((v) => v.n === n).map((v) => v.d).join(" "), fill: "none", stroke: "rgba(255,255,255,0.75)", "stroke-width": [5, 3.5, 2.5][n], "stroke-dasharray": "14 12", "stroke-linecap": "round" }));
    return { G };
  }
  if (modo === "fondo") {
    ["v", "a"].forEach((t) => [0, 1, 2].forEach((n) => el(G, "path", { d: ARBOL.filter((v) => v.n === n && v.tipo === t).map((v) => v.d).join(" "), fill: "none", stroke: t === "v" ? "#7c1020" : "#b0262c", "stroke-width": ARBOL.find((v) => v.n === n && v.tipo === t).w * 1.2, "stroke-linecap": "round" })));
    const flujo = el(G, "path", { d: ARBOL.filter((v) => v.n < 2).map((v) => v.d).join(" "), fill: "none", stroke: "rgba(255,140,120,0.85)", "stroke-width": 4, "stroke-dasharray": "6 34", "stroke-linecap": "round" });
    return { G, flujo };
  }
  const col = modo === "oscuro" ? { v: "rgba(16,12,38,0.62)", a: "rgba(16,12,38,0.5)" } : { v: "#8e1424", a: "#c42a36" };
  const P = ARBOL.map((v) => ({ v, e: el(G, "path", { d: v.d, fill: "none", stroke: col[v.tipo], "stroke-width": v.w, "stroke-linecap": "round", pathLength: 1, "stroke-dasharray": "0 1" }) }));
  let flujo = null;
  if (modo === "sangre") flujo = ARBOL.filter((v) => v.n < 2).map((v) => ({ v, e: el(G, "path", { d: v.d, fill: "none", stroke: "rgba(255,150,140,0.9)", "stroke-width": v.n ? 2.5 : 4, "stroke-dasharray": "5 30", "stroke-linecap": "round" }) }));
  const dibuja = (p) => P.forEach(({ v, e }) => { const q = K.lim((p - [0, 0.3, 0.55][v.n]) / 0.45); vis(e, q > 0.004); if (q > 0.004) e.setAttribute("stroke-dasharray", `${f3(q)} 1`); });
  return { G, dibuja, flujo };
}

// ---------- el ojo de frente ----------
const bz = (P, t) => { const m = 1 - t; return [0, 1].map((c) => m * m * m * P[0][c] + 3 * m * m * t * P[1][c] + 3 * m * t * t * P[2][c] + t * t * t * P[3][c]); };
const bzd = (P, t) => { const m = 1 - t; return [0, 1].map((c) => 3 * m * m * (P[1][c] - P[0][c]) + 6 * m * t * (P[2][c] - P[1][c]) + 3 * t * t * (P[3][c] - P[2][c])); };
const ARR = [[-470, 20], [-300, -235], [280, -255], [470, 0]], ABA = [[470, 0], [300, 215], [-280, 225], [-470, 20]];
function ojoFrente(cam, D) {
  const G = el(cam, "g", { transform: `translate(${OJ[0]} ${OJ[1]})` }), r = K.azar(21);
  el(G, "rect", { x: -1000, y: -1200, width: 2000, height: 2400, fill: "url(#c-piel)" });
  for (let i = 0; i < 260; i++) el(G, "circle", { cx: f1((r() - 0.5) * 1500), cy: f1((r() - 0.5) * 1300), r: f1(1.5 + r() * 2.5), fill: r() < 0.5 ? "rgba(110,52,34,0.13)" : "rgba(255,225,205,0.1)" });
  el(G, "ellipse", { cx: 0, cy: -15, rx: 720, ry: 440, fill: "url(#c-cuenca)" });
  el(G, "path", { d: "M -540 -50 C -370 -350, 350 -370, 540 -70", fill: "none", stroke: "rgba(92,44,28,0.5)", "stroke-width": 13, "stroke-linecap": "round" });
  el(G, "path", { d: "M -520 -85 C -360 -375, 340 -392, 520 -105", fill: "none", stroke: "rgba(255,222,200,0.13)", "stroke-width": 10, "stroke-linecap": "round" });
  const ALM = `M ${ARR[0]} C ${ARR[1]} ${ARR[2]} ${ARR[3]} C ${ABA[1]} ${ABA[2]} ${ABA[3]} Z`.replace(/,/g, " ");
  el(el(D, "clipPath", { id: `${PRE}almendra` }), "path", { d: ALM });
  const dentro = el(G, "g", { "clip-path": "url(#c-almendra)" });
  el(dentro, "rect", { x: -490, y: -270, width: 980, height: 520, fill: "url(#c-esclera)" });
  el(dentro, "ellipse", { cx: -440, cy: 16, rx: 48, ry: 36, fill: "#d98884", opacity: 0.92 });
  el(dentro, "ellipse", { cx: 455, cy: 2, rx: 34, ry: 26, fill: "#e0a39b", opacity: 0.6 });
  for (let v = 0; v < 14; v++) {
    const s = v % 2 ? 1 : -1; let x = s * (410 + r() * 50), y = (r() - 0.5) * 140, a = s > 0 ? Math.PI : 0;
    const P = [[x, y]];
    for (let i = 0; i < 9; i++) { a += (r() - 0.5) * 0.9 + angd(Math.atan2(-y * 0.4 - y, s * 240 - x), a) * 0.25; x += Math.cos(a) * 22; y += Math.sin(a) * 22; P.push([x, y]); if (Math.abs(x) < 245) break; }
    el(dentro, "path", { d: curva(P), fill: "none", stroke: "rgba(176,34,46,0.45)", "stroke-width": f1(1.4 + r() * 1.8), "stroke-linecap": "round" });
  }
  const iris = el(dentro, "g", { transform: "translate(0 -10)" });
  el(iris, "circle", { r: 230, fill: "url(#c-iris)" });
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * 2 * Math.PI + (r() - 0.5) * 0.03, r0 = 100 + r() * 12, r1 = 205 + r() * 20, w = (r() - 0.5) * 0.06;
    el(iris, "path", { d: `M${f1(r0 * Math.cos(a))} ${f1(r0 * Math.sin(a))} Q${f1(((r0 + r1) / 2) * Math.cos(a + w))} ${f1(((r0 + r1) / 2) * Math.sin(a + w))} ${f1(r1 * Math.cos(a))} ${f1(r1 * Math.sin(a))}`, fill: "none", stroke: i % 2 ? "rgba(255,214,140,0.24)" : "rgba(48,30,12,0.3)", "stroke-width": f1(1.6 + r() * 1.8) });
  }
  el(iris, "path", { d: curva(Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * 2 * Math.PI, rr = 140 + 9 * Math.sin(a * 7) + (r() - 0.5) * 6; return [rr * Math.cos(a), rr * Math.sin(a)]; }), true), fill: "none", stroke: "rgba(238,196,118,0.5)", "stroke-width": 5 });
  for (let i = 0; i < 16; i++) { const a = r() * 6.28, rr = 155 + r() * 50; el(iris, "ellipse", { cx: f1(rr * Math.cos(a)), cy: f1(rr * Math.sin(a)), rx: f1(5 + r() * 8), ry: f1(3 + r() * 4), transform: `rotate(${f1((a * 180) / Math.PI)} ${f1(rr * Math.cos(a))} ${f1(rr * Math.sin(a))})`, fill: "rgba(36,24,10,0.38)" }); }
  el(iris, "circle", { r: 225, fill: "none", stroke: "rgba(24,18,10,0.85)", "stroke-width": 12 });
  el(iris, "circle", { r: 95, fill: "#040405" });
  // el fondo del ojo, que se ve por la pupila: la misma red de vasos, en pequeño
  el(el(D, "clipPath", { id: `${PRE}pupila` }), "circle", { r: 95 });
  const fondo = el(iris, "g", { "clip-path": "url(#c-pupila)", opacity: 0 });
  el(fondo, "circle", { r: 96, fill: "url(#c-fondo-ojo)" });
  const fz = el(fondo, "g", { transform: "scale(0.12) translate(-540 -1000)" });
  el(fz, "circle", { cx: OD[0], cy: OD[1], r: 120, fill: "url(#c-papila)" });
  el(fz, "circle", { cx: FV[0], cy: FV[1], r: 200, fill: "url(#c-mancha)" });
  CAPS.forEach((c) => el(fz, "path", { d: polil(c.P, 3), fill: "none", stroke: "rgba(150,20,24,0.7)", "stroke-width": 4, "stroke-linecap": "round" }));
  const fa = arbolEn(fz, "fondo");
  const gotas = PUNTOS.map((d) => ({ d, e: el(fz, "circle", { r: 8, fill: "#ff7a6a" }) }));
  el(fz, "circle", { cx: FV[0], cy: FV[1], r: 9, fill: "rgba(255,240,220,0.8)" });
  const brillo = el(iris, "circle", { r: 95, fill: "url(#c-reflejo)", opacity: 0 });
  el(iris, "circle", { r: 96, fill: "none", stroke: "rgba(0,0,0,0.55)", "stroke-width": 6 });
  const refl = el(iris, "g");
  el(refl, "ellipse", { cx: -66, cy: -84, rx: 52, ry: 32, transform: "rotate(-18 -66 -84)", fill: "rgba(205,232,255,0.7)" });
  el(refl, "ellipse", { cx: 60, cy: 70, rx: 12, ry: 8, fill: "rgba(255,255,255,0.5)" });
  el(dentro, "path", { d: `M ${ARR[0]} C ${ARR[1]} ${ARR[2]} ${ARR[3]}`.replace(/,/g, " "), fill: "none", stroke: "rgba(60,26,18,0.32)", "stroke-width": 74 });
  el(dentro, "path", { d: `M ${ARR[0]} C ${ARR[1]} ${ARR[2]} ${ARR[3]}`.replace(/,/g, " "), fill: "none", stroke: "rgba(40,16,10,0.35)", "stroke-width": 26 });
  el(G, "path", { d: `M ${ABA[0]} C ${ABA[1]} ${ABA[2]} ${ABA[3]}`.replace(/,/g, " "), fill: "none", stroke: "rgba(110,52,38,0.5)", "stroke-width": 16 });
  el(G, "path", { d: `M ${ABA[0]} C ${ABA[1]} ${ABA[2]} ${ABA[3]}`.replace(/,/g, " "), fill: "none", stroke: "rgba(240,170,158,0.9)", "stroke-width": 6 });
  el(G, "path", { d: `M ${ARR[0]} C ${ARR[1]} ${ARR[2]} ${ARR[3]}`.replace(/,/g, " "), fill: "none", stroke: "#4a2216", "stroke-width": 11, "stroke-linecap": "round" });
  const pest = (B, n, l0, l1, w, col, sgn) => { for (let i = 0; i < n; i++) {
    const t = 0.05 + (0.9 * (i + r() * 0.6)) / n, [sx, sy] = bz(B, t), [tx, ty] = bzd(B, t), L = Math.hypot(tx, ty), nx = (ty / L) * sgn, ny = (-tx / L) * sgn, len = l0 + r() * (l1 - l0) * Math.sin(Math.PI * t) + l0 * 0.3;
    const lado = (t - 0.5) * 1.1 * len, ex = sx + nx * len + (tx / L) * lado, ey = sy + ny * len + (ty / L) * lado;
    el(G, "path", { d: `M${f1(sx)} ${f1(sy)} Q${f1(sx + nx * len * 0.7)} ${f1(sy + ny * len * 0.7)} ${f1(ex)} ${f1(ey - (sgn > 0 ? len * 0.15 : 0))}`, fill: "none", stroke: col, "stroke-width": w, "stroke-linecap": "round" });
  } };
  pest(ARR, 52, 55, 100, 4.5, "#170d09", 1);
  pest(ABA, 34, 22, 42, 2.6, "rgba(30,18,12,0.75)", 1);
  return (g, k) => {
    const on = g >= G0.ojo && g < G0.retina; vis(G, on); if (!on) return;
    const rojo = sube(g, T.sangre - 0.1, T.sangre + 0.35);
    show(fondo, rojo); show(brillo, rojo * (0.85 - 0.75 * K.lim((k.z - 1.5) / 3)));
    show(refl, 1 - K.lim((k.z - 1.4) / 2));
    fa.flujo.setAttribute("stroke-dashoffset", f1(-g * 120));
    if (rojo > 0) gotas.forEach((p) => { const u = uDe(p.d, g), [x, y] = en(p.d.c, u); p.e.setAttribute("cx", f1(x)); p.e.setAttribute("cy", f1(y)); show(p.e, envDe(u)); });
  };
}

// ---------- el ojo cortado y la retina de cerca ----------
const arco = (rr, a0, a1) => { const p = (a) => [rr * Math.cos((a * Math.PI) / 180), rr * Math.sin((a * Math.PI) / 180)], [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${f1(x0)} ${f1(y0)} A${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f1(x1)} ${f1(y1)}`; };
const VASOS = [[-380, -250, 70], [60, -250, 95], [420, -250, 60]];
function corteOjo(cam) {
  const G = el(cam, "g", { transform: `translate(${RE[0]} ${RE[1]})` }), r = K.azar(44);
  const lejos = el(G, "g");
  el(lejos, "rect", { x: -1400, y: -1500, width: 2800, height: 2900, fill: "url(#c-lejos)" });
  el(lejos, "circle", { r: 398, fill: "url(#c-vitreo)" });
  el(lejos, "path", { d: "M -95 410 C -110 520, -130 640, -150 800 L -300 800 C -270 640, -245 520, -205 392 Z", fill: "#e6d6c4", stroke: "rgba(170,140,120,0.7)", "stroke-width": 4 });
  el(lejos, "path", { d: "M -150 400 C -165 520, -185 640, -215 800", fill: "none", stroke: "#b8262c", "stroke-width": 9 });
  el(lejos, "path", { d: arco(422, -55, 235), fill: "none", stroke: "#ebe4dc", "stroke-width": 18 });
  el(lejos, "path", { d: arco(408, -52, 232), fill: "none", stroke: "#6b1c1a", "stroke-width": 10 });
  el(lejos, "path", { d: arco(396, -48, 228), fill: "none", stroke: "#d9694c", "stroke-width": 12 });
  el(lejos, "path", { d: arco(390, -46, 226), fill: "none", stroke: "rgba(255,190,160,0.45)", "stroke-width": 2 });
  el(lejos, "path", { d: "M -241 -345 Q 0 -600 241 -345", fill: "rgba(170,220,255,0.08)", stroke: "rgba(170,220,255,0.65)", "stroke-width": 9 });
  el(lejos, "path", { d: "M -236 -340 L -94 -318", stroke: "#6b4a2a", "stroke-width": 20, "stroke-linecap": "round" });
  el(lejos, "path", { d: "M 236 -340 L 94 -318", stroke: "#6b4a2a", "stroke-width": 20, "stroke-linecap": "round" });
  el(lejos, "ellipse", { cx: 0, cy: -270, rx: 112, ry: 50, fill: "rgba(220,235,255,0.16)", stroke: "rgba(220,235,255,0.55)", "stroke-width": 4 });
  const cy = (x) => { const s = (x / 241 + 1) / 2; return -345 * ((1 - s) ** 2 + s * s) - 1200 * s * (1 - s); };
  const rayos = [-3, -2, -1, 0, 1, 2, 3].map((i) => { const x = i * 68, d = `M${x} -900 L${x} ${f1(cy(x))} L${f1(x * 0.62)} -270 L0 392`;
    return { i, a: el(lejos, "path", { d, fill: "none", stroke: "rgba(95,212,255,0.25)", "stroke-width": 14, pathLength: 1, "stroke-linejoin": "round" }), b: el(lejos, "path", { d, fill: "none", stroke: CIAN, "stroke-width": 4, pathLength: 1, "stroke-linejoin": "round" }) }; });
  const fov = el(lejos, "circle", { cx: 0, cy: 392, r: 80, fill: "url(#c-punto-c)", opacity: 0 });
  // de cerca: la luz baja, choca con los vasos y deja a la sombra los conos de debajo
  const cerca = el(G, "g", { transform: "translate(0 388) scale(0.041667)" });
  el(cerca, "rect", { x: -2600, y: -3200, width: 5200, height: 2790, fill: "#0c1522" });
  [[-420, 90, "#3a2734"], [-330, 270, "#2c1f2b"], [-60, 120, "#261a27"], [60, 90, "#2b1f2c"], [150, 80, "#241a29"], [230, 200, "#1c1420"], [430, 50, "#3a2015"], [480, 2800, "#4a1414"]].forEach(([y, h, c]) => el(cerca, "rect", { x: -2600, y, width: 5200, height: h, fill: c }));
  for (let i = 0; i < 5; i++) el(cerca, "path", { d: curva(Array.from({ length: 37 }, (_, j) => [-2600 + j * 145, -405 + i * 16 + (r() - 0.5) * 8])), fill: "none", stroke: "rgba(255,190,205,0.12)", "stroke-width": 4 });
  for (let x = -2570; x < 2600; x += 72) el(cerca, "circle", { cx: f1(x + (r() - 0.5) * 20), cy: f1(-150 + (r() - 0.5) * 40), r: 22, fill: "rgba(220,160,190,0.16)", stroke: "rgba(255,200,220,0.22)", "stroke-width": 3 });
  [[-30, 0], [20, 15], [180, 0], [205, 14]].forEach(([y, o]) => { for (let x = -2590 + o; x < 2600; x += 30) el(cerca, "circle", { cx: f1(x), cy: f1(y + (r() - 0.5) * 8), r: 11, fill: "rgba(186,140,204,0.2)" }); });
  for (let i = 0; i < 18; i++) el(cerca, "ellipse", { cx: f1(-2400 + r() * 4800), cy: f1(560 + r() * 200), rx: f1(60 + r() * 60), ry: f1(26 + r() * 20), fill: "rgba(120,20,24,0.6)" });
  const sombras = VASOS.map(([x, y, rr]) => el(cerca, "rect", { x: x - rr, y, width: 2 * rr, height: 430 - y, fill: "url(#c-sombra-v)", opacity: 0 }));
  const vasos = VASOS.map(([x, y, rr]) => { const g = el(cerca, "g", { transform: `translate(${x} ${y})` }); el(g, "circle", { r: rr, fill: "rgba(110,18,28,0.9)", stroke: "#d88b7d", "stroke-width": 12 });
    const cs = [0, 1, 2, 3].map(() => el(g, "ellipse", { rx: f1(rr * 0.36), ry: f1(rr * 0.3), fill: "url(#c-rbc)" })); return { rr, cs }; });
  const CONOS = Array.from({ length: 90 }, (_, k) => -2492 + 56 * k);
  const FORMA = "M -17 18 C -17 -2, 17 -2, 17 18 L 8 186 C 8 194, -8 194, -8 186 Z";
  const conos = CONOS.map((x) => { const g = el(cerca, "g", { transform: `translate(${x} 232)` }); el(g, "path", { d: FORMA, fill: "url(#c-cono)" }); const l = el(g, "path", { d: FORMA, fill: "url(#c-cono-luz)", opacity: 0 }); const h = el(g, "ellipse", { cx: 0, cy: 30, rx: 40, ry: 60, fill: "url(#c-punto-c)", opacity: 0 }); return { l, h }; });
  const tope = (x) => { for (const [vx, vy, rr] of VASOS) if (Math.abs(x - vx) < rr * 0.95) return vy - Math.sqrt(rr * rr - (x - vx) ** 2); return 232; };
  const haces = CONOS.map((x) => ({ x, y1: tope(x), a: el(cerca, "line", { x1: x, x2: x, y1: -3200, y2: -3200, stroke: "rgba(95,212,255,0.2)", "stroke-width": 16 }), b: el(cerca, "line", { x1: x, x2: x, y1: -3200, y2: -3200, stroke: CIAN, "stroke-width": 4, "stroke-dasharray": "40 22" }), c: el(cerca, "circle", { cx: x, cy: tope(x), r: 34, fill: "url(#c-punto-c)", opacity: 0 }) }));
  return (g, k) => {
    const on = g >= G0.retina && g < G0.sombra; vis(G, on); if (!on) return;
    const oc = K.suave(K.lim((Math.log(k.z) - Math.log(5)) / (Math.log(11) - Math.log(5))));
    vis(lejos, oc < 0.999); vis(cerca, oc > 0.001); show(cerca, oc);
    if (oc < 0.999) {
      rayos.forEach((p) => { const q = sube(g, T.antes + Math.abs(p.i) * 0.04, 10.35 + Math.abs(p.i) * 0.04); p.a.setAttribute("stroke-dasharray", `${f3(q)} 1`); p.b.setAttribute("stroke-dasharray", `${f3(q)} 1`); });
      show(fov, sube(g, T.fondo - 0.05, T.fondo + 0.3) * (0.75 + 0.25 * Math.sin(g * 7)));
    }
    if (oc > 0.001) {
      const yb = -3200 + sube(g, 12.2, 13.2) * 3460;
      haces.forEach((h, j) => {
        const y = Math.min(yb, h.y1); h.a.setAttribute("y2", f1(y)); h.b.setAttribute("y2", f1(y)); h.b.setAttribute("stroke-dashoffset", f1(-((g * 520) % 62)));
        const llega = K.lim((yb - h.y1) / 60);
        if (h.y1 < 232) show(h.c, llega * (0.75 + 0.2 * Math.sin(g * 11 + j))); else { show(h.c, 0); show(conos[j].l, llega * 0.9); show(conos[j].h, llega * 0.8); }
      });
      const so = sube(g, 12.9, 13.4); sombras.forEach((s) => show(s, so));
      vasos.forEach((v, i) => v.cs.forEach((c, j) => { const a = g * (0.9 + i * 0.2) + (j * Math.PI) / 2, rr = v.rr * 0.48; c.setAttribute("transform", `translate(${f1(rr * Math.cos(a))} ${f1(rr * 0.8 * Math.sin(a))}) rotate(${f1(a * 40)})`); }));
    }
  };
}

// ---------- el capilar por dentro ----------
// las piezas viven en <defs> para poder verlas dos veces: en el mundo (escena capilar) y en la lupa del principio
function capilar(cam, D) {
  const C = el(D, "g", { id: `${PRE}capilar` });
  const W = el(cam, "g"); el(W, "use").setAttribute("href", `#${PRE}capilar`);
  const fondo = el(C, "rect", { y: CY - 1300, width: 2600, height: 2600, fill: "#1c0f18" });
  const tej = el(C, "rect", { y: CY - 1300, width: 2600, height: 2600, fill: "url(#c-tejido)" });
  const lluvia = el(C, "rect", { y: CY - 700, width: 2600, height: 610, fill: "url(#c-lluvia)", opacity: 0 });
  const plasma = el(C, "path", { fill: "rgba(255,205,150,0.10)" });
  const NB = 26, haces = Array.from({ length: NB }, () => ({ a: el(C, "line", { stroke: "rgba(95,212,255,0.2)", "stroke-width": 14 }), b: el(C, "line", { stroke: CIAN, "stroke-width": 4, "stroke-dasharray": "26 18" }), dn: el(C, "line", { stroke: "rgba(95,212,255,0.32)", "stroke-width": 14 }), dc: el(C, "line", { stroke: CIAN, "stroke-width": 4, "stroke-dasharray": "26 18" }), im: el(C, "circle", { r: 20, fill: "url(#c-punto-c)" }) }));
  const FORMA = "M -19 16 C -19 -3, 19 -3, 19 16 L 9 104 C 9 111, -9 111, -9 104 Z";
  const conos = Array.from({ length: NB }, () => { const g = el(C, "g"); el(g, "path", { d: FORMA, fill: "url(#c-cono)" }); const l = el(g, "path", { d: FORMA, fill: "url(#c-cono-luz)" }); const h = el(g, "ellipse", { cx: 0, cy: 22, rx: 44, ry: 56, fill: "url(#c-punto-c)" }); return { g, l, h }; });
  const NR = 40, rojos = Array.from({ length: NR }, () => { const g = el(C, "g"); el(g, "ellipse", { rx: 58, ry: 54, fill: "url(#c-rbc)" }); el(g, "ellipse", { cx: -16, cy: -20, rx: 20, ry: 11, fill: "rgba(255,200,205,0.28)" }); return g; });
  const wb = el(C, "g"), cuerpo = el(wb, "path", { fill: "url(#c-wbc)", stroke: "rgba(255,255,255,0.65)", "stroke-width": 3 }), r = K.azar(8);
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, rr = Math.sqrt(r()); el(wb, "circle", { cx: f1(rr * 95 * Math.cos(a)), cy: f1(rr * 56 * Math.sin(a)), r: f1(3 + r() * 3), fill: "rgba(150,118,205,0.5)" }); }
  const nuc = el(wb, "g"); [[-40, 8, 30], [0, -14, 34], [42, 8, 28]].forEach(([x, y, rr]) => el(nuc, "circle", { cx: x, cy: y, r: rr, fill: "url(#c-nucleo)", opacity: 0.88 }));
  const pared = [el(C, "path", { fill: "url(#c-pared)", stroke: "rgba(255,210,195,0.6)", "stroke-width": 2 }), el(C, "path", { fill: "url(#c-pared)", stroke: "rgba(255,210,195,0.6)", "stroke-width": 2 })];
  const nucleos = Array.from({ length: 16 }, () => el(C, "ellipse", { rx: 42, ry: 8, fill: "rgba(112,60,142,0.6)" }));
  const flash = el(C, "circle", { fill: "none", stroke: CIAN, "stroke-width": 6, opacity: 0 }), spot = el(C, "circle", { r: 150, fill: "url(#c-punto-c)", opacity: 0 });
  const dibuja = (g, vx, med) => {
    const a = vx - med, b = vx + med, w = blanco(g), hayW = w > a - 300 && w < b + 300;
    [fondo, tej, lluvia].forEach((e) => e.setAttribute("x", f1(vx - 1300)));
    const R = (x) => CAP.R + (hayW ? 12 * Math.exp(-(((x - w) / 170) ** 2)) : 0);
    const xs = []; for (let x = a - 80; x <= b + 120; x += 40) xs.push(x);
    const top = xs.map((x) => [x, CY - R(x)]), bot = xs.map((x) => [x, CY + R(x)]);
    plasma.setAttribute("d", polil(top) + " L" + bot.slice().reverse().map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L") + " Z");
    pared[0].setAttribute("d", polil(top) + " L" + top.slice().reverse().map((p) => `${f1(p[0])} ${f1(p[1] - 20)}`).join(" L") + " Z");
    pared[1].setAttribute("d", polil(bot) + " L" + bot.slice().reverse().map((p) => `${f1(p[0])} ${f1(p[1] + 20)}`).join(" L") + " Z");
    let nn = 0; for (let m = Math.ceil((a - 300) / 260); m * 260 + 90 < b + 300 && nn < 16; m++) { const x = m * 260 + 90 + (m % 2) * 130, s = m % 2 ? -1 : 1; nucleos[nn].setAttribute("cx", f1(x)); nucleos[nn].setAttribute("cy", f1(CY + s * (R(x) + 10))); vis(nucleos[nn++], 1); } for (; nn < 16; nn++) vis(nucleos[nn], 0);
    // los glóbulos rojos: delante, sueltos; detrás, frenados por el blanco y apretados de canto
    const cel = [], usados = new Set();
    for (let i = -60; i <= 40; i++) {
      if (i === 0) continue;
      const fl = libre(i, g), x = i < 0 ? blando(fl, w - 149 - (-1 - i) * 70) : fl;
      if (x < a - 120 || x > b + 120) continue;
      const comp = K.lim((fl - x) / 40), rx = 58 - 27 * comp; cel.push([x, rx]);
      const j = ((i % NR) + NR) % NR; usados.add(j);
      rojos[j].setAttribute("transform", `translate(${f1(x)} ${f1(CY + 6 * Math.sin(g * 2.3 + i * 1.7))}) rotate(${f1((5 + 9 * comp) * Math.sin(g * 3 + i))}) scale(${f3(rx / 58)} 1)`);
    }
    rojos.forEach((e, j) => vis(e, usados.has(j)));
    vis(wb, hayW);
    if (hayW) {
      cuerpo.setAttribute("d", curva(Array.from({ length: 32 }, (_, i) => { const t = (i / 32) * 2 * Math.PI, m = 1 + 0.035 * Math.sin(3 * t + 2.1 * g) + 0.025 * Math.sin(5 * t - 1.3 * g); return [115 * m * Math.cos(t), 72 * m * Math.sin(t)]; }), true));
      wb.setAttribute("transform", `translate(${f1(w)} ${f1(CY + 4 * Math.sin(g * 1.7))})`); nuc.setAttribute("transform", `rotate(${f1(4 * Math.sin(g * 1.1))})`);
    }
    // la luz azul: cae de arriba; lo que tapa un glóbulo rojo se lo traga, lo que pasa por el hueco llega a los conos
    const arriba = sube(g, T.tragan, T.tragan + 0.4), abajo = sube(g, 29.9, 30.6);
    show(lluvia, arriba);
    let nb = 0;
    for (let m = Math.ceil((a - 40) / 66); m * 66 <= b + 40 && nb < NB; m++, nb++) {
      const x = m * 66; let Tr = 1;
      for (const [cx, rx] of cel) { const u = 1 - ((x - cx) / rx) ** 2; if (u > 0) Tr *= 1 - 0.96 * K.lim(1.5 * Math.sqrt(u)); }
      if (hayW) { const u = 1 - ((x - w) / 115) ** 2; if (u > 0) Tr *= 1 - 0.15 * Math.sqrt(u); }
      const h = haces[nb], off = f1(-((g * 420) % 44));
      [h.a, h.b].forEach((e) => { e.setAttribute("x1", x); e.setAttribute("x2", x); e.setAttribute("y1", CY - 700); e.setAttribute("y2", f1(CY - CAP.R + 10)); });
      [h.dn, h.dc].forEach((e) => { e.setAttribute("x1", x); e.setAttribute("x2", x); e.setAttribute("y1", f1(CY + CAP.R + 22)); e.setAttribute("y2", CY + 222); });
      h.b.setAttribute("stroke-dashoffset", off); h.dc.setAttribute("stroke-dashoffset", off);
      show(h.a, arriba); show(h.b, arriba); show(h.dn, abajo * Tr); show(h.dc, abajo * Tr);
      h.im.setAttribute("cx", x); h.im.setAttribute("cy", CY - CAP.R + 18); show(h.im, arriba * (1 - Tr) * (0.7 + 0.25 * Math.sin(g * 13 + m)));
      [h.a, h.b, h.dn, h.dc, h.im].forEach((e) => vis(e, arriba > 0.001));
      const c = conos[nb]; vis(c.g, 1); c.g.setAttribute("transform", `translate(${x} ${CY + 220})`); show(c.l, abajo * Tr * 0.9); show(c.h, abajo * Tr * 0.85);
    }
    for (let j = nb; j < NB; j++) { [haces[j].a, haces[j].b, haces[j].dn, haces[j].dc, haces[j].im].forEach((e) => vis(e, 0)); vis(conos[j].g, 0); }
    const fl = K.tramo(g, T.enciende, T.enciende + 0.7), fx = w + 260;
    flash.setAttribute("cx", f1(fx)); flash.setAttribute("cy", CY + 260); flash.setAttribute("r", f1(30 + 190 * K.sale(fl))); show(flash, fl > 0 && fl < 1 ? 1 - fl : 0);
    spot.setAttribute("cx", f1(fx)); spot.setAttribute("cy", CY + 250); show(spot, sube(g, T.enciende, T.enciende + 0.4) * (0.85 + 0.15 * Math.sin(g * 8)));
  };
  return (g, k) => { const on = g >= G0.capilar && g < G0.cielo; vis(W, on); if (on) dibuja(g, k.x, 540 / k.z + 60); return dibuja; };
}

// ---------- lo que va pegado a la pantalla (está en el ojo, no en el cielo) ----------
const PINGS = (() => {
  const S = [], ya = [posDe(DSTAR, 0.6)];
  for (const d of PUNTOS) {
    if (d === DSTAR || S.length >= 5) continue;
    const u = uDe(d, 0.6), [x, y] = en(d.c, u), [sx, sy] = pantalla(F0, x, y);
    if (envDe(u) < 0.95 || envDe(uDe(d, 1.6)) < 0.9 || sx < 150 || sx > 930 || sy < 660 || sy > 1380) continue;
    if (ya.some((p) => Math.hypot(p[0] - x, p[1] - y) < 190)) continue;
    ya.push([x, y]); S.push(d);
  }
  return S;
})();
const ecg = (p) => -120 * Math.exp(-((p / 0.014) ** 2)) + 30 * Math.exp(-(((p + 0.035) / 0.012) ** 2)) + 36 * Math.exp(-(((p - 0.03) / 0.014) ** 2)) - 24 * Math.exp(-(((p - 0.24) / 0.055) ** 2)) - 12 * Math.exp(-(((p + 0.17) / 0.03) ** 2));
function hudPartes(hud, HD, dibujaCap) {
  // moscas volantes (lo que no es)
  const moscas = el(hud, "g", { opacity: 0 }), r = K.azar(3);
  const hebras = [[300, 760], [700, 900], [480, 1180]].map(([x, y], i) => { const g = el(moscas, "g"); const P = Array.from({ length: 9 }, (_, j) => [j * 34 - 136 + (r() - 0.5) * 20, Math.sin(j * 0.9 + i) * 40 + (r() - 0.5) * 16]);
    el(g, "path", { d: curva(P), fill: "none", stroke: "rgba(40,40,52,0.2)", "stroke-width": 20, "stroke-linecap": "round" }); el(g, "path", { d: curva(P), fill: "none", stroke: "rgba(255,255,255,0.2)", "stroke-width": 6, "stroke-linecap": "round" });
    P.filter((_, j) => j % 3 === 1).forEach((p) => el(g, "circle", { cx: f1(p[0]), cy: f1(p[1]), r: 10, fill: "rgba(40,40,52,0.16)", stroke: "rgba(255,255,255,0.18)", "stroke-width": 3 })); return { g, x, y, i }; });
  // la red de vasos: oscura (sombra), a rayas (dónde está) y roja (sangre)
  const cA = el(el(HD, "clipPath", { id: `${PRE}borraA` }), "rect", { x: -200, y: 0, width: 1600, height: 1920 });
  const cB = el(el(HD, "clipPath", { id: `${PRE}borraB` }), "rect", { x: -200, y: 0, width: 1600, height: 1920 });
  const wA = el(hud, "g", { "clip-path": "url(#c-borraA)" }), wB = el(hud, "g", { "clip-path": "url(#c-borraB)" }), wC = el(hud, "g");
  const tA = el(wA, "g"), tB = el(wB, "g"), tC = el(wC, "g");
  const osc = arbolEn(tA, "oscuro"), fan = arbolEn(tB, "fantasma"), san = arbolEn(tC, "sangre");
  const barre = el(hud, "rect", { y: 0, width: 200, height: 1920, fill: "url(#c-barre)", opacity: 0 });
  // el centro de la mirada
  const velo = el(hud, "path", { fill: "rgba(232,240,252,0.5)", "fill-rule": "evenodd", opacity: 0 });
  const circ = el(hud, "circle", { fill: "none", stroke: "rgba(255,255,255,0.9)", "stroke-width": 5, "stroke-dasharray": "22 16", opacity: 0 });
  const mira = el(hud, "g", { opacity: 0 });
  el(mira, "circle", { r: 20, fill: "none", stroke: "#fff", "stroke-width": 5 });
  [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([x, y]) => el(mira, "line", { x1: x * 32, y1: y * 32, x2: x * 62, y2: y * 62, stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round" }));
  const sangreV = el(hud, "rect", { x: 0, y: 0, width: 1080, height: 1920, fill: "url(#c-sangre-v)", opacity: 0 });
  // el latido
  const latG = el(hud, "g", { opacity: 0 });
  const ecgS = el(latG, "polyline", { fill: "none", stroke: "rgba(8,14,32,0.5)", "stroke-width": 13, "stroke-linejoin": "round", "stroke-linecap": "round" });
  const ecgL = el(latG, "polyline", { fill: "none", stroke: ROJO, "stroke-width": 5.5, "stroke-linejoin": "round", "stroke-linecap": "round" });
  const ecgP = el(latG, "circle", { r: 9, fill: "#fff" });
  // la lupa del principio y el aro que sigue a un puntito
  const cL = el(el(HD, "clipPath", { id: `${PRE}lente` }), "circle", { cx: 540, cy: 1000, r: 0 });
  const LG = el(hud, "g", { "clip-path": "url(#c-lente)", opacity: 0 });
  el(LG, "rect", { x: 0, y: 0, width: 1080, height: 1920, fill: "#1c0f18" });
  const U = el(LG, "use"); U.setAttribute("href", `#${PRE}capilar`);
  const aro = el(hud, "g", { opacity: 0 }), aS = el(aro, "circle", { fill: "none", stroke: "rgba(4,10,24,0.45)", "stroke-width": 16 }), aL = el(aro, "circle", { fill: "none", stroke: CIAN, "stroke-width": 5 }), aB = el(aro, "path", { fill: "none", stroke: "rgba(255,255,255,0.55)", "stroke-width": 4, "stroke-linecap": "round" });
  const pings = PINGS.map(() => el(hud, "circle", { fill: "none", stroke: "rgba(255,255,255,0.9)", "stroke-width": 3.5, opacity: 0 }));
  const ponAro = (cx, cy, rr) => { [aS, aL].forEach((e) => { e.setAttribute("cx", f1(cx)); e.setAttribute("cy", f1(cy)); e.setAttribute("r", f1(rr)); }); const p = (a) => `${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`; aB.setAttribute("d", `M${p(3.5)} A${f1(rr)} ${f1(rr)} 0 0 1 ${p(4.3)}`); };
  return (g, k) => {
    // moscas
    const mo = asoma(g, T.moscas, 5.95); vis(moscas, mo > 0.001); show(moscas, mo);
    if (mo > 0.001) hebras.forEach((h) => h.g.setAttribute("transform", `translate(${f1(h.x + 22 * (g - 4.96) * (h.i % 2 ? -1 : 1))} ${f1(h.y + 30 * (g - 4.96))}) rotate(${f1(8 * Math.sin(g * 0.8 + h.i))})`));
    // red de vasos
    const mundo = g >= G0.sombra, [sx, sy] = pantalla(k, FV[0], FV[1]);
    const tr = mundo ? `translate(${f2(sx)} ${f2(sy)}) scale(${f3(k.z)}) translate(-540 -1000)` : "translate(540 1000) scale(1.2) translate(-540 -1000)";
    const oA = g >= G0.sombra && g < 16.7 ? sube(g, G0.sombra, G0.sombra + 0.2) : 0; vis(wA, oA > 0.001); show(wA, oA);
    if (oA > 0.001) { tA.setAttribute("transform", tr); osc.dibuja(sube(g, G0.sombra, 15.1)); cA.setAttribute("x", f1(K.mez(-200, 1280, K.suave(K.tramo(g, T.borra, 16.5))))); }
    const oB = g < G0.capilar ? asoma(g, T.siempre, 18.75) * 0.8 : g < G0.centro ? asoma(g, T.cerebro2, 37.0) * 0.8 : 0; vis(wB, oB > 0.001);
    if (oB > 0.001) { tB.setAttribute("transform", tr); show(wB, oB); cB.setAttribute("x", f1(g > G0.cielo ? K.mez(-200, 1280, K.suave(K.tramo(g, T.no, T.borrar + 0.05))) : -200)); }
    const p2 = g < 47, oC = p2 ? sube(g, T.vasos - 0.3, T.vasos) * (1 - sube(g, T.asi, T.asi + 0.6)) : sube(g, T.traves - 0.1, T.traves + 0.2) * (1 - sube(g, 50.35, 50.8)); vis(wC, oC > 0.001);
    if (oC > 0.001) { tC.setAttribute("transform", tr); show(wC, oC); san.dibuja(p2 ? sube(g, T.vasos - 0.3, T.vasos + 0.6) : sube(g, T.traves, T.traves + 0.8)); san.flujo.forEach(({ v, e }) => e.setAttribute("stroke-dashoffset", f1((v.tipo === "a" ? -1 : 1) * ((g * 110) % 35)))); }
    const bs = [[T.borra, 16.5], [T.no, T.borrar + 0.05]].find(([a, b]) => g >= a && g <= b);
    if (bs) { const u = K.suave(K.tramo(g, bs[0], bs[1])); barre.setAttribute("x", f1(K.mez(-200, 1280, u) - 100)); show(barre, Math.sin(Math.PI * u)); vis(barre, 1); } else vis(barre, 0);
    // centro
    const rc = 235 * k.z, oV = 0.85 * sube(g, T.nitido, T.nitido + 0.4) * (1 - sube(g, T.asi, T.asi + 0.6)); vis(velo, oV > 0.001);
    if (oV > 0.001) { velo.setAttribute("d", `M0 0 H1080 V1920 H0 Z M${f1(sx - rc)} ${f1(sy)} a${f1(rc)} ${f1(rc)} 0 1 0 ${f1(2 * rc)} 0 a${f1(rc)} ${f1(rc)} 0 1 0 ${f1(-2 * rc)} 0 Z`); show(velo, oV); }
    const oc = sube(g, T.ninguno, T.ninguno + 0.25) * (1 - sube(g, T.asi, T.asi + 0.5)); vis(circ, oc > 0.001);
    if (oc > 0.001) { circ.setAttribute("cx", f1(sx)); circ.setAttribute("cy", f1(sy)); circ.setAttribute("r", f1(rc * (1 + 0.3 * (1 - K.sale(K.tramo(g, T.ninguno, T.ninguno + 0.4)))))); circ.setAttribute("stroke-dashoffset", f1(-g * 30)); show(circ, oc); }
    const om = sube(g, T.justo, T.justo + 0.2) * (1 - sube(g, T.asi, T.asi + 0.5)); vis(mira, om > 0.001);
    if (om > 0.001) { mira.setAttribute("transform", `translate(${f1(sx)} ${f1(sy)}) scale(${f3(0.6 + 0.4 * K.sale(K.tramo(g, T.justo, T.justo + 0.3)))})`); show(mira, om); }
    const os = 0.75 * sube(g, T.traves, T.traves + 0.8) * (1 - sube(g, 50.35, 50.8)); vis(sangreV, os > 0.001); show(sangreV, os);
    // latido
    const ol = sube(g, T.con, T.con + 0.3) * (g < G0.centro ? 1 : 0); vis(latG, ol > 0.001);
    if (ol > 0.001) {
      show(latG, ol); let pts = ""; const x0 = Math.max(90, 990 - 420 * (g - 38.7));
      for (let x = x0; x <= 990; x += 3) { const tau = g - (990 - x) / 420, p = tau - (LAT0 + P_H * Math.round((tau - LAT0) / P_H)); pts += `${f1(x)},${f1(1330 + ecg(p))} `; }
      ecgS.setAttribute("points", pts); ecgL.setAttribute("points", pts);
      const p = g - (LAT0 + P_H * Math.round((g - LAT0) / P_H)); ecgP.setAttribute("cx", 990); ecgP.setAttribute("cy", f1(1330 + ecg(p))); ecgP.setAttribute("r", f1(8 + 6 * pico(g, LAT0 + P_H * Math.floor((g - LAT0) / P_H), 0.05, 0.4)));
    }
    // la lupa (hook) y el aro (hook y cielo)
    const [dx, dy] = pantalla(k, ...posDe(DSTAR, g));
    if (g < G0.ojo) {
      const ab = K.sale(K.tramo(g, T.globulos, T.globulos + 0.5)), sn = K.sale(K.tramo(g, T.puntitos, T.puntitos + 0.2));
      const cx = K.mez(dx, 540, ab), cy = K.mez(dy, 1010, ab), rr = K.mez(34 + 80 * (1 - sn), 280, ab);
      vis(aro, g > T.puntitos); show(aro, K.lim((g - T.puntitos) / 0.12)); ponAro(cx, cy, rr);
      const ol2 = sube(g, T.globulos, T.globulos + 0.25); vis(LG, ol2 > 0.001);
      if (ol2 > 0.001) {
        show(LG, ol2); cL.setAttribute("cx", f1(cx)); cL.setAttribute("cy", f1(cy)); cL.setAttribute("r", f1(rr - 3));
        const gi = 31.0 + 0.25 * (g - T.globulos), wx = blanco(gi) + 120, s = K.mez(0.4, 1.15, ab);
        U.setAttribute("transform", `translate(${f1(cx)} ${f1(cy)}) scale(${f3(s)}) translate(${f1(-wx)} ${-(CY + 30)})`);
        dibujaCap(gi, wx, rr / s + 80);
      }
      pings.forEach((e, i) => { const t = 0.45 + 0.13 * i, o = pico(g, t, 0.1, 1.1); vis(e, o > 0.001); if (o > 0.001) { const [px, py] = pantalla(k, ...posDe(PINGS[i], g)); e.setAttribute("cx", f1(px)); e.setAttribute("cy", f1(py)); e.setAttribute("r", f1(26 + 26 * (1 - K.sale(K.tramo(g, t, t + 0.2))))); show(e, o); } });
    } else {
      vis(LG, 0); pings.forEach((e) => vis(e, 0));
      const oa = g >= G0.cielo && g < G0.centro ? asoma(g, 34.0, 36.4) : 0; vis(aro, oa > 0.001);
      if (oa > 0.001) { show(aro, oa); ponAro(dx, dy, 34 + 70 * (1 - K.sale(K.tramo(g, 34.0, 34.25)))); }
    }
  };
}

// ---------- los rótulos ----------
function etiqueta(cont, html, clase = "") { return K.crear(cont, `<div class="c-etq ${clase}">${typeof html === "function" ? html(0) : html}</div>`); }
function pon(e, sx, sy, on, dy = 24) {
  if (on <= 0.001) { if (e._o !== 0) { e.style.opacity = 0; e._o = 0; } return; }
  const w = e.offsetWidth, h = e.offsetHeight;
  const x = Math.min(Math.max(sx, 40 + w / 2), 1040 - w / 2), y = Math.min(Math.max(sy, 560 + h / 2), 1440 - h / 2);
  e.style.opacity = on; e._o = on; e.style.transform = `translate(${f1(x - w / 2)}px, ${f1(y - h / 2 + (1 - on) * dy)}px) scale(${f3(0.9 + 0.1 * on)})`;
}
const junto = (wx, wy, dx = 0, dy = 0) => (k) => { const [x, y] = pantalla(k, typeof wx === "function" ? wx() : wx, wy); return [x + dx, y + dy]; };
const fijo = (x, y) => () => [x, y];
function rotulos(capa) {
  const L = [];
  const r = (html, clase, sitio, on) => L.push({ e: etiqueta(capa, html, clase), html, sitio, on, ultimo: null });
  const abajo = fijo(540, 1350);
  let gA = 0; const dstar = (dx, dy) => (k) => { const [x, y] = pantalla(k, ...posDe(DSTAR, gA)); return [x + dx, y + dy]; };
  const wbl = (dx, dy) => (k) => { const [x, y] = pantalla(k, blanco(gA), CY); return [x + dx, y + dy]; };
  // hook
  r(`puntitos de <b>luz</b>`, "c g", dstar(0, -100), (g) => asoma(g, T.puntitos, 2.55));
  r(`tus <b>glóbulos blancos</b>`, "l g", fijo(540, 1372), (g) => asoma(g, T.globulos, 4.6));
  // ojo
  r((g) => `<b>moscas volantes</b><span class="tach" style="width:${f1(92 * K.sale(K.tramo(g, 5.42, 5.75)))}%"></span>`, "r g", abajo, (g) => asoma(g, T.moscas, 6.0));
  r(`tu <b>sangre</b>`, "r g", abajo, (g) => asoma(g, T.sangre, 7.9));
  // retina
  r(`el <b>fondo</b> del ojo`, "", junto(RE[0], RE[1] + 392, 0, -120), (g) => asoma(g, T.fondo, 11.8));
  r(`vasitos de <b>sangre</b>`, "r", fijo(540, 1040), (g) => asoma(g, T.vasitos, 13.95));
  // sombra
  r(`tu cerebro la <b>borra</b>`, "", abajo, (g) => asoma(g, T.borra, 16.5));
  r(`siempre en el <b>mismo sitio</b>`, "", abajo, (g) => asoma(g, T.siempre, 18.6));
  // capilar
  r((g) => (g < T.fila ? `glóbulos <b>rojos</b>` : `glóbulos <b>rojos</b>, en fila`), "r", fijo(540, 720), (g) => asoma(g, T.globulos2, 21.95));
  r(`se tragan la <b>luz azul</b>`, "c", fijo(540, 720), (g) => asoma(g, T.tragan, 23.6));
  r(`glóbulo <b>blanco</b>`, "l", wbl(0, -190), (g) => asoma(g, T.blanco, T.grande - 0.15));
  r(`más <b>grande</b>`, "l", wbl(0, -190), (g) => asoma(g, T.grande, T.lento - 0.15));
  r(`y más <b>lento</b>`, "l", wbl(0, -190), (g) => asoma(g, T.lento, 27.4));
  r(`aparta a los <b>rojos</b>`, "r", wbl(-250, -190), (g) => asoma(g, T.aparta, 29.1));
  r(`el <b>hueco</b>`, "", wbl(420, -190), (g) => asoma(g, T.hueco, 31.3));
  r(`un <b>puntito</b>`, "c g", wbl(260, 420), (g) => asoma(g, T.puntito, 33.9));
  // cielo
  r(`se <b>mueve</b>`, "c", dstar(0, -100), (g) => asoma(g, T.mueve, 35.4));
  r(`no lo puede <b>borrar</b>`, "", abajo, (g) => asoma(g, T.no, 37.0));
  r(`a <b>saltitos</b>`, "", abajo, (g) => asoma(g, T.saltitos, 38.75));
  r(`cada <b>latido</b>`, "r", fijo(540, 1185), (g) => asoma(g, T.cada, 40.9));
  // centro
  const bajoFV = (k) => { const [x, y] = pantalla(k, FV[0], FV[1]); return [x, y + 125]; };
  r(`donde <b>miras</b>`, "", bajoFV, (g) => asoma(g, T.miras, T.ninguno - 0.1));
  r(`<b>ninguno</b>`, "", bajoFV, (g) => asoma(g, T.ninguno, T.vasos - 0.15));
  r(`sin <b>vasos</b>`, "r", bajoFV, (g) => asoma(g, T.vasos, T.nitido - 0.12));
  r(`<b>nítido</b>`, "", bajoFV, (g) => asoma(g, T.nitido, 45.6));
  // cierre
  r(`tu propia <b>sangre</b>`, "r g", abajo, (g) => asoma(g, T.propia, 50.3));
  return (g, k) => { gA = g; L.forEach((l) => {
    const on = l.on(g);
    if (typeof l.html === "function" && on > 0.001) { const s = l.html(g); if (s !== l.ultimo) { l.e.innerHTML = s; l.ultimo = s; } }
    const [x, y] = l.sitio(k); pon(l.e, x, y, on);
  }); };
}

// ---------- montaje ----------
export function montaje(esc) {
  estilos(); PRE = `c${++escenas}-`;
  K.crear(esc, `<div class="c-fondo"></div>`);
  const mundo = K.crear(esc, `<div class="c-mundo"></div>`);
  const sv = K.crear(mundo, ids(`<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0">${DEFS}<g class="c-cam"></g></svg>`));
  const D = sv.querySelector("defs"), cam = sv.querySelector(".c-cam");
  el(cam, "rect", { x: -6000, y: -2000, width: 14000, height: 11000, fill: "#0b0e12" });
  const cielo = cieloMundo(cam), ojo = ojoFrente(cam, D), corte = corteOjo(cam), cap = capilar(cam, D);
  const hs = K.crear(esc, `<svg data-layout-ignore aria-hidden="true" width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0"><defs></defs><g></g></svg>`);
  const hud = hudPartes(hs.querySelector("g"), hs.querySelector("defs"), cap(-1, { x: 0, z: 1 }));
  K.crear(esc, `<div class="c-vineta"></div>`); K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`), ro = rotulos(capa);
  return { cam, cielo, ojo, corte, cap, hud, ro };
}
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s) => {
    const g = g0 + s, k = camaraEn(g);
    const lat = 0.55 * sube(g, 37.1, T.saltitos) * (1 - sube(g, 40.5, G0.centro));
    const sac = Math.max(0.35 * pico(g, T.puntitos, 0.05, 0.35), 0.6 * pico(g, T.globulos, 0.06, 0.5), 0.4 * pico(g, T.enciende, 0.06, 0.5), lat > 0 ? lat * Math.max(...latidos(g - 0.5, g).map((b) => pico(g, b, 0.05, 0.4)), 0) : 0);
    const kk = { x: k.x + sac * 7 * Math.sin(g * 90), y: k.y + sac * 6 * Math.cos(g * 77), z: k.z * (1 + 0.035 * sac) };
    E.cam.setAttribute("transform", `translate(${(540 - kk.x * kk.z).toFixed(2)} ${(1000 - kk.y * kk.z).toFixed(2)}) scale(${kk.z.toFixed(4)})`);
    E.cielo(g); E.ojo(g, kk); E.corte(g, kk); E.cap(g, kk); E.hud(g, kk); E.ro(g, kk);
    return { g, k: kk };
  };
  return E;
}
