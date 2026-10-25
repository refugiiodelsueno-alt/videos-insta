#!/usr/bin/env node
// montar.mjs <proyecto> [--apertura h1]
//
// Arma, para cada apertura, un proyecto de HyperFrames listo para revisar y renderizar en <proyecto>/build/<id>/:
//   index.html                 la línea de tiempo: las escenas en su segundo, el subtítulo y la voz
//   compositions/<escena>.html cada escena de <proyecto>/escenas/, con sus tiempos ya escritos dentro
//   compositions/subtitulos.html
//   voz.wav, recursos/
// Necesita voz/<id>.json (node herramientas/voz.mjs). No inventa nada: si falta una escena, lo dice y para.
//
// Cada escena empieza en el silencio antes de su primera frase y dura hasta la siguiente (más 0,3 s de encadenado).
// Dentro de la escena, __CUES__ se cambia por los segundos de cada palabra desde que empieza la escena:
//   C["azul"] la primera vez que se dice «azul», C["azul#2"] la segunda, C["@1"] la primera frase, C["@fin"] el final
// de la última. __DURACION__ es lo que dura la escena y __ID__ su identificador.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, aperturas, clave, fallo, leerJson, posicional, proyecto, r3 } from "./_comun.mjs";

const { dir, guion } = proyecto(posicional());
export const ENCADENADO = 0.3;
const ANTICIPO = 0.08; // la palabra aparece un poco antes de oírse, para que se lea a tiempo

export function montar(dir, guion, ap) {
  const voz = leerJson(join(dir, "voz", `${ap.id}.json`));
  if (!voz) fallo(`falta la voz de ${ap.id}: node herramientas/voz.mjs ${dir}`);
  const out = join(dir, "build", ap.id);
  // Si el visor de HyperFrames tiene la carpeta abierta, Windows no deja borrarla entera: se vacía por dentro.
  try { rmSync(out, { recursive: true, force: true }); }
  catch { for (const d of ["compositions", "index.html", "voz.wav", "tramos.json", "recursos", "sonidos"]) rmSync(join(out, d), { recursive: true, force: true }); }
  mkdirSync(join(out, "compositions"), { recursive: true });

  // Escenas en orden, con su tramo.
  const tramos = [];
  for (const f of voz.frases) {
    const ult = tramos[tramos.length - 1];
    if (ult && ult.escena === f.escena) ult.frases.push(f);
    else tramos.push({ escena: f.escena, frases: [f] });
  }
  tramos.forEach((s, i) => {
    const prev = tramos[i - 1];
    s.inicio = i === 0 ? 0 : r3((prev.frases[prev.frases.length - 1].fin + s.frases[0].inicio) / 2);
  });
  tramos.forEach((s, i) => { s.fin = i + 1 < tramos.length ? tramos[i + 1].inicio : voz.duracion; });

  const faltan = [...new Set(tramos.map((s) => s.escena))].filter((e) => !existsSync(join(dir, "escenas", `${e}.html`)));
  if (faltan.length) fallo(`faltan escenas en ${join(dir, "escenas")}: ${faltan.map((e) => e + ".html").join(", ")}`);

  // Cada escena, con sus tiempos dentro. Una escena que vuelve más tarde es otra instancia con su propio id.
  const vistos = {};
  for (const s of tramos) {
    vistos[s.escena] = (vistos[s.escena] || 0) + 1;
    s.id = `e-${s.escena}${vistos[s.escena] > 1 ? "-" + vistos[s.escena] : ""}`;
    const C = {}, cuenta = {};
    s.frases.forEach((f, k) => { C[`@${k + 1}`] = r3(f.inicio - s.inicio); });
    C["@fin"] = r3(s.frases[s.frases.length - 1].fin - s.inicio);
    for (const w of voz.palabras.filter((p) => s.frases.some((f) => f.n === p.frase))) {
      const k = clave(w.texto);
      if (!k) continue;
      cuenta[k] = (cuenta[k] || 0) + 1;
      C[cuenta[k] === 1 ? k : `${k}#${cuenta[k]}`] = r3(Math.max(0, w.inicio - s.inicio));
    }
    const dur = r3(s.fin - s.inicio + (s === tramos[tramos.length - 1] ? 0 : ENCADENADO));
    const html = readFileSync(join(dir, "escenas", `${s.escena}.html`), "utf8")
      .replaceAll("__ID__", s.id).replaceAll("__CUES__", JSON.stringify(C)).replaceAll("__DURACION__", String(dur));
    writeFileSync(join(out, "compositions", `${s.id}.html`), html);
    s.dur = dur;
  }

  // Subtítulo: bloques de pocas palabras; cada palabra aparece al decirse; la clave de la frase, en su recuadro.
  const modo = guion.subtitulos || "arriba";
  const bloques = [];
  for (const w of voz.palabras) {
    const b = bloques[bloques.length - 1];
    const largo = b ? b.palabras.map((p) => p.texto).join(" ").length + w.texto.length + 1 : 0;
    if (!b || b.frase !== w.frase || b.palabras.length >= 6 || largo > 30) bloques.push({ frase: w.frase, palabras: [w] });
    else b.palabras.push(w);
  }
  bloques.forEach((b, i) => {
    b.inicio = r3(Math.max(0, b.palabras[0].inicio - ANTICIPO));
    const sig = bloques[i + 1];
    b.fin = r3(sig ? Math.min(sig.palabras[0].inicio - ANTICIPO, b.palabras[b.palabras.length - 1].fin + 0.6) : voz.duracion);
  });
  writeFileSync(join(out, "compositions", "subtitulos.html"), subtitulos(bloques, voz.duracion, modo));

  // Los efectos que dejó sonido.mjs para esta apertura (sonidos/<apertura>.json), ya cortados, colocados y con su
  // volumen frente a la voz. También vale { "archivo": "sonidos/x.wav", "en": 3.2 } o "palabra" en guion.sonidos.
  const sonidos = (leerJson(join(dir, "sonidos", `${ap.id}.json`)) || guion.sonidos || []).map((s, i) => {
    const w = s.palabra ? voz.palabras.find((p) => clave(p.texto) === clave(s.palabra)) : null;
    const en = s.en ?? w?.inicio;
    if (en == null) fallo(`sonido ${i + 1}: no encuentro «${s.palabra}» en ${ap.id}`);
    return { ...s, en: r3(en), id: `sonido-${i + 1}` };
  });

  for (const d of ["recursos", "sonidos"]) if (existsSync(join(dir, d))) cpSync(join(dir, d), join(out, d), { recursive: true });
  cpSync(join(RAIZ, "plantilla", "kit.js"), join(out, "kit.js"));
  cpSync(join(RAIZ, "plantilla", "kit3d.js"), join(out, "kit3d.js"));
  cpSync(join(dir, "voz", `${ap.id}.wav`), join(out, "voz.wav"));
  writeFileSync(join(out, "tramos.json"), JSON.stringify(tramos.map((s) => ({ escena: s.escena, inicio: s.inicio, fin: r3(s.fin), dur: r3(s.fin - s.inicio), medio: r3((s.inicio + s.fin) / 2) })), null, 2) + "\n");
  const estilo = existsSync(join(dir, "estilo.css")) ? readFileSync(join(dir, "estilo.css"), "utf8") : readFileSync(join(RAIZ, "plantilla", "estilo.css"), "utf8");
  writeFileSync(join(out, "index.html"), indice(tramos, voz.duracion, estilo, modo, sonidos, guion.escenas || {}));
  writeFileSync(join(out, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { blocks: "compositions", assets: "recursos" } }, null, 2) + "\n");
  writeFileSync(join(out, "package.json"), JSON.stringify({ name: `${ap.id}`, private: true, type: "module" }, null, 2) + "\n");
  return { out, tramos, voz };
}

