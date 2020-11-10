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
  REMOTE_HEAD_BRANCH: /HEAD branch: ([\w-]+)/,
  DETACHED_HEAD: /\(HEAD detached at ([\w]+)\)/
};

const GIT_DEFAULT_INIT_DEFAULT_BRANCH = 'master';

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

const getConfigValue = (module.exports.getConfigValue = async key => (await git(`config --get ${key}`)).stdout);

const getRemotes = (module.exports.getRemotes = async () =>
  new Set((await git('remote')).stdout.split('\n').filter(x => x)));

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

module.exports.getDefaultBranch = async remote => {
  const remotes = await getRemotes();
  let localDefaultBranch;

  if (remotes.has(remote)) {
    // If we have a valid remote, find out which local branch is configured to pull from the remote default branch
    try {
      const remoteShowStdout = (await git(`remote show ${remote}`)).stdout;
      const remoteDefaultBranch = (remoteShowStdout.match(PATTERNS.REMOTE_HEAD_BRANCH) || [])[1];
      if (remoteDefaultBranch) {
        localDefaultBranch = (remoteShowStdout.match(
          new RegExp(`([\\w-]+)\\s+merges with remote ${remoteDefaultBranch}`)
        ) || [])[1];
      }
    } catch (err) {}
  }

  if (!localDefaultBranch) {
    // git v2.28 allows you to set `init.defaultBranch` in your global config.
    // Assume we used this for our local branch (before we set up a remote)
    try {
      localDefaultBranch = (await getConfigValue(`--global init.defaultBranch`)).trim();
    } catch (err) {}
  }

  // Return a determined local default branch or git's default branch name (master, for now)
  return localDefaultBranch || GIT_DEFAULT_INIT_DEFAULT_BRANCH;
};

module.exports.getSemverTags = async () => (await git('tag')).stdout.split('\n').filter(valid).sort(compare);

const hasTag = async tag => !(await pack(git(`show-ref --tags --verify refs/tags/${tag}`)))[0];

module.exports.getChangelog = async tag =>
  (await git(`log ${(await hasTag(tag)) ? `${tag}..HEAD ` : ''}--oneline --color`)).stdout
    .split('\n')
    .filter(x => x)
    .reverse();
