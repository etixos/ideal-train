# Mercantile Design Lab

The central design authority for every Mercantile application: web, macOS, iPhone and iPad.
A browser-based studio for setting, testing, comparing, documenting and exporting the visual
standards those applications share. No Xcode or native compilation is needed.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds static files into dist/
```

Your work is saved in the browser's local storage, so it survives a refresh. Use **Documentation & Export**
to download configurations and token files.

## Sections

| # | Section | What it does |
|---|---|---|
| 1 | Overview | System summary, layer counts, build status (complete vs. placeholder) |
| 2 | Colors | Foundation palette, hue scales, semantic roles (light/dark), status, states, chart palettes, overlays |
| 3 | Typography | Families, type scale per platform, weights, leading, tracking, tabular numerals, Dynamic Type |
| 4 | Shapes & Geometry | Radius scale and roles, borders, focus outlines, elevation, control geometry |
| 5 | Spacing & Layout | Spacing scale, component padding, density, 12-column grid, responsive breakpoints |
| 6 | Icons & Motion | Icon family, sizes, stroke weights, durations, easing curves, loading indicators, reduced motion |
| 7 | Components | Buttons, inputs, navigation, containers, feedback, data tables, calendars/timelines/split views, with every state |
| 8 | Charts & Visualization | 17 chart types; palettes, axes, gridlines, labels, legends, tooltips, references, thresholds, density; light/dark/HC/print |
| 9 | Reports & Documents | Eight report templates with shared print standards; print / Save as PDF |
| 10 | Platform Laboratory | One workflow simulated on web, macOS, iOS and iPadOS; compare side by side; platform overrides |
| 11 | Application Showcase | Inventory, Email, Scheduling, Finance, Admin, Analytics, with per-app accent overrides |
| 12 | Accessibility | WCAG AA contrast audit in four modes, color-vision simulation, focus, text scaling, touch targets |
| 13 | Theme Editor | Every token: search, edit, link, usage inspection, undo/redo, presets, side-by-side comparison |
| 14 | Documentation & Export | JSON tokens, CSS variables, SwiftUI, Markdown docs; saved configurations; import |

The **inspect** button (crosshair, top bar) lets you click any element and see which tokens control it.

## Architecture

```
src/
  tokens/      Design-system logic, with no UI and no sample data
    types.ts       Token model (layers, modal light/dark/high-contrast values, themes)
    registry.ts    Built-in token definitions, platform defaults, app accent overrides
    resolve.ts     Reference resolution, density/text scaling, dependency graph
    color.ts       Contrast (WCAG), color mixing, color-vision simulation
    presets.ts     Preset themes (overrides on the registry)
    export.ts      JSON / CSS / SwiftUI / Markdown generators
  state/store.ts   Working theme, undo/redo history, saved configurations, persistence
  theme/           ThemeScope: resolves tokens into CSS custom properties for a subtree
  ui/              Component kit; every style comes from component/semantic tokens
  charts/          Token-driven chart kit (Recharts + custom SVG)
  data/            Sample data (retail, inventory, staff, mail, admin), kept apart from the system
  platforms/       Browser simulations of web, macOS, iOS and iPadOS conventions
  apps/            Six showcase applications
  lab/             Lab-only building blocks (token editors, page frames, preview board)
  sections/        The 14 pages
  styles/          base.css, ui.css (components), lab.css, platforms.css
```

### Token model

- **Foundation** tokens are primitives (`palette.charcoal`, `space.4`, `font.size.md`).
- **Semantic** tokens are roles (`color.text.primary`, `space.component.default`, `radius.control`).
  Color roles carry `light`, `dark`, and optional high-contrast values.
- **Component** tokens map components to roles (`button.primary.bg → {color.accent.default}`).

A theme stores only overrides against the registry, plus optional per-platform and per-app overrides.
`ThemeScope` resolves the token graph for a given appearance, contrast, platform, app, density and
text scale, and applies the result as CSS custom properties. Side-by-side comparisons, device
previews and app previews each render inside their own scope.

## What is simulated

macOS, iOS and iPadOS screens are **browser simulations** of native conventions, not SwiftUI.
The SwiftUI export (`MercantileTokens.swift`) carries the same decisions into native code.
PDF export uses the browser's print dialog ("Save as PDF").
