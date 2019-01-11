// Ours
const { cmd, hvy, opt, req, sec } = require('../../utils/color');
const { combine, setOfValues } = require('../../utils/structures');

module.exports.OPTIONS = {
  boolean: ['announce'],
  alias: {
    announce: 'a'
  }
};

const GENERATOR_ALIASES = (module.exports.GENERATOR_ALIASES = {
  a: 'articles',
  c: 'component',
  f: 'fragment',
  p: 'project',
  t: 'thumbnail',
  v: 'volume'
});

module.exports.GENERATORS = setOfValues(GENERATOR_ALIASES);

module.exports.MESSAGES = {
  generatorDoesNotExist: name => `The generator '${name}' does not exist.`,
  noDryRuns: `Generators don't have dry runs (yet). Please run without the ${opt('--dry')} flag.`,
  usage: `Usage: ${cmd('aunty generate')} ${req('<generator>')} ${opt('[options]')} -- ${opt('[generator_options]')}

${sec('Options')}

  ${opt('-h')}, ${opt('--help')}  Output the available generators, and exit.

${sec('Generators')}

  ${hvy('Project creation')}

  ${req('project')}     Create a new project (aliased by ${cmd('aunty new')} and ${cmd('aunty init')}).

  ${hvy('Project additions')}

  ${req('articles')}    Add mock desktop & mobile article pages to ${req('public/')} for local development.
  ${req('component')}   Add a component (and tests) to ${req('src/components/')} for your project type.
  ${req('thumbnail')}   Add an interactive homepage thumbnail to ${req('public/')} (uses fragment content)}).

  ${hvy('Core Media content')}

  ${req('fragment')}    Output the HTMLFragment init-interactive markup for your latest release.
  ${req('volume')}      Output the uberlist volume setting for your project's interactive homepage thumbnail.

  Run ${cmd('aunty generate')} ${req('<generator>')} ${opt('--help')} for details of each generator's options/arguments.
`
};
