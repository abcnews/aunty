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
/some/parent/directory $ aunty new basic-story my-project
```

or

```bash
/some/parent/directory/my-project $ aunty init basic-story
```

### Developing projects

When working inside a project directory that has the aunty dependency installed, you'll automatically be running that local `aunty`:

```bash
/some/parent/directory/my-basic-story $ aunty <build|serve|...> [options]
```

This ensures that any changes to future versions of aunty won't impact your project, and you can manually update the local aunty when you're ready to accommodate those changes.

Most project-level commands depend on a configuration object that you can either export from a project-level `aunty.config.js` file:

```js
module.exports = {
  type: '<project_type>'
};
```

...or add to your `package.json` file as an `aunty` property:

```js
"aunty": {
  "type": "<project_type>"
}
```

Supported project types have their own default configuration for each command, but you can override it by extending your local configuration. Overrides should be used sparingly, as the advantages of using a single-dependency toolkit are most apparent when we don't deviate far from the project templates.

## Authors

- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))

## Thanks

This project takes a heap of inspiration from [nwb](https://github.com/insin/nwb), a React/Preact/Inferno toolkit by [Jonny Buchanan](https://twitter.com/jbscript). If you're looking to develop your own toolkit, Jonny's created a fantastic [guide](https://github.com/insin/ad-hoc-reckons) to get you started.
