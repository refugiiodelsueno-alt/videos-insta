// Lo que sale en todas las escenas: un congelador de bajo encimera cortado de lado (se ve dentro), en una cocina a
// oscuras, con una mano agarrada al tirador; el aire en bolitas (naranjas y rápidas fuera, azules y lentas dentro
// cuando se enfrían), las flechas de lo que empuja la puerta y las etiquetas. Todo en 2D, a escala real: 1 cm = 12
// unidades del mundo (la puerta mide 70 cm de alto).
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CM = 12;
export const NARANJA = "#ff9548", AZUL = "#8fd8ff", ROJO = "#f0445a", VERDE = "#22d38a";
export const F0 = { x: 600, y: 830, z: 1.26 };                  // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Lo que se mueve sin parar (la niebla, el polvo) da un número entero de vueltas en TOTAL
// segundos, y la puerta acaba cerrándose igual que empieza: así el último fotograma empalma con el primero.
export const TOTAL = 49.45;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;   // vueltas dadas a unas f vueltas/s
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);                              // lo mismo, en radianes
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));

// la puerta (cerrada), la cara del mueble, el hueco de dentro, por dónde vuelan las bolitas y el pie de delante
export const PU = { x0: 350, x1: 426, y0: 410, y1: 1250 };
export const CARA = 440;
export const HU = { x0: 440, x1: 1035, y0: 455, y1: 1205 };
const DENTRO = { x0: 456, x1: 1020, y0: 472, y1: 1190 };
const FUERA = { x0: -260, x1: 336, y0: 414, y1: 1395 };
const PIVOTE = { x: 452, y: 1420 };

// el segundo en que empieza cada escena (build/h1/index.html: cada una 0,3 s antes de que acabe la anterior)
export const G0 = { hook: 0, aire: 8.25, fuerza: 21.67, junta: 37.18, cierre: 44.36 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  intentas: 1.68, vez: 2.56, no: 3.28, goma: 4.88, hielo: 5.44, empuja: 6.64, fuera: 7.84,
  abres: 8.66, entra: 9.26, cocina: 10.1, caliente: 10.9, moleculas: 12.44, bala: 14.24, chocan: 14.76, parar: 15.4,
  cerrar: 16.82, frena: 17.94, dentro: 19.54, menos: 20.26, menos2: 21.18,
  fuera2: 22.0, chocando: 23.68, fuerte: 24.56, uno: 27.54, cuarenta: 30.5, kilos: 31.06,
  golpe: 32.66, echas: 34.02, todavia: 35.78, menos4: 36.34,
  esperas: 37.86, minuto: 38.42, abre: 39.14, esfuerzo: 39.54, goma2: 40.78, cuela: 41.26, igual: 43.06,
  frio: 45.7, aire: 47.22, eso: 48.9,
};

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-fondo { position: absolute; inset: 0; background: radial-gradient(ellipse 120% 80% at 40% 45%, #1c1813 0%, #0b0d10 75%); }
.c-mundo { position: absolute; left: 0; top: 0; width: 1px; height: 1px; transform-origin: 0 0; }
.c-polvo { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 236, 205, 0.5); filter: blur(1.5px); }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(11, 13, 16, 0.97) 0, rgba(11, 13, 16, 0.9) 300px, rgba(11, 13, 16, 0.7) 470px, rgba(11, 13, 16, 0) 630px); }

.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 40px; color: #fff;
  background: rgba(14, 16, 20, 0.88); border: 2px solid rgba(255, 255, 255, 0.16); border-radius: 16px; padding: 10px 22px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45); opacity: 0; }
