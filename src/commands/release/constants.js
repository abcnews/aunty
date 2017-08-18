// Ours
const {cmd, hvy, opt, sec} = require('../../utils/color');

const FORCE_REMINDER = `Use the ${opt('--force')} option to ignore warnings or release without tagging.`;

module.exports.MESSAGES = {
  FORCE_REMINDER: `Use the ${opt('--force')} option to ignore warnings or release without tagging.`,
  NOT_REPO: `You can't tag a release or deploy using a tag name becase this project isn't a git repo.`,
  HAS_CHANGES: `You shouldn't release builds which may contain un-committed changes! ${FORCE_REMINDER}`,
  hasTag: (tag, isTagOnHead) =>
    `The tag ${hvy(tag)} already exists${isTagOnHead ? '' :
      ` and your current HEAD doesn't point to it`}! ${FORCE_REMINDER}`,
  createdTag: tag => `Created tag ${hvy(tag)}`,
  pushedTag: (tag, remote) => `Pushed tag ${hvy(tag)} to remote ${hvy(remote)}`,
  usage: name => `
Usage: ${cmd(`aunty ${name}`)} ${opt('[options]')} ${opt('[deploy_options]')}

${sec('Options')}

  ${opt('-f')}, ${opt('--force')}  Ignore warnings & skip tagging ${opt('[default: false]')}

${sec('Examples')}

  ${cmd('aunty release')}
    Run ${cmd('aunty build')}, tag a release with ${hvy('git')} (using ${hvy('package.json:version')}),
    then run ${cmd('aunty deploy')}, passing the tag as the ${opt('--id')} option.

  ${cmd(`aunty release ${opt('--force')}`)}
    Ignore warnings about the project's state, run ${cmd('aunty build')}, skip tagging,
    then run ${cmd('aunty deploy')}, passing ${hvy('package.json:version')} as the ${opt('--id')} option.
`
};
