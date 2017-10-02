// Native
const { join } = require('path');

// External
const copyTemplateDir = require('copy-template-dir');
const pify = require('pify');

// Ours
const { command } = require('../../cli');
const { PROJECT_TYPES } = require('../../projects/constants');
const { packs, throws } = require('../../utils/async');
const { createRepo, getConfigValue, isRepo } = require('../../utils/git');
const { dry, info, spin, warn } = require('../../utils/logging');
const { install } = require('../../utils/npm');
const { DEFAULT_TEMPLATE_VARS, OPTIONS, MESSAGES, PATTERNS } = require('./constants');

// Wrapped
const clone = packs(pify(copyTemplateDir));

const create = packs(async config => {
  const projectTypeConfig = require(`../../projects/${config.projectType}`);
  const commonTemplateDir = join(__dirname, `../../../templates/_common`);
  const projectTypeTemplateDir = join(__dirname, `../../../templates/${config.projectType}`);
  const targetDir = join(process.cwd(), config.directoryName);
  const templateVars = Object.assign({}, DEFAULT_TEMPLATE_VARS, config.templateVars);
  let spinner;

  if (config.isDry) {
    return dry({
      'Project directory': targetDir,
      'Project template variables': templateVars,
      'Project dependencies': projectTypeConfig.dependencies || []
    });
  }

  info(MESSAGES.creating(config.projectType, targetDir, templateVars));

  spinner = spin('Clone project template');
  await clone(commonTemplateDir, targetDir, templateVars);
  await clone(projectTypeTemplateDir, targetDir, templateVars);
  spinner.succeed();

  spinner = spin('Install dependencies');
  await install(['--only=dev', '--prefer-offline'], targetDir);
  await install(['--save'].concat(projectTypeConfig.dependencies), targetDir);
  spinner.succeed();

  if (await isRepo(targetDir)) {
    return warn('Git repo already exists');
  }

  spinner = spin('Create git repo');
  await createRepo(targetDir);
  spinner.succeed();
});

module.exports.new = command(
  {
    name: 'new',
    options: OPTIONS,
    usage: MESSAGES.usage
  },
  async argv => {
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

    throws(
      await create({
        projectType,
        directoryName,
        templateVars: {
          authorName,
          authorEmail,
          projectType,
          projectName
        },
        isDry: argv.dry
      })
    );
  }
);
