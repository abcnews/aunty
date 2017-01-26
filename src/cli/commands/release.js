// Packages
const minimist = require('minimist');

// Ours
const {getConfig} = require('../../config');
const {createTag, getCurrentTags, getRemotes,
  hasChanges, hasTag, pushTag} = require('../../git');
const {getPackage} = require('../../package');
const {bad, cmd, hvy, opt, sec} = require('../../text');
const deploy = require('./deploy');

const OPTIONS = {
  boolean: [
    'skip-tagging',
    'force',
    'help'
  ],
  alias: {
    'skip-tagging': 's',
    force: 'f',
    help: 'h'
  }
};

const USAGE = `
Usage: ${cmd('aunty release')} ${opt('[options]')} ${opt('[deploy_options]')}

${sec('Options')}

${opt('-s')}, ${opt('--skip-tagging')}  Skip tag creation and using the existing tag ${opt('[default: false]')}
${opt('-f')}, ${opt('--force')}         Ignore all warnings and release anyway ${opt('[default: false]')}
${opt('-h')}, ${opt('--help')}          Display this help message and exit

${sec('Examples')}

${cmd('aunty release')}
  Tag a release with ${hvy('git')} (using ${hvy('package.json:version')}), then deploy it,
  passing the tag as the ${opt('--id')} option to ${cmd('aunty deploy')}

${cmd(`aunty release ${opt('--skip-tagging')}`)}
  Expect the version's tag to exist on the current ${hvy('git')} working copy,
  then deploy it, passing the tag as the ${opt('--id')} option to ${cmd('aunty deploy')}
`;

const ERRORS = {
  DIRTY: `You shouldn't release builds which may contain un-committed changes! Use the ${opt('--force')} option to release anyway.`,
  untagged: tag => `You can't skip tagging because the tag ${bad(tag)} doesn't exist!`,
  taggedElsewhere: tag => `You can't skip tagging because the tag ${bad(tag)} exists, but your current HEAD doesn't point to it!`,
  taggedHere: tag => `The tag ${bad(tag)} already exists! Try skipping tagging with the ${opt('--skip-tagging')} option.`
};

const formatList = (list, formatter) => list.map(item => formatter(item)).join(', ');

async function release(args, exit) {
  const argv = minimist(args, OPTIONS);

  if (argv.help) {
    console.log(USAGE);
    exit();
  }

  const isForced = argv.force;
  let version;
  let isDirty;
  let isCurrentVersionTagged;
  let isTagOnHead;

  try {
    version = getPackage('version');

    getConfig('deploy'); // Check that config exists for deployment

    isDirty = await hasChanges();

    if (isDirty && !isForced) {
      exit(ERRORS.DIRTY);
    }

    isCurrentVersionTagged = await hasTag(version);

    if (isCurrentVersionTagged) {
      isTagOnHead = (await getCurrentTags()).indexOf(version) > -1;
    }
  } catch (err) {
    exit(err.message);
  }

  if (argv['skip-tagging']) {
    if (!isCurrentVersionTagged) {
      exit(ERRORS.untagged(version));
    } else if (!isTagOnHead) {
      exit(ERRORS.taggedElsewhere(version));
    }
  } else {
    if (isCurrentVersionTagged) {
      exit(ERRORS.taggedHere(version));
    }

    try {
      await createTag(version);
      console.log(`Created tag ${hvy(version)}`);

      const remotes = await getRemotes();

      if (remotes.length > 0) {
        await Promise.all(remotes.map(remote => {
          return pushTag(remote, version);
        }));
        console.log(`Pushed tag ${hvy(version)} to remote(s) ${formatList(remotes, hvy)}`);
      }
    } catch (err) {
      exit(err.message);
    }
  }

  deploy(args.concat(['--id', version]), exit, true);
}

module.exports = release;
