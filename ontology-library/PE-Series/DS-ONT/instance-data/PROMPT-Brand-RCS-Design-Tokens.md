# Brand RCS — Complete Design Token Prompt Reference

> **Purpose**: Feed this file as context to any AI design agent (Pencil, Figma MCP, code generation) to ensure all outputs conform to the RCS brand identity. Every colour, spacing, radius, and typographic decision should resolve to a token defined below.
>
> **Source**: DS-ONT v3.0.0 / `rcs-ds-instance-v1.0.0.jsonld`
> **PFI Instance**: PFI-RCS (Regulatory Compliance & Security)
> **Figma Source**: `JowntVHgYzfuZmaLHNRVTZ` (RCS-Design-System-v1)
> **Last Updated**: 2026-03-04

---

## 1. Brand Identity

| Property | Value |
|---|---|
| Brand ID | `rcs` |
| Full Name | Regulatory Compliance & Security |
| Industry | RegTech |
| Markets | UK, EU, US |
| Primary Colour | Purple `#8314ab` |
| Secondary Colour | PurplePink `#c574d3` |
| Accent Colour | Deep Blue `#09134f` |
| Font Family | **Jura** (Bold headings, Regular body) |
| Theme Modes | Light only |
| Audience | CISOs, Compliance Officers, IT Directors |

---

## 2. Colour Primitives (8 Scales x 11 Shades)

### 2.1 Purple (Primary)
| Shade | Hex | Usage |
|---|---|---|
| 50 | `#f3e2fd` | Subtle backgrounds, hover tints |
| 100 | `#e9cafb` | Light borders |
| 200 | `#d696f7` | Decorative accents |
| 300 | `#c75ef3` | Lighter surfaces, active states |
| 400 | `#b220e3` | Medium emphasis |
| **500** | **`#8314ab`** | **Primary default — buttons, links, focus rings** |
| 600 | `#641280` | Darker interactive |
| 700 | `#4d0e62` | Hover states, dark surfaces |
| 800 | `#380a47` | Text labels on light bg |
| 900 | `#25062f` | High-contrast text |
| 950 | `#18041e` | Near-black |

### 2.2 PurplePink (Secondary)
| Shade | Hex | Usage |
|---|---|---|
| 50 | `#f9eff9` | Subtle secondary bg |
| 100 | `#f1dff4` | Light secondary border |
| 200 | `#e5c1e9` | Decorative |
| 300 | `#dba6df` | Lighter surfaces |
| 400 | `#cf87d4` | Medium emphasis |
| **500** | **`#c574d3`** | **Secondary default** |
| 600 | `#a04ba6` | Darker secondary |
| 700 | `#74377a` | Dark secondary surfaces |
| 800 | `#4b244f` | Secondary text labels |
| 900 | `#2c142e` | High-contrast |
| 950 | `#1e0e1f` | Near-black |

### 2.3 DBlue (Accent)
| Shade | Hex | Usage |
|---|---|---|
| 50 | `#dde0fb` | Subtle accent bg |
| 100 | `#bdc1f6` | Light accent border |
| 200 | `#7c88ec` | Decorative |
| 300 | `#3b53e0` | Lighter accent surfaces |
| 400 | `#132e9b` | Medium accent |
| **500** | **`#09134f`** | **Accent default — sidebar, table headers** |
| 600 | `#07123d` | Darker accent |
| 700 | `#061035` | Dark accent hover |
| 800 | `#060d2b` | Accent text labels |
| 900 | `#04081e` | Near-black |
| 950 | `#030615` | Deepest shade |

### 2.4 Green (Success)
| Shade | Hex | Usage |
|---|---|---|
| 50 | `#d6fee4` | Success subtle bg |
| 100 | `#a7fec8` | Success light border |
| 200 | `#14fd92` | Decorative |
| 300 | `#00e881` | Lighter success |
| 400 | `#00d275` | Medium success |
| **500** | **`#33c872`** | **Success default** |
| 600 | `#009151` | Darker success |
| 700 | `#00693b` | Dark success |
| 800 | `#004527` | Success text label |
| 900 | `#002515` | High-contrast |
| 950 | `#00190e` | Near-black |

