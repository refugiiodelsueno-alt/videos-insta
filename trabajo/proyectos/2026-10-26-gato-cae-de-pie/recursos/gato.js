// Un gato de verdad, en 3D: mallas suaves que se deforman en cada fotograma (el cuerpo se dobla por la cintura y gira
// por mitades, las patas se encogen y se estiran, la cola se mueve), con piel de terciopelo, ojos de cristal, orejas
// huecas y bigotes. No hay un gato animable libre, así que se modela aquí, pieza a pieza. Mismo segundo, mismo dibujo.
import * as tres from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

const PI = Math.PI;
export const S = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
export const mez = (a, b, u) => a + (b - a) * u;

// ── vectores ────────────────────────────────────────────────────────────────────────────────────────────────────
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lin = (...p) => { const r = [0, 0, 0]; for (let i = 0; i < p.length; i += 2) { r[0] += p[i][0] * p[i + 1]; r[1] += p[i][1] * p[i + 1]; r[2] += p[i][2] * p[i + 1]; } return r; };
export const mezv = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
// gira v alrededor del eje ax (unitario) un ángulo a
export function giro(v, ax, a) {
  const c = Math.cos(a), s = Math.sin(a), k = dot(ax, v) * (1 - c), x = cross(ax, v);
  return [v[0] * c + x[0] * s + ax[0] * k, v[1] * c + x[1] * s + ax[1] * k, v[2] * c + x[2] * s + ax[2] * k];
}
// una rotación como tres ejes: R(v) = v.x·X + v.y·Y + v.z·Z
export const ejes = (X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1]) => ({ X, Y, Z });
export const rotY = (a) => ejes([Math.cos(a), 0, -Math.sin(a)], [0, 1, 0], [Math.sin(a), 0, Math.cos(a)]);
export const rotZ = (a) => ejes([Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]);
export const rotX = (a) => ejes([1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
export const aplica = (R, v) => lin(R.X, v[0], R.Y, v[1], R.Z, v[2]);
export const compon = (A, B) => ejes(aplica(A, B.X), aplica(A, B.Y), aplica(A, B.Z));
const base3 = (m, X, Y, Z) => m.makeBasis(new tres.Vector3(...X), new tres.Vector3(...Y), new tres.Vector3(...Z));

// un poco de azar fijo, para que la piel no sea plástico
const ruido = (i, j, s = 0) => { const x = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return x - Math.floor(x) - 0.5; };
const perfil = (tab, x) => {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) { const u = (x - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]); return mez(tab[i - 1][1], tab[i][1], u * u * (3 - 2 * u)); }
  return tab[tab.length - 1][1];
};
// marcos que siguen a una línea de puntos sin girar sobre sí mismos (patas, cola, cuello)
function marcos(pts, ref) {
  const F = [];
  let d = null;
  for (let i = 0; i < pts.length; i++) {
    const T = nrm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)]));
    d = nrm(sub(d || ref, mul(T, dot(d || ref, T))));
    F.push({ T, d, l: cross(T, d) });
  }
  return F;
}
// una curva suave por los puntos de una cadena (Catmull-Rom), con m puntos por tramo
function suaviza(J, m) {
  const out = [];
  for (let i = 0; i < J.length - 1; i++) {
    const p0 = J[Math.max(i - 1, 0)], p1 = J[i], p2 = J[i + 1], p3 = J[Math.min(i + 2, J.length - 1)];
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t;
      out.push(lin(p0, -0.5 * t3 + t2 - 0.5 * t, p1, 1.5 * t3 - 2.5 * t2 + 1, p2, -1.5 * t3 + 2 * t2 + 0.5 * t, p3, 0.5 * t3 - 0.5 * t2));
    }
  }
  out.push(J[J.length - 1]);
  return out;
}

