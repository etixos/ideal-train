import { Check, Copy, Download, FileJson, Trash2, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Page, Section } from '../lab/Page';
import { actions, useLab, useTheme, useView } from '../state/store';
import { flattenMode } from '../tokens/resolve';
import { getRegister, useRegister } from '../register/store';
import { MODES, MODE_IDS } from '../tokens/registry';
import type { ModeId } from '../tokens/types';
import { download, slug, toCSS, toJSON, toMarkdown, toSwift } from '../tokens/export';
import { runAudit } from './Accessibility';
import { Alert, Badge, Button, Card, IconButton, SegmentedControl, TextArea, TextInput, useToast } from '../ui';

type Format = 'json' | 'css' | 'swift' | 'md';
const FORMATS: { value: Format; label: string; file: (n: string) => string; mime: string; desc: string }[] = [
  { value: 'json', label: 'JSON tokens', file: (n) => `${n}.tokens.json`, mime: 'application/json', desc: 'Every token with its layer, references, light/dark/high-contrast values, platform and app overrides. Re-importable.' },
  { value: 'css', label: 'CSS variables', file: (n) => `${n}-tokens.css`, mime: 'text/css', desc: 'Custom properties for web apps. References stay as var(); dark, high-contrast, reduced-motion, platform and app scopes included.' },
  { value: 'swift', label: 'SwiftUI', file: (n) => `MercantileTokens-${n.split('-').slice(-2).map((w) => w[0].toUpperCase() + w.slice(1)).join('')}.swift`, mime: 'text/x-swift', desc: 'Swift types with dynamic light/dark/high-contrast colors, platform-aware metrics, Dynamic Type text styles, and a reference button style.' },
  { value: 'md', label: 'Documentation', file: (n) => `${n}-design-system.md`, mime: 'text/markdown', desc: 'Human-readable design documentation with build rules. Hand this to Claude when starting a new app.' },
];

