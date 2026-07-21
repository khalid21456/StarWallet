# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

StarWallet is a React Native + Expo expense-tracker client living entirely under `mobile/` (there is no root `package.json` — always `cd mobile` before running commands). The package currently ships the **UI foundation only**: design system, navigation shell, blank/placeholder screens, and reusable primitives — no data layer, no API client, no business logic wired up yet.

An `api/` backend (Express 5 + Prisma + SQLite) existed earlier in this repo's history but has been removed; don't assume it's coming back unless you see it reappear on disk.

---

## Common commands

```bash
cd mobile
npm install
npm run start         # expo start — press i / a / w for iOS / Android / web
npm run ios           # expo start --ios
npm run android       # expo start --android
npm run web           # expo start --web
npm run lint          # expo lint (eslint-config-expo)
npm run reset-project    # wipes app/ back to template state — destructive

# Type-check (no tsc script defined; tsconfig has strict: true)
npx tsc --noEmit

# Align a dep with the Expo SDK after upgrade warnings
npx expo install <package-name>
```

There is no test runner configured. Avoid claiming tests exist or pass.

`expo-sqlite` is installed and registered as an Expo config plugin (`app.json`) but not yet used anywhere in `src/` — likely groundwork for local persistence, not a signal that it's wired up.

---

## Architecture

**Expo Router 6** drives navigation via the `app/` directory. Two ironclad rules follow from that:

1. **Every file under `app/` is a route candidate.** Putting a non-component module there makes Expo Router warn "missing default export." Underscore-prefixed folders (`_components/`) are *not* reliably ignored by Router 6 — non-route code must live outside `app/`.
2. **All non-route code lives under `src/`** (`theme/`, `hooks/`, `constants/`, `ui/`, `components/`, `screens/`). The TypeScript path alias `@/*` resolves to the project root, so imports look like `@/src/ui` and `@/src/hooks/use-theme`.

Routes in `app/(tabs)/` are deliberately one-line re-exports (`export { default } from '@/src/screens/HomeScreen'`). This keeps screens importable from anywhere and makes the routing layer replaceable later.

### Theme system

`src/theme/index.ts` exports `lightTheme` and `darkTheme` — both have an identical `Theme` shape (`colors`, `spacing`, `radius`, `shadows`, `typography`). Components consume them via `useTheme()` from `src/hooks/use-theme.ts`, which reads the OS color scheme and re-renders on change.

**Never hardcode colors, spacing, or radius in screens or components.** Always go through theme tokens. Adding a new color token requires updating `ColorTokens` in `src/theme/colors.ts` *and* both `lightColors`/`darkColors` — TypeScript enforces parity.

Tokens at a glance: spacing `{ xs:4, sm:8, md:12, lg:16, xl:24, 2xl:32, 3xl:48, 4xl:64 }`; radius `{ sm:8, md:12, lg:16, xl:24, 2xl:32, pill:999 }`; shadows `soft` / `medium` / `floating`; typography `display` / `heading` / `subheading` / `body` / `caption` / `label`.

### UI primitives (`src/ui/`)

`Screen`, `Card`, `IconBubble`, `Button`, `Text`, `Spacer`, `SectionHeader`. Two non-obvious behaviors:

- **`Screen` owns tab-bar clearance.** It adds `TAB_BAR_CLEARANCE` (120 px) of bottom padding to the inner ScrollView. If you change tab-bar height in `FloatingTabBar`, update this constant.
- **`Text` rejects raw colors by design.** It only accepts a `tone` token from `ColorTokens`. If you need a one-off color, put it on a wrapping `View`, not on the `Text`.

### Floating tab bar

`src/components/tab-bar/FloatingTabBar.tsx` is wired in via the `tabBar` prop on Expo Router's `<Tabs>` (in `app/(tabs)/_layout.tsx`). 5 slots: Home · Stats · [+] · Activity · Profile. The `add` route is special-cased: it's hoisted into the `CenterFAB` regardless of declaration order, so the route list in `_layout.tsx` stays alphabetical/declarative. If you add a new tab, also add an entry to `ROUTE_META` in `FloatingTabBar.tsx`.

### Root layout

`app/_layout.tsx` wraps the tree in `SafeAreaProvider` and bridges our `Theme` into `@react-navigation/native`'s `ThemeProvider` (so navigator surfaces match our pastel background — no white flash on transitions).

### Screens are placeholders

All screens in `src/screens/` are `export default function …Screen()` components that consume `Screen` + UI primitives only — none call APIs or own state yet (HomeScreen's balance/budget/activity, StatsScreen's chart cards, AddTransactionScreen's fields, ActivityScreen's rows, ProfileScreen's settings are all visual placeholders). Known deferred work: transactions data/list/forms, charts on StatsScreen (`react-native-chart-kit` is an unused dep), auth/API client/state store, custom font loading (`src/theme/typography.ts` currently uses system fonts), FAB gradient (falls back to flat `primary` color, needs `expo-linear-gradient`).

### Conventions

- Local image assets must be loaded with `require('../../assets/...')` — Metro's static-asset resolver only handles `require`, not URI strings. Remote images use a string `source`.
- Use `expo-image` (already a dep) over `react-native`'s `Image` for built-in caching/transitions.
- The leftover Expo template files (`mobile/components/themed-text.tsx`, `parallax-scroll-view.tsx`, etc.) are **unused** by the new screens but kept in place. Don't import them; delete only when explicitly cleaning up.