.c-etq b { font-family: var(--letra-mono), monospace; font-weight: 700; }
.c-etq.n b { color: ${NARANJA}; } .c-etq.c b { color: ${AZUL}; } .c-etq.r b { color: ${ROJO}; } .c-etq.v b { color: ${VERDE}; }
.c-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }
.c-etq .tacha { position: absolute; left: 12px; right: 12px; top: 46%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240, 68, 90, 0.7); }
.c-etq svg { vertical-align: -10px; margin-right: 12px; }
.c-pesa { display: flex; align-items: center; gap: 18px; padding: 14px 28px 14px 22px; }
.c-pesa .num { font-family: var(--letra-mono), monospace; font-size: 64px; font-weight: 700; color: #fff; }
.c-pesa .num.r { color: ${ROJO}; } .c-pesa .num.v { color: ${VERDE}; }
.c-pesa small { margin-top: 2px; }
.c-banda { position: absolute; left: 0; width: 1080px; top: 1060px; height: 390px; opacity: 0;
  background: linear-gradient(180deg, rgba(10, 12, 15, 0) 0, rgba(10, 12, 15, 0.82) 60px, rgba(10, 12, 15, 0.82) 330px, rgba(10, 12, 15, 0) 390px); }
.c-corre { position: absolute; left: 0; top: 0; opacity: 0; }
`;

function estilos() {
  if (document.getElementById("mundo-css")) return;
  const s = document.createElement("style");
  s.id = "mundo-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── la cámara: el punto (fx, fy) del mundo queda en (540, 1000) con zoom z ──────────────────────────────────────
export function cam(el, fx, fy, z) {
  el.style.transform = `translate(${540 - fx * z}px, ${1000 - fy * z}px) scale(${z})`;
}
export function pantalla(k, wx, wy) { return [540 + (wx - k.x) * k.z, 1000 + (wy - k.y) * k.z]; }
// una cámara entre claves, con el zoom en escala logarítmica. Pasa por cada clave sin pararse ni pasarse (curva
// monótona): solo para donde cambia de sentido y al final.
export function camara(s, claves) {
  const n = claves.length, T = claves.map((c) => c[0]);
  if (s <= T[0]) return { ...claves[0][1] };
  if (s >= T[n - 1]) return { ...claves[n - 1][1] };
  let i = 1;
  while (s > T[i]) i++;
  const r = {};
  for (const key of ["x", "y", "z"]) {
    const v = claves.map((c) => (key === "z" ? Math.log(c[1].z) : c[1][key]));
    const d = (j) => (v[j + 1] - v[j]) / (T[j + 1] - T[j]);
    const m = (j) => {
      if (j <= 0 || j >= n - 1) return 0;
      const a = d(j - 1), b = d(j), h0 = T[j] - T[j - 1], h1 = T[j + 1] - T[j];
      if (a * b <= 0) return 0;
      return 3 * (h0 + h1) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b);
    };
    const h = T[i] - T[i - 1], u = (s - T[i - 1]) / h, u2 = u * u, u3 = u2 * u;
    const val = (2 * u3 - 3 * u2 + 1) * v[i - 1] + (u3 - 2 * u2 + u) * h * m(i - 1) + (-2 * u3 + 3 * u2) * v[i] + (u3 - u2) * h * m(i);
    r[key] = key === "z" ? Math.exp(val) : val;
  }
  return r;
}

// ── svg ─────────────────────────────────────────────────────────────────────────────────────────────────────────
function el(svg, tag, at) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, at[k]);
  svg.appendChild(e);
  return e;
}
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const CA = hex(NARANJA), CB = hex(AZUL);
// cada escena tiene su propio svg dentro del mismo documento: sus id (degradados, tramas) llevan el número de la escena
// para que una escena no pinte con los de otra que ya se ha escondido
let PRE = "c-", escenas = 0;
const ids = (html) => html.replace(/id="c-/g, `id="${PRE}`).replace(/url\(#c-/g, `url(#${PRE}`);
const tinte = (u) => `rgb(${CA.map((v, i) => Math.round(v + (CB[i] - v) * u)).join(",")})`;

// ── la puerta: cuánto se separa del mueble (en unidades del mundo) y los tirones de cuando no se abre ───────────
const hermite = (u, p0, p1, m0, m1) => {
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1;
};
const ABIERTA = 111;
export function hueco(g) {
  // fotograma 0: acaba de cerrarse (le quedan 14 unidades y llega con el golpe en 0,22 s)
  if (g < 0.22) return 14 * Math.pow((0.22 - g) / 0.22, 2);
  // el final: se cierra desde abierta y en TOTAL va justo por donde iba en el fotograma 0, a la misma velocidad
  if (g > TOTAL - 0.6) return hermite(K.tramo(g, TOTAL - 0.6, TOTAL), ABIERTA, 14, 0, -(2 * 14 / 0.22) * 0.6);
  let h = 0;
  if (g > 8.4 && g < 17) h = ABIERTA * sube(g, 8.5, 9.15) * (1 - K.entra(K.tramo(g, 16.45, 16.85)));
  if (g > 31.8 && g < 33.2) h = 90 * sube(g, 31.9, 32.3) * (1 - K.entra(K.tramo(g, 32.35, 32.66)))
    + (g > 32.66 ? 14 * Math.sin(Math.PI * K.tramo(g, 32.66, 33.1)) : 0);
  if (g > 38.9 && g < 40.9) h = 45 * sube(g, 39.0, 39.45) * (1 - sube(g, 40.25, 40.75));
  if (g > 48.2) h = ABIERTA * sube(g, 48.3, 48.8);
  return h;
}
// los tres tirones del principio (intentas, vez, no): la mano tira, el aparato se balancea y la puerta no se mueve
export function tiron(g) {
  return [[1.78, 0.7], [2.61, 0.8], [3.36, 1.0]].reduce((s, [t, a]) => s + a * Math.exp(-Math.pow((g - t) / 0.1, 2)), 0);
}

// ── la cocina y el congelador, en el mundo ──────────────────────────────────────────────────────────────────────
const DIBUJO = `
<defs>
  <linearGradient id="c-pared" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15120f"/><stop offset="0.6" stop-color="#1d1915"/><stop offset="1" stop-color="#221d18"/></linearGradient>
  <radialGradient id="c-calor" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,190,120,0.16)"/><stop offset="1" stop-color="rgba(255,190,120,0)"/></radialGradient>
  <linearGradient id="c-suelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b231c"/><stop offset="1" stop-color="#110e0b"/></linearGradient>
  <linearGradient id="c-madera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2c20"/><stop offset="1" stop-color="#241b14"/></linearGradient>
  <linearGradient id="c-piedra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a958e"/><stop offset="0.35" stop-color="#6c6862"/><stop offset="1" stop-color="#3d3a36"/></linearGradient>
  <pattern id="c-azulejo" width="120" height="60" patternUnits="userSpaceOnUse"><rect width="120" height="60" fill="#1f1c19"/><path d="M0 0.5H120M0.5 0V60" stroke="rgba(255,255,255,0.06)" stroke-width="2"/></pattern>
  <pattern id="c-esp" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#d9c58f"/><path d="M0 0V16" stroke="#b6a067" stroke-width="4"/></pattern>
  <linearGradient id="c-hueco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f84b5"/><stop offset="1" stop-color="#1d4e78"/></linearGradient>
  <radialGradient id="c-luz" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(220,245,255,0.55)"/><stop offset="0.5" stop-color="rgba(160,215,255,0.18)"/><stop offset="1" stop-color="rgba(160,215,255,0)"/></radialGradient>
  <linearGradient id="c-chapa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa2ab"/><stop offset="0.5" stop-color="#e3e8ed"/><stop offset="1" stop-color="#b9c0c8"/></linearGradient>
  <linearGradient id="c-asa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d636b"/><stop offset="0.35" stop-color="#d2d7dd"/><stop offset="0.65" stop-color="#8a9098"/><stop offset="1" stop-color="#3a3e44"/></linearGradient>
  <radialGradient id="c-niebla" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(205,235,255,0.75)"/><stop offset="1" stop-color="rgba(205,235,255,0)"/></radialGradient>
  <radialGradient id="c-bola" cx="0.35" cy="0.32" r="0.75"><stop offset="0" stop-color="rgba(255,255,255,0.85)"/><stop offset="0.35" stop-color="rgba(255,255,255,0)"/></radialGradient>
</defs>
<rect x="-1000" y="-400" width="3700" height="1820" fill="url(#c-pared)"/>
<ellipse cx="-80" cy="700" rx="900" ry="700" fill="url(#c-calor)"/>
<rect x="330" y="-400" width="2300" height="700" fill="url(#c-azulejo)"/>
<rect x="-1000" y="1380" width="1450" height="40" fill="#2c241d"/>
<rect x="-1000" y="1380" width="1450" height="4" fill="rgba(255,255,255,0.08)"/>
<rect x="-1000" y="1420" width="3700" height="400" fill="url(#c-suelo)"/>
<path d="M-1000 1520H2700M-1000 1640H2700" stroke="rgba(0,0,0,0.35)" stroke-width="4"/>
<rect x="1080" y="348" width="1520" height="1032" fill="url(#c-madera)"/>
<rect x="1094" y="420" width="420" height="950" rx="10" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="6"/>
<rect x="1528" y="420" width="420" height="950" rx="10" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="6"/>
<rect x="1130" y="470" width="16" height="170" rx="8" fill="#6d655b"/>
<rect x="330" y="348" width="2270" height="70" fill="rgba(0,0,0,0.6)"/>
<g class="c-aparato">
  <rect x="440" y="1250" width="640" height="130" fill="#1a1d21"/>
  <rect x="452" y="1262" width="34" height="110" rx="4" fill="#0d0f11"/>
  <path d="M458 1275H480M458 1295H480M458 1315H480M458 1335H480M458 1355H480" stroke="#2c3036" stroke-width="7"/>
  <rect x="880" y="1280" width="150" height="92" rx="40" fill="#0b0c0e"/>
  <path d="M955 1280 V1262 H1060" fill="none" stroke="#7d5a3a" stroke-width="7"/>
  <rect x="458" y="1380" width="40" height="40" fill="#0b0c0e"/>
  <rect x="1022" y="1380" width="40" height="40" fill="#0b0c0e"/>
  <rect x="440" y="410" width="640" height="840" fill="url(#c-esp)"/>
  <rect x="440" y="410" width="640" height="6" fill="#d7dde3"/>
  <rect x="1074" y="410" width="6" height="840" fill="#c3cad1"/>
  <rect x="440" y="1244" width="640" height="6" fill="#c3cad1"/>
  <rect x="440" y="455" width="595" height="750" fill="url(#c-hueco)"/>
  <ellipse class="c-luz" cx="900" cy="560" rx="380" ry="300" fill="url(#c-luz)"/>
  <rect x="955" y="458" width="50" height="14" rx="6" fill="#f2fbff"/>
  <path d="M440 457 H1033 V1203 H440" fill="none" stroke="#e6edf3" stroke-width="5"/>
  <path d="M446 459 L470 472 L492 461 L520 476 L548 462 L580 474 L612 461 L640 477 L672 462 L702 473 L736 460 L768 476 L800 462 L834 474 L866 461 L896 477 L930 462 L962 470 L1031 459 Z" fill="#e7f6ff" opacity="0.9"/>
  <path d="M1031 470 L1016 500 L1027 540 L1012 590 L1026 640 L1014 700 L1027 760 L1013 820 L1026 880 L1015 950 L1027 1020 L1013 1090 L1026 1150 L1031 1200 Z" fill="#e7f6ff" opacity="0.85"/>
  <rect x="480" y="596" width="210" height="104" rx="6" fill="#b8503a"/>
  <rect x="480" y="596" width="210" height="18" rx="6" fill="#d87157"/>
  <rect x="520" y="632" width="130" height="34" rx="4" fill="#f1e2c9" opacity="0.8"/>
  <rect x="760" y="612" width="170" height="88" rx="10" fill="#d6e1ea"/>
  <rect x="752" y="602" width="186" height="18" rx="6" fill="#6fa4c9"/>
  <path d="M452 700H1030M452 950H1030" stroke="#9fb2c2" stroke-width="6"/>
  <path d="M480 700v8M560 700v8M640 700v8M720 700v8M800 700v8M880 700v8M960 700v8M480 950v8M560 950v8M640 950v8M720 950v8M800 950v8M880 950v8M960 950v8" stroke="#7d8f9e" stroke-width="5"/>
  <path d="M472 948 C468 900 474 862 500 852 L620 852 C646 862 652 900 648 948 Z" fill="#3e9a50"/>
  <path d="M500 852 L496 840 L624 840 L620 852 Z" fill="#2f7b3e"/>
  <circle cx="540" cy="905" r="16" fill="#79c97a"/><circle cx="574" cy="914" r="16" fill="#79c97a"/><circle cx="557" cy="884" r="16" fill="#8ad68a"/>
  <rect x="720" y="920" width="260" height="30" rx="6" fill="#a9d6ef"/>
  <path d="M752 920v30M784 920v30M816 920v30M848 920v30M880 920v30M912 920v30M944 920v30" stroke="#d8f1ff" stroke-width="4"/>
  <rect x="478" y="1084" width="170" height="121" rx="12" fill="#f0e1c3"/>
  <rect x="470" y="1076" width="186" height="22" rx="8" fill="#94573a"/>
  <rect x="500" y="1124" width="126" height="40" rx="6" fill="#e3a3b9"/>
  <rect x="720" y="1040" width="240" height="165" rx="6" fill="#4b6da6"/>
  <rect x="720" y="1040" width="240" height="22" rx="6" fill="#6688c0"/>
  <rect x="760" y="1092" width="160" height="60" rx="6" fill="#f2f4f7" opacity="0.85"/>
  <rect x="440" y="455" width="595" height="750" fill="rgba(8,24,40,0.16)"/>
  <rect x="440" y="410" width="8" height="45" fill="#e3e8ed"/>
  <rect x="440" y="1205" width="8" height="45" fill="#e3e8ed"/>
  <g class="c-puerta">
    <rect x="424" y="413" width="18" height="40" rx="8" fill="#121315"/>
    <rect x="424" y="1207" width="18" height="40" rx="8" fill="#121315"/>
    <rect x="356" y="410" width="64" height="840" fill="url(#c-esp)"/>
    <rect x="350" y="410" width="7" height="840" fill="url(#c-chapa)"/>
    <rect x="350" y="410" width="76" height="6" fill="#d5dbe1"/>
    <rect x="350" y="1244" width="76" height="6" fill="#b9c0c8"/>
    <rect x="419" y="416" width="7" height="828" fill="#eef2f5"/>
    <rect x="308" y="455" width="44" height="20" rx="4" fill="#8b949e"/>
    <rect x="308" y="625" width="44" height="20" rx="4" fill="#8b949e"/>
    <rect x="290" y="440" width="22" height="220" rx="11" fill="url(#c-asa)"/>
  </g>
</g>
<rect x="330" y="300" width="2270" height="48" fill="url(#c-piedra)"/>
<rect x="330" y="300" width="2270" height="3" fill="rgba(255,255,255,0.4)"/>
<g class="c-mano">
  <path class="c-brazo" d="M-760 820 L215 575" stroke="#2f4c7c" stroke-width="96" stroke-linecap="round" fill="none"/>
  <path class="c-punto" d="M-760 820 L215 575" stroke="rgba(255,255,255,0.06)" stroke-width="40" stroke-linecap="round" fill="none"/>
  <g class="c-palma">
    <path d="M188 584 L222 576" stroke="#203760" stroke-width="104" stroke-linecap="butt"/>
    <ellipse cx="262" cy="566" rx="50" ry="60" fill="#e2a982"/>
    <rect x="276" y="512" width="60" height="27" rx="13" fill="#d99b74"/>
    <rect x="276" y="540" width="62" height="27" rx="13" fill="#d99b74"/>
    <rect x="276" y="568" width="60" height="27" rx="13" fill="#d99b74"/>
    <rect x="276" y="596" width="52" height="25" rx="12" fill="#d99b74"/>
    <path d="M286 539H330M286 567H332M286 595H330" stroke="rgba(120,60,30,0.35)" stroke-width="3"/>
    <rect x="236" y="500" width="70" height="26" rx="13" fill="#e8b48f" transform="rotate(-8 270 513)"/>
  </g>
</g>
<g class="c-niebla"></g>
<g class="c-bolas"></g>
<g class="c-flechas"></g>
`;

// ── el aire en bolitas ──────────────────────────────────────────────────────────────────────────────────────────
const tri = (u) => { const m = ((u % 2) + 2) % 2; return m < 1 ? m : 2 - m; };
// cuánto hace (en las unidades de h) del último choque con una pared, para el destello
const desde = (u, W, v) => (u - Math.floor(u)) * W / v;
// lo que han avanzado las de dentro: van a la misma velocidad hasta «frena» y luego al 30 %
function avanceDentro(g) {
  if (g <= 17.84) return g;
  let h = 17.84;
  const fin = Math.min(g, 19.0);
  for (let x = 17.84; x < fin; x += 0.01) h += Math.min(0.01, fin - x) * (1 - 0.7 * sube(x + 0.005, 17.84, 19.0));
  return h + Math.max(0, g - 19.0) * 0.3;
}
const velDentro = (g) => 1 - 0.7 * sube(g, 17.84, 19.0);
// lo fuerte que se ven los choques
const choqueFuera = (g) => 0.35 + 0.65 * Math.max(sube(g, 14.6, 14.9) - sube(g, 16.1, 16.4), sube(g, 23.5, 23.8) - sube(g, 25.4, 25.7), sube(g, 47.0, 47.4));
const choqueDentro = (g) => 0.35 + 0.65 * (sube(g, 14.6, 14.9) - sube(g, 16.1, 16.4));

function bolas(grupo) {
  const az = K.azar(23);
  const nueva = (fuera) => {
    const v = (fuera ? 400 : 380) + az() * 90, a = (0.2 + az() * 0.6) * Math.PI / 2;
    const m = {
      vx: v * Math.cos(a), vy: v * Math.sin(a), ux: az() * 2, uy: az() * 2,
      estela: el(grupo, "line", { "stroke-width": 15, "stroke-linecap": "round" }),
      aro: el(grupo, "circle", { r: 12, fill: "none", "stroke-width": 4 }),
      bola: el(grupo, "circle", { r: 12 }),
      luz: el(grupo, "circle", { r: 12, fill: `url(#${PRE}bola)` }),
    };
    return m;
  };
  const fuera = [], dentro = [];
  for (let i = 0; i < 34; i++) fuera.push(nueva(true));
  for (let i = 0; i < 32; i++) { const m = nueva(false); m.i = i; m.ent = i < 24 ? T.entra + i * 0.04 : 1e9; dentro.push(m); }
  dentro.forEach((m) => {
    m.sale = m.i >= 17 && m.i <= 23 ? 32.3 + (m.i - 17) * 0.025 : 1e9;
    m.vuelve = m.i >= 17 ? 40.95 + (m.i - 17) * 0.16 : 1e9;
    m.yE = 1240 + az() * 90;
  });

  const enCaja = (m, h, B, W0, H0, w) => ({
    x: B.x0 + w * tri(m.ux + m.vx * h / W0),
    y: B.y0 + (B.y1 - B.y0) * tri(m.uy + m.vy * h / H0),
  });
  const W0f = FUERA.x1 - FUERA.x0, H0f = FUERA.y1 - FUERA.y0;
  const W0d = DENTRO.x1 - DENTRO.x0, H0d = DENTRO.y1 - DENTRO.y0;
  const pool = (m, h) => enCaja(m, h, DENTRO, W0d, H0d, W0d);
  // un camino por puntos, con cada tramo suave
  const camino = (pts, u) => {
    const n = pts.length - 1, s = K.lim(u) * n, j = Math.min(n - 1, Math.floor(s)), f = K.suave(s - j);
    return { x: K.mez(pts[j].x, pts[j + 1].x, f), y: K.mez(pts[j].y, pts[j + 1].y, f) };
  };
  // dónde está una de dentro en g (y si se ve, de qué color es y su destello)
  const sitio = (m, g) => {
    const hu = hueco(g), boca = CARA - hu / 2;
    if (g >= m.vuelve) {
      // se cuela por la junta de arriba y se enfría
      const u = K.tramo(g, m.vuelve, m.vuelve + 1.1);
      const p = u < 1 ? camino([{ x: 300, y: 386 }, { x: 436, y: 396 }, { x: 441, y: 446 }, { x: 470, y: 482 }, pool(m, avanceDentro(m.vuelve + 1.1))], u) : pool(m, avanceDentro(g));
      return { ...p, a: K.lim((g - m.vuelve) * 8), c: sube(g, m.vuelve + 0.9, m.vuelve + 2.0), libre: u >= 1 };
    }
    if (g >= m.sale) {
      // la empuja fuera el portazo: por el hueco, por debajo de la puerta, y a la cocina
      const t1 = m.sale + 0.26;
      if (g < t1) {
        const p = camino([pool(m, avanceDentro(m.sale)), { x: boca, y: 1190 }, { x: 380, y: m.yE }], K.tramo(g, m.sale, t1));
        return { ...p, a: 1, c: 1 };
      }
      const d = g - t1;
      return { x: 380 - 420 * (1 - Math.exp(-d / 0.8)) - 60 * d, y: m.yE - 80 * d - 40 * (m.i % 3) * d, a: 1 - sube(g, 35.0, 35.6), c: 1 };
    }
    if (g < m.ent) return { x: 0, y: 0, a: 0, c: 0 };
    const t1 = m.ent + 0.8;
    if (g < t1) {
      const p = camino([{ x: 170 + (m.i % 5) * 24, y: 380 }, { x: boca, y: 384 }, { x: boca, y: 560 }, pool(m, avanceDentro(t1))], K.tramo(g, m.ent, t1));
      return { ...p, a: K.lim((g - m.ent) * 8), c: 0 };
    }
    return { ...pool(m, avanceDentro(g)), a: 1, c: sube(g, 17.7 + m.i * 0.025, 18.5 + m.i * 0.025), libre: true };
  };
  const pinta = (m, x, y, px, py, color, a, aro) => {
    m.estela.setAttribute("x1", px); m.estela.setAttribute("y1", py); m.estela.setAttribute("x2", x); m.estela.setAttribute("y2", y);
    m.estela.setAttribute("stroke", color); m.estela.style.opacity = 0.32 * a;
    m.bola.setAttribute("cx", x); m.bola.setAttribute("cy", y); m.bola.setAttribute("fill", color); m.bola.style.opacity = a;
    m.luz.setAttribute("cx", x); m.luz.setAttribute("cy", y); m.luz.style.opacity = a;
    m.aro.setAttribute("cx", x); m.aro.setAttribute("cy", y); m.aro.setAttribute("stroke", color);
    m.aro.setAttribute("r", 12 + 30 * (1 - aro)); m.aro.style.opacity = a * aro * 0.9;
  };

  return (g) => {
    const hu = hueco(g), visF = sube(g, 9.3, 9.9) - sube(g, 48.2, 48.8), cf = choqueFuera(g);
    const wF = FUERA.x1 - hu - FUERA.x0;
    fuera.forEach((m) => {
      if (visF <= 0.001) { m.bola.style.opacity = 0; m.luz.style.opacity = 0; m.estela.style.opacity = 0; m.aro.style.opacity = 0; return; }
      const p = enCaja(m, g, FUERA, W0f, H0f, wF), q = enCaja(m, g - 0.07, FUERA, W0f, H0f, wF);
      const ux = m.ux + m.vx * g / W0f, uy = m.uy + m.vy * g / H0f;
      const tx = desde(ux, W0f, m.vx), ty = desde(uy, H0f, m.vy);
      const aro = Math.max(0, 1 - Math.min(tx, ty) / 0.22) * cf;
      pinta(m, p.x, p.y, q.x, q.y, NARANJA, visF, aro);
    });
    const h = avanceDentro(g), v = velDentro(g), cd = choqueDentro(g), fin = 1 - sube(g, 48.2, 48.8);
    dentro.forEach((m) => {
      const s = sitio(m, g), a = s.a * fin;
      if (a <= 0.001) { m.bola.style.opacity = 0; m.luz.style.opacity = 0; m.estela.style.opacity = 0; m.aro.style.opacity = 0; return; }
      let q, aro = 0;
      if (s.libre) {
        q = pool(m, h - 0.07);
        const ux = m.ux + m.vx * h / W0d, uy = m.uy + m.vy * h / H0d;
        const tx = desde(ux, W0d, m.vx) / v, ty = desde(uy, H0d, m.vy) / v;
        aro = Math.max(0, 1 - Math.min(tx, ty) / 0.22) * cd * v;
      } else {
        q = sitio(m, g - 0.05);
        if (q.a <= 0) q = s;
      }
      pinta(m, s.x, s.y, q.x, q.y, tinte(s.c), a, aro);
    });
  };
}

// ── las flechas de lo que empuja la puerta: naranjas por fuera (la cocina), azules por dentro ────────────────────
function flecha(grupo, color, borde) {
  const p = el(grupo, "path", { fill: color, stroke: borde, "stroke-width": 4, "stroke-linejoin": "round" });
  // punta en (tx, ty), larga L, hacia la derecha (dir 1) o la izquierda (dir -1)
  return (tx, ty, L, dir, a) => {
    const c = Math.min(46, L * 0.45), g = 10, ab = 30;
    const P = [[-L, -g], [-c, -g], [-c, -ab], [0, 0], [-c, ab], [-c, g], [-L, g]];
    p.setAttribute("d", "M" + P.map(([x, y]) => `${(tx + dir * x).toFixed(1)} ${(ty + y).toFixed(1)}`).join(" L") + " Z");
    p.style.opacity = a;
  };
}
function flechas(grupo) {
  const ys = [745, 885, 1025, 1165];
  const fu = ys.map(() => flecha(grupo, NARANJA, "#7a3a12")), de = ys.map(() => flecha(grupo, AZUL, "#1e4f6e"));
  return (g) => {
    const hu = hueco(g), cerrada = 1 - K.lim(hu / 40), late = 1 + 0.05 * Math.sin(vuelta(g, 1.2));
    const visF = (sube(g, 6.54, 7.0) - sube(g, 8.4, 8.7) + sube(g, 21.9, 22.3) - sube(g, 48.0, 48.5)) * cerrada;
    const visD = (sube(g, 19.45, 19.8) - sube(g, 48.0, 48.5)) * cerrada;
    const aD = 1 - 0.38 * sube(g, T.menos, T.menos + 0.5) - 0.14 * sube(g, T.todavia, T.todavia + 0.4) + 0.52 * sube(g, 41.3, 43.4);
    const LF = (150 + 25 * sube(g, 47.2, 47.6)) * late;
    ys.forEach((y, i) => {
      fu[i](PU.x0 - 6 - hu, y, LF * K.sale(K.lim(visF * 1.4)), 1, K.lim(visF * 1.5));
      de[i](CARA + 8, y, 150 * aD * late * K.sale(K.lim(visD * 1.4)), -1, K.lim(visD * 1.5));
    });
  };
}

// ── la niebla fría que se cae por abajo cuando la puerta está abierta ──────────────────────────────────────────
function niebla(grupo) {
  const ps = [];
  for (let i = 0; i < 7; i++) ps.push(el(grupo, "ellipse", { fill: `url(#${PRE}niebla)` }));
  return (g) => {
    const hu = hueco(g), a = K.lim(hu / 50);
    ps.forEach((p, i) => {
      const f = (ciclo(g, 0.45) + i / 7) % 1;
      p.setAttribute("cx", CARA - hu / 2 - 30 - f * 200);
      p.setAttribute("cy", 1230 + f * 150);
      p.setAttribute("rx", 30 + f * 100);
      p.setAttribute("ry", 16 + f * 30);
      p.style.opacity = Math.sin(Math.PI * f) * 0.55 * a;
    });
  };
}

// ── el polvo que flota en la cocina (pantalla) ─────────────────────────────────────────────────────────────────
function polvo(cont, semilla, cuantos = 18) {
  const r = K.azar(semilla);
  const ps = [];
  for (let i = 0; i < cuantos; i++) {
    const e = K.crear(cont, `<div class="c-polvo"></div>`);
    ps.push({ e, x: r() * 1080, y: 560 + r() * 1100, f: r() * 6.28, a: 0.2 + r() * 0.5, s: 0.5 + r() * 1.2, n: r() < 0.5 ? 0.04 : 0.07 });
  }
  return (g) => ps.forEach((p) => {
    p.e.style.transform = `translate(${p.x + Math.sin(vuelta(g, 0.06) + p.f) * 30}px, ${p.y + Math.sin(vuelta(g, p.n) + p.f * 2) * 60}px) scale(${p.s})`;
    p.e.style.opacity = p.a * (0.6 + 0.4 * Math.sin(vuelta(g, 0.14) + p.f));
  });
}

// ── las etiquetas (en pantalla, sujetas a un punto del mundo) ──────────────────────────────────────────────────
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.35)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
function etiqueta(cont, html, clase = "") { return K.crear(cont, `<div class="c-etq ${clase}">${html}</div>`); }
// la pone con su centro en (sx, sy), sin salirse de la zona de dibujo (ni de la franja de botones de la derecha)
function pon(e, sx, sy, on, dy = 24) {
  const w = e.offsetWidth, h = e.offsetHeight;
  const x = Math.min(Math.max(sx, 40 + w / 2), 950 - w / 2), y = Math.min(Math.max(sy, 560 + h / 2), 1440 - h / 2);
  e.style.opacity = on;
  e.style.transform = `translate(${(x - w / 2).toFixed(1)}px, ${(y - h / 2 + (1 - on) * dy).toFixed(1)}px) scale(${0.9 + 0.1 * on})`;
}
const tacha = (e, g, t) => { e.querySelector(".tacha").style.transform = `scaleX(${K.sale(K.tramo(g, t, t + 0.3))})`; };

