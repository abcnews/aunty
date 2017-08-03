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

Before submitting a pull request, please check that your changes meet the code style enforced by `xo` by running:

```bash
npm test
```

To revert to your original global install, run:

```bash
npm unlink
```
