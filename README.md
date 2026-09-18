# YardSale

Find the garage sales happening near you, and plan the order you will drive
them in. The front end for [GarageSaleAPI](../GarageSaleAPI); it holds no data
of its own.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org) (strict mode)
- [Tailwind CSS 4](https://tailwindcss.com)
- [ESLint](https://eslint.org) via `eslint-config-next`

## Getting started

Requires Node.js 20.9+ (`next` engine floor). Developed and tested on Node.js
24 LTS "Krypton" — the recommended version.

Start the API first — it serves every page on this site:

```bash
cd ../GarageSaleAPI
docker compose up -d
go run .            # listens on localhost:8080
go run ./cmd/seed   # optional: test users, sales and routes
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A request with no locale in
the path is redirected to one, so `/` lands on `/en` or `/fr`.

## Scripts

| Command             | Description                                |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the dev server with Turbopack        |
| `npm run build`     | Build for production                       |
| `npm start`         | Serve the production build (after `build`) |
| `npm run lint`      | Lint the project with ESLint               |
| `npm run typecheck` | Type-check with `tsc --noEmit`             |

## Languages

Every page lives under a locale segment — `/en/sales` and `/fr/sales` are the
same page in two languages, and the path segments themselves stay in English.
`src/proxy.ts` adds the segment to a request that arrives without one, choosing
the language someone picked here before, otherwise what their browser asks for.

Copy lives in `src/i18n/dictionaries/{en,fr}.json`. The `Dictionary` type is
derived from the English file, so a key missing from the French one is a type
error rather than a blank on the page. Server Components read the locale from
the route with [`next/root-params`](https://nextjs.org/docs/app/api-reference/functions/next-root-params)
rather than taking it as a prop; Server Actions cannot, so each form carries its
locale in a hidden field.

Dates, times, prices and coordinates are formatted with `Intl` in
`src/lib/format.ts`. Times are shown in the zone the sales happen in
(`NEXT_PUBLIC_TIME_ZONE`), not the reader's, so a listing reads the same for a
buyer checking from another province.

To add a language: add it to `locales` in `src/i18n/config.ts`, add its
dictionary file, and register it in `src/i18n/load.ts`.

## Pages

| Route                 | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `/[lang]`             | The pitch, plus the next few sales                                  |
| `/[lang]/sales`       | Browse and filter by status, date range and order; paged            |
| `/[lang]/sales/[id]`  | One sale, its address and items, and adding it to a route           |
| `/[lang]/sales/new`   | List a sale (needs a seller profile)                                |
| `/[lang]/routes`      | Your routes                                                         |
| `/[lang]/routes/new`  | Build a route from upcoming sales and a starting point              |
| `/[lang]/routes/[id]` | The stops in order: mark them off, add, remove, re-order            |
| `/[lang]/account`     | Your user, seller profile and buyer profile                         |
| `/[lang]/sign-in`     | Sign in                                                             |
| `/[lang]/register`    | Create an account, then sign in straight away                       |

## Talking to the API

`src/lib/api/` is the only place that knows the API exists. `client.ts` maps
status codes onto error kinds; `errors.ts` turns those into a sentence in the
reader's language, because the API's own messages are English and written for
developers.

Everything runs on the server. The token from `POST /login` is kept in an
httpOnly cookie (`src/lib/session.ts`) and never reaches the browser, and
mutations go through Server Actions in `src/lib/actions/`.

A route can only be changed by the account it belongs to. The API has no
endpoint that says who owns one, so ownership is worked out by looking for the
route in the caller's own list — someone else's route stays readable, without
the controls.

## Project layout

```
src/
  app/[lang]/       pages; the root layout sits under the locale segment
  components/       UI, split between Server Components and client islands
  i18n/             locales, dictionaries, and the loaders for each
  lib/
    api/            typed wrappers over GarageSaleAPI
    actions/        Server Actions for every mutation
    session.ts      the login token, in an httpOnly cookie
    format.ts       locale and time-zone aware formatting
  proxy.ts          adds the locale segment to a request without one
```

The `@/*` import alias maps to `src/*`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. `.env*` files are
gitignored; only `.env.example` is committed.
