#!/usr/bin/env node
// revisar.mjs <proyecto> [--apertura h1] [--kokoro] [--escenas motor,bateria] [--en 0,0.5,1]
//
// Todo lo de revisar en un comando, con un resumen corto, por apertura:
//   1. la voz, si falta o si el guion cambió desde la última (sale de la caché si la frase ya se dijo)
//   2. monta la apertura y pasa `hyperframes check`; si falla, enseña el error y sigue con la siguiente
//   3. un borrador (build/<id>/borrador.mp4) y sus medidas contra su referencia: movimiento y pantalla llena, con la vara
//      de la referencia si la hay. Lo medido queda en build/<id>/medidas.json. Cada corte entre escenas se mira
//      fotograma a fotograma: si hay un fogonazo, un apagón o un fotograma vacío, lo avisa con su segundo
//   4. las hojas, para mirarlas en una sola pasada:
//        build/<id>/hoja.jpg        el hook (0, 0,5, 1 y 2 s) y el centro de cada escena
//        build/<id>/cortes.jpg      cada cambio de escena: justo antes, en mitad del cambio y justo después
//        build/<id>/tirones.jpg     cada tirón medido, fotograma a fotograma: la cámara o lo que se mueve cambia de
//                                   velocidad de golpe (un choque buscado vale; un frenazo de cámara, no)
//        build/<id>/comparacion.jpg el nuestro y su referencia en los mismos segundos
// Con --escenas, las hojas traen solo esas escenas y sus cortes (para mirar lo que se acaba de arreglar). Con --en,
// solo esos segundos. Tarda unos minutos: espera a que acabe, no lo mires a cada rato. Sale con error si algo no pasa.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cortes, juzgar, referenciaDe, tirones } from "./medir.mjs";
import { RAIZ, aperturas, arg, fallo, firmaVoz, hyperframes, leerJson, posicional, proyecto, r3, resumen, tiene } from "./_comun.mjs";
import { ENCADENADO, montar } from "./montar.mjs";
import { hoja, rejilla } from "./comparar.mjs";

// Sin GPU, un vídeo con escenas 3D pesadas no cabe en los 120 s que `hyperframes check` se da a sí mismo: entonces se
// pasa por tramos (--range), que mira lo mismo y da a cada tramo su propio plazo.
function comprobar(out, dur) {
  const r = hyperframes(["check"], { cwd: out });
  if (r.ok || !/within its deadline/.test(r.salida + r.errores)) return r;
  console.log("  el check no cabe en su plazo de una vez (sin GPU): lo paso por tramos de 5 s");
  for (let a = 0; a < dur; a += 5) {
    const t = hyperframes(["check", "--range", `${r3(a)},${r3(Math.min(dur, a + 5))}`], { cwd: out });
    if (!t.ok) return t;
  }
  return { ok: true, salida: "", errores: "" };
}

