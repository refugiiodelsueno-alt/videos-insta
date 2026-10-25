// Lo que sale en varias escenas: la cocina con el microondas encendido (su ventana con la rejilla, la taza de leche
// girando y la onda de dentro), el router con sus arcos de wifi, la fuga por la junta, el wifi del móvil y la banda de
// frecuencias. Todo en 2D, a escala real: 1 cm = 18,3 unidades del mundo (la ventana mide 30 × 23 cm).
const K = window.K;
const NS = "http://www.w3.org/2000/svg";

export const CM = 18.3;
export const LAMBDA = 12.24 * CM;                    // la onda del microondas (2,45 GHz)
export const LAMBDA_WIFI = 12.3 * CM;                // la del wifi (canal 6, 2,437 GHz)
export const NARANJA = "#ff9f1a", CIAN = "#38bdf8", ROJO = "#f0445a";
export const MO = { x: 380, y: 420, w: 1000, h: 580 };          // el microondas
export const VEN = { x: 455, y: 500, w: 550, h: 420 };          // la ventana de la puerta
export const PASO = 5.5, AGUJERO = 3.7;                         // la rejilla: un agujero de 2 mm cada 3 mm
export const JUNTA = { x: 1086, y: 710 };                       // la junta entre la puerta y el panel
export const RT = { x: 430, y: 325, w: 210, h: 95, ox: 535, oy: 312 };  // el router, encima del microondas, y de dónde salen sus arcos
export const F0 = { x: 850, y: 640, z: 1.08 };                  // el encuadre del fotograma 0 (y del último)
// Lo que dura el vídeo entero. Todo lo que se mueve sin parar (la taza, el vapor, los arcos, el polvo) da un número
// entero de vueltas en TOTAL segundos: así el último fotograma empalma con el primero sin saltar.
export const TOTAL = 56.81;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;   // vueltas dadas a unas f vueltas/s
const vuelta = (g, f) => 2 * Math.PI * ciclo(g, f);                              // lo mismo, en radianes
const PLATO = { x: 275, y: 352 };                               // el centro del plato, dentro de la ventana

