import { actions, useTheme, useView } from '../state/store';
import { useResolvedTokens } from '../theme/ThemeScope';
import { contrastRatio, parseColor, toHex, wcagLevel } from '../tokens/color';
import { TOKEN_MAP } from '../tokens/registry';
import { isPureRef, rawValue } from '../tokens/resolve';
import { isModal } from '../tokens/types';
import { Badge } from '../ui';
import { editToken } from './TokenField';

/** Large editable swatch for a single-value color token. Shows contrast against ink and ivory. */
export function ColorSwatch({ id, name }: { id: string; name?: string }) {
  const t = useResolvedTokens();
  const theme = useTheme();
  const view = useView();
  const value = t[id];
  const raw = rawValue(theme, id, { mode: view.mode });
  const editable = raw !== undefined && !isModal(raw) && !isPureRef(raw);
  const onInk = contrastRatio(value, t['palette.ink']) ?? 0;
  const onIvory = contrastRatio(value, t['palette.ivory']) ?? 0;
  const c = parseColor(value);
  return (
    <div className="swatch">
      <div className="swatch__chip" style={{ background: value }}>
        {editable && <input type="color" aria-label={`Edit ${id}`} value={c ? toHex(c) : '#000000'} onChange={(e) => actions.setToken(id, e.target.value.toUpperCase())} />}
      </div>
      <div className="swatch__meta">
        <div className="row row--between">
          <span className="t-subhead" style={{ textTransform: 'capitalize' }}>
            {name ?? id.split('.').pop()}
          </span>
          {theme.values[id] !== undefined && <span className="token-row__dot" title="Modified" />}
        </div>
        <span className="t-code c-secondary">{value}</span>
        <span className="t-code c-tertiary" style={{ fontSize: 10 }}>
          {id}
        </span>
        <div className="row row--tight" style={{ marginTop: 4 }}>
          <Badge tone={wcagLevel(onIvory) === 'Fail' ? 'neutral' : 'success'}>
            on Ivory {onIvory.toFixed(1)}
          </Badge>
          <Badge tone={wcagLevel(onInk) === 'Fail' ? 'neutral' : 'success'}>
            on Ink {onInk.toFixed(1)}
          </Badge>
        </div>
        {TOKEN_MAP.get(id)?.description && <span className="t-caption c-tertiary">{TOKEN_MAP.get(id)!.description}</span>}
      </div>
    </div>
  );
}

/** Horizontal ramp of tokens. */
export function Ramp({ ids }: { ids: string[] }) {
  const t = useResolvedTokens();
  return (
    <div className="ramp">
      {ids.map((id) => {
        const v = t[id];
        const ink = (contrastRatio('#FFFFFF', v) ?? 0) > (contrastRatio('#242A28', v) ?? 0) ? '#FFFFFF' : '#242A28';
        return (
          <button key={id} type="button" className="ramp__step" style={{ background: v, color: ink, border: 0, cursor: 'pointer', textAlign: 'left' }} title={`${id} ${v} — click to edit`} onClick={() => editToken(id)}>
            <span>{id.split('.').pop()}</span>
            <span>{v}</span>
          </button>
        );
      })}
    </div>
  );
}
