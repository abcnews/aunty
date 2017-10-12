// Ours
const { cmd, hvy, opt, sec } = require('../../utils/color');

const FORCE_REMINDER = `Use the ${opt('--force')} option to ignore warnings or release without tagging.`;
const VALID_BUMPS = (module.exports.VALID_BUMPS = new Set(['major', 'minor', 'patch']));

module.exports.OPTIONS = {
  string: ['bump', 'git-remote'],
  default: {
    'git-remote': 'origin'
  }
};

module.exports.MESSAGES = {
  FORCE_REMINDER: `Use the ${opt('--force')} option to ignore warnings or release without tagging.`,
  NOT_REPO: `You can't tag a release or deploy using a tag name becase this project isn't a git repo.`,
  HAS_CHANGES: `You shouldn't release builds which may contain un-committed changes! ${FORCE_REMINDER}`,
  invalidHead: label => `You are trying to release from ${hvy(label)}. You should only release from ${hvy('master')}`,
  invalidBump: bump =>
    `You supplied an invalid bump value ${hvy(bump)}. It can be: ${hvy(Array.from(VALID_BUMPS).join('|'))}`,
  createBump: (bump, from, to) => `Bump ${hvy(bump)} version ${hvy(from)}=>${hvy(to)}`,
  pushBump: remote => `Push bump to remote ${hvy(remote)}`,
  hasTag: (tag, isTagOnHead) =>
    `The tag ${hvy(tag)} already exists${isTagOnHead
      ? ''
      : ` and your current HEAD doesn't point to it`}! ${FORCE_REMINDER}`,
  createTag: tag => `Create tag ${hvy(tag)}`,
  pushTag: (tag, remote) => `Push tag ${hvy(tag)} to remote ${hvy(remote)}`,
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt('[options] [build_options] [deploy_options]')}

${sec('Options')}

  ${opt('-d')}, ${opt('--dry')}                   Output the release version, then exit
  ${opt('-f')}, ${opt('--force')}                 Ignore warnings & skip tagging ${opt('[default: false]')}
  ${opt(`--bump={${Array.from(VALID_BUMPS).join('|')}}`)}  Bump the package version as part of the release ${opt(
    '[default: null]'
  )}
  ${opt('--git-remote')}                Git remote to push release tags to (if it exists) ${opt('[default: "origin"]')}

${sec('Examples')}

  ${cmd('aunty release')}
    For each deployment target specified in the project's config:
      1. Check for uncommitted local changes (exiting if any exist)
      2. Run \`${cmd('aunty build')} ${opt('--target=<target_name> --id=<package.json:version>')}\`
      3. Tag a release with ${hvy('git')} (using ${hvy('package.json:version')}), pushing it to any remotes
      4. Run \`${cmd('aunty deploy')} ${opt('--target=<target_name> --id=<package.json:version>')}\`

  ${cmd('aunty release --bump=major')}
    For each deployment target specified in the project's config:
      1. Check for uncommitted local changes (exiting if any exist)
      2. Bump the major version in ${hvy('package.json')} & commit, pushing it to any remotes
      3. Run \`${cmd('aunty build')} ${opt('--target=<target_name> --id=<package.json:version>')}\`
      4. Tag a release with ${hvy('git')} (using ${hvy('package.json:version')}), pushing it to any remotes
      5. Run \`${cmd('aunty deploy')} ${opt('--target=<target_name> --id=<package.json:version>')}\`


  ${cmd(`aunty release ${opt('--force')}`)}
    For each deployment target specified in the project's config:
      1. Run \`${cmd('aunty build')} ${opt('--target=<target_name> --id=<package.json:version>')}\`
      2. Run \`${cmd('aunty deploy')} ${opt('--target=<target_name> --id=<package.json:version>')}\`
`
};