const CSS = `
.m-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }
.m-fondo { position: absolute; inset: 0; background:
  radial-gradient(ellipse 70% 40% at 55% 52%, rgba(255, 226, 180, 0.10), transparent 70%),
  radial-gradient(ellipse 120% 80% at 50% 40%, #191c21 0%, #0b0d10 70%); }
.m-polvo { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 244, 225, 0.5); filter: blur(1.5px); }
.m-techo { position: absolute; left: 0; right: 0; top: 0; height: 640px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(11, 13, 16, 0.97) 0, rgba(11, 13, 16, 0.9) 300px, rgba(11, 13, 16, 0.7) 470px, rgba(11, 13, 16, 0) 630px); }
.m-velo { position: absolute; inset: 0; background: rgba(9, 11, 14, 0.62); opacity: 0; }
.m-mundo { position: absolute; left: 0; top: 0; width: 1500px; height: 1400px; transform-origin: 0 0; }
.m-mundo > * { position: absolute; }
.m-cocina > * { position: absolute; }

.m-pared { left: -900px; top: -900px; width: 3300px; height: 1900px; background:
  radial-gradient(ellipse 900px 520px at 1780px 1560px, rgba(255, 214, 160, 0.13), transparent 70%),
  repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 92px),
  repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 184px),
  linear-gradient(180deg, #121519 0%, #171a1f 70%, #1b1e23 100%); }
.m-encimera { left: -900px; top: 1000px; width: 3300px; height: 54px;
  background: linear-gradient(180deg, #8b8781 0%, #5d5a55 30%, #3b3936 100%);
  box-shadow: inset 0 3px 0 rgba(255,255,255,0.35), 0 10px 26px rgba(0,0,0,0.6); }
.m-encimera::before { content: ""; position: absolute; inset: 0; opacity: 0.5;
  background: repeating-linear-gradient(100deg, rgba(255,255,255,0.05) 0 7px, rgba(0,0,0,0.06) 7px 19px); }
.m-mueble { left: -900px; top: 1054px; width: 3300px; height: 1300px;
  background: repeating-linear-gradient(90deg, rgba(0,0,0,0.0) 0 300px, rgba(0,0,0,0.45) 300px 306px),
    repeating-linear-gradient(88deg, rgba(255,255,255,0.025) 0 3px, transparent 3px 11px),
    linear-gradient(180deg, #2a2119 0%, #1d1712 40%, #120e0b 100%); }
.m-sombra { left: 360px; top: 960px; width: 1040px; height: 70px; border-radius: 50%; background: rgba(0,0,0,0.7); filter: blur(18px); }
.m-cerca .m-sombra, .m-cerca .m-sombrapared { display: none; }
.m-cerca svg * { filter: none !important; }
.m-sombrapared { left: 400px; top: 460px; width: 1010px; height: 560px; border-radius: 40px; background: rgba(0,0,0,0.55); filter: blur(40px); }

.m-mo { left: 380px; top: 420px; width: 1000px; height: 580px; border-radius: 28px;
  background: linear-gradient(180deg, #484d55 0%, #2c3036 18%, #212429 60%, #17191d 100%);
  box-shadow: inset 0 3px 0 rgba(255,255,255,0.28), inset 0 -4px 0 rgba(0,0,0,0.5), inset 3px 0 0 rgba(255,255,255,0.07); }
.m-mo::after { content: ""; position: absolute; left: 26px; right: 26px; top: 6px; height: 40px; border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0)); }
.m-pie { position: absolute; bottom: -10px; width: 90px; height: 14px; border-radius: 4px; background: #0b0c0e; }
.m-puerta { position: absolute; left: 20px; top: 20px; width: 680px; height: 540px; border-radius: 20px;
  background: linear-gradient(160deg, #2b2f35 0%, #121417 35%, #0b0c0e 70%, #1c1f23 100%);
  box-shadow: inset 0 0 0 2px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.15), 0 4px 10px rgba(0,0,0,0.6); }
.m-puerta .marco { position: absolute; left: 47px; top: 52px; width: 566px; height: 436px; border-radius: 14px;
  background: #050506; box-shadow: inset 0 0 0 3px #26292e, 0 0 0 2px rgba(255,255,255,0.05); }
.m-asa { position: absolute; left: 640px; top: 140px; width: 22px; height: 300px; border-radius: 11px;
  background: linear-gradient(90deg, #5d636b 0%, #c9ced4 35%, #8a9098 60%, #3a3e44 100%); box-shadow: -6px 6px 12px rgba(0,0,0,0.5); }
.m-junta { position: absolute; left: 700px; top: 20px; width: 12px; height: 540px; background: linear-gradient(90deg, #050506, #15171a); }
.m-panel { position: absolute; left: 712px; top: 20px; width: 268px; height: 540px; border-radius: 0 20px 20px 0;
  background: linear-gradient(180deg, #33373d 0%, #25282d 50%, #1d2024 100%); box-shadow: inset 0 2px 0 rgba(255,255,255,0.12); }
.m-pantalla { position: absolute; left: 24px; top: 40px; width: 220px; height: 96px; border-radius: 10px; background: #07090a;
  box-shadow: inset 0 0 0 2px #3a3f45, inset 0 6px 14px rgba(0,0,0,0.9); text-align: center; line-height: 96px;
  font-family: var(--letra-mono), monospace; font-weight: 700; font-size: 62px; color: #49f2a8; text-shadow: 0 0 14px rgba(73,242,168,0.7); }
.m-tecla { position: absolute; width: 62px; height: 44px; border-radius: 8px; background: linear-gradient(180deg, #4a5058, #2c3035);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 3px rgba(0,0,0,0.5); font-family: var(--letra), sans-serif;
  font-size: 22px; font-weight: 700; color: #b9c0c8; text-align: center; line-height: 44px; }
.m-inicio { position: absolute; left: 24px; top: 440px; width: 220px; height: 66px; border-radius: 12px;
  background: linear-gradient(180deg, #3d7a5a, #24513a); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 3px 4px rgba(0,0,0,0.5);
  font-family: var(--letra), sans-serif; font-size: 28px; font-weight: 800; color: #e3f5ea; text-align: center; line-height: 66px; letter-spacing: 0.08em; }
.m-fuga { left: 395px; top: 435px; width: 690px; height: 550px; border-radius: 22px; opacity: 0;
  box-shadow: 0 0 30px 8px rgba(255,159,26,0.75), 0 0 90px 30px rgba(255,159,26,0.35); }

.m-ven { position: absolute; overflow: hidden; border-radius: 10px; width: ${VEN.w}px; height: ${VEN.h}px; }
.m-ven > * { position: absolute; }
.m-ven .cav { inset: 0; background: radial-gradient(ellipse 60% 60% at 58% 34%, #fff7e6 0%, #f3dfb6 30%, #c49e66 66%, #6a4f2e 100%); }
.m-ven .fondo { left: 78px; top: 46px; right: 78px; bottom: 96px; border-radius: 6px;
  background: linear-gradient(180deg, rgba(255,250,235,0.35), rgba(120,90,50,0.18)); box-shadow: 0 0 0 2px rgba(120,90,50,0.25); }
.m-ven .suelo { left: 0; right: 0; bottom: 0; height: 100px; background: linear-gradient(180deg, rgba(110,80,45,0.35), rgba(60,42,22,0.7));
  clip-path: polygon(78px 0, 472px 0, 550px 100px, 0 100px); }
.m-ven .bombilla { right: 40px; top: 18px; width: 120px; height: 70px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,255,245,0.95), rgba(255,240,200,0.4) 60%, transparent); }
.m-ven .plato { left: ${PLATO.x - 220}px; top: ${PLATO.y - 40}px; width: 440px; height: 80px; border-radius: 50%;
  background: radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.4), rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.18));
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.35), 0 8px 10px rgba(60,40,20,0.35); }
.m-ven .sombra { width: 182px; height: 46px; border-radius: 50%; background: radial-gradient(closest-side, rgba(60,40,20,0.45) 55%, rgba(60,40,20,0)); }
.m-ven .taza { width: 146px; height: 165px; transform-origin: 73px 165px; }
.m-ven .taza > * { position: absolute; }
.m-ven .cuerpo { left: 0; top: 0; width: 146px; height: 165px; border-radius: 4px 4px 34px 34px / 4px 4px 22px 22px; z-index: 1;
  background: linear-gradient(90deg, #a8a194 0%, #ddd8cd 18%, #faf8f3 40%, #ffffff 48%, #ece8df 68%, #bdb6a9 88%, #8f8879 100%); }
.m-ven .marca { left: 0; top: 58px; width: 40px; height: 40px; border-radius: 50%; z-index: 2;
  background: radial-gradient(circle at 40% 35%, #5aa77d, #2f6b4c 70%); }
.m-ven .raya { left: 0; right: 0; top: 128px; height: 9px; z-index: 2; background: linear-gradient(90deg, #4c7f63 0%, #6aa684 45%, #3d6a52 100%); opacity: 0.85; }
.m-ven .asa { top: 34px; width: 58px; height: 94px; border-radius: 40% 50% 50% 40%; box-sizing: border-box; border: 17px solid #e9e4d8;
  box-shadow: inset -2px 0 0 rgba(0,0,0,0.12), 2px 2px 4px rgba(60,40,20,0.3); }
.m-ven .borde { left: -3px; top: -19px; width: 152px; height: 38px; border-radius: 50%; z-index: 3; box-sizing: border-box;
  border: 7px solid #f6f3ec; background: radial-gradient(ellipse at 45% 40%, #fffdf6, #f4ead6 60%, #e2d4b8); }
.m-ven .vapor { width: 70px; height: 120px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,255,255,0.8), rgba(255,255,255,0)); }
.m-ven .dentro { left: 0; top: 0; overflow: visible; }
.m-ven .tono { inset: 0; background: rgba(6,7,8,0.42); }
.m-ven .malla { inset: 0; background: linear-gradient(160deg, #23272c 0%, #0d0f11 45%, #1a1d21 100%);
  -webkit-mask: radial-gradient(circle, transparent 0 ${AGUJERO / 2 - 0.12}px, #000 ${AGUJERO / 2 + 0.18}px) 0 0 / ${PASO}px ${PASO}px;
  mask: radial-gradient(circle, transparent 0 ${AGUJERO / 2 - 0.12}px, #000 ${AGUJERO / 2 + 0.18}px) 0 0 / ${PASO}px ${PASO}px; }
.m-ven .vidrio { inset: 0; background: linear-gradient(115deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 22%, rgba(255,255,255,0) 32%,
  rgba(255,255,255,0) 62%, rgba(255,255,255,0.06) 70%, rgba(255,255,255,0) 80%); }

.m-router { left: ${RT.x}px; top: ${RT.y}px; width: ${RT.w}px; height: ${RT.h}px; }
.m-router .caja { position: absolute; inset: 0; border-radius: 18px 18px 10px 10px;
  background: linear-gradient(180deg, #3a3f46 0%, #24272c 22%, #17191c 100%);
  box-shadow: inset 0 3px 0 rgba(255,255,255,0.2), 0 8px 14px rgba(0,0,0,0.6); }
.m-router .rejilla { position: absolute; left: 30px; right: 30px; top: 14px; height: 20px; border-radius: 6px;
  background: repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 6px, rgba(255,255,255,0.06) 6px 12px); }
.m-router .led { position: absolute; top: 58px; width: 14px; height: 14px; border-radius: 50%; background: #2bd982; box-shadow: 0 0 10px #2bd982; }
.m-router .ant { position: absolute; bottom: ${RT.h - 6}px; width: 18px; height: 190px; border-radius: 9px 9px 6px 6px; transform-origin: 50% 100%;
  background: linear-gradient(90deg, #0f1012 0%, #3a3e44 40%, #1d2023 100%); }
.m-router .pie { position: absolute; bottom: -8px; width: 40px; height: 10px; border-radius: 3px; background: #0b0c0e; }

.m-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 40px; color: #fff;
  background: rgba(14, 16, 20, 0.86); border: 2px solid rgba(255, 255, 255, 0.16); border-radius: 16px; padding: 10px 22px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); }
.m-etq b { font-family: var(--letra-mono), monospace; font-weight: 700; }
.m-etq.n b { color: ${NARANJA}; } .m-etq.c b { color: ${CIAN}; } .m-etq.r b { color: ${ROJO}; } .m-etq.v b { color: #22d38a; }
.m-etq small { display: block; font-weight: 500; font-size: 32px; color: #9aa1aa; }

.m-wifi { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 16px; padding: 14px 26px 14px 20px;
  background: rgba(14, 16, 20, 0.88); border: 2px solid rgba(255,255,255,0.16); border-radius: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.45);
  font-family: var(--letra), sans-serif; font-weight: 700; font-size: 40px; color: #fff; white-space: nowrap; }
.m-wifi svg { width: 64px; height: 52px; overflow: visible; }

.m-regla { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.m-regla > * { position: absolute; }
.m-regla .barra { left: 60px; top: 560px; width: 960px; height: 120px; border-radius: 18px; background: rgba(16,18,22,0.92);
  border: 2px solid rgba(255,255,255,0.16); box-shadow: 0 16px 40px rgba(0,0,0,0.5); overflow: hidden; transform-origin: 50% 50%; }
.m-regla .bloque { top: 572px; height: 96px; border-radius: 10px; background: linear-gradient(180deg, #59626f, #3b424c);
  font-family: var(--letra), sans-serif; font-weight: 700; font-size: 34px; color: #e7ebf0; text-align: center; line-height: 96px; }
.m-regla .franja { top: 566px; height: 108px; border-radius: 10px; background: linear-gradient(180deg, #ffb547, ${NARANJA} 60%, #d97a00);
  box-shadow: 0 0 30px rgba(255,159,26,0.7); transform-origin: 50% 100%; }
.m-regla .gh { top: 700px; font-family: var(--letra-mono), monospace; font-weight: 700; font-size: 34px; color: #8a9099; white-space: nowrap; }
.m-sello { position: absolute; left: 0; top: 0; padding: 6px 26px; border: 7px double currentColor; border-radius: 14px;
  font-family: var(--letra), sans-serif; font-weight: 900; font-size: 64px; letter-spacing: 0.06em; white-space: nowrap; background: rgba(14,16,20,0.75); }
.m-mol { position: absolute; inset: 0; transform-origin: 540px 1000px; opacity: 0;
  background: radial-gradient(ellipse 85% 60% at 50% 58%, #3b2b1b 0%, #20170f 55%, #0e0b08 100%); }
.m-mol > * { position: absolute; }
.m-mol .calor { inset: 0; opacity: 0; background: radial-gradient(ellipse 70% 45% at 50% 62%, rgba(255,140,40,0.42), rgba(255,120,30,0) 70%); }
.m-etq .tacha { position: absolute; left: 12px; right: 12px; top: 46%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240,68,90,0.7); }
.m-fuente { position: absolute; font-family: var(--letra), sans-serif; font-size: 32px; color: #8a9099; white-space: nowrap; }
`;

