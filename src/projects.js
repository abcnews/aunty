// Native
const {join, relative} = require('path');

// External
const copyTemplateDir = require('copy-template-dir');
const {recursive} = require('merge');
const pify = require('pify');
const pkgDir = require('pkg-dir');
const readPkg = require('read-pkg');

// Ours
const ourPkg = require('../package');
const {CONFIG_FILE_NAME} = require('./constants');
const {hvy, ok} = require('./string-styles');
const {packs, prequire, unpack} = require('./utils/async');
const {indented} = require('./utils/strings');
const {identity, log, pretty} = require('./utils');

// Wrapped
const clone = packs(pify(copyTemplateDir));
const getPkgDir = packs(pkgDir);
const getPkg = packs(readPkg);

// Cached
let root;
let pkg;

const [MAJOR, MINOR] = ourPkg.version.split('.');
const DEFAULT_TEMPLATE_VARS = {
  auntyVersion: [MAJOR, MINOR, 'x'].join('.'),
  authorName: 'ABC News',
  currentYear: (new Date()).getFullYear()
};

const MESSAGES = {
  NO_CONFIG: `This project has no ${hvy(CONFIG_FILE_NAME)} file or ${hvy('aunty')} property in its ${hvy('package.json')} file.`,
  NOT_PACKAGE: `This command can only be run inside a project with a ${hvy('package.json')} file.`,
  missingRequiredProp: property => `This project's ${hvy('aunty')} configuration has no ${hvy(property)} property.`,
  creating: (type, dir, vars) => indented(pretty`
Creating a ${hvy(type)} project in:

${hvy(dir)}

...using template variables:

${vars}
  `, 2),
  created: (dir, file) => `  ${ok('create')} ${relative(dir, file)}`
};

const create = packs(async function (config) {
  const templateDir = join(__dirname, `../templates/${config.projectType}`);
  const targetDir = join(process.cwd(), config.directoryName);
  const templateVars = {
    ...DEFAULT_TEMPLATE_VARS,
    ...config.templateVars
  };

  log(MESSAGES.creating(config.projectType, targetDir, templateVars));

  const files = unpack(await clone(templateDir, targetDir, templateVars));

  files.sort().forEach(file => log(MESSAGES.created(targetDir, file)));
});

const getConfig = packs(async function (requiredProps = []) {
  if (!root) {
    root = unpack(await getPkgDir());
  }

  if (root === null) {
    throw (MESSAGES.NOT_PACKAGE);
  }

  if (!pkg) {
    pkg = unpack(await getPkg(root));
  }

  let pkgConfig = pkg.aunty;

  let [err, configFileConfig] = await prequire(`${root}/${CONFIG_FILE_NAME}`);

  // The standalone config file is optional, but it may have syntax problems
  if (err && err.code !== 'MODULE_NOT_FOUND') {
    throw pretty(err);
  }

  if (typeof pkgConfig !== 'object' && typeof configFileConfig !== 'object') {
    throw MESSAGES.NO_CONFIG;
  }

  if (typeof pkgConfig !== 'object') {
    pkgConfig = {};
  }

  if (typeof configFileConfig !== 'object') {
    configFileConfig = {};
  }

  const config = {
    name: pkg.name,
    version: pkg.version,
    root: root,
    ...recursive(true, pkgConfig, configFileConfig)
  };

  requiredProps
  .filter(identity)
  .forEach(prop => {
    if (config[prop] == null) {
      throw MESSAGES.missingRequiredProp(prop);
    }
  });

  return config;
});

module.exports = {
  create,
  getConfig
};
