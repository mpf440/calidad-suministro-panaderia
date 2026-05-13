# Resultados de aprendizaje

## Proyecto Integrador · Calidad del Suministro Eléctrico  
### Caso C5 · Obrador de panadería industrial

Autores:

- Miguel Pomares Fernández
- Antonio Arcos Cortes
- Alejandro Rodriguez Fernandez

## 1. Comprensión del problema de calidad eléctrica

A lo largo de la práctica hemos aprendido a interpretar un problema de calidad de suministro no como un fallo aislado, sino como la combinación de varios fenómenos eléctricos que aparecen simultáneamente en una instalación real. En el caso del obrador de panadería industrial, el problema inicial era el disparo del diferencial general al conectar la maquinaria en cadena por la mañana. A partir de este síntoma, se ha estudiado la posible influencia del arranque simultáneo de cargas, el desequilibrio entre fases, la corriente de neutro, la presencia de cargas no lineales y la distorsión armónica.

Uno de los aprendizajes principales ha sido entender que una instalación puede funcionar aparentemente bien en régimen permanente, pero presentar problemas importantes durante transitorios de conexión o en determinados estados de carga. Por ello, no basta con medir únicamente tensiones o corrientes RMS, sino que es necesario observar también la forma de onda, el contenido armónico, el desfase entre tensión y corriente y el comportamiento del neutro.

## 2. Manejo de instrumentación de laboratorio

Durante el proyecto se ha trabajado con el entrenador Lucas-Nülle CO3209-8L, el osciloscopio PicoScope y el analizador de calidad Circutor MyeBox. Cada instrumento tiene una función diferente dentro del diagnóstico. El PicoScope permite observar la forma de onda instantánea y capturar transitorios rápidos, mientras que el MyeBox proporciona medidas agregadas y orientadas al cumplimiento normativo.

Se ha aprendido que ambos instrumentos no siempre muestran exactamente lo mismo porque responden a filosofías de medida distintas. El PicoScope muestra la señal en el dominio temporal con alta resolución, mientras que el MyeBox calcula parámetros de calidad mediante ventanas y agregaciones normalizadas. Esta diferencia es importante para no interpretar como error instrumental lo que realmente es una diferencia metodológica.

## 3. Modelado de cargas reales mediante equivalentes eléctricos

Otro aprendizaje importante ha sido representar una instalación real mediante cargas equivalentes R, RL y no lineales. En el caso de la panadería, se han agrupado los equipos en tres escenarios: arranque/preparación, amasado/formado y horneado intensivo. Cada escenario representa una situación distinta de funcionamiento del obrador.

Las cargas resistivas se han asociado principalmente a hornos o resistencias auxiliares; las cargas RL se han usado para representar motores, ventiladores, compresores o amasadoras; y las cargas no lineales se han relacionado con electrónica de potencia, iluminación LED, fuentes conmutadas y hornos de inducción. Este proceso ha permitido conectar la teoría de circuitos con un caso práctico de ingeniería.

## 4. Análisis de desequilibrio y corriente de neutro

Se ha comprobado que, cuando las tres fases no tienen cargas equivalentes, aparece corriente por el conductor neutro. Este fenómeno es especialmente importante en instalaciones con muchas cargas monofásicas repartidas de manera desigual entre fases.

El análisis de la corriente de neutro ha sido uno de los puntos clave del diagnóstico, ya que permite detectar desequilibrios que no se aprecian únicamente observando una fase aislada. También se ha entendido que los armónicos triples pueden sumarse en el neutro, agravando el problema de calentamiento y disparo de protecciones.

## 5. Interpretación del desfase y del factor de potencia

En las ramas RL se ha observado que la corriente se retrasa respecto a la tensión. Esto ha permitido relacionar experimentalmente el desfase con la presencia de inductancias asociadas a motores o compresores. A partir de este desfase se ha estudiado el factor de potencia de desplazamiento.

También se ha aprendido que en régimen no senoidal no basta con hablar únicamente de coseno de phi, porque el factor de potencia verdadero incluye tanto el desfase como la distorsión armónica. Esta diferencia es esencial en instalaciones modernas donde existen rectificadores, fuentes conmutadas o equipos con electrónica de potencia.

## 6. Análisis de distorsión armónica

La práctica ha permitido comprender que las cargas no lineales no consumen corriente de manera proporcional a la tensión. En lugar de una corriente senoidal, generan corrientes deformadas con contenido armónico. Para analizar este fenómeno se han usado conceptos como FFT, THD, IHD y factor de cresta.

La transformada de Fourier permite pasar del dominio del tiempo al dominio de la frecuencia, identificando qué armónicos están presentes en la señal. El THD permite cuantificar la distorsión global, mientras que los armónicos individuales ayudan a reconocer la huella eléctrica de cada tipo de carga.

## 7. Relación entre teoría, medida y normativa

Uno de los objetivos del proyecto ha sido no quedarse solo en la observación de ondas, sino conectar las medidas con criterios técnicos y normativos. Se han tenido en cuenta referencias como UNE-EN 50160, IEC 61000-4-30 e IEEE 1159 para interpretar la calidad de la tensión, los métodos de medida y la clasificación de eventos.

Este enfoque ha permitido transformar los datos de laboratorio en un dictamen técnico. El aprendizaje principal es que un ingeniero no solo mide, sino que debe justificar si una instalación cumple, si funciona de forma aceptable y qué medidas correctoras son necesarias.

## 8. Desarrollo de una herramienta web interactiva

Como parte del entregable se ha desarrollado una herramienta web interactiva que resume y visualiza el proyecto. La web incluye apartados de teoría, modelo de panadería, laboratorio, analizador de señales, evaluador de cumplimiento y dictamen.

Esta herramienta ha servido para integrar los conceptos teóricos con los resultados experimentales. Además, permite explicar visualmente los escenarios de carga, calcular parámetros eléctricos de señales, representar armónicos y justificar las conclusiones del caso cliente. Su función no es sustituir a los instrumentos profesionales, sino actuar como apoyo didáctico y de defensa técnica.

## 9. Trabajo con datos reales y reproducibilidad

El repositorio incluye documentos, capturas, medidas procesadas, código de la web y archivos asociados al PicoScope. Esto permite que el trabajo sea revisable y reproducible. La organización en carpetas diferencia claramente documentación, datos, experimentos, informe, web y resultados.

Este punto ha sido importante porque el objetivo no era entregar únicamente un informe final, sino construir un dossier técnico completo en el que se pueda seguir el razonamiento desde la medida original hasta el diagnóstico.

## 10. Conclusión de aprendizaje

El principal resultado de aprendizaje ha sido entender la calidad del suministro eléctrico como un problema multidisciplinar que combina circuitos, máquinas eléctricas, instrumentación, procesamiento de señal, normativa y criterio de ingeniería.

El caso de la panadería ha permitido comprobar que problemas como el disparo de protecciones pueden deberse a la suma de varios efectos: arranque simultáneo, desequilibrio de fases, corriente de neutro elevada, potencia reactiva y distorsión armónica. Por tanto, la solución no debe ser única, sino combinar medidas como arranque escalonado, redistribución de cargas, análisis del neutro, revisión de protecciones, corrección del factor de potencia y posible filtrado armónico.
