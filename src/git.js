// Ours
const {exec} = require('./processes');
const {unpack} = require('./utils/async');
const {EMPTY, NEWLINE} = require('./utils/strings');
const {identity} = require('./utils/misc');

const PATTERNS = {
  ACTIVE_BRANCH: /\*\s+([^\n]+)\n/,
  DETACHED_HEAD: /\(HEAD detached at ([\w]+)\)/
};

module.exports.isRepo = async () =>
  !(await exec('git rev-parse --git-dir'))[0];

module.exports.getConfigValue = async key => {
  const stdout = unpack(await exec(`git config --get ${key}`));

  return stdout.split(NEWLINE).filter(identity).join(EMPTY);
};

module.exports.getRemotes = async () => {
  const stdout = unpack(await exec('git remote'));

  return new Set(stdout.split(NEWLINE).filter(identity));
};

module.exports.hasChanges = async () =>
  (await exec('git status -s'))[1].length > 0;

module.exports.getCurrentLabel = async () => {
  const stdout = unpack(await exec('git branch'));
  const [, branch] = stdout.match(PATTERNS.ACTIVE_BRANCH) || [null, 'uncommitted'];
  const [, detachedHeadCommit] = branch.match(PATTERNS.DETACHED_HEAD) || [];

  return detachedHeadCommit || branch;
};

module.exports.getCurrentTags = async () => {
  const stdout = unpack(await exec('git tag -l --points-at HEAD'));

  return new Set(stdout.split(NEWLINE).filter(identity));
};

module.exports.hasTag = async tag =>
  !(await exec(`git show-ref --tags --verify "refs/tags/${tag}"`))[0];

module.exports.createTag = async tag =>
  exec(`git tag -a ${tag} -m "Tagging version ${tag}"`);

module.exports.pushTag = async (remote, tag) =>
  exec(`git push ${remote} ${tag}`, null, true);
