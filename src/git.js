// Ours
const {exec} = require('./processes');
const {unpack} = require('./utils/async');
const {EMPTY, NEWLINE} = require('./utils/strings');
const {identity} = require('./utils');

const PATTERNS = {
  ACTIVE_BRANCH: /\*\s+([^\n]+)\n/,
  DETACHED_HEAD: /\(HEAD detached at ([\w]+)\)/
};

async function isRepo() {
  const [err] = await exec('git rev-parse --git-dir');

  return !err;
}

async function getConfigValue(key) {
  const stdout = unpack(await exec(`git config --get ${key}`));

  return stdout.split(NEWLINE).filter(identity).join(EMPTY);
}

async function getRemotes() {
  const stdout = unpack(await exec('git remote'));

  return new Set(stdout.split(NEWLINE).filter(identity));
}

async function hasChanges() {
  return (await exec('git status -s'))[1].length > 0;
}

async function getCurrentLabel() {
  const stdout = unpack(await exec('git branch'));
  const [, branch] = stdout.match(PATTERNS.ACTIVE_BRANCH) || [null, 'uncommitted'];
  const [, detachedHeadCommit] = branch.match(PATTERNS.DETACHED_HEAD) || [];

  return detachedHeadCommit || branch;
}

async function getCurrentTags() {
  const stdout = unpack(await exec('git tag -l --points-at HEAD'));

  return new Set(stdout.split(NEWLINE).filter(identity));
}

async function hasTag(tag) {
  const [err] = await exec(`git show-ref --tags --verify "refs/tags/${tag}"`);

  return !err;
}

function createTag(tag) {
  return exec(`git tag -a ${tag} -m "Tagging version ${tag}"`);
}

function pushTag(remote, tag) {
  return exec(`git push ${remote} ${tag}`, null, true);
}

module.exports = {
  isRepo,
  getConfigValue,
  getRemotes,
  hasChanges,
  getCurrentLabel,
  getCurrentTags,
  hasTag,
  createTag,
  pushTag
};