### 2.5 Yellow (Warning)
| Shade | Hex | Usage |
|---|---|---|
| 50 | `#fff5da` | Warning subtle bg |
| 100 | `#ffebaf` | Warning light border |
| 200 | `#ffdb4c` | Decorative |
| 300 | `#eac846` | Lighter warning |
| 400 | `#d8b940` | Medium warning |
| **500** | **`#c8b133`** | **Warning default** |
| 600 | `#96802c` | Darker warning |
| 700 | `#6a5b1f` | Dark warning |
| 800 | `#463c14` | Warning text label |
| 900 | `#26210b` | High-contrast |
| 950 | `#191507` | Near-black |

### 2.6 Red (Error)
| Shade | Hex | Usage |
|---|---|---|
| 50 | `#ffe6e9` | Error subtle bg |
| 100 | `#ffc9d0` | Error light border |
| 200 | `#ff95a6` | Decorative |
| 300 | `#ff5779` | Lighter error |
| 400 | `#eb1e56` | Medium error |
| **500** | **`#ab1545`** | **Error default** |
| 600 | `#871231` | Darker error |
| 700 | `#660d25` | Dark error surfaces |
| 800 | `#4a0a1b` | Error text label |
| 900 | `#2f0611` | High-contrast |
| 950 | `#23040d` | Near-black |

### 2.7 BrightBlue (Information)
| Shade | Hex | Usage |
|---|---|---|
| 50 | `#eaeefc` | Info subtle bg |
| 100 | `#d8e1fa` | Info light border |
| 200 | `#b1c4f5` | Decorative |
| 300 | `#89a9f1` | Lighter info |
| 400 | `#5d8fec` | Medium info |
| **500** | **`#3980ed`** | **Information default** |
| 600 | `#175cb3` | Darker info |
| 700 | `#104383` | Dark info surfaces |
| 800 | `#0b2e59` | Info text label |
| 900 | `#071b35` | High-contrast |
| 950 | `#031123` | Near-black |

### 2.8 Neutral
| Shade | Hex | Usage |
|---|---|---|
| 50 | `#eceaec` | Subtle backgrounds, alt rows |
| 100 | `#d9d7db` | Light borders |
| 200 | `#b7b1b9` | Disabled surfaces |
| 300 | `#968d9b` | Disabled borders |
| 400 | `#786e7c` | Default borders |
| **500** | **`#645c68`** | **Neutral reference, disabled text** |
| 600 | `#474049` | Darker borders |
| 700 | `#363037` | Footnote/caption text |
| 800 | `#252227` | Body text |
| 900 | `#181719` | Title text |
| 950 | `#110f12` | Near-black |

### 2.9 Absolute
| Token | Hex |
|---|---|
| White | `#ffffff` |
| Black | `#000000` |

---

## 3. Typography

| Token | Value | Description |
|---|---|---|
| `fontFamily.headings` | `Jura` | Headings — weight 700 (Bold) |
| `fontFamily.body` | `Jura` | Body — weight 400 (Regular) |
| `fontWeight.regular` | `400` | Body text |
| `fontWeight.bold` | `700` | Headings, emphasis |
| `fontSize.xs` | `0.75rem` (12px) | Labels, captions |
| `fontSize.sm` | `0.875rem` (14px) | Secondary text, table cells |
| `fontSize.base` | `1rem` (16px) | Body copy |
| `fontSize.lg` | `1.125rem` (18px) | Subheadings |
| `fontSize.xl` | `1.25rem` (20px) | Section headings |
| `fontSize.2xl` | `1.5rem` (24px) | Page headings |
| `fontSize.3xl` | `1.875rem` (30px) | Hero/display |
| `lineHeight.tight` | `1.25` | Headings |
| `lineHeight.normal` | `1.5` | Body |
| `lineHeight.relaxed` | `1.75` | Spacious reading |

---

