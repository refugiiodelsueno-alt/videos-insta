// Kit 3D: objetos reales con luz, sombras y una cámara que se mueve sin tirones. Cómo se usa: references/escenas.md.
// El tiempo lo manda el timeline de la escena: cada fotograma se dibuja desde su segundo, nunca con un reloj.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export { RoundedBoxGeometry };
export const tres = THREE;

export function estudio(sel, o = {}) {
  const canvas = typeof sel === "string" ? document.querySelector(sel) : sel;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !o.fondo, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(o.ancho || 1080, o.alto || 1920, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposicion || 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  if (o.fondo) scene.background = new THREE.Color(o.fondo);
  if (o.niebla !== false && o.fondo) scene.fog = new THREE.Fog(o.fondo, o.nieblaDesde || 18, o.nieblaHasta || 45);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = o.ambiente ?? 0.7;
  const camera = new THREE.PerspectiveCamera(o.lente || 32, (o.ancho || 1080) / (o.alto || 1920), 0.05, 400);
  camera.position.set(6, 3, 10);
  // Luz principal desde arriba y un relleno, para que nada salga como un recorte negro.
  const sol = new THREE.DirectionalLight(0xffffff, o.luz ?? 2.4);
  sol.position.set(4, 10, 6);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 0.5, far: 60 });
  sol.shadow.radius = 6;
  scene.add(sol, new THREE.HemisphereLight(0xdfe8ff, 0x20242a, 0.6));
  // Suelo que solo recoge la sombra (se puede quitar con suelo: false).
  if (o.suelo !== false) {
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), o.sueloColor ? new THREE.MeshStandardMaterial({ color: o.sueloColor, roughness: 0.9 }) : new THREE.ShadowMaterial({ opacity: 0.35 }));
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    scene.add(suelo);
  }
  const mira = new THREE.Vector3(0, 0.5, 0);
  const pasos = [];
  const E = {
    tres: THREE, scene, camera, renderer, sol, mira,
    dibujar(t = 0) { for (const p of pasos) p(t); camera.lookAt(mira); renderer.render(scene, camera); },
    // Lo que cambia con el tiempo de la escena: f(t) se llama en cada fotograma, con t en segundos.
    cada(tl, D, f) {
      pasos.push(f);
      const reloj = { t: 0 };
      tl.fromTo(reloj, { t: 0 }, { t: D, duration: D, ease: "none", onUpdate: () => E.dibujar(reloj.t) }, 0);
    },
    sombras(obj) { obj.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return obj; },
  };
  return E;
}

// Materiales de verdad, listos para usar.
export const mat = {
  pintura: (color = "#e9ecef") => new THREE.MeshPhysicalMaterial({ color, metalness: 0.6, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }),
  metal: (color = "#c9ccd1") => new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.25 }),
  cristal: (color = "#9fb7c8") => new THREE.MeshPhysicalMaterial({ color, metalness: 0, roughness: 0.05, transmission: 0.9, thickness: 0.4, ior: 1.45 }),
  goma: () => new THREE.MeshStandardMaterial({ color: "#151618", roughness: 0.85 }),
  plastico: (color = "#2b2f36") => new THREE.MeshStandardMaterial({ color, roughness: 0.5 }),
  luz: (color = "#7fd3ff", fuerza = 3) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: fuerza }),
};

// Un modelo .glb o .gltf de recursos/. Bájalo antes de montar (nunca durante el render) y comprueba su licencia.
export function cargar(E, url, escala = 1) {
  return new Promise((ok, mal) => new GLTFLoader().load(url, (g) => { g.scene.scale.setScalar(escala); E.sombras(g.scene); E.scene.add(g.scene); ok(g.scene); }, undefined, mal));
}

// ---- Movimiento fluido, para cualquier escena 3D -----------------------------------------------------------------
// Nada arranca ni para de golpe: la velocidad cambia poco a poco salvo en un choque. revisar.mjs mide los tirones.
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
// 0 → 1 entre a y b, con arranque y frenada suaves.
export const suave = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };

// La cámara pasa por puntos [segundo, posición, adonde mira] sin pararse en cada uno: la velocidad es continua
// (Hermite con tangentes por tiempo). Solo arranca en el primero y frena en el último. Un corte = otra llamada.
export function camino(E, s, k) {
  const n = k.length;
  if (s <= k[0][0] || n === 1) { E.camera.position.copy(k[0][1]); E.mira.copy(k[0][2]); return; }
  if (s >= k[n - 1][0]) { E.camera.position.copy(k[n - 1][1]); E.mira.copy(k[n - 1][2]); return; }
  let i = 0; while (i < n - 2 && s > k[i + 1][0]) i++;
  const h = k[i + 1][0] - k[i][0], u = (s - k[i][0]) / h, u2 = u * u, u3 = u2 * u;
  const tang = (j, c) => (j <= 0 || j >= n - 1 ? V() : k[j + 1][c].clone().sub(k[j - 1][c]).divideScalar(k[j + 1][0] - k[j - 1][0]).multiplyScalar(h));
  const herm = (c) => k[i][c].clone().multiplyScalar(2 * u3 - 3 * u2 + 1).add(tang(i, c).multiplyScalar(u3 - 2 * u2 + u))
    .add(k[i + 1][c].clone().multiplyScalar(-2 * u3 + 3 * u2)).add(tang(i + 1, c).multiplyScalar(u3 - u2));
  E.camera.position.copy(herm(1)); E.mira.copy(herm(2));
}

// La mirada sigue a un objeto con un peso de 0 a 1. El peso tiene que salir de suave(): si salta, la cámara da un tirón.
export function seguir(E, objeto, peso) { if (peso > 0) E.mira.lerp(objeto.getWorldPosition ? objeto.getWorldPosition(V()) : objeto, peso); }

// Coloca un objeto: avance = hacia dónde mira su eje X, arriba = su eje Y.
const _m = new THREE.Matrix4();
export function poner(o, pos, avance, arriba) {
  const a = avance.clone().normalize(), y = arriba.clone().sub(a.clone().multiplyScalar(arriba.dot(a))).normalize();
  _m.makeBasis(a, y, V().crossVectors(a, y)); o.quaternion.setFromRotationMatrix(_m); o.position.copy(pos);
}

// Flecha de 1 m que apunta en +Y; se coloca con apuntar(desde, hacia, k), con k de 0 a 1 para que crezca.
export function flecha(E, color = "#ffcc1a", grosor = 1) {
  const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.4 });
  const f = new THREE.Group();
  const palo = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * grosor, 0.05 * grosor, 0.72, 12), m); palo.position.y = 0.36;
  const punta = new THREE.Mesh(new THREE.ConeGeometry(0.13 * grosor, 0.28, 20), m); punta.position.y = 0.86;
  f.add(palo, punta); E.scene.add(f); return f;
}
export function apuntar(f, desde, hacia, k = 1) {
  const d = hacia.clone().sub(desde), len = d.length();
  f.position.copy(desde); f.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  f.scale.set(1, Math.max(0.001, len * k), 1); f.visible = k > 0.02;
}

// Aire, humo o polvo: bolas suaves que salen de un punto en una dirección y se abren. Todo sale del segundo s.
let _bola;
export function chorro(E, n = 28, color = "#ffffff") {
  if (!_bola) {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,0.9)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); _bola = new THREE.CanvasTexture(c);
  }
  const ps = Array.from({ length: n }, () => { const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: _bola, color, transparent: true, depthWrite: false, opacity: 0 })); E.scene.add(p); return p; });
  return {
    // fuerza de 0 a 1 (que cambie con suave()); largo en metros; abre = cuánto crece cada bola
    poner(origen, dir, s, fuerza, largo = 2.5, abre = 1) {
      const d = dir.clone().normalize();
      ps.forEach((p, i) => {
        const u = (s * 2.2 + i / n) % 1;
        p.position.copy(origen).addScaledVector(d, u * largo).add(V(Math.sin(i * 7.1), Math.cos(i * 3.3), Math.sin(i * 5.7)).multiplyScalar(0.075 * u * largo));
        p.scale.setScalar((0.25 + u * 1.4 * abre) * Math.max(0.3, largo / 2.5));
        p.material.opacity = fuerza * 0.55 * (1 - u) * Math.min(1, u * 8);
      });
    },
  };
}

// Fondo en degradado de arriba abajo (un estudio de color sin horizonte): fondoDegradado(E, ["#26b9d8", "#86d8e8", "#d2f1f5"]).
export function fondoDegradado(E, colores) {
  const c = document.createElement("canvas"); c.width = 4; c.height = 512;
  const g = c.getContext("2d"), d = g.createLinearGradient(0, 0, 0, 512);
  colores.forEach((col, i) => d.addColorStop(i / (colores.length - 1), col));
  g.fillStyle = d; g.fillRect(0, 0, 4, 512);
  E.scene.background = new THREE.CanvasTexture(c); E.scene.background.colorSpace = THREE.SRGBColorSpace;
}
