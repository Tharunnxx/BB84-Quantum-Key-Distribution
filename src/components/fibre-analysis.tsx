import { useRef, useState } from 'react';
import { Cable, Download, FileUp, Play, RotateCcw, TriangleAlert } from 'lucide-react';
import { ResponsiveContainer, CartesianGrid, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { buildAnalyticalPreview, DEFAULT_FIBRE_PARAMETERS, formatLatency, formatRate, parseSequenceCsv, type FibreExperiment, type FibreParameters } from '@/lib/fibre';
import { downloadCsv, fibreRows } from '@/lib/csv-export';
import { useLab } from './lab-context';

const axis = { fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'DM Sans' };

export function FibreAnalysis() {
  const lab = useLab();
  const [parameters, setParameters] = useState<FibreParameters>(DEFAULT_FIBRE_PARAMETERS);
  const [experiment, setExperiment] = useState<FibreExperiment | null>(lab.fibreExperiment);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function update(name: keyof FibreParameters, value: number) {
    setParameters((current) => ({ ...current, [name]: value }));
  }

  function runPreview() {
    const result = buildAnalyticalPreview(parameters);
    setExperiment(result);
    lab.setFibreExperiment(result);
    setError(null);
  }

  function reset() {
    setParameters(DEFAULT_FIBRE_PARAMETERS);
    setExperiment(null);
    lab.setFibreExperiment(null);
    setError(null);
  }

  async function importCsv(file: File) {
    try {
      const text = await file.text();
      const result = parseSequenceCsv(text, parameters);
      setExperiment(result);
      lab.setFibreExperiment(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the CSV file.');
    }
  }

  const points = experiment?.points ?? [];
  const first = points[0];
  const last = points.at(-1);
  return <div className="space-y-6">
    <div className="flex justify-between items-end gap-5 flex-wrap">
      <div>
        <p className="section-label text-success mb-3">PHASE 2 · PHYSICAL CHANNEL MODEL</p>
        <h1 className="text-3xl font-semibold">Fibre-length analysis</h1>
        <p className="text-sm text-muted-foreground mt-2">Model BB84 key throughput as optical fibre distance increases.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={() => fileRef.current?.click()}><FileUp/>Import SeQUeNCe CSV</Button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void importCsv(file); e.currentTarget.value = ''; }}/>
        <Button variant="outline" disabled={!experiment} onClick={() => experiment && downloadCsv('fibre-results', fibreRows(experiment))}><Download/>Export data</Button>
      </div>
    </div>

    <section className="lab-panel p-5">
      <div className="flex items-start gap-3 mb-5"><Cable className="text-channel mt-0.5" size={20}/><div><h2 className="font-semibold text-sm">SeQUeNCe experiment parameters</h2><p className="text-[10px] text-muted-foreground mt-1">These defaults mirror the distance-BB84 example structure used by SeQUeNCe. The browser preview is analytical until a SeQUeNCe CSV is imported.</p></div></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NumberField label="Attenuation (dB/km)" value={parameters.attenuationDbPerKm} step={0.01} onChange={(v) => update('attenuationDbPerKm', v)}/>
        <NumberField label="Detector efficiency" value={parameters.detectorEfficiency} step={0.01} min={0} max={1} onChange={(v) => update('detectorEfficiency', v)}/>
        <NumberField label="Dark count (Hz)" value={parameters.darkCountRateHz} step={1} min={0} onChange={(v) => update('darkCountRateHz', v)}/>
        <NumberField label="Source rate (Hz)" value={parameters.sourceRateHz} step={1_000_000} min={1} onChange={(v) => update('sourceRateHz', v)}/>
        <NumberField label="Mean photon number" value={parameters.meanPhotonNumber} step={0.01} min={0.001} onChange={(v) => update('meanPhotonNumber', v)}/>
        <NumberField label="Simulation duration (s)" value={parameters.simulationDurationSeconds} step={1} min={0.1} onChange={(v) => update('simulationDurationSeconds', v)}/>
      </div>
      <div className="flex gap-2 mt-5 flex-wrap"><Button onClick={runPreview}><Play/>Generate analytical preview</Button><Button variant="ghost" onClick={reset}><RotateCcw/>Reset</Button></div>
      {error && <div className="mt-4 p-3 rounded border border-warning/30 bg-warning-soft text-xs flex gap-2"><TriangleAlert size={16} className="text-warning shrink-0"/><span>{error}</span></div>}
    </section>

    {experiment ? <>
      <section className="lab-panel overflow-hidden"><div className="panel-head"><div><h2 className="font-semibold text-sm">Key rate vs fibre length</h2><p className="text-[10px] text-muted-foreground mt-1">{experiment.source === 'sequence-csv' ? 'Imported from a SeQUeNCe distance-BB84 run' : 'Analytical preview · run the Python SeQUeNCe experiment for measured results'}</p></div><span className={`text-[10px] px-2 py-1 rounded ${experiment.source === 'sequence-csv' ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'}`}>{experiment.source === 'sequence-csv' ? 'SEQUENCE DATA' : 'PREVIEW'}</span></div>
        <div className="p-5"><div className="chart-box h-[320px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 12, right: 18, left: -10, bottom: 8 }}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3"/><XAxis dataKey="fibreLengthKm" type="number" domain={['dataMin', 'dataMax']} tick={axis} tickFormatter={(v) => `${v} km`} axisLine={false} tickLine={false}/><YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => formatRate(Number(v))}/><Tooltip content={<FibreTooltip/>}/><Line type="monotone" dataKey="siftedKeyRateBitsPerSecond" name="Sifted key rate" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false}/></LineChart></ResponsiveContainer></div></div>
      </section>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric label="Shortest link" value={first ? `${first.fibreLengthKm} km` : '—'} note={first ? formatRate(first.siftedKeyRateBitsPerSecond) : '—'}/>
        <Metric label="Longest link" value={last ? `${last.fibreLengthKm} km` : '—'} note={last ? formatRate(last.siftedKeyRateBitsPerSecond) : '—'}/>
        <Metric label="Measured QBER" value={experiment.source === 'sequence-csv' && last?.qberPercent != null ? `${last.qberPercent.toFixed(2)}%` : 'Not loaded'} note="SeQUeNCe error-rate column"/>
        <Metric label="Latency at longest link" value={formatLatency(last?.latencyNs)} note="One-way optical delay"/>
      </div>

      <section className="lab-panel"><div className="panel-head"><h2 className="font-semibold text-sm">Fibre results</h2><span className="text-[10px] text-muted-foreground">{points.length} DISTANCE POINTS</span></div><div className="overflow-x-auto"><table className="lab-table"><thead><tr><th>Distance</th><th>Sifted key rate</th><th>QBER</th><th>Latency</th></tr></thead><tbody>{points.map((point) => <tr key={point.fibreLengthKm}><td className="font-mono">{point.fibreLengthKm.toFixed(1)} km</td><td className="font-mono">{formatRate(point.siftedKeyRateBitsPerSecond)}</td><td className="font-mono">{point.qberPercent == null ? '—' : `${point.qberPercent.toFixed(2)}%`}</td><td className="font-mono">{formatLatency(point.latencyNs)}</td></tr>)}</tbody></table></div></section>
    </> : <section className="lab-panel p-10 text-center"><Cable size={30} className="mx-auto mb-3 text-muted-foreground"/><h2 className="font-semibold">No fibre experiment loaded</h2><p className="text-xs text-muted-foreground mt-2 max-w-xl mx-auto">Generate a clearly labelled analytical preview now, or run the included SeQUeNCe Python script and import its distance_bb84.csv for the actual simulator measurements.</p></section>}

    <section className="border-y border-border py-5 text-xs text-muted-foreground leading-6"><strong className="text-foreground">Important:</strong> the secure key rate is intentionally left blank. The included SeQUeNCe distance experiment measures BB84 throughput and error rate; a cryptographically secure final key rate requires authenticated sifting, parameter estimation, error correction and privacy amplification, which are outside this project’s implemented scope.</section>
  </div>;
}

function NumberField({ label, value, step, min, max, onChange }: { label: string; value: number; step: number; min?: number; max?: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="text-[10px] text-muted-foreground block mb-2">{label}</span><input className="lab-select" type="number" value={value} step={step} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))}/></label>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <section className="lab-panel p-5"><span className="text-[11px] text-muted-foreground">{label}</span><div className="metric-value mt-3">{value}</div><p className="text-[10px] text-muted-foreground mt-2">{note}</p></section>;
}

function FibreTooltip({ active, payload, label }: { active?: boolean; payload?: { value?: number; name?: string }[]; label?: number }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><strong>{Number(label).toFixed(1)} km</strong><p className="mt-1">{payload[0].name}: {formatRate(payload[0].value)}</p></div>;
}