## 4. Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `spacing.xs` | `4px` | Tight gaps (icon margins, inline spacing) |
| `spacing.sm` | `8px` | Small gaps (button padding-y, form gaps) |
| `spacing.md` | `16px` | Medium gaps (card content, button padding-x) |
| `spacing.lg` | `24px` | Large gaps (section spacing, card padding) |
| `spacing.xl` | `32px` | Extra-large (page section margins) |
| `spacing.2xl` | `48px` | Layout sections |
| `spacing.3xl` | `64px` | Major divisions |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `borderRadius.none` | `0` | Sharp edges (tables, dividers) |
| `borderRadius.sm` | `4px` | Subtle rounding (badges in compact mode) |
| `borderRadius.md` | `8px` | Buttons, inputs, cards (default) |
| `borderRadius.lg` | `12px` | Cards, panels |
| `borderRadius.xl` | `16px` | Large panels, modals |
| `borderRadius.full` | `9999px` | Pills, avatar circles, badges |

---

## 6. Semantic Tokens (Intent-Based)

### 6.1 Primary (Purple)
| Token | Hex | Usage |
|---|---|---|
| `primary.surface.subtle` | `#f3e2fd` | Light purple background |
| `primary.surface.lighter` | `#c75ef3` | Lighter purple surface |
| `primary.surface.default` | `#8314ab` | Primary buttons, links |
| `primary.surface.darker` | `#4d0e62` | Hover states |
| `primary.border.subtle` | `#e9cafb` | Subtle purple border |
| `primary.border.lighter` | `#c75ef3` | Lighter purple border |
| `primary.border.default` | `#8314ab` | Focus rings, active borders |
| `primary.border.darker` | `#4d0e62` | Dark borders |
| `primary.text.label` | `#380a47` | Primary text on light bg |

### 6.2 Secondary (PurplePink)
| Token | Hex | Usage |
|---|---|---|
| `secondary.surface.subtle` | `#f9eff9` | Secondary background |
| `secondary.surface.lighter` | `#dba6df` | Lighter secondary |
| `secondary.surface.default` | `#c574d3` | Secondary buttons |
| `secondary.surface.darker` | `#74377a` | Secondary hover |
| `secondary.border.subtle` | `#f1dff4` | Subtle border |
| `secondary.border.lighter` | `#dba6df` | Lighter border |
| `secondary.border.default` | `#c574d3` | Default secondary border |
| `secondary.border.darker` | `#74377a` | Dark border |
| `secondary.text.label` | `#4b244f` | Secondary text label |

### 6.3 Error (Red)
| Token | Hex | Usage |
|---|---|---|
| `error.surface.subtle` | `#ffe6e9` | Error background |
| `error.surface.lighter` | `#ff5779` | Light error |
| `error.surface.default` | `#ab1545` | Error buttons, icons |
| `error.surface.darker` | `#660d25` | Error hover |
| `error.border.subtle` | `#ffc9d0` | Subtle error border |
| `error.border.lighter` | `#ff5779` | Light error border |
| `error.border.default` | `#ab1545` | Error validation border |
| `error.border.darker` | `#660d25` | Dark error border |
| `error.text.label` | `#4a0a1b` | Error text label |

### 6.4 Warning (Yellow)
| Token | Hex | Usage |
|---|---|---|
| `warning.surface.subtle` | `#fff5da` | Warning background |
| `warning.surface.lighter` | `#eac846` | Light warning |
| `warning.surface.default` | `#c8b133` | Warning icons |
| `warning.surface.darker` | `#6a5b1f` | Warning hover |
| `warning.border.subtle` | `#ffebaf` | Subtle border |
| `warning.border.lighter` | `#eac846` | Light border |
| `warning.border.default` | `#c8b133` | Default warning border |
| `warning.border.darker` | `#6a5b1f` | Dark border |
| `warning.text.label` | `#463c14` | Warning text label |

### 6.5 Success (Green)
| Token | Hex | Usage |
|---|---|---|
| `success.surface.subtle` | `#d6fee4` | Success background |
| `success.surface.lighter` | `#00e881` | Light success |
| `success.surface.default` | `#33c872` | Success icons, badges |
| `success.surface.darker` | `#00693b` | Success hover |
| `success.border.subtle` | `#a7fec8` | Subtle border |
| `success.border.lighter` | `#00e881` | Light border |
| `success.border.default` | `#33c872` | Default success border |
| `success.border.darker` | `#00693b` | Dark border |
| `success.text.label` | `#004527` | Success text label |

