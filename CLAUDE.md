# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

StarWallet is a two-package monorepo with **no root `package.json`** — each package is independent and is built/run from its own directory.

| Path     | Purpose                                              | Status                                                           |
| -------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| `mobile/` | React Native + Expo client (the foundation is built) | Working; UI foundation done, no business logic yet               |
| `api/`    | Express 5 + Prisma + SQLite backend                  | **Skeleton only** — `server.ts` boots Express; the controller/route/service/middleware files all exist as 1-line stubs |

Always `cd` into the relevant package before running commands.

---

## Common commands

### `mobile/`

```bash
cd mobile
npm install
npm run start        # expo start — press i / a / w for iOS / Android / web
npm run ios          # expo start --ios
npm run android      # expo start --android
npm run web          # expo start --web
npm run lint         # expo lint (eslint-config-expo)
npm run reset-project   # wipes app/ back to template state — destructive

# Type-check (no tsc script defined)
npx tsc --noEmit

# Align a dep with the Expo SDK after upgrade warnings
npx expo install <package-name>
```

There is no test runner configured. Avoid claiming tests exist or pass.

### `api/`

```bash
cd api
npm install
npm run dev          # nodemon + ts-node, watches src/, runs src/server.ts
npm run build        # tsc — emits to ./dist (rootDir/outDir are commented out, so adjust before relying on `npm start`)
npm run start        # node dist/server.js  (only valid after `npm run build`)
```

Prisma:

```bash
cd api
npx prisma migrate dev --name <name>     # create + apply migration against the SQLite DB
npx prisma generate                       # regenerate client into src/generated/prisma
npx prisma studio                         # GUI at localhost:5555
```

`api/.env` is required (not committed) — `prisma.config.ts` reads `DATABASE_URL` from `process.env`. For SQLite, use `DATABASE_URL="file:./prisma/dev.db"`.

---

## Architecture — `mobile/`

**Expo Router 6** drives navigation via the `app/` directory. Two ironclad rules follow from that:

1. **Every file under `app/` is a route candidate.** Putting a non-component module there makes Expo Router warn "missing default export." Underscore-prefixed folders (`_components/`) are *not* reliably ignored by Router 6 — non-route code must live outside `app/`.
2. **All non-route code lives under `src/`** (`theme/`, `hooks/`, `constants/`, `ui/`, `components/`, `screens/`). The TypeScript path alias `@/*` resolves to the project root, so imports look like `@/src/ui` and `@/src/hooks/use-theme`.

Routes in `app/(tabs)/` are deliberately one-line re-exports (`export { default } from '@/src/screens/HomeScreen'`). This keeps screens importable from anywhere and makes the routing layer replaceable later.

### Theme system

`src/theme/index.ts` exports `lightTheme` and `darkTheme` — both have an identical `Theme` shape (`colors`, `spacing`, `radius`, `shadows`, `typography`). Components consume them via `useTheme()` from `src/hooks/use-theme.ts`, which reads the OS color scheme and re-renders on change.

**Never hardcode colors, spacing, or radius in screens or components.** Always go through theme tokens. Adding a new color token requires updating `ColorTokens` in `src/theme/colors.ts` *and* both `lightColors`/`darkColors` — TypeScript enforces parity.

### UI primitives (`src/ui/`)

`Screen`, `Card`, `IconBubble`, `Button`, `Text`, `Spacer`, `SectionHeader`. Two non-obvious behaviors:

- **`Screen` owns tab-bar clearance.** It adds `TAB_BAR_CLEARANCE` (120 px) of bottom padding to the inner ScrollView. If you change tab-bar height in `FloatingTabBar`, update this constant.
- **`Text` rejects raw colors by design.** It only accepts a `tone` token from `ColorTokens`. If you need a one-off color, put it on a wrapping `View`, not on the `Text`.

### Floating tab bar

`src/components/tab-bar/FloatingTabBar.tsx` is wired in via the `tabBar` prop on Expo Router's `<Tabs>` (in `app/(tabs)/_layout.tsx`). The `add` route is special-cased: it's hoisted into the `CenterFAB` regardless of declaration order, so the route list in `_layout.tsx` stays alphabetical/declarative. If you add a new tab, also add an entry to `ROUTE_META` in `FloatingTabBar.tsx`.

### Root layout

`app/_layout.tsx` wraps the tree in `SafeAreaProvider` and bridges our `Theme` into `@react-navigation/native`'s `ThemeProvider` (so navigator surfaces match our pastel background — no white flash on transitions).

### Conventions

- Local image assets must be loaded with `require('../../assets/...')` — Metro's static-asset resolver only handles `require`, not URI strings. Remote images use a string `source`.
- Use `expo-image` (already a dep) over `react-native`'s `Image` for built-in caching/transitions.
- The leftover Expo template files (`mobile/components/themed-text.tsx`, `parallax-scroll-view.tsx`, etc.) are **unused** by the new screens but kept in place. Don't import them; delete only when explicitly cleaning up.

---

## Architecture — `api/`

The intended shape is a classic Express layered design:

```
src/
  server.ts            # Express bootstrap (currently the only non-stub)
  routes/              # Express Routers — wire URL → controller
  controllers/         # Parse req → call service → format res
  services/            # Business logic + Prisma queries
  middlewares/         # Validation (zod), auth, error handling
  generated/prisma/    # Prisma client (committed; regenerated by `npx prisma generate`)
```

Currently every file under `routes/`, `controllers/`, `services/`, `middlewares/` is a 1-line stub. When implementing a feature, fill all four layers and register the router in `server.ts`.

**Prisma client is generated to `src/generated/prisma/`** (not `node_modules/@prisma/client`) — see `prisma/schema.prisma`'s `generator client { output = "../src/generated/prisma" }`. Import from that path, not from `@prisma/client`.

**Domain models** (`prisma/schema.prisma`):

- `Category` (id, name, color, icon) → has many `Expense`
- `Expense` (amount, description, date, categoryId, optional `receipt` as base64/path)
- `Budget` (amount per `categoryId` per month/year, with `categoryId` unique — meaning one budget per category total, not per month/year combo; tighten this if monthly budgets are needed)

### TypeScript strictness (`api/tsconfig.json`)

The API enables `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `verbatimModuleSyntax` — three flags that bite often:

- `arr[i]` is `T | undefined`. Always narrow before use.
- Optional properties are `T | undefined` literally; you can't pass `{ x: undefined }` where `{ x?: T }` is expected unless typed exactly.
- Type-only imports must use `import type { … }` syntax.

Do not silently weaken these flags to dodge errors — fix the call site.

---

## Cross-cutting

- The mobile and API packages are independent: there is no shared types package today. If/when one is added, prefer a `shared/` sibling and reference it via relative paths in each `tsconfig.json`.
- Today's date in committed Prisma migrations (`20260509144443_init`) is correct — the system clock is 2026.
