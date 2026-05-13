# Demo / presentación del proyecto

## Proyecto Integrador · Calidad del Suministro Eléctrico  
### Caso C5 · Obrador de panadería industrial

Autores:

- Miguel Pomares Fernández
- Antonio Arcos Cortes
- Alejandro Rodriguez Fernandez

## 1. Introducción

Este proyecto estudia la calidad del suministro eléctrico en un obrador de panadería industrial. El cliente simulado presenta problemas de disparo del diferencial general al conectar la maquinaria en cadena durante el arranque de la jornada. A partir de este síntoma, el grupo ha trabajado como una consultora eléctrica, realizando medidas, modelando escenarios de funcionamiento y elaborando un diagnóstico técnico.

La instalación se ha representado mediante tres escenarios principales: arranque/preparación, amasado/formado y horneado intensivo. En cada uno se han agrupado las cargas reales de la panadería en equivalentes eléctricos formados por resistencias, inductancias y cargas no lineales.

## 2. Material empleado

Durante la práctica se han utilizado los siguientes recursos:

- Entrenador Lucas-Nülle CO3209-8L.
- Osciloscopio PicoScope 2205A / 2204A.
- Analizador de calidad Circutor MyeBox.
- Bancos de cargas R, L y C.
- Capturas de tensión y corriente.
- Archivos de datos exportados desde PicoScope.
- Documentación técnica sobre calidad del suministro.
- Herramienta web desarrollada en React/Vite.

## 3. Web interactiva

La web desarrollada actúa como una herramienta de apoyo para explicar el proyecto y defender el dictamen técnico. Incluye las siguientes secciones:

- Inicio: presentación del caso y objetivos.
- Teoría: explicación de RMS, THD, FFT, factor de potencia, potencia de distorsión, corriente de neutro y resonancia.
- Panadería: modelado de los tres escenarios de funcionamiento.
- Laboratorio: puntos de medida y justificación experimental.
- Analizador: cálculo didáctico de parámetros a partir de formas de onda.
- Evaluador: comparación con criterios de calidad eléctrica.
- Dictamen: conclusiones técnicas y medidas de mitigación.

Enlace a la web:

https://calidad-suministro-elctrico-panaderia.netlify.app

## 4. Experimentos realizados

### Experimento 1: reconocimiento de la instalación

Se caracterizó el comportamiento de la instalación con cargas lineales y diferentes repartos entre fases. Se midieron tensiones fase-neutro, corrientes de fase y corriente de neutro. El objetivo fue obtener una huella inicial o baseline del sistema.

### Experimento 2: escenario de amasado y formado

Se introdujeron cargas RL para representar motores de amasadoras, cintas o sistemas de ventilación. Se observó el desfase entre tensión y corriente y se relacionó con la presencia de potencia reactiva. Este experimento permitió diferenciar el factor de potencia de desplazamiento del factor de potencia verdadero.

### Experimento 3: horneado intensivo y cargas no lineales

Se representó el funcionamiento más crítico de la panadería, con hornos de inducción, electrónica de potencia y motores funcionando simultáneamente. Este escenario permitió estudiar distorsión armónica, factor de cresta, picos de corriente y riesgo de disparo de protecciones.

## 5. Resultados principales

Las medidas obtenidas muestran que el obrador no trabaja en condiciones perfectamente equilibradas. Algunas fases presentan mayor corriente que otras y las cargas inductivas introducen desfase entre tensión y corriente. Además, las cargas no lineales generan deformaciones en la forma de onda que deben analizarse mediante FFT y THD.

La corriente de neutro aparece como un indicador importante del desequilibrio de la instalación. Su presencia confirma que las cargas monofásicas no están perfectamente compensadas entre fases. Este efecto puede agravarse si existen armónicos triples.

## 6. Diagnóstico técnico

El problema del cliente no se interpreta como una única avería, sino como la combinación de varios factores:

- Arranque simultáneo de cargas.
- Desequilibrio entre fases.
- Presencia de motores monofásicos.
- Corriente de neutro elevada.
- Distorsión armónica por electrónica de potencia.
- Posible mala coordinación de protecciones.

Por tanto, el disparo del diferencial general puede estar asociado a un comportamiento transitorio y a una instalación eléctricamente desequilibrada, más que a un fallo permanente de aislamiento.

## 7. Propuestas de mitigación

Las medidas recomendadas son:

1. Realizar un arranque escalonado de hornos, compresores y motores.
2. Redistribuir cargas monofásicas entre fases para reducir desequilibrio.
3. Medir de forma específica la corriente de neutro.
4. Validar THD de tensión y corriente con analizador de calidad.
5. Revisar la coordinación de protecciones.
6. Estudiar filtros pasivos o activos si la distorsión armónica es elevada.
7. Valorar equipos con corrección de factor de potencia o PFC.

## 8. Resultado de aprendizaje

La práctica ha permitido comprender que la calidad del suministro eléctrico no puede evaluarse únicamente con una medida de tensión o corriente RMS. Es necesario analizar forma de onda, armónicos, desfase, neutro, eventos y normativa. También se ha aprendido a organizar un trabajo técnico reproducible mediante repositorio, datos, documentación, código y dictamen.

## 9. Cómo reproducir el proyecto

Para revisar el proyecto:

1. Leer el `README.md` principal.
2. Consultar los documentos técnicos en `docs/`.
3. Revisar los experimentos en `experiments/`.
4. Consultar los datos y resúmenes de medida en `data/`.
5. Abrir la web interactiva desde el enlace de Netlify.
6. Revisar el informe final en `report/`.

## 10. Conclusión

El proyecto demuestra que un problema aparentemente simple, como el disparo de una protección en una panadería, puede esconder fenómenos complejos de calidad eléctrica. El análisis realizado permite justificar técnicamente el problema y proponer soluciones razonables desde el punto de vista de ingeniería.
