---
name: CYPHER Electronics Store
description: A polished, premium next-generation electronics retail experience.
colors:
  primary-blue: '#0070dc'
  primary-cyan: '#00b8db'
  primary-yellow: '#facc15'
  dark-btn: '#041e42'
  icon-color: '#64748b'
  surface: '#f8fafc'
  surface-elevated: '#ffffff'
  border-subtle: '#e2e8f0'
  text-primary: '#0f172a'
  text-secondary: '#475569'
  text-muted: '#94a3b8'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#414753'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#717785'
  outline-variant: '#c1c6d5'
  surface-tint: '#005db8'
  primary: '#0058af'
  on-primary: '#ffffff'
  primary-container: '#0070dc'
  on-primary-container: '#f7f8ff'
  inverse-primary: '#aac7ff'
  secondary: '#00677c'
  on-secondary: '#ffffff'
  secondary-container: '#4cd9fd'
  on-secondary-container: '#005d6f'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea700'
  on-tertiary-container: '#4e3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468d'
  secondary-fixed: '#b1ecff'
  secondary-fixed-dim: '#48d7fb'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5e'
  tertiary-fixed: '#ffe083'
  tertiary-fixed-dim: '#eec200'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
  dark-navy: '#041e42'
  icon-utility: '#64748b'
typography:
  display:
    fontFamily: Space Grotesk, var(--font-space-grotesk), sans-serif
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: Inter, var(--font-inter), sans-serif
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter, var(--font-inter), sans-serif
    fontWeight: 500
    lineHeight: 1.2
    fontSize: 13px
    letterSpacing: 0.04em
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.05'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.01em
  display-sm:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: '0'
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  price:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: '0'
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.01em
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  full: 9999px
  DEFAULT: 0.5rem
  xl: 1.5rem
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  base: 4px
  gutter: 24px
  margin: 32px
  max-width: 1320px
components:
  button-shop:
    backgroundColor: '{colors.primary-blue}'
    textColor: '{colors.surface-elevated}'
    rounded: '{rounded.md}'
    padding: 10px 24px
  button-shop-hover:
    backgroundColor: '{colors.dark-btn}'
  product-card:
    backgroundColor: '{colors.surface-elevated}'
    rounded: '{rounded.md}'
    padding: 16px
  product-action:
    rounded: '{rounded.md}'
    padding: 8px 16px
---

# Design System: CYPHER

## Overview

CYPHER's retail surface is a bright, near-minimal product canvas (`{colors.surface}` — #f8fafc) with deep neutral typography and precise blue-led interaction states. The system is not decorative for its own sake; its energy comes from **high-fidelity product imagery**, clean spec hierarchies, and sharp modular layout bands that make devices feel premium, understandable, and ready to buy.

The interface uses white cards, subtle borders, and controlled accent color to keep attention on products. **Primary Blue** is the main action color, **Primary Cyan** signals active and exploratory states, and **Primary Yellow** is reserved for deals, limited badges, and urgent callouts. The system avoids visual noise, exaggerated glass effects, and over-styled gradients. Its personality is quiet, technical, and commercially confident.

Typography runs **Space Grotesk** for display and **Inter** for body and UI. The pairing is deliberate: display text feels engineered and modern; body text stays neutral, readable, and efficient. Product names, prices, and specs should scan instantly. This is a storefront that sells by clarity.

**Key Characteristics:**
- Bright neutral canvas (`{colors.surface}`) with elevated white cards and thin borders.
- Primary Blue (`{colors.primary-blue}`) drives CTAs, links, and action hierarchy.
- Primary Cyan (`{colors.primary-cyan}`) marks active states, hover transitions, and live indicators.
- Product imagery is the focal point; UI chrome stays quiet and structurally precise.
- Buttons use soft rounding (`{rounded.md}`) for approachability, not playfulness.
- Cards use subtle elevation via borders and tonal shifts rather than heavy shadows.
- Spacing is generous and grid-based: `{spacing.xl}` for major sections, `{spacing.lg}` inside cards, `{spacing.md}` for compact control clusters.
- The tone is premium retail, not gamer-tech, not luxury fashion, and not enterprise dashboard.

## Colors

### Primary & Brand