### 6.6 Information (BrightBlue)
| Token | Hex | Usage |
|---|---|---|
| `information.surface.subtle` | `#eaeefc` | Info background |
| `information.surface.lighter` | `#89a9f1` | Light info |
| `information.surface.default` | `#3980ed` | Info icons, links |
| `information.surface.darker` | `#104383` | Info hover |
| `information.border.subtle` | `#d8e1fa` | Subtle border |
| `information.border.lighter` | `#89a9f1` | Light border |
| `information.border.default` | `#3980ed` | Default info border |
| `information.border.darker` | `#104383` | Dark border |
| `information.text.label` | `#0b2e59` | Info text label |

### 6.7 Accent (DBlue)
| Token | Hex | Usage |
|---|---|---|
| `accent.surface.subtle` | `#dde0fb` | Accent background |
| `accent.surface.lighter` | `#3b53e0` | Lighter accent |
| `accent.surface.default` | `#09134f` | Sidebar bg, table headers |
| `accent.surface.darker` | `#061035` | Sidebar hover |
| `accent.border.subtle` | `#bdc1f6` | Subtle accent border |
| `accent.border.lighter` | `#3b53e0` | Lighter accent border |
| `accent.border.default` | `#09134f` | Default accent border |
| `accent.border.darker` | `#061035` | Dark accent border |
| `accent.text.label` | `#060d2b` | Accent text label |

### 6.8 Neutral
| Token | Hex | Usage |
|---|---|---|
| `neutral.surface.subtle` | `#eceaec` | Alt-row bg, hover tints |
| `neutral.surface.default` | `#b7b1b9` | Default neutral surface |
| `neutral.surface.disabled` | `#b7b1b9` | Disabled surfaces |
| `neutral.border.default` | `#786e7c` | Default borders |
| `neutral.border.disabled` | `#968d9b` | Disabled borders |
| `neutral.border.darker` | `#474049` | Strong borders |
| `neutral.text.title` | `#181719` | H1-H3 text |
| `neutral.text.body` | `#252227` | Paragraph text |
| `neutral.text.footnote` | `#363037` | Small print |
| `neutral.text.caption` | `#363037` | Captions |
| `neutral.text.negative` | `#eceaec` | Text on dark bg |
| `neutral.text.disabled` | `#645c68` | Disabled text |

### 6.9 Container (PF-Core Immutable)
| Token | Hex | Notes |
|---|---|---|
| `container.surface.default` | `#768181` | Graph canvas tint — immutable across brands |

---

## 7. Component Tokens

### 7.1 Button
| Token | Resolved Hex | Description |
|---|---|---|
| `button.primary.background` | `#8314ab` | Primary CTA |
| `button.primary.text` | `#eceaec` | White-on-purple |
| `button.primary.hover` | `#4d0e62` | Darker on hover |
| `button.primary.border` | `#8314ab` | Matches bg |
| `button.secondary.background` | `#f9eff9` | Light secondary |
| `button.secondary.text` | `#181719` | Dark text |
| `button.secondary.border` | `#c574d3` | PurplePink border |
| `button.destructive.background` | `#ab1545` | Red CTA |
| `button.destructive.text` | `#eceaec` | White-on-red |
| `button.ghost.background` | transparent | No fill |
| `button.ghost.text` | `#8314ab` | Purple text |
| `button.radius` | `8px` | `borderRadius.md` |
| `button.padding.horizontal` | `16px` | `spacing.md` |
| `button.padding.vertical` | `8px` | `spacing.sm` |

### 7.2 Input
| Token | Resolved Hex | Description |
|---|---|---|
| `input.background` | `#ffffff` | White |
| `input.border` | `#786e7c` | Neutral border |
| `input.border.focus` | `#8314ab` | Purple focus ring |
| `input.border.error` | `#ab1545` | Red error border |
| `input.text` | `#252227` | Body text |
| `input.placeholder` | `#363037` | Caption grey |
| `input.label` | `#181719` | Title weight |
| `input.radius` | `8px` | `borderRadius.md` |

### 7.3 Checkbox
| Token | Resolved Hex | Description |
|---|---|---|
| `checkbox.background` | `#ffffff` | Unchecked |
| `checkbox.checked.background` | `#8314ab` | Checked purple |
| `checkbox.border` | `#786e7c` | Neutral border |