// ── el pelaje (sRGB) ────────────────────────────────────────────────────────────────────────────────────────────
export const NAR = [0.95, 0.56, 0.24], OSC = [0.6, 0.27, 0.1], CREMA = [0.98, 0.93, 0.85], ROSA = [0.95, 0.62, 0.64];
const lineal = (c) => c.map((x) => Math.pow(Math.max(0, x), 2.2));
const col3 = (arr, i, c, k = 1) => { const l = lineal(c); arr[i * 3] = l[0] * k; arr[i * 3 + 1] = l[1] * k; arr[i * 3 + 2] = l[2] * k; };
const angulo = (th) => { let a = th % (2 * PI); if (a > PI) a -= 2 * PI; if (a < -PI) a += 2 * PI; return a; };
function pelajeCuerpo(x, th) {
  const cd = Math.cos(th), a = angulo(th);
  const panza = S(-0.15, -0.65, cd) * S(4, 12, x);
  const fase = x * 0.62 + 1.25 * (1 - cd);
  const raya = S(0.15, 0.75, Math.sin(fase)) * S(-0.5, 0.25, cd) * S(2.5, 6, x) * (1 - S(38, 41, x));
  const lomo = Math.exp(-(a * a) / 0.08) * 0.7 * S(3, 8, x) * (1 - S(37, 41, x));
  const pecho = S(-0.2, -0.8, cd) * S(32, 38, x);
  return mezv(mezv(NAR, OSC, Math.max(raya * 0.9, lomo)), CREMA, Math.max(panza, pecho));
}

export function piel(o = {}) {
  return new tres.MeshPhysicalMaterial(Object.assign({ vertexColors: true, roughness: 0.82, metalness: 0, sheen: 1, sheenRoughness: 0.42, sheenColor: new tres.Color("#ffd2a0") }, o));
}

