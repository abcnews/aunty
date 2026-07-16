# __PROJECT_NAME__

A project generated from [aunty](https://github.com/abcnews/aunty)'s `__PROJECT_TYPE__` project template.

## Developing

Create a dev server: `npm run dev`.

## Publishing (during Aunty Next development)

During Aunty next development, we don't have an `aunty release` command so you need to run Aunty Next from the development branch. E.g. `{aunty app source}` should be the `git+github://` url of the Aunty Next branch to ensure you have the latest code.

- `npm run build`
- `npx {aunty app source} release-check`
- `npm version patch` or equivalent
- `npx {aunty app source} release`