function indice(tramos, total, estilo, modo, sonidos, ajustes) {
  const hosts = tramos.map((s, i) => `      <div id="h-${s.id}" class="escena" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html"
        data-start="${s.inicio}" data-duration="${s.dur}" data-track-index="${i % 2}" data-width="1080" data-height="1920"></div>`).join("\n");
  // Cómo se cambia de escena lo dice la referencia (guion.json → "escenas": { "<escena>": { "entrada": ... } }).
  // Sin decir nada, corte seco: una transición puesta por defecto es un tic, no una decisión.
  const entradas = tramos.slice(1).map((s, i) => {
    const prev = `#h-${tramos[i].id}`, sig = `#h-${s.id}`, t = s.inicio, d = ENCADENADO;
    const modo = ajustes[s.escena]?.entrada || "corte";
    if (modo === "corte") return "";
    if (modo === "fundido") return `        tl.fromTo("${sig}", { opacity: 0 }, { opacity: 1, duration: ${d}, ease: "power2.inOut" }, ${t});`;
    if (modo === "zoom") return `        tl.fromTo("${sig}", { scale: 1.6, opacity: 0, filter: "blur(18px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: ${d}, ease: "expo.out" }, ${t});
        tl.to("${prev}", { scale: 0.75, filter: "blur(10px)", duration: ${d}, ease: "power3.in" }, ${t});`;
    if (modo === "lateral") return `        tl.fromTo("${sig}", { xPercent: 100, filter: "blur(14px)" }, { xPercent: 0, filter: "blur(0px)", duration: ${d}, ease: "expo.out" }, ${t});
        tl.to("${prev}", { xPercent: -35, filter: "blur(10px)", duration: ${d}, ease: "power3.in" }, ${t});`;
    return `        tl.fromTo("${sig}", { yPercent: 100, filter: "blur(14px)" }, { yPercent: 0, filter: "blur(0px)", duration: ${d}, ease: "expo.out" }, ${t});
        tl.to("${prev}", { yPercent: -35, scale: 0.92, filter: "blur(10px)", duration: ${d}, ease: "power3.in" }, ${t});`;
  }).filter(Boolean).join("\n");
  const subs = modo === "no" ? "" : `      <div id="h-subtitulos" data-composition-id="subtitulos" data-composition-src="compositions/subtitulos.html"
        data-start="0" data-duration="${total}" data-track-index="5" data-width="1080" data-height="1920"></div>`;
  const audios = sonidos.map((s) => `      <audio id="${s.id}" src="${s.archivo}" data-start="${s.en}" data-track-index="${11}" data-volume="${s.volumen ?? 0.6}"></audio>`).join("\n");
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script type="importmap">{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/" } }</script>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script src="kit.js"></script>
    <style>
${estilo}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
      #main { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--fondo); }
      .escena { position: absolute; inset: 0; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
${hosts}
${subs}
      <audio id="voz" src="voz.wav" data-start="0" data-duration="${total}" data-track-index="10" data-volume="1"></audio>
${audios}
    </div>
    <script>
      (function () {
        var tl = gsap.timeline({ paused: true });
${entradas}
        tl.to({}, { duration: ${total} }, 0);
        window.__timelines["main"] = tl;
      })();
    </script>
  </body>
</html>
`;
}

function subtitulos(bloques, total, modo) {
  const datos = JSON.stringify(bloques.map((b) => ({ i: b.inicio, f: b.fin, p: b.palabras.map((w) => [w.texto, r3(Math.max(0, w.inicio - ANTICIPO)), w.clave ? 1 : 0]) })));
  const arriba = modo === "abajo" ? "var(--sub-abajo)" : "var(--sub-arriba)";
  return `<!doctype html>
<html><head><meta charset="UTF-8" /></head><body>
<template>
  <style>
    #root { position: absolute; inset: 0; pointer-events: none; }
    #sub-escenario { position: absolute; left: 170px; right: 170px; top: ${arriba}; height: 220px; }
    .sub-bloque { position: absolute; inset: 0; display: flex; flex-wrap: wrap; align-content: flex-start; justify-content: center; column-gap: 0.26em; row-gap: 0; opacity: 0;
      font-family: var(--letra), sans-serif; font-size: var(--sub-tam); line-height: 1.11; letter-spacing: -0.01em;
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55); }
    .sub-p { display: inline-block; position: relative; isolation: isolate; font-weight: 700; color: var(--tinta); opacity: 0; }
    .sub-p.dicha { font-weight: 500; color: var(--tinta-dicha); }
    .sub-p .caja { position: absolute; left: -0.14em; right: -0.14em; top: 0.02em; bottom: -0.04em; border: 4px solid var(--marca); border-radius: 10px;
      background: color-mix(in srgb, var(--marca) 22%, transparent); opacity: 0; z-index: 0; }
    .sub-p .tx { position: relative; z-index: 1; }
    .sub-p .caja::before, .sub-p .caja::after { content: ""; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: var(--marca); border: 3px solid #fff; }
    .sub-p .caja::before { left: -11px; top: -11px; }
    .sub-p .caja::after { right: -11px; bottom: -11px; }
  </style>
  <div id="root" data-composition-id="subtitulos" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
    <div id="sub-escenario"></div>
  </div>
  <script>
    (function () {
      var B = ${datos};
      var esc = document.getElementById("sub-escenario");
      var tl = gsap.timeline({ paused: true });
      B.forEach(function (b, i) {
        var el = document.createElement("div");
        el.className = "sub-bloque";
        el.id = "sub-b" + i;
        b.p.forEach(function (w, j) {
          var s = document.createElement("span");
          s.className = "sub-p" + (w[2] ? " es-clave" : "");
          s.id = "sub-b" + i + "-" + j;
          var tx = document.createElement("span");
          tx.className = "tx";
          tx.textContent = w[0];
          s.appendChild(tx);
          if (w[2]) { var c = document.createElement("span"); c.className = "caja"; s.appendChild(c); }
          el.appendChild(s);
        });
        esc.appendChild(el);
        tl.set(el, { opacity: 1 }, b.i);
        tl.set(el, { opacity: 0 }, b.f);
        b.p.forEach(function (w, j) {
          var s = document.getElementById("sub-b" + i + "-" + j);
          tl.fromTo(s, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.07, ease: "power2.out" }, w[1]);
          var sig = b.p[j + 1];
          if (sig && !w[2]) tl.set(s, { className: "sub-p dicha" }, sig[1]);
          if (w[2]) tl.fromTo(s.querySelector(".caja"), { opacity: 0, scaleX: 0.6 }, { opacity: 1, scaleX: 1, duration: 0.12, ease: "back.out(2.5)" }, w[1] + 0.07);
        });
      });
      tl.to({}, { duration: ${total} }, 0);
      window.__timelines["subtitulos"] = tl;
    })();
  </script>
</template>
</body></html>
`;
}

if (process.argv[1] && process.argv[1].endsWith("montar.mjs")) {
  for (const ap of aperturas(guion)) {
    const { out, tramos, voz } = montar(dir, guion, ap);
    console.log(`${ap.id}: ${out} (${voz.duracion} s, ${tramos.length} tramos: ${tramos.map((s) => `${s.escena}@${s.inicio}`).join(" ")})`);
  }
}
