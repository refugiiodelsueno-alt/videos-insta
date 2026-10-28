// El gato que rompe la física. Un gato atigrado en 3D (gato.js) en un estudio azul noche: cae boca arriba y se
// endereza en el aire. Cada escena monta solo lo que necesita y lo pone todo con el reloj del vídeo entero (g).
// Colores: la mitad de delante, cian; la de atrás, ámbar; lo que no vale, rojo; lo que sí, verde.
import { estudio, camino, V, tres, RoundedBoxGeometry } from "../kit3d.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as GT from "./gato.js";

const K = window.K;
const PI = Math.PI;
export const CIAN = "#5fd4ff", AMBAR = "#ffb648", ROJO = "#f0445a", VERDE = "#22d38a", AMARILLO = "#ffd23a";

// Lo que dura el vídeo entero. Lo que se mueve sin parar da un número entero de vueltas en TOTAL segundos: así el
// último fotograma empalma con el primero.
export const TOTAL = 48.83;
export const ciclo = (g, f) => g * Math.max(1, Math.round(f * TOTAL)) / TOTAL;
export const sube = (g, a, b) => K.suave(K.tramo(g, a, b));
const asoma = (g, a, b = 1e9) => K.sale(K.tramo(g, a, a + 0.3)) * (1 - K.suave(K.tramo(g, b, b + 0.3)));
const mez = (a, b, u) => a + (b - a) * u;
const az = (s) => K.azar(s)();   // un número de 0 a 1, siempre el mismo para la misma semilla

// el segundo en que empieza cada escena (build/h1/index.html)
export const G0 = { hook: 0, regla: 5.24, fotos: 8.18, truco: 15.45, patinadora: 32.89, oido: 36.95, espacio: 39.21, cierre: 43.95 };
// el segundo de cada palabra que mueve algo, en el vídeo entero (voz/h1.json)
export const T = {
  gato: 0.2, gira: 0.72, aire: 1.24, apoyarse: 1.68, nada: 2.4, imposible: 4.0,
  girar: 5.84, empujar: 6.72, algo: 7.52,
  a1894: 8.96, fotos: 10.88, cayendo: 11.64, cientificos: 13.08, paris: 13.68, palabras: 14.4,
  truco: 15.7, no: 16.9, gira1: 17.06, entero: 17.46, dobla: 18.42, cintura: 18.98, mitades: 20.22,
  encoge: 21.32, delante: 22.2, gira2: 22.92, rapido: 24.6, atras: 25.5, estiradas: 26.62, gira3: 27.38, reves: 28.34,
  cambia: 29.2, encoge2: 29.96, atras2: 30.6, gira4: 31.32, debajo: 32.4,
  patinadora: 33.38, brazos: 34.58, pegados: 34.9, gira5: 35.42, rapido2: 36.26,
  todo: 37.28, medio: 38.24, segundo: 38.56,
  anos: 39.3, giro: 40.98, astronautas: 41.82, vuelta: 42.98, flotando: 43.3,
  gato2: 44.16, rompe: 44.68, fisica: 45.16, usa: 46.04, nadie: 46.96, imposible2: 47.88,
};

// ── el reloj del gancho, que también usa el cierre al rebobinar ─────────────────────────────────────────────────
const ATER = 3.25;                       // cuando toca el suelo
const REW = [47.86, 48.5];               // el rebobinado del final: del gancho en 3,9 s al gancho en -0,33 s
// en el cierre, a qué segundo del gancho corresponde g (null: el cierre normal)
function ganchoEn(g) {
  if (g < REW[0]) return null;
  if (g >= REW[1]) return g - TOTAL;
  return mez(3.9, REW[1] - TOTAL, K.suave(K.tramo(g, REW[0], REW[1])));
}

const CSS = `
.c-capa { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; }
.c-capa canvas.c-3d { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.c-capa canvas.c-2d { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; pointer-events: none; }
.c-techo { position: absolute; left: 0; right: 0; top: 0; height: 560px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(10,14,26,0.9) 0, rgba(10,14,26,0.7) 280px, rgba(10,14,26,0) 540px); }
.c-vineta { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 80% 62% at 50% 52%, rgba(6,8,14,0) 55%, rgba(6,8,14,0.55) 100%); }
.c-etq { position: absolute; left: 0; top: 0; font-family: var(--letra), sans-serif; font-weight: 700; font-size: 44px; color: #fff;
  background: rgba(10,14,24,0.9); border: 2px solid rgba(255,255,255,0.18); border-radius: 16px; padding: 10px 24px;
  white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,0.45); opacity: 0; text-align: center; }
.c-etq b { font-weight: 800; }
.c-etq.c b { color: ${CIAN}; } .c-etq.a b { color: ${AMBAR}; } .c-etq.r b { color: ${ROJO}; } .c-etq.v b { color: ${VERDE}; } .c-etq.y b { color: ${AMARILLO}; }
.c-etq.c { border-color: rgba(95,212,255,0.55); } .c-etq.a { border-color: rgba(255,182,72,0.6); } .c-etq.r { border-color: rgba(240,68,90,0.6); } .c-etq.v { border-color: rgba(34,211,138,0.6); } .c-etq.y { border-color: rgba(255,210,58,0.6); }
.c-etq.g { font-size: 60px; padding: 12px 32px; }
.c-etq.gg { font-size: 84px; padding: 14px 40px; font-weight: 800; }
.c-etq small { display: block; font-weight: 600; font-size: 32px; color: #c3ccd9; }
.c-etq .tacha { position: absolute; left: 14px; right: 14px; top: 48%; height: 7px; border-radius: 4px; background: ${ROJO};
  transform-origin: 0 50%; transform: scaleX(0); box-shadow: 0 0 10px rgba(240,68,90,0.7); }
.c-rec { position: absolute; left: 56px; top: 560px; font-family: var(--letra), sans-serif; font-weight: 800; font-size: 38px; letter-spacing: 0.08em;
  color: #fff; background: rgba(10,14,24,0.7); border-radius: 12px; padding: 8px 20px 8px 54px; opacity: 0; }
.c-rec i { position: absolute; left: 20px; top: 50%; width: 22px; height: 22px; margin-top: -11px; border-radius: 50%; background: ${ROJO}; box-shadow: 0 0 14px ${ROJO}; }
.c-rec small { font-weight: 600; color: #9aa6b8; font-size: 30px; margin-left: 10px; letter-spacing: 0.02em; }
.c-cuenta { position: absolute; left: 0; width: 1080px; top: 1450px; text-align: center; font-family: var(--letra), sans-serif; opacity: 0; }
.c-cuenta span { display: inline-block; font-weight: 800; font-size: 92px; color: #fff; background: rgba(10,14,24,0.78); border-radius: 22px;
  padding: 4px 36px; font-variant-numeric: tabular-nums; border: 2px solid rgba(255,255,255,0.16); }
.c-cuenta small { display: table; margin: 10px auto 0; font-size: 34px; font-weight: 600; color: #c3ccd9; background: rgba(10,14,24,0.78);
  border-radius: 12px; padding: 4px 18px; }
.c-ano { position: absolute; left: 0; width: 1080px; top: 840px; text-align: center; font-family: "Georgia", serif; font-weight: 700; font-size: 230px;
  color: #f1dfb8; letter-spacing: 0.04em; text-shadow: 0 0 40px rgba(255,200,120,0.35), 0 8px 30px rgba(0,0,0,0.8); opacity: 0; }
.c-rew { position: absolute; left: 60px; top: 570px; font-family: "Courier New", monospace; font-weight: 700; font-size: 64px; color: #fff;
  text-shadow: 3px 0 rgba(255,40,80,0.8), -3px 0 rgba(40,220,255,0.8); opacity: 0; }
`;
let cssPuesto = false;
function ponCss() {
  if (cssPuesto) return;
  const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); cssPuesto = true;
}
const div = (padre, cls, html = "") => { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; padre.appendChild(d); return d; };

