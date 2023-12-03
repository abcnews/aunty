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
  deploy: [{…}],
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
  "deploy": [{…}],
  "babel": {…},
  "jest": {…},
  "webpack": {…},
  "webpackDevServer": {…}
}
```

Supported project `type`s (currently: `basic`, `preact`, `react` & `svelte`) have their own default build configuration, but you can override it by extending your project configuration.

The `build`, `serve` and `deploy` properties allow you to override the default settings for those respective commands. Their respective properties (and default values) are documented below.

Aunty uses some tools internally, which you can also provide custom configuration for. If you supply an object for the `babel`, `jest`, `webpack`, and/or `webpackDevServer` properties, that object will be merged into the default configuration. Optionally, you can supply a function (for any property), which will be passed the default configuration for you to manually modify and return.

If you're looking to see what the default configuration is for any command (and their internal tools), or the impact of your additions, you can always perform a dry run of the command by using the `--dry` (or `-d`) flag:

```bash
/some/parent/directory/my-project $ aunty serve --dry
```

Overrides should be used sparingly, as the advantages of using a single-dependency toolkit are most apparent when we don't deviate far from the defaults.

If you don't need to override any of the project defaults, your entire aunty configuration can be a string containing the project type, as a shorthand for `{type: "<project_type>"}`. `type` is the only required property in your aunty configuration.

#### `build` config properties

| property               | default          | description                                                                                                                                                                     |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entry`                | `"index"`        | The entry file for your project (extension should be unspecified). You can optionally supply an array for multiple entry points, which will result in multiple outputs.         |
| `from`                 | `"src"`          | The source directory that aunty will look for your entry file(s) in.                                                                                                            |
| `to`                   | `".aunty/build"` | The destination directory for your compiled and static assets.                                                                                                                  |
| `staticDir`            | `"public"`       | The directory you store static assets in. You can optionally supply an array of directories, which will be merged at build time.                                                |
| `addModernJS`          | `false`          | Setting this to true will enable a 2nd output file for each entry file named `{name}.modern.js`, which is skips browserlist-based feature polyfilling                           |
| `includedDependencies` | `[]`             | Any packages (defined by name string or name-matching `RegExp`s) you add to this array will be transpiled in the same manner as the project source.                             |
| `extractCSS`           | `false`          | Setting this to true will create a separate `{name}.css` output for each input, rather than bundling it with the JS (for dynamic `<style>` insertion).                          |
| `useCSSModules`        | `true`           | Setting this to false will turn off CSS module compilation. All styles written will be 'global', and importing CSS files will not give you an object of `className` references. |
| `showDeprecations`     | `false`          | Setting this to true will allow NodeJS to output stack traces of deprecation warnings.                                                                                          |

#### `serve` config properties

| property            | default       | description                                                                                                                                                                                                                                    |
| ------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hasBundleAnalysis` | `false`       | Setting this to true will spin up a second server on another port, allowing you to inspect your bundle. The address will be logged to the console when the dev server starts.                                                                  |
| `host`              | `"localhost"` | The hostname of your dev server. If you're on the ABC internal network, the default will change to your machine's hostname (`ws<number>.aus.aunty.abc.net.au`). The `AUNTY_HOST` environment variable, if present, will override this setting. |
| `hot`               | `true`        | Should the dev server enable hot reloading. If `NODE_ENV !== "development"`, the default will change to `false`.                                                                                                                               |
| `https`             | `true`        | Should the dev server use SSL (with a self-signed certificate matching the `host`). You can alternatively supply your own `{cert: string, key: string}` object if you've generated your certificate some other way.                            |
| `port`              | `8000`        | The port number of your dev server. If the port specified is unavailable, **aunty** will try incrementing the port number until it finds an available one. The `AUNTY_PORT` environment variable, if present, will override this setting.      |

#### `deploy` config properties

`deploy` should be an array of config objects, one for each deployment target (e.g. ContentFTP)

| property            | default                 | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from`              | build config `to` value | The directory to deploy files from (if you haven't overridden the build `to` value, it should be ".aunty/build")                                                                                                                                                                                                                                                                                                                                                                                        |
| `files`             | `"**"`                  | A glob matching the files under your `from` directory to deploy                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `profile`           | `"contentftp"`          | This should be the name of a key in your `~/.abc-credentials` file, which will be consulted to populate login credentials. If this is `"contentftp"` it will also populate the config's `to` and `resolvePublicPath` properties.                                                                                                                                                                                                                                                                        |
| `publicPath`        | `"/"`                   | If `resolvePublicPath` is defined, `publicPath` will be overwritten by the return value of that function.                                                                                                                                                                                                                                                                                                                                                                                               |
| `resolvePublicPath` | `undefined`             | A function which takes the initial config as an object, and returns an updated `publicPath`. If `profile="contentftp"`, this will be a function that knows how ContentFTP directories map onto ABC URLs.                                                                                                                                                                                                                                                                                                |
| `to`                | `undefined`             | The directory on your target to deploy files to. If `profile="contentftp"` , this will be a versioned directory where we deploy News projects to. If you set this to a string, the patterns `<name>` and `<id>` will be replaced by the project name, and the current deployment ID, respectively. During releases, `id` is the current version; during development, it's the current git branch name. You can also specify a custom deployment ID by using the `--id` flag when running `aunty build`. |

You _could_ also specify `type` (`"ftp"`/`"ssh"`), `host`, `port`, `username` & `password`, but these are best left inside your `.abc-credentials` file.

### Generators

Aunty comes with a few basic generators. Run `aunty generate --help` for the full list, or `aunty generate <generator> --help` for further details.

## Authors

- Colin Gourlay
- Simon Elvery ([elvery.simon@abc.net.au](mailto:elvery.simon@abc.net.au))
- Joshua Byrd ([byrd.joshua@abc.net.au](mailto:byrd.joshua@abc.net.au))
- Nathan Hoad

## Thanks

This project was originally inspired by [nwb](https://github.com/insin/nwb), a React/Preact/Inferno toolkit by [Jonny Buchanan](https://twitter.com/jbscript). If you're looking to develop your own toolkit, Jonny's created a fantastic [guide](https://github.com/insin/ad-hoc-reckons) to get you started.
