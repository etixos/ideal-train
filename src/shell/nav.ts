import {
  Accessibility,
  AppWindow,
  BarChart3,
  Blocks,
  FileText,
  Home,
  MonitorSmartphone,
  Package,
  Palette,
  Ruler,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  Type,
  type LucideIcon,
} from 'lucide-react';

export interface NavEntry {
  path: string;
  label: string;
  icon: LucideIcon;
  group: 'Foundations' | 'Library' | 'Laboratories' | 'System';
}

export const NAV: NavEntry[] = [
  { path: 'overview', label: 'Overview', icon: Home, group: 'Foundations' },
  { path: 'colors', label: 'Colors', icon: Palette, group: 'Foundations' },
  { path: 'typography', label: 'Typography', icon: Type, group: 'Foundations' },
  { path: 'shapes', label: 'Shapes & Geometry', icon: Shapes, group: 'Foundations' },
  { path: 'spacing', label: 'Spacing & Layout', icon: Ruler, group: 'Foundations' },
  { path: 'icons-motion', label: 'Icons & Motion', icon: Sparkles, group: 'Foundations' },
  { path: 'components', label: 'Components', icon: Blocks, group: 'Library' },
  { path: 'charts', label: 'Charts & Visualization', icon: BarChart3, group: 'Laboratories' },
  { path: 'reports', label: 'Reports & Documents', icon: FileText, group: 'Laboratories' },
  { path: 'platforms', label: 'Platform Laboratory', icon: MonitorSmartphone, group: 'Laboratories' },
  { path: 'apps', label: 'Application Showcase', icon: AppWindow, group: 'Laboratories' },
  { path: 'accessibility', label: 'Accessibility', icon: Accessibility, group: 'System' },
  { path: 'editor', label: 'Theme Editor', icon: SlidersHorizontal, group: 'System' },
  { path: 'export', label: 'Documentation & Export', icon: Package, group: 'System' },
];