export function estilos() {
  if (document.getElementById("mundo-css")) return;
  const s = document.createElement("style");
  s.id = "mundo-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── fondo, polvo, el velo y la sombra de arriba (para que el subtítulo se lea) ─────────────────────────────────
export function fondo(cont) { return K.crear(cont, `<div class="m-fondo"></div>`); }
export function polvo(cont, semilla, cuantos = 22) {
  const r = K.azar(semilla);
  const ps = [];
  for (let i = 0; i < cuantos; i++) {
    const el = K.crear(cont, `<div class="m-polvo"></div>`);
    ps.push({ el, x: r() * 1080, y: 560 + r() * 1200, f: r() * 6.28, a: 0.25 + r() * 0.6, e: 0.5 + r() * 1.2, n: r() < 0.5 ? 0.04 : 0.07 });
  }
  // flota arriba y abajo, despacio, y vuelve a donde estaba al acabar el vídeo
  return (g) => ps.forEach((p) => {
    p.el.style.transform = `translate(${p.x + Math.sin(vuelta(g, 0.06) + p.f) * 30}px, ${p.y + Math.sin(vuelta(g, p.n) + p.f * 2) * 60}px) scale(${p.e})`;
    p.el.style.opacity = p.a * (0.6 + 0.4 * Math.sin(vuelta(g, 0.14) + p.f));
  });
}
export function techo(cont) { return K.crear(cont, `<div class="m-techo"></div>`); }
export function velo(cont) { return K.crear(cont, `<div class="m-velo"></div>`); }

// ── la cámara: el punto (fx, fy) del mundo queda en (540, 1000) con zoom z ──────────────────────────────────────
export function cam(el, fx, fy, z) {
  el.style.transform = `translate(${540 - fx * z}px, ${1000 - fy * z}px) scale(${z})`;
}
export function pantalla(k, wx, wy) { return [540 + (wx - k.x) * k.z, 1000 + (wy - k.y) * k.z]; }
// una cámara entre claves, con el zoom en escala logarítmica (para que entrar de 1 a 40 se vea igual de rápido todo el
// rato). Pasa por cada clave sin pararse ni pasarse (curva monótona): solo para donde cambia de sentido y al final.
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
export function lienzo(cont, w = 1080, h = 1920) {
  return K.crear(cont, `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;left:0;top:0;overflow:visible"></svg>`);
}
function el(svg, tag, at) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, at[k]);
  svg.appendChild(e);
  return e;
}
// una onda: o = { x0, x1, y, amp, lam, fase, env(x), paso, alpha }
export function onda(svg, color, grosor = 7, brillo = 8) {
  const p = el(svg, "path", { fill: "none", stroke: color, "stroke-width": grosor, "stroke-linecap": "round", "stroke-linejoin": "round" });
  if (brillo) p.style.filter = `drop-shadow(0 0 ${brillo}px ${color})`;
  const f = (o) => {
    let d = "";
    const paso = o.paso || 6;
    for (let x = o.x0; x <= o.x1 + 0.001; x += paso) {
      const e = o.env ? o.env(x) : 1;
      const y = o.y + o.amp * e * Math.sin((x / o.lam) * 2 * Math.PI - o.fase);
      d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    p.setAttribute("d", d || "M0 0");
    p.style.opacity = o.alpha ?? 1;
  };
  f.el = p;
  return f;
}
// una cota entre dos puntos, con sus topes; u de 0 a 1 la abre desde el centro
export function cota(svg, color = "#ffffff") {
  const g = el(svg, "g", { stroke: color, "stroke-width": 5, "stroke-linecap": "round", fill: "none" });
  const l = el(g, "line", {}), a = el(g, "line", {}), b = el(g, "line", {});
  return (x1, y1, x2, y2, u, tope = 22) => {
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, k = K.lim(u);
    const ax = cx + (x1 - cx) * k, ay = cy + (y1 - cy) * k, bx = cx + (x2 - cx) * k, by = cy + (y2 - cy) * k;
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / L * tope, ny = (x2 - x1) / L * tope;
    l.setAttribute("x1", ax); l.setAttribute("y1", ay); l.setAttribute("x2", bx); l.setAttribute("y2", by);
    a.setAttribute("x1", ax - nx); a.setAttribute("y1", ay - ny); a.setAttribute("x2", ax + nx); a.setAttribute("y2", ay + ny);
    b.setAttribute("x1", bx - nx); b.setAttribute("y1", by - ny); b.setAttribute("x2", bx + nx); b.setAttribute("y2", by + ny);
    g.style.opacity = K.lim(u * 4);
  };
}

// ── etiquetas ──────────────────────────────────────────────────────────────────────────────────────────────────
export function etiqueta(cont, html, x, y, clase = "") {
  const e = K.crear(cont, `<div class="m-etq ${clase}">${html}</div>`);
  e.style.left = x + "px";
  e.style.top = y + "px";
  return e;
}
// aparece (crece y sube) entre a y a + 0,35 y se va entre b y b + 0,3
export function asoma(e, s, a, b = 1e9, dy = 24) {
  const on = K.sale(K.tramo(s, a, a + 0.35)) * (1 - K.suave(K.tramo(s, b, b + 0.3)));
  e.style.opacity = on;
  e.style.transform = `translateY(${(1 - on) * dy}px) scale(${0.9 + 0.1 * on})`;
  return on;
}
export function sello(cont, texto, color) {
  const e = K.crear(cont, `<div class="m-sello" style="color:${color}">${texto}</div>`);
  e.style.opacity = 0;
  return e;
}
// el golpe de un sello: grande y transparente → en su sitio, girado
export function pisa(e, s, t, x, y, giro = -8, b = 1e9) {
  const u = K.tramo(s, t - 0.16, t), fuera = 1 - K.suave(K.tramo(s, b, b + 0.3));
  const esc = K.mez(2.2, 1, K.entra(u)) * (1 + 0.06 * Math.exp(-Math.pow((s - t - 0.06) / 0.06, 2)));
  e.style.opacity = K.lim(u * 3) * fuera;
  e.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${giro}deg) scale(${esc})`;
}

// ── el wifi del móvil: tres arcos y el punto; nivel de 0 a 3 ────────────────────────────────────────────────────
export function wifi(cont, x, y) {
  const e = K.crear(cont, `<div class="m-wifi"><svg viewBox="0 0 64 52">
    <path d="M4 18 A40 40 0 0 1 60 18" fill="none" stroke-width="7" stroke-linecap="round"/>
    <path d="M13 28 A27 27 0 0 1 51 28" fill="none" stroke-width="7" stroke-linecap="round"/>
    <path d="M22 38 A14 14 0 0 1 42 38" fill="none" stroke-width="7" stroke-linecap="round"/>
    <circle cx="32" cy="46" r="5"/></svg><span>Wi‑Fi</span></div>`);
  e.style.left = x + "px";
  e.style.top = y + "px";
  const arcos = [...e.querySelectorAll("path")].reverse(), punto = e.querySelector("circle");
  const mezcla = (a, b, u) => {
    const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const A = h(a), B = h(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * u)).join(",")})`;
  };
  return (nivel, rojo = 0) => {
    // cada raya, de gris (apagada) a encendida; encendida va de blanco a rojo con «rojo»
    const luz = mezcla("#ffffff", ROJO, rojo).match(/\d+/g).map((v) => (+v).toString(16).padStart(2, "0")).join("");
    arcos.forEach((p, i) => p.setAttribute("stroke", mezcla("#3a3f46", "#" + luz, K.lim(nivel - i))));
    punto.setAttribute("fill", "#" + luz);
    return e;
  };
}

