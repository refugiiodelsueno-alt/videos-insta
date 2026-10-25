# Las escenas

Cada escena es un archivo `escenas/<nombre>.html` que dibuja lo que dicen sus frases y lo mueve en sus palabras. Parte
de `escenas/_plantilla.html` (2D) o `escenas/_plantilla-3d.html` (3D): las reglas técnicas están ahí. `montar.mjs` pone
cada escena en su segundo, entra en ella como dice `guion.json` (corte si no dice nada) y le escribe dentro el tiempo
de cada palabra: `C["rueda"]` es cuándo se dice «rueda», contado desde que empieza la escena.

Cómo se ve y cómo se mueve está en `viral.md` («La imagen» y «El movimiento»), y manda. El aspecto (fondo, colores,
letra) está en `estilo.css` del proyecto: el del creador si tiene uno, o el de la casa. Si el creador pasó un vídeo,
sus planos, su ritmo y su estilo salen de él (`referencia/referencia.md`).

## Antes de dibujar: el plan

Escribe `plan.md` antes de la primera escena. Arriba, una vez para todo el vídeo: la cosa que vuelve siempre, el
momento de su vida (si lo hay), el color de lo invisible, cada movimiento de cámara con su palabra y dónde cambia de
sitio. Debajo, una fila por frase del guion:
- **La frase** y su palabra clave.
- **La referencia en ese momento,** si la hay: su plano (de `referencia.md`): qué llena la pantalla, desde dónde, qué
  se mueve.
- **Lo nuestro:** la cosa real de este tema que hace lo que dice la frase, en ese mismo encuadre, tamaño y movimiento.
- **Cuándo cambia:** la palabra en la que pasa cada cosa.
- **Qué le deja a la siguiente:** qué sigue en pantalla, para que una frase continúe a la anterior.
- **Lo que hace falta:** modelos 3D, fotos o mapas reales, de dónde salen y su licencia.

Leyendo solo la columna «lo nuestro», alguien tendría que poder contar el vídeo. Una escena es un sitio: varias frases
seguidas van en la misma escena mientras se siga en el mismo sitio (si hay referencia, mientras ella siga en el mismo
plano). Lo que sale
en más de una escena (el objeto, el sitio) se hace una vez en `recursos/mundo.js` y cada escena lo importa, para que
sea siempre la misma cosa a la misma escala.

## Qué se dibuja

- **La cosa real, con detalle de verdad:** medidas reales (busca una foto o la ficha técnica), interfaces con su texto
  real, texturas (la piel, la tela, el metal que refleja), en el estilo del vídeo. Si algo parece un emoji, un
  icono genérico o un dibujo de libro infantil, se redibuja de verdad o se quita.
- **Con volumen:** luz que da brillo por un lado y sombra por el otro, también en 2D (degradados, sombras suaves).
- **3D con un modelo bueno.** Búscalo libre, en .glb o .gltf, y bájalo a `recursos/` antes de montar: los modelos de
  ejemplo de Khronos (github.com/KhronosGroup/glTF-Sample-Assets) y de three.js, Poly Haven, Kenney y Quaternius (CC0),
  o Sketchfab con licencia CC0 o CC-BY (pide cuenta). Apunta en `notas.md` de dónde sale y su licencia; si es CC-BY, el
  autor va en `pie.txt`. Antes de usarlo, míralo: qué tamaño tiene, hacia dónde mira y si trae piezas que sobran (una
  matrícula con un logo). Si no hay un modelo bueno, no lo modeles a mano con formas simples (queda de juguete):
  dibújalo con detalle en 2D.
- **Las comparaciones, con la cosa de verdad:** si el guion dice «como un imán», sale un imán.
- **Se lee en un móvil:** nada de texto que diga algo por debajo de 32 px. Lo importante, fuera de las franjas de los
  botones de la red social (abajo y a la derecha).

## El movimiento

- Cuánto y cómo se mueve (la cámara, los cortes, la velocidad): `viral.md`, «El movimiento»; si hay referencia, como
  ella.
- Nada arranca ni para de golpe, salvo un choque que se ve:
  - en 3D, la cámara con `camino()`, que pasa por sus puntos sin pararse en cada uno, y la mirada que sigue a algo con
    `seguir()`, con un peso que sube y baja con `suave()`, nunca de golpe;
  - lo que se mueve sale y llega con su velocidad: si un tramo acaba quieto, el siguiente arranca desde quieto; si
    acaba rápido, el siguiente sigue rápido;
  - algo que aparece crece o entra, no salta de 0 a 1 en un fotograma (tampoco un chorro, una transparencia o una
    pieza que se enseña).
- Al cambiar de tramo de cámara, el punto donde acaba uno es donde empieza el siguiente (posición y adonde mira).
- `revisar.mjs` mide los tirones; mira cada uno en `tirones.jpg`.

## Escribir poco