// ── piezas del mundo ────────────────────────────────────────────────────────────────────────────────────────────
function textura(w, h, f) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h);
  const t = new tres.CanvasTexture(c); t.colorSpace = tres.SRGBColorSpace; return t;
}
function fondo(E, arriba, abajo, centro, rejilla = false) {
  E.scene.background = textura(512, 1024, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, arriba); d.addColorStop(1, abajo);
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    if (centro) { const r = g.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.9); r.addColorStop(0, centro); r.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); }
    // la pared de laboratorio de las películas a cámara lenta: una cuadrícula de medir, iluminada en el centro
    if (rejilla) {
      const c = document.createElement("canvas"); c.width = w; c.height = h; const q = c.getContext("2d");
      q.strokeStyle = "rgba(190,215,255,0.20)"; q.lineWidth = 1.2;
      for (let x = w / 2 % 32; x < w; x += 32) { q.beginPath(); q.moveTo(x, 0); q.lineTo(x, h); q.stroke(); }
      for (let y = h / 2 % 32; y < h; y += 32) { q.beginPath(); q.moveTo(0, y); q.lineTo(w, y); q.stroke(); }
      q.strokeStyle = "rgba(190,215,255,0.38)"; q.lineWidth = 2;
      for (let x = w / 2 % 128; x < w; x += 128) { q.beginPath(); q.moveTo(x, 0); q.lineTo(x, h); q.stroke(); }
      for (let y = h / 2 % 128; y < h; y += 128) { q.beginPath(); q.moveTo(0, y); q.lineTo(w, y); q.stroke(); }
      q.globalCompositeOperation = "destination-in";
      const m = q.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, h * 0.62); m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0.15)");
      q.fillStyle = m; q.fillRect(0, 0, w, h);
      g.drawImage(c, 0, 0);
      const r = g.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, h * 0.5); r.addColorStop(0, "rgba(120,160,235,0.30)"); r.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h);
    }
  });
}
// el suelo del estudio: azul, con un charco de luz debajo del gato que se pierde en la niebla
function suelo(E, color = "#1d2a4a") {
  const tex = textura(512, 512, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, "#ffffff"); r.addColorStop(0.35, "#c9d3e6"); r.addColorStop(1, "#5b6680");
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  const m = new tres.Mesh(new tres.CircleGeometry(60, 96), new tres.MeshStandardMaterial({ color, map: tex, roughness: 0.82, metalness: 0 }));
  m.rotation.x = -PI / 2; m.receiveShadow = true; E.scene.add(m);
  return m;
}
// luces de estudio: la principal, cálida, que sigue al protagonista; un contraluz frío y un relleno
function luces(E, o = {}) {
  E.sol.intensity = o.sol ?? 2.6; E.sol.color.set(o.colorSol || "#fff1dc");
  Object.assign(E.sol.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 0.5, far: 40 });
  E.sol.shadow.camera.updateProjectionMatrix(); E.sol.shadow.bias = -0.0004; E.sol.shadow.normalBias = 0.02;
  E.scene.add(E.sol.target);
  const rim = new tres.DirectionalLight(o.colorRim || "#7fb0ff", o.rim ?? 2.4); rim.position.set(2, 3, -7); E.scene.add(rim, rim.target);
  const rel = new tres.DirectionalLight("#bcd0ff", 0.5); rel.position.set(-6, 1, 3); E.scene.add(rel);
  E.rim = rim;
  E.luzEn = (p) => { E.sol.position.set(p.x - 3, p.y + 7, p.z + 5); E.sol.target.position.copy(p); rim.position.set(p.x + 2, p.y + 3, p.z - 7); rim.target.position.copy(p); };
}
// rayas de velocidad: el aire que sube mientras el gato cae (la cámara cae con él)
function rayas(E, n = 70) {
  const geo = new tres.CylinderGeometry(0.014, 0.014, 1, 6);
  const ms = Array.from({ length: n }, (_, i) => {
    const m = new tres.Mesh(geo, new tres.MeshBasicMaterial({ color: "#dfe9ff", transparent: true, opacity: 0, depthWrite: false, blending: tres.AdditiveBlending }));
    const a = az(i * 3 + 1) * 2 * PI, r = 1.3 + 4.2 * az(i * 3 + 2);
    m.userData = { x: Math.cos(a) * r, z: Math.sin(a) * r, y0: az(i * 3 + 3), l: 0.35 + 1.3 * az(i * 7 + 5), v: 0.8 + 0.5 * az(i * 11 + 2) };
    E.scene.add(m); return m;
  });
  // c: el centro (lo que cae); fuerza de 0 a 1; vel: vueltas de rayas por segundo
  return (g, c, fuerza, vel = 0.55) => {
    for (const m of ms) {
      const u = m.userData, ph = ((u.y0 + ciclo(g, vel * u.v)) % 1 + 1) % 1;
      m.position.set(c.x + u.x, c.y - 7 + 14 * ph, c.z + u.z);
      m.scale.set(1, u.l * (0.4 + 0.6 * fuerza), 1);
      const dc = Math.hypot(m.position.x - E.camera.position.x, m.position.z - E.camera.position.z);
      m.material.opacity = fuerza * 0.55 * Math.sin(PI * ph) * sube(dc, 2.2, 3.6);
      m.visible = fuerza > 0.01;
    }
  };
}
// motas de polvo en el aire del estudio
function motas(E, n = 90, color = "#cfdcff") {
  const pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([(az(i * 5 + 1) - 0.5) * 14, az(i * 5 + 2) * 7, (az(i * 5 + 3) - 0.5) * 10, az(i * 5 + 4)]);
  const g = new tres.BufferGeometry(); g.setAttribute("position", new tres.BufferAttribute(pos, 3));
  const p = new tres.Points(g, new tres.PointsMaterial({ color, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false }));
  E.scene.add(p);
  return (t, c = V()) => {
    base.forEach(([x, y, z, f], i) => {
      const ph = ciclo(t, 0.05 + 0.04 * f);
      pos[i * 3] = c.x + x + 0.25 * Math.sin(2 * PI * (ph + f)); pos[i * 3 + 1] = c.y - 2 + ((y + 7 * ph) % 7); pos[i * 3 + 2] = c.z + z;
    });
    g.attributes.position.needsUpdate = true;
  };
}
// una flecha curva alrededor de un eje (el de la columna del gato): crece con su ángulo
function arco(E, color, R = 0.8, grueso = 0.035) {
  const grupo = new tres.Group(), m = new tres.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.4, transparent: true });
  const toro = new tres.Mesh(new tres.TorusGeometry(R, grueso, 10, 72, 0.01), m);
  const punta = new tres.Mesh(new tres.ConeGeometry(grueso * 3.2, grueso * 8, 20), m);
  grupo.add(toro, punta); E.scene.add(grupo);
  let ultimo = -1;
  // centro, eje (vector unitario), desde (ángulo), cuanto (radianes, con signo), k: opacidad
  return (centro, eje, desde, cuanto, k = 1, radio = R) => {
    grupo.visible = k > 0.01 && Math.abs(cuanto) > 0.02;
    if (!grupo.visible) return;
    const len = Math.abs(cuanto), s = Math.sign(cuanto) || 1;
    if (Math.abs(len - ultimo) > 0.004 || toro.userData.r !== radio) { toro.geometry.dispose(); toro.geometry = new tres.TorusGeometry(radio, grueso, 10, 72, len); ultimo = len; toro.userData.r = radio; }
    const z = eje.clone().normalize(), x = Math.abs(z.y) < 0.9 ? V(0, 1, 0).cross(z).normalize() : V(1, 0, 0).cross(z).normalize(), y = z.clone().cross(x);
    grupo.quaternion.setFromRotationMatrix(new tres.Matrix4().makeBasis(x, y, z)); grupo.position.copy(centro);
    toro.rotation.z = s > 0 ? desde : desde - len;
    const e = desde + s * len;
    punta.position.set(radio * Math.cos(e), radio * Math.sin(e), 0);
    punta.quaternion.setFromUnitVectors(V(0, 1, 0), V(-Math.sin(e) * s, Math.cos(e) * s, 0));
    m.opacity = k;
  };
}
// un polvo que sale del suelo al caer
function polvo(E, n = 22) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,0.85)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const map = new tres.CanvasTexture(c);
  const ps = Array.from({ length: n }, () => { const s = new tres.Sprite(new tres.SpriteMaterial({ map, color: "#c8d4ec", transparent: true, depthWrite: false, opacity: 0 })); E.scene.add(s); return s; });
  return (t, centro) => {
    ps.forEach((s, i) => {
      const a = (i / n) * 2 * PI + az(i + 40) * 0.4, u = K.tramo(t, 0, 0.9), r = 0.5 + 1.7 * K.sale(u) * (0.7 + 0.5 * az(i + 9));
      s.position.set(centro.x + Math.cos(a) * r * 1.3, 0.12 + 0.35 * K.sale(u) * az(i + 3), centro.z + Math.sin(a) * r * 0.8);
      s.scale.setScalar(0.35 + 0.9 * u);
      s.material.opacity = t > 0 && t < 0.9 ? 0.45 * (1 - u) * Math.min(1, t * 20) : 0;
    });
  };
}

