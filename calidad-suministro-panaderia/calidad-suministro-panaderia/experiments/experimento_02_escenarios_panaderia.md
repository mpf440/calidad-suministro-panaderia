# Experimento 02 · Escenarios funcionales de panadería

## Objetivo

El objetivo fue representar el funcionamiento realista de un obrador industrial mediante tres escenarios eléctricos equivalentes. Cada escenario agrupa equipos según su papel en el proceso productivo y según su comportamiento eléctrico: resistivo, inductivo o no lineal.

## G1 · Arranque / preparación

Este escenario representa el inicio de la jornada, cuando se conectan cargas de precalentamiento, ventilación, iluminación y control. Su interés está en estudiar el desequilibrio inicial y la corriente de neutro antes de llegar a máxima producción.

La rama térmica se modela mediante resistencias; la rama motriz mediante una impedancia RL; y los servicios auxiliares mediante una carga resistiva de menor potencia. Es un escenario útil para explicar por qué una panadería puede parecer sencilla pero ya presentar desequilibrio significativo.

## G2 · Amasado y formado

Este escenario representa la fase mecánica del proceso. Predominan motores monofásicos de amasadoras y cintas, además de sistemas de fermentación y control. Aquí aparece con claridad el desfase tensión-corriente y la potencia reactiva.

La configuración equivalente considera una rama RL para motores, una rama resistiva para apoyo térmico y una rama auxiliar con posible componente no lineal. Este escenario permite distinguir entre problemas de potencia reactiva y problemas de distorsión armónica.

## G3 · Horneado intensivo

Este escenario representa el caso crítico del cliente: hornos de inducción, compresor, extracción y electrónica funcionando simultáneamente. Es el escenario más interesante para justificar armónicos, picos de corriente y disparos de protección.

Los hornos de inducción se asocian a electrónica de potencia y cargas no lineales; el compresor y la extracción se modelan como ramas RL. Esta superposición explica que el problema no sea un único fallo, sino una combinación de fenómenos.

## Conclusión

Los tres escenarios permiten pasar de una explicación abstracta de calidad eléctrica a un caso aplicado. La panadería presenta cargas de distinta naturaleza y reparto desigual entre fases, lo que justifica medir no solo tensiones y corrientes, sino también neutro, armónicos, factor de potencia y eventos de arranque.
