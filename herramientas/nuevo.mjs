#!/usr/bin/env node
// nuevo.mjs "<tema>" [--slug algo-corto]
//
// Crea trabajo/proyectos/<fecha>-<slug>/ con lo mínimo: guion.json vacío para rellenar, escenas/ con la plantilla
// de una escena, estilo.css (el del creador si existe; si no, el de la casa) y notas.md. Imprime la ruta.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, arg, escribirJson, fallo, posicional } from "./_comun.mjs";

const tema = posicional();
if (!tema) fallo('uso: node herramientas/nuevo.mjs "<tema>" [--slug algo-corto]');
const slug = (arg("slug") || tema).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "video";
const hoy = new Date().toISOString().slice(0, 10);
const dir = join(RAIZ, "trabajo", "proyectos", `${hoy}-${slug}`);
if (existsSync(dir)) fallo(`ya existe ${dir}`);
mkdirSync(join(dir, "escenas"), { recursive: true });
mkdirSync(join(dir, "recursos"), { recursive: true });
escribirJson(join(dir, "guion.json"), {
  titulo: tema, slug, idioma: "es",
  voz: { proveedor: "elevenlabs", id: "851ejYcv2BoNPjrkw93G", modelo: "eleven_v4", velocidad: 1, estabilidad: 0.35, similitud: 0.7, kokoro: "ef_dora" },
  subtitulos: "arriba",
  aperturas: [{ id: "h1", escena: "hook", frases: [{ texto: "", clave: "" }] }],
  reserva: [],
  cuerpo: [{ texto: "", escena: "", clave: "" }],
});
const estiloPropio = join(RAIZ, "trabajo", "estilo.css");
copyFileSync(existsSync(estiloPropio) ? estiloPropio : join(RAIZ, "plantilla", "estilo.css"), join(dir, "estilo.css"));
copyFileSync(join(RAIZ, "plantilla", "escena.html"), join(dir, "escenas", "_plantilla.html"));
copyFileSync(join(RAIZ, "plantilla", "escena-3d.html"), join(dir, "escenas", "_plantilla-3d.html"));
writeFileSync(join(dir, "notas.md"), `# ${tema}\n\nPedido el ${hoy}.\n`);
console.log(dir);
