// Ours
const {command} = require('../../cli');
const {PROJECT_TYPES} = require('../../projects/constants');
const {create} = require('../../projects');
const {throws} = require('../../utils/async');
const {getConfigValue} = require('../../utils/git');
const {OPTIONS, MESSAGES, PATTERNS} = require('./constants');

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
