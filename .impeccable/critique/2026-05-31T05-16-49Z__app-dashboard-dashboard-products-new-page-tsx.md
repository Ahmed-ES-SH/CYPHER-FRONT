---
target: app/(dashboard)/dashboard/products/new/page.tsx
total_score: 25
p0_count: 1
p1_count: 3
timestamp: 2026-05-31T05-16-49Z
slug: app-dashboard-dashboard-products-new-page-tsx
---
# Critique: New Product Page

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Status indicator + toast + saving state on button. Missing: field-level save indicators, auto-save. |
| 2 | Match System / Real World | 4/4 | Section labels match admin mental model. Placeholder examples are realistic. Strong. |
| 3 | User Control and Freedom | 3/4 | Cancel → product list. Save Draft available. No undo after publish. No publish confirmation. |
| 4 | Consistency and Standards | 2/4 | **Undefined design tokens** (`font-title-md`, `text-title-md`, etc.) inconsistent with rest of dashboard (which uses `text-sm font-medium`). Three sibling dashboard forms, three different styling patterns. |
| 5 | Error Prevention | 3/4 | Client-side validation on submit. Slug auto-generation. Tags dedup. Missing: inline validation on blur, URL format validation, barcode format validation. |
| 6 | Recognition Rather Than Recall | 3/4 | Categories dropdown, warranty select, shipping select. Tags require manual entry — no autocomplete. |
| 7 | Flexibility and Efficiency | 1/4 | No keyboard shortcuts, no bulk tag entry, no duplicate-from-existing, no tab-index optimization. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean card layout, good spacing, flat design. Deduction: "Empty" placeholder boxes not helpful; "✕" unicode looks cheap. |
| 9 | Error Recovery | 2/4 | Field-level errors on submit. Server errors via toast. Missing: inline recovery suggestions, "undo" for publish, auto-focus on first error field. |
| 10 | Help and Documentation | 1/4 | No help text, tooltips, documentation link. Barcode field says "Scan or enter code" with no format guidance. |
| **Total** | | **25/40** | **Acceptable** — significant improvements needed |

## Anti-Patterns Verdict

**Does this look AI-generated?** Low risk but not clean.

**LLM assessment:** The form avoids all absolute bans (no side-stripes, gradient text, glassmorphism, hero metrics, identical grids, eyebrows, numbered markers, 32px+ radius, sketchy SVGs, stripe backgrounds). The codex-specific defects (border+large shadow combo, over-rounded corners) are also absent. However, minor tells remain: unicode `✕` close buttons (should be proper SVG icons), and the undefined-custom-token pattern is an AI hallmark — inventing class names like `font-title-md` that don't exist in the theme.

**Deterministic scan:** Detector (`detect.mjs`) returned zero findings across both files. The automated scanner found no pattern issues.

**Browser visualization:** Page loads but requires authentication — redirects to `/signin`. The ProductForm component itself was not visually inspectable behind the auth guard. Live-mode detection injection succeeded on the sign-in page instead.

## Overall Impression

The form has a strong information architecture (5 logical sections in the correct mental model) and a thoughtful sticky action bar. But it's held back by undefined design tokens that silently break rendering, an inconsistent class vocabulary compared to sibling dashboard forms, and a lack of both first-timer guidance and power-user accelerators. The foundation is solid; the execution is fragmented.

## What's Working

1. **Strong information architecture.** Basic → Pricing → Media → Shipping → Identifiers is the correct mental model for a product form. Each section is a self-contained visual card with a clear header and icon.

2. **Thoughtful sticky action bar.** Fixed bottom bar with status indicator (Draft/Published dot), Save Draft (ghost) vs. Publish Product (primary) — clean separation of concerns. Good application of the Flat-Rest Rule.

3. **Good empty states for media.** Thumbnail dashed placeholder and gallery placeholder boxes show the user what populated sections look like. Better than a blank void.

## Priority Issues

### [P0] Undefined design tokens break the entire form's rendering

- **What:** Classes `font-title-md`, `text-title-md`, `font-label`, `text-label`, `font-body-md`, `text-body-md`, `font-caption`, `text-caption`, `font-price`, `text-price`, `bg-surface-lowest`, `bg-surface-container` are not defined in the `@theme inline` block. Tailwind v4 silently ignores undefined classes — the form likely renders entirely at default browser sizes.
- **Why it matters:** Users see unstyled text, wrong sizing, no visual hierarchy. The form looks broken. Compare with `EditCategoryModal.tsx` and `BlogEditor.tsx` which use plain `text-sm font-medium text-text-secondary` — working classes. Three sibling dashboard forms, three different vocabularies.
- **Location:** `ProductForm.tsx:213-601`; `globals.css:17-28`
- **Fix:** Either define all tokens in the `@theme` block, or migrate to the same pattern as other dashboard components (plain Tailwind utility classes).
- **Command:** `$impeccable polish`

### [P1] No confirmation on publish — high-stakes action without guardrails

- **What:** Clicking "Publish Product" immediately submits, makes the product live, and navigates away. No confirmation dialog, no undo toast, no "are you sure?"
- **Why it matters:** Publishing a product makes it visible to customers with pricing, inventory, and content. An accidental publish with wrong data erodes trust. Users need reassurance at this high-stakes moment.
- **Location:** `ProductForm.tsx:627-637`
- **Fix:** Add a toast with "Undo" after publish, or use a brief inline confirmation in the action bar (e.g., "Publish" → "Confirm Publish?" for 3 seconds).
- **Command:** `$impeccable harden`

