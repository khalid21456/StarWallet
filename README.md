# StarWallet — Mobile

A modern, soft pastel **expense tracker** built with React Native + Expo. This package contains only the **UI foundation**: design system, navigation shell, blank screens, and reusable primitives. No business logic, no charts, no transaction wiring yet.

Visual reference: Copilot Money, Monzo, Revolut, Notion softness.

---

## Tech stack

| Concern    | Choice                                                |
| ---------- | ----------------------------------------------------- |
| Framework  | React Native 0.81 + Expo 54                           |
| Language   | TypeScript (strict)                                   |
| Routing    | **Expo Router 6** (file-based, `app/` directory)      |
| Styling    | Plain `StyleSheet` driven by typed theme tokens       |
| Icons      | `@expo/vector-icons` (Ionicons)                       |
| Animation  | `react-native-reanimated` (already a dependency)      |
| Safe area  | `react-native-safe-area-context`                      |

> NativeWind was intentionally **not** added. The token-based `useTheme()` API gives the same ergonomics with zero new dependencies and full TypeScript inference.

---

## Folder structure

Expo Router treats every file under `app/` as a route candidate, so non-route code lives in a sibling `src/` tree. Route files in `app/(tabs)/` are one-line re-exports of components in `src/screens/`.

```
mobile/
├── app/                          # Expo Router routes ONLY
│   ├── _layout.tsx               # Root Stack + SafeAreaProvider + theme bridge
│   └── (tabs)/
│       ├── _layout.tsx           # Tabs navigator (custom FloatingTabBar)
│       ├── index.tsx             # → HomeScreen
│       ├── stats.tsx             # → StatsScreen
│       ├── add.tsx               # → AddTransactionScreen
│       ├── activity.tsx          # → ActivityScreen
│       └── profile.tsx           # → ProfileScreen
│
└── src/                          # Application source (single source of truth)
    ├── theme/
    │   ├── colors.ts             # Light + dark semantic tokens
    │   ├── spacing.ts            # 4-pt scale (xs … 4xl)
    │   ├── radius.ts             # sm/md/lg/xl/2xl/pill
    │   ├── shadows.ts            # soft / medium / floating presets
    │   ├── typography.ts         # display/heading/subheading/body/caption/label
    │   └── index.ts              # Theme aggregator
    ├── hooks/
    │   └── use-theme.ts          # Reactive light/dark theme selector
    ├── constants/
    │   └── categories.ts         # Default category metadata (Coffee, Shopping…)
    ├── ui/                       # Presentational primitives (no I/O)
    │   ├── Screen.tsx            # SafeAreaView + ScrollView + title + tab-bar clearance
    │   ├── Card.tsx              # Rounded warm-white card (3 variants)
    │   ├── SectionHeader.tsx     # Subheading + optional CTA
    │   ├── IconBubble.tsx        # Pastel circular icon container (4 tones)
    │   ├── Button.tsx            # Primary / secondary / ghost
    │   ├── Text.tsx              # Variant + tone-driven typed text
    │   ├── Spacer.tsx            # Vertical/horizontal gap helper
    │   └── index.ts              # Barrel export
    ├── components/
    │   └── tab-bar/
    │       ├── FloatingTabBar.tsx  # Custom BottomTabBarProps renderer
    │       ├── TabBarItem.tsx      # Single tab cell with Reanimated lift
    │       └── CenterFAB.tsx       # Floating "+" button
    └── screens/                  # Page components (re-exported by route files)
        ├── HomeScreen.tsx
        ├── StatsScreen.tsx
        ├── AddTransactionScreen.tsx
        ├── ActivityScreen.tsx
        └── ProfileScreen.tsx
```

The TypeScript path alias `@/*` resolves to the project root, so:

```ts
import { Card, Screen } from '@/src/ui';
import { useTheme } from '@/src/hooks/use-theme';
```

> **Why not put `src/` inside `app/`?** Expo Router scans every `.ts`/`.tsx` file under `app/` as a possible route and warns "missing default export" on non-route modules. Underscore prefixes (`_components/`) are documented as private but did not silence the warnings in Expo Router 6 — keeping non-route code outside `app/` is the only clean option today.

---

## Design system

### Color tokens (`src/theme/colors.ts`)

Both `lightColors` and `darkColors` export the exact same shape, so consumers never branch on color scheme — they look up tokens by key.

| Token                                  | Light       | Purpose                              |
| -------------------------------------- | ----------- | ------------------------------------ |
| `primary`                              | `#5BA8FF`   | Sky blue brand color                 |
| `primarySoft`                          | `#A9D2FF`   | Secondary buttons, subtle accents    |
| `accent`                               | `#7ED6FF`   | Cyan highlights                      |
| `background`                           | `#F2F7FC`   | Page background (very light blue)    |
| `card`                                 | `#FFFFFF`   | Card surface (warm white)            |
| `textPrimary`                          | `#0E1B33`   | Headings, body                       |
| `textSecondary`                        | `#6A7A93`   | Muted blue-gray                      |
| `border`                               | `#E5ECF5`   | Hairline dividers                    |
| `success / warning / danger`           | …           | Semantic state                       |
| `peach / lavender / softBlue / mint`   | …           | Category pastels                     |

### Spacing — `{ xs:4, sm:8, md:12, lg:16, xl:24, 2xl:32, 3xl:48, 4xl:64 }`
### Radius  — `{ sm:8, md:12, lg:16, xl:24, 2xl:32, pill:999 }`
### Shadows — `soft`, `medium`, `floating` (iOS shadow props + Android elevation fallback)
### Typography — `display`, `heading`, `subheading`, `body`, `caption`, `label`

### Using the theme

