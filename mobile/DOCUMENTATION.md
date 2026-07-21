# StarWallet — Data Layer & Wiring

This document describes the local persistence layer added to the mobile app: the
SQLite schema, the TypeScript model classes, the services that own all data
access and business logic, and how the screens consume them.

Everything runs **on-device** through [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/)
(`~16.0.10`, already registered as a config plugin in `app.json`). No network, no
backend.

---

## 1. Layers at a glance

```
app/_layout.tsx ── seedDefaultData() on startup
        │
src/screens/*  ──►  src/services/*  ──►  src/db/db.ts  ──►  SQLite file
   (UI)              (CRUD + logic)      (connection)     StarWalletDB.db
        │                  │
   src/classes/*  ◄────────┘  (services return class instances)
```

- **`src/db/`** — the connection and schema.
- **`src/classes/`** — plain data classes (one per table row shape).
- **`src/services/`** — the only place SQL is written. Screens never touch `db`.
- **`src/utils/format.ts`** — currency (MAD)/date formatting helpers.
- **`src/utils/transactions.ts`** — resolves a transaction's display label/icon,
  accounting for income having no category.

---

## 2. Database connection — `src/db/db.ts`

```ts
export const db = SQLite.openDatabaseSync('StarWalletDB.db');
initDatabase(db);
```

`openDatabaseSync` returns the database **synchronously** (it is not a Promise),
so it is not awaited. Importing this module opens the connection and creates the
schema exactly once. A single shared connection is reused everywhere, which keeps
the `PRAGMA foreign_keys = ON` setting alive for the whole session.

> Fixed a bug in the original file: it did `await SQLite.openDatabaseSync(...)`
> (awaiting a non-Promise, which also turned the module into a top-level-await
> module) and never exported `db`.

## 3. Schema — `src/db/schema.ts`

`initDatabase(db)` runs the PRAGMAs and `CREATE TABLE IF NOT EXISTS` statements
(idempotent). It takes `db` as a **parameter** so `schema.ts` does not import
`db.ts` — that keeps the module graph acyclic.

| Table          | Columns                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `categories`   | `id`, `name`                                                            |
| `budgets`      | `id`, `categorie_id`→categories, `amount_limit`, `start_date`, `end_date`, `created_at` |
| `transactions` | `id`, `amount`, `type`, `categorie_id`→categories (nullable), `regle_id`→budgets, `created_at` |
| `balance`      | `id`, `balance` (single seeded row, id = 1)                             |

Design decisions forced by SQLite:

- **No `DATE` type** → dates are stored as **ISO-8601 TEXT** (`new Date().toISOString()`).
  ISO strings sort chronologically, so date-range queries use plain `<=`/`>=`.
- **No `ENUM`** → `transactions.type` is `TEXT` with `CHECK (type IN ('expense','income'))`.
- **`transaction` is a reserved keyword** → the table is named **`transactions`** (plural).
- **Foreign keys:** `ON DELETE CASCADE` from categories (deleting a category
  removes its budgets and transactions); `transactions.regle_id` uses
  `ON DELETE SET NULL` (deleting a budget just unlinks its transactions).

### `categorie_id` is nullable — income has no category

Income (salary) has no relationship to a category, so `transactions.categorie_id`
is **nullable**: expenses always set it, income transactions store `NULL`.

Because SQLite cannot `ALTER` a column's `NOT NULL` constraint in place,
`schema.ts` includes a one-off migration (`migrateTransactionsCategorieNullable`)
that detects the old constraint via `PRAGMA table_info(transactions)` and, only
if found, rebuilds the table (rename → create → copy rows → drop) to relax it.
Fresh installs never hit this path — the `CREATE TABLE` already declares the
column nullable.

### The `regle_id` relationship

`regle_id` is a **nullable foreign key to `budgets.id`**. Semantically: each
transaction in a category should respect a *regle* (rule) defined by a budget.
When a transaction is created, the service auto-resolves `regle_id` to the
**active budget** for that category at that moment (the budget whose date range
contains "now"). Pass an explicit value to override, or `null` to force no link.

## 4. Model classes — `src/classes/`

Plain classes with a full constructor (required because `strict` →
`strictPropertyInitialization` is on). Columns are snake_case in SQLite and
mapped to **camelCase** in the classes by each service.

| Class         | Fields                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| `Categorie`   | `id`, `name`                                                              |
| `Budget`      | `id`, `categorieId`, `amountLimit`, `startDate`, `endDate`, `createdAt`   |
| `Transaction` | `id`, `amount`, `type: TransactionType`, `categorieId: number \| null`, `regleId: number \| null`, `createdAt` |
| `Balance`     | `id`, `balance`                                                           |

`TransactionType = 'expense' | 'income'` is exported from `Transaction.ts`.
`src/classes/index.ts` re-exports all four classes and the type.

## 5. Services — `src/services/`

