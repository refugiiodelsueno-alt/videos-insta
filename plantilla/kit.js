// El kit de movimiento. Lo carga index.html antes de las escenas; cada escena lo usa como K.algo(...).
// Todo va sobre el timeline de la escena (tl) y empieza en un segundo t (casi siempre C["palabra"]).
// Nada usa Math.random: el azar lleva semilla, para que cada render salga igual.
(function () {
  function azar(semilla) {
    var a = (semilla >>> 0) || 1;
    return function () { a += 0x6d2b79f5; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  var K = {
    azar: azar,

    // Cámara: la escena entera se acerca y deriva todo el rato. Nada se queda quieto.
    camara: function (tl, sel, D, o) {
      o = o || {};
      tl.fromTo(sel, { scale: o.desde || 1.0, x: 0, y: 0 }, { scale: o.hasta || 1.08, x: o.x || -18, y: o.y || -24, duration: D, ease: "none" }, 0);
    },

    // Entra algo: desde desenfocado y algo más grande, con rebote. lado: "abajo", "arriba", "izq", "der" o nada.
    entrar: function (tl, sel, t, o) {
      o = o || {};
      var d = { abajo: { y: 140 }, arriba: { y: -140 }, izq: { x: -220 }, der: { x: 220 } }[o.lado] || {};
      tl.fromTo(sel, Object.assign({ opacity: 0, scale: o.escala || 1.25, filter: "blur(14px)" }, d),
        { opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)", duration: o.dur || 0.42, ease: "back.out(1.6)" }, t);
    },

    // Se va: rápido, con desenfoque, hacia un lado.
    salir: function (tl, sel, t, o) {
      o = o || {};
      var d = { abajo: { y: 160 }, arriba: { y: -160 }, izq: { x: -260 }, der: { x: 260 } }[o.lado] || { scale: 0.6 };
      tl.to(sel, Object.assign({ opacity: 0, filter: "blur(12px)", duration: o.dur || 0.28, ease: "power3.in" }, d), t);
    },

    // Golpe en una palabra: crece de golpe y vuelve. Para lo que la frase subraya.
    golpe: function (tl, sel, t, fuerza) {
      var f = fuerza || 1.18;
      tl.fromTo(sel, { scale: 1 }, { scale: f, duration: 0.09, ease: "power2.out" }, t).to(sel, { scale: 1, duration: 0.35, ease: "elastic.out(1, 0.45)" }, t + 0.09);
    },

    // Sacudida de toda la escena: un impacto, un choque, un número que asusta.
    sacudir: function (tl, sel, t, fuerza) {
      var f = fuerza || 16, r = azar(Math.round(t * 1000)), n = 7, i;
      for (i = 0; i < n; i++) tl.to(sel, { x: (r() - 0.5) * 2 * f * (1 - i / n), y: (r() - 0.5) * 2 * f * (1 - i / n), duration: 0.035, ease: "none" }, t + i * 0.035);
      tl.to(sel, { x: 0, y: 0, duration: 0.05 }, t + n * 0.035);
    },

    dibujar: function (tl, sel, t, dur) {
      document.querySelectorAll(sel).forEach(function (p) {
        var L = p.getTotalLength ? p.getTotalLength() : 1000;
        tl.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur || 0.8, ease: "power2.inOut" }, t);
      });
    },

    cascada: function (tl, els, t, cada, o) {
      (els || []).forEach(function (e, i) {
        tl.fromTo(e, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: (o && o.dur) || 0.25, ease: "back.out(2)" }, t + i * (cada || 0.015));
      });
    },

    zoomA: function (tl, sel, t, x, y, escala, dur) {
      tl.to(sel, { transformOrigin: x + "px " + y + "px", scale: escala || 2.2, duration: dur || 0.7, ease: "expo.inOut" }, t);
    },

    flecha: function (tl, svg, t, desde, hasta, o) {
      o = o || {};
      var s = typeof svg === "string" ? document.querySelector(svg) : svg, NS = "http://www.w3.org/2000/svg";
      var dx = hasta[0] - desde[0], dy = hasta[1] - desde[1], L = Math.hypot(dx, dy) || 1, k = o.curva || 0;
      var cx = (desde[0] + hasta[0]) / 2 - (dy / L) * k, cy = (desde[1] + hasta[1]) / 2 + (dx / L) * k;
      var col = o.color || "#ffffff", g = o.grosor || 8, pu = o.punta || 34, dur = o.dur || 0.45;
      var ax = hasta[0] - cx, ay = hasta[1] - cy, al = Math.hypot(ax, ay) || 1;
      ax /= al; ay /= al;
      var bx = hasta[0] - ax * pu, by = hasta[1] - ay * pu;
      var linea = document.createElementNS(NS, "path"), punta = document.createElementNS(NS, "path");
      linea.setAttribute("d", "M" + desde[0] + "," + desde[1] + " Q" + cx + "," + cy + " " + hasta[0] + "," + hasta[1]);
      punta.setAttribute("d", "M" + (bx - ay * pu * 0.6) + "," + (by + ax * pu * 0.6) + " L" + hasta[0] + "," + hasta[1] + " L" + (bx + ay * pu * 0.6) + "," + (by - ax * pu * 0.6));
      [linea, punta].forEach(function (p) {
        p.setAttribute("fill", "none"); p.setAttribute("stroke", col); p.setAttribute("stroke-width", String(g));
        p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round");
        s.appendChild(p);
      });
      var largo = linea.getTotalLength ? linea.getTotalLength() : L;
      tl.fromTo(linea, { strokeDasharray: largo, strokeDashoffset: largo }, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut" }, t);
      tl.fromTo(punta, { opacity: 0 }, { opacity: 1, duration: 0.12 }, t + dur * 0.85);
      return linea;
    },

    // ---- lo que se mueve por fórmula ----------------------------------------------------------------------------
    // Cuentas de tiempo: lim recorta a 0-1; tramo(t, a, b) va de 0 a 1 entre los segundos a y b; suave (suave en los
    // dos extremos), sale (frena al final) y entra (arranca despacio) son curvas de 0 a 1; mez(a, b, u) va de a a b.
    lim: function (x) { return Math.max(0, Math.min(1, x)); },
    tramo: function (t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); },
    suave: function (x) { return x * x * (3 - 2 * x); },
    sale: function (x) { return 1 - Math.pow(1 - x, 3); },
    entra: function (x) { return x * x * x; },
    mez: function (a, b, u) { return a + (b - a) * u; },

    // f(t) en cada fotograma, con el segundo de la escena (y una vez en el 0): trayectorias, saltos, giros, una
    // cámara que sigue a algo. Todo sale de t, así cada render es igual.
    reloj: function (tl, D, f) {
      var r = { t: 0 };
      f(0);
      tl.fromTo(r, { t: 0 }, { t: D, duration: D, ease: "none", immediateRender: false, onUpdate: function () { f(r.t); } }, 0);
    },

    // Interpola entre claves [[t, { x, y, z }], ...] y devuelve los valores en t. Sin curva, pasa por las claves sin
    // pararse en cada una (velocidad continua; solo arranca en la primera y frena en la última). Con curva, cada
    // tramo usa esa curva y para en cada clave.
    kf: function (t, claves, curva) {
      var n = claves.length, i, k;
      if (t <= claves[0][0]) return Object.assign({}, claves[0][1]);
      if (t >= claves[n - 1][0]) return Object.assign({}, claves[n - 1][1]);
      for (i = 1; i < n - 1 && t > claves[i][0]; i++);
      var b = claves[i], h = b[0] - claves[i - 1][0], u = K.tramo(t, claves[i - 1][0], b[0]), r = {};
      var val = function (j, key) { var c = claves[j][1]; return c[key] !== undefined ? c[key] : b[1][key]; };
      var tan = function (j, key) { return j <= 0 || j >= n - 1 ? 0 : ((val(j + 1, key) - val(j - 1, key)) / (claves[j + 1][0] - claves[j - 1][0])) * h; };
      for (k in b[1]) {
        if (curva) { r[k] = K.mez(val(i - 1, k), val(i, k), curva(u)); continue; }
        var u2 = u * u, u3 = u2 * u;
        r[k] = (2 * u3 - 3 * u2 + 1) * val(i - 1, k) + (u3 - 2 * u2 + u) * tan(i - 1, k) + (-2 * u3 + 3 * u2) * val(i, k) + (u3 - u2) * tan(i, k);
      }
      return r;
    },

    // Cámara sobre un mundo más grande que la pantalla: el punto (fx, fy) del mundo queda en (540, 1000) de la
    // pantalla, con zoom z. El mundo lleva transform-origin: 0 0. borroso: px de desenfoque de movimiento (K.latigazo).
    encuadre: function (mundo, fx, fy, z, borroso, o) {
      o = o || {};
      var e = typeof mundo === "string" ? document.querySelector(mundo) : mundo;
      e.style.transform = "translate(" + ((o.cx || 540) - fx * z).toFixed(2) + "px," + ((o.cy || 1000) - fy * z).toFixed(2) + "px) scale(" + z.toFixed(4) + ")";
      e.style.filter = borroso > 0.4 ? "blur(" + borroso.toFixed(1) + "px)" : "none";
    },

    // Desenfoque de latigazo en los cambios bruscos de cámara: un pico de fuerza px en cada segundo de la lista.
    latigazo: function (t, cortes, ancho, fuerza) {
      var a = ancho || 0.14, f = fuerza || 22, m = 0;
      cortes.forEach(function (c) { m = Math.max(m, f * (1 - Math.abs(t - c) / a)); });
      return m;
    },

    // Coloca un elemento en (x, y) con giro en grados y escala ex, ey (ey negativo: boca abajo). Para usar en K.reloj.
    pon: function (el, x, y, giro, ex, ey) {
      var e = typeof el === "string" ? document.querySelector(el) : el, sx = ex === undefined ? 1 : ex, sy = ey === undefined ? sx : ey;
      e.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) rotate(" + (giro || 0).toFixed(3) + "deg) scale(" + sx.toFixed(4) + "," + sy.toFixed(4) + ")";
    },

    // Crea un elemento desde su HTML, lo mete en cont y lo devuelve. estilo: CSS de más, en una cadena.
    crear: function (cont, html, estilo) {
      var c = typeof cont === "string" ? document.querySelector(cont) : cont, d = document.createElement("div");
      d.innerHTML = String(html).trim();
      var e = d.firstElementChild || d;
      if (estilo) e.style.cssText += ";" + estilo;
      c.appendChild(e);
      return e;
    },

  };
  window.K = K;
})();
