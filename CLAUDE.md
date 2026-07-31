# ShiftBuddy — Project Context for Claude

This file is auto-loaded by Claude Code at the start of every session in this
repo. Read it fully before doing anything — it replaces re-explaining the
project from scratch.

## What this app is

ShiftBuddy is a React Native (Expo Router) app for international
students/workers in Canada who juggle 2–3 part-time jobs, each with its own
scheduling system. Goal: see ALL shifts from ALL jobs in one place instead of
switching between apps.

Planned features, roughly in priority order:

1. **Multi-job shift aggregation** — shifts tagged by Job/Workplace, all
   visible together in Home/Calendar. (Data model + Home screen already
   exist — see Status below.)
2. **OCR shift import via Gemini** — user uploads a photo of either (a) a
   handwritten paper schedule or (b) a screenshot of another scheduling
   app's calendar. Gemini OCR extracts day/time, then the user confirms
   which Job/Store it belongs to. **Not built yet** — `upload-shift.tsx`
   exists as a route but the OCR pipeline (backend + parsing) still needs
   real wiring.
3. **Manual shift entry** as a fallback — `add-shift.tsx` exists, optional
   Job/Store + location.
4. **Auth + persistence** — Splash → login check → Home (if logged in) or
   Login. **Firebase planned but not started** — no backend auth/DB exists
   yet. Currently the app just uses local Zustand + AsyncStorage
   (`store/shift-store.ts`, `store/theme-store.ts`), gated by a
   `profile-setup` screen instead of real auth.
5. **Future**: Google Maps + Canada transit integration to suggest "leave
   home by X" and notify ~1hr before a shift, based on user location vs.
   job location.

The user's own pain point (one job uses a modern scheduling app, the other
still does pen-and-paper weekly schedules) is *why* OCR needs to support two
input sources (screenshot OR handwritten photo), not just one. Keep OCR and
manual entry feeding the **same** `Shift` data model (see `types/index.ts`) —
don't build them as separate models.

## Tech stack

- Expo Router (`app/` directory routing) + TypeScript, React Native 0.81,
  React 19.
- State: **Zustand** (`store/`) — not Redux. `zod` is planned for schema
  validation (API responses / OCR output / forms), not yet added as a
  dependency.
- Styling: hand-rolled theme system (`theme/`), no NativeWind/Tailwind.
- Backend: separate `backend/` folder (Node/Express-style, JavaScript, not
  TypeScript) — Gemini OCR endpoints live there (`backend/src/`). Still
  early/WIP.
- No Firebase wired up yet, despite being the long-term plan for auth + DB.

## How we're working (read this before writing code)

- **User is on free-tier LLM usage** with hard token/turn limits. Work
  **one screen/feature at a time**, not sprawling refactors — a session
  needs to leave the app in a working state before the budget runs out.
- **UI source**: the user hands over screens as HTML exported from **Google
  Stitch**, one at a time. Task = convert that HTML to pixel-perfect React
  Native using the existing theme/component system (`components/ui/*`,
  `hooks/use-app-theme.ts`) — not a generic reimplementation. Reuse
  existing store-wired logic where a screen already has it (e.g. the Home
  tab already had real Zustand data wiring before the Stitch pass — the fix
  was visual/structural, not a rewrite).
- **Don't guess on product scope.** If the Stitch mockup shows a feature/button
  that isn't part of the actual roadmap (e.g. the mockup's "Swap"/"Leave"
  quick actions — shift swapping and time-off requests were never planned),
  ask the user rather than inventing a destination screen or silently
  substituting something else.
- **Never run the dev server, build, or open a browser preview to verify
  changes.** The user runs and tests everything themselves on their end.
  Verify with `npx tsc --noEmit -p .` (static type check) only, then hand
  off. Don't create `.claude/launch.json` or use browser/preview tools for
  this project.
- **Don't install packages yourself** if a version has to be resolved
  (e.g. `npx expo install <pkg>`) — tell the user the exact command to run
  instead of guessing a version and hand-editing `package.json`.
- User writes in Hinglish (Hindi+English, Latin script) — mirroring that
  register in responses is fine and preferred over stiff formal English.
- Code must read as hand-written, industry-standard code: clear naming,
  `utils/` for helpers, `services/` for API calls (incl. Gemini OCR),
  Zustand for state, Zod for validation once added. No dead/commented-out
  "previous version" blocks left in files — delete, don't comment out.

## Architecture map

```
app/(tabs)/        Home, Shifts, Calendar, Workplaces ("Jobs"), Settings
app/               Modals/standalone routes: add-shift, add-workplace,
                   upload-shift, conflicts, theme-selector, custom-theme,
                   profile-setup, SplashScreen
components/ui/     Design-system primitives: AppText, AppButton, AppCard,
                   AppScreen, GlassCard, GlassHeader, LiquidBackground,
                   IconSymbol
components/shifts/ StatusPill, WorkplaceChoiceCard
components/common/ TopAppBar, SectionHeader, BottomTabBar — NOTE: some of
                   these are NOT actually used (bottom tab bar is
                   implemented inline in app/(tabs)/_layout.tsx instead;
                   BottomTabBar.tsx may be dead code — verify before editing)
theme/             tokens.ts (10 themes), types.ts (ThemeTokens contract),
                   design-system.ts (spacing/radius/shadow helpers +
                   resolveFontFamily), index.ts (barrel)
hooks/              use-app-theme.ts (the hook every screen uses for tokens)
store/             shift-store.ts (shifts/workplaces/conflicts/user,
                   AsyncStorage-persisted), theme-store.ts, config-store.ts
types/index.ts     Shift, Workplace, ShiftConflict, UserProfile, OCRResult,
                   CalendarImportSource
backend/           Separate Node backend, Gemini OCR routes — early WIP
```

