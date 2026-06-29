# AGENTS.md

## Project Overview

Ezlet is a Bun-based monorepo with two active workspaces:

- `packages/ezlet`: the publishable React toast library
- `apps/site`: the Vite 8 website for docs, playground, and live validation

The library is the product. The website is a dogfood app that exercises the public API and documents it. The root `playground/` folder is obsolete and should not be used.

## Repository Structure

```txt
.
├─ apps/
│  └─ site/             # website, docs, router, live examples
├─ packages/
│  └─ ezlet/            # library source, tests, build config
├─ .github/workflows/   # publish and deploy pipelines
├─ .plans/              # implementation plans
└─ AGENTS.md
```

## Working Rules

- Use Bun for installs, tests, builds, and local scripts.
- Prefer the closest package root when working on a feature:
  - library changes: `packages/ezlet`
  - website/docs changes: `apps/site`
- Do not revive the old root playground.
- Keep changes scoped. Avoid unrelated refactors.
- Preserve the public API shape unless the task explicitly changes it.

## Setup

Install dependencies from the repo root:

```bash
bun install
```

If the lockfile changes because of dependency updates or workspace restructuring, regenerate it from the root and keep it committed.

## Development Commands

From the repo root:

```bash
bun run dev
bun run site:dev
bun run build
bun run site:build
bun run site:preview
bun run lint
bun run test
bun run typecheck
```

Command intent:

- `bun run dev`: starts the website
- `bun run site:dev`: same as above, explicit site entry
- `bun run build`: builds the library package
- `bun run site:build`: builds the website into `site-dist/`
- `bun run site:preview`: previews the built website locally
- `bun run lint`: runs Biome across the workspace
- `bun run test`: runs the library test suite
- `bun run typecheck`: runs TypeScript checks for library and site

Package-specific commands:

```bash
cd packages/ezlet && bun run build
cd packages/ezlet && bun test
cd packages/ezlet && bun run typecheck
cd apps/site && bun run dev
cd apps/site && bun run build
cd apps/site && bun run typecheck
```

## Testing Instructions

- Use Bun’s test runner for all library tests.
- Library tests live in `packages/ezlet/src/**/*.test.ts` and `packages/ezlet/src/**/*.test.tsx`.
- Test setup is preloaded through `packages/ezlet/bunfig.toml`.
- When changing stack behavior, timers, or toast state, add or update tests in the library package.
- After moving files or changing imports, rerun `bun run lint` and `bun run typecheck`.

Recommended validation order for feature work:

```bash
cd packages/ezlet && bun test
cd packages/ezlet && bun run build
cd apps/site && bun run typecheck
cd apps/site && bun run build
```

## Code Style

- Use TypeScript and ESM.
- Default to ASCII unless the file already uses Unicode for a reason.
- Keep imports organized. Biome will enforce formatting.
- Use small, local helpers instead of large abstractions unless the code clearly benefits.
- Prefer existing patterns in the repo over inventing new ones.
- Keep UI code dense and structured. Avoid decorative or marketing-style layouts.

## Library Conventions

- Public exports come from `packages/ezlet/src/index.ts`.
- The main API is `Toaster` and `toast`.
- Keep `ezlet/styles.css` export working.
- Preserve stable `data-*` hooks and CSS variables when changing the component.
- The library should not require Tailwind, but it must remain easy to customize with Tailwind.

## Website Conventions

- The website uses TanStack Router and View Transitions.
- Use `Link`/router navigation instead of ad hoc client-side state when changing pages.
- The website should showcase the real component in the first viewport.
- Docs pages should stay focused and product-like, not landing-page style.

## Build and Release

Library publish flow:

- release-triggered GitHub Actions workflow
- install with `bun install --frozen-lockfile`
- run lint, typecheck, tests, and build
- verify the release tag matches `packages/ezlet/package.json`
- run `npm pack --dry-run`
- publish with `npm publish --provenance --access public`

Website deploy flow:

- separate GitHub Actions workflow
- builds from `apps/site`
- deploys only the website, not the package

## CI Expectations

- `bun run lint` must pass
- `bun run test` must pass
- `bun run typecheck` must pass
- `bun run build` must pass for the library
- `bun run site:build` must pass for the website

## Troubleshooting

- If `bun run` behaves unexpectedly in the workspace, run the command from the package directory with `cd ... && bun run ...`.
- If TypeScript cannot find `bun` types, ensure you are in `packages/ezlet` and using that package’s `tsconfig.json`.
- If the website cannot resolve `ezlet`, check the Vite alias and the `paths` entry in `apps/site/tsconfig.json`.
- If `site-dist/` appears in status, it is a build artifact and should stay ignored.

## Notes for Agents

- Read `package.json`, `packages/ezlet/package.json`, `apps/site/package.json`, and `.github/workflows/*` before making structural changes.
- Update `.plans/` when implementation scope changes.
- Do not assume old root-level paths still exist.
