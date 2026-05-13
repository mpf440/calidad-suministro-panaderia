import React, { useMemo, useState } from "react";

const authors = ["Miguel Pomares Fernández", "Antonio Arcos Cortes", "Alejandro Rodriguez Fernandez"];

const scenarios = [
  {
    id: "g1",
    name: "G1 · Arranque / preparación",
    stage: "Inicio de jornada",
    desc: "Precalentamiento, ventilación, iluminación y control.",
    phases: [
      { phase: "L1", load: "Horno + resistencia auxiliar", z: "131 Ω", i: 1.76, type: "R", circuit: "R_horno ∥ R_aux" },
      { phase: "L2", load: "Ventilación / motor equivalente", z: "132.1 + j179.6 Ω", i: 1.03, type: "RL", circuit: "R + jωL" },
      { phase: "L3", load: "Iluminación/control", z: "435 Ω", i: 0.53, type: "R", circuit: "R_servicios" },
    ],
    neutral: 0.59,
    conclusion: "Desequilibrio moderado. Útil como baseline realista para comparar después."
  },
  {
    id: "g2",
    name: "G2 · Amasado y formado",
    stage: "Producción mecánica",
    desc: "Amasadoras, cintas, fermentación y electrónica auxiliar.",
    phases: [
      { phase: "L1", load: "Amasadora + cinta", z: "R=120 Ω, L=0.35 H", i: 1.42, type: "RL", circuit: "(R+L)_amasadora ∥ (R+L)_cinta" },
      { phase: "L2", load: "Fermentación + apoyo térmico", z: "150 Ω", i: 1.53, type: "R", circuit: "R_fermentación" },
      { phase: "L3", load: "Control + electrónica", z: "270–300 Ω + NL", i: 0.82, type: "NL", circuit: "R_servicios ∥ NL" },
    ],
    neutral: 0.75,
    conclusion: "Aparece diferencia entre PF verdadero y cosφ por presencia de reactiva y electrónica."
  },
  {
    id: "g3",
    name: "G3 · Horneado intensivo",
    stage: "Máxima producción",
    desc: "Hornos de inducción, compresor, extracción y electrónica de control.",
    phases: [
      { phase: "L1", load: "Horno de inducción 1", z: "No lineal", i: 1.60, type: "NL", circuit: "NL_horno1" },
      { phase: "L2", load: "Horno de inducción 2", z: "No lineal", i: 1.60, type: "NL", circuit: "NL_horno2" },
      { phase: "L3", load: "Compresor + extracción", z: "RL equivalente", i: 1.20, type: "RL", circuit: "(R+L)_compresor ∥ (R+L)_extracción" },
    ],
    neutral: 1.00,
    conclusion: "Escenario crítico: THD alto, picos de corriente y posible disparo de protecciones."
  }
];

const standards = [
  ["UNE-EN 50160", "Características de tensión suministrada", "Tensión, frecuencia, armónicos, desequilibrio y flicker"],
  ["IEC 61000-4-30", "Métodos de medida", "RMS, eventos, armónicos, agregación y clasificación"],
  ["IEEE 1159", "Clasificación de eventos", "Dips, swells, interrupciones, transitorios"],
  ["IEEE 519 / IEC 61000-3-2", "Armónicos", "Emisiones armónicas y límites/recomendaciones"]
];