## Status as of 2026-07-26

**Done:**
- Theme system: 10 built-in glassmorphism/liquid-glass themes already exist
  in `theme/tokens.ts` (liquidCobalt, midnightCobalt, auroraTeal,
  graphiteViolet, emberNight, oceanSignal, frostedDaylight, warmPaper,
  sageFocus, roseQuartz) with a full semantic `ThemeTokens` contract in
  `theme/types.ts`. Theme selection persists via `store/theme-store.ts`.
  This phase is essentially complete — don't rebuild it from scratch.
- Home tab (`app/(tabs)/index.tsx`): rebuilt to pixel-match the Stitch "Home
  Dashboard" mockup — sticky `GlassHeader`, week-day strip, hero
  upcoming/current-shift card, icon-only quick-action tiles (Add / Import /
  Jobs / Calendar — user explicitly chose to keep these over the mockup's
  literal "Swap"/"Leave" since those aren't real features yet), conflict
  banner, Today/List segmented timeline toggle. All backed by real
  `useShiftStore` data — this was already well-architected before the
  visual pass, only structure/styling changed.
- Font loading fixed: the design system always *declared*
  `fontFamily: "Manrope"/"Inter"` but no font file was ever loaded, so
  everything silently fell back to the OS system font. Fixed via
  `expo-font`'s `useFonts` in `app/_layout.tsx` (gates the splash screen)
  loading `@expo-google-fonts/inter` and `@expo-google-fonts/manrope`, plus
  `resolveFontFamily(family, weight)` in `theme/design-system.ts` used by
  `components/ui/app-text.tsx`. **User still needs to run**
  `npx expo install @expo-google-fonts/inter @expo-google-fonts/manrope`
  if they haven't already (they were mid-edit adjusting the import style in
  `app/_layout.tsx` when this was written — check that file's imports match
  whatever the installed package's actual export shape is before assuming
  it's broken).

**Known issues / tech debt (not yet fixed):**
- **Icon bug**: `components/ui/icon-symbol.tsx`'s `ICON_MAP` is missing
  several SF-Symbol-style names that other screens already pass it —
  confirmed via `tsc` errors for `"pencil"`, `"mappin"`, `"note.text"`,
  `"eye.fill"` in `app/(tabs)/workplaces.tsx`, `app/add-shift.tsx`,
  `app/add-workplace.tsx`, `app/custom-theme.tsx`. These silently render a
  fallback "help" icon on Android/web. Fix when touching those screens: add
  the missing entries to `ICON_MAP` (or better, use the same
  `MaterialCommunityIcons`-direct approach the rebuilt Home screen uses,
  which sidesteps this entirely).
- Several files carry large blocks of **commented-out previous versions**
  instead of clean history (rely on git for that) — seen in
  `theme/tokens.ts`, `theme/types.ts`, `hooks/use-app-theme.ts`,
  `store/theme-store.ts`, `components/ui/liquid-background.tsx`,
  `theme/design-system.ts`, `app/_layout.tsx`, and especially
  `app/(tabs)/index2.tsx` (three stacked old versions in one file, over
  1000 lines of dead code). Strip these when you're already editing that
  file for another reason — don't do a dedicated pass unless asked.
- `app/(tabs)/index2.tsx` looks like an orphaned duplicate/backup of the
  Home screen (untracked in git, not registered in `app/(tabs)/_layout.tsx`
  tabs). Don't delete without asking the user first — could be intentional.
- `theme/design-system.ts` exports a `textStyles` object that is fully
  unused (grep confirms zero imports) — dead code, safe to remove later.
- `calendar.tsx`, `upload-shift.tsx`, `components/common/TopAppBar.tsx`,
  `components/common/SectionHeader.tsx`, `components/common/BottomTabBar.tsx`
  hardcode their own `fontFamily`/`fontWeight` combos instead of using
  `AppText` variants — inconsistent with the shared design system. Worth
  migrating to `AppText` when those screens are actually worked on.
- `DESIGN.md` at repo root is a **stale** design doc from an earlier dark-mode-only
  "Orchestrator" token scheme (`surface_container_lowest`, `tertiary`, etc.)
  that predates the current 10-theme semantic system in `theme/tokens.ts` /
  `theme/types.ts`. Don't treat it as current spec — it hasn't been
  reconciled with what's actually implemented.

## Next steps (screen-by-screen order)

Shifts tab → Calendar tab → Workplaces ("Jobs") tab → Settings tab, each
converted from a Stitch HTML export the same way Home was. Then: Auth/Firebase,
real OCR pipeline wiring, Google Maps/transit integration. Wait for the user
to hand over each screen's HTML rather than building ahead of it.
