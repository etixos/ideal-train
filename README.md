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

## Decisions and the words we use

The **Decisions** page lists every design decision with a plain status: **Needs your decision**, **Approved**,
**Testing**, **Idea**, **Retired** (your Source Index's Conflict / Approved / Provisional / Exploratory / Superseded).
It started from `etixos/mercantile-design-system` (main, 5861d32) and the seven app repositories; every entry names its source.
A **Your apps** tab shows each app's brand, accent, where its styling lives, and how many stray colors it has.

Fixed vocabulary, also written into the exported documentation for every AI:

| Word | Meaning |
|---|---|
| **Adopt** | Make it the Mercantile rule. Updates the lab and records the decision with today's date. |
| **Apply** | Bring one app up to the current Mercantile rules. |
| **Publish** | Release an app's own work. Never used for design decisions. |

Edits in the lab are experiments until adopted; the page lists them under **Changes not adopted yet** with an
**Adopt these changes** button. Open questions have options and an **Adopt this option** button.
Decisions are saved in this browser for now (see "Next" below for shared storage).

## Modes: Lindemann and Diamond Stop

The lab has two brand modes that share the whole system. Each mode stores only its own overrides.

| | Lindemann | Diamond Stop |
|---|---|---|
| Display & headings (`font.family.serif`) | Georgia Pro | Baskerville |
| Interface text (`font.family.sans`) | IBM Plex Sans | Avenir Next |
| Monospace (`font.family.mono`, shared) | IBM Plex Mono on the web, SF Mono first on macOS/iOS/iPadOS | same |

- Switch modes from the top bar. Every page, preview, app, report and export follows.
- **Edits apply to** (top bar) chooses where an edit goes: *both modes* (shared) or *this mode only*.
  Tokens a mode overrides show a "‹Mode› only" tag; resetting one in mode scope falls back to the shared value.
- Theme Editor › Side-by-side compares the two modes and lists every difference.
- Exports are per mode (choose the mode on the Export page). The JSON export also embeds both modes for re-import.
- Fonts: IBM Plex Sans and IBM Plex Mono load from Google Fonts. Avenir Next, Baskerville, Georgia and SF Mono
  ship with macOS. **Georgia Pro must be installed** (it comes with Microsoft Office/Microsoft 365, or from Monotype);
  until then Georgia is shown. Typography shows whether each font is available on your device.

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
