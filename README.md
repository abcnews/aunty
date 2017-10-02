# aunty

A toolkit for working with ABC News projects

<img alt="The aunty logo" style="max-width:100%" src="https://rawgit.com/abcnews/aunty/master/assets/logo.svg">

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

The CLI contains three types of command, grouped by purpose:

* Creating new projects (`new`, `init`)
* Developing projects (`clean`, `build`, `serve`)
* Deploying (un)versioned projects (`deploy`, `release`)

### Starting projects

When creating new projects, you should be using the global **aunty**:

```bash
/some/parent/directory $ aunty new preact-app my-project
```

or

```bash
/some/parent/directory/my-project $ aunty init preact-app
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
  webpack: {…},
  babel: {…},
  devServer: {…},
  build: {…},
  deploy: {…}
};
```

...or add to your `package.json` file as an `aunty` property:

```js
"aunty": {
  "type": "<project_type>",
  "webpack": {…},
  "babel": {…},
  "devServer": {…},
  "build": {…}, 
  "deploy": {…}
}
```

Supported project `type`s have their own default build configuration, but you can override it by extending your local configuration. The `webpack` property's value will be merged with the project's default webpack configuration, including any babel options you specify on the `babel` property. When running the local development server, you can pass additional options on the `devServer` property. Optionally, you can supply a function for the `webpack`, `babel` and/or `devServer` properties, which will be passed the config opjects for you to manually modify and return.

If you're looking to see what the default configuration is, or the impact of your additions, you can always perform a dry run of the `build` and `serve` commands by using the `--dry` (or `-d`) flag:

```bash
/some/parent/directory/my-project $ aunty serve --dry
```

Overrides should be used sparingly, as the advantages of using a single-dependency toolkit are most apparent when we don't deviate far from the project templates.

If you don't need to override any of the project defaults, your entire aunty config can be a string containing the project type, as a shorthand for `{type: "<project_type>"}`.

## Authors

- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))
- Nathan Hoad ([hoad.nathan@abc.net.au](mailto:hoad.nathan@abc.net.au))
- Simon Elvery ([elvery.simon@abc.net.au](mailto:elvery.simon@abc.net.au))

## Thanks

This project takes a heap of inspiration from [nwb](https://github.com/insin/nwb), a React/Preact/Inferno toolkit by [Jonny Buchanan](https://twitter.com/jbscript). If you're looking to develop your own toolkit, Jonny's created a fantastic [guide](https://github.com/insin/ad-hoc-reckons) to get you started.