// ── la ventana: lo de dentro (la cavidad iluminada, el plato y la taza girando), la onda de dentro y la rejilla ──
export function ventana(cont, x = VEN.x, y = VEN.y) {
  const v = K.crear(cont, `<div class="m-ven" data-layout-ignore aria-hidden="true">
    <div class="cav"></div><div class="fondo"></div><div class="suelo"></div><div class="bombilla"></div><div class="plato"></div>
    <div class="sombra"></div>
    <div class="taza"><div class="asa"></div><div class="cuerpo"></div><div class="marca"></div><div class="raya"></div><div class="borde"></div></div>
    <div class="vapor"></div><div class="vapor"></div><div class="vapor"></div>
    <svg class="dentro" width="${VEN.w}" height="${VEN.h}" viewBox="0 0 ${VEN.w} ${VEN.h}"></svg>
    <div class="tono"></div><div class="malla"></div><div class="vidrio"></div></div>`);
  v.style.left = x + "px";
  v.style.top = y + "px";
  const q = (c) => v.querySelector(c);
  const taza = q(".taza"), asa = q(".asa"), marca = q(".marca"), sombra = q(".sombra"), cav = q(".cav");
  const vapores = [...v.querySelectorAll(".vapor")], tono = q(".tono"), malla = q(".malla");
  const svg = q(".dentro");
  const o1 = onda(svg, NARANJA, 6, 6), o2 = onda(svg, NARANJA, 5, 6);
  // o = { z: zoom de la cámara, dentro: la onda de dentro (0 a 1), brillo }
  return (g, o = {}) => {
    const th = giro(g), sn = Math.sin(th), cs = Math.cos(th);
    const cx = PLATO.x + 64 * sn, base = PLATO.y + 4 + 12 * cs, esc = 1 + 0.035 * cs;
    taza.style.transform = `translate(${cx - 73}px, ${base - 165}px) scale(${esc})`;
    taza.style.zIndex = 0;
    sombra.style.transform = `translate(${cx - 91}px, ${base - 24}px) scale(${esc})`;
    // el asa y el dibujo giran con la taza
    const sa = Math.sin(th + 0.4), ca = Math.cos(th + 0.4);
    asa.style.left = `${73 + sa * 86 - 29}px`;
    asa.style.transform = `scaleX(${(0.22 + 0.78 * Math.abs(sa)) * (sa < 0 ? -1 : 1)})`;
    asa.style.zIndex = ca > 0 ? 4 : 0;
    const sm = Math.sin(th + 0.4 + Math.PI), cm = Math.cos(th + 0.4 + Math.PI);
    marca.style.left = `${73 + sm * 52 - 20}px`;
    marca.style.transform = `scaleX(${Math.max(0.05, cm)})`;
    marca.style.opacity = K.lim(cm * 4);
    // el vapor sube y se deshace
    vapores.forEach((p, i) => {
      const f = ((ciclo(g, 0.55) + i / 3) % 1 + 1) % 1;
      p.style.transform = `translate(${cx - 35 + Math.sin(vuelta(g, 0.2) + i * 2) * 18 + (i - 1) * 26}px, ${base - 210 - f * 150}px) scale(${0.7 + f * 0.8}, ${0.8 + f})`;
      p.style.opacity = (o.vapor ?? 1) * Math.sin(Math.PI * f) * 0.9;
    });
    cav.style.filter = `brightness(${o.brillo ?? 1})`;
    // la rejilla: de lejos, un tono (así no hace moiré); de cerca, los agujeros; malla < 1 la quita (la pone la escena
    // encima, o la cámara la atraviesa)
    const fino = K.suave(K.tramo(o.z ?? 1, 1.3, 2.4)), mm = o.malla ?? 1;
    malla.style.opacity = mm * fino;
    tono.style.opacity = mm * (1 - fino);
    // la onda que rebota dentro: una onda estacionaria
    const a = o.dentro ?? 0, w = Math.cos(vuelta(g, 1.1));
    o1({ x0: -10, x1: VEN.w + 10, y: 175, amp: 70 * a * w, lam: LAMBDA, fase: 0.6, alpha: K.lim(a * 3) });
    o2({ x0: -10, x1: VEN.w + 10, y: 290, amp: 55 * a * -w, lam: LAMBDA, fase: 2.2, alpha: K.lim(a * 3) * 0.75 });
  };
}
export const giro = (g) => 0.6 + vuelta(g, 0.11);       // el plato da una vuelta cada 9 s
// dónde está la boca de la taza, en el mundo
export function boca(g) {
  const th = giro(g), cs = Math.cos(th);
  return { x: VEN.x + PLATO.x + 64 * Math.sin(th), y: VEN.y + PLATO.y + 4 + 12 * cs - 165 * (1 + 0.035 * cs) };
}

