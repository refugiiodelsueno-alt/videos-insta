# Plan — Tu impresora esconde un código secreto en cada hoja

## Para todo el vídeo
- **La cosa que vuelve siempre:** un folio A4 impreso en la oficina (un «acta de reunión» en letra de oficina, tóner
  negro, papel con su fibra). Sale en el hook, en la luz azul, por dentro en el código, saliendo de la impresora y en el
  cierre. El billete y el documento de 2017 son «otra hoja» que sale de la misma impresora / se mira con la misma lupa.
- **El momento de su vida:** la hoja que dejas olvidada en la bandeja de la impresora del trabajo (vuelve en el cierre).
- **Color de lo invisible:** amarillo tóner (#ffd21f) con brillo, solo para los puntos y la cuadrícula. Rojo para «falso».
  La luz azul es luz (tiñe la hoja), no un color de marcas.
- **Física real:** con luz azul el amarillo absorbe el azul y los puntos se ven **oscuros** sobre la hoja azulada; luego
  se marcan en amarillo encima.
- **Cámara:** 2D, un mundo (la hoja de 1000×1414) con cámara propia (`cam()` en `recursos/mundo.js`). Cambios de sitio:
  solo a la impresora (barrido), al documento de 2017 (barrido) y vuelta a la impresora (barrido). Al código se entra con
  zoom (es entrar en la cuadrícula). Hook → luz azul y impresora → billete siguen sin corte.
- **Lectura:** la franja 318–540 es del subtítulo: arriba siempre oscuro (sombra de mesa). Nada importante a la derecha
  de x≈940 ni por debajo de y≈1450.

## Frase a frase

| # | Frase (clave) | Lo nuestro | Cuándo cambia | Le deja a la siguiente |
|---|---|---|---|---|
| 1 | Las hojas que imprimes en el trabajo llevan un mensaje escondido (escondido) | Fotograma 0: el folio llena la pantalla de 600 hacia abajo, con su textura; una lupa de verdad (aro metálico, cristal con reflejo, mango de goma) ya está deslizándose sobre el texto y dentro brillan cientos de puntos amarillos que fuera no se ven. La cámara se acerca despacio. | «escondido»: la lupa se para y los puntos laten | La lupa sobre la hoja |
| 2 | Y no lo ves… en amarillo, con puntitos… a simple vista no se distinguen (amarillo) | «no lo ves»: la lupa se aparta, la hoja queda en blanco. «amarillo»: vuelve, etiqueta «puntos amarillos» con línea fina a un punto. «simple vista»: la lupa sale de cuadro y la cámara se acerca sin ella: no hay nada. | no lo ves / amarillo / simple vista | La hoja sola, entera |
| 3 | Pero si iluminas la hoja con luz azul, aparecen cientos, en una cuadrícula que se repite por toda la página (luz azul) | Misma hoja. Una linterna de luz azul entra arriba a la izquierda; su luz baja por la hoja y la tiñe; donde pasa aparecen los puntos, oscuros. «cuadrícula»: un recuadro amarillo rodea un grupo de 15×8. «repite»: la cámara se aleja a la página entera y los recuadros se encienden uno tras otro por toda la hoja. Al final la cámara entra en un recuadro. | iluminas / cientos / cuadrícula / repite | Un recuadro en primer plano |
| 4 | Cada punto es un uno, y cada hueco, un cero (uno) | Dentro del recuadro, de cerca: la fibra del papel y los puntos de tóner amarillo en su rejilla. «uno»: un punto se marca con «1». «cero»: un hueco con «0». Luego se llena toda la rejilla de unos y ceros. | uno / cero | La rejilla con sus cifras |
| 5 | Y juntos dicen el número de serie… el día y la hora exactos (número de serie) | Las columnas se iluminan por grupos y se leen: «N.º de serie 5048 3172», «día 25/10/2026», «hora 08:47» (la de hoy, la de tu hoja), cada uno con su línea a sus columnas. | serie / día / hora | — (cambio de sitio) |
| 6 | Lo hacen muchas impresoras láser a color, y las marcas no te lo cuentan (láser) | Barrido a la impresora láser de oficina, de cerca: frontal gris claro, ranura de salida con rodillos, pantalla. La hoja sale por la ranura. «color»: por un corte se ven los cuatro tóners C M Y K y el amarillo se enciende. «no te lo cuentan»: la pantalla dice «Listo» y nada más. | impresoras / color / marcas | La impresora |
| 7 | ¿Para qué? Para que nadie pueda imprimir billetes falsos sin dejar rastro (billetes) | Sin corte: ahora por la ranura sale un billete (inventado, guilloches, «100»). «falsos»: sello rojo FALSO. «rastro»: la luz azul lo barre y aparece la cuadrícula amarilla encima. | billetes / falsos / rastro | — (cambio de sitio) |
| 8 | En 2017 se filtró a la prensa un documento secreto… en la copia publicada estaban los puntos (secreto) | Barrido a un documento escaneado en gris con cabecera «ALTO SECRETO» y líneas tachadas (recreación, no copia). «filtró»: se desliza a una página de periódico digital. «publicada»: sello «copia publicada». «puntos»: la lupa pasa y aparecen los puntos amarillos. | filtró / publicada / puntos | El documento con la cuadrícula |
| 9 | Decían la impresora, el día, 9 de mayo, y la hora: 6:20 (6:20) | Al lado de la cuadrícula se escriben «impresora n.º 29535218», «día 9 de mayo de 2017», «hora 6:20», cada uno en su palabra, con «Fuente: Errata Security, CBS» en gris pequeño. | impresora / día / hora | — (cambio de sitio) |
| 10 | Así que esa hoja que dejaste en la impresora no es anónima: lleva tu hora firmada (firmada) | Barrido a la impresora: la hoja del principio olvidada en la bandeja. «anónima»: la lupa pasa. «firmada»: en la lupa los puntos se ordenan y se lee «08:47» en amarillo. | anónima / firmada | La hoja en la bandeja |
| 11 | Envíaselo a ese compañero que lo imprime todo (Envíaselo) | La cámara se aleja: todo es un reel en un móvil; un dedo toca enviar, sale la lista y toca «Compañero (curro)» → «Enviado». Detrás sigue la hoja. | Envíaselo / compañero | Fin |

## Lo que hace falta
- Todo dibujado en 2D con detalle (SVG y degradados). Sin modelos 3D: una impresora de modelo simple quedaría de
  juguete.
- `recursos/papel.png`: textura de papel generada aquí (ruido + fibras), sin licencia de terceros.
- Letra del acta: Carlito (OFL, la métrica de la letra de oficina).
- Nada de marcas reales: impresora, billete y documento son inventados.
