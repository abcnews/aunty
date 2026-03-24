# Templates and Patches

This directory contains the project templates and "patches" used by the `aunty create` command.

The system is designed to use a "language" template as a base, and then apply zero or more "patches" to add specific features (like Odyssey support or TypeScript-to-JS conversion).

## Project Structure

Templates are organized by language or framework:

```text
templates/
  index.ts           - Entry point listing all supported languages
  [language]/
    index.ts         - Language entry point defining the base template, patches, and questions
    base/
      contents/      - The base project files
      init.ts        - The script that handles the initial setup
    patch-[name]/
      contents/      - Files to be copied over the base project
      init.ts        - The script that handles the patch setup (e.g., adding dependencies)
```

## How to Create a New Template

### 1. Create the directory structure

Create a new folder for your language, with a `base` folder inside.

```bash
mkdir -p templates/my-language/base/contents
```

### 2. Add your base files

Add your project boilerplate into `templates/my-language/base/contents/`. This should be a clean version of the project you want to create.

### 3. Create the `init.ts` script

Create `templates/my-language/base/init.ts`. This script will be called after the `contents` directory has been copied.

```typescript
import path from "node:path";
import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({ projectName = "", baseDir = "" }) {
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);

  // Use helpers to update package.json, replace strings, etc here.
}
```

### 4. Create the `index.ts` entry point

Create `templates/my-language/index.ts` to export your template and define any questions or patches.

```typescript
import { init as baseInit } from "./base/init.ts";
import { init as featureInit } from "./patch-feature/init.ts";

export default {
  name: "My Language",
  baseInit, // The main setup function for this template
  patches: [
    { name: "patch-feature", init: featureInit }
  ],
  questions: [
    {
      question: "Do you want to add this feature?",
      action: "patch-feature", // Must match a name in the patches array
    },
  ],
};
```

### 5. Register the language

Add your new language to `templates/index.ts`.

## How to Create a Patch

Patches are used to add optional features to a base template.

### 1. Create the patch directory

Create a new folder starting with `patch-` inside your language directory.

```bash
mkdir -p templates/my-language/patch-feature/contents
```

### 2. Add patch files

Any files in `patch-feature/contents/` will be copied over the base project. Use this for adding new files or overriding existing ones.

### 3. Create the patch `init.ts`

Create `templates/my-language/patch-feature/init.ts`.

```typescript
import path from "node:path";
import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({ baseDir = "" }) {
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);
}
```

### 4. Register the patch

Update `templates/my-language/index.ts` to include the patch and a question to trigger it.

```typescript
import { init as featureInit } from "./patch-feature/init.ts";

// ... in the index object:
  patches: [
    { name: "patch-feature", init: featureInit }
  ],
  questions: [
    {
      question: "Do you want to add this feature?",
      action: "patch-feature",
    },
  ],
```

## Available Init Helpers

The `src/commands/create/initHelpers.ts` file provides several utility functions for template initialization:

- **`copyContents(src, dest)`**: Recursively copies files and directories.
- **`updatePackageJson(dir, data)`**: Merges data into the `package.json` file.
- **`addDependency(dir, name, version, isDev)`**: Adds a specific dependency to `package.json`.
- **`replaceInFile(filePath, replacements)`**: Performs global string replacements in a file.
- **`getGitUser()`**: Fetches the global git `user.name` and `user.email`.