// ── la cocina entera: pared, encimera, el microondas con su ventana, el router y los arcos ──────────────────────
export function cocina(mundo) {
  const raiz = K.crear(mundo, `<div class="m-cocina" style="left:0;top:0" data-layout-ignore aria-hidden="true"></div>`);
  K.crear(raiz, `<div class="m-pared"></div>`);
  K.crear(raiz, `<div class="m-sombrapared"></div>`);
  K.crear(raiz, `<div class="m-encimera"></div>`);
  K.crear(raiz, `<div class="m-mueble"></div>`);
  K.crear(raiz, `<div class="m-sombra"></div>`);
  let teclas = "";
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+30s", "0", "PARAR"].forEach((t, i) => {
    teclas += `<div class="m-tecla" style="left:${24 + (i % 3) * 79}px;top:${170 + Math.floor(i / 3) * 62}px;${t.length > 2 ? "font-size:17px" : ""}">${t}</div>`;
  });
  const mo = K.crear(raiz, `<div class="m-mo">
    <div class="m-pie" style="left:60px"></div><div class="m-pie" style="right:60px"></div>
    <div class="m-puerta"><div class="marco"></div><div class="m-asa"></div></div><div class="m-junta"></div>
    <div class="m-panel"><div class="m-pantalla">900W</div>${teclas}<div class="m-inicio">INICIO</div></div></div>`);
  const reloj = mo.querySelector(".m-pantalla");
  const fuga = K.crear(raiz, `<div class="m-fuga"></div>`);
  const ven = ventana(raiz);
  let leds = "";
  for (let i = 0; i < 5; i++) leds += `<div class="led" style="left:${44 + i * 28}px"></div>`;
  const rt = K.crear(raiz, `<div class="m-router"><div class="ant" style="left:22px;transform:rotate(-9deg)"></div>
    <div class="ant" style="right:22px;transform:rotate(9deg)"></div><div class="caja"><div class="rejilla"></div>${leds}</div>
    <div class="pie" style="left:24px"></div><div class="pie" style="right:24px"></div></div>`);
  const luces = [...rt.querySelectorAll(".led")];
  const svg = lienzo(raiz, 1500, 1400);
  const N = 6, ARCO = (a) => a * Math.PI / 180;
  const wf = [], fg = [];
  for (let i = 0; i < N; i++) {
    const p = el(svg, "path", { fill: "none", stroke: CIAN, "stroke-width": 7, "stroke-linecap": "round" });
    p.style.filter = `drop-shadow(0 0 8px ${CIAN})`;
    wf.push(p);
  }
  for (let i = 0; i < 5; i++) {
    const p = el(svg, "path", { fill: "none", stroke: NARANJA, "stroke-width": 6, "stroke-linecap": "round" });
    p.style.filter = `drop-shadow(0 0 8px ${NARANJA})`;
    fg.push(p);
  }
  const arco = (cx, cy, r, a0, a1, ruido) => {
    let d = "";
    for (let i = 0; i <= 40; i++) {
      const a = ARCO(a0 + (a1 - a0) * i / 40);
      const rr = r + ruido(a, cx + r * Math.cos(a), cy + r * Math.sin(a));
      d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return d;
  };
  // o = { z, wifi (los arcos, 0 a 1), interf (0 a 1: se rompen al llegar al microondas), fuga, dentro, brillo, reloj, vapor }
  const pon = (g, o = {}) => {
    ven(g, o);
    reloj.style.opacity = 0.82 + 0.18 * Math.cos(vuelta(g, 1));
    luces.forEach((l, i) => { l.style.opacity = 0.55 + 0.45 * (Math.sin(vuelta(g, 0.8 + i * 0.27) + i * 2.1) > -0.2 ? 1 : 0.2); });
    const wi = o.wifi ?? 1, it = o.interf ?? 0;
    wf.forEach((p, i) => {
      const r = ((ciclo(g, 130 / (N * 125)) * N * 125 + i * 125) % (N * 125) + N * 125) % (N * 125) + 40;
      // al entrar en el microondas (por debajo de su techo) los arcos se rompen en ruido
      const ruido = (a, x, y) => it * 34 * K.suave(K.tramo(y, 430, 560)) * Math.sin(a * 37 + vuelta(g, 3.66) + i) * Math.sin(a * 13 - vuelta(g, 1.43) + i * 3);
      p.setAttribute("d", arco(RT.ox, RT.oy, r, -12, 102, ruido));
      const vida = Math.pow(Math.sin(Math.PI * (r - 40) / (N * 125)), 0.8);
      p.style.opacity = wi * vida * (1 - 0.5 * it * K.suave(K.tramo(r, 140, 320)));
    });
    const fu = o.fuga ?? 0;
    fuga.style.opacity = fu * (0.75 + 0.25 * Math.sin(vuelta(g, 1.11)));
    fg.forEach((p, i) => {
      const r = ((ciclo(g, 0.2) * 950 + i * 190) % 950 + 950) % 950 + 20;
      p.setAttribute("d", arco(JUNTA.x, JUNTA.y, r, 165, 250, () => 0));
      p.style.opacity = fu * Math.pow(Math.sin(Math.PI * (r - 20) / 950), 0.8) * 0.85;
    });
  };
  return { raiz, pon, mo, rt, ven };
}

// ── la banda de frecuencias, de 2 a 3 GHz, en pantalla ──────────────────────────────────────────────────────────
export const GHZ = (f) => 60 + (f - 2) * 960;
export function regla(cont) {
  const r = K.crear(cont, `<div class="m-regla" data-layout-ignore aria-hidden="true"></div>`);
  const barra = K.crear(r, `<div class="barra"></div>`);
  let marcas = "";
  for (let i = 1; i < 10; i++) {
    const x = (i * 96);
    marcas += `<div style="position:absolute;left:${x - 1.5}px;top:${i % 5 ? 92 : 78}px;width:3px;height:${i % 5 ? 28 : 42}px;background:rgba(255,255,255,0.35)"></div>`;
  }
  K.crear(barra, `<div style="position:absolute;inset:0">${marcas}</div>`);
  const bloques = [[2.0, 2.29], [2.5, 2.69]].map(([a, b]) => K.crear(r, `<div class="bloque" style="left:${GHZ(a) + 12}px;width:${GHZ(b) - GHZ(a) - 18}px">móvil</div>`));
  const franja = K.crear(r, `<div class="franja" style="left:${GHZ(2.4)}px;width:${GHZ(2.5) - GHZ(2.4)}px"></div>`);
  const g2 = K.crear(r, `<div class="gh" style="left:60px">2 GHz</div>`);
  const g3 = K.crear(r, `<div class="gh" style="left:1020px;transform:translateX(-100%)">3 GHz</div>`);
  const sv = lienzo(r);
  const ruido = [0, 1, 2].map(() => el(sv, "polyline", { fill: "none", stroke: "#fff1c9", "stroke-width": 3, "stroke-linejoin": "round" }));
  const ow = onda(sv, CIAN, 7, 8);
  return { r, barra, bloques, franja, g2, g3, ruido, ow };
}
// ruido de una franja (x0..x1), cambia en cada fotograma de 1/15 s
export function chispas(lineas, s, x0, x1, y0, y1, a) {
  const f = Math.floor(s * 15);
  lineas.forEach((p, i) => {
    const r = K.azar(f * 7 + i * 131);
    let pts = "";
    for (let x = x0; x <= x1; x += 6) pts += `${x},${(y0 + (y1 - y0) * (0.2 + 0.6 * r())).toFixed(1)} `;
    p.setAttribute("points", pts);
    p.style.opacity = a * (0.5 + 0.5 * r());
  });
}

