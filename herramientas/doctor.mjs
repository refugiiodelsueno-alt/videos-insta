#!/usr/bin/env node
// doctor.mjs — mira la máquina y dice una línea por cosa: ok, o qué falta y quién lo pone.
// Todo lo que falta lo instala el agente; lo único del comprador es pegar su clave en la página de claves.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statfsSync } from "node:fs";
import { join } from "node:path";
import { HF, RAIZ, WIN, cargarClaves, hyperframes, programa } from "./_comun.mjs";

const lineas = [];
const ok = (q, t) => lineas.push(`ok    ${q.padEnd(13)} ${t}`);
const mal = (q, t) => lineas.push(`falta ${q.padEnd(13)} ${t}`);

const node = Number(process.versions.node.split(".")[0]);
node >= 22 ? ok("node", process.versions.node) : mal("node", `hace falta Node 22 o más (hay ${process.versions.node}): el agente lo instala`);

const ff = programa("ffmpeg"), fp = programa("ffprobe");
ff && fp ? ok("ffmpeg", ff) : mal("ffmpeg", WIN ? "el agente lo instala: winget install Gyan.FFmpeg (y abre una terminal nueva)" : "el agente lo instala: brew install ffmpeg");

const v = hyperframes(["--version"], { silencio: true });
v.ok ? ok("hyperframes", (v.salida.trim().split(/\r?\n/).pop() || HF)) : mal("hyperframes", `npx no pudo traer ${HF}: revisa la conexión`);

const d = hyperframes(["doctor", "--json"], { silencio: true });
if (d.ok) ok("navegador", "HyperFrames lo tiene listo");
else lineas.push(`aviso navegador     el primer render baja Chrome (unos 270 MB) solo`);

cargarClaves();
process.env.ELEVENLABS_API_KEY ? ok("voz", "clave de ElevenLabs puesta") : lineas.push("aviso voz           sin clave de ElevenLabs: se usa Kokoro en local. Para la voz buena: node herramientas/clave.mjs");

const py = spawnSync(WIN ? "python" : "python3", ["--version"], { encoding: "utf8" });
py.status === 0 ? ok("python", (py.stdout || py.stderr).trim()) : lineas.push("aviso python        solo hace falta para Kokoro (voz sin clave) y para bajar reels con enlace");

try { const s = statfsSync(RAIZ); const gb = (s.bavail * s.bsize) / 1e9; gb > 3 ? ok("disco", `${gb.toFixed(0)} GB libres`) : mal("disco", `quedan ${gb.toFixed(1)} GB; hacen falta unos 3`); } catch { /* sin dato de disco */ }

const pref = join(RAIZ, "trabajo", "preferencias.md");
existsSync(pref) && readFileSync(pref, "utf8").trim() ? ok("preferencias", "guardadas") : lineas.push("aviso preferencias  aún no hay: se preguntan una vez, con el primer vídeo");

console.log(lineas.join("\n"));
process.exit(lineas.some((l) => l.startsWith("falta")) ? 1 : 0);
