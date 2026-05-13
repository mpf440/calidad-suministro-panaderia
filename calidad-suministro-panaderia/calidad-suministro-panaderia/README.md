# Peritaje de Calidad del Suministro Eléctrico · Caso C5 Panadería Industrial

**Asignatura:** Gestión Integral de la Energía  
**Curso:** 2025/2026 · Grado en Ingeniería Eléctrica · Universidad de Almería  
**Grupo:** C5  

## Integrantes

- Miguel Pomares Fernández
- Antonio Arcos Cortes
- Alejandro Rodriguez Fernandez

## Resumen del proyecto

Este repositorio recoge el trabajo desarrollado para el proyecto integrador de **Calidad del Suministro Eléctrico**. El caso asignado corresponde a un **obrador de panadería industrial** con hornos de inducción, amasadoras con motores monofásicos, cámara frigorífica, sala de frío, iluminación LED y electrónica de control.

El planteamiento del trabajo es actuar como una **consultora eléctrica externa**: se recibe un cliente, se caracteriza su instalación, se miden sus formas de onda, se diagnostican problemas de calidad eléctrica y se propone una mitigación técnicamente defendible.

El problema reportado por el cliente es el siguiente:

> Al encender la maquinaria en cadena por la mañana, se producen disparos de la protección general/diferencial.

A partir de esta situación se estudian los fenómenos de **desequilibrio trifásico**, **corriente de neutro**, **cargas inductivas**, **cargas no lineales**, **distorsión armónica**, **factor de potencia**, **eventos de arranque** y **criterios normativos de calidad del suministro**.

## Web interactiva

La herramienta desarrollada durante el proyecto puede consultarse aquí:

**https://bright-elf-9cf6e5.netlify.app**

La web permite explicar los fundamentos teóricos, modelar tres escenarios de funcionamiento del obrador, analizar señales tipo PicoScope, evaluar criterios de calidad eléctrica y redactar un dictamen técnico.

## Estructura del repositorio

```text
.
├── docs/                       # Guías teóricas, normativa y documentos base
├── data/                       # Datos originales de PicoScope y resúmenes de medidas
├── experiments/                # Explicación técnica de cada experimento
├── images/                     # Capturas de medidas, guía docente y capturas de apoyo
├── notebooks/                  # Scripts/cuadernos para reproducir cálculos
├── report/                     # Informe final y dictamen técnico
└── web/                        # Aplicación React/Vite Equalyti PQ
```

## Sesiones de trabajo

### Sesión 1 · Reconocimiento de la instalación

Se caracterizó el comportamiento base del entrenador y de las cargas lineales. Se midieron tensiones de fase, corrientes de fase y corriente de neutro en condiciones de equilibrio y desequilibrio. El objetivo fue construir la **huella eléctrica inicial** del cliente.

### Sesión 2 · Distorsión, armónicos y evento

Se introdujeron cargas no lineales y escenarios propios del obrador de panadería. Se analizaron formas de onda, contenido armónico, THD, factor de cresta, potencia en régimen no senoidal y eventos de conmutación.

### Sesión 3 · Tiempo-frecuencia y dictamen

Se interpretaron los eventos capturados, se compararon con criterios normativos y se redactó una propuesta de mitigación. El objetivo final fue transformar las medidas en un **dictamen técnico defendible**.

## Escenarios de panadería modelados

### G1 · Arranque / preparación

Escenario inicial de la jornada, con precalentamiento, ventilación, iluminación y control. Permite estudiar desequilibrio moderado y corriente de neutro.

### G2 · Amasado y formado

Escenario con motores monofásicos, fermentación/apoyo térmico y electrónica auxiliar. Permite estudiar desfase tensión-corriente, potencia reactiva y diferencia entre factor de potencia verdadero y factor de desplazamiento.

### G3 · Horneado intensivo

Escenario crítico con hornos de inducción, compresor, extracción y electrónica de potencia. Permite estudiar distorsión armónica, picos de corriente y riesgo de disparo de protecciones.

## Instrumentación utilizada

- Entrenador Lucas-Nülle CO3209-8L.
- PicoScope 2205A / 2204A.
- Analizador de calidad Circutor MyeBox.
- Bancos de cargas R, L y C.
- Herramienta web Equalyti PQ desarrollada en React/Vite.

## Normativa y referencias técnicas consideradas

- **UNE-EN 50160**: características de la tensión suministrada.
- **IEC 61000-4-30**: métodos de medida para calidad del suministro.
- **IEEE 1159**: clasificación de eventos de calidad eléctrica.
- **IEEE 519 / IEC 61000-3-2**: referencia para armónicos y emisiones.

## Conclusión técnica preliminar

Las medidas muestran que el problema del obrador no debe interpretarse como un fallo único. Es más razonable entenderlo como la superposición de varios fenómenos: arranque simultáneo de equipos, presencia de cargas inductivas, electrónica de potencia, desequilibrio entre fases y posible mala coordinación de protecciones. La solución propuesta combina medidas organizativas y técnicas: arranque escalonado, redistribución de cargas, medición específica del neutro, validación de THD y posible filtrado armónico o compensación con PFC.

## Cómo ejecutar la web localmente

```bash
cd web
npm install
npm run dev
```

Para generar una versión desplegable:

```bash
npm run build
```

La carpeta generada `dist/` puede subirse a Netlify o Vercel.