### 7.4 Card
| Token | Resolved Hex | Description |
|---|---|---|
| `card.background` | `#ffffff` | White |
| `card.border` | `#786e7c` | Neutral border |
| `card.radius` | `12px` | `borderRadius.lg` |
| `card.padding` | `24px` | `spacing.lg` |
| `card.shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Subtle elevation |

### 7.5 Badge
| Token | Resolved Hex | Description |
|---|---|---|
| `badge.primary.background` | `#f3e2fd` | Purple tint |
| `badge.primary.text` | `#380a47` | Dark purple |
| `badge.success.background` | `#d6fee4` | Green tint |
| `badge.success.text` | `#004527` | Dark green |
| `badge.warning.background` | `#fff5da` | Yellow tint |
| `badge.warning.text` | `#463c14` | Dark amber |
| `badge.error.background` | `#ffe6e9` | Red tint |
| `badge.error.text` | `#4a0a1b` | Dark red |
| `badge.radius` | `9999px` | Pill shape |

### 7.6 Table
| Token | Resolved Hex | Description |
|---|---|---|
| `table.header.background` | `#09134f` | Deep blue header |
| `table.header.text` | `#eceaec` | White text |
| `table.row.background` | `#ffffff` | White rows |
| `table.row.alt.background` | `#eceaec` | Striped rows |
| `table.border` | `#786e7c` | Cell borders |

### 7.7 Sidebar
| Token | Resolved Hex | Description |
|---|---|---|
| `sidebar.background` | `#09134f` | Deep blue |
| `sidebar.text` | `#eceaec` | Light text |
| `sidebar.active.background` | `#8314ab` | Purple active |
| `sidebar.hover.background` | `#061035` | Dark hover |

### 7.8 Top Bar
| Token | Resolved Hex | Description |
|---|---|---|
| `topbar.background` | `#ffffff` | White |
| `topbar.border` | `#786e7c` | Bottom border |

### 7.9 Alert
| Token | Resolved Hex | Description |
|---|---|---|
| `alert.success.background` | `#d6fee4` | Green bg |
| `alert.success.border` | `#33c872` | Green border |
| `alert.error.background` | `#ffe6e9` | Red bg |
| `alert.error.border` | `#ab1545` | Red border |
| `alert.warning.background` | `#fff5da` | Yellow bg |
| `alert.warning.border` | `#c8b133` | Yellow border |
| `alert.info.background` | `#eaeefc` | Blue bg |
| `alert.info.border` | `#3980ed` | Blue border |

---

## 8. CSS Custom Properties (Ready-to-Use)

