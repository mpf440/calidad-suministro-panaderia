import React, { useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const scenarios = [
  {
    id: "g1",
    name: "G1 · Arranque / preparación",
    stage: "Inicio de jornada",
    desc: "Precalentamiento, ventilación, iluminación y control.",
    why:
      "Es el escenario base de una panadería al comenzar la mañana. Hay carga térmica, carga motriz y servicios auxiliares, pero todavía no domina la electrónica de potencia.",
    phases: [
      {
        phase: "L1",
        load: "Horno + resistencia auxiliar",
        real: "Precalentamiento térmico",
        z: "131 Ω",
        i: 1.76,
        type: "R",
        circuit: "R_horno ∥ R_aux",
      },
      {
        phase: "L2",
        load: "Ventilación / motor equivalente",
        real: "Ventilador o pequeño motor",
        z: "132.1 + j179.6 Ω",
        i: 1.03,
        type: "RL",
        circuit: "R + jωL",
      },
      {
        phase: "L3",
        load: "Iluminación/control",
        real: "Servicios auxiliares",
        z: "435 Ω",
        i: 0.53,
        type: "R",
        circuit: "R_servicios",
      },
    ],
    neutral: 0.59,
    conclusion: "Desequilibrio moderado. Útil como baseline realista para comparar después.",
  },
  {
    id: "g2",
    name: "G2 · Amasado y formado",
    stage: "Producción mecánica",
    desc: "Amasadoras, cintas, divisoras, fermentación y electrónica auxiliar.",
    why:
      "Aumenta el peso de motores monofásicos y cargas RL. Permite estudiar desfase tensión-corriente, potencia reactiva y factor de potencia.",
    phases: [
      {
        phase: "L1",
        load: "Amasadora + cinta",
        real: "Motor principal",
        z: "RL equivalente",
        i: 1.4,
        type: "RL",
        circuit: "(R+L)_amasadora ∥ (R+L)_cinta",
      },
      {
        phase: "L2",
        load: "Fermentación + apoyo térmico",
        real: "Resistencia térmica",
        z: "R equivalente",
        i: 1.5,
        type: "R",
        circuit: "R_fermentación ∥ R_aux",
      },
      {
        phase: "L3",
        load: "Control + electrónica",
        real: "Fuentes y control",
        z: "R + no lineal",
        i: 0.8,
        type: "NL",
        circuit: "R_servicios ∥ NL",
      },
    ],
    neutral: 0.75,
    conclusion: "Se empieza a diferenciar el PF verdadero del cosφ por presencia de electrónica.",
  },
  {
    id: "g3",
    name: "G3 · Horneado intensivo",
    stage: "Máxima producción",
    desc: "Hornos de inducción, compresor, extracción y electrónica de control.",
    why:
      "Es el caso más crítico: máxima potencia, electrónica de potencia y motores funcionando al mismo tiempo. Es ideal para justificar THD, picos, neutro y disparo de protecciones.",
    phases: [
      {
        phase: "L1",
        load: "Horno de inducción 1",
        real: "Rectificador/SMPS",
        z: "No lineal",
        i: 1.6,
        type: "NL",
        circuit: "NL_horno1",
      },
      {
        phase: "L2",
        load: "Horno de inducción 2",
        real: "Rectificador/SMPS",
        z: "No lineal",
        i: 1.6,
        type: "NL",
        circuit: "NL_horno2",
      },
      {
        phase: "L3",
        load: "Compresor + extracción",
        real: "Motor + ventilación",
        z: "RL equivalente",
        i: 1.2,
        type: "RL",
        circuit: "(R+L)_compresor ∥ (R+L)_extracción",
      },
    ],
    neutral: 1.0,
    conclusion: "Escenario crítico: THD alto, picos de corriente y posible disparo de protecciones.",
  },
];

const standards = [
  {
    name: "UNE-EN 50160",
    use: "Características de la tensión suministrada",
    values: "Tensión, frecuencia, armónicos, desequilibrio y flicker",
    app: "Sirve para evaluar si la tensión que recibe la panadería está dentro de valores aceptables.",
  },
  {
    name: "IEC 61000-4-30",
    use: "Método de medida",
    values: "Define cómo medir de forma repetible RMS, frecuencia, huecos, swells, armónicos, flicker...",
    app: "Justifica que MyeBox y analizadores de calidad usen ventanas y procedimientos normalizados.",
  },
  {
    name: "IEEE 1159",
    use: "Clasificación de eventos",
    values: "Huecos, sobretensiones, interrupciones, transitorios, variaciones de frecuencia",
    app: "Ayuda a clasificar el arranque problemático de la panadería.",
  },
  {
    name: "IEEE 519 / IEC 61000-3-2",
    use: "Armónicos",
    values: "Emisiones armónicas y límites/recomendaciones",
    app: "Relevante por hornos de inducción, SMPS, LED y rectificadores.",
  },
];

function MathBlock({ tex, small = false }) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: true,
    strict: false,
  });

  return (
    <div
      className={small ? "mathBlock smallMath" : "mathBlock"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function rms(arr) {
  if (!arr.length) return 0;
  return Math.sqrt(arr.reduce((a, x) => a + x * x, 0) / arr.length);
}

function peak(arr) {
  if (!arr.length) return 0;
  return Math.max(...arr.map((x) => Math.abs(x)));
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows = lines.map((line) => line.split(/[;,\t]/).map((x) => x.trim()));
  let start = 0;

  if (rows[0]?.some((x) => isNaN(Number(String(x).replace(",", "."))))) {
    start = 1;
  }

  const data = [];
  for (let i = start; i < rows.length; i++) {
    const nums = rows[i]
      .map((x) => Number(String(x).replace(",", ".")))
      .filter(Number.isFinite);

    if (nums.length >= 2) data.push({ t: nums[0], y: nums[1] });
    else if (nums.length === 1) data.push({ t: data.length, y: nums[0] });
  }

  return data;
}

function generateSignal(type) {
  const fs = 5000;
  const out = [];

  for (let n = 0; n < 700; n++) {
    const t = n / fs;
    const s = Math.sin(2 * Math.PI * 50 * t);
    let y = 1.8 * s;

    if (type === "rl") y = 1.5 * Math.sin(2 * Math.PI * 50 * t - Math.PI / 4);
    if (type === "rect") y = Math.max(0, 2.2 * s);
    if (type === "smps") y = Math.abs(s) > 0.72 ? Math.sign(s) * 2.2 : 0;
    if (type === "evento") {
      y = (t > 0.045 && t < 0.075 ? 0.45 : 1) * 1.8 * s + (t > 0.075 && t < 0.079 ? 0.9 : 0);
    }

    out.push({ t: +(t * 1000).toFixed(2), y: +y.toFixed(4) });
  }

  return out;
}

function harmonicEstimate(values, fs = 5000) {
  const N = Math.min(values.length, 1024);
  if (N < 32) return [];

  const x = values.slice(0, N);
  const avg = x.reduce((a, b) => a + b, 0) / N;
  const centered = x.map((v) => v - avg);
  const result = [];

  for (let h = 1; h <= 15; h++) {
    const f = h * 50;
    let re = 0;
    let im = 0;

    for (let n = 0; n < N; n++) {
      const theta = (2 * Math.PI * f * n) / fs;
      re += centered[n] * Math.cos(theta);
      im -= centered[n] * Math.sin(theta);
    }

    const ampPeak = (2 / N) * Math.sqrt(re * re + im * im);
    result.push({ h, value: ampPeak / Math.sqrt(2) });
  }

  return result;
}

function thd(harmonics) {
  if (!harmonics.length || harmonics[0].value === 0) return 0;
  const rest = harmonics.slice(1).reduce((a, x) => a + x.value * x.value, 0);
  return (Math.sqrt(rest) / harmonics[0].value) * 100;
}

function evaluatePQ(p) {
  const checks = [
    ["Tensión RMS", p.vMin >= 207 && p.vMax <= 253, "Referencia práctica: 230 V ±10 %. Asociado a UNE-EN 50160."],
    ["Frecuencia", p.fMin >= 49.5 && p.fMax <= 50.5, "La red europea debe mantenerse alrededor de 50 Hz."],
    ["THD tensión", p.thdV <= 8, "Criterio conservador de calidad: THD_V ≤ 8 %."],
    ["THD corriente", p.thdI <= 25, "No define legalidad por sí sola, pero indica severidad de cargas no lineales."],
    ["Desequilibrio", p.unbalance <= 2, "Objetivo típico: ≤ 2 % para evitar neutro y calentamiento."],
    ["Neutro", p.neutral <= p.phaseAvg * 0.4, "IN elevada indica desequilibrio o armónicos triples."],
    ["Factor de potencia", p.pf >= 0.95, "Recomendable PF ≥ 0.95 para reducir pérdidas y penalizaciones."],
    ["Protecciones", p.trips === 0, "No debe haber disparos en operación normal."],
  ];

  const fails = checks.filter((c) => !c[1]).length;
  const score = Math.max(0, 100 - fails * 13);
  const status = score >= 85 ? "APTO" : score >= 65 ? "APTO CON MEDIDAS" : "NO APTO";
  return { checks, score, status };
}

function buildReportHtml() {
  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Informe Equalyti PQ</title>
<style>
body{font-family:Arial,sans-serif;margin:40px;color:#111827;line-height:1.6}
h1{color:#1d4ed8}
h2{border-bottom:1px solid #ddd;padding-bottom:6px;margin-top:28px}
.box{background:#f1f5f9;padding:16px;border-radius:12px;margin:12px 0}
</style>
</head>
<body>
<h1>Informe técnico · Equalyti PQ</h1>
<h2>Caso C5 · Panadería industrial</h2>
<div class="box">Diagnóstico de calidad eléctrica aplicado a hornos de inducción, motores, compresores, iluminación LED y electrónica auxiliar.</div>
<h2>Problema</h2>
<p>La instalación puede presentar disparos en arranque, distorsión armónica, desequilibrio de fases y corriente de neutro.</p>
<h2>Causas probables</h2>
<ul>
<li>Hornos de inducción y fuentes conmutadas: cargas no lineales.</li>
<li>Motores y compresores: cargas RL con picos de arranque.</li>
<li>Iluminación LED: armónicos impares.</li>
<li>Reparto monofásico desigual: corriente de neutro.</li>
</ul>
<h2>Normativa de referencia</h2>
<ul>
<li>UNE-EN 50160: características de tensión suministrada.</li>
<li>IEC 61000-4-30: métodos de medida.</li>
<li>IEEE 1159: clasificación de eventos.</li>
<li>IEEE 519 / IEC 61000-3-2: armónicos.</li>
</ul>
<h2>Recomendaciones</h2>
<ol>
<li>Arranque escalonado.</li>
<li>Redistribución de cargas por fase.</li>
<li>Medición específica de neutro.</li>
<li>Validación de THD con analizador.</li>
<li>Estudio de filtros o equipos con PFC.</li>
</ol>
<p><b>Conclusión:</b> el problema no es único; es la superposición de arranque brusco, electrónica de potencia, desequilibrio y posible mala coordinación de protecciones.</p>
</body>
</html>`;
}

function downloadReport() {
  const html = buildReportHtml();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "informe_equalyti_panaderia.html";
  a.click();
  URL.revokeObjectURL(url);
}

function openReportPrint() {
  const win = window.open("", "_blank");
  win.document.write(buildReportHtml());
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

function Header({ tab, setTab }) {
  const tabs = [
    ["inicio", "🏭 Inicio"],
    ["teoria", "📘 Teoría"],
    ["panaderia", "⚡ Panadería"],
    ["lab", "🔌 Laboratorio"],
    ["analizador", "📈 Analizador"],
    ["evaluador", "🛡️ Evaluador"],
    ["dictamen", "📄 Dictamen"],
  ];

  return (
    <header className="topbar">
      <div className="brand">
        <strong>Equalyti PQ</strong>
        <span>Caso C5 · Panadería industrial</span>
      </div>
      <nav>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function Inicio() {
  return (
    <section>
      <div className="homeHero">
        <div>
          <p className="eyebrow">Power Quality · Caso C5</p>
          <h1>Diagnóstico visual de calidad eléctrica en una panadería industrial</h1>
          <p>
            Una herramienta para explicar teoría, simular escenarios, analizar formas de onda y defender un dictamen técnico como consultoría energética.
          </p>
          <div className="heroActions">
            <span>🎯 Objetivo: pasar de “salta el diferencial” a una causa técnica medible.</span>
            <span>⚡ Método: medir, comparar, diagnosticar y mitigar.</span>
          </div>
        </div>
        <div className="challengeCard">
          <h3>Retos eléctricos del obrador</h3>
          <div>Hornos de inducción</div>
          <div>Motores y compresores</div>
          <div>LED + fuentes conmutadas</div>
          <div>Neutro y desequilibrio</div>
        </div>
      </div>

      <div className="grid4">
        <Card title="1 · Entender" text="Conceptos: RMS, FFT, THD, neutro, eventos, factor de potencia y normativa." />
        <Card title="2 · Modelar" text="Escenarios reales: arranque, amasado, horneado intensivo y servicios auxiliares." />
        <Card title="3 · Medir" text="Puntos P0–P4: cabecera, ramas R/RL/NL y neutro." />
        <Card title="4 · Defender" text="Dictamen técnico con causas, evidencias y medidas correctoras." />
      </div>
    </section>
  );
}

function Card({ title, text }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Title({ small, big, text }) {
  return (
    <div className="title">
      <p>{small}</p>
      <h2>{big}</h2>
      {text && <span>{text}</span>}
    </div>
  );
}

function Teoria() {
  return (
    <section>
      <Title
        small="Base teórica"
        big="Calidad del suministro: del concepto a la medida"
        text="La calidad ideal implica tensión constante, frecuencia de 50 Hz, forma senoidal y equilibrio trifásico. La práctica consiste en cuantificar cuánto se aleja la red real de ese ideal."
      />

      <div className="theoryHero">
        <div>
          <h2>La señal ideal es senoidal; la instalación real no siempre lo es</h2>
          <p>
            En una panadería industrial aparecen cargas lineales, RL y no lineales. Las no lineales absorben corriente no sinusoidal aunque la tensión sea senoidal.
          </p>
        </div>
        <WavePicture />
      </div>

      <div className="grid3">
        <Formula
          title="Tensión ideal senoidal"
          formula={`v(t)=V_m\\,\\sin(\\omega t)`}
          text="Modelo ideal de una tensión alterna pura. La frecuencia fundamental de la red europea es 50 Hz."
        />

        <Formula
          title="Pulsación eléctrica"
          formula={`\\omega=2\\pi f`}
          text="Relaciona la frecuencia de red con la velocidad angular de la señal. Para 50 Hz, ω vale aproximadamente 314 rad/s."
        />

        <Formula
          title="Valor eficaz continuo"
          formula={`V_{\\mathrm{RMS}}=\\sqrt{\\frac{1}{T}\\int_0^T v^2(t)\\,dt}`}
          text="El valor eficaz representa el valor equivalente en continua que produciría el mismo efecto térmico."
        />

        <Formula
          title="Valor eficaz discreto"
          formula={`X_{\\mathrm{RMS}}=\\sqrt{\\frac{1}{N}\\sum_{n=0}^{N-1}x^2[n]}`}
          text="Es la forma que usa el analizador cuando trabaja con muestras exportadas desde PicoScope."
        />

        <Formula
          title="Impedancia inductiva"
          formula={`Z=R+j\\omega L`}
          text="Representa una carga de tipo motor, ventilador o compresor. La componente inductiva retrasa la corriente respecto a la tensión."
        />

        <Formula
          title="Reactancia inductiva"
          formula={`X_L=\\omega L=2\\pi f L`}
          text="Cuanto mayor sea la inductancia o la frecuencia, mayor será la oposición de la bobina al paso de corriente alterna."
        />

        <Formula
          title="Impedancia capacitiva"
          formula={`Z_C=\\frac{1}{j\\omega C}`}
          text="El condensador adelanta la corriente respecto a la tensión y puede utilizarse para compensar reactiva, aunque con cuidado si hay armónicos."
        />

        <Formula
          title="Corriente en una rama"
          formula={`I=\\frac{V}{|Z|}`}
          text="Permite estimar la corriente RMS de cada fase a partir de la tensión fase-neutro y la impedancia equivalente."
        />

        <Formula
          title="Factor de potencia"
          formula={`PF=\\frac{P}{S}`}
          text="El factor de potencia verdadero relaciona potencia activa y aparente total. Incluye desfase y distorsión."
        />

        <Formula
          title="Factor de desplazamiento"
          formula={`\\cos(\\varphi)=\\frac{P_1}{S_1}`}
          text="Solo tiene en cuenta el desfase entre la tensión y la corriente fundamentales de 50 Hz."
        />

        <Formula
          title="Potencia aparente"
          formula={`S=V_{\\mathrm{RMS}}\\,I_{\\mathrm{RMS}}`}
          text="Es la potencia total que debe transportar la instalación, aunque no toda se convierta en trabajo útil."
        />

        <Formula
          title="Potencia activa"
          formula={`P=V_{\\mathrm{RMS}}\\,I_{\\mathrm{RMS}}\\cos(\\varphi)`}
          text="En régimen senoidal representa la potencia realmente transformada en trabajo o calor."
        />

        <Formula
          title="Potencia reactiva"
          formula={`Q=V_{\\mathrm{RMS}}\\,I_{\\mathrm{RMS}}\\sin(\\varphi)`}
          text="Aparece en cargas inductivas o capacitivas. No realiza trabajo neto, pero carga líneas y transformadores."
        />

        <Formula
          title="Potencia de distorsión"
          formula={`D=\\sqrt{S^2-P^2-Q^2}`}
          text="En régimen no senoidal aparece una componente adicional asociada a la deformación armónica."
        />

        <Formula
          title="Distorsión armónica total"
          formula={`THD=\\frac{\\sqrt{\\sum_{h=2}^{\\infty}X_h^2}}{X_1}\\cdot100\\%`}
          text="Compara la energía de todos los armónicos con la fundamental. Es clave para cargas no lineales."
        />

        <Formula
          title="Distorsión armónica individual"
          formula={`IHD_h=\\frac{X_h}{X_1}\\cdot100\\%`}
          text="Mide el peso individual de cada armónico respecto a la fundamental."
        />

        <Formula
          title="Corriente de neutro"
          formula={`i_N[n]=i_1[n]+i_2[n]+i_3[n]`}
          text="En un sistema perfectamente equilibrado debería tender a cero. Si hay desequilibrio o armónicos triples, aumenta."
        />

        <Formula
          title="Frecuencia de resonancia"
          formula={`f_r=\\frac{1}{2\\pi\\sqrt{LC}}`}
          text="Permite estudiar si una inductancia y un condensador pueden amplificar armónicos presentes en la red."
        />
      </div>

      <div className="panel">
        <h3>Qué significa cada tipo de señal del analizador</h3>
        <div className="pqMap">
          <div><b>Senoidal</b><span>Carga lineal ideal o referencia de tensión. Baja THD.</span></div>
          <div><b>RL</b><span>Motor, compresor o ventilador. La corriente se retrasa respecto a la tensión.</span></div>
          <div><b>Rectificador</b><span>Conducción parcial. Genera armónicos y corriente no sinusoidal.</span></div>
          <div><b>SMPS</b><span>Fuente conmutada u horno de inducción equivalente. Picos de corriente y THD alta.</span></div>
          <div><b>Evento</b><span>Hueco, arranque, transitorio o cambio brusco. Se analiza en tiempo y con ventanas.</span></div>
          <div><b>Flicker</b><span>Fluctuación repetitiva de tensión que afecta iluminación y confort.</span></div>
        </div>
      </div>

      <div className="layout">
        <div className="panel">
          <h3>Métodos vistos en monitorización</h3>
          <ul className="niceList">
            <li><b>Dominio del tiempo:</b> picos, cruces por cero, RMS, duración de eventos.</li>
            <li><b>Dominio de frecuencia:</b> FFT, armónicos, interarmónicos y espectro.</li>
            <li><b>Tiempo-frecuencia:</b> wavelet, transformada S y HHT para señales no estacionarias.</li>
            <li><b>Estadística:</b> percentiles, tendencias, histogramas y cumplimiento normativo.</li>
          </ul>
        </div>
        <div className="panel">
          <h3>Impacto de mala calidad</h3>
          <ul className="niceList">
            <li>Disparos intempestivos de protecciones.</li>
            <li>Calentamiento de conductores, neutro y transformadores.</li>
            <li>Pérdidas energéticas y reducción de eficiencia.</li>
            <li>Envejecimiento prematuro de equipos.</li>
            <li>Paradas de producción y pérdidas económicas.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Formula({ title, formula, text }) {
  return (
    <div className="formula">
      <h3>{title}</h3>
      <MathBlock tex={formula} />
      <p>{text}</p>
    </div>
  );
}

function WavePicture() {
  return (
    <div className="waveCard">
      <svg viewBox="0 0 500 180">
        <path
          d="M0 90 C40 10,80 10,120 90 S200 170,240 90 S320 10,360 90 S440 170,500 90"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="7"
        />
        <path
          d="M0 90 C35 40,75 30,115 88 S180 150,230 90 S300 20,365 90 S430 150,500 90"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
          strokeDasharray="10 8"
        />
      </svg>
      <p>Azul: red ideal · Amarillo: red distorsionada</p>
    </div>
  );
}

function Panaderia() {
  const [id, setId] = useState("g1");
  const s = scenarios.find((x) => x.id === id);

  return (
    <section>
      <Title
        small="Caso C5"
        big="Modelo funcional de panadería"
        text="Cada grupo representa una franja de trabajo. Las cargas se agrupan por función eléctrica: térmica, motriz y electrónica."
      />

      <div className="buttons">
        {scenarios.map((x) => (
          <button key={x.id} onClick={() => setId(x.id)} className={id === x.id ? "activeBtn" : ""}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="layout">
        <div className="panel">
          <h2>{s.name}</h2>
          <p><b>{s.stage}</b> · {s.desc}</p>
          <p className="explain">{s.why}</p>

          <table>
            <thead>
              <tr>
                <th>Fase</th>
                <th>Equipo equivalente</th>
                <th>Qué representa</th>
                <th>Z</th>
                <th>I</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {s.phases.map((p) => (
                <tr key={p.phase}>
                  <td>{p.phase}</td>
                  <td>{p.load}</td>
                  <td>{p.real}</td>
                  <td>{p.z}</td>
                  <td>{p.i.toFixed(2)} A</td>
                  <td><span className={`pill ${p.type}`}>{p.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="note"><b>Corriente de neutro estimada:</b> {s.neutral.toFixed(2)} A</p>
          <p className="note">{s.conclusion}</p>
        </div>

        <div className="panel">
          <h3>Corrientes por fase</h3>
          <BarChartSimple data={s.phases.map((p) => ({ name: p.phase, value: p.i }))} />
          <h3>Esquema eléctrico equivalente</h3>
          <CircuitDiagram scenario={s} />
        </div>
      </div>
    </section>
  );
}

function CircuitDiagram({ scenario }) {
  return (
    <div className="circuit">
      <div className="supply">Alimentación: 3F + N · 230 V fase-neutro · 50 Hz</div>
      {scenario.phases.map((p) => (
        <div className="circuitLine" key={p.phase}>
          <b>{p.phase}</b>
          <span className="wire"></span>
          <span className={`loadBox ${p.type}`}>{p.circuit}<small>{p.load}</small></span>
          <span className="wire"></span>
          <b>N</b>
        </div>
      ))}
      <p>
        En una misma fase, los equipos simultáneos se conectan en paralelo. Las ramas motrices se modelan como R+L en serie.
        El condensador de compensación, si se usa, va en paralelo fase-neutro.
      </p>
    </div>
  );
}

function Lab() {
  return (
    <section>
      <Title
        small="Banco experimental"
        big="Montaje y campaña de medidas"
        text="Esta pestaña no solo dice dónde medir: explica por qué se mide ahí y qué conclusión técnica debe obtenerse."
      />

      <div className="panel">
        <h3>Flujo de trabajo recomendado</h3>
        <div className="workflow">
          <div><b>1</b><span>Baseline R equilibrado</span></div>
          <div><b>2</b><span>Grupo panadería</span></div>
          <div><b>3</b><span>Rama R/RL/NL</span></div>
          <div><b>4</b><span>Evento de arranque</span></div>
          <div><b>5</b><span>Dictamen</span></div>
        </div>
      </div>

      <div className="grid3">
        <MeasurePoint title="P0 · Cabecera" what="VLN, IL, IN, THD, P, Q, S, PF" why="Es el punto de conexión común del cliente. Permite saber cómo ve la red a la panadería completa." result="Se usa para el dictamen global y para comparar escenarios." />
        <MeasurePoint title="P1 · Rama térmica" what="V, I, RMS, forma de onda" why="Una resistencia pura debe ser casi senoidal y con PF cercano a 1." result="Sirve como referencia limpia." />
        <MeasurePoint title="P2 · Rama RL" what="Desfase V-I, Q, cosφ" why="Los motores consumen reactiva y retrasan la corriente." result="Permite separar problema de reactiva frente a armónicos." />
        <MeasurePoint title="P3 · Rama no lineal" what="Forma de onda, FFT, THD" why="Aquí aparecen corrientes pulsantes de rectificadores, SMPS o LED." result="Es el punto clave para justificar THD." />
        <MeasurePoint title="P4 · Neutro" what="IN RMS y forma de onda" why="El neutro revela desequilibrio y armónicos triples." result="Si IN es alta, hay riesgo de calentamiento." />
        <MeasurePoint title="Evento" what="Pre-evento, evento, post-evento" why="Los disparos suelen ocurrir durante transitorios, no en régimen estable." result="Permite justificar arranque escalonado." />
      </div>
    </section>
  );
}

function MeasurePoint({ title, what, why, result }) {
  return (
    <div className="measure">
      <h3>{title}</h3>
      <p><b>Qué medir:</b> {what}</p>
      <p><b>Por qué:</b> {why}</p>
      <p><b>Conclusión:</b> {result}</p>
    </div>
  );
}

function Analizador() {
  const [data, setData] = useState(generateSignal("smps"));
  const [showMethod, setShowMethod] = useState(true);
  const [theoryOpen, setTheoryOpen] = useState(true);

  const values = data.map((x) => x.y);
  const harmonics = useMemo(() => harmonicEstimate(values), [data]);
  const thdVal = thd(harmonics);

  async function loadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length > 5) setData(parsed);
  }

  return (
    <section>
      <Title
        small="PicoScope + Procesado"
        big="Analizador didáctico de señales"
        text="Esta pestaña convierte una onda medida en parámetros eléctricos: RMS, pico, factor de cresta, armónicos y THD."
      />

      <div className="panel analyzerIntro">
        <div>
          <h3>Qué estás viendo</h3>
          <p>
            La gráfica de la izquierda es la señal en el dominio del tiempo. La gráfica de la derecha es
            una estimación armónica: cuánto contenido hay en 50 Hz, 100 Hz, 150 Hz, etc.
          </p>
        </div>
        <div className="signalLegend">
          <span><b>Senoidal</b> red/carga ideal</span>
          <span><b>RL</b> motor o compresor</span>
          <span><b>Rectificador</b> carga no lineal</span>
          <span><b>SMPS</b> fuente conmutada / inducción</span>
          <span><b>Evento</b> hueco, transitorio o arranque</span>
        </div>
      </div>

      <div className="panel">
        <input type="file" accept=".csv,.txt" onChange={loadFile} />
        <div className="buttons">
          <button onClick={() => setData(generateSignal("seno"))}>Senoidal</button>
          <button onClick={() => setData(generateSignal("rl"))}>RL</button>
          <button onClick={() => setData(generateSignal("rect"))}>Rectificador</button>
          <button onClick={() => setData(generateSignal("smps"))}>SMPS</button>
          <button onClick={() => setData(generateSignal("evento"))}>Evento</button>
          <button onClick={() => setShowMethod(!showMethod)}>Método interno</button>
          <button onClick={() => setTheoryOpen(!theoryOpen)}>Teoremas de cálculo</button>
        </div>
      </div>

      {theoryOpen && (
        <div className="panel theoryCalc">
          <h3>Teoremas y métodos que usa el analizador</h3>

          <div className="formulaGrid">
            <div className="formula mini">
              <h3>1 · Teorema de muestreo de Nyquist</h3>
              <MathBlock small tex={`f_s\\geq2f_{\\max}`} />
              <p>
                Para no perder información, la frecuencia de muestreo debe ser al menos el doble
                de la frecuencia máxima que se quiere observar. Si no se cumple, aparece aliasing.
              </p>
              <small>Aplicación: PicoScope debe muestrear suficientemente rápido para capturar transitorios y armónicos.</small>
            </div>

            <div className="formula mini">
              <h3>2 · Valor eficaz RMS</h3>
              <MathBlock small tex={`X_{\\mathrm{RMS}}=\\sqrt{\\frac{1}{N}\\sum_{n=0}^{N-1}x^2[n]}`} />
              <p>
                El RMS mide el efecto térmico equivalente de una onda. Por eso se usa para tensión,
                corriente y detección de huecos/sobretensiones.
              </p>
              <small>Aplicación: si la onda no es senoidal, el promedio simple no sirve; el RMS sí.</small>
            </div>

            <div className="formula mini">
              <h3>3 · Valor pico</h3>
              <MathBlock small tex={`X_{\\mathrm{pico}}=\\max\\left(|x[n]|\\right)`} />
              <p>
                Detecta el máximo instantáneo. Es importante en transitorios, arranques y corrientes
                pulsantes de rectificadores.
              </p>
              <small>Aplicación: un pico alto puede explicar disparos aunque el RMS no sea excesivo.</small>
            </div>

            <div className="formula mini">
              <h3>4 · Factor de cresta</h3>
              <MathBlock small tex={`FC=\\frac{X_{\\mathrm{pico}}}{X_{\\mathrm{RMS}}}`} />
              <p>
                En una senoidal pura vale aproximadamente 1,414. Si es mucho mayor, la señal tiene
                picos estrechos o comportamiento no lineal.
              </p>
              <small>Aplicación: SMPS y rectificadores suelen tener factor de cresta elevado.</small>
            </div>

            <div className="formula mini">
              <h3>5 · Serie de Fourier</h3>
              <MathBlock small tex={`f(t)=a_0+\\sum_{n=1}^{\\infty}\\left[a_n\\cos(n\\omega t)+b_n\\sin(n\\omega t)\\right]`} />
              <p>
                Toda señal periódica puede descomponerse en una fundamental y armónicos.
                Esto permite explicar por qué una onda cuadrada o pulsante contiene muchas frecuencias.
              </p>
              <small>Aplicación: una corriente no senoidal se interpreta como suma de armónicos.</small>
            </div>

            <div className="formula mini">
              <h3>6 · FFT / DFT</h3>
              <MathBlock small tex={`X[k]=\\sum_{n=0}^{N-1}x[n]e^{-j2\\pi kn/N}`} />
              <p>
                Transforma las muestras temporales en componentes frecuenciales. Es la base del
                gráfico de armónicos.
              </p>
              <small>Aplicación: permite ver 3º, 5º, 7º armónico, etc.</small>
            </div>

            <div className="formula mini">
              <h3>7 · THD</h3>
              <MathBlock small tex={`THD=\\frac{\\sqrt{\\sum_{h=2}^{\\infty}X_h^2}}{X_1}\\cdot100\\%`} />
              <p>
                Compara la energía de los armónicos con la fundamental. Cuanto más alto, más
                deformada está la onda.
              </p>
              <small>Aplicación: clave para hornos de inducción, LED, SMPS y rectificadores.</small>
            </div>

            <div className="formula mini">
              <h3>8 · Cruces por cero</h3>
              <MathBlock small tex={`f\\approx\\frac{1}{T}`} />
              <p>
                Midiendo el tiempo entre cruces por cero se estima el periodo y la frecuencia de la señal.
              </p>
              <small>Aplicación: detectar desviaciones de frecuencia o sincronización.</small>
            </div>

            <div className="formula mini">
              <h3>9 · Wavelet / tiempo-frecuencia</h3>
              <MathBlock small tex={`W_{\\psi}f(s,\\tau)=\\frac{1}{\\sqrt{s}}\\int_{-\\infty}^{\\infty}f(t)\\psi^*\\left(\\frac{t-\\tau}{s}\\right)dt`} />
              <p>
                A diferencia de la FFT, permite localizar cuándo aparece una perturbación.
                Es útil para eventos no estacionarios.
              </p>
              <small>Aplicación: arranques, huecos, transitorios y perturbaciones breves.</small>
            </div>
          </div>
        </div>
      )}

      {showMethod && (
        <div className="panel method">
          <h3>Procedimiento interno paso a paso</h3>
          <ol>
            <li><b>Adquisición:</b> lee muestras del CSV o genera una señal sintética.</li>
            <li><b>Preprocesado:</b> separa tiempo y señal, elimina cabecera y convierte comas decimales.</li>
            <li><b>RMS:</b> eleva cada muestra al cuadrado, promedia y aplica raíz.</li>
            <li><b>Pico:</b> busca el valor absoluto máximo.</li>
            <li><b>Factor de cresta:</b> divide pico entre RMS.</li>
            <li><b>Armónicos:</b> estima la componente en 50 Hz, 100 Hz, 150 Hz… mediante proyección senoidal/cosenoidal.</li>
            <li><b>THD:</b> suma cuadráticamente los armónicos desde el 2º y divide por la fundamental.</li>
            <li><b>Diagnóstico:</b> THD alta indica carga no lineal; pico alto indica corriente pulsante; evento deformado indica arranque o hueco.</li>
          </ol>
        </div>
      )}

      <div className="grid4">
        <Metric name="RMS" value={rms(values).toFixed(3)} />
        <Metric name="Pico" value={peak(values).toFixed(3)} />
        <Metric name="Cresta" value={(peak(values) / (rms(values) || 1)).toFixed(2)} />
        <Metric name="THD estimada" value={`${thdVal.toFixed(1)} %`} />
      </div>

      <div className="layout">
        <div className="panel">
          <h3>Forma de onda</h3>
          <LineChartSimple data={data.slice(0, 700)} />
        </div>
        <div className="panel">
          <h3>Armónicos</h3>
          <BarChartSimple data={harmonics.map((h) => ({ name: `${h.h}º`, value: h.value }))} />
        </div>
      </div>
    </section>
  );
}

function Evaluador() {
  const [p, setP] = useState({
    vMin: 224,
    vMax: 236,
    fMin: 49.98,
    fMax: 50.03,
    thdV: 4.2,
    thdI: 28,
    unbalance: 2.4,
    neutral: 0.59,
    phaseAvg: 1.11,
    pf: 0.91,
    trips: 1,
  });

  const result = evaluatePQ(p);

  function update(k, v) {
    setP((old) => ({ ...old, [k]: Number(v) }));
  }

  return (
    <section>
      <Title
        small="Cumplimiento"
        big="Evaluador de perfil eléctrico"
        text="Determina si el perfil es apto, apto con medidas o no apto. Los límites son criterios de cribado basados en normativa y buena práctica."
      />

      <div className="layout">
        <div className="panel">
          <h3>Datos medidos</h3>
          <div className="form">
            {Object.keys(p).map((k) => (
              <label key={k}>
                {k}
                <input value={p[k]} onChange={(e) => update(k, e.target.value)} />
              </label>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Resultado</h3>
          <div className={`status ${result.status.includes("NO") ? "bad" : result.status.includes("MEDIDAS") ? "warn" : "ok"}`}>
            {result.status} · {result.score}/100
          </div>
          {result.checks.map((c) => (
            <div key={c[0]} className={`check ${c[1] ? "okBox" : "badBox"}`}>
              <b>{c[0]}:</b> {c[1] ? "OK" : "Revisar"} · {c[2]}
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Normativa y valores de referencia</h3>
        <table>
          <thead>
            <tr>
              <th>Norma</th>
              <th>Qué aporta</th>
              <th>Uso en la app</th>
            </tr>
          </thead>
          <tbody>
            {standards.map((s) => (
              <tr key={s.name}>
                <td><b>{s.name}</b></td>
                <td>{s.use}<br /><small>{s.values}</small></td>
                <td>{s.app}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Dictamen() {
  return (
    <section>
      <Title
        small="Dictamen técnico"
        big="Conclusión para la defensa"
        text="Resumen ejecutivo del diagnóstico, evidencias necesarias y medidas correctoras para el cliente."
      />

      <div className="grid3">
        <Card title="Causa 1 · Arranque simultáneo" text="Hornos, compresor y motores pueden producir picos y transitorios al conectarse en cadena." />
        <Card title="Causa 2 · No linealidad" text="Hornos de inducción, rectificadores y LED generan THD y corrientes pulsantes." />
        <Card title="Causa 3 · Desequilibrio" text="Las cargas monofásicas mal repartidas elevan la corriente de neutro y pérdidas." />
      </div>

      <div className="panel">
        <h3>Evidencias que debe incluir el informe</h3>
        <ul className="niceList">
          <li>Tabla de tensiones, corrientes y neutro por escenario.</li>
          <li>Captura PicoScope de rama R, RL y no lineal.</li>
          <li>FFT de la rama no lineal.</li>
          <li>Comparación MyeBox/PicoScope.</li>
          <li>Evento de arranque con pre-evento, evento y post-evento.</li>
        </ul>
      </div>

      <div className="panel">
        <h3>Recomendación final</h3>
        <p>
          Aplicar arranque escalonado, redistribución de cargas por fase, medición de neutro,
          validación de THD con MyeBox y estudio de filtrado armónico o equipos con PFC.
        </p>
        <p className="final">
          “El problema no es un único fallo, sino la superposición de arranque brusco,
          electrónica de potencia, desequilibrio y posible mala coordinación de protecciones.”
        </p>
        <div className="buttons">
          <button onClick={downloadReport}>Descargar informe HTML</button>
          <button onClick={openReportPrint}>Abrir para imprimir como PDF</button>
        </div>
      </div>
    </section>
  );
}

function Metric({ name, value }) {
  return (
    <div className="metric">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BarChartSimple({ data }) {
  const max = Math.max(...data.map((d) => d.value), 0.001);

  return (
    <div className="bars">
      {data.map((d) => (
        <div key={d.name} className="barRow">
          <span>{d.name}</span>
          <div className="barTrack">
            <div className="barFill" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <b>{Number(d.value).toFixed(2)}</b>
        </div>
      ))}
    </div>
  );
}

function LineChartSimple({ data }) {
  const w = 700;
  const h = 250;
  const ys = data.map((d) => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * w;
      const y = h - ((d.y - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="svgChart">
      <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="3" />
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState("inicio");

  return (
    <>
      <style>{css}</style>
      <Header tab={tab} setTab={setTab} />
      <main>
        {tab === "inicio" && <Inicio />}
        {tab === "teoria" && <Teoria />}
        {tab === "panaderia" && <Panaderia />}
        {tab === "lab" && <Lab />}
        {tab === "analizador" && <Analizador />}
        {tab === "evaluador" && <Evaluador />}
        {tab === "dictamen" && <Dictamen />}
      </main>
    </>
  );
}

const css = `
* { box-sizing: border-box; }
html, body, #root { margin: 0; min-height: 100vh; }
body { font-family: Inter, Segoe UI, Arial, sans-serif; background: #edf3fa; color: #0f172a; }
.topbar { position: sticky; top: 0; z-index: 10; background: rgba(255,255,255,.92); backdrop-filter: blur(14px); border-bottom: 1px solid #dbe3ef; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.brand { display: flex; flex-direction: column; }
.brand strong { font-size: 20px; }
.brand span { font-size: 13px; color: #64748b; }
nav { display: flex; flex-wrap: wrap; gap: 8px; }
button { border: 1px solid #cbd5e1; background: white; color: #0f172a; padding: 10px 15px; border-radius: 14px; cursor: pointer; font-weight: 800; }
button:hover { transform: translateY(-1px); background: #f8fafc; }
button.active, .activeBtn { background: #2563eb; color: white; border-color: #2563eb; }
main { max-width: 1320px; margin: auto; padding: 34px 22px 70px; }

.homeHero { display: grid; grid-template-columns: 1.25fr .75fr; gap: 28px; align-items: center; background: radial-gradient(circle at top left, #2563eb, #020617 62%); color: white; padding: 48px; border-radius: 34px; box-shadow: 0 24px 70px #1e3a8a35; }
.homeHero h1 { font-size: 50px; line-height: 1.03; margin: 10px 0 18px; max-width: 950px; }
.homeHero p { color: #dbeafe; font-size: 19px; line-height: 1.7; }
.heroActions { display: grid; gap: 10px; margin-top: 22px; }
.heroActions span { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.22); border-radius: 16px; padding: 13px 16px; }
.challengeCard { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); border-radius: 28px; padding: 24px; }
.challengeCard h3 { margin-top: 0; }
.challengeCard div { background: rgba(255,255,255,.12); border-radius: 16px; padding: 13px; margin-top: 10px; font-weight: 800; }

.eyebrow, .title p { color: #2563eb; font-size: 13px; font-weight: 900; letter-spacing: .22em; text-transform: uppercase; margin: 0; }
.title { margin-bottom: 26px; }
.title h2 { font-size: 42px; margin: 8px 0 8px; letter-spacing: -.03em; }
.title span { color: #475569; font-size: 18px; line-height: 1.6; max-width: 940px; display: block; }

.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 22px; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-top: 22px; }
.layout { display: grid; grid-template-columns: 1.15fr .85fr; gap: 20px; }
.card, .panel, .metric, .formula, .measure { background: white; border: 1px solid #dbe3ef; border-radius: 24px; padding: 24px; box-shadow: 0 16px 42px #0f172a0c; }
.card h3, .panel h3, .formula h3, .measure h3 { margin-top: 0; }
.card p, .panel p, .formula p, .measure p { color: #475569; line-height: 1.7; font-size: 16px; }
.buttons { display: flex; flex-wrap: wrap; gap: 10px; margin: 12px 0 24px; }

table { width: 100%; border-collapse: collapse; margin-top: 16px; overflow: hidden; border-radius: 14px; }
th, td { border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: left; }
th { background: #f8fafc; }
small { color: #64748b; }
.note, .explain { background: #eff6ff; padding: 15px; border-radius: 16px; color: #1e3a8a !important; }

.metric span { color: #64748b; display: block; font-size: 13px; }
.metric strong { font-size: 32px; display: block; margin-top: 5px; }
.bars { display: flex; flex-direction: column; gap: 12px; margin-top: 18px; }
.barRow { display: grid; grid-template-columns: 55px 1fr 60px; gap: 10px; align-items: center; }
.barTrack { height: 18px; background: #dbe3ef; border-radius: 999px; overflow: hidden; }
.barFill { height: 100%; background: linear-gradient(90deg, #2563eb, #38bdf8); border-radius: 999px; }
.svgChart { width: 100%; height: 270px; background: #f8fafc; border-radius: 18px; border: 1px solid #e2e8f0; }

.form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
label { display: flex; flex-direction: column; gap: 5px; font-weight: 800; color: #334155; }
input { border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px; }
.status { font-size: 32px; font-weight: 900; border-radius: 20px; padding: 24px; margin: 16px 0; }
.ok { background: #dcfce7; color: #166534; }
.warn { background: #fef3c7; color: #92400e; }
.bad { background: #fee2e2; color: #991b1b; }
.check { padding: 13px; margin-top: 10px; border-radius: 14px; }
.okBox { background: #f0fdf4; border: 1px solid #bbf7d0; }
.badBox { background: #fff7ed; border: 1px solid #fed7aa; }
.final { font-size: 21px; background: #f8fafc; padding: 20px; border-radius: 18px; color: #0f172a !important; }

.theoryHero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 22px; align-items: center; background: radial-gradient(circle at top left, #dbeafe, #fff 58%); border: 1px solid #dbeafe; border-radius: 30px; padding: 30px; margin-bottom: 24px; }
.theoryHero h2 { font-size: 34px; margin: 0 0 12px; }
.waveCard { background: #020617; color: white; border-radius: 24px; padding: 18px; }
.waveCard p { text-align: center; color: #cbd5e1; }

.mathBlock {
  background: #020617;
  color: #e0f2fe;
  border-radius: 16px;
  padding: 16px;
  margin: 12px 0;
  overflow-x: auto;
  border: 1px solid #1e293b;
}

.smallMath {
  padding: 12px;
  border-radius: 12px;
}

.mathBlock .katex {
  font-size: 1.25rem;
}

.smallMath .katex {
  font-size: 1rem;
}

.pqMap { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.pqMap div { background: linear-gradient(135deg, #f8fafc, #eef2ff); border: 1px solid #dbeafe; border-radius: 18px; padding: 16px; }
.pqMap b { display: block; margin-bottom: 7px; }
.pqMap span { color: #475569; line-height: 1.55; }
.niceList { margin: 0; padding-left: 20px; color: #475569; line-height: 1.9; }

.pill { display: inline-block; padding: 5px 10px; border-radius: 999px; font-weight: 900; }
.pill.R { background: #e0f2fe; color: #075985; }
.pill.RL { background: #fef3c7; color: #92400e; }
.pill.NL { background: #fee2e2; color: #991b1b; }

.circuit { background: #f8fafc; border: 1px solid #dbe3ef; border-radius: 20px; padding: 18px; margin-top: 15px; }
.supply { background: #020617; color: #dbeafe; border-radius: 14px; padding: 12px; font-weight: 800; margin-bottom: 14px; }
.circuitLine { display: grid; grid-template-columns: 32px 1fr 190px 1fr 24px; align-items: center; gap: 8px; margin: 12px 0; }
.wire { height: 3px; background: #334155; }
.loadBox { text-align: center; border-radius: 14px; padding: 10px; font-weight: 900; background: white; border: 2px solid #2563eb; }
.loadBox small { display: block; font-weight: 600; color: #475569; font-size: 11px; margin-top: 4px; }

.workflow { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.workflow div { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 18px; padding: 18px; text-align: center; }
.workflow b { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #2563eb; color: white; margin-bottom: 8px; }
.workflow span { display: block; font-weight: 800; color: #1e3a8a; }
.measure { min-height: 210px; }
.method ol { line-height: 1.9; color: #475569; }

.analyzerIntro {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  align-items: center;
  background: linear-gradient(135deg, #ffffff, #eff6ff);
}

.signalLegend {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.signalLegend span {
  background: #020617;
  color: #dbeafe;
  border-radius: 14px;
  padding: 12px 14px;
}

.signalLegend b {
  color: white;
  margin-right: 8px;
}

.theoryCalc {
  border: 2px solid #bfdbfe;
  background: linear-gradient(135deg, #ffffff, #f8fbff);
}

.formulaGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.formula.mini {
  box-shadow: none;
  border: 1px solid #dbeafe;
  background: #ffffff;
}

.formula.mini h3 {
  font-size: 17px;
}

.formula.mini small {
  display: block;
  margin-top: 8px;
  color: #1d4ed8;
  font-weight: 700;
  line-height: 1.45;
}

@media (max-width: 900px) {
  .grid3, .grid4, .layout, .homeHero, .theoryHero, .pqMap, .workflow, .analyzerIntro, .formulaGrid { grid-template-columns: 1fr; }
  .topbar { align-items: flex-start; flex-direction: column; }
  .homeHero h1, .title h2 { font-size: 31px; }
}
`;