function rms(arr) { return arr.length ? Math.sqrt(arr.reduce((a, x) => a + x * x, 0) / arr.length) : 0; }
function peak(arr) { return arr.length ? Math.max(...arr.map((x) => Math.abs(x))) : 0; }
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows = lines.map((line) => line.split(/[;,\t]/).map((x) => x.trim()));
  let start = 0;
  if (rows[0]?.some((x) => isNaN(Number(String(x).replace(",", "."))))) start = 1;
  const data = [];
  for (let i = start; i < rows.length; i++) {
    const nums = rows[i].map((x) => Number(String(x).replace(",", "."))).filter(Number.isFinite);
    if (nums.length >= 2) data.push({ t: nums[0], y: nums[1] });
    else if (nums.length === 1) data.push({ t: data.length, y: nums[0] });
  }
  return data;
}
function generateSignal(type) {
  const fs = 5000, out = [];
  for (let n = 0; n < 700; n++) {
    const t = n / fs;
    const s = Math.sin(2 * Math.PI * 50 * t);
    let y = 1.8 * s;
    if (type === "rl") y = 1.5 * Math.sin(2 * Math.PI * 50 * t - Math.PI / 4);
    if (type === "rect") y = Math.max(0, 2.2 * s);
    if (type === "smps") y = Math.abs(s) > 0.72 ? Math.sign(s) * 2.2 : 0;
    if (type === "evento") y = (t > 0.045 && t < 0.075 ? 0.45 : 1) * 1.8 * s + (t > 0.075 && t < 0.079 ? 0.9 : 0);
    out.push({ t: +(t * 1000).toFixed(2), y: +y.toFixed(4) });
  }
  return out;
}
function harmonicEstimate(values, fs = 5000) {
  const N = Math.min(values.length, 1024);
  if (N < 32) return [];
  const avg = values.slice(0, N).reduce((a, b) => a + b, 0) / N;
  const centered = values.slice(0, N).map((v) => v - avg);
  const result = [];
  for (let h = 1; h <= 15; h++) {
    const f = h * 50;
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const theta = (2 * Math.PI * f * n) / fs;
      re += centered[n] * Math.cos(theta);
      im -= centered[n] * Math.sin(theta);
    }
    result.push({ h, value: (2 / N) * Math.sqrt(re * re + im * im) / Math.sqrt(2) });
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
    ["Tensión RMS", p.vMin >= 207 && p.vMax <= 253, "230 V ±10 % como referencia práctica UNE-EN 50160."],
    ["Frecuencia", p.fMin >= 49.5 && p.fMax <= 50.5, "Rango operativo cercano a 50 Hz."],
    ["THD tensión", p.thdV <= 8, "Objetivo conservador: THD_U ≤ 8 %."] ,
    ["THD corriente", p.thdI <= 25, "Indica severidad de cargas no lineales."],
    ["Desequilibrio", p.unbalance <= 2, "Objetivo típico ≤ 2 % para evitar neutro y calentamiento."],
    ["Neutro", p.neutral <= p.phaseAvg * 0.4, "IN elevada indica desequilibrio o armónicos triples."],
    ["Factor de potencia", p.pf >= 0.95, "Recomendable PF ≥ 0.95."],
    ["Protecciones", p.trips === 0, "No debe haber disparos en operación normal."]
  ];
  const fails = checks.filter((c) => !c[1]).length;
  const score = Math.max(0, 100 - fails * 13);
  const status = score >= 85 ? "APTO" : score >= 65 ? "APTO CON MEDIDAS" : "NO APTO";
  return { checks, score, status };
}

