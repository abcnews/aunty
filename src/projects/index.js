// Native
const {join, relative} = require('path');

// External
const copyTemplateDir = require('copy-template-dir');
const pify = require('pify');
const pkgDir = require('pkg-dir');
const readPkg = require('read-pkg');

// Ours
const ourPkg = require('../../package');
const {packs, prequire, unpack} = require('../utils/async');
const {hvy, ok} = require('../utils/color');
const {log} = require('../utils/console');
const {isRepo, createRepo, getCurrentLabel} = require('../utils/git');
const {pretty} = require('../utils/misc');
const {install} = require('../utils/npm');
const {CONFIG_FILE_NAME, DEFAULTS, KNOWN_TARGETS} = require('./constants');

// Wrapped
const clone = packs(pify(copyTemplateDir));
const getPkg = packs(readPkg);
const getPkgDir = packs(pkgDir);

// Cached
let root;
let pkg;
let config;

const [MAJOR, MINOR] = ourPkg.version.split('.');
const DEFAULT_TEMPLATE_VARS = {
  auntyVersion: [MAJOR, MINOR, 'x'].join('.'),
  authorName: 'ABC News',
  currentYear: (new Date()).getFullYear()
};

const MESSAGES = {
  NO_CONFIG: `This project has no ${hvy(CONFIG_FILE_NAME)} file or ${hvy('aunty')} property in its ${hvy('package.json')}.`,
  NOT_PACKAGE: `This command can only be run inside a project with a ${hvy('package.json')} file.`,
  creating: (type, dir, vars) => pretty`
Creating a ${hvy(type)} project in:

${hvy(dir)}

...using template variables:

${vars}
  `,
  created: (dir, file) => `  ${ok('create')} ${relative(dir, file)}`
};

module.exports.create = packs(async config => {
  const templateDir = join(__dirname, `../../templates/${config.projectType}`);
  const targetDir = join(process.cwd(), config.directoryName);
  const templateVars = Object.assign(
    {},
    DEFAULT_TEMPLATE_VARS,
    config.templateVars
  );

  log(MESSAGES.creating(config.projectType, targetDir, templateVars));

  const files = unpack(await clone(templateDir, targetDir, templateVars));

  files.sort().forEach(file => log(MESSAGES.created(targetDir, file)));

  log('Installing dependencies…');
  await install(['--only=dev'], targetDir);

  if (await isRepo(targetDir)) {
    return log('Git repo already exists');
  }

  log('Creating git repo…');
  await createRepo(targetDir);
});

module.exports.getConfig = packs(async argv => {
  if (!root) {
    root = unpack(await getPkgDir());
  }

  if (root === null) {
    throw (MESSAGES.NOT_PACKAGE);
  }

  if (!pkg) {
    pkg = unpack(await getPkg(root));
  }

  if (!config) {
    const pkgConfig = pkg.aunty;

    const [err, configFileConfig] = await prequire(`${root}/${CONFIG_FILE_NAME}`);

    // The standalone config file is optional, but it may have syntax problems
    if (err && err.code !== 'MODULE_NOT_FOUND') {
      throw pretty(err);
    }

    if (typeof pkgConfig !== 'object' && typeof configFileConfig !== 'object') {
      throw MESSAGES.NO_CONFIG;
    }

    const id = argv.id || (await isRepo() && await getCurrentLabel()) || 'default';

    config = Object.assign({
      name: pkg.name,
      version: pkg.version,
      root,
      id
    }, configFileConfig || pkgConfig);

    resolveDeployConfig(config);
  }

  return config;
});

function resolveDeployConfig(config) {
  config.deploy = config.deploy || DEFAULTS.deploy;

  Object.keys(config.deploy)
  .forEach(key => {
    const target = config.deploy[key];

    target.from = `${config.root}/${target.from}`;
    target.to = target.to.replace('<name>', config.name).replace('<id>', config.id);
    target.publicURL = KNOWN_TARGETS[key] ? target.to.replace(
      KNOWN_TARGETS[key].publicPathRewritePattern,
      `${KNOWN_TARGETS[key].publicURLRoot}$1/`
    ) : null;
  });
}
