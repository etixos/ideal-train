import type { AppRecord, Decision } from './types';

/**
 * Starting register, compiled on 2026-11-21 from etixos/mercantile-design-system (main, 5861d32)
 * and the seven app repositories. Statuses follow those documents; nothing here was approved by the lab.
 */

/** Mailbox's established palette (web/theme.css), mapped onto lab roles. Secondary text uses MercantileKit's contrast fix. */
const ESTABLISHED: Record<string, { light: string; dark: string }> = {
  'color.bg.app': { light: '#E0DED4', dark: '#272623' },
  'color.bg.sunken': { light: '#D6D4C9', dark: '#22211F' },
  'color.surface.default': { light: '#F7F5ED', dark: '#3B3A36' },
  'color.surface.elevated': { light: '#FFFDF9', dark: '#41403B' },
  'color.surface.sunken': { light: '#EEECE3', dark: '#302F2B' },
  'color.surface.sidebar': { light: '#EEECE3', dark: '#302F2B' },
  'color.surface.hover': { light: '#EEECE3', dark: '#3F3E39' },
  'color.surface.pressed': { light: '#E2E0D6', dark: '#454440' },
  'color.surface.selected': { light: '#E2E0D6', dark: '#41413B' },
  'color.text.primary': { light: '#2E241A', dark: '#E8E2D8' },
  'color.text.secondary': { light: '#62625D', dark: '#B8B2A8' },
  'color.text.tertiary': { light: '#74736C', dark: '#B1ABA0' },
  'color.border.subtle': { light: '#D1CFC4', dark: '#4B4942' },
  'color.border.default': { light: '#C9C6BC', dark: '#55534C' },
  'color.border.strong': { light: '#B3B0A6', dark: '#57554D' },
  'input.bg': { light: '#FFFDF9', dark: '#41403B' },
  'color.status.success.fg': { light: '#496653', dark: '#94BCA3' },
  'color.status.success.solid': { light: '#496653', dark: '#94BCA3' },
  'color.status.warning.fg': { light: '#7E5E2B', dark: '#D6AF66' },
  'color.status.warning.solid': { light: '#9A7438', dark: '#D6AF66' },
};

const SHIFTS_DARK: Record<string, string> = {
  'color.bg.app': '#302F2D',
  'color.surface.default': '#42413E',
  'color.surface.sunken': '#393836',
  'color.surface.sidebar': '#393836',
  'color.surface.elevated': '#4B4946',
  'color.surface.hover': '#454440',
  'color.surface.selected': '#484743',
  'input.bg': '#4B4946',
  'color.text.primary': '#F0EFEA',
  'color.text.secondary': '#C8C5BF',
  'color.text.tertiary': '#A9A59F',
  'color.border.default': '#615F59',
  'color.border.strong': '#686760',
  'color.border.subtle': '#504F4B',
};
const MAILBOX_DARK: Record<string, string> = Object.fromEntries(Object.entries(ESTABLISHED).filter(([k]) => k in SHIFTS_DARK).map(([k, v]) => [k, v.dark]));

const darkOnly = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { dark: v }]));