- Escribe varias escenas en un mismo mensaje, una tras otra, y revisa después.
- Para arreglar algo, cambia solo esas líneas (Edit). No reescribas la escena entera.
- Todo lo que necesitas del kit está aquí abajo: no leas `kit.js`, `kit3d.js` ni el código de `herramientas/`.

## Los tiempos dentro de una escena

`C["palabra"]` es el segundo en que se dice esa palabra, desde que empieza la escena (en minúsculas, sin tildes ni
signos); `C["palabra#2"]` la segunda vez; `C["@1"]`, `C["@2"]`... el principio de cada frase de la escena; `C["@fin"]`
el final de la última. `D` es lo que dura la escena. Cada movimiento empieza en uno de ellos, nunca en un segundo
escrito a mano. Lo que dura cada escena lo imprime `voz.mjs` al terminar.

## El kit de movimiento (2D): `K`

Cargado en todas las escenas. `tl` es el timeline de la escena, `t` un segundo (casi siempre `C["palabra"]`), `sel` un
selector o un elemento y `cont` el elemento donde se crean cosas nuevas.

| Uso | Para qué |
|---|---|
| `K.camara(tl, sel, D, { desde: 1, hasta: 1.08, x: -18, y: -24 })` | la escena entera se acerca y deriva todo el rato |
| `K.entrar(tl, sel, t, { lado: "abajo" \| "arriba" \| "izq" \| "der", escala: 1.25, dur: 0.42 })` | entra desde desenfocado y más grande, con rebote |
| `K.salir(tl, sel, t, { lado, dur: 0.28 })` | se va rápido, con desenfoque |
| `K.golpe(tl, sel, t, 1.18)` | subraya una palabra: crece de golpe y vuelve |
| `K.sacudir(tl, sel, t, 16)` | un impacto, un choque, un número que asusta |
| `K.dibujar(tl, "#__ID__ path", t, 0.8)` | trazos SVG (path, line, polyline, circle) que se pintan |
| `K.flecha(tl, svg, t, [x, y], [x, y], { curva: 120, color, grosor: 8, punta: 34, dur: 0.45 })` | una flecha que se dibuja de un punto a otro; `svg` con `viewBox="0 0 1080 1920"` |
| `K.cascada(tl, els, t, 0.015, { dur: 0.25 })` | aparecen uno tras otro en medio segundo |
| `K.zoomA(tl, sel, t, x, y, 2.2, 0.7)` | la cámara entra hasta el punto (x, y) |
| `K.crear(cont, html, "css extra")` | crea un elemento desde su HTML y lo devuelve |
| `K.azar(semilla)` | una función que da números de 0 a 1, siempre los mismos |

Para lo que se mueve por fórmula (un salto, una trayectoria, una cámara que sigue a algo):

| Uso | Para qué |
|---|---|
| `K.reloj(tl, D, (t) => { ... })` | la función se llama en cada fotograma con el segundo de la escena |
| `K.kf(t, [[0, { x: 0, z: 1 }], [C["sube"], { x: 300, z: 1.6 }]])` | los valores en `t`, pasando por las claves sin pararse en cada una |
| `K.encuadre(mundo, fx, fy, z, borroso)` | el punto (fx, fy) del mundo queda en (540, 1000) de la pantalla con zoom z; el mundo, con `transform-origin: 0 0` |
| `K.latigazo(t, [cortes], 0.14, 22)` | cuánto desenfoque poner cerca de un cambio brusco de cámara (para `encuadre`) |
| `K.pon(el, x, y, giro, ex, ey)` | coloca un elemento (giro en grados; `ey` negativo, boca abajo) |
| `K.tramo(t, a, b)`, `K.mez(a, b, u)`, `K.suave(u)`, `K.sale(u)`, `K.entra(u)`, `K.lim(x)` | de 0 a 1 entre dos segundos, mezclar, curvas |

## El kit 3D: `kit3d.js`

```html
<canvas id="__ID__-3d" width="1080" height="1920" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
<script type="module">
  import { estudio, cargar, camino, seguir, poner, suave, V } from "./kit3d.js";
  const C = __CUES__, D = __DURACION__;
  const tl = gsap.timeline({ paused: true });
  const E = estudio("#__ID__-3d", { fondo: "#0d1014" });   // el fondo y la luz de la referencia
  const objeto = await cargar(E, "recursos/objeto.glb");
  E.cada(tl, D, (s) => {                                     // cada fotograma, desde su segundo s
    poner(objeto, V(0, 0, 0), V(1, 0, 0), V(0, 1, 0));
    camino(E, s, [[0, V(7, 2.5, 9), V(0, 0.6, 0)], [C["pieza"], V(2, 0.4, 2.2), V(1.3, 0.4, 0.9)]]);
    seguir(E, objeto, 0.5 * suave(C["sale"], C["sale"] + 0.4, s));
  });
  window.__timelines["__ID__"] = tl;
</script>
```