Named-export function modules using the **synchronous** SQLite API
(`runSync`, `getFirstSync`, `getAllSync`, `withTransactionSync`). Each service
defines a private row type + `mapRow` mapper. The dependency graph is acyclic:
`TransactionService → { BalanceService, BudgetService }`; the other two query the
DB directly.

`src/services/index.ts` exposes them as namespaces:

```ts
import { TransactionService, BalanceService } from '@/src/services';
```

### CategorieService
`createCategorie(name)` · `getCategorieById(id)` · `getAllCategories()` ·
`updateCategorie(id, name)` · `deleteCategorie(id)`

### BudgetService
`createBudget(categorieId, amountLimit, startDate, endDate)` · `getBudgetById` ·
`getAllBudgets` · `getBudgetsByCategorie` ·
`getActiveBudgetForCategorie(categorieId, atISO)` — the regle for a category at a
time · `getActiveBudgets(atISO)` — all currently-active budgets ·
`getBudgetSpending(budgetId)` — sum of its linked expense transactions ·
`updateBudget` · `deleteBudget`

### TransactionService
Every write is wrapped in `db.withTransactionSync` so the row change and the
balance update commit atomically.

- `createTransaction(amount, type, categorieId, regleId?)` — `categorieId` is
  `number | null` (`null` for income). Inserts, auto-resolves `regleId` when
  omitted (skipped entirely when `categorieId` is `null` — there is nothing to
  resolve), then adjusts the balance.
- `getTransactionById` · `getAllTransactions()` (newest first) ·
  `getTransactionsByCategorie` · `getTransactionsByBudget` ·
  `getTransactionsBetween(startISO, endISO)` (for month/week views).
- `updateTransaction(...)` — reverses the old signed amount and applies the new one.
- `deleteTransaction(id)` — reverses its signed amount.

### BalanceService (auto-maintained, single row id = 1)
- `getBalance()` — reads the stored total (re-seeds defensively if missing).
- `applyDelta(delta)` — `income` adds, `expense` subtracts. Called by every
  transaction write.
- `recalculateBalance()` — repair path: recomputes `SUM(income) − SUM(expense)`
  over all transactions and stores it. Use after cascade deletes or bulk imports.

**Balance rule:** signed amount = `type === 'income' ? +amount : −amount`.
Create applies it, delete reverses it, update applies the difference.

## 6. First-run seeding — `src/db/bootstrap.ts`

`seedDefaultData()` is called once at startup from `app/_layout.tsx`. It is
idempotent (each step no-ops once its table has rows):

1. **Categories** — seeds the four `DEFAULT_CATEGORIES` labels (Coffee, Shopping,
   Transport, Food) so the picker isn't empty.
2. **Budgets** — one current-month budget per category (default limit 300) so new
   transactions auto-link a `regle_id` and the Home budget card is meaningful.

To start from a clean slate, delete the app's data (or uninstall/reinstall the
dev build); the DB file `StarWalletDB.db` is recreated and re-seeded.

## 7. How the screens use the data

All screens reload with `useFocusEffect`, so adding a transaction and returning
updates every view immediately. DB categories only store a `name`; their pastel
tone + icon are resolved by `getCategoryVisual(name)` in
`src/constants/categories.ts` (falls back to a neutral tag icon).

For a `Transaction`, use `getTransactionLabel(t, categoryNames)` /
`getTransactionVisual(t, categoryNames)` from `src/utils/transactions.ts`
instead of looking up `categorieId` directly — they handle the `null` case for
income (label `"Income"`, a fixed `INCOME_VISUAL` tone/icon) so every screen
displays income consistently.

- **AddTransactionScreen** — amount input, expense/income toggle, category
  picker. Switching to **Income** clears any selected category and visually
  disables the picker (dimmed, non-interactive) since income has no category
  relationship; **Save** only requires a category for expenses, then calls
  `createTransaction` and navigates Home.
- **HomeScreen** — `getBalance()`, current-month budget progress
  (`getActiveBudgets` + `getBudgetSpending`), category shortcuts, and the four
  most recent transactions.
- **ActivityScreen** — the full history via `getAllTransactions()`.
- **StatsScreen** — this-month expense/income totals and a per-category
  breakdown with proportional bars (`getTransactionsBetween`), no chart library.
  Income transactions (no category) are excluded from the per-category
  breakdown but counted in the income total.

## 8. Currency

All money values are formatted in **MAD** (Moroccan Dirham) by
`formatCurrency`/`formatSignedAmount` in `src/utils/format.ts`, e.g.
`1,234.50 MAD` / `+50.00 MAD` / `-12.00 MAD`. There is no multi-currency
support — MAD is the only unit in the app.

## 9. Verification

- `npx tsc --noEmit` — passes clean.
- `npm run lint` — passes clean.
- Runtime (needs an emulator/device — the sync SQLite API requires the native
  runtime): launch with `npm run start`, add an expense, and confirm the balance
  drops by that amount and the row appears on Home, Activity and Stats. Add an
  income transaction and confirm the category picker is disabled/cleared and
  the transaction shows as "Income" everywhere.
