/**
 * The Mercantile design register: every design decision with a plain status.
 *
 * Vocabulary (shared with every AI that reads the exports):
 *   Adopt   = make it the Mercantile rule. Updates the lab and records the decision.
 *   Apply   = bring one app up to the current Mercantile rules.
 *   Publish = release an app's own work (not used for design decisions).
 */

/** Plain-language statuses. Source Index equivalents in STATUS_META. */
export type DecisionStatus = 'needs-decision' | 'testing' | 'approved' | 'idea' | 'retired';

/** A token change: a full value, or just the light / dark side of a color. */
export type ValuePatch = Record<string, string | { light?: string; dark?: string }>;

export interface DecisionOption {
  id: string;
  label: string;
  detail: string;
  /** Token values written into the lab (shared, both modes) when this option is adopted. */
  apply?: ValuePatch;
  /** Swatches shown beside the option. */
  swatches?: string[];
  recommended?: boolean;
}

export interface Decision {
  id: string;
  title: string;
  /** Plain-English summary of the decision or question. */
  summary: string;
  status: DecisionStatus;
  /** Who it covers: Family, Lindemann, Diamond Stop, an app, a platform. */
  scope: string[];
  /** Where this came from (document section, file, commit). */
  source: string;
  /** Approval or last-change date, YYYY-MM-DD. Blank until adopted. */
  date?: string;
  /** Tokens this decision governs. */
  tokens?: string[];
  /** Choices for a decision that needs the owner. */
  options?: DecisionOption[];
  /** Which option was adopted. */
  chosen?: string;
  /** Who adopted it (always the owner; recorded for the history). */
  adoptedBy?: string;
  /** Short note: why, caveats, what is still open. */
  note?: string;
  /** Changes recorded from the lab's editor when adopted from "Changes not adopted yet". */
  changes?: { id: string; from: unknown; to: unknown }[];
}

export const STATUS_META: Record<DecisionStatus, { label: string; tone: 'danger' | 'warning' | 'success' | 'info' | 'neutral'; sourceIndex: string; help: string }> = {
  'needs-decision': { label: 'Needs your decision', tone: 'danger', sourceIndex: 'Conflict / awaiting approval', help: 'Apps disagree or something is waiting on you. Choose an option and Adopt it.' },
  testing: { label: 'Testing', tone: 'warning', sourceIndex: 'Provisional', help: 'In use somewhere, not final. Shared provisional values are still better than local copies.' },
  approved: { label: 'Approved', tone: 'success', sourceIndex: 'Approved', help: 'The Mercantile rule, within the scope shown.' },
  idea: { label: 'Idea', tone: 'info', sourceIndex: 'Exploratory', help: 'Not in use. No app should implement it yet.' },
  retired: { label: 'Retired', tone: 'neutral', sourceIndex: 'Superseded / historical', help: 'Replaced or historical. Kept so nobody restores it by accident.' },
};

export interface AppRecord {
  id: string;
  name: string;
  repo: string;
  platform: string;
  brand: string;
  accent: { light: string; dark: string; status: string };
  stylingLivesIn: string;
  hardcoded: number;
  sharedTokens: string;
  notes: string;
}
