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

## Style

This project's codebase should be managed with [eslint](https://github.com/eslint/eslint) and [prettier](https://github.com/prettier/prettier). You should configure your editor to take advantage of this to maintain the code style specifed in `.eslintrc` and `.prettierrc`. If your editor has a format-on-save option and a Prettier plugin, even better!
