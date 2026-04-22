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

### Critical Files to Preserve

When updating the template, pay special attention to these files which contain Aunty-specific integration logic:

- **`vite.config.ts`**: Essential for es5entry.js, certificates, and solving cross-origin script issues.
- **`src/index.ts`**: The entry point for your app.
- **`index.html`**: Contains the logic to load the bootstrapper, be careful not to clobber this.

### Patch Inheritance

This `base` template serves as the foundation for all `patch-*` templates (like `patch-odyssey`). Changes to the folder structure or core configuration here will propagate to all child templates. Always verify that a base update doesn't break the patching mechanism used in neighboring folders.
