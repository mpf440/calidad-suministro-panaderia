# Experimento 03 · Distorsión, armónicos y eventos

## Objetivo

El objetivo de esta fase fue identificar la huella eléctrica de cargas no lineales y estudiar cómo se comporta la instalación durante eventos transitorios. Se analizaron formas de onda, FFT, THD, factor de cresta y posibles eventos de conmutación.

## Cargas no lineales

Las cargas no lineales no consumen corriente proporcional a la tensión. Rectificadores, fuentes conmutadas, iluminación LED y hornos de inducción absorben corriente en pulsos. Esto genera armónicos y hace que el factor de potencia verdadero pueda ser inferior al factor de desplazamiento.

## THD e IHD

El THD permite cuantificar la distorsión global de la señal, mientras que el IHD permite estudiar armónicos concretos. En un obrador moderno, estos índices son importantes porque los armónicos aumentan pérdidas, calentamiento y riesgo de resonancia.

## Eventos

Los disparos de protección no siempre se explican mediante valores RMS de régimen permanente. Pueden aparecer durante un arranque o una conmutación. Por eso se usa PicoScope para capturar la forma de onda instantánea, mientras que el MyeBox permite clasificar eventos de calidad del suministro.

## Conclusión

La distorsión y los eventos transitorios son dos dimensiones complementarias del diagnóstico. Una instalación puede parecer aceptable en régimen estable, pero fallar durante el arranque matinal por picos, huecos o corrientes pulsantes.
