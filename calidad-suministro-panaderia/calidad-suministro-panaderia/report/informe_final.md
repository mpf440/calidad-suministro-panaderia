# Informe final · Peritaje de Calidad del Suministro Eléctrico

## Caso C5 · Obrador de panadería industrial

**Autores:** Miguel Pomares Fernández, Antonio Arcos Cortes y Alejandro Rodriguez Fernandez.

## 1. Introducción

El presente informe analiza la calidad del suministro eléctrico de un obrador de panadería industrial. La instalación simulada incluye hornos de inducción, amasadoras con motor monofásico, cámara frigorífica, sala de frío, iluminación LED y electrónica de control. El cliente informa de disparos del diferencial general al encender la maquinaria en cadena por la mañana.

## 2. Hipótesis técnica

La hipótesis de partida es que el problema no se debe a una única causa, sino a la superposición de varios efectos: desequilibrio de cargas monofásicas, presencia de cargas inductivas, electrónica de potencia, corriente de neutro elevada y posibles transitorios de arranque.

## 3. Instrumentación

Se emplearon PicoScope y MyeBox con filosofías de medida complementarias. El PicoScope permite observar la forma de onda instantánea y estudiar transitorios. El MyeBox permite registrar parámetros agregados, armónicos y eventos siguiendo una filosofía de análisis normativo.

## 4. Resultados principales

Las configuraciones medidas muestran tensiones de fase cercanas al rango nominal, con frecuencias próximas a 50 Hz. Sin embargo, las corrientes de fase no son equilibradas. En la primera configuración se midieron corrientes de 1,88 A, 0,78 A y 0,55 A; en la segunda configuración se obtuvieron 1,13 A, 1,53 A y 0,58 A. Además, las ramas inductivas presentan desfases significativos, con factores de potencia reducidos.

## 5. Diagnóstico

La instalación se considera eléctricamente desequilibrada. La presencia de motores monofásicos y cargas de distinta potencia por fase provoca corriente de neutro. Además, las cargas no lineales asociadas a hornos de inducción, iluminación LED o fuentes conmutadas pueden aumentar la distorsión armónica y generar corrientes pulsantes.

## 6. Evaluación normativa

Desde el punto de vista de calidad del suministro, se debe contrastar la tensión, frecuencia, THD de tensión, desequilibrio y eventos con criterios basados en UNE-EN 50160 e IEC 61000-4-30. El THD de tensión debe mantenerse, de forma general, por debajo del 8 %. Los eventos de arranque deben clasificarse como huecos, variaciones rápidas de tensión o transitorios según su forma y duración.

## 7. Medidas de mitigación propuestas

Se proponen las siguientes medidas:

1. Arranque escalonado de hornos, compresor y motores.
2. Redistribución de cargas monofásicas entre fases.
3. Medición específica y seguimiento de la corriente de neutro.
4. Validación del THD de tensión y corriente con MyeBox.
5. Estudio de filtros pasivos o activos si la distorsión armónica resulta elevada.
6. Evaluación de equipos con PFC para reducir corriente pulsante.
7. Revisión de la coordinación de protecciones.

## 8. Dictamen

La instalación analizada presenta indicios de funcionamiento desequilibrado y riesgo de problemas de calidad eléctrica asociados a cargas inductivas y no lineales. Aunque las tensiones y frecuencias medidas se mantienen dentro de márgenes razonables, el reparto de corrientes y los desfases observados justifican la necesidad de mitigación. Se recomienda actuar primero mediante medidas organizativas de bajo coste, como el arranque escalonado y el reparto de cargas, y posteriormente estudiar soluciones técnicas de filtrado o compensación.
