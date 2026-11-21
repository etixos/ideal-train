import { useState } from 'react';
import { SearchField, Tabs } from '../ui';
import { TOKENS } from '../tokens/registry';
import { TokenTable, type EditTarget } from './TokenField';

export interface EditorTab {
  id: string;
  label: string;
  prefix?: string | string[];
  ids?: string[];
}

/** Tabbed, searchable token editor for a workbench side panel. */
export function EditorTabs({ tabs, target }: { tabs: EditorTab[]; target?: EditTarget }) {
  const [tab, setTab] = useState(tabs[0].id);
  const [q, setQ] = useState('');
  const cur = tabs.find((t) => t.id === tab) ?? tabs[0];
  let ids = cur.ids;
  if (q) {
    const ps = tabs.flatMap((t) => (t.ids ? [] : Array.isArray(t.prefix) ? t.prefix : t.prefix ? [t.prefix] : []));
    const explicit = new Set(tabs.flatMap((t) => t.ids ?? []));
    const lq = q.toLowerCase();
    ids = TOKENS.filter((d) => (explicit.has(d.id) || ps.some((p) => d.id === p || d.id.startsWith(p + '.'))) && (d.id.toLowerCase().includes(lq) || d.description?.toLowerCase().includes(lq))).map((d) => d.id);
  }
  return (
    <div className="stack stack--md">
      <SearchField size="sm" value={q} onChange={setQ} placeholder="Filter tokens" />
      {!q && tabs.length > 1 && <Tabs value={tab} onChange={setTab} tabs={tabs.map((t) => ({ value: t.id, label: t.label }))} />}
      <TokenTable ids={ids} prefix={q ? undefined : cur.prefix} target={target} stacked />
    </div>
  );
}
