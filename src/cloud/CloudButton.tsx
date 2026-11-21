import { Cloud, CloudOff, Copy, Eye, EyeOff, Loader2, Plug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Dialog, IconButton, Icon, TextInput, Tooltip } from '../ui';
import { MCP_URL, connectCloud, currentKey, disconnectCloud, startCloud, useCloud } from './sync';

function CopyRow({ label, value, secret }: { label: string; value: string; secret?: string }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const display = secret && !shown ? value.replace(secret, '•'.repeat(10)) : value;
  return (
    <div className="stack stack--xs">
      <span className="t-subhead">{label}</span>
      <div className="row">
        <code className="t-code spacer" style={{ padding: '6px 8px', background: 'var(--color-surface-sunken)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-sm)', wordBreak: 'break-all' }}>
          {display}
        </code>
        {secret && <IconButton icon={shown ? EyeOff : Eye} label={shown ? 'Hide key' : 'Show key'} size="sm" onClick={() => setShown((s) => !s)} />}
        <IconButton
          icon={Copy}
          label={copied ? 'Copied' : 'Copy'}
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* clipboard unavailable */
            }
          }}
        />
      </div>
    </div>
  );
}

export function CloudButton() {
  const c = useCloud();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => startCloud(), []);

  const icon = c.status === 'connecting' || c.status === 'saving' ? Loader2 : c.connected ? Cloud : CloudOff;
  const tone = c.status === 'error' || c.status === 'offline' ? 'c-danger' : c.connected ? 'c-success' : 'c-tertiary';
  const k = currentKey();

  return (
    <>
      <Tooltip content={c.message} placement="bottom">
        <IconButton icon={icon} label={`Cloud: ${c.message}`} className={tone} onClick={() => setOpen(true)} />
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} title="Shared lab (cloud)" wide>
        <div className="stack stack--md">
          <div className="row row--wrap">
            <Icon icon={icon} className={tone} />
            <span className="spacer">{c.message}</span>
            {c.connected && <Badge tone="success">Version {c.version}</Badge>}
          </div>
          {c.connected && c.updatedAt && (
            <p className="t-footnote c-secondary">
              Last saved {new Date(c.updatedAt).toLocaleString()} by {c.updatedBy ?? 'unknown'}.
            </p>
          )}

          {!c.connected ? (
            <>
              <p>
                Connect this browser to the shared lab so your Mac, your phone and your AIs all see the same colors and Decisions, with changes appearing live. Use the <b>lab key</b> you saved in Supabase (Edge Functions › Secrets › <span className="t-code">LAB_KEY</span>).
              </p>
              <form
                className="row row--wrap row--top"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  const r = await connectCloud(key);
                  setBusy(false);
                  setErr(r.ok ? null : r.message);
                  if (r.ok) setKey('');
                }}
              >
                <TextInput type="password" aria-label="Lab key" placeholder="Lab key" value={key} onChange={setKey} style={{ flex: '1 1 260px' }} autoComplete="current-password" />
                <Button type="submit" variant="primary" icon={Plug} loading={busy} disabled={!key.trim()}>
                  Connect
                </Button>
              </form>
              {err && <Alert tone="danger">{err}</Alert>}
              <p className="t-footnote c-secondary">The first browser to connect uploads its copy. Every browser after that loads the shared copy.</p>
            </>
          ) : (
            <>
              <div className="stack stack--md">
                <div className="t-headline">Connect your AIs</div>
                <p className="t-footnote c-secondary">
                  Once connected, Claude or ChatGPT can read the Decisions, look up tokens, make changes that show here as “not adopted”, and adopt them only after you say yes. Treat these addresses like a password: anyone with the key can change the lab.
                </p>
                <CopyRow label="Claude (claude.ai or the desktop app): Settings › Connectors › Add custom connector, URL:" value={`${MCP_URL}?key=${k}`} secret={k ?? undefined} />
                <CopyRow label="ChatGPT: Settings › Connectors (developer mode) › Create, URL:" value={`${MCP_URL}?key=${k}`} secret={k ?? undefined} />
                <CopyRow label="Claude Code or Codex in an app’s folder (Terminal):" value={`claude mcp add --transport http mercantile-lab ${MCP_URL} --header "x-lab-key: ${k}"`} secret={k ?? undefined} />
              </div>
              <div className="row">
                <div className="spacer" />
                <Button
                  variant="ghost"
                  onClick={() => {
                    disconnectCloud();
                  }}
                >
                  Disconnect this browser
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
