# Los puntitos del cielo azul son tus glóbulos blancos

Pedido el 2026-10-26.

- Un solo mundo (`recursos/mundo.js`) y un solo reloj (g = G0 + s): cielo, ojo, corte del ojo, capilar y HUD en el
  mismo SVG; el último fotograma es el primero.
- La cámara interpola solo las claves de cada escena: con todas juntas, el fotograma justo antes de un corte caía a
  medio camino entre dos mundos y salía en negro (9,37 y 14,44).
- El primer plano de la retina se dibuja tres veces más ancho que la pantalla para que el zoom desde el corte del ojo
  funda a pantalla llena, sin un recuadro flotando.
- Los vasos que se dibujan con `stroke-dasharray` y punta redonda dejan un punto en cada inicio aunque midan 0: se
  ocultan hasta que empiezan a dibujarse.
- Colas de los puntitos con tope de 52 px: en los latidos parecían pelos.
