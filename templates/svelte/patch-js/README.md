# Svelte JS Patch

This patch converts a TypeScript-based Svelte project into a plain JavaScript project.

## Changes Made

### Files and Directories
- Converts all `.ts` files to `.js` by stripping TypeScript types. Note: it's
  important that TS files have .ts extensions so the type-stripper can resolve 
  files to .js.
- Removes `lang="ts"` and strips types from `<script>` blocks in all `.svelte` files.
- Updates `index.html` to point to `.js` entry points instead of `.ts`.
- Retains TypeScript configuration files (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite-env.d.ts`) to enable JSDoc-based type safety in a plain JavaScript environment.

### Dependencies & Scripts
- Retains TypeScript-related dependencies (`typescript`, `svelte-check`, `tslib`, etc.) and the `check` script so that type checking remains available via CLI or IDE.
