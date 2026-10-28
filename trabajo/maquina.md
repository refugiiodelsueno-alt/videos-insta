# La máquina

- Sin GPU (Chromium pinta por software): un filter blur dentro de un mundo escalado ×40 hace que el check de hyperframes no acabe. Ocultar lo difuminado cuando la cámara está muy cerca.
- Sin GPU, un fotograma 3D a pantalla completa (gato con pelaje `sheen`, astronauta, entorno de luz) cuesta ~0,5 s, y
  `hyperframes check` barre el vídeo entero a 7,5 fps con un plazo fijo de 120 s: no cabe. `revisar` ahora, si el check
  se queda sin plazo, lo pasa por tramos de 5 s (`--range`), que mira lo mismo. Y las escenas no repintan un segundo ya
  pintado.
