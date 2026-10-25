#!/usr/bin/env node
// guion.mjs <proyecto>
//
// Comprueba en guion.json lo de los hooks que se puede comprobar solo (references/viral.md, «El hook»), en los de
// "aperturas" y en los de "reserva": que su primera frase no empiece por una fecha, un cuándo o un dónde, un matiz, un
// saludo o quien lo cuenta, ni lleve un «según»; y que ningún hook suene a noticia, anuncie en vez de intrigar o rebaje
// un superlativo. Imprime cada fallo con su frase y sale con error si hay alguno. Que el hook pare, se entienda y
// enganche no lo dice ninguna regla: eso lo juzgas tú con viral.md.
import { posicional, proyecto } from "./_comun.mjs";

const { guion } = proyecto(posicional());
const B = "(?<![\\p{L}\\p{N}])", E = "(?![\\p{L}\\p{N}])", r = (s) => new RegExp(s, "iu");
const MES = "enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december";
const DIA = "lunes|martes|miércoles|jueves|viernes|sábado|domingo|semana|mes|año|monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|year";

// Cómo no puede empezar la primera frase de un hook, y lo que no puede llevar.
const PRIMERA = [
  [r(`^((el|on|the)\\s+)?\\d{1,2}(st|nd|rd|th)?\\s+(de\\s+|of\\s+)?(${MES})${E}|^(${MES})\\s+\\d`), "empieza por una fecha"],
  [r(`^(en|hace|desde|durante|tras|después|antes|ayer|hoy|anoche|el pasado|la pasada|a (principios|finales|mediados)|((este|esta|el|la|this|last)\\s+(${DIA}))|in|on|at|during|since|after|before|yesterday|today|last|back in)${E}`), "empieza por cuándo o dónde"],
  [r(`^(según|de acuerdo con|al parecer|parece que|supuestamente|podría|puede que|quizás?|posiblemente|probablemente|according to|apparently|reportedly|allegedly|maybe|perhaps|possibly|probably|it seems)${E}`), "empieza por un matiz"],
  [r(`^(hola|buenas|hey|bienvenid[oa]s?|hi|hello|welcome)${E}`), "empieza saludando"],
  [r(`^(yo|mi|mis|me|nosotros|nuestr[oa]s?|i|my|we|our)${E}`), "empieza por quien lo cuenta"],
  [r(`${B}(según|according to)${E}`), "lleva un «según»: el matiz va en la frase siguiente"],
];
const TODAS = [
  [r(`${B}(han? anunciado|anunció|han? presentado|presentó|han? confirmado|confirmó|han? revelado|announced|unveiled|has confirmed)${E}`), "suena a noticia"],
  [r(`${B}(te cuento|te voy a contar|te explico|te lo explico|en este vídeo|en este video|mira esto|quédate|let me tell you|i'?ll tell you|in this video|watch this|stay tuned)${E}`), "anuncia en vez de intrigar"],
  [r(`${B}(uno de los|una de las|one of the)${E}`), "rebaja el superlativo («uno de los...»)"],
];

const fallos = [];
for (const h of [...(guion.aperturas || []), ...(guion.reserva || [])]) {
  const frases = (h.frases || []).map((f) => String(f.texto || "").trim()).filter(Boolean);
  if (!frases.length) continue;
  const primera = frases[0].replace(/^[^\p{L}\p{N}]+/u, ""), todo = frases.join(" ");
  const corto = todo.length > 70 ? `${todo.slice(0, 70)}…` : todo;
  for (const [re, por] of PRIMERA) if (re.test(primera)) fallos.push(`${h.id} «${corto}»: ${por}`);
  for (const [re, por] of TODAS) if (re.test(todo)) fallos.push(`${h.id} «${corto}»: ${por}`);
}

if (fallos.length) {
  console.log(fallos.join("\n"));
  console.log("Reescríbelos (references/viral.md, «El hook») y vuelve a pasarlo.");
  process.exit(1);
}
console.log("Los hooks pasan lo que se comprueba solo. Que paren, se entiendan y enganchen lo juzgas tú con references/viral.md.");
