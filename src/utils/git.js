// Native
const { spawnSync } = require('child_process');

// External
const execa = require('execa');

// Ours
const { pack } = require('./async');
const { NEWLINE } = require('./strings');

const PATTERNS = {
  ACTIVE_BRANCH: /\*\s+([^\n]+)/,
  DETACHED_HEAD: /\(HEAD detached at ([\w]+)\)/
};

function git(args = [], options = {}) {
  args = typeof args === 'string' ? args.split(' ') : args;

  return execa('git', args, options);
}

const GIT_SYNC_DEFAULTS = {
  encoding: 'utf-8'
};

function gitSync(args = '', options = {}) {
  args = typeof args === 'string' ? args.split(' ') : args;

  return spawnSync('git', args, Object.assign({}, GIT_SYNC_DEFAULTS, options));
}

module.exports.isRepo = async () => !(await pack(git('rev-parse --git-dir')))[0];

module.exports.isRepoSync = () => !gitSync('rev-parse --git-dir').error;

module.exports.getConfigValue = async key => (await git(`config --get ${key}`)).stdout;

module.exports.getRemotes = async () => new Set((await git('remote')).stdout.split(NEWLINE).filter(x => x));

module.exports.hasChanges = async () => (await git('status -s')).stdout.length > 0;

const _parseLabel = stdout => {
  const [, branch] = stdout.match(PATTERNS.ACTIVE_BRANCH) || [null, 'uncommitted'];
  const [, detachedHeadCommit] = branch.match(PATTERNS.DETACHED_HEAD) || [];

  return detachedHeadCommit || branch;
};

module.exports.getCurrentLabel = async () => {
  return _parseLabel((await git('branch')).stdout);
};

module.exports.getCurrentLabelSync = () => {
  return _parseLabel(gitSync('branch').stdout);
};

module.exports.commitAll = message => git(['commit', '-a', '-m', `${message}`]);

module.exports.push = () => git('push');

module.exports.getCurrentTags = async () => new Set((await git('tag -l --points-at HEAD')).stdout.split(NEWLINE));

module.exports.hasTag = async tag => !(await pack(git(`show-ref --tags --verify refs/tags/${tag}`)))[0];

module.exports.createTag = tag => git(['tag', '-a', tag, '-m', `Tagging version ${tag}`]);

module.exports.pushTag = (remote, tag) => git(['push', remote, tag]);

module.exports.createRepo = async cwd => {
  await git('init', { cwd });
  await git('add .', { cwd });
  return git(['commit', '-m', 'Initial commit'], { cwd });
};
