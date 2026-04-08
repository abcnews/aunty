The [contents/](contents/) folder is the output of `npm create vite@latest` with
ABC modifications.

## Updating

To update this template you'll create a new Svelte project from scratch, then
copy over the changed bits, namely `package.json` and other dependencies.

1. In a separate folder, run `npm create vite@latest` and follow the prompts for a Svelte project
2. Copy the contents over the top of the contents folder
3. Use a diff tool like VSCode's Git integration to work out what to keep and what to discard.

The new vite config should not be committed. If the config needs to be modified
you can edit it in the current folder [./vite.config.ts](./vite.config.ts).
(FIXME: During aunty@next dev this file is stored in contents/, so this comment
is untrue/aspirational in the meantime.)