export function ExportSection() {
  const fullTheme = useTheme();
  const view = useView();
  const [modeSel, setModeSel] = useState<ModeId | null>(null);
  const mode = modeSel ?? view.mode;
  const decisionsVersion = useRegister((s) => s.decisions);
  /** Exports describe one mode: shared values with that mode's overrides applied. */
  const theme = useMemo(() => flattenMode(fullTheme, mode), [fullTheme, mode]);
  const saved = useLab((s) => s.saved);
  const toast = useToast();
  const [fmt, setFmt] = useState<Format>('md');
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [snapName, setSnapName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const output = useMemo(() => {
    if (fmt === 'json') return toJSON(theme, fullTheme, getRegister().decisions);
    if (fmt === 'css') return toCSS(theme);
    if (fmt === 'swift') return toSwift(theme);
    return toMarkdown(theme, runAudit(theme), getRegister().decisions);
  }, [fmt, theme, fullTheme, decisionsVersion]);
  const f = FORMATS.find((x) => x.value === fmt)!;
  const name = slug(`${fullTheme.name} ${MODES[mode].label}`);

  const doImport = (text: string) => {
    try {
      const json = JSON.parse(text);
      const t = actions.importTheme(json);
      setErr(null);
      setPaste('');
      toast({ tone: 'success', title: `Imported “${t.name}”`, text: `${Object.keys(t.values).length} overrides applied. Undo to revert.` });
    } catch (e) {
      setErr(`Could not read that file: ${(e as Error).message}`);
    }
  };

  return (
    <Page eyebrow="System" title="Documentation & Export" description="Export the approved system for future projects. Give the documentation and the token file for the target platform to Claude when starting a new application so it inherits every Mercantile decision.">
      <div className="grid grid--4">
        {FORMATS.map((x) => (
          <Card key={x.value} padded interactive selected={fmt === x.value} onClick={() => setFmt(x.value)}>
            <div className="stack stack--xs">
              <div className="t-headline">{x.label}</div>
              <div className="t-code c-tertiary">{x.file(name)}</div>
              <p className="t-footnote c-secondary">{x.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Section
        title={f.label}
        actions={
          <>
            <Button
              icon={copied ? Check : Copy}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  toast({ tone: 'warning', title: 'Clipboard unavailable', text: 'Use Download instead.' });
                }
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="primary" icon={Download} onClick={() => download(f.file(name), output, f.mime)}>
              Download
            </Button>
            <Button
              icon={Download}
              onClick={() => {
                FORMATS.forEach((x, i) => setTimeout(() => download(x.file(name), x.value === 'json' ? toJSON(theme, fullTheme, getRegister().decisions) : x.value === 'css' ? toCSS(theme) : x.value === 'swift' ? toSwift(theme) : toMarkdown(theme, runAudit(theme), getRegister().decisions), x.mime), i * 250));
              }}
            >
              Download all four
            </Button>
          </>
        }
      >
        <div className="row row--wrap">
          <SegmentedControl<ModeId> value={mode} onChange={setModeSel} options={MODE_IDS.map((m) => ({ value: m, label: MODES[m].label }))} aria-label="Mode to export" />
          <SegmentedControl value={fmt} onChange={setFmt} options={FORMATS.map((x) => ({ value: x.value, label: x.label }))} aria-label="Format" />
        </div>
        <div className="row t-footnote c-secondary">
          <Badge>{output.split('\n').length.toLocaleString()} lines</Badge>
          <span>{(output.length / 1024).toFixed(1)} KB · updates live with the working theme “{theme.name}”</span>
        </div>
        <pre className="code-block" tabIndex={0} aria-label={`${f.label} output`}>
          {output}
        </pre>
      </Section>

      <div className="grid grid--2">
        <Section title="Saved configurations" description="Named snapshots of the working theme, stored in this browser. Download one to keep it or share it.">
          <div className="row">
            <TextInput aria-label="Configuration name" placeholder={fullTheme.name} value={snapName} onChange={setSnapName} style={{ flex: 1 }} />
            <Button
              variant="primary"
              onClick={() => {
                const s = actions.saveSnapshot(snapName.trim() || fullTheme.name);
                setSnapName('');
                toast({ tone: 'success', title: 'Saved', text: s.name });
              }}
            >
              Save current
            </Button>
          </div>
          <Card flush>
            <table className="m-table">
              <tbody>
                {saved.length === 0 && (
                  <tr>
                    <td className="m-table__empty">No saved configurations yet.</td>
                  </tr>
                )}
                {saved.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div>{s.name}</div>
                      <div className="t-caption c-tertiary">
                        {new Date(s.updatedAt).toLocaleString()} · {Object.keys(s.values).length} overrides
                      </div>
                    </td>
                    <td className="is-num">
                      <div className="row row--tight" style={{ justifyContent: 'flex-end' }}>
                        <Button size="sm" onClick={() => { actions.applyTheme(s); toast({ title: `Applied ${s.name}` }); }}>
                          Apply
                        </Button>
                        <IconButton icon={FileJson} label="Download configuration" size="sm" onClick={() => download(`${slug(s.name)}.mercantile.json`, JSON.stringify(s, null, 2), 'application/json')} />
                        <IconButton icon={Trash2} label="Delete configuration" size="sm" onClick={() => actions.deleteSnapshot(s.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Button icon={FileJson} onClick={() => download(`${name}.mercantile.json`, JSON.stringify(fullTheme, null, 2), 'application/json')}>
            Download working configuration
          </Button>
        </Section>
        <Section title="Import" description="Load a saved configuration or a JSON token export. It replaces the working theme; undo restores the previous one.">
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) doImport(await file.text());
              e.target.value = '';
            }}
          />
          <Button icon={Upload} onClick={() => fileRef.current?.click()}>
            Choose JSON file…
          </Button>
          <TextArea label="Or paste JSON" rows={6} value={paste} onChange={setPaste} placeholder='{ "name": "My theme", "values": { "palette.brass": "#A88148" } }' />
          <div className="row">
            <Button variant="primary" disabled={!paste.trim()} onClick={() => doImport(paste)}>
              Import pasted JSON
            </Button>
          </div>
          {err && <Alert tone="danger" title="Import failed">{err}</Alert>}
        </Section>
      </div>

      <Section title="Handing the system to Claude" description="When starting a new application:">
        <Card padded>
          <ol className="stack" style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              Attach <span className="t-code">{FORMATS[3].file(name)}</span>. It contains the rules, every token and its purpose, platform overrides, and the accessibility audit.
            </li>
            <li>
              Attach the token file for the target: <span className="t-code">mercantile-tokens.css</span> for web, <span className="t-code">MercantileTokens.swift</span> for macOS, iOS or iPadOS.
            </li>
            <li>Ask Claude to use only semantic and component tokens, never raw values, and to follow the platform conventions in the document.</li>
            <li>
              Keep <span className="t-code">{FORMATS[0].file(name)}</span> as the master copy. Import it here later to keep refining the system.
            </li>
          </ol>
        </Card>
      </Section>
    </Page>
  );
}
