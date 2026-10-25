// Lo que sale en varias escenas: la hoja impresa con su cuadrícula de puntos amarillos, la lupa, la impresora, el
// billete, el documento de 2017 y el móvil del cierre. Todo en 2D, con su luz y su textura.
const K = window.K;
let n = 0;
const uid = (p) => `${p}-${++n}`;

export const W = 1000, H = 1414;               // la hoja, en unidades del mundo (A4)
export const T = { s: 5, cols: 15, rows: 8, px: 92, py: 52, ox: 14, oy: 18 };  // la cuadrícula y cada cuánto se repite

// Lo que dicen los puntos, por columnas de 7 bits (la fila 0 es la paridad), como en las DocuColor.
export const HOY = { 2: 42, 3: 21, 8: 51, 9: 76, 14: 127, 1: 47, 4: 8, 5: 25, 6: 10, 7: 26, 10: 50, 11: 48, 12: 31, 13: 72 };       // 25/10/2026 08:47
export const FILTRADA = { 2: 42, 3: 21, 8: 51, 9: 76, 14: 127, 1: 20, 4: 6, 5: 9, 6: 5, 7: 17, 10: 29, 11: 53, 12: 52, 13: 18 };   // 9/5/2017 6:20, n.º 29535218
export function bits(v) {
  const b = [];
  for (let r = 0; r < T.rows; r++) b.push(new Array(T.cols).fill(0));
  for (let c = 0; c < T.cols; c++) {
    const x = v[c] || 0;
    let unos = 0;
    for (let r = 1; r < T.rows; r++) { const bit = (x >> (r - 1)) & 1; b[r][c] = bit; unos += bit; }
    b[0][c] = unos % 2 === 0 ? 1 : 0;
  }
  return b;
}

