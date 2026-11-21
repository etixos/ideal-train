import { Archive, Edit3, File, Flag, Folder, Forward, Inbox, Paperclip, Reply, Send, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MESSAGES, type Message } from '../data/mail';
import { Avatar, Badge, Button, EmptyState, Icon, IconButton, SearchField, Sheet, TextArea, TextInput, Tooltip, cx, useToast } from '../ui';
import { AppShell } from './AppShell';

export function EmailApp() {
  const toast = useToast();
  const [folder, setFolder] = useState<Message['folder']>('inbox');
  const [msgs, setMsgs] = useState(MESSAGES);
  const [sel, setSel] = useState('m1');
  const [q, setQ] = useState('');
  const [compose, setCompose] = useState(false);
  const list = msgs.filter((m) => m.folder === folder && (!q || `${m.from} ${m.subject} ${m.preview}`.toLowerCase().includes(q.toLowerCase())));
  const m = msgs.find((x) => x.id === sel && x.folder === folder) ?? list[0];
  const unread = msgs.filter((x) => x.folder === 'inbox' && x.unread).length;
  const open = (id: string) => {
    setSel(id);
    setMsgs((ms) => ms.map((x) => (x.id === id ? { ...x, unread: false } : x)));
  };
  const move = (to: Message['folder']) => {
    if (!m) return;
    setMsgs((ms) => ms.map((x) => (x.id === m.id ? { ...x, folder: to } : x)));
    toast({ title: to === 'archive' ? 'Archived' : 'Moved', text: m.subject });
  };
  return (
    <AppShell
      name="Post"
      current={folder}
      onNav={(f) => setFolder(f as Message['folder'])}
      nav={[
        { id: 'inbox', label: 'Inbox', icon: Inbox, meta: unread || undefined },
        { id: 'drafts', label: 'Drafts', icon: File, meta: msgs.filter((x) => x.folder === 'drafts').length },
        { id: 'sent', label: 'Sent', icon: Send },
        { id: 'archive', label: 'Archive', icon: Archive },
        'Labels',
        { id: 'l-vendors', label: 'Vendors', icon: Folder },
        { id: 'l-stores', label: 'Stores', icon: Folder },
        { id: 'l-finance', label: 'Finance', icon: Folder },
      ]}
      footerNav={
        <div style={{ padding: '0 4px 8px' }}>
          <Button variant="primary" block icon={Edit3} onClick={() => setCompose(true)}>
            Compose
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', margin: 'calc(-1 * var(--space-inset-lg))', flex: 1, minHeight: 0 }}>
        <div style={{ width: 320, flex: 'none', borderRight: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-default)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 10, borderBottom: '1px solid var(--color-border-subtle)' }}>
            <SearchField size="sm" value={q} onChange={setQ} placeholder="Search mail" />
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {list.length === 0 && <EmptyState icon={Inbox} title="No messages" />}
            {list.map((x) => (
              <button key={x.id} type="button" onClick={() => open(x.id)} className={cx('mail-item', m?.id === x.id && 'is-selected', x.unread && 'is-unread')}>
                <span className="mail-item__dot" aria-label={x.unread ? 'Unread' : undefined} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row row--between">
                    <span className="mail-item__from truncate">{x.from}</span>
                    <span className="t-caption c-tertiary">{x.time}</span>
                  </div>
                  <div className="truncate t-subhead">{x.subject}</div>
                  <div className="truncate t-footnote c-secondary">{x.preview}</div>
                  <div className="row row--tight" style={{ marginTop: 2 }}>
                    {x.flagged && <Icon icon={Flag} size="sm" className="c-danger" label="Flagged" />}
                    {x.attachment && <Icon icon={Paperclip} size="sm" className="c-tertiary" label="Has attachment" />}
                    {x.label && <Badge>{x.label}</Badge>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-default)' }}>
          {m ? (
            <>
              <div className="m-toolbar">
                <Tooltip content="Reply" placement="bottom"><IconButton icon={Reply} label="Reply" onClick={() => setCompose(true)} /></Tooltip>
                <IconButton icon={Forward} label="Forward" />
                <IconButton icon={Archive} label="Archive" onClick={() => move('archive')} />
                <IconButton icon={Trash2} label="Delete" onClick={() => move('archive')} />
                <div className="spacer" />
                <IconButton icon={m.flagged ? Flag : Star} label={m.flagged ? 'Unflag' : 'Flag'} selected={m.flagged} onClick={() => setMsgs((ms) => ms.map((x) => (x.id === m.id ? { ...x, flagged: !x.flagged } : x)))} />
              </div>
              <div style={{ padding: 'var(--space-inset-xl)', overflow: 'auto' }} className="stack stack--md">
                <h2 className="t-title3">{m.subject}</h2>
                <div className="row">
                  <Avatar name={m.from} />
                  <div className="spacer">
                    <div className="t-subhead">{m.from}</div>
                    <div className="t-footnote c-secondary">
                      {m.fromEmail} · to Dana Whitlock
                    </div>
                  </div>
                  <span className="t-footnote c-tertiary">{m.time}</span>
                </div>
                <div className="stack t-body" style={{ maxWidth: '64ch', whiteSpace: 'pre-line' }}>
                  {m.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {m.attachment && (
                  <div className="m-card m-card--pad row" style={{ maxWidth: 320 }}>
                    <Icon icon={Paperclip} />
                    <span className="spacer truncate">{m.attachment}</span>
                    <Button size="sm">Open</Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <EmptyState icon={Inbox} title="No message selected" />
          )}
        </div>
      </div>
      <Sheet
        open={compose}
        contained
        onClose={() => setCompose(false)}
        title="New message"
        footer={
          <>
            <Button onClick={() => setCompose(false)}>Discard</Button>
            <Button variant="primary" icon={Send} onClick={() => { setCompose(false); toast({ tone: 'success', title: 'Message sent' }); }}>
              Send
            </Button>
          </>
        }
      >
        <div className="stack stack--md">
          <TextInput label="To" defaultValue={m && folder === 'inbox' ? m.fromEmail : ''} />
          <TextInput label="Subject" defaultValue={m && folder === 'inbox' ? `Re: ${m.subject}` : ''} />
          <TextArea label="Message" rows={8} placeholder="Write your message…" />
        </div>
      </Sheet>
    </AppShell>
  );
}