```css
/* === RCS Brand Tokens — Generated from DS-ONT v3.0.0 === */

:root {
  /* --- Primitives: Purple Scale --- */
  --color-purple-50: #f3e2fd;
  --color-purple-100: #e9cafb;
  --color-purple-200: #d696f7;
  --color-purple-300: #c75ef3;
  --color-purple-400: #b220e3;
  --color-purple-500: #8314ab;
  --color-purple-600: #641280;
  --color-purple-700: #4d0e62;
  --color-purple-800: #380a47;
  --color-purple-900: #25062f;
  --color-purple-950: #18041e;

  /* --- Primitives: PurplePink Scale --- */
  --color-purplepink-50: #f9eff9;
  --color-purplepink-100: #f1dff4;
  --color-purplepink-200: #e5c1e9;
  --color-purplepink-300: #dba6df;
  --color-purplepink-400: #cf87d4;
  --color-purplepink-500: #c574d3;
  --color-purplepink-600: #a04ba6;
  --color-purplepink-700: #74377a;
  --color-purplepink-800: #4b244f;
  --color-purplepink-900: #2c142e;
  --color-purplepink-950: #1e0e1f;

  /* --- Primitives: DBlue Scale --- */
  --color-dblue-50: #dde0fb;
  --color-dblue-100: #bdc1f6;
  --color-dblue-200: #7c88ec;
  --color-dblue-300: #3b53e0;
  --color-dblue-400: #132e9b;
  --color-dblue-500: #09134f;
  --color-dblue-600: #07123d;
  --color-dblue-700: #061035;
  --color-dblue-800: #060d2b;
  --color-dblue-900: #04081e;
  --color-dblue-950: #030615;

  /* --- Primitives: Green Scale --- */
  --color-green-50: #d6fee4;
  --color-green-100: #a7fec8;
  --color-green-200: #14fd92;
  --color-green-300: #00e881;
  --color-green-400: #00d275;
  --color-green-500: #33c872;
  --color-green-600: #009151;
  --color-green-700: #00693b;
  --color-green-800: #004527;
  --color-green-900: #002515;
  --color-green-950: #00190e;

  /* --- Primitives: Yellow Scale --- */
  --color-yellow-50: #fff5da;
  --color-yellow-100: #ffebaf;
  --color-yellow-200: #ffdb4c;
  --color-yellow-300: #eac846;
  --color-yellow-400: #d8b940;
  --color-yellow-500: #c8b133;
  --color-yellow-600: #96802c;
  --color-yellow-700: #6a5b1f;
  --color-yellow-800: #463c14;
  --color-yellow-900: #26210b;
  --color-yellow-950: #191507;

  /* --- Primitives: Red Scale --- */
  --color-red-50: #ffe6e9;
  --color-red-100: #ffc9d0;
  --color-red-200: #ff95a6;
  --color-red-300: #ff5779;
  --color-red-400: #eb1e56;
  --color-red-500: #ab1545;
  --color-red-600: #871231;
  --color-red-700: #660d25;
  --color-red-800: #4a0a1b;
  --color-red-900: #2f0611;
  --color-red-950: #23040d;

  /* --- Primitives: BrightBlue Scale --- */
  --color-brightblue-50: #eaeefc;
  --color-brightblue-100: #d8e1fa;
  --color-brightblue-200: #b1c4f5;
  --color-brightblue-300: #89a9f1;
  --color-brightblue-400: #5d8fec;
  --color-brightblue-500: #3980ed;
  --color-brightblue-600: #175cb3;
  --color-brightblue-700: #104383;
  --color-brightblue-800: #0b2e59;
  --color-brightblue-900: #071b35;
  --color-brightblue-950: #031123;

  /* --- Primitives: Neutral Scale --- */
  --color-neutral-50: #eceaec;
  --color-neutral-100: #d9d7db;
  --color-neutral-200: #b7b1b9;
  --color-neutral-300: #968d9b;
  --color-neutral-400: #786e7c;
  --color-neutral-500: #645c68;
  --color-neutral-600: #474049;
  --color-neutral-700: #363037;
  --color-neutral-800: #252227;
  --color-neutral-900: #181719;
  --color-neutral-950: #110f12;

  /* --- Typography --- */
  --font-headings: 'Jura', sans-serif;
  --font-body: 'Jura', sans-serif;
  --font-weight-regular: 400;
  --font-weight-bold: 700;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* --- Spacing --- */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;

  /* --- Border Radius --- */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* --- Semantic: Primary --- */
  --primary-surface-subtle: #f3e2fd;
  --primary-surface-lighter: #c75ef3;
  --primary-surface-default: #8314ab;
  --primary-surface-darker: #4d0e62;
  --primary-border-subtle: #e9cafb;
  --primary-border-default: #8314ab;
  --primary-border-darker: #4d0e62;
  --primary-text-label: #380a47;

  /* --- Semantic: Secondary --- */
  --secondary-surface-subtle: #f9eff9;
  --secondary-surface-default: #c574d3;
  --secondary-surface-darker: #74377a;
  --secondary-border-default: #c574d3;
  --secondary-text-label: #4b244f;

  /* --- Semantic: Error --- */
  --error-surface-subtle: #ffe6e9;
  --error-surface-default: #ab1545;
  --error-border-default: #ab1545;
  --error-text-label: #4a0a1b;

  /* --- Semantic: Warning --- */
  --warning-surface-subtle: #fff5da;
  --warning-surface-default: #c8b133;
  --warning-border-default: #c8b133;
  --warning-text-label: #463c14;

  /* --- Semantic: Success --- */
  --success-surface-subtle: #d6fee4;
  --success-surface-default: #33c872;
  --success-border-default: #33c872;
  --success-text-label: #004527;

  /* --- Semantic: Information --- */
  --info-surface-subtle: #eaeefc;
  --info-surface-default: #3980ed;
  --info-border-default: #3980ed;
  --info-text-label: #0b2e59;

  /* --- Semantic: Accent --- */
  --accent-surface-subtle: #dde0fb;
  --accent-surface-default: #09134f;
  --accent-surface-darker: #061035;
  --accent-border-default: #09134f;
  --accent-text-label: #060d2b;

  /* --- Semantic: Neutral --- */
  --neutral-surface-subtle: #eceaec;
  --neutral-surface-default: #b7b1b9;
  --neutral-border-default: #786e7c;
  --neutral-border-darker: #474049;
  --neutral-text-title: #181719;
  --neutral-text-body: #252227;
  --neutral-text-caption: #363037;
  --neutral-text-negative: #eceaec;
  --neutral-text-disabled: #645c68;

  /* --- Container (Immutable PFC) --- */
  --container-surface-default: #768181;
}
```