const CSS = `
.m-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }
.m-fondo { position: absolute; inset: 0; background:
  radial-gradient(ellipse 70% 45% at 50% 62%, rgba(255, 236, 205, 0.16), transparent 70%),
  radial-gradient(ellipse 120% 80% at 50% 40%, #191c21 0%, #0c0e11 70%); }
.m-polvo { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 244, 225, 0.5); filter: blur(1.5px); }
.m-techo { position: absolute; left: 0; right: 0; top: 0; height: 700px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(11, 13, 16, 0.98) 0, rgba(11, 13, 16, 0.92) 300px, rgba(11, 13, 16, 0.84) 480px, rgba(11, 13, 16, 0) 690px); }
.m-mundo { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: 0 0; }
.m-hoja { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden;
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.55), 0 6px 18px rgba(0, 0, 0, 0.35); }
.m-papel { position: absolute; inset: 0; background: #f7f5ef; }
.m-papel::before { content: ""; position: absolute; inset: 0; background: url(recursos/papel.png); background-size: 420px;
  mix-blend-mode: multiply; opacity: 0.42; }
.m-papel::after { content: ""; position: absolute; inset: 0;
  background: radial-gradient(ellipse 90% 70% at 22% 18%, rgba(255, 252, 240, 0.55), rgba(255, 252, 240, 0) 60%),
    linear-gradient(135deg, rgba(255, 255, 255, 0) 30%, rgba(90, 70, 45, 0.22) 75%, rgba(50, 38, 25, 0.38) 100%); }
.m-doc { position: absolute; left: 92px; right: 92px; top: 86px; font-family: Carlito, "Liberation Sans", sans-serif;
  color: #1d1d1f; font-size: 19px; line-height: 1.5; }
.m-doc .cab { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #1d1d1f; padding-bottom: 10px; }
.m-doc .emp { font-weight: 700; font-size: 22px; letter-spacing: 0.04em; }
.m-doc .emp small { display: block; font-weight: 400; font-size: 15px; letter-spacing: 0; color: #444; }
.m-doc .ref { font-size: 15px; color: #444; text-align: right; }
.m-doc h1 { font-size: 40px; margin: 42px 0 6px; letter-spacing: 0.02em; }
.m-doc .sub { color: #444; margin-bottom: 26px; }
.m-doc h2 { font-size: 22px; margin: 22px 0 6px; }
.m-doc p { margin: 0 0 12px; text-align: justify; }
.m-doc table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; font-size: 18px; }
.m-doc td, .m-doc th { border-bottom: 1px solid #9a9a9a; padding: 6px 8px; text-align: left; }
.m-doc th { border-bottom: 2px solid #1d1d1f; }
.m-doc .firmas { display: flex; justify-content: space-between; margin-top: 56px; }
.m-doc .firmas div { width: 330px; border-top: 1px solid #1d1d1f; padding-top: 6px; font-size: 16px; color: #333; }
.m-puntos { position: absolute; left: 0; top: 0; overflow: visible; }

.m-lupa { position: absolute; left: 0; top: 0; }
.m-lupa .vidrio { position: absolute; left: 0; top: 0; border-radius: 50%; overflow: hidden; background: #f7f5ef; }
.m-lupa .dentro { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }
.m-lupa .reflejo { position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(ellipse 55% 30% at 32% 22%, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0) 70%),
    radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 78%, rgba(40, 60, 70, 0.28) 100%); }
.m-lupa .aro { position: absolute; left: 0; top: 0; border-radius: 50%; box-sizing: border-box;
  border: 22px solid #2b2f35;
  box-shadow: inset 0 0 0 3px #9aa3ad, inset 0 0 0 6px #1a1d21, 0 0 0 3px #60666e, 0 0 0 5px #15171a, 0 30px 50px rgba(0, 0, 0, 0.45);
  background: conic-gradient(from 210deg, rgba(255,255,255,0.0), rgba(255,255,255,0.18), rgba(255,255,255,0.0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.12), rgba(255,255,255,0));
  -webkit-mask: radial-gradient(circle, transparent calc(50% - 22px), #000 calc(50% - 21px)); mask: radial-gradient(circle, transparent calc(50% - 22px), #000 calc(50% - 21px)); }
.m-lupa .sombra { position: absolute; border-radius: 50%; background: rgba(40, 30, 20, 0.32); filter: blur(26px); }
.m-lupa .mango { position: absolute; width: 74px; border-radius: 30px 30px 38px 38px; transform-origin: 50% 0;
  background: linear-gradient(90deg, #121417 0%, #3a3f46 28%, #22262b 55%, #0e1012 100%);
  box-shadow: 0 30px 40px rgba(0, 0, 0, 0.5); }
.m-lupa .mango::before { content: ""; position: absolute; left: 6px; right: 6px; top: 34px; height: 60px; border-radius: 10px;
  background: linear-gradient(90deg, #6f7781, #c9d0d8 35%, #7d858f 60%, #4a5058); }
.m-lupa .mango::after { content: ""; position: absolute; left: 10px; right: 10px; top: 120px; bottom: 30px; border-radius: 20px;
  background: repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 6px, rgba(0,0,0,0.25) 6px 12px); }

.m-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 40px; color: #fff;
  background: rgba(14, 16, 20, 0.86); border: 2px solid rgba(255, 255, 255, 0.16); border-radius: 16px; padding: 10px 22px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); }
.m-etq b { color: #ffd21f; font-family: var(--letra-mono), monospace; font-weight: 700; }
.m-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }
.m-fuente { position: absolute; font-family: var(--letra), sans-serif; font-size: 32px; color: #8a9099; white-space: nowrap; }

.m-imp { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.m-imp .tapa { position: absolute; left: 40px; right: 40px; top: 1060px; height: 220px; border-radius: 34px 34px 0 0;
  background: linear-gradient(180deg, #d6d9dd 0%, #e9ebee 45%, #f4f5f7 100%);
  box-shadow: inset 0 3px 0 rgba(255,255,255,0.9), inset 0 -2px 0 rgba(0,0,0,0.08); }
.m-imp .hueco { position: absolute; left: 130px; right: 130px; top: 1150px; height: 46px; border-radius: 10px;
  background: linear-gradient(180deg, #050607 0%, #17191c 60%, #2a2d31 100%); box-shadow: inset 0 8px 14px rgba(0,0,0,0.9), 0 2px 0 rgba(255,255,255,0.7); }
.m-imp .rodillo { position: absolute; top: 1166px; width: 120px; height: 22px; border-radius: 11px;
  background: linear-gradient(180deg, #3b3f44 0%, #8a9098 35%, #2c2f33 70%, #141618 100%); }
.m-imp .frente { position: absolute; left: 40px; right: 40px; top: 1276px; bottom: -40px;
  background: linear-gradient(180deg, #eef0f2 0%, #e0e3e7 40%, #c7cbd1 100%);
  box-shadow: inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -40px 80px rgba(0,0,0,0.12); }
.m-imp .junta { position: absolute; left: 40px; right: 40px; top: 1276px; height: 3px; background: rgba(0,0,0,0.18); }
.m-imp .ventana { position: absolute; left: 110px; top: 1320px; width: 560px; height: 270px; border-radius: 18px; overflow: hidden;
  background: linear-gradient(180deg, #23262b, #121418); box-shadow: inset 0 6px 18px rgba(0,0,0,0.8); }
.m-imp .toner { position: absolute; top: 30px; width: 110px; height: 220px; border-radius: 14px;
  background: linear-gradient(90deg, #2e3238 0%, #50565e 30%, #33373d 70%, #1f2226 100%); }
.m-imp .toner i { position: absolute; left: 14px; right: 14px; top: 16px; height: 120px; border-radius: 10px; }
.m-imp .toner span { position: absolute; left: 0; right: 0; bottom: 18px; text-align: center; font-family: var(--letra), sans-serif;
  font-weight: 800; font-size: 40px; color: #e9ecef; }
.m-imp .puerta { position: absolute; left: 110px; top: 1320px; width: 560px; height: 270px; border-radius: 18px;
  background: linear-gradient(180deg, #e6e9ec, #d3d7dc); box-shadow: inset 0 0 0 2px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8); }
.m-imp .puerta::after { content: ""; position: absolute; left: 200px; right: 200px; top: 24px; height: 18px; border-radius: 9px;
  background: linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.05)); }
.m-imp .panel { position: absolute; left: 720px; top: 1310px; width: 210px; height: 150px; border-radius: 16px;
  background: linear-gradient(180deg, #2a2e33, #1a1d21); box-shadow: inset 0 0 0 2px #3c4148; }
.m-imp .lcd { position: absolute; left: 18px; top: 18px; right: 18px; height: 70px; border-radius: 8px;
  background: linear-gradient(180deg, #8fc6e8, #5c9ec9); box-shadow: inset 0 0 12px rgba(0,30,60,0.6);
  font-family: var(--letra), sans-serif; font-weight: 700; font-size: 38px; color: #0d2a40; text-align: center; line-height: 70px; }
.m-imp .led { position: absolute; left: 30px; bottom: 22px; width: 18px; height: 18px; border-radius: 50%; background: #3ef08f;
  box-shadow: 0 0 14px #3ef08f; }
.m-imp .boton { position: absolute; bottom: 16px; width: 48px; height: 30px; border-radius: 8px; background: linear-gradient(180deg, #4a5058, #2a2e33); }
.m-imp .rejilla { position: absolute; left: 720px; top: 1490px; width: 210px; height: 100px;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,0.20) 0 6px, rgba(255,255,255,0.5) 6px 14px); border-radius: 8px; opacity: 0.6; }
.m-imp .cajon { position: absolute; left: 40px; right: 40px; top: 1640px; height: 4px; background: rgba(0,0,0,0.18); }
.m-imp .asa { position: absolute; left: 400px; width: 280px; top: 1670px; height: 26px; border-radius: 13px; background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.05)); }

.m-billete { position: absolute; left: 0; top: 0; width: 860px; height: 420px; border-radius: 10px; overflow: hidden;
  background: linear-gradient(120deg, #c9d3bf 0%, #dfe5d5 40%, #b9c6ae 100%); box-shadow: 0 30px 70px rgba(0,0,0,0.5); }
.m-billete .marco { position: absolute; inset: 16px; border: 3px solid #5d6e57; border-radius: 6px; }
.m-billete .marco2 { position: absolute; inset: 28px; border: 1px solid #7d8e75; border-radius: 4px; }
.m-billete .cifra { position: absolute; font-family: "Liberation Serif", serif; font-weight: 700; color: #3f5139; }
.m-billete .texto { position: absolute; left: 0; right: 0; top: 56px; text-align: center; font-family: "Liberation Serif", serif;
  font-size: 34px; letter-spacing: 0.3em; color: #44563e; }
.m-billete .sello { position: absolute; left: 230px; top: 140px; width: 400px; height: 140px; border: 8px double #e3263c; border-radius: 14px;
  color: #e3263c; font-family: var(--letra), sans-serif; font-weight: 900; font-size: 96px; line-height: 124px; text-align: center; letter-spacing: 0.08em;
  transform: rotate(-12deg); mix-blend-mode: multiply; }

.m-secreto { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #e4e4e0;
  box-shadow: 0 40px 90px rgba(0,0,0,0.55); }
.m-secreto::before { content: ""; position: absolute; inset: 0; background: url(recursos/papel.png); background-size: 300px; mix-blend-mode: multiply; opacity: 0.6; }
.m-secreto .txt { position: absolute; left: 110px; right: 110px; top: 70px; font-family: "Liberation Mono", monospace; font-size: 20px; line-height: 1.75; color: #2b2b2b; }
.m-secreto .marca { text-align: center; font-weight: 700; font-size: 30px; letter-spacing: 0.12em; color: #111; }
.m-secreto .tacha { display: inline-block; height: 0.95em; vertical-align: -0.12em; background: #0d0d0d; }

.m-web { position: absolute; left: 0; top: 0; width: 1080px; height: 1500px; border-radius: 26px; overflow: hidden; background: #f3f4f6;
  box-shadow: 0 40px 100px rgba(0,0,0,0.6); }
.m-web .barra { position: absolute; left: 0; right: 0; top: 0; height: 96px; background: #dfe2e6; }
.m-web .barra i { position: absolute; top: 36px; width: 24px; height: 24px; border-radius: 50%; }
.m-web .url { position: absolute; left: 150px; right: 40px; top: 22px; height: 52px; border-radius: 26px; background: #fff;
  font-family: var(--letra), sans-serif; font-size: 32px; line-height: 52px; color: #5b6168; padding-left: 28px; }
.m-web .tit { position: absolute; left: 60px; right: 60px; top: 130px; font-family: "Liberation Serif", serif; font-weight: 700; font-size: 62px;
  line-height: 1.1; color: #111; }
.m-web .ante { position: absolute; left: 60px; top: 300px; font-family: var(--letra), sans-serif; font-weight: 800; font-size: 32px;
  color: #c62828; letter-spacing: 0.08em; }

.m-movil { position: absolute; left: -40px; top: -40px; width: 1160px; height: 2000px; border-radius: 130px; box-sizing: border-box;
  border: 40px solid #15171b; box-shadow: 0 0 0 4px #4d525a, 0 0 0 9px #1c1f23, inset 0 0 0 3px #000, 0 60px 120px rgba(0,0,0,0.7); }
.m-isla { position: absolute; left: 430px; top: 30px; width: 220px; height: 62px; border-radius: 31px; background: #050505; }
.m-reel-ui { position: absolute; inset: 0; pointer-events: none; font-family: var(--letra), sans-serif; color: #fff;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.62) 100%); }
.m-reel-ui .ico { filter: drop-shadow(0 3px 10px rgba(0,0,0,0.8)); }
.m-reel-ui .ico { position: absolute; left: 930px; width: 100px; height: 100px; }
.m-reel-ui .ico svg { width: 100%; height: 100%; overflow: visible; }
.m-reel-ui .nombre { position: absolute; left: 60px; top: 1620px; font-weight: 700; font-size: 60px; text-shadow: 0 2px 12px rgba(0,0,0,0.6); }
.m-hoja-env { position: absolute; left: 0; right: 0; top: 0; height: 900px; border-radius: 70px 70px 0 0; background: #1d2026;
  box-shadow: 0 -20px 60px rgba(0,0,0,0.5); font-family: var(--letra), sans-serif; color: #fff; }
.m-hoja-env .asa { position: absolute; left: 470px; top: 26px; width: 140px; height: 14px; border-radius: 7px; background: #5a5f68; }
.m-hoja-env .t { position: absolute; left: 0; right: 0; top: 70px; text-align: center; font-weight: 700; font-size: 64px; }
.m-hoja-env .c { position: absolute; top: 210px; width: 300px; text-align: center; font-size: 56px; font-weight: 600; line-height: 1.1; }
.m-hoja-env .c i { display: block; margin: 0 auto 22px; width: 200px; height: 200px; border-radius: 50%; font-style: normal;
  font-size: 84px; font-weight: 800; line-height: 200px; color: #fff; box-shadow: 0 0 0 0 #2f7cf6; }
.m-hoja-env .ok { position: absolute; left: 80px; right: 80px; top: 640px; height: 150px; border-radius: 75px; background: #2f7cf6;
  text-align: center; font-weight: 800; font-size: 64px; line-height: 150px; }
.m-dedo { position: absolute; left: 0; top: 0; width: 260px; height: 520px; transform-origin: 70px 30px; filter: drop-shadow(0 30px 30px rgba(0,0,0,0.45)); }
.m-toque { position: absolute; width: 120px; height: 120px; margin: -60px 0 0 -60px; border-radius: 50%; border: 6px solid rgba(255,255,255,0.9); opacity: 0; }
`;
export function estilos() {
  if (document.getElementById("mundo-css")) return;
  const s = document.createElement("style");
  s.id = "mundo-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── fondo, polvo y la sombra de arriba (para que el subtítulo se lea) ───────────────────────────────────────────
export function fondo(cont) { return K.crear(cont, `<div class="m-fondo"></div>`); }
export function polvo(cont, semilla, cuantos = 22) {
  const r = K.azar(semilla);
  const ps = [];
  for (let i = 0; i < cuantos; i++) {
    const el = K.crear(cont, `<div class="m-polvo"></div>`);
    ps.push({ el, x: r() * 1080, y: 380 + r() * 1400, v: 6 + r() * 14, f: r() * 6.28, a: 0.25 + r() * 0.6, e: 0.5 + r() * 1.2 });
  }
  return (s) => ps.forEach((p) => {
    p.el.style.transform = `translate(${p.x + Math.sin(s * 0.4 + p.f) * 30}px, ${p.y - s * p.v}px) scale(${p.e})`;
    p.el.style.opacity = p.a * (0.6 + 0.4 * Math.sin(s * 0.9 + p.f));
  });
}
export function techo(cont) { return K.crear(cont, `<div class="m-techo"></div>`); }

// ── la cámara: el punto (fx, fy) del mundo queda en (540, 1000) con zoom z ──────────────────────────────────────
export function cam(el, fx, fy, z, giro = 0) {
  el.style.transform = `translate(${540 - fx * z}px, ${1000 - fy * z}px) scale(${z})` + (giro ? ` rotate(${giro}deg)` : "");
}

// ── los puntos: un <svg> del tamaño de la hoja con la cuadrícula repetida ───────────────────────────────────────
// modo: "tenue" (como se ven a simple vista: casi nada), "brillo" (lo invisible, dibujado), "oscuro" (con luz azul)
export function puntos(cont, modo, b, w = W, h = H, extra = "") {
  const id = uid("pt");
  let defs = "", dot = "";
  if (modo === "tenue") dot = (x, y) => `<circle cx="${x}" cy="${y}" r="0.55" fill="#efd96a" opacity="0.5"/>`;
  if (modo === "oscuro") dot = (x, y) => `<circle cx="${x}" cy="${y}" r="0.95" fill="#0a1636" opacity="0.88"/>`;
  if (modo === "brillo") {
    defs = `<radialGradient id="${id}-g"><stop offset="0" stop-color="#fff3a6" stop-opacity="0.95"/><stop offset="0.35" stop-color="#ffd21f" stop-opacity="0.75"/><stop offset="1" stop-color="#ffb800" stop-opacity="0"/></radialGradient>`;
    dot = (x, y) => `<circle cx="${x}" cy="${y}" r="2.4" fill="url(#${id}-g)"/><circle cx="${x}" cy="${y}" r="1" fill="#ffcf10"/>`;
  }
  let celdas = "";
  for (let r = 0; r < T.rows; r++) for (let c = 0; c < T.cols; c++) if (b[r][c]) celdas += dot(c * T.s + 2.5, r * T.s + 2.5);
  const svg = `<svg class="m-puntos" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="${extra}">
    <defs>${defs}<pattern id="${id}" x="${T.ox}" y="${T.oy}" width="${T.px}" height="${T.py}" patternUnits="userSpaceOnUse">${celdas}</pattern></defs>
    <rect width="${w}" height="${h}" fill="url(#${id})"/></svg>`;
  return K.crear(cont, svg);
}
// Los recuadros amarillos de cada repetición (para enseñar la cuadrícula). Devuelve los <rect>, con su centro.
export function recuadros(cont, w = W, h = H) {
  let r = "";
  const lista = [];
  for (let y = T.oy; y + T.rows * T.s < h; y += T.py) for (let x = T.ox; x + T.cols * T.s < w; x += T.px) {
    lista.push([x, y]);
    r += `<rect x="${x - 2}" y="${y - 2}" width="${T.cols * T.s + 4}" height="${T.rows * T.s + 4}" rx="3" fill="rgba(255,210,31,0.10)" stroke="#ffd21f" opacity="0"/>`;
  }
  const svg = K.crear(cont, `<svg class="m-puntos" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="filter: drop-shadow(0 0 4px rgba(255,210,31,0.8))">${r}</svg>`);
  return [...svg.querySelectorAll("rect")].map((el, i) => ({ el, x: lista[i][0] + T.cols * T.s / 2, y: lista[i][1] + T.rows * T.s / 2 }));
}

// ── la hoja impresa del trabajo ─────────────────────────────────────────────────────────────────────────────────
const ACTA = `
<div class="cab"><div class="emp">NORTEMAR LOGÍSTICA<small>Departamento comercial · Planta 3</small></div><div class="ref">Ref. DC-2026/118<br>Página 1 de 2</div></div>
<h1>ACTA DE REUNIÓN</h1>
<div class="sub">Reunión semanal del equipo comercial · Sala 2 · 24 de octubre de 2026, 9:30</div>
<h2>1. Asistentes</h2>
<p>Marta Ruiz (dirección comercial), Javier Lago, Lucía Ferreiro, Andrés Pena y Sara Domínguez. Excusa su ausencia
Pablo Vidal, que envía su informe por correo.</p>
<h2>2. Resultados del trimestre</h2>
<p>Se revisan las ventas del tercer trimestre por zonas. El norte supera el objetivo gracias a los dos contratos nuevos
de transporte refrigerado; el centro se queda por debajo por el retraso en la entrega de las furgonetas.</p>
<table><tr><th>Zona</th><th>Objetivo</th><th>Real</th><th>Diferencia</th></tr>
<tr><td>Norte</td><td>412.000 €</td><td>448.300 €</td><td>+8,8 %</td></tr>
<tr><td>Centro</td><td>365.000 €</td><td>331.900 €</td><td>−9,1 %</td></tr>
<tr><td>Levante</td><td>290.000 €</td><td>296.400 €</td><td>+2,2 %</td></tr></table>
<h2>3. Acuerdos</h2>
<p>Se acuerda revisar las tarifas de la zona centro antes del 15 de noviembre y preparar la propuesta para el cliente de
Vigo. Lucía coordinará las visitas de la próxima semana y Andrés actualizará la hoja de clientes con los datos de
octubre. La próxima reunión será el viernes 31 a la misma hora.</p>
<p>Se recuerda a todo el equipo que los documentos de clientes no se dejan en la bandeja de la impresora ni sobre las
mesas al terminar la jornada.</p>
<div class="firmas"><div>Marta Ruiz · Dirección comercial</div><div>Javier Lago · Secretario</div></div>`;
export function hoja(cont, { modo = "tenue", b = bits(HOY), doc = true } = {}) {
  const el = K.crear(cont, `<div class="m-hoja" data-layout-ignore aria-hidden="true"><div class="m-papel"></div>${doc ? `<div class="m-doc">${ACTA}</div>` : ""}</div>`);
  if (modo !== "no") el.puntosEl = puntos(el, modo, b);
  return el;
}

// ── el documento de 2017 (recreación) ──────────────────────────────────────────────────────────────────────────
export function secreto(cont, { modo = "no", b = bits(FILTRADA) } = {}) {
  const tacha = (w) => `<span class="tacha" style="width:${w}px"></span>`;
  const linea = (ws) => ws.map((w) => (typeof w === "number" ? tacha(w) : w)).join(" ");
  const txt = `<div class="marca">ALTO SECRETO // USO RESTRINGIDO</div><br>
  <div>INFORME DE INTELIGENCIA &nbsp;·&nbsp; ${tacha(260)}</div>
  <div>ASUNTO: ${tacha(520)}</div><br>
  <div>${linea(["(S)", 300, "durante la campaña", 180, "se detectaron accesos a", 140])}</div>
  <div>${linea([220, "de", 160, "mediante correos", 260, "dirigidos a"])}</div>
  <div>${linea(["empleados de", 340, "que", 120, "las credenciales", 90])}</div>
  <div>${linea([400, "y", 300])}</div><br>
  <div>${linea(["(S)", 180, "los operadores", 240, "una segunda fase", 120])}</div>
  <div>${linea([260, "con documentos", 200, "que contenían", 120])}</div>
  <div>${linea(["", 620])}</div>
  <div>${linea([340, "a partir del", 180])}</div><br>
  <div>${linea(["(S)", 520, "evaluación:"])}</div>
  <div>${linea([180, "es probable que", 330])}</div>
  <div>${linea([600])}</div><br><br><br><br><br><br><br>
  <div class="marca">ALTO SECRETO // USO RESTRINGIDO</div>`;
  const el = K.crear(cont, `<div class="m-secreto" data-layout-ignore aria-hidden="true"><div class="txt">${txt}</div></div>`);
  if (modo !== "no") el.puntosEl = puntos(el, modo, b);
  return el;
}

// ── la lupa: aumenta M veces lo que haya debajo de su centro ────────────────────────────────────────────────────
// Lo que se ve dentro se dibuja otra vez en L.dentro (en las mismas coordenadas de pantalla), con los puntos en "brillo".
export function lupa(cont, R = 200) {
  const el = K.crear(cont, `<div class="m-lupa">
    <div class="sombra" style="left:${-R * 0.9 + 40}px;top:${-R * 0.9 + 70}px;width:${R * 1.8}px;height:${R * 1.8}px"></div>
    <div class="mango" style="left:${-37}px;top:${R - 6}px;height:340px;transform:rotate(38deg)"></div>
    <div class="vidrio" style="left:${-R}px;top:${-R}px;width:${2 * R}px;height:${2 * R}px"><div class="dentro" data-layout-ignore aria-hidden="true"></div><div class="reflejo"></div></div>
    <div class="aro" style="left:${-R - 6}px;top:${-R - 6}px;width:${2 * R + 12}px;height:${2 * R + 12}px"></div></div>`);
  return { el, R, dentro: el.querySelector(".dentro") };
}
export function ponLupa(L, sx, sy, M = 2.6, giro = 0) {
  L.el.style.transform = `translate(${sx}px, ${sy}px) rotate(${giro}deg)`;
  // el centro del vidrio está en (R, R): un punto p de la pantalla se ve en R + M·(p − s)
  L.dentro.style.transform = `translate(${L.R}px, ${L.R}px) rotate(${-giro}deg) scale(${M}) translate(${-sx}px, ${-sy}px)`;
}

// ── etiquetas con su línea fina ────────────────────────────────────────────────────────────────────────────────
export function etiqueta(cont, html, x, y) {
  const el = K.crear(cont, `<div class="m-etq">${html}</div>`);
  el.style.left = x + "px";
  el.style.top = y + "px";
  return el;
}
export function linea(svg, x1, y1, x2, y2, color = "#ffd21f") {
  const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
  l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", x2); l.setAttribute("y2", y2);
  l.setAttribute("stroke", color); l.setAttribute("stroke-width", "4"); l.setAttribute("stroke-linecap", "round");
  svg.appendChild(l);
  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  c.setAttribute("cx", x2); c.setAttribute("cy", y2); c.setAttribute("r", "9"); c.setAttribute("fill", color);
  svg.appendChild(c);
  return { l, c, largo: Math.hypot(x2 - x1, y2 - y1) };
}
export function trazo(L, u) {   // dibuja la línea de 0 a 1
  L.l.setAttribute("stroke-dasharray", L.largo);
  L.l.setAttribute("stroke-dashoffset", L.largo * (1 - K.lim(u)));
  L.c.setAttribute("r", 9 * K.sale(K.tramo(u, 0.85, 1)));
}
export function lienzo(cont) {
  return K.crear(cont, `<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;left:0;top:0;overflow:visible"></svg>`);
}

// ── la impresora láser de oficina (de frente, de cerca). La ranura de salida está en y = 1173 ───────────────────
export const RANURA = 1173;
export function impresora(cont) {
  const el = K.crear(cont, `<div class="m-imp" data-layout-ignore>
    <div class="tapa"></div><div class="hueco"></div>
    <div class="rodillo" style="left:200px"></div><div class="rodillo" style="left:480px"></div><div class="rodillo" style="left:760px"></div>
    <div class="frente"></div><div class="junta"></div>
    <div class="ventana">
      <div class="toner" style="left:22px"><i style="background:linear-gradient(90deg,#007fb3,#22c4ff 40%,#0090c8)"></i><span>C</span></div>
      <div class="toner" style="left:156px"><i style="background:linear-gradient(90deg,#a3005a,#ff2a9a 40%,#c4006c)"></i><span>M</span></div>
      <div class="toner amarillo" style="left:290px"><i style="background:linear-gradient(90deg,#d9a900,#ffe45a 40%,#f0bf00)"></i><span>Y</span></div>
      <div class="toner" style="left:424px"><i style="background:linear-gradient(90deg,#0b0c0d,#3a3d41 40%,#141517)"></i><span>K</span></div>
    </div>
    <div class="puerta"></div>
    <div class="panel"><div class="lcd">Listo</div><div class="led"></div><div class="boton" style="left:96px"></div><div class="boton" style="left:150px"></div></div>
    <div class="rejilla"></div><div class="cajon"></div><div class="asa"></div></div>`);
  return {
    el,
    puerta: el.querySelector(".puerta"),
    amarillo: el.querySelector(".toner.amarillo i"),
    lcd: el.querySelector(".lcd"),
  };
}
// Lo que sale por la ranura: un contenedor recortado justo en la ranura, para que la hoja salga de dentro.
export function salida(cont) {
  return K.crear(cont, `<div style="position:absolute;left:0;top:0;width:1080px;height:${RANURA}px;overflow:hidden"></div>`);
}

// ── el billete (inventado: no imita ninguna moneda) ────────────────────────────────────────────────────────────
export function billete(cont) {
  let roseta = "";
  for (let i = 0; i < 36; i++) roseta += `<ellipse cx="0" cy="0" rx="150" ry="52" transform="rotate(${i * 5})" fill="none" stroke="#6f8467" stroke-width="1.2" opacity="0.8"/>`;
  let ondas = "";
  for (let k = 0; k < 14; k++) {
    let d = "M0 " + (40 + k * 26);
    for (let x = 0; x <= 860; x += 20) d += ` L${x} ${40 + k * 26 + Math.sin(x / 34 + k) * 8}`;
    ondas += `<path d="${d}" fill="none" stroke="#8fa286" stroke-width="1" opacity="0.55"/>`;
  }
  return K.crear(cont, `<div class="m-billete" data-layout-ignore aria-hidden="true">
    <svg width="860" height="420" style="position:absolute;inset:0">${ondas}<g transform="translate(430 230)">${roseta}<circle r="64" fill="#cfd8c4" stroke="#5d6e57" stroke-width="3"/></g></svg>
    <div class="marco"></div><div class="marco2"></div>
    <div class="texto">CIEN UNIDADES</div>
    <div class="cifra" style="left:56px;top:40px;font-size:84px">100</div>
    <div class="cifra" style="right:56px;bottom:30px;font-size:110px">100</div>
    <div class="cifra" style="left:396px;top:196px;font-size:60px">C</div>
    <div class="sello">FALSO</div></div>`);
}

// ── el dedo que toca ───────────────────────────────────────────────────────────────────────────────────────────
// La yema queda en (70, 30) del elemento: se coloca con translate(x - 70, y - 30).
export function dedo(cont) {
  return K.crear(cont, `<svg class="m-dedo" viewBox="0 0 260 520">
    <defs><linearGradient id="m-piel" x1="0" x2="1"><stop offset="0" stop-color="#c98c66"/><stop offset="0.35" stop-color="#f0c3a1"/><stop offset="0.7" stop-color="#e2a982"/><stop offset="1" stop-color="#b9774f"/></linearGradient>
    <linearGradient id="m-una" x1="0" x2="1"><stop offset="0" stop-color="#f6d9c8"/><stop offset="0.5" stop-color="#fff1e8"/><stop offset="1" stop-color="#e9c3ad"/></linearGradient></defs>
    <path d="M30 70 C30 25 110 25 110 70 L120 300 C190 300 250 340 250 420 L250 520 L20 520 L22 420 C22 380 26 330 30 300 Z" fill="url(#m-piel)"/>
    <path d="M44 66 C44 38 96 38 96 66 L96 120 C80 128 60 128 44 120 Z" fill="url(#m-una)" opacity="0.95"/>
    <path d="M40 200 C60 210 90 210 112 200" stroke="#b67b55" stroke-width="3" fill="none" opacity="0.6"/>
    <path d="M38 228 C60 238 92 238 114 228" stroke="#b67b55" stroke-width="2" fill="none" opacity="0.45"/>
    </svg>`);
}
export function ponDedo(el, x, y, apretar = 0) {
  el.style.transform = `translate(${x - 70}px, ${y - 30}px) rotate(-14deg) scale(${1 - 0.06 * apretar})`;
}

// ── números de puntos (para «08:47» dentro de la lupa) ────────────────────────────────────────────────────────
const F = { "0": ["111", "101", "101", "101", "111"], "8": ["111", "101", "111", "101", "111"], "4": ["101", "101", "111", "001", "001"],
  "7": ["111", "001", "010", "010", "010"], ":": ["0", "1", "0", "1", "0"] };
export function cifrasDePuntos(texto, paso) {   // devuelve [[x, y], ...] centrado en 0,0
  const pts = [];
  let x = 0;
  for (const ch of texto) {
    const g = F[ch];
    g.forEach((fila, r) => [...fila].forEach((v, c) => { if (v === "1") pts.push([x + c * paso, r * paso]); }));
    x += (g[0].length + 1) * paso;
  }
  const w = x - paso, h = 4 * paso;
  return pts.map(([a, b]) => [a - w / 2, b - h / 2]);
}

// Un recorrido que se para en cada punto: [[segundo, x, y], ...]; cada tramo arranca y frena suave.
export function tramos(s, P) {
  if (s <= P[0][0]) return { x: P[0][1], y: P[0][2] };
  for (let i = 1; i < P.length; i++) if (s <= P[i][0]) {
    const u = K.suave(K.tramo(s, P[i - 1][0], P[i][0]));
    return { x: K.mez(P[i - 1][1], P[i][1], u), y: K.mez(P[i - 1][2], P[i][2], u) };
  }
  const z = P[P.length - 1];
  return { x: z[1], y: z[2] };
}
