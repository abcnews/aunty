// Native
const { spawnSync } = require('child_process');

// External
const execa = require('execa');
const fetch = require('node-fetch');
const { compare, valid } = require('semver');

// Ours
const { pack } = require('./async');
const { spin } = require('./logging');
const { combine } = require('./structures');

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

  return spawnSync('git', args, combine(GIT_SYNC_DEFAULTS, options));
}

module.exports.isRepo = async () => !(await pack(git('rev-parse --git-dir')))[0];

module.exports.isRepoSync = () => !gitSync('rev-parse --git-dir').stderr;

module.exports.getConfigValue = async key => (await git(`config --get ${key}`)).stdout;

module.exports.getRemotes = async () => new Set((await git('remote')).stdout.split('\n').filter(x => x));

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

module.exports.createTag = tag => git(['tag', '-a', tag, '-m', `Tagging version ${tag}`]);

module.exports.pushTag = (remote, tag) => git(['push', remote, tag]);

module.exports.createRepo = async cwd => {
  await git('init', { cwd });
  await git('add .', { cwd });
  return git(['commit', '-m', 'Initial commit'], { cwd });
};

/**
 * Look up the current package.json version of a repo's default branch
 */
module.exports.getGithubVersion = async (repo, defaultBranch) => {
  const spinner = spin(`Fetching latest version of ${repo}`);
  const p = await fetch(`https://raw.githubusercontent.com/${repo}/${defaultBranch}/package.json`).then(r => r.json());

  spinner.stop();

  return p.version;
};

module.exports.getDefaultBranch = async () => {
  return 'master';
};

module.exports.getSemverTags = async () => (await git('tag')).stdout.split('\n').filter(valid).sort(compare);

const hasTag = async tag => !(await pack(git(`show-ref --tags --verify refs/tags/${tag}`)))[0];

module.exports.getChangelog = async tag =>
  (await git(`log ${(await hasTag(tag)) ? `${tag}..HEAD ` : ''}--oneline --color`)).stdout
    .split('\n')
    .filter(x => x)
    .reverse();
