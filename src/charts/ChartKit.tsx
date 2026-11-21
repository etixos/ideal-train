import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  LabelList,
} from 'recharts';
import { useResolvedTokens } from '../theme/ThemeScope';
import { contrastRatio, mix } from '../tokens/color';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Icon } from '../ui';

/* ───────── Chart options (shared controls) ───────── */

export type PaletteKind = 'categorical' | 'sequential' | 'diverging' | 'monochrome';
export type RenderMode = 'screen' | 'print';

export interface ChartOptions {
  palette: PaletteKind;
  grid: 'none' | 'horizontal' | 'both';
  axes: boolean;
  labels: boolean;
  legend: boolean;
  tooltips: boolean;
  references: boolean;
  thresholds: boolean;
  /** 0..1: fraction of data points displayed (data density). */
  density: number;
  /** Distinguish series by dash pattern and markers, not color alone. */
  patterns: boolean;
  mode: RenderMode;
  animate: boolean;
}

export const DEFAULT_CHART_OPTIONS: ChartOptions = {
  palette: 'categorical',
  grid: 'horizontal',
  axes: true,
  labels: false,
  legend: true,
  tooltips: true,
  references: true,
  thresholds: true,
  density: 1,
  patterns: false,
  mode: 'screen',
  animate: true,
};

const OptionsContext = createContext<ChartOptions>(DEFAULT_CHART_OPTIONS);
export const ChartOptionsProvider = ({ value, children }: { value: ChartOptions; children: ReactNode }) => <OptionsContext.Provider value={value}>{children}</OptionsContext.Provider>;
export const useChartOptions = () => useContext(OptionsContext);

export const DASHES = ['0', '6 3', '2 3', '10 3 2 3', '1 4', '12 4'];
export const MARKERS = ['circle', 'square', 'diamond', 'triangle', 'cross', 'star'] as const;

/** Resolved chart styling for the current scope — palettes, axis colors, sizes. */
export function useChartTheme() {
  const t = useResolvedTokens();
  const o = useChartOptions();
  return useMemo(() => {
    const cat = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => t[`color.chart.cat.${i}`]);
    const seq = [1, 2, 3, 4, 5, 6, 7].map((i) => t[`color.chart.seq.${i}`]);
    const div = [1, 2, 3, 4, 5, 6, 7].map((i) => t[`color.chart.div.${i}`]);
    const mono = [t['color.chart.cat.1'], mix(t['color.chart.cat.1'], t['chart.bg'], 0.3), mix(t['color.chart.cat.1'], t['chart.bg'], 0.5), mix(t['color.chart.cat.1'], t['chart.bg'], 0.65), mix(t['color.chart.cat.1'], t['chart.bg'], 0.78), mix(t['color.chart.cat.1'], t['chart.bg'], 0.86)];
    /** Series colors for the currently selected palette. */
    const series = (n: number): string[] => {
      if (o.palette === 'categorical') return Array.from({ length: n }, (_, i) => cat[i % cat.length]);
      const ramp = o.palette === 'sequential' ? seq.slice(1) : o.palette === 'diverging' ? [div[0], div[6], div[1], div[5], div[2], div[4]] : mono;
      if (o.palette !== 'sequential') return Array.from({ length: n }, (_, i) => ramp[i % ramp.length]);
      // Spread evenly over the sequential ramp, darkest first.
      return Array.from({ length: n }, (_, i) => ramp[Math.round(((ramp.length - 1) * (n - 1 - i)) / Math.max(1, n - 1))]);
    };
    const px = (s: string) => parseFloat(s) || 0;
    return {
      t,
      o,
      cat,
      seq,
      div,
      series,
      bg: t['chart.bg'],
      grid: t['color.chart.grid'],
      axis: t['color.chart.axis'],
      label: t['color.chart.label'],
      text: t['color.text.primary'],
      positive: t['color.chart.positive'],
      negative: t['color.chart.negative'],
      neutral: t['color.chart.neutral'],
      reference: t['color.chart.reference'],
      threshold: t['color.chart.threshold'],
      fontSize: px(t['chart.label.size']) || 11,
      fontFamily: t['font.family.sans'],
      lineWidth: px(t['chart.line.width']) || 2,
      gridWidth: px(t['chart.grid.width']) || 1,
      barRadius: px(t['chart.bar.radius']),
      pointRadius: px(t['chart.point.radius']) || 3,
      animate: o.animate && o.mode === 'screen',
      tooltipStyle: {
        background: t['chart.tooltip.bg'],
        border: `1px solid ${t['chart.tooltip.border']}`,
        borderRadius: t['radius.sm'],
        color: t['chart.tooltip.fg'],
        fontSize: px(t['text.footnote.size']),
        boxShadow: t['elevation.overlay'],
        padding: '6px 10px',
      } as React.CSSProperties,
    };
  }, [t, o]);
}