- **Primary Blue** (`{colors.primary-blue}` — #0070dc): The lead action color. Used for primary CTAs, selected states, pricing emphasis, and important interactive moments.
- **Primary Cyan** (`{colors.primary-cyan}` — #00b8db): Active indicators, hover accents, filter states, progress, and live badges. It adds freshness without overpowering the interface.
- **Primary Yellow** (`{colors.primary-yellow}` — #facc15): Promotional emphasis, discount badges, deals, flash sale chips, and high-priority alerts.
- **Dark Navy** (`{colors.dark-btn}` — #041e42): Secondary solid CTA color, top-nav depth, and strong contrast for focused action surfaces.

### Surface

- **Surface** (`{colors.surface}` — #f8fafc): Default page background. Bright, calm, and neutral.
- **Surface Elevated** (`{colors.surface-elevated}` — #ffffff): Cards, drawers, dialog containers, and content panels.
- **Border Subtle** (`{colors.border-subtle}` — #e2e8f0): Hairline dividers, input strokes, and card outlines.
- **Icon Color** (`{colors.icon-color}` — #64748b): Utility icons, secondary controls, and supportive UI glyphs.

### Text

- **Text Primary** (`{colors.text-primary}` — #0f172a): Main headlines, product names, and technical specs.
- **Text Secondary** (`{colors.text-secondary}` — #475569): Paragraph descriptions, metadata, and supporting copy.
- **Text Muted** (`{colors.text-muted}` — #94a3b8): Placeholder text, helper labels, inactive filters, and low-priority notes.

### Semantic

- **Success**: Use `{colors.primary-cyan}` for active success-like confirmations when the UI needs a positive but still modern feel.
- **Warning**: Use `{colors.primary-yellow}` for urgency and promotion, not for errors.
- **Error**: When needed, use a restrained red outside the main palette only for validation failure. It should never become a brand accent.
- **Info**: Use `{colors.primary-blue}` for neutral informative states.

**The 90-10 Rule.** Roughly 90% of the surface should remain neutral — white, near-white, border lines, and text. The remaining 10% should carry the brand through blue, cyan, and yellow accents. The palette is not meant to flood the page; it is meant to sharpen intent.

## Typography

### Font Family

**Space Grotesk** is the display face for headlines, product names, and hero statements. It gives the system a modern technical edge.  
**Inter** is the body and UI face for specs, descriptions, labels, and controls. It keeps the storefront readable at speed.

Fallback stack:
`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

The split is intentional:
- Display text carries personality and confidence.
- Body text carries clarity and utility.
- Labels carry precision and interface rhythm.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---:|---:|---:|---|
| `{typography.display-xl}` | 72px | 700 | 1.0 | -0.02em | Hero headlines, campaign banners |
| `{typography.display-lg}` | 48px | 700 | 1.05 | -0.02em | Section titles, product launch statements |
| `{typography.display-md}` | 36px | 700 | 1.1 | -0.01em | Product family names, large card titles |
| `{typography.display-sm}` | 28px | 700 | 1.15 | -0.01em | Subsection titles, feature callouts |
| `{typography.title-lg}` | 22px | 600 | 1.25 | 0 | Card titles, product names |
| `{typography.title-md}` | 18px | 600 | 1.3 | 0 | Section labels, modal titles |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | Default body copy, descriptions |
| `{typography.body-sm}` | 14px | 400 | 1.5 | 0 | Metadata, helper text, fine print |
| `{typography.label}` | 13px | 500 | 1.2 | 0.04em | Filters, tags, button labels, badges |
| `{typography.caption}` | 12px | 400 | 1.4 | 0.02em | Image credits, footnotes, low-priority notes |
| `{typography.price}` | 24px | 700 | 1.1 | 0 | Product pricing and savings callouts |

### Principles

The system favors a clear hierarchy with immediate separation between display, body, and labels. Space Grotesk should be used with restraint: enough to create a distinctive premium-tech voice, not enough to reduce legibility. Inter remains the working typeface for everything users need to scan quickly.

Prices, RAM values, storage sizes, screen sizes, and other spec fragments should be visually prominent. Dense e-commerce content must be easy to read at a glance. Do not make body copy too light or too compressed; the product detail page should feel fast, not strained.

Uppercase is allowed for short labels, badges, and button text. Long uppercase paragraphs are not appropriate. The design system is sharp, but not aggressive.

### Note on Font Substitutes

If **Space Grotesk** is unavailable, **Sora** or **Inter Tight** can serve as a fallback for display use. If **Inter** is unavailable, use `system-ui` or `Segoe UI` for body text. The substitute should preserve clarity first, personality second.

## Layout

### Spacing System

- **Base unit:** 4px.
- **Tokens:** `{spacing.sm}` 8px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px.
- **Section padding (vertical):** `{spacing.xl}` to 64px depending on the density of the page.
- **Card internal padding:** `{spacing.md}` for compact product tiles, `{spacing.lg}` for standard cards, `{spacing.xl}` for content-rich panels.
- **Gutters:** `{spacing.md}` between compact tiles, `{spacing.lg}` between larger cards, `{spacing.xl}` between page-level content bands.

### Grid & Container

- **Max content width:** 1320px centered on desktop for a premium storefront feel.
- **Core grid:** 12-column layout for product listing, product detail, and editorial landing pages.
- **Product grids:** 4-up at desktop, 2-up at tablet, 1-up at mobile for high clarity.
- **Editorial sections:** 3-up content cards on wide screens, collapsing smoothly to 2-up and 1-up.
- **Detail pages:** Two-column split on desktop, stacked on mobile with pricing and actions kept above the fold.

### Whitespace Philosophy

CYPHER depends on whitespace to signal quality. Product imagery needs room to breathe, especially on listing and landing pages. The system should not feel crowded or promotional. Instead, it should feel curated: enough structure to orient the shopper, enough space to let the product do the selling.

Empty space is not wasted space here. It is visual discipline.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Canvas sections, full-width content bands |
| Subtle border | 1px `{colors.border-subtle}` stroke | Cards, panels, inputs, chips |
| Elevated card | White surface with slight tonal separation | Product cards, filters, drawers |
| Focus depth | Border darkening or outline emphasis | Inputs, selected controls, active filters |

The system uses shadows sparingly. Borders and surface tone carry most of the structural work. When depth is needed, it should be soft and functional, not theatrical.

### Decorative Depth

- **Promo badge depth:** Yellow badges can sit slightly above the card surface through contrast, not shadow.
- **Image framing:** Product photography may use subtle cropping and scale changes to create depth inside cards.
- **Active-state depth:** Selected filters and primary buttons may shift to a darker or stronger blue to create emphasis without gradients.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 4px | Small chips, compact inputs, inline tags |
| `{rounded.md}` | 6px | Buttons, product cards, standard containers |
| `{rounded.lg}` | 8px | Larger panels, drawers, promotional cards |
| `{rounded.full}` | 9999px | Pills, avatars, small status dots |

The default shape language is softly rounded but still controlled. The system should feel modern and approachable, not overly playful. Rounded corners are present, but never excessive.

### Product Geometry

Product cards should maintain clear rectangular proportions with consistent image crops. Device renders may use 1:1 or 4:3 presentation on category grids, while detail pages can use wider hero shots. Accessories can use tighter square framing. Avoid inconsistent geometry that makes the catalog feel fragmented.

## Components

### Top Navigation

**`top-nav`** — Fixed or sticky white header with subtle border separation. Carries the CYPHER wordmark at left, primary navigation in the middle, and utility actions on the right (search, cart, account). The navigation should remain calm, compact, and highly readable.

### Buttons

**`button-shop`** — The primary CTA. Background `{colors.primary-blue}`, text `{colors.surface-elevated}`, `{rounded.md}` corners, 10px × 24px padding. Used for buy-now, add-to-cart, compare, and launch actions.

**`button-shop-hover`** — The hover state for `{component.button-shop}`. Background transitions to `{colors.dark-btn}`. The change should feel decisive, not flashy.

**`button-secondary`** — Secondary action button with white or surface background, border `{colors.border-subtle}`, and dark text. Used for compare, save, and view details.

**`button-icon`** — Compact circular or softly rounded icon control for wishlist, share, close, and carousel navigation. Should remain visually quiet unless active.

### Cards & Containers

**`product-card`** — The primary commerce tile. White surface, subtle border, rounded `{rounded.md}` corners, generous internal spacing, and a strong product image area. Product name, price, rating, and action controls should be immediately legible.

**`feature-card`** — Larger promotional or editorial card used for launches, collections, and seasonal stories. It combines an image, a lead headline, and a short supporting line in a balanced layout.

**`spec-card`** — A technical information container used on product detail pages. It organizes hardware specs, compatibility data, and comparison points into concise blocks. The visual tone should be strict and clear.

**`promo-card`** — A deal-forward container using a restrained yellow accent for badges or savings callouts. The card itself remains white and structured; the promotion never overwhelms the layout.

**`comparison-card`** — Used in compare flows. Keeps multiple device rows aligned with strict grid rhythm and compact text sizing.

### Inputs & Forms

**`text-input`** — White background, subtle border, 6px radius, dark text, and a clear focus outline in `{colors.primary-blue}`. Used for search, address capture, account flows, and checkout.

**`search-bar`** — A wider input variant with integrated icon and optional suggestion dropdown. It should feel immediate and dependable.

**`filter-chip`** — Small pill-like control for category filters, brands, price ranges, and availability. Uses `{rounded.full}` or `{rounded.sm}` depending on density, with active states in blue or cyan.

**`dropdown-select`** — Compact select control for sorting, filters, and preference selection. Should remain highly legible and avoid ornate menus.

### Commerce Controls

**`product-action`** — The embedded action button inside product cards. The default state is neutral and readable. The active state shifts to `{colors.primary-blue}` or `{colors.dark-btn}` depending on context. Use consistent padding and no excessive visual noise.

**`wishlist-toggle`** — Small icon control that marks favorites. Use clear active/inactive differentiation, ideally with a filled state or blue accent when saved.

**`compare-toggle`** — Compact stateful control for comparison mode. Should be easy to scan and should not compete with the main purchase action.

### Signature Components

**`hero-product-band`** — A full-width launch section that combines a large product image, a strong headline, and one primary CTA. The image should dominate the band while text remains sharply structured.

**`deal-badge`** — A compact yellow label used only for discounts, limited-time offers, and major savings. It must be short and high-contrast.

**`spec-highlight`** — A numeric emphasis treatment for storage, RAM, battery, refresh rate, or processor tiers. Numbers should read as the hero of the line.

**`trust-row`** — A narrow row beneath product cards or checkout summaries that shows shipping, warranty, returns, or support signals. It should reinforce confidence without adding visual weight.

**`comparison-sticky-bar`** — A fixed or anchored control bar for compare mode. It keeps selected items visible and accessible while the user browses.

### Footer

**`footer`** — The closing band of the site. White or near-white background, restrained typography, grouped links, and legal/support information. The footer should feel organized and dependable, not crowded.

## Do's and Don'ts

### Do

- Use neutral canvases to let product imagery and pricing carry the visual weight.
- Keep primary CTAs consistently blue so users learn the action language quickly.
- Use yellow only for promotions, not for standard navigation or repeated accents.
- Keep product titles, prices, and specs highly scannable.
- Use subtle borders and restrained rounding to maintain a polished retail feel.
- Keep spacing generous around hero sections and dense enough in product grids to remain efficient.
- Make focus and active states obvious, especially in search, filters, and checkout actions.

### Don't

- Don't flood the interface with all three brand accents at once.
- Don't overuse gradients, glassmorphism, or glow effects.
- Don't make cards too round; the system should stay crisp and structured.
- Don't hide pricing or key specs behind decorative interactions.
- Don't let secondary badges compete with primary purchase actions.
- Don't make the design feel playful or toy-like; it should stay premium and disciplined.
- Don't use low-contrast text on white surfaces.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Navigation collapses, product grids become 1-up, filters convert to drawers, CTAs become full-width |
| Tablet | 768–1024px | Navigation tightens, grids become 2-up, comparison views simplify |
| Desktop | 1024–1440px | Full navigation, 3–4 column product grids, richer detail layouts |
| Wide | > 1440px | Same structure with more breathing room and stronger editorial presentation |

### Touch Targets

- Buttons should maintain a minimum 44px target, ideally 48px for primary actions.
- Icon actions should remain easy to tap without crowding the card.
- Filter chips should be large enough to support quick scanning and quick selection.
- Search and form controls should be comfortably tall, never cramped.

### Collapsing Strategy

- Navigation collapses into a controlled menu or drawer on mobile.
- Product grids reduce columns rather than shrinking card content below readability.
- Spec tables collapse into stacked rows or grouped blocks.
- Compare mode should simplify into a swipeable or vertically stacked structure on smaller screens.
- Product imagery should remain central at every breakpoint; the image is the most important signal.

### Image Behavior

- Product images should retain clean cropping and avoid awkward letterboxing.
- Hero product banners should preserve clarity and headline legibility on smaller screens.
- Detail-page imagery should support zoom, alternate angles, and focus states where appropriate.
- Thumbnail navigation should remain visible and easy to use without crowding the main image.

## Iteration Guide

1. Start with the product card and hero band before expanding to secondary components.
2. Keep `{rounded.md}` as the default radius unless a control clearly needs to be a pill.
3. Use token references everywhere; do not inline random hex values in component specs.
4. Keep the display/body split intact: Space Grotesk for impact, Inter for clarity.
5. Use blue for action, cyan for state, yellow for promotion.
6. Preserve the white-card, subtle-border structure; it is central to the identity.
7. Add emphasis through hierarchy and spacing before adding more color.
8. Prefer clarity over ornament when a decision is ambiguous.

## Known Gaps

- Motion timing for hover, drawer transitions, and carousel behavior is not fully documented here.
- Checkout, payment, and error-state variants would require deeper flow analysis to confirm.
- The exact treatment of dark mode, if supported, is not established in this source.
- Long-form editorial content and product-story templates may need separate rules if they diverge from the core commerce surface.
- Accessibility targets beyond the basic touch and contrast expectations should be validated against implementation.
- Promo behavior during major sales events may introduce temporary exceptions to the standard palette hierarchy.
- Search suggestion layouts and empty-state variants are not fully extracted from the current reference set.