---

## 9. Design Rules for AI Agents

When generating design outputs for RCS, follow these rules:

### Colour Usage
1. **Primary actions** (CTAs, links, focus rings) always use `#8314ab` (purple-500)
2. **Secondary actions** use `#c574d3` (purplepink-500) or subtle variant
3. **Sidebar & navigation chrome** use `#09134f` (dblue-500) — dark authoritative feel
4. **Table headers** use `#09134f` with white text
5. **Never mix** error/warning/success colours with primary/secondary
6. **Compliance status badges** use semantic intents: success=compliant, warning=partial, error=non-compliant, info=in-progress

### Typography
7. **All text** uses Jura font family — no system fonts
8. **Headings**: Jura Bold (700), tight line-height (1.25)
9. **Body**: Jura Regular (400), normal line-height (1.5)
10. **Min body size**: 14px (`fontSize.sm`) — never smaller for body text

### Spacing
11. **Base unit**: 8px — all spacing should be multiples of 4px
12. **Card padding**: always `spacing.lg` (24px)
13. **Button padding**: `spacing.sm` (8px) vertical, `spacing.md` (16px) horizontal
14. **Section gaps**: `spacing.xl` (32px) minimum between major sections

### Border Radius
15. **Buttons & inputs**: `borderRadius.md` (8px) — consistent interactive elements
16. **Cards & panels**: `borderRadius.lg` (12px)
17. **Badges & pills**: `borderRadius.full` (9999px)
18. **Tables**: `borderRadius.none` (0) — sharp professional edges

### Accessibility
19. **WCAG 2.1 AA minimum** — all text must meet 4.5:1 contrast ratio
20. `#8314ab` on `#ffffff` = 5.3:1 (AA pass)
21. `#eceaec` on `#09134f` = 12.7:1 (AAA pass)
22. `#eceaec` on `#8314ab` = 4.8:1 (AA pass)
23. Never use `neutral.text.disabled` (#645c68) on coloured backgrounds

### RegTech-Specific Patterns
24. **Compliance dashboards**: Use card grid with status badges (success/warning/error)
25. **Framework tables**: Dark header (`accent.surface.default`), striped body rows
26. **Assessment forms**: Purple focus rings, red error borders, green success borders
27. **Progress indicators**: Use primary purple for completion, neutral for remaining
28. **Governance hierarchy**: Accent (deep blue) for framework level, Primary (purple) for control level, Secondary (purplepink) for evidence level

---

## 10. Token Count Summary

| Tier | Count | Components |
|---|---|---|
| Primitive | 118 | 88 colours (8x11), 14 typography, 7 spacing, 6 radius, 1 border, 2 absolute |
| Semantic | 76 | 9 primary, 9 secondary, 9 error, 9 warning, 9 success, 9 information, 9 accent, 12 neutral, 1 container |
| Component | 56 | 14 button, 8 input, 3 checkbox, 5 card, 9 badge, 5 table, 4 sidebar, 2 topbar, 6 alert |
| **Total** | **250** | |

---

*Generated from DS-ONT v3.0.0 instance data. Source of truth: `rcs-ds-instance-v1.0.0.jsonld`*