export type ChartTheme = ReturnType<typeof useChartTheme>;

/** Common axis / grid / tooltip / legend elements, honoring the options. */
function useCommon(ct: ChartTheme, fmt?: (v: number) => string) {
  const { o } = ct;
  const tick = { fill: ct.label, fontSize: ct.fontSize, fontFamily: ct.fontFamily };
  return {
    grid: o.grid !== 'none' && <CartesianGrid stroke={ct.grid} strokeWidth={ct.gridWidth} vertical={o.grid === 'both'} />,
    x: (props: Record<string, unknown> = {}) => <XAxis hide={!o.axes} tick={tick} stroke={ct.axis} tickLine={false} axisLine={{ stroke: ct.axis }} minTickGap={8} {...props} />,
    y: (props: Record<string, unknown> = {}) => <YAxis hide={!o.axes} tick={tick} stroke={ct.axis} tickLine={false} axisLine={false} width={52} tickFormatter={fmt as never} {...props} />,
    tooltip: o.tooltips && (
      <Tooltip
        contentStyle={ct.tooltipStyle}
        itemStyle={{ color: ct.text, padding: 0 }}
        labelStyle={{ color: ct.label, marginBottom: 2 }}
        cursor={{ stroke: ct.axis, strokeWidth: 1, fill: mix(ct.axis, ct.bg, 0.85) }}
        formatter={fmt ? ((v: number) => fmt(v)) as never : undefined}
        isAnimationActive={false}
      />
    ),
    legend: o.legend && <Legend iconType="plainline" iconSize={14} wrapperStyle={{ fontSize: ct.fontSize, color: ct.label, fontFamily: ct.fontFamily, paddingTop: 4 }} />,
  };
}

const thin = <T,>(data: T[], density: number) => {
  if (density >= 1) return data;
  const step = Math.max(1, Math.round(1 / Math.max(0.05, density)));
  return data.filter((_, i) => i % step === 0 || i === data.length - 1);
};

export interface SeriesDef {
  key: string;
  label?: string;
  /** Override color (resolved CSS color). */
  color?: string;
  dashed?: boolean;
}

interface CartesianProps {
  data: Record<string, unknown>[];
  x: string;
  series: SeriesDef[];
  height?: number;
  format?: (v: number) => string;
  reference?: { value: number; label: string };
  threshold?: { value: number; label: string; above?: boolean };
  band?: { from: number; to: number; label?: string };
}

