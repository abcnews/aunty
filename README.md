# aunty CLI

Common tasks for working internally with ABC News projects

## Usage

Install the package globally:

```bash
npm install -g abcnews/aunty-cli
```

Add an `aunty` property to your `package.json` file (you'll extend this later):

```json
"aunty": {...}
```

Run tasks from the root of your project:

```bash
aunty {deploy|release|etc.}
```

For usage instructions, run `aunty` with no arguments, or for specific commands, run:

```bash
aunty help <command>
```

## Authors

- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))
