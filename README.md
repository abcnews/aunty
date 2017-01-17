# aunty CLI

Common tasks for working internally with ABC News projects

## Usage

Install the package globally:

```bash
npm install -g abcnews/aunty-cli
```

Add an `aunty` property to your `package.json` file:

```json
"aunty": {...}
```

Run tasks in your terminal from the root of your project (you'll extend this later):

```bash
aunty {deploy|release|etc.}
```

For usage instructions, run `aunty` with no arguments, or for specific commands, run:

```bash
aunty help <command>
```

## Authors

- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))