const { dir, guion } = proyecto(posicional());
const hojas = [];
let mal = 0;
for (const ap of aperturas(guion)) {
  const vj = leerJson(join(dir, "voz", `${ap.id}.json`));
  if (!vj || vj.firma !== firmaVoz(guion, ap) || !existsSync(join(dir, "voz", `${ap.id}.wav`))) {
    const v = spawnSync(process.execPath, [join(RAIZ, "herramientas", "voz.mjs"), dir, "--apertura", ap.id, ...(tiene("kokoro") ? ["--kokoro"] : [])], { stdio: "inherit" });
    if (v.status !== 0) { mal++; console.log(`${ap.id}: la voz no salió`); continue; }
  }
  const { out, tramos, voz } = montar(dir, guion, ap);
  const chk = comprobar(out, voz.duracion);
  if (!chk.ok) { mal++; console.log(`${ap.id}: el check falla. Arréglalo en escenas/ y vuelve a revisar:\n${resumen(chk)}`); continue; }
  const borrador = join(out, "borrador.mp4");
  const r = hyperframes(["render", "--quality", "draft", "--output", borrador, "--quiet"], { cwd: out });
  if (!r.ok || !existsSync(borrador)) { mal++; console.log(`${ap.id}: el borrador no salió:\n${resumen(r)}`); continue; }

  // Primero lo medido: si no pasa, se arregla antes de mirar ninguna imagen.
  const j = juzgar(borrador, JSON.parse(readFileSync(join(out, "tramos.json"), "utf8")), referenciaDe(dir, guion));
  const cambios = tramos.slice(1).map((s, i) => ({ t: s.inicio, de: tramos[i].escena, a: s.escena }));
  j.cortes = cortes(borrador, cambios.map((c) => c.t));
  j.tirones = tirones(borrador, cambios.map((c) => c.t));
  writeFileSync(join(out, "medidas.json"), JSON.stringify(j, null, 2) + "\n");
  const escenas = [...new Set(tramos.map((s) => s.escena))].length;
  console.log(`${ap.id}: ${voz.duracion} s, ${escenas} escenas, ${cambios.length} cortes. Movimiento ${j.movimiento.media}, quieto ${j.movimiento.pct_quieto} %, fotograma 0 lleno al ${Math.round((j.hook || 0) * 100)} %.`);
  if (j.cortes.length) console.log(`  En los cortes (míralos con --en <segundo>):\n${j.cortes.map((f) => "   - " + f).join("\n")}`);
  if (j.tirones.length) console.log(`  Tirones en ${j.tirones.join(", ")} s: míralos en tirones.jpg y arregla los que no sean un choque buscado.`);
  if (j.fallos.length) { mal++; console.log(`  NO PASA:\n${j.fallos.map((f) => "   - " + f).join("\n")}`); continue; }

  const pedidas = arg("escenas")?.split(",").map((s) => s.trim());
  const tiempos = arg("en") ? arg("en").split(",").map(Number)
    : pedidas ? tramos.filter((s) => pedidas.includes(s.escena)).map((s) => r3((s.inicio + s.fin) / 2))
    : [0, 0.5, 1, 2, ...tramos.map((s) => r3((s.inicio + s.fin) / 2))];
  if (!tiempos.length) fallo(`no hay escenas con esos nombres: ${pedidas.join(", ")}`);
  const unicos = [...new Set(tiempos.map((t) => r3(Math.min(t, voz.duracion - 0.05))))].sort((a, b) => a - b);
  hojas.push(hoja([borrador], unicos, join(out, "hoja.jpg")));
  // Cada corte: 0,1 s antes, en mitad del cambio (dura lo que ENCADENADO) y 0,15 s después de acabar.
  const susCortes = arg("en") ? [] : cambios.filter((c) => !pedidas || pedidas.includes(c.de) || pedidas.includes(c.a));
  const corto = (s) => (s.length > 13 ? s.slice(0, 12) + "." : s);
  if (susCortes.length) hojas.push(rejilla(susCortes.map((c) => [
    { video: borrador, t: r3(Math.max(0, c.t - 0.1)), texto: corto(c.de) },
    { video: borrador, t: r3(c.t + ENCADENADO / 2), texto: `corte ${c.t.toFixed(1)} s` },
    { video: borrador, t: r3(Math.min(voz.duracion - 0.05, c.t + ENCADENADO + 0.15)), texto: corto(c.a) },
  ]), join(out, "cortes.jpg")));
  if (j.tirones.length && !arg("en")) hojas.push(rejilla(j.tirones.slice(0, 8).map((t) => [-0.1, -0.033, 0, 0.033, 0.1].map((d) => (
    { video: borrador, t: r3(Math.min(voz.duracion - 0.05, Math.max(0, t + d))), texto: d === 0 ? `tirón ${t.toFixed(2)} s` : "" }))), join(out, "tirones.jpg")));
  if (guion.referencia || guion.estilo) {
    const ref = resolve(dir, guion.referencia || guion.estilo);
    if (existsSync(ref)) hojas.push(hoja([borrador, ref], unicos, join(out, "comparacion.jpg")));
    else { mal++; console.log(`  no encuentro la referencia ${ref}`); }
  }
  console.log("  pasa las medidas");
}
if (mal) fallo(`${mal} apertura(s) sin pasar. Arregla lo de arriba y vuelve a revisar; las hojas se miran cuando pase.`);
console.log(`\nPasa. Mira en una sola pasada: ${hojas.join(" y ")}. Si arreglas algo, vuelve a revisar con --escenas <las arregladas>.`);