// ── un tubo de anillos que se deforma: cada fotograma se le dan nA anillos { c, d, l, ry, rz } ──────────────────────
// (centro, eje de arriba, eje de lado, radios); col(i, th) pinta una vez. th = 0 por arriba.
class Tubo {
  constructor(padre, nA, nL, material, col, o = {}) {
    this.nA = nA; this.nL = nL;
    const nv = nA * nL + 2;
    const g = new tres.BufferGeometry();
    this.pos = new Float32Array(nv * 3);
    g.setAttribute("position", new tres.BufferAttribute(this.pos, 3));
    const colr = new Float32Array(nv * 3);
    const idx = [];
    for (let i = 0; i < nA - 1; i++) for (let j = 0; j < nL; j++) {
      const a = i * nL + j, b = i * nL + ((j + 1) % nL), c = (i + 1) * nL + j, d = (i + 1) * nL + ((j + 1) % nL);
      idx.push(a, b, c, b, d, c);
    }
    const s0 = nA * nL, s1 = s0 + 1;
    for (let j = 0; j < nL; j++) {
      idx.push(s0, (j + 1) % nL, j);
      idx.push(s1, (nA - 1) * nL + j, (nA - 1) * nL + ((j + 1) % nL));
    }
    g.setIndex(idx);
    for (let i = 0; i < nA; i++) for (let j = 0; j < nL; j++) {
      const k = (i * nL + j) * 3, cc = lineal(col(i, (2 * PI * j) / nL)), r = 1 + 0.08 * ruido(i, j, o.semilla || 0);
      colr[k] = cc[0] * r; colr[k + 1] = cc[1] * r; colr[k + 2] = cc[2] * r;
    }
    const c0 = lineal(col(0, PI)), c1 = lineal(col(nA - 1, PI));
    colr.set(c0, s0 * 3); colr.set(c1, s1 * 3);
    g.setAttribute("color", new tres.BufferAttribute(colr, 3));
    if (o.grupos) for (const [desde, hasta, m] of o.grupos) g.addGroup(desde * nL * 6, (hasta - desde) * nL * 6, m);
    this.geo = g;
    this.malla = new tres.Mesh(g, material);
    this.malla.castShadow = true;
    this.malla.receiveShadow = true;
    this.malla.frustumCulled = false;
    padre.add(this.malla);
  }
  poner(A) {
    const p = this.pos, nL = this.nL;
    for (let i = 0; i < this.nA; i++) {
      const r = A[i];
      for (let j = 0; j < nL; j++) {
        const th = (2 * PI * j) / nL, cy = Math.cos(th) * r.ry, sz = Math.sin(th) * r.rz, k = (i * nL + j) * 3;
        p[k] = r.c[0] + r.d[0] * cy + r.l[0] * sz;
        p[k + 1] = r.c[1] + r.d[1] * cy + r.l[1] * sz;
        p[k + 2] = r.c[2] + r.d[2] * cy + r.l[2] * sz;
      }
    }
    const a = A[0], b = A[this.nA - 1], s0 = this.nA * nL * 3;
    const ta = nrm(sub(A[1].c, a.c)), tb = nrm(sub(b.c, A[this.nA - 2].c));
    p.set(lin(a.c, 1, ta, -Math.min(a.ry, a.rz) * 0.5), s0);
    p.set(lin(b.c, 1, tb, Math.min(b.ry, b.rz) * 0.5), s0 + 3);
    this.geo.attributes.position.needsUpdate = true;
    this.geo.computeVertexNormals();
  }
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// La postura del gato.
//   beta: lo que se dobla por la cintura (rad; la V con la punta hacia abajo)
//   fF, fR: el giro de la mitad de delante y de la de atrás sobre su propio eje (0 de pie, PI boca arriba)
//   eF, eR: lo encogidas que van las patas de delante y de atrás (0 estiradas, 1 encogidas)
//   pie: 0 en el aire (patas abiertas), 1 de pie en el suelo
//   cabeza: lo que la cabeza va por delante en el giro (rad); mira: cuánto baja el morro; giraCabeza: mirar a un lado
//   cola: { curva, vuelta } ; pasos: [delante izq, delante der, atrás izq, atrás der] cuánto levanta cada pata
//   R, pos: cómo está el gato entero en el mundo ; tinteF, tinteR: [r, g, b, k] para teñir cada mitad
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
export const LC = 42;
export function postura(o = {}) {
  return Object.assign({ beta: 0, fF: 0, fR: 0, eF: 0, eR: 0, pie: 0, cabeza: 0, mira: 0.2, giraCabeza: 0, cola: { curva: 0.6, vuelta: 0 }, pasos: [0, 0, 0, 0], R: ejes(), pos: [0, 0, 0], tinteF: null, tinteR: null }, o);
}
// el giro de verdad, de boca arriba (p = 0) a de pie (p = 1)
export function enderezar(p, o = {}) {
  const beta = 0.78 * S(0.0, 0.14, p) * (1 - 0.85 * S(0.8, 1, p));
  const fF = PI - PI * S(0.12, 0.42, p) - 0.22 * S(0.55, 0.78, p) * (1 - S(0.84, 1, p));
  const fR = PI + 0.42 * S(0.14, 0.42, p) - (PI + 0.42) * S(0.5, 0.86, p);
  const eF = S(0.02, 0.12, p) * (1 - S(0.44, 0.58, p));
  const eR = S(0.44, 0.58, p) * (1 - S(0.8, 0.95, p));
  const cabeza = 0.7 * S(0.02, 0.14, p) * (1 - S(0.3, 0.46, p));
  const cola = { curva: 0.55 + 0.35 * Math.sin(p * 5), vuelta: 0.5 * Math.sin(p * 6.3) };
  return postura(Object.assign({ beta, fF, fR, eF, eR, cabeza, mira: 0.15 + 0.25 * S(0.1, 0.5, p), cola }, o));
}

// el centro de la columna en x (de la grupa, 0, al pecho, LC), y su marco
function columna(P) {
  const W = [0, 0, 0], b = P.beta, aF = [Math.cos(b / 2), Math.sin(b / 2), 0], aR = [-Math.cos(b / 2), Math.sin(b / 2), 0];
  const bl = 7;
  const centro = (x) => {
    const s = x - LC / 2;
    if (s <= -bl) return mul(aR, -s);
    if (s >= bl) return mul(aF, s);
    const t = (s + bl) / (2 * bl), A = mul(aR, bl), B = mul(aF, bl);
    return lin(A, (1 - t) * (1 - t), W, 2 * t * (1 - t), B, t * t);
  };
  const marco = (x, giroExtra = 0) => {
    const T = nrm(sub(centro(x + 0.05), centro(x - 0.05)));
    const arriba = nrm(sub([0, 1, 0], mul(T, T[1])));
    const lado = cross(T, arriba);
    const f = mez(P.fR, P.fF, S(LC * 0.3, LC * 0.7, x)) + giroExtra;
    const c = Math.cos(f), s = Math.sin(f);
    return { T, d: lin(arriba, c, lado, s), l: lin(lado, c, arriba, -s) };
  };
  return { centro, marco };
}
const RY = [[0, 0.6], [1.5, 4.2], [5, 6.7], [10, 7.3], [16, 6.4], [21, 6.0], [26, 6.6], [31, 7.8], [36, 7.6], [39.5, 6.0], [42, 2.0]];
const ANCHO = [[0, 0.88], [10, 0.86], [21, 0.8], [31, 0.74], [42, 0.8]];

// las direcciones de cada tramo de una pata, en el marco de su mitad (T hacia la cabeza, d arriba, l al lado)
const LARGO_D = [9.5, 9.5, 3.8], LARGO_A = [11, 10.5, 7, 3.6];
function direccionesPata(delante, lado, e, pie, alza) {
  const D = (t, d, l) => [t, d, l * lado];
  let aire, enc, suelo;
  if (delante) {
    aire = [D(0.35, -1, 0.35), D(0.25, -1, 0.2), D(0.7, -0.5, 0.05)];
    enc = [D(-0.5, -0.8, 0.12), D(1, 0.45, -0.05), D(0.2, 1, 0)];
    suelo = [D(-0.28, -1, 0.04), D(0.06, -1, 0), D(1, -0.1, 0)];
  } else {
    aire = [D(0.45, -0.8, 0.35), D(-0.55, -0.8, 0.2), D(-0.1, -1, 0.06), D(0.6, -0.6, 0)];
    enc = [D(1, -0.45, 0.12), D(-1, -0.2, 0.05), D(0.1, -1, 0), D(1, 0, 0)];
    suelo = [D(0.55, -0.8, 0.04), D(-0.6, -0.65, 0.02), D(0.08, -1, 0), D(1, -0.1, 0)];
  }
  const k = Math.min(1, e + alza * 0.55);
  return aire.map((a, i) => mezv(mezv(a, enc[i], k), suelo[i], pie * (1 - k)));
}
const RAD_D = [[0, 2.0], [0.12, 3.8], [0.2, 3.6], [0.42, 2.5], [0.62, 2.05], [0.78, 1.9], [0.88, 2.15], [0.96, 1.7], [1, 0.35]];
const RAD_A = [[0, 2.6], [0.1, 4.9], [0.18, 4.6], [0.38, 3.1], [0.5, 2.1], [0.68, 1.75], [0.84, 1.75], [0.92, 2.0], [0.97, 1.6], [1, 0.35]];

// ── la cabeza: una esfera deformada con mejillas, morro, almohadillas de los bigotes, barbilla y cuencas ──────────
// en su sitio: x hacia el morro, y arriba, z al lado
const BUL = [
  [[0.35, -0.45, 0.82], 1.15, 0.05], [[0.35, -0.45, -0.82], 1.15, 0.05],
  [[1, -0.42, 0], 1.75, 0.03],
  [[1, -0.33, 0.34], 0.95, 0.018], [[1, -0.33, -0.34], 0.95, 0.018],
  [[0.72, -0.7, 0], 0.55, 0.03],
  [[0.86, 0.3, 0], 0.25, 0.04],
  [[0.78, 0.26, 0.56], -0.55, 0.012], [[0.78, 0.26, -0.56], -0.55, 0.012],
  [[-0.6, -0.5, 0], 0.6, 0.12],
].map(([d, a, w]) => [nrm(d), a, w]);
export function radioCabeza(n) {
  let r = 1 / Math.sqrt((n[0] / 5.5) ** 2 + (n[1] / 5.0) ** 2 + (n[2] / 6.0) ** 2);
  for (const [d, a, w] of BUL) r += a * Math.exp(-(1 - dot(n, d)) / w);
  return r;
}
// un punto de la superficie de la cabeza en la dirección (x, y, z), metido "dentro" hacia el centro
export function sobreCabeza(x, y, z, dentro = 0) { const n = nrm([x, y, z]); return mul(n, radioCabeza(n) - dentro); }
const OJO = [nrm([0.78, 0.26, 0.56]), nrm([0.78, 0.26, -0.56])];
function colorCabeza(n) {
  const az = Math.abs(n[2]);
  const frente = S(0.15, 0.75, Math.sin(n[2] * 15 + PI / 2)) * S(0.42, 0.7, n[1]) * S(-0.35, 0.2, n[0]) * (1 - S(0.6, 0.85, n[0]));
  const mejilla = S(0.2, 0.8, Math.sin(n[0] * 11 + n[1] * 7 + 0.5)) * S(0.6, 0.85, az) * S(-0.45, 0.0, n[0]) * (1 - S(0.4, 0.75, n[0])) * (1 - S(0.3, 0.6, n[1]));
  const nuca = S(0.2, 0.8, Math.sin(n[0] * 13 + 2)) * S(-0.15, -0.5, n[0]) * S(-0.3, 0.2, n[1]);
  let c = mezv(NAR, OSC, Math.max(frente, mejilla, nuca) * 0.88);
  const morro = Math.exp(-(1 - dot(n, nrm([1, -0.5, 0]))) / 0.07);
  const almohadilla = Math.max(Math.exp(-(1 - dot(n, nrm([1, -0.33, 0.34]))) / 0.03), Math.exp(-(1 - dot(n, nrm([1, -0.33, -0.34]))) / 0.03));
  const barbilla = S(-0.45, -0.8, n[1]) * S(-0.2, 0.3, n[0]);
  c = mezv(c, CREMA, Math.min(1, Math.max(morro * 1.5, almohadilla * 1.2, barbilla)));
  // el borde de los ojos, oscuro, y un halo claro alrededor
  for (const e of OJO) {
    const a = 1 - dot(n, e);
    c = mezv(c, CREMA, S(0.03, 0.07, a) * (1 - S(0.09, 0.14, a)) * 0.2);
  }
  return c;
}
function geoCabeza() {
  let g = new tres.SphereGeometry(1, 120, 90);
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  g = mergeVertices(g);
  const p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const n = nrm([p.getX(i), p.getY(i), p.getZ(i)]), r = radioCabeza(n);
    p.setXYZ(i, n[0] * r, n[1] * r, n[2] * r);
    const c = lineal(colorCabeza(n)), k = 1 + 0.06 * ruido(i, 3, 5);
    col.set([c[0] * k, c[1] * k, c[2] * k], i * 3);
  }
  g.setAttribute("color", new tres.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}
// un ojo: esfera con el iris verde, la pupila abierta (está cayendo) y la parte de atrás oscura; mira hacia +z
function geoOjo(r) {
  const g = new tres.SphereGeometry(r, 48, 36), p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / r, y = p.getY(i) / r, z = p.getZ(i) / r, rr = Math.hypot(x, y);
    let c = [0.05, 0.04, 0.03];
    if (z > 0.3) {
      c = mezv([0.86, 0.82, 0.25], [0.3, 0.55, 0.14], S(0.25, 0.85, rr));
      c = mezv(c, [0.12, 0.2, 0.06], S(0.82, 0.95, rr));
      const pu = (x / 0.36) ** 2 + (y / 0.62) ** 2;
      c = mezv(c, [0.01, 0.01, 0.015], S(1.08, 0.92, pu));
    }
    col.set(lineal(c), i * 3);
  }
  g.setAttribute("color", new tres.BufferAttribute(col, 3));
  return g;
}
// una oreja: concha fina con el hueco rosa hacia +x, de la base (y = 0) a la punta (y = alto)
function geoOreja(alto = 4.8, ancho = 2.7) {
  const nA = 24, nL = 18, pos = [], col = [], idx = [];
  for (let i = 0; i <= nA; i++) {
    const h = i / nA, w = ancho * Math.pow(1 - h, 0.85) + 0.05, atras = -0.9 * h * h;
    for (let j = 0; j < nL; j++) {
      const a = (2 * PI * j) / nL, s = Math.cos(a), delante = Math.sin(a) > 0, prof = Math.sqrt(Math.max(0, 1 - s * s));
      const x = atras - w * prof * (delante ? 0.3 : 0.48) + (delante ? 0.05 : 0);
      pos.push(x, h * alto, w * s);
      const rosa = delante && Math.abs(s) < 0.8 && h < 0.86 ? S(0.8, 0.55, Math.abs(s)) * (1 - S(0.7, 0.86, h)) : 0;
      const pelo = delante ? S(0.0, 0.25, h) * 0.25 : 0;
      col.push(...lineal(mezv(mezv(NAR, ROSA, rosa), CREMA, pelo * rosa)));
    }
  }
  for (let i = 0; i < nA; i++) for (let j = 0; j < nL; j++) {
    const a = i * nL + j, b = i * nL + ((j + 1) % nL), c = (i + 1) * nL + j, d = (i + 1) * nL + ((j + 1) % nL);
    idx.push(a, c, b, b, c, d);
  }
  const g = new tres.BufferGeometry();
  g.setAttribute("position", new tres.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new tres.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ── el gato: se crea una vez y se pone en cada fotograma con poner(P) ───────────────────────────────────────────
export function crearGato(escena, o = {}) {
  const escala = o.escala || 0.05;
  const raiz = new tres.Group(), grupo = new tres.Group();
  grupo.scale.setScalar(escala);
  raiz.add(grupo);
  escena.add(raiz);
  const matF = piel(), matR = piel();
  const G = { raiz, grupo, escala, matF, matR };
  const nB = 85, nLB = 48;
  G.cuerpo = new Tubo(grupo, nB, nLB, [matR, matF], (i, th) => pelajeCuerpo((LC * i) / (nB - 1), th), { semilla: 1, grupos: [[0, 42, 0], [42, nB - 1, 1]] });
  const colPata = (n, delante) => (i, th) => {
    const u = i / (n - 1), blanco = S(delante ? 0.7 : 0.78, delante ? 0.8 : 0.88, u);
    const anillo = S(0.3, 0.8, Math.sin(u * 24)) * S(0.08, 0.2, u) * (1 - S(0.6, 0.72, u)) * 0.75 * S(-0.4, 0.4, Math.cos(th));
    return mezv(mezv(NAR, OSC, anillo), CREMA, Math.max(blanco, S(-0.4, -0.9, Math.cos(th)) * 0.5 * (1 - S(0.2, 0.4, u))));
  };
  G.patas = [
    [true, -1, matF], [true, 1, matF], [false, -1, matR], [false, 1, matR],
  ].map(([delante, lado, m], k) => {
    const n = delante ? 37 : 46;
    return { delante, lado, tubo: new Tubo(grupo, n, 22, m, colPata(n, delante), { semilla: 20 + k }) };
  });
  G.cola = new Tubo(grupo, 46, 18, matR, (i, th) => {
    const u = i / 45;
    return mezv(NAR, OSC, Math.max(S(0.1, 0.7, Math.sin(u * 30)) * 0.85 * S(0.05, 0.15, u), S(0.86, 0.93, u)));
  }, { semilla: 7 });
  {
    const g = new tres.SphereGeometry(1, 64, 40), p = g.attributes.position, cc = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) col3(cc, i, mezv(NAR, CREMA, S(-0.15, -0.6, p.getY(i)) * S(-0.6, 0.2, p.getX(i))), 1 + 0.06 * ruido(i, 9));
    g.setAttribute("color", new tres.BufferAttribute(cc, 3));
    G.cuello = new tres.Mesh(g, matF);
    G.cuello.castShadow = G.cuello.receiveShadow = true;
    G.cuello.matrixAutoUpdate = false;
    grupo.add(G.cuello);
  }
  // la cabeza
  const cab = new tres.Group();
  cab.matrixAutoUpdate = false;
  grupo.add(cab);
  const malla = (geo, mat) => { const m = new tres.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; cab.add(m); return m; };
  malla(geoCabeza(), matF);
  const matOjo = new tres.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03 });
  const gOjo = geoOjo(1.75);
  const matOr = piel(); matOr.side = tres.DoubleSide;
  const matPar = new tres.MeshStandardMaterial({ color: "#3a1d0e", roughness: 0.55 });
  for (const s of [-1, 1]) {
    const ojo = malla(gOjo, matOjo);
    ojo.position.set(...sobreCabeza(0.78, 0.26, 0.56 * s, 1.15));
    ojo.quaternion.setFromUnitVectors(new tres.Vector3(0, 0, 1), new tres.Vector3(...nrm([1.25, 0.12, 0.62 * s])));
    ojo.castShadow = false;
    const par = malla(new tres.TorusGeometry(1.36, 0.17, 16, 64), matPar);
    par.position.copy(ojo.position).add(new tres.Vector3(...nrm([1.25, 0.12, 0.62 * s])).multiplyScalar(1.22));
    par.quaternion.copy(ojo.quaternion);
    par.scale.set(1, 0.92, 1);
    // la oreja
    const or = malla(geoOreja(3.9, 3.0), matOr);
    or.position.set(...sobreCabeza(-0.05, 0.84, 0.52 * s, 0.9));
    const up = nrm([-0.18, 1, 0.48 * s]);
    let fr = nrm([1, 0.1, 0.22 * s]);
    fr = nrm(sub(fr, mul(up, dot(fr, up))));
    base3(or.matrix, fr, up, cross(fr, up));
    or.matrixAutoUpdate = false;
    or.matrix.setPosition(or.position);
    // los bigotes
    const matBig = new tres.MeshStandardMaterial({ color: "#fffaf0", roughness: 0.4, transparent: true, opacity: 0.9 });
    for (let k = 0; k < 4; k++) {
      const a = sobreCabeza(1, -0.33 + (k - 1.5) * 0.05, 0.34 * s, 0.15);
      const pts = [a, lin(a, 1, [0.6 - k * 0.25, 0.45 - k * 0.35, 4 * s], 1), lin(a, 1, [0.2 - k * 0.5, -0.2 - k * 0.9, 9 * s], 1)].map((v) => new tres.Vector3(...v));
      const b = new tres.Mesh(new tres.TubeGeometry(new tres.CatmullRomCurve3(pts), 16, 0.06, 5), matBig);
      cab.add(b);
    }
  }
  const nariz = malla(new tres.SphereGeometry(1, 24, 16), new tres.MeshPhysicalMaterial({ color: "#d9868c", roughness: 0.45, clearcoat: 0.4 }));
  nariz.position.set(...sobreCabeza(1, -0.3, 0, 0.35));
  nariz.scale.set(0.55, 0.55, 0.85);
  const matBoca = new tres.MeshStandardMaterial({ color: "#5a2a1c", roughness: 0.8 });
  for (const s of [-1, 1]) {
    const pts = [[1, -0.42, 0], [1, -0.5, 0], [1, -0.52, 0.12 * s], [1, -0.48, 0.24 * s]].map(([x, y, z]) => new tres.Vector3(...sobreCabeza(x, y, z, -0.02)));
    cab.add(new tres.Mesh(new tres.TubeGeometry(new tres.CatmullRomCurve3(pts), 12, 0.11, 5), matBoca));
  }
  G.cab = cab;
  G.matOr = matOr;
  return G;
}

