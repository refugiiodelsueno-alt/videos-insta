# El guion

El guion es el vídeo. Se escribe con `viral.md`, que manda siempre. Si el creador pasó un vídeo (la referencia), solo
ayuda en dos cosas:
- **Su hook,** si pasa las pruebas de `viral.md`: es el mejor punto de partida. Se coge su forma y se llena con la cosa
  y las palabras de este tema. Si no las pasa (empieza por una fecha, suena a documental), no se usa.
- **Cuánto dura:** más o menos lo que ella, si la historia cabe. Nunca se alarga para llegar.

Su manera de contar nunca pasa por encima de `viral.md`.

## Primero, cuatro líneas

1. **Quién lo ve:** el público de `trabajo/preferencias.md`. Qué usa, ve o cree que este tema toca.
2. **El tirón:** lo que hace que este tema sea casi increíble para esa persona. Uno, no tres.
3. **La pregunta:** la que deja el hook en la cabeza. Se contesta del todo solo al final.
4. **La prueba:** los datos de `investigacion.md` que la contestan, cada uno con un número o una cosa con nombre.

## El hook

- Escribe cuatro, cada uno con otra de las formas de `viral.md` (el de la referencia, si sirve, es uno). Cada uno con
  su imagen: qué llena el fotograma 0 y qué se mueve.
- Los cuatro pasan las cinco pruebas de `viral.md`.
- Elige comparándolos de dos en dos: ¿con cuál se pararía más gente que no te sigue? Nunca con nota. Si dudas, el más
  simple. Los otros tres quedan de reserva.

## El cuerpo

- Escribe el final justo después del hook: la frase que contesta su pregunta y le da la vuelta. El cuerpo es el camino
  de uno a otro.
- La primera frase descarta lo que el espectador ya está pensando, o dice la pregunta en voz alta.
- Cada frase contesta lo que dejó la anterior y abre lo siguiente. Una idea por frase, con su porqué dentro («...,
  así que...», «..., porque...»); lo que pasa primero y el nombre después.
- Cada frase se tiene que poder ver: si no se puede enseñar de forma llamativa, se reescribe o se quita.
- Las palabras son nuevas: nunca las de la referencia ni las de otro vídeo. Las comparaciones, del tema y de la vida
  diaria del público.
- La voz se graba de una toma, como habla una persona: no se estira para encajar en segundos fijos.
- **Cierre:** el de `trabajo/preferencias.md`, tal cual.

## Los datos

Cada cifra, nombre y fecha está en `investigacion.md` con su fuente y la frase exacta, comprobada hoy. Nunca inventes
una cifra; si dudas, quítala y dilo. Redondea solo hacia lo honesto («unos», «más de» solo si es verdad) y conserva el
alcance («en EE. UU.», «según la propia empresa»). Lo que dice un vídeo de referencia no es un dato.

## guion.json

```json
{
  "titulo": "...", "slug": "...", "idioma": "es",
  "subtitulos": "arriba",
  "aperturas": [
    { "id": "h1", "escena": "hook", "frases": [ { "texto": "El hook, dicho.", "clave": "palabra" } ] }
  ],
  "reserva": [
    { "id": "h2", "escena": "hook-2", "frases": [ { "texto": "...", "clave": "..." } ], "imagen": "qué llena la pantalla y qué se mueve" }
  ],
  "cuerpo": [
    { "texto": "Una frase.", "escena": "nombre-de-escena", "clave": "palabra" }
  ],
  "escenas": { "nombre-de-escena": { "entrada": "corte" } }
}
```

- `referencia`: solo si el creador pasó un vídeo (`referencia.md`).
- `texto` es lo que dice la voz y lo que sale en el subtítulo. `dicho` (opcional) es cómo debe sonar si es distinto
  (números en letra, siglas: «IA» como «i a»).
- `clave`: la palabra de la frase que va en su recuadro. Una por frase como mucho. Leídas de arriba abajo, las claves
  deberían contar el vídeo.
- `escena`: en qué escena va cada frase. Una escena es un plano (un sitio y su cámara): varias frases seguidas van en
  la misma escena mientras se sigan viendo en el mismo plano.
- `escenas.<nombre>.entrada`: cómo se entra en esa escena: `corte` (lo de siempre si no dices nada), `fundido`,
  `zoom`, `barrido` o `lateral`.
- `subtitulos`: `arriba` (lo de siempre), `abajo` o `no`, como la referencia si la hay.
- El cuerpo es el mismo para todas las aperturas: su primera frase tiene que seguir bien a cada hook.
- `pie.txt`: el texto del post. La primera línea engancha; sin hashtags ni rayas largas; el valor va en el texto.

## Antes de enseñarlo

1. `node herramientas/guion.mjs <proyecto>` comprueba lo que se puede comprobar solo: cómo empieza cada hook y si
   suena a noticia o a anuncio. Lo que diga se reescribe, y se vuelve a pasar hasta que no diga nada. Si el texto lo
   trajo el creador, no se reescribe: solo se le avisa.
2. Una pasada entera como alguien que pasa de largo (`viral.md`, «Antes de enseñar nada»): la frase en la que te irías
   o que un niño no entendería se reescribe en esa misma pasada.
3. Enséñalo en el chat: el hook y el cuerpo, y debajo los tres de reserva en una línea cada uno. En el mismo mensaje,
   dos preguntas cortas: si lo aprueba, y «¿Le pongo efectos de sonido?». Apunta la respuesta en `guion.json` como
   `"sonido": true` o `false`.