function downloadReport() {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Informe Equalyti PQ</title><style>body{font-family:Arial;margin:40px;line-height:1.6;color:#111827}h1{color:#1d4ed8}.box{background:#f1f5f9;padding:16px;border-radius:12px}</style></head><body><h1>Informe técnico · Equalyti PQ</h1><h2>Caso C5 · Panadería industrial</h2><p><b>Autores:</b> ${authors.join(", ")}</p><div class="box">Diagnóstico de calidad eléctrica aplicado a hornos de inducción, motores, compresores, iluminación LED y electrónica auxiliar.</div><h2>Diagnóstico</h2><p>El problema no es un único fallo: se superponen arranque brusco, electrónica de potencia, desequilibrio y posible mala coordinación de protecciones.</p><h2>Recomendaciones</h2><ol><li>Arranque escalonado.</li><li>Redistribución de cargas por fase.</li><li>Medición específica de neutro.</li><li>Validación de THD con MyeBox.</li><li>Estudio de filtros o equipos con PFC.</li></ol></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "informe_equalyti_panaderia.html";
  a.click();
  URL.revokeObjectURL(url);
}

function Header({ tab, setTab }) {
  const tabs = [["inicio", "🏭 Inicio"], ["teoria", "📘 Teoría"], ["panaderia", "⚡ Panadería"], ["lab", "🔌 Laboratorio"], ["analizador", "📈 Analizador"], ["evaluador", "🛡️ Evaluador"], ["dictamen", "📄 Dictamen"]];
  return <header className="topbar"><div className="brand"><strong>Equalyti PQ</strong><span>Caso C5 · Panadería industrial</span></div><nav>{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>{label}</button>)}</nav></header>;
}
function Title({ small, big, text }) { return <div className="title"><p>{small}</p><h2>{big}</h2>{text && <span>{text}</span>}</div>; }
function Card({ title, text }) { return <div className="card"><h3>{title}</h3><p>{text}</p></div>; }
function Formula({ title, formula, text }) { return <div className="formula"><h3>{title}</h3><code>{formula}</code><p>{text}</p></div>; }

