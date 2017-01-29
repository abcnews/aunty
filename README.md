<img alt="The aunty CLI logo" style="max-width:100%" src="https://rawgit.com/abcnews/aunty-cli/master/assets/logo.svg">

# aunty CLI

Common tasks for working with ABC News projects

## Installation

Install the package globally:

```bash
npm install -g abcnews/aunty-cli
```

## Usage

Run tasks from the root of your project:

```bash
aunty <deploy|release|...> [options]
```

For usage instructions, run `aunty` with no arguments, or for details on specific commands, run:

```bash
aunty help <command>
```

Most commands depend on a configuration object that you can either export from a project-level `aunty.config.js(on)` file:

```js
module.exports = {
  deploy: {…}
};
```

...or you can add an `aunty` property to your `package.json` file:

```js
"aunty": {
  "deploy": {…}
}
```

## Developing

To contribute to the development of **aunty**, clone the project:

```bash
git clone git@github.com:abcnews/aunty-cli.git
```

...then, from the project directory, run:

```bash
npm link && npm start
```

This will link the globally-available `aunty` command to your clone, then start watching the `src` directory for changes (which will be passed through `babel` to generate the `lib` directory that the CLI executes within).

Before submitting a pull request, please check that your changes meet the code style enforced by `xo` by running:

```bash
npm test
```

To revert to your original global install, run:

```bash
npm unlink
```

## Authors

- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))