/* ───────── Line / time series ───────── */
export function LineSeriesChart({ data, x, series, height = 260, format, reference, threshold, band }: CartesianProps) {
  const ct = useChartTheme();
  const c = useCommon(ct, format);
  const colors = ct.series(series.length);
  const rows = thin(data, ct.o.density);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={rows} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        {c.grid}
        {c.x({ dataKey: x })}
        {c.y()}
        {c.tooltip}
        {c.legend}
        {band && ct.o.thresholds && <ReferenceArea y1={band.from} y2={band.to} fill={ct.threshold} fillOpacity={0.07} stroke="none" label={band.label ? { value: band.label, fill: ct.threshold, fontSize: ct.fontSize, position: 'insideTopLeft' } : undefined} />}
        {reference && ct.o.references && <ReferenceLine y={reference.value} stroke={ct.reference} strokeDasharray="4 3" label={{ value: reference.label, fill: ct.reference, fontSize: ct.fontSize, position: 'insideTopLeft' }} />}
        {threshold && ct.o.thresholds && <ReferenceLine y={threshold.value} stroke={ct.threshold} strokeWidth={1.5} label={{ value: threshold.label, fill: ct.threshold, fontSize: ct.fontSize, position: 'insideBottomRight' }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label ?? s.key}
            stroke={s.color ?? colors[i]}
            strokeWidth={ct.lineWidth}
            strokeDasharray={s.dashed ? '5 4' : ct.o.patterns ? DASHES[i % DASHES.length] : undefined}
            dot={ct.o.patterns || rows.length <= 14 ? { r: ct.pointRadius, strokeWidth: 0, fill: s.color ?? colors[i] } : false}
            activeDot={{ r: ct.pointRadius + 1.5, strokeWidth: 2, stroke: ct.bg }}
            isAnimationActive={ct.animate}
          >
            {ct.o.labels && <LabelList dataKey={s.key} position="top" fontSize={ct.fontSize} fill={ct.label} formatter={format as never} />}
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ───────── Area / stacked area ───────── */
export function AreaSeriesChart({ data, x, series, height = 260, format, stacked, reference }: CartesianProps & { stacked?: boolean }) {
  const ct = useChartTheme();
  const c = useCommon(ct, format);
  const colors = ct.series(series.length);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={thin(data, ct.o.density)} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        {c.grid}
        {c.x({ dataKey: x })}
        {c.y()}
        {c.tooltip}
        {c.legend}
        {reference && ct.o.references && <ReferenceLine y={reference.value} stroke={ct.reference} strokeDasharray="4 3" label={{ value: reference.label, fill: ct.reference, fontSize: ct.fontSize, position: 'insideTopRight' }} />}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label ?? s.key}
            stackId={stacked ? 'a' : undefined}
            stroke={s.color ?? colors[i]}
            fill={s.color ?? colors[i]}
            fillOpacity={stacked ? 0.78 : 0.14}
            strokeWidth={stacked ? 1 : ct.lineWidth}
            strokeDasharray={ct.o.patterns && !stacked ? DASHES[i % DASHES.length] : undefined}
            isAnimationActive={ct.animate}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ───────── Bar / column / stacked ───────── */
export function BarSeriesChart({ data, x, series, height = 260, format, horizontal, stacked, reference, colorByValue }: CartesianProps & { horizontal?: boolean; stacked?: boolean; colorByValue?: (row: Record<string, unknown>) => string | undefined }) {
  const ct = useChartTheme();
  const c = useCommon(ct, format);
  const colors = ct.series(series.length);
  const r = ct.barRadius;
  const radius: [number, number, number, number] = horizontal ? [0, r, r, 0] : [r, r, 0, 0];
  const rows = thin(data, ct.o.density);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 12, right: 16, bottom: 4, left: horizontal ? 8 : 0 }} barCategoryGap="22%">
        {ct.o.grid !== 'none' && <CartesianGrid stroke={ct.grid} strokeWidth={ct.gridWidth} vertical={horizontal || ct.o.grid === 'both'} horizontal={!horizontal || ct.o.grid === 'both'} />}
        {horizontal ? c.x({ type: 'number', tickFormatter: format, axisLine: false }) : c.x({ dataKey: x })}
        {horizontal ? c.y({ type: 'category', dataKey: x, width: 92, tickFormatter: undefined, axisLine: { stroke: ct.axis } }) : c.y()}
        {c.tooltip}
        {series.length > 1 && c.legend}
        {reference && ct.o.references && (horizontal ? <ReferenceLine x={reference.value} stroke={ct.reference} strokeDasharray="4 3" label={{ value: reference.label, fill: ct.reference, fontSize: ct.fontSize, position: 'top' }} /> : <ReferenceLine y={reference.value} stroke={ct.reference} strokeDasharray="4 3" label={{ value: reference.label, fill: ct.reference, fontSize: ct.fontSize, position: 'insideTopRight' }} />)}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label ?? s.key} stackId={stacked ? 'a' : undefined} fill={s.color ?? colors[i]} radius={stacked && i < series.length - 1 ? 0 : radius} isAnimationActive={ct.animate} maxBarSize={48}>
            {colorByValue && rows.map((row, k) => <Cell key={k} fill={colorByValue(row) ?? s.color ?? colors[i]} />)}
            {ct.o.labels && !stacked && <LabelList dataKey={s.key} position={horizontal ? 'right' : 'top'} fontSize={ct.fontSize} fill={ct.label} formatter={format as never} />}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ───────── Combo: bars + line (financial comparison) ───────── */
