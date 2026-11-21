import { Crosshair, ExternalLink, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { TokenField } from '../lab/TokenField';
import { actions, useTheme, useView } from '../state/store';
import { formatColor, parseColor } from '../tokens/color';
import { TOKENS, TOKEN_MAP } from '../tokens/registry';
import { cssVarName, refChain } from '../tokens/resolve';
import type { Layer } from '../tokens/types';
import { Badge, IconButton, Icon } from '../ui';
import { navigate } from './router';

/** Class → tokens that the class's CSS consumes. Gives precise answers for kit components. */
export const CLASS_TOKENS: Record<string, string[]> = {
  'm-btn': ['button.radius', 'button.height', 'button.padding.x', 'button.gap', 'button.font.size', 'button.font.weight', 'motion.duration.hover'],
  'm-btn--primary': ['button.primary.bg', 'button.primary.bg.hover', 'button.primary.bg.pressed', 'button.primary.fg'],
  'm-btn--secondary': ['button.secondary.bg', 'button.secondary.bg.hover', 'button.secondary.bg.pressed', 'button.secondary.fg', 'button.secondary.border'],
  'm-btn--ghost': ['button.ghost.fg', 'button.ghost.bg.hover', 'button.ghost.bg.pressed'],
  'm-btn--danger': ['button.danger.bg', 'button.danger.bg.hover', 'button.danger.bg.pressed', 'button.danger.fg'],
  'm-input': ['input.bg', 'input.fg', 'input.border', 'input.border.hover', 'input.border.focus', 'input.radius', 'input.height', 'input.padding.x', 'input.font.size', 'input.placeholder'],
  'm-check': ['control.check.size', 'control.check.radius', 'control.checked.bg', 'control.checked.fg'],
  'm-switch': ['control.switch.width', 'control.switch.height', 'control.track.bg', 'control.thumb.bg', 'control.checked.bg'],
  'm-slider': ['control.track.bg', 'control.checked.bg', 'control.thumb.bg'],
  'm-card': ['card.bg', 'card.border', 'card.radius', 'card.padding', 'card.shadow'],
  'm-dialog': ['dialog.bg', 'dialog.border', 'dialog.radius', 'dialog.padding', 'dialog.shadow'],
  'm-sheet': ['dialog.bg', 'dialog.radius', 'dialog.shadow', 'motion.duration.page'],
  'm-scrim': ['dialog.scrim'],
  'm-menu': ['menu.bg', 'menu.border', 'menu.radius', 'menu.shadow'],
  'm-menu__item': ['menu.item.fg', 'menu.item.bg.hover', 'menu.item.radius'],
  'm-popover': ['menu.bg', 'menu.border', 'menu.radius', 'menu.shadow'],
  'm-tooltip': ['tooltip.bg', 'tooltip.fg', 'tooltip.radius'],
  'm-table': ['table.font.size', 'table.row.height', 'table.cell.padding.x', 'table.border', 'table.header.bg', 'table.header.fg', 'table.row.bg.hover', 'table.row.bg.selected'],
  'm-table-wrap': ['table.bg', 'table.border', 'radius.container'],
  'm-sidebar': ['nav.sidebar.bg', 'nav.sidebar.border', 'layout.sidebar.width'],
  'm-nav-item': ['nav.item.fg', 'nav.item.fg.selected', 'nav.item.bg.hover', 'nav.item.bg.selected', 'nav.item.radius', 'nav.item.height', 'icon.size.nav'],
  'm-toolbar': ['nav.toolbar.bg', 'nav.toolbar.border', 'nav.toolbar.height'],
  'm-tab': ['nav.tab.fg', 'nav.tab.fg.selected', 'nav.tab.indicator', 'border.width.strong'],
  'm-badge': ['badge.radius', 'badge.height', 'badge.font.size', 'badge.neutral.bg', 'badge.neutral.fg', 'badge.neutral.border'],
  'm-tag': ['tag.bg', 'tag.border', 'radius.pill'],
  'm-alert': ['alert.radius'],
  'm-toast': ['toast.radius', 'elevation.overlay'],
  'm-progress': ['progress.track', 'progress.fill', 'progress.height'],
  'm-skeleton': ['skeleton.bg'],
  'm-seg': ['color.surface.sunken', 'radius.control'],
  'm-icon': ['icon.size.default', 'icon.stroke.width'],
  'm-spinner': ['motion.duration.spin', 'icon.size.default'],
  'report-page': ['report.page.bg', 'report.ink', 'report.page.margin', 'report.body.family', 'report.body.size'],
  'report-table': ['report.table.size', 'report.rule', 'report.rule.strong', 'report.rule.width'],
};
const TEXT_CLASS = /^t-(display|title1|title2|title3|headline|lead|body|subhead|label|footnote|caption|overline|code)$/;

/** Walk up from inner spans/svgs to the nearest element whose classes map to tokens (max 4 levels). */
function meaningful(el: HTMLElement): HTMLElement {
  let cur: HTMLElement | null = el;
  for (let i = 0; cur && i < 5; i++, cur = cur.parentElement) {
    if (Array.from(cur.classList).some((c) => CLASS_TOKENS[c] || TEXT_CLASS.test(c))) return cur;
  }
  return el;
}

const LAYER_ORDER: Record<Layer, number> = { component: 0, semantic: 1, foundation: 2 };

const norm = (s: string) => {
  const c = parseColor(s);
  return c ? formatColor(c) : s.trim().replace(/\s+/g, ' ');
};

interface Finding {
  property: string;
  value: string;
  tokens: string[];
}

function analyze(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const declared = new Set<string>();
  for (const cls of Array.from(el.classList)) {
    CLASS_TOKENS[cls]?.forEach((t) => declared.add(t));
    const m = TEXT_CLASS.exec(cls);
    if (m) ['family', 'size', 'weight', 'leading', 'tracking'].forEach((p) => declared.add(`text.${m[1]}.${p}`));
  }
  // Values of every token as resolved in this element's scope (custom properties inherit).
  const byValue = new Map<string, string[]>();
  for (const d of TOKENS) {
    const val = cs.getPropertyValue(cssVarName(d.id));
    if (!val) continue;
    const key = `${d.type === 'color' ? 'color' : d.type}:${norm(val)}`;
    if (!byValue.has(key)) byValue.set(key, []);
    byValue.get(key)!.push(d.id);
  }
  const rank = (ids: string[]) =>
    [...ids].sort((a, b) => {
      const da = declared.has(a) ? -1 : 0;
      const db = declared.has(b) ? -1 : 0;
      return da - db || LAYER_ORDER[TOKEN_MAP.get(a)!.layer] - LAYER_ORDER[TOKEN_MAP.get(b)!.layer];
    });
  const props: [string, string, string][] = [
    ['Text color', cs.color, 'color'],
    ['Background', cs.backgroundColor, 'color'],
    ['Border color', cs.borderTopColor, 'color'],
    ['Corner radius', cs.borderTopLeftRadius, 'dimension'],
    ['Font size', cs.fontSize, 'dimension'],
    ['Font weight', cs.fontWeight, 'fontWeight'],
    ['Height', cs.height, 'dimension'],
    ['Padding (left)', cs.paddingLeft, 'dimension'],
  ];
  const findings: Finding[] = [];
  for (const [label, value, type] of props) {
    if (!value || value === 'rgba(0, 0, 0, 0)' || value === '0px' || value === 'auto') continue;
    if (label === 'Border color' && cs.borderTopWidth === '0px') continue;
    let ids = byValue.get(`${type}:${norm(value)}`) ?? [];
    // Prefer tokens this element's classes actually consume; otherwise show semantic/component candidates.
    const declaredHits = ids.filter((i) => declared.has(i));
    ids = declaredHits.length ? declaredHits : ids.filter((i) => TOKEN_MAP.get(i)!.layer !== 'foundation').slice(0, 4);
    if (ids.length) findings.push({ property: label, value, tokens: rank(ids) });
  }
  const tag = el.tagName.toLowerCase() + (el.classList.length ? '.' + Array.from(el.classList).slice(0, 3).join('.') : '');
  return { tag, findings, declared: rank([...declared]) };
}

/** Inspect mode: hover to outline, click to see which tokens govern an element. */
export function Inspector() {
  const view = useView();
  const theme = useTheme();
  const [hover, setHover] = useState<DOMRect | null>(null);
  const [hoverTag, setHoverTag] = useState('');
  const [picked, setPicked] = useState<HTMLElement | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!view.inspect) {
      setHover(null);
      return;
    }
    document.body.classList.add('lab-inspecting');
    const ignore = (t: EventTarget | null) => !(t instanceof HTMLElement) || !!t.closest('.lab-inspector, .lab-topbar');
    const move = (e: MouseEvent) => {
      if (ignore(e.target)) return setHover(null);
      const el = meaningful(e.target as HTMLElement);
      setHover(el.getBoundingClientRect());
      setHoverTag(el.tagName.toLowerCase() + (el.classList[0] ? '.' + el.classList[0] : ''));
    };
    const click = (e: MouseEvent) => {
      if (ignore(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      setPicked(meaningful(e.target as HTMLElement));
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      actions.setView({ inspect: false });
      setPicked(null);
    };
    window.addEventListener('mousemove', move, true);
    window.addEventListener('click', click, true);
    window.addEventListener('keydown', key);
    return () => {
      document.body.classList.remove('lab-inspecting');
      window.removeEventListener('mousemove', move, true);
      window.removeEventListener('click', click, true);
      window.removeEventListener('keydown', key);
    };
  }, [view.inspect]);

  // Re-analyse after token edits (computed styles change).
  useEffect(() => {
    const t = window.setTimeout(() => setTick((x) => x + 1), 50);
    return () => window.clearTimeout(t);
  }, [theme, view]);

  const info = useMemo(() => (picked && picked.isConnected ? analyze(picked) : null), [picked, tick]);

  if (!view.inspect && !(picked && picked.isConnected)) return null;
  return (
    <>
      {view.inspect && hover && (
        <>
          <div className="lab-inspect-outline" style={{ left: hover.left, top: hover.top, width: hover.width, height: hover.height }} />
          <div className="lab-inspect-label" style={{ left: hover.left, top: Math.max(0, hover.top - 20) }}>
            {hoverTag}
          </div>
        </>
      )}
      {(picked || view.inspect) && (
        <aside className="lab-inspector" aria-label="Token inspector">
          <div className="m-toolbar" style={{ borderRadius: 'var(--radius-overlay) var(--radius-overlay) 0 0', background: 'transparent' }}>
            <Icon icon={Crosshair} />
            <div className="m-toolbar__title" style={{ flex: 1 }}>
              Token inspector
            </div>
            <IconButton
              icon={X}
              label="Close inspector"
              size="sm"
              onClick={() => {
                setPicked(null);
                actions.setView({ inspect: false });
              }}
            />
          </div>
          <div className="lab-inspector__body">
            {!info ? (
              <p className="c-secondary t-footnote">Click any element in the lab, a component, a chart, an app preview, a device frame, to see which design tokens control it. Press Esc to stop inspecting.</p>
            ) : (
              <>
                <div className="t-code c-secondary" style={{ wordBreak: 'break-all' }}>
                  {info.tag}
                </div>
                {info.findings.length === 0 && info.declared.length === 0 && <p className="t-footnote c-secondary">No token matches for this element. It may inherit from its parent. Try clicking the surrounding element.</p>}
                {info.findings.map((f) => (
                  <div key={f.property} className="stack stack--xs">
                    <div className="row row--between">
                      <span className="t-subhead">{f.property}</span>
                      <span className="t-code c-tertiary">{f.value}</span>
                    </div>
                    {f.tokens.slice(0, 3).map((t) => (
                      <InspectToken key={t} id={t} />
                    ))}
                  </div>
                ))}
                {info.declared.length > 0 && (
                  <div className="stack stack--xs">
                    <span className="t-subhead">All tokens this component consumes</span>
                    <div className="row row--wrap row--tight">
                      {info.declared.map((t) => (
                        <button key={t} type="button" className="token-chip t-code" onClick={() => openInEditor(t)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      )}
    </>
  );
}

function openInEditor(id: string) {
  actions.focusToken(id);
  navigate('editor');
}

function InspectToken({ id }: { id: string }) {
  const theme = useTheme();
  const view = useView();
  const chain = refChain(theme, id, { appearance: view.appearance, contrast: view.contrast });
  const def = TOKEN_MAP.get(id)!;
  return (
    <div className="m-card" style={{ padding: 'var(--space-component-default)' }}>
      <div className="row row--between">
        <span className="t-code" style={{ wordBreak: 'break-all' }}>
          {id}
        </span>
        <div className="row row--tight">
          <Badge>{def.layer}</Badge>
          <IconButton icon={ExternalLink} label="Open in Theme Editor" size="sm" onClick={() => openInEditor(id)} />
        </div>
      </div>
      {chain.length > 1 && <div className="t-caption c-tertiary" style={{ margin: '4px 0' }}>{chain.join(' → ')}</div>}
      <TokenField id={chain[chain.length - 1] === id ? id : id} />
    </div>
  );
}