- `estudio(sel, o)`: `o` acepta `fondo` (sin fondo, transparente), `niebla: false`, `nieblaDesde`, `nieblaHasta`,
  `ambiente`, `luz`, `exposicion`, `lente`, `suelo: false`, `sueloColor`. Devuelve `E` con `E.tres` (la librería:
  `new E.tres.Mesh(...)`; no escribas el nombre de la librería en mayúsculas, el check lo rechaza), `E.scene`,
  `E.camera`, `E.sol` (la luz principal), `E.mira` (adonde mira la cámara), `E.cada(tl, D, f)`, `E.sombras(objeto)`.
- `fondoDegradado(E, ["#arriba", "#medio", "#abajo"])`: un fondo de color en degradado, sin horizonte.
- `cargar(E, "recursos/x.glb", escala)` devuelve el modelo, ya con sombras y en la escena (con `await`).
- `V(x, y, z)` un punto; `suave(a, b, s)` va de 0 a 1 entre los segundos a y b, arrancando y frenando suave.
- `camino(E, s, [[segundo, posición, adonde mira], ...])`: la cámara pasa por sus puntos sin pararse en ninguno; solo
  arranca en el primero y frena en el último. Un corte es otra llamada a `camino` con otros puntos.
- `seguir(E, cosa, peso)`: la mirada se va hacia la cosa con ese peso (0 a 1). El peso, siempre con `suave()`.
- `poner(cosa, posición, avance, arriba)`: coloca algo mirando con su eje X hacia `avance` y su eje Y hacia `arriba`.
- `flecha(E, color, grosor)` y `apuntar(flecha, desde, hacia, k)`: una flecha 3D que crece con k de 0 a 1.
- `chorro(E, n, color)` y `.poner(origen, dirección, s, fuerza, largo, abre)`: aire, humo o polvo que sale de un punto;
  la fuerza, con `suave()`.
- Materiales: `mat.pintura(color)`, `mat.metal(color)`, `mat.cristal(color)`, `mat.goma()`, `mat.plastico(color)`,
  `mat.luz(color, fuerza)`. También `RoundedBoxGeometry`.
- Ver por dentro (transparencia): pon `transparent = true` en esos materiales desde el principio y cambia solo
  `opacity`. Si cambia de opaco a transparente a mitad, la imagen pega un salto. Deja como están el cristal y lo que
  se ve a través de él: el cristal solo deja ver lo opaco.
- Los modelos se bajan antes de montar, nunca durante el render.

## Sonido

Solo si el creador dijo que sí. Un efecto por cada cosa que pasa en pantalla y suena, y nada más (`viral.md`, «El
sonido»).

1. De `plan.md`, apunta qué cosas que se ven suenan: un golpe, algo que se abre, aire que sale, un motor que arranca.
   Un cambio de escena, un texto o una flecha no suenan.
2. Escríbelas en `sonidos.json` (formato completo: `node herramientas/sonido.mjs --ayuda`): cada una, lo que suena
   descrito por su material y su forma en el tiempo, en inglés («A palm slapping onto a hose opening: one suction
   thump, muffled»), cuánto dura, en qué palabra pasa, si su golpe cae en la palabra o empieza en ella, y cuántos dB
   por debajo de la voz (de -3, el golpe que manda en el hook, a -16, un detalle).
3. `node herramientas/sonido.mjs <proyecto>`: los genera, los coloca y les da su volumen frente a la voz. Si earshot
   está instalado, comprueba que cada uno suene a lo que se ve: el que «no suena a» se reescribe o se quita.

## Revisar

`node herramientas/revisar.mjs <proyecto>` lo hace todo: rehace la voz si cambió el guion, monta, comprueba, hace el
borrador, lo mide contra la referencia y saca las hojas. Tarda unos minutos: espera a que acabe, sin mirarlo a cada
rato.

1. **Las medidas.** Si no pasan, dicen qué escena y qué segundo: arréglalo ahí y vuelve a revisar.
2. **Las hojas.** Cuando pasan, mira y apunta todo lo que veas:
   - `comparacion.jpg` (si hay referencia), el nuestro y el suyo en los mismos segundos: ¿llena igual, se mueve igual,
     se ve igual de bien? Un plano que se separa sin una razón escrita se arregla.
   - `hoja.jpg`: algo que aparece de la nada, un fotograma vacío o a medio dibujar, texto que no se lee, una imagen que
     llega después de su palabra, y el hook: ¿pararía a alguien que no te sigue? Si dudas, no.
   - `cortes.jpg` (cada cambio de escena: justo antes, en mitad del cambio y justo después): un salto sin razón, un
     fogonazo, un apagón, algo que desaparece de golpe o que se corta a medio camino.
   - `tirones.jpg` (cada tirón medido, fotograma a fotograma): la cámara que frena en seco, algo que arranca sin
     acelerar, una mirada que salta. Un choque que se ve vale; lo demás se arregla («El movimiento», arriba).
3. **Arregla todo lo que viste de una vez** y vuelve a revisar con `--escenas <las que tocaste>`. Si ya no encuentras
   nada, entrega.

Apunta cada arreglo en una línea en `notas.md`.
