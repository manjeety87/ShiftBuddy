````markdown
# Executive Productivity Design System

## 1. Overview & Creative North Star: "The Orchestrator"

This design system is built for the high-stakes world of multi-job management. We are moving away from the "utility app" aesthetic and toward a **High-End Editorial** experience. The North Star for this system is **"The Orchestrator"**: a visual language that feels like a private concierge—authoritative, calm, and impeccably organized.

To break the "standard SaaS" mold, we reject rigid grids in favor of **Intentional Asymmetry** and **Tonal Depth**. Instead of using lines to separate data, we use "negative space as a luxury." We prioritize a "Dark Mode First" architecture where information isn't just displayed; it is staged. By utilizing overlapping layers and extreme typographic contrast, we transform a complex shift schedule into a curated dashboard of professional life.

---

## 2. Color & Tonal Architecture

Our palette is rooted in deep, obsidian navies and charcols, punctuated by a surgical application of "Electric Cobalt" (#ADC6FF).

### Surface Hierarchy & Nesting

Forget flat layouts. This system utilizes the **Material Surface Tiers** to create a physical sense of depth.

- **Base Layer:** `surface` (#10131a) — The "floor" of the application.
- **Sectioning:** `surface_container_low` (#191c22) — Used for large structural blocks.
- **Interaction Layer:** `surface_container` (#1d2026) — The default state for primary cards.
- **Elevated State:** `surface_container_high` (#272a31) — Used for active or hovered elements.

### The "No-Line" Rule

**Explicit Instruction:** Do not use 1px solid borders for sectioning or grouping.
Boundaries must be defined through background shifts. If a card sits on the `surface`, the card itself should be `surface_container`. To separate a sidebar from a main feed, transition the background from `surface_dim` to `surface_container_low`.

### The "Glass & Gradient" Rule

To achieve a 2026 premium feel, use **Glassmorphism** for floating headers and navigation bars.

- **Token:** `surface` at 70% opacity + 20px backdrop-blur.
- **Signature Textures:** For primary CTAs (like "Add Shift"), use a subtle linear gradient from `primary` (#adc6ff) to `primary_container` (#4b8eff). This adds a "lithographic" soul to the UI that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority

We pair **Manrope** (Display/Headline) with **Inter** (Body/Label) to create a sophisticated hierarchy that feels both human and engineered.

- **Display (Manrope):** Large, airy, and bold. Used for daily summaries or total earnings. High-contrast sizing (e.g., `display-lg` at 3.5rem) should be used to anchor the page.
- **Headline (Manrope):** Structured and authoritative. Use for workplace names and primary navigation headers.
- **Body (Inter):** Optimized for high-density shift data. `body-md` (0.875rem) is the workhorse for shift times and locations.
- **Labels (Inter):** Tight, all-caps or high-weight small caps for meta-data like "CONFLICT DETECTED" or "OVERTIME."

**The Brand Voice:** Typography should feel like a premium financial broadsheet—large headlines for impact, paired with precisely tracked body text for clarity.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are too heavy for a 2026 productivity tool. We use **Ambient Lighting**.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_lowest` (#0b0e14) card on a `surface_container` background creates an "inset" look, perfect for secondary log entries.
- **Ambient Shadows:** For floating modals, use a "Tinted Glow" instead of a drop shadow.
- _Shadow Config:_ `0px 24px 48px rgba(0, 0, 0, 0.4), 0px 0px 4px rgba(173, 198, 255, 0.1)`
- **The "Ghost Border":** If a boundary is required for accessibility, use the `outline_variant` (#414755) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Refined Primitives

### Cards (The Core)

- **Rule:** Forbid divider lines. Use `3` (1rem) spacing to separate shift title from shift time.
- **Style:** `xl` (0.75rem) corner radius. Use `surface_container` background.
- **Conflict State:** When a shift overlaps, do not border the card in red. Use a 4px left-accent bar of `tertiary` (#ffb595) and a soft `tertiary_container` glow behind the text.

### Buttons

- **Primary:** Gradient from `primary` to `primary_container`. Text color `on_primary`. Shape: `full` (pill).
- **Secondary:** Transparent background with a `Ghost Border` (15% `outline`).
- **Tertiary:** Text-only using `primary_fixed_dim`.

### Workplace Badges (Signature Component)

Small, high-end chips used to identify different jobs.

- **Styling:** Use `surface_container_highest` with a 2px circular dot of a custom workplace color. No borders. `label-md` typography.

### Input Fields

- **Default State:** Background `surface_container_lowest`, no border.
- **Focus State:** Subtle `primary` glow (2px outer blur) and the text becomes `on_surface`.
- **Error State:** A soft wash of `error_container` (#93000a) background with `error` text.

### Calendar Components

- **The "Clean Grid" Principle:** Vertical lines are prohibited. Use horizontal "tracks" defined by subtle `surface_variant` backgrounds. Current time indicator should be a razor-thin line in `primary`.

---

## 6. Do’s and Don'ts

### Do

- **Do** use intentional white space. A "premium" feel is often just a result of generous margins (`8` or `10` from the spacing scale).
- **Do** use `surface_bright` to highlight the most important piece of information on a screen (e.g., "Next Shift in 2 hours").
- **Do** ensure all interactive elements have a minimum touch target of 44px, even if the visual "chip" is smaller.

### Don't

- **Don't** use pure black (#000000) or pure white (#FFFFFF). Use the provided `surface` and `on_surface` tokens to maintain the high-end charcoal vibe.
- **Don't** use 100% opaque borders. They clutter the UI and break the "layered glass" illusion.
- **Don't** use standard "Warning Yellow." Use the sophisticated `tertiary` (Burnt Orange/Peach) for a more refined, executive alert system.
- **Don't** use "Drop Shadows" on cards that are nested. Only "Floating" elements (Modals/Popovers) get shadows.

---

## 7. Spacing & Rhythm

All spacing must follow the **Geometric Scale**.

- **Internal Card Padding:** `4` (1.4rem).
- **Between Card Groups:** `6` (2rem).
- **Page Margins:** `8` (2.75rem) or `12` (4rem) for desktop.

By adhering to these specific increments, the layout will feel "mathematically correct," providing the user with a subconscious sense of stability and order.```
````