// ── el montaje de cada escena: el lienzo 3D, las etiquetas por encima y la proyección de puntos ───────────────────
function montaje(esc, o = {}) {
  ponCss();
  esc.innerHTML = "";
  const cv = document.createElement("canvas"); cv.className = "c-3d"; cv.width = 1080; cv.height = 1920; esc.appendChild(cv);
  const E = estudio(cv, Object.assign({ fondo: "#0e1528", suelo: false, lente: 30, exposicion: 1.08, ambiente: 0.55, luz: 2.6, nieblaDesde: 14, nieblaHasta: 40 }, o));
  E.renderer.localClippingEnabled = true;
  E.esc = esc;
  E.v2 = (p) => { const q = p.clone().project(E.camera); return { x: (q.x + 1) * 540, y: (1 - q.y) * 960 }; };
  E.etiquetas = [];
  // una etiqueta que sigue a un punto del mundo; dx, dy: dónde va respecto al punto (en px)
  E.etq = (html, cls = "") => { const d = div(esc, "c-etq " + cls, html); E.etiquetas.push(d); return d; };
  E.pon = (d, p, op, dx = 0, dy = 0, esc2 = 1) => {
    d.style.opacity = op.toFixed(3);
    if (op <= 0.001) return;
    const w = d.offsetWidth, h = d.offsetHeight;
    const s = typeof p.x === "number" && p.isVector3 ? E.v2(p) : p;
    const x = Math.max(40, Math.min(1080 - 130 - w, s.x + dx - w / 2)), y = Math.max(560, Math.min(1430 - h, s.y + dy - h / 2));
    d.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(esc2 * (0.85 + 0.15 * Math.min(1, op))).toFixed(3)})`;
  };
  E.dibuja = () => { E.camera.lookAt(E.mira); E.renderer.render(E.scene, E.camera); };
  return E;
}
// camino con la cámara más lejos (F veces), para que quepa el gato entero en vertical
function vuelo(E, g, claves, F = 1.8) { camino(E, g, claves.map(([t, p, m]) => [t, m.clone().add(p.clone().sub(m).multiplyScalar(F)), m])); }
function capasDom(E) { div(E.esc, "c-vineta"); div(E.esc, "c-techo"); }

// el gato y lo que mide de pie
function gatoNuevo(E) {
  const G = GT.crearGato(E.scene, { escala: 0.05 });
  GT.poner(G, GT.postura({ pie: 1 }));
  G.raiz.updateMatrixWorld(true);
  const b = new tres.Box3().setFromObject(G.raiz);
  G.alto = -b.min.y;                      // la columna, a esta altura del suelo cuando está de pie
  return G;
}
const centroGato = (G, P) => V(...GT.puntoGato(G, P, 21, 0));

// ── el gancho: cae boca arriba, se gira a cámara lenta y cae de pie ─────────────────────────────────────────────
// gH: el segundo del gancho (puede ser negativo: un poco antes de empezar)
function estadoGancho(G, gH) {
  const p = K.suave(K.tramo(gH, 0.62, 3.12));
  const q = gH - ATER;
  const y = q < 0 ? G.alto + 2.2 * -q + 0.22 * q * q : G.alto - 0.11 * Math.sin(PI * K.tramo(q, 0, 0.32)) * (1 - K.tramo(q, 0.32, 0.5));
  const pie = sube(gH, ATER - 0.32, ATER + 0.04);
  const ag = 1 - K.tramo(gH, 0.5, 0.9);   // agitarse un poco antes de girar
  const P = GT.enderezar(p, {
    pie, mira: mez(0.15 + 0.25 * sube(p, 0.1, 0.5), 0.12, pie),
    cola: { curva: 0.6 + 0.3 * Math.sin(gH * 4.2 + 1), vuelta: 0.45 * Math.sin(gH * 3.1) },
    pasos: [0.25 * ag * (0.5 + 0.5 * Math.sin(gH * 9)), 0.25 * ag * (0.5 + 0.5 * Math.sin(gH * 9 + 2)), 0.2 * ag * (0.5 + 0.5 * Math.sin(gH * 8 + 1)), 0.2 * ag * (0.5 + 0.5 * Math.sin(gH * 8 + 3))],
  });
  if (pie > 0) { P.beta *= 1 - pie; P.eF *= 1 - pie; P.eR *= 1 - pie; P.fF *= 1 - pie; P.fR *= 1 - pie; }
  P.pos = [0, y, 0];
  // la cámara: muy cerca de la cara al principio, cae con el gato, se abre en «aire» y se queda en el suelo
  const c = V(0, y, 0);
  const abre = sube(gH, 1.0, 2.4), suelta = sube(gH, 2.6, 3.8), cerca = sube(gH, 3.6, 5.6);
  const sigue = c.clone().add(V(mez(5.0, 4.2, abre), mez(-0.85, 0.6, abre), mez(3.6, 6.6, abre)));
  const quieta = V(mez(4.6, 3.7, cerca), mez(2.3, 1.8, cerca), mez(7.4, 6.2, cerca));
  const cam = sigue.lerp(quieta, suelta);
  const mira = c.clone().add(V(mez(0.45, 0.35, abre), mez(0.75, 0.35, abre), 0)).lerp(V(0.5, G.alto * 0.8 + 0.25, 0), suelta);
  return { P, cam, mira, p, pie, y };
}
const grados = (p) => Math.round(180 * p);

function ganchoMundo(E) {
  fondo(E, "#22345c", "#0e1528", "rgba(90,130,210,0.22)");
  E.scene.background = new tres.Color("#141e38"); E.scene.fog = new tres.Fog("#141e38", 7, 26);
  suelo(E); luces(E);
  const G = gatoNuevo(E), ra = rayas(E), mo = motas(E), po = polvo(E);
  capasDom(E);
  const rec = div(E.esc, "c-rec", "<i></i>CÁMARA LENTA<small>×10</small>");
  const cu = div(E.esc, "c-cuenta", "<span>0°</span><small>girado en el aire</small>");
  const im = E.etq("¿<b>Imposible</b>?", "y gg");
  const rew = div(E.esc, "c-rew", "◀◀ REW");
  // labels: si se ven las etiquetas del gancho
  E.gancho = (gH, g, labels = true) => {
    const st = estadoGancho(G, gH);
    GT.poner(G, st.P);
    const c = V(0, st.y, 0);
    E.luzEn(c);
    E.camera.position.copy(st.cam); E.mira.copy(st.mira);
    ra(g, c, (1 - sube(gH, 2.6, ATER)) * (gH < ATER ? 1 : 0), 0.55);
    mo(g);
    po(gH - ATER, c);
    E.camera.fov = 36; E.camera.updateProjectionMatrix();
    const lento = labels ? asoma(gH, T.gira - 0.05, ATER - 0.1) : 0;
    rec.style.opacity = lento.toFixed(3);
    rec.querySelector("i").style.opacity = (0.35 + 0.65 * (Math.sin(gH * 9) > 0 ? 1 : 0.2)).toFixed(2);
    cu.style.opacity = (labels ? asoma(gH, T.gira + 0.1, 4.6) : 0).toFixed(3);
    cu.querySelector("span").textContent = grados(st.p) + "°";
    E.pon(im, V(0.2, G.alto + 1.2, 0), labels ? asoma(gH, T.imposible - 0.05) : 0, 0, -40, 1 + 0.15 * (1 - K.sale(K.tramo(gH, T.imposible, T.imposible + 0.25))));
    return st;
  };
  E.G = G; E.rew = rew;
  return E;
}

// ── regla: para girar hay que empujar algo (el gato de pie da la vuelta empujando el suelo con las patas) ──────────
function reglaMundo(E) {
  fondo(E, "#22345c", "#0e1528", "rgba(90,130,210,0.22)");
  E.scene.background = new tres.Color("#141e38"); E.scene.fog = new tres.Fog("#141e38", 7, 26);
  suelo(E); luces(E);
  const G = gatoNuevo(E), mo = motas(E);
  const amarillo = new tres.MeshStandardMaterial({ color: AMARILLO, emissive: AMARILLO, emissiveIntensity: 0.6, roughness: 0.4, transparent: true });
  const flechas = Array.from({ length: 4 }, () => {
    const f = new tres.Group();
    const palo = new tres.Mesh(new tres.CylinderGeometry(0.035, 0.035, 0.5, 12), amarillo); palo.position.y = 0.25;
    const punta = new tres.Mesh(new tres.ConeGeometry(0.09, 0.2, 18), amarillo); punta.position.y = 0.6;
    f.add(palo, punta); E.scene.add(f); return f;
  });
  const anillo = new tres.Mesh(new tres.RingGeometry(1.25, 1.42, 96), new tres.MeshBasicMaterial({ color: AMARILLO, transparent: true, opacity: 0, side: tres.DoubleSide, depthWrite: false }));
  anillo.rotation.x = -PI / 2; anillo.position.y = 0.01; E.scene.add(anillo);
  const brillo = new tres.Mesh(new tres.CircleGeometry(1.42, 96), new tres.MeshBasicMaterial({ color: AMARILLO, transparent: true, opacity: 0, depthWrite: false, blending: tres.AdditiveBlending }));
  brillo.rotation.x = -PI / 2; brillo.position.y = 0.008; E.scene.add(brillo);
  capasDom(E);
  const e1 = E.etq("empuja el <b>suelo</b>", "y g"), e2 = E.etq("<b>algo</b> donde apoyarse", "y");
  E.paso = (g) => {
    // gira 120° dando pasitos: cada pata se levanta por turnos y empuja
    const gira = sube(g, T.girar - 0.1, 7.9), yaw = -2.1 * gira, activo = Math.sin(PI * K.tramo(g, T.girar - 0.1, 7.9));
    const ph = (g - T.girar) * 9;
    const pasos = [0, 1, 2, 3].map((k) => activo * Math.max(0, Math.sin(ph + [0, PI, PI / 2, 1.5 * PI][k])) * 0.55);
    const P = GT.postura({ pie: 1, mira: 0.1 + 0.08 * Math.sin(g * 1.3), pasos, R: GT.rotY(yaw), cola: { curva: 0.5 + 0.25 * Math.sin(g * 2.1), vuelta: 0.3 * Math.sin(g * 1.7) }, giraCabeza: -0.25 * activo });
    P.pos = [0, G.alto, 0];
    GT.poner(G, P);
    const c = V(0, G.alto, 0);
    E.luzEn(c); mo(g);
    vuelo(E, g, [[5.24, V(2.2, 2.6, 4.6), V(0, 0.55, 0)], [6.7, V(0.6, 3.6, 4.4), V(0, 0.45, 0)], [8.2, V(-1.2, 4.1, 3.8), V(0, 0.4, 0)]]);
    E.camera.fov = 36; E.camera.updateProjectionMatrix();
    // las flechas: en cada pata, por el suelo, hacia atrás del giro (la pata empuja el suelo y el suelo empuja al gato)
    const k = asoma(g, T.empujar - 0.1, 8.0);
    const pies = [[36, 4.2], [36, -4.2], [5, 4.5], [5, -4.5]];
    pies.forEach(([x, l], i) => {
      const q = V(...GT.puntoGato(G, P, x, 0, l)); q.y = 0.03;
      const rad = q.clone().setY(0), t = V(0, 1, 0).cross(rad).normalize();       // hacia donde gira el gato es -t (yaw negativo)
      const f = flechas[i], dir = t.clone();
      f.position.copy(q).addScaledVector(dir, -0.05);
      f.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
      const late = 0.85 + 0.15 * Math.sin((g - T.empujar) * 10 + i);
      f.scale.setScalar(Math.max(0.001, k * late)); f.visible = k > 0.01;
    });
    amarillo.opacity = k;
    const a = asoma(g, T.algo - 0.15);
    anillo.material.opacity = 0.85 * a; brillo.material.opacity = 0.18 * a * (0.8 + 0.2 * Math.sin((g - T.algo) * 8));
    anillo.scale.setScalar(0.9 + 0.1 * K.sale(K.tramo(g, T.algo - 0.15, T.algo + 0.3)));
    E.dibuja();
    E.pon(e1, V(0, 0, 1.4), k, 0, 120);
    E.pon(e2, V(0, G.alto + 1.1, 0), a, 0, -40);
  };
  return E;
}

// ── fotos: la tira de película de Marey (1894), en sepia, con el gato girando foto a foto ──────────────────────────
async function fotosMundo(E) {
  fondo(E, "#20180f", "#0a0806", "rgba(255,190,110,0.12)");
  E.scene.fog = null;
  // primero, las fotos: el mismo gato en un estudio negro, de lado, en 6 momentos del giro
  const fotoEsc = new tres.Scene(); fotoEsc.background = new tres.Color("#050505");
  const luzF = new tres.DirectionalLight("#ffffff", 2.3); luzF.position.set(-3, 5, 4); fotoEsc.add(luzF);
  fotoEsc.add(new tres.HemisphereLight("#ffffff", "#222222", 0.7));
  fotoEsc.environment = E.scene.environment; fotoEsc.environmentIntensity = 0.35;
  const G = GT.crearGato(fotoEsc, { escala: 0.05 });
  const camF = new tres.PerspectiveCamera(30, 1, 0.05, 100);
  const N = 6, CW = 1024, CH = 682, tira = document.createElement("canvas"); tira.width = CW; tira.height = CH * N;
  const t2 = tira.getContext("2d");
  t2.fillStyle = "#120c07"; t2.fillRect(0, 0, CW, CH * N);
  const ps = [0, 0.17, 0.32, 0.48, 0.66, 1];
  E.renderer.setScissorTest(false);
  for (let i = 0; i < N; i++) {
    const P = GT.enderezar(ps[i], { cola: { curva: 0.7, vuelta: 0.4 * Math.sin(i * 1.7) } });
    P.pos = [0, 0, 0];
    GT.poner(G, P);
    camF.position.set(0.35, 0.3, 5.3); camF.lookAt(0.3, -0.05, 0);
    E.renderer.setViewport(0, 0, 1080, 1080); E.renderer.render(fotoEsc, camF);
    const x0 = 120, y0 = i * CH + 40, w = CW - 240, h = CH - 80;
    t2.save(); t2.filter = "grayscale(1) sepia(0.85) contrast(1.35) brightness(0.8)";
    t2.drawImage(E.renderer.domElement, 0, 1920 - 1080 + 140, 1080, 1080 - 280, x0, y0, w, h);
    t2.restore();
    // grano, rayas y un borde quemado
    const img = t2.getImageData(x0, y0, w, h), d = img.data;
    for (let k = 0; k < d.length; k += 4) { const h = Math.sin(k * 12.9898 + i * 78.233) * 43758.5453, n = (h - Math.floor(h) - 0.5) * 38; d[k] += n; d[k + 1] += n; d[k + 2] += n * 0.8; }
    t2.putImageData(img, x0, y0);
    const vg = t2.createRadialGradient(x0 + w / 2, y0 + h / 2, h * 0.3, x0 + w / 2, y0 + h / 2, w * 0.62);
    vg.addColorStop(0, "rgba(30,18,6,0)"); vg.addColorStop(1, "rgba(30,18,6,0.75)"); t2.fillStyle = vg; t2.fillRect(x0, y0, w, h);
    t2.strokeStyle = "rgba(240,220,180,0.18)"; t2.lineWidth = 2;
    for (let s = 0; s < 3; s++) { const xx = x0 + w * az(i * 13 + s); t2.beginPath(); t2.moveTo(xx, y0); t2.lineTo(xx + 6, y0 + h); t2.stroke(); }
    t2.fillStyle = "rgba(235,215,170,0.8)"; t2.font = "bold 34px Georgia, serif"; t2.fillText(String(i + 1), x0 + 16, y0 + h - 18);
    // las perforaciones
    for (let s = 0; s < 5; s++) for (const xx of [34, CW - 34 - 52]) { t2.fillStyle = "#cdb88f"; t2.beginPath(); t2.roundRect(xx, i * CH + 30 + s * (CH / 5), 52, 70, 10); t2.fill(); }
  }
  E.renderer.setViewport(0, 0, 1080, 1920);
  G.raiz.visible = false;
  const tex = new tres.CanvasTexture(tira); tex.colorSpace = tres.SRGBColorSpace; tex.anisotropy = 8;
  // la tira en 3D: un poco curvada, como si colgara delante de un proyector
  const AN = 1.7, AL = AN * (CH * N) / CW;
  const geo = new tres.PlaneGeometry(AN, AL, 24, 120), pp = geo.attributes.position;
  for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i); pp.setZ(i, -0.35 * (x / AN) ** 2 * 2 + 0.18 * Math.sin(y * 0.55)); }
  geo.computeVertexNormals();
  const matT = new tres.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0.55 });
  const pel = new tres.Mesh(geo, matT); pel.castShadow = true; E.scene.add(pel);
  pel.rotation.z = 0.06;
  E.sol.intensity = 1.4; E.sol.position.set(-2, 3, 6); E.sol.target.position.set(0, 0, 0); E.scene.add(E.sol.target);
  const mo = motas(E, 70, "#ffd9a0");
  capasDom(E);
  const ano = div(E.esc, "c-ano", "1894");
  const e1 = E.etq("Étienne-Jules <b>Marey</b><small>fotos a 12 por segundo</small>", "a");
  const e2 = E.etq("Academia de Ciencias · <b>París</b>", "a");
  const e3 = E.etq("<b>?</b>", "a gg");
  // la foto i, en el mundo
  const yFoto = (i) => AL / 2 - (i + 0.5) * (AL / N);
  E.paso = (g) => {
    // la cámara baja por la tira: de la foto 1 (boca arriba) a la 6 (de pie)
    const u = sube(g, 10.6, 14.3);
    const yc = mez(yFoto(0) + 0.2, yFoto(5), u);
    const lejos = 1 - sube(g, 8.3, 10.9);
    vuelo(E, g, [[8.18, V(1.17, yFoto(0) + 2.6, 6.0), V(0, yFoto(0) + 0.9, 0)], [10.9, V(0.35, yFoto(0) + 0.5, 4.6), V(0, yFoto(0) + 0.2, 0)]], 1);
    if (g > 10.9) { E.camera.position.set(0.35 - 0.6 * u, yc + 0.3, 4.6 - 0.4 * u); E.mira.set(0, yc, 0); }
    if (g > 14.3) { const w = sube(g, 14.3, 15.45); E.camera.position.set(-0.25 - 0.4 * w, yFoto(5) + 0.3 + 0.4 * w, 4.2 + 1.2 * w); E.mira.set(0, yFoto(5) + 0.15 * w, 0); }
    E.camera.fov = 30; E.camera.updateProjectionMatrix();
    // el proyector parpadea
    const n = az(Math.floor(g * 24) + 7);
    matT.emissiveIntensity = 0.5 + 0.12 * n; E.sol.intensity = 1.3 + 0.3 * n;
    mo(g, V(0, yc, 0));
    E.dibuja();
    const a = asoma(g, T.a1894 - 0.08, T.fotos - 0.3);
    ano.style.opacity = (a * (0.9 + 0.1 * n)).toFixed(3);
    ano.style.transform = `scale(${(1 + 0.35 * (1 - K.sale(K.tramo(g, T.a1894 - 0.08, T.a1894 + 0.2)))).toFixed(3)})`;
    ano.style.filter = `blur(${(lejos * 0).toFixed(1)}px)`;
    E.pon(e1, { x: 540, y: 600 }, asoma(g, T.fotos - 0.1, 13.0), 0, 0);
    E.pon(e2, { x: 540, y: 600 }, asoma(g, T.cientificos - 0.05, 15.2), 0, 0);
    E.pon(e3, { x: 820, y: 900 }, asoma(g, T.palabras - 0.1), 0, 0, 1 + 0.12 * Math.sin((g - T.palabras) * 6));
  };
  return E;
}

// ── truco: el gato quieto en el aire, a cámara superlenta, y su giro por mitades ───────────────────────────────────
function trucoMundo(E) {
  fondo(E, "#22345c", "#0e1528", "rgba(90,130,210,0.25)", true);
  E.scene.fog = null; luces(E);
  const G = gatoNuevo(E), ra = rayas(E), mo = motas(E);
  const aTodo = arco(E, "#ffffff", 1.05), aF = arco(E, CIAN, 0.78), aR = arco(E, AMBAR, 0.82);
  capasDom(E);
  const eEntero = E.etq('girar <b data-layout-allow-occlusion>entero</b><span class="tacha" data-layout-allow-occlusion></span>', "r g");
  const eCint = E.etq("se dobla por la <b>cintura</b>", "y");
  const eDel = E.etq("mitad de <b>delante</b>", "c"), eAtr = E.etq("mitad de <b>atrás</b>", "a");
  const eEnc = E.etq("patas <b>encogidas</b>", "c"), eRap = E.etq("¡muy <b>rápido</b>!", "c g");
  const eEst = E.etq("patas <b>estiradas</b>", "a"), eRev = E.etq("un poco <b>al revés</b>", "a g");
  const eCam = E.etq("¡<b>cambia</b>!", "y gg"), eEnc2 = E.etq("encoge las de <b>atrás</b>", "a"), eDeb = E.etq("patas <b>debajo</b> ✓", "v g");
  const Y0 = 2.4;
  E.paso = (g) => {
    const beta = 0.78 * sube(g, 18.3, 19.2) - 0.78 * sube(g, 32.15, 32.85);
    const eF = sube(g, 21.25, 21.85) - sube(g, 29.9, 30.5);
    const fF = PI - PI * sube(g, 22.9, 24.4);
    const fR = PI + 0.42 * sube(g, 27.3, 28.4) - (PI + 0.42) * sube(g, 31.2, 32.4);
    const eR = sube(g, 29.9, 30.5) - sube(g, 32.3, 32.85);
    const cabeza = 0.55 * (sube(g, 22.6, 23.2) - sube(g, 24.0, 24.7));
    const tinte = sube(g, 20.0, 20.5);
    const P = GT.postura({
      beta, fF, fR, eF, eR, cabeza, mira: 0.25,
      cola: { curva: 0.6 + 0.25 * Math.sin(g * 1.3), vuelta: 0.4 * Math.sin(g * 0.9) },
      tinteF: [0.37, 0.83, 1, tinte * 0.22], tinteR: [1, 0.71, 0.28, tinte * 0.22],
    });
    const y = Y0 + 0.05 * Math.sin(g * 1.1);
    P.pos = [0, y, 0];
    GT.poner(G, P);
    const c = V(0, y, 0);
    E.luzEn(c); ra(g, c, 0.55, 0.12); mo(g, c);
    // la cámara: de lado, luego por delante en diagonal (para ver girar la mitad de delante), por detrás, y otra vez
    const k = (t, x, yy, z, mx = 0) => [t, V(x, Y0 + yy, z), V(mx, Y0, 0)];
    vuelo(E, g, [k(15.45, 2.8, 0.3, 5.6, 0.15), k(18.0, 2.3, 0.6, 5.6, 0.15), k(20.6, -0.3, 0.9, 5.2), k(22.6, 3.6, 0.7, 3.7, 0.5), k(24.8, 4.2, 0.4, 2.6, 0.5),
      k(26.4, -3.2, 0.9, 3.8, -0.4), k(28.6, -3.9, 0.5, 2.8, -0.4), k(30.4, -0.4, 1.0, 4.9), k(32.89, 2.9, 0.2, 3.9, 0.2)]);
    E.camera.fov = 36; E.camera.updateProjectionMatrix();
    // las flechas curvas
    const ejeF = V(...GT.marcoGato(G, P, 34).T), cF = V(...GT.puntoGato(G, P, 34, 0)), ejeR = V(...GT.marcoGato(G, P, 8).T), cR = V(...GT.puntoGato(G, P, 8, 0));
    const todoK = asoma(g, T.gira1 - 0.1, 18.3);
    aTodo(c, V(1, 0, 0), PI / 2, -2 * PI * 0.8 * K.sale(K.tramo(g, T.gira1 - 0.1, T.entero + 0.2)), todoK);
    aTodo.m = 0;
    const kF = asoma(g, 22.8, 25.4);
    aF(cF, ejeF, PI / 2, -(PI - fF) - 0.001, kF, 0.85);
    const kR1 = asoma(g, 27.2, 29.0), kR2 = asoma(g, 31.15, 32.7);
    if (kR2 > 0.01) aR(cR, ejeR, PI / 2, -(PI + 0.42 - fR) * 1.0 - 0.001, kR2, 0.9);
    else aR(cR, ejeR, PI / 2, Math.max(0.12, (fR - PI)) * 1.6, kR1, 0.9);
    E.dibuja();
    // etiquetas
    const pF = V(...GT.puntoGato(G, P, 36, 0)), pR = V(...GT.puntoGato(G, P, 6, 0));
    E.pon(eEntero, c, todoK, 0, -330);
    eEntero.querySelector(".tacha").style.transform = `scaleX(${K.sale(K.tramo(g, T.entero, T.entero + 0.3)).toFixed(3)})`;
    E.pon(eCint, c, asoma(g, T.dobla, 20.0), 0, -300);
    const mitad = asoma(g, T.mitades - 0.1, 21.2);
    E.pon(eDel, pF, mitad, 60, -260); E.pon(eAtr, pR, mitad, -60, 260);
    E.pon(eEnc, pF, asoma(g, T.encoge - 0.05, 22.8), 0, 280);
    E.pon(eRap, cF, asoma(g, T.rapido - 0.15, 25.3), 0, -330);
    E.pon(eEst, pR, asoma(g, T.estiradas - 0.15, 27.3), 0, 280);
    E.pon(eRev, cR, asoma(g, T.reves - 0.15, 29.0), 0, -330);
    E.pon(eCam, { x: 540, y: 640 }, asoma(g, T.cambia - 0.1, 29.95), 0, 0, 1 + 0.12 * (1 - K.sale(K.tramo(g, T.cambia - 0.1, T.cambia + 0.25))));
    E.pon(eEnc2, pR, asoma(g, T.encoge2 - 0.05, 31.2), 0, 280);
    E.pon(eDeb, c, asoma(g, T.debajo - 0.15, 32.6), 0, 330);   // fuera antes del fundido a la patinadora
  };
  return E;
}

// ── patinadora: brazos fuera gira despacio; brazos pegados, mucho más rápido ───────────────────────────────────────
const BRAZOS_FUERA = [0.22, 0, 0.12, 0, 0, 0.15], BRAZOS_DENTRO = [0.75, 0, 1.0, 0, 0, 1.55];
async function patinadoraMundo(E) {
  fondo(E, "#1d3557", "#0b1426", "rgba(150,200,255,0.25)");
  E.scene.background = new tres.Color("#0f1a30"); E.scene.fog = new tres.Fog("#0f1a30", 6, 19);
  luces(E, { colorRim: "#a8d4ff", rim: 3 });
  // el hielo: brillante, con reflejos del estudio
  const hielo = new tres.Mesh(new tres.CircleGeometry(50, 96), new tres.MeshPhysicalMaterial({ color: "#a9c4e6", roughness: 0.16, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }));
  hielo.rotation.x = -PI / 2; hielo.receiveShadow = true; E.scene.add(hielo);
  const marcas = new tres.Mesh(new tres.RingGeometry(0.35, 0.37, 96), new tres.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.35, depthWrite: false }));
  marcas.rotation.x = -PI / 2; marcas.position.y = 0.005; E.scene.add(marcas);
  const gl = await new Promise((ok, mal) => new GLTFLoader().load("recursos/patinadora.glb", ok, undefined, mal));
  const ch = gl.scene; E.sombras(ch); E.scene.add(ch);
  const hueso = {}; ch.traverse((o) => { if (o.isBone) hueso[o.name.replace("mixamorig", "")] = o; });
  const base = {}; for (const n of Object.keys(hueso)) base[n] = hueso[n].rotation.clone();
  // una pierna un poco doblada, como en una pirueta
  const piernas = () => {
    hueso.RightUpLeg.rotation.x = base.RightUpLeg.x - 0.55; hueso.RightLeg.rotation.x = base.RightLeg.x + 1.1;
    hueso.RightUpLeg.rotation.z = base.RightUpLeg.z + 0.25;
  };
  const mo = motas(E, 80, "#e6f3ff");
  capasDom(E);
  const e1 = E.etq("brazos <b>fuera</b>: despacio", "a"), e2 = E.etq("brazos <b>pegados</b>: ¡rápido!", "c g");
  const cu = div(E.esc, "c-cuenta", "<span>0,0</span><small>vueltas por segundo</small>");
  const W1 = 0.55, W2 = 2.0;
  const vel = (g) => mez(W1, W2, sube(g, 34.78, 35.25));
  E.paso = (g) => {
    let ang = 0; const h = 0.005; for (let t = 32.6; t < g; t += h) ang += 2 * PI * vel(Math.min(g, t + h / 2)) * Math.min(h, g - t);
    ch.rotation.y = ang;
    const k = sube(g, 34.75, 35.2), A = BRAZOS_FUERA.map((v, i) => mez(v, BRAZOS_DENTRO[i], k));
    for (const n of Object.keys(base)) hueso[n].rotation.copy(base[n]);
    for (const [lado, sg] of [["Left", 1], ["Right", -1]]) {
      const b = hueso[lado + "Arm"], f = hueso[lado + "ForeArm"];
      b.rotation.x += A[0]; b.rotation.y += A[1] * sg; b.rotation.z += A[2] * sg;
      f.rotation.x += A[3]; f.rotation.y += A[4] * sg; f.rotation.z += A[5] * sg;
    }
    piernas();
    marcas.rotation.z = -ang * 0.2;
    E.luzEn(V(0, 1, 0)); mo(g, V(0, 0, 0));
    vuelo(E, g, [[32.89, V(0.6, 1.5, 6.2), V(0, 0.95, 0)], [34.8, V(-0.4, 1.3, 5.6), V(0, 0.95, 0)], [36.95, V(-0.9, 1.2, 5.0), V(0, 0.95, 0)]], 1.05);
    E.camera.fov = 36; E.camera.updateProjectionMatrix();
    E.dibuja();
    E.pon(e1, V(0, 1.9, 0), asoma(g, 33.5, T.pegados - 0.1), 0, -150);
    E.pon(e2, V(0, 1.9, 0), asoma(g, T.pegados), 0, -150);
    cu.style.opacity = asoma(g, 33.2).toFixed(3);
    cu.querySelector("span").textContent = vel(g).toFixed(1).replace(".", ",");
  };
  return E;
}

// ── oído: el giro de verdad, a velocidad real, con un cronómetro ───────────────────────────────────────────────────
const SUELTA = 37.28, GIRO_FIN = 37.64, TOCA = 37.73;
function oidoMundo(E) {
  fondo(E, "#22345c", "#0e1528", "rgba(90,130,210,0.22)");
  E.scene.background = new tres.Color("#141e38"); E.scene.fog = new tres.Fog("#141e38", 7, 26);
  suelo(E); luces(E);
  const G = gatoNuevo(E), mo = motas(E), po = polvo(E);
  capasDom(E);
  const cu = div(E.esc, "c-cuenta", "<span>0,00 s</span><small>del giro a las patas en el suelo</small>");
  const e1 = E.etq("menos de <b>medio segundo</b>", "v g");
  const H = 1.5;
  E.paso = (g) => {
    const t = Math.max(0, g - SUELTA), a = 2 * H / (TOCA - SUELTA) ** 2;
    const y = g < TOCA ? G.alto + H - 0.5 * a * t * t : G.alto - 0.1 * Math.sin(PI * K.tramo(g, TOCA, TOCA + 0.2)) * (1 - K.tramo(g, TOCA + 0.2, TOCA + 0.3));
    const p = K.suave(K.tramo(g, SUELTA, GIRO_FIN)), pie = sube(g, TOCA - 0.08, TOCA + 0.02);
    const P = GT.enderezar(p, { pie, mira: 0.2 });
    if (pie > 0) { P.beta *= 1 - pie; P.eF *= 1 - pie; P.eR *= 1 - pie; P.fF *= 1 - pie; P.fR *= 1 - pie; }
    P.pos = [0, y, 0];
    GT.poner(G, P);
    const c = V(0, y, 0);
    E.luzEn(V(0, G.alto + 1, 0)); mo(g); po(g - TOCA, c);
    const sac = K.sale(K.tramo(g, TOCA, TOCA + 0.05)) * (1 - K.tramo(g, TOCA + 0.05, TOCA + 0.4));
    vuelo(E, g, [[36.95, V(1.0, 2.3, 7.0), V(0.1, G.alto + 1.1, 0)], [38.3, V(0.8, 1.6, 6.0), V(0.3, G.alto + 0.2, 0)], [39.21, V(0.8, 1.4, 5.6), V(0.3, G.alto + 0.1, 0)]], 1.6);
    E.camera.position.y += 0.04 * sac * Math.sin(g * 140); E.camera.position.x += 0.03 * sac * Math.cos(g * 120);
    E.camera.fov = 36; E.camera.updateProjectionMatrix();
    E.dibuja();
    const s = Math.min(TOCA, Math.max(SUELTA, g)) - SUELTA;
    cu.style.opacity = asoma(g, 36.95).toFixed(3);
    const sp = cu.querySelector("span");
    sp.textContent = s.toFixed(2).replace(".", ",") + " s";
    sp.style.color = g >= TOCA ? VERDE : "#fff";
    E.pon(e1, V(0, G.alto + 1.3, 0), asoma(g, T.medio - 0.1), 0, -60, 1 + 0.1 * (1 - K.sale(K.tramo(g, T.medio - 0.1, T.medio + 0.2))));
  };
  return E;
}

// ── espacio: un astronauta se da la vuelta flotando, girando por mitades como el gato ─────────────────────────────
async function espacioMundo(E) {
  E.scene.background = new tres.Color("#02040a"); E.scene.fog = null;
  E.scene.environmentIntensity = 0.35;
  E.sol.intensity = 3.2; E.sol.color.set("#fff6e8"); E.sol.position.set(-6, 3, 4);
  const rim = new tres.DirectionalLight("#6fa8ff", 1.6); rim.position.set(4, -2, -5); E.scene.add(rim);
  // estrellas
  const n = 1500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = az(i * 3 + 1) * 2 * PI, b = Math.acos(2 * az(i * 3 + 2) - 1), r = 60; pos.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], i * 3); }
  const sg = new tres.BufferGeometry(); sg.setAttribute("position", new tres.BufferAttribute(pos, 3));
  E.scene.add(new tres.Points(sg, new tres.PointsMaterial({ color: "#ffffff", size: 0.12, sizeAttenuation: true })));
  // la Tierra, abajo
  const cargaTex = (u) => new Promise((ok) => new tres.TextureLoader().load(u, (t) => { t.colorSpace = tres.SRGBColorSpace; t.anisotropy = 8; ok(t); }));
  const [mapa, nubes] = await Promise.all([cargaTex("recursos/tierra.jpg"), cargaTex("recursos/tierra-nubes.png")]);
  const tierra = new tres.Mesh(new tres.SphereGeometry(14, 128, 96), new tres.MeshStandardMaterial({ map: mapa, roughness: 0.9 }));
  tierra.position.set(-2.5, -17.6, -9); E.scene.add(tierra);
  const capaN = new tres.Mesh(new tres.SphereGeometry(14.08, 128, 96), new tres.MeshStandardMaterial({ map: nubes, transparent: true, opacity: 0.7, depthWrite: false }));
  capaN.position.copy(tierra.position); E.scene.add(capaN);
  const halo = new tres.Mesh(new tres.SphereGeometry(14.6, 96, 64), new tres.ShaderMaterial({
    transparent: true, depthWrite: false, side: tres.BackSide, blending: tres.AdditiveBlending,
    vertexShader: "varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 p = modelViewMatrix*vec4(position,1.0); vP = p.xyz; gl_Position = projectionMatrix*p; }",
    fragmentShader: "varying vec3 vN; varying vec3 vP; void main(){ float f = pow(1.0 - abs(dot(normalize(-vP), vN)), 3.0); gl_FragColor = vec4(0.35,0.65,1.0,1.0)*f*1.3; }",
  }));
  halo.position.copy(tierra.position); E.scene.add(halo);
  // el astronauta, partido en dos por la cintura (dos copias recortadas por un plano)
  const gl = await new Promise((ok, mal) => new GLTFLoader().load("recursos/astronauta.glb", ok, undefined, mal));
  const cuerpo = new tres.Group(); E.scene.add(cuerpo);
  const CINT = 1.0;                      // la cintura, a esta altura del modelo (mide 2 m)
    const mitades = [true, false].map((sup, k) => {
    const m = gl.scene.clone(true);
    m.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.side = tres.DoubleSide; o.castShadow = false; o.receiveShadow = true;
      // cada copia se queda con su mitad: arriba, el tronco y los brazos enteros (las manos cuelgan por debajo de la cintura)
      o.material.onBeforeCompile = (sh) => {
        sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vM;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvM = position;");
        sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vM;")
          .replace("void main() {", `void main() {\n  bool arriba = vM.y > ${CINT.toFixed(2)} || abs(vM.x) > 0.37;\n  if (arriba != ${sup}) discard;`);
      };
      o.material.customProgramCacheKey = () => "mitad" + sup; } });
    const piv = new tres.Group(); piv.add(m); m.position.y = -CINT; cuerpo.add(piv);
    return { piv, m };
  });
  capasDom(E);
  const e1 = E.etq("<b>1969</b> · Kane y Scher<small>calculan el giro del gato</small>", "y");
  const e2 = E.etq("darse la vuelta <b>sin apoyarse</b>", "v");
  E.paso = (g) => {
    // arriba: cian; abajo: ámbar; giran por turnos, como las dos mitades del gato
    const a1 = 2.3 * sube(g, 40.9, 41.9) + (PI - 2.3) * sube(g, 42.3, 43.4);
    const a2 = -0.45 * sube(g, 40.9, 41.9) + (PI + 0.45) * sube(g, 42.3, 43.4);
    const tinte = asoma(g, 40.6, 43.7);
    const giro = 0.12 * Math.sin(g * 0.6);
    cuerpo.position.set(0.1 * Math.sin(g * 0.5), 1.0 + 0.08 * Math.sin(g * 0.8), 0);
    cuerpo.rotation.set(0.25 + 0.05 * Math.sin(g * 0.7), giro - 0.5 + PI, -0.18 + 0.05 * Math.sin(g * 0.45));
    cuerpo.updateMatrixWorld(true);
    mitades[0].piv.rotation.y = a1; mitades[1].piv.rotation.y = a2;
    mitades[0].m.traverse((o) => { if (o.isMesh) o.material.emissive?.setRGB(0.37 * tinte * 0.14, 0.83 * tinte * 0.14, 1 * tinte * 0.14); });
    mitades[1].m.traverse((o) => { if (o.isMesh) o.material.emissive?.setRGB(1 * tinte * 0.14, 0.71 * tinte * 0.14, 0.28 * tinte * 0.14); });
    tierra.rotation.y = 0.6 + g * 0.02; capaN.rotation.y = 0.6 + g * 0.026;
    vuelo(E, g, [[39.21, V(1.4, 1.7, 5.4), V(0, 0.3, 0)], [41.5, V(-0.5, 1.7, 4.9), V(0, 0.55, 0)], [43.95, V(-1.2, 1.7, 4.6), V(0, 0.8, 0)]], 1.1);
    E.camera.fov = 36; E.camera.updateProjectionMatrix();
    E.dibuja();
    E.pon(e1, { x: 540, y: 1560 }, asoma(g, T.anos - 0.1, 41.6), 0, 0);
    E.pon(e2, { x: 540, y: 1560 }, asoma(g, T.vuelta - 0.2), 0, 0);
  };
  return E;
}

// ── cierre: el gato de pie mira a cámara; «lo imposible» y rebobina hasta el primer fotograma ─────────────────────
function cierreMundo(E) {
  ganchoMundo(E);
  const G = E.G;
  const e1 = E.etq('<b data-layout-allow-occlusion>rompe</b> la física<span class="tacha" data-layout-allow-occlusion></span>', "r g"), e2 = E.etq("la <b>usa</b> mejor que nadie", "v g");
  const vhs = document.createElement("canvas"); vhs.className = "c-2d"; vhs.width = 1080; vhs.height = 1920;
  E.esc.insertBefore(vhs, E.etiquetas[0]);                 // el ruido del vídeo, por debajo de los textos
  const v2 = vhs.getContext("2d");
  const fin = estadoGancho(G, 3.9);
  E.paso = (g) => {
    const gH = ganchoEn(g);
    const cv = E.renderer.domElement;
    if (gH === null) {
      // de pie, como al final del gancho; gira la cabeza hacia la cámara y vuelve
      const mira = sube(g, 44.3, 45.0) - sube(g, 46.9, 47.6);
      const P = GT.postura({ pie: 1, mira: 0.12 + 0.18 * mira, giraCabeza: 0.55 * mira, cola: { curva: 0.6 + 0.25 * Math.sin(g * 1.7), vuelta: 0.35 * Math.sin(g * 1.2) } });
      P.pos = [0, G.alto, 0];
      GT.poner(G, P);
      E.luzEn(V(0, G.alto, 0));
      camino(E, g, [[43.95, V(3.4, 1.8, 8.2), V(0.4, G.alto + 0.1, 0)], [45.6, V(5.0, 1.6, 6.4), V(0.5, G.alto + 0.15, 0)], [REW[0], fin.cam, fin.mira]]);
      E.camera.fov = 36; E.camera.updateProjectionMatrix();
      E.gancho(3.9, g, false);   // las rayas, motas y luz en su sitio; luego se vuelve a poner el gato
      GT.poner(G, P);
      camino(E, g, [[43.95, V(3.4, 1.8, 8.2), V(0.4, G.alto + 0.1, 0)], [45.6, V(5.0, 1.6, 6.4), V(0.5, G.alto + 0.15, 0)], [REW[0], fin.cam, fin.mira]]);
    } else {
      E.gancho(gH, g, false);
    }
    E.dibuja();
    // el rebobinado: rayas de vídeo y «◀◀»
    const r = g >= REW[0] && g < REW[1] ? Math.sin(PI * K.tramo(g, REW[0], REW[1])) ** 0.5 : 0;
    v2.clearRect(0, 0, 1080, 1920);
    if (r > 0.001) {
      const f = Math.floor(g * 30);
      for (let i = 0; i < 9; i++) {
        const y = ((az(f * 9 + i) * 1920 + i * 211) % 1920), h = 6 + 40 * az(f * 13 + i);
        v2.fillStyle = `rgba(255,255,255,${(0.08 + 0.25 * az(f * 7 + i)) * r})`; v2.fillRect(0, y, 1080, h);
      }
      for (let y = 0; y < 1920; y += 6) { v2.fillStyle = `rgba(0,0,0,${0.18 * r})`; v2.fillRect(0, y, 1080, 2); }
      const yb = (g * 2600) % 2200 - 140; v2.fillStyle = `rgba(200,220,255,${0.22 * r})`; v2.fillRect(0, yb, 1080, 90);
    }
    cv.style.transform = r > 0.001 ? `translateX(${(r * 10 * (az(Math.floor(g * 30)) - 0.5)).toFixed(1)}px)` : "";
    cv.style.filter = r > 0.001 ? `saturate(${(1 + 0.5 * r).toFixed(2)}) contrast(${(1 + 0.15 * r).toFixed(2)})` : "";
    E.rew.style.opacity = (r > 0.05 ? (Math.floor(g * 4) % 2 ? 1 : 0.6) * Math.min(1, r * 2) : 0).toFixed(2);
    E.pon(e1, V(0, G.alto + 1.15, 0), asoma(g, T.rompe - 0.1, T.usa - 0.48), 0, -60);
    e1.querySelector(".tacha").style.transform = `scaleX(${K.sale(K.tramo(g, T.rompe + 0.25, T.fisica + 0.3)).toFixed(3)})`;
    E.pon(e2, V(0, G.alto + 1.15, 0), asoma(g, T.usa - 0.1, REW[0] - 0.3), 0, -60);
  };
  return E;
}

// ── la escena: monta su mundo y lo dibuja en su segundo ────────────────────────────────────────────────────────────
const MUNDOS = { hook: null, regla: reglaMundo, fotos: fotosMundo, truco: trucoMundo, patinadora: patinadoraMundo, oido: oidoMundo, espacio: espacioMundo, cierre: cierreMundo };
export async function escenario(esc, nombre) {
  const E = montaje(esc);
  const g0 = G0[nombre];
  if (nombre === "hook") {
    ganchoMundo(E);
    E.paso = (g) => { E.gancho(g, g); E.dibuja(); };
  } else await MUNDOS[nombre](E);
  const paso = E.paso;
  // El mismo segundo da el mismo fotograma: no se vuelve a pintar (sin GPU cada fotograma cuesta medio segundo).
  let ultimo = NaN;
  return { paso: (s) => { if (s === ultimo) return; ultimo = s; paso(g0 + s); }, E };
}
