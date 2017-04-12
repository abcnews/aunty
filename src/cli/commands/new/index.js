// Ours
const {PROJECT_TYPES} = require('../../../constants');
const {getConfigValue} = require('../../../git');
const {create} = require('../../../projects');
const {throws} = require('../../../utils/async');
const {command} = require('../');
const {OPTIONS, USAGE, MESSAGES, PATTERNS} = require('./constants');

const _new = command({
  name: 'new',
  options: OPTIONS,
  usage: USAGE
}, async function (argv) {
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
      projectName
    }
  }));
});

module.exports = {
  'new': _new
};