const PESA = `<svg width="62" height="66" viewBox="0 0 62 66"><path d="M17 30 C13 6 49 6 45 30" fill="none" stroke="#c9ced6" stroke-width="8" stroke-linecap="round"/><circle cx="31" cy="44" r="21" fill="#c9ced6"/><circle cx="25" cy="38" r="6" fill="rgba(255,255,255,0.5)"/></svg>`;
const RELOJ = `<svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" fill="none" stroke="#fff" stroke-width="5"/><line class="aguja" x1="30" y1="30" x2="30" y2="11" stroke="${NARANJA}" stroke-width="6" stroke-linecap="round"/><circle cx="30" cy="30" r="4" fill="#fff"/></svg>`;
const COPO = `<svg width="48" height="48" viewBox="-24 -24 48 48"><g stroke="${AZUL}" stroke-width="4.5" stroke-linecap="round"><path d="M0 -20V20M-17.3 -10L17.3 10M-17.3 10L17.3 -10"/><path d="M-6 -16L0 -11L6 -16M-6 16L0 11L6 16"/></g></svg>`;
const BALA = `<svg width="150" height="52" viewBox="0 0 150 52"><path d="M0 8 H82 C118 8 142 18 150 26 C142 34 118 44 82 44 H0 Z" fill="#c99a45"/><path d="M0 8 H82 C112 8 132 14 142 20 H0 Z" fill="rgba(255,240,200,0.45)"/><rect x="0" y="6" width="10" height="40" fill="#8f6a2a"/></svg>`;

