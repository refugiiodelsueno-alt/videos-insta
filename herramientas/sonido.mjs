#!/usr/bin/env node
// sonido.mjs <proyecto> [--apertura h1] [--rehacer nombre1,nombre2]
//
// Los efectos de sonido del vídeo, uno por cada cosa que pasa en pantalla y suena. Se describen en
// <proyecto>/sonidos.json (lo escribes tú, a partir del plan):
//   [ { "nombre": "suelta", "que": "A heavy car detaching from a steel track overhead: one sharp metallic clank with a
//       short rattle. Close foley, dry, no music", "oye": "a metal latch releasing with a clank", "dura": 0.6,
//       "palabra": "suelta", "golpe": true, "db": -6, "suave": false } ]
//   que      lo que suena, en inglés, por su material y su forma en el tiempo (lo que se pide a ElevenLabs)
//   oye      en pocas palabras, lo que tiene que parecer al oírlo (lo comprueba earshot, si está)
//   dura     segundos del efecto (0,5 a 2)
//   palabra  la palabra en la que pasa (o "en": segundo de la apertura); "palabra#2" la segunda vez
//   golpe    true: el golpe del sonido cae en ese instante; false: el sonido empieza en ese instante
//   db       cuánto por debajo de la voz que suena alrededor (de -3, un golpe que manda, a -16, un detalle)
//   suave    true: quita los agudos ásperos (para chispas, pitidos, cosas que pueden molestar)
// Hace: genera cada efecto con ElevenLabs (clave en .env.local) y lo guarda en sonidos/<nombre>.mp3; si earshot está
// instalado, hace tres versiones y se queda la que más suena a "oye" (y avisa si ninguna suena a eso). Luego lo corta
// a lo suyo, lo coloca y le da su volumen frente a la voz, y deja sonidos/<apertura>.json, que montar.mjs pone en el
// vídeo. Imprime una línea por efecto: dónde cae, frente a qué voz y cómo sonó según earshot.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { aperturas, arg, cargarClaves, clave, escribirJson, fallo, ffmpeg, leerJson, posicional, programa, proyecto, r3 } from "./_comun.mjs";

const { dir, guion } = proyecto(posicional());
const lista = leerJson(join(dir, "sonidos.json"));
if (!lista?.length) fallo(`falta ${join(dir, "sonidos.json")} con los efectos (node herramientas/sonido.mjs --ayuda)`);
cargarClaves();
const KEY = process.env.ELEVENLABS_API_KEY;
const rehacer = new Set((arg("rehacer", "") || "").split(",").filter(Boolean));
const earshot = programa("earshot");
const carpeta = join(dir, "sonidos");
mkdirSync(carpeta, { recursive: true });
const SR = 48000;

const pcm = (f, filtro) => {
  const r = spawnSync(ffmpeg(), ["-v", "error", "-i", f, ...(filtro ? ["-af", filtro] : []), "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], { maxBuffer: 1 << 30 });
  return new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.byteLength / 4));
};
// El trozo más fuerte (RMS) entre dos instantes, en dB, y dónde está.
const fuerte = (a, t0, t1, ventana) => {
  let mejor = 1e-9, donde = t0;
  for (let i = Math.max(0, Math.floor(t0 * SR)); i + ventana <= Math.min(a.length, Math.floor(t1 * SR)); i += ventana / 2) {
    let s = 0; for (let j = i; j < i + ventana; j++) s += a[j] * a[j];
    const v = Math.sqrt(s / ventana); if (v > mejor) { mejor = v; donde = i / SR; }
  }
  return { db: 20 * Math.log10(mejor), t: donde };
};

