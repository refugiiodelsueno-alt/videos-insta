---
name: video
description: "Hace un reel explicativo animado, vertical, sin cara: una voz explica y en pantalla se ve, en movimiento y a tiempo con cada palabra, la cosa real de la que habla. De una idea sale el vídeo entero, con un hook que para, un guion que se ve hasta el final y una imagen que no se puede dejar de mirar: guion, voz, escenas, sonido, revisión y entrega. Úsalo cuando pidan un vídeo, un reel, «hazme un vídeo sobre...», ideas para vídeos, un guion o hooks para un reel, recrear o copiar un reel, o cambiar uno ya hecho."
---

# Video

Una idea entra; sale un reel listo para publicar, sin cara y sin grabar nada: una voz explica y la pantalla es la
explicación.

## Cómo sale bueno

1. **Lo que hace que cualquier vídeo se vea entero** está en `references/viral.md`: el hook que para, el guion que
   engancha hasta el final, la imagen que no se puede dejar de mirar, el movimiento fluido, el sonido que acompaña. Se
   aplica siempre y manda sobre todo lo demás, también sobre la referencia.
2. **Si el creador pasa un vídeo,** de él salen cómo se ve y cómo se mueve este (`references/referencia.md`), y su
   hook solo si pasa `viral.md`. Si no pasa ninguno, no se busca: todo sale de `viral.md`.

## Antes del primer vídeo

1. `node herramientas/doctor.mjs`. Lo que falte, lo instalas tú. Nunca le pidas al creador que ejecute nada.
2. Si no hay clave de ElevenLabs, `node herramientas/clave.mjs` abre una página para pegarla. Nunca en el chat. Sin
   clave, la voz sale con Kokoro en local, peor, y no hay efectos de sonido; díselo una vez.
3. Si no existe `trabajo/preferencias.md`, pregunta en una sola pregunta: en qué idioma y para quién son sus vídeos,
   cómo quiere cerrarlos (por ejemplo «Envíaselo a ese amigo que...») y si quiere un aspecto fijo para todos
   (`references/referencia.md`, al final). Guárdalo en dos o tres frases. No vuelvas a preguntarlo.

## Las etapas

Solo se para una vez: al enseñar el guion, preguntas si lo aprueba y «¿Le pongo efectos de sonido?». Lo demás lo
haces seguido y enseñas el vídeo terminado. Si el creador pide ver algo antes, se para ahí.

| # | Etapa | Qué sale | Cómo |
|---|---|---|---|
| 1 | Proyecto | `trabajo/proyectos/<fecha>-<slug>/` | `node herramientas/nuevo.mjs "<tema>"` |
| 2 | Investigación | `investigacion.md`: cada dato con su fuente y la frase exacta, comprobado hoy | tú, en la web |
| 3 | Referencia, solo si el creador pasó un vídeo | `referencia/`: el vídeo y `referencia.md` (sus planos, su hook, su estilo) | `references/referencia.md` |
| 4 | Guion | `guion.json` y `pie.txt`, que pasan `node herramientas/guion.mjs <proyecto>`. **Para: lo aprueba y dice si quiere sonido** | `references/guion.md` |
| 5 | Plan | `plan.md`: cada frase, qué enseña la referencia en ese momento y qué enseñamos nosotros | `references/escenas.md` |
| 6 | Voz | `voz/h1.wav` con el segundo de cada palabra | `node herramientas/voz.mjs <proyecto>` |
| 7 | Escenas | `escenas/<plano>.html` y lo común en `recursos/mundo.js` | `references/escenas.md` |
| 8 | Sonido, si lo quiso | `sonidos.json` y los efectos, cada uno de algo que se ve | `node herramientas/sonido.mjs <proyecto>` |
| 9 | Revisión | Pasa las medidas contra la referencia y sus hojas están miradas y arregladas | `node herramientas/revisar.mjs <proyecto>` |
| 10 | Entrega | El vídeo en `trabajo/salida/<proyecto>/` con su portada y `caption.txt`; la ruta, en el chat | `node herramientas/entregar.mjs <proyecto>` |

Cada herramienta dice cómo se usa con `--ayuda`; no leas su código. Si algo no funciona en esta máquina, arréglalo y
apúntalo en una línea en `trabajo/maquina.md`; léelo antes de cada vídeo.

Si el creador trae su propio texto, ese es el guion: no lo reescribas ni le quites datos; solo avisa si algo parece
falso. Si trae un vídeo, esa es la referencia.

Al entregar, en una línea: si quiere otra versión con uno de los hooks de reserva, que te lo diga; y que el siguiente
vídeo lo pida en una conversación nueva.

## Reglas de la casa

- Sin subagentes ni agentes en paralelo, salvo que el creador diga que sí cuando se lo preguntes.
- Nunca publiques ni envíes nada en su nombre.
- Corto y claro en todo lo que escribas al creador.
- Lo que dice de este vídeo se arregla en este vídeo. Solo va a `trabajo/preferencias.md` lo que valdrá para el
  siguiente («a partir de ahora», «nunca quiero», o la misma corrección en dos vídeos). Un fallo nuestro no es una
  preferencia suya: se arregla y ya.
- Lee esta skill y cada `references/` una vez por vídeo, cuando su etapa lo diga. En la web, búsquedas normales y pocas
  páginas; lo encontrado va a `investigacion.md` y no se busca otra vez.
- Solo si el creador pide tocar el vídeo a mano: `npx hyperframes@0.8.167 preview` dentro de `build/<id>/`.