function rotulos(capa) {
  const goma = etiqueta(capa, `la goma<i class="tacha"></i>`);
  const hielo = etiqueta(capa, `el hielo<i class="tacha"></i>`);
  const coc = etiqueta(capa, `cocina <b>22 °C</b>`, "n");
  const frio = etiqueta(capa, `dentro <b>−18 °C</b>`, "c");
  const fu = etiqueta(capa, `fuera <b>100 %</b>`, "n");
  const de = etiqueta(capa, `dentro <b>99 %</b>`, "c"), deB = de.querySelector("b");
  const pesa = etiqueta(capa, `${PESA}<div><span class="num">40 kg</span><small>1 % de 1 atm sobre 60 × 70 cm</small></div>`, "c-pesa");
  const num = pesa.querySelector(".num");
  const sale = etiqueta(capa, `<b>aire</b> fuera`, "c");
  const reloj = etiqueta(capa, `${RELOJ}<b>1 min</b>`), aguja = reloj.querySelector(".aguja");
  const facil = etiqueta(capa, `<b>sin esfuerzo</b>`, "v");
  const junta = etiqueta(capa, `por la goma <b>entra aire</b>`, "n");
  const nofrio = etiqueta(capa, `${COPO}el frío<i class="tacha"></i>`);
  const sujeta = etiqueta(capa, `lo sujeta <b>el aire</b>`, "n");
  // la carrera de «más rápido que una bala»
  const banda = K.crear(capa, `<div class="c-banda"></div>`);
  const bola = K.crear(capa, ids(`<div class="c-corre"><svg width="190" height="64" viewBox="0 0 190 64"><line x1="10" y1="32" x2="150" y2="32" stroke="${NARANJA}" stroke-width="30" stroke-linecap="round" opacity="0.3"/><circle cx="158" cy="32" r="30" fill="${NARANJA}"/><circle cx="158" cy="32" r="30" fill="url(#c-bola2)"/><defs><radialGradient id="c-bola2" cx="0.35" cy="0.32" r="0.75"><stop offset="0" stop-color="rgba(255,255,255,0.85)"/><stop offset="0.35" stop-color="rgba(255,255,255,0)"/></radialGradient></defs></svg></div>`));
  const bala = K.crear(capa, `<div class="c-corre">${BALA}</div>`);
  const eMol = etiqueta(capa, `molécula <b>≈ 500 m/s</b>`, "n");
  const eBala = etiqueta(capa, `bala <b>≈ 370 m/s</b>`);

  return (g, k) => {
    const P = (wx, wy) => pantalla(k, wx, wy);
    let [x, y] = P(436, 432);
    pon(goma, x - 60, y + 130, asoma(g, T.goma, 6.4)); tacha(goma, g, T.goma + 0.5);
    [x, y] = P(760, 470);
    pon(hielo, x, y + 120, asoma(g, T.hielo, 6.4)); tacha(hielo, g, T.hielo + 0.45);
    [x, y] = P(130, 1000);
    pon(coc, x, y, asoma(g, T.caliente, 12.2));
    [x, y] = P(760, 820);
    pon(frio, x, y, Math.max(asoma(g, T.caliente + 0.15, 12.2), asoma(g, T.frena, 21.6)));
    // fuera 100 % / dentro 99 % → < 99 % (golpe) → 100 % (igual)
    [x, y] = P(190, 1240);
    pon(fu, x, y, asoma(g, T.uno, 44.2));
    [x, y] = P(800, 700);
    pon(de, x, y, asoma(g, T.uno + 0.2, 44.2));
    deB.textContent = g < T.todavia ? "99 %" : g < T.igual ? "< 99 %" : "100 %";
    de.className = "c-etq " + (g >= T.todavia && g < T.igual ? "r" : g >= T.igual ? "v" : "c");
    // la pesa: cuenta hasta 40 en «cuarenta», se pone roja en «todavía», se esconde mientras el reloj y baja a 0 en «igual»
    const vp = Math.max(asoma(g, T.cuarenta, 36.6), asoma(g, 42.2, 44.2));
    let kg = Math.round(40 * K.sale(K.tramo(g, T.cuarenta, T.cuarenta + 0.7)));
    if (g > 42) kg = Math.round(40 * (1 - K.suave(K.tramo(g, 42.4, 43.4))));
    num.textContent = g >= T.todavia && g < 37 ? "> 40 kg" : `${kg} kg`;
    num.className = "num" + (g >= T.todavia && g < 37 ? " r" : g > 43.3 ? " v" : "");
    pon(pesa, 540, 650, vp);
    [x, y] = P(160, 1080);
    pon(sale, x, y, asoma(g, T.echas, 36.2));
    pon(reloj, 540, 650, asoma(g, T.esperas, 40.3));
    aguja.setAttribute("transform", `rotate(${360 * K.suave(K.tramo(g, 38.0, 39.1))} 30 30)`);
    [x, y] = P(190, 900);
    pon(facil, x, y, asoma(g, T.esfuerzo, 40.5));
    [x, y] = P(440, 440);
    pon(junta, x + 40, y + 190, asoma(g, T.goma2, 43.3));
    [x, y] = P(760, 830);
    pon(nofrio, x, y, asoma(g, T.frio, 48.2)); tacha(nofrio, g, T.frio + 0.05);
    [x, y] = P(150, 1000);
    pon(sujeta, x, y, asoma(g, T.aire, 48.2));

    // la carrera: llegan las dos desde la izquierda, la molécula por delante, y se van en «sin parar»
    const vc = asoma(g, 13.45, 15.6);
    banda.style.opacity = vc;
    const ll = K.suave(K.tramo(g, 13.45, 14.35)), va = K.entra(K.tramo(g, T.parar, T.parar + 0.45));
    const xm = K.mez(-200, 610, ll) + 40 * K.tramo(g, 14.35, T.parar) + 900 * va;
    const xb = K.mez(-200, 220, K.suave(K.tramo(g, 13.55, 14.45))) + 28 * K.tramo(g, 14.45, T.parar) + 700 * va;
    bola.style.opacity = vc; bala.style.opacity = vc;
    bola.style.transform = `translate(${xm - 158}px, ${1150 - 32}px)`;
    bala.style.transform = `translate(${xb - 150}px, ${1300 - 26}px)`;
    pon(eMol, Math.min(xm - 60, 760), 1150 - 72, asoma(g, 14.24, 15.4));
    pon(eBala, Math.min(xb - 60, 700), 1300 + 76, asoma(g, 14.4, 15.4));
  };
}

