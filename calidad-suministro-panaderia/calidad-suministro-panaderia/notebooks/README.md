# Scripts de análisis

`calculo_parametros_pq.py` permite calcular parámetros básicos a partir de un CSV exportado por PicoScope:

- RMS.
- Pico.
- Factor de cresta.
- Armónicos por proyección seno/coseno.
- THD estimada.

Uso:

```bash
python calculo_parametros_pq.py ../data/S2_distorsion_armonicos_evento/G1_arranque_preparacion/archivo.csv
```
