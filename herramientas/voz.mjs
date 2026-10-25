#!/usr/bin/env node
// voz.mjs <proyecto> [--apertura h1] [--kokoro] [--rehacer]
//
// Hace la voz de cada apertura: su hook y el cuerpo, frase a frase, cada frase en su sitio.
// Lee guion.json del proyecto y escribe, por apertura:
//   voz/<id>.wav    la voz entera de esa apertura
//   voz/<id>.json   { duracion, firma, frases: [{ n, texto, escena, inicio, fin, ritmo }], palabras: [{ texto, inicio, fin, frase, clave }] }
// e imprime lo que dura cada escena. revisar.mjs la rehace sola si el guion cambia: no hace falta volver a lanzarla.
//
// Proveedor: ElevenLabs si hay ELEVENLABS_API_KEY (en el sistema o en .env.local), con los tiempos exactos de cada
// letra. Sin clave, o con --kokoro, Kokoro en local (`hyperframes tts`) y los tiempos con `hyperframes transcribe`.
// Cada frase se genera una vez y se guarda en voz/cache/: cambiar una frase no rehace las demás.
//
// Con ElevenLabs, cada apertura sale de una sola toma, como habla una persona, y los silencios largos se acortan a
// `pausa` (0,18 s por defecto). Con Kokoro, frase a frase, una tras otra con esa pausa.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { aperturas, arg, cargarClaves, clave, duracion, escribirJson, fallo, ffm, firmaVoz, hyperframes, leerJson, palabras, posicional, proyecto, r3, tiene } from "./_comun.mjs";

cargarClaves();
const { dir, guion } = proyecto(posicional());
const V = guion.voz || {};
const KEY = process.env.ELEVENLABS_API_KEY;
const PROVEEDOR = tiene("kokoro") || V.proveedor === "kokoro" || !KEY ? "kokoro" : "elevenlabs";
const PAUSA = guion.pausa ?? 0.18; // pausa entre frases: corta, como habla alguien con prisa por contarlo
const COLA = guion.cola ?? 0.8;
const CACHE = join(dir, "voz", "cache");
mkdirSync(CACHE, { recursive: true });

if (PROVEEDOR === "kokoro" && V.proveedor !== "kokoro")
  console.log("voz: sin clave de ElevenLabs, va Kokoro en local. Para la voz buena, node herramientas/clave.mjs");

// ---- una frase, una vez -------------------------------------------------------------------------------------