// la rejilla vista de cerca, dibujada en pantalla (a cualquier zoom sale nítida): cubre la ventana y sigue a la cámara
export function rejillaGrande(cont) {
  const caja = K.crear(cont, `<div style="position:absolute;left:0;top:0;width:1080px;height:1920px;perspective:1600px;perspective-origin:540px 1000px" data-layout-ignore aria-hidden="true"></div>`);
  const giro = K.crear(caja, `<div style="position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 1000px;transform-style:preserve-3d"></div>`);
  const m = K.crear(giro, `<div style="position:absolute;background:linear-gradient(160deg,#2a2e34 0%,#121417 45%,#1f2227 100%)"></div>`);
  // k: la cámara {x, y, z}; giroY en grados; a: opacidad
  const f = (k, giroY = 0, a = 1) => {
    // apagada, fuera del todo: su máscara de miles de agujeros es lo más caro de pintar del vídeo
    caja.style.display = a > 0.002 ? "" : "none";
    if (a <= 0.002) return;
    const x0 = 540 + (VEN.x - k.x) * k.z, y0 = 1000 + (VEN.y - k.y) * k.z;
    const x1 = x0 + VEN.w * k.z, y1 = y0 + VEN.h * k.z;
    const L = Math.max(-400, x0), T = Math.max(-400, y0), R = Math.min(1480, x1), B = Math.min(2320, y1);
    const p = PASO * k.z, h0 = (AGUJERO / 2 - 0.12) * k.z, h1 = (AGUJERO / 2 + 0.12) * k.z + 0.35;
    const mk = `radial-gradient(circle, transparent 0 ${h0.toFixed(2)}px, #000 ${h1.toFixed(2)}px)`;
    Object.assign(m.style, {
      left: L + "px", top: T + "px", width: Math.max(0, R - L) + "px", height: Math.max(0, B - T) + "px",
      webkitMask: `${mk} ${((x0 - L) % p).toFixed(2)}px ${((y0 - T) % p).toFixed(2)}px / ${p.toFixed(3)}px ${p.toFixed(3)}px`,
      mask: `${mk} ${((x0 - L) % p).toFixed(2)}px ${((y0 - T) % p).toFixed(2)}px / ${p.toFixed(3)}px ${p.toFixed(3)}px`,
    });
    giro.style.transform = `rotateY(${giroY}deg)`;
    caja.style.opacity = a;
  };
  f.el = caja;
  return f;
}

