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

## Releasing new versions of `@abcnews/aunty`

Releases are managed by `release-it`. To release a new version of aunty from the default branch, run:

```
npm run release
```

By default this will do the following:

1. Bump the `patch` version in `package.json` and `package-lock.json`
2. Commit and tag that version.
3. Push the tag & commit to GitHub
4. Publish to npm

If you want to cut a minor or major release, run either of the following commands instead:

```
npm run release -- minor
npm run release -- major
```

If you're ever unsure about what will happen, you can perform a dry run (which logs to the console) by running:

```
npm run release -- --dry-run
```

View the [`release-it` docs](https://www.npmjs.com/package/release-it) for full usage examples, including pre-release and npm tag management.

## Style

This project's codebase should be managed with [eslint](https://github.com/eslint/eslint) and [prettier](https://github.com/prettier/prettier). You should configure your editor to take advantage of this to maintain the code style specifed in `.eslintrc` and `.prettierrc`. If your editor has a format-on-save option and a Prettier plugin, even better!