// ── poner el gato en una postura ────────────────────────────────────────────────────────────────────────────────
export function poner(G, P) {
  G.raiz.position.set(...P.pos);
  const m = base3(new tres.Matrix4(), P.R.X, P.R.Y, P.R.Z);
  G.raiz.quaternion.setFromRotationMatrix(m);
  const col = columna(P), { centro, marco } = col;
  // el cuerpo
  const A = [];
  for (let i = 0; i < G.cuerpo.nA; i++) {
    const x = (LC * i) / (G.cuerpo.nA - 1), c = centro(x), mm = marco(x), ry = perfil(RY, x);
    A.push({ c: lin(c, 1, mm.d, -0.7 * S(10, 30, x) * (1 - S(33, 40, x))), d: mm.d, l: mm.l, ry, rz: ry * perfil(ANCHO, x) });
  }
  G.cuerpo.poner(A);
  // las patas
  for (const [k, pa] of G.patas.entries()) {
    const xr = pa.delante ? 34 : 8, c = centro(xr), mm = marco(xr), ry = perfil(RY, xr), rz = ry * perfil(ANCHO, xr);
    const raiz = lin(c, 1, mm.d, pa.delante ? -0.1 * ry : 0, mm.l, rz * (pa.delante ? 0.5 : 0.42) * pa.lado, mm.T, pa.delante ? 0 : -0.5);
    const largos = pa.delante ? LARGO_D : LARGO_A;
    const dirs = direccionesPata(pa.delante, pa.lado, pa.delante ? P.eF : P.eR, P.pie, P.pasos[k]);
    const J = [lin(raiz, 1, mm.d, ry * 0.42, mm.l, -rz * 0.35 * pa.lado), raiz];
    let q = raiz;
    dirs.forEach((dd, i) => { q = add(q, mul(nrm(lin(mm.T, dd[0], mm.d, dd[1], mm.l, dd[2])), largos[i])); J.push(q); });
    const pts = suaviza(J, 9), F = marcos(pts, mm.T), n = pts.length, rad = pa.delante ? RAD_D : RAD_A;
    pa.tubo.poner(pts.map((p, i) => { const u = i / (n - 1), r = perfil(rad, u); return { c: p, d: F[i].d, l: F[i].l, ry: r, rz: r * (u > 0.85 ? 1.15 : 1) }; }));
  }
  // la cola
  {
    const c = centro(1.6), mm = marco(1.6), ry = perfil(RY, 1.6);
    const atras = mul(mm.T, -1), pl = giro(mm.l, atras, P.cola.vuelta || 0);
    const pts = [];
    let q = lin(c, 1, mm.d, ry * 0.3, mm.T, 1.2), dir = nrm(lin(atras, 1, mm.d, 0.35));
    for (let i = 0; i < G.cola.nA; i++) {
      pts.push(q);
      dir = nrm(giro(dir, pl, (P.cola.curva || 0) * 0.045 * (1 + 0.6 * Math.sin(i * 0.15))));
      q = add(q, mul(dir, 0.72));
    }
    const F = marcos(pts, mm.d);
    G.cola.poner(pts.map((p, i) => { const u = i / (pts.length - 1), r = mez(2.7, 1.4, u) * (u > 0.94 ? 0.25 + 0.75 * S(1.0, 0.94, u) : 1) * (0.55 + 0.45 * S(0, 0.06, u)); return { c: p, d: F[i].d, l: F[i].l, ry: r, rz: r }; }));
  }
  // el cuello y la cabeza
  const x0 = LC - 3, c = centro(x0), mc = marco(x0, P.cabeza);
  const cm = Math.cos(P.mira), sm = Math.sin(P.mira);
  let f = lin(mc.T, cm, mc.d, -sm), d = lin(mc.d, cm, mc.T, sm), l = mc.l;
  if (P.giraCabeza) { f = giro(f, d, P.giraCabeza); l = giro(l, d, P.giraCabeza); }
  const H = lin(c, 1, mc.T, 6.2, mc.d, 4);
  {
    const a = lin(c, 1, mc.d, 0.8, mc.T, -1.5), b = lin(H, 1, f, -1.8, d, -0.6), ex = nrm(sub(b, a));
    const ey = nrm(sub(mc.d, mul(ex, dot(mc.d, ex)))), m = G.cuello.matrix, L = Math.hypot(...sub(b, a));
    base3(m, mul(ex, L / 2 + 4.2), mul(ey, 5.6), mul(cross(ex, ey), 5.0));
    m.setPosition(...lin(a, 0.5, b, 0.5));
    G.cuello.matrixWorldNeedsUpdate = true;
  }
  base3(G.cab.matrix, f, d, l);
  G.cab.matrix.setPosition(...H);
  G.cab.matrixWorldNeedsUpdate = true;
  // el tinte de cada mitad
  for (const [mat, t] of [[G.matF, P.tinteF], [G.matOr, P.tinteF], [G.matR, P.tinteR]]) {
    if (t && t[3] > 0) mat.emissive.setRGB(t[0] * t[3] * 0.55, t[1] * t[3] * 0.55, t[2] * t[3] * 0.55);
    else mat.emissive.setRGB(0, 0, 0);
  }
}

// dónde queda en el mundo un punto del gato: x a lo largo de la columna, y alto/lado en su marco
export function puntoGato(G, P, x, alto = 0, lado = 0) {
  const col = columna(P), c = col.centro(x), m = col.marco(x);
  return add(P.pos, aplica(P.R, mul(lin(c, 1, m.d, alto, m.l, lado), G.escala)));
}
// el marco de la columna en x, en el mundo: { T, d, l }
export function marcoGato(G, P, x) {
  const m = columna(P).marco(x);
  return { T: aplica(P.R, m.T), d: aplica(P.R, m.d), l: aplica(P.R, m.l) };
}