async function elevenlabs(texto, antes, despues, salida) {
  const id = V.id || "851ejYcv2BoNPjrkw93G";
  const cuerpo = {
    text: texto,
    model_id: V.modelo || "eleven_v4",
    voice_settings: { stability: V.estabilidad ?? 0.35, similarity_boost: V.similitud ?? 0.7, style: V.estilo ?? 0, speed: V.velocidad ?? 1, use_speaker_boost: true },
    previous_text: antes || undefined,
    next_text: despues || undefined,
  };
  const pedir = (b) => fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" }, body: JSON.stringify(b),
  });
  let r = await pedir(cuerpo);
  if (r.status === 400) { // algunos modelos no aceptan el contexto de las frases vecinas
    delete cuerpo.previous_text; delete cuerpo.next_text;
    r = await pedir(cuerpo);
  }
  if (!r.ok) fallo(`ElevenLabs dijo ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const mp3 = salida.replace(/\.wav$/, ".mp3");
  writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
  ffm(["-i", mp3, "-ar", "44100", "-ac", "1", salida]);
  rmSync(mp3);
  // De letras a palabras.
  const a = j.alignment || j.normalized_alignment;
  const ws = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) ws.push(cur); cur = null; return; }
    if (!cur) cur = { texto: "", inicio: a.character_start_times_seconds[i] };
    cur.texto += ch;
    cur.fin = a.character_end_times_seconds[i];
  });
  if (cur) ws.push(cur);
  return ws;
}

function kokoro(texto, salida) {
  const txt = salida.replace(/\.wav$/, ".txt");
  writeFileSync(txt, texto, "utf8");
  const r = hyperframes(["tts", txt, "--voice", V.kokoro || "ef_dora", "--lang", guion.idioma || "es", "-o", salida, "--json"], { cwd: dir, json: true });
  if (!r.ok || !existsSync(salida)) fallo(`Kokoro no pudo hablar: ${(r.errores || r.salida).slice(-400)}`);
  return null; // los tiempos salen al transcribir la mezcla
}

// Quita el silencio del principio y del final sin comerse la primera consonante.
function recortar(src, dst) {
  const s = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03";
  ffm(["-i", src, "-af", `${s},areverse,${s},areverse`, "-ar", "44100", "-ac", "1", dst]);
  return duracion(dst);
}

async function frase(f, antes, despues) {
  const dicho = f.dicho || f.texto;
  const ajustes = PROVEEDOR === "kokoro" ? ["k", V.kokoro || "ef_dora", guion.idioma] : ["e", V.id, V.modelo, V.estabilidad, V.similitud, V.estilo, V.velocidad];
  const h = createHash("sha1").update(JSON.stringify([ajustes, dicho])).digest("hex").slice(0, 12);
  const crudo = join(CACHE, `${h}.crudo.wav`), limpio = join(CACHE, `${h}.wav`), tiempos = join(CACHE, `${h}.json`);
  if (!existsSync(limpio) || tiene("rehacer")) {
    const ws = PROVEEDOR === "kokoro" ? kokoro(dicho, crudo) : await elevenlabs(dicho, antes, despues, crudo);
    const antesDeRecortar = duracion(crudo);
    const len = recortar(crudo, limpio);
    // El recorte quita silencio del principio: los tiempos de ElevenLabs se corren lo mismo.
    const corrido = ws ? Math.max(0, (ws[0]?.inicio ?? 0) - 0.03) : 0;
    escribirJson(tiempos, { len, palabras: ws ? ws.map((w) => ({ ...w, inicio: r3(w.inicio - corrido), fin: r3(w.fin - corrido) })) : null, crudo: r3(antesDeRecortar) });
  }
  return { wav: limpio, ...leerJson(tiempos) };
}

// Las palabras del texto, repartidas en el tiempo que dura la frase: exactas si el proveedor las dio y coinciden en
// número; si no, en proporción a sus letras dentro del tramo que se oye.
function repartir(texto, oidas, inicio, fin) {
  const ws = palabras(texto);
  if (oidas && oidas.length === ws.length) return ws.map((w, i) => ({ texto: w, inicio: r3(inicio + oidas[i].inicio), fin: r3(inicio + oidas[i].fin) }));
  const a = oidas?.length ? inicio + oidas[0].inicio : inicio;
  const b = oidas?.length ? inicio + oidas[oidas.length - 1].fin : fin;
  const pesos = ws.map((w) => Math.max(2, w.replace(/[^\p{L}\p{N}]/gu, "").length + 1));
  const total = pesos.reduce((x, y) => x + y, 0);
  let t = a;
  return ws.map((w, i) => { const d = ((b - a) * pesos[i]) / total; const p = { texto: w, inicio: r3(t), fin: r3(t + d) }; t += d; return p; });
}

// ---- una toma seguida (ElevenLabs, sin segundos fijos) --------------------------------------------------------
// Toda la apertura de una vez: la voz enlaza las frases con su energía, como una persona. Luego cada silencio de
// más de PAUSA se acorta a PAUSA (los del hook no se tocan) y los tiempos de cada palabra se corren lo mismo.
async function tomaSeguida(ap, lista) {
  const dichos = lista.map((f) => String(f.dicho || f.texto).trim());
  const h = createHash("sha1").update(JSON.stringify(["toma", V.id, V.modelo, V.estabilidad, V.similitud, V.estilo, V.velocidad, dichos])).digest("hex").slice(0, 12);
  const crudo = join(CACHE, `${h}.toma.wav`), tiempos = join(CACHE, `${h}.toma.json`);
  if (!existsSync(crudo) || tiene("rehacer")) escribirJson(tiempos, await elevenlabs(dichos.join(" "), null, null, crudo));
  const ws = leerJson(tiempos);
  // Palabras de cada frase, por su número de palabras dichas.
  const porFrase = [];
  let k = 0;
  for (const d of dichos) { const n = palabras(d).length; porFrase.push(ws.slice(k, k + n)); k += n; }
  const nHook = lista.filter((f) => f.parte === "hook").length;
  const ultimaHook = porFrase[nHook - 1]?.[porFrase[nHook - 1].length - 1]?.fin ?? 0;
  // Tramos que se quitan: el silencio inicial y lo que sobra de cada silencio largo fuera del hook.
  const quitar = [];
  if (ws[0].inicio > 0.05) quitar.push([0, ws[0].inicio - 0.05]);
  for (let i = 1; i < ws.length; i++) {
    const a = ws[i - 1].fin, b = ws[i].inicio;
    if (b - a > PAUSA && a >= ultimaHook - 0.01) quitar.push([a + PAUSA / 2, b - PAUSA / 2]);
  }
  const corrido = (t) => quitar.reduce((s, [a, b]) => s + (t >= b ? b - a : t > a ? t - a : 0), 0);
  const fin = ws[ws.length - 1].fin;
  const quedan = [];
  let t0 = 0;
  for (const [a, b] of quitar) { if (a > t0) quedan.push([t0, a]); t0 = b; }
  quedan.push([t0, fin + 0.05]);
  const limpio = join(dir, "voz", `${ap.id}-toma.wav`);
  const sel = quedan.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join("+");
  ffm(["-i", crudo, "-af", `aselect='${sel}',asetpts=N/SR/TB`, "-ar", "44100", "-ac", "1", limpio]);
  const frases = lista.map((f, i) => {
    const pw = porFrase[i].map((w) => ({ inicio: w.inicio - corrido(w.inicio), fin: w.fin - corrido(w.fin) }));
    const inicio = r3(pw[0]?.inicio ?? 0), finF = r3(pw[pw.length - 1]?.fin ?? inicio);
    return { n: i + 1, parte: f.parte, texto: f.texto, escena: f.escena, clave: f.clave || null, inicio, fin: finF, ritmo: 1,
      oidas: palabras(dichos[i]).length === palabras(f.texto).length ? pw.map((w) => ({ inicio: w.inicio - inicio, fin: w.fin - inicio })) : null,
      tramo: pw.length ? [pw[0].inicio, pw[pw.length - 1].fin] : null };
  });
  // Si el texto en pantalla no coincide palabra a palabra con lo dicho, se reparte dentro de lo que se oye.
  for (const f of frases) if (!f.oidas && f.tramo) f.oidas = [{ inicio: 0, fin: f.tramo[1] - f.tramo[0] }].map((w) => ({ ...w, unico: true }));
  return { frases, wav: limpio };
}

// ---- cada apertura ------------------------------------------------------------------------------------------

// Lo que dura cada escena con esta voz, para dibujarla sin abrir voz/<id>.json.
function porEscena(frases, total) {
  const t = [];
  for (const f of frases) { const u = t[t.length - 1]; if (u && u.e === f.escena) u.fin = f.fin; else t.push({ e: f.escena, ini: f.inicio, fin: f.fin }); }
  t.forEach((s, i) => { s.hasta = i + 1 < t.length ? t[i + 1].ini : total; });
  return "  escenas: " + t.map((s) => `${s.e} ${(s.hasta - s.ini).toFixed(1)} s`).join(", ");
}

for (const ap of aperturas(guion)) {
  const lista = [
    ...ap.frases.map((f) => ({ ...f, escena: f.escena || ap.escena, parte: "hook" })),
    ...(guion.cuerpo || []).map((f) => ({ ...f, parte: "cuerpo" })),
  ];
  if (PROVEEDOR === "elevenlabs") {
    const { frases, wav } = await tomaSeguida(ap, lista);
    const total = r3(frases[frases.length - 1].fin + COLA);
    const salida = join(dir, "voz", `${ap.id}.wav`);
    ffm(["-i", wav, "-af", `apad,atrim=0:${total}`, "-ar", "44100", "-ac", "1", salida]);
    const pal = [];
    for (const f of frases) {
      const oidas = f.oidas?.[0]?.unico ? null : f.oidas;
      for (const w of repartir(f.texto, oidas, f.inicio, f.fin)) pal.push({ ...w, frase: f.n, clave: f.clave ? clave(w.texto) === clave(f.clave) : false });
      delete f.oidas; delete f.tramo;
    }
    escribirJson(join(dir, "voz", `${ap.id}.json`), { proveedor: PROVEEDOR, toma: "seguida", firma: firmaVoz(guion, ap), duracion: total, frases, palabras: pal });
    console.log(`${ap.id}: ${salida} (${total} s, ${frases.length} frases, ${pal.length} palabras, una toma)`);
    console.log(porEscena(frases, total));
    continue;
  }
  const tomas = [];
  for (let i = 0; i < lista.length; i++) tomas.push(await frase(lista[i], lista[i - 1]?.dicho || lista[i - 1]?.texto, lista[i + 1]?.dicho || lista[i + 1]?.texto));

  let t = 0;
  const frases = [], partes = [];
  for (let i = 0; i < lista.length; i++) {
    const f = lista[i], tm = tomas[i];
    const inicio = t, sig = lista[i + 1];
    const wav = join(dir, "voz", `${ap.id}-${String(i + 1).padStart(2, "0")}.wav`);
    copyFileSync(tm.wav, wav);
    const len = duracion(wav);
    frases.push({ n: i + 1, parte: f.parte, texto: f.texto, escena: f.escena, clave: f.clave || null, inicio: r3(inicio), fin: r3(inicio + len), ritmo: 1, oidas: tm.palabras });
    partes.push({ wav, inicio });
    const cambia = sig && sig.escena !== f.escena;
    t = inicio + len + PAUSA + (cambia ? 0.08 : 0);
  }
  const total = r3(frases[frases.length - 1].fin + COLA);

  // Mezcla: cada frase en su segundo.
  const salida = join(dir, "voz", `${ap.id}.wav`);
  const args = [];
  partes.forEach((p) => args.push("-i", p.wav));
  const cadenas = partes.map((p, i) => `[${i}]adelay=${Math.round(p.inicio * 1000)}:all=1[a${i}]`);
  const mezcla = partes.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${partes.length}:normalize=0,apad,atrim=0:${total}[s]`;
  ffm([...args, "-filter_complex", `${cadenas.join(";")};${mezcla}`, "-map", "[s]", "-ar", "44100", "-ac", "1", salida]);

  // Kokoro no da tiempos: se transcribe la mezcla y cada palabra oída va a la frase en cuyo tramo cae.
  if (frases.some((f) => !f.oidas)) {
    const tmp = join(dir, "voz", `tr-${ap.id}`);
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const r = hyperframes(["transcribe", salida, "--language", guion.idioma || "es", "--dir", tmp, "--json"], { cwd: dir, json: true });
    const tr = join(tmp, "transcript.json");
    const oidas = r.ok && existsSync(tr) ? JSON.parse(readFileSync(tr, "utf8")) : [];
    if (!oidas.length) console.log("aviso: no se pudo transcribir; las palabras van repartidas por letras");
    for (const f of frases.filter((x) => !x.oidas)) {
      const dentro = oidas.filter((w) => w.start >= f.inicio - 0.15 && w.start < f.fin + 0.05);
      f.oidas = dentro.length ? dentro.map((w) => ({ inicio: w.start - f.inicio, fin: w.end - f.inicio })) : null;
    }
    rmSync(tmp, { recursive: true, force: true });
  }

  const pal = [];
  for (const f of frases) {
    for (const w of repartir(f.texto, f.oidas, f.inicio, f.fin)) pal.push({ ...w, frase: f.n, clave: f.clave ? clave(w.texto) === clave(f.clave) : false });
    delete f.oidas;
  }
  escribirJson(join(dir, "voz", `${ap.id}.json`), { proveedor: PROVEEDOR, firma: firmaVoz(guion, ap), duracion: total, frases, palabras: pal });
  console.log(`${ap.id}: ${salida} (${total} s, ${frases.length} frases, ${pal.length} palabras, ${PROVEEDOR})`);
  console.log(porEscena(frases, total));
  for (const f of frases) if (f.ritmo !== 1) console.log(`  frase ${f.n} acelerada x${f.ritmo} para caber en su segundo`);
}
