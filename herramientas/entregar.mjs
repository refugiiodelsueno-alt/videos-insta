#!/usr/bin/env node
// entregar.mjs <proyecto> [--apertura h1]
//
// El final: monta cada apertura, pasa el check, la renderiza a calidad final y la deja en
// trabajo/salida/<proyecto>/ como <slug>-<id>.mp4, con portada-<id>.jpg y caption.txt (el texto del post, de
// <proyecto>/pie.txt). Comprueba que cada vídeo dura lo que la voz, que no está vacío y que pasa las medidas: no hace
// falta volver a mirarlo después. Tarda unos minutos por apertura. Imprime las rutas.
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { RAIZ, aperturas, comprobar, duracion, fallo, ffm, hyperframes, posicional, proyecto, r3, resumen, tiene } from "./_comun.mjs";
import { montar } from "./montar.mjs";
import { juzgar, referenciaDe } from "./medir.mjs";

const { dir, guion } = proyecto(posicional());
const nombre = basename(dir);
const slug = guion.slug || nombre.replace(/^\d{4}-\d{2}-\d{2}-/, "");
const salida = join(RAIZ, "trabajo", "salida", nombre);
mkdirSync(salida, { recursive: true });
const hechos = [];
for (const ap of aperturas(guion)) {
  const { out, voz } = montar(dir, guion, ap);
  const chk = comprobar(out, voz.duracion);
  if (!chk.ok) fallo(`${ap.id}: el check falla; revisa antes de entregar:\n${resumen(chk)}`);
  const mp4 = join(salida, `${slug}-${ap.id}.mp4`);
  const r = hyperframes(["render", "--quality", "high", "--fps", "60", "--output", mp4, "--quiet"], { cwd: out });
  if (!r.ok || !existsSync(mp4) || statSync(mp4).size < 10000) fallo(`${ap.id}: el render no salió:\n${resumen(r)}`);
  const d = duracion(mp4);
  if (Math.abs(d - voz.duracion) > 0.5) fallo(`${ap.id}: el vídeo dura ${r3(d)} s y la voz ${voz.duracion} s`);
  const j = juzgar(mp4, JSON.parse(readFileSync(join(out, "tramos.json"), "utf8")), referenciaDe(dir, guion));
  if (j.fallos.length && !tiene("forzar")) {
    rmSync(mp4, { force: true });
    fallo(`${ap.id} no pasa las medidas, no se entrega:\n${j.fallos.map((f) => " - " + f).join("\n")}\nArregla las escenas y vuelve a revisar.`);
  }
  const portada = join(salida, `portada-${ap.id}.jpg`);
  ffm(["-ss", String(Math.min(1, d / 2)), "-i", mp4, "-frames:v", "1", "-q:v", "2", portada]);
  hechos.push(mp4, portada);
}
if (existsSync(join(dir, "pie.txt"))) { copyFileSync(join(dir, "pie.txt"), join(salida, "caption.txt")); hechos.push(join(salida, "caption.txt")); }
else console.log("aviso: no hay pie.txt; el texto del post falta");
console.log(hechos.join("\n"));
