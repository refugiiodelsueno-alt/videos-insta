# Tu voz en los audios

Pedido el 2026-10-26 (tema elegido por mí: «vamos a por el siguiente»).

- Mismo esquema que dedos: un mundo, un reloj, cámara monótona con zoom logarítmico, cierre en F0.
- Fallo de la primera pasada: los degradados creados con `el()` apuntaban a `#c-…` y los defs se renombran por escena
  (`c1-…`): la piel y el cráneo salían sin relleno. Ahora `el()` reescribe `url(#c-` con el prefijo de la escena.
- Las ondas del móvil se dibujan detrás de la cabeza (si no, cruzan la cara como líneas verticales).
- El experimento estaba quieto de 41,9 a 43,5 s: las cuatro voces suenan por turnos y la cámara se acerca despacio.
- La portada va en 3,3 s («tu voz de verdad» entera), no en 1 s, que cortaba la frase.
- ElevenLabs no acepta efectos de menos de 0,5 s.
