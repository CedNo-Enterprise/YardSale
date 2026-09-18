# YardSale

Buy and sell second-hand goods from people nearby.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org) (strict mode)
- [Tailwind CSS 4](https://tailwindcss.com)
- [ESLint](https://eslint.org) via `eslint-config-next`

## Getting started

Requires Node.js 20.19+ or 22.13+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Start the dev server with Turbopack         |
| `npm run build` | Build for production                        |
| `npm start`     | Serve the production build (after `build`)  |
| `npm run lint`  | Lint the project with ESLint                |
| `npm run typecheck` | Type-check with `tsc --noEmit`          |

## Project layout

```
src/
  app/
    layout.tsx    # root layout, fonts and metadata
    page.tsx      # home page (/)
    globals.css   # Tailwind entry point and theme tokens
public/           # static assets served at /
```

The `@/*` import alias maps to `src/*`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. `.env*` files are
gitignored; only `.env.example` is committed.
