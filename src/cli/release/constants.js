// Ours
const { cmd, hvy, ok, opt, sec } = require('../../utils/color');

const FORCE_REMINDER = `Use the ${opt('--force')} option to ignore warnings or release without tagging.`;
const VALID_BUMPS = (module.exports.VALID_BUMPS = new Set(['major', 'minor', 'patch']));

const OPTIONS = (module.exports.OPTIONS = {
  string: ['bump', 'git-remote'],
  default: {
    'git-remote': 'origin'
  }
});

module.exports.MESSAGES = {
  bumpQuestion: dry =>
    `${ok('?')} ${hvy(`What package version bump ${dry ? 'would this release have been' : 'is this release'}?`)}`,
  changes: (tag, tags, changelog) =>
    changelog.length
      ? `${tags.length ? `Here's what's changed since ${hvy(tag)}` : 'Here are the initial changes'}:

${changelog.join('\n')}
`
      : `${cmd('ℹ')} Nothing has changed since ${hvy(tag)}\n`,
  createCommit: (from, to) => `Bump version ${hvy(from)} → ${hvy(to)}`,
  createTag: tag => `Create tag ${hvy(tag)}`,
  forceReminder: FORCE_REMINDER,
  hasChanges: `You shouldn't release builds which may contain un-committed changes! ${FORCE_REMINDER}`,
  hasTag: (tag, isTagOnHead) =>
    `The tag ${hvy(tag)} already exists${
      isTagOnHead ? '' : ` and your current HEAD doesn't point to it`
    }! ${FORCE_REMINDER}`,
  invalidBump: bump =>
    `You supplied an invalid bump value ${hvy(bump)}. It can be: ${hvy(Array.from(VALID_BUMPS).join('|'))}`,
  notDefaultBranch: (label, defaultBranch) =>
    `You are trying to release from ${hvy(label)}. You should only release from ${hvy(defaultBranch)}`,
  notRepo: `You can't tag a release or deploy using a tag name becase this project isn't a git repo.`,
  pushCommit: remote => `Push version bump to remote ${hvy(remote)}`,
  pushTag: (tag, remote) => `Push tag ${hvy(tag)} to remote ${hvy(remote)}`,
  usage: name => `Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')}

${sec('Options')}

  ${opt(`--bump={${Array.from(VALID_BUMPS).join('|')}}`)}  Preselect the package version bump for this release ${opt(
    '[default: PROMPT]'
  )}
  ${opt('--git-remote')}                Git remote to push release tags to (if it exists) ${opt(
    `[default: "${OPTIONS.default['git-remote']}"]`
  )}
  ${opt('-d')}, ${opt('--dry')}                   Output the release version & git remote, then exit
  ${opt('-f')}, ${opt('--force')}                 Ignore warnings & don't bump version ${opt('[default: false]')}

${sec('Examples')}

  ${cmd('aunty release')}
    1. Ensure working directory is in a deployable state
    2. Prompt for version bump choice and determine release version
    3. Run \`${cmd('aunty build')} ${opt('--id=<version>')}\`
    4. Commit & tag new version, pushing to existing git remote
    5. Run \`${cmd('aunty deploy')}\`
    
  ${cmd(`aunty release ${opt('--bump=major')}`)}
    As above, skipping (2).

  ${cmd(`aunty release ${opt('--force')}`)}
    As above, skipping (1, 2 & 4).
`
};
