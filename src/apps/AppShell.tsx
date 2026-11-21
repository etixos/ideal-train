import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar, NavHeading, NavItem, Sidebar, Toolbar } from '../ui';

export interface AppNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  meta?: ReactNode;
}

/** Standard desktop app frame shared by all six showcase applications. */
export function AppShell({ name, nav, current, onNav, toolbar, children, inspector, footerNav }: { name: string; nav: (AppNavItem | string)[]; current: string; onNav: (id: string) => void; toolbar?: ReactNode; children: ReactNode; inspector?: ReactNode; footerNav?: ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar label={name}>
        <div className="row" style={{ padding: '6px 8px 10px' }}>
          <span style={{ width: 22, height: 22, borderRadius: 'var(--radius-sm)', background: 'var(--color-accent-default)', flex: 'none' }} aria-hidden />
          <span className="t-headline truncate" style={{ fontFamily: 'var(--font-family-serif)' }}>
            {name}
          </span>
        </div>
        {nav.map((n, i) => (typeof n === 'string' ? <NavHeading key={i}>{n}</NavHeading> : <NavItem key={n.id} icon={n.icon} label={n.label} meta={n.meta} selected={current === n.id} onClick={() => onNav(n.id)} />))}
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          {footerNav}
          <div className="row" style={{ padding: 8 }}>
            <Avatar name="Dana Whitlock" size="sm" />
            <div style={{ minWidth: 0 }}>
              <div className="t-subhead truncate">Dana Whitlock</div>
              <div className="t-caption c-tertiary">Main Street</div>
            </div>
          </div>
        </div>
      </Sidebar>
      <div className="app-main">
        {toolbar && <Toolbar>{toolbar}</Toolbar>}
        <div className="app-content">{children}</div>
      </div>
      {inspector && <aside className="app-inspector">{inspector}</aside>}
    </div>
  );
}