// el camino de la cámara en todo el vídeo; acaba donde empieza
const CAMINO = [
  [0, F0], [1.6, { x: 560, y: 780, z: 1.3 }], [3.3, { x: 470, y: 700, z: 1.32 }], [4.2, { x: 470, y: 690, z: 1.36 }],
  [4.9, { x: 500, y: 520, z: 2.1 }], [6.2, { x: 505, y: 525, z: 2.05 }],                         // la junta y el hielo
  [7.0, { x: 420, y: 860, z: 1.05 }], [8.2, { x: 430, y: 850, z: 1.07 }],                         // empuja desde fuera
  [9.4, { x: 520, y: 860, z: 0.98 }], [11.3, { x: 530, y: 860, z: 1.0 }],                         // abres: entra el aire
  [12.6, { x: 390, y: 860, z: 2.4 }], [14.0, { x: 380, y: 870, z: 2.5 }], [16.1, { x: 400, y: 860, z: 2.4 }], // moléculas
  [17.2, { x: 600, y: 860, z: 1.0 }], [19.3, { x: 640, y: 850, z: 1.15 }], [21.4, { x: 620, y: 860, z: 1.12 }], // frena
  [22.6, { x: 380, y: 900, z: 1.25 }], [25.4, { x: 400, y: 900, z: 1.2 }],                        // fuera chocan
  [26.8, { x: 560, y: 880, z: 1.02 }], [29.0, { x: 550, y: 880, z: 1.04 }], [30.6, { x: 470, y: 880, z: 1.15 }],
  [31.9, { x: 480, y: 870, z: 1.12 }], [32.7, { x: 440, y: 860, z: 1.22 }], [34.3, { x: 380, y: 850, z: 1.05 }], // golpe
  [36.4, { x: 560, y: 870, z: 1.02 }], [38.0, { x: 540, y: 860, z: 1.0 }], [39.2, { x: 500, y: 820, z: 1.08 }],
  [40.0, { x: 490, y: 760, z: 1.25 }], [40.9, { x: 460, y: 470, z: 3.0 }], [42.3, { x: 470, y: 480, z: 2.9 }], // la junta
  [43.6, { x: 560, y: 860, z: 1.02 }], [44.4, { x: 560, y: 860, z: 1.0 }], [45.7, { x: 600, y: 830, z: 1.1 }],
  [47.4, { x: 470, y: 860, z: 1.12 }], [TOTAL, F0],
];
export function camaraEn(g) {
  const k = camara(g, CAMINO);
  // el temblor de los portazos (en píxeles de pantalla)
  const golpe = (t, a) => (g > t ? a * Math.exp(-(g - t) / 0.2) * Math.sin(2 * Math.PI * 13 * (g - t)) : 0);
  const s = golpe(T.golpe, 9) + golpe(16.85, 4);
  k.y += s / k.z;
  k.x += 0.4 * s / k.z;
  return k;
}

