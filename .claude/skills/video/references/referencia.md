# La referencia

Solo hay referencia si el creador pasa un vídeo («hazlo como este», un enlace o un archivo). Si no pasa ninguno, no se
busca: el vídeo sale de `viral.md` y del estilo del creador.

`viral.md` manda siempre. La referencia decide lo demás: cómo se ve y cómo se mueve este vídeo. Cuántos planos y cuánto
dura cada uno, qué llena la pantalla, el estilo, si es 3D, foto o dibujo, el ritmo, dónde va el texto, qué suena. Su
hook se adapta solo si pasa las pruebas de `viral.md`. Si el vídeo es grabado y no animado, se copian su hook (si pasa)
y su ritmo; la imagen sale de `viral.md`.

## 1. Medirla

1. `node herramientas/referencia.mjs <enlace o archivo> --proyecto <proyecto>`: la baja, la mide (cortes, frases con su
   segundo, paleta, palabras por segundo, sonido) y deja hojas de fotogramas. Si el enlace no se puede bajar, pide el
   archivo al creador. Pon `"referencia": "referencia/reel.mp4"` en `guion.json`.
2. Mira `referencia/hoja-hook.jpg` y `hoja.jpg` a tamaño completo. Una cámara que sigue a algo parece un corte y no lo
   es: compruébalo en los fotogramas.
3. Escribe `referencia/referencia.md`:
   - **Una fila por plano:** sus segundos, qué llena el plano y cuánto, qué se mueve (la cámara y las cosas: hacia
     dónde y a qué velocidad), el texto en pantalla (dónde y de qué tamaño), qué se dice y qué suena.
   - **El hook:** qué hay en el fotograma 0, qué pasa en el primer segundo, la forma de su frase y si pasa las pruebas
     de `viral.md`.
   - **El estilo:** el fondo y los sitios, los colores y su papel (lo que importa, lo invisible que se explica, lo que
     está mal), el tipo de dibujo, cómo es el texto, cómo cambia de escena, el ritmo de la voz y el sonido.

## 2. Qué se copia

- Sus planos: cuántos, cuánto dura cada uno, qué llena la pantalla, desde dónde, qué se mueve y cómo, cómo cambia de
  uno a otro.
- Dónde va su texto y de qué tamaño (si no lleva subtítulo, el nuestro tampoco: `"subtitulos": "no"`).
- Su estilo: fondo, colores, dibujo, ritmo. Pasa sus colores y su letra a `estilo.css` del proyecto.
- Cuándo suena cada cosa y cuánto.
- Su hook, solo si pasa las pruebas de `viral.md`, y más o menos cuánto dura (`guion.md`).

## 3. Qué nunca se copia

Sus palabras, sus dibujos tal cual y su voz: todo se escribe y se dibuja de nuevo, para este tema. Tampoco nada que
rompa `viral.md`, aunque la referencia lo haga. Su música no va dentro del vídeo: si la tiene, dile al creador cuál es,
por si puede ponerla desde la biblioteca de la red social. Sus datos no son datos: se comprueban o se quitan.

## 4. Qué puede cambiar

Solo lo que obliga el tema, `viral.md` y el cierre del creador. Cada cambio, con su razón en `notas.md` («el nuestro es
un planeta, no un coche»). «Queda mejor» no es una razón. Si el tema no cabe en su formato, díselo al creador en una
línea y copia solo lo que encaje.

## 5. Es la vara

`revisar.mjs` mide el vídeo contra ella (movimiento, pantalla llena) y saca `comparacion.jpg`, el nuestro y el suyo en
los mismos segundos. Un plano que se separa del suyo sin una razón escrita se arregla. Sin referencia, mide contra unos
mínimos: que nada esté quieto ni vacío.

## Un estilo para siempre

Si el creador quiere el aspecto de un vídeo en todos los suyos (colores, dibujo, letra), guárdalo en
`trabajo/estilo/` (el vídeo, su estilo en `estilo.md` y su `estilo.css` en `trabajo/estilo.css`, que copia cada
proyecto nuevo). Ese aspecto manda sobre el de la casa y sobre el de cualquier referencia.
