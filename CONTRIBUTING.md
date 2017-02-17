## Contributing

To contribute to the development of **aunty**, clone the project:

```bash
git clone git@github.com:abcnews/aunty.git
```

...then, from the project directory, run:

```bash
npm link && npm start
```

This will link the globally-available `aunty` command to your clone, then start watching the `src` directory for changes (which will be passed through `babel` to generate the `lib` directory that the CLI uses).

Before submitting a pull request, please check that your changes meet the code style enforced by `xo` by running:

```bash
npm test
```

To revert to your original global install, run:

```bash
npm unlink
```