export function ComboChart({ data, x, bars, lines, height = 280, format }: { data: Record<string, unknown>[]; x: string; bars: SeriesDef[]; lines: SeriesDef[]; height?: number; format?: (v: number) => string }) {
  const ct = useChartTheme();
  const c = useCommon(ct, format);
  const colors = ct.series(bars.length + lines.length);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={thin(data, ct.o.density)} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        {c.grid}
        {c.x({ dataKey: x })}
        {c.y()}
        {c.tooltip}
        {c.legend}
        {bars.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.label ?? s.key} fill={s.color ?? colors[i]} radius={[ct.barRadius, ct.barRadius, 0, 0]} isAnimationActive={ct.animate} maxBarSize={32} />
        ))}
        {lines.map((s, i) => (
          <Line key={s.key} dataKey={s.key} name={s.label ?? s.key} type="monotone" stroke={s.color ?? colors[bars.length + i]} strokeWidth={ct.lineWidth} strokeDasharray={s.dashed ? '5 4' : undefined} dot={false} isAnimationActive={ct.animate} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ───────── Pie / donut ───────── */
export function DonutChart({ data, height = 240, donut = true, format = (v: number) => `${v}%`, centerLabel, centerValue }: { data: { name: string; value: number }[]; height?: number; donut?: boolean; format?: (v: number) => string; centerLabel?: string; centerValue?: string }) {
  const ct = useChartTheme();
  const colors = ct.series(data.length);
  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          {ct.o.tooltips && <Tooltip contentStyle={ct.tooltipStyle} itemStyle={{ color: ct.text }} formatter={((v: number) => format(v)) as never} isAnimationActive={false} />}
          {ct.o.legend && <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" iconSize={10} wrapperStyle={{ fontSize: ct.fontSize, color: ct.label, fontFamily: ct.fontFamily }} />}
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={donut ? '58%' : 0}
            outerRadius="86%"
            paddingAngle={donut ? 1.5 : 0}
            stroke={ct.bg}
            strokeWidth={donut ? 2 : 1}
            isAnimationActive={ct.animate}
            label={ct.o.labels ? ({ value }: { value: number }) => format(value) : false}
            labelLine={false}
            cx={ct.o.legend ? '38%' : '50%'}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={colors[i]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {donut && centerValue && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: ct.o.legend ? '76%' : '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div className="t-title3 t-num">{centerValue}</div>
          {centerLabel && <div className="t-caption c-secondary">{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}

/* ───────── Scatter ───────── */
export function ScatterPlot({ data, x, y, group, height = 280, xLabel, yLabel, format }: { data: Record<string, unknown>[]; x: string; y: string; group: string; height?: number; xLabel?: string; yLabel?: string; format?: (v: number) => string }) {
  const ct = useChartTheme();
  const c = useCommon(ct, format);
  const groups = [...new Set(data.map((d) => String(d[group])))];
  const colors = ct.series(groups.length);
  const shapes = ['circle', 'square', 'diamond', 'triangle', 'cross', 'star'] as const;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 16, left: 0 }}>
        {ct.o.grid !== 'none' && <CartesianGrid stroke={ct.grid} strokeWidth={ct.gridWidth} vertical={ct.o.grid === 'both'} />}
        {c.x({ dataKey: x, type: 'number', name: xLabel ?? x, label: xLabel && ct.o.axes ? { value: xLabel, position: 'insideBottom', offset: -10, fill: ct.label, fontSize: ct.fontSize } : undefined })}
        {c.y({ dataKey: y, type: 'number', name: yLabel ?? y })}
        <ZAxis range={[28, 28]} />
        {ct.o.tooltips && <Tooltip contentStyle={ct.tooltipStyle} itemStyle={{ color: ct.text }} cursor={{ strokeDasharray: '3 3', stroke: ct.axis }} isAnimationActive={false} />}
        {c.legend}
        {groups.map((g, i) => (
          <Scatter key={g} name={g} data={thin(data.filter((d) => String(d[group]) === g), ct.o.density)} fill={colors[i]} fillOpacity={0.78} shape={ct.o.patterns ? shapes[i % shapes.length] : 'circle'} isAnimationActive={ct.animate} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/* ───────── Waterfall ───────── */
export function WaterfallChart({ data, height = 280, format }: { data: { name: string; value: number; kind: 'total' | 'delta' }[]; height?: number; format?: (v: number) => string }) {
  const ct = useChartTheme();
  const c = useCommon(ct, format);
  let running = 0;
  const rows = data.map((d) => {
    if (d.kind === 'total') {
      running = d.value;
      return { name: d.name, base: 0, bar: d.value, raw: d.value, kind: d.kind, text: format ? format(d.value) : String(d.value) };
    }
    const start = running;
    running += d.value;
    const f = format ? format(Math.abs(d.value)) : String(Math.abs(d.value));
    return { name: d.name, base: Math.min(start, running), bar: Math.abs(d.value), raw: d.value, kind: d.kind, text: `${d.value >= 0 ? '+' : '−'}${f}` };
  });
  const color = (r: (typeof rows)[number]) => (r.kind === 'total' ? ct.neutral : r.raw >= 0 ? ct.positive : ct.negative);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 18, right: 16, bottom: 4, left: 0 }} barCategoryGap="18%">
        {c.grid}
        {c.x({ dataKey: 'name', interval: 0, fontSize: ct.fontSize })}
        {c.y()}
        {ct.o.tooltips && <Tooltip contentStyle={ct.tooltipStyle} itemStyle={{ color: ct.text }} cursor={{ fill: mix(ct.axis, ct.bg, 0.85) }} formatter={((_: number, __: string, p: { payload: { raw: number } }) => [format ? format(p.payload.raw) : p.payload.raw, 'Change']) as never} isAnimationActive={false} />}
        <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="bar" stackId="w" radius={[ct.barRadius, ct.barRadius, 0, 0]} isAnimationActive={ct.animate}>
          {rows.map((r, i) => (
            <Cell key={i} fill={color(r)} />
          ))}
          <LabelList dataKey="text" position="top" fontSize={ct.fontSize} fill={ct.label} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ───────── Heatmap (custom) ───────── */
export function Heatmap({ rows, columns, height, format = (v: number) => `${v}`, diverging, midpoint = 100, legendLabel }: { rows: { label: string; values: number[] }[]; columns: string[]; height?: number; format?: (v: number) => string; diverging?: boolean; midpoint?: number; legendLabel?: string }) {
  const ct = useChartTheme();
  const all = rows.flatMap((r) => r.values);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const ramp = diverging ? ct.div : ct.seq;
  const colorFor = (v: number) => {
    let t: number;
    if (diverging) {
      const span = Math.max(midpoint - min, max - midpoint) || 1;
      t = 0.5 + (v - midpoint) / span / 2;
    } else t = (v - min) / (max - min || 1);
    return ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(t * (ramp.length - 1))))];
  };
  const inkFor = (bg: string) => {
    const light = ct.t['color.text.primary'];
    const dark = ct.t['color.text.inverse'];
    // Pick whichever of the two text colors contrasts better with the cell.
    return contrastPick(bg, light, dark);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: height }}>
      <div style={{ display: 'grid', gridTemplateColumns: `48px repeat(${columns.length}, minmax(0, 1fr))`, gap: 2, fontSize: ct.fontSize, fontFamily: ct.fontFamily }} role="table" aria-label={legendLabel}>
        <div />
        {columns.map((c) => (
          <div key={c} style={{ textAlign: 'center', color: ct.label }} role="columnheader">
            {c}
          </div>
        ))}
        {rows.map((r) => (
          <div key={r.label} style={{ display: 'contents' }} role="row">
            <div style={{ color: ct.label, alignSelf: 'center' }} role="rowheader">
              {r.label}
            </div>
            {r.values.map((v, i) => {
              const bg = colorFor(v);
              return (
                <div key={i} role="cell" title={`${r.label} ${columns[i]}: ${format(v)}`} style={{ background: bg, color: inkFor(bg), height: 28, borderRadius: Math.min(ct.barRadius, 3), display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>
                  {ct.o.labels ? format(v) : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {ct.o.legend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: ct.fontSize, color: ct.label, marginLeft: 48 }}>
          <span>{format(min)}</span>
          <div style={{ display: 'flex', flex: '0 1 220px', height: 8, borderRadius: 2, overflow: 'hidden' }}>
            {ramp.map((c, i) => (
              <div key={i} style={{ flex: 1, background: c }} />
            ))}
          </div>
          <span>{format(max)}</span>
          {legendLabel && <span style={{ marginLeft: 8 }}>{legendLabel}</span>}
        </div>
      )}
    </div>
  );
}

function contrastPick(bg: string, a: string, b: string) {
  return (contrastRatio(a, bg) ?? 0) >= (contrastRatio(b, bg) ?? 0) ? a : b;
}

/* ───────── Funnel (custom) ───────── */
export function FunnelChart({ data, format = (v: number) => v.toLocaleString() }: { data: { stage: string; value: number }[]; format?: (v: number) => string }) {
  const ct = useChartTheme();
  const max = data[0]?.value || 1;
  const colors = ct.o.palette === 'categorical' ? data.map(() => ct.cat[0]) : ct.series(data.length);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: ct.fontFamily }}>
      {data.map((d, i) => {
        const w = (d.value / max) * 100;
        const conv = i > 0 ? d.value / data[i - 1].value : null;
        return (
          <div key={d.stage} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 92px', alignItems: 'center', gap: 10, fontSize: ct.fontSize + 1 }}>
            <span style={{ color: ct.text }}>{d.stage}</span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: `${w}%`, height: 26, background: colors[i], opacity: ct.o.palette === 'categorical' ? 1 - i * 0.13 : 1, borderRadius: ct.barRadius, transition: ct.animate ? 'width 300ms' : undefined }} title={`${d.stage}: ${format(d.value)}`} />
            </div>
            <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: ct.text }}>
              {format(d.value)}
              {conv != null && <span style={{ color: ct.label, display: 'block', fontSize: ct.fontSize }}>{(conv * 100).toFixed(0)}% of prior</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── Gauge (custom) ───────── */
export function Gauge({ value, min = 0, max = 100, target, label, format = (v: number) => `${Math.round(v)}%`, bands = [0.6, 0.85] }: { value: number; min?: number; max?: number; target?: number; label: string; format?: (v: number) => string; bands?: [number, number] }) {
  const ct = useChartTheme();
  const R = 70;
  const cx = 90;
  const cy = 86;
  const ang = (v: number) => Math.PI * (1 - (Math.max(min, Math.min(max, v)) - min) / (max - min));
  const pt = (v: number, r = R) => [cx + r * Math.cos(ang(v)), cy - r * Math.sin(ang(v))];
  const arc = (a: number, b: number) => {
    const [x1, y1] = pt(a);
    const [x2, y2] = pt(b);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };
  const span = max - min;
  const b1 = min + span * bands[0];
  const b2 = min + span * bands[1];
  const tone = value < b1 ? ct.negative : value < b2 ? ct.t['color.status.warning.solid'] : ct.positive;
  const status = value < b1 ? 'Below plan' : value < b2 ? 'Near plan' : 'On plan';
  const [tx1, ty1] = target != null ? pt(target, R - 12) : [0, 0];
  const [tx2, ty2] = target != null ? pt(target, R + 12) : [0, 0];
  return (
    <svg viewBox="0 0 180 112" width="100%" style={{ maxWidth: 260, display: 'block', margin: '0 auto' }} role="img" aria-label={`${label}: ${format(value)}, ${status}`}>
      <path d={arc(min, max)} stroke={ct.grid} strokeWidth={14} fill="none" />
      {ct.o.thresholds && (
        <>
          <path d={arc(min, b1)} stroke={ct.negative} strokeOpacity={0.18} strokeWidth={14} fill="none" />
          <path d={arc(b1, b2)} stroke={ct.t['color.status.warning.solid']} strokeOpacity={0.18} strokeWidth={14} fill="none" />
        </>
      )}
      <path d={arc(min, value)} stroke={tone} strokeWidth={14} fill="none" style={{ transition: ct.animate ? 'd 400ms' : undefined }} />
      {target != null && ct.o.references && <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={ct.reference} strokeWidth={2.5} />}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={ct.text} fontSize={22} fontWeight={600} fontFamily={ct.t['font.family.serif']} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {format(value)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={ct.label} fontSize={ct.fontSize} fontFamily={ct.fontFamily}>
        {status}
      </text>
      {ct.o.axes && (
        <>
          <text x={cx - R} y={cy + 20} textAnchor="middle" fill={ct.label} fontSize={ct.fontSize - 1}>
            {format(min)}
          </text>
          <text x={cx + R} y={cy + 20} textAnchor="middle" fill={ct.label} fontSize={ct.fontSize - 1}>
            {format(max)}
          </text>
        </>
      )}
    </svg>
  );
}

/* ───────── Sparkline (custom) ───────── */
export function Sparkline({ values, width = 120, height = 32, tone, area = true, showEnd = true }: { values: number[]; width?: number; height?: number; tone?: 'positive' | 'negative' | 'neutral' | 'accent'; area?: boolean; showEnd?: boolean }) {
  const ct = useChartTheme();
  const color = tone === 'positive' ? ct.positive : tone === 'negative' ? ct.negative : tone === 'neutral' ? ct.neutral : ct.cat[0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 3;
  const pts = values.map((v, i) => [pad + (i / Math.max(1, values.length - 1)) * (width - pad * 2), pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      {area && <path d={`${d} L${last[0]},${height} L${pts[0][0]},${height} Z`} fill={color} fillOpacity={0.12} />}
      <path d={d} fill="none" stroke={color} strokeWidth={Math.max(1.25, ct.lineWidth - 0.5)} strokeLinejoin="round" strokeLinecap="round" />
      {showEnd && <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />}
    </svg>
  );
}

/* ───────── Trend indicator & KPI card ───────── */
/** Direction is shown by arrow + sign + color — never color alone. */
export function Trend({ delta, format = (v: number) => `${(Math.abs(v) * 100).toFixed(1)}%`, goodWhen = 'up', suffix }: { delta: number; format?: (v: number) => string; goodWhen?: 'up' | 'down'; suffix?: string }) {
  const up = delta > 0.0005;
  const down = delta < -0.0005;
  const good = (up && goodWhen === 'up') || (down && goodWhen === 'down');
  const cls = !up && !down ? 'c-secondary' : good ? 'c-success' : 'c-danger';
  const I = up ? ArrowUpRight : down ? ArrowDownRight : ArrowRight;
  return (
    <span className={`kpi__delta ${cls}`}>
      <Icon icon={I} size="sm" />
      <span>
        {up ? '+' : down ? '−' : ''}
        {format(delta)}
      </span>
      {suffix && <span className="c-secondary">{suffix}</span>}
    </span>
  );
}

export function KpiCard({ label, value, delta, goodWhen, spark, sparkTone, deltaFormat, suffix = 'vs prior year', footnote }: { label: string; value: string; delta?: number; goodWhen?: 'up' | 'down'; spark?: number[]; sparkTone?: 'positive' | 'negative' | 'neutral' | 'accent'; deltaFormat?: (v: number) => string; suffix?: string; footnote?: string }) {
  return (
    <div className="m-card m-card--pad kpi" style={{ gap: 6 }}>
      <div className="t-overline c-secondary">{label}</div>
      <div className="row row--between row--top">
        <div className="kpi__value">{value}</div>
        {spark && <Sparkline values={spark} tone={sparkTone} width={88} height={30} />}
      </div>
      {delta != null && <Trend delta={delta} goodWhen={goodWhen} format={deltaFormat} suffix={suffix} />}
      {footnote && <div className="t-caption c-tertiary">{footnote}</div>}
    </div>
  );
}