export const SEED_DECISIONS: Decision[] = [
  /* ───────────── Needs your decision ───────────── */
  {
    id: 'D-001',
    title: 'Lab starting palette',
    summary: 'The lab was built on the provisional colors from the original brief (Ink #242A28, Ivory #F4F1E9…). Every app actually uses the established Warm Stone & Ivory palette (canvas #E0DED4, panel #F7F5ED, ink #2E241A). The lab should match what your apps use before anything is applied to them.',
    status: 'needs-decision',
    scope: ['Family', 'Lab'],
    source: 'Lab brief vs. Mailbox web/theme.css (reference implementation, Source Index §2d), Blueprint §4.1',
    tokens: Object.keys(ESTABLISHED),
    options: [
      { id: 'established', label: 'Use your apps’ palette', detail: 'Warm Stone & Ivory / Charcoal & Ivory as Mailbox defines it. Secondary text uses #62625D, the contrast fix already in MercantileKit (#70706B fails 4.5:1 on the canvas).', apply: ESTABLISHED, swatches: ['#E0DED4', '#F7F5ED', '#FFFDF9', '#2E241A', '#C9C6BC', '#272623', '#3B3A36'], recommended: true },
      { id: 'brief', label: 'Keep the brief’s palette', detail: 'Keep the lab’s current provisional colors. Your apps would then disagree with the lab until one side changes.', swatches: ['#F4F1E9', '#FFFFFF', '#242A28', '#D8D6CC', '#414B43'] },
    ],
  },
  {
    id: 'D-002',
    title: 'Dark mode surfaces',
    summary: 'Two dark palettes are in use. Mailbox, Reports and Count use a deeper charcoal (canvas #272623, panel #3B3A36). Shifts uses the older candidate values (canvas #302F2D, panel #42413E, brighter text #F0EFEA). The Source Index lists this as unresolved (Work Register M-008).',
    status: 'needs-decision',
    scope: ['Family', 'Dark mode'],
    source: 'Source Index §3 “Known unresolved example”; Work Register M-008; Mailbox theme.css; Shifts theme.css',
    tokens: Object.keys(SHIFTS_DARK),
    options: [
      { id: 'mailbox', label: 'Mailbox / Reports / Count', detail: 'Deeper charcoal, warmer and softer text (#E8E2D8). The most recent visually reviewed work (Mailbox refinement).', apply: darkOnly(MAILBOX_DARK), swatches: ['#272623', '#302F2B', '#3B3A36', '#41403B', '#E8E2D8', '#B8B2A8'], recommended: true },
      { id: 'shifts', label: 'Shifts / historical candidate', detail: 'Lighter charcoal and brighter text. Matches the earlier “Universal Dark Mode” candidate table.', apply: darkOnly(SHIFTS_DARK), swatches: ['#302F2D', '#393836', '#42413E', '#4B4946', '#F0EFEA', '#C8C5BF'] },
    ],
    note: 'Adopting applies only the dark side of these colors. Compare both in Theme Editor › Side-by-side before choosing.',
  },
  {
    id: 'D-003',
    title: 'Error / danger red',
    summary: 'Two reds mean "error". Shifts and MercantileKit use #9E3B33. Reports and Labelbook use brick #8B312C (also the brief’s Brick).',
    status: 'needs-decision',
    scope: ['Family', 'Status colors'],
    source: 'Blueprint §4.3 (conflict #9E3B33); Reports Style.warning; Labelbook Controls.destructive; MercantileKit MercantileColor.error',
    tokens: ['color.status.danger.fg', 'color.status.danger.solid'],
    options: [
      { id: 'conflict', label: '#9E3B33', detail: 'Recorded in the Blueprint as the "conflict" status color; used by Shifts and MercantileKit.', apply: { 'color.status.danger.fg': { light: '#9E3B33', dark: '#E59A90' }, 'color.status.danger.solid': { light: '#9E3B33', dark: '#D98F86' } }, swatches: ['#9E3B33', '#E59A90'] },
      { id: 'brick', label: '#8B312C brick', detail: 'Deeper, used by Reports and Labelbook; also the foundation Brick.', apply: { 'color.status.danger.fg': { light: '#8B312C', dark: '#DCA397' }, 'color.status.danger.solid': { light: '#8B312C', dark: '#D98A83' } }, swatches: ['#8B312C', '#DCA397'] },
    ],
  },
  {
    id: 'D-004',
    title: 'Reports typography',
    summary: 'Reports’ status notes record an open question: the original brief said Georgia Pro + IBM Plex Sans, but Reports uses Avenir Next + Baskerville. Reports is a Diamond Stop app, and Diamond Stop’s fonts are Baskerville + Avenir Next.',
    status: 'needs-decision',
    scope: ['Reports', 'Diamond Stop'],
    source: 'Reports DEVELOPMENT_STATUS.md:184; CODEX_HANDOFF.md:3; Labelbook Diamond Stop profile',
    options: [
      { id: 'diamond', label: 'Reports follows Diamond Stop', detail: 'Keep Avenir Next for text and Baskerville for titles. Closes the open question in Reports.', recommended: true },
      { id: 'lindemann', label: 'Reports switches to Lindemann fonts', detail: 'Georgia Pro + IBM Plex Sans. Requires changing Reports and its printed pages.' },
    ],
  },

  /* ───────────── Approved ───────────── */
  { id: 'A-001', title: 'Warm Stone & Ivory / Charcoal & Ivory', summary: 'Light mode is Warm Stone & Ivory; dark mode is Charcoal & Ivory, not an inversion. The neutral foundation belongs to the family; app identity is a restrained accent, never a colored canvas.', status: 'approved', scope: ['Family'], source: 'iPhone Blueprint §4 (approved direction)', date: '2026-10-25', note: 'The principle is approved; exact hex values are D-001 and D-002.' },
  { id: 'A-002', title: 'Lindemann typography', summary: 'Georgia Pro for titles and identity, IBM Plex Sans for interface text. A Lindemann brand decision, not a mandate for other brands.', status: 'approved', scope: ['Lindemann'], source: 'Source Index §2d; Blueprint §3', date: '2026-10-25', tokens: ['font.family.serif', 'font.family.sans'] },
  { id: 'A-003', title: 'Diamond Stop typography', summary: 'Baskerville for titles, Avenir Next for text. Owner retained Avenir Next for Diamond Stop’s application title in Labelbook.', status: 'approved', scope: ['Diamond Stop'], source: 'Work Register M-015; Blueprint commit 179e4db; Labelbook store profiles', date: '2026-11-13', tokens: ['font.family.serif', 'font.family.sans'] },
  { id: 'A-004', title: 'Labelbook accent: Plum Ink', summary: 'Plum Ink #665C6C (light) and #B1A1BA (dark). "Plum means print." Status colors outrank it.', status: 'approved', scope: ['Labelbook'], source: 'LABELBOOK_DESIGN_SPEC.md', date: '2026-11-11', note: 'Pressed #534B58 and wash #DDDBDF are Labelbook-local and not approved.' },
  { id: 'A-005', title: 'Numeric ticker motion', summary: 'Numbers roll up when increasing and down when decreasing, 160 ms; presets transition once; Reduce Motion removes the roll. Reference: Labelbook.', status: 'approved', scope: ['Family', 'Motion'], source: 'Source Index §2g; Blueprint §5.1', date: '2026-10-28', note: 'Approves the pattern for reuse, not an automatic rollout to other apps.' },
  { id: 'A-006', title: 'Control roles and casing', summary: 'Classify every control (primary, secondary, utility, navigation, status, consequential) before styling it. Status never looks like a button. Casing follows meaning, not emphasis.', status: 'approved', scope: ['Family'], source: 'Controls, Typography & Layout guideline', date: '2026-10-23', note: 'The framework is approved; exact sizes and colors are not.' },
  { id: 'A-007', title: 'Status outranks identity', summary: 'Warning, destructive and approved states always win over an app’s accent color. Neutral components look related across apps.', status: 'approved', scope: ['Family'], source: 'Blueprint §4.3', date: '2026-10-25' },
  { id: 'A-008', title: 'Share the thinking, adapt the execution', summary: 'Mac and mobile versions are one application. Same rules, terms and status meanings; native layouts per platform. Nothing crosses platforms without the owner’s decision.', status: 'approved', scope: ['Family', 'Platforms'], source: 'Source Index §2c', date: '2026-10-25' },
  { id: 'A-009', title: 'Mercantile Inset (optional pattern)', summary: 'A calm identity field above a differentiated content well, with purposeful gutters. Use it where it clarifies; omit it where a continuous surface works better.', status: 'approved', scope: ['Family'], source: 'Mercantile Inset guideline', date: '2026-10-23' },
  { id: 'A-010', title: 'Mailbox iPhone is the visual reference', summary: 'Shared iPhone components (masthead, type roles, surfaces, controls, icons) come from Mailbox for iPhone, extracted from its real code.', status: 'approved', scope: ['Family', 'iPhone'], source: 'Source Index §2d', date: '2026-10-25', note: 'Recommendation pending: once the lab holds the values, make the lab the reference and Mailbox the first app checked against it.' },
  { id: 'A-011', title: 'Labelbook stays light-only (for now)', summary: 'Owner kept Labelbook light-only during the typography repair; no dark tokens were changed.', status: 'approved', scope: ['Labelbook'], source: 'Blueprint §3 implementation note; Work Register M-015', date: '2026-11-13' },
  { id: 'A-012', title: 'Labelbook controls: Plex Sans everywhere, never Mono', summary: 'IBM Plex Sans for all control text, Georgia for titles only; keys at 5 pt radius; four action weights.', status: 'approved', scope: ['Labelbook'], source: 'ICONS_APPROVED.md “Controls and actions: final system”', date: '2026-11-13' },

  /* ───────────── Testing ───────────── */
  { id: 'T-001', title: 'Light palette values', summary: 'Canvas #E0DED4, panel #F7F5ED, editor #FFFDF9, secondary #EEECE3, heritage text #2E241A, card border #C9C6BC, strong rule #B3B0A6, internal rule #D1CFC4, quiet rule #DEDBD0.', status: 'testing', scope: ['Family'], source: 'Blueprint §4.1 “reference values requiring reconciliation”', note: 'Used identically by all seven apps. A strong candidate to adopt as-is.' },
  { id: 'T-002', title: 'App accents', summary: 'Mailbox ink green-gray #4F5550 / #A5AA9D; Shifts slate #566274 / #A7B2C1; Lottery aged brass #9A7438.', status: 'testing', scope: ['Mailbox', 'Shifts', 'Lotto'], source: 'Blueprint §4.3 (recorded references)' },
  { id: 'T-003', title: 'Count accent: olive', summary: 'Olive #64664F light; dark #829579 marked provisional. Copper #875D45 is Count-local.', status: 'testing', scope: ['Count'], source: 'Count DEVELOPMENT_STATUS.md' },
  { id: 'T-004', title: 'Reports accent: blue', summary: 'Blue #3A5068 / #A0B7C9, plus money-family inks (sales, fuel, payments…). Not recorded in the shared guidelines.', status: 'testing', scope: ['Reports'], source: 'Reports ReportsApp.swift Style; DailySheet.swift DSColor' },
  { id: 'T-005', title: 'Spacing rhythm', summary: 'Illustrative steps 4 / 8 / 12 / 16 / 24 / 32, with compact, comfortable and touch densities.', status: 'testing', scope: ['Family'], source: 'Controls guideline §4 (illustrative, not approved)' },
  { id: 'T-006', title: 'Shifts dark values', summary: 'Shifts’ dark palette is explicitly provisional and Shifts-only.', status: 'testing', scope: ['Shifts'], source: 'Shifts AGENTS.md', note: 'Resolved by D-002 when you adopt a dark palette.' },
  { id: 'T-007', title: 'Lindemann and Diamond Stop modes in the lab', summary: 'The lab’s two modes share everything except fonts. Monospace is IBM Plex Mono on the web and SF Mono first on Apple platforms.', status: 'testing', scope: ['Lab', 'Lindemann', 'Diamond Stop'], source: 'This lab, 2026-11-21' },

  /* ───────────── Ideas ───────────── */
  { id: 'I-001', title: 'Mailbox icon refinements', summary: 'Two envelopes for All Accounts, a simpler Person, a carton without the lid line for Vendors.', status: 'idea', scope: ['Mailbox', 'Icons'], source: 'Mailbox docs/mercantile-refinement-20261023/icon-audit.md (pending visual approval)' },
  { id: 'I-002', title: 'Labelbook category cards', summary: 'Approved as a design, but “design only until Alex says build.”', status: 'idea', scope: ['Labelbook'], source: 'ICONS_APPROVED.md' },

  /* ───────────── Retired ───────────── */
  { id: 'R-001', title: '“Universal Dark Mode Implementation” mapping', summary: 'An old instruction that declared one exact dark palette required. Historical; do not reapply it blindly.', status: 'retired', scope: ['Family', 'Dark mode'], source: 'Source Index §2 source map', note: 'Its values live on as the “Shifts / historical” option in D-002.' },
  { id: 'R-002', title: 'Plex Mono in Labelbook controls', summary: 'Earlier spec used IBM Plex Mono in places; replaced by “Plex Sans everywhere, never Mono.”', status: 'retired', scope: ['Labelbook'], source: 'ICONS_APPROVED.md (Nov 13) supersedes LABELBOOK_DESIGN_SPEC.md' },
];

