`aunty create` uses a custom template system to create new projects. Templates have three main components:

1. a programmatic index that uses clack prompts to ask for desired configuration
2. a base template containing the dir to copy from + a programmatic script to perform the copy and any other tweaks
3. a series of "patches" containing programmatic scripts to copy over additional files or make changes to the base template.

The intention is to make this followable in logic, so you don't need any prior knowledge to make a new template. Hopefully this is helpful.

## Guide to making a new template

The following steps will guide you through creating a new template from scratch.

### 1. Scaffold your starting point

It's usually easier to start with a working scaffold than writing a project framework from scratch.

1. Generate your base project in a temporary folder using standard initialization tools (e.g., `npm create vite@latest`).
2. Test the generated project to ensure it works as expected before converting it into a template.

### 2. Create the Base Template

Now you need to bring those scaffolded files into the Aunty project.

1. Create the directory structure for your template's base contents: `templates/<your-template>/base/contents`.
2. Copy your scaffolded project files into this `contents/` directory.
3. **Rename `.gitignore` to `_gitignore`**.

**Note:** NPM drops `.gitignore` files by default during package publishing. If you don't rename it, the file won't be included when Aunty is installed. Aunty's initialization helper will automatically rename it back to `.gitignore` when a user creates a new project.

### 3. Create the Base Init Script

Next, you need a script to copy those base files to the user's destination directory.

1. Create `templates/<your-template>/base/init.ts`.
2. Export an `init(options: InitOptions)` function.
3. Use the built-in helper functions (from [`src/lib/initHelpers.ts`](./src/lib/initHelpers.ts)) to copy the contents and install Aunty as a dependency.

```typescript
import path from "node:path";
import { copyContents, installAunty } from "../../../src/lib/initHelpers.ts";
import type { InitOptions } from "../../../src/commands/create/types.ts";

export async function init(options: InitOptions) {
  // Copy the files from base/contents to the new project directory
  await copyContents(path.join(import.meta.dirname, "contents"), options.dir);

  // Ensure @abcnews/aunty is added to the devDependencies
  await installAunty(options.dir);
}
```

### 4. Create the Main Entry Point

The entry point handles the user flow, asking any required questions before calling the init script.

1. Create `templates/<your-template>/index.ts`.
2. Export a default `run(options: InitOptions)` function.
3. Use [`@clack/prompts`](https://github.com/natemoo-re/clack/tree/main/packages/prompts) to gather user preferences (e.g., confirm if they want TypeScript, or select a variant).
4. Invoke your base `init.ts` script.

```typescript
import { confirm, isCancel, cancel } from "@clack/prompts";
import type { InitOptions } from "../../src/commands/create/types.ts";
import { init as baseInit } from "./base/init.ts";
import { init as jsInit } from "./patch-js/init.ts";

export default async function run(options: InitOptions) {
  const useTypescript = await confirm({
    message: "Do you want to use TypeScript?",
    initialValue: true,
  });

  if (isCancel(useTypescript)) {
    cancel("Operation cancelled.");
    return 1;
  }

  // 1. Run the base setup first
  await baseInit(options);

  // 2. Apply patches conditionally based on user answers
  if (!useTypescript) {
    await jsInit(options);
  }

  return 0;
}
```

### 5. Create Patches (Optional)

If your template requires variants (e.g., an Odyssey version vs a standard version, or JS vs TS), you can create "patches".

1. Create a patch directory (e.g., `templates/<your-template>/patch-js/contents` and `templates/<your-template>/patch-js/init.ts`).
2. Patches are just smaller init scripts that layer extra files, string replacements, or `package.json` edits on top of the base template.
3. Invoke the patch's `init` function in your main `index.ts` conditionally, as demonstrated in the snippet in Step 4.

### 6. Test Locally

While developing your new template, you can test it locally by running the CLI from the root of the Aunty repository:

```bash
node . create
```

or, in another dir with

```bash
node ../aunty create
```

This will invoke your local version of Aunty, allowing you to test the prompt flow and verify the generated output in your chosen destination directory.