### [P1] ✕ close/remove buttons lack accessible labels

- **What:** The unicode `✕` characters on thumbnail remove (line 388), gallery remove (line 451), and tag remove (line 597) lack `aria-label`. Screen readers announce "multiplication sign" or "times." Gallery remove buttons are `opacity-0 group-hover:opacity-100` — invisible to touch users and keyboard-only navigation.
- **Why it matters:** WCAG failure. Users relying on assistive technology can't identify or activate these controls. The hover-only visibility pattern excludes mobile users entirely.
- **Location:** `ProductForm.tsx:388, 451, 597`
- **Fix:** Replace `✕` with `FiX` icon from `react-icons/fi` (already imported). Add `aria-label="Remove thumbnail"`, `aria-label="Remove tag"`. Make gallery remove buttons always visible.
- **Command:** `$impeccable audit`

### [P1] Display font used in page heading — violates product register ban

- **What:** Page heading "Add New Product" uses `text-display-sm font-display-sm` (Space Grotesk). The product register explicitly bans "display fonts in UI labels, buttons, data."
- **Why it matters:** Display fonts in dashboard/admin surfaces read as over-designed. The page heading should match the body family (Inter) for a coherent admin experience.
- **Location:** `page.tsx:11`
- **Fix:** Change to body-family heading, e.g., `text-2xl font-semibold text-text-primary` using Inter.
- **Command:** `$impeccable typeset`

### [P2] No broken-image handling for URL-based media uploads

- **What:** Thumbnail (line 382) and gallery images (line 447) use raw `<img>` tags with no `onError` handler. A broken URL shows the browser's default broken-image icon.
- **Why it matters:** User-entered URLs will inevitably be wrong, expire, or point to inaccessible resources. The result is a broken-looking form with no fallback or error feedback.
- **Location:** `ProductForm.tsx:382, 447`
- **Fix:** Add `onError` handler that replaces the broken image with a styled fallback placeholder. Optionally validate URLs on blur.
- **Command:** `$impeccable harden`

## Persona Red Flags

### Sam (Accessibility-Dependent)
- `✕` buttons lack `aria-label` — screen readers announce "multiplication sign"
- Error messages are `<p>` tags with no `aria-describedby` linking error to input
- `text-text-muted` (#94a3b8) on white surface = ~3.0:1 contrast ratio — fails WCAG AA (needs 4.5:1)
- Double focus styling (CSS `outline` + Tailwind `ring`) may conflict visually
- Sticky action bar may overlap last form fields on short viewports — no `scroll-margin`

### Alex (Power User — Catalog Manager)
- No keyboard shortcuts (Cmd+S for save, Escape for cancel)
- Tab order through 25+ inputs — no skip-link or grouped tab regions
- No duplicate-from-existing or template support for adding similar products
- Tags require one-at-a-time entry; no comma-separated bulk paste
- No Comma-separated gallery URL bulk entry

### Jordan (First-Timer)
- No inline help or tooltips — Jordan must know what "SKU", "URL Slug", "Barcode (UPC/EAN)" mean
- Gallery section says "Empty" — not helpful. Better: "Add image URLs to show product photos"
- No onboarding checklist or "first product" guidance
- The barcode field says "Scan or enter code" with no format hints

### Taylor (CYPHER-Specific: Catalog Manager, 200+ products)
- No CSV import, bulk edit, or template duplication for managing product variants
- Tags are manual entry — wants AI-suggested tags based on title/description
- No "compare at" price field for showing original vs. sale price on storefront
- No live preview of how the product card will render

## Minor Observations

- **Slug prefix** (line 233): `cypher.com/p/` hardcodes the store URL — brittle if route structure changes
- **Price input** `type="number"` shows stepper arrows — `inputMode="decimal"` with pattern is preferred
- **Min Order Qty** default (1) is redundant with placeholder "1" — either remove default or placeholder
- **Gallery "Empty" boxes** (line 436): 3 non-interactive placeholders saying "Empty" — better: "Gallery slot 1", "Gallery slot 2", etc.
- **Section icons** use `text-[20px]` — arbitrary value outside the spacing scale
- **Bottom padding** (`pb-28`, line 17) is an educated guess — `env(safe-area-inset-bottom)` would be more robust
- **Discount field** uses `text-right` — good for percentage, but could use `inputMode="decimal"`

## Questions to Consider

1. **Is "one long scroll" the right model for 25+ fields across 5 categories?** The product register champions progressive disclosure. Would collapsible sections (with persisted state) reduce cognitive load without the overhead of a wizard stepper?

2. **Why does this form use a completely different class vocabulary from BlogEditor and EditCategoryModal?** Three sibling dashboard forms, three different styling patterns. The product register says "inconsistent component vocabulary across screens" is a product ban. Is there a design system enforcement mechanism?

3. **Is URL-only media upload a deliberate 1.0 scope cut or a permanent constraint?** A broken thumbnail on a published product page erodes trust. If it's a scope cut: what's the upgrade path (file upload, S3 presigned URLs)?

4. **Where is the product preview?** A "Create Product" form without a live preview of how the product card renders on the storefront means the user publishes blind. Should the action bar include a "Preview" button?
