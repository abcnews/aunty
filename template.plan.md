<!--ScriptorStartFragment-->

I propose we build the new version of Aunty is currently built on the following:

- [commander](https://www.npmjs.com/package/commander) - CLI arguments and inline help.
- [clack/prompts](https://www.npmjs.com/package/@clack/prompts) - Handsome TUI features including prompts and spinners, gives us a bit of a standard for implementing features.
- [zx](https://www.npmjs.com/package/zx) - makes running CLI stuff easy. This is useful for interfacing with git, network tools, etc. We may need to use this sparingly to maintain Windows support.

## Aunty implementation

We will have a folder for each "language", which contains a base template we copy over, plus a number of "patches" that perform other operations like copy in the Odyssey boilerplate.

When Aunty runs it will look in each language for a language.ts, then ask questions defined for the chosen language. E.g.:

Which project would you like to create:

- Svelte
- Preact

And the questions:

- Do you want to use this in an odyssey? (run patch-odyssey, see below)
- Do you want to use Typescript? (run patch-plain-js)
- Do you want to add a builder? (run patch-builder)

For patches we must make sure they run in the right order, and don't clobber each other. We face issues of combinatorial explosion if we're not tactful about what we implement.

## Proposed template structure

What I propose is for each language we support, we:

1. We create a base Typescript template.
2. We (optionally) create extra folders (for Odyssey/Scrollyteller changes etc) which we can copy over the top if the user selects that option.
3. Each template folder has an init.ts script to run arbitrary code when the template is set up.

This roughly follows the model of `sv` where you can run `sv create` but also `sv add storybook` etc. In our case we'd effectively be running `aunty create ` and `aunty add odyssey` etc.

A template folder might look like:

```PlainText
svelte/
  index.ts   - entrypoint gives Aunty the list of patches & questions to ask.
  base/
    contents/   - basically the template that we copy over. Contains all the
                  example components, config, eslint, other  files to create a
                  project.
    init.ts     - arbitrary code to run when creating a project. sets the name
                  and `aunty: {type:'svelte'}` in package.json, plus anything
                  else we might need
    vite.config.ts - vite config for this project type. Used internally by Aunty
                   for builds/serves in future, but falls back to
                   vite.config.* in the repo if it exists.
  patch-odyssey/
    contents/   - a folder of files to copy over the top of the base contents,
                  incl odyssey init & scrollyteller scaffold
    init.ts     - `npm i @abcnews/svelte-scrollyteller etc`
  patch-plain-js/
    contents/   - empty
    init.ts     - run `tsc` or equivalent over the repo to convert all the TS to JS.
                  If this works, we don't need to maintan separate JS templates.
  patch-builder/
    contents/builder/ - adds a basic builder that you can expand on
    init.ts     - run `npm i @abcnews/components-builder`
preact/
  index.ts
  base/
    contents/
  ...etc
```

### init.ts

We could potentially implement the whole scaffold process in init.ts.

E.g. when Aunty creates a template it imports the Svelte template and calls`init({destDir:'…'})`, where it performs everything, including the copy operations. Then it does the same for each patch.

The pros of this approach are:

- It's easier to follow, because all the operations are right there. No hidden magic.
- Complete control, so the script can implement the template in whatever way the dev wants. While we provide the suggestion for how to implement this, you could go off and implement it with something completely different like yeoman or wrap a tool like`vite create`.
- It's easier to test because we only have to run the `init()` and verify the output, there's no real dependencies on the Aunty CLI.

The cons are it's more code. But we could implement some helpers to make this more straightforward, like `patchPackageJson({name: 'myname'})` or `addDependencies(['@abcnews/svelte-scrollyteller'])`

## Svelte template implementation details

I'm thinking the `svelte/base/contents/` folder would be essentially the output of either `sv create` or the plain Vite-Svelte boilerplate. This way we can easily update it to new versions. I think we should add clear instructions (or a script) to update these to the latest version, because that was a sticking point in the past.

Sveltekit gives us "library" mode, which is nice for creating component libraries etc.But I'm not sure what else it gives us that we'd want over standard Vite.

I don't think we should support library mode in Aunty per se, but we should be able to compile a sveltekit library with `aunty serve/aunty build` because we use the vite configs in the repo itself.

## Plain JS/type stripping details

There are a few options to try:

- tsc - this may not be suitable, I don't think it does .svelte files
- <https://www.npmjs.com/package/detype>
- <https://www.npmjs.com/package/sucrase>
- or finally, a manual JS function to handle .svelte files

This is annoying, but way more doable than maintaining duplicate templates for each project type.

<!--ScriptorEndFragment-->
