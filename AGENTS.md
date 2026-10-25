# Reels explicativos

Esta carpeta hace reels explicativos animados en el ordenador de quien la abre, con la IA en la que la está leyendo.
Le das una idea y sale el vídeo, listo para publicar; si quieres, más versiones con otros hooks. Nada se publica
solo.

## Al abrir la carpeta

- Si te dicen «configúrame», «set me up» o es la primera vez: `node herramientas/doctor.mjs`, instala tú lo que
  falte, abre la página de la clave de voz (`node herramientas/clave.mjs`) y pregunta lo de las preferencias (skill
  `video`, «Antes del primer vídeo»). Luego di en una línea que ya puede pedir un vídeo, por ejemplo «Hazme un vídeo
  sobre por qué el cielo es azul».
- Cualquier petición de vídeo, reel, guion, hooks, ideas para vídeos o recrear un reel: sigue la skill `video`
  (`.claude/skills/video/SKILL.md`; la misma en `.agents/skills/video/`). Léela entera una vez antes de empezar, con
  sus `references/` cuando la etapa lo diga.
- Si te dicen «doctor» o algo se rompe: `node herramientas/doctor.mjs` y arregla lo que diga.

## La carpeta

```
herramientas/   los pasos fijos: nuevo, referencia, guion, voz, sonido, montar, revisar, entregar, doctor, clave
                (cada una dice cómo se usa con --ayuda)
plantilla/      el aspecto de la casa (estilo.css) y el esqueleto de una escena
trabajo/
  preferencias.md   lo que vale para todos sus vídeos (idioma, público, cierre, estilo)
  proyectos/        un vídeo por carpeta, con su guion, su voz, sus escenas y sus notas
  salida/           los vídeos terminados, con sus portadas y el texto del post
.env.local      sus claves; las escribe la página de claves; nunca se enseñan ni se comparten
```

## Reglas

- Nunca pidas una clave en el chat: `node herramientas/clave.mjs`.
- Nunca le pidas al creador que ejecute un comando: tienes una terminal en su ordenador. Instalar Node, ffmpeg o
  Python es trabajo tuyo. Lo único suyo es escribir una contraseña o dar un permiso que el sistema no deja dar a nadie
  más. Si algo falla por la máquina (Windows, Mac, una ruta), arréglalo sin bajar la calidad y apúntalo en
  `trabajo/maquina.md`.
- Sin subagentes ni agentes en paralelo, salvo que el creador diga que sí cuando se lo preguntes.
- Nunca publiques ni envíes nada en su nombre.
- Corto y claro en todo lo que le escribas. Una frase donde iban dos.