// ── lo que tiene cada escena de la cocina, por capas: la cocina y lo que se dibuja encima (en el mundo), el polvo,
// un velo para oscurecerla, la sombra de arriba y la capa de pantalla (etiquetas, wifi del móvil) ─────────────────
export function montaje(esc) {
  estilos();
  fondo(esc);
  const mundo = K.crear(esc, `<div class="m-mundo"></div>`);
  const coc = cocina(mundo);
  const sv = lienzo(mundo, 1500, 1400);
  const pv = polvo(esc, 7);
  const vl = velo(esc);
  techo(esc);
  const capa = K.crear(esc, `<div class="m-capa"></div>`);
  const svg = lienzo(capa);
  return { mundo, coc, sv, pv, vl, capa, svg, cam: (k) => cam(mundo, k.x, k.y, k.z) };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// El vídeo entero con un solo reloj: g, los segundos desde el fotograma 0. Cada escena dibuja con g = G0 + s. Así, en
// los 0,3 s en que dos escenas se solapan, las dos dibujan exactamente lo mismo, y en g = TOTAL todo vuelve a g = 0.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
// el segundo en que empieza cada escena (build/h1/index.html: cada una 0,3 s antes de que acabe la anterior)
export const G0 = { hook: 0, ondas: 3.05, rejilla: 11.63, potencia: 25.45, mito: 34.51, banda: 40.07, cierre: 52.75 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  lento: 0.88, calientas: 1.84, leche: 2.4,
  router: 3.64, microondas: 5.44, wifi: 6.16, misma: 7.52, doce: 9.7, centimetros: 9.94, punta: 10.74, punta2: 11.14,
  puerta: 12.28, rejilla: 13.88, agujeritos: 14.4, agujero: 15.74, milimetros: 16.94, onda: 18.3, cabe: 18.78,
  rebota: 19.34, dentro: 20.06, luz: 20.76, diminuta: 21.92, pasa: 22.72, girar: 24.6, taza: 25.0,
  microondas2: 25.78, empuja: 26.46, miles: 27.14, router2: 29.0, asi: 29.62, escape: 30.9, pizca: 31.54, tapar: 32.94,
  comparten: 35.08, cree: 36.86, calienta: 38.06, agua: 38.62, no: 39.34,
  reservo: 40.96, aparatos: 41.6, calientan: 42.24, nadie: 43.24, ruido: 45.52, ano: 47.657, licencia: 50.305,
  salio: 51.63, wifi3: 52.29, vive: 53.38, sobraba: 54.42, microondas3: 55.02, eso: 56.1,
};

// el camino de la cámara en todo el vídeo; acaba donde empieza
const CAMINO = [
  [0, F0], [1.54, { x: 800, y: 700, z: 1.25 }], [2.6, { x: 765, y: 728, z: 1.5 }], [3.3, { x: 700, y: 600, z: 1.6 }],
  [3.9, { x: 560, y: 400, z: 1.9 }], [4.9, { x: 575, y: 420, z: 1.85 }],                       // el router
  [5.7, { x: 790, y: 530, z: 0.92 }], [8.2, { x: 800, y: 520, z: 0.93 }], [11.0, { x: 790, y: 540, z: 1.0 }], // las ondas
  [12.6, { x: 730, y: 712, z: 1.75 }], [13.7, { x: 760, y: 680, z: 3.2 }], [14.5, { x: 790, y: 640, z: 38 }],
  [17.9, { x: 790, y: 640, z: 42 }],                                                             // los agujeros
  [18.75, { x: 790, y: 700, z: 2.6 }], [21.5, { x: 785, y: 700, z: 2.7 }], [24.45, { x: 780, y: 704, z: 2.6 }], // de canto
  [25.25, { x: 735, y: 715, z: 1.7 }], [26.5, { x: 820, y: 560, z: 1.0 }], [29.5, { x: 825, y: 565, z: 1.02 }],
  [33.5, { x: 815, y: 570, z: 1.04 }], [34.9, { x: 790, y: 620, z: 1.15 }],                      // la cocina
  [36.3, { x: 790, y: 620, z: 45 }], [39.9, { x: 790, y: 620, z: 50 }],                          // dentro de la leche
  [40.85, { x: 900, y: 500, z: 0.84 }], [43.1, { x: 895, y: 510, z: 0.86 }], [45.6, { x: 880, y: 545, z: 1.1 }],
  [47.4, { x: 885, y: 540, z: 1.06 }], [50.4, { x: 905, y: 495, z: 0.83 }], [52.8, { x: 895, y: 505, z: 0.87 }], [54.4, { x: 893, y: 508, z: 0.88 }], [TOTAL, F0],         // la banda y vuelta
];
export function camaraEn(g) {
  const k = camara(g, CAMINO);
  // en la leche, la cámara va pegada a la boca de la taza, que gira con el plato
  const w = sube(g, 35.0, 35.9) * (1 - sube(g, 40.1, 40.75));
  if (w > 0) {
    const b = boca(g);
    k.x = K.mez(k.x, b.x, w);
    k.y = K.mez(k.y, b.y, w);
  }
  return k;
}
// cómo está la cocina en cada momento (wifi, interf, fuga, dentro, vapor, brillo, malla, velo); la escena añade z
export function estado(g) {
  return {
    wifi: 1 - 0.6 * sube(g, 5.2, 5.8) - 0.4 * sube(g, 12.0, 12.5) + sube(g, 28.8, 29.3) - sube(g, 35.0, 35.5) + sube(g, 51.6, 52.1),
    interf: sube(g, T.lento - 0.05, T.lento + 0.5) - sube(g, 3.3, 3.9) + sube(g, T.tapar - 0.15, T.tapar + 0.45) - sube(g, 35.5, 36.0),
    fuga: sube(g, T.escape - 0.1, T.escape + 0.5) - sube(g, 34.6, 35.3),
    dentro: sube(g, 12.0, 12.8) + 0.6 * sube(g, T.empuja, T.empuja + 0.55) - 0.6 * sube(g, 40.1, 40.6)
      + 0.6 * sube(g, T.calientan - 0.1, T.calientan + 0.3) * (1 - sube(g, 43.2, 43.8)) - sube(g, 55.4, 56.4),
    vapor: 0.25 + 0.75 * sube(g, T.leche - 0.25, T.leche + 0.4) - 0.75 * sube(g, 55.0, 56.4),
    brillo: 1 + 0.3 * sube(g, T.calientan - 0.1, T.calientan + 0.35) * (1 - sube(g, 43.2, 43.8)),
    malla: 1 - sube(g, 35.3, 35.8) + sube(g, 40.1, 40.6),
    velo: 0.4 * sube(g, 40.4, 41.0) - 0.4 * sube(g, 54.4, 55.3),
  };
}
// la escena de la cocina: monta las capas y, en cada fotograma, pone la cámara, el polvo y la cocina en su g.
// cambia(st, g, k) deja a la escena tocar el estado antes de dibujar.
export function escenario(esc, g0) {
  const E = montaje(esc);
  E.paso = (s, cambia) => {
    const g = g0 + s, k = camaraEn(g), st = { ...estado(g), z: k.z };
    if (cambia) cambia(st, g, k);
    E.cam(k);
    // de cerca (dentro de la ventana o de la leche), sin filtros: escalados ×40 son tan caros de pintar que el check no
    // acaba, y ahí no se notan (las sombras quedan detrás del microondas y el brillo de las ondas, fuera de cuadro)
    E.mundo.classList.toggle("m-cerca", k.z > 4);
    E.pv(g);
    E.vl.style.opacity = st.velo;
    E.coc.pon(g, st);
    return { g, k, st };
  };
  return E;
}

// ── el wifi del móvil, arriba a la izquierda: se apaga en «lento», vuelve con «así que», se pone rojo en «tapar» ──
export function pildora(capa) {
  const w = wifi(capa, 70, 560), e = w(3);
  e.style.transformOrigin = "0 50%";
  const baja = (g, t) => 3 - sube(g, t, t + 0.25) - sube(g, t + 0.3, t + 0.55) - sube(g, t + 0.6, t + 0.85);
  return (g) => {
    let nivel = 3, rojo = 0;
    if (g < 20) { nivel = Math.max(1, baja(g, T.lento + 0.05)); rojo = sube(g, T.lento + 0.3, T.lento + 0.7); }
    else if (g < 45) { nivel = baja(g, T.tapar); rojo = sube(g, T.tapar + 0.1, T.tapar + 0.6); }
    w(nivel, rojo);
    const a = 1 - sube(g, 3.6, 3.95) + sube(g, T.asi, T.asi + 0.35) - sube(g, T.comparten, T.comparten + 0.3) + sube(g, 55.0, 55.4);
    e.style.opacity = a;
    e.style.transform = `scale(${0.9 + 0.1 * a})`;
  };
}

// ── las dos ondas delante de la cocina (ondas) y cómo se van (rejilla): la cian vuelve al router, la naranja entra ──
function avance(g) {
  // cuánto han viajado las ondas: van, se paran para medirlas («doce») y vuelven a ir al acabar la frase
  let h = 0;
  for (let x = 5.0; x < g; x += 0.01) h += 0.01 * (1 - sube(x, 8.9, 9.6) + sube(x, 11.3, 11.9));
  return 2 * Math.PI * 0.9 * h;
}
export function ondasDelante(sv) {
  const wc = onda(sv, CIAN, 8, 10), wn = onda(sv, NARANJA, 8, 10);
  const f = (g) => {
    const fa = avance(g);
    const fuera = sube(g, 12.0, 12.7);
    // la del microondas: sale de su techo y sube; en «misma» se junta con la del wifi; en «puerta» cae a la ventana
    const un = sube(g, T.microondas - 0.05, T.microondas + 0.6), yn = K.mez(K.mez(K.mez(420, 330, un), 236, sube(g, T.misma - 0.1, T.misma + 0.6)), 640, sube(g, 12.0, 12.8));
    const n = { y: yn, amp: 55 * K.sale(un) * (1 - 0.6 * fuera), lam: LAMBDA, fase: fa };
    wn({ ...n, x0: K.mez(K.mez(1000, 640, K.sale(un)), 470, fuera), x1: K.mez(K.mez(1010, 1380, K.sale(un)), 990, fuera), alpha: K.lim(un * 3) * (1 - sube(g, 12.4, 12.85)) });
    // la del wifi: sale de las antenas del router hacia la derecha
    const uc = sube(g, T.wifi - 0.05, T.wifi + 0.6), yc = K.mez(160, 216, sube(g, T.misma - 0.1, T.misma + 0.6));
    wc({ x0: 640, x1: K.mez(K.mez(650, 1380, K.sale(uc)), 640, fuera), y: yc, amp: 50 * K.sale(uc), lam: LAMBDA_WIFI, fase: fa + 0.35, alpha: K.lim(uc * 3) * (1 - sube(g, 12.3, 12.6)) });
    return n;
  };
  f.naranja = wn;
  return f;
}

// ── dentro de la leche: las moléculas de agua girando con la onda (mito, y el principio de banda) ──────────────────
export function moleculas(capa) {
  const r = K.crear(capa, `<div class="m-mol" data-layout-ignore aria-hidden="true"><div class="calor"></div></div>`);
  const calor = r.querySelector(".calor");
  const sv = lienzo(r);
  const defs = el(sv, "defs", {});
  defs.innerHTML = `<radialGradient id="m-o" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#d9dde2"/><stop offset="1" stop-color="#7d848d"/></radialGradient>
    <radialGradient id="m-h" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#eef6ff"/><stop offset="0.55" stop-color="#a9bccd"/><stop offset="1" stop-color="#5d6d7c"/></radialGradient>`;
  const campo = onda(sv, NARANJA, 7, 12);
  const az = K.azar(31), ms = [];
  // la leche llena la pantalla: cinco filas de moléculas, de la etiqueta al pie
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const x = 105 + j * 225 + (i % 2) * 110 + (az() - 0.5) * 60, y = 800 + i * 160 + (az() - 0.5) * 50;
    if (x > 1010) continue;
    const gr = el(sv, "g", {});
    const e = 1.0 + az() * 0.35;
    [-52, 52].forEach((a) => el(gr, "circle", { cx: 50 * Math.sin(a * Math.PI / 180), cy: 50 * Math.cos(a * Math.PI / 180), r: 25, fill: "url(#m-h)" }));
    el(gr, "circle", { cx: 0, cy: 0, r: 42, fill: "url(#m-o)" });
    ms.push({ gr, x, y, e, a0: (az() - 0.5) * 1.2, f: az() * 6.28 });
  }
  const etq = etiqueta(r, `<b>2,45 GHz</b><small>«la onda del agua»</small><i class="tacha"></i>`, 120, 520, "n");
  const tacha = etq.querySelector(".tacha");
  const mito = sello(r, "MITO", ROJO);
  const real = K.crear(r, `<div class="m-fuente">el agua resuena por encima de 1.000 GHz</div>`);
  return (g) => {
    const a = sube(g, 35.75, 36.3), b = sube(g, 40.07, 40.45);
    r.style.opacity = a * (1 - b);
    r.style.transform = `scale(${(0.35 + 0.65 * a) * (1 - 0.65 * b)})`;
    // la onda del microondas pasa y las moléculas giran con ella; en «calienta» se agitan y se calientan
    const w = 2 * Math.PI * 0.8 * (g - 35), L = 760, cal = sube(g, T.calienta - 0.1, T.calienta + 0.4);
    campo({ x0: -40, x1: 1120, y: 1120, amp: 220, lam: L, fase: w, alpha: 0.85, paso: 8 });
    calor.style.opacity = cal;
    ms.forEach((m) => {
      const E = Math.sin(2 * Math.PI * m.x / L - w);
      const th = m.a0 + (0.55 + 0.5 * cal) * E + cal * 0.12 * Math.sin(g * 31 + m.f);
      const dx = cal * 7 * Math.sin(g * 27 + m.f * 3), dy = cal * 7 * Math.sin(g * 23 + m.f * 5);
      m.gr.setAttribute("transform", `translate(${(m.x + dx).toFixed(1)} ${(m.y + dy).toFixed(1)}) rotate(${(th * 57.3).toFixed(2)}) scale(${m.e})`);
    });
    // «agua»: la etiqueta; «no»: el tachón, el sello y, debajo, el dato de verdad
    asoma(etq, g, T.agua - 0.05);
    tacha.style.transform = `scaleX(${K.sale(K.tramo(g, T.no - 0.05, T.no + 0.25))})`;
    pisa(mito, g, T.no + 0.18, 690, 600, -9);
    asoma(real, g, T.no + 0.35);
    real.style.left = "120px";
    real.style.top = "700px";
  };
}

