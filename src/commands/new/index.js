// Native
const {join} = require('path');

// External
const copyTemplateDir = require('copy-template-dir');
const pify = require('pify');

// Ours
const {command} = require('../../cli');
const {PROJECT_TYPES} = require('../../projects/constants');
const {packs, throws, unpack} = require('../../utils/async');
const {createRepo, getConfigValue, isRepo} = require('../../utils/git');
const {log} = require('../../utils/logging');
const {install} = require('../../utils/npm');
const {DEFAULT_TEMPLATE_VARS, OPTIONS, MESSAGES, PATTERNS} = require('./constants');

// Wrapped
const clone = packs(pify(copyTemplateDir));

const create = packs(async config => {
  const projectTypeConfig = require(`../../projects/${config.projectType}`);
  const commonTemplateDir = join(__dirname, `../../../templates/_common`);
  const projectTypeTemplateDir = join(__dirname, `../../../templates/${config.projectType}`);
  const targetDir = join(process.cwd(), config.directoryName);
  const templateVars = Object.assign({}, DEFAULT_TEMPLATE_VARS, config.templateVars);

  log(MESSAGES.creating(config.projectType, targetDir, templateVars));

  let files = unpack(await clone(commonTemplateDir, targetDir, templateVars));

  files = files.concat(unpack(await clone(projectTypeTemplateDir, targetDir, templateVars)));

  files.sort().forEach(file => log(MESSAGES.created(targetDir, file)));

  log('Installing dependencies…');
  await install(['--only=dev'], targetDir);
  await install(['--save'].concat(projectTypeConfig.dependencies), targetDir);

  if (await isRepo(targetDir)) {
    return log('Git repo already exists');
  }

  log('Creating git repo…');
  await createRepo(targetDir);
});

module.exports.new = command({
  name: 'new',
  options: OPTIONS,
  usage: MESSAGES.usage
}, async argv => {
  if (argv._.length < 2) {
    throw MESSAGES.NOT_ENOUGH_ARGUMENTS;
  }

  const projectType = argv._[0];
  const directoryName = String(argv._[1]);
  let projectName = argv.name || directoryName;

  if (Array.isArray(projectName)) {
    projectName = projectName.reverse()[0];
  }

  if (!PROJECT_TYPES.has(projectType)) {
    throw MESSAGES.UNKNOWN_PROJECT_TYPE;
  }

  if (!PATTERNS.SLUG.test(projectName)) {
    throw MESSAGES.invalidProjectName(projectName);
  }

  const authorName = await getConfigValue('user.name');
  const authorEmail = await getConfigValue('user.email');

  throws(await create({
    projectType,
    directoryName,
    templateVars: {
      authorName,
      authorEmail,
      projectType,
      projectName
    }
  }));
});