```tsx
import { useTheme } from '@/src/hooks/use-theme';

function Example() {
  const theme = useTheme();
  return (
    <View style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.card }} />
  );
}
```

---

## Bottom tab navigation

`FloatingTabBar` is a custom `BottomTabBarProps` renderer wired into Expo Router via the `tabBar` prop in `app/(tabs)/_layout.tsx`.

Highlights:

- Absolute-positioned, floats ~24 px above the safe-area bottom edge
- 28 px corner radius, `card` surface, `shadows.floating`
- 5 slots: **Home · Stats · [ + ] · Activity · Profile**
- Center "+" is a 56 × 56 `CenterFAB` that breaks above the bar and routes to `/add`
- Active icons swap to filled Ionicon variants and lift via Reanimated (180 ms)
- Active tint = `colors.primary`, inactive = `colors.textSecondary`

The `add` route is special-cased in `FloatingTabBar`: it's hoisted into the FAB regardless of declaration order, so the route list in `_layout.tsx` stays declarative.

---

## Reusable UI primitives

| Component       | Props                                                                 | Notes                                |
| --------------- | --------------------------------------------------------------------- | ------------------------------------ |
| `Screen`        | `title`, `subtitle`, `scroll`, `contentPadding`                       | Safe area + scroll + tab clearance   |
| `Card`          | `variant: 'soft' \| 'flat' \| 'floating'`, `padding`                  | Rounded surface, defaults to `soft`  |
| `IconBubble`    | `tone: 'peach' \| 'lavender' \| 'softBlue' \| 'mint'`, `icon`         | 48 × 48 pastel circle                |
| `Button`        | `variant: 'primary' \| 'secondary' \| 'ghost'`, `size`, `loading`     | Pressable with built-in dim state    |
| `Text`          | `variant`, `tone`, `weight`                                           | Only typed tokens — never raw hex    |
| `SectionHeader` | `title`, `actionLabel`, `onAction`                                    | "Recent activity / View all" pattern |
| `Spacer`        | `size`, `horizontal`                                                  | Layout gap helper                    |

---

## Screens

All screens are `export default function …Screen()` components that consume `Screen` + UI primitives. None of them call APIs or own state — they're visual placeholders ready to receive feature code.

- **HomeScreen** — balance hero, budget card with progress bar, 4-tone category row, recent activity skeleton list
- **StatsScreen** — two stacked card placeholders sized for charts
- **AddTransactionScreen** — three card-styled fields + primary/ghost button pair
- **ActivityScreen** — section header + 6-row card list
- **ProfileScreen** — avatar bubble + two grouped settings cards

---

## What was done in this pass

1. **Theme system** — `src/theme/` with tokens for colors (light + dark), spacing, radius, shadows, typography, plus a `Theme` type aggregator.
2. **`useTheme()` hook** — `src/hooks/use-theme.ts`, reactive to OS color scheme.
3. **UI primitives** — `Screen`, `Card`, `IconBubble`, `Button`, `Text`, `Spacer`, `SectionHeader` (`src/ui/`).
4. **Floating tab bar** — `src/components/tab-bar/{FloatingTabBar,TabBarItem,CenterFAB}.tsx` with Reanimated active states.
5. **Five blank screens** — `src/screens/*Screen.tsx`, each importing only design-system primitives.
6. **Expo Router wiring** — `app/_layout.tsx` (SafeAreaProvider + nav-theme bridge + status bar), `app/(tabs)/_layout.tsx` (custom `tabBar` prop), and one-line route wrappers for each tab.
7. **Cleanup** — removed leftover `app/(tabs)/explore.tsx` and `app/modal.tsx` so only the five intended tabs render.

### Out of scope (deferred)

- Transactions feature (data, list rows, forms, validation)
- Charts on `StatsScreen` (`react-native-chart-kit` is already a dep, just unused)
- Auth, API client, Zustand stores
- Custom font loading via `expo-font` (currently uses system fonts; swap values in `src/theme/typography.ts` once chosen)
- Gradient on the FAB (needs `expo-linear-gradient`; falls back to flat `primary` for now)
- The leftover demo components in `mobile/components/` (`themed-text`, `parallax-scroll-view`, etc.) are untouched. They're unused by the new screens but kept to avoid breaking anything outside scope.

---

## Run it

```bash
cd mobile
npm install                                                # if you haven't
npx expo install @react-native-async-storage/async-storage # align with Expo SDK
npm run start                                              # press i / a / w
```

Type-check with:

```bash
npx tsc --noEmit
```

---

## Architecture decisions

- **Expo Router stays.** The project shipped with file-based routing; replacing it with raw React Navigation would force changes across `app.json`, `package.json#main`, and the tsconfig. Instead, `app/` files are 1-line re-exports that point at `src/screens/*`, so screens remain importable from anywhere and the routing layer is replaceable later.
- **Non-route code lives outside `app/`.** Expo Router 6 scans every file under `app/` and emits "missing default export" warnings for non-component modules. Keeping helpers/components/theme in a sibling `src/` tree is the only friction-free option.
- **Tokens > utility classes.** A typed `Theme` object gives autocomplete on every spacing / color reference and avoids the metro/babel/tailwind config surface NativeWind would introduce. Migrating to NativeWind later is mechanical (each token becomes a class).
- **Custom tab bar via `tabBar` prop.** Keeps routes declarative in `_layout.tsx` while letting us own the entire visual treatment, including the FAB and active animation.
- **`Screen` owns tab-bar clearance.** A single `TAB_BAR_CLEARANCE` constant means every screen automatically scrolls past the floating bar — no per-screen padding to maintain.
- **Both color schemes share a single token shape.** Components never branch; switching dark mode is "swap the object." Adding a new token is enforced by the `ColorTokens` type.