// ── la banda de frecuencias encima de la cocina (banda y cierre) ────────────────────────────────────────────────
export function banda(capa) {
  const R = regla(capa);
  const calentar = etiqueta(R.r, `para <b>calentar</b>`, 320, 770, "n");
  const ano = etiqueta(R.r, `<b>1985</b> · EE. UU.`, 320, 770);
  const wl = etiqueta(R.r, `<b>wifi</b>`, 420, 770, "c");
  const lic = sello(R.r, "SIN LICENCIA", "#22d38a");
  const fs = K.crear(R.franja, `<svg width="96" height="108" viewBox="0 0 96 108" style="position:absolute;left:0;top:0;overflow:hidden"></svg>`);
  const ow = onda(fs, "#e9f8ff", 7, 6);
  R.ow.el.remove();
  const centro = (e, x) => { e.style.left = (x - e.offsetWidth / 2) + "px"; };
  return (g, k) => {
    const a = sube(g, T.reservo - 0.12, T.reservo + 0.3) * (1 - sube(g, 54.3, 54.8));
    R.r.style.opacity = a;
    R.barra.style.transform = `scaleX(${0.2 + 0.8 * K.sale(K.tramo(g, T.reservo - 0.12, T.reservo + 0.35))})`;
    // «nadie»: los móviles se apartan
    const ap = K.sale(K.tramo(g, T.nadie - 0.05, T.nadie + 0.5));
    R.bloques[0].style.transform = `translateX(${-46 * ap}px)`;
    R.bloques[1].style.transform = `translateX(${46 * ap}px)`;
    R.bloques.forEach((b) => (b.style.opacity = 1 - 0.55 * ap));
    // la franja: crece en «aparatos», brilla en «vive» y baja a la puerta del microondas en «sobraba»
    const cr = K.sale(K.tramo(g, T.aparatos - 0.05, T.aparatos + 0.4)), vi = sube(g, T.vive - 0.1, T.vive + 0.35);
    const ba = sube(g, T.sobraba, T.sobraba + 0.8), [tx, ty] = pantalla(k, VEN.x + VEN.w / 2, VEN.y + VEN.h / 2);
    const dx = (tx - 492) * ba, dy = (ty - 620) * ba;
    R.franja.style.transformOrigin = "50% 50%";
    R.franja.style.transform = `translate(${dx}px, ${dy}px) scale(${1 - 0.6 * ba}, ${cr * (1 - 0.6 * ba)})`;
    R.franja.style.filter = `brightness(${1 + 0.45 * vi})`;
    R.franja.style.opacity = 1 - sube(g, T.sobraba + 0.5, T.sobraba + 0.85);
    // «ruido»: la franja se llena de chispas
    chispas(R.ruido, g, 444, 540, 566, 674, sube(g, T.ruido - 0.1, T.ruido + 0.2) * (1 - sube(g, 47.1, 47.6)));
    // «salió»: el wifi entra en la franja
    const en = sube(g, T.salio - 0.05, T.salio + 0.5);
    ow({ x0: -6, x1: K.mez(-6, 102, en), y: 54, amp: 26, lam: 40, fase: 2 * Math.PI * 1.2 * g, alpha: K.lim(en * 3) });
    // las etiquetas, debajo de la franja
    centro(calentar, 492); centro(ano, 492); centro(wl, 492);
    asoma(calentar, g, T.calientan - 0.05, 46.5);
    asoma(ano, g, T.ano - 0.05, 51.4);
    asoma(wl, g, T.wifi3 - 0.05);
    pisa(lic, g, T.licencia + 0.12, 492, 620, -8, T.salio - 0.45);
  };
}
