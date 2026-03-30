# Svelte JS Patch

This patch converts a TypeScript-based Svelte project into a plain JavaScript project.

## Changes Made

### Files and Directories
- Converts all `.ts` files to `.js` by stripping TypeScript types. Note: it's
  important that TS files have .ts extensions so the type-stripper can resolve 
  files to .js.
- Removes `lang="ts"` and strips types from `<script>` blocks in all `.svelte` files.
- Updates `index.html` to point to `.js` entry points instead of `.ts`.
- Deletes TypeScript configuration files:
  - `tsconfig.json`
  - `tsconfig.app.json`
  - `tsconfig.node.json`
  - `vite-env.d.ts`

### Dependencies
Removes the following from `package.json`:
- `typescript`
- `@tsconfig/svelte`
- `@types/node`
- `svelte-check`
- `tslib`

### Scripts
- Simplifies `dev` and `build` scripts to use plain `vite`.
- Removes the `check` (svelte-check) script.
