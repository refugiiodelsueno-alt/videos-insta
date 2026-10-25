# Investigación: el microondas y el wifi

Comprobado el 2026-10-25 (búsquedas web; Wikipedia y algunas webs no abren desde esta máquina, así que las frases vienen de los resúmenes de búsqueda).

## Misma banda
- Microondas a 2,45 GHz ± 50 MHz; wifi 2,4 GHz en 2,400–2,4835 GHz. «Microwave ovens operate in the 2.4 GHz frequency band, overlapping with the most widely used wireless local area network (WLAN) standard.» — PMC3522981 (Sensors, estudio de interferencias en 2,4 GHz). https://pmc.ncbi.nlm.nih.gov/articles/PMC3522981
- «Microwave ovens operating at 2450 MHz emit radiation with a wavelength of about 12 centimeters» — The Straight Dope. https://www.straightdope.com/21343269/what-keeps-microwave-radiation-from-leaking-out-the-oven-door
- El wifi de 5 o 6 GHz no se ve afectado. — scienceinsights.org/do-microwaves-affect-wifi-signals-and-how-to-fix-it

## La rejilla
- «the holes in the mesh of the door are typically on the order of 1-2 millimeters in diameter» (Straight Dope). «light waves are small enough to penetrate the holes, which allows you to watch your food» — Mental Floss. https://www.mentalfloss.com/science/physics/mesh-grate-microwave-purpose
- Matiz: la junta de la puerta (un «choke» de cuarto de onda) también frena mucho; atenuación típica 30–40 dB (Physics Forums). En el guion solo decimos que la rejilla frena la onda y deja pasar la luz.

## Potencia y fuga
- Microondas domésticos: unos 800–1.000 W.
- Router en Europa: «must not exceed a maximum effective isotropic radiated power (EIRP) of 20 dBm (100 mW)» — ETSI EN 300 328 (everythingrf.com; Qorvo). → 8.000–10.000 veces menos: decimos «miles de veces».
- Fuga permitida: «5 milliwatts (mW) of microwave radiation per square centimeter at approximately two inches from the oven surface» — 21 CFR 1030.10 (EE. UU.), citado en patente USPTO 10869274.
- «this interference can completely block services provided by such wireless systems» — PMC3522981. Un estudio de 2025 (IEEE): «WLAN performance degrades significantly when in proximity to an ageing oven».

## El mito del agua
- Christopher Baird (West Texas A&M), citando *Electromagnetics Explained* de Ron Schmitt: la «resonancia del agua» es un mito; «the first resonant peak occurs above 1THz». Calienta por calentamiento dieléctrico: el campo hace girar las moléculas. https://www.wtamu.edu/~cbaird/sq/2014/10/15/why-are-the-microwaves-in-a-microwave-oven-tuned-to-water/
- Se eligió por regulación y práctica: banda ISM de la UIT; onda de ~12 cm, cabe en un aparato de cocina y entra unos centímetros en la comida (maketecheasier).

## La banda que nadie quería
- La banda de 2,4 GHz se propuso en la reunión de la UIT de 1947 en parte para calentar por microondas (Wikipedia, «ISM radio band», vía búsqueda).
- «the ISM bands were considered unacceptable for radio communication because of harmful interference created by such equipment» (Wikipedia, vía búsqueda).
- La FCC (EE. UU.) aprobó el 9 de mayo de 1985 el uso sin licencia de espectro ensanchado en esas bandas; un documento IEEE 802.11 de 1994 las llama «garbage bands». https://www.ieee802.org/11/Documents/DocumentArchives/1994_docs/1194091_scan.pdf
- «despite the risk of interference with microwave ovens, the opening of the 2.400-2.500 GHz allowed the networking industry to develop several wireless network techniques» — CNP3 (UCLouvain).
- Alcance: la decisión es de EE. UU.; el wifi (802.11, 1997) salió de ahí.
