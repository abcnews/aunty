![The aunty CLI logo](assets/logo.svg)

# aunty CLI

Common tasks for working with ABC News projects

## Usage

Install the package globally:

```bash
npm install -g abcnews/aunty-cli
```

For some commands, you'll need to add an `aunty` property to your `package.json` file (you'll extend this later):

```json
"aunty": {…}
```

Run tasks from the root of your project:

```bash
aunty {deploy|release|etc.}
```

For usage instructions, run `aunty` with no arguments, or for specific commands, run:

```bash
aunty help <command>
```

## Developing

To contribute to the development of **aunty**, clone the project:

```bash
git clone git@github.com:abcnews/aunty-cli.git
```

...then, from the project directory, run:

```bash
npm link
```

Now the globally-available `aunty` command runs from your clone.

To revert to your original global install, run:

```bash
npm unlink
```

## Authors

- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))