// ── lo que tiene cada escena, por capas: el fondo, el mundo, el polvo, la sombra de arriba y la pantalla ─────────
export function montaje(esc) {
  estilos();
  PRE = `c${++escenas}-`;
  K.crear(esc, `<div class="c-fondo"></div>`);
  const mundo = K.crear(esc, `<div class="c-mundo"></div>`);
  const sv = K.crear(mundo, `<svg data-layout-ignore aria-hidden="true" width="3700" height="2200" viewBox="-1000 -400 3700 2200" style="position:absolute;left:-1000px;top:-400px;overflow:visible">${ids(DIBUJO)}</svg>`);
  const q = (c) => sv.querySelector(c);
  const pv = polvo(esc, 7);
  K.crear(esc, `<div class="c-techo"></div>`);
  const capa = K.crear(esc, `<div class="c-capa"></div>`);
  return {
    mundo, sv, capa, pv,
    aparato: q(".c-aparato"), puerta: q(".c-puerta"), luz: q(".c-luz"),
    brazo: q(".c-brazo"), punto: q(".c-punto"), palma: q(".c-palma"),
    bolas: bolas(q(".c-bolas")), flechas: flechas(q(".c-flechas")), niebla: niebla(q(".c-niebla")),
    rotulos: rotulos(capa),
  };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los 0,3 s en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s, cambia) => {
    const g = g0 + s, k = camaraEn(g);
    if (cambia) cambia(g, k);
    cam(E.mundo, k.x, k.y, k.z);
    E.pv(g);
    // la puerta se separa y, en los tirones, el aparato se balancea sobre su pata de delante
    const hu = hueco(g), p = tiron(g), giro = -0.6 * p, dx = -hu - 2 * p;
    E.puerta.setAttribute("transform", `translate(${dx.toFixed(2)} 0)`);
    E.aparato.setAttribute("transform", `rotate(${giro.toFixed(3)} ${PIVOTE.x} ${PIVOTE.y})`);
    E.luz.style.opacity = 0.3 + 0.7 * K.lim(hu / 60);
    // la mano va con el tirador (en la puerta, girada con el aparato)
    const th = giro * Math.PI / 180, ax = 300 + dx - PIVOTE.x, ay = 560 - PIVOTE.y;
    const mx = PIVOTE.x + ax * Math.cos(th) - ay * Math.sin(th) - 300, my = PIVOTE.y + ax * Math.sin(th) + ay * Math.cos(th) - 560;
    E.palma.setAttribute("transform", `translate(${mx.toFixed(2)} ${my.toFixed(2)})`);
    const d = `M-760 820 L${(215 + mx).toFixed(1)} ${(575 + my).toFixed(1)}`;
    E.brazo.setAttribute("d", d);
    E.punto.setAttribute("d", d);
    E.niebla(g);
    E.bolas(g);
    E.flechas(g);
    E.rotulos(g, k);
    return { g, k };
  };
  return E;
}
