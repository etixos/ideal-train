import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../ui';
import { TokenChip } from './TokenField';

/** Standard page frame for every lab section. */
export function Page({ eyebrow, title, description, actions, children, wide }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cx('lab-page', wide && 'lab-page--wide')}>
      <header className="lab-page__header">
        <div style={{ minWidth: 0, flex: 1 }}>
          {eyebrow && <div className="t-overline c-highlight">{eyebrow}</div>}
          <h1 className="t-title1">{title}</h1>
          {description && <p className="t-lead c-secondary lab-page__desc">{description}</p>}
        </div>
        {actions && <div className="row row--wrap">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

/** A titled block within a page. */
export function Section({ title, description, actions, children, id }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="lab-section" id={id}>
      <div className="lab-section__header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="t-title2">{title}</h2>
          {description && <p className="c-secondary lab-section__desc">{description}</p>}
        </div>
        {actions && <div className="row row--wrap">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

/**
 * A framed specimen. `tokens` lists the token ids that govern the specimen —
 * shown as chips that jump to the token in the editor.
 */
export function Demo({ title, description, tokens, children, padded = true, center, style, className, actions }: { title?: ReactNode; description?: ReactNode; tokens?: string[]; children: ReactNode; padded?: boolean; center?: boolean; style?: CSSProperties; className?: string; actions?: ReactNode }) {
  return (
    <figure className={cx('lab-demo', className)}>
      {(title || actions) && (
        <figcaption className="lab-demo__caption">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-subhead">{title}</div>
            {description && <div className="t-footnote c-secondary">{description}</div>}
          </div>
          {actions}
        </figcaption>
      )}
      <div className={cx('lab-demo__stage', padded && 'lab-demo__stage--pad', center && 'lab-demo__stage--center')} style={style}>
        {children}
      </div>
      {tokens && tokens.length > 0 && (
        <div className="lab-demo__tokens">
          {tokens.map((t) => (
            <TokenChip key={t} id={t} />
          ))}
        </div>
      )}
    </figure>
  );
}

/** Two-column layout: specimens on the left, a sticky token editor on the right. */
export function Workbench({ children, editor, editorTitle = 'Tokens' }: { children: ReactNode; editor: ReactNode; editorTitle?: string }) {
  return (
    <div className="lab-workbench">
      <div className="lab-workbench__main">{children}</div>
      <aside className="lab-workbench__editor" aria-label={editorTitle}>
        <div className="t-overline c-secondary lab-workbench__title">{editorTitle}</div>
        {editor}
      </aside>
    </div>
  );
}

/** Honest marker for anything that is not fully functional. */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div className="lab-placeholder" role="note">
      <span className="t-overline">Placeholder</span>
      <span>{children}</span>
    </div>
  );
}

/** Label used wherever a native interface is being imitated in the browser. */
export function SimulationNote({ children }: { children?: ReactNode }) {
  return (
    <div className="lab-simnote" role="note">
      {children ?? 'Browser simulation of a native interface — not an actual SwiftUI component.'}
    </div>
  );
}
