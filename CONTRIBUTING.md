## Contributing

To contribute to the development of **aunty**, clone the project:

```bash
git clone git@github.com:abcnews/aunty.git
```

...then, from the project directory, run:

```bash
npm run build
npm link
```

This will link the globally-available `aunty` command to your clone. While developing, run:

```bash
npm run watch
```

to compile changes to the `dist/` directory automatically.

To revert and uninstall the locally linked version, run:

```bash
npm uninstall -g @abcnews/aunty
```

To reinstall the latest published registry version:

```bash
npm install -g @abcnews/aunty
```

For ease of use, you can use the Aunty version directly with `node <path to aunty repo>/dist/bin/aunty.js -h`.

## Releasing new versions of `@abcnews/aunty`

Releases are managed by `np`. To release a new version of aunty from the default branch, run:

```bash
npm run release
```

This will run tests, prompt you to select the version increment, and then publish to npm, commit, tag, and push to GitHub.

For more information, see the [`np` documentation](https://github.com/sindresorhus/np).

## Style

This project's codebase should be managed with [eslint](https://github.com/eslint/eslint) and [prettier](https://github.com/prettier/prettier). You should configure your editor to take advantage of this to maintain the code style specifed in `.eslintrc` and `.prettierrc`. If your editor has a format-on-save option and a Prettier plugin, even better!
