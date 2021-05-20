# @abcnews/aunty

A toolkit for working with ABC News projects

## Installation

To use the CLI to create new projects, install the latest aunty release globally:

```bash
npm install --global @abcnews/aunty
```

Projects based on aunty's project templates already have aunty listed as a local dependency, locked to the version used to create it.

## Usage

For usage instructions, run `aunty` with no arguments, or for details on specific commands, run:

```bash
aunty help <command>
```

The CLI contains four types of command, grouped by purpose:

- Creating new projects (`new`, `init`)
- Generating stuff (`generate`) like components
- Developing projects (`clean`, `build`, `serve`, `test`)
- Deploying (un)versioned projects (`deploy`, `release`)

### Starting projects

When creating new projects, you should be using the global **aunty**:

```bash
/some/parent/directory $ aunty new
```

or, from within a (preferably empty) directory:

```bash
/some/parent/directory/my-project $ aunty init
```

### Developing projects

When working inside a project directory that has the aunty dependency installed, you'll automatically be running that local `aunty`:

```bash
/some/parent/directory/my-project $ aunty <build|serve|...> [options]
```

This ensures that any changes to future versions of aunty won't impact your project, and you can manually update the local aunty when you're ready to accommodate those changes.

Project-level commands can use an optional configuration, which you can either export from a project-level `aunty.config.js` file:

```js
module.exports = {
  type: '<project_type>',
  // aunty command configuration
  build: {…},
  serve: {…},
  deploy: {…},
  // internal tools configuration
  babel: {…},
  jest: {…},
  webpack: {…},
  webpackDevServer: {…}
};
```

...or add to your `package.json` file as an `aunty` property:

```js
"aunty": {
  "type": "<project_type>",
  "build": {…},
  "serve": {…},
  "deploy": {…},
  "babel": {…},
  "jest": {…},
  "webpack": {…},
  "webpackDevServer": {…}
}
```

Supported project `type`s (currently: `basic`, `preact`, `react` & `svelte`) have their own default build configuration, but you can override it by extending your project configuration.

The `build`, `serve` and `deploy` properties allow you to override the default settings for those respective commands.

Aunty uses some tools internally, which you can also provide custom configuration for. If you supply an object for the `babel`, `jest`, `webpack`, and/or `webpackDevServer` properties, that object will be merged into the default configuration. Optionally, you can supply a function (for any property), which will be passed the default configuration for you to manually modify and return.

If you're looking to see what the default configuration is for any command (and their internal tools), or the impact of your additions, you can always perform a dry run of the command by using the `--dry` (or `-d`) flag:

```bash
/some/parent/directory/my-project $ aunty serve --dry
```

Overrides should be used sparingly, as the advantages of using a single-dependency toolkit are most apparent when we don't deviate far from the defaults.

If you don't need to override any of the project defaults, your entire aunty configuration can be a string containing the project type, as a shorthand for `{type: "<project_type>"}`. `type` is the only required property in your aunty configuration.

### Generators

Aunty comes with a few basic generators. Run `aunty generate --help` for the full list, or `aunty generate <generator> --help` for further details.

### Async/await

One way to add `async`/`await` and generators/`yield` to your project is with the [`regenerator-runtime`](https://www.npmjs.com/package/regenerator-runtime) package.

`npm install regenerator-runtime` and then:

```js
import 'regenerator-runtime/runtime';
```

Note: You may also need a `Promise` polyfill for IE11.

### Multiple entry points

By default Aunty looks for `index.js` in `src`. Enable multiple entry points by adding a `build::entry` config to `aunty.config.js`.

#### Replace 'index' with 'story'

```js
module.exports = {
  build: {
    entry: 'story' // will now also support `['story']`
  }
};
```

#### Replace 'index' with 'story', 'editor', 'graphic' & 'polyfills'

```js
module.exports = {
  build: {
    entry: ['story', 'editor', 'graphic', 'polyfills']
  }
};
```

#### Retain 'index'; add 'editor', 'graphic' & 'polyfills'

```js
module.exports = {
  build: {
    entry: ['index', 'editor', 'graphic', 'polyfills']
  }
};
```

## Authors

- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))
- Nathan Hoad ([hoad.nathan@abc.net.au](mailto:hoad.nathan@abc.net.au))
- Simon Elvery ([elvery.simon@abc.net.au](mailto:elvery.simon@abc.net.au))
- Joshua Byrd ([byrd.joshua@abc.net.au](mailto:byrd.joshua@abc.net.au))

## Thanks

This project was originally inspired by [nwb](https://github.com/insin/nwb), a React/Preact/Inferno toolkit by [Jonny Buchanan](https://twitter.com/jbscript). If you're looking to develop your own toolkit, Jonny's created a fantastic [guide](https://github.com/insin/ad-hoc-reckons) to get you started.