// 1. Generar lo que falte.
async function generar(e, salida) {
  if (!KEY) fallo("no hay clave de ElevenLabs: node herramientas/clave.mjs");
  const r = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
    method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text: e.que, duration_seconds: e.dura ?? 0.8, prompt_influence: 0.75 }),
  });
  if (!r.ok) fallo(`${e.nombre}: ElevenLabs dijo ${r.status} ${(await r.text()).slice(0, 200)}`);
  writeFileSync(salida, Buffer.from(await r.arrayBuffer()));
}
const oido = {};
for (const e of lista) {
  const f = join(carpeta, `${e.nombre}.mp3`);
  if (existsSync(f) && !rehacer.has(e.nombre)) continue;
  if (!earshot) { await generar(e, f); continue; }
  const versiones = [1, 2, 3].map((k) => join(carpeta, `${e.nombre}-${k}.mp3`));
  for (const v of versiones) await generar(e, v);
  const r = spawnSync(earshot, ["rank", e.oye || e.que, ...versiones, "--json"], { encoding: "utf8", maxBuffer: 1 << 26 });
  let mejor = { path: versiones[0], verdict: "sin comprobar", z: 0 };
  try { mejor = JSON.parse(r.stdout).results[0]; } catch {}
  spawnSync(ffmpeg(), ["-v", "error", "-y", "-i", mejor.path, "-c", "copy", f]);
  oido[e.nombre] = mejor.verdict === "no match" ? `NO SUENA A «${e.oye}» (suena a ${mejor.sounds_most_like}): reescribe "que" y --rehacer ${e.nombre}, o quítalo` : `suena a «${e.oye}» (${mejor.verdict})`;
}

// 2. Colocarlo y darle volumen frente a la voz, en cada apertura.
for (const ap of aperturas(guion)) {
  const vz = leerJson(join(dir, "voz", `${ap.id}.json`));
  if (!vz) fallo(`falta la voz de ${ap.id}: node herramientas/voz.mjs ${dir}`);
  const voz = pcm(join(dir, "voz", `${ap.id}.wav`));
  const tipica = fuerte(voz, 0, voz.length / SR, 2400).db - 3;
  const salida = [];
  for (const e of lista) {
    let t = e.en;
    if (e.palabra) {
      const [w, n] = e.palabra.split("#"), k = clave(w);
      t = vz.palabras.filter((p) => clave(p.texto) === k)[(Number(n) || 1) - 1]?.inicio;
      if (t == null) fallo(`${e.nombre}: «${e.palabra}» no se dice en ${ap.id}`);
    }
    const crudo = join(carpeta, `${e.nombre}.mp3`), fx = pcm(crudo, e.suave ? "lowpass=f=5000:p=2" : null);
    const dur = fx.length / SR, golpe = fuerte(fx, 0, dur, 480);
    const cerca = fuerte(voz, t - 0.4, t + 0.4, 2400).db, ref = cerca < -45 ? tipica : cerca;
    const ganancia = ref + (e.db ?? -10) - golpe.db, en = Math.max(0, t - (e.golpe === false ? 0 : golpe.t));
    const listo = join(carpeta, `${e.nombre}-${ap.id}.wav`);
    const fade = Math.min(0.04, dur / 3).toFixed(3);
    spawnSync(ffmpeg(), ["-v", "error", "-y", "-i", crudo, "-af", `${e.suave ? "lowpass=f=5000:p=2," : ""}afade=t=in:d=0.004,afade=t=out:st=${Math.max(0, dur - fade).toFixed(3)}:d=${fade},volume=${ganancia.toFixed(2)}dB`, listo]);
    salida.push({ archivo: `sonidos/${e.nombre}-${ap.id}.wav`, en: r3(en), volumen: 1 });
    console.log(`${ap.id} ${e.nombre.padEnd(14)} ${r3(t)} s, ${e.db ?? -10} dB bajo la voz${oido[e.nombre] ? " | " + oido[e.nombre] : ""}`);
  }
  escribirJson(join(carpeta, `${ap.id}.json`), salida);
}
if (!earshot) console.log("earshot no está instalado: nadie ha comprobado que cada efecto suene a lo que se ve (opcional, ver AVISOS.md).");