export const APPS_REGISTER: AppRecord[] = [
  { id: 'mailbox', name: 'Mailbox', repo: 'etixos/Mailbox', platform: 'Mac (web UI in an AppKit shell)', brand: 'Lindemann', accent: { light: '#4F5550', dark: '#A5AA9D', status: 'Testing' }, stylingLivesIn: 'web/theme.css (the original palette)', hardcoded: 25, sharedTokens: 'No: owns the original', notes: 'The reference implementation. Guideline pointer still says iCloud.' },
  { id: 'mailbox-iphone', name: 'Mailbox iPhone', repo: 'etixos/Mailbox-iPhone', platform: 'iPhone (web UI in UIKit)', brand: 'Lindemann', accent: { light: '#4F5550', dark: '#A5AA9D', status: 'Testing' }, stylingLivesIn: 'MailboxPhone/web/theme.css (copy of Mac)', hardcoded: 40, sharedTokens: 'No: copy', notes: 'Visual reference for iPhone. Fonts not bundled.' },
  { id: 'labelbook', name: 'Labelbook', repo: 'etixos/Labelbook-iPhone', platform: 'iPhone (SwiftUI)', brand: 'Lindemann + Diamond Stop', accent: { light: '#665C6C', dark: '#B1A1BA', status: 'Approved' }, stylingLivesIn: 'LabelbookPhone/Theme.swift (hand-port, drifted)', hardcoded: 65, sharedTokens: 'No: copy', notes: 'Serves both brands in one app. Fonts bundled. Light-only.' },
  { id: 'reports', name: 'Reports', repo: 'etixos/Reports', platform: 'Mac (SwiftUI)', brand: 'Diamond Stop', accent: { light: '#3A5068', dark: '#A0B7C9', status: 'Testing' }, stylingLivesIn: 'ReportsApp.swift Style, FuelStyle, DSColor', hardcoded: 21, sharedTokens: 'No', notes: 'Printed DSR and statements. Open typography question (D-004).' },
  { id: 'count', name: 'Count', repo: 'etixos/Count', platform: 'iPhone + Mac (SwiftUI)', brand: 'Lindemann', accent: { light: '#64664F', dark: '#829579', status: 'Testing' }, stylingLivesIn: 'App/CountApp.swift CountStyle', hardcoded: 4, sharedTokens: 'No', notes: 'Already points to the GitHub guidelines.' },
  { id: 'shifts', name: 'Shifts', repo: 'etixos/Shifts', platform: 'Mac (web UI in an AppKit shell)', brand: 'Lindemann', accent: { light: '#566274', dark: '#A7B2C1', status: 'Testing' }, stylingLivesIn: 'web/theme.css (theme-only rule)', hardcoded: 6, sharedTokens: 'No: copy', notes: 'Uses the other dark palette (D-002). ~125 hex-named tone variables.' },
  { id: 'shifts-iphone', name: 'Shifts iPhone', repo: 'etixos/Shifts-iPhone', platform: 'iPhone (SwiftUI)', brand: 'Lindemann (+ Diamond Stop store)', accent: { light: '#566274', dark: '#A7B2C1', status: 'Testing' }, stylingLivesIn: 'ShiftsPhone/Theme.swift', hardcoded: 1, sharedTokens: 'No: copy', notes: 'Easiest first app to apply Mercantile to.' },
];
