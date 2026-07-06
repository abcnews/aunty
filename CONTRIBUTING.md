## Contributing

To contribute to the development of **aunty**, clone the project:

```bash
git clone git@github.com:abcnews/aunty.git
```

...then, from the project directory, run:

```bash
npm link
```

This will link the globally-available `aunty` command to your clone.

To revert to your original global install, run:

```bash
npm unlink
```

For ease of use, you can use the Aunty version directly with `node <path to aunty repo> -h`.

## Releasing new versions of `@abcnews/aunty`

Releases are managed by `np`. To release a new version of aunty from the default branch, run:

```bash
npm run release
```

This will run tests, prompt you to select the version increment, and then publish to npm, commit, tag, and push to GitHub.

For more information, see the [`np` documentation](https://github.com/sindresorhus/np).

## Style

This project's codebase should be managed with [eslint](https://github.com/eslint/eslint) and [prettier](https://github.com/prettier/prettier). You should configure your editor to take advantage of this to maintain the code style specifed in `.eslintrc` and `.prettierrc`. If your editor has a format-on-save option and a Prettier plugin, even better!