function Inicio() {
  return <section><div className="homeHero"><div><p className="eyebrow">Power Quality · Caso C5</p><h1>Diagnóstico visual de calidad eléctrica en una panadería industrial</h1><p>Herramienta para explicar teoría, simular escenarios, analizar formas de onda y defender un dictamen técnico como consultoría energética.</p><div className="heroActions"><span>🎯 Objetivo: pasar de “salta el diferencial” a una causa técnica medible.</span><span>⚡ Método: medir, comparar, diagnosticar y mitigar.</span></div></div><div className="challengeCard"><h3>Equipo</h3>{authors.map(a => <div key={a}>{a}</div>)}</div></div><div className="grid4"><Card title="1 · Entender" text="RMS, FFT, THD, neutro, eventos, factor de potencia y normativa."/><Card title="2 · Modelar" text="Arranque, amasado, horneado intensivo y servicios auxiliares."/><Card title="3 · Medir" text="Puntos P0–P4: cabecera, ramas R/RL/NL y neutro."/><Card title="4 · Defender" text="Dictamen técnico con causas, evidencias y medidas correctoras."/></div></section>;
}
function Teoria() {
  return <section><Title small="Base teórica" big="Calidad del suministro: del concepto a la medida" text="La calidad ideal implica tensión constante, frecuencia de 50 Hz, forma senoidal y equilibrio trifásico."/><div className="theoryHero"><div><h2>La señal ideal es senoidal; la instalación real no siempre lo es</h2><p>En una panadería industrial aparecen cargas lineales, RL y no lineales. Las no lineales absorben corriente no sinusoidal aunque la tensión sea senoidal.</p></div><WavePicture/></div><div className="grid3"><Formula title="Tensión ideal" formula="v(t)=Vm·sin(ωt)" text="Modelo ideal de red. En Europa f=50 Hz y ω=2πf."/><Formula title="RMS" formula="Xrms=√(Σx[n]²/N)" text="Valor eficaz muestra a muestra."/><Formula title="THD" formula="THD=√(Σh≥2 Xh²)/X1·100%" text="Distorsión armónica total."/><Formula title="FFT/DFT" formula="X(k)=Σx(n)e^(-j2πkn/N)" text="Paso del tiempo a frecuencia."/><Formula title="Neutro" formula="IN=|IL1+IL2+IL3|" text="Suma fasorial de corrientes."/><Formula title="Resonancia" formula="fr=1/(2π√LC)" text="Riesgo con condensadores y armónicos."/></div></section>;
}
function WavePicture() { return <div className="waveCard"><svg viewBox="0 0 500 180"><path d="M0 90 C40 10,80 10,120 90 S200 170,240 90 S320 10,360 90 S440 170,500 90" fill="none" stroke="#38bdf8" strokeWidth="7"/><path d="M0 90 C35 40,75 30,115 88 S180 150,230 90 S300 20,365 90 S430 150,500 90" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 8"/></svg><p>Azul: red ideal · Amarillo: red distorsionada</p></div>; }
function Panaderia() {
  const [id, setId] = useState("g1");
  const s = scenarios.find(x => x.id === id);
  return <section><Title small="Caso C5" big="Modelo funcional de panadería" text="Cada grupo representa una franja de trabajo. Las cargas se agrupan por función eléctrica."/><div className="buttons">{scenarios.map(x => <button key={x.id} onClick={() => setId(x.id)} className={id === x.id ? "activeBtn" : ""}>{x.name}</button>)}</div><div className="layout"><div className="panel"><h2>{s.name}</h2><p><b>{s.stage}</b> · {s.desc}</p><table><thead><tr><th>Fase</th><th>Equipo equivalente</th><th>Z</th><th>I</th><th>Tipo</th></tr></thead><tbody>{s.phases.map(p => <tr key={p.phase}><td>{p.phase}</td><td>{p.load}</td><td>{p.z}</td><td>{p.i.toFixed(2)} A</td><td><span className={`pill ${p.type}`}>{p.type}</span></td></tr>)}</tbody></table><p className="note"><b>Corriente de neutro estimada:</b> {s.neutral.toFixed(2)} A</p><p className="note">{s.conclusion}</p></div><div className="panel"><h3>Corrientes por fase</h3><BarChartSimple data={s.phases.map(p => ({ name: p.phase, value: p.i }))}/><h3>Esquema eléctrico equivalente</h3><CircuitDiagram scenario={s}/></div></div></section>;
}
function CircuitDiagram({ scenario }) { return <div className="circuit"><div className="supply">Alimentación: 3F + N · 230 V fase-neutro · 50 Hz</div>{scenario.phases.map(p => <div className="circuitLine" key={p.phase}><b>{p.phase}</b><span className="wire"></span><span className={`loadBox ${p.type}`}>{p.circuit}<small>{p.load}</small></span><span className="wire"></span><b>N</b></div>)}<p>Equipos simultáneos en paralelo. Motores como R+L en serie. Condensador de compensación en paralelo fase-neutro.</p></div>; }
function Lab() { return <section><Title small="Banco experimental" big="Montaje y campaña de medidas" text="Explica dónde medir, por qué se mide ahí y qué conclusión debe obtenerse."/><div className="grid3"><MeasurePoint title="P0 · Cabecera" what="VLN, IL, IN, THD, P, Q, S, PF" why="Punto de conexión común del cliente."/><MeasurePoint title="P1 · Rama térmica" what="V, I, RMS" why="Referencia casi senoidal."/><MeasurePoint title="P2 · Rama RL" what="Desfase V-I, Q, cosφ" why="Motores y compresores consumen reactiva."/><MeasurePoint title="P3 · Rama no lineal" what="Forma de onda, FFT, THD" why="Rectificadores, SMPS y LED generan armónicos."/><MeasurePoint title="P4 · Neutro" what="IN RMS" why="Revela desequilibrio y armónicos triples."/><MeasurePoint title="Evento" what="Pre-evento, evento, post-evento" why="Los disparos aparecen durante transitorios."/></div></section>; }
function MeasurePoint({ title, what, why }) { return <div className="measure"><h3>{title}</h3><p><b>Qué medir:</b> {what}</p><p><b>Por qué:</b> {why}</p></div>; }
function Analizador() {
  const [data, setData] = useState(generateSignal("smps"));
  const [theoryOpen, setTheoryOpen] = useState(true);
  const values = data.map(x => x.y);
  const harmonics = useMemo(() => harmonicEstimate(values), [data]);
  const thdVal = thd(harmonics);
  async function loadFile(e) { const file = e.target.files?.[0]; if (!file) return; const parsed = parseCSV(await file.text()); if (parsed.length > 5) setData(parsed); }
  return <section><Title small="PicoScope + procesado" big="Analizador didáctico de señales" text="Convierte una onda medida en RMS, pico, cresta, armónicos y THD."/><div className="panel"><input type="file" accept=".csv,.txt" onChange={loadFile}/><div className="buttons"><button onClick={() => setData(generateSignal("seno"))}>Senoidal</button><button onClick={() => setData(generateSignal("rl"))}>RL</button><button onClick={() => setData(generateSignal("rect"))}>Rectificador</button><button onClick={() => setData(generateSignal("smps"))}>SMPS</button><button onClick={() => setData(generateSignal("evento"))}>Evento</button><button onClick={() => setTheoryOpen(!theoryOpen)}>Teoremas de cálculo</button></div></div>{theoryOpen && <div className="panel"><h3>Teoremas y métodos</h3><div className="grid3"><Formula title="Nyquist" formula="fs ≥ 2·fmax" text="Evita aliasing."/><Formula title="RMS" formula="√(Σx²/N)" text="Efecto térmico equivalente."/><Formula title="Factor de cresta" formula="Xpico/Xrms" text="Detecta picos estrechos."/><Formula title="Fourier" formula="f(t)=a0+Σan cos(nωt)+bn sin(nωt)" text="Descompone señales periódicas."/><Formula title="DFT" formula="X(k)=Σx(n)e^(-j2πkn/N)" text="Base del espectro."/><Formula title="THD" formula="√(Σh≥2 Xh²)/X1" text="Distorsión global."/></div></div>}<div className="grid4"><Metric name="RMS" value={rms(values).toFixed(3)}/><Metric name="Pico" value={peak(values).toFixed(3)}/><Metric name="Cresta" value={(peak(values)/(rms(values)||1)).toFixed(2)}/><Metric name="THD estimada" value={`${thdVal.toFixed(1)} %`}/></div><div className="layout"><div className="panel"><h3>Forma de onda</h3><LineChartSimple data={data.slice(0,700)}/></div><div className="panel"><h3>Armónicos</h3><BarChartSimple data={harmonics.map(h => ({ name: `${h.h}º`, value: h.value }))}/></div></div></section>;
}
function Evaluador() {
  const [p, setP] = useState({ vMin:224, vMax:236, fMin:49.98, fMax:50.03, thdV:4.2, thdI:28, unbalance:2.4, neutral:0.59, phaseAvg:1.11, pf:0.91, trips:1 });
  const result = evaluatePQ(p);
  const update = (k, v) => setP(old => ({ ...old, [k]: Number(v) }));
  return <section><Title small="Cumplimiento" big="Evaluador de perfil eléctrico" text="Criterios de cribado basados en normativa y buena práctica."/><div className="layout"><div className="panel"><h3>Datos medidos</h3><div className="form">{Object.keys(p).map(k => <label key={k}>{k}<input value={p[k]} onChange={e => update(k, e.target.value)}/></label>)}</div></div><div className="panel"><h3>Resultado</h3><div className={`status ${result.status.includes("NO") ? "bad" : result.status.includes("MEDIDAS") ? "warn" : "ok"}`}>{result.status} · {result.score}/100</div>{result.checks.map(c => <div key={c[0]} className={`check ${c[1] ? "okBox" : "badBox"}`}><b>{c[0]}:</b> {c[1] ? "OK" : "Revisar"} · {c[2]}</div>)}</div></div><div className="panel"><h3>Normativa y valores de referencia</h3><table><thead><tr><th>Norma</th><th>Qué aporta</th><th>Uso</th></tr></thead><tbody>{standards.map(s => <tr key={s[0]}><td><b>{s[0]}</b></td><td>{s[1]}</td><td>{s[2]}</td></tr>)}</tbody></table></div></section>;
}
function Dictamen() { return <section><Title small="Dictamen técnico" big="Conclusión para la defensa" text="Resumen ejecutivo del diagnóstico, evidencias necesarias y mitigación."/><div className="grid3"><Card title="Causa 1 · Arranque simultáneo" text="Hornos, compresor y motores producen picos y transitorios."/><Card title="Causa 2 · No linealidad" text="Hornos de inducción, rectificadores y LED generan THD."/><Card title="Causa 3 · Desequilibrio" text="Cargas monofásicas mal repartidas elevan neutro y pérdidas."/></div><div className="panel"><h3>Recomendación final</h3><p>Aplicar arranque escalonado, redistribución de cargas por fase, medición de neutro, validación de THD y estudio de filtrado armónico o equipos con PFC.</p><p className="final">“El problema no es un único fallo, sino la superposición de arranque brusco, electrónica de potencia, desequilibrio y posible mala coordinación de protecciones.”</p><button onClick={downloadReport}>Descargar informe HTML</button></div></section>; }
function Metric({ name, value }) { return <div className="metric"><span>{name}</span><strong>{value}</strong></div>; }
function BarChartSimple({ data }) { const max = Math.max(...data.map(d => d.value), 0.001); return <div className="bars">{data.map(d => <div key={d.name} className="barRow"><span>{d.name}</span><div className="barTrack"><div className="barFill" style={{ width: `${(d.value/max)*100}%` }}/></div><b>{Number(d.value).toFixed(2)}</b></div>)}</div>; }
function LineChartSimple({ data }) { const w=700,h=250,ys=data.map(d=>d.y),min=Math.min(...ys),max=Math.max(...ys),range=max-min||1; const points=data.map((d,i)=>`${(i/Math.max(1,data.length-1))*w},${h-((d.y-min)/range)*h}`).join(" "); return <svg viewBox={`0 0 ${w} ${h}`} className="svgChart"><polyline points={points} fill="none" stroke="#2563eb" strokeWidth="3"/></svg>; }

export default function App() {
  const [tab, setTab] = useState("inicio");
  return <><style>{css}</style><Header tab={tab} setTab={setTab}/><main>{tab === "inicio" && <Inicio/>}{tab === "teoria" && <Teoria/>}{tab === "panaderia" && <Panaderia/>}{tab === "lab" && <Lab/>}{tab === "analizador" && <Analizador/>}{tab === "evaluador" && <Evaluador/>}{tab === "dictamen" && <Dictamen/>}</main></>;
}

const css = `
*{box-sizing:border-box}html,body,#root{margin:0;min-height:100vh}body{font-family:Inter,Segoe UI,Arial,sans-serif;background:#edf3fa;color:#0f172a}.topbar{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border-bottom:1px solid #dbe3ef;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;flex-direction:column}.brand strong{font-size:20px}.brand span{font-size:13px;color:#64748b}nav{display:flex;flex-wrap:wrap;gap:8px}button{border:1px solid #cbd5e1;background:white;color:#0f172a;padding:10px 15px;border-radius:14px;cursor:pointer;font-weight:800}button:hover{transform:translateY(-1px);background:#f8fafc}button.active,.activeBtn{background:#2563eb;color:white;border-color:#2563eb}main{max-width:1320px;margin:auto;padding:34px 22px 70px}.homeHero{display:grid;grid-template-columns:1.25fr .75fr;gap:28px;align-items:center;background:radial-gradient(circle at top left,#2563eb,#020617 62%);color:white;padding:48px;border-radius:34px;box-shadow:0 24px 70px #1e3a8a35}.homeHero h1{font-size:50px;line-height:1.03;margin:10px 0 18px}.homeHero p{color:#dbeafe;font-size:19px;line-height:1.7}.heroActions{display:grid;gap:10px;margin-top:22px}.heroActions span,.challengeCard div{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);border-radius:16px;padding:13px 16px}.challengeCard{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:28px;padding:24px}.eyebrow,.title p{color:#2563eb;font-size:13px;font-weight:900;letter-spacing:.22em;text-transform:uppercase;margin:0}.title{margin-bottom:26px}.title h2{font-size:42px;margin:8px 0;letter-spacing:-.03em}.title span{color:#475569;font-size:18px;line-height:1.6;max-width:940px;display:block}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:22px}.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:22px}.layout{display:grid;grid-template-columns:1.15fr .85fr;gap:20px}.card,.panel,.metric,.formula,.measure{background:white;border:1px solid #dbe3ef;border-radius:24px;padding:24px;box-shadow:0 16px 42px #0f172a0c}.card h3,.panel h3,.formula h3,.measure h3{margin-top:0}.card p,.panel p,.formula p,.measure p{color:#475569;line-height:1.7;font-size:16px}.buttons{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0 24px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border-bottom:1px solid #e2e8f0;padding:12px;text-align:left}th{background:#f8fafc}.note{background:#eff6ff;padding:15px;border-radius:16px;color:#1e3a8a!important}.metric span{color:#64748b;display:block;font-size:13px}.metric strong{font-size:32px;display:block;margin-top:5px}.bars{display:flex;flex-direction:column;gap:12px;margin-top:18px}.barRow{display:grid;grid-template-columns:55px 1fr 60px;gap:10px;align-items:center}.barTrack{height:18px;background:#dbe3ef;border-radius:999px;overflow:hidden}.barFill{height:100%;background:linear-gradient(90deg,#2563eb,#38bdf8);border-radius:999px}.svgChart{width:100%;height:270px;background:#f8fafc;border-radius:18px;border:1px solid #e2e8f0}.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}label{display:flex;flex-direction:column;gap:5px;font-weight:800;color:#334155}input{border:1px solid #cbd5e1;border-radius:12px;padding:10px}.status{font-size:32px;font-weight:900;border-radius:20px;padding:24px;margin:16px 0}.ok{background:#dcfce7;color:#166534}.warn{background:#fef3c7;color:#92400e}.bad{background:#fee2e2;color:#991b1b}.check{padding:13px;margin-top:10px;border-radius:14px}.okBox{background:#f0fdf4;border:1px solid #bbf7d0}.badBox{background:#fff7ed;border:1px solid #fed7aa}.final{font-size:21px;background:#f8fafc;padding:20px;border-radius:18px;color:#0f172a!important}.theoryHero{display:grid;grid-template-columns:1.1fr .9fr;gap:22px;align-items:center;background:radial-gradient(circle at top left,#dbeafe,#fff 58%);border:1px solid #dbeafe;border-radius:30px;padding:30px;margin-bottom:24px}.waveCard{background:#020617;color:white;border-radius:24px;padding:18px}.waveCard p{text-align:center;color:#cbd5e1}.formula code{display:block;background:#020617;color:#bfdbfe;padding:14px;border-radius:14px;font-size:17px;margin:12px 0}.pill{display:inline-block;padding:5px 10px;border-radius:999px;font-weight:900}.pill.R{background:#e0f2fe;color:#075985}.pill.RL{background:#fef3c7;color:#92400e}.pill.NL{background:#fee2e2;color:#991b1b}.circuit{background:#f8fafc;border:1px solid #dbe3ef;border-radius:20px;padding:18px;margin-top:15px}.supply{background:#020617;color:#dbeafe;border-radius:14px;padding:12px;font-weight:800;margin-bottom:14px}.circuitLine{display:grid;grid-template-columns:32px 1fr 190px 1fr 24px;align-items:center;gap:8px;margin:12px 0}.wire{height:3px;background:#334155}.loadBox{text-align:center;border-radius:14px;padding:10px;font-weight:900;background:white;border:2px solid #2563eb}.loadBox small{display:block;font-weight:600;color:#475569;font-size:11px;margin-top:4px}@media(max-width:900px){.grid3,.grid4,.layout,.homeHero,.theoryHero{grid-template-columns:1fr}.topbar{align-items:flex-start;flex-direction:column}.homeHero h1,.title h2{font-size:31px}}`